package com.flashengine.flashEngine.controller;

import com.flashengine.flashEngine.model.WishlistItem;
import com.flashengine.flashEngine.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<WishlistItem> addItem(Authentication auth,
                                                 @RequestBody Map<String, Object> body) {
        Long userId = (Long) auth.getPrincipal();
        Long productId = Long.valueOf(body.get("productId").toString());
        String name = (String) body.get("productName");
        String image = (String) body.get("productImage");
        Double price = body.get("productPrice") != null
                ? Double.valueOf(body.get("productPrice").toString()) : null;

        WishlistItem item = wishlistService.addItem(userId, productId, name, image, price);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeItem(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        wishlistService.removeItem(userId, id);
        return ResponseEntity.noContent().build();
    }
}
