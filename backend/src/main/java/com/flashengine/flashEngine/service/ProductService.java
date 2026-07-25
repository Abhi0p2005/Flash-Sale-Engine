package com.flashengine.flashEngine.service;

import com.flashengine.flashEngine.model.Product;
import com.flashengine.flashEngine.repository.ProductRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private static final String STOCK_KEY_PREFIX = "stock:product:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final ProductRepository productRepository;
    private final StringRedisTemplate redisTemplate;

    public ProductService(ProductRepository productRepository, StringRedisTemplate redisTemplate) {
        this.productRepository = productRepository;
        this.redisTemplate = redisTemplate;
    }

    private Integer enrichStock(Long productId, Integer dbStock) {
        String key = STOCK_KEY_PREFIX + productId;
        String cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return Integer.parseInt(cached);
        }
        Integer stock = dbStock != null ? dbStock : 0;
        redisTemplate.opsForValue().set(key, String.valueOf(stock), CACHE_TTL);
        return stock;
    }

    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            p.setStockLeft(enrichStock(p.getId(), p.getStockLeft()));
        }
        return products;
    }

    public List<Product> getProductsByCategory(String category) {
        List<Product> products = productRepository.findByCategory(category);
        for (Product p : products) {
            p.setStockLeft(enrichStock(p.getId(), p.getStockLeft()));
        }
        return products;
    }

    public Product getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setStockLeft(enrichStock(product.getId(), product.getStockLeft()));
        return product;
    }

    public List<Product> searchProducts(String query) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(query);
        for (Product p : products) {
            p.setStockLeft(enrichStock(p.getId(), p.getStockLeft()));
        }
        return products;
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> saveAllProducts(List<Product> products) {
        return productRepository.saveAll(products);
    }
}
