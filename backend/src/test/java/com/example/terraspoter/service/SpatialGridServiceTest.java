package com.example.terraspoter.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SpatialGridServiceTest {

    private final SpatialGridService spatialGridService = new SpatialGridService();

    @Test
    void testEstimateTreeCapacityEmptyOrInvalid() {
        assertEquals(0, spatialGridService.estimateTreeCapacity(null));
        assertEquals(0, spatialGridService.estimateTreeCapacity(""));
        assertEquals(0, spatialGridService.estimateTreeCapacity("[]"));
        assertEquals(0, spatialGridService.estimateTreeCapacity("[{\"lat\": 1.0, \"lng\": 1.0}]"));
    }

    @Test
    void testEstimateTreeCapacityValidPolygon() {
        // A simple square of approx 11m x 10.5m
        String json = "[" +
            "{\"lat\": 18.0000, \"lng\": 76.0000}," +
            "{\"lat\": 18.0001, \"lng\": 76.0000}," +
            "{\"lat\": 18.0001, \"lng\": 76.0001}," +
            "{\"lat\": 18.0000, \"lng\": 76.0001}" +
            "]";
        int capacity = spatialGridService.estimateTreeCapacity(json);
        assertTrue(capacity > 0, "Capacity should be estimated greater than 0");
    }

    @Test
    void testCheckOverlapNoOverlap() {
        String polyA = "[" +
            "{\"lat\": 18.0000, \"lng\": 76.0000}," +
            "{\"lat\": 18.0001, \"lng\": 76.0000}," +
            "{\"lat\": 18.0001, \"lng\": 76.0001}," +
            "{\"lat\": 18.0000, \"lng\": 76.0001}" +
            "]";
        String polyB = "[" +
            "{\"lat\": 18.0002, \"lng\": 76.0002}," +
            "{\"lat\": 18.0003, \"lng\": 76.0002}," +
            "{\"lat\": 18.0003, \"lng\": 76.0003}," +
            "{\"lat\": 18.0002, \"lng\": 76.0003}" +
            "]";
        assertFalse(spatialGridService.checkOverlap(polyA, polyB));
    }

    @Test
    void testCheckOverlapWithOverlap() {
        // Overlapping squares
        String polyA = "[" +
            "{\"lat\": 18.0000, \"lng\": 76.0000}," +
            "{\"lat\": 18.0002, \"lng\": 76.0000}," +
            "{\"lat\": 18.0002, \"lng\": 76.0002}," +
            "{\"lat\": 18.0000, \"lng\": 76.0002}" +
            "]";
        String polyB = "[" +
            "{\"lat\": 18.0001, \"lng\": 76.0001}," +
            "{\"lat\": 18.0003, \"lng\": 76.0001}," +
            "{\"lat\": 18.0003, \"lng\": 76.0003}," +
            "{\"lat\": 18.0001, \"lng\": 76.0003}" +
            "]";
        assertTrue(spatialGridService.checkOverlap(polyA, polyB));
    }
}
