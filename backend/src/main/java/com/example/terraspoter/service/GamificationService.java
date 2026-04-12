/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Central gamification engine — awards XP, updates levels, checks badges,
              seeds badge definitions, and builds leaderboard data.
*/
package com.example.terraspoter.service;

import com.example.terraspoter.model.*;
import com.example.terraspoter.repository.*;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private static final Logger log = Logger.getLogger(GamificationService.class.getName());

    // XP constants
    public static final int XP_ADD_LAND            = 50;
    public static final int XP_LAND_APPROVED       = 100;
    public static final int XP_START_PLANTATION    = 75;
    public static final int XP_COMPLETE_PLANTATION = 200;
    public static final int XP_PER_TREE            = 5;
    public static final int XP_ADD_REVIEW          = 30;
    public static final int XP_GROWTH_UPDATE       = 25;
    public static final int XP_VERIFY_LAND         = 40;
    public static final int XP_STREAK_BONUS        = 50;
    public static final int XP_WELCOME             = 10;

    // Level thresholds — every 300 XP = 1 level
    private static final int XP_PER_LEVEL = 300;

    private final UserPointsRepository    userPointsRepo;
    private final UserBadgeRepository     userBadgeRepo;
    private final XpTransactionRepository xpTxRepo;
    private final BadgeRepository         badgeRepo;
    private final UserRepository          userRepo;
    private final PlantationCompletionRepository completionRepo;
    private final LandRepository          landRepo;

    // ───────────────────────────────────────────────────────────────────────────
    // BADGE SEEDING (runs on startup)
    // ───────────────────────────────────────────────────────────────────────────

    @PostConstruct
    @Transactional
    public void seedBadges() {
        seedBadge("Welcome",          "🌱", "WELCOME",              1,  "Joined TerraSpotter");
        seedBadge("Land Scout",       "🗺️", "ADD_LAND",             1,  "Submitted first land");
        seedBadge("Explorer",         "🧭", "ADD_LAND",             5,  "Submitted 5 lands");
        seedBadge("Territory Master", "🌍", "ADD_LAND",             15, "Submitted 15 lands");
        seedBadge("Verified Scout",   "✅", "LAND_APPROVED",        1,  "Got first land approved");
        seedBadge("Trusted Reporter", "🏆", "LAND_APPROVED",        5,  "Got 5 lands approved");
        seedBadge("Plantation Pioneer","🌱","START_PLANTATION",     1,  "Started first plantation");
        seedBadge("Tree Warrior",     "⚔️", "TOTAL_TREES",          50, "Planted 50 trees total");
        seedBadge("Forest Guardian",  "🌲", "TOTAL_TREES",          200,"Planted 200 trees total");
        seedBadge("Eco Legend",       "🏅", "TOTAL_TREES",          500,"Planted 500 trees total");
        seedBadge("Field Reviewer",   "📋", "ADD_REVIEW",           5,  "Submitted 5 reviews");
        seedBadge("Growth Tracker",   "📈", "GROWTH_UPDATE",        10, "Submitted 10 growth updates");
        seedBadge("Land Validator",   "🔍", "VERIFY_LAND",          10, "Verified 10 lands");
        seedBadge("Weekly Warrior",   "🔥", "STREAK",               7,  "Maintained a 7-day streak");
    }

    private void seedBadge(String name, String icon, String trigger, int threshold, String desc) {
        if (badgeRepo.findByName(name).isEmpty()) {
            Badge b = new Badge();
            b.setName(name);
            b.setIconCode(icon);
            b.setTriggerType(trigger);
            b.setThreshold(threshold);
            b.setDescription(desc);
            badgeRepo.save(b);
            log.info("Seeded badge: " + name);
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // AWARD XP
    // ───────────────────────────────────────────────────────────────────────────

    /**
     * Award XP to a user for a given action. Returns the XpTransaction persisted
     * so callers can read xpAwarded and leveledUp fields.
     */
    @Transactional
    public XpAwardResult awardXp(Long userId, String action, Long referenceId, int xp) {
        UserPoints up = userPointsRepo.findByUserId(userId)
                .orElseGet(() -> createUserPoints(userId));

        // Streak maintenance
        LocalDate today = LocalDate.now();
        boolean streakBroken = false;
        if (up.getLastActivityDate() != null) {
            long daysSince = today.toEpochDay() - up.getLastActivityDate().toEpochDay();
            if (daysSince > 1) {
                up.setStreak(0);
                streakBroken = true;
            } else if (daysSince == 1) {
                up.setStreak(up.getStreak() + 1);
            }
        } else {
            up.setStreak(1);
        }
        up.setLastActivityDate(today);

        // Streak bonus
        int bonusXp = 0;
        if (up.getStreak() > 0 && up.getStreak() % 7 == 0) {
            bonusXp = XP_STREAK_BONUS;
            logXp(userId, "STREAK_BONUS", XP_STREAK_BONUS, null, "🔥 7-Day Streak Bonus!");
        }

        // Apply XP
        int oldLevel = up.getLevel();
        int totalXp = up.getTotalXp() + xp + bonusXp;
        up.setTotalXp(totalXp);
        up.setLevel(calculateLevel(totalXp));
        userPointsRepo.save(up);

        XpTransaction tx = logXp(userId, action, xp, referenceId, labelFor(action, xp));

        // Badge checks
        List<String> newBadges = checkAndAwardBadges(userId, action);

        boolean leveledUp = up.getLevel() > oldLevel;
        return new XpAwardResult(xp + bonusXp, up.getLevel(), leveledUp, newBadges, tx);
    }

    private XpTransaction logXp(Long userId, String action, int xp, Long refId, String desc) {
        XpTransaction tx = new XpTransaction();
        tx.setUserId(userId);
        tx.setAction(action);
        tx.setXpAwarded(xp);
        tx.setReferenceId(refId);
        tx.setDescription(desc);
        return xpTxRepo.save(tx);
    }

    private UserPoints createUserPoints(Long userId) {
        UserPoints up = new UserPoints();
        up.setUserId(userId);
        up.setTotalXp(0);
        up.setLevel(1);
        up.setStreak(0);
        return userPointsRepo.save(up);
    }

    public static int calculateLevel(int totalXp) {
        return Math.max(1, (totalXp / XP_PER_LEVEL) + 1);
    }

    // ───────────────────────────────────────────────────────────────────────────
    // BADGE CHECKS
    // ───────────────────────────────────────────────────────────────────────────

    @Transactional
    public List<String> checkAndAwardBadges(Long userId, String action) {
        List<Badge> allBadges = badgeRepo.findAll();
        List<String> newly = new ArrayList<>();

        for (Badge badge : allBadges) {
            if (userBadgeRepo.existsByUserIdAndBadgeId(userId, badge.getId())) continue;

            boolean earned = false;
            String trigger = badge.getTriggerType();
            int threshold  = badge.getThreshold();

            switch (trigger) {
                case "WELCOME":
                    earned = true; // always on first action
                    break;
                case "ADD_LAND":
                    earned = xpTxRepo.countByUserIdAndAction(userId, "ADD_LAND") >= threshold;
                    break;
                case "LAND_APPROVED":
                    earned = xpTxRepo.countByUserIdAndAction(userId, "LAND_APPROVED") >= threshold;
                    break;
                case "START_PLANTATION":
                    earned = xpTxRepo.countByUserIdAndAction(userId, "START_PLANTATION") >= threshold;
                    break;
                case "TOTAL_TREES":
                    int totalTrees = totalTreesPlanted(userId);
                    earned = totalTrees >= threshold;
                    break;
                case "ADD_REVIEW":
                    earned = xpTxRepo.countByUserIdAndAction(userId, "ADD_REVIEW") >= threshold;
                    break;
                case "GROWTH_UPDATE":
                    earned = xpTxRepo.countByUserIdAndAction(userId, "GROWTH_UPDATE") >= threshold;
                    break;
                case "VERIFY_LAND":
                    earned = xpTxRepo.countByUserIdAndAction(userId, "VERIFY_LAND") >= threshold;
                    break;
                case "STREAK":
                    UserPoints up = userPointsRepo.findByUserId(userId).orElse(null);
                    earned = (up != null) && (up.getStreak() >= threshold);
                    break;
                default:
                    break;
            }

            if (earned) {
                UserBadge ub = new UserBadge();
                ub.setUserId(userId);
                ub.setBadgeId(badge.getId());
                userBadgeRepo.save(ub);
                newly.add(badge.getName());
                log.info("Badge earned by user " + userId + ": " + badge.getName());
            }
        }
        return newly;
    }

    private int totalTreesPlanted(Long userId) {
        return completionRepo.findAll().stream()
                .filter(c -> userId.equals(c.getUserId()) && c.getTreesPlanted() != null)
                .mapToInt(PlantationCompletion::getTreesPlanted)
                .sum();
    }

    // ───────────────────────────────────────────────────────────────────────────
    // USER PROGRESS DATA
    // ───────────────────────────────────────────────────────────────────────────

    public Map<String, Object> getUserProgress(Long userId) {
        UserPoints up = userPointsRepo.findByUserId(userId)
                .orElseGet(() -> createUserPoints(userId));

        int level   = up.getLevel();
        int xpForThisLevel   = (level - 1) * XP_PER_LEVEL;
        int xpForNextLevel   = level * XP_PER_LEVEL;
        int xpInCurrentLevel = up.getTotalXp() - xpForThisLevel;
        int xpNeeded         = xpForNextLevel - xpForThisLevel;

        // Earned badges — enrich with badge metadata
        List<UserBadge> earned = userBadgeRepo.findByUserId(userId);
        List<Badge> allBadges  = badgeRepo.findAll();
        Map<Long, Badge> badgeMap = allBadges.stream()
                .collect(Collectors.toMap(Badge::getId, b -> b));

        List<Map<String, Object>> enrichedBadges = earned.stream().map(ub -> {
            Badge b = badgeMap.get(ub.getBadgeId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name",        b != null ? b.getName()        : "Unknown");
            m.put("icon",        b != null ? b.getIconCode()     : "🏅");
            m.put("description", b != null ? b.getDescription()  : "");
            m.put("earnedAt",    ub.getEarnedAt());
            return m;
        }).collect(Collectors.toList());

        // All badges (for gallery — earned / not earned)
        List<Map<String, Object>> allBadgeInfo = allBadges.stream().map(b -> {
            boolean isEarned = earned.stream().anyMatch(ub -> ub.getBadgeId().equals(b.getId()));
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          b.getId());
            m.put("name",        b.getName());
            m.put("icon",        b.getIconCode());
            m.put("description", b.getDescription());
            m.put("earned",      isEarned);
            return m;
        }).collect(Collectors.toList());

        // Recent transactions
        List<XpTransaction> recent = xpTxRepo.findTop10ByUserIdOrderByCreatedAtDesc(userId);

        // Rank
        List<UserPoints> all = userPointsRepo.findTopByXp();
        int rank = 1;
        for (UserPoints u : all) {
            if (u.getUserId().equals(userId)) break;
            rank++;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalXp",         up.getTotalXp());
        result.put("level",           level);
        result.put("xpInCurrentLevel",xpInCurrentLevel);
        result.put("xpNeeded",        xpNeeded);
        result.put("xpProgress",      (xpNeeded > 0) ? (int)(((double) xpInCurrentLevel / xpNeeded) * 100) : 100);
        result.put("streak",          up.getStreak());
        result.put("rank",            rank);
        result.put("badgeCount",      earned.size());
        result.put("earnedBadges",    enrichedBadges);
        result.put("allBadges",       allBadgeInfo);
        result.put("recentTransactions", recent);
        return result;
    }

    // ───────────────────────────────────────────────────────────────────────────
    // LEADERBOARD
    // ───────────────────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getLeaderboard(int limit) {
        List<UserPoints> all = userPointsRepo.findTopByXp();
        List<Map<String, Object>> board = new ArrayList<>();

        int rank = 1;
        for (UserPoints up : all) {
            if (rank > limit) break;
            User user = userRepo.findById(up.getUserId()).orElse(null);
            if (user == null) { rank++; continue; }

            long badgeCount = userBadgeRepo.countByUserId(up.getUserId());

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rank",       rank);
            row.put("userId",     up.getUserId());
            row.put("name",       user.getFname() + " " + user.getLname());
            row.put("initials",   String.valueOf(user.getFname() != null && !user.getFname().isEmpty() ? user.getFname().charAt(0) : '?')
                              + String.valueOf(user.getLname() != null && !user.getLname().isEmpty() ? user.getLname().charAt(0) : '?'));
            row.put("totalXp",    up.getTotalXp());
            row.put("level",      up.getLevel());
            row.put("streak",     up.getStreak());
            row.put("badgeCount", badgeCount);
            board.add(row);
            rank++;
        }
        return board;
    }

    // ───────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────────────────────────────────

    private String labelFor(String action, int xp) {
        return switch (action) {
            case "ADD_LAND"            -> "🗺️ Land Submitted";
            case "LAND_APPROVED"       -> "✅ Land Approved";
            case "START_PLANTATION"    -> "🌱 Plantation Started";
            case "COMPLETE_PLANTATION" -> "🌳 Plantation Completed";
            case "ADD_REVIEW"          -> "📋 Review Added";
            case "GROWTH_UPDATE"       -> "📈 Growth Update Shared";
            case "VERIFY_LAND"         -> "🔍 Land Verified";
            case "WELCOME"             -> "🌱 Welcome to TerraSpotter!";
            default                    -> action.replace("_", " ");
        };
    }

    // ───────────────────────────────────────────────────────────────────────────
    // RESULT RECORD
    // ───────────────────────────────────────────────────────────────────────────

    public record XpAwardResult(
            int xpAwarded,
            int newLevel,
            boolean leveledUp,
            List<String> newBadges,
            XpTransaction transaction
    ) {}
}
