/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Service handling land verification workflows, checks, and gamification hooks.
*/
package com.example.terraspoter.service;

import com.example.terraspoter.model.Land;
import com.example.terraspoter.repository.LandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class LandVerificationService {

    private static final Logger log = Logger.getLogger(LandVerificationService.class.getName());

    private final LandRepository      landRepository;
    private final GamificationService gamificationService;

    public String verifyLand(Long landId, Long verifierUserId, String vote) {

        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new RuntimeException("Land not found: " + landId));

        // Only act on PENDING lands
        if (!"PENDING".equalsIgnoreCase(land.getStatus())) {
            return "Land is already " + land.getStatus() + " — no action taken.";
        }

        switch (vote.toUpperCase()) {
            case "APPROVE":
                land.setStatus("APPROVED");
                landRepository.save(land);

                // Gamification — award XP to the verifier for verifying
                try {
                    gamificationService.awardXp(verifierUserId, "VERIFY_LAND", landId,
                            GamificationService.XP_VERIFY_LAND);
                } catch (Exception e) {
                    log.warning("Gamification failed for VERIFY_LAND: " + e.getMessage());
                }

                // Gamification — award XP to the land owner whose land was approved
                if (land.getCreatedBy() != null) {
                    try {
                        gamificationService.awardXp(land.getCreatedBy(), "LAND_APPROVED", landId,
                                GamificationService.XP_LAND_APPROVED);
                    } catch (Exception e) {
                        log.warning("Gamification failed for LAND_APPROVED: " + e.getMessage());
                    }
                }
                return "Land approved successfully.";

            case "REJECT":
                land.setStatus("REJECTED");
                landRepository.save(land);
                return "Land rejected successfully.";

            default:
                throw new IllegalArgumentException("Invalid vote value: " + vote + ". Use APPROVE or REJECT.");
        }
    }
}