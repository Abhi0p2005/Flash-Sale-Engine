package com.flashengine.flashEngine.controller;

import com.flashengine.flashEngine.domain.Inventory;
import com.flashengine.flashEngine.service.ScraperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*") 
public class ProductScraperController {

    @Autowired
    private ScraperService scraperService;

    // 1. Changed the return type wrapper to List<Inventory>
    @GetMapping("/scrape")
    public ResponseEntity<List<Inventory>> runPipeline(@RequestParam String query) {
        try {
            // 2. Changed the variable type to List<Inventory> to match the service
            List<Inventory> savedData = scraperService.triggerAndSaveScrapedData(query);
            return ResponseEntity.ok(savedData);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
