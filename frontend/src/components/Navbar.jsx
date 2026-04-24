/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navbar — premium light theme, unique & eye-catching.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
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
        try {
          const xp = await axios.get(`${BASE_URL}/api/gamification/me`, { withCredentials: true });
          setXpData(xp.data);
        } catch { setXpData(null); }
      } catch { setUser(null); setXpData(null); }
    };
    setTimeout(fetchUser, 300);
    window.addEventListener("login", fetchUser);
    window.addEventListener("logout", () => { setUser(null); setXpData(null); });
    return () => {
      window.removeEventListener("login", fetchUser);
      window.removeEventListener("logout", () => { });
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

  const drawerGo = (to) => {
    setDrawer(false);
    if (pathname !== to) navigate(to);
  };

  const NAV = user ? [
    { to: "/", label: t("navbar.home", "Home"), icon: "🏡" },
    { to: "/Main", label: t("navbar.tracker", "Submit"), icon: "📍" },
    { to: "/browse", label: t("navbar.browse", "Browse"), icon: "🗺️" },
    { to: "/plantationShowcase", label: t("navbar.reports", "History"), icon: "📚" },
    { to: "/community", label: t("navbar.community", "Community"), icon: "🌱" },
    { to: "/leaderboard", label: t("navbar.leaderboard", "Leaderboard"), icon: "🏆" },
    { to: "/about", label: t("navbar.about", "About"), icon: "ℹ️" },
    { to: "/forum", label: t("navbar.forum", "Forum"), icon: "💬" },
    ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: t("navbar.admin", "Admin"), icon: "⚙️" }] : []),
  ] : [
    { to: "/", label: t("navbar.home", "Home"), icon: "🏡" },
    { to: "/leaderboard", label: t("navbar.leaderboard", "Leaderboard"), icon: "🏆" },
    { to: "/about", label: t("navbar.about", "About"), icon: "ℹ️" },
    { to: "/forum", label: t("navbar.forum", "Forum"), icon: "💬" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ═══════════════════════════════
           SHIMMER ANIMATION
        ═══════════════════════════════ */
        @keyframes nv-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes nv-pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }

        /* ═══════════════════════════════
           WRAPPER
        ═══════════════════════════════ */
        .nv {
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: sticky; top: 0; z-index: 200;
        }

        /* ── Shimmer top accent line ── */
        .nv-topline {
          height: 2.5px;
          background: linear-gradient(90deg,
            #d1fae5 0%, #22c55e 20%, #16a34a 50%, #22c55e 80%, #d1fae5 100%
          );
          background-size: 200% 100%;
          animation: nv-shimmer 3.5s linear infinite;
        }

        /* ═══════════════════════════════
           BAR
        ═══════════════════════════════ */
        .nv-bar {
          height: 62px; display: flex; align-items: center;
          background: #f8fdf9;
          border-bottom: 1px solid rgba(34,197,94,0.12);
          transition: background 0.3s, box-shadow 0.3s;
          position: relative;
        }
        .nv-bar::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(34,197,94,0.025) 0%, transparent 100%);
          pointer-events: none;
        }
        .nv-bar.up {
          background: rgba(248,253,249,0.92);
          backdrop-filter: blur(22px) saturate(1.6);
          -webkit-backdrop-filter: blur(22px) saturate(1.6);
          border-bottom-color: rgba(34,197,94,0.18);
          box-shadow: 0 1px 0 rgba(34,197,94,0.08), 0 4px 32px rgba(0,0,0,0.07);
        }

        .nv-inner {
          width: 100%; max-width: 1280px; margin: 0 auto;
          padding: 0 28px; display: flex; align-items: center;
          height: 100%; gap: 0; position: relative; z-index: 1;
        }

        /* ═══════════════════════════════
           BRAND
        ═══════════════════════════════ */
        .nv-brand {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0; margin-right: 34px;
          transition: opacity 0.18s;
        }
        .nv-brand img {
          width: 32px; height: 32px; border-radius: 9px; object-fit: cover;
          box-shadow: 0 0 0 1.5px rgba(34,197,94,0.25), 0 3px 10px rgba(34,197,94,0.2);
          flex-shrink: 0;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .nv-brand:hover img {
          box-shadow: 0 0 0 2px rgba(34,197,94,0.45), 0 4px 16px rgba(34,197,94,0.3);
          transform: rotate(-4deg) scale(1.07);
        }
        .nv-brand-txt {
          font-family: 'Syne', sans-serif;
          font-size: 18.5px; font-weight: 800;
          background: linear-gradient(120deg, #15803d, #22c55e, #166534);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.3px; white-space: nowrap;
          filter: drop-shadow(0 1px 6px rgba(34,197,94,0.18));
          transition: filter 0.2s;
        }
        .nv-brand:hover .nv-brand-txt {
          filter: drop-shadow(0 0 12px rgba(34,197,94,0.4));
        }

        /* ═══════════════════════════════
           DESKTOP NAV LINKS
        ═══════════════════════════════ */
        .nv-links { display: flex; align-items: center; gap: 1px; flex: 1; }
        .nv-lk {
          position: relative; font-size: 13.5px; font-weight: 500;
          color: #4b6355;
          text-decoration: none; padding: 6px 11px; border-radius: 8px;
          transition: color 0.16s, background 0.16s; white-space: nowrap;
        }
        .nv-lk:hover {
          color: #15803d;
          background: rgba(34,197,94,0.07);
        }
        .nv-lk.hi {
          color: #15803d; font-weight: 650;
          background: rgba(34,197,94,0.1);
        }
        .nv-lk.hi::after {
          content: '';
          position: absolute; bottom: 1px; left: 11px; right: 11px;
          height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #22c55e, #16a34a);
          box-shadow: 0 0 8px rgba(34,197,94,0.45);
        }

        /* ═══════════════════════════════
           RIGHT SECTION
        ═══════════════════════════════ */
        .nv-right {
          margin-left: auto; flex-shrink: 0;
          display: flex; align-items: center; gap: 8px;
        }
        .nv-vd {
          width: 1px; height: 18px;
          background: linear-gradient(180deg, transparent, rgba(34,197,94,0.25), transparent);
        }

        /* Ghost sign-in */
        .nv-ghost {
          font-size: 13.5px; font-weight: 500; color: #4b6355;
          text-decoration: none; padding: 7px 14px; border-radius: 8px;
          transition: color 0.16s, background 0.16s; white-space: nowrap;
        }
        .nv-ghost:hover { color: #15803d; background: rgba(34,197,94,0.07); }

        /* CTA Button */
        .nv-cta {
          position: relative; overflow: hidden;
          font-size: 13.5px; font-weight: 700; color: #fff;
          text-decoration: none; padding: 8px 18px; border-radius: 8px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 0 0 1px rgba(22,163,74,0.3), 0 3px 14px rgba(34,197,94,0.3);
          transition: transform 0.15s, box-shadow 0.15s, filter 0.15s; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .nv-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 60%);
        }
        .nv-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 0 1px rgba(22,163,74,0.4), 0 6px 22px rgba(34,197,94,0.35);
          filter: brightness(1.04);
        }
        .nv-cta:active { transform: scale(0.97); }

        /* ═══════════════════════════════
           PROFILE PILL
        ═══════════════════════════════ */
        .nv-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 8px 4px 5px; border-radius: 100px;
          border: 1.5px solid rgba(34,197,94,0.2);
          background: #fff;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; font-weight: 600; color: #1a3d25;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
          transition: all 0.2s cubic-bezier(.4,0,.2,1); white-space: nowrap;
        }
        .nv-pill:hover {
          border-color: rgba(34,197,94,0.42);
          box-shadow: 0 3px 16px rgba(34,197,94,0.15), 0 1px 6px rgba(0,0,0,0.06);
          transform: translateY(-1px);
          background: #f0fdf4;
        }
        .nv-pill.open {
          border-color: #22c55e;
          background: #f0fdf4;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.12), 0 3px 16px rgba(34,197,94,0.15);
        }
        .nv-ini {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #15803d);
          color: #fff; font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: 0.6px; flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.22);
        }
        .nv-xp-badge {
          font-size: 10.5px; font-weight: 700;
          color: #b45309;
          background: #fef3c7;
          padding: 2px 8px; border-radius: 100px;
          border: 1px solid rgba(180,83,9,0.18);
          white-space: nowrap; letter-spacing: 0.2px;
        }
        .nv-chv { opacity: 0.35; flex-shrink: 0; transition: transform 0.22s, opacity 0.15s; }
        .nv-chv.r { transform: rotate(180deg); opacity: 0.65; }

        /* ═══════════════════════════════
           DESKTOP DROPDOWN
        ═══════════════════════════════ */
        .nv-dd {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 248px; background: #fff;
          border: 1px solid rgba(34,197,94,0.14);
          border-radius: 18px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.12), 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(34,197,94,0.06);
          overflow: hidden; z-index: 999;
        }
        .nv-dd-top {
          height: 2.5px;
          background: linear-gradient(90deg, #d1fae5 0%, #22c55e 30%, #16a34a 50%, #22c55e 70%, #d1fae5 100%);
          background-size: 200% 100%;
          animation: nv-shimmer 3s linear infinite;
        }
        .nv-dd-who {
          display: flex; align-items: center; gap: 11px;
          padding: 13px 15px 12px;
          border-bottom: 1px solid #f0fdf4;
          background: linear-gradient(135deg, #f0fdf4, #fff);
        }
        .nv-dd-avt {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #15803d);
          color: #fff; font-size: 12px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 8px rgba(34,197,94,0.28);
        }
        .nv-dd-name { font-size: 13px; font-weight: 700; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nv-dd-email { font-size: 11px; color: #86a490; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
        .nv-dd-body { padding: 5px; }
        .nv-dd-row {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 9px; border-radius: 9px;
          font-size: 13px; color: #2d4a35;
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: background 0.13s, color 0.13s;
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
        }
        .nv-dd-row:hover { background: #f0fdf4; color: #15803d; }
        .nv-dd-row.out { color: #dc2626; }
        .nv-dd-row.out:hover { background: #fef2f2; }
        .nv-dd-ico {
          width: 28px; height: 28px; border-radius: 7px;
          background: #f0fdf4; border: 1px solid rgba(34,197,94,0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0; transition: background 0.13s;
        }
        .nv-dd-row:hover .nv-dd-ico { background: #dcfce7; }
        .nv-dd-row.out .nv-dd-ico { background: #fef2f2; border-color: rgba(220,38,38,0.1); }
        .nv-dd-row.out:hover .nv-dd-ico { background: #fee2e2; }
        .nv-dd-sep {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent);
          margin: 3px 8px;
        }

        /* ═══════════════════════════════
           HAMBURGER
        ═══════════════════════════════ */
        .nv-ham {
          display: none; width: 38px; height: 38px; border-radius: 9px;
          border: 1.5px solid rgba(34,197,94,0.2); background: #fff;
          cursor: pointer; flex-direction: column;
          align-items: center; justify-content: center; gap: 4.5px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: background 0.15s, border-color 0.18s, box-shadow 0.18s;
          flex-shrink: 0;
        }
        .nv-ham:hover {
          background: #f0fdf4;
          border-color: rgba(34,197,94,0.4);
          box-shadow: 0 2px 10px rgba(34,197,94,0.14);
        }
        .nv-ham-ln {
          width: 17px; height: 1.5px;
          background: #15803d; border-radius: 2px;
          transition: transform 0.24s cubic-bezier(.4,0,.2,1), opacity 0.2s;
        }
        .nv-ham.x .nv-ham-ln:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .nv-ham.x .nv-ham-ln:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nv-ham.x .nv-ham-ln:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

        /* ═══════════════════════════════
           BACKDROP
        ═══════════════════════════════ */
        .nv-backdrop {
          position: fixed; inset: 0; z-index: 290;
          background: rgba(8,30,12,0.38);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        /* ═══════════════════════════════
           SIDE DRAWER
        ═══════════════════════════════ */
        .nv-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 82vw);
          background: #f8fdf9;
          z-index: 300;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 48px rgba(0,0,0,0.14), 0 0 0 1px rgba(34,197,94,0.1);
          overflow: hidden;
        }

        /* Drawer header */
        .nv-dr-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 18px;
          height: 62px; flex-shrink: 0;
          background: linear-gradient(135deg, #15803d, #166534);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          position: relative;
        }
        .nv-dr-head::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
        }
        .nv-dr-brand { display: flex; align-items: center; gap: 9px; }
        .nv-dr-brand img {
          width: 30px; height: 30px; border-radius: 8px; object-fit: cover;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .nv-dr-brand-txt {
          font-family: 'Syne', sans-serif;
          font-size: 16.5px; font-weight: 800; color: #fff; letter-spacing: -0.2px;
        }
        .nv-dr-close {
          width: 34px; height: 34px; border-radius: 8px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 14px;
          transition: background 0.15s;
        }
        .nv-dr-close:hover { background: rgba(255,255,255,0.25); }

        /* Drawer user card */
        .nv-dr-user {
          margin: 14px 14px 4px;
          padding: 13px 15px;
          background: #fff;
          border: 1px solid rgba(34,197,94,0.14);
          border-radius: 14px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 2px 12px rgba(34,197,94,0.08);
          position: relative; overflow: hidden;
        }
        .nv-dr-user::before {
          content: '';
          position: absolute; top: -18px; right: -18px;
          width: 70px; height: 70px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .nv-dr-avt {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #15803d);
          color: #fff; font-size: 14px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 10px rgba(34,197,94,0.3);
        }
        .nv-dr-uname { font-size: 14px; font-weight: 700; color: #111; }
        .nv-dr-badge {
          display: inline-flex; align-items: center;
          margin-top: 3px; padding: 2px 8px; border-radius: 100px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
          text-transform: uppercase;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          color: #15803d;
        }

        /* Drawer scrollable body */
        .nv-dr-body {
          flex: 1; overflow-y: auto; padding: 8px 10px 28px;
          scrollbar-width: thin; scrollbar-color: rgba(34,197,94,0.2) transparent;
        }
        .nv-dr-body::-webkit-scrollbar { width: 3px; }
        .nv-dr-body::-webkit-scrollbar-track { background: transparent; }
        .nv-dr-body::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.25); border-radius: 4px; }

        /* Section label */
        .nv-dr-lbl {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.3px; color: rgba(34,197,94,0.55);
          padding: 14px 10px 6px;
        }

        /* Nav row */
        .nv-dr-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 11px;
          font-size: 14px; font-weight: 500; color: #3d5c47;
          text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          transition: background 0.13s, color 0.13s; margin-bottom: 2px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nv-dr-row:hover { background: rgba(34,197,94,0.07); color: #15803d; }
        .nv-dr-row.hi {
          background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(21,128,61,0.06));
          color: #15803d; font-weight: 650;
          border: 1px solid rgba(34,197,94,0.15);
        }
        .nv-dr-row.danger { color: #dc2626; }
        .nv-dr-row.danger:hover { background: #fef2f2; }

        .nv-dr-ico {
          width: 37px; height: 37px; border-radius: 10px;
          background: #fff;
          border: 1px solid rgba(34,197,94,0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          transition: background 0.13s, box-shadow 0.13s;
        }
        .nv-dr-row:hover .nv-dr-ico { background: #dcfce7; box-shadow: none; }
        .nv-dr-row.hi .nv-dr-ico { background: #dcfce7; border-color: rgba(34,197,94,0.22); }
        .nv-dr-row.danger .nv-dr-ico { background: #fef2f2; border-color: rgba(220,38,38,0.1); }
        .nv-dr-row.danger:hover .nv-dr-ico { background: #fee2e2; }

        .nv-dr-txt { flex: 1; }
        .nv-dr-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e; flex-shrink: 0;
          animation: nv-pulse-dot 1.8s ease-in-out infinite;
        }
        .nv-dr-sep {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,197,94,0.18), transparent);
          margin: 6px 6px;
        }

        /* Drawer auth buttons */
        .nv-dr-auth { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
        .nv-dr-signin {
          padding: 13px; border-radius: 11px; font-size: 14px; font-weight: 600;
          text-align: center; text-decoration: none; color: #15803d;
          background: #fff; border: 1.5px solid rgba(34,197,94,0.25);
          transition: background 0.13s, box-shadow 0.15s;
          display: block; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nv-dr-signin:hover { background: #f0fdf4; box-shadow: 0 2px 10px rgba(34,197,94,0.12); }
        .nv-dr-go {
          position: relative; overflow: hidden;
          padding: 13px; border-radius: 11px; font-size: 14px; font-weight: 700;
          text-align: center; text-decoration: none; color: #fff; display: block; cursor: pointer;
          background: linear-gradient(135deg, #22c55e, #15803d);
          box-shadow: 0 4px 18px rgba(34,197,94,0.32);
          transition: filter 0.16s, transform 0.14s;
          font-family: 'Plus Jakarta Sans', sans-serif; border: none;
        }
        .nv-dr-go::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
        }
        .nv-dr-go:hover { filter: brightness(1.06); transform: translateY(-1px); }

        /* ═══════════════════════════════
           RESPONSIVE
        ═══════════════════════════════ */
        @media (max-width: 860px) {
          .nv-links, .nv-ghost, .nv-vd, .nv-cta, .nv-pill, .nv-ls-desk { display: none !important; }
          .nv-ham { display: flex; }
          .nv-inner { padding: 0 16px; }
          .nv-brand { margin-right: 0; }
        }
        @media (min-width: 861px) {
          .nv-ham { display: none !important; }
        }
      `}</style>

      <div className="nv">

        {/* ══ SHIMMER TOP LINE ══ */}
        <div className="nv-topline" />

        {/* ══ BAR ══ */}
        <div className={`nv-bar${scrolled ? " up" : ""}`}>
          <div className="nv-inner">

            {/* Brand */}
            <Link to="/" className="nv-brand">
              <img src="/favicon.ico" alt="TerraSpotter" />
              <span className="nv-brand-txt">TerraSpotter</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="nv-links">
              {NAV.map(({ to, label }) => (
                <Link key={to} to={to} className={`nv-lk${on(to) ? " hi" : ""}`}>{label}</Link>
              ))}
            </nav>

            {/* Right */}
            <div className="nv-right">
              <div className="nv-ls-desk">
                <LanguageSwitcher dark={true} />
              </div>

              {!user ? (
                <>
                  <Link to="/login" className="nv-ghost">{t("navbar.login", "Sign in")}</Link>
                  <div className="nv-vd" />
                  <Link to="/signup" className="nv-cta">{t("navbar.signup", "Get started →")}</Link>
                </>
              ) : (
                <div style={{ position: "relative" }} ref={ddRef}>
                  <button
                    className={`nv-pill${ddOpen ? " open" : ""}`}
                    onClick={() => setDdOpen(o => !o)}
                  >
                    <div className="nv-ini">{ini}</div>
                    <span>{user.fname}</span>
                    {xpData && (
                      <span className="nv-xp-badge">
                        ⚡ {xpData.totalXp?.toLocaleString()} · Lv {xpData.level}
                      </span>
                    )}
                    <svg className={`nv-chv${ddOpen ? " r" : ""}`} width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 4l3.5 3.5L9 4" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {ddOpen && (
                      <motion.div className="nv-dd"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
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
                            <span className="nv-dd-ico">👤</span>{t("navbar.profile", "My Profile")}
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
                            <span className="nv-dd-ico">🚪</span>{t("navbar.logout", "Sign out")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Hamburger — mobile only */}
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
              <motion.div
                className="nv-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setDrawer(false)}
              />

              <motion.div
                className="nv-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                {/* Header */}
                <div className="nv-dr-head">
                  <div className="nv-dr-brand">
                    <img src="/favicon.ico" alt="" />
                    <span className="nv-dr-brand-txt">TerraSpotter</span>
                  </div>
                  <button className="nv-dr-close" onClick={() => setDrawer(false)}>✕</button>
                </div>

                {/* User card */}
                {user && (
                  <div className="nv-dr-user">
                    <div className="nv-dr-avt">{ini}</div>
                    <div>
                      <div className="nv-dr-uname">{user.fname} {user.lname}</div>
                      <span className="nv-dr-badge">
                        {user.role === "ADMIN" ? "Admin" : "Member"}
                        {xpData && ` · Lv ${xpData.level}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Scrollable body */}
                <div className="nv-dr-body">

                  <div className="nv-dr-lbl">{t("navbar.language", "Language")}</div>
                  <div style={{ padding: "4px 12px 16px" }}>
                    <LanguageSwitcher dark={false} />
                  </div>

                  <div className="nv-dr-lbl">{t("navbar.navigation", "Navigation")}</div>

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
                      <div className="nv-dr-lbl">{t("navbar.account", "Account")}</div>

                      <button className="nv-dr-row" onClick={() => drawerGo("/profile")}>
                        <span className="nv-dr-ico">👤</span>
                        <span className="nv-dr-txt">{t("navbar.profile", "My Profile")}</span>
                        {xpData && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "#b45309",
                            background: "#fef3c7",
                            padding: "2px 7px", borderRadius: 100,
                            border: "1px solid rgba(180,83,9,0.18)",
                          }}>
                            Lv {xpData.level}
                          </span>
                        )}
                      </button>

                      <div className="nv-dr-sep" />

                      <button className="nv-dr-row danger" onClick={logout}>
                        <span className="nv-dr-ico">🚪</span>
                        <span className="nv-dr-txt">{t("navbar.logout", "Sign out")}</span>
                      </button>
                    </>
                  )}

                  {!user && (
                    <>
                      <div className="nv-dr-sep" />
                      <div className="nv-dr-auth">
                        <button className="nv-dr-signin" onClick={() => drawerGo("/login")}>{t("navbar.login", "Sign in")}</button>
                        <button className="nv-dr-go" onClick={() => drawerGo("/signup")}>{t("navbar.signup", "Get started →")}</button>
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