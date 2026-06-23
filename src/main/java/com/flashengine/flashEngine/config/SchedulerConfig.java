package com.flashengine.flashEngine.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class SchedulerConfig {

    @Bean(name = "flashEngineTaskScheduler")
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2); 
        scheduler.setThreadNamePrefix("OrderProcessor-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(30); 
        return scheduler;
    }

    // 👈 Add this bean definition right here to satisfy OrderService!
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}