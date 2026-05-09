/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Signup component with OTP flow and password helpers.
*/
import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const BASE_URL = import.meta.env.VITE_API_URL;

function getStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

// 4-box OTP input component
function OtpInput({ value, onChange, disabled }) {
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const chars = (value + "    ").slice(0, 4).split("");

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = value.slice(0, i) + " " + value.slice(i + 1);
      onChange(next.trimEnd());
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = (value + "    ").slice(0, 4).split("");
    next[i] = e.key;
    onChange(next.join("").trimEnd());
    if (i < 3) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(text);
    refs[Math.min(text.length, 3)].current?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "28px 0" }}>
      {[0, 1, 2, 3].map(i => {
        const filled = chars[i] && chars[i] !== " ";
        return (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={filled ? chars[i] : ""}
            onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste}
            onChange={() => { }}
            disabled={disabled}
            autoFocus={i === 0}
            style={{
              width: 60,
              height: 70,
              textAlign: "center",
              fontSize: 30,
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              border: `2px solid ${filled ? "#3a8c57" : "#e8e2da"}`,
              borderRadius: 13,
              outline: "none",
              background: filled ? "#f0fdf6" : "#ffffff",
              color: "#163d25",
              boxShadow: filled
                ? "0 0 0 3px rgba(58,140,87,.14), 0 2px 8px rgba(58,140,87,.12)"
                : "0 1px 3px rgba(0,0,0,0.04)",
              transition: "border-color .18s, box-shadow .18s, background .18s",
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? "not-allowed" : "text",
            }}
          />
        );
      })}
    </div>
  );
}

// Step progress bar
function Steps({ step }) {
  const labels = ["Details", "Verify Email", "Done"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {labels.map((l, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                background: done
                  ? "linear-gradient(145deg, #256638, #163d25)"
                  : active
                    ? "linear-gradient(145deg, #163d25, #0d2a1a)"
                    : "#e8e2da",
                color: done || active ? "white" : "#a89e93",
                transition: "all .32s cubic-bezier(.22,1,.36,1)",
                boxShadow: (done || active)
                  ? "0 2px 10px rgba(58,140,87,0.28)"
                  : "none",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: ".7px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: active ? "#163d25" : "#a89e93",
                transition: "color .3s",
              }}>{l}</span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1,
                height: 2,
                margin: "0 8px",
                marginBottom: 18,
                borderRadius: 2,
                background: done
                  ? "linear-gradient(90deg, #256638, #3a8c57)"
                  : "#e8e2da",
                transition: "background .35s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    fname: "", lname: "", email: "",
    phoneNo: "", dob: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendSecs, setResendSecs] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startResendTimer = () => {
    setResendSecs(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const today = new Date();
  const dobD = new Date(form.dob);
  let age = today.getFullYear() - dobD.getFullYear();
  const mm = today.getMonth() - dobD.getMonth();
  if (mm < 0 || (mm === 0 && today.getDate() < dobD.getDate())) age--;

  const validate = () => {
    const e = {};
    if (form.fname.trim().length < 2) e.fname = "At least 2 characters";
    if (form.lname.trim().length < 2) e.lname = "At least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!/^\d{10}$/.test(form.phoneNo)) e.phoneNo = "Must be exactly 10 digits";
    if (!form.dob) e.dob = "Date of birth is required";
    else if (age < 14) e.dob = "You must be at least 14 years old";
    if (form.password.length < 8) e.password = "At least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/send-otp`, { email: form.email, fname: form.fname });
      setStep(1);
      startResendTimer();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to send OTP. Try again.";
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const clean = otp.replace(/\s/g, "");
    if (clean.length < 4) { setOtpError("Enter all 4 digits"); return; }
    setOtpError("");
    setOtpLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/signup`, {
        fname: form.fname, lname: form.lname, email: form.email,
        phoneNo: form.phoneNo, dob: form.dob, password: form.password, otp: clean,
      }, { withCredentials: true });
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Invalid or expired OTP.";
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSecs > 0) return;
    try {
      await axios.post(`${BASE_URL}/api/auth/send-otp`, { email: form.email, fname: form.fname });
      setOtp("");
      setOtpError("");
      startResendTimer();
    } catch {
      setOtpError("Failed to resend. Please try again.");
    }
  };

  const strength = getStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#b03a2e", "#c0862a", "#3a8c57", "#163d25"][strength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest:       #163d25;
          --canopy:       #256638;
          --leaf:         #3a8c57;
          --sprout:       #5cb87a;
          --sand:         #f8f5f0;
          --cream:        #fdfbf8;
          --ink:          #111;
          --smoke:        #6b6457;
          --muted:        #a89e93;
          --line:         #e8e2da;
          --white:        #ffffff;
          --danger:       #b03a2e;
          --danger-bg:    #fdf3f2;
          --green-glow:   rgba(58,140,87,0.18);
          --green-glow-s: rgba(58,140,87,0.28);
          --mist:         #edf7f2;
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--sand); color: var(--ink); }

        .su-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 400px 1fr;
        }

        /* ── LEFT PANEL ── */
        .su-left {
          background: var(--forest);
          color: white;
          padding: 54px 44px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }

        .su-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 15% 85%, rgba(92,184,122,.20) 0%, transparent 52%),
            radial-gradient(ellipse at 82% 18%, rgba(22,61,37,.55) 0%, transparent 48%);
          pointer-events: none;
        }
        .su-left::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.035;
          background-image:
            linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .su-left-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .su-logo {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin-bottom: 56px;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: -0.2px;
        }
        .su-logo-mark {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: linear-gradient(145deg, var(--canopy), var(--sprout));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 12px var(--green-glow-s), inset 0 1px 0 rgba(255,255,255,0.15);
          flex-shrink: 0;
        }

        .su-left h1 {
          font-family: 'Playfair Display', serif;
          font-size: 38px;
          font-weight: 700;
          line-height: 1.10;
          letter-spacing: -0.5px;
          margin-bottom: 18px;
          color: white;
        }
        .su-left h1 em { font-style: italic; color: var(--sprout); }

        .su-left-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.80;
          margin-bottom: 48px;
        }

        .su-perks {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: auto;
        }
        .su-perk {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }
        .su-perk-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--sprout);
          flex-shrink: 0;
          margin-top: 6px;
          box-shadow: 0 0 8px rgba(92,184,122,0.5);
        }
        .su-perk-text h4 {
          font-size: 13px;
          font-weight: 600;
          color: white;
          margin-bottom: 3px;
        }
        .su-perk-text p {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          line-height: 1.60;
        }

        .su-left-foot {
          margin-top: 40px;
          padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,0.08);
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          line-height: 1.7;
        }

        /* ── RIGHT PANEL ── */
        .su-right {
          background: var(--cream);
          padding: 52px 64px 80px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow-y: auto;
          position: relative;
        }
        .su-right::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.016;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        .su-form-wrap {
          width: 100%;
          max-width: 450px;
          position: relative;
          z-index: 1;
        }

        .su-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.4px;
          color: var(--forest);
          margin-bottom: 5px;
        }
        .su-form-sub {
          font-size: 14px;
          color: var(--smoke);
          margin-bottom: 28px;
        }

        /* Section heading */
        .su-section-head {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.3px;
          color: var(--muted);
          margin: 22px 0 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .su-section-head::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--line);
        }

        /* Fields */
        .su-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 16px;
        }
        .su-label {
          font-size: 11px;
          font-weight: 600;
          color: #4a3f36;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .su-err { font-size: 12px; color: var(--danger); margin-top: 2px; font-weight: 500; }

        .su-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .su-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--line);
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: var(--white);
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          letter-spacing: 0.01em;
        }
        .su-input::placeholder { color: var(--muted); }
        .su-input:focus {
          border-color: var(--leaf);
          box-shadow: 0 0 0 3px var(--green-glow);
          background: #fdfffe;
        }
        .su-input.e {
          border-color: var(--danger);
          background: var(--danger-bg);
          box-shadow: 0 0 0 3px rgba(176,58,46,.07);
        }
        .su-input.pw { padding-right: 46px; }

        .su-pw-eye {
          position: absolute;
          right: 13px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 15px;
          color: var(--muted);
          padding: 0;
          transition: color .15s;
        }
        .su-pw-eye:hover { color: var(--forest); }

        .su-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Password strength */
        .su-strength {
          margin-top: 7px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .su-strength-bar {
          height: 3px;
          border-radius: 2px;
          background: var(--line);
          overflow: hidden;
        }
        .su-strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: width .35s ease, background .35s ease;
        }

        /* API error */
        .su-api-err {
          padding: 12px 15px;
          background: var(--danger-bg);
          border: 1px solid rgba(176,58,46,.2);
          border-radius: 9px;
          font-size: 13px;
          color: var(--danger);
          margin-bottom: 18px;
          font-weight: 500;
        }

        /* Submit */
        .su-submit {
          width: 100%;
          padding: 13.5px;
          background: linear-gradient(145deg, var(--canopy) 0%, var(--forest) 100%);
          color: white;
          border: none;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          transition: filter .2s, transform .12s, box-shadow .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
          letter-spacing: 0.02em;
          box-shadow: 0 3px 14px var(--green-glow-s), inset 0 1px 0 rgba(255,255,255,.10);
        }
        .su-submit:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 5px 20px var(--green-glow-s);
        }
        .su-submit:active:not(:disabled) { transform: scale(.985); }
        .su-submit:disabled { opacity: .62; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .su-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin .65s linear infinite;
        }

        .su-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0;
          font-size: 11.5px;
          color: var(--muted);
          font-weight: 500;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .su-divider::before, .su-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--line);
        }

        .su-signin {
          text-align: center;
          font-size: 13.5px;
          color: var(--smoke);
          margin-top: 20px;
        }
        .su-signin a {
          color: var(--leaf);
          font-weight: 600;
          text-decoration: none;
          transition: color .15s;
        }
        .su-signin a:hover { color: var(--forest); }

        /* ── OTP step ── */
        .otp-card {
          background: white;
          border-radius: 18px;
          border: 1px solid var(--line);
          padding: 34px 28px;
          box-shadow: 0 4px 30px rgba(22,61,37,.08), 0 1px 6px rgba(0,0,0,0.04);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .otp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--forest), var(--leaf), var(--forest));
        }

        .otp-email-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: var(--mist);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          color: var(--canopy);
          margin: 12px 0 8px;
          letter-spacing: 0.01em;
        }

        .otp-hint {
          font-size: 13px;
          color: var(--smoke);
          line-height: 1.65;
          margin-top: 6px;
        }

        .otp-err {
          padding: 10px 14px;
          background: var(--danger-bg);
          border: 1px solid rgba(176,58,46,.18);
          border-radius: 9px;
          font-size: 13px;
          color: var(--danger);
          margin-bottom: 14px;
          font-weight: 500;
        }

        .otp-resend {
          font-size: 13px;
          color: var(--smoke);
          margin-top: 16px;
        }
        .otp-resend button {
          background: none;
          border: none;
          color: var(--leaf);
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 0;
          transition: color .15s;
        }
        .otp-resend button:hover { color: var(--forest); }
        .otp-resend button:disabled { color: var(--muted); cursor: default; }

        .otp-back {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 12.5px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          margin-top: 14px;
          text-decoration: underline;
          transition: color .15s;
        }
        .otp-back:hover { color: var(--smoke); }

        /* ── Success card ── */
        .success-card {
          background: white;
          border-radius: 20px;
          border: 1px solid var(--line);
          padding: 52px 40px;
          box-shadow: 0 4px 30px rgba(22,61,37,.08);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .success-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--forest), var(--leaf), var(--forest));
        }

        .success-icon {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(145deg, var(--leaf), var(--canopy));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          margin: 0 auto 26px;
          box-shadow: 0 8px 28px var(--green-glow-s);
        }

        .success-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--forest);
          margin-bottom: 12px;
          letter-spacing: -0.3px;
        }

        .success-sub {
          font-size: 14px;
          color: var(--smoke);
          line-height: 1.80;
          margin-bottom: 30px;
        }

        .success-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 30px;
          background: linear-gradient(145deg, var(--canopy), var(--forest));
          color: white;
          border: none;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: filter .2s, box-shadow .2s;
          box-shadow: 0 3px 14px var(--green-glow-s);
          letter-spacing: 0.02em;
        }
        .success-btn:hover {
          filter: brightness(1.08);
          box-shadow: 0 5px 20px var(--green-glow-s);
        }

        @media (max-width: 860px) {
          .su-page { grid-template-columns: 1fr; }
          .su-left { display: none; }
          .su-right { padding: 36px 20px 64px; }
        }
      `}</style>

      <Helmet>
        <title>{t("signup.page_title", "TerraSpotter — Sign up")}</title>
        <meta name="description" content="Create a free TerraSpotter account to submit land and join planting." />
      </Helmet>

      <div className="su-page">

        {/* LEFT PANEL */}
        <motion.aside className="su-left"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}>
          <div className="su-left-inner">
            <div className="su-logo">
              <span className="su-logo-mark">🌿</span>
              TerraSpotter
            </div>
          <h1>
            {t("signup.hero_line_1", "Your legacy")}<br />
            {t("signup.hero_line_2", "starts with a")}<br />
            <em className="not-italic text-[#4db87a]">{t("signup.hero_line_3", "single boundary.")}</em>
          </h1>

          <p className="su-left-desc">
            {t("signup.hero_desc", "Join India's fastest-growing afforestation network. Draw your land, connect with volunteers, and track the growth.")}
          </p>
            <div className="su-perks">
              {[
                ["Submit & track land parcels", "Map boundaries, upload photos, and get matched with planting teams automatically."],
                ["AI-powered species recommendations", "Soil type, rainfall, and climate data generate native tree recommendations for every parcel."],
                ["Verified impact tracking", "CO₂ capture, canopy growth, and water recharge data updated as plantations mature."],
                ["Open to all — free forever", "Built for NGOs, researchers, students, local bodies, and individual volunteers."],
              ].map(([h, p]) => (
                <div key={h} className="su-perk">
                  <div className="su-perk-dot" />
                  <div className="su-perk-text"><h4>{h}</h4><p>{p}</p></div>
                </div>
              ))}
            </div>
            <p className="su-left-foot">Your data is used only to connect land with planting teams.<br />No ads. No selling. No noise.</p>
          </div>
        </motion.aside>

        {/* RIGHT PANEL */}
        <motion.div className="su-right"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.50, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <div className="su-form-wrap">

            <Steps step={step} />

            <AnimatePresence mode="wait">

              {/* STEP 0: registration form */}
              {step === 0 && (
                <motion.div key="form"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>

                  <h2 className="su-form-title">{t("signup.create_acc", "Create account")}</h2>
                  <p className="su-form-sub">{t("signup.sub", "Transform your barren land into a lush forest.")}</p>

                  {errors.api && <div className="su-api-err">⚠ {errors.api}</div>}

                  <form onSubmit={handleSendOtp} noValidate>
                    <div className="su-section-head">Personal</div>
                    <div className="su-grid-2">
                      <div className="su-field">
                        <label className="su-label">First Name</label>
                        <input className={`su-input${errors.fname ? " e" : ""}`}
                          name="fname" placeholder="Arjun"
                          value={form.fname} onChange={handleChange} autoComplete="given-name" />
                        {errors.fname && <span className="su-err">{errors.fname}</span>}
                      </div>
                      <div className="su-field">
                        <label className="su-label">Last Name</label>
                        <input className={`su-input${errors.lname ? " e" : ""}`}
                          name="lname" placeholder="Desai"
                          value={form.lname} onChange={handleChange} autoComplete="family-name" />
                        {errors.lname && <span className="su-err">{errors.lname}</span>}
                      </div>
                    </div>
                    <div className="su-grid-2">
                      <div className="su-field">
                        <label className="su-label">Date of Birth</label>
                        <input className={`su-input${errors.dob ? " e" : ""}`}
                          type="date" name="dob"
                          value={form.dob} onChange={handleChange} />
                        {errors.dob && <span className="su-err">{errors.dob}</span>}
                      </div>
                      <div className="su-field">
                        <label className="su-label">Mobile Number</label>
                        <input className={`su-input${errors.phoneNo ? " e" : ""}`}
                          name="phoneNo" placeholder="9876543210" maxLength={10}
                          value={form.phoneNo} onChange={handleChange} autoComplete="tel" />
                        {errors.phoneNo && <span className="su-err">{errors.phoneNo}</span>}
                      </div>
                    </div>

                    <div className="su-section-head">Account</div>
                    <div className="su-field">
                      <label className="su-label">Email Address</label>
                      <input className={`su-input${errors.email ? " e" : ""}`}
                        type="email" name="email" placeholder="you@example.com"
                        value={form.email} onChange={handleChange} autoComplete="email" />
                      {errors.email && <span className="su-err">{errors.email}</span>}
                    </div>
                    <div className="su-field">
                      <label className="su-label">Password</label>
                      <div className="su-input-wrap">
                        <input className={`su-input pw${errors.password ? " e" : ""}`}
                          type={showPw ? "text" : "password"} name="password"
                          placeholder="Min. 8 characters" value={form.password}
                          onChange={handleChange} autoComplete="new-password" />
                        <button type="button" className="su-pw-eye"
                          onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                          {showPw ? "🙈" : "👁"}
                        </button>
                      </div>
                      {form.password && (
                        <div className="su-strength">
                          <div className="su-strength-bar">
                            <div className="su-strength-fill"
                              style={{ width: `${strength * 25}%`, background: strengthColor }} />
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: strengthColor }}>
                            {strengthLabel}
                          </span>
                        </div>
                      )}
                      {errors.password && <span className="su-err">{errors.password}</span>}
                    </div>
                    <div className="su-field">
                      <label className="su-label">Confirm Password</label>
                      <div className="su-input-wrap">
                        <input className={`su-input pw${errors.confirmPassword ? " e" : ""}`}
                          type={showCp ? "text" : "password"} name="confirmPassword"
                          placeholder="Re-enter password" value={form.confirmPassword}
                          onChange={handleChange} autoComplete="new-password" />
                        <button type="button" className="su-pw-eye"
                          onClick={() => setShowCp(v => !v)} tabIndex={-1}>
                          {showCp ? "🙈" : "👁"}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="su-err">{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="su-submit" disabled={loading}>
                      {loading
                        ? <><div className="su-spinner" />Sending OTP…</>
                        : "Continue → Verify Email"}
                    </button>
                  </form>

                  <div className="su-divider">or</div>
                  <div className="su-signin">Already have an account? <Link to="/login">Sign in →</Link></div>
                </motion.div>
              )}

              {/* STEP 1: OTP entry */}
              {step === 1 && (
                <motion.div key="otp"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>

                  <h1 className="su-form-title">Check your inbox</h1>
                  <p className="su-form-sub">We emailed a 4-digit code to</p>

                  <div className="otp-card">
                    <div className="otp-email-chip">📧 {form.email}</div>
                    <p className="otp-hint">Enter the code below. It expires in 10 minutes.</p>

                    <OtpInput value={otp} onChange={setOtp} disabled={otpLoading} />

                    {otpError && <div className="otp-err">⚠ {otpError}</div>}

                    <button
                      className="su-submit"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.replace(/\s/g, "").length < 4}
                    >
                      {otpLoading
                        ? <><div className="su-spinner" />Verifying…</>
                        : "Verify & Create Account →"}
                    </button>

                    <div className="otp-resend">
                      {resendSecs > 0
                        ? <span>{t("signup.resend_in", "Resend in")} <strong>{resendSecs}s</strong></span>
                        : <span>{t("signup.didnt_get", "Didn't get it?")} <button onClick={handleResend}>{t("signup.resend_otp", "Resend OTP")}</button></span>
                      }
                    </div>
                    <div>
                      <button className="otp-back"
                        onClick={() => { setStep(0); setOtp(""); setOtpError(""); }}>
                        ← {t("signup.back_edit", "Back to edit details")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: success */}
              {step === 2 && (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.42, type: "spring", bounce: 0.28 }}>

                  <div className="success-card">
                    <motion.div className="success-icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.18, type: "spring", bounce: 0.5 }}>
                      🌱
                    </motion.div>
                    <h2 className="success-title">Account created!</h2>
                    <p className="success-sub">
                      Welcome to TerraSpotter, <strong>{form.fname}</strong>! 🎉<br />
                      A confirmation email has been sent to<br />
                      <strong>{form.email}</strong>
                    </p>
                    <Link to="/login" className="success-btn">
                      Sign in to your account →
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}