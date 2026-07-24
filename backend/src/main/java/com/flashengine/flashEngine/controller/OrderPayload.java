package com.flashengine.flashEngine.controller;

public class OrderPayload implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    private Long productId;
    private Long userId;
    private String idempotencyKey;
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
    public String getIdempotencyKey() {
        return idempotencyKey;
    }
    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

}
