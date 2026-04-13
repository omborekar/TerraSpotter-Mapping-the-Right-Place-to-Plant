/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: REST endpoints for community growth tracking.
*/
package com.example.terraspoter.controller;

import com.example.terraspoter.model.GrowthUpdate;
import com.example.terraspoter.service.GrowthUpdateService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class GrowthController {

    private final GrowthUpdateService service;

    /**
     * GET /api/lands/{id}/growth-updates
     * Returns all growth updates for a specific land (most recent first).
     */
    @GetMapping("/api/lands/{id}/growth-updates")
    public ResponseEntity<?> getUpdatesForLand(@PathVariable Long id) {
        List<GrowthUpdate> updates = service.getUpdatesForLand(id);
        return ResponseEntity.ok(updates);
    }

    /**
     * POST /api/lands/{id}/growth-updates
     * Submit a new growth update with optional photos.
     * Requires authenticated session.
     */
    @PostMapping("/api/lands/{id}/growth-updates")
    public ResponseEntity<?> addGrowthUpdate(
            @PathVariable Long id,
            @RequestParam Integer averageHeightCm,
            @RequestParam Integer survivalRate,
            @RequestParam String healthStatus,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) List<MultipartFile> images,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));
        }
        try {
            GrowthUpdate update = service.addUpdate(
                    id, averageHeightCm, survivalRate, healthStatus, notes, images, userId
            );
            return ResponseEntity.ok(update);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/growth/feed
     * Global community feed — recent growth updates across all sites.
     */
    @GetMapping("/api/growth/feed")
    public ResponseEntity<?> getCommunityFeed() {
        List<GrowthUpdate> feed = service.getAllRecentUpdates();
        return ResponseEntity.ok(feed);
    }

    /**
     * GET /api/growth/stats
     * Aggregate statistics for the community feed hero section.
     */
    @GetMapping("/api/growth/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(service.getAggregateStats());
    }
}
