import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import LoadingSpinner from "./ui/LoadingSpinner";
const BASE_URL = import.meta.env.VITE_API_URL;

/* ── tiny helpers ──────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`pf-card ${className}`}>{children}</div>
);

const SectionTitle = ({ icon, title, subtitle, action }) => (
  <div className="pf-section-title">
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1 }}>
      <span className="pf-section-icon">{icon}</span>
      <div>
        <h3 className="pf-section-h">{title}</h3>
        {subtitle && <p className="pf-section-sub">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const StatPill = ({ label, value, accent }) => (
  <div className="pf-stat-pill" style={{ borderColor: accent + "33" }}>
    <span className="pf-stat-val" style={{ color: accent }}>{value ?? "—"}</span>
    <span className="pf-stat-lbl">{label}</span>
  </div>
);

/* ── main ──────────────────────────────────────────────────────── */
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [lands, setLands] = useState([]);
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState("monthly");
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editData, setEditData] = useState({ fname: "", lname: "", phoneNo: "" });

  /* fetch profile */
  useEffect(() => {
    fetch(`${BASE_URL}/api/users/profile`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setEditData({ fname: data.fname || "", lname: data.lname || "", phoneNo: data.phoneNo || "" });
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, []);

  /* fetch user's lands */
  useEffect(() => {
    fetch(`${BASE_URL}/api/lands/my`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLands(data); })
      .catch(() => {});
  }, []);

  /* fetch stats */
  useEffect(() => {
    fetch(`${BASE_URL}/api/stats?filter=${filter}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setStats(data); })
      .catch(() => setStats([]));
  }, [filter]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });
      setProfile(p => ({ ...p, ...editData }));
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  /* calendar */
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const monthName = today.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  /* activity from real lands — count submissions per day */
  const activityMap = {};
  lands.forEach(l => {
    if (l.createdAt) {
      const d = new Date(l.createdAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        activityMap[day] = (activityMap[day] || 0) + 1;
      }
    }
  });

  /* derived stats */
  const totalArea = lands.reduce((s, l) => s + (l.areaSqm || 0), 0);
  const pendingLands = lands.filter(l => l.status === "PENDING").length;
  const approvedLands = lands.filter(l => l.status === "APPROVED").length;

  if (pageLoading) return (
    <LoadingSpinner text="Loading profile..." />
  );

  if (!profile) return (
    <div className="pf-loader">
      <p style={{ color: "#dc2626" }}>Failed to load profile. Please refresh.</p>
    </div>
  );

  const initials = `${profile.fname?.[0] || ""}${profile.lname?.[0] || ""}`.toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest:  #0d3320;
          --canopy:  #1a5c38;
          --leaf:    #2d8a55;
          --sprout:  #4db87a;
          --mist:    #e8f5ee;
          --sand:    #f7f3ee;
          --earth:   #3d2b1f;
          --ink:     #1a1a1a;
          --smoke:   #6b7280;
          --line:    #e2e8f0;
          --white:   #ffffff;
          --danger:  #dc2626;
          --amber:   #d97706;
          --blue:    #2563eb;
          --radius:  14px;
          --shadow:  0 2px 16px rgba(13,51,32,0.08);
          --shadow-lg: 0 8px 40px rgba(13,51,32,0.13);
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--sand); color: var(--ink); }

        .pf-page {
          min-height: 100vh;
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 32px 80px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* ── loader ── */
        .pf-loader {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          font-size: 14px;
          color: var(--smoke);
        }
        .pf-loader-ring {
          width: 32px; height: 32px;
          border: 3px solid var(--line);
          border-top-color: var(--forest);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── card ── */
        .pf-card {
          background: var(--white);
          border-radius: var(--radius);
          border: 1px solid var(--line);
          box-shadow: var(--shadow);
          padding: 28px 32px;
        }

        /* ── section title ── */
        .pf-section-title {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 24px;
        }
        .pf-section-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: var(--mist);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
        }
        .pf-section-h { font-size: 16px; font-weight: 600; color: var(--forest); }
        .pf-section-sub { font-size: 12.5px; color: var(--smoke); margin-top: 2px; }

        /* ── hero ── */
        .pf-hero {
          background: var(--forest);
          border-radius: var(--radius);
          padding: 36px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .pf-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 80% 50%, rgba(77,184,122,0.15), transparent 60%);
          pointer-events: none;
        }
        .pf-hero-left { display: flex; align-items: center; gap: 22px; position: relative; z-index: 1; }
        .pf-avatar-lg {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--canopy), var(--sprout));
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Serif Display', serif;
          font-size: 26px; color: white; flex-shrink: 0;
          border: 3px solid rgba(255,255,255,0.2);
        }
        .pf-hero-name {
          font-family: 'DM Serif Display', serif;
          font-size: 28px; letter-spacing: -0.3px; line-height: 1.15;
        }
        .pf-hero-meta { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 5px; }
        .pf-hero-meta span { margin-right: 16px; }
        .pf-hero-right { position: relative; z-index: 1; }

        /* ── edit btn ── */
        .pf-edit-btn {
          padding: 9px 20px;
          border-radius: 7px;
          border: 1.5px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.08);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .pf-edit-btn:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.4); }

        /* ── stat pills ── */
        .pf-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .pf-stat-pill {
          background: var(--white);
          border: 1.5px solid var(--line);
          border-radius: 12px;
          padding: 18px 20px;
          display: flex; flex-direction: column; gap: 4px;
          transition: box-shadow 0.15s;
        }
        .pf-stat-pill:hover { box-shadow: var(--shadow); }
        .pf-stat-val { font-family: 'DM Serif Display', serif; font-size: 28px; line-height: 1; }
        .pf-stat-lbl { font-size: 12px; color: var(--smoke); font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px; }

        /* ── lands table ── */
        .pf-lands-table { width: 100%; border-collapse: collapse; }
        .pf-lands-table th {
          font-size: 11.5px; font-weight: 600; color: var(--smoke);
          text-transform: uppercase; letter-spacing: 0.8px;
          padding: 0 12px 12px; text-align: left; border-bottom: 1px solid var(--line);
        }
        .pf-lands-table td {
          padding: 14px 12px; font-size: 13.5px; color: var(--ink);
          border-bottom: 1px solid #f8f8f8;
          vertical-align: middle;
        }
        .pf-lands-table tr:last-child td { border-bottom: none; }
        .pf-lands-table tr:hover td { background: #fafafa; }
        .pf-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 600;
        }
        .pf-status-badge.PENDING { background: #fef9c3; color: #92400e; }
        .pf-status-badge.APPROVED { background: var(--mist); color: var(--canopy); }
        .pf-status-badge.REJECTED { background: #fee2e2; color: var(--danger); }
        .pf-empty { text-align: center; padding: 40px 20px; color: var(--smoke); font-size: 14px; }

        /* ── chart controls ── */
        .pf-chart-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .pf-filter-tabs { display: flex; gap: 4px; }
        .pf-filter-tab {
          padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500;
          cursor: pointer; border: 1.5px solid var(--line);
          background: white; color: var(--smoke);
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .pf-filter-tab.active { background: var(--forest); border-color: var(--forest); color: white; }

        /* ── calendar ── */
        .pf-cal-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        .pf-cal-month { font-family: 'DM Serif Display', serif; font-size: 18px; color: var(--forest); }
        .pf-cal-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; text-align: center; margin-bottom: 8px; }
        .pf-cal-day-label { font-size: 11.5px; font-weight: 600; color: var(--smoke); text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 0; }
        .pf-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; }
        .pf-cal-cell {
          aspect-ratio: 1; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12.5px; font-weight: 500; color: var(--ink);
          transition: transform 0.1s;
        }
        .pf-cal-cell:hover { transform: scale(1.1); }
        .pf-cal-cell.today { outline: 2px solid var(--forest); outline-offset: 1px; font-weight: 700; }
        .pf-cal-legend { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 12px; color: var(--smoke); }
        .pf-cal-legend-swatch { width: 14px; height: 14px; border-radius: 3px; }

        /* ── modal ── */
        .pf-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 24px;
        }
        .pf-modal {
          background: white; border-radius: 16px; padding: 36px;
          width: 100%; max-width: 440px;
          box-shadow: var(--shadow-lg);
          display: flex; flex-direction: column; gap: 20px;
        }
        .pf-modal h2 { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--forest); }
        .pf-modal-field { display: flex; flex-direction: column; gap: 6px; }
        .pf-modal-label { font-size: 13px; font-weight: 500; color: var(--earth); }
        .pf-modal-input {
          padding: 10px 14px; border: 1.5px solid var(--line); border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--ink);
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pf-modal-input:focus { border-color: var(--leaf); box-shadow: 0 0 0 3px rgba(45,138,85,0.1); }
        .pf-modal-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
        .pf-btn-primary {
          padding: 10px 22px; background: var(--forest); color: white;
          border: none; border-radius: 7px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s;
        }
        .pf-btn-primary:hover { background: var(--canopy); }
        .pf-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .pf-btn-ghost {
          padding: 10px 18px; background: white; color: var(--smoke);
          border: 1.5px solid var(--line); border-radius: 7px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: border-color 0.15s;
        }
        .pf-btn-ghost:hover { border-color: var(--smoke); color: var(--ink); }

        /* ── no-stats ── */
        .pf-no-stats {
          height: 180px; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          color: var(--smoke); font-size: 13.5px; gap: 8px;
        }
        .pf-no-stats span { font-size: 28px; }

        /* ── custom tooltip ── */
        .pf-tooltip {
          background: var(--forest); color: white; border-radius: 8px;
          padding: 8px 12px; font-size: 12.5px; font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 768px) {
          .pf-page { padding: 24px 16px 60px; }
          .pf-stats-row { grid-template-columns: 1fr 1fr; }
          .pf-hero { flex-direction: column; align-items: flex-start; }
          .pf-card { padding: 20px; }
        }
      `}</style>

      <div className="pf-page">

        {/* ── HERO ── */}
        <motion.div className="pf-hero"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="pf-hero-left">
            <div className="pf-avatar-lg">{initials}</div>
            <div>
              <div className="pf-hero-name">{profile.fname} {profile.lname}</div>
              <div className="pf-hero-meta">
                <span>✉ {profile.email}</span>
                {profile.phoneNo && <span>📞 {profile.phoneNo}</span>}
                {profile.dob && <span>🎂 {new Date(profile.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
              </div>
            </div>
          </div>
          <div className="pf-hero-right">
            <button className="pf-edit-btn" onClick={() => setEditOpen(true)}>
              ✏ Edit Profile
            </button>
          </div>
        </motion.div>

        {/* ── STATS ROW ── */}
        <motion.div className="pf-stats-row"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <StatPill label="Lands Submitted" value={lands.length} accent="#0d3320" />
          <StatPill label="Pending Review" value={pendingLands} accent="#d97706" />
          <StatPill label="Approved" value={approvedLands} accent="#2d8a55" />
          <StatPill label="Total Area (m²)" value={totalArea > 0 ? Math.round(totalArea).toLocaleString() : "—"} accent="#2563eb" />
        </motion.div>

        {/* ── MY LANDS ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <Card>
            <SectionTitle icon="🌍" title="My Submitted Lands"
              subtitle={`${lands.length} land${lands.length !== 1 ? "s" : ""} submitted`} />
            {lands.length === 0 ? (
              <div className="pf-empty">No lands submitted yet. Head to Submit Land to get started.</div>
            ) : (
              <table className="pf-lands-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Area (m²)</th>
                    <th>Owner</th>
                    <th>Water</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {lands.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.title || "—"}</td>
                      <td>{l.areaSqm ? Number(l.areaSqm).toLocaleString() : "—"}</td>
                      <td>{l.ownerName || "—"}</td>
                      <td>{l.waterAvailable || "—"}</td>
                      <td>
                        <span className={`pf-status-badge ${l.status || "PENDING"}`}>
                          {l.status === "APPROVED" ? "✓" : l.status === "REJECTED" ? "✗" : "⏳"} {l.status || "PENDING"}
                        </span>
                      </td>
                      <td style={{ color: "var(--smoke)", fontSize: 12.5 }}>
                        {l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </motion.div>

        {/* ── CHARTS ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <div className="pf-chart-header">
              <div>
                <h3 className="pf-section-h">Activity Stats</h3>
                <p className="pf-section-sub">Land submissions and plantings over time</p>
              </div>
              <div className="pf-filter-tabs">
                {["monthly", "yearly"].map(f => (
                  <button key={f} className={`pf-filter-tab ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {stats.length === 0 ? (
              <div className="pf-no-stats">
                <span>📊</span>
                No stats data yet — submit more lands to see trends.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <p style={{ fontSize: 12, color: "var(--smoke)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Lands Reported
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d3320" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0d3320" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#0d3320", border: "none", borderRadius: 8, color: "white", fontSize: 12 }} />
                      <Area type="monotone" dataKey="reported" stroke="#0d3320" strokeWidth={2} fill="url(#g1)" dot={{ fill: "#0d3320", r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--smoke)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Trees Planted
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2d8a55" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#2d8a55" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#0d3320", border: "none", borderRadius: 8, color: "white", fontSize: 12 }} />
                      <Area type="monotone" dataKey="planted" stroke="#2d8a55" strokeWidth={2} fill="url(#g2)" dot={{ fill: "#2d8a55", r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── ACTIVITY CALENDAR ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <Card>
            <SectionTitle icon="📅" title="Activity Calendar"
              subtitle="Land submissions this month" />

            <div className="pf-cal-header">
              <span className="pf-cal-month">{monthName} {year}</span>
              {Object.keys(activityMap).length > 0 && (
                <span style={{ fontSize: 12.5, color: "var(--smoke)" }}>
                  {Object.keys(activityMap).length} active day{Object.keys(activityMap).length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="pf-cal-days">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="pf-cal-day-label">{d}</div>
              ))}
            </div>

            <div className="pf-cal-grid">
              {Array(startOffset).fill(null).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const val = activityMap[day] || 0;
                const colors = ["#f0f0ee", "#bbf7d0", "#86efac", "#4ade80", "#16a34a"];
                const bg = colors[Math.min(val, 4)];
                const isToday = day === todayDate;
                return (
                  <div key={day} className={`pf-cal-cell${isToday ? " today" : ""}`}
                    style={{ background: bg }} title={`${val} submission${val !== 1 ? "s" : ""}`}>
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="pf-cal-legend">
              <span>Less</span>
              {["#f0f0ee","#bbf7d0","#86efac","#4ade80","#16a34a"].map((c,i) => (
                <div key={i} className="pf-cal-legend-swatch" style={{ background: c }} />
              ))}
              <span>More</span>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {editOpen && (
          <motion.div className="pf-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setEditOpen(false)}>
            <motion.div className="pf-modal"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.15 }}>
              <h2>Edit Profile</h2>
              <div className="pf-modal-field">
                <label className="pf-modal-label">First Name</label>
                <input className="pf-modal-input" value={editData.fname}
                  onChange={e => setEditData(d => ({ ...d, fname: e.target.value }))} />
              </div>
              <div className="pf-modal-field">
                <label className="pf-modal-label">Last Name</label>
                <input className="pf-modal-input" value={editData.lname}
                  onChange={e => setEditData(d => ({ ...d, lname: e.target.value }))} />
              </div>
              <div className="pf-modal-field">
                <label className="pf-modal-label">Phone Number</label>
                <input className="pf-modal-input" value={editData.phoneNo}
                  onChange={e => setEditData(d => ({ ...d, phoneNo: e.target.value }))} />
              </div>
              <div className="pf-modal-actions">
                <button className="pf-btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button>
                <button className="pf-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Profile;