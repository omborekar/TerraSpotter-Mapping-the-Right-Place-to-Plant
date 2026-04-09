/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: User profile page with activity charts, calendar, and land submissions table.
*/
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import LoadingSpinner from "./ui/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── custom tooltip ───────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d3320] text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>{payload[0].value} {unit}</p>
    </div>
  );
};

// ─── stat card ────────────────────────────────────────────────
const StatCard = ({ label, value, accent, icon }) => (
  <div
    className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3
               shadow-sm hover:shadow-md transition-shadow duration-200"
    style={{ borderTop: `3px solid ${accent}` }}
  >
    <div className="flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      <span
        className="text-3xl font-bold tracking-tight"
        style={{ color: accent, fontFamily: "'DM Serif Display', serif" }}
      >
        {value ?? "—"}
      </span>
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

// ─── main component ───────────────────────────────────────────
const Profile = () => {
  const [profile,     setProfile]     = useState(null);
  const [lands,       setLands]       = useState([]);
  const [completions, setCompletions] = useState([]);
  const [filter,      setFilter]      = useState("monthly");
  const [editOpen,    setEditOpen]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editData,    setEditData]    = useState({ fname: "", lname: "", phoneNo: "" });

  // ── fetches ───────────────────────────────────────────────
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

  useEffect(() => {
    fetch(`${BASE_URL}/api/lands/my`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLands(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/plantations/completions/my`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCompletions(data); })
      .catch(() => {});
  }, []);

  // Build chart data, using a numeric sortKey to correctly order dates
  const stats = React.useMemo(() => {
    const map = {};

    lands.forEach(l => {
      if (!l.createdAt) return;
      const d = new Date(l.createdAt);
      // unique key per actual calendar day/month — no collision across months
      const key = filter === "monthly"
        ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
        : `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}`;

      if (!map[key]) map[key] = {
        sortKey: filter === "monthly"
          ? d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate()
          : d.getFullYear() * 100 + d.getMonth(),
        label: filter === "monthly"
          ? `${d.getDate()} ${d.toLocaleString("default",{month:"short"})}`
          : d.toLocaleString("default",{month:"short"}),
        reported: 0,
        planted:  0,
      };
      map[key].reported += 1;
    });

    completions.forEach(c => {
      if (!c.createdAt) return;
      const d = new Date(c.createdAt);
      const key = filter === "monthly"
        ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
        : `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}`;

      if (!map[key]) map[key] = {
        sortKey: filter === "monthly"
          ? d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate()
          : d.getFullYear() * 100 + d.getMonth(),
        label: filter === "monthly"
          ? `${d.getDate()} ${d.toLocaleString("default",{month:"short"})}`
          : d.toLocaleString("default",{month:"short"}),
        reported: 0,
        planted:  0,
      };
      map[key].planted += (c.treesPlanted || 0);
    });

    // Sort by numeric key to ensure correct chronological order
    return Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
  }, [lands, completions, filter]);

  // Save edited profile fields
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

  // ── calendar ──────────────────────────────────────────────
  const today       = new Date();
  const year        = today.getFullYear();
  const month       = today.getMonth();
  const todayDate   = today.getDate();
  const monthName   = today.toLocaleString("default", { month: "long" });
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const activityMap = {};
  lands.forEach(l => {
    if (!l.createdAt) return;
    const d = new Date(l.createdAt);
    if (d.getMonth() === month && d.getFullYear() === year) {
      activityMap[d.getDate()] = (activityMap[d.getDate()] || 0) + 1;
    }
  });

  // ── derived stats ─────────────────────────────────────────
  const pendingLands      = lands.filter(l => l.status === "PENDING").length;
  const approvedLands     = lands.filter(l => l.status === "APPROVED").length;
  const totalTreesPlanted = completions.reduce((s, c) => s + (c.treesPlanted || 0), 0);

  // ── guards ────────────────────────────────────────────────
  if (pageLoading) return <LoadingSpinner text="Loading profile..." />;
  if (!profile) return (
    <div className="min-h-[60vh] flex items-center justify-center text-red-500 text-sm">
      Failed to load profile. Please refresh.
    </div>
  );

  const initials = `${profile.fname?.[0] || ""}${profile.lname?.[0] || ""}`.toUpperCase();

  const calColors = ["bg-slate-100", "bg-emerald-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"];
  const calSwatches = ["#f1f5f9", "#d1fae5", "#a7f3d0", "#34d399", "#059669"];

  // ── render ────────────────────────────────────────────────
  return (
    <>
      {/* Google font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');`}</style>

      <div className="min-h-screen bg-[#f7f3ee] py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* ── HERO ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-[#0d3320] rounded-3xl px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            {/* decorative glow */}
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(circle at 80% 50%, rgba(77,184,122,0.18), transparent 60%)" }} />

            <div className="relative flex items-center gap-5">
              {/* avatar */}
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
                           text-white text-2xl md:text-3xl shrink-0 border-2 border-white/20"
                style={{
                  background: "linear-gradient(135deg,#1a5c38,#4db87a)",
                  fontFamily: "'DM Serif Display', serif",
                }}
              >
                {initials}
              </div>

              <div>
                <h1
                  className="text-white text-2xl md:text-3xl leading-tight"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {profile.fname} {profile.lname}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-white/50 text-sm">
                  <span>✉ {profile.email}</span>
                  {profile.phoneNo && <span>📞 {profile.phoneNo}</span>}
                  {profile.dob && (
                    <span>🎂 {new Date(profile.dob).toLocaleDateString("en-IN",{
                      day:"numeric", month:"short", year:"numeric"
                    })}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="relative shrink-0 self-start md:self-auto px-5 py-2.5 rounded-xl
                         border border-white/25 bg-white/8 text-white text-sm font-medium
                         hover:bg-white/15 hover:border-white/40 transition-all duration-150 cursor-pointer"
            >
              ✏ Edit Profile
            </button>
          </motion.div>

          {/* ── STAT CARDS ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard label="Lands Submitted" value={lands.length}        accent="#0d3320" icon="🌍" />
            <StatCard label="Pending Review"  value={pendingLands}         accent="#d97706" icon="⏳" />
            <StatCard label="Approved"        value={approvedLands}        accent="#2d8a55" icon="✅" />
            <StatCard
              label="Trees Planted"
              value={totalTreesPlanted > 0 ? totalTreesPlanted.toLocaleString() : "—"}
              accent="#2563eb"
              icon="🌳"
            />
          </motion.div>

          {/* ── LANDS TABLE ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-base shrink-0">🌍</span>
              <div>
                <h2 className="text-sm font-semibold text-[#0d3320]">My Submitted Lands</h2>
                <p className="text-xs text-slate-400 mt-0.5">{lands.length} land{lands.length !== 1 ? "s" : ""} submitted</p>
              </div>
            </div>

            {lands.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No lands submitted yet. Head to Submit Land to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Title","Area (m²)","Owner","Water","Status","Submitted"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lands.map((l, i) => (
                      <tr key={l.id}
                        className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i === lands.length - 1 ? "border-b-0" : ""}`}>
                        <td className="px-4 py-3.5 font-medium text-[#0d3320] whitespace-nowrap">{l.title || "—"}</td>
                        <td className="px-4 py-3.5 text-slate-600">{l.areaSqm ? Number(l.areaSqm).toLocaleString() : "—"}</td>
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{l.ownerName || "—"}</td>
                        <td className="px-4 py-3.5 text-slate-600 capitalize">{l.waterAvailable || "—"}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                            ${l.status === "APPROVED" ? "bg-emerald-50 text-emerald-700"
                            : l.status === "REJECTED" ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"}`}>
                            {l.status === "APPROVED" ? "✓" : l.status === "REJECTED" ? "✗" : "⏳"}
                            {l.status || "PENDING"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                          {l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN",{
                            day:"numeric", month:"short", year:"numeric"
                          }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* ── ACTIVITY CHARTS ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-6"
          >
            {/* chart header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-[#0d3320]">Activity Stats</h2>
                <p className="text-xs text-slate-400 mt-0.5">Land submissions and trees planted over time</p>
              </div>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                {["monthly","yearly"].map(f => (
                  <button key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer
                      ${filter === f
                        ? "bg-[#0d3320] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {stats.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                <span className="text-3xl">📊</span>
                No stats yet — submit more lands to see trends.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* lands reported */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Lands Reported</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={stats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#0d3320" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#0d3320" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false} tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false} tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ChartTooltip unit="lands" />} />
                      <Area
                        type="monotone" dataKey="reported"
                        stroke="#0d3320" strokeWidth={2}
                        fill="url(#g1)"
                        dot={{ fill: "#0d3320", r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#0d3320" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* trees planted */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Trees Planted</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={stats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#2d8a55" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#2d8a55" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false} tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false} tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ChartTooltip unit="trees" />} />
                      <Area
                        type="monotone" dataKey="planted"
                        stroke="#2d8a55" strokeWidth={2}
                        fill="url(#g2)"
                        dot={{ fill: "#2d8a55", r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#2d8a55" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

              </div>
            )}
          </motion.div>

          {/* ── ACTIVITY CALENDAR ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-6"
          >
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-5">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-base shrink-0">📅</span>
              <div>
                <h2 className="text-sm font-semibold text-[#0d3320]">Activity Calendar</h2>
                <p className="text-xs text-slate-400 mt-0.5">Land submissions this month</p>
              </div>
              {Object.keys(activityMap).length > 0 && (
                <span className="ml-auto text-xs text-slate-400">
                  {Object.keys(activityMap).length} active day{Object.keys(activityMap).length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily:"'DM Serif Display',serif" }}
                className="text-lg text-[#0d3320]">
                {monthName} {year}
              </h3>
            </div>

            {/* day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* day cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array(startOffset).fill(null).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const val = activityMap[day] || 0;
                const isToday = day === todayDate;
                const bg = calSwatches[Math.min(val, 4)];
                return (
                  <div
                    key={day}
                    title={`${val} submission${val !== 1 ? "s" : ""}`}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                      transition-transform hover:scale-110 cursor-default
                      ${isToday ? "ring-2 ring-[#0d3320] ring-offset-1 font-bold" : ""}
                      ${val > 0 ? "text-emerald-900" : "text-slate-400"}`}
                    style={{ background: bg }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
              <span>Less</span>
              {calSwatches.map((c, i) => (
                <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background: c }} />
              ))}
              <span>More</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── EDIT MODAL ──────────────────────────────────────── */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setEditOpen(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <h2 style={{ fontFamily:"'DM Serif Display',serif" }}
                className="text-2xl text-[#0d3320]">Edit Profile</h2>

              {[
                { label: "First Name",    key: "fname" },
                { label: "Last Name",     key: "lname" },
                { label: "Phone Number",  key: "phoneNo" },
              ].map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
                  <input
                    value={editData[key]}
                    onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800
                               outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100
                               transition-all duration-150"
                  />
                </div>
              ))}

              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium
                             text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#0d3320] text-white text-sm font-semibold
                             hover:bg-[#1a5c38] disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all cursor-pointer"
                >
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