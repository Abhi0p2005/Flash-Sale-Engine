package com.flashengine.flashEngine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class FlashEngineApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlashEngineApplication.class, args);
	}
}
