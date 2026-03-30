package com.example.terraspoter.controller;

import com.example.terraspoter.dto.PlantationShowcaseDTO;
import com.example.terraspoter.service.PlantationShowcaseService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plantations")
@CrossOrigin(
        originPatterns = "*",
        allowCredentials = "true"
)
public class PlantationController {

    @Autowired
    private PlantationShowcaseService service;

    // 🌳 GLOBAL SHOWCASE (ALL USERS)
    @GetMapping("/completed")
    public List<PlantationShowcaseDTO> getAllCompletedPlantations() {
        return service.getCompletedPlantations();
    }

    // ⭐ ADD REVIEW (FOR MODAL)
    @PostMapping("/{id}/review")
    public String addReview(
            @PathVariable Long id,
            @RequestParam Integer rating,
            @RequestParam String comment,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("userId");

        return service.addReview(id, rating, comment, userId);
    }
}