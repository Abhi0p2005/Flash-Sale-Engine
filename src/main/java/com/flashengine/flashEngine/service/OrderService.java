package com.flashengine.flashEngine.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import com.flashengine.flashEngine.domain.Inventory;
import com.flashengine.flashEngine.domain.Orders;
import com.flashengine.flashEngine.repository.InventoryRepository;
import com.flashengine.flashEngine.repository.OrdersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.flashengine.flashEngine.config.RabbitMQConfig;
// import org.springframework.orm.ObjectOptimisticLockingFailureException;
import com.flashengine.flashEngine.controller.OrderPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;
import org.springframework.http.ResponseEntity;

@Service
public class OrderService {
    private final InventoryRepository inventoryRepository;
    private final OrdersRepository ordersRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final RabbitTemplate rabbitTemplate;
    // One single constructor
    public OrderService(InventoryRepository inventoryRepository,
                        OrdersRepository ordersRepository, 
                        StringRedisTemplate redisTemplate,
                        ObjectMapper objectMapper,RabbitTemplate rabbitTemplate) {
        this.inventoryRepository = inventoryRepository;
        this.ordersRepository = ordersRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.rabbitTemplate = rabbitTemplate;
    }

    public ResponseEntity<String> placeOrderRedis(OrderPayload payload) {
       String lockKey = "idempotency:" + payload.getIdempotencyKey();
        Boolean isUniqueRequest = redisTemplate.opsForValue().setIfAbsent(lockKey, "PROCESSING", 10, TimeUnit.SECONDS);

        if (Boolean.FALSE.equals(isUniqueRequest)) {
            return ResponseEntity.status(409).body("DUPLICATE_REQUEST_REJECTED");
        }

        try {
            Long stock = redisTemplate.opsForValue().decrement("inventory:product:" + payload.getProductId());

            if (stock != null && stock >= 0) {
                rabbitTemplate.convertAndSend(
                    RabbitMQConfig.FLASH_SALE_EXCHANGE, 
                    RabbitMQConfig.FLASH_SALE_ROUTING_KEY, 
                    objectMapper.writeValueAsString(payload)
                );
                return ResponseEntity.ok("SUCCESS");
            } else {
                return ResponseEntity.status(422).body("OUT OF STOCK (REDIS)");
            }
        } catch (Exception e) {
            redisTemplate.delete(lockKey);
            return ResponseEntity.status(500).body("INTERNAL_SERVER_ERROR");
        }
    }

    //Pessimistic Locking to handle concurrent order placements
    @Transactional
    public String placeOrderPessimistic(Long productId,Long userId) {
        Inventory inventory = inventoryRepository.findByProductIdWithPessimisticLock(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (inventory.getStockCount() <= 0) {
            return "OUT OF STOCK";
        }
        // Decrease stock count and save inventory
        inventory.setStockCount(inventory.getStockCount() - 1);
        inventoryRepository.save(inventory);

        // Record the order
        Orders order = new Orders();
        order.setProductId(productId);
        order.setUserId(userId);
        order.setStatus("SUCCESS PESSIMISTIC");
        order.setCreatedAt(LocalDateTime.now());
        ordersRepository.save(order);
        return "ORDER PLACED SUCCESSFULLY (PESSIMISTIC LOCKING)";
    }

    //Optimistic Locking to handle concurrent order placements
    @Transactional
    public String placeOrderOptimistic(Long productId,Long userId) {

        String lockKey = "lock:user:" + userId + ":product" + productId;

        Boolean isLockAcquired = redisTemplate.opsForValue().setIfAbsent(lockKey,"LOCKED",5,TimeUnit.SECONDS);

        if(Boolean.FALSE.equals(isLockAcquired)){

            throw new IllegalStateException("Duplicate request detected.Please wait a few seconds before trying again");
        }
        // Uses normal findById to get inventory
        Inventory inventory = inventoryRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if(inventory.getStockCount()<=0) return "OUT OF STOCK";
        
        inventory.setStockCount(inventory.getStockCount()-1);
        inventoryRepository.save(inventory);    
        
        Orders order = new Orders(productId, userId, "SUCCESS OPTIMISTIC");
        ordersRepository.save(order);

        return "SUCCESS";
    }
}
