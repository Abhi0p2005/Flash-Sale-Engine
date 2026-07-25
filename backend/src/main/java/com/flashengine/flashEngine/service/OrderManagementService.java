package com.flashengine.flashEngine.service;

import com.flashengine.flashEngine.model.*;
import com.flashengine.flashEngine.repository.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class OrderManagementService {

    private static final String STOCK_KEY_PREFIX = "stock:product:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final InventoryTransactionLogRepository txLogRepository;
    private final StringRedisTemplate redisTemplate;

    public OrderManagementService(OrderRepository orderRepository,
                                  CartService cartService,
                                  ProductRepository productRepository,
                                  InventoryTransactionLogRepository txLogRepository,
                                  StringRedisTemplate redisTemplate) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.productRepository = productRepository;
        this.txLogRepository = txLogRepository;
        this.redisTemplate = redisTemplate;
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

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Order createOrderFromCart(Long userId, Long shippingAddressId, String paymentMethod) {
        com.flashengine.flashEngine.model.Cart cart = cartService.getCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findByIdWithPessimisticLock(cartItem.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + cartItem.getProductId()));

            int currentStock = product.getStockLeft() != null ? product.getStockLeft() : 0;
            int requestedQty = cartItem.getQuantity();

            if (currentStock < requestedQty) {
                throw new IllegalStateException(
                        "Insufficient stock for \"" + cartItem.getProductName()
                        + "\". Available: " + currentStock + ", Requested: " + requestedQty
                );
            }

            int newStock = currentStock - requestedQty;
            product.setStockLeft(newStock);
            productRepository.save(product);

            InventoryTransactionLog logEntry = new InventoryTransactionLog(
                    cartItem.getProductId(), "DECREMENT", requestedQty, newStock,
                    "checkout:user:" + userId
            );
            txLogRepository.save(logEntry);

            String key = STOCK_KEY_PREFIX + cartItem.getProductId();
            redisTemplate.opsForValue().set(key, String.valueOf(newStock), CACHE_TTL);

            System.out.println("[INVENTORY] CHECKOUT DECREMENT — product=" + cartItem.getProductId()
                    + " by=" + requestedQty + " newStock=" + newStock + " user=" + userId);
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

        System.out.println("[INVENTORY] ORDER COMMITTED — orderId=" + order.getId()
                + " user=" + userId + " items=" + cart.getItems().size());

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
