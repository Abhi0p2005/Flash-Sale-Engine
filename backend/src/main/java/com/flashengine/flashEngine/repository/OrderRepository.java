package com.flashengine.flashEngine.repository;

import com.flashengine.flashEngine.model.Order;
import com.flashengine.flashEngine.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndStatus(Long userId, OrderStatus status);
}
