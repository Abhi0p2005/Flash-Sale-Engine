package com.flashengine.flashEngine.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price_paid", nullable = false)
    private Double pricePaid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore // Important: stops infinite loops during backend JSON parsing
    private OrderReceipt orderReceipt;

    public OrderItem() {}

    public OrderItem(Integer productId, Integer quantity, Double pricePaid) {
        this.productId = productId;
        this.quantity = quantity;
        this.pricePaid = pricePaid;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getPricePaid() { return pricePaid; }
    public void setPricePaid(Double pricePaid) { this.pricePaid = pricePaid; }
    public OrderReceipt getOrderReceipt() { return orderReceipt; }
    public void setOrderReceipt(OrderReceipt orderReceipt) { this.orderReceipt = orderReceipt; }
}