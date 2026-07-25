package com.flashengine.flashEngine.controller;

import com.flashengine.flashEngine.dto.CartRequest;
import com.flashengine.flashEngine.model.Cart;
import com.flashengine.flashEngine.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(Authentication auth,
                                         @Valid @RequestBody CartRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<Cart> updateItem(Authentication auth,
                                            @PathVariable Long id,
                                            @RequestBody Map<String, Integer> body) {
        Long userId = (Long) auth.getPrincipal();
        int quantity = body.getOrDefault("quantity", 0);
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, id, quantity));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Cart> removeItem(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(cartService.removeItem(userId, id));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
