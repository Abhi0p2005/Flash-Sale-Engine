package com.flashengine.flashEngine.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class CacheWarmupRunner implements CommandLineRunner {

    private final StringRedisTemplate redisTemplate;

    public CacheWarmupRunner(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Starting Redis Cache Warmup Pipeline...");
        
        // Example: Preload inventory data for product IDs 1 to 100
        String inventoryKey = "inventory:product:1";

        //only seed if not already seeded
        Boolean hasKey = redisTemplate.hasKey(inventoryKey);
        if (Boolean.FALSE.equals(hasKey)) {
            int initialStock = 1000; // Example stock count
            redisTemplate.opsForValue().set(inventoryKey, String.valueOf(initialStock));
            System.out.println("Cache Warmup Complete : Seeded " + inventoryKey + " with stock count: " + initialStock);
        }
        else {
            System.out.println("Cache Warmup Skipped : " + inventoryKey + " already exists with stock count: " + redisTemplate.opsForValue().get(inventoryKey));
        }
    }
}
