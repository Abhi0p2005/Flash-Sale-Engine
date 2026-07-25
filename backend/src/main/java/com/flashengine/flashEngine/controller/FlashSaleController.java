package com.flashengine.flashEngine.controller;

import com.flashengine.flashEngine.service.InventorySeckillService;
import com.flashengine.flashEngine.service.OrderExecutionQueue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/flash")
@CrossOrigin(originPatterns = {"http://localhost:5173", "https://*.vercel.app"})
public class FlashSaleController {

    @Autowired
    private InventorySeckillService inventoryService;

    @Autowired
    private OrderExecutionQueue orderQueue;

    // @PostMapping("/init-stock")
    // public ResponseEntity<Map<String, Object>> initializeStock(@RequestBody Map<String, Object> requestBody) {
    //     Map<String, Object> response = new HashMap<>();
        
    //     try {
    //         String itemId = String.valueOf(requestBody.get("itemId"));
    //         String stockCountStr = String.valueOf(requestBody.get("stockCount"));
            
    //         if (requestBody.get("itemId") == null || requestBody.get("stockCount") == null) {
    //             response.put("success", false);
    //             response.put("message", "Missing itemId or stockCount in payload.");
    //             return ResponseEntity.badRequest().body(response);
    //         }

    //         int stockCount = Integer.parseInt(stockCountStr);
            
    //         // Delegate the cache warming to your service layer
    //         inventoryService.initializeStockInCache(itemId, stockCount);
            
    //         response.put("success", true);
    //         response.put("message", "Successfully initialized cache via Service. Item: " + itemId + " set to " + stockCount);
    //         return ResponseEntity.ok(response);
            
    //     } catch (Exception e) {
    //         response.put("success", false);
    //         response.put("message", "Initialization failed: " + e.getMessage());
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    //     }
    // }

    
    @PostMapping("/order")
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody Map<String, String> requestBody) {
        String userId = requestBody.get("userId");
        String itemId = requestBody.get("itemId");
        
        Map<String, Object> response = new HashMap<>();

        // Validate basic inputs
        if (userId == null || itemId == null) {
            response.put("success", false);
            response.put("message", "Invalid request parameters.");
            return ResponseEntity.badRequest().body(response);
        }

        // Redis Lua Gatekeeper
        boolean isStockReserved = inventoryService.preDecrementStock(itemId, 1);

        if (isStockReserved) {
            //   disk-write queue asynchronously
            orderQueue.submitOrderTask(userId, itemId);

            // Successful order
            response.put("success", true);
            response.put("message", "Order accepted. Processing execution token.");
            return ResponseEntity.ok(response);
        } else {
            
            response.put("success", false);
            response.put("message", "Transaction rejected: Item is sold out or unavailable.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }
}