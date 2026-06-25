package com.flashengine.flashEngine.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {
    
    public static final String FLASH_SALE_QUEUE = "flash_sale_orders_queue";
    public static final String FLASH_SALE_EXCHANGE = "flash_sale_exchange";
    public static final String FLASH_SALE_ROUTING_KEY = "flash_sale_routing_key";

    //Dead Letter Queue
    public static final String DLX_EXCHANGE = "flash_sale_dlx";
    public static final String DLQ_QUEUE = "flash_sale_dlq";
    public static final String DLQ_ROUTING_KEY = "flash_sale_dlq_routing_key";

    @Bean
    public DirectExchange mainExchange() {
        return new DirectExchange(FLASH_SALE_EXCHANGE);
    }

    @Bean
    public Queue mainQueue(){
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLX_EXCHANGE);
        args.put("x-dead-letter-routing-key", DLQ_ROUTING_KEY);
        return new Queue(FLASH_SALE_QUEUE, true, false, false, args);
    }

    @Bean
    public Binding mainBinding(Queue mainQueue, DirectExchange mainExchange){
        return BindingBuilder.bind(mainQueue).to(mainExchange).with(FLASH_SALE_ROUTING_KEY);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE);
    }

    @Bean
    public Queue deadLetterQueue() {
        return new Queue(DLQ_QUEUE, true);
    }

    @Bean
    public Binding dlqBinding(){
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(DLQ_ROUTING_KEY);
    }

    // Define queue
    @Bean
    public Queue orderQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLX_EXCHANGE);
        args.put("x-dead-letter-routing-key", DLQ_ROUTING_KEY);
        return new Queue(FLASH_SALE_QUEUE, true, false, false, args);
    }

    //Define exchange
    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(FLASH_SALE_EXCHANGE);
    }

    //Bind queue to exchange using routing key
    @Bean
    public Binding binding(Queue orderQueue, DirectExchange orderExchange){
        return BindingBuilder.bind(orderQueue).to(orderExchange).with(FLASH_SALE_ROUTING_KEY);
    }
}
