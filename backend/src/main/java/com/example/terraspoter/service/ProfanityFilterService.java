package com.example.terraspoter.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ProfanityFilterService {

    // A basic list of profane words. In a real application, this would be more comprehensive.
    private static final List<String> BAD_WORDS = Arrays.asList(
        "fuck", "shit", "ass", "bitch", "cunt", "dick", "pussy", "bastard", "slut", "whore", "faggot", "nigger", "cock"
    );

    /**
     * Filters the input text, replacing any bad words with asterisks.
     */
    public String filter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        String filtered = input;
        for (String word : BAD_WORDS) {
            // Case-insensitive replacement matching whole words to avoid false positives (e.g. 'glass' shouldn't be censored for 'ass')
            String patternString = "(?i)\\b" + Pattern.quote(word) + "\\b";
            
            // Create a replacement string of asterisks of the same length as the bad word
            StringBuilder replacement = new StringBuilder();
            for (int i = 0; i < word.length(); i++) {
                replacement.append("*");
            }
            
            filtered = filtered.replaceAll(patternString, replacement.toString());
        }
        return filtered;
    }
}
