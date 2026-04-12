/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: ONE-TIME backfill service — scans all existing platform tables and
              retroactively awards XP + badges to every user based on historical data.
              Designed to be idempotent: each record is only processed once.
              Trigger via POST /api/admin/gamification/backfill
*/
package com.example.terraspoter.service;

import com.example.terraspoter.model.*;
import com.example.terraspoter.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class GamificationBackfillService {

    private static final Logger log = Logger.getLogger(GamificationBackfillService.class.getName());

    private final LandRepository                 landRepo;
    private final PlantationStartRepository      plantationStartRepo;
    private final PlantationCompletionRepository completionRepo;
    private final LandReviewRepository           reviewRepo;
    private final GrowthUpdateRepository         growthUpdateRepo;
    private final XpTransactionRepository        xpTxRepo;
    private final GamificationService            gamificationService;
    private final UserRepository                 userRepo;

    // ───────────────────────────────────────────────────────────────────────────
    // MAIN BACKFILL ENTRY POINT
    // ───────────────────────────────────────────────────────────────────────────

    @Transactional
    public BackfillReport run(boolean dryRun) {

        BackfillReport report = new BackfillReport(dryRun);

        log.info("=== GAMIFICATION BACKFILL START (dryRun=" + dryRun + ") ===");

        // 1 — Land submissions (ADD_LAND)
        processLandSubmissions(report, dryRun);

        // 2 — Land approvals (LAND_APPROVED)
        processLandApprovals(report, dryRun);

        // 3 — Plantation starts (START_PLANTATION)
        processPlantationStarts(report, dryRun);

        // 4 — Plantation completions (COMPLETE_PLANTATION + tree XP)
        processPlantationCompletions(report, dryRun);

        // 5 — Land reviews (ADD_REVIEW)
        processLandReviews(report, dryRun);

        // 6 — Growth updates (GROWTH_UPDATE)
        processGrowthUpdates(report, dryRun);

        // 7 — Re-run badge checks for every user that received XP
        if (!dryRun) {
            processBadgeChecks(report);
        }

        log.info("=== GAMIFICATION BACKFILL COMPLETE — " + report.totalXpAwarded + " XP awarded across " + report.usersUpdated.size() + " users ===");
        return report;
    }

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 1 — Land Submissions
    // ───────────────────────────────────────────────────────────────────────────

    private void processLandSubmissions(BackfillReport report, boolean dryRun) {
        List<Land> lands = landRepo.findAll();
        int skipped = 0, processed = 0;

        for (Land land : lands) {
            Long userId = land.getCreatedBy();
            if (userId == null) { skipped++; continue; }

            if (alreadyAwarded(userId, "ADD_LAND", land.getId())) {
                skipped++;
                continue;
            }

            String note = String.format("Land '%s' (id=%d) → +%d XP (ADD_LAND) for user %d",
                    land.getTitle(), land.getId(), GamificationService.XP_ADD_LAND, userId);

            if (!dryRun) {
                safeAward(userId, "ADD_LAND", land.getId(), GamificationService.XP_ADD_LAND, report);
            }
            report.addDetail("ADD_LAND", note, dryRun);
            processed++;
        }

        report.tableResults.put("Land Submissions (ADD_LAND)",
                new TableResult(lands.size(), processed, skipped, GamificationService.XP_ADD_LAND));
        log.info("[ADD_LAND] " + processed + " awarded, " + skipped + " skipped (already done or missing userId)");
    }

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 2 — Land Approvals
    // ───────────────────────────────────────────────────────────────────────────

    private void processLandApprovals(BackfillReport report, boolean dryRun) {
        List<Land> approvedLands = landRepo.findAll().stream()
                .filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus()))
                .toList();
        int skipped = 0, processed = 0;

        for (Land land : approvedLands) {
            Long ownerId = land.getCreatedBy();
            if (ownerId == null) { skipped++; continue; }

            if (alreadyAwarded(ownerId, "LAND_APPROVED", land.getId())) {
                skipped++;
                continue;
            }

            String note = String.format("Land '%s' (id=%d) APPROVED → +%d XP (LAND_APPROVED) for user %d",
                    land.getTitle(), land.getId(), GamificationService.XP_LAND_APPROVED, ownerId);

            if (!dryRun) {
                safeAward(ownerId, "LAND_APPROVED", land.getId(), GamificationService.XP_LAND_APPROVED, report);
            }
            report.addDetail("LAND_APPROVED", note, dryRun);
            processed++;
        }

        report.tableResults.put("Land Approvals (LAND_APPROVED)",
                new TableResult(approvedLands.size(), processed, skipped, GamificationService.XP_LAND_APPROVED));
        log.info("[LAND_APPROVED] " + processed + " awarded, " + skipped + " skipped");
    }

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 3 — Plantation Starts
    // ───────────────────────────────────────────────────────────────────────────

    private void processPlantationStarts(BackfillReport report, boolean dryRun) {
        List<PlantationStart> starts = plantationStartRepo.findAll();
        int skipped = 0, processed = 0;

        for (PlantationStart ps : starts) {
            Long userId = ps.getUserId();
            if (userId == null) { skipped++; continue; }

            if (alreadyAwarded(userId, "START_PLANTATION", ps.getId())) {
                skipped++;
                continue;
            }

            String note = String.format("PlantationStart id=%d (land=%d) → +%d XP (START_PLANTATION) for user %d",
                    ps.getId(), ps.getLandId(), GamificationService.XP_START_PLANTATION, userId);

            if (!dryRun) {
                safeAward(userId, "START_PLANTATION", ps.getId(), GamificationService.XP_START_PLANTATION, report);
            }
            report.addDetail("START_PLANTATION", note, dryRun);
            processed++;
        }

        report.tableResults.put("Plantation Starts (START_PLANTATION)",
                new TableResult(starts.size(), processed, skipped, GamificationService.XP_START_PLANTATION));
        log.info("[START_PLANTATION] " + processed + " awarded, " + skipped + " skipped");
    }

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 4 — Plantation Completions
    // ───────────────────────────────────────────────────────────────────────────

    private void processPlantationCompletions(BackfillReport report, boolean dryRun) {
        List<PlantationCompletion> completions = completionRepo.findAll();
        int skipped = 0, processed = 0;

        for (PlantationCompletion pc : completions) {
            Long userId = pc.getUserId();
            if (userId == null) { skipped++; continue; }

            if (alreadyAwarded(userId, "COMPLETE_PLANTATION", pc.getId())) {
                skipped++;
                continue;
            }

            int trees = pc.getTreesPlanted() != null ? pc.getTreesPlanted() : 0;
            int xp    = GamificationService.XP_COMPLETE_PLANTATION + trees * GamificationService.XP_PER_TREE;

            String note = String.format("PlantationCompletion id=%d (land=%d, trees=%d) → +%d XP (COMPLETE_PLANTATION + %d per tree) for user %d",
                    pc.getId(), pc.getLandId(), trees, xp, GamificationService.XP_PER_TREE, userId);

            if (!dryRun) {
                safeAward(userId, "COMPLETE_PLANTATION", pc.getId(), xp, report);
            }
            report.addDetail("COMPLETE_PLANTATION", note, dryRun);
            processed++;
        }

        report.tableResults.put("Plantation Completions (COMPLETE_PLANTATION)",
                new TableResult(completions.size(), processed, skipped, GamificationService.XP_COMPLETE_PLANTATION));
        log.info("[COMPLETE_PLANTATION] " + processed + " awarded, " + skipped + " skipped");
    }

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 5 — Land Reviews
    // ───────────────────────────────────────────────────────────────────────────

    private void processLandReviews(BackfillReport report, boolean dryRun) {
        List<LandReview> reviews = reviewRepo.findAll();
        int skipped = 0, processed = 0;

        for (LandReview review : reviews) {
            Long userId = review.getUserId();
            if (userId == null) { skipped++; continue; }

            if (alreadyAwarded(userId, "ADD_REVIEW", review.getId())) {
                skipped++;
                continue;
            }

            String note = String.format("LandReview id=%d (land=%d) → +%d XP (ADD_REVIEW) for user %d",
                    review.getId(), review.getLandId(), GamificationService.XP_ADD_REVIEW, userId);

            if (!dryRun) {
                safeAward(userId, "ADD_REVIEW", review.getId(), GamificationService.XP_ADD_REVIEW, report);
            }
            report.addDetail("ADD_REVIEW", note, dryRun);
            processed++;
        }

        report.tableResults.put("Land Reviews (ADD_REVIEW)",
                new TableResult(reviews.size(), processed, skipped, GamificationService.XP_ADD_REVIEW));
        log.info("[ADD_REVIEW] " + processed + " awarded, " + skipped + " skipped");
    }

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 6 — Growth Updates
    // ───────────────────────────────────────────────────────────────────────────

    private void processGrowthUpdates(BackfillReport report, boolean dryRun) {
        List<GrowthUpdate> updates = growthUpdateRepo.findAll();
        int skipped = 0, processed = 0;

        for (GrowthUpdate gu : updates) {
            Long userId = gu.getUserId();
            if (userId == null) { skipped++; continue; }

            if (alreadyAwarded(userId, "GROWTH_UPDATE", gu.getId())) {
                skipped++;
                continue;
            }

            String note = String.format("GrowthUpdate id=%d (land=%d) → +%d XP (GROWTH_UPDATE) for user %d",
                    gu.getId(), gu.getLandId(), GamificationService.XP_GROWTH_UPDATE, userId);

            if (!dryRun) {
                safeAward(userId, "GROWTH_UPDATE", gu.getId(), GamificationService.XP_GROWTH_UPDATE, report);
            }
            report.addDetail("GROWTH_UPDATE", note, dryRun);
            processed++;
        }

        report.tableResults.put("Growth Updates (GROWTH_UPDATE)",
                new TableResult(updates.size(), processed, skipped, GamificationService.XP_GROWTH_UPDATE));
        log.info("[GROWTH_UPDATE] " + processed + " awarded, " + skipped + " skipped");
    }

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 7 — Badge re-check for all updated users
    // ───────────────────────────────────────────────────────────────────────────

    private void processBadgeChecks(BackfillReport report) {
        for (Long userId : report.usersUpdated) {
            try {
                List<String> newBadges = gamificationService.checkAndAwardBadges(userId, "BACKFILL");
                if (!newBadges.isEmpty()) {
                    report.newBadgesAwarded.addAll(newBadges.stream()
                            .map(b -> "User " + userId + " → 🏅 " + b)
                            .toList());
                    log.info("Badges awarded to user " + userId + ": " + newBadges);
                }
            } catch (Exception e) {
                log.warning("Badge check failed for user " + userId + ": " + e.getMessage());
            }
        }
        log.info("[BADGES] " + report.newBadgesAwarded.size() + " new badges awarded in backfill");
    }

    // ───────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────────────────────────────────

    /** Returns true if this exact record was already awarded XP (idempotency guard). */
    private boolean alreadyAwarded(Long userId, String action, Long referenceId) {
        return xpTxRepo.existsByUserIdAndActionAndReferenceId(userId, action, referenceId);
    }

    /** Awards XP and captures any exception so one failure doesn't abort the whole backfill. */
    private void safeAward(Long userId, String action, Long referenceId, int xp, BackfillReport report) {
        try {
            gamificationService.awardXp(userId, action, referenceId, xp);
            report.totalXpAwarded += xp;
            report.usersUpdated.add(userId);
        } catch (Exception e) {
            String err = "FAILED to award " + xp + " XP to user " + userId + " for " + action + " refId=" + referenceId + ": " + e.getMessage();
            log.warning(err);
            report.errors.add(err);
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // REPORT CLASSES
    // ───────────────────────────────────────────────────────────────────────────

    public static class BackfillReport {
        public final boolean  dryRun;
        public       int      totalXpAwarded = 0;
        public final Set<Long>            usersUpdated    = new LinkedHashSet<>();
        public final List<String>         errors          = new ArrayList<>();
        public final List<String>         newBadgesAwarded= new ArrayList<>();
        public final Map<String, TableResult> tableResults = new LinkedHashMap<>();
        public final Map<String, List<String>> details    = new LinkedHashMap<>();

        BackfillReport(boolean dryRun) { this.dryRun = dryRun; }

        void addDetail(String category, String message, boolean isDryRun) {
            details.computeIfAbsent(category, k -> new ArrayList<>())
                   .add((isDryRun ? "[DRY-RUN] " : "") + message);
        }
    }

    public record TableResult(int totalRecords, int processed, int skipped, int xpPerRecord) {}
}
