package com.flashengine.flashEngine.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_receipts")
public class OrderReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "masked_card_number")
    private String maskedCardNumber;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "purchase_time")
    private LocalDateTime purchaseTime;

    public OrderReceipt() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getMaskedCardNumber() { return maskedCardNumber; }
    public void setMaskedCardNumber(String maskedCardNumber) { this.maskedCardNumber = maskedCardNumber; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public LocalDateTime getPurchaseTime() { return purchaseTime; }
    public void setPurchaseTime(LocalDateTime purchaseTime) { this.purchaseTime = purchaseTime; }
}