/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Login page — Verdant Editorial redesign. Cormorant Garant + Outfit fonts.
*/
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

function fmt(n) {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export default function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(r => setStats(r.data))
      .catch(() => setStatsError(true));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, form, { withCredentials: true });
      window.dispatchEvent(new Event("login"));
      navigate("/Main");
    } catch {
      setErrors({ api: "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  const statItems = stats
    ? [
      { value: fmt(stats.totalLands), label: "Lands mapped" },
      { value: fmt(stats.approvedLands), label: "Verified sites" },
      { value: fmt(stats.treesPlanted), label: "Trees planted" },
      { value: fmt(stats.volunteers), label: "Volunteers" },
    ]
    : null;

  return (
    <>
      <Helmet>
        <title>{t("login.page_title", "TerraSpotter — Sign In")}</title>
        <meta name="description" content="Sign in to your TerraSpotter account." />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="min-h-screen flex font-['Outfit',sans-serif] bg-[#0b1d10]">

        {/* ─── LEFT PANEL ─── */}
        <motion.div
          className="hidden lg:flex flex-col justify-between w-[52%] xl:w-[55%] relative overflow-hidden px-16 py-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-[#0b1d10]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1d10] via-[#0f2916] to-[#071408]" />

          {/* Glow blobs */}
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#1a4d28] opacity-40 blur-[120px]" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#0e3318] opacity-60 blur-[130px]" />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-[#4db87a] opacity-[0.04] blur-[80px]" />

          {/* Dot grid texture */}
          <div className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Vertical rule */}
          <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[#4db87a]/20 to-transparent" />

          {/* Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 no-underline group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-base shadow-[0_0_20px_rgba(77,184,122,0.4)]">
                🌿
              </div>
              <span className="font-['Cormorant_Garant',serif] font-semibold text-xl text-white/80 tracking-wide group-hover:text-white transition-colors">
                TerraSpotter
              </span>
            </Link>
          </div>

          {/* Hero text */}
          <div className="relative z-10 max-w-[440px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-px bg-[#4db87a]/60" />
                <span className="text-[#4db87a] text-[11px] font-semibold tracking-[3px] uppercase">
                {t("login.hero_superti", "Land for Green Futures")}
                </span>
              </div>

              <h1 className="font-['Cormorant_Garant',serif] text-[68px] xl:text-[76px] font-semibold text-white leading-[0.92] tracking-[-1px] mb-8">
                {t("login.hero_line_1", "Every barren")}<br />
                {t("login.hero_line_2", "plot deserves")}<br />
                <em className="not-italic text-[#4db87a]">{t("login.hero_line_3", "to breathe.")}</em>
              </h1>

              <p className="text-white/40 text-[15px] leading-[1.85] font-light max-w-[340px]">
                {t("login.hero_desc", "We transform unused, barren and roadside land into verified green ecosystems — driven by community, data, and purpose.")}
              </p>
            </motion.div>

            {/* Stats grid */}
            {statItems ? (
              <motion.div
                className="grid grid-cols-2 gap-3 mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
              >
                {statItems.map((s, i) => (
                  <motion.div
                    key={s.label}
                    className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#4db87a]/20 transition-all duration-300 group"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                  >
                    <div className="font-['Cormorant_Garant',serif] text-[36px] font-semibold text-[#4db87a] leading-none mb-2 group-hover:text-[#6dd49a] transition-colors">
                      {s.value}
                    </div>
                    <div className="text-white/30 text-[10.5px] uppercase tracking-[1.4px] font-medium">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-12">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.03] animate-pulse">
                    <div className="h-8 w-16 rounded-lg bg-white/[0.08] mb-2" />
                    <div className="h-2.5 w-20 rounded bg-white/[0.05]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom caption */}
          <div className="relative z-10">
            <p className="text-white/18 text-xs leading-relaxed tracking-wide">
              Built for NGOs, institutions &amp; communities<br />committed to sustainable afforestation.
            </p>
          </div>
        </motion.div>

        {/* ─── RIGHT PANEL ─── */}
        <motion.div
          className="flex-1 flex items-center justify-center bg-[#f7f4ee] px-6 py-16 lg:px-14 xl:px-20 relative"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle warm texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f7f4ee] via-[#f4f0e8] to-[#f7f4ee]" />

          {/* Decorative corner element */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-[120px] bg-[#e8f5ee] opacity-60" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-tr-[100px] bg-[#e8f5ee] opacity-40" />

          <div className="w-full max-w-[400px] relative z-10">

            {/* Mobile brand */}
            <div className="lg:hidden mb-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-base">
                🌿
              </div>
              <span className="font-['Cormorant_Garant',serif] font-semibold text-xl text-[#0b1d10]">TerraSpotter</span>
            </div>

            {/* Heading */}
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[2.5px] uppercase text-[#4db87a] mb-4">
                <span className="w-4 h-px bg-[#4db87a]" />
                {t("login.secure_sign_in", "Secure Sign-in")}
              </span>
              <h2 className="font-['Cormorant_Garant',serif] text-[42px] font-semibold text-[#0c1e11] leading-[1.05] tracking-[-0.5px]">
                {t("login.welcome_1", "Welcome")}<br />{t("login.welcome_2", "back")}
              </h2>
              <p className="text-[#7a6d5e] text-sm mt-3 font-light leading-relaxed">
                {t("login.instruction", "Sign in to your TerraSpotter workspace to continue your work.")}
              </p>
            </div>

            {/* API error */}
            <AnimatePresence>
              {errors.api && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-200/80 rounded-xl text-[13px] text-red-700 font-medium mb-6"
                >
                  <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-[10px] shrink-0">!</span>
                  {errors.api}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

              {/* Email field */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[#3d3128] uppercase tracking-[1.2px]">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className="w-full h-12 pl-4 pr-4 bg-white border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] outline-none placeholder:text-[#b5ac9e] font-['Outfit',sans-serif] transition-all duration-200 focus:border-[#4db87a] focus:ring-4 focus:ring-[#4db87a]/10 focus:bg-white hover:border-[#c8bfb4]"
                  />
                </div>
                {errors.email && (
                  <p className="text-[12px] text-red-600 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#3d3128] uppercase tracking-[1.2px]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[12.5px] text-[#4db87a] font-medium no-underline hover:text-[#2d8a55] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className={`w-full h-12 pl-4 pr-12 bg-white border-[1.5px] rounded-xl text-sm text-[#0c1e11] outline-none placeholder:text-[#b5ac9e] font-['Outfit',sans-serif] transition-all duration-200 focus:ring-4 hover:border-[#c8bfb4] ${errors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30"
                        : "border-[#e0d8cf] focus:border-[#4db87a] focus:ring-[#4db87a]/10"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b5ac9e] hover:text-[#3d3128] transition-colors text-sm w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[12px] text-red-600 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="h-12 mt-2 w-full rounded-xl bg-[#0c1e11] text-white text-[14.5px] font-semibold tracking-[0.2px] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200 hover:bg-[#163d25] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(12,30,17,0.25)] hover:shadow-[0_6px_24px_rgba(12,30,17,0.3)]"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("login.signing_in", "Signing in…")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("login.submit_btn", "Sign in")}</span>
                    <span className="text-[#4db87a]">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-[#e0d8cf]" />
              <span className="text-[11px] text-[#b5ac9e] uppercase tracking-[1px] font-medium">or</span>
              <div className="flex-1 h-px bg-[#e0d8cf]" />
            </div>

            {/* Signup link */}
            <div className="text-center">
              <p className="text-[13.5px] text-[#7a6d5e]">
                New to TerraSpotter?{" "}
                <Link
                  to="/signup"
                  className="text-[#0c1e11] font-semibold no-underline hover:text-[#4db87a] transition-colors"
                >
                  Create your account →
                </Link>
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5 mt-10 pt-8 border-t border-[#e0d8cf]">
              {["🔒 Secure", "🇮🇳 India-first", "🌿 NGO-trusted"].map(badge => (
                <span key={badge} className="text-[11.5px] text-[#b5ac9e] font-medium">
                  {badge}
                </span>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </>
  );
}