/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Login page — dark premium design, fully responsive.
*/
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useUser } from "../context/UserContext";

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
  const { login: contextLogin } = useUser();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(r => setStats(r.data))
      .catch(() => {});
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
      const res = await axios.post(`${BASE_URL}/api/auth/login`, form, { withCredentials: true });
      contextLogin(res.data);
      navigate("/Main");
    } catch {
      setErrors({ api: "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  const statItems = stats ? [
    { value: fmt(stats.totalLands), label: "Lands mapped" },
    { value: fmt(stats.approvedLands), label: "Verified sites" },
    { value: fmt(stats.treesPlanted), label: "Trees planted" },
    { value: fmt(stats.volunteers), label: "Volunteers" },
  ] : null;

  return (
    <>
      <Helmet>
        <title>{t("login.page_title", "TerraSpotter — Sign In")}</title>
        <meta name="description" content="Sign in to your TerraSpotter account." />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="min-h-screen flex bg-background text-foreground font-sans">

        {/* ─── LEFT PANEL — Hero ─── */}
        <motion.div
          className="hidden lg:flex flex-col justify-between w-[52%] xl:w-[55%] relative overflow-hidden px-14 xl:px-16 py-14 bg-[#071408]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background blobs */}
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-900/40 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-950/60 blur-[130px] pointer-events-none" />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          {/* Vertical rule */}
          <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

          {/* Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center shadow-lg shadow-primary/40">
                🌿
              </div>
              <span className="font-bold text-xl text-white/80 tracking-wide group-hover:text-white transition-colors">
                TerraSpotter
              </span>
            </Link>
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-[440px]">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9 }}>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-px bg-primary/60" />
                <span className="text-primary text-[11px] font-semibold tracking-[3px] uppercase">
                  {t("login.hero_supertitle", "Land for Green Futures")}
                </span>
              </div>

              <h1 className="text-[64px] xl:text-[72px] font-bold text-white leading-[0.92] tracking-tight mb-8">
                {t("login.hero_line_1", "Every barren")}<br />
                {t("login.hero_line_2", "plot deserves")}<br />
                <em className="not-italic text-primary">{t("login.hero_line_3", "to breathe.")}</em>
              </h1>

              <p className="text-white/40 text-[15px] leading-relaxed font-light max-w-[340px]">
                {t("login.hero_desc", "We transform unused land into verified green ecosystems — driven by community, data, and purpose.")}
              </p>
            </motion.div>

            {/* Stats grid */}
            {statItems ? (
              <motion.div className="grid grid-cols-2 gap-3 mt-12"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.7 }}>
                {statItems.map((s, i) => (
                  <motion.div key={s.label}
                    className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/20 transition-all duration-300 group cursor-default"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.06 }}>
                    <div className="text-[36px] font-bold text-primary leading-none mb-2 group-hover:text-emerald-400 transition-colors">
                      {s.value}
                    </div>
                    <div className="text-white/30 text-[10.5px] uppercase tracking-[1.4px] font-medium">{s.label}</div>
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

          <div className="relative z-10">
            <p className="text-white/20 text-xs leading-relaxed tracking-wide">
              Built for NGOs, institutions &amp; communities<br />committed to sustainable afforestation.
            </p>
          </div>
        </motion.div>

        {/* ─── RIGHT PANEL — Form ─── */}
        <motion.div
          className="flex-1 flex items-center justify-center bg-background px-6 py-16 lg:px-14 xl:px-20 relative"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
        >
          {/* Subtle glows */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-[120px] bg-primary/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-tr-[100px] bg-primary/3 pointer-events-none" />

          <div className="w-full max-w-[400px] relative z-10">

            {/* Mobile brand */}
            <div className="lg:hidden mb-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center text-base">🌿</div>
              <span className="font-bold text-xl text-foreground">TerraSpotter</span>
            </div>

            {/* Heading */}
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[2.5px] uppercase text-primary mb-4">
                <span className="w-4 h-px bg-primary" />
                {t("login.secure_sign_in", "Secure Sign-in")}
              </span>
              <h2 className="text-[42px] font-bold text-foreground leading-[1.05] tracking-tight">
                {t("login.welcome_1", "Welcome")}<br />{t("login.welcome_2", "back")}
              </h2>
              <p className="text-muted-foreground text-sm mt-3 font-light leading-relaxed">
                {t("login.instruction", "Sign in to your TerraSpotter workspace to continue.")}
              </p>
            </div>

            {/* API error */}
            <AnimatePresence>
              {errors.api && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 px-4 py-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-[13px] text-destructive font-medium mb-6"
                >
                  <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-[10px] shrink-0">!</span>
                  {errors.api}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-foreground/60 uppercase tracking-[1.2px]">Email address</label>
                <input
                  type="email" name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full h-12 px-4 bg-card border border-border rounded-xl text-sm text-foreground outline-none placeholder:text-muted-foreground transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/40"
                />
                {errors.email && <p className="text-[12px] text-destructive font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-foreground/60 uppercase tracking-[1.2px]">Password</label>
                  <Link to="/forgot-password" className="text-[12.5px] text-primary font-medium hover:text-primary/80 transition-colors">
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
                    className={`w-full h-12 pl-4 pr-12 bg-card border rounded-xl text-sm text-foreground outline-none placeholder:text-muted-foreground transition-all focus:ring-2 hover:border-primary/40 ${errors.password ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"}`}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-[12px] text-destructive font-medium">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="h-12 mt-2 w-full rounded-xl bg-primary text-primary-foreground text-[14.5px] font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-primary/40">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /><span>{t("login.signing_in", "Signing in…")}</span></>
                ) : (
                  <><span>{t("login.submit_btn", "Sign in")}</span><span className="text-primary-foreground/70">→</span></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-[1px] font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <GoogleLoginButton variant="dark" label="Continue with Google" />

            {/* Signup link */}
            <div className="text-center mt-6">
              <p className="text-[13.5px] text-muted-foreground">
                New to TerraSpotter?{" "}
                <Link to="/signup" className="text-foreground font-semibold hover:text-primary transition-colors">
                  Create your account →
                </Link>
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5 mt-10 pt-8 border-t border-border">
              {["🔒 Secure", "🇮🇳 India-first", "🌿 NGO-trusted"].map(badge => (
                <span key={badge} className="text-[11.5px] text-muted-foreground font-medium">{badge}</span>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </>
  );
}