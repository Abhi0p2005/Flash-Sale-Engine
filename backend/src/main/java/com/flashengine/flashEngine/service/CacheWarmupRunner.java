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
    public void run(String... args) {
        try {
            System.out.println("Starting Redis Cache Warmup Pipeline...");
            
            String inventoryKey = "inventory:product:1";

            Boolean hasKey = redisTemplate.hasKey(inventoryKey);
            if (Boolean.FALSE.equals(hasKey)) {
                int initialStock = 1000;
                redisTemplate.opsForValue().set(inventoryKey, String.valueOf(initialStock));
                System.out.println("Cache Warmup Complete : Seeded " + inventoryKey + " with stock count: " + initialStock);
            }
            else {
                System.out.println("Cache Warmup Skipped : " + inventoryKey + " already exists with stock count: " + redisTemplate.opsForValue().get(inventoryKey));
            }
        } catch (Exception e) {
            System.err.println("Redis unavailable — CacheWarmup skipped: " + e.getMessage());
        }
    }
}
