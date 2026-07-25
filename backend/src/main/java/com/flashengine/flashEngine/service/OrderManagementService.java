package com.flashengine.flashEngine.service;

import com.flashengine.flashEngine.model.*;
import com.flashengine.flashEngine.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderManagementService {

    private final OrderRepository orderRepository;
    private final CartService cartService;

    public OrderManagementService(OrderRepository orderRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return order;
    }

    @Transactional
    public Order createOrderFromCart(Long userId, Long shippingAddressId, String paymentMethod) {
        com.flashengine.flashEngine.model.Cart cart = cartService.getCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddressId(shippingAddressId);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("PENDING");

        double total = 0;
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(
                    cartItem.getProductId(),
                    cartItem.getProductName(),
                    cartItem.getProductImage(),
                    cartItem.getQuantity(),
                    cartItem.getPrice()
            );
            order.addItem(orderItem);
            total += cartItem.getPrice() * cartItem.getQuantity();
        }
        order.setTotalPrice(total);

        order = orderRepository.save(order);

        cartService.clearCart(userId);

        return order;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
