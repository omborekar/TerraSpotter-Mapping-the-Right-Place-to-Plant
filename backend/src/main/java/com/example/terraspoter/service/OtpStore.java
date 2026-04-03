package com.example.terraspoter.service;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory OTP store.
 * No external dependency needed — works on Render free tier.
 * OTPs are intentionally lost on restart (user just requests a new one).
 */
@Component
public class OtpStore {

    private static final long TTL_SECONDS = 600; // 10 minutes

    private record Entry(String otp, Instant expiresAt) {}

    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    /** Save (or overwrite) a 4-digit OTP for this email. */
    public void save(String email, String otp) {
        store.put(
                email.toLowerCase().trim(),
                new Entry(otp, Instant.now().plusSeconds(TTL_SECONDS))
        );
    }

    /**
     * Validate OTP — returns true only if it matches and has not expired.
     * Removes the entry on success (one-time use).
     */
    public boolean validate(String email, String otp) {
        String key   = email.toLowerCase().trim();
        Entry  entry = store.get(key);

        if (entry == null) return false;

        if (Instant.now().isAfter(entry.expiresAt())) {
            store.remove(key);
            return false;
        }

        if (!entry.otp().equals(otp == null ? "" : otp.trim())) return false;

        store.remove(key); // consumed — cannot be reused
        return true;
    }

    /** Drop any stored OTP for this email (called on resend). */
    public void invalidate(String email) {
        store.remove(email.toLowerCase().trim());
    }
}