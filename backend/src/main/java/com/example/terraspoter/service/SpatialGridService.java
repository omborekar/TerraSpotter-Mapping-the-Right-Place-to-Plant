package com.example.terraspoter.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class SpatialGridService {

    private static final Logger logger = Logger.getLogger(SpatialGridService.class.getName());
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Standard spacing between trees in meters
    private static final double DEFAULT_SPACING_METERS = 3.0;

    static class Point {
        double x;
        double y;
        Point(double x, double y) { this.x = x; this.y = y; }
    }

    /**
     * Calculates how many trees can fit in the given polygon coordinates
     * using a Ray-Casting Point-in-Polygon algorithm over a spatial grid.
     */
    public int estimateTreeCapacity(String polygonCoordsJson) {
        if (polygonCoordsJson == null || polygonCoordsJson.trim().isEmpty()) {
            return 0;
        }

        try {
            // Parse JSON "[{"lat": 18.4, "lng": 76.5}, ...]"
            List<Map<String, Double>> coords = objectMapper.readValue(
                    polygonCoordsJson, new TypeReference<List<Map<String, Double>>>() {});

            if (coords.size() < 3) return 0; // Not a valid polygon

            // Convert lat/lng to local meter coordinates (relative to the first point)
            double originLat = coords.get(0).get("lat");
            double originLng = coords.get(0).get("lng");
            double metersPerLat = 111320.0; // Approximation of meters per degree of latitude
            double metersPerLng = 111320.0 * Math.cos(Math.toRadians(originLat)); // Accounts for longitude convergence

            List<Point> polygon = new ArrayList<>();
            double minX = Double.MAX_VALUE, maxX = -Double.MAX_VALUE;
            double minY = Double.MAX_VALUE, maxY = -Double.MAX_VALUE;

            for (Map<String, Double> c : coords) {
                // Ignore empty or invalid coordinate points if any
                if(c.get("lat") == null || c.get("lng") == null) continue;
                
                double x = (c.get("lng") - originLng) * metersPerLng;
                double y = (c.get("lat") - originLat) * metersPerLat;
                polygon.add(new Point(x, y));

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }

            if (polygon.size() < 3) return 0;

            // Iterate over the bounding box in increments of DEFAULT_SPACING_METERS
            int capacity = 0;
            for (double x = minX; x <= maxX; x += DEFAULT_SPACING_METERS) {
                for (double y = minY; y <= maxY; y += DEFAULT_SPACING_METERS) {
                    if (isPointInPolygon(new Point(x, y), polygon)) {
                        capacity++;
                    }
                }
            }

            logger.info("Spatial Grid Algorithm estimated capacity: " + capacity + " trees.");
            return capacity;

        } catch (Exception e) {
            logger.warning("Failed to estimate tree capacity: " + e.getMessage());
            return 0; // Fallback
        }
    }

    /**
     * Ray-Casting algorithm to check if a point is strictly inside a polygon.
     */
    private boolean isPointInPolygon(Point p, List<Point> polygon) {
        boolean inside = false;
        for (int i = 0, j = polygon.size() - 1; i < polygon.size(); j = i++) {
            Point pi = polygon.get(i);
            Point pj = polygon.get(j);

            // Check if ray crosses the line segment connecting pi and pj
            boolean intersect = ((pi.y > p.y) != (pj.y > p.y))
                    && (p.x < (pj.x - pi.x) * (p.y - pi.y) / (pj.y - pi.y) + pi.x);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }
}
