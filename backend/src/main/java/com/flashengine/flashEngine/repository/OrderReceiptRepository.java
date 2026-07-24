package com.flashengine.flashEngine.repository; // Ensure this matches your real folder structure

import com.flashengine.flashEngine.model.OrderReceipt; // Adjust if your model path is slightly different
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderReceiptRepository extends JpaRepository<OrderReceipt, Long> {
    // Spring Boot and JPA will automatically handle all save/delete/find operations for PostgreSQL!
}