package com.flashengine.flashEngine.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class InventorySeckillService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String LUA_STOCK_DECR = 
        "local currentStock = redis.call('get', KEYS[1]) " +
        "if not currentStock then return -2 end " +
        "if tonumber(currentStock) >= tonumber(ARGV[1]) then " +
        "return redis.call('decrby', KEYS[1], ARGV[1]) " +
        "else return -1 end";

    public boolean preDecrementStock(String itemId, int quantity) {
        String stockKey = "inventory:product:" + itemId;

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(LUA_STOCK_DECR);
        redisScript.setResultType(Long.class);

        // Execute script atomically on Redis server instance
        Long result = redisTemplate.execute(
            redisScript, 
            Collections.singletonList(stockKey), 
            String.valueOf(quantity)
        );

        if (result != null) {
            if (result >= 0) {
                // Success! Inventory reserved.
                return true; 
            } else if (result == -1) {
                System.out.println("Execution Rejected: Item " + itemId + " is out of stock.");
            } else if (result == -2) {
                System.out.println("Execution Error: Stock key " + stockKey + " does not exist in cache.");
            }
        }
        return false;
    }
    public void initializeStockInCache(String itemId, int stockCount) {
        String stockKey = "inventory:product:" + itemId;
        redisTemplate.opsForValue().set(stockKey, String.valueOf(stockCount));
    }
}