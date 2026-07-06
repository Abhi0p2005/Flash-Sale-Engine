package com.flashengine.flashEngine.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/flash")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class FlashInventoryController {

    private final StringRedisTemplate redisTemplate;

    public FlashInventoryController(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    /**
     * Endpoint to initialize multiple item stocks at once using a single JSON array payload.
     * URL: POST http://localhost:8080/api/flash/init-stock
     */
    @PostMapping("/init-stock")
    public ResponseEntity<?> initMultipleStocks(@RequestBody Map<String, Object>[] payloads) {
        try {
            if (payloads == null || payloads.length == 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Payload array is empty"));
            }

            for (Map<String, Object> item : payloads) {
                Object itemIdObj = item.get("itemId");
                Object stockCountObj = item.get("stockCount");
                
                if (itemIdObj != null && stockCountObj != null) {
                    String itemId = String.valueOf(itemIdObj).trim();
                    String stockCount = String.valueOf(stockCountObj).trim();
                    
                    String stockKey = "inventory:product:" + itemId;
                    redisTemplate.opsForValue().set(stockKey, stockCount);
                }
            }
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Successfully initialized all marketplace items in Redis cache."
            ));
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Internal Error: " + e.getMessage()
            ));
        }
    }
    @GetMapping("/all-stocks")
    public ResponseEntity<Map<String, Integer>> getAllLiveStocks() {
        Map<String, Integer> stockMap = new HashMap<>();
        try {
            // 1. Scan using the exact prefix your order service utilizes (e.g., "product:*")
            Set<String> keys = redisTemplate.keys("inventory:product:*"); 
            
            if (keys != null) {
                for (String key : keys) {
                    // 2. Robust parsing: split by colon and take the last element as the ID
                    String[] parts = key.split(":");
                    String productIdStr = parts[parts.length - 1];
                    
                    String rawStockValue = redisTemplate.opsForValue().get(key);
                    int stockCount = (rawStockValue != null) ? Integer.parseInt(rawStockValue) : 0;
                    
                    stockMap.put(productIdStr, stockCount);
                }
            }
        } catch (Exception e) {
            System.err.println("Error syncing frontend stocks: " + e.getMessage());
        }
        return ResponseEntity.ok(stockMap);
    }
}