package com.example.terraspoter.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ProfanityFilterServiceTest {

    private final ProfanityFilterService profanityFilterService = new ProfanityFilterService();

    @Test
    void testFilterEmptyOrNull() {
        assertNull(profanityFilterService.filter(null));
        assertEquals("", profanityFilterService.filter(""));
    }

    @Test
    void testFilterNoProfanity() {
        String cleanText = "This is a beautiful land for planting trees.";
        assertEquals(cleanText, profanityFilterService.filter(cleanText));
    }

    @Test
    void testFilterWithProfanity() {
        String profaneText = "This land is total shit and fuck it.";
        String expected = "This land is total **** and **** it.";
        assertEquals(expected, profanityFilterService.filter(profaneText));
    }

    @Test
    void testFilterCaseInsensitive() {
        String profaneText = "SHIT and FuCk";
        String expected = "**** and ****";
        assertEquals(expected, profanityFilterService.filter(profaneText));
    }

    @Test
    void testFilterAvoidFalsePositives() {
        String edgeCase = "glass and baseline and classic";
        assertEquals(edgeCase, profanityFilterService.filter(edgeCase));
    }
}
