package com.flashengine.flashEngine.controller;

import com.flashengine.flashEngine.model.Order;
import com.flashengine.flashEngine.service.OrderManagementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderManagementController {

    private final OrderManagementService orderManagementService;

    public OrderManagementController(OrderManagementService orderManagementService) {
        this.orderManagementService = orderManagementService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(orderManagementService.getUserOrders(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(orderManagementService.getOrder(id, userId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(Authentication auth,
                                           @RequestBody Map<String, Object> body) {
        Long userId = (Long) auth.getPrincipal();
        Long addressId = body.get("addressId") != null
                ? Long.valueOf(body.get("addressId").toString()) : null;
        String paymentMethod = (String) body.get("paymentMethod");

        Order order = orderManagementService.createOrderFromCart(userId, addressId, paymentMethod);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}
