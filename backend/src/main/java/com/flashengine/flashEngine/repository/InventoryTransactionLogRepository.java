package com.flashengine.flashEngine.repository;

import com.flashengine.flashEngine.model.InventoryTransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionLogRepository extends JpaRepository<InventoryTransactionLog, Long> {
    List<InventoryTransactionLog> findByProductIdOrderByCreatedAtDesc(Long productId);
}
