/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navbar — complete redesign. Clean mobile sheet, zero duplication.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [user, setUser]           = useState(null);
  const [ddOpen, setDdOpen]       = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const ddRef    = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* session */
  useEffect(() => {
    const fetch = async () => {
      try { const r = await axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true }); setUser(r.data); }
      catch { setUser(null); }
    };
    setTimeout(fetch, 300);
    window.addEventListener("login",  fetch);
    window.addEventListener("logout", fetch);
    return () => { window.removeEventListener("login", fetch); window.removeEventListener("logout", fetch); };
  }, []);

  /* scroll */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);

  /* click outside dropdown */
  useEffect(() => {
    const h = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  /* close on route change */
  useEffect(() => { setMenuOpen(false); setDdOpen(false); }, [pathname]);

  /* body scroll lock */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null); setDdOpen(false); setMenuOpen(false);
      window.dispatchEvent(new Event("logout")); navigate("/login");
    } catch (e) { console.error(e); }
  };

  const on = (p) => pathname === p;
  const ini = `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`.toUpperCase();

  /* ONE source of truth for nav */
  const NAV = user ? [
    { to: "/",                   label: "Home",    icon: "🏡" },
    { to: "/Main",               label: "Submit",  icon: "📍" },
    { to: "/browse",             label: "Browse",  icon: "🗺️" },
    { to: "/plantationShowcase", label: "History", icon: "📚" },
    { to: "/about",              label: "About",   icon: "ℹ️"  },
    { to: "/contact",            label: "Contact", icon: "📞" },
    ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: "Admin", icon: "⚙️" }] : []),
  ] : [
    { to: "/",        label: "Home",    icon: "🏡" },
    { to: "/about",   label: "About",   icon: "ℹ️"  },
    { to: "/contact", label: "Contact", icon: "📞" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        * { box-sizing: border-box; }

        .n-root {
          position: sticky; top: 0; z-index: 200;
          font-family: 'DM Sans', sans-serif;
        }

        /* ─── bar ─── */
        .n-bar {
          height: 60px;
          display: flex; align-items: center;
          background: #f8f5f0;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          transition: background .3s, box-shadow .3s;
        }
        .n-bar.up {
          background: rgba(248,245,240,.94);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
          box-shadow: 0 1px 0 rgba(0,0,0,.06), 0 4px 24px rgba(0,0,0,.09);
        }
        .n-inner {
          width: 100%; max-width: 1280px;
          margin: 0 auto; padding: 0 32px;
          display: flex; align-items: center; gap: 0;
          height: 100%;
        }

        /* ─── brand ─── */
        .n-brand {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0; margin-right: 36px;
          opacity: 1; transition: opacity .15s;
        }
        .n-brand:hover { opacity: .8; }
        .n-brand img {
          width: 32px; height: 32px; border-radius: 9px; object-fit: cover;
          box-shadow: 0 2px 8px rgba(58,140,87,.28);
        }
        .n-brand-text {
          font-family: 'Playfair Display', serif;
          font-size: 19px; font-weight: 700; color: #111; letter-spacing: -.3px; white-space: nowrap;
        }

        /* ─── desktop links ─── */
        .n-links { display: flex; align-items: center; gap: 1px; flex: 1; }
        .n-link {
          position: relative; font-size: 13.5px; font-weight: 500; color: #6b6457;
          text-decoration: none; padding: 6px 11px; border-radius: 7px;
          transition: color .15s, background .15s; white-space: nowrap;
        }
        .n-link:hover { color: #111; background: rgba(0,0,0,.05); }
        .n-link.hi { color: #1f6b3a; font-weight: 600; background: rgba(58,140,87,.09); }
        .n-link.hi::after {
          content: ''; position: absolute; bottom: 2px; left: 11px; right: 11px;
          height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #3a8c57, #1f6b3a);
        }

        /* ─── right ─── */
        .n-right { margin-left: auto; flex-shrink: 0; display: flex; align-items: center; gap: 8px; }

        /* ghost / cta */
        .n-ghost {
          font-size: 13.5px; font-weight: 500; color: #6b6457;
          text-decoration: none; padding: 7px 14px; border-radius: 7px;
          transition: color .15s, background .15s; white-space: nowrap;
        }
        .n-ghost:hover { color: #111; background: rgba(0,0,0,.05); }
        .n-vdiv { width: 1px; height: 18px; background: rgba(0,0,0,.09); }
        .n-cta {
          font-size: 13.5px; font-weight: 600; color: #fff;
          text-decoration: none; padding: 8px 18px; border-radius: 8px; white-space: nowrap;
          background: linear-gradient(145deg, #256638, #163d25);
          box-shadow: 0 2px 10px rgba(58,140,87,.30), inset 0 1px 0 rgba(255,255,255,.10);
          transition: filter .2s, transform .12s;
        }
        .n-cta:hover { filter: brightness(1.09); }
        .n-cta:active { transform: scale(.97); }

        /* ─── profile pill ─── */
        .n-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 6px 4px 14px; border-radius: 100px;
          border: 1.5px solid rgba(0,0,0,.09); background: #fff;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; color: #111;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
          transition: border-color .18s, box-shadow .18s, background .18s;
          white-space: nowrap;
        }
        .n-pill:hover { border-color: rgba(22,61,37,.25); background: #fefcfa; box-shadow: 0 2px 12px rgba(0,0,0,.09); }
        .n-pill.open { border-color: #3a8c57; box-shadow: 0 0 0 3px rgba(58,140,87,.16); background: #fefcfa; }
        .n-ini {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #163d25, #3a8c57);
          color: #fff; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: .8px; flex-shrink: 0;
        }
        .n-chv { opacity: .35; flex-shrink: 0; transition: transform .22s, opacity .15s; }
        .n-chv.r { transform: rotate(180deg); opacity: .6; }

        /* ─── dropdown ─── */
        .n-dd {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 240px; background: #fff;
          border: 1px solid rgba(0,0,0,.08); border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,.13), 0 2px 10px rgba(0,0,0,.07);
          overflow: hidden; z-index: 999;
        }
        .n-dd-top { height: 3px; background: linear-gradient(90deg, #163d25, #3a8c57, #163d25); }
        .n-dd-who {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 15px 12px; border-bottom: 1px solid #f0ebe4;
        }
        .n-dd-avt {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #163d25, #3a8c57);
          color: #fff; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 6px rgba(58,140,87,.22);
        }
        .n-dd-n { font-size: 13px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .n-dd-e { font-size: 11px; color: #a89e93; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
        .n-dd-body { padding: 5px; }
        .n-dd-item {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 9px; border-radius: 8px;
          font-size: 13px; color: #3a3530; font-weight: 400;
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: background .12s, color .12s;
        }
        .n-dd-item:hover { background: #f5f1ec; color: #111; }
        .n-dd-item.logout { color: #b03a2e; }
        .n-dd-item.logout:hover { background: #fdf3f2; }
        .n-dd-ico {
          width: 28px; height: 28px; border-radius: 6px; background: #f5f1ec;
          display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;
          transition: background .12s;
        }
        .n-dd-item:hover .n-dd-ico { background: #ede8e2; }
        .n-dd-item.logout .n-dd-ico { background: #fdf3f2; }
        .n-dd-item.logout:hover .n-dd-ico { background: #fce8e6; }
        .n-dd-sep { height: 1px; background: #f0ebe4; margin: 3px 6px; }

        /* ─── hamburger ─── */
        .n-ham {
          display: none; width: 38px; height: 38px; border-radius: 9px;
          border: 1.5px solid rgba(0,0,0,.09); background: #fff;
          cursor: pointer; flex-direction: column;
          align-items: center; justify-content: center; gap: 4.5px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
          transition: background .15s; flex-shrink: 0;
        }
        .n-ham:hover { background: #f0ebe4; }
        .n-bar-ln {
          width: 17px; height: 1.5px; background: #333; border-radius: 2px;
          transition: transform .22s, opacity .18s;
        }
        .n-ham.x .n-bar-ln:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .n-ham.x .n-bar-ln:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .n-ham.x .n-bar-ln:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

        /* ─── mobile sheet ─── */
        /* RULE: mobile sheet shows ONLY ONE unified view, no dropdown */
        .n-sheet {
          position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
          background: #f8f5ef; z-index: 190; overflow-y: auto;
        }
        .n-sheet-body { padding: 20px 16px 40px; display: flex; flex-direction: column; gap: 0; }

        /* user card at top of sheet */
        .n-sh-card {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px; margin-bottom: 14px;
          background: #fff; border: 1px solid rgba(0,0,0,.08);
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,.06);
        }
        .n-sh-avt {
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, #163d25, #3a8c57);
          color: #fff; font-size: 15px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 10px rgba(58,140,87,.28);
        }
        .n-sh-name { font-size: 15px; font-weight: 600; color: #111; }
        .n-sh-role {
          display: inline-block; margin-top: 3px;
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: .8px; color: #1f6b3a;
          background: rgba(58,140,87,.10); padding: 2px 8px; border-radius: 100px;
        }

        /* section header */
        .n-sh-label {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1.2px; color: #a89e93;
          padding: 0 6px; margin: 12px 0 6px;
        }

        /* sheet link row */
        .n-sh-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          font-size: 15px; font-weight: 500; color: #2a2520;
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: background .14s, color .14s; margin-bottom: 2px;
        }
        .n-sh-row:hover { background: rgba(0,0,0,.05); color: #111; }
        .n-sh-row.active { background: rgba(58,140,87,.10); color: #1f6b3a; font-weight: 600; }
        .n-sh-row.danger { color: #b03a2e; }
        .n-sh-row.danger:hover { background: #fdf3f2; }
        .n-sh-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #3a8c57;
          flex-shrink: 0;
        }
        .n-sh-ico {
          width: 36px; height: 36px; border-radius: 10px; background: #fff;
          border: 1px solid rgba(0,0,0,.07);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,.06);
          transition: background .14s;
        }
        .n-sh-row:hover .n-sh-ico { background: #f5f1ec; }
        .n-sh-row.danger .n-sh-ico { background: #fff5f5; border-color: rgba(176,58,46,.1); }

        .n-sh-divider { height: 1px; background: rgba(0,0,0,.08); margin: 10px 0; }

        /* guest auth buttons */
        .n-sh-auth { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .n-sh-in {
          padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 500;
          text-align: center; text-decoration: none; color: #6b6457;
          background: #fff; border: 1.5px solid rgba(0,0,0,.09);
          transition: background .14s;
        }
        .n-sh-in:hover { background: #f0ebe4; }
        .n-sh-go {
          padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 600;
          text-align: center; text-decoration: none; color: #fff;
          background: linear-gradient(145deg, #256638, #163d25);
          box-shadow: 0 3px 14px rgba(58,140,87,.30); transition: filter .15s;
        }
        .n-sh-go:hover { filter: brightness(1.08); }

        /* responsive breakpoint */
        @media (max-width: 860px) {
          .n-links, .n-ghost, .n-vdiv, .n-cta { display: none !important; }
          .n-pill { display: none !important; }
          .n-ham { display: flex; }
          .n-inner { padding: 0 16px; }
          .n-brand { margin-right: 0; }
        }
        @media (min-width: 861px) {
          .n-ham { display: none !important; }
          .n-sheet { display: none !important; }
        }
      `}</style>

      <div className="n-root">

        {/* ══ TOP BAR ══ */}
        <div className={`n-bar${scrolled ? " up" : ""}`}>
          <div className="n-inner">

            {/* Brand */}
            <Link to="/" className="n-brand">
              <img src="/favicon.ico" alt="TerraSpotter" />
              <span className="n-brand-text">TerraSpotter</span>
            </Link>

            {/* Desktop nav links */}
            <nav className="n-links">
              {NAV.map(({ to, label }) => (
                <Link key={to} to={to} className={`n-link${on(to) ? " hi" : ""}`}>{label}</Link>
              ))}
            </nav>

            {/* Right zone */}
            <div className="n-right">

              {/* Desktop: guest */}
              {!user && (
                <>
                  <Link to="/login"  className="n-ghost">Sign in</Link>
                  <div className="n-vdiv" />
                  <Link to="/signup" className="n-cta">Get started →</Link>
                </>
              )}

              {/* Desktop: profile pill + dropdown */}
              {user && (
                <div style={{ position: "relative" }} ref={ddRef}>
                  <button
                    className={`n-pill${ddOpen ? " open" : ""}`}
                    onClick={() => setDdOpen(o => !o)}
                  >
                    <span>{user.fname}</span>
                    <div className="n-ini">{ini}</div>
                    <svg className={`n-chv${ddOpen ? " r" : ""}`} width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 4l3.5 3.5L9 4" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <AnimatePresence>
                    {ddOpen && (
                      <motion.div className="n-dd"
                        initial={{ opacity: 0, y: -8, scale: .97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1   }}
                        exit={{    opacity: 0, y: -8, scale: .97 }}
                        transition={{ duration: .16, ease: [.22,1,.36,1] }}
                      >
                        <div className="n-dd-top" />
                        <div className="n-dd-who">
                          <div className="n-dd-avt">{ini}</div>
                          <div style={{ overflow: "hidden" }}>
                            <div className="n-dd-n">{user.fname} {user.lname}</div>
                            <div className="n-dd-e">{user.email}</div>
                          </div>
                        </div>
                        <div className="n-dd-body">
                          {NAV.filter(x => x.to !== "/").map(({ to, icon, label }) => (
                            <Link key={to} to={to} className="n-dd-item" onClick={() => setDdOpen(false)}>
                              <span className="n-dd-ico">{icon}</span>{label}
                            </Link>
                          ))}
                          <Link to="/profile" className="n-dd-item" onClick={() => setDdOpen(false)}>
                            <span className="n-dd-ico">👤</span>My Profile
                          </Link>
                        </div>
                        <div className="n-dd-sep" />
                        <div className="n-dd-body">
                          <button className="n-dd-item logout" onClick={logout}>
                            <span className="n-dd-ico">🚪</span>Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Hamburger — mobile only */}
              <button
                className={`n-ham${menuOpen ? " x" : ""}`}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menu"
              >
                <span className="n-bar-ln" />
                <span className="n-bar-ln" />
                <span className="n-bar-ln" />
              </button>
            </div>
          </div>
        </div>

        {/* ══ MOBILE SHEET — single unified view, no desktop dropdown ══ */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div className="n-sheet"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1,  y: 0   }}
              exit={{    opacity: 0,  y: -12  }}
              transition={{ duration: .22, ease: [.22,1,.36,1] }}
            >
              <div className="n-sheet-body">

                {/* Logged-in: user card */}
                {user && (
                  <div className="n-sh-card">
                    <div className="n-sh-avt">{ini}</div>
                    <div>
                      <div className="n-sh-name">{user.fname} {user.lname}</div>
                      <span className="n-sh-role">{user.role === "ADMIN" ? "Admin" : "Member"}</span>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="n-sh-label">Navigation</div>
                {NAV.map(({ to, label, icon }) => (
                  <Link key={to} to={to} className={`n-sh-row${on(to) ? " active" : ""}`}>
                    <span className="n-sh-ico">{icon}</span>
                    {label}
                    {on(to) && <span className="n-sh-dot" style={{ marginLeft: "auto" }} />}
                  </Link>
                ))}

                {/* Logged-in: account section */}
                {user && (
                  <>
                    <div className="n-sh-divider" />
                    <div className="n-sh-label">Account</div>

                    <Link to="/profile" className="n-sh-row" onClick={() => setMenuOpen(false)}>
                      <span className="n-sh-ico">👤</span>My Profile
                    </Link>

                    <div className="n-sh-divider" />

                    <button className="n-sh-row danger" onClick={logout}>
                      <span className="n-sh-ico">🚪</span>Sign out
                    </button>
                  </>
                )}

                {/* Guest: auth buttons */}
                {!user && (
                  <>
                    <div className="n-sh-divider" />
                    <div className="n-sh-auth">
                      <Link to="/login"  className="n-sh-in">Sign in</Link>
                      <Link to="/signup" className="n-sh-go">Get started →</Link>
                    </div>
                  </>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}