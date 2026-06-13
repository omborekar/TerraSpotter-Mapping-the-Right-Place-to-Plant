/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Signup page — dark-first Tailwind, 3-step flow (details → OTP → done).
*/
import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import GoogleLoginButton from "../components/GoogleLoginButton";

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

// 4-box OTP input
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
    <div className="flex gap-3 justify-center my-7">
      {[0, 1, 2, 3].map(i => {
        const filled = chars[i] && chars[i] !== " ";
        return (
          <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
            value={filled ? chars[i] : ""}
            onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste}
            onChange={() => {}}
            disabled={disabled}
            autoFocus={i === 0}
            className={`w-[60px] h-[70px] text-center text-[30px] font-bold rounded-xl border-2 outline-none transition-all caret-transparent ${
              filled
                ? "border-primary bg-primary/10 text-foreground shadow-md shadow-primary/20"
                : "border-border bg-card text-foreground hover:border-primary/40"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        );
      })}
    </div>
  );
}

// Step progress
function Steps({ step }) {
  const labels = ["Details", "Verify Email", "Done"];
  return (
    <div className="flex items-center mb-9">
      {labels.map((l, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                done ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : active ? "bg-primary/20 border-2 border-primary text-primary"
                    : "bg-secondary border border-border text-muted-foreground"
              }`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-[0.7px] whitespace-nowrap transition-colors ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {l}
              </span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const perks = [
  { icon: "🗺️", title: "Map any land", desc: "Draw a polygon boundary on our live map and submit in minutes." },
  { icon: "🤝", title: "Get volunteers", desc: "Verified land gets matched with local planters and NGOs." },
  { icon: "🌱", title: "AI plant advice", desc: "ML model picks native species based on your soil and climate." },
  { icon: "🏆", title: "Earn XP & badges", desc: "Level up as you contribute to India's green future." },
];

const inputCls = (error) =>
  `w-full h-11 px-3.5 bg-card border rounded-xl text-[14px] text-foreground outline-none placeholder:text-muted-foreground transition-all focus:ring-2 hover:border-primary/40 ${
    error ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"
  }`;

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
      setResendSecs(s => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; });
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
      setErrors({ api: err.response?.data?.message || err.response?.data || "Failed to send OTP. Try again." });
    } finally { setLoading(false); }
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
      setOtpError(err.response?.data?.message || err.response?.data || "Invalid or expired OTP.");
    } finally { setOtpLoading(false); }
  };

  const handleResend = async () => {
    if (resendSecs > 0) return;
    try {
      await axios.post(`${BASE_URL}/api/auth/send-otp`, { email: form.email, fname: form.fname });
      setOtp(""); setOtpError(""); startResendTimer();
    } catch { setOtpError("Failed to resend. Please try again."); }
  };

  const strength = getStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-primary"];

  return (
    <>
      <Helmet>
        <title>TerraSpotter — Create Account</title>
        <meta name="description" content="Create your TerraSpotter account and start mapping land for afforestation." />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="min-h-screen flex bg-background text-foreground">

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between w-[380px] xl:w-[420px] relative overflow-hidden px-10 py-12 bg-[#071408] shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#071408] via-[#0c1e11] to-[#0a1a0d]" />
          <div className="absolute top-[-10%] right-[-10%] w-[380px] h-[380px] rounded-full bg-emerald-900/40 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-950/60 blur-[130px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
          <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

          {/* Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center shadow-lg shadow-primary/40 text-sm">🌿</div>
              <span className="font-bold text-[18px] text-white/80 tracking-wide group-hover:text-white transition-colors">TerraSpotter</span>
            </Link>
          </div>

          {/* Hero copy */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-px bg-primary/60" />
              <span className="text-primary text-[10px] font-semibold tracking-[3px] uppercase">India's Land Platform</span>
            </div>
            <h2 className="text-[44px] xl:text-[50px] font-bold text-white leading-[0.92] tracking-tight mb-5">
              Plant a<br /><em className="not-italic text-primary">legacy</em>
            </h2>
            <p className="text-white/40 text-[13.5px] leading-relaxed font-light mb-9 max-w-[280px]">
              Join thousands mapping India's barren land for afforestation. One account opens the entire ecosystem.
            </p>

            {/* Perks */}
            <div className="flex flex-col gap-4">
              {perks.map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-sm shrink-0 mt-0.5">{p.icon}</div>
                  <div>
                    <div className="text-[13px] font-semibold text-white">{p.title}</div>
                    <div className="text-[11.5px] text-white/40 leading-snug">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 border-t border-white/[0.07] pt-5">
            <p className="text-white/20 text-[11px] leading-relaxed">
              © 2026 TerraSpotter · Built by Om Borekar<br />Afforestation Intelligence Platform 🇮🇳
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 overflow-y-auto bg-background px-6 py-12 md:px-14 xl:px-20 flex items-start justify-center">
          <div className="w-full max-w-[500px] relative z-10">

            {/* Mobile brand */}
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center text-sm">🌿</div>
              <span className="font-bold text-[18px] text-foreground">TerraSpotter</span>
            </div>

            <Steps step={step} />

            {/* ── STEP 0 — FORM ── */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-7">
                    <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[2.5px] uppercase text-primary mb-3">
                      <span className="w-4 h-px bg-primary" /> New Account
                    </span>
                    <h1 className="text-[38px] font-bold text-foreground leading-[1.05] tracking-tight">
                      Create your<br /><em className="not-italic text-primary">workspace</em>
                    </h1>
                    <p className="text-muted-foreground text-[13.5px] mt-2 font-light">
                      Already have one? <Link to="/login" className="text-foreground font-semibold hover:text-primary transition-colors">Sign in →</Link>
                    </p>
                  </div>

                  {errors.api && (
                    <div className="flex items-center gap-2.5 px-4 py-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-[13px] text-destructive font-medium mb-5">
                      <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-[10px] shrink-0">!</span>
                      {errors.api}
                    </div>
                  )}

                  <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-0">
                    {/* Name row */}
                    <div className="flex items-center gap-1.5 my-5 text-[10.5px] font-bold uppercase tracking-[1.3px] text-muted-foreground">
                      Personal Info <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-foreground/60">First name</label>
                        <input name="fname" placeholder="Om" value={form.fname} onChange={handleChange} className={inputCls(errors.fname)} />
                        {errors.fname && <p className="text-[12px] text-destructive font-medium">{errors.fname}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-foreground/60">Last name</label>
                        <input name="lname" placeholder="Borekar" value={form.lname} onChange={handleChange} className={inputCls(errors.lname)} />
                        {errors.lname && <p className="text-[12px] text-destructive font-medium">{errors.lname}</p>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-4">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-foreground/60">Email address</label>
                      <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className={inputCls(errors.email)} />
                      {errors.email && <p className="text-[12px] text-destructive font-medium">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-foreground/60">Phone number</label>
                        <input name="phoneNo" placeholder="10-digit" value={form.phoneNo} onChange={handleChange} className={inputCls(errors.phoneNo)} />
                        {errors.phoneNo && <p className="text-[12px] text-destructive font-medium">{errors.phoneNo}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-foreground/60">Date of birth</label>
                        <input name="dob" type="date" value={form.dob} onChange={handleChange} className={inputCls(errors.dob)} />
                        {errors.dob && <p className="text-[12px] text-destructive font-medium">{errors.dob}</p>}
                      </div>
                    </div>

                    {/* Password section */}
                    <div className="flex items-center gap-1.5 my-5 text-[10.5px] font-bold uppercase tracking-[1.3px] text-muted-foreground">
                      Security <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="flex flex-col gap-1.5 mb-2">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-foreground/60">Password</label>
                      <div className="relative">
                        <input name="password" type={showPw ? "text" : "password"} placeholder="••••••••"
                          value={form.password} onChange={handleChange}
                          className={inputCls(errors.password) + " pr-11"} />
                        <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {form.password && (
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className={`flex-1 h-[3px] rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : "bg-border"}`} />
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium">{strengthLabel}</p>
                        </div>
                      )}
                      {errors.password && <p className="text-[12px] text-destructive font-medium">{errors.password}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5 mb-5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-foreground/60">Confirm password</label>
                      <div className="relative">
                        <input name="confirmPassword" type={showCp ? "text" : "password"} placeholder="••••••••"
                          value={form.confirmPassword} onChange={handleChange}
                          className={inputCls(errors.confirmPassword) + " pr-11"} />
                        <button type="button" onClick={() => setShowCp(v => !v)} tabIndex={-1}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showCp ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-[12px] text-destructive font-medium">{errors.confirmPassword}</p>}
                    </div>

                    <button type="submit" disabled={loading}
                      className="h-12 w-full rounded-xl bg-primary text-primary-foreground text-[14.5px] font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/25">
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /><span>Sending OTP…</span></>
                        : <><span>Continue</span><span className="text-primary-foreground/70">→</span></>}
                    </button>
                  </form>

                  <div className="flex items-center gap-4 my-7">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground uppercase tracking-[1px] font-medium">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <GoogleLoginButton variant="dark" label="Sign up with Google" />
                </motion.div>
              )}

              {/* ── STEP 1 — OTP ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-3xl">📧</div>
                    <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[2.5px] uppercase text-primary mb-3">
                      <span className="w-4 h-px bg-primary" /> Verify Email
                    </span>
                    <h2 className="text-[32px] font-bold text-foreground leading-tight tracking-tight">Check your inbox</h2>
                    <p className="text-muted-foreground text-[13.5px] mt-2 font-light">
                      We sent a 4-digit code to
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mt-2 mb-4">
                      <span className="text-[13px] font-semibold text-primary">{form.email}</span>
                    </div>
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-2.5 px-4 py-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-[13px] text-destructive font-medium mb-4">
                      <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-[10px] shrink-0">!</span>
                      {otpError}
                    </div>
                  )}

                  <OtpInput value={otp} onChange={setOtp} disabled={otpLoading} />

                  <button onClick={handleVerifyOtp} disabled={otpLoading || otp.replace(/\s/g, "").length < 4}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[14.5px] font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/25 mb-5">
                    {otpLoading
                      ? <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /><span>Verifying…</span></>
                      : "Verify & Create Account →"}
                  </button>

                  <div className="flex flex-col items-center gap-2">
                    <button type="button" disabled={resendSecs > 0} onClick={handleResend}
                      className="text-[13px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 font-medium">
                      {resendSecs > 0 ? `Resend in ${resendSecs}s` : "Resend code"}
                    </button>
                    <button type="button" onClick={() => { setStep(0); setOtp(""); setOtpError(""); }}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                      ← Change email
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2 — DONE ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <motion.div className="w-20 h-20 mx-auto mb-7 rounded-2xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center text-4xl shadow-lg shadow-primary/25"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", bounce: 0.4 }}>
                    🌱
                  </motion.div>

                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-4 h-px bg-primary" />
                    <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-primary">Account Created</span>
                    <div className="w-4 h-px bg-primary" />
                  </div>

                  <h2 className="text-[36px] font-bold text-foreground mb-3 tracking-tight">Welcome, {form.fname}! 🎉</h2>
                  <p className="text-muted-foreground text-[14px] leading-relaxed mb-10 max-w-[320px] mx-auto">
                    Your TerraSpotter account is ready. Sign in now and start mapping land for a greener India.
                  </p>

                  <button onClick={() => navigate("/login")}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[14.5px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/25 mb-4">
                    Go to Login →
                  </button>
                  <button onClick={() => navigate("/")}
                    className="w-full h-10 rounded-xl border border-border text-muted-foreground text-[14px] font-medium hover:text-foreground hover:border-primary/30 transition-all">
                    Explore TerraSpotter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </>
  );
}