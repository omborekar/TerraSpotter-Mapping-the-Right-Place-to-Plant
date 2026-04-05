/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Service for sending transactional emails via Brevo REST API.
*/
package com.example.terraspoter.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
@Service
public class BrevoEmailService {

    @Value("${brevo.api-key}")
    private String apiKey;

    @Value("${brevo.sender-email}")
    private String senderEmail;

    @Value("${brevo.sender-name}")
    private String senderName;

    private static final String BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

        // Public API

    /** Send 4-digit OTP email. */
    public void sendOtpEmail(String toEmail, String firstName, String otp) {
        send(toEmail, firstName,
                "Your TerraSpotter verification code: " + otp,
                buildOtpHtml(firstName, otp));
    }

    /** Send welcome / account-confirmed email. */
    public void sendWelcomeEmail(String toEmail, String firstName) {
        send(toEmail, firstName,
                "Welcome to TerraSpotter 🌱",
                buildWelcomeHtml(firstName, toEmail));
    }

        // Private — HTTP

    private void send(String toEmail, String toName, String subject, String htmlBody) {
        // Inline the HTML safely into JSON (escape backslash, quote, strip newlines)
        String safeHtml = htmlBody
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "")
                .replace("\n", "");

        String json = String.format(
                "{\"sender\":{\"name\":\"%s\",\"email\":\"%s\"}," +
                        "\"to\":[{\"email\":\"%s\",\"name\":\"%s\"}]," +
                        "\"subject\":\"%s\"," +
                        "\"htmlContent\":\"%s\"}",
                esc(senderName), esc(senderEmail),
                esc(toEmail),    esc(toName),
                esc(subject),    safeHtml
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_SEND_URL))
                    .header("accept",       "application/json")
                    .header("api-key",      apiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("[Brevo] Send failed ("
                        + response.statusCode() + "): " + response.body());
            }
        } catch (Exception e) {
            System.err.println("[Brevo] Exception: " + e.getMessage());
        }
    }

    /** Escape a string for safe embedding in a JSON value. */
    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

        // HTML templates

    private String buildOtpHtml(String name, String otp) {
        // Build the 4 big digit boxes
        StringBuilder digitCells = new StringBuilder();
        for (char c : otp.toCharArray()) {
            digitCells.append(
                    "<td style='padding:0 6px;'>" +
                            "<div style='width:56px;height:64px;background:#f0fdf4;" +
                            "border:2.5px solid #2d8a55;border-radius:12px;" +
                            "display:inline-block;text-align:center;line-height:64px;" +
                            "font-size:30px;font-weight:700;color:#0d3320;" +
                            "font-family:Georgia,serif;'>" + c + "</div></td>"
            );
        }

        return
                "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>" +
                        "<meta name='viewport' content='width=device-width,initial-scale=1'></head>" +
                        "<body style='margin:0;padding:0;background:#f5f1eb;" +
                        "font-family:Helvetica Neue,Arial,sans-serif;'>" +
                        "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f5f1eb;padding:40px 0;'>" +
                        "<tr><td align='center'>" +
                        "<table width='560' cellpadding='0' cellspacing='0' style='background:#ffffff;" +
                        "border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(13,51,32,0.10);'>" +

                        // Header
                        "<tr><td style='background:linear-gradient(135deg,#0d3320 0%,#1a5c38 100%);" +
                        "padding:36px 40px;text-align:center;'>" +
                        "<div style='display:inline-block;'>" +
                        "<span style='display:inline-block;width:10px;height:10px;border-radius:50%;" +
                        "background:#4db87a;margin-right:8px;vertical-align:middle;'></span>" +
                        "<span style='font-size:22px;font-weight:600;color:#ffffff;" +
                        "font-family:Georgia,serif;vertical-align:middle;'>TerraSpotter</span>" +
                        "</div>" +
                        "<p style='margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.55);'>" +
                        "Email Verification</p>" +
                        "</td></tr>" +

                        // Body
                        "<tr><td style='padding:40px 40px 32px;'>" +
                        "<h1 style='margin:0 0 10px;font-size:24px;font-weight:600;color:#0d3320;" +
                        "font-family:Georgia,serif;'>Hi " + esc(name) + " 👋</h1>" +
                        "<p style='margin:0 0 28px;font-size:15px;color:#6b7a72;line-height:1.65;'>" +
                        "Use the 4-digit code below to verify your email and complete your " +
                        "TerraSpotter account setup.</p>" +

                        // OTP boxes
                        "<table cellpadding='0' cellspacing='0' style='margin:0 auto 28px;'>" +
                        "<tr>" + digitCells + "</tr></table>" +

                        // Expiry warning
                        "<div style='background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;" +
                        "padding:14px 18px;text-align:center;margin-bottom:28px;'>" +
                        "<span style='font-size:13px;color:#c2410c;font-weight:600;'>" +
                        "⏱ This code expires in 10 minutes</span></div>" +

                        "<p style='font-size:13px;color:#9ca3af;line-height:1.7;margin:0;'>" +
                        "If you didn't create a TerraSpotter account, ignore this email safely.</p>" +
                        "</td></tr>" +

                        // Footer
                        "<tr><td style='background:#f9fbf9;border-top:1px solid #dde5e0;" +
                        "padding:20px 40px;text-align:center;'>" +
                        "<p style='margin:0;font-size:12px;color:#a0adb4;line-height:1.6;'>" +
                        "© 2025 TerraSpotter &nbsp;·&nbsp; Afforestation Intelligence Platform<br>" +
                        "Automated message — please do not reply.</p>" +
                        "</td></tr>" +

                        "</table></td></tr></table></body></html>";
    }

    private String buildWelcomeHtml(String name, String email) {
        String[][] features = {
                {"🗺", "Submit &amp; browse land parcels",
                        "Map idle land, upload photos, and add ownership details for admin review."},
                {"🌿", "Get AI plant recommendations",
                        "Our ML model recommends native species based on soil type and local climate."},
                {"📊", "Track plantation progress",
                        "Follow each site from submission to completion with live status updates."},
                {"💬", "Community reviews",
                        "Share feasibility notes and read on-ground assessments from other volunteers."},
        };

        StringBuilder rows = new StringBuilder();
        for (String[] f : features) {
            rows.append(
                    "<tr>" +
                            "<td style='padding:12px 0;vertical-align:top;width:46px;'>" +
                            "<div style='width:38px;height:38px;background:#edf7f2;border-radius:9px;" +
                            "text-align:center;line-height:38px;font-size:18px;'>" + f[0] + "</div>" +
                            "</td>" +
                            "<td style='padding:12px 0 12px 12px;border-bottom:1px solid #f0f0ee;'>" +
                            "<div style='font-size:14px;font-weight:600;color:#0d3320;margin-bottom:3px;'>" +
                            f[1] + "</div>" +
                            "<div style='font-size:13px;color:#6b7a72;line-height:1.55;'>" + f[2] + "</div>" +
                            "</td></tr>"
            );
        }

        return
                "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>" +
                        "<meta name='viewport' content='width=device-width,initial-scale=1'></head>" +
                        "<body style='margin:0;padding:0;background:#f5f1eb;" +
                        "font-family:Helvetica Neue,Arial,sans-serif;'>" +
                        "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f5f1eb;padding:40px 0;'>" +
                        "<tr><td align='center'>" +
                        "<table width='560' cellpadding='0' cellspacing='0' style='background:#ffffff;" +
                        "border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(13,51,32,0.10);'>" +

                        // Green hero header
                        "<tr><td style='background:linear-gradient(135deg,#0d3320 0%,#2d8a55 100%);" +
                        "padding:48px 40px;text-align:center;'>" +
                        "<div style='width:72px;height:72px;background:rgba(255,255,255,0.12);" +
                        "border-radius:50%;margin:0 auto 20px;line-height:72px;font-size:36px;'>🌱</div>" +
                        "<div style='display:inline-block;'>" +
                        "<span style='display:inline-block;width:8px;height:8px;border-radius:50%;" +
                        "background:#4db87a;margin-right:8px;vertical-align:middle;'></span>" +
                        "<span style='font-size:20px;font-weight:600;color:#ffffff;" +
                        "font-family:Georgia,serif;vertical-align:middle;'>TerraSpotter</span>" +
                        "</div>" +
                        "<h1 style='margin:18px 0 6px;font-size:28px;font-weight:600;color:#ffffff;" +
                        "font-family:Georgia,serif;letter-spacing:-0.4px;'>Welcome aboard, " +
                        esc(name) + "!</h1>" +
                        "<p style='margin:0;font-size:14px;color:rgba(255,255,255,0.65);'>" +
                        "Your email is verified. Your account is ready.</p>" +
                        "</td></tr>" +

                        // Body
                        "<tr><td style='padding:40px 40px 32px;'>" +
                        "<p style='margin:0 0 24px;font-size:15px;color:#3d5244;line-height:1.7;'>" +
                        "You're now part of a growing community dedicated to mapping and planting " +
                        "on idle land across India. Here's what you can do:</p>" +
                        "<table cellpadding='0' cellspacing='0' width='100%'>" + rows + "</table>" +

                        // CTA button
                        "<div style='text-align:center;margin:32px 0 8px;'>" +
                        "<a href='https://terraspotter.onrender.com/browse' " +
                        "style='display:inline-block;padding:14px 32px;background:#0d3320;" +
                        "color:#ffffff;border-radius:9px;font-size:15px;font-weight:600;" +
                        "text-decoration:none;'>Explore land parcels →</a></div>" +

                        "<p style='margin:24px 0 0;font-size:12.5px;color:#9ca3af;line-height:1.65;'>" +
                        "Signed in as <strong>" + esc(email) + "</strong>. " +
                        "If this wasn't you, contact us immediately.</p>" +
                        "</td></tr>" +

                        // Footer
                        "<tr><td style='background:#f9fbf9;border-top:1px solid #dde5e0;" +
                        "padding:20px 40px;text-align:center;'>" +
                        "<p style='margin:0;font-size:12px;color:#a0adb4;line-height:1.6;'>" +
                        "© 2025 TerraSpotter &nbsp;·&nbsp; No ads. No selling. No noise.<br>" +
                        "You're receiving this because you just created an account.</p>" +
                        "</td></tr>" +

                        "</table></td></tr></table></body></html>";
    }
    public void sendPasswordResetEmail(String toEmail, String firstName, String otp) {
        send(toEmail, firstName,
                "Reset your TerraSpotter password",
                buildPasswordResetHtml(firstName, otp));
    }

    // ── PRIVATE TEMPLATE (add at bottom of class) ─────────────────

    private String buildPasswordResetHtml(String name, String otp) {
        StringBuilder digitCells = new StringBuilder();
        for (char c : otp.toCharArray()) {
            digitCells.append(
                    "<td style='padding:0 6px;'>" +
                            "<div style='width:56px;height:64px;background:#fff7ed;" +
                            "border:2.5px solid #b45309;border-radius:12px;" +
                            "display:inline-block;text-align:center;line-height:64px;" +
                            "font-size:30px;font-weight:700;color:#0d3320;" +
                            "font-family:Georgia,serif;'>" + c + "</div></td>"
            );
        }

        return
                "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>" +
                        "<meta name='viewport' content='width=device-width,initial-scale=1'></head>" +
                        "<body style='margin:0;padding:0;background:#f5f1eb;" +
                        "font-family:Helvetica Neue,Arial,sans-serif;'>" +
                        "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f5f1eb;padding:40px 0;'>" +
                        "<tr><td align='center'>" +
                        "<table width='560' cellpadding='0' cellspacing='0' style='background:#ffffff;" +
                        "border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(13,51,32,0.10);'>" +

                        // Header — amber-tinted to visually distinguish from signup OTP
                        "<tr><td style='background:linear-gradient(135deg,#0d3320 0%,#1a5c38 60%,#92400e 100%);" +
                        "padding:36px 40px;text-align:center;'>" +
                        "<div style='display:inline-block;'>" +
                        "<span style='display:inline-block;width:10px;height:10px;border-radius:50%;" +
                        "background:#fbbf24;margin-right:8px;vertical-align:middle;'></span>" +
                        "<span style='font-size:22px;font-weight:600;color:#ffffff;" +
                        "font-family:Georgia,serif;vertical-align:middle;'>TerraSpotter</span>" +
                        "</div>" +
                        "<p style='margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.55);'>" +
                        "Password Reset</p>" +
                        "</td></tr>" +

                        // Body
                        "<tr><td style='padding:40px 40px 32px;'>" +
                        "<h1 style='margin:0 0 10px;font-size:24px;font-weight:600;color:#0d3320;" +
                        "font-family:Georgia,serif;'>Hi " + esc(name) + " 🔑</h1>" +
                        "<p style='margin:0 0 28px;font-size:15px;color:#6b7a72;line-height:1.65;'>" +
                        "We received a request to reset your TerraSpotter password. " +
                        "Use the 4-digit code below to verify it's really you.</p>" +

                        // OTP boxes
                        "<table cellpadding='0' cellspacing='0' style='margin:0 auto 28px;'>" +
                        "<tr>" + digitCells + "</tr></table>" +

                        // Expiry warning
                        "<div style='background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;" +
                        "padding:14px 18px;text-align:center;margin-bottom:28px;'>" +
                        "<span style='font-size:13px;color:#c2410c;font-weight:600;'>" +
                        "⏱ This code expires in 10 minutes</span></div>" +

                        "<p style='font-size:13px;color:#9ca3af;line-height:1.7;margin:0;'>" +
                        "If you didn't request a password reset, your account is safe — just ignore this email.</p>" +
                        "</td></tr>" +

                        // Footer
                        "<tr><td style='background:#f9fbf9;border-top:1px solid #dde5e0;" +
                        "padding:20px 40px;text-align:center;'>" +
                        "<p style='margin:0;font-size:12px;color:#a0adb4;line-height:1.6;'>" +
                        "© 2025 TerraSpotter &nbsp;·&nbsp; Afforestation Intelligence Platform<br>" +
                        "Automated message — please do not reply.</p>" +
                        "</td></tr>" +

                        "</table></td></tr></table></body></html>";
    }

}