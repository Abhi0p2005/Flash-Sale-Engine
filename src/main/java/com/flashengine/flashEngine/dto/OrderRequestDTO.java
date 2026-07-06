package com.flashengine.flashEngine.dto;

import java.util.List;

public class OrderRequestDTO {
    private String customerName;
    private String cardNumber;
    private Double totalPrice;
    private List<ItemDTO> itemsBought;

    // Getters and Setters
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public List<ItemDTO> getItemsBought() { return itemsBought; }
    public void setItemsBought(List<ItemDTO> itemsBought) { this.itemsBought = itemsBought; }

    public static class ItemDTO {
        private Integer productId;
        private Integer quantity;
        private Double pricePaid;

        // Getters and Setters
        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Double getPricePaid() { return pricePaid; }
        public void setPricePaid(Double pricePaid) { this.pricePaid = pricePaid; }
    }
}
