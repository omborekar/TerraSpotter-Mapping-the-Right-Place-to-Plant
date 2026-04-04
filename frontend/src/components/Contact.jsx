/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Contact page and contact form UI.
*/
import { useState, useEffect } from "react";
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
  { icon: "☎", label: "Call us",   value: "+91 87672 92374",           href: "tel:+91 87672 92374" },
  { icon: "⌖", label: "Based in",  value: "Pune, Maharashtra, India", href: null },
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
      else { setDisplay(Math.floor(start).toLocaleString() + suffix); }
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

  // Map DB fields → display tiles. Only show tiles where data exists.
const statTiles = dbStats ? [
  dbStats.users    != null ? { label: "Registered Users",   value: dbStats.users,    suffix: "+" } : null,
  dbStats.hectares != null ? { label: "Hectares Mapped",    value: dbStats.hectares, suffix: "+" } : null,
  dbStats.trees    != null ? { label: "Trees Planted",      value: dbStats.trees,    suffix: "+" } : null,
  dbStats.verified != null ? { label: "Verified Sites",     value: dbStats.verified, suffix: "+" } : null,
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
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --forest:  #0b2e1a; --deep: #143d22; --mid: #1f5c35;
          --leaf:    #2d8a55; --sprout: #3db06e; --mint: #d4f0e0;
          --pale:    #edf7f2; --white: #ffffff; --ink: #111b14;
          --body:    #3d5244; --muted: #7a9485; --line: #dceee4; --sand: #f9fbf9;
        }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--sand); color: var(--ink); }

        .ct-page { max-width: 1140px; margin: 0 auto; padding: 0 36px 120px; }
        .ct-spacer { height: 80px; }

        /* HERO */
        .ct-hero {
          padding: 64px 0 72px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
          align-items: center; border-bottom: 1px solid var(--line); margin-bottom: 72px;
        }
        .ct-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--pale); border: 1px solid var(--line); color: var(--mid);
          border-radius: 100px; padding: 6px 16px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 24px;
        }
        .ct-eyebrow-dot { width: 6px; height: 6px; background: var(--sprout); border-radius: 50%; }
        .ct-hero h1 {
          font-family: 'Lora', serif; font-size: clamp(36px, 5vw, 56px); font-weight: 700;
          color: var(--forest); line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 18px;
        }
        .ct-hero h1 em { font-style: italic; color: var(--leaf); }
        .ct-hero-sub { font-size: 15px; color: var(--body); line-height: 1.75; max-width: 420px; }

        /* stats panel */
        .ct-stats-panel {
          background: var(--white); border: 1px solid var(--line); border-radius: 20px;
          padding: 32px; box-shadow: 0 4px 24px rgba(11,46,26,0.06);
          display: flex; flex-direction: column; gap: 20px;
        }
        .ct-stats-panel-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
        }

        /* shimmer skeleton */
        .ct-skeleton-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ct-skeleton-tile {
          height: 80px; border-radius: 12px;
          background: linear-gradient(90deg, var(--pale) 25%, #c8e8d4 50%, var(--pale) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* tiles */
        .ct-stat-tiles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .ct-stat-tile {
          background: var(--pale); border: 1px solid var(--line); border-radius: 14px;
          padding: 18px 16px; display: flex; flex-direction: column; gap: 5px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .ct-stat-tile:hover { border-color: var(--sprout); transform: translateY(-2px); }
        .ct-stat-val {
          font-family: 'Lora', serif; font-size: 30px; font-weight: 700;
          color: var(--forest); line-height: 1;
        }
        .ct-stat-lbl { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }

        .ct-stats-error { font-size: 13px; color: var(--muted); text-align: center; padding: 20px 0; }

        .ct-join-note {
          background: linear-gradient(135deg, var(--forest), var(--mid));
          border-radius: 14px; padding: 20px 22px;
          color: rgba(255,255,255,0.88); font-size: 13.5px; line-height: 1.65;
        }
        .ct-join-note strong { color: var(--mint); font-weight: 600; }

        /* MAIN GRID */
        .ct-main-grid {
          display: grid; grid-template-columns: 1fr 380px; gap: 28px;
          margin-bottom: 80px; align-items: start;
        }

        /* FORM */
        .ct-form-card {
          background: var(--white); border: 1px solid var(--line);
          border-radius: 20px; padding: 44px;
          box-shadow: 0 4px 24px rgba(11,46,26,0.06);
        }
        .ct-form-title { font-family: 'Lora', serif; font-size: 26px; font-weight: 700; color: var(--forest); margin-bottom: 6px; }
        .ct-form-sub { font-size: 13.5px; color: var(--muted); line-height: 1.6; margin-bottom: 28px; }
        .ct-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ct-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .ct-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--body); }
        .ct-req { color: var(--leaf); }
        .ct-input, .ct-select, .ct-textarea {
          padding: 12px 15px; border: 1.5px solid var(--line); border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
          background: var(--sand); color: var(--ink); outline: none; width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .ct-input:focus, .ct-select:focus, .ct-textarea:focus {
          border-color: var(--sprout); background: var(--white);
          box-shadow: 0 0 0 3.5px rgba(61,176,110,0.12);
        }
        .ct-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a9485' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
          background-color: var(--sand); padding-right: 36px; cursor: pointer;
        }
        .ct-textarea { resize: none; min-height: 120px; line-height: 1.6; }
        .ct-submit {
          width: 100%; padding: 14px; background: var(--forest); color: white;
          border: none; border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 4px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .ct-submit:hover:not(:disabled) { background: var(--deep); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(11,46,26,0.18); }
        .ct-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .ct-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 40px 16px; gap: 14px; }
        .ct-success-ring { width: 72px; height: 72px; border-radius: 50%; background: var(--pale); border: 2px solid var(--mint); display: flex; align-items: center; justify-content: center; font-size: 32px; }
        .ct-success h3 { font-family: 'Lora', serif; font-size: 22px; color: var(--forest); }
        .ct-success p { font-size: 14px; color: var(--muted); line-height: 1.7; max-width: 300px; }

        /* SIDEBAR */
        .ct-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .ct-info-card { background: var(--white); border: 1px solid var(--line); border-radius: 18px; padding: 28px; box-shadow: 0 2px 12px rgba(11,46,26,0.04); }
        .ct-card-label { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 20px; }
        .ct-contact-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--line); }
        .ct-contact-item:last-child { border-bottom: none; padding-bottom: 0; }
        .ct-contact-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--pale); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: 15px; color: var(--leaf); flex-shrink: 0; }
        .ct-contact-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 3px; }
        .ct-contact-val { font-size: 13px; color: var(--ink); font-weight: 500; }
        .ct-contact-val a { color: var(--leaf); text-decoration: none; }
        .ct-contact-val a:hover { text-decoration: underline; }
        .ct-hours-card { background: linear-gradient(145deg, var(--forest), var(--mid)); border-radius: 18px; padding: 28px; }
        .ct-hours-head { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 16px; }
        .ct-hours-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.09); font-size: 13px; }
        .ct-hours-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ct-hours-day { color: rgba(255,255,255,0.55); }
        .ct-hours-time { color: rgba(255,255,255,0.92); font-weight: 600; }
        .ct-closed { color: rgba(255,255,255,0.35) !important; font-style: italic; }
        .ct-open-card { background: var(--pale); border: 1.5px solid var(--mint); border-radius: 18px; padding: 28px; }
        .ct-open-card h4 { font-family: 'Lora', serif; font-size: 17px; color: var(--forest); margin-bottom: 10px; }
        .ct-open-card p { font-size: 13px; color: var(--body); line-height: 1.7; }

        /* FAQ */
        .ct-faq-section { margin-bottom: 80px; }
        .ct-faq-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 12px; }
        .ct-faq-title { font-family: 'Lora', serif; font-size: clamp(28px, 4vw, 40px); font-weight: 700; color: var(--forest); line-height: 1.15; }
        .ct-faq-sub { font-size: 14px; color: var(--muted); max-width: 320px; text-align: right; line-height: 1.6; }
        .ct-faq-list { display: flex; flex-direction: column; gap: 10px; }
        .ct-faq-item { background: var(--white); border: 1.5px solid var(--line); border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
        .ct-faq-item.open { border-color: var(--sprout); }
        .ct-faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: none; border: none; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600; color: var(--ink); cursor: pointer; text-align: left; gap: 16px; transition: background 0.15s; }
        .ct-faq-q:hover { background: var(--pale); }
        .ct-faq-chevron { width: 28px; height: 28px; border-radius: 50%; background: var(--pale); border: 1.5px solid var(--line); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; color: var(--leaf); font-weight: 700; transition: transform 0.25s, background 0.2s, color 0.2s, border-color 0.2s; }
        .ct-faq-item.open .ct-faq-chevron { transform: rotate(45deg); background: var(--leaf); color: white; border-color: var(--leaf); }
        .ct-faq-body { padding: 0 24px 20px; font-size: 14px; color: var(--body); line-height: 1.75; overflow: hidden; }

        /* bottom cta */
        .ct-bottom-cta { background: var(--forest); border-radius: 24px; padding: 56px; display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; position: relative; overflow: hidden; }
        .ct-bottom-cta::before { content: ''; position: absolute; right: -80px; top: -80px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(61,176,110,0.15) 0%, transparent 70%); }
        .ct-cta-text h3 { font-family: 'Lora', serif; font-size: 30px; color: var(--white); margin-bottom: 10px; }
        .ct-cta-text p { font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.65; max-width: 420px; }
        .ct-cta-actions { display: flex; gap: 12px; flex-wrap: wrap; flex-shrink: 0; }
        .ct-cta-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--sprout); color: var(--forest); font-size: 14px; font-weight: 700; border-radius: 10px; text-decoration: none; transition: all 0.2s; }
        .ct-cta-btn-primary:hover { background: var(--mint); transform: translateY(-2px); }
        .ct-cta-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.85); font-size: 14px; font-weight: 500; border-radius: 10px; text-decoration: none; background: rgba(255,255,255,0.05); transition: all 0.2s; }
        .ct-cta-btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.35); }

        @media (max-width: 900px) {
          .ct-page { padding: 0 20px 80px; }
          .ct-hero { grid-template-columns: 1fr; gap: 36px; padding: 48px 0 56px; }
          .ct-main-grid { grid-template-columns: 1fr; }
          .ct-form-card { padding: 28px; }
          .ct-faq-sub { text-align: left; }
          .ct-bottom-cta { padding: 40px 28px; }
        }
        @media (max-width: 560px) {
          .ct-form-row { grid-template-columns: 1fr; }
          .ct-hero h1 { font-size: 34px; }
        }
      `}</style>

      <div className="ct-page">
        <div className="ct-spacer" />

        {/* hero */}
        <motion.div className="ct-hero" variants={containerVariants} initial="hidden" animate="visible">
          <div>
            <motion.div className="ct-eyebrow" variants={itemVariants}>
              <span className="ct-eyebrow-dot" /> Community Platform
            </motion.div>
            <motion.h1 variants={itemVariants}>
              Together, we<br />grow <em>forests</em>
            </motion.h1>
            <motion.p className="ct-hero-sub" variants={itemVariants}>
              TerraSpotter is powered entirely by its users — landowners, planters, and nature lovers like you.
              Anyone can sign up, submit land, and join a plantation drive. No gatekeeping, just green action.
            </motion.p>
          </div>

          <motion.div className="ct-stats-panel" variants={itemVariants}>
            <div className="ct-stats-panel-label">Our community — live from Everywhere</div>

            {/* Loading skeleton */}
            {!dbStats && !statsError && (
              <div className="ct-skeleton-row">
                {[0,1,2,3].map(i => <div key={i} className="ct-skeleton-tile" />)}
              </div>
            )}

            {/* Error */}
            {statsError && (
              <div className="ct-stats-error">Could not load live stats right now.</div>
            )}

            {/* Live tiles */}
            {dbStats && statTiles.length > 0 && (
              <div className="ct-stat-tiles">
                {statTiles.map((s, i) => (
                  <div key={i} className="ct-stat-tile">
                    <div className="ct-stat-val">
                      <CountUp target={s.value} suffix={s.suffix} />
                    </div>
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

        {/* form + sidebar */}
        <motion.div className="ct-main-grid" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>

          <motion.div className="ct-form-card" variants={itemVariants}>
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-ring">🌿</div>
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
              <div className="ct-card-label">Reach us directly</div>
              {contacts.map((c, i) => (
                <div key={i} className="ct-contact-item">
                  <div className="ct-contact-icon">{c.icon}</div>
                  <div>
                    <div className="ct-contact-lbl">{c.label}</div>
                    <div className="ct-contact-val">
                      {c.href ? <a href={c.href}>{c.value}</a> : c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ct-hours-card">
              <div className="ct-hours-head">⏱ When we respond</div>
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
              <p>Sign up as a user and you can submit land, volunteer at events, and propose plantation drives — all from one account. The community runs itself.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* faq */}
        <motion.div className="ct-faq-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={containerVariants}>
          <motion.div className="ct-faq-head" variants={itemVariants}>
            <h2 className="ct-faq-title">Common questions<br />from the community</h2>
            <p className="ct-faq-sub">Can't find what you need? Send us a message above.</p>
          </motion.div>
          <div className="ct-faq-list">
            {faqs.map((f, i) => (
              <motion.div key={i} className={`ct-faq-item${openFaq === i ? " open" : ""}`} variants={itemVariants}>
                <button className="ct-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="ct-faq-chevron">+</span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div className="ct-faq-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                      {f.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* bottom cta */}
        <motion.div className="ct-bottom-cta"
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="ct-cta-text">
            <h3>Ready to make your mark?</h3>
            <p>Submit a barren plot, join a planting event, or propose a drive in your area. One account is all you need.</p>
          </div>
          <div className="ct-cta-actions">
            <a href="/main" className="ct-cta-btn-primary">Submit Land →</a>
            <a href="/browse" className="ct-cta-btn-ghost">Browse Sites</a>
          </div>
        </motion.div>
      </div>
    </>
  );
}