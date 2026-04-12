/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Business logic for lands, images, recommendations, ML integrations, and gamification hooks.
*/
package com.example.terraspoter.service;

import com.example.terraspoter.model.*;
import com.example.terraspoter.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LandService {

    private static final Logger logger = Logger.getLogger(LandService.class.getName());

    @Value("${ML_API_URL}")
    private String mlApiBaseUrl;

    @Value("${ml.api.timeout:10}")
    private int mlApiTimeoutSeconds;

    private static final String OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
    private static final String OPEN_METEO_ARCHIVE  = "https://archive-api.open-meteo.com/v1/archive";

    private final LandRepository                      landRepository;
    private final LandImageRepository                 landImageRepository;
    private final LandRecommendationRepository        recommendationRepository;
    private final PlantationStartRepository           plantationStartRepository;
    private final PlantationCompletionRepository      completionRepository;
    private final PlantationCompletionImageRepository completionImageRepository;
    private final LandReviewRepository                reviewRepository;
    private final UserRepository                      userRepository;
    private final ObjectMapper                        objectMapper;
    private final CloudinaryService                   cloudinaryService;
    private final BrevoEmailService                   emailService;
    private final GamificationService                 gamificationService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    // LAND CRUD

    public List<Land> getAllLands() { return landRepository.findAll(); }

    public List<Land> getLandsByUser(Long userId) {
        return landRepository.findByCreatedBy(userId);
    }

    public Land getLandById(Long id) {
        Land land = landRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Land not found: " + id));

        // attach latest plantation start details
        plantationStartRepository
                .findTopByLandIdOrderByCreatedAtDesc(id)
                .ifPresent(ps -> {
                    Land.PlantationStartDetail dto = new Land.PlantationStartDetail();
                    dto.setTeamSize(ps.getTeamSize());
                    dto.setTreesToPlant(ps.getTreesToPlant());
                    dto.setMethod(ps.getMethod());
                    dto.setPlannedDate(ps.getPlannedDate());
                    land.setPlantationDetail(dto);
                });

        // attach latest completion details
        completionRepository
                .findTopByLandIdOrderByCreatedAtDesc(id)
                .ifPresent(pc -> {
                    Land.PlantationDoneDetail dto = new Land.PlantationDoneDetail();
                    dto.setTreesPlanted(pc.getTreesPlanted());
                    dto.setMoreCapacity(pc.getMoreCapacity());
                    dto.setNotes(pc.getNotes());
                    land.setCompletionDetail(dto);
                    land.setRemainingCapacity(pc.getMoreCapacity());
                });

        // aggregate all completions for this land
        List<PlantationCompletion> allCompletions =
                completionRepository.findByLandIdOrderByCreatedAtDesc(id);

        int totalTrees = allCompletions.stream()
                .mapToInt(c -> c.getTreesPlanted() != null ? c.getTreesPlanted() : 0)
                .sum();
        land.setTotalTreesPlanted(totalTrees);
        land.setTotalRounds(allCompletions.size());

        return land;
    }

    public Land saveLand(Map<String, Object> payload, Long userId) {
        Land land = buildLandFromPayload(payload, userId);
        Land saved = landRepository.save(land);
        fetchAndSaveRecommendations(saved);

        // Send Email
        userRepository.findById(userId).ifPresent(u ->
            emailService.sendLandReportedEmail(u.getEmail(), u.getFname(), saved.getTitle())
        );

        // Gamification — award XP for submitting a land
        try {
            gamificationService.awardXp(userId, "ADD_LAND", saved.getId(), GamificationService.XP_ADD_LAND);
        } catch (Exception e) {
            logger.warning("Gamification award failed for ADD_LAND userId=" + userId + ": " + e.getMessage());
        }

        return saved;
    }

    // IMAGES — Cloudinary

    public void saveImages(Long landId, List<MultipartFile> files) throws IOException {
        for (MultipartFile file : files) {
            String imageUrl = cloudinaryService.uploadImage(file, "terraspotter/lands");
            LandImage img = new LandImage();
            img.setLandId(landId);
            img.setImageUrl(imageUrl);
            landImageRepository.save(img);
            logger.info("Land #" + landId + " image uploaded → " + imageUrl);
        }
    }

    public List<LandImage> getImagesByLandId(Long landId) {
        return landImageRepository.findByLandId(landId);
    }

    // PLANTATION START

    public Land startPlantation(Long landId,
                                Map<String, Object> payload,
                                Long userId) {

        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new RuntimeException("Land not found: " + landId));

        String current = land.getLandStatus();
        if ("Under Plantation".equals(current) || "Plantation Complete".equals(current))
            throw new RuntimeException("Land is already " + current);

        PlantationStart ps = new PlantationStart();
        ps.setLandId(landId);
        ps.setUserId(userId);
        ps.setPlannedDate(LocalDate.parse((String) payload.get("plannedDate")));
        ps.setTeamSize(Integer.valueOf(payload.get("teamSize").toString()));
        ps.setTreesToPlant(Integer.valueOf(payload.get("treesToPlant").toString()));
        ps.setMethod((String) payload.get("method"));
        ps.setNotes((String) payload.get("notes"));
        plantationStartRepository.save(ps);

        land.setLandStatus("Under Plantation");
        land.setPlantationUserId(userId);
        Land updatedLand = landRepository.save(land);

        // Send Email
        userRepository.findById(userId).ifPresent(u ->
            emailService.sendPlantationStartedEmail(u.getEmail(), u.getFname(), updatedLand.getTitle())
        );

        // Gamification — award XP for starting a plantation
        try {
            gamificationService.awardXp(userId, "START_PLANTATION", landId, GamificationService.XP_START_PLANTATION);
        } catch (Exception e) {
            logger.warning("Gamification award failed for START_PLANTATION userId=" + userId + ": " + e.getMessage());
        }

        return updatedLand;
    }

    // PLANTATION COMPLETE — Cloudinary for proof images

    public Land completePlantation(Long landId,
                                   Integer treesPlanted,
                                   Integer moreCapacity,
                                   String notes,
                                   List<MultipartFile> images,
                                   Long userId) throws IOException {

        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new RuntimeException("Land not found: " + landId));

        if (!userId.equals(land.getPlantationUserId()))
            throw new RuntimeException("Not authorised to complete this plantation");

        // save completion record
        PlantationCompletion pc = new PlantationCompletion();
        pc.setLandId(landId);
        pc.setUserId(userId);
        pc.setTreesPlanted(treesPlanted);
        pc.setMoreCapacity(moreCapacity);
        pc.setNotes(notes);
        PlantationCompletion saved = completionRepository.save(pc);

        // upload proof images to Cloudinary under terraspotter/completions/
        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {
                String imageUrl = cloudinaryService.uploadImage(file, "terraspotter/completions");
                PlantationCompletionImage img = new PlantationCompletionImage();
//                img.setCompletionId(saved.getId());
                //errorBackup
                img.setCompletionId(saved);
                img.setImageUrl(imageUrl);
                completionImageRepository.save(img);
                logger.info("Completion #" + saved.getId() + " proof image → " + imageUrl);
            }
        }

        // reset land for next round
        land.setLandStatus("Vacant");
        land.setPlantationUserId(null);
        Land updatedLand = landRepository.save(land);

        // Send Email
        userRepository.findById(userId).ifPresent(u ->
            emailService.sendPlantationCompletedEmail(u.getEmail(), u.getFname(), updatedLand.getTitle(), treesPlanted)
        );

        // Gamification — award XP for completing a plantation (base + per-tree bonus)
        try {
            int xpTotal = GamificationService.XP_COMPLETE_PLANTATION
                    + (treesPlanted != null ? treesPlanted * GamificationService.XP_PER_TREE : 0);
            gamificationService.awardXp(userId, "COMPLETE_PLANTATION", landId, xpTotal);
        } catch (Exception e) {
            logger.warning("Gamification award failed for COMPLETE_PLANTATION userId=" + userId + ": " + e.getMessage());
        }

        return updatedLand;
    }

    // Reviews

    public List<LandReview> getReviews(Long landId) {
        List<LandReview> reviews = reviewRepository.findByLandIdOrderByCreatedAtDesc(landId);
        reviews.forEach(r ->
                userRepository.findById(r.getUserId()).ifPresent(u ->
                        r.setUserName(u.getFname() + " " + u.getLname())
                )
        );
        return reviews;
    }

    public LandReview addReview(Long landId,
                                Map<String, Object> payload,
                                Long userId) {

        LandReview review = reviewRepository
                .findByLandIdAndUserId(landId, userId)
                .orElse(new LandReview());

        review.setLandId(landId);
        review.setUserId(userId);
        review.setRating(Integer.valueOf(payload.get("rating").toString()));
        review.setFeasibilityNote((String) payload.get("feasibilityNote"));
        review.setPermissionNote((String) payload.get("permissionNote"));
        review.setBody((String) payload.get("body"));

        LandReview saved = reviewRepository.save(review);

        userRepository.findById(userId).ifPresent(u ->
                saved.setUserName(u.getFname() + " " + u.getLname())
        );

        // Gamification — award XP for adding a review
        try {
            gamificationService.awardXp(userId, "ADD_REVIEW", landId, GamificationService.XP_ADD_REVIEW);
        } catch (Exception e) {
            logger.warning("Gamification award failed for ADD_REVIEW userId=" + userId + ": " + e.getMessage());
        }

        return saved;
    }

    // Recommendations

    @Transactional
    public List<LandRecommendation> refreshRecommendations(Long landId) throws IOException {
        Land land = getLandById(landId);
        logger.info("Refreshing recommendations for land #" + landId);

        recommendationRepository.deleteByLandId(landId);

        MlInputParams params = resolveMlParamsFromApis(land);
        logger.info(String.format(
                "Resolved params for land #%d → temp=%.1f°C  rainfall=%.0fmm  soil=%s  climate=%s",
                landId, params.temp, params.rainfall, params.soil, params.climate));

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(buildMlUrl(params)))
                .timeout(Duration.ofSeconds(mlApiTimeoutSeconds))
                .GET().build();

        HttpResponse<String> resp;
        try {
            resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("ML API request interrupted", e);
        }

        if (resp.statusCode() != 200)
            throw new IOException("ML API returned HTTP " + resp.statusCode() + ": " + resp.body());

        List<LandRecommendation> fresh = parseAndBuildRecommendations(landId, resp.body());
        if (fresh.isEmpty()) {
            logger.warning("ML returned empty — using fallback for land #" + landId);
            saveFallbackRecommendations(landId);
        } else {
            recommendationRepository.saveAll(fresh);
            logger.info("Persisted " + fresh.size() + " recommendations for land #" + landId);
        }

        return recommendationRepository.findByLandId(landId);
    }

    // Open-Meteo + ML pipeline

    private MlInputParams resolveMlParamsFromApis(Land land) {
        double lat = (land.getCentroidLat() != null) ? land.getCentroidLat() : 18.4088;
        double lng = (land.getCentroidLng() != null) ? land.getCentroidLng() : 76.5604;
        double temp     = fetchMeanTemperature(lat, lng);
        double rainfall = fetchAnnualRainfall(lat, lng);
        String soil     = resolveSoilType(land, lat, lng);
        String climate  = deriveClimateZone(temp, rainfall);
        return new MlInputParams(temp, rainfall, soil, climate);
    }

    private double fetchMeanTemperature(double lat, double lng) {
        String url = String.format(
                "%s?latitude=%.4f&longitude=%.4f" +
                        "&daily=temperature_2m_max,temperature_2m_min" +
                        "&forecast_days=7&timezone=auto",
                OPEN_METEO_FORECAST, lat, lng);
        try {
            JsonNode root   = objectMapper.readTree(httpGet(url));
            JsonNode maxArr = root.path("daily").path("temperature_2m_max");
            JsonNode minArr = root.path("daily").path("temperature_2m_min");
            if (!maxArr.isArray() || maxArr.isEmpty()) return 28.0;
            double sum = 0; int count = 0;
            for (int i = 0; i < maxArr.size(); i++) {
                double hi = maxArr.get(i).asDouble(Double.NaN);
                double lo = minArr.get(i).asDouble(Double.NaN);
                if (!Double.isNaN(hi) && !Double.isNaN(lo)) { sum += (hi + lo) / 2.0; count++; }
            }
            double mean = (count > 0) ? Math.round((sum / count) * 10.0) / 10.0 : 28.0;
            logger.info(String.format("Open-Meteo temp → %.1f°C (mean of %d days)", mean, count));
            return mean;
        } catch (Exception e) {
            logger.log(Level.WARNING, "fetchMeanTemperature failed — defaulting to 28.0°C: " + e.getMessage());
            return 28.0;
        }
    }

    private double fetchAnnualRainfall(double lat, double lng) {
        LocalDate today   = LocalDate.now();
        LocalDate yearAgo = today.minusDays(365);
        String url = String.format(
                "%s?latitude=%.4f&longitude=%.4f" +
                        "&start_date=%s&end_date=%s" +
                        "&daily=precipitation_sum&timezone=auto",
                OPEN_METEO_ARCHIVE, lat, lng, yearAgo, today.minusDays(1));
        try {
            JsonNode root      = objectMapper.readTree(httpGet(url));
            JsonNode precipArr = root.path("daily").path("precipitation_sum");
            if (!precipArr.isArray() || precipArr.isEmpty()) return 1000.0;
            double total = StreamSupport
                    .stream(precipArr.spliterator(), false)
                    .filter(n -> !n.isNull())
                    .mapToDouble(n -> n.asDouble(0.0))
                    .sum();
            double rounded = Math.round(total);
            logger.info(String.format("Open-Meteo archive → %.0f mm annual rainfall (%d days)",
                    rounded, precipArr.size()));
            return rounded;
        } catch (Exception e) {
            logger.log(Level.WARNING, "fetchAnnualRainfall failed — defaulting to 1000mm: " + e.getMessage());
            return 1000.0;
        }
    }

    private String resolveSoilType(Land land, double lat, double lng) {
        String fromStatus = extractSoilKeyword(land.getLandStatus());
        if (fromStatus != null) return fromStatus;
        String fromNotes = extractSoilKeyword(land.getNotes());
        if (fromNotes != null) return fromNotes;
        String url = String.format(
                "%s?latitude=%.4f&longitude=%.4f" +
                        "&hourly=soil_moisture_0_to_7cm" +
                        "&forecast_days=1&timezone=auto",
                OPEN_METEO_FORECAST, lat, lng);
        try {
            JsonNode root     = objectMapper.readTree(httpGet(url));
            JsonNode moistArr = root.path("hourly").path("soil_moisture_0_to_7cm");
            if (!moistArr.isArray() || moistArr.isEmpty()) return "loamy";
            double sum = 0; int count = 0;
            for (JsonNode v : moistArr) {
                if (!v.isNull()) { sum += v.asDouble(); count++; }
            }
            double avg = (count > 0) ? sum / count : 0.20;
            if      (avg < 0.15) return "sandy";
            else if (avg < 0.30) return "loamy";
            else                 return "clay";
        } catch (Exception e) {
            logger.log(Level.WARNING, "resolveSoilType API call failed — defaulting to loamy: " + e.getMessage());
            return "loamy";
        }
    }

    private String extractSoilKeyword(String text) {
        if (text == null || text.isBlank()) return null;
        String t = text.toLowerCase();
        if (t.contains("sand"))                                    return "sandy";
        if (t.contains("clay") || t.contains("black cotton"))     return "clay";
        if (t.contains("loam") || t.contains("silt")
                || t.contains("alluvial") || t.contains("red soil")) return "loamy";
        return null;
    }

    private String deriveClimateZone(double meanTemp, double annualRainfall) {
        if      (annualRainfall < 400) return "arid";
        else if (annualRainfall < 800) return "semi-arid";
        else if (meanTemp < 18.0)      return "temperate";
        else                           return "tropical";
    }

    @Transactional
    private void fetchAndSaveRecommendations(Land land) {
        try {
            MlInputParams params = resolveMlParamsFromApis(land);
            HttpResponse<String> resp = httpClient.send(
                    HttpRequest.newBuilder()
                            .uri(URI.create(buildMlUrl(params)))
                            .timeout(Duration.ofSeconds(mlApiTimeoutSeconds))
                            .GET().build(),
                    HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() != 200) {
                saveFallbackRecommendations(land.getId());
                return;
            }
            List<LandRecommendation> recs =
                    parseAndBuildRecommendations(land.getId(), resp.body());
            if (recs.isEmpty()) saveFallbackRecommendations(land.getId());
            else recommendationRepository.saveAll(recs);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            saveFallbackRecommendations(land.getId());
        } catch (Exception e) {
            logger.log(Level.WARNING,
                    "ML call failed for land #" + land.getId() + ": " + e.getMessage(), e);
            saveFallbackRecommendations(land.getId());
        }
    }

    private String buildMlUrl(MlInputParams p) {
        return mlApiBaseUrl + "/predict"
                + "?temp="     + p.temp
                + "&rainfall=" + p.rainfall
                + "&soil="     + URLEncoder.encode(p.soil,    StandardCharsets.UTF_8)
                + "&climate="  + URLEncoder.encode(p.climate, StandardCharsets.UTF_8);
    }

    private List<LandRecommendation> parseAndBuildRecommendations(
            Long landId, String json) throws IOException {
        JsonNode root = objectMapper.readTree(json);
        JsonNode arr  = root.path("recommendations");
        if (arr.isMissingNode() || !arr.isArray())
            throw new IOException("Missing 'recommendations' array in ML response");
        List<LandRecommendation> out = new ArrayList<>();
        for (JsonNode rec : arr) {
            String treeName   = rec.path("tree").asText(null);
            double confidence = rec.path("confidence").asDouble(0.0);
            List<String> parts = new ArrayList<>();
            rec.path("reasons").forEach(r -> parts.add(r.asText()));
            if (treeName == null || treeName.isBlank()) continue;
            LandRecommendation e = new LandRecommendation();
            e.setLandId(landId);
            e.setPlantName(treeName);
            e.setSuitabilityScore(confidence);
            e.setReason(String.join(" | ", parts));
            out.add(e);
        }
        return out;
    }

    private void saveFallbackRecommendations(Long landId) {
        try {
            recommendationRepository.saveAll(List.of(
                    createRec(landId, "Neem",    0.70, "Drought resistant | Widely adaptable"),
                    createRec(landId, "Moringa", 0.65, "Fast growing | Nutritional value"),
                    createRec(landId, "Peepal",  0.60, "Shade tree | Low maintenance")
            ));
        } catch (Exception ex) {
            logger.log(Level.SEVERE, "Could not save fallback recs for land #" + landId, ex);
        }
    }

    private LandRecommendation createRec(Long id, String name, double score, String reason) {
        LandRecommendation r = new LandRecommendation();
        r.setLandId(id); r.setPlantName(name);
        r.setSuitabilityScore(score); r.setReason(reason);
        return r;
    }

    private String httpGet(String url) throws IOException, InterruptedException {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("User-Agent", "TerraSpoter/1.0")
                .GET().build();
        HttpResponse<String> resp =
                httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200)
            throw new IOException("HTTP " + resp.statusCode() + " from: " + url);
        return resp.body();
    }

    @SuppressWarnings("unchecked")
    private Land buildLandFromPayload(Map<String, Object> payload, Long userId) {
        Land land = new Land();
        land.setTitle((String) payload.get("title"));
        land.setDescription((String) payload.get("description"));
        try {
            land.setPolygonCoords(
                    objectMapper.writeValueAsString(payload.get("polygonCoords")));
        } catch (Exception e) {
            throw new RuntimeException("Invalid polygonCoords: " + e.getMessage());
        }
        Map<String, Object> centroid = (Map<String, Object>) payload.get("centroid");
        land.setCentroidLat(Double.valueOf(centroid.get("lat").toString()));
        land.setCentroidLng(Double.valueOf(centroid.get("lng").toString()));
        land.setAreaSqm(Double.valueOf(payload.get("areaSqm").toString()));

        Map<String, String> owner = (Map<String, String>) payload.get("owner");
        land.setOwnerName(owner.get("name"));
        land.setOwnerPhone(owner.get("phone"));
        land.setOwnershipType(owner.get("ownershipType"));
        land.setPermissionStatus(owner.get("permission"));

        Map<String, String> landData = (Map<String, String>) payload.get("land");
        land.setLandStatus(landData.get("status"));
        land.setWaterAvailable(landData.get("waterAvailable"));
        land.setWaterFrequency(landData.get("waterFrequency"));
        land.setNotes(landData.get("notes"));
        land.setAccessRoad(landData.get("accessRoad"));
        land.setSoilType(landData.get("soilType"));
        land.setNearbyLandmark(landData.get("nearbyLandmark"));

        land.setCreatedBy(userId);
        return land;
    }

    private static class MlInputParams {
        final double temp, rainfall;
        final String soil, climate;
        MlInputParams(double temp, double rainfall, String soil, String climate) {
            this.temp = temp; this.rainfall = rainfall;
            this.soil = soil; this.climate  = climate;
        }
        @Override
        public String toString() {
            return String.format("temp=%.1f°C  rainfall=%.0fmm  soil=%s  climate=%s",
                    temp, rainfall, soil, climate);
        }
    }
}