package com.flashengine.flashEngine.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Service
public class OrderExecutionQueue {
    
    private final ExecutorService asyncWorkerPool;

    public OrderExecutionQueue() {
        this.asyncWorkerPool = new ThreadPoolExecutor(10,50,
            60L,TimeUnit.SECONDS,new LinkedBlockingQueue<>(100000),
            Executors.defaultThreadFactory(),
            new ThreadPoolExecutor.AbortPolicy());
    }

    public void submitOrderTask(String userId, String itemId) {
        asyncWorkerPool.submit(() -> {
            try {
                processDatabaseTransaction(userId, itemId);
            } catch (Exception e) {
                System.err.println("Critical Error: Failed to commit order to DB for User: " + userId);
               
            }
        });
    }

    private void processDatabaseTransaction(String userId, String itemId) {
        long startTime = System.currentTimeMillis();
        try{
            Thread.sleep(50);
        }
        catch(InterruptedException e){
            Thread.currentThread().interrupt();
        }
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("[DB Worker] Successfully generated order for user " + userId + " | Item: " + itemId + " | Duration: " + duration + "ms");
    }
}
