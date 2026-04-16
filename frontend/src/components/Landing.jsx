/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Landing page — Verdant Editorial redesign. Cormorant Garant + Outfit fonts.
*/
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Animated counter ────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !target) return;
    const num = parseFloat(target);
    const dur = 1800;
    const steps = 60;
    const inc = num / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + inc, num);
      setCount(Number.isInteger(num) ? Math.floor(cur) : parseFloat(cur.toFixed(1)));
      if (cur >= num) clearInterval(t);
    }, dur / steps);
    return () => clearInterval(t);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {target
        ? count >= 1000
          ? (count / 1000).toFixed(1).replace(".0", "") + "k"
          : count
        : "—"}
      {suffix}
    </span>
  );
}

// ─── Fade-in wrapper ──────────────────────────────────────────
function FadeIn({ children, delay = 0, y = 24, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Landing ─────────────────────────────────────────────
export default function Landing() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`).then(r => setStats(r.data)).catch(() => { });
  }, []);

  return (
    <>
      <Helmet>
        <title>TerraSpotter — Land for Green Futures</title>
        <meta name="description" content="Map barren land. Connect with volunteers. Build India's green future." />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="font-['Outfit',sans-serif] bg-[#0b1d10] text-white overflow-x-hidden">

        {/* ════════════ HERO ════════════ */}
        <section className="relative min-h-screen flex flex-col">

          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1d10] via-[#0e2514] to-[#071408]" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-[#163d25] opacity-30 blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#0e3318] opacity-40 blur-[130px]" />
          <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-[#4db87a] opacity-[0.04] blur-[90px]" />

          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />


          {/* ── HERO CONTENT ── */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 sm:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#4db87a]/20 bg-[#4db87a]/8 text-[#4db87a] text-[12px] font-semibold tracking-[2px] uppercase mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4db87a] animate-pulse" />
              {t("landing.platform_label", "India's Land-to-Forest Platform")}
            </motion.div>

            <motion.h1
              className="font-['Cormorant_Garant',serif] text-[58px] sm:text-[76px] md:text-[88px] xl:text-[104px] font-semibold text-white leading-[0.88] tracking-[-2px] max-w-[900px] mx-auto"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("landing.hero1", "Map it.")}{" "}
              <em className="not-italic text-[#4db87a]">{t("landing.hero2", "Green it.")}</em>
              <br />
              {t("landing.hero3", "Legacy built.")}
            </motion.h1>

            <motion.p
              className="text-white/45 text-[15px] sm:text-[17px] leading-[1.85] font-light max-w-[520px] mt-8 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
            >
              {t("landing.subtitle", "Submit barren land with polygon mapping. Get matched with volunteers. Watch India's green cover grow — one verified parcel at a time.")}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.6 }}
            >
              <Link
                to="/Main"
                className="px-8 py-4 rounded-xl bg-[#4db87a] text-[#0c1e11] text-[15px] font-semibold no-underline hover:bg-[#5dcf8a] transition-all duration-200 shadow-[0_6px_28px_rgba(77,184,122,0.35)] active:scale-[0.97] whitespace-nowrap"
              >
                {t("landing.cta_start", "Submit land parcel →")}
              </Link>
              <Link
                to="/browse"
                className="px-8 py-4 rounded-xl border border-white/15 text-white/70 text-[15px] font-medium no-underline hover:text-white hover:border-white/35 hover:bg-white/[0.06] transition-all duration-200 whitespace-nowrap"
              >
                {t("landing.cta_explore", "Browse all lands")}
              </Link>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <span className="text-[11px] tracking-[2px] uppercase font-medium">Scroll</span>
              <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
          </div>
        </section>

        {/* ════════════ STATS BAND ════════════ */}
        <section className="relative bg-[#f7f4ee] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f2ede3] to-[#f7f4ee]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4db87a]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4db87a]/20 to-transparent" />

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-16 sm:py-20 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {[
              { label: t("landing.stats_mapped", "Lands mapped"), value: stats?.totalLands, suffix: "" },
              { label: t("landing.stats_verified", "Verified sites"), value: stats?.approvedLands, suffix: "" },
              { label: t("landing.stats_planted", "Trees planted"), value: stats?.treesPlanted, suffix: "" },
              { label: t("landing.stats_vols", "Active volunteers"), value: stats?.volunteers, suffix: "" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.08} className="flex flex-col items-center lg:items-start text-center lg:text-left lg:px-10 lg:border-l lg:first:border-l-0 lg:border-[#e0d8cf]">
                <div className="font-['Cormorant_Garant',serif] text-[52px] sm:text-[60px] font-semibold text-[#0c1e11] leading-none mb-2 tracking-[-1px]">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[11.5px] text-[#8a7d6e] uppercase tracking-[1.8px] font-semibold">{s.label}</div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ════════════ HOW IT WORKS ════════════ */}
        <section className="relative bg-[#0b1d10] py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1d10] via-[#0d2213] to-[#0b1d10]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#163d25] opacity-20 blur-[160px]" />

          <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-10">
            <FadeIn className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 mb-5">
                <div className="w-8 h-px bg-[#4db87a]/40" />
                <span className="text-[#4db87a] text-[11px] font-semibold tracking-[3px] uppercase">
                  {t("landing.process_superti", "The process")}
                </span>
                <div className="w-8 h-px bg-[#4db87a]/40" />
              </div>
              <h2 className="font-['Cormorant_Garant',serif] text-[50px] sm:text-[60px] font-semibold text-white leading-[0.95] tracking-[-0.8px]">
                {t("landing.process_line_1", "From empty land")}<br />
                {t("landing.process_line_2", "to ")}<em className="not-italic text-[#4db87a]">{t("landing.process_line_3", "living forest")}</em>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-3xl overflow-hidden border border-white/[0.06]">
              {[
                {
                  step: "01",
                  icon: "🗺️",
                  title: t("landing.s1_t", "Map the land"),
                  desc: t("landing.s1_d", "Draw a polygon boundary on our interactive map. Mark the exact parcel, add photos and ownership details."),
                },
                {
                  step: "02",
                  icon: "🔍",
                  title: t("landing.s2_t", "Verification"),
                  desc: t("landing.s2_d", "Our team cross-checks your submission via satellite imagery, soil data, and climate APIs."),
                },
                {
                  step: "03",
                  icon: "🌱",
                  title: t("landing.s3_t", "Species matching"),
                  desc: t("landing.s3_d", "Native tree species are recommended based on soil type, rainfall patterns, and local ecology."),
                },
                {
                  step: "04",
                  icon: "🤝",
                  title: t("landing.s4_t", "Volunteer match"),
                  desc: t("landing.s4_d", "Verified land gets matched with local NGOs, government bodies, and community volunteers."),
                },
              ].map((s, i) => (
                <FadeIn key={s.step} delay={i * 0.1} className="bg-[#0f2916] p-7 xl:p-9 flex flex-col gap-5 hover:bg-[#122e1a] transition-colors duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="font-['Cormorant_Garant',serif] text-[13px] font-semibold text-white/20 tracking-[2px]">
                      {s.step}
                    </span>
                    <span className="w-10 h-10 rounded-xl bg-[#163d25] border border-[#4db87a]/15 flex items-center justify-center text-lg group-hover:border-[#4db87a]/35 transition-colors">
                      {s.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-['Cormorant_Garant',serif] text-[22px] font-semibold text-white mb-2 leading-tight">{s.title}</h3>
                    <p className="text-white/40 text-[13.5px] leading-[1.75] font-light">{s.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ IMPACT HIGHLIGHT ════════════ */}
        <section className="relative bg-[#f2ede3] py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ede8dc] via-[#f2ede3] to-[#f5f0e7]" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-bl-[200px] bg-[#d8ecdf] opacity-60" />

          <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              {/* Left text */}
              <FadeIn>
                <div className="flex items-center gap-2 mb-7">
                  <div className="w-6 h-px bg-[#2d8a55]" />
                <span className="text-[#2d8a55] text-[11px] font-semibold tracking-[3px] uppercase">
                    {t("landing.impact_superti", "Environmental impact")}
                  </span>
                </div>
                <h2 className="font-['Cormorant_Garant',serif] text-[50px] sm:text-[58px] font-semibold text-[#0c1e11] leading-[0.93] tracking-[-0.8px] mb-7">
                  {t("landing.impact_l1", "Small plots.")}<br />
                  <em className="not-italic text-[#2d8a55]">{t("landing.impact_l2", "Massive impact.")}</em>
                </h2>
                <p className="text-[#6b5e4e] text-[15px] leading-[1.85] font-light mb-10 max-w-[400px]">
                  {t("landing.impact_desc", "Even a 500m² barren patch, when planted with native species, can reduce local surface temperature by 2–4°C, recharge groundwater, and capture carbon for decades.")}
                </p>
                <Link
                  to="/plantationShowcase"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0c1e11] no-underline border-b-2 border-[#4db87a] pb-0.5 hover:text-[#2d8a55] transition-colors"
                >
                  {t("landing.impact_cta", "View the showcase →")}
                </Link>
              </FadeIn>

              {/* Right: feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "🌡️", title: t("landing.f1_t", "2–4°C cooler"), desc: t("landing.f1_d", "Plantation sites reduce surrounding surface temperature within 6 months.") },
                  { icon: "💧", title: t("landing.f2_t", "Groundwater up"), desc: t("landing.f2_d", "Native roots improve aquifer recharge rates in barren and rocky terrain.") },
                  { icon: "🌬️", title: t("landing.f3_t", "CO₂ captured"), desc: t("landing.f3_d", "Each verified tree sequesters ~21kg CO₂ annually — for decades.") },
                  { icon: "🦋", title: t("landing.f4_t", "Biodiversity"), desc: t("landing.f4_d", "Native species selections support local pollinators and bird habitats.") },
                ].map((f, i) => (
                  <FadeIn key={f.title} delay={i * 0.08}>
                    <div className="p-6 rounded-2xl bg-white border border-[#e8e2d8] hover:border-[#4db87a]/30 hover:shadow-[0_8px_32px_rgba(77,184,122,0.1)] transition-all duration-300 group h-full">
                      <span className="text-2xl mb-4 block">{f.icon}</span>
                      <h4 className="font-['Cormorant_Garant',serif] text-[20px] font-semibold text-[#0c1e11] mb-2 group-hover:text-[#2d8a55] transition-colors">{f.title}</h4>
                      <p className="text-[#8a7d6e] text-[13px] leading-[1.7] font-light">{f.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ COMMUNITY CTA ════════════ */}
        <section className="relative bg-[#0b1d10] py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1d10] to-[#0f2916]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#163d25] opacity-25 blur-[150px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#0e3318] opacity-35 blur-[130px]" />

          <div className="relative z-10 max-w-[780px] mx-auto px-6 text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#4db87a]/20 bg-[#4db87a]/8 text-[#4db87a] text-[11.5px] font-semibold tracking-[2px] uppercase mb-9">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4db87a] animate-pulse" />
                {t("landing.comm_superti", "Join the community")}
              </div>
              <h2 className="font-['Cormorant_Garant',serif] text-[52px] sm:text-[68px] xl:text-[76px] font-semibold text-white leading-[0.9] tracking-[-1.2px] mb-7">
                {t("landing.comm_l1", "Own land?")}<br />
                <em className="not-italic text-[#4db87a]">{t("landing.comm_l2", "Make it count.")}</em>
              </h2>
              <p className="text-white/45 text-[16px] leading-[1.85] font-light mb-12 max-w-[500px] mx-auto">
                {t("landing.comm_desc", "Whether it's a roadside strip or a vacant plot — every boundary you draw brings India one step closer to its green future.")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="px-9 py-4 rounded-xl bg-[#4db87a] text-[#0c1e11] text-[15.5px] font-semibold no-underline hover:bg-[#5dcf8a] transition-all duration-200 shadow-[0_6px_32px_rgba(77,184,122,0.4)] active:scale-[0.97] whitespace-nowrap"
                >
                  {t("landing.comm_cta1", "Create free account →")}
                </Link>
                <Link
                  to="/community"
                  className="px-9 py-4 rounded-xl border border-white/15 text-white/65 text-[15.5px] font-medium no-underline hover:text-white hover:border-white/35 hover:bg-white/[0.05] transition-all duration-200 whitespace-nowrap"
                >
                  {t("landing.comm_cta2", "Explore community")}
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ════════════ FOOTER ════════════ */}
        <footer className="relative bg-[#071408] border-t border-white/[0.07]">
          <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-14 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

              {/* Brand */}
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-base shadow-[0_0_16px_rgba(77,184,122,0.3)]">
                    🌿
                  </div>
                  <span className="font-['Cormorant_Garant',serif] font-semibold text-xl text-white">TerraSpotter</span>
                </div>
                <p className="text-white/30 text-[13px] leading-[1.8] font-light max-w-[220px]">
                  Transforming India's unused land into green ecosystems, one verified parcel at a time.
                </p>
              </div>

              {/* Platform links */}
              <div>
                <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-[2px] mb-5">Platform</h4>
                <div className="flex flex-col gap-3">
                  {[
                    ["/Main", "Submit Land"],
                    ["/browse", "Browse Lands"],
                    ["/plantationShowcase", "Showcase"],
                    ["/community", "Community"],
                  ].map(([to, label]) => (
                    <Link key={to} to={to} className="text-[13.5px] text-white/40 no-underline hover:text-white/80 transition-colors font-light">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-[2px] mb-5">Company</h4>
                <div className="flex flex-col gap-3">
                  {[
                    ["/about", "About us"],
                    ["/contact", "Contact"],
                  ].map(([to, label]) => (
                    <Link key={to} to={to} className="text-[13.5px] text-white/40 no-underline hover:text-white/80 transition-colors font-light">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account */}
              <div>
                <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-[2px] mb-5">Account</h4>
                <div className="flex flex-col gap-3">
                  {[
                    ["/login", "Sign in"],
                    ["/signup", "Create account"],
                  ].map(([to, label]) => (
                    <Link key={to} to={to} className="text-[13.5px] text-white/40 no-underline hover:text-white/80 transition-colors font-light">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.07]">
              <p className="text-white/18 text-[12px] font-light tracking-wide">
                © 2026 TerraSpotter · Built by Om Borekar · India 🇮🇳
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4db87a] animate-pulse" />
                <span className="text-[#4db87a]/60 text-[11.5px] font-medium">Live platform</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}