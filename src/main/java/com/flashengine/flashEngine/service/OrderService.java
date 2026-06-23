package com.flashengine.flashEngine.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import com.flashengine.flashEngine.domain.Inventory;
import com.flashengine.flashEngine.domain.Orders;
import com.flashengine.flashEngine.repository.InventoryRepository;
import com.flashengine.flashEngine.repository.OrdersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import com.flashengine.flashEngine.controller.OrderPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class OrderService {
    private final InventoryRepository inventoryRepository;
    private final OrdersRepository ordersRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    // One single constructor to rule them all:
    public OrderService(InventoryRepository inventoryRepository,
                        OrdersRepository ordersRepository, 
                        StringRedisTemplate redisTemplate,
                        ObjectMapper objectMapper) {
        this.inventoryRepository = inventoryRepository;
        this.ordersRepository = ordersRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public String placeOrderRedis(Long productId, Long userId) {
       String inventoryKey = "inventory:product:" + productId;
         // Atomically decrement stock in Redis
        Long stock = redisTemplate.opsForValue().decrement(inventoryKey);

        if(stock!=null && stock >=0){
            try{
                OrderPayload payload = new OrderPayload();
                payload.setProductId(productId);
                payload.setUserId(userId);

                String jsonPayload = objectMapper.writeValueAsString(payload);
                redisTemplate.opsForList().leftPush("orders:queue", jsonPayload);
                return "SUCCESS";
            } catch (Exception e) {
                redisTemplate.opsForValue().increment(inventoryKey); // Rollback stock decrement
                throw new RuntimeException("Failed to place order: " + e);
            }
        }
        else {
            return "OUT OF STOCK (REDIS)";
        }
    }

    //Pessimistic Locking to handle concurrent order placements
    @Transactional
    public String placeOrderPessimistic(Long productId,Long userId) {
        Inventory inventory = inventoryRepository.findByProductIdWithPessimisticLock(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (inventory.getStockCount() <= 0) {
            return "OUT OF STOCK";
        }
        // Decrease stock count and save inventory
        inventory.setStockCount(inventory.getStockCount() - 1);
        inventoryRepository.save(inventory);

        // Record the order
        Orders order = new Orders();
        order.setProductId(productId);
        order.setUserId(userId);
        order.setStatus("SUCCESS PESSIMISTIC");
        order.setCreatedAt(LocalDateTime.now());
        ordersRepository.save(order);
        return "ORDER PLACED SUCCESSFULLY (PESSIMISTIC LOCKING)";
    }

    //Optimistic Locking to handle concurrent order placements
    @Transactional
    public String placeOrderOptimistic(Long productId,Long userId) {

        String lockKey = "lock:user:" + userId + ":product" + productId;

        Boolean isLockAcquired = redisTemplate.opsForValue().setIfAbsent(lockKey,"LOCKED",5,TimeUnit.SECONDS);

        if(Boolean.FALSE.equals(isLockAcquired)){

            throw new IllegalStateException("Duplicate request detected.Please wait a few seconds before trying again");
        }
        // Uses normal findById to get inventory
        Inventory inventory = inventoryRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if(inventory.getStockCount()<=0) return "OUT OF STOCK";
        
        inventory.setStockCount(inventory.getStockCount()-1);
        inventoryRepository.save(inventory);    
        
        Orders order = new Orders(productId, userId, "SUCCESS OPTIMISTIC");
        ordersRepository.save(order);

        return "SUCCESS";
    }
}
