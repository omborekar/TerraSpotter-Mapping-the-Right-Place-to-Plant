/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Signup page — Verdant Editorial redesign. Cormorant Garant + Outfit fonts.
*/
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const steps = [
  { n: 1, title: "Your identity", icon: "👤" },
  { n: 2, title: "Your credentials", icon: "🔐" },
];

export default function Signup() {
  const [form, setForm] = useState({
    fname: "", lname: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.fname.trim()) e.fname = "First name is required";
    if (!form.lname.trim()) e.lname = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/signup`, form, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed. Try again.";
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>TerraSpotter — Create Account</title>
        <meta name="description" content="Join TerraSpotter and help green India's barren lands." />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="min-h-screen flex font-['Outfit',sans-serif]">

        {/* ─── LEFT DECORATIVE PANEL ─── */}
        <div className="hidden lg:flex flex-col justify-between w-[44%] xl:w-[48%] relative overflow-hidden px-14 xl:px-16 py-14 bg-[#f2ede4]">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ede8de] to-[#f5f0e6]" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-bl-[140px] bg-[#e0f0e8] opacity-70" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-tr-[120px] bg-[#e4ede0] opacity-50" />
          <div className="absolute top-[45%] right-[15%] w-40 h-40 rounded-full bg-[#4db87a] opacity-[0.08] blur-3xl" />

          {/* Dot texture */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #0c1e11 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 no-underline group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#163d25] to-[#4db87a] flex items-center justify-center text-base shadow-[0_4px_16px_rgba(77,184,122,0.3)]">
                🌿
              </div>
              <span className="font-['Cormorant_Garant',serif] font-semibold text-xl text-[#0c1e11] tracking-wide">
                TerraSpotter
              </span>
            </Link>
          </div>

          {/* Center content */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-7">
              <div className="w-6 h-px bg-[#4db87a]" />
              <span className="text-[#4db87a] text-[10.5px] font-semibold tracking-[3px] uppercase">
                Join the movement
              </span>
            </div>

            <h2 className="font-['Cormorant_Garant',serif] text-[58px] xl:text-[64px] font-semibold text-[#0c1e11] leading-[0.92] tracking-[-0.8px] mb-7">
              Plant roots.<br />
              Grow a<br />
              <em className="not-italic text-[#2d8a55]">legacy.</em>
            </h2>

            <p className="text-[#6b5e4e] text-[14.5px] leading-[1.9] font-light max-w-[310px]">
              Join thousands of land owners, volunteers and NGOs building India's green future — one mapped parcel at a time.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-3.5 mt-10">
              {[
                ["🗺️", "Submit land parcels with polygon mapping"],
                ["🌱", "Get matched with local planting volunteers"],
                ["📊", "Track plantation progress & CO₂ impact"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/60 border border-[#d0c9bc] flex items-center justify-center text-sm shrink-0 mt-0.5">
                    {icon}
                  </span>
                  <span className="text-[13.5px] text-[#5c5044] leading-[1.7] font-light">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative z-10 text-[12px] text-[#b5ac9e] tracking-wide">
            Free to join · No credit card required
          </div>
        </div>

        {/* ─── RIGHT FORM PANEL ─── */}
        <motion.div
          className="flex-1 flex items-center justify-center bg-[#0b1d10] px-6 py-16 lg:px-12 xl:px-16 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background glow */}
          <div className="absolute top-[-5%] right-[-5%] w-[420px] h-[420px] rounded-full bg-[#1a4d28] opacity-30 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[380px] h-[380px] rounded-full bg-[#0e3318] opacity-40 blur-[90px]" />

          <div className="w-full max-w-[420px] relative z-10">

            {/* Mobile brand */}
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#163d25] to-[#4db87a] flex items-center justify-center text-base">
                🌿
              </div>
              <span className="font-['Cormorant_Garant',serif] font-semibold text-xl text-white">TerraSpotter</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[2.5px] uppercase text-[#4db87a] mb-4">
                <span className="w-4 h-px bg-[#4db87a]" />
                Create account
              </span>
              <h2 className="font-['Cormorant_Garant',serif] text-[40px] font-semibold text-white leading-[1.05] tracking-[-0.5px]">
                Start your<br />green journey
              </h2>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              {steps.map((s, i) => (
                <div key={s.n} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-300 ${step === s.n
                      ? "bg-[#4db87a] border-[#4db87a] text-[#0c1e11]"
                      : step > s.n
                        ? "bg-[#163d25] border-[#2d6e3e] text-[#4db87a]"
                        : "bg-transparent border-white/15 text-white/35"
                    }`}>
                    <span>{step > s.n ? "✓" : s.n}</span>
                    <span>{s.title}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-px transition-all duration-300 ${step > 1 ? "bg-[#4db87a]/40" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* API error */}
            <AnimatePresence>
              {errors.api && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 px-4 py-3.5 bg-red-900/20 border border-red-500/20 rounded-xl text-[13px] text-red-400 font-medium mb-6"
                >
                  <span className="shrink-0">⚠</span>
                  {errors.api}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input style helper */}
            {/* Step 1 */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  onSubmit={e => { e.preventDefault(); nextStep(); }}
                  noValidate
                  className="flex flex-col gap-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10.5px] font-semibold text-white/50 uppercase tracking-[1.2px]">
                        First name <span className="text-[#4db87a]">*</span>
                      </label>
                      <input
                        name="fname"
                        placeholder="Arjun"
                        value={form.fname}
                        onChange={handleChange}
                        className={`h-12 px-4 bg-white/[0.07] border rounded-xl text-sm text-white outline-none placeholder:text-white/25 font-['Outfit',sans-serif] transition-all duration-200 focus:ring-2 hover:border-white/20 ${errors.fname
                            ? "border-red-500/40 focus:border-red-400 focus:ring-red-500/10"
                            : "border-white/10 focus:border-[#4db87a] focus:ring-[#4db87a]/10 focus:bg-white/[0.09]"
                          }`}
                      />
                      {errors.fname && <p className="text-[11px] text-red-400 font-medium">{errors.fname}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10.5px] font-semibold text-white/50 uppercase tracking-[1.2px]">
                        Last name <span className="text-[#4db87a]">*</span>
                      </label>
                      <input
                        name="lname"
                        placeholder="Sharma"
                        value={form.lname}
                        onChange={handleChange}
                        className={`h-12 px-4 bg-white/[0.07] border rounded-xl text-sm text-white outline-none placeholder:text-white/25 font-['Outfit',sans-serif] transition-all duration-200 focus:ring-2 hover:border-white/20 ${errors.lname
                            ? "border-red-500/40 focus:border-red-400 focus:ring-red-500/10"
                            : "border-white/10 focus:border-[#4db87a] focus:ring-[#4db87a]/10 focus:bg-white/[0.09]"
                          }`}
                      />
                      {errors.lname && <p className="text-[11px] text-red-400 font-medium">{errors.lname}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10.5px] font-semibold text-white/50 uppercase tracking-[1.2px]">
                      Email address <span className="text-[#4db87a]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className={`h-12 px-4 bg-white/[0.07] border rounded-xl text-sm text-white outline-none placeholder:text-white/25 font-['Outfit',sans-serif] transition-all duration-200 focus:ring-2 hover:border-white/20 ${errors.email
                          ? "border-red-500/40 focus:border-red-400 focus:ring-red-500/10"
                          : "border-white/10 focus:border-[#4db87a] focus:ring-[#4db87a]/10 focus:bg-white/[0.09]"
                        }`}
                    />
                    {errors.email && <p className="text-[11px] text-red-400 font-medium">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    className="h-12 mt-2 w-full rounded-xl bg-[#4db87a] text-[#0c1e11] text-[14.5px] font-semibold tracking-[0.2px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:bg-[#5dcf8a] active:scale-[0.98] shadow-[0_4px_20px_rgba(77,184,122,0.25)]"
                  >
                    Continue
                    <span>→</span>
                  </button>
                </motion.form>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-[10.5px] font-semibold text-white/50 uppercase tracking-[1.2px]">
                      Password <span className="text-[#4db87a]">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={`h-12 px-4 bg-white/[0.07] border rounded-xl text-sm text-white outline-none placeholder:text-white/25 font-['Outfit',sans-serif] transition-all duration-200 focus:ring-2 hover:border-white/20 ${errors.password
                          ? "border-red-500/40 focus:border-red-400 focus:ring-red-500/10"
                          : "border-white/10 focus:border-[#4db87a] focus:ring-[#4db87a]/10 focus:bg-white/[0.09]"
                        }`}
                    />
                    {errors.password && <p className="text-[11px] text-red-400 font-medium">{errors.password}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10.5px] font-semibold text-white/50 uppercase tracking-[1.2px]">
                      Confirm password <span className="text-[#4db87a]">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={`h-12 px-4 bg-white/[0.07] border rounded-xl text-sm text-white outline-none placeholder:text-white/25 font-['Outfit',sans-serif] transition-all duration-200 focus:ring-2 hover:border-white/20 ${errors.confirmPassword
                          ? "border-red-500/40 focus:border-red-400 focus:ring-red-500/10"
                          : "border-white/10 focus:border-[#4db87a] focus:ring-[#4db87a]/10 focus:bg-white/[0.09]"
                        }`}
                    />
                    {errors.confirmPassword && <p className="text-[11px] text-red-400 font-medium">{errors.confirmPassword}</p>}
                  </div>

                  {/* Password strength hint */}
                  {form.password && (
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${form.password.length >= i * 3
                            ? i <= 2 ? "bg-amber-400" : "bg-[#4db87a]"
                            : "bg-white/10"
                          }`} />
                      ))}
                      <span className="text-[11px] text-white/30 ml-1">
                        {form.password.length < 6 ? "Weak" : form.password.length < 10 ? "Fair" : "Strong"}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-12 px-5 rounded-xl border border-white/15 text-white/60 text-sm font-medium cursor-pointer transition-all duration-200 hover:border-white/30 hover:text-white hover:bg-white/[0.06]"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 rounded-xl bg-[#4db87a] text-[#0c1e11] text-[14.5px] font-semibold tracking-[0.2px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:bg-[#5dcf8a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(77,184,122,0.25)]"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#0c1e11]/30 border-t-[#0c1e11] rounded-full animate-spin" />
                          Creating…
                        </>
                      ) : (
                        <>Create account 🌱</>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Sign in link */}
            <p className="text-center text-[13.5px] text-white/40 mt-8">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#4db87a] font-semibold no-underline hover:text-[#6dd49a] transition-colors"
              >
                Sign in →
              </Link>
            </p>

            <p className="text-center text-[11px] text-white/18 mt-5 leading-relaxed">
              By creating an account you agree to our Terms of Service<br />and Privacy Policy.
            </p>

          </div>
        </motion.div>

      </div>
    </>
  );
}