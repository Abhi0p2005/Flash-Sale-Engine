package com.flashengine.flashEngine.controller;

public class OrderPayload {
    private Long productId;
    private Long userId;
    public OrderPayload() {
    }
    public Long getProductId() {
        return productId;
    }
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

}
