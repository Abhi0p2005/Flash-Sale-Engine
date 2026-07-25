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
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.time.LocalDateTime;

@Service
@ConditionalOnProperty(name = "rabbitmq.enabled", havingValue = "true", matchIfMissing = true)
public class OrderConsumer {

    private final ObjectMapper objectMapper;
    private final OrdersRepository ordersRepository;
    private final InventoryRepository inventoryRepository;
    private final StringRedisTemplate redisTemplate;

    public OrderConsumer(StringRedisTemplate redisTemplate,
                         ObjectMapper objectMapper,
                         OrdersRepository ordersRepository,
                         InventoryRepository inventoryRepository) {
        this.objectMapper = objectMapper;
        this.ordersRepository = ordersRepository;
        this.inventoryRepository = inventoryRepository;
        this.redisTemplate = redisTemplate;
    }

    @RabbitListener(queues = RabbitMQConfig.FLASH_SALE_QUEUE)
    public void processOrdersQueue(String  orderJson) {
        if(orderJson != null){
            OrderPayload payload = null;
            try{
                payload = objectMapper.readValue(orderJson, OrderPayload.class);
                
                saveOrderToDatabase(payload.getProductId(), payload.getUserId());
                
            }
            catch (Exception e) {
                System.err.println("Critical failure processing order. Forwarding to DLQ: " + e.getMessage());
                
                if (payload != null) {
                    rollbackRedisStock(payload.getProductId());
                }

                throw new RuntimeException("Rerouting failed order payload to DLQ",e);
            }
        }
    }

    @Transactional
    public void saveOrderToDatabase(Long productId, Long userId) {
        
        Orders order = new Orders();
        order.setProductId(productId);
        order.setUserId(userId);
        order.setStatus("SUCCESS_ASYNC_REDIS");
        order.setCreatedAt(LocalDateTime.now());
        ordersRepository.save(order);

        
        Inventory inventory = inventoryRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product missing from database on sync"));
        
        if (inventory.getStockCount() > 0) {
            inventory.setStockCount(inventory.getStockCount() - 1);
            inventoryRepository.save(inventory);
        }
        else {
            throw new RuntimeException("Database level stock out detected for product: " + productId);
        }
    }
    private void rollbackRedisStock(Long productId) {
    try {
        // Change from "inventory:product:" to "product:" to match the key pattern
        String stockKey = "inventory:product:" + productId; 
        Long currentStock = redisTemplate.opsForValue().increment(stockKey);
        System.out.println("[Rollback] Restored 1 unit to Redis key [" + stockKey + "]. Current stock: " + currentStock);
    } catch (Exception re) {
        System.err.println("[Critical] Failed to roll back stock in Redis for product " + productId + ": " + re.getMessage());
    }
}
}