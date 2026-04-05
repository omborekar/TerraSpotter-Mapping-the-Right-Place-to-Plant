/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Login page — Tailwind CSS only, nature theme, with forgot password link.
*/
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

function fmt(n) {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export default function Login() {
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const navigate = useNavigate();

  const [stats,      setStats]      = useState(null);
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

  const statTiles = stats
    ? [
        { num: fmt(stats.totalLands),    lbl: "Lands mapped",  icon: "🗺️" },
        { num: fmt(stats.approvedLands), lbl: "Verified sites", icon: "✅" },
        { num: fmt(stats.treesPlanted),  lbl: "Trees planted",  icon: "🌳" },
        { num: fmt(stats.volunteers),    lbl: "Volunteers",     icon: "🤝" },
      ]
    : Array(4).fill(null);

  return (
    <>
      <Helmet>
        <title>TerraSpotter — Login</title>
        <meta name="description" content="Sign in to your TerraSpotter account." />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-['DM_Sans',sans-serif]">

        {/* ── LEFT PANEL ── */}
        <motion.div
          className="hidden lg:flex flex-col justify-between bg-[#163d25] relative overflow-hidden p-14"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Layered radial atmosphere */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-[480px] h-[480px] rounded-full bg-[rgba(92,184,122,0.20)] blur-3xl -translate-x-1/4 translate-y-1/4" />
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[rgba(22,61,37,0.55)] blur-2xl" />
            <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-[rgba(37,102,56,0.12)] blur-3xl -translate-x-1/2 -translate-y-1/2" />
            {/* Subtle organic grid texture */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          {/* Brand */}
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 no-underline font-['Playfair_Display',serif] font-bold text-[22px] text-white tracking-tight"
            >
              <span className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#256638] to-[#5cb87a] flex items-center justify-center text-[15px] shadow-lg shadow-[rgba(58,140,87,0.28)] shrink-0">
                🌿
              </span>
              TerraSpotter
            </Link>
          </div>

          {/* Headline + desc */}
          <div className="relative z-10">
            <h1 className="font-['Playfair_Display',serif] text-[44px] leading-[1.10] tracking-[-0.6px] text-white mb-5">
              Every plot of land<br />
              deserves a <em className="not-italic text-[#5cb87a]">future</em>
            </h1>
            <p className="text-[14.5px] text-white/55 leading-[1.80] max-w-[330px]">
              Turning unused, barren, and roadside land into verified green ecosystems —
              one boundary at a time.
            </p>

            {/* LIVE STATS */}
            <div className="grid grid-cols-2 gap-3 mt-13 mt-12">
              {statTiles.map((tile, i) =>
                tile === null ? (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/[0.09] rounded-2xl p-[18px_20px] min-h-[82px] relative overflow-hidden"
                  >
                    {/* shimmer skeleton */}
                    <div
                      className="h-6 rounded-md mb-2 w-[52%] animate-pulse bg-white/10"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    />
                    <div
                      className="h-2.5 rounded w-[72%] animate-pulse bg-white/[0.07]"
                      style={{ animationDelay: `${i * 0.08 + 0.06}s` }}
                    />
                  </div>
                ) : (
                  <motion.div
                    key={tile.lbl}
                    className="group bg-white/5 border border-white/[0.09] rounded-2xl p-[18px_20px] min-h-[82px] relative overflow-hidden hover:bg-white/[0.09] hover:border-[rgba(92,184,122,0.25)] transition-all duration-200 cursor-default"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                  >
                    {/* top shimmer line on hover */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(92,184,122,0.5)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="text-[13px] mb-2 opacity-70">{tile.icon}</div>
                    <div className="font-['Playfair_Display',serif] text-[28px] text-[#5cb87a] leading-none tracking-[-0.5px]">
                      {tile.num}
                    </div>
                    <div className="text-[10.5px] text-white/38 uppercase tracking-[1.1px] mt-1.5 font-medium">
                      {tile.lbl}
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </div>

          <div className="relative z-10 text-[12px] text-white/25 leading-[1.7] tracking-[0.01em]">
            Built for institutions, NGOs, and communities<br />
            committed to sustainable afforestation.
          </div>
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          className="flex items-center justify-center bg-[#fdfbf8] px-6 py-16 lg:px-[68px] relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Warm grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.018]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              backgroundSize: "200px 200px",
            }}
          />

          <div className="w-full max-w-[380px] relative z-10">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1.4px] text-[#3a8c57] mb-3">
              <span className="w-[5px] h-[5px] rounded-full bg-[#5cb87a] inline-block" />
              Secure Sign-in
            </div>

            <h1 className="font-['Playfair_Display',serif] text-[34px] font-bold text-[#163d25] tracking-[-0.4px] mb-1.5 leading-tight">
              Welcome back
            </h1>
            <p className="text-[14px] text-[#6b6457] mb-9 leading-relaxed">
              Sign in to your TerraSpotter workspace
            </p>

            {/* API error */}
            {errors.api && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200/70 rounded-[9px] text-[13px] text-[#b03a2e] font-medium mb-5">
                ⚠ {errors.api}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold text-[#4a3f36] uppercase tracking-[0.8px]">
                  Email address
                </label>
                <input
                  className={`w-full px-[15px] py-3 border-[1.5px] rounded-[9px] font-['DM_Sans',sans-serif] text-[14px] text-[#111] outline-none bg-white placeholder:text-[#a89e93] transition-all duration-200 focus:border-[#3a8c57] focus:ring-2 focus:ring-[rgba(58,140,87,0.18)] focus:bg-[#fdfffe] ${errors.email ? "border-[#b03a2e] bg-[#fdf3f2] ring-2 ring-[rgba(176,58,46,0.08)]" : "border-[#e8e2da]"}`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="text-[12px] text-[#b03a2e] font-medium">{errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11.5px] font-semibold text-[#4a3f36] uppercase tracking-[0.8px]">
                    Password
                  </label>
                  {/* ── FORGOT PASSWORD LINK ── */}
                  <Link
                    to="/forgot-password"
                    className="text-[12px] font-medium text-[#3a8c57] hover:text-[#163d25] transition-colors no-underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <input
                    className={`w-full px-[15px] py-3 pr-[46px] border-[1.5px] rounded-[9px] font-['DM_Sans',sans-serif] text-[14px] text-[#111] outline-none bg-white placeholder:text-[#a89e93] transition-all duration-200 focus:border-[#3a8c57] focus:ring-2 focus:ring-[rgba(58,140,87,0.18)] focus:bg-[#fdfffe] ${errors.password ? "border-[#b03a2e] bg-[#fdf3f2] ring-2 ring-[rgba(176,58,46,0.08)]" : "border-[#e8e2da]"}`}
                    type={showPw ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-[13px] bg-transparent border-none cursor-pointer text-[15px] text-[#a89e93] hover:text-[#163d25] transition-colors p-0 leading-none"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[12px] text-[#b03a2e] font-medium">{errors.password}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-[13.5px] mt-2 bg-gradient-to-br from-[#256638] to-[#163d25] text-white border-none rounded-[9px] font-['DM_Sans',sans-serif] text-[14.5px] font-semibold cursor-pointer flex items-center justify-center gap-2 tracking-[0.02em] shadow-[0_3px_14px_rgba(58,140,87,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] hover:brightness-110 hover:shadow-[0_5px_20px_rgba(58,140,87,0.28)] active:scale-[0.985] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3.5 my-6 text-[12px] text-[#a89e93] font-medium tracking-[0.05em] uppercase">
              <div className="flex-1 h-px bg-[#e8e2da]" />
              or
              <div className="flex-1 h-px bg-[#e8e2da]" />
            </div>

            {/* Sign-up row */}
            <p className="text-center text-[13.5px] text-[#6b6457]">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#3a8c57] font-semibold no-underline hover:text-[#163d25] transition-colors"
              >
                Create one free →
              </Link>
            </p>

          </div>
        </motion.div>
      </div>
    </>
  );
}