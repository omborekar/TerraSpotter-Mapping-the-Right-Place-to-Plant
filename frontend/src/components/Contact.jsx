/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Contact page and contact form UI.
*/
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const faqs = [
  { q: "How do I submit a land parcel?", a: "Log in, click 'Submit Land' in the navbar, draw the boundary on the map, fill in the ownership and land details, upload at least 3 photos, and submit." },
  { q: "How are tree species recommended?", a: "Our ML model fetches real-time temperature, rainfall, and soil moisture data from Open-Meteo APIs for your land's coordinates and recommends the best-fit native species." },
  { q: "Can I volunteer to plant on someone else's land?", a: "Yes — open any land's detail page and click 'I want to plant here'. Fill in your team size and planned date." },
  { q: "How long does land approval take?", a: "Most submissions are reviewed by fellow community members within 3–5 working days. You'll see the status change from PENDING to APPROVED on your profile." },
  { q: "Is TerraSpotter free to use?", a: "Completely free for individuals, volunteers, and NGOs. We're a community project with no paid tiers, ever." },
  { q: "Can I help organise plantation events?", a: "Absolutely — any registered user can propose and organise plantation events on approved land. Just reach out via this form and we'll walk you through it." },
];

const contacts = [
  { icon: "✉", label: "Email us",  value: "terraspotter@gmail.com",    href: "mailto:terraspotter@gmail.com" },
  { icon: "☎", label: "Call us",   value: "+91 87672 92374",           href: "tel:+918767292374" },
  { icon: "⌖", label: "Based in",  value: "Pune, Maharashtra, India",  href: null },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function CountUp({ target, suffix = "" }) {
  const [display, setDisplay] = useState("—");
  useEffect(() => {
    if (target === null || target === undefined) return;
    const num = parseInt(target);
    if (isNaN(num)) { setDisplay(String(target) + suffix); return; }
    let start = 0;
    const step = 16;
    const duration = 900;
    const increment = num / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) { setDisplay(num.toLocaleString() + suffix); clearInterval(timer); }
      else setDisplay(Math.floor(start).toLocaleString() + suffix);
    }, step);
    return () => clearInterval(timer);
  }, [target, suffix]);
  return <span>{display}</span>;
}

export default function Contact() {
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(res => setDbStats(res.data))
      .catch(() => setStatsError(true));
  }, []);

  const statTiles = dbStats ? [
    dbStats.users    != null ? { label: "Registered Users",  value: dbStats.users,    suffix: "+" } : null,
    dbStats.hectares != null ? { label: "Hectares Mapped",   value: dbStats.hectares, suffix: "+" } : null,
    dbStats.trees    != null ? { label: "Trees Planted",     value: dbStats.trees,    suffix: "+" } : null,
    dbStats.verified != null ? { label: "Verified Sites",    value: dbStats.verified, suffix: "+" } : null,
  ].filter(Boolean) : [];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSent(true);
    setSending(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Epilogue:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #f5f0e8; --parchment: #ede7d9; --ink: #0e1a12; --ink2: #2e3a30;
          --forest: #0d3320; --canopy: #1a4d2e; --leaf: #2d7a4a; --sprout: #4db87a;
          --sage: #7aad89; --mist: #d4f0e0; --warm: #8c8678; --line: #d6cfc4;
          --gold: #c9a84c; --gold-lt: #e8d5a3;
        }
        body { font-family: 'Epilogue', sans-serif; background: var(--cream); color: var(--ink); }
        @keyframes ct-shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
        @keyframes ct-spin { to { transform: rotate(360deg); } }

        .ct-root { max-width: 1280px; margin: 0 auto; padding: 0 64px 120px; }

        /* ── HERO ── */
        .ct-hero {
          padding: 100px 0 80px;
          display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 72px;
          align-items: start; border-bottom: 1px solid var(--line);
          margin-bottom: 80px;
        }
        .ct-eyebrow {
          font-family: 'Epilogue', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.28em; color: var(--leaf);
          display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
        }
        .ct-eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--leaf); opacity: 0.5; }
        .ct-hero-index {
          font-family: 'Cormorant Garamond', serif;
          font-size: 110px; font-weight: 300; line-height: 1;
          color: rgba(13,51,32,0.05); letter-spacing: -0.05em;
          margin-bottom: -40px; display: block; pointer-events: none;
        }
        .ct-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 6vw, 72px); font-weight: 600;
          color: var(--ink); line-height: 1.0; letter-spacing: -0.03em;
          margin-bottom: 24px;
        }
        .ct-hero h1 em { font-style: italic; color: var(--leaf); }
        .ct-hero-rule { width: 40px; height: 1px; background: rgba(45,122,74,0.4); margin-bottom: 24px; }
        .ct-hero-sub {
          font-size: 14px; color: var(--warm); line-height: 1.85;
          max-width: 420px; font-weight: 300;
        }

        /* stats panel */
        .ct-stats-panel {
          background: var(--forest);
          border-radius: 2px; padding: 36px;
          display: flex; flex-direction: column; gap: 24px;
          position: relative; overflow: hidden;
        }
        .ct-stats-panel::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(77,184,122,0.15), transparent 70%);
          pointer-events: none;
        }
        .ct-panel-label {
          font-family: 'Epilogue', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.25em; color: rgba(77,184,122,0.6);
        }
        .ct-skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .ct-skeleton-tile {
          height: 88px; border-radius: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: ct-shimmer 1.4s infinite;
        }
        .ct-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .ct-stat-tile {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 2px; padding: 20px 18px;
          display: flex; flex-direction: column; gap: 6px;
          transition: background 0.2s;
        }
        .ct-stat-tile:hover { background: rgba(255,255,255,0.07); }
        .ct-stat-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 600; line-height: 1;
          color: #fff; letter-spacing: -0.02em;
        }
        .ct-stat-lbl {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.18em; color: rgba(255,255,255,0.32);
        }
        .ct-stats-err { font-size: 12px; color: rgba(255,255,255,0.35); text-align: center; padding: 16px 0; }
        .ct-join-note {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px; padding: 18px 20px;
          font-size: 12.5px; line-height: 1.7; color: rgba(255,255,255,0.55);
        }
        .ct-join-note strong { color: var(--gold-lt); font-weight: 600; }

        /* ── MAIN GRID ── */
        .ct-main-grid {
          display: grid; grid-template-columns: 1fr 360px;
          gap: 32px; margin-bottom: 100px; align-items: start;
        }

        /* ── FORM ── */
        .ct-form-card {
          background: #fff; border: 1px solid var(--line); border-radius: 2px;
          padding: 48px;
        }
        .ct-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 600; color: var(--ink);
          letter-spacing: -0.02em; margin-bottom: 6px;
        }
        .ct-form-sub {
          font-size: 13px; color: var(--warm); line-height: 1.7;
          margin-bottom: 32px; font-weight: 300;
        }
        .ct-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ct-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
        .ct-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--warm);
        }
        .ct-req { color: var(--leaf); margin-left: 2px; }
        .ct-input, .ct-select, .ct-textarea {
          padding: 12px 16px; border: 1px solid var(--line); border-radius: 2px;
          font-family: 'Epilogue', sans-serif; font-size: 13.5px;
          background: var(--cream); color: var(--ink); outline: none; width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .ct-input:focus, .ct-select:focus, .ct-textarea:focus {
          border-color: var(--leaf); background: #fff;
          box-shadow: 0 0 0 3px rgba(45,122,74,0.08);
        }
        .ct-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238c8678' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
          background-color: var(--cream); padding-right: 40px; cursor: pointer;
        }
        .ct-textarea { resize: none; min-height: 120px; line-height: 1.65; }
        .ct-submit {
          width: 100%; padding: 14px;
          background: var(--forest); color: var(--cream);
          border: none; border-radius: 2px;
          font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; margin-top: 6px;
          transition: background 0.2s, transform 0.12s;
        }
        .ct-submit:hover:not(:disabled) { background: var(--canopy); transform: translateY(-1px); }
        .ct-submit:disabled { opacity: 0.45; cursor: not-allowed; }

        /* success */
        .ct-success {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 48px 24px; gap: 16px;
        }
        .ct-success-leaf { font-size: 56px; line-height: 1; }
        .ct-success h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600; color: var(--forest);
          letter-spacing: -0.02em;
        }
        .ct-success p { font-size: 13px; color: var(--warm); line-height: 1.75; max-width: 300px; }

        /* ── SIDEBAR ── */
        .ct-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .ct-info-card {
          background: #fff; border: 1px solid var(--line); border-radius: 2px;
          padding: 28px 30px;
        }
        .ct-card-hd {
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--warm); margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
        }
        .ct-card-hd::after { content: ''; flex: 1; height: 1px; background: var(--line); }
        .ct-contact-row {
          display: flex; align-items: center; gap: 14px;
          padding: 13px 0; border-bottom: 1px solid var(--line);
        }
        .ct-contact-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ct-contact-icon {
          width: 36px; height: 36px; border-radius: 2px;
          background: var(--parchment); border: 1px solid var(--line);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: var(--leaf); flex-shrink: 0;
        }
        .ct-contact-meta-lbl {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.15em; color: var(--warm); margin-bottom: 3px;
        }
        .ct-contact-meta-val { font-size: 12.5px; color: var(--ink); font-weight: 500; }
        .ct-contact-meta-val a { color: var(--leaf); text-decoration: none; }
        .ct-contact-meta-val a:hover { text-decoration: underline; }

        .ct-hours-card {
          background: var(--forest); border-radius: 2px; padding: 28px 30px;
        }
        .ct-hours-hd {
          font-family: 'Epilogue', sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          margin-bottom: 16px;
        }
        .ct-hours-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
          font-size: 12.5px;
        }
        .ct-hours-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ct-hours-day { color: rgba(255,255,255,0.38); }
        .ct-hours-time { color: rgba(255,255,255,0.82); font-weight: 600; }
        .ct-closed { color: rgba(255,255,255,0.25) !important; font-style: italic; }

        .ct-open-card {
          background: var(--parchment); border: 1px solid var(--line);
          border-radius: 2px; padding: 24px 26px;
          border-left: 3px solid var(--leaf);
        }
        .ct-open-card h4 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600; color: var(--forest);
          letter-spacing: -0.01em; margin-bottom: 8px;
        }
        .ct-open-card p { font-size: 12.5px; color: var(--warm); line-height: 1.75; }

        /* ── FAQ ── */
        .ct-faq { margin-bottom: 100px; }
        .ct-faq-header { margin-bottom: 48px; }
        .ct-faq-index {
          font-family: 'Cormorant Garamond', serif;
          font-size: 100px; font-weight: 300; line-height: 1;
          color: rgba(13,51,32,0.05); letter-spacing: -0.05em;
          margin-bottom: -34px; display: block; pointer-events: none;
        }
        .ct-faq-eyebrow {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.28em; color: var(--leaf);
          display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
        }
        .ct-faq-eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--leaf); opacity: 0.5; }
        .ct-faq-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4.5vw, 52px); font-weight: 600;
          color: var(--ink); line-height: 1.05; letter-spacing: -0.03em;
          max-width: 560px;
        }

        .ct-faq-list { display: flex; flex-direction: column; border-top: 1px solid var(--line); }
        .ct-faq-item { border-bottom: 1px solid var(--line); }
        .ct-faq-item.open { border-bottom-color: var(--line); }
        .ct-faq-q {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 22px 0; background: none; border: none;
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px; font-weight: 600;
          color: var(--ink); cursor: pointer; text-align: left;
          gap: 24px; transition: color 0.2s; letter-spacing: -0.01em;
        }
        .ct-faq-q:hover { color: var(--leaf); }
        .ct-faq-arrow {
          font-size: 18px; color: var(--leaf); flex-shrink: 0;
          transition: transform 0.3s ease; line-height: 1;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
        }
        .ct-faq-item.open .ct-faq-arrow { transform: rotate(45deg); }
        .ct-faq-body {
          overflow: hidden;
          font-size: 13.5px; color: var(--warm); line-height: 1.8;
          font-weight: 300;
        }
        .ct-faq-body-inner { padding: 0 0 22px 0; }

        /* ── BOTTOM CTA ── */
        .ct-bottom-cta {
          background: var(--forest);
          border-radius: 2px; padding: 64px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 32px; flex-wrap: wrap; position: relative; overflow: hidden;
        }
        .ct-bottom-cta::before {
          content: '';
          position: absolute; right: -100px; top: -100px;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(77,184,122,0.12), transparent 70%);
          pointer-events: none;
        }
        .ct-bottom-cta::after {
          content: '';
          position: absolute; left: -60px; bottom: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.08), transparent 70%);
          pointer-events: none;
        }
        .ct-cta-text { position: relative; z-index: 1; }
        .ct-cta-text h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 600; color: var(--cream);
          letter-spacing: -0.02em; margin-bottom: 10px; line-height: 1.1;
        }
        .ct-cta-text p { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.75; max-width: 400px; }
        .ct-cta-btns { display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0; position: relative; z-index: 1; }
        .ct-cta-btn-p {
          padding: 13px 28px; background: var(--sprout); color: var(--forest);
          font-family: 'Epilogue', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          border-radius: 2px; text-decoration: none; transition: background 0.2s, transform 0.12s;
          display: inline-flex; align-items: center;
        }
        .ct-cta-btn-p:hover { background: var(--gold-lt); transform: translateY(-1px); }
        .ct-cta-btn-g {
          padding: 13px 24px;
          border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.6);
          font-family: 'Epilogue', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          border-radius: 2px; text-decoration: none; background: transparent;
          transition: background 0.2s, border-color 0.2s;
          display: inline-flex; align-items: center;
        }
        .ct-cta-btn-g:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.3); }

        /* ── RESPONSIVE ── */
        @media(max-width:1024px) {
          .ct-root { padding-left: 36px; padding-right: 36px; }
        }
        @media(max-width:900px) {
          .ct-root { padding-left: 24px; padding-right: 24px; }
          .ct-hero { grid-template-columns: 1fr; gap: 40px; padding-top: 72px; padding-bottom: 56px; }
          .ct-main-grid { grid-template-columns: 1fr; }
          .ct-form-card { padding: 32px 28px; }
          .ct-bottom-cta { padding: 44px 32px; }
        }
        @media(max-width:600px) {
          .ct-root { padding: 0 18px 80px; }
          .ct-form-row { grid-template-columns: 1fr; }
          .ct-hero h1 { font-size: 40px; }
          .ct-bottom-cta { padding: 36px 24px; }
        }
      `}</style>

      <Helmet>
        <title>TerraSpotter — Contact</title>
        <meta name="description" content="Contact TerraSpotter — reach out, FAQs, and support." />
      </Helmet>

      <div className="ct-root">
        {/* spacer for fixed nav */}
        <div style={{ height: 72 }} />

        {/* ── HERO ── */}
        <motion.div className="ct-hero" variants={containerVariants} initial="hidden" animate="visible">
          <div>
            <motion.div variants={itemVariants}>
              <div className="ct-eyebrow">Community Platform</div>
            </motion.div>
            <motion.span className="ct-hero-index" variants={itemVariants}>02</motion.span>
            <motion.h1 variants={itemVariants}>
              Together, we<br />grow <em>forests</em>
            </motion.h1>
            <motion.div className="ct-hero-rule" variants={itemVariants} />
            <motion.p className="ct-hero-sub" variants={itemVariants}>
              TerraSpotter is powered entirely by its users — landowners, planters, and nature lovers like you.
              Anyone can sign up, submit land, and join a plantation drive. No gatekeeping, just green action.
            </motion.p>
          </div>

          <motion.div className="ct-stats-panel" variants={itemVariants}>
            <div className="ct-panel-label">Our community — live from everywhere</div>

            {!dbStats && !statsError && (
              <div className="ct-skeleton-grid">
                {[0, 1, 2, 3].map(i => <div key={i} className="ct-skeleton-tile" />)}
              </div>
            )}

            {statsError && <div className="ct-stats-err">Could not load live stats right now.</div>}

            {dbStats && statTiles.length > 0 && (
              <div className="ct-stat-grid">
                {statTiles.map((s, i) => (
                  <div key={i} className="ct-stat-tile">
                    <div className="ct-stat-val"><CountUp target={s.value} suffix={s.suffix} /></div>
                    <div className="ct-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="ct-join-note">
              <strong>One account, full access.</strong> Every user can submit land, volunteer at planting events, and propose drives — all under a single login. No roles, no barriers.
            </div>
          </motion.div>
        </motion.div>

        {/* ── FORM + SIDEBAR ── */}
        <motion.div
          className="ct-main-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div className="ct-form-card" variants={itemVariants}>
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-leaf">🌿</div>
                <h3>Message received!</h3>
                <p>Thanks for reaching out. A community member will get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="ct-form-title">Send us a message</div>
                <div className="ct-form-sub">Have a question or want to get involved? We read every message.</div>

                <div className="ct-form-row">
                  <div className="ct-field">
                    <label className="ct-label">Your Name <span className="ct-req">*</span></label>
                    <input className="ct-input" placeholder="Full name"
                      value={form.name} onChange={e => set("name", e.target.value)} />
                  </div>
                  <div className="ct-field">
                    <label className="ct-label">Email <span className="ct-req">*</span></label>
                    <input className="ct-input" type="email" placeholder="you@example.com"
                      value={form.email} onChange={e => set("email", e.target.value)} />
                  </div>
                </div>

                <div className="ct-field">
                  <label className="ct-label">What's this about?</label>
                  <select className="ct-select" value={form.subject} onChange={e => set("subject", e.target.value)}>
                    <option value="">— Choose a topic —</option>
                    <option value="land">I have land to submit</option>
                    <option value="volunteer">I want to join a plantation</option>
                    <option value="event">I want to organise an event</option>
                    <option value="ngo">NGO / Organisation partnership</option>
                    <option value="tech">Something isn't working</option>
                    <option value="other">Something else</option>
                  </select>
                </div>

                <div className="ct-field">
                  <label className="ct-label">Message <span className="ct-req">*</span></label>
                  <textarea className="ct-textarea"
                    placeholder="Tell us what's on your mind — the more detail, the better we can help…"
                    value={form.message} onChange={e => set("message", e.target.value)} />
                </div>

                <button className="ct-submit"
                  onClick={handleSubmit}
                  disabled={sending || !form.name || !form.email || !form.message}>
                  {sending ? "Sending…" : "Send Message →"}
                </button>
              </>
            )}
          </motion.div>

          <motion.div className="ct-sidebar" variants={itemVariants}>
            <div className="ct-info-card">
              <div className="ct-card-hd">Reach us directly</div>
              {contacts.map((c, i) => (
                <div key={i} className="ct-contact-row">
                  <div className="ct-contact-icon">{c.icon}</div>
                  <div>
                    <div className="ct-contact-meta-lbl">{c.label}</div>
                    <div className="ct-contact-meta-val">
                      {c.href ? <a href={c.href}>{c.value}</a> : c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ct-hours-card">
              <div className="ct-hours-hd">When we respond</div>
              {[
                { day: "Monday – Friday", time: "9 AM – 6 PM" },
                { day: "Saturday",        time: "10 AM – 3 PM" },
                { day: "Sunday",          time: "Closed", closed: true },
              ].map((h, i) => (
                <div key={i} className="ct-hours-row">
                  <span className="ct-hours-day">{h.day}</span>
                  <span className={`ct-hours-time${h.closed ? " ct-closed" : ""}`}>{h.time}</span>
                </div>
              ))}
            </div>

            <div className="ct-open-card">
              <h4>🌳 Open to Everyone</h4>
              <p>Sign up and you can submit land, volunteer at events, and propose plantation drives — all from one account. The community runs itself.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          className="ct-faq"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
        >
          <motion.div className="ct-faq-header" variants={itemVariants}>
            <span className="ct-faq-index">03</span>
            <div className="ct-faq-eyebrow">Common questions</div>
            <h2 className="ct-faq-title">
              From the community
            </h2>
          </motion.div>

          <div className="ct-faq-list">
            {faqs.map((f, i) => (
              <motion.div
                key={i}
                className={`ct-faq-item${openFaq === i ? " open" : ""}`}
                variants={itemVariants}
              >
                <button className="ct-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="ct-faq-arrow">+</span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      className="ct-faq-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="ct-faq-body-inner">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── BOTTOM CTA ── */}
        <motion.div
          className="ct-bottom-cta"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ct-cta-text">
            <h3>Ready to make your mark?</h3>
            <p>Submit a barren plot, join a planting event, or propose a drive in your area. One account is all you need.</p>
          </div>
          <div className="ct-cta-btns">
            <a href="/main" className="ct-cta-btn-p">Submit Land →</a>
            <a href="/browse" className="ct-cta-btn-g">Browse Sites</a>
          </div>
        </motion.div>
      </div>
    </>
  );
}