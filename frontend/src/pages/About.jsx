/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: About page — dark-first Tailwind, no custom style blocks.
*/
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const team = [
  { initials: "OB", name: "OmSunil Borekar", role: "Backend Development, API Development, Database Integration, Integration", color: "#1a4731" },
  { initials: "VK", name: "Vishwaja Vinayak Kakulate", role: "MLModule, Recommendation System, API Development", color: "#1e5c3a" },
  { initials: "PD", name: "Prasad Dattatraya Dhotre", role: "Frontend Development, Testing, Quality Assurance", color: "#22694a" },
  { initials: "PG", name: "Pradnya Harishchandra Gajre", role: "Frontend Development, Testing, Documentation, Quality Assurance", color: "#276b4c" },
  { initials: "SS", name: "Prof. S. M. Shelke (Guide)", role: "Project Guidance, Review and Technical Guidance", color: "#112e1f" }
];

const values = [
  { icon: "🌍", title: "Data-Driven",   desc: "Every recommendation is backed by real climate, soil, and rainfall data — not guesswork." },
  { icon: "🤝", title: "Community-Led", desc: "Local volunteers, NGOs, and landowners drive every plantation." },
  { icon: "🔍", title: "Transparent",   desc: "All submissions and outcomes are fully visible to the public." },
  { icon: "🌱", title: "Native-First",  desc: "We prioritise indigenous tree species for lasting ecological impact." },
];

const timeline = [
  { year: "2025",        label: "Origin",       text: "Initiated as a final-year BE project solving real-world plantation challenges." },
  { year: "Planning",    label: "Blueprint",    text: "Designed a system to crowdsource land data for plantation." },
  { year: "Development", label: "Build",        text: "Built TerraSpotter with mapping, uploads, and validation features." },
  { year: "Integration", label: "Intelligence", text: "Added ML-based plant recommendation logic." },
  { year: "Current",     label: "Now",          text: "Improving usability and real-world impact across Maharashtra." },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export default function About() {
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { value: "2,400+", label: "Hectares Mapped",   icon: "⬡" },
    { value: "180+",   label: "Verified Sites",    icon: "◎" },
    { value: "3,200+", label: "Trees Planted",     icon: "⟁" },
    { value: "12",     label: "Districts Covered", icon: "◈" },
  ]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(res => {
        const d = res.data;
        setStats([
          { value: (d.lands || "—") + "+",                      label: "Hectares Mapped",   icon: "⬡" },
          { value: (d.verified || "—") + "+",                   label: "Verified Sites",    icon: "◎" },
          { value: (d.trees || "—").toLocaleString?.() + "+",   label: "Trees Planted",     icon: "⟁" },
          { value: d.districts || "—",                          label: "Districts Covered", icon: "◈" },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("auto.auto_1", "TerraSpotter — About")}</title>
        <meta name="description" content="About TerraSpotter — mission, team, and timeline." />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Fixed bg radial glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute left-[-10%] top-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-900/50 blur-[180px]" />
        <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-950/70 blur-[160px]" />
      </div>

      <div className="relative z-10 bg-background text-foreground min-h-screen">
        <div className="max-w-[1160px] mx-auto px-5 sm:px-9 pb-28">

          {/* HERO */}
          <motion.div ref={heroRef} style={{ y: heroY, opacity: heroOpacity }}
            className="min-h-[72vh] flex flex-col items-start justify-center py-16 relative">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-primary bg-primary/8 border border-primary/20 px-3.5 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              {t("auto.auto_2", "Reforestation Platform")}
            </motion.div>

            <motion.h1
              className="text-[clamp(52px,7vw,92px)] font-bold text-foreground leading-[1.0] max-w-[820px] mb-7 tracking-tight"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
              {t("auto.auto_3", "Turning idle land into")}<br />
              <em className="not-italic text-primary">{t("auto.auto_4", "living forests")}</em>
            </motion.h1>

            <motion.p className="text-[18px] font-light text-muted-foreground max-w-[520px] leading-relaxed mb-12"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.22 }}>
              {t("auto.auto_5", "TerraSpotter identifies and activates barren land for plantation using real data and community-driven effort across Maharashtra.")}
            </motion.p>

            <motion.div className="flex flex-wrap gap-3.5"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.34 }}>
              <Link to="/browse" className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-bold text-[14px] rounded-xl hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/25">
                {t("auto.auto_6", "Browse Sites →")}
              </Link>
              <Link to="/main" className="inline-flex items-center gap-2 px-7 py-3.5 border border-border text-foreground text-[14px] rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all glass">
                {t("auto.auto_7", "Submit Land")}
              </Link>
            </motion.div>
          </motion.div>

          {/* DIVIDER */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-20" />

          {/* STATS */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border mb-20"
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
            {stats.map((s, i) => (
              <motion.div key={i} variants={itemVariants}
                className="bg-card p-8 flex flex-col items-start gap-2 hover:bg-secondary transition-all cursor-default group">
                <span className="text-[20px] text-primary/60 mb-1">{s.icon}</span>
                <div className="text-[42px] font-bold text-foreground leading-none">{s.value}</div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* VALUES */}
          <motion.div className="mb-24" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            <motion.div variants={itemVariants} className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary mb-3">
              {t("auto.auto_8", "What We Stand For")}
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-[clamp(34px,4vw,52px)] font-bold text-foreground mb-12 leading-tight tracking-tight">
              {t("auto.auto_9", "Our Values")}
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((v, i) => (
                <motion.div key={i} variants={itemVariants}
                  className="bg-card/50 border border-border rounded-2xl p-8 hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 60% 50% at 10% 0%, rgba(77,184,122,0.06) 0%, transparent 70%)" }} />
                  <span className="text-[28px] mb-4 block">{v.icon}</span>
                  <div className="text-[17px] font-bold text-foreground mb-2.5">{v.title}</div>
                  <div className="text-[14px] font-light text-muted-foreground leading-relaxed">{v.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* TIMELINE */}
          <motion.div className="mb-24" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            <motion.div variants={itemVariants} className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary mb-3">
              {t("auto.auto_10", "How We Got Here")}
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-[clamp(34px,4vw,52px)] font-bold text-foreground mb-12 leading-tight tracking-tight">
              {t("auto.auto_11", "Our Journey")}
            </motion.h2>
            <div className="relative pl-8 border-l border-gradient-to-b from-primary to-primary/10"
              style={{ borderImage: "linear-gradient(to bottom, var(--primary), rgba(77,184,122,0.1)) 1" }}>
              {timeline.map((tl, i) => (
                <motion.div key={i} variants={itemVariants} className="relative pb-10 pl-8 last:pb-0">
                  <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 bg-primary rounded-full shadow-md shadow-primary/50" />
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-primary mb-1.5">{tl.year}</div>
                  <div className="text-[20px] font-bold text-foreground mb-2">{tl.label}</div>
                  <div className="text-[14px] font-light text-muted-foreground leading-relaxed max-w-[480px]">{tl.text}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* TEAM */}
          <motion.div className="mb-20" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            <motion.div variants={itemVariants} className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary mb-3">
              {t("auto.auto_12", "The People")}
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-[clamp(34px,4vw,52px)] font-bold text-foreground mb-12 leading-tight tracking-tight">
              {t("auto.auto_13", "Meet the Team")}
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {team.map((m, i) => (
                <motion.div key={i} variants={itemVariants}
                  className="bg-card border border-border rounded-2xl p-8 text-center hover:-translate-y-1.5 hover:border-primary/18 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: m.color }}>
                    {m.initials}
                    <div className="absolute inset-[-2px] rounded-full border border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[15px] font-semibold text-foreground mb-1">{m.name}</div>
                  <div className="text-[12px] text-muted-foreground">{m.role}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA BAND */}
          <motion.div
            className="p-10 md:p-14 bg-gradient-to-br from-secondary to-card border border-border rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 backdrop-blur-md"
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div>
              <h3 className="text-[32px] font-bold text-foreground mb-2">{t("auto.auto_14", "Ready to make a difference?")}</h3>
              <p className="text-muted-foreground text-[15px] font-light max-w-[380px] leading-relaxed">
                {t("auto.auto_15", "Submit a barren plot in your community and help us build a greener Maharashtra — one tree at a time.")}
              </p>
            </div>
            <Link to="/main" className="shrink-0 inline-flex items-center gap-2 px-7 py-4 bg-primary text-primary-foreground font-bold text-[14px] rounded-xl hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/25">
              {t("auto.auto_16", "Submit Land →")}
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  );
}