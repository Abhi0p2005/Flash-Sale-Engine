package com.flashengine.flashEngine.repository;

import com.flashengine.flashEngine.domain.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    
}
