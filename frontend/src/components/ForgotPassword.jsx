/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Forgot password page — 3-step flow: email → OTP → new password.
              Uses Tailwind CSS only. No inline styles.
*/
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const STEPS = ["email", "otp", "reset", "done"];

function StepDots({ current }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-2 mb-8">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`block h-1.5 rounded-full transition-all duration-500 ${
            i < idx ? "bg-emerald-500 w-6" : i === idx ? "bg-emerald-400 w-6" : "bg-stone-300 w-3"
          }`}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]           = useState("email");
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState(["", "", "", ""]);
  const [passwords, setPasswords] = useState({ pw: "", confirm: "" });
  const [showPw, setShowPw]       = useState({ pw: false, confirm: false });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const otpString = otp.join("");

  /* Step 1 */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password/send-otp`, { email });
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 */
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 3) document.getElementById(`otp-${idx + 1}`)?.focus();
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otpString.length < 4) { setError("Enter the 4-digit code."); return; }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password/verify-otp`, { email, otp: otpString });
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 3 */
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (passwords.pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (passwords.pw !== passwords.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password/reset`, {
        email, otp: otpString, newPassword: passwords.pw,
      });
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Please start over.");
    } finally {
      setLoading(false);
    }
  };

  const slide = {
    initial:    { opacity: 0, x: 28 },
    animate:    { opacity: 1, x: 0 },
    exit:       { opacity: 0, x: -28 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <>
      <Helmet>
        <title>TerraSpotter — Reset Password</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-['DM_Sans',sans-serif]">

        {/* ── LEFT nature panel ── */}
        <motion.div
          className="hidden lg:flex flex-col justify-between bg-[#0b2614] relative overflow-hidden p-14"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ambient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full bg-emerald-900/40 blur-3xl" />
            <div className="absolute top-10 right-0 w-72 h-72 rounded-full bg-green-950/50 blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-emerald-800/20 blur-3xl" />
          </div>
          {/* grid texture */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          {/* brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-base shadow-lg shadow-emerald-900/50">
                🌿
              </div>
              <span className="font-['Playfair_Display',serif] text-white text-xl font-bold tracking-tight">
                TerraSpotter
              </span>
            </Link>
          </div>

          {/* hero copy */}
          <div className="relative z-10 space-y-5">
            <div className="text-8xl leading-none select-none">🌳</div>
            <h2 className="font-['Playfair_Display',serif] text-[2.6rem] text-white leading-[1.1] font-bold tracking-tight">
              Roots run deep.<br />
              <em className="not-italic text-emerald-400">So does security.</em>
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              Reset your password safely. Your account — and the land you help protect — stays yours.
            </p>

            {/* nature pill badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {["Secure Reset", "OTP Verified", "BCrypt Encrypted"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-stone-400 tracking-wide"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* leaf strip */}
          <div className="relative z-10 flex gap-3 items-center">
            {["🍃", "🌱", "🌾", "🍀", "🌿"].map((e, i) => (
              <span key={i} className="text-xl opacity-25 hover:opacity-50 transition-opacity cursor-default">{e}</span>
            ))}
          </div>

          <p className="relative z-10 text-[11px] text-stone-700 leading-relaxed">
            © 2026 TerraSpotter · Afforestation Intelligence Platform
          </p>
        </motion.div>

        {/* ── RIGHT form panel ── */}
        <motion.div
          className="flex items-center justify-center bg-[#faf9f7] px-6 py-16 lg:px-20 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* grain overlay */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "180px 180px",
            }}
          />

          <div className="w-full max-w-sm relative z-10">

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-400 hover:text-emerald-700 transition-colors mb-8 no-underline"
            >
              ← Back to Login
            </Link>

            <StepDots current={step} />

            <AnimatePresence mode="wait">

              {/* STEP 1 — EMAIL */}
              {step === "email" && (
                <motion.div key="email" {...slide}>
                  <Eyebrow label="Password Recovery" />
                  <h1 className="font-['Playfair_Display',serif] text-[2rem] font-bold text-[#0b2614] mb-2 leading-tight tracking-tight">
                    Forgot your password?
                  </h1>
                  <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                    Enter your registered email and we'll send a 4-digit verification code.
                  </p>
                  {error && <ErrorBox message={error} />}
                  <form onSubmit={handleSendOtp} noValidate className="space-y-5">
                    <FieldWrap label="Email address">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </FieldWrap>
                    <SubmitBtn loading={loading} label="Send verification code →" />
                  </form>
                </motion.div>
              )}

              {/* STEP 2 — OTP */}
              {step === "otp" && (
                <motion.div key="otp" {...slide}>
                  <Eyebrow label="Verification" />
                  <h1 className="font-['Playfair_Display',serif] text-[2rem] font-bold text-[#0b2614] mb-2 leading-tight tracking-tight">
                    Check your inbox
                  </h1>
                  <p className="text-sm text-stone-500 mb-1 leading-relaxed">
                    We sent a 4-digit code to
                  </p>
                  <p className="text-sm font-semibold text-emerald-700 mb-8 truncate">{email}</p>
                  {error && <ErrorBox message={error} />}
                  <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">
                    <div className="flex gap-3 justify-center">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKey(e, idx)}
                          className="w-16 h-16 rounded-2xl border-2 border-stone-200 bg-white text-center text-2xl font-bold text-[#0b2614] font-['Playfair_Display',serif] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all caret-transparent"
                        />
                      ))}
                    </div>
                    <SubmitBtn loading={loading} label="Verify code →" />
                    <div className="flex items-center gap-3 text-sm text-stone-400">
                      <div className="flex-1 h-px bg-stone-200" /><span>or</span><div className="flex-1 h-px bg-stone-200" />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setOtp(["","","",""]); setStep("email"); setError(""); }}
                      className="w-full text-center text-sm text-stone-400 hover:text-emerald-700 transition-colors font-medium"
                    >
                      ← Try a different email
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 3 — NEW PASSWORD */}
              {step === "reset" && (
                <motion.div key="reset" {...slide}>
                  <Eyebrow label="New Password" />
                  <h1 className="font-['Playfair_Display',serif] text-[2rem] font-bold text-[#0b2614] mb-2 leading-tight tracking-tight">
                    Set a new password
                  </h1>
                  <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                    Choose something strong — at least 8 characters.
                  </p>
                  {error && <ErrorBox message={error} />}
                  <form onSubmit={handleReset} noValidate className="space-y-5">
                    <FieldWrap label="New password">
                      <div className="relative">
                        <input
                          type={showPw.pw ? "text" : "password"}
                          value={passwords.pw}
                          onChange={(e) => setPasswords({ ...passwords, pw: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                        <button type="button" onClick={() => setShowPw(s => ({...s, pw: !s.pw}))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors text-sm">
                          {showPw.pw ? "🙈" : "👁"}
                        </button>
                      </div>
                    </FieldWrap>
                    <StrengthBar password={passwords.pw} />
                    <FieldWrap label="Confirm password">
                      <div className="relative">
                        <input
                          type={showPw.confirm ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                        <button type="button" onClick={() => setShowPw(s => ({...s, confirm: !s.confirm}))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors text-sm">
                          {showPw.confirm ? "🙈" : "👁"}
                        </button>
                      </div>
                    </FieldWrap>
                    <SubmitBtn loading={loading} label="Reset password →" />
                  </form>
                </motion.div>
              )}

              {/* STEP 4 — DONE */}
              {step === "done" && (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-4xl">
                    🌱
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-3xl font-bold text-[#0b2614] mb-3 tracking-tight">
                    Password reset!
                  </h1>
                  <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                    Your password has been updated. Sign in with your new credentials.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3.5 bg-gradient-to-br from-emerald-700 to-[#0b2614] text-white rounded-xl text-sm font-semibold tracking-wide hover:brightness-110 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    Back to login →
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ── shared sub-components ── */

function Eyebrow({ label }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[1.4px] text-emerald-700 mb-2 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      {label}
    </p>
  );
}

function FieldWrap({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-stone-500">{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium mb-5">
      ⚠ {message}
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 mt-1 bg-gradient-to-br from-emerald-700 to-[#0b2614] text-white rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.985] transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading
        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait…</>
        : label}
    </button>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  let s = 0;
  if (password.length >= 8)       s++;
  if (password.length >= 12)      s++;
  if (/[A-Z]/.test(password))    s++;
  if (/[0-9]/.test(password))    s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  const score = Math.min(s, 4);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors  = ["", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-emerald-500"];
  return (
    <div className="space-y-1.5 -mt-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-stone-200"}`} />
        ))}
      </div>
      <p className="text-xs text-stone-400 font-medium">{labels[score]}</p>
    </div>
  );
}