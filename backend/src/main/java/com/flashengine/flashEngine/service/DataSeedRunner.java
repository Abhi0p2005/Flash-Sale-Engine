package com.flashengine.flashEngine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flashengine.flashEngine.model.Product;
import com.flashengine.flashEngine.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class DataSeedRunner implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    public DataSeedRunner(ProductRepository productRepository, ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            System.out.println("[SEED] Products table already has data — skipping seed.");
            return;
        }

        try (InputStream is = getClass().getClassLoader().getResourceAsStream("seed-products.json")) {
            if (is == null) {
                System.err.println("[SEED] seed-products.json not found in classpath.");
                return;
            }
            List<Product> products = objectMapper.readValue(is, new TypeReference<List<Product>>() {});
            productRepository.saveAll(products);
            System.out.println("[SEED] Seeded " + products.size() + " products into the database.");
        } catch (Exception e) {
            System.err.println("[SEED] Failed to seed products: " + e.getMessage());
        }
    }
}
