package com.flashengine.flashEngine.controller;

import com.flashengine.flashEngine.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/products/{id}/stock")
    public ResponseEntity<Map<String, Object>> getProductStock(@PathVariable Long id) {
        try {
            Integer stock = inventoryService.getStock(id);
            return ResponseEntity.ok(Map.of(
                    "productId", id,
                    "stockLeft", stock
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/products/stock-batch")
    public ResponseEntity<Map<Long, Integer>> getStockBatch(
            @RequestParam("ids") String idsCsv) {
        List<Long> ids = List.of(idsCsv.split(",")).stream()
                .map(String::trim)
                .map(Long::parseLong)
                .collect(Collectors.toList());
        return ResponseEntity.ok(inventoryService.getStockBatch(ids));
    }

    @PostMapping("/admin/inventory/sync")
    public ResponseEntity<Map<String, Object>> syncAllToCache() {
        int count = inventoryService.syncAllToCache();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cache synchronized",
                "productsCached", count
        ));
    }

    @GetMapping("/admin/inventory/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(inventoryService.healthCheck());
    }

    @PostMapping("/admin/inventory/stock/{id}")
    public ResponseEntity<Map<String, Object>> setStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String action = (String) body.getOrDefault("action", "set");
        int quantity = Integer.parseInt(body.get("quantity").toString());
        String ref = (String) body.getOrDefault("referenceId", "admin:" + action);

        if ("decrement".equals(action)) {
            return ResponseEntity.ok(inventoryService.decrementStock(id, quantity, ref));
        } else if ("increment".equals(action)) {
            return ResponseEntity.ok(inventoryService.incrementStock(id, quantity, ref));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid action. Use 'increment' or 'decrement'."
            ));
        }
    }
}
