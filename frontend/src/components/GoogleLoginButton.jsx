/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Google OAuth login button — styled for the Verdant Editorial design system.
              Uses @react-oauth/google implicit flow, then calls /api/auth/google backend.
*/
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * GoogleLoginButton
 *
 * Props:
 *   variant: "light" (default, for cream right-panel) | "dark" (for dark left-panel)
 *   onSuccess: optional callback after successful login
 *   label: button text (default: "Continue with Google")
 */
export default function GoogleLoginButton({
  variant = "light",
  onSuccess,
  label = "Continue with Google",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login: contextLogin } = useUser();

  const isLight = variant === "light";

  const handleGoogleSuccess = useGoogleLogin({
    // implicit flow: gives us an access_token we can exchange for user info
    onSuccess: async (tokenResponse) => {
      setError("");
      setLoading(true);
      try {
        // 1. Get the user's profile from Google's userinfo endpoint
        const userInfoRes = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const { email, given_name: fname, family_name: lname } = userInfoRes.data;

        // 2. Send to TerraSpotter backend — creates account if first time, otherwise logs in
        const res = await axios.post(
          `${BASE_URL}/api/auth/google`,
          { email, fname: fname ?? email.split("@")[0], lname: lname ?? "" },
          { withCredentials: true }
        );

        // 3. Update context and redirect
        contextLogin(res.data);
        if (onSuccess) {
          onSuccess(res.data);
        } else {
          navigate("/main");
        }
      } catch (err) {
        console.error("Google login error:", err);
        setError(
          err.response?.data?.message ||
            "Google sign-in failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or failed.");
      setLoading(false);
    },
  });

  return (
    <div style={{ width: "100%" }}>
      <button
        type="button"
        id="google-login-btn"
        disabled={loading}
        onClick={() => {
          setError("");
          handleGoogleSuccess();
        }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          height: "48px",
          borderRadius: "12px",
          border: isLight
            ? "1.5px solid #e0d8cf"
            : "1.5px solid rgba(255,255,255,0.12)",
          background: isLight
            ? "#ffffff"
            : "rgba(255,255,255,0.05)",
          color: isLight ? "#0c1e11" : "#ffffff",
          fontSize: "14.5px",
          fontWeight: 600,
          fontFamily: "'Outfit', sans-serif",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.2s",
          boxShadow: isLight
            ? "0 1px 6px rgba(0,0,0,0.06)"
            : "0 1px 6px rgba(0,0,0,0.2)",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = isLight
              ? "#4db87a"
              : "rgba(77,184,122,0.4)";
            e.currentTarget.style.boxShadow = isLight
              ? "0 4px 16px rgba(77,184,122,0.12)"
              : "0 4px 16px rgba(77,184,122,0.15)";
            e.currentTarget.style.background = isLight
              ? "#f7fdf9"
              : "rgba(77,184,122,0.08)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isLight
            ? "#e0d8cf"
            : "rgba(255,255,255,0.12)";
          e.currentTarget.style.boxShadow = isLight
            ? "0 1px 6px rgba(0,0,0,0.06)"
            : "0 1px 6px rgba(0,0,0,0.2)";
          e.currentTarget.style.background = isLight
            ? "#ffffff"
            : "rgba(255,255,255,0.05)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.98)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {loading ? (
          <>
            {/* Spinner */}
            <span
              style={{
                width: 18,
                height: 18,
                border: "2px solid rgba(77,184,122,0.3)",
                borderTopColor: "#4db87a",
                borderRadius: "50%",
                display: "inline-block",
                animation: "g-spin 0.65s linear infinite",
                flexShrink: 0,
              }}
            />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            {/* Official Google G logo SVG */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                fill="#FFC107"
              />
              <path
                d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.6 7.3 6.3 14.7z"
                fill="#FF3D00"
              />
              <path
                d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.5C29.8 36.5 27 37.5 24 37.5c-6 0-10.6-4-12.3-9.4l-7.1 5.4C8.2 41.4 15.5 46 24 46z"
                fill="#4CAF50"
              />
              <path
                d="M44.5 20H24v8.5h11.8c-1.2 3.2-4.1 5.5-7.5 6.5l6.6 5.5C39 37.5 45 31.5 45 24c0-1.3-.2-2.7-.5-4z"
                fill="#1976D2"
              />
            </svg>
            <span>{label}</span>
          </>
        )}

        {/* Inline keyframe for spinner */}
        <style>{`
          @keyframes g-spin { to { transform: rotate(360deg); } }
        `}</style>
      </button>

      {/* Error message */}
      {error && (
        <p
          style={{
            marginTop: 8,
            fontSize: 12.5,
            color: "#b03a2e",
            textAlign: "center",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
