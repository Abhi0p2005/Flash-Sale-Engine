package com.flashengine.flashEngine.service;

import com.flashengine.flashEngine.model.InventoryTransactionLog;
import com.flashengine.flashEngine.model.Product;
import com.flashengine.flashEngine.repository.InventoryTransactionLogRepository;
import com.flashengine.flashEngine.repository.ProductRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private static final String STOCK_KEY_PREFIX = "stock:product:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final StringRedisTemplate redisTemplate;
    private final ProductRepository productRepository;
    private final InventoryTransactionLogRepository txLogRepository;

    public InventoryService(StringRedisTemplate redisTemplate,
                            ProductRepository productRepository,
                            InventoryTransactionLogRepository txLogRepository) {
        this.redisTemplate = redisTemplate;
        this.productRepository = productRepository;
        this.txLogRepository = txLogRepository;
    }

    public Integer getStock(Long productId) {
        String key = STOCK_KEY_PREFIX + productId;
        String cached = redisTemplate.opsForValue().get(key);

        if (cached != null) {
            System.out.println("[INVENTORY] CACHE HIT — product=" + productId + " stock=" + cached);
            return Integer.parseInt(cached);
        }

        System.out.println("[INVENTORY] CACHE MISS — product=" + productId + " loading from DB");
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        Integer stock = product.getStockLeft() != null ? product.getStockLeft() : 0;
        redisTemplate.opsForValue().set(key, String.valueOf(stock), CACHE_TTL);
        System.out.println("[INVENTORY] CACHE SET — product=" + productId + " stock=" + stock + " ttl=" + CACHE_TTL);
        return stock;
    }

    public Map<Long, Integer> getStockBatch(List<Long> productIds) {
        List<String> keys = productIds.stream()
                .map(id -> STOCK_KEY_PREFIX + id)
                .collect(Collectors.toList());

        List<String> cached = redisTemplate.opsForValue().multiGet(keys);

        Map<Long, Integer> result = new HashMap<>();
        List<Long> missIds = new ArrayList<>();

        for (int i = 0; i < productIds.size(); i++) {
            Long pid = productIds.get(i);
            String val = cached != null && i < cached.size() ? cached.get(i) : null;
            if (val != null) {
                result.put(pid, Integer.parseInt(val));
            } else {
                missIds.add(pid);
            }
        }

        if (!missIds.isEmpty()) {
            System.out.println("[INVENTORY] BATCH CACHE MISS — " + missIds.size() + " products loading from DB");
            List<Product> fromDb = productRepository.findAllById(missIds);
            for (Product p : fromDb) {
                Integer stock = p.getStockLeft() != null ? p.getStockLeft() : 0;
                result.put(p.getId(), stock);
                redisTemplate.opsForValue().set(STOCK_KEY_PREFIX + p.getId(), String.valueOf(stock), CACHE_TTL);
            }
        }

        return result;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Map<String, Object> decrementStock(Long productId, int quantity, String referenceId) {
        Product product = productRepository.findByIdWithPessimisticLock(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        int currentStock = product.getStockLeft() != null ? product.getStockLeft() : 0;

        if (currentStock < quantity) {
            System.out.println("[INVENTORY] DECLINE — product=" + productId
                    + " requested=" + quantity + " available=" + currentStock);
            return Map.of(
                    "success", false,
                    "message", "Insufficient stock. Available: " + currentStock + ", Requested: " + quantity,
                    "stockLeft", currentStock
            );
        }

        int newStock = currentStock - quantity;
        product.setStockLeft(newStock);
        productRepository.save(product);

        InventoryTransactionLog logEntry = new InventoryTransactionLog(
                productId, "DECREMENT", quantity, newStock, referenceId
        );
        txLogRepository.save(logEntry);

        String key = STOCK_KEY_PREFIX + productId;
        redisTemplate.opsForValue().set(key, String.valueOf(newStock), CACHE_TTL);

        System.out.println("[INVENTORY] DECREMENT — product=" + productId
                + " by=" + quantity + " newStock=" + newStock + " ref=" + referenceId);

        return Map.of(
                "success", true,
                "message", "Stock decremented",
                "stockLeft", newStock,
                "decrementedBy", quantity
        );
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Map<String, Object> incrementStock(Long productId, int quantity, String referenceId) {
        Product product = productRepository.findByIdWithPessimisticLock(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        int currentStock = product.getStockLeft() != null ? product.getStockLeft() : 0;
        int newStock = currentStock + quantity;
        product.setStockLeft(newStock);
        productRepository.save(product);

        InventoryTransactionLog logEntry = new InventoryTransactionLog(
                productId, "INCREMENT", quantity, newStock, referenceId
        );
        txLogRepository.save(logEntry);

        String key = STOCK_KEY_PREFIX + productId;
        redisTemplate.opsForValue().set(key, String.valueOf(newStock), CACHE_TTL);

        System.out.println("[INVENTORY] INCREMENT — product=" + productId
                + " by=" + quantity + " newStock=" + newStock + " ref=" + referenceId);

        return Map.of(
                "success", true,
                "stockLeft", newStock
        );
    }

    public void initializeStockInCache(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        Integer stock = product.getStockLeft() != null ? product.getStockLeft() : 0;
        String key = STOCK_KEY_PREFIX + productId;
        redisTemplate.opsForValue().set(key, String.valueOf(stock), CACHE_TTL);

        System.out.println("[INVENTORY] INIT — product=" + productId + " stock=" + stock);
    }

    public int syncAllToCache() {
        List<Product> all = productRepository.findAll();
        int count = 0;
        for (Product p : all) {
            String key = STOCK_KEY_PREFIX + p.getId();
            Integer stock = p.getStockLeft() != null ? p.getStockLeft() : 0;
            redisTemplate.opsForValue().set(key, String.valueOf(stock), CACHE_TTL);
            count++;
        }
        System.out.println("[INVENTORY] SYNC ALL — " + count + " products written to cache");
        return count;
    }

    public Map<String, Object> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "InventoryService");
        status.put("status", "UP");

        try {
            String ping = redisTemplate.getConnectionFactory().getConnection().ping();
            status.put("redis", "connected");
            status.put("redisPing", ping);
        } catch (Exception e) {
            status.put("redis", "disconnected");
            status.put("redisError", e.getMessage());
        }

        try {
            long productCount = productRepository.count();
            status.put("database", "connected");
            status.put("productCount", productCount);
        } catch (Exception e) {
            status.put("database", "disconnected");
            status.put("dbError", e.getMessage());
        }

        long cacheCount = Optional.ofNullable(
                redisTemplate.keys(STOCK_KEY_PREFIX + "*")
        ).map(Set::size).orElse(0);
        status.put("cachedProducts", cacheCount);

        System.out.println("[INVENTORY] HEALTH CHECK — " + status);
        return status;
    }
}
