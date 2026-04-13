/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navbar — side-drawer mobile menu, closes on same-route tap, full redesign.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [user, setUser]     = useState(null);
  const [xpData, setXpData] = useState(null);
  const [ddOpen, setDdOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ddRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* session */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true });
        setUser(r.data);
        // Fetch XP after login
        try {
          const xp = await axios.get(`${BASE_URL}/api/gamification/me`, { withCredentials: true });
          setXpData(xp.data);
        } catch { setXpData(null); }
      } catch { setUser(null); setXpData(null); }
    };
    setTimeout(fetchUser, 300);
    window.addEventListener("login",  fetchUser);
    window.addEventListener("logout", () => { setUser(null); setXpData(null); });
    return () => {
      window.removeEventListener("login",  fetchUser);
      window.removeEventListener("logout", () => {});
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

  /* body lock when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  /* close desktop dropdown on route change */
  useEffect(() => { setDdOpen(false); }, [pathname]);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null); setDdOpen(false); setDrawer(false);
      window.dispatchEvent(new Event("logout")); navigate("/login");
    } catch (e) { console.error(e); }
  };

  const on = (p) => pathname === p;
  const ini = `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`.toUpperCase();

  /* closes drawer; if already on that route, still closes */
  const drawerGo = (to) => {
    setDrawer(false);
    if (pathname !== to) navigate(to);
  };

  const NAV = user ? [
    { to: "/",                  label: "Home",        icon: "🏡" },
    { to: "/Main",             label: "Submit",      icon: "📍" },
    { to: "/browse",           label: "Browse",      icon: "🗺️" },
    { to: "/plantationShowcase", label: "History",   icon: "📚" },
    { to: "/community",        label: "Community",   icon: "🌱" },
    { to: "/leaderboard",      label: "Leaderboard", icon: "🏆" },
    { to: "/about",            label: "About",       icon: "ℹ️" },
    { to: "/forum",            label: "Forum",       icon: "💬" },
    ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: "Admin", icon: "⚙️" }] : []),
  ] : [
    { to: "/",            label: "Home",        icon: "🏡" },
    { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { to: "/about",       label: "About",       icon: "ℹ️" },
    { to: "/forum",       label: "Forum",       icon: "💬" },
  ];

  const DD_ITEMS = NAV.filter(x => x.to !== "/").concat([{ to: "/profile", label: "My Profile", icon: "👤" }]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .nv { font-family: 'DM Sans', sans-serif; position: sticky; top: 0; z-index: 200; }

        /* ── bar ── */
        .nv-bar {
          height: 62px; display: flex; align-items: center;
          background: #f8f5f0;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          transition: background .3s, box-shadow .3s;
        }
        .nv-bar.up {
          background: rgba(248,245,240,.94);
          backdrop-filter: blur(20px) saturate(1.5);
          -webkit-backdrop-filter: blur(20px) saturate(1.5);
          box-shadow: 0 1px 0 rgba(0,0,0,.06), 0 4px 28px rgba(0,0,0,.09);
        }
        .nv-inner {
          width: 100%; max-width: 1280px; margin: 0 auto;
          padding: 0 32px; display: flex; align-items: center;
          height: 100%; gap: 0;
        }

        /* ── brand ── */
        .nv-brand {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0; margin-right: 36px;
          transition: opacity .15s;
        }
        .nv-brand:hover { opacity: .8; }
        .nv-brand img {
          width: 32px; height: 32px; border-radius: 9px; object-fit: cover;
          box-shadow: 0 2px 8px rgba(58,140,87,.28); flex-shrink: 0;
        }
        .nv-brand-txt {
          font-family: 'Playfair Display', serif;
          font-size: 19px; font-weight: 700; color: #111; letter-spacing: -.3px; white-space: nowrap;
        }

        /* ── desktop links ── */
        .nv-links { display: flex; align-items: center; gap: 1px; flex: 1; }
        .nv-lk {
          position: relative; font-size: 13.5px; font-weight: 500; color: #6b6457;
          text-decoration: none; padding: 6px 11px; border-radius: 7px;
          transition: color .15s, background .15s; white-space: nowrap;
        }
        .nv-lk:hover { color: #111; background: rgba(0,0,0,.05); }
        .nv-lk.hi { color: #1f6b3a; font-weight: 600; background: rgba(58,140,87,.09); }
        .nv-lk.hi::after {
          content: ''; position: absolute; bottom: 2px; left: 11px; right: 11px;
          height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #3a8c57, #1f6b3a);
        }

        /* ── right ── */
        .nv-right { margin-left: auto; flex-shrink: 0; display: flex; align-items: center; gap: 8px; }

        .nv-ghost {
          font-size: 13.5px; font-weight: 500; color: #6b6457;
          text-decoration: none; padding: 7px 14px; border-radius: 7px;
          transition: color .15s, background .15s; white-space: nowrap;
        }
        .nv-ghost:hover { color: #111; background: rgba(0,0,0,.05); }
        .nv-vd { width: 1px; height: 18px; background: rgba(0,0,0,.09); }
        .nv-cta {
          font-size: 13.5px; font-weight: 600; color: #fff;
          text-decoration: none; padding: 8px 18px; border-radius: 8px;
          background: linear-gradient(145deg, #256638, #163d25);
          box-shadow: 0 2px 10px rgba(58,140,87,.30), inset 0 1px 0 rgba(255,255,255,.10);
          transition: filter .2s, transform .12s; white-space: nowrap;
        }
        .nv-cta:hover { filter: brightness(1.09); }
        .nv-cta:active { transform: scale(.97); }

        /* ── profile pill ── */
        .nv-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 6px 4px 14px; border-radius: 100px;
          border: 1.5px solid rgba(0,0,0,.09); background: #fff;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; color: #111;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
          transition: border-color .18s, box-shadow .18s, background .18s; white-space: nowrap;
        }
        .nv-pill:hover { border-color: rgba(22,61,37,.25); background: #fefcfa; box-shadow: 0 2px 12px rgba(0,0,0,.09); }
        .nv-pill.open { border-color: #3a8c57; box-shadow: 0 0 0 3px rgba(58,140,87,.16); background: #fefcfa; }
        .nv-ini {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #163d25, #3a8c57);
          color: #fff; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: .8px; flex-shrink: 0;
        }
        .nv-chv { opacity: .35; flex-shrink: 0; transition: transform .22s, opacity .15s; }
        .nv-chv.r { transform: rotate(180deg); opacity: .6; }

        /* ── desktop dropdown ── */
        .nv-dd {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 238px; background: #fff;
          border: 1px solid rgba(0,0,0,.08); border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,.13), 0 2px 10px rgba(0,0,0,.07);
          overflow: hidden; z-index: 999;
        }
        .nv-dd-top { height: 3px; background: linear-gradient(90deg, #163d25, #3a8c57, #163d25); }
        .nv-dd-who {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 15px 12px; border-bottom: 1px solid #f0ebe4;
        }
        .nv-dd-avt {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #163d25, #3a8c57);
          color: #fff; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 6px rgba(58,140,87,.22);
        }
        .nv-dd-name { font-size: 13px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nv-dd-email { font-size: 11px; color: #a89e93; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
        .nv-dd-body { padding: 5px; }
        .nv-dd-row {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 9px; border-radius: 8px;
          font-size: 13px; color: #3a3530;
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: background .12s, color .12s;
        }
        .nv-dd-row:hover { background: #f5f1ec; color: #111; }
        .nv-dd-row.out { color: #b03a2e; }
        .nv-dd-row.out:hover { background: #fdf3f2; }
        .nv-dd-ico {
          width: 28px; height: 28px; border-radius: 6px; background: #f5f1ec;
          display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;
        }
        .nv-dd-row:hover .nv-dd-ico { background: #ede8e2; }
        .nv-dd-row.out .nv-dd-ico { background: #fdf3f2; }
        .nv-dd-row.out:hover .nv-dd-ico { background: #fce8e6; }
        .nv-dd-sep { height: 1px; background: #f0ebe4; margin: 3px 6px; }

        /* ── hamburger ── */
        .nv-ham {
          display: none; width: 38px; height: 38px; border-radius: 9px;
          border: 1.5px solid rgba(0,0,0,.09); background: #fff;
          cursor: pointer; flex-direction: column;
          align-items: center; justify-content: center; gap: 4.5px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06); transition: background .15s; flex-shrink: 0;
        }
        .nv-ham:hover { background: #f0ebe4; }
        .nv-ham-ln {
          width: 17px; height: 1.5px; background: #333; border-radius: 2px;
          transition: transform .22s, opacity .18s;
        }
        .nv-ham.x .nv-ham-ln:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .nv-ham.x .nv-ham-ln:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nv-ham.x .nv-ham-ln:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

        /* ── backdrop ── */
        .nv-backdrop {
          position: fixed; inset: 0; z-index: 290;
          background: rgba(10,20,12,.45);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }

        /* ── side drawer ── */
        .nv-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 82vw);
          background: #f8f5ef;
          z-index: 300;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,.18);
          overflow: hidden;
        }

        /* drawer header */
        .nv-dr-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          height: 62px; flex-shrink: 0;
          background: #163d25;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .nv-dr-brand {
          display: flex; align-items: center; gap: 9px;
        }
        .nv-dr-brand img {
          width: 30px; height: 30px; border-radius: 8px; object-fit: cover;
          box-shadow: 0 2px 8px rgba(0,0,0,.3);
        }
        .nv-dr-brand-txt {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -.2px;
        }
        .nv-dr-close {
          width: 34px; height: 34px; border-radius: 8px;
          background: rgba(255,255,255,.10); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,.8); font-size: 16px;
          transition: background .15s;
        }
        .nv-dr-close:hover { background: rgba(255,255,255,.18); }

        /* user card */
        .nv-dr-user {
          margin: 16px 16px 4px;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid rgba(0,0,0,.07);
          border-radius: 14px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,.06);
        }
        .nv-dr-avt {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #163d25, #3a8c57);
          color: #fff; font-size: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 8px rgba(58,140,87,.28);
        }
        .nv-dr-uname { font-size: 14px; font-weight: 600; color: #111; }
        .nv-dr-badge {
          display: inline-flex; align-items: center;
          margin-top: 3px; padding: 2px 8px; border-radius: 100px;
          font-size: 10px; font-weight: 600; letter-spacing: .8px; text-transform: uppercase;
          background: rgba(58,140,87,.12); color: #1f6b3a;
        }

        /* scrollable body */
        .nv-dr-body { flex: 1; overflow-y: auto; padding: 8px 12px 24px; }

        /* section label */
        .nv-dr-lbl {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1.2px; color: #a89e93;
          padding: 12px 8px 6px;
        }

        /* nav row */
        .nv-dr-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: 11px;
          font-size: 14.5px; font-weight: 500; color: #2d2520;
          text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          transition: background .13s, color .13s; margin-bottom: 2px;
        }
        .nv-dr-row:hover { background: rgba(0,0,0,.05); color: #111; }
        .nv-dr-row.hi {
          background: linear-gradient(135deg, rgba(58,140,87,.12), rgba(31,107,58,.06));
          color: #1a5c34; font-weight: 600;
        }
        .nv-dr-row.danger { color: #b03a2e; }
        .nv-dr-row.danger:hover { background: #fdf3f2; }

        .nv-dr-ico {
          width: 38px; height: 38px; border-radius: 10px;
          background: #fff; border: 1px solid rgba(0,0,0,.07);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
          transition: background .13s, box-shadow .13s;
        }
        .nv-dr-row:hover .nv-dr-ico { background: #f0ebe4; box-shadow: none; }
        .nv-dr-row.hi .nv-dr-ico {
          background: rgba(58,140,87,.15);
          border-color: rgba(58,140,87,.2); box-shadow: none;
        }
        .nv-dr-row.danger .nv-dr-ico { background: #fff5f5; border-color: rgba(176,58,46,.1); }

        .nv-dr-txt { flex: 1; }
        .nv-dr-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #3a8c57; flex-shrink: 0;
        }

        .nv-dr-sep { height: 1px; background: rgba(0,0,0,.07); margin: 6px 4px; }

        /* guest buttons */
        .nv-dr-auth { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
        .nv-dr-signin {
          padding: 13px; border-radius: 11px; font-size: 14.5px; font-weight: 500;
          text-align: center; text-decoration: none; color: #6b6457;
          background: #fff; border: 1.5px solid rgba(0,0,0,.09);
          transition: background .13s; display: block;
        }
        .nv-dr-signin:hover { background: #f0ebe4; }
        .nv-dr-go {
          padding: 13px; border-radius: 11px; font-size: 14.5px; font-weight: 600;
          text-align: center; text-decoration: none; color: #fff; display: block;
          background: linear-gradient(145deg, #256638, #163d25);
          box-shadow: 0 3px 14px rgba(58,140,87,.30); transition: filter .15s;
        }
        .nv-dr-go:hover { filter: brightness(1.08); }

        /* responsive */
        @media (max-width: 860px) {
          .nv-links, .nv-ghost, .nv-vd, .nv-cta, .nv-pill { display: none !important; }
          .nv-ham { display: flex; }
          .nv-inner { padding: 0 16px; }
          .nv-brand { margin-right: 0; }
        }
        @media (min-width: 861px) {
          .nv-ham { display: none !important; }
        }
      `}</style>

      <div className="nv">

        {/* ══ BAR ══ */}
        <div className={`nv-bar${scrolled ? " up" : ""}`}>
          <div className="nv-inner">

            <Link to="/" className="nv-brand">
              <img src="/favicon.ico" alt="TerraSpotter" />
              <span className="nv-brand-txt">TerraSpotter</span>
            </Link>

            <nav className="nv-links">
              {NAV.map(({ to, label }) => (
                <Link key={to} to={to} className={`nv-lk${on(to) ? " hi" : ""}`}>{label}</Link>
              ))}
            </nav>

            <div className="nv-right">
              {!user ? (
                <>
                  <Link to="/login" className="nv-ghost">Sign in</Link>
                  <div className="nv-vd" />
                  <Link to="/signup" className="nv-cta">Get started →</Link>
                </>
              ) : (
                <div style={{ position: "relative" }} ref={ddRef}>
                  <button
                    className={`nv-pill${ddOpen ? " open" : ""}`}
                    onClick={() => setDdOpen(o => !o)}
                  >
                    {/* XP pill — shown when xpData loaded */}
                    {xpData && (
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: "#1f6b3a",
                        background: "rgba(58,140,87,0.12)",
                        padding: "2px 8px", borderRadius: 100,
                        border: "1px solid rgba(58,140,87,0.2)",
                        whiteSpace: "nowrap", letterSpacing: 0.2,
                      }}>
                        ⚡{xpData.totalXp?.toLocaleString()} &middot; Lv&nbsp;{xpData.level}
                      </span>
                    )}
                    <span>{user.fname}</span>
                    <div className="nv-ini">{ini}</div>
                    <svg className={`nv-chv${ddOpen ? " r" : ""}`} width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 4l3.5 3.5L9 4" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {ddOpen && (
                      <motion.div className="nv-dd"
                        initial={{ opacity: 0, y: -8, scale: .97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: .97 }}
                        transition={{ duration: .16, ease: [.22, 1, .36, 1] }}
                      >
                        <div className="nv-dd-top" />
                        <div className="nv-dd-who">
                          <div className="nv-dd-avt">{ini}</div>
                          <div style={{ overflow: "hidden" }}>
                            <div className="nv-dd-name">{user.fname} {user.lname}</div>
                            <div className="nv-dd-email">{user.email}</div>
                          </div>
                        </div>
                        <div className="nv-dd-body">
                          <Link to="/profile" className="nv-dd-row" onClick={() => setDdOpen(false)}>
                            <span className="nv-dd-ico">👤</span>My Profile
                          </Link>
                          {NAV.filter(x => x.to !== "/").map(({ to, icon, label }) => (
                            <Link key={to} to={to} className="nv-dd-row" onClick={() => setDdOpen(false)}>
                              <span className="nv-dd-ico">{icon}</span>{label}
                            </Link>
                          ))}
                        </div>
                        <div className="nv-dd-sep" />
                        <div className="nv-dd-body">
                          <button className="nv-dd-row out" onClick={logout}>
                            <span className="nv-dd-ico">🚪</span>Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* hamburger — mobile only */}
              <button
                className={`nv-ham${drawer ? " x" : ""}`}
                onClick={() => setDrawer(o => !o)}
                aria-label="Menu"
              >
                <span className="nv-ham-ln" />
                <span className="nv-ham-ln" />
                <span className="nv-ham-ln" />
              </button>
            </div>
          </div>
        </div>

        {/* ══ SIDE DRAWER + BACKDROP ══ */}
        <AnimatePresence>
          {drawer && (
            <>
              {/* backdrop */}
              <motion.div
                className="nv-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: .22 }}
                onClick={() => setDrawer(false)}
              />

              {/* drawer panel — slides in from right */}
              <motion.div
                className="nv-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: .28, ease: [.32, .72, 0, 1] }}
              >
                {/* header */}
                <div className="nv-dr-head">
                  <div className="nv-dr-brand">
                    <img src="/favicon.ico" alt="" />
                    <span className="nv-dr-brand-txt">TerraSpotter</span>
                  </div>
                  <button className="nv-dr-close" onClick={() => setDrawer(false)}>✕</button>
                </div>

                {/* user card */}
                {user && (
                  <div className="nv-dr-user">
                    <div className="nv-dr-avt">{ini}</div>
                    <div>
                      <div className="nv-dr-uname">{user.fname} {user.lname}</div>
                      <span className="nv-dr-badge">
                        {user.role === "ADMIN" ? "Admin" : "Member"}
                      </span>
                    </div>
                  </div>
                )}

                {/* scrollable body */}
                <div className="nv-dr-body">

                  <div className="nv-dr-lbl">Navigation</div>

                  {NAV.map(({ to, label, icon }) => (
                    <button
                      key={to}
                      className={`nv-dr-row${on(to) ? " hi" : ""}`}
                      onClick={() => drawerGo(to)}
                    >
                      <span className="nv-dr-ico">{icon}</span>
                      <span className="nv-dr-txt">{label}</span>
                      {on(to) && <span className="nv-dr-dot" />}
                    </button>
                  ))}

                  {user && (
                    <>
                      <div className="nv-dr-sep" />
                      <div className="nv-dr-lbl">Account</div>

                      <button className="nv-dr-row" onClick={() => drawerGo("/profile")}>
                        <span className="nv-dr-ico">👤</span>
                        <span className="nv-dr-txt">My Profile</span>
                        {xpData && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "#1f6b3a",
                            background: "rgba(58,140,87,0.12)",
                            padding: "2px 7px", borderRadius: 100,
                            border: "1px solid rgba(58,140,87,0.2)",
                          }}>
                            Lv {xpData.level}
                          </span>
                        )}
                      </button>

                      <div className="nv-dr-sep" />

                      <button className="nv-dr-row danger" onClick={logout}>
                        <span className="nv-dr-ico">🚪</span>
                        <span className="nv-dr-txt">Sign out</span>
                      </button>
                    </>
                  )}

                  {!user && (
                    <>
                      <div className="nv-dr-sep" />
                      <div className="nv-dr-auth">
                        <button className="nv-dr-signin" onClick={() => drawerGo("/login")}>Sign in</button>
                        <button className="nv-dr-go" onClick={() => drawerGo("/signup")}>Get started →</button>
                      </div>
                    </>
                  )}

                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}