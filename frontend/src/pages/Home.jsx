/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Landing page — dark-first, fully responsive Tailwind design.
*/
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

const BASE_URL = import.meta.env.VITE_API_URL;

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

function FadeIn({ children, delay = 0, y = 24, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`).then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("landing.page_title", "TerraSpotter — Land for Green Futures")}</title>
        <meta name="description" content="Map barren land. Connect with volunteers. Build India's green future." />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="bg-background text-foreground overflow-x-hidden">

        {/* ══ HERO ══ */}
        <section className="relative min-h-screen flex flex-col overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1d10] via-[#0e2514] to-[#071408]" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-emerald-900/30 blur-[160px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-950/40 blur-[130px] pointer-events-none" />
          <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[90px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize: "56px 56px" }}
          />

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 sm:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/8 text-primary text-[12px] font-semibold tracking-[2px] uppercase mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {t("landing.platform_label", "India's Land-to-Forest Platform")}
            </motion.div>

            <motion.h1
              className="text-[56px] sm:text-[74px] md:text-[88px] xl:text-[104px] font-bold text-white leading-[0.88] tracking-tight max-w-[900px] mx-auto"
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.9 }}
            >
              {t("landing.hero1", "Map it.")}{" "}
              <em className="not-italic text-primary">{t("landing.hero2", "Green it.")}</em>
              <br />{t("landing.hero3", "Legacy built.")}
            </motion.h1>

            <motion.p
              className="text-white/45 text-[15px] sm:text-[17px] leading-relaxed font-light max-w-[520px] mt-8 mb-12"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
            >
              {t("landing.subtitle", "Submit barren land with polygon mapping. Get matched with volunteers. Watch India's green cover grow — one verified parcel at a time.")}
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.6 }}>
              <Link to="/main" className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/35 active:scale-[0.97] whitespace-nowrap">
                {t("landing.cta_start", "Submit land parcel →")}
              </Link>
              <Link to="/browse" className="px-8 py-4 rounded-xl border border-white/15 text-white/70 text-[15px] font-medium hover:text-white hover:border-white/35 hover:bg-white/[0.06] transition-all duration-200 whitespace-nowrap">
                {t("landing.cta_explore", "Browse all lands")}
              </Link>
            </motion.div>

            <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              <span className="text-[11px] tracking-[2px] uppercase font-medium">Scroll</span>
              <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
          </div>
        </section>

        {/* ══ STATS BAND ══ */}
        <section className="relative bg-card border-y border-border overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-14 sm:py-20 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {[
              { label: t("landing.stats_mapped", "Lands mapped"), value: stats?.totalLands },
              { label: t("landing.stats_verified", "Verified sites"), value: stats?.approvedLands },
              { label: t("landing.stats_planted", "Trees planted"), value: stats?.treesPlanted },
              { label: t("landing.stats_vols", "Active volunteers"), value: stats?.volunteers },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.08}
                className="flex flex-col items-center lg:items-start text-center lg:text-left lg:px-10 lg:border-l lg:first:border-l-0 border-border">
                <div className="text-[50px] sm:text-[58px] font-bold text-primary leading-none mb-2 tracking-tight">
                  <Counter target={s.value} />
                </div>
                <div className="text-[11.5px] text-muted-foreground uppercase tracking-[1.8px] font-semibold">{s.label}</div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="relative bg-background py-24 sm:py-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-900/20 blur-[160px] pointer-events-none" />
          <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-10">
            <FadeIn className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 mb-5">
                <div className="w-8 h-px bg-primary/40" />
                <span className="text-primary text-[11px] font-semibold tracking-[3px] uppercase">{t("landing.process_superti", "The process")}</span>
                <div className="w-8 h-px bg-primary/40" />
              </div>
              <h2 className="text-[46px] sm:text-[56px] font-bold text-foreground leading-[0.95] tracking-tight">
                {t("landing.process_line_1", "From empty land")}<br />
                {t("landing.process_line_2", "to ")}<em className="not-italic text-primary">{t("landing.process_line_3", "living forest")}</em>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-3xl overflow-hidden border border-border">
              {[
                { step: "01", icon: "🗺️", title: t("landing.s1_t", "Map the land"), desc: t("landing.s1_d", "Draw a polygon boundary on our interactive map. Mark the exact parcel, add photos and ownership details.") },
                { step: "02", icon: "🔍", title: t("landing.s2_t", "Verification"), desc: t("landing.s2_d", "Our team cross-checks your submission via satellite imagery, soil data, and climate APIs.") },
                { step: "03", icon: "🌱", title: t("landing.s3_t", "Species matching"), desc: t("landing.s3_d", "Native tree species are recommended based on soil type, rainfall patterns, and local ecology.") },
                { step: "04", icon: "🤝", title: t("landing.s4_t", "Volunteer match"), desc: t("landing.s4_d", "Verified land gets matched with local NGOs, government bodies, and community volunteers.") },
              ].map((s, i) => (
                <FadeIn key={s.step} delay={i * 0.1}
                  className="bg-card p-7 xl:p-9 flex flex-col gap-5 hover:bg-secondary transition-colors duration-300 group cursor-default">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-muted-foreground/50 tracking-[2px]">{s.step}</span>
                    <span className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-lg group-hover:border-primary/35 transition-colors">{s.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-foreground mb-2 leading-tight">{s.title}</h3>
                    <p className="text-muted-foreground text-[13.5px] leading-relaxed font-light">{s.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ══ IMPACT HIGHLIGHT ══ */}
        <section className="relative bg-card border-y border-border py-24 sm:py-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-bl-[200px] bg-primary/5 pointer-events-none" />
          <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              <FadeIn>
                <div className="flex items-center gap-2 mb-7">
                  <div className="w-6 h-px bg-primary" />
                  <span className="text-primary text-[11px] font-semibold tracking-[3px] uppercase">{t("landing.impact_superti", "Environmental impact")}</span>
                </div>
                <h2 className="text-[46px] sm:text-[56px] font-bold text-foreground leading-[0.93] tracking-tight mb-7">
                  {t("landing.impact_l1", "Small plots.")}<br />
                  <em className="not-italic text-primary">{t("landing.impact_l2", "Massive impact.")}</em>
                </h2>
                <p className="text-muted-foreground text-[15px] leading-relaxed font-light mb-10 max-w-[400px]">
                  {t("landing.impact_desc", "Even a 500m² barren patch, when planted with native species, can reduce local surface temperature by 2–4°C, recharge groundwater, and capture carbon for decades.")}
                </p>
                <Link to="/plantationShowcase"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-foreground border-b-2 border-primary pb-0.5 hover:text-primary transition-colors">
                  {t("landing.impact_cta", "View the showcase →")}
                </Link>
              </FadeIn>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "🌡️", title: t("landing.f1_t", "2–4°C cooler"), desc: t("landing.f1_d", "Plantation sites reduce surrounding surface temperature within 6 months.") },
                  { icon: "💧", title: t("landing.f2_t", "Groundwater up"), desc: t("landing.f2_d", "Native roots improve aquifer recharge rates in barren and rocky terrain.") },
                  { icon: "🌬️", title: t("landing.f3_t", "CO₂ captured"), desc: t("landing.f3_d", "Each verified tree sequesters ~21kg CO₂ annually — for decades.") },
                  { icon: "🦋", title: t("landing.f4_t", "Biodiversity"), desc: t("landing.f4_d", "Native species selections support local pollinators and bird habitats.") },
                ].map((f, i) => (
                  <FadeIn key={f.title} delay={i * 0.08}>
                    <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group h-full">
                      <span className="text-2xl mb-4 block">{f.icon}</span>
                      <h4 className="text-[18px] font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{f.title}</h4>
                      <p className="text-muted-foreground text-[13px] leading-relaxed font-light">{f.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ COMMUNITY CTA ══ */}
        <section className="relative bg-background py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background to-card" />
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />
          <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-900/25 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-950/35 blur-[130px] pointer-events-none" />

          <div className="relative z-10 max-w-[780px] mx-auto px-6 text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/8 text-primary text-[11.5px] font-semibold tracking-[2px] uppercase mb-9">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {t("landing.comm_superti", "Join the community")}
              </div>
              <h2 className="text-[48px] sm:text-[64px] xl:text-[76px] font-bold text-foreground leading-[0.9] tracking-tight mb-7">
                {t("landing.comm_l1", "Own land?")}<br />
                <em className="not-italic text-primary">{t("landing.comm_l2", "Make it count.")}</em>
              </h2>
              <p className="text-muted-foreground text-[16px] leading-relaxed font-light mb-12 max-w-[500px] mx-auto">
                {t("landing.comm_desc", "Whether it's a roadside strip or a vacant plot — every boundary you draw brings India one step closer to its green future.")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="px-9 py-4 rounded-xl bg-primary text-primary-foreground text-[15.5px] font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/40 active:scale-[0.97] whitespace-nowrap">
                  {t("landing.comm_cta1", "Create free account →")}
                </Link>
                <Link to="/community" className="px-9 py-4 rounded-xl border border-border text-muted-foreground text-[15.5px] font-medium hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 whitespace-nowrap">
                  {t("landing.comm_cta2", "Explore community")}
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

      </div>
    </>
  );
}