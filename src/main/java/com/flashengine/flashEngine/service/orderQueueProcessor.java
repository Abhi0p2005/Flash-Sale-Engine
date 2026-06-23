package com.flashengine.flashEngine.service;

import com.flashengine.flashEngine.domain.Orders;
import com.flashengine.flashEngine.repository.OrdersRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flashengine.flashEngine.controller.OrderPayload;
import java.time.LocalDateTime;

@Component
public class orderQueueProcessor {

    private final StringRedisTemplate redisTemplate;
    private final OrdersRepository ordersRepository;
    private final ObjectMapper objectMapper;

    public orderQueueProcessor(StringRedisTemplate redisTemplate, OrdersRepository ordersRepository) {
        this.redisTemplate = redisTemplate;
        this.ordersRepository = ordersRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Scheduled(fixedDelay = 10)
    public void processQueue() {
        String orderJson = redisTemplate.opsForList().rightPop("orders:queue");
        
        if (orderJson != null) {
            try {
                System.out.println("Processing JSON payload: " + orderJson); // Debug Log
                
                OrderPayload payload = objectMapper.readValue(orderJson, OrderPayload.class);

                Orders order = new Orders();
                order.setProductId(payload.getProductId());
                order.setUserId(payload.getUserId());
                order.setStatus("SUCCESS REDIS");
                order.setCreatedAt(LocalDateTime.now());

                ordersRepository.save(order);
                System.out.println("Successfully saved order to DB for User: " + payload.getUserId());
                
            } catch (Exception e) {
                System.err.println("ERROR PROCESSING ORDER PAYLOAD " +  e.getMessage());
            }
        }
    }
}
