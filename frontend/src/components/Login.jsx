/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Login page component and form handling.
*/
import { useState, useEffect } from "react";
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
        { num: fmt(stats.totalLands),    lbl: "Lands mapped",   icon: "🗺️" },
        { num: fmt(stats.approvedLands), lbl: "Verified sites",  icon: "✅" },
        { num: fmt(stats.treesPlanted),  lbl: "Trees planted",   icon: "🌳" },
        { num: fmt(stats.volunteers),    lbl: "Volunteers",      icon: "🤝" },
      ]
    : Array(4).fill(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest:       #163d25;
          --canopy:       #256638;
          --leaf:         #3a8c57;
          --sprout:       #5cb87a;
          --sprout-light: #a8dbb9;
          --sand:         #f8f5f0;
          --cream:        #fdfbf8;
          --ink:          #111;
          --smoke:        #6b6457;
          --muted:        #a89e93;
          --line:         #e8e2da;
          --white:        #ffffff;
          --danger:       #b03a2e;
          --danger-bg:    #fdf3f2;
          --green-glow:   rgba(58,140,87,0.18);
          --green-glow-s: rgba(58,140,87,0.28);
        }

        body { font-family: 'DM Sans', sans-serif; }

        .lg-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--sand);
        }

        /* ── LEFT PANEL ── */
        .lg-left {
          background: var(--forest);
          padding: 56px 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        /* Layered radial atmosphere */
        .lg-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 15% 85%, rgba(92,184,122,0.20) 0%, transparent 52%),
            radial-gradient(ellipse at 82% 18%, rgba(22,61,37,0.55) 0%, transparent 48%),
            radial-gradient(ellipse at 50% 50%, rgba(37,102,56,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Subtle organic grid texture */
        .lg-left::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .lg-left-content { position: relative; z-index: 1; }

        .lg-brand {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 22px;
          color: white;
          letter-spacing: -0.2px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 60px;
          text-decoration: none;
        }

        .lg-brand-mark {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(145deg, var(--canopy), var(--sprout));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          box-shadow: 0 2px 12px var(--green-glow-s), inset 0 1px 0 rgba(255,255,255,0.15);
          flex-shrink: 0;
        }

        .lg-headline {
          font-family: 'Playfair Display', serif;
          font-size: 44px;
          line-height: 1.10;
          letter-spacing: -0.6px;
          color: white;
          margin-bottom: 20px;
        }
        .lg-headline em {
          font-style: italic;
          color: var(--sprout);
        }

        .lg-desc {
          font-size: 14.5px;
          color: rgba(255,255,255,0.55);
          line-height: 1.80;
          max-width: 330px;
        }

        /* Stats grid */
        .lg-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 52px;
          position: relative;
          z-index: 1;
        }

        .lg-stat {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 18px 20px;
          min-height: 82px;
          transition: background 0.22s, border-color 0.22s;
          position: relative;
          overflow: hidden;
        }
        .lg-stat::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(92,184,122,0.5), transparent);
          opacity: 0;
          transition: opacity 0.22s;
        }
        .lg-stat:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(92,184,122,0.25);
        }
        .lg-stat:hover::before { opacity: 1; }

        .lg-stat-icon {
          font-size: 13px;
          margin-bottom: 8px;
          opacity: 0.7;
        }

        .lg-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: var(--sprout);
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .lg-stat-lbl {
          font-size: 10.5px;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
          letter-spacing: 1.1px;
          margin-top: 5px;
          font-weight: 500;
        }

        /* Shimmer skeleton */
        @keyframes shimmer { to { background-position: -200% 0; } }

        .lg-stat-shimmer {
          height: 24px;
          border-radius: 6px;
          margin-bottom: 8px;
          width: 52%;
          background: linear-gradient(90deg,
            rgba(255,255,255,.05) 25%,
            rgba(255,255,255,.12) 50%,
            rgba(255,255,255,.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .lg-stat-shimmer-lbl {
          height: 10px;
          border-radius: 4px;
          width: 72%;
          background: linear-gradient(90deg,
            rgba(255,255,255,.03) 25%,
            rgba(255,255,255,.08) 50%,
            rgba(255,255,255,.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          animation-delay: 0.1s;
        }

        .lg-footer {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          position: relative;
          z-index: 1;
          line-height: 1.7;
          letter-spacing: 0.01em;
        }

        /* ── RIGHT PANEL ── */
        .lg-right {
          background: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 68px;
          position: relative;
        }

        /* Warm grain overlay on right */
        .lg-right::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.018;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        .lg-form-wrap {
          width: 100%;
          max-width: 380px;
          position: relative;
          z-index: 1;
        }

        /* Eyebrow label */
        .lg-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.4px;
          color: var(--leaf);
          margin-bottom: 12px;
        }
        .lg-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--sprout);
        }

        .lg-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          color: var(--forest);
          letter-spacing: -0.4px;
          margin-bottom: 6px;
          line-height: 1.1;
        }

        .lg-form-sub {
          font-size: 14px;
          color: var(--smoke);
          margin-bottom: 36px;
          line-height: 1.6;
        }

        /* Fields */
        .lg-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .lg-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #4a3f36;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .lg-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .lg-input {
          width: 100%;
          padding: 12px 15px;
          border: 1.5px solid var(--line);
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--ink);
          outline: none;
          background: var(--white);
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          letter-spacing: 0.01em;
        }
        .lg-input::placeholder { color: var(--muted); }
        .lg-input:focus {
          border-color: var(--leaf);
          box-shadow: 0 0 0 3px var(--green-glow);
          background: #fdfffe;
        }
        .lg-input.error {
          border-color: var(--danger);
          background: var(--danger-bg);
          box-shadow: 0 0 0 3px rgba(176,58,46,0.08);
        }
        .lg-input.has-toggle { padding-right: 46px; }

        .lg-pw-toggle {
          position: absolute;
          right: 13px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 15px;
          color: var(--muted);
          padding: 0;
          line-height: 1;
          transition: color 0.15s;
        }
        .lg-pw-toggle:hover { color: var(--forest); }

        .lg-err {
          font-size: 12px;
          color: var(--danger);
          margin-top: 2px;
          font-weight: 500;
        }

        .lg-api-err {
          padding: 12px 15px;
          background: var(--danger-bg);
          border: 1px solid rgba(176,58,46,0.2);
          border-radius: 9px;
          font-size: 13px;
          color: var(--danger);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        /* Submit button */
        .lg-submit {
          width: 100%;
          padding: 13.5px;
          background: linear-gradient(145deg, var(--canopy) 0%, var(--forest) 100%);
          color: white;
          border: none;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.2s, transform 0.12s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          letter-spacing: 0.02em;
          box-shadow: 0 3px 14px var(--green-glow-s), inset 0 1px 0 rgba(255,255,255,0.10);
        }
        .lg-submit:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 5px 20px var(--green-glow-s);
        }
        .lg-submit:active:not(:disabled) { transform: scale(0.985); }
        .lg-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .lg-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        .lg-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 26px 0;
          font-size: 12px;
          color: var(--muted);
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lg-divider::before,
        .lg-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--line);
        }

        .lg-signup-row {
          text-align: center;
          font-size: 13.5px;
          color: var(--smoke);
          margin-top: 20px;
        }
        .lg-signup-row a {
          color: var(--leaf);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s;
        }
        .lg-signup-row a:hover { color: var(--forest); }

        @media (max-width: 768px) {
          .lg-page { grid-template-columns: 1fr; }
          .lg-left { display: none; }
          .lg-right { padding: 48px 24px; align-items: flex-start; padding-top: 64px; }
        }
      `}</style>

      <div className="lg-page">

        {/* LEFT */}
        <motion.div className="lg-left"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}>

          <div className="lg-left-content">
            <div className="lg-brand">
              <span className="lg-brand-mark">🌿</span>
              TerraSpotter
            </div>
            <h1 className="lg-headline">
              Every plot of land<br />deserves a <em>future</em>
            </h1>
            <p className="lg-desc">
              Turning unused, barren, and roadside land into verified green ecosystems —
              one boundary at a time.
            </p>
          </div>

          {/* LIVE STATS */}
          <div className="lg-stats">
            {statTiles.map((tile, i) =>
              tile === null ? (
                <div key={i} className="lg-stat">
                  <div className="lg-stat-shimmer" style={{ animationDelay: `${i * 0.08}s` }} />
                  <div className="lg-stat-shimmer-lbl" style={{ animationDelay: `${i * 0.08 + 0.06}s` }} />
                </div>
              ) : (
                <motion.div key={tile.lbl} className="lg-stat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}>
                  <div className="lg-stat-icon">{tile.icon}</div>
                  <div className="lg-stat-num">{tile.num}</div>
                  <div className="lg-stat-lbl">{tile.lbl}</div>
                </motion.div>
              )
            )}
          </div>

          <div className="lg-footer">
            Built for institutions, NGOs, and communities<br />committed to sustainable afforestation.
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div className="lg-right"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
          <div className="lg-form-wrap">

            <div className="lg-eyebrow">
              <span className="lg-eyebrow-dot" />
              Secure Sign-in
            </div>

            <h1 className="lg-form-title">Welcome back</h1>
            <p className="lg-form-sub">Sign in to your TerraSpotter workspace</p>

            {errors.api && (
              <div className="lg-api-err">⚠ {errors.api}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="lg-field">
                <label className="lg-label">Email address</label>
                <input
                  className={`lg-input${errors.email ? " error" : ""}`}
                  type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} autoComplete="email"
                />
                {errors.email && <span className="lg-err">{errors.email}</span>}
              </div>

              <div className="lg-field">
                <label className="lg-label">Password</label>
                <div className="lg-input-wrap">
                  <input
                    className={`lg-input has-toggle${errors.password ? " error" : ""}`}
                    type={showPw ? "text" : "password"} name="password"
                    placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button type="button" className="lg-pw-toggle"
                    onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <span className="lg-err">{errors.password}</span>}
              </div>

              <button type="submit" className="lg-submit" disabled={loading}>
                {loading
                  ? <><div className="lg-spinner" /> Signing in…</>
                  : "Sign in →"}
              </button>
            </form>

            <div className="lg-divider">or</div>

            <div className="lg-signup-row">
              Don't have an account? <Link to="/signup">Create one free →</Link>
            </div>

          </div>
        </motion.div>

      </div>
    </>
  );
}