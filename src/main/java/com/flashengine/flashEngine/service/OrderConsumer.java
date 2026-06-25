package com.flashengine.flashEngine.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flashengine.flashEngine.controller.OrderPayload;
import com.flashengine.flashEngine.domain.Inventory;
import com.flashengine.flashEngine.domain.Orders;
import com.flashengine.flashEngine.repository.InventoryRepository;
import com.flashengine.flashEngine.repository.OrdersRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.flashengine.flashEngine.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

import java.time.LocalDateTime;

@Service
public class OrderConsumer {

    private final ObjectMapper objectMapper;
    private final OrdersRepository ordersRepository;
    private final InventoryRepository inventoryRepository;

    public OrderConsumer(StringRedisTemplate redisTemplate,
                         ObjectMapper objectMapper,
                         OrdersRepository ordersRepository,
                         InventoryRepository inventoryRepository) {
        this.objectMapper = objectMapper;
        this.ordersRepository = ordersRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // Runs continuously with a fixed delay of 10 milliseconds after the last run finishes
    @RabbitListener(queues = RabbitMQConfig.FLASH_SALE_QUEUE)
    public void processOrdersQueue(String  orderJson) {
        if(orderJson != null){
            try{
                // 1. Deserialize JSON back to Payload object
                OrderPayload payload = objectMapper.readValue(orderJson, OrderPayload.class);
                
                // 2. Persist the order data to PostgreSQL asynchronously
                saveOrderToDatabase(payload.getProductId(), payload.getUserId());
                
            }
            catch (Exception e) {
                System.err.println("Critical failure processing order. Forwarding to DLQ: " + e.getMessage());
                // In production, you would push this failed item to a Dead Letter Queue (DLQ)
                throw new RuntimeException("Rerouting failed order payload to DLQ",e);
            }
        }
    }

    @Transactional
    public void saveOrderToDatabase(Long productId, Long userId) {
        // 1. Persist the order record
        Orders order = new Orders();
        order.setProductId(productId);
        order.setUserId(userId);
        order.setStatus("SUCCESS_ASYNC_REDIS");
        order.setCreatedAt(LocalDateTime.now());
        ordersRepository.save(order);

        // 2. Sync the relational DB stock level down by 1 
        Inventory inventory = inventoryRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product missing from database on sync"));
        
        if (inventory.getStockCount() > 0) {
            inventory.setStockCount(inventory.getStockCount() - 1);
            inventoryRepository.save(inventory);
        }
    }
}