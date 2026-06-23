package com.flashengine.flashEngine.controller;

import org.springframework.data.redis.core.StringRedisTemplate;
import com.flashengine.flashEngine.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/checkout")

public class OrderController {
    private final OrderService orderService;
    private final StringRedisTemplate redisTemplate;

    public OrderController(OrderService orderService,StringRedisTemplate redisTemplate) {
        this.orderService = orderService;
        this.redisTemplate = redisTemplate;
    }

    @PostMapping("/pessimistic")
    public ResponseEntity<String> checkoutPessimistic(@RequestParam Long productId, @RequestParam Long userId) {
        String result = orderService.placeOrderPessimistic(productId, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/optimistic")
    public ResponseEntity<String> checkoutOptimistic(@RequestParam Long productId, @RequestParam Long userId) {
        try{
            String result = orderService.placeOrderOptimistic(productId, userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
        
    }

    @PostMapping("/redis")
    public ResponseEntity<String> checkoutRedis(@RequestBody OrderPayload payload) {
        String inventoryKey = "inventory:product:" + payload.getProductId();

        // peek at current stock for debugging
        String stockStr = redisTemplate.opsForValue().get(inventoryKey);

        if(stockStr != null && Integer.parseInt(stockStr) <= 0) {
            return ResponseEntity.status(400).body("OUT OF STOCK (REDIS)");
        }

        //if stock exists, attempt to place order
        String result = orderService.placeOrderRedis(payload.getProductId(), payload.getUserId());
        
        if("OUT OF STOCK (REDIS)".equals(result)) {
            return ResponseEntity.status(422).body("OUT OF STOCK : Failed to secure stock");
        }
        return ResponseEntity.ok(result);
    }
}
