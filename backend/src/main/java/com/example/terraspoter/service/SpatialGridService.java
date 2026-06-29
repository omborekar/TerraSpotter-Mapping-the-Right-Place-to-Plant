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

    /**
     * Checks if two JSON polygons overlap spatially.
     */
    public boolean checkOverlap(String polyCoordsJsonA, String polyCoordsJsonB) {
        if (polyCoordsJsonA == null || polyCoordsJsonB == null || polyCoordsJsonA.trim().isEmpty() || polyCoordsJsonB.trim().isEmpty()) {
            return false;
        }
        try {
            List<Map<String, Double>> coordsA = objectMapper.readValue(
                    polyCoordsJsonA, new TypeReference<List<Map<String, Double>>>() {});
            List<Map<String, Double>> coordsB = objectMapper.readValue(
                    polyCoordsJsonB, new TypeReference<List<Map<String, Double>>>() {});

            if (coordsA.size() < 3 || coordsB.size() < 3) return false;

            // 1. Check Bounding Box overlap
            double minLatA = Double.MAX_VALUE, maxLatA = -Double.MAX_VALUE;
            double minLngA = Double.MAX_VALUE, maxLngA = -Double.MAX_VALUE;
            for (Map<String, Double> c : coordsA) {
                if (c.get("lat") == null || c.get("lng") == null) continue;
                minLatA = Math.min(minLatA, c.get("lat"));
                maxLatA = Math.max(maxLatA, c.get("lat"));
                minLngA = Math.min(minLngA, c.get("lng"));
                maxLngA = Math.max(maxLngA, c.get("lng"));
            }

            double minLatB = Double.MAX_VALUE, maxLatB = -Double.MAX_VALUE;
            double minLngB = Double.MAX_VALUE, maxLngB = -Double.MAX_VALUE;
            for (Map<String, Double> c : coordsB) {
                if (c.get("lat") == null || c.get("lng") == null) continue;
                minLatB = Math.min(minLatB, c.get("lat"));
                maxLatB = Math.max(maxLatB, c.get("lat"));
                minLngB = Math.min(minLngB, c.get("lng"));
                maxLngB = Math.max(maxLngB, c.get("lng"));
            }

            // Bbox check
            if (minLatA > maxLatB || maxLatA < minLatB || minLngA > maxLngB || maxLngA < minLngB) {
                return false;
            }

            // Convert to Local Points for accurate containment & edge checks
            List<Point> polyA = new ArrayList<>();
            double originLat = coordsA.get(0).get("lat");
            double originLng = coordsA.get(0).get("lng");
            double metersPerLat = 111320.0;
            double metersPerLng = 111320.0 * Math.cos(Math.toRadians(originLat));

            for (Map<String, Double> c : coordsA) {
                if (c.get("lat") == null || c.get("lng") == null) continue;
                polyA.add(new Point((c.get("lng") - originLng) * metersPerLng, (c.get("lat") - originLat) * metersPerLat));
            }

            List<Point> polyB = new ArrayList<>();
            for (Map<String, Double> c : coordsB) {
                if (c.get("lat") == null || c.get("lng") == null) continue;
                polyB.add(new Point((c.get("lng") - originLng) * metersPerLng, (c.get("lat") - originLat) * metersPerLat));
            }

            if (polyA.size() < 3 || polyB.size() < 3) return false;

            // 2. Check if any point of A is in B
            for (Point p : polyA) {
                if (isPointInPolygon(p, polyB)) return true;
            }

            // 3. Check if any point of B is in A
            for (Point p : polyB) {
                if (isPointInPolygon(p, polyA)) return true;
            }

            // 4. Check if any edge of A intersects any edge of B
            for (int i = 0; i < polyA.size(); i++) {
                Point a1 = polyA.get(i);
                Point a2 = polyA.get((i + 1) % polyA.size());
                for (int j = 0; j < polyB.size(); j++) {
                    Point b1 = polyB.get(j);
                    Point b2 = polyB.get((j + 1) % polyB.size());
                    if (linesIntersect(a1, a2, b1, b2)) return true;
                }
            }

            return false;
        } catch (Exception e) {
            logger.warning("Failed to check overlap: " + e.getMessage());
            return false;
        }
    }

    private boolean linesIntersect(Point a1, Point a2, Point b1, Point b2) {
        return ccw(a1, b1, b2) != ccw(a2, b1, b2) && ccw(a1, a2, b1) != ccw(a1, a2, b2);
    }

    private boolean ccw(Point A, Point B, Point C) {
        return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }
}
