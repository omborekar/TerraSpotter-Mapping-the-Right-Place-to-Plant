/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: About page including timeline and team information.
*/
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const team = [
  { initials: "OB", name: "Om Borekar",        role: "Full Stack Developer",   color: "#1a4731" },
  { initials: "VK", name: "Vishwaja Kakulate", role: "Backend Developer",      color: "#1e5c3a" },
  { initials: "PD", name: "Prasad Dhotre",     role: "Database Engineer",      color: "#22694a" },
  { initials: "PG", name: "Pradnya Gajre",     role: "Frontend Developer",     color: "#276b4c" },
];

const values = [
  { icon: "🌍", title: "Data-Driven",    desc: "Every recommendation is backed by real climate, soil, and rainfall data — not guesswork." },
  { icon: "🤝", title: "Community-Led",  desc: "Local volunteers, NGOs, and landowners drive every plantation." },
  { icon: "🔍", title: "Transparent",    desc: "All submissions and outcomes are fully visible to the public." },
  { icon: "🌱", title: "Native-First",   desc: "We prioritise indigenous tree species for lasting ecological impact." },
];

const timeline = [
  { year: "2025", label: "Origin", text: "Initiated as a final-year BE project solving real-world plantation challenges." },
  { year: "Planning", label: "Blueprint", text: "Designed a system to crowdsource land data for plantation." },
  { year: "Development", label: "Build", text: "Built TerraSpotter with mapping, uploads, and validation features." },
  { year: "Integration", label: "Intelligence", text: "Added ML-based plant recommendation logic." },
  { year: "Current", label: "Now", text: "Improving usability and real-world impact across Maharashtra." },
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
  const [stats, setStats] = useState([
    { value: "2,400+", label: "Hectares Mapped",   icon: "⬡" },
    { value: "180+",   label: "Verified Sites",    icon: "◎" },
    { value: "3,200+", label: "Trees Planted",     icon: "⟁" },
    { value: "12",     label: "Districts Covered", icon: "◈" },
  ]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(res => {
        const d = res.data;
        setStats([
          { value: d.lands + "+",                    label: "Hectares Mapped",   icon: "⬡" },
          { value: d.verified + "+",                 label: "Verified Sites",    icon: "◎" },
          { value: d.trees.toLocaleString() + "+",   label: "Trees Planted",     icon: "⟁" },
          { value: d.districts || "—",               label: "Districts Covered", icon: "◈" },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest:  #0c2e1a;
          --deep:    #081a0f;
          --mid:     #1a4731;
          --accent:  #4ade80;
          --gold:    #d4a853;
          --cream:   #f5f0e8;
          --muted:   #a3b5a0;
          --card-bg: rgba(255,255,255,0.045);
          --border:  rgba(255,255,255,0.08);
        }

        body {
          font-family: 'Outfit', sans-serif;
          background: var(--deep);
          color: var(--cream);
          overflow-x: hidden;
        }

        /* BG TEXTURE */
        .ab-root {
          position: relative;
          min-height: 100vh;
        }
        .ab-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(26,71,49,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(12,46,26,0.7) 0%, transparent 55%);
          pointer-events: none;
          z-index: 0;
        }

        .ab-page {
          position: relative;
          z-index: 1;
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 36px 120px;
        }

        /* NAV SPACER */
        .ab-nav-spacer { height: 88px; }

        /* HERO */
        .ab-hero {
          min-height: 72vh;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 0 80px;
          position: relative;
        }

        .ab-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          background: rgba(74,222,128,0.08);
          border: 1px solid rgba(74,222,128,0.2);
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 32px;
        }
        .ab-hero-eyebrow::before { content: ''; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }

        .ab-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 7vw, 92px);
          font-weight: 900;
          line-height: 1.0;
          color: var(--cream);
          margin-bottom: 28px;
          max-width: 820px;
        }

        .ab-hero h1 em {
          font-style: italic;
          color: var(--accent);
        }

        .ab-hero-sub {
          font-size: 18px;
          font-weight: 300;
          color: var(--muted);
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 48px;
        }

        .ab-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

        .ab-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 30px;
          background: var(--accent);
          color: var(--deep);
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.03em;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .ab-btn-primary:hover {
          background: #6ef7a0;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(74,222,128,0.25);
        }

        .ab-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 30px;
          border: 1px solid var(--border);
          color: var(--cream);
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
          text-decoration: none;
          backdrop-filter: blur(8px);
          background: rgba(255,255,255,0.04);
          transition: all 0.25s ease;
        }
        .ab-btn-ghost:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
        }

        /* DIVIDER */
        .ab-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          margin: 0 0 80px;
        }

        /* STATS */
        .ab-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          margin-bottom: 80px;
          background: var(--border);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .ab-stat {
          background: rgba(255,255,255,0.03);
          padding: 36px 28px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          backdrop-filter: blur(10px);
          transition: background 0.3s;
          position: relative;
          overflow: hidden;
        }
        .ab-stat:hover { background: rgba(255,255,255,0.065); }
        .ab-stat-icon {
          font-size: 20px;
          color: var(--accent);
          opacity: 0.6;
          margin-bottom: 4px;
        }
        .ab-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          color: var(--cream);
          line-height: 1;
        }
        .ab-stat-lbl {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* SECTIONS */
        .ab-section { margin-bottom: 96px; }

        .ab-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 12px;
        }

        .ab-section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 4vw, 52px);
          font-weight: 700;
          color: var(--cream);
          margin-bottom: 48px;
          line-height: 1.1;
        }

        /* VALUES */
        .ab-values-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .ab-value-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 32px;
          border-radius: 18px;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .ab-value-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 10% 0%, rgba(74,222,128,0.06) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .ab-value-card:hover { border-color: rgba(74,222,128,0.2); transform: translateY(-3px); }
        .ab-value-card:hover::before { opacity: 1; }

        .ab-value-icon {
          font-size: 28px;
          margin-bottom: 16px;
          display: block;
        }
        .ab-value-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--cream);
          margin-bottom: 10px;
        }
        .ab-value-desc {
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
        }

        /* TIMELINE */
        .ab-timeline {
          position: relative;
          padding-left: 32px;
        }
        .ab-timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background: linear-gradient(to bottom, var(--accent), rgba(74,222,128,0.1));
        }

        .ab-tl-item {
          position: relative;
          padding: 0 0 40px 32px;
        }
        .ab-tl-item:last-child { padding-bottom: 0; }

        .ab-tl-dot {
          position: absolute;
          left: -5px;
          top: 6px;
          width: 10px;
          height: 10px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(74,222,128,0.5);
        }

        .ab-tl-year {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 6px;
        }

        .ab-tl-label {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: var(--cream);
          margin-bottom: 8px;
        }

        .ab-tl-text {
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          max-width: 480px;
        }

        /* TEAM */
        .ab-team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .ab-team-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 32px 20px;
          text-align: center;
          backdrop-filter: blur(12px);
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
        }
        .ab-team-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ab-team-card:hover { transform: translateY(-6px); border-color: rgba(74,222,128,0.18); }
        .ab-team-card:hover::after { opacity: 1; }

        .ab-team-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.9);
          margin: 0 auto 16px;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.05em;
          position: relative;
        }
        .ab-team-avatar::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(74,222,128,0.4), transparent);
          z-index: -1;
        }

        .ab-team-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--cream);
          margin-bottom: 5px;
        }

        .ab-team-role {
          font-size: 12px;
          font-weight: 400;
          color: var(--muted);
          letter-spacing: 0.03em;
        }

        /* FOOTER BAND */
        .ab-footer-band {
          margin-top: 80px;
          padding: 56px;
          background: linear-gradient(135deg, rgba(26,71,49,0.5), rgba(12,46,26,0.7));
          border: 1px solid var(--border);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          backdrop-filter: blur(16px);
          flex-wrap: wrap;
        }

        .ab-footer-band h3 {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          color: var(--cream);
          margin-bottom: 8px;
        }

        .ab-footer-band p {
          color: var(--muted);
          font-size: 15px;
          font-weight: 300;
          max-width: 380px;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .ab-stats { grid-template-columns: repeat(2, 1fr); }
          .ab-team-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .ab-page { padding: 0 20px 80px; }
          .ab-hero h1 { font-size: 44px; }
          .ab-stats { grid-template-columns: 1fr 1fr; }
          .ab-values-grid { grid-template-columns: 1fr; }
          .ab-team-grid { grid-template-columns: repeat(2, 1fr); }
          .ab-footer-band { padding: 36px 24px; }
        }
      `}</style>

      <Helmet>
        <title>TerraSpotter — About</title>
        <meta name="description" content="About TerraSpotter — mission, team, and timeline." />
      </Helmet>

      <div className="ab-root">
        <div className="ab-page">
          <div className="ab-nav-spacer" />

          {/* HERO */}
          <motion.div
            ref={heroRef}
            className="ab-hero"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <motion.div
              className="ab-hero-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Reforestation Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Turning idle land into<br /><em>living forests</em>
            </motion.h1>

            <motion.p
              className="ab-hero-sub"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
            >
              TerraSpotter identifies and activates barren land for plantation using real data and community-driven effort across Maharashtra.
            </motion.p>

            <motion.div
              className="ab-hero-actions"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34 }}
            >
              <Link to="/browse" className="ab-btn-primary">Browse Sites →</Link>
              <Link to="/main" className="ab-btn-ghost">Submit Land</Link>
            </motion.div>
          </motion.div>

          <div className="ab-divider" />

          {/* STATS */}
          <motion.div
            className="ab-stats"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {stats.map((s, i) => (
              <motion.div key={i} className="ab-stat" variants={itemVariants}>
                <span className="ab-stat-icon">{s.icon}</span>
                <div className="ab-stat-val">{s.value}</div>
                <div className="ab-stat-lbl">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* VALUES */}
          <motion.div
            className="ab-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <motion.div className="ab-section-label" variants={itemVariants}>What We Stand For</motion.div>
            <motion.h2 className="ab-section-title" variants={itemVariants}>Our Values</motion.h2>
            <div className="ab-values-grid">
              {values.map((v, i) => (
                <motion.div key={i} className="ab-value-card" variants={itemVariants}>
                  <span className="ab-value-icon">{v.icon}</span>
                  <div className="ab-value-title">{v.title}</div>
                  <div className="ab-value-desc">{v.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* TIMELINE */}
          <motion.div
            className="ab-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <motion.div className="ab-section-label" variants={itemVariants}>How We Got Here</motion.div>
            <motion.h2 className="ab-section-title" variants={itemVariants}>Our Journey</motion.h2>
            <div className="ab-timeline">
              {timeline.map((t, i) => (
                <motion.div key={i} className="ab-tl-item" variants={itemVariants}>
                  <div className="ab-tl-dot" />
                  <div className="ab-tl-year">{t.year}</div>
                  <div className="ab-tl-label">{t.label}</div>
                  <div className="ab-tl-text">{t.text}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* TEAM */}
          <motion.div
            className="ab-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <motion.div className="ab-section-label" variants={itemVariants}>The People</motion.div>
            <motion.h2 className="ab-section-title" variants={itemVariants}>Meet the Team</motion.h2>
            <div className="ab-team-grid">
              {team.map((t, i) => (
                <motion.div key={i} className="ab-team-card" variants={itemVariants}>
                  <div className="ab-team-avatar" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <div className="ab-team-name">{t.name}</div>
                  <div className="ab-team-role">{t.role}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* footer cta */}
          <motion.div
            className="ab-footer-band"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <h3>Ready to make a difference?</h3>
              <p>Submit a barren plot in your community and help us build a greener Maharashtra — one tree at a time.</p>
            </div>
            <Link to="/main" className="ab-btn-primary" style={{ flexShrink: 0 }}>
              Submit Land →
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}