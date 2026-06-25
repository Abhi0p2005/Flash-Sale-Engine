package com.flashengine.flashEngine.controller;

import org.springframework.data.redis.core.StringRedisTemplate;
import com.flashengine.flashEngine.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/checkout")
@CrossOrigin(origins = "*")
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
        // 1. Pass the entire payload object to allow the service layer to extract the idempotency key
        return orderService.placeOrderRedis(payload);
    }
}
