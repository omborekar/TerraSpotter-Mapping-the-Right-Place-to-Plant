/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navbar — premium dark glassmorphism redesign, unique & eye-catching.
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

  const drawerGo = (to) => {
    setDrawer(false);
    if (pathname !== to) navigate(to);
  };

  const NAV = user ? [
    { to: "/",                  label: t("navbar.home", "Home"),        icon: "🏡" },
    { to: "/Main",             label: t("navbar.tracker", "Submit"),      icon: "📍" },
    { to: "/browse",           label: t("navbar.browse", "Browse"),      icon: "🗺️" },
    { to: "/plantationShowcase", label: t("navbar.reports", "History"),   icon: "📚" },
    { to: "/community",        label: t("navbar.community", "Community"),   icon: "🌱" },
    { to: "/leaderboard",      label: t("navbar.leaderboard", "Leaderboard"), icon: "🏆" },
    { to: "/about",            label: t("navbar.about", "About"),       icon: "ℹ️" },
    { to: "/forum",            label: t("navbar.forum", "Forum"),       icon: "💬" },
    ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: t("navbar.admin", "Admin"), icon: "⚙️" }] : []),
  ] : [
    { to: "/",            label: t("navbar.home", "Home"),        icon: "🏡" },
    { to: "/leaderboard", label: t("navbar.leaderboard", "Leaderboard"), icon: "🏆" },
    { to: "/about",       label: t("navbar.about", "About"),       icon: "ℹ️" },
    { to: "/forum",       label: t("navbar.forum", "Forum"),       icon: "💬" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ═══════════════════════════════════════════
           ROOT TOKENS
        ═══════════════════════════════════════════ */
        :root {
          --ts-g1: #0b1f11;
          --ts-g2: #0f2916;
          --ts-g3: #122e19;
          --ts-accent: #22c55e;
          --ts-accent2: #4ade80;
          --ts-accent3: #86efac;
          --ts-gold: #fbbf24;
          --ts-text: #e8f5ee;
          --ts-muted: rgba(232,245,238,0.45);
          --ts-glass: rgba(11,31,17,0.72);
          --ts-border: rgba(34,197,94,0.18);
          --ts-glow: 0 0 30px rgba(34,197,94,0.12);
        }

        /* ═══════════════════════════════════════════
           NAVBAR WRAPPER
        ═══════════════════════════════════════════ */
        .nv {
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: sticky; top: 0; z-index: 200;
        }

        /* ═══════════════════════════════════════════
           TOP GRADIENT LINE
        ═══════════════════════════════════════════ */
        .nv-topline {
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            #22c55e 20%,
            #4ade80 50%,
            #22c55e 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: nv-shimmer 3s linear infinite;
        }
        @keyframes nv-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        /* ═══════════════════════════════════════════
           BAR
        ═══════════════════════════════════════════ */
        .nv-bar {
          height: 64px;
          display: flex; align-items: center;
          background: var(--ts-g1);
          border-bottom: 1px solid transparent;
          transition: all 0.35s cubic-bezier(.4,0,.2,1);
          position: relative;
        }
        .nv-bar::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(34,197,94,0.04) 0%, transparent 100%);
          pointer-events: none;
        }
        .nv-bar.up {
          background: var(--ts-glass);
          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);
          border-bottom-color: var(--ts-border);
          box-shadow: 0 8px 32px rgba(0,0,0,.45), var(--ts-glow);
        }

        .nv-inner {
          width: 100%; max-width: 1300px; margin: 0 auto;
          padding: 0 28px; display: flex; align-items: center;
          height: 100%; gap: 0; position: relative; z-index: 1;
        }

        /* ═══════════════════════════════════════════
           BRAND
        ═══════════════════════════════════════════ */
        .nv-brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0; margin-right: 32px;
          position: relative;
        }
        .nv-brand-logo {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(34,197,94,0.25), 0 4px 16px rgba(34,197,94,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden; position: relative;
        }
        .nv-brand-logo::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
          border-radius: inherit;
        }
        .nv-brand:hover .nv-brand-logo {
          transform: scale(1.06) rotate(-3deg);
          box-shadow: 0 0 0 2px rgba(34,197,94,0.4), 0 6px 24px rgba(34,197,94,0.4);
        }
        .nv-brand-img {
          width: 100%; height: 100%; object-fit: cover; border-radius: 10px;
          position: relative; z-index: 1;
        }
        .nv-brand-txt {
          font-family: 'Syne', sans-serif;
          font-size: 18.5px; font-weight: 800;
          background: linear-gradient(135deg, #4ade80, #22c55e, #86efac);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.3px; white-space: nowrap;
          filter: drop-shadow(0 0 12px rgba(34,197,94,0.3));
          transition: filter 0.2s;
        }
        .nv-brand:hover .nv-brand-txt {
          filter: drop-shadow(0 0 20px rgba(34,197,94,0.55));
        }

        /* ═══════════════════════════════════════════
           DESKTOP NAV LINKS
        ═══════════════════════════════════════════ */
        .nv-links {
          display: flex; align-items: center; gap: 2px; flex: 1;
        }
        .nv-lk {
          position: relative; font-size: 13px; font-weight: 500;
          color: var(--ts-muted);
          text-decoration: none; padding: 7px 12px; border-radius: 8px;
          transition: color 0.18s, background 0.18s; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .nv-lk:hover {
          color: var(--ts-text);
          background: rgba(34,197,94,0.08);
        }
        .nv-lk.hi {
          color: var(--ts-accent2);
          font-weight: 600;
          background: rgba(34,197,94,0.1);
        }
        .nv-lk.hi::before {
          content: '';
          position: absolute; bottom: 0; left: 12px; right: 12px;
          height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          box-shadow: 0 0 8px rgba(34,197,94,0.6);
        }

        /* ═══════════════════════════════════════════
           RIGHT SECTION
        ═══════════════════════════════════════════ */
        .nv-right {
          margin-left: auto; flex-shrink: 0;
          display: flex; align-items: center; gap: 8px;
        }

        /* Divider */
        .nv-vd {
          width: 1px; height: 20px;
          background: linear-gradient(180deg, transparent, var(--ts-border), transparent);
        }

        /* Ghost / Sign-in */
        .nv-ghost {
          font-size: 13px; font-weight: 500; color: var(--ts-muted);
          text-decoration: none; padding: 8px 14px; border-radius: 8px;
          transition: color 0.18s, background 0.18s; white-space: nowrap;
        }
        .nv-ghost:hover {
          color: var(--ts-text);
          background: rgba(34,197,94,0.08);
        }

        /* CTA — Get started */
        .nv-cta {
          position: relative;
          font-size: 13px; font-weight: 700; color: #0b1f11;
          text-decoration: none; padding: 8px 18px; border-radius: 8px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          box-shadow: 0 0 0 1px rgba(34,197,94,0.3), 0 4px 16px rgba(34,197,94,0.35);
          transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
          white-space: nowrap; overflow: hidden;
          letter-spacing: 0.02em;
        }
        .nv-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
        }
        .nv-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 0 1px rgba(34,197,94,0.5), 0 6px 24px rgba(34,197,94,0.5);
          filter: brightness(1.05);
        }
        .nv-cta:active { transform: scale(0.97); }

        /* ═══════════════════════════════════════════
           PROFILE PILL
        ═══════════════════════════════════════════ */
        .nv-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 8px 4px 6px; border-radius: 100px;
          border: 1px solid var(--ts-border);
          background: rgba(34,197,94,0.05);
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600; color: var(--ts-text);
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          transition: all 0.2s cubic-bezier(.4,0,.2,1);
          white-space: nowrap;
        }
        .nv-pill:hover {
          border-color: rgba(34,197,94,0.4);
          background: rgba(34,197,94,0.1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(34,197,94,0.2);
          transform: translateY(-1px);
        }
        .nv-pill.open {
          border-color: var(--ts-accent);
          background: rgba(34,197,94,0.12);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.15), 0 4px 20px rgba(0,0,0,0.3);
        }

        /* Avatar circle */
        .nv-ini {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #0b1f11; font-size: 10.5px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: 0.5px; flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.25), 0 2px 8px rgba(34,197,94,0.3);
        }

        /* XP Badge */
        .nv-xp-badge {
          font-size: 10.5px; font-weight: 700;
          color: var(--ts-gold);
          background: rgba(251,191,36,0.1);
          padding: 2px 8px; border-radius: 100px;
          border: 1px solid rgba(251,191,36,0.25);
          white-space: nowrap; letter-spacing: 0.2px;
          display: flex; align-items: center; gap: 3px;
        }

        /* Chevron */
        .nv-chv { opacity: 0.4; flex-shrink: 0; transition: transform 0.22s, opacity 0.15s; }
        .nv-chv.r { transform: rotate(180deg); opacity: 0.7; }

        /* ═══════════════════════════════════════════
           DESKTOP DROPDOWN
        ═══════════════════════════════════════════ */
        .nv-dd {
          position: absolute; top: calc(100% + 12px); right: 0;
          width: 260px;
          background: rgba(10,24,14,0.96);
          border: 1px solid var(--ts-border);
          border-radius: 18px;
          box-shadow:
            0 16px 60px rgba(0,0,0,0.6),
            0 0 0 1px rgba(34,197,94,0.08),
            inset 0 1px 0 rgba(34,197,94,0.08);
          overflow: hidden; z-index: 999;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .nv-dd-top {
          height: 2px;
          background: linear-gradient(90deg, #22c55e, #4ade80, #22c55e);
          background-size: 200% 100%;
          animation: nv-shimmer 2.5s linear infinite;
        }
        .nv-dd-who {
          display: flex; align-items: center; gap: 11px;
          padding: 14px 16px 13px;
          border-bottom: 1px solid rgba(34,197,94,0.1);
          background: rgba(34,197,94,0.04);
        }
        .nv-dd-avt {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #0b1f11; font-size: 13px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.2), 0 4px 12px rgba(34,197,94,0.25);
        }
        .nv-dd-name {
          font-size: 13.5px; font-weight: 700; color: var(--ts-text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nv-dd-email {
          font-size: 11px; color: var(--ts-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 1px;
        }
        .nv-dd-body { padding: 6px; }
        .nv-dd-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8.5px 10px; border-radius: 10px;
          font-size: 13px; color: rgba(232,245,238,0.75);
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: background 0.14s, color 0.14s;
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
        }
        .nv-dd-row:hover { background: rgba(34,197,94,0.08); color: var(--ts-text); }
        .nv-dd-row.out { color: #f87171; }
        .nv-dd-row.out:hover { background: rgba(248,113,113,0.08); }
        .nv-dd-ico {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(34,197,94,0.06);
          border: 1px solid rgba(34,197,94,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
          transition: background 0.14s;
        }
        .nv-dd-row:hover .nv-dd-ico { background: rgba(34,197,94,0.12); }
        .nv-dd-row.out .nv-dd-ico { background: rgba(248,113,113,0.06); border-color: rgba(248,113,113,0.1); }
        .nv-dd-row.out:hover .nv-dd-ico { background: rgba(248,113,113,0.12); }
        .nv-dd-sep {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent);
          margin: 4px 8px;
        }

        /* ═══════════════════════════════════════════
           HAMBURGER
        ═══════════════════════════════════════════ */
        .nv-ham {
          display: none; width: 40px; height: 40px; border-radius: 10px;
          border: 1px solid var(--ts-border);
          background: rgba(34,197,94,0.05);
          cursor: pointer; flex-direction: column;
          align-items: center; justify-content: center; gap: 5px;
          transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
          flex-shrink: 0;
        }
        .nv-ham:hover {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.35);
          box-shadow: 0 0 12px rgba(34,197,94,0.15);
        }
        .nv-ham-ln {
          width: 18px; height: 1.5px;
          background: var(--ts-accent2); border-radius: 2px;
          transition: transform 0.24s cubic-bezier(.4,0,.2,1), opacity 0.2s;
        }
        .nv-ham.x .nv-ham-ln:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nv-ham.x .nv-ham-ln:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nv-ham.x .nv-ham-ln:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ═══════════════════════════════════════════
           BACKDROP
        ═══════════════════════════════════════════ */
        .nv-backdrop {
          position: fixed; inset: 0; z-index: 290;
          background: rgba(0,8,3,0.7);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ═══════════════════════════════════════════
           SIDE DRAWER
        ═══════════════════════════════════════════ */
        .nv-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 84vw);
          background: #0c1e10;
          z-index: 300;
          display: flex; flex-direction: column;
          box-shadow: -12px 0 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,197,94,0.1);
          overflow: hidden;
        }

        /* Drawer header */
        .nv-dr-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 18px;
          height: 64px; flex-shrink: 0;
          background: linear-gradient(135deg, #0b1f11, #132a19);
          border-bottom: 1px solid rgba(34,197,94,0.12);
          position: relative;
        }
        .nv-dr-head::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #22c55e, #4ade80, #22c55e, transparent);
          background-size: 200% 100%;
          animation: nv-shimmer 3s linear infinite;
        }
        .nv-dr-brand { display: flex; align-items: center; gap: 10px; }
        .nv-dr-brand-logo {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(34,197,94,0.3), 0 3px 12px rgba(34,197,94,0.3);
          overflow: hidden; position: relative;
        }
        .nv-dr-brand-logo::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
        }
        .nv-dr-brand-img { width: 100%; height: 100%; object-fit: cover; border-radius: 9px; }
        .nv-dr-brand-txt {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 800;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nv-dr-close {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.15);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--ts-accent2); font-size: 14px;
          transition: background 0.18s, box-shadow 0.18s;
        }
        .nv-dr-close:hover {
          background: rgba(34,197,94,0.15);
          box-shadow: 0 0 12px rgba(34,197,94,0.2);
        }

        /* Drawer user card */
        .nv-dr-user {
          margin: 14px 14px 4px;
          padding: 14px 16px;
          background: rgba(34,197,94,0.05);
          border: 1px solid rgba(34,197,94,0.12);
          border-radius: 14px;
          display: flex; align-items: center; gap: 12px;
          position: relative; overflow: hidden;
        }
        .nv-dr-user::before {
          content: '';
          position: absolute; top: -20px; right: -20px;
          width: 80px; height: 80px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .nv-dr-avt {
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #0b1f11; font-size: 15px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.2), 0 4px 16px rgba(34,197,94,0.3);
        }
        .nv-dr-uname {
          font-size: 14px; font-weight: 700; color: var(--ts-text);
        }
        .nv-dr-badge {
          display: inline-flex; align-items: center;
          margin-top: 4px; padding: 2px 9px; border-radius: 100px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
          text-transform: uppercase;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.2);
          color: var(--ts-accent2);
        }

        /* Drawer scrollable body */
        .nv-dr-body {
          flex: 1; overflow-y: auto; padding: 8px 10px 28px;
          scrollbar-width: thin;
          scrollbar-color: rgba(34,197,94,0.15) transparent;
        }
        .nv-dr-body::-webkit-scrollbar { width: 4px; }
        .nv-dr-body::-webkit-scrollbar-track { background: transparent; }
        .nv-dr-body::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.2); border-radius: 4px; }

        /* Section label */
        .nv-dr-lbl {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.4px; color: rgba(34,197,94,0.5);
          padding: 14px 10px 6px;
        }

        /* Nav row */
        .nv-dr-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: 12px;
          font-size: 14px; font-weight: 500; color: rgba(232,245,238,0.65);
          text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          transition: background 0.15s, color 0.15s; margin-bottom: 2px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nv-dr-row:hover {
          background: rgba(34,197,94,0.08);
          color: var(--ts-text);
        }
        .nv-dr-row.hi {
          background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(22,163,74,0.07));
          color: var(--ts-accent2); font-weight: 600;
          border: 1px solid rgba(34,197,94,0.15);
        }
        .nv-dr-row.danger { color: #f87171; }
        .nv-dr-row.danger:hover { background: rgba(248,113,113,0.08); }

        .nv-dr-ico {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(34,197,94,0.05);
          border: 1px solid rgba(34,197,94,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .nv-dr-row:hover .nv-dr-ico {
          background: rgba(34,197,94,0.1);
          box-shadow: 0 0 10px rgba(34,197,94,0.12);
        }
        .nv-dr-row.hi .nv-dr-ico {
          background: rgba(34,197,94,0.15);
          border-color: rgba(34,197,94,0.25);
          box-shadow: 0 0 12px rgba(34,197,94,0.15);
        }
        .nv-dr-row.danger .nv-dr-ico {
          background: rgba(248,113,113,0.06);
          border-color: rgba(248,113,113,0.12);
        }
        .nv-dr-row.danger:hover .nv-dr-ico {
          background: rgba(248,113,113,0.12);
        }

        .nv-dr-txt { flex: 1; }
        .nv-dr-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--ts-accent);
          box-shadow: 0 0 8px rgba(34,197,94,0.7);
          flex-shrink: 0;
        }
        .nv-dr-sep {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent);
          margin: 6px 6px;
        }

        /* Drawer guest auth buttons */
        .nv-dr-auth { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
        .nv-dr-signin {
          padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 600;
          text-align: center; text-decoration: none; color: var(--ts-accent2);
          background: rgba(34,197,94,0.06);
          border: 1.5px solid rgba(34,197,94,0.2);
          transition: background 0.15s, box-shadow 0.15s;
          display: block; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nv-dr-signin:hover {
          background: rgba(34,197,94,0.12);
          box-shadow: 0 0 16px rgba(34,197,94,0.15);
        }
        .nv-dr-go {
          position: relative; overflow: hidden;
          padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700;
          text-align: center; text-decoration: none;
          color: #0b1f11; display: block; cursor: pointer;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          box-shadow: 0 4px 20px rgba(34,197,94,0.35);
          transition: filter 0.18s, transform 0.15s, box-shadow 0.18s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border: none;
        }
        .nv-dr-go::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
        }
        .nv-dr-go:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(34,197,94,0.45);
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════════ */
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
              <div className="nv-brand-logo">
                <img src="/favicon.ico" alt="TerraSpotter" className="nv-brand-img" />
              </div>
              <span className="nv-brand-txt">TerraSpotter</span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="nv-links">
              {NAV.map(({ to, label }) => (
                <Link key={to} to={to} className={`nv-lk${on(to) ? " hi" : ""}`}>{label}</Link>
              ))}
            </nav>

            {/* Right section */}
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
                    <span style={{ color: "rgba(232,245,238,0.9)", fontSize: 13 }}>{user.fname}</span>
                    {xpData && (
                      <span className="nv-xp-badge">
                        ⚡ {xpData.totalXp?.toLocaleString()} · Lv {xpData.level}
                      </span>
                    )}
                    <svg className={`nv-chv${ddOpen ? " r" : ""}`} width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 4l3.5 3.5L9 4" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {ddOpen && (
                      <motion.div className="nv-dd"
                        initial={{ opacity: 0, y: -10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
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
              {/* Backdrop */}
              <motion.div
                className="nv-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24 }}
                onClick={() => setDrawer(false)}
              />

              {/* Drawer panel */}
              <motion.div
                className="nv-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              >
                {/* Header */}
                <div className="nv-dr-head">
                  <div className="nv-dr-brand">
                    <div className="nv-dr-brand-logo">
                      <img src="/favicon.ico" alt="" className="nv-dr-brand-img" />
                    </div>
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
                    <LanguageSwitcher dark={true} />
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
                            fontSize: 10, fontWeight: 700, color: "var(--ts-gold)",
                            background: "rgba(251,191,36,0.1)",
                            padding: "2px 7px", borderRadius: 100,
                            border: "1px solid rgba(251,191,36,0.2)",
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