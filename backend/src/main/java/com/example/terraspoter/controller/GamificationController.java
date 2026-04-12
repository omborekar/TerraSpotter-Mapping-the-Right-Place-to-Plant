/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: REST endpoints exposing gamification data — user progress, leaderboard,
              badge catalogue, and admin backfill trigger.
*/
package com.example.terraspoter.controller;

import com.example.terraspoter.model.Badge;
import com.example.terraspoter.repository.BadgeRepository;
import com.example.terraspoter.service.GamificationBackfillService;
import com.example.terraspoter.service.GamificationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService         gamificationService;
    private final GamificationBackfillService backfillService;
    private final BadgeRepository             badgeRepository;

    /**
     * Returns the current authenticated user's XP, level, streak, rank, badges,
     * and recent XP transaction history.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProgress(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));

        Map<String, Object> progress = gamificationService.getUserProgress(userId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Returns a ranked leaderboard of the top 20 users by total XP.
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(gamificationService.getLeaderboard(Math.min(limit, 50)));
    }

    /**
     * Returns all badge definitions (catalogue) for display in the badge gallery.
     */
    @GetMapping("/badges")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeRepository.findAll());
    }

    // ─── ADMIN: Backfill ──────────────────────────────────────────────────────

    /**
     * DRY-RUN preview — shows what the backfill WOULD do without writing anything.
     * GET /api/gamification/admin/backfill/preview
     */
    @GetMapping("/admin/backfill/preview")
    public ResponseEntity<?> previewBackfill(HttpSession session) {
        // Basic admin check — adjust to match your actual role system
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));

        GamificationBackfillService.BackfillReport report = backfillService.run(true);
        return ResponseEntity.ok(buildReportResponse(report));
    }

    /**
     * EXECUTE the backfill — scans all existing data tables and awards missing XP + badges.
     * POST /api/gamification/admin/backfill/run
     * Safe to call multiple times — idempotent.
     */
    @PostMapping("/admin/backfill/run")
    public ResponseEntity<?> runBackfill(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));

        GamificationBackfillService.BackfillReport report = backfillService.run(false);
        return ResponseEntity.ok(buildReportResponse(report));
    }

    private Map<String, Object> buildReportResponse(GamificationBackfillService.BackfillReport report) {
        return Map.of(
            "dryRun",          report.dryRun,
            "totalXpAwarded",  report.totalXpAwarded,
            "usersUpdated",    report.usersUpdated.size(),
            "newBadgesAwarded",report.newBadgesAwarded.size(),
            "badgeDetails",    report.newBadgesAwarded,
            "errors",          report.errors,
            "tableResults",    report.tableResults,
            "details",         report.details
        );
    }
}

