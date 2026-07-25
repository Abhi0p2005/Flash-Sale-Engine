package com.flashengine.flashEngine.controller;

import com.flashengine.flashEngine.repository.OrderReceiptRepository;
import com.flashengine.flashEngine.model.*;
import com.flashengine.flashEngine.dto.*;
import com.flashengine.flashEngine.service.OrderService;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/checkout")
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
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
    public ResponseEntity<String> checkoutRedis(@RequestParam Long productId, @RequestParam Long userId) {
        // 1. Create the payload object your service expects
        OrderPayload payload = new OrderPayload();
        payload.setProductId(productId);
        payload.setUserId(userId);

        // 2. Return the ResponseEntity directly from the service
        return orderService.placeOrderRedis(payload);
    }

    @Autowired
    private OrderReceiptRepository orderRepository;

    @PostMapping("/orders")
    public ResponseEntity<String> saveOrderReceipt(@RequestBody OrderRequestDTO dto) {
        try {
            OrderReceipt receipt = new OrderReceipt();
            receipt.setCustomerName(dto.getCustomerName());
            receipt.setMaskedCardNumber(dto.getCardNumber());
            receipt.setTotalPrice(dto.getTotalPrice());
            receipt.setPurchaseTime(LocalDateTime.now());

            orderRepository.save(receipt);

            return ResponseEntity.ok("Receipt cataloged successfully in PostgreSQL!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Database save failed: " + e.getMessage());
        }
    }
}

