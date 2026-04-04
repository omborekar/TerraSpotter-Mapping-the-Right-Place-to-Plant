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

// format big numbers: 1240 → "1.2k", 18000 → "18k", 340 → "340"
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

  // live stats
  const [stats,      setStats]      = useState(null);   // null = loading
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(r => setStats(r.data))
      .catch(() => setStatsError(true));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    // left
    if (!form.password)     e.password = "Password is required";
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

  // stat tiles config
  const statTiles = stats
    ? [
        { num: fmt(stats.totalLands),    lbl: "Lands mapped"    },
        { num: fmt(stats.approvedLands), lbl: "Verified sites"  },
        { num: fmt(stats.treesPlanted),  lbl: "Trees planted"   },
        { num: fmt(stats.volunteers),    lbl: "Volunteers"      },
      ]
    : Array(4).fill(null); // null triggers shimmer

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --forest: #0d3320; --canopy: #1a5c38; --leaf: #2d8a55; --sprout: #4db87a;
          --mist: #e8f5ee; --sand: #f7f3ee; --ink: #1a1a1a; --smoke: #6b7280;
          --line: #e2e8f0; --white: #ffffff; --danger: #dc2626;
        }
        /* right */

        .lg-page { min-height: 100vh; background: var(--sand); display: grid; grid-template-columns: 1fr 1fr; }

        /* left */
        .lg-left {
          background: var(--forest); padding: 56px 52px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .lg-left::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 20% 80%, rgba(77,184,122,0.18), transparent 55%),
                      radial-gradient(circle at 80% 20%, rgba(26,92,56,0.4), transparent 50%);
          pointer-events: none;
        }
        .lg-left-content { position: relative; z-index: 1; }

        .lg-brand {
          font-family: 'DM Serif Display', serif; font-size: 26px;
          color: white; letter-spacing: -0.3px;
          display: flex; align-items: center; gap: 10px; margin-bottom: 52px;
        }
        .lg-brand-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--sprout); }

        .lg-headline {
          font-family: 'DM Serif Display', serif; font-size: 42px;
          line-height: 1.12; letter-spacing: -0.5px; color: white; margin-bottom: 20px;
        }
        .lg-headline em { font-style: italic; color: var(--sprout); }

        .lg-desc { font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.75; max-width: 340px; }

        /* stats grid */
        .lg-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 48px; position: relative; z-index: 1; }

        .lg-stat {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 16px 18px; min-height: 74px;
          transition: background .2s;
        }
        .lg-stat:hover { background: rgba(255,255,255,0.09); }

        .lg-stat-num {
          font-family: 'DM Serif Display', serif; font-size: 26px;
          color: var(--sprout); line-height: 1;
        }
        .lg-stat-lbl {
          font-size: 11px; color: rgba(255,255,255,0.4);
          text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;
        }

        /* shimmer skeleton for stats */
        .lg-stat-shimmer {
          height: 22px; border-radius: 6px; margin-bottom: 8px;
          background: linear-gradient(90deg,
            rgba(255,255,255,.06) 25%,
            rgba(255,255,255,.12) 50%,
            rgba(255,255,255,.06) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.3s infinite;
          width: 55%;
        }
        .lg-stat-shimmer-lbl {
          height: 10px; border-radius: 4px; width: 75%;
          background: linear-gradient(90deg,
            rgba(255,255,255,.04) 25%,
            rgba(255,255,255,.08) 50%,
            rgba(255,255,255,.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.3s infinite;
          animation-delay: .1s;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .lg-footer { font-size: 12.5px; color: rgba(255,255,255,0.3); position: relative; z-index: 1; }

        /* right */
        .lg-right {
          background: var(--white); display: flex;
          align-items: center; justify-content: center; padding: 52px 60px;
        }
        .lg-form-wrap { width: 100%; max-width: 380px; }

        .lg-form-title {
          font-family: 'DM Serif Display', serif; font-size: 32px;
          color: var(--forest); letter-spacing: -0.3px; margin-bottom: 6px;
        }
        .lg-form-sub { font-size: 14px; color: var(--smoke); margin-bottom: 36px; }

        .lg-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .lg-label { font-size: 13px; font-weight: 500; color: #3d2b1f; }

        .lg-input-wrap { position: relative; display: flex; align-items: center; }
        .lg-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid var(--line);
          border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: var(--ink); outline: none; background: white;
          transition: border-color .2s, box-shadow .2s;
        }
        .lg-input:focus { border-color: var(--leaf); box-shadow: 0 0 0 3px rgba(45,138,85,0.1); }
        .lg-input.error { border-color: var(--danger); }
        .lg-input.has-toggle { padding-right: 44px; }

        .lg-pw-toggle {
          position: absolute; right: 12px; background: none; border: none;
          cursor: pointer; font-size: 16px; color: var(--smoke); padding: 0; line-height: 1;
          transition: color .15s;
        }
        .lg-pw-toggle:hover { color: var(--forest); }

        .lg-err { font-size: 12px; color: var(--danger); margin-top: 2px; }

        .lg-api-err {
          padding: 11px 14px; background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; font-size: 13px; color: var(--danger); margin-bottom: 16px;
        }

        .lg-submit {
          width: 100%; padding: 13px; background: var(--forest); color: white;
          border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 600; cursor: pointer;
          transition: background .15s, transform .1s;
          display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px;
        }
        .lg-submit:hover:not(:disabled) { background: var(--canopy); }
        .lg-submit:active:not(:disabled) { transform: scale(.99); }
        .lg-submit:disabled { opacity: .65; cursor: not-allowed; }

        .lg-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3);
          border-top-color: white; border-radius: 50%; animation: spin .65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lg-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0; font-size: 12.5px; color: var(--smoke);
        }
        .lg-divider::before, .lg-divider::after { content: ''; flex: 1; height: 1px; background: var(--line); }

        .lg-signup-row { text-align: center; font-size: 13.5px; color: var(--smoke); margin-top: 24px; }
        .lg-signup-row a { color: var(--leaf); font-weight: 600; text-decoration: none; transition: color .15s; }
        .lg-signup-row a:hover { color: var(--forest); }

        @media (max-width: 768px) {
          .lg-page { grid-template-columns: 1fr; }
          .lg-left { display: none; }
          .lg-right { padding: 40px 24px; align-items: flex-start; padding-top: 60px; }
        }
      `}</style>

      <div className="lg-page">

        {/* left */}
        <motion.div className="lg-left"
          initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:.6 }}>

          <div className="lg-left-content">
            <div className="lg-brand">
              <span className="lg-brand-dot" /> TerraSpotter
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
                /* shimmer skeleton while loading */
                <div key={i} className="lg-stat">
                  <div className="lg-stat-shimmer" style={{ animationDelay: `${i * 0.08}s` }} />
                  <div className="lg-stat-shimmer-lbl" style={{ animationDelay: `${i * 0.08 + 0.05}s` }} />
                </div>
              ) : (
                <motion.div key={tile.lbl} className="lg-stat"
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:.4, delay: i * 0.07 }}>
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

        {/* right */}
        <motion.div className="lg-right"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:.5, delay:.1 }}>
          <div className="lg-form-wrap">

            <h1 className="lg-form-title">Welcome back</h1>
            <p className="lg-form-sub">Sign in to your TerraSpotter workspace</p>

            {errors.api && <div className="lg-api-err">⚠ {errors.api}</div>}

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