/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navbar — broadsheet editorial redesign with full-screen mobile overlay.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [user, setUser]         = useState(null);
  const [ddOpen, setDdOpen]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ddRef    = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* session */
  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true });
        setUser(r.data);
      } catch { setUser(null); }
    };
    setTimeout(fetch, 300);
    window.addEventListener("login",  fetch);
    window.addEventListener("logout", fetch);
    return () => {
      window.removeEventListener("login",  fetch);
      window.removeEventListener("logout", fetch);
    };
  }, []);

  /* scroll */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* click-outside desktop dropdown */
  useEffect(() => {
    const h = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* body lock when menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* close desktop dropdown on route change */
  useEffect(() => { setDdOpen(false); }, [pathname]);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null); setDdOpen(false); setMenuOpen(false);
      window.dispatchEvent(new Event("logout")); navigate("/login");
    } catch (e) { console.error(e); }
  };

  const on = (p) => pathname === p;
  const ini = `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`.toUpperCase();

  /* go to route, always close menu (handles same-route tap) */
  const go = (to) => {
    setMenuOpen(false);
    if (pathname !== to) navigate(to);
  };

  const NAV = user ? [
    { to: "/",                   label: "Home",    idx: "01" },
    { to: "/Main",               label: "Submit",  idx: "02" },
    { to: "/browse",             label: "Browse",  idx: "03" },
    { to: "/plantationShowcase", label: "History", idx: "04" },
    { to: "/about",              label: "About",   idx: "05" },
    { to: "/contact",            label: "Contact", idx: "06" },
    ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: "Admin", idx: "07" }] : []),
  ] : [
    { to: "/",        label: "Home",    idx: "01" },
    { to: "/about",   label: "About",   idx: "02" },
    { to: "/contact", label: "Contact", idx: "03" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600;1,700&family=Epilogue:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --nv-cream: #f5f0e8;
          --nv-parchment: #ede7d9;
          --nv-forest: #0d3320;
          --nv-leaf: #2d7a4a;
          --nv-sprout: #4db87a;
          --nv-ink: #0e1a12;
          --nv-warm: #8c8678;
          --nv-line: #d6cfc4;
        }

        /* ── ROOT ── */
        .nv { font-family: 'Epilogue', sans-serif; position: sticky; top: 0; z-index: 200; }

        /* top accent rule */
        .nv-rule {
          height: 2px;
          background: linear-gradient(90deg, var(--nv-forest) 0%, var(--nv-leaf) 50%, var(--nv-forest) 100%);
        }

        /* ── BAR ── */
        .nv-bar {
          height: 58px;
          background: var(--nv-cream);
          border-bottom: 1px solid var(--nv-line);
          transition: background 0.3s, box-shadow 0.3s;
          position: relative;
        }
        .nv-bar.up {
          background: rgba(245,240,232,0.96);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          box-shadow: 0 1px 0 var(--nv-line), 0 4px 24px rgba(14,26,18,0.08);
        }
        .nv-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 48px;
          height: 100%;
          display: flex; align-items: center;
          gap: 0;
        }

        /* ── BRAND ── */
        .nv-brand {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; flex-shrink: 0;
          transition: opacity 0.2s;
        }
        .nv-brand:hover { opacity: 0.75; }
        .nv-brand-pip {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--nv-sprout);
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(77,184,122,0.2);
        }
        .nv-brand-word {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600; font-style: italic;
          color: var(--nv-ink); letter-spacing: -0.02em;
          white-space: nowrap; line-height: 1;
        }

        /* ── DESKTOP NAV ── */
        .nv-links {
          display: flex; align-items: center; gap: 0;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .nv-lk {
          position: relative;
          font-family: 'Epilogue', sans-serif;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.18em;
          color: var(--nv-warm);
          text-decoration: none; padding: 8px 14px;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nv-lk:hover { color: var(--nv-ink); }
        .nv-lk.hi { color: var(--nv-forest); }
        /* active pip below */
        .nv-lk.hi::after {
          content: '';
          position: absolute;
          bottom: 4px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--nv-sprout);
        }

        /* ── RIGHT ZONE ── */
        .nv-right {
          margin-left: auto; flex-shrink: 0;
          display: flex; align-items: center; gap: 10px;
        }

        /* guest links */
        .nv-signin {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.18em; color: var(--nv-warm);
          text-decoration: none; padding: 7px 12px;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nv-signin:hover { color: var(--nv-ink); }
        .nv-vd { width: 1px; height: 14px; background: var(--nv-line); }
        .nv-start {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.14em; color: var(--nv-cream);
          text-decoration: none; padding: 8px 20px;
          background: var(--nv-forest);
          border-radius: 2px;
          transition: background 0.2s, transform 0.12s;
          white-space: nowrap;
        }
        .nv-start:hover { background: var(--nv-leaf); }
        .nv-start:active { transform: scale(0.97); }

        /* ── MONOGRAM ── */
        .nv-mono-wrap { position: relative; }
        .nv-mono {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--nv-forest);
          color: var(--nv-cream);
          font-family: 'Epilogue', sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none;
          box-shadow: 0 0 0 2px var(--nv-cream), 0 0 0 3px rgba(13,51,32,0.25);
          transition: box-shadow 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .nv-mono:hover {
          background: var(--nv-leaf);
          box-shadow: 0 0 0 2px var(--nv-cream), 0 0 0 3px var(--nv-sprout);
        }
        .nv-mono.open {
          box-shadow: 0 0 0 2px var(--nv-cream), 0 0 0 3.5px var(--nv-sprout);
          background: var(--nv-leaf);
        }

        /* ── DESKTOP DROPDOWN ── */
        .nv-dd {
          position: absolute; top: calc(100% + 12px); right: 0;
          width: 260px;
          background: var(--nv-cream);
          border: 1px solid var(--nv-line);
          border-radius: 2px;
          box-shadow: 0 12px 48px rgba(14,26,18,0.14), 0 2px 8px rgba(14,26,18,0.06);
          overflow: hidden; z-index: 999;
        }
        /* top rule */
        .nv-dd-rule {
          height: 2px;
          background: linear-gradient(90deg, var(--nv-forest), var(--nv-sprout));
        }
        /* user block */
        .nv-dd-user {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 18px 14px;
          border-bottom: 1px solid var(--nv-line);
        }
        .nv-dd-avt {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--nv-forest);
          color: var(--nv-cream); font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-family: 'Epilogue', sans-serif;
          letter-spacing: 0.06em;
        }
        .nv-dd-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 600; color: var(--nv-ink);
          letter-spacing: -0.01em; line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nv-dd-email {
          font-size: 10px; color: var(--nv-warm); margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: 0.02em;
        }
        /* items */
        .nv-dd-items { padding: 6px 8px 8px; }
        .nv-dd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 2px;
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--nv-warm);
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: background 0.15s, color 0.15s;
          font-family: 'Epilogue', sans-serif;
        }
        .nv-dd-item:hover { background: var(--nv-parchment); color: var(--nv-ink); }
        .nv-dd-item.out { color: #b03a2e; }
        .nv-dd-item.out:hover { background: #fdf3f2; color: #8b1f14; }
        .nv-dd-sep { height: 1px; background: var(--nv-line); margin: 4px 8px; }

        /* ── MENU TOGGLE (mobile) ── */
        .nv-menu-btn {
          display: none;
          font-family: 'Epilogue', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.22em; color: var(--nv-warm);
          background: none; border: none; cursor: pointer;
          padding: 8px 4px; transition: color 0.2s;
          flex-shrink: 0; line-height: 1;
        }
        .nv-menu-btn:hover { color: var(--nv-ink); }

        /* ── FULL-SCREEN OVERLAY MENU ── */
        .nv-overlay {
          position: fixed; inset: 0;
          background: var(--nv-forest);
          z-index: 500;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        /* overlay top bar */
        .nv-ov-top {
          height: 60px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .nv-ov-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600; font-style: italic;
          color: var(--nv-cream); letter-spacing: -0.02em;
          display: flex; align-items: center; gap: 8px;
        }
        .nv-ov-brand-pip {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--nv-sprout); flex-shrink: 0;
        }
        .nv-ov-close {
          font-family: 'Epilogue', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.22em; color: rgba(255,255,255,0.45);
          background: none; border: none; cursor: pointer;
          transition: color 0.2s;
        }
        .nv-ov-close:hover { color: var(--nv-cream); }

        /* user strip in overlay */
        .nv-ov-user {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 28px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .nv-ov-avt {
          width: 46px; height: 46px; border-radius: 50%;
          background: rgba(77,184,122,0.15);
          border: 1px solid rgba(77,184,122,0.25);
          color: var(--nv-sprout);
          font-family: 'Epilogue', sans-serif; font-size: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          letter-spacing: 0.06em;
        }
        .nv-ov-uname {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600;
          color: var(--nv-cream); letter-spacing: -0.01em; line-height: 1.1;
        }
        .nv-ov-role {
          font-family: 'Epilogue', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.2em; color: var(--nv-sprout); margin-top: 3px;
        }

        /* nav items in overlay */
        .nv-ov-list {
          flex: 1; overflow-y: auto; padding: 16px 20px 32px;
          display: flex; flex-direction: column;
        }
        .nv-ov-item {
          display: flex; align-items: baseline; gap: 16px;
          padding: 14px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: none; border-right: none; border-left: none; border-top: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: padding-left 0.2s;
        }
        .nv-ov-item:last-of-type { border-bottom: none; }
        .nv-ov-item:hover { padding-left: 16px; }
        .nv-ov-item.hi { padding-left: 16px; }
        .nv-ov-item-idx {
          font-family: 'Epilogue', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          color: rgba(77,184,122,0.5); flex-shrink: 0; padding-top: 4px;
        }
        .nv-ov-item.hi .nv-ov-item-idx { color: var(--nv-sprout); }
        .nv-ov-item-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 7vw, 52px); font-weight: 600;
          color: rgba(255,255,255,0.35); letter-spacing: -0.03em; line-height: 1;
          transition: color 0.2s;
        }
        .nv-ov-item:hover .nv-ov-item-label { color: var(--nv-cream); }
        .nv-ov-item.hi .nv-ov-item-label { color: var(--nv-cream); }

        /* overlay bottom zone */
        .nv-ov-footer {
          flex-shrink: 0;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 18px 28px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .nv-ov-profile-btn {
          font-family: 'Epilogue', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.18em; color: rgba(255,255,255,0.4);
          background: none; border: none; cursor: pointer;
          transition: color 0.2s; padding: 0;
        }
        .nv-ov-profile-btn:hover { color: var(--nv-cream); }
        .nv-ov-logout {
          font-family: 'Epilogue', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.18em; color: rgba(248,113,113,0.6);
          background: none; border: none; cursor: pointer;
          transition: color 0.2s; padding: 0;
        }
        .nv-ov-logout:hover { color: #f87171; }

        /* guest auth in overlay */
        .nv-ov-auth {
          padding: 24px 24px 32px;
          display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;
        }
        .nv-ov-auth-ghost {
          padding: 14px; text-align: center; border-radius: 2px;
          font-family: 'Epilogue', sans-serif; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer; transition: background 0.2s, color 0.2s;
        }
        .nv-ov-auth-ghost:hover { background: rgba(255,255,255,0.1); color: var(--nv-cream); }
        .nv-ov-auth-solid {
          padding: 14px; text-align: center; border-radius: 2px;
          font-family: 'Epilogue', sans-serif; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: var(--nv-forest); background: var(--nv-sprout);
          border: none; cursor: pointer; transition: background 0.2s;
        }
        .nv-ov-auth-solid:hover { background: #62d48e; }

        /* ── RESPONSIVE ── */
        @media(max-width: 860px) {
          .nv-links, .nv-signin, .nv-vd, .nv-start, .nv-mono-wrap { display: none !important; }
          .nv-menu-btn { display: block; }
          .nv-inner { padding: 0 20px; }
        }
        @media(min-width: 861px) {
          .nv-menu-btn { display: none !important; }
          .nv-overlay { display: none; }
        }
      `}</style>

      <div className="nv">
        {/* top accent rule */}
        <div className="nv-rule" />

        {/* ══ BAR ══ */}
        <div className={`nv-bar${scrolled ? " up" : ""}`}>
          <div className="nv-inner">

            {/* Brand */}
            <Link to="/" className="nv-brand">
              <span className="nv-brand-pip" />
              <span className="nv-brand-word">TerraSpotter</span>
            </Link>

            {/* Desktop centered nav */}
            <nav className="nv-links">
              {NAV.map(({ to, label }) => (
                <Link key={to} to={to} className={`nv-lk${on(to) ? " hi" : ""}`}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right controls */}
            <div className="nv-right">

              {/* Guest */}
              {!user && (
                <>
                  <Link to="/login"  className="nv-signin">Sign in</Link>
                  <div className="nv-vd" />
                  <Link to="/signup" className="nv-start">Get started →</Link>
                </>
              )}

              {/* Logged in — monogram + dropdown */}
              {user && (
                <div className="nv-mono-wrap" ref={ddRef}>
                  <button
                    className={`nv-mono${ddOpen ? " open" : ""}`}
                    onClick={() => setDdOpen(o => !o)}
                    aria-label="Account menu"
                  >
                    {ini}
                  </button>

                  <AnimatePresence>
                    {ddOpen && (
                      <motion.div
                        className="nv-dd"
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,   scale: 1    }}
                        exit={{    opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="nv-dd-rule" />

                        <div className="nv-dd-user">
                          <div className="nv-dd-avt">{ini}</div>
                          <div style={{ overflow: "hidden" }}>
                            <div className="nv-dd-name">{user.fname} {user.lname}</div>
                            <div className="nv-dd-email">{user.email}</div>
                          </div>
                        </div>

                        <div className="nv-dd-items">
                          <Link to="/profile" className="nv-dd-item" onClick={() => setDdOpen(false)}>
                            My Profile
                          </Link>
                          {NAV.filter(x => x.to !== "/").map(({ to, label }) => (
                            <Link key={to} to={to} className="nv-dd-item" onClick={() => setDdOpen(false)}>
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div className="nv-dd-sep" />

                        <div className="nv-dd-items">
                          <button className="nv-dd-item out" onClick={logout}>
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="nv-menu-btn"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Open menu"
              >
                {menuOpen ? "Close" : "Menu"}
              </button>

            </div>
          </div>
        </div>

        {/* ══ FULL-SCREEN OVERLAY MENU (mobile only) ══ */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="nv-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* Top bar */}
              <div className="nv-ov-top">
                <div className="nv-ov-brand">
                  <span className="nv-ov-brand-pip" />
                  TerraSpotter
                </div>
                <button className="nv-ov-close" onClick={() => setMenuOpen(false)}>
                  Close
                </button>
              </div>

              {/* User strip */}
              {user && (
                <motion.div
                  className="nv-ov-user"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.32 }}
                >
                  <div className="nv-ov-avt">{ini}</div>
                  <div>
                    <div className="nv-ov-uname">{user.fname} {user.lname}</div>
                    <div className="nv-ov-role">{user.role === "ADMIN" ? "Administrator" : "Member"}</div>
                  </div>
                </motion.div>
              )}

              {/* Nav list */}
              <div className="nv-ov-list">
                {NAV.map(({ to, label, idx }, i) => (
                  <motion.button
                    key={to}
                    className={`nv-ov-item${on(to) ? " hi" : ""}`}
                    onClick={() => go(to)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.055, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="nv-ov-item-idx">{idx}</span>
                    <span className="nv-ov-item-label">{label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Footer actions */}
              {user ? (
                <div className="nv-ov-footer">
                  <button className="nv-ov-profile-btn" onClick={() => go("/profile")}>
                    My Profile
                  </button>
                  <button className="nv-ov-logout" onClick={logout}>
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="nv-ov-auth">
                  <button className="nv-ov-auth-ghost" onClick={() => go("/login")}>
                    Sign in
                  </button>
                  <button className="nv-ov-auth-solid" onClick={() => go("/signup")}>
                    Get started →
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}