import { useTranslation } from "react-i18next";
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Forgot password — Verdant Editorial redesign. Cormorant Garant + Outfit.
*/
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const STEPS = ["email", "otp", "reset", "done"];

// ─── Step progress bar ────────────────────────────────────────
function StepProgress({ current }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1.5 mb-10">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`h-[3px] rounded-full transition-all duration-500 ${i < idx ? "bg-[#4db87a] w-8"
              : i === idx ? "bg-[#4db87a] w-8"
                : "bg-[#e0d8cf] w-4"
            }`}
        />
      ))}
      <span className="ml-2 text-[10.5px] font-semibold text-[#b5ac9e] uppercase tracking-[1.2px] font-['Outfit',sans-serif]">
        Step {Math.min(idx + 1, 3)} of 3
      </span>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────
function Eyebrow({ label }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <div className="w-4 h-px bg-[#4db87a]" />
      <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#4db87a] font-['Outfit',sans-serif]">
        {label}
      </span>
    </div>
  );
}

function FieldWrap({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#3d3128] font-['Outfit',sans-serif]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex items-center gap-2.5 px-4 py-3.5 bg-red-50 border border-red-200/80 rounded-xl text-[13px] text-red-700 font-medium mb-5 font-['Outfit',sans-serif]"
    >
      <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-[10px] shrink-0">!</span>
      {message}
    </motion.div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-12 mt-1 rounded-xl bg-[#0c1e11] text-white text-[14.5px] font-semibold font-['Outfit',sans-serif] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200 hover:bg-[#163d25] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(12,30,17,0.25)]"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {t("auto.auto_137", "Please wait…")}
        </>
      ) : label}
    </button>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  let s = 0;
  if (password.length >= 8) s++;
  if (password.length >= 12) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  const score = Math.min(s, 4);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-[#4db87a]"];
  return (
    <div className="flex flex-col gap-1.5 -mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-[#e0d8cf]"}`} />
        ))}
      </div>
      <p className="text-[11.5px] text-[#b5ac9e] font-medium font-['Outfit',sans-serif]">{labels[score]}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [passwords, setPasswords] = useState({ pw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ pw: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpString = otp.join("");

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
    } finally { setLoading(false); }
  };

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
    } finally { setLoading(false); }
  };

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
    } finally { setLoading(false); }
  };

  const slide = {
    initial: { opacity: 0, x: 28 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -28 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  };

  const inputCls = "w-full h-12 px-4 bg-white border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] outline-none placeholder:text-[#b5ac9e] font-['Outfit',sans-serif] transition-all duration-200 focus:border-[#4db87a] focus:ring-4 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4]";

  return (
    <>
      <Helmet>
        <title>{t("auto.auto_139", "TerraSpotter — Reset Password")}</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="min-h-screen flex font-['Outfit',sans-serif]">

        {/* ── LEFT PANEL ── */}
        <motion.div
          className="hidden lg:flex flex-col justify-between w-[48%] xl:w-[52%] relative overflow-hidden px-14 xl:px-16 py-14 bg-[#0c1e11]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1e11] via-[#0f2916] to-[#071408]" />
          <div className="absolute top-[-8%] right-[-5%] w-[480px] h-[480px] rounded-full bg-[#163d25] opacity-35 blur-[120px]" />
          <div className="absolute bottom-[-12%] left-[-8%] w-[420px] h-[420px] rounded-full bg-[#0e3318] opacity-50 blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[#4db87a]/15 to-transparent" />

          {/* Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 no-underline group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-base shadow-[0_0_20px_rgba(77,184,122,0.4)]">🌿</div>
              <span className="font-['Cormorant_Garant',serif] font-semibold text-xl text-white/80 tracking-wide group-hover:text-white transition-colors">
                {t("auto.auto_140", "TerraSpotter")}
              </span>
            </Link>
          </div>

          {/* Hero text */}
          <div className="relative z-10 max-w-[420px]">
            <div className="text-[72px] leading-none mb-8 select-none">🌳</div>
            <div className="flex items-center gap-2 mb-7">
              <div className="w-8 h-px bg-[#4db87a]/50" />
              <span className="text-[#4db87a] text-[11px] font-semibold tracking-[3px] uppercase font-['Outfit',sans-serif]">
                {t("auto.auto_141", "Account Security")}
              </span>
            </div>
            <h2 className="font-['Cormorant_Garant',serif] text-[58px] xl:text-[64px] font-semibold text-white leading-[0.92] tracking-[-0.8px] mb-6">
              {t("auto.auto_142", "Roots run deep.")}<br />
              <em className="not-italic text-[#4db87a]">{t("auto.auto_143", "So does security.")}</em>
            </h2>
            <p className="text-white/40 text-[14.5px] leading-[1.85] font-light max-w-[340px]">
              {t("auto.auto_144", "Reset your password safely. Your account — and the land you help protect — stays yours.")}
            </p>

            {/* Security badges */}
            <div className="flex flex-wrap gap-2 mt-8">
              {["Secure Reset", "OTP Verified", "BCrypt Encrypted"].map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.09] text-[11px] font-medium text-white/40 font-['Outfit',sans-serif]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4db87a] inline-block" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <p className="text-white/18 text-xs tracking-wide font-['Outfit',sans-serif]">
              {t("auto.auto_145", "© 2026 TerraSpotter · Afforestation Intelligence Platform")}
            </p>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          className="flex-1 flex items-center justify-center bg-[#f7f4ee] px-6 py-16 lg:px-14 xl:px-20 relative overflow-hidden"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#f7f4ee] via-[#f4f0e8] to-[#f7f4ee]" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-[120px] bg-[#e8f5ee] opacity-60" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-tr-[100px] bg-[#e8f5ee] opacity-40" />

          <div className="w-full max-w-[400px] relative z-10">

            {/* Mobile brand */}
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-base">🌿</div>
              <span className="font-['Cormorant_Garant',serif] font-semibold text-xl text-[#0c1e11]">{t("auto.auto_146", "TerraSpotter")}</span>
            </div>

            {/* Back link */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#b5ac9e] hover:text-[#4db87a] transition-colors mb-8 no-underline font-['Outfit',sans-serif]"
            >
              {t("auto.auto_147", "← Back to Login")}
            </Link>

            {/* Progress dots */}
            {step !== "done" && <StepProgress current={step} />}

            <AnimatePresence mode="wait">

              {/* STEP 1 — EMAIL */}
              {step === "email" && (
                <motion.div key="email" {...slide}>
                  <Eyebrow label="Password Recovery" />
                  <h1 className="font-['Cormorant_Garant',serif] text-[38px] font-semibold text-[#0c1e11] leading-[1.0] tracking-[-0.5px] mb-2">
                    {t("auto.auto_148", "Forgot your")}<br />{t("auto.auto_149", "password?")}
                  </h1>
                  <p className="text-[13.5px] text-[#7a6d5e] mb-8 leading-relaxed font-light">
                    {t("auto.auto_150", "Enter your registered email and we'll send a 4-digit verification code.")}
                  </p>
                  <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>
                  <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-5">
                    <FieldWrap label="Email address">
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" autoComplete="email"
                        className={inputCls}
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
                  <h1 className="font-['Cormorant_Garant',serif] text-[38px] font-semibold text-[#0c1e11] leading-[1.0] tracking-[-0.5px] mb-2">
                    {t("auto.auto_151", "Check your inbox")}
                  </h1>
                  <p className="text-[13.5px] text-[#7a6d5e] mb-1 leading-relaxed font-light">
                    {t("auto.auto_152", "We sent a 4-digit code to")}
                  </p>
                  <p className="text-[14px] font-semibold text-[#4db87a] mb-8 truncate font-['Outfit',sans-serif]">{email}</p>

                  <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>

                  <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-6">
                    {/* OTP boxes */}
                    <div className="flex gap-3 justify-center">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(e.target.value, idx)}
                          onKeyDown={e => handleOtpKey(e, idx)}
                          className="w-16 h-16 rounded-2xl border-2 border-[#e0d8cf] bg-white text-center text-[28px] font-semibold text-[#0c1e11] font-['Cormorant_Garant',serif] outline-none focus:border-[#4db87a] focus:ring-4 focus:ring-[#4db87a]/10 transition-all caret-transparent hover:border-[#c8bfb4]"
                        />
                      ))}
                    </div>

                    <SubmitBtn loading={loading} label="Verify code →" />

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-[#e0d8cf]" />
                      <span className="text-[11.5px] text-[#b5ac9e] font-medium font-['Outfit',sans-serif]">{t("auto.auto_153", "or")}</span>
                      <div className="flex-1 h-px bg-[#e0d8cf]" />
                    </div>

                    <button
                      type="button"
                      onClick={() => { setOtp(["", "", "", ""]); setStep("email"); setError(""); }}
                      className="text-center text-[13px] text-[#b5ac9e] hover:text-[#4db87a] transition-colors font-medium font-['Outfit',sans-serif] cursor-pointer"
                    >
                      {t("auto.auto_154", "← Try a different email")}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 3 — NEW PASSWORD */}
              {step === "reset" && (
                <motion.div key="reset" {...slide}>
                  <Eyebrow label="New Password" />
                  <h1 className="font-['Cormorant_Garant',serif] text-[38px] font-semibold text-[#0c1e11] leading-[1.0] tracking-[-0.5px] mb-2">
                    {t("auto.auto_155", "Set a new")}<br />{t("auto.auto_156", "password")}
                  </h1>
                  <p className="text-[13.5px] text-[#7a6d5e] mb-8 leading-relaxed font-light">
                    {t("auto.auto_157", "Choose something strong — at least 8 characters.")}
                  </p>

                  <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>

                  <form onSubmit={handleReset} noValidate className="flex flex-col gap-5">
                    <FieldWrap label="New password">
                      <div className="relative">
                        <input
                          type={showPw.pw ? "text" : "password"}
                          value={passwords.pw}
                          onChange={e => setPasswords({ ...passwords, pw: e.target.value })}
                          placeholder="••••••••" autoComplete="new-password"
                          className={inputCls + " pr-12"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(s => ({ ...s, pw: !s.pw }))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b5ac9e] hover:text-[#3d3128] transition-colors text-sm w-6 h-6 flex items-center justify-center cursor-pointer"
                        >
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
                          onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                          placeholder="••••••••" autoComplete="new-password"
                          className={inputCls + " pr-12"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b5ac9e] hover:text-[#3d3128] transition-colors text-sm w-6 h-6 flex items-center justify-center cursor-pointer"
                        >
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
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <motion.div
                    className="w-20 h-20 mx-auto mb-7 rounded-2xl bg-gradient-to-br from-[#2d6e3e] to-[#0c1e11] flex items-center justify-center text-4xl shadow-[0_8px_32px_rgba(12,30,17,0.25)]"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", bounce: 0.4 }}
                  >
                    🌱
                  </motion.div>

                  <div className="inline-flex items-center gap-2 mb-5">
                    <div className="w-4 h-px bg-[#4db87a]" />
                    <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#4db87a] font-['Outfit',sans-serif]">{t("auto.auto_158", "Success")}</span>
                    <div className="w-4 h-px bg-[#4db87a]" />
                  </div>

                  <h1 className="font-['Cormorant_Garant',serif] text-[38px] font-semibold text-[#0c1e11] mb-3 tracking-[-0.5px] leading-tight">
                    {t("auto.auto_159", "Password reset!")}
                  </h1>
                  <p className="text-[13.5px] text-[#7a6d5e] mb-9 leading-relaxed font-light max-w-[280px] mx-auto">
                    {t("auto.auto_160", "Your password has been updated. Sign in with your new credentials.")}
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full h-12 rounded-xl bg-[#0c1e11] text-white text-[14.5px] font-semibold font-['Outfit',sans-serif] flex items-center justify-center gap-2 hover:bg-[#163d25] transition-all cursor-pointer shadow-[0_4px_16px_rgba(12,30,17,0.25)]"
                  >
                    {t("auto.auto_161", "Back to login")} <span className="text-[#4db87a]">→</span>
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