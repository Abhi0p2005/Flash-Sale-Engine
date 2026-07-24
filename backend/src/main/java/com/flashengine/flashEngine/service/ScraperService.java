package com.flashengine.flashEngine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flashengine.flashEngine.domain.Inventory;
import com.flashengine.flashEngine.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Service
public class ScraperService {

    private static final Logger logger = Logger.getLogger(ScraperService.class.getName());

    @Autowired
    private InventoryRepository inventoryRepository; 

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Changed return type from List<Product> to List<Inventory>
    public List<Inventory> triggerAndSaveScrapedData(String query) throws Exception {
        logger.info("Starting scraper for query: " + query);
        
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("python", "/app/scraper.py", query);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder jsonOutput = new StringBuilder();
            String line;
            
            // Read only the JSON lines, skipping log messages
            boolean jsonStarted = false;
            while ((line = reader.readLine()) != null) {
                // Skip log lines that start with special characters or are not JSON
                if (line.startsWith("📡") || line.startsWith("⚠️") || line.startsWith("🔌")) {
                    logger.info("Skipping log line: " + line);
                    continue;
                }
                
                // Look for the start of JSON array
                if (!jsonStarted && line.trim().startsWith("[")) {
                    jsonStarted = true;
                }
                
                // Only add lines that are part of the JSON output
                if (jsonStarted) {
                    jsonOutput.append(line);
                }
            }

            int exitCode = process.waitFor();
            logger.info("Scraper process exited with code: " + exitCode);
            
            if (exitCode != 0) {
                throw new RuntimeException("Scraper engine process failure code: " + exitCode);
            }

            // If no JSON was found, return empty list
            String jsonStr = jsonOutput.toString().trim();
            if (jsonStr.isEmpty()) {
                logger.warning("No JSON output received from scraper");
                return new ArrayList<>();
            }

            // Convert the JSON to a list of generic maps first
            List<Object> scrapedData = objectMapper.readValue(
                jsonStr, 
                new TypeReference<List<Object>>() {}
            );
            
            // Convert to Inventory objects
            List<Inventory> inventoryItems = new ArrayList<>();
            for (Object item : scrapedData) {
                if (item instanceof java.util.Map) {
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> map = (java.util.Map<String, Object>) item;
                    
                    Inventory inventory = new Inventory();
                    // Map the scraped fields to Inventory fields
                    // Note: We're generating a productId based on the name for demonstration
                    String name = (String) map.get("name");
                    long productId = Math.abs(name.hashCode()); // Simple ID generation for demo
                    inventory.setProductId(productId);
                    inventory.setStockCount((Integer) map.get("stockLeft"));
                    
                    inventoryItems.add(inventory);
                }
            }

            // Save the items to the database
            inventoryRepository.saveAll(inventoryItems);

            // Return the local list
            logger.info("Successfully scraped and saved " + inventoryItems.size() + " items");
            return inventoryItems;
        } catch (Exception e) {
            logger.severe("Error in scraper service: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}