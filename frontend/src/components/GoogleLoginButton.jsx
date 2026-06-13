/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Google OAuth login button — dark-first Tailwind design.
*/
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * GoogleLoginButton
 * Props:
 *   variant: "dark" (default) | "light"
 *   onSuccess: optional callback after successful login
 *   label: button text
 */
export default function GoogleLoginButton({
  variant = "dark",
  onSuccess,
  label = "Continue with Google",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login: contextLogin } = useUser();

  const handleGoogleSuccess = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setLoading(true);
      try {
        const userInfoRes = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            withCredentials: false,
          }
        );

        const { email, given_name: fname, family_name: lname } = userInfoRes.data;

        const res = await axios.post(
          `${BASE_URL}/api/auth/google`,
          { email, fname: fname ?? email.split("@")[0], lname: lname ?? "" },
          { withCredentials: true }
        );

        contextLogin(res.data);
        if (onSuccess) {
          onSuccess(res.data);
        } else if (res.data.isNewSignup) {
          navigate("/profile", { state: { changePassword: true } });
        } else {
          navigate("/main");
        }
      } catch (err) {
        console.error("Google login error:", err);
        setError(err.response?.data?.message || "Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or failed.");
      setLoading(false);
    },
  });

  const isLight = variant === "light";

  return (
    <div className="w-full">
      <button
        type="button"
        id="google-login-btn"
        disabled={loading}
        onClick={() => { setError(""); handleGoogleSuccess(); }}
        className={`w-full h-12 flex items-center justify-center gap-2.5 rounded-xl border text-[14.5px] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${
          isLight
            ? "bg-white border-gray-200 text-gray-800 hover:border-primary/50 hover:bg-green-50 hover:shadow-md hover:shadow-primary/10 shadow-sm"
            : "bg-card border-border text-foreground hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 shadow-sm"
        }`}
      >
        {loading ? (
          <>
            <span className="w-[18px] h-[18px] border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107" />
              <path d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.6 7.3 6.3 14.7z" fill="#FF3D00" />
              <path d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.5C29.8 36.5 27 37.5 24 37.5c-6 0-10.6-4-12.3-9.4l-7.1 5.4C8.2 41.4 15.5 46 24 46z" fill="#4CAF50" />
              <path d="M44.5 20H24v8.5h11.8c-1.2 3.2-4.1 5.5-7.5 6.5l6.6 5.5C39 37.5 45 31.5 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-[12.5px] text-destructive text-center font-medium">{error}</p>
      )}
    </div>
  );
}
