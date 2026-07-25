package com.flashengine.flashEngine.service;

import com.flashengine.flashEngine.model.WishlistItem;
import com.flashengine.flashEngine.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;

    public WishlistService(WishlistItemRepository wishlistItemRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
    }

    public List<WishlistItem> getWishlist(Long userId) {
        return wishlistItemRepository.findByUserIdOrderByAddedAtDesc(userId);
    }

    public WishlistItem addItem(Long userId, Long productId, String productName,
                                 String productImage, Double productPrice) {
        if (wishlistItemRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalArgumentException("Item already in wishlist");
        }

        WishlistItem item = new WishlistItem();
        item.setUserId(userId);
        item.setProductId(productId);
        item.setProductName(productName);
        item.setProductImage(productImage);
        item.setProductPrice(productPrice);
        return wishlistItemRepository.save(item);
    }

    public void removeItem(Long userId, Long itemId) {
        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (!item.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        wishlistItemRepository.delete(item);
    }
}
