/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Business logic for community growth tracking updates.
*/
package com.example.terraspoter.service;

import com.example.terraspoter.model.GrowthUpdate;
import com.example.terraspoter.model.GrowthUpdateImage;
import com.example.terraspoter.model.Land;
import com.example.terraspoter.repository.GrowthUpdateRepository;
import com.example.terraspoter.repository.LandRepository;
import com.example.terraspoter.repository.PlantationCompletionRepository;
import com.example.terraspoter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GrowthUpdateService {

    private final GrowthUpdateRepository updateRepo;
    private final LandRepository landRepo;
    private final UserRepository userRepo;
    private final PlantationCompletionRepository completionRepo;
    private final CloudinaryService cloudinaryService;

    /**
     * Get all growth updates for a specific land, enriched with land info.
     */
    public List<GrowthUpdate> getUpdatesForLand(Long landId) {
        List<GrowthUpdate> updates = updateRepo.findByLandIdOrderByCreatedAtDesc(landId);
        landRepo.findById(landId).ifPresent(land -> {
            Integer totalTrees = completionRepo.findByLandIdOrderByCreatedAtDesc(landId).stream()
                    .mapToInt(c -> c.getTreesPlanted() != null ? c.getTreesPlanted() : 0)
                    .sum();
            for (GrowthUpdate u : updates) {
                u.setLandTitle(land.getTitle());
                u.setLandLocation(land.getNearbyLandmark());
                u.setLandTreesPlanted(totalTrees);
            }
        });
        return updates;
    }

    /**
     * Get all recent updates across all lands for community feed.
     */
    public List<GrowthUpdate> getAllRecentUpdates() {
        List<GrowthUpdate> updates = updateRepo.findAllByOrderByCreatedAtDesc();
        for (GrowthUpdate u : updates) {
            landRepo.findById(u.getLandId()).ifPresent(land -> {
                u.setLandTitle(land.getTitle());
                u.setLandLocation(land.getNearbyLandmark());
            });
            Integer totalTrees = completionRepo.findByLandIdOrderByCreatedAtDesc(u.getLandId()).stream()
                    .mapToInt(c -> c.getTreesPlanted() != null ? c.getTreesPlanted() : 0)
                    .sum();
            u.setLandTreesPlanted(totalTrees);
        }
        return updates;
    }

    /**
     * Get aggregate stats for the community feed hero section.
     */
    public Map<String, Object> getAggregateStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUpdates", updateRepo.count());
        stats.put("sitesTracked", updateRepo.countDistinctLands());
        stats.put("avgSurvivalRate", Math.round(updateRepo.averageSurvivalRate()));
        return stats;
    }

    /**
     * Submit a new growth update for a plantation site.
     */
    public GrowthUpdate addUpdate(
            Long landId,
            Integer averageHeightCm,
            Integer survivalRate,
            String healthStatus,
            String notes,
            List<MultipartFile> images,
            Long userId
    ) {
        // Validate land exists
        Land land = landRepo.findById(landId)
                .orElseThrow(() -> new RuntimeException("Land not found"));

        GrowthUpdate update = new GrowthUpdate();
        update.setLandId(landId);
        update.setUserId(userId);
        update.setAverageHeightCm(averageHeightCm);
        update.setSurvivalRate(survivalRate);
        update.setHealthStatus(healthStatus);
        update.setNotes(notes);

        // Set user name
        userRepo.findById(userId).ifPresent(user ->
                update.setUserName(user.getFname() + " " + user.getLname())
        );

        GrowthUpdate saved = updateRepo.save(update);

        // Upload images to Cloudinary
        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {
                try {
                    String url = cloudinaryService.uploadImage(file, "growth-updates");
                    GrowthUpdateImage img = new GrowthUpdateImage();
                    img.setUpdate(saved);
                    img.setImageUrl(url);
                    saved.getImages().add(img);
                } catch (Exception e) {
                    System.err.println("Failed to upload growth image: " + e.getMessage());
                }
            }
            saved = updateRepo.save(saved);
        }

        // Attach transient fields
        saved.setLandTitle(land.getTitle());
        saved.setLandLocation(land.getNearbyLandmark());

        return saved;
    }
}
