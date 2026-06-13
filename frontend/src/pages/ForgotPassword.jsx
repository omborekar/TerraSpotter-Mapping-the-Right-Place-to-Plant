/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Forgot password — dark-first Tailwind design, fully responsive.
*/
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const STEPS = ["email", "otp", "reset", "done"];

function StepProgress({ current }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1.5 mb-10">
      {[0, 1, 2].map(i => (
        <div key={i}
          className={`h-[3px] rounded-full transition-all duration-500 ${i <= idx ? "bg-primary w-8" : "bg-border w-4"}`}
        />
      ))}
      <span className="ml-2 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[1.2px]">
        Step {Math.min(idx + 1, 3)} of 3
      </span>
    </div>
  );
}

function Eyebrow({ label }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <div className="w-4 h-px bg-primary" />
      <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-primary">{label}</span>
    </div>
  );
}

function FieldWrap({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-[1.2px] text-foreground/60">{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex items-center gap-2.5 px-4 py-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-[13px] text-destructive font-medium mb-5">
      <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-[10px] shrink-0">!</span>
      {message}
    </motion.div>
  );
}

function SubmitBtn({ loading, label }) {
  const { t } = useTranslation();
  return (
    <button type="submit" disabled={loading}
      className="w-full h-12 mt-1 rounded-xl bg-primary text-primary-foreground text-[14.5px] font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/25">
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-primary"];
  return (
    <div className="flex flex-col gap-1.5 -mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-border"}`} />
        ))}
      </div>
      <p className="text-[11.5px] text-muted-foreground font-medium">{labels[score]}</p>
    </div>
  );
}

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
      await axios.post(`${BASE_URL}/api/auth/forgot-password/reset`, { email, otp: otpString, newPassword: passwords.pw });
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

  const inputCls = "w-full h-12 px-4 bg-card border border-border rounded-xl text-sm text-foreground outline-none placeholder:text-muted-foreground transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/40";

  return (
    <>
      <Helmet>
        <title>{t("auto.auto_139", "TerraSpotter — Reset Password")}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="min-h-screen flex bg-background text-foreground">

        {/* ── LEFT PANEL ── */}
        <motion.div
          className="hidden lg:flex flex-col justify-between w-[48%] xl:w-[52%] relative overflow-hidden px-14 xl:px-16 py-14 bg-[#0c1e11]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1e11] via-[#0f2916] to-[#071408]" />
          <div className="absolute top-[-8%] right-[-5%] w-[480px] h-[480px] rounded-full bg-emerald-900/35 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-12%] left-[-8%] w-[420px] h-[420px] rounded-full bg-emerald-950/50 blur-[110px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center text-base shadow-lg shadow-primary/40">🌿</div>
              <span className="font-bold text-xl text-white/80 tracking-wide group-hover:text-white transition-colors">TerraSpotter</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-[420px]">
            <div className="text-[72px] leading-none mb-8 select-none">🌳</div>
            <div className="flex items-center gap-2 mb-7">
              <div className="w-8 h-px bg-primary/50" />
              <span className="text-primary text-[11px] font-semibold tracking-[3px] uppercase">
                {t("auto.auto_141", "Account Security")}
              </span>
            </div>
            <h2 className="text-[56px] xl:text-[64px] font-bold text-white leading-[0.92] tracking-tight mb-6">
              {t("auto.auto_142", "Roots run deep.")}<br />
              <em className="not-italic text-primary">{t("auto.auto_143", "So does security.")}</em>
            </h2>
            <p className="text-white/40 text-[14.5px] leading-relaxed font-light max-w-[340px]">
              {t("auto.auto_144", "Reset your password safely. Your account — and the land you help protect — stays yours.")}
            </p>
            <div className="flex flex-wrap gap-2 mt-8">
              {["Secure Reset", "OTP Verified", "BCrypt Encrypted"].map(b => (
                <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.09] text-[11px] font-medium text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />{b}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-white/20 text-xs tracking-wide">{t("auto.auto_145", "© 2026 TerraSpotter · Afforestation Intelligence Platform")}</p>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          className="flex-1 flex items-center justify-center bg-background px-6 py-16 lg:px-14 xl:px-20 relative overflow-hidden"
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-[120px] bg-primary/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-tr-[100px] bg-primary/3 pointer-events-none" />

          <div className="w-full max-w-[400px] relative z-10">
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center text-base">🌿</div>
              <span className="font-bold text-xl text-foreground">TerraSpotter</span>
            </div>

            <Link to="/login" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-primary transition-colors mb-8">
              {t("auto.auto_147", "← Back to Login")}
            </Link>

            {step !== "done" && <StepProgress current={step} />}

            <AnimatePresence mode="wait">
              {/* STEP 1 — EMAIL */}
              {step === "email" && (
                <motion.div key="email" {...slide}>
                  <Eyebrow label="Password Recovery" />
                  <h1 className="text-[38px] font-bold text-foreground leading-[1.0] tracking-tight mb-2">
                    {t("auto.auto_148", "Forgot your")}<br />{t("auto.auto_149", "password?")}
                  </h1>
                  <p className="text-[13.5px] text-muted-foreground mb-8 leading-relaxed font-light">
                    {t("auto.auto_150", "Enter your registered email and we'll send a 4-digit verification code.")}
                  </p>
                  <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>
                  <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-5">
                    <FieldWrap label="Email address">
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" autoComplete="email" className={inputCls} />
                    </FieldWrap>
                    <SubmitBtn loading={loading} label="Send verification code →" />
                  </form>
                </motion.div>
              )}

              {/* STEP 2 — OTP */}
              {step === "otp" && (
                <motion.div key="otp" {...slide}>
                  <Eyebrow label="Verification" />
                  <h1 className="text-[38px] font-bold text-foreground leading-[1.0] tracking-tight mb-2">
                    {t("auto.auto_151", "Check your inbox")}
                  </h1>
                  <p className="text-[13.5px] text-muted-foreground mb-1 leading-relaxed font-light">{t("auto.auto_152", "We sent a 4-digit code to")}</p>
                  <p className="text-[14px] font-semibold text-primary mb-8 truncate">{email}</p>
                  <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>
                  <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-6">
                    <div className="flex gap-3 justify-center">
                      {otp.map((digit, idx) => (
                        <input key={idx} id={`otp-${idx}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={e => handleOtpChange(e.target.value, idx)}
                          onKeyDown={e => handleOtpKey(e, idx)}
                          className="w-16 h-16 rounded-2xl border-2 border-border bg-card text-center text-[28px] font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all caret-transparent hover:border-primary/40"
                        />
                      ))}
                    </div>
                    <SubmitBtn loading={loading} label="Verify code →" />
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[11.5px] text-muted-foreground font-medium">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <button type="button" onClick={() => { setOtp(["", "", "", ""]); setStep("email"); setError(""); }}
                      className="text-center text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer">
                      {t("auto.auto_154", "← Try a different email")}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 3 — RESET */}
              {step === "reset" && (
                <motion.div key="reset" {...slide}>
                  <Eyebrow label="New Password" />
                  <h1 className="text-[38px] font-bold text-foreground leading-[1.0] tracking-tight mb-2">
                    {t("auto.auto_155", "Set a new")}<br />{t("auto.auto_156", "password")}
                  </h1>
                  <p className="text-[13.5px] text-muted-foreground mb-8 leading-relaxed font-light">
                    {t("auto.auto_157", "Choose something strong — at least 8 characters.")}
                  </p>
                  <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>
                  <form onSubmit={handleReset} noValidate className="flex flex-col gap-5">
                    <FieldWrap label="New password">
                      <div className="relative">
                        <input type={showPw.pw ? "text" : "password"} value={passwords.pw}
                          onChange={e => setPasswords({ ...passwords, pw: e.target.value })}
                          placeholder="••••••••" autoComplete="new-password" className={inputCls + " pr-12"} />
                        <button type="button" onClick={() => setShowPw(s => ({ ...s, pw: !s.pw }))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPw.pw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FieldWrap>
                    <StrengthBar password={passwords.pw} />
                    <FieldWrap label="Confirm password">
                      <div className="relative">
                        <input type={showPw.confirm ? "text" : "password"} value={passwords.confirm}
                          onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                          placeholder="••••••••" autoComplete="new-password" className={inputCls + " pr-12"} />
                        <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FieldWrap>
                    <SubmitBtn loading={loading} label="Reset password →" />
                  </form>
                </motion.div>
              )}

              {/* STEP 4 — DONE */}
              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} className="text-center">
                  <motion.div className="w-20 h-20 mx-auto mb-7 rounded-2xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center text-4xl shadow-lg shadow-primary/25"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", bounce: 0.4 }}>
                    🌱
                  </motion.div>
                  <div className="inline-flex items-center gap-2 mb-5">
                    <div className="w-4 h-px bg-primary" />
                    <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-primary">{t("auto.auto_158", "Success")}</span>
                    <div className="w-4 h-px bg-primary" />
                  </div>
                  <h1 className="text-[38px] font-bold text-foreground mb-3 tracking-tight leading-tight">{t("auto.auto_159", "Password reset!")}</h1>
                  <p className="text-[13.5px] text-muted-foreground mb-9 leading-relaxed font-light max-w-[280px] mx-auto">
                    {t("auto.auto_160", "Your password has been updated. Sign in with your new credentials.")}
                  </p>
                  <button onClick={() => navigate("/login")}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[14.5px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/25">
                    {t("auto.auto_161", "Back to login")} <span>→</span>
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