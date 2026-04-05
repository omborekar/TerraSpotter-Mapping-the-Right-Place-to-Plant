/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Endpoints for plantation start and completion workflows.
*/
package com.example.terraspoter.controller;

import com.example.terraspoter.dto.PlantationShowcaseDTO;
import com.example.terraspoter.model.PlantationCompletion;
import com.example.terraspoter.service.PlantationShowcaseService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plantations")
@CrossOrigin(
        origins = "https://terraspotterfrontend-qtmta2ofv-omborekar1406-9636s-projects.vercel.app",
        allowCredentials = "true"
)
public class PlantationController {

    // ── your existing service variable name kept exactly as-is ────────────
    @Autowired
    private PlantationShowcaseService service;

    // ─────────────────────────────────────────────────────────────────────
    // EXISTING — unchanged
    // GET /api/plantations/completed
    // Global showcase for all users (used by PlantationShowcase.jsx)
    // ─────────────────────────────────────────────────────────────────────
    @GetMapping("/completed")
    public List<PlantationShowcaseDTO> getAllCompletedPlantations() {
        return service.getCompletedPlantations();
    }

    // ─────────────────────────────────────────────────────────────────────
    // EXISTING — unchanged
    // POST /api/plantations/{id}/review
    // Add a review to a completion (used by the review modal)
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/{id:\\d+}/review")
    public String addReview(
            @PathVariable Long id,
            @RequestParam Integer rating,
            @RequestParam String comment,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("userId");
        return service.addReview(id, rating, comment, userId);
    }

    // ─────────────────────────────────────────────────────────────────────
    // NEW
    // GET /api/plantations/completions/my
    // Returns the logged-in user's own plantation completion records.
    // Used by Profile.jsx to:
    //   1) Show real "Trees Planted" count in the stat pill
    //   2) Power the "Trees Planted" area chart with actual data
    // Same session-auth pattern used in all your other controllers.
    // ─────────────────────────────────────────────────────────────────────
    @GetMapping("/completions/my")
    public ResponseEntity<?> getMyCompletions(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));
        return ResponseEntity.ok(service.getCompletionsByUser(userId));
    }
}