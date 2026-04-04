/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: REST endpoints for land CRUD, images, recommendations, and plantation workflows.
*/
package com.example.terraspoter.controller;

import com.example.terraspoter.model.Land;
import com.example.terraspoter.model.LandImage;
import com.example.terraspoter.model.LandRecommendation;
import com.example.terraspoter.model.LandReview;
import com.example.terraspoter.repository.LandRecommendationRepository;
import com.example.terraspoter.service.LandService;
import com.example.terraspoter.repository.LandRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lands")
public class LandController {

    @Autowired private LandService                  landService;
    @Autowired private LandRecommendationRepository recommendationRepository;

    // Get all lands
    @GetMapping
    public List<Land> getAllLands() {
        return landService.getAllLands();
    }

    // Get single land
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Land> getLand(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(landService.getLandById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Save land
    @PostMapping
    public ResponseEntity<?> saveLand(@RequestBody Map<String, Object> payload,
                                      HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));
        try {
            return ResponseEntity.ok(landService.saveLand(payload, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Upload images
    @PostMapping("/{id:\\d+}/images")
    public ResponseEntity<?> uploadImages(@PathVariable Long id,
                                          @RequestParam("files") List<MultipartFile> files) {
        try {
            landService.saveImages(id, files);
            return ResponseEntity.ok(Map.of("message", "Images uploaded"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get images
    @GetMapping("/{id:\\d+}/images")
    public List<LandImage> getImages(@PathVariable Long id) {
        return landService.getImagesByLandId(id);
    }

    // Get recommendations
    @GetMapping("/{id:\\d+}/recommendations")
    public ResponseEntity<List<LandRecommendation>> getRecommendations(
            @PathVariable Long id) {
        return ResponseEntity.ok(recommendationRepository.findByLandId(id));
    }

    // Refresh recommendations
    @PostMapping("/{id:\\d+}/recommendations/refresh")
    public ResponseEntity<?> refreshRecommendations(@PathVariable Long id) {
        try {
            List<LandRecommendation> fresh = landService.refreshRecommendations(id);
            return ResponseEntity.ok(fresh);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("Land not found"))
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Land not found: " + id));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",   "ML service error — could not refresh recommendations",
                            "message", e.getMessage()
                    ));
        }
    }

    // Start plantation
    @PostMapping("/{id:\\d+}/plantation-start")
    public ResponseEntity<?> startPlantation(@PathVariable Long id,
                                             @RequestBody Map<String, Object> payload,
                                             HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));
        try {
            return ResponseEntity.ok(landService.startPlantation(id, payload, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Complete plantation
    @PostMapping("/{id:\\d+}/plantation-complete")
    public ResponseEntity<?> completePlantation(
            @PathVariable Long id,
            @RequestParam("treesPlanted")                         Integer treesPlanted,
            @RequestParam(value = "moreCapacity", required = false) Integer moreCapacity,
            @RequestParam(value = "notes",        required = false) String notes,
            @RequestParam(value = "images",       required = false) List<MultipartFile> images,
            HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));
        try {
            return ResponseEntity.ok(
                    landService.completePlantation(id, treesPlanted, moreCapacity,
                            notes, images, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    // Get reviews
    @GetMapping("/{id:\\d+}/reviews")
    public ResponseEntity<List<LandReview>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(landService.getReviews(id));
    }

    // Post review
    @PostMapping("/{id:\\d+}/reviews")
    public ResponseEntity<?> addReview(@PathVariable Long id,
                                       @RequestBody Map<String, Object> payload,
                                       HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));
        try {
            return ResponseEntity.ok(landService.addReview(id, payload, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/my")
    public ResponseEntity<?> getMyLands(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));
        return ResponseEntity.ok(landService.getLandsByUser(userId));
    }
    @Autowired
    private LandRepository landRepository;
    @GetMapping("/pending")
    public List<Land> getPendingLands() {
        System.out.println("API HIT 🔥");
        List<Land> lands = landRepository.findByStatus("PENDING");
        System.out.println("RESULT SIZE 👉 " + lands.size());
        return lands;
    }
}