/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Admin review queue — Verdant Editorial redesign. Cormorant Garant + Outfit.
*/
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import AdminLandDetail from "./AdminLandDetail";

const BASE_URL = import.meta.env.VITE_API_URL;

const STATUS_CFG = {
  PENDING: { dot: "bg-amber-400", text: "text-amber-400", ring: "bg-amber-400/10 border-amber-400/20", label: "Pending" },
  APPROVED: { dot: "bg-[#4db87a]", text: "text-[#4db87a]", ring: "bg-[#4db87a]/10 border-[#4db87a]/20", label: "Approved" },
  REJECTED: { dot: "bg-red-400", text: "text-red-400", ring: "bg-red-400/10   border-red-400/20", label: "Rejected" },
};

// ─── Shimmer bone ─────────────────────────────────────────────
const Bone = ({ className = "" }) => (
  <div className={`rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.09] to-white/[0.04] bg-[length:200%_100%] animate-pulse ${className}`} />
);

// ─── Card image loader ────────────────────────────────────────
function CardImage({ landId }) {
  const { t } = useTranslation();
  const [thumb, setThumb] = useState(null);
  const [extra, setExtra] = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    axios.get(`${BASE_URL}/api/lands/${landId}/images`, { withCredentials: true })
      .then(res => {
        const imgs = Array.isArray(res.data) ? res.data : [];
        if (imgs.length > 0) { setThumb(imgs[0].imageUrl); setExtra(imgs.length - 1); setStatus("loaded"); }
        else setStatus("empty");
      })
      .catch(() => setStatus("empty"));
  }, [landId]);

  if (status === "loading") return <Bone className="absolute inset-0 rounded-none" />;

  if (status === "empty" || !thumb) return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0c1e11]">
      <span className="text-3xl opacity-20">🌍</span>
      <span className="text-[9px] tracking-[0.12em] uppercase text-white/20 font-['Outfit',sans-serif]">{t("auto.auto_26", "No photos")}</span>
    </div>
  );

  return (
    <div className="absolute inset-0">
      <img
        src={thumb}
        alt="land"
        className="w-full h-full object-cover"
        onError={e => { e.target.src = "https://via.placeholder.com/200x160/0c1e11/4db87a?text=🌿"; }}
      />
      {extra > 0 && (
        <span className="absolute bottom-2 right-2 bg-black/65 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full font-['Outfit',sans-serif]">
          +{extra}
        </span>
      )}
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#0f2916] border border-white/[0.07] rounded-2xl overflow-hidden grid grid-cols-[160px_1fr] sm:grid-cols-[200px_1fr]">
      <Bone className="rounded-none min-h-[160px]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between gap-3">
          <Bone className="h-5 w-2/5" />
          <Bone className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex gap-4 mt-1">
          <Bone className="h-3.5 w-20" />
          <Bone className="h-3.5 w-28" />
          <Bone className="h-3.5 w-16" />
        </div>
        <Bone className="h-3.5 w-4/5" />
        <div className="flex gap-2 mt-1">
          <Bone className="h-6 w-20 rounded-full" />
          <Bone className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/[0.06]">
          <div className="flex gap-2">
            <Bone className="h-8 w-28 rounded-xl" />
            <Bone className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Bone className="h-8 w-22 rounded-xl" />
            <Bone className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tag pill ─────────────────────────────────────────────────
function Tag({ children }) {
  return (
    <span className="text-[10.5px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/30 font-['Outfit',sans-serif]">
      {children}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AdminPendingLands() {
  const { t } = useTranslation();
  const [lands, setLands] = useState([]);
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoad] = useState(true);
  const [landsLoading, setLandsLoading] = useState(false);
  const [voting, setVoting] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setSessionLoad(false));
  }, []);

  const fetchLands = useCallback(async () => {
    setLandsLoading(true);
    try {
      let res;
      try { res = await axios.get(`${BASE_URL}/api/lands`, { withCredentials: true }); }
      catch { res = await axios.get(`${BASE_URL}/api/lands/pending`, { withCredentials: true }); }
      setLands(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("fetchLands:", err); }
    finally { setLandsLoading(false); }
  }, []);

  useEffect(() => { if (user?.role === "ADMIN") fetchLands(); }, [user, fetchLands]);

  const handleVote = async (landId, vote) => {
    setVoting(v => ({ ...v, [landId]: vote }));
    try {
      await axios.post(`${BASE_URL}/lands/${landId}/verify`, null, { withCredentials: true, params: { vote, userId: user.id } });
      setLands(prev => prev.map(l => l.id === landId ? { ...l, status: vote === "APPROVE" ? "APPROVED" : "REJECTED" } : l));
      fetchLands();
    } catch { alert("Error processing vote. Please try again."); fetchLands(); }
    finally { setVoting(v => ({ ...v, [landId]: null })); }
  };

  // ── Guards ────────────────────────────────────────────────
  if (sessionLoading) return (
    <div className="min-h-screen bg-[#0b1d10] font-['Outfit',sans-serif] px-5 sm:px-8 lg:px-10 py-10 max-w-[1220px] mx-auto">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-9 w-56" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Bone key={i} className="h-9 w-24 rounded-full" />)}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => <Bone key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  if (!user?.role) return (
    <div className="min-h-screen bg-[#0b1d10] flex flex-col items-center justify-center gap-4 font-['Outfit',sans-serif]">
      <span className="text-5xl">🔒</span>
      <p className="text-white/40 text-sm">{t("auto.auto_29", "No active session")}</p>
    </div>
  );

  if (user.role !== "ADMIN") return (
    <div className="min-h-screen bg-[#0b1d10] flex flex-col items-center justify-center gap-4 font-['Outfit',sans-serif]">
      <span className="text-5xl">🚫</span>
      <p className="text-white/40 text-sm">{t("auto.auto_30", "Access Denied — Admins only")}</p>
    </div>
  );

  if (selectedId) return (
    <AdminLandDetail
      landId={selectedId}
      user={user}
      onBack={() => { setSelectedId(null); fetchLands(); }}
      onVote={handleVote}
      voting={voting}
    />
  );

  const counts = {
    ALL: lands.length,
    PENDING: lands.filter(l => l.status === "PENDING").length,
    APPROVED: lands.filter(l => l.status === "APPROVED").length,
    REJECTED: lands.filter(l => l.status === "REJECTED").length,
  };

  const filtered = lands.filter(l => {
    const matchFilter = filter === "ALL" || l.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (l.title || "").toLowerCase().includes(q) ||
      (l.ownerName || "").toLowerCase().includes(q) ||
      (l.nearbyLandmark || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  return (
    <div className="min-h-screen bg-[#0b1d10] font-['Outfit',sans-serif]">
      <div className="max-w-[1220px] mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10 pb-24">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-px h-3 bg-[#4db87a]/50" />
              <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-[#4db87a]/70 font-['Outfit',sans-serif]">
                {t("auto.auto_32", "Admin · Land Review Queue")}
              </span>
            </div>
            <h1 className="font-['Cormorant_Garant',serif] text-[clamp(28px,4vw,42px)] font-semibold text-white leading-[0.95] tracking-[-0.5px]">
              {t("auto.auto_33", "Review Queue")}
            </h1>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => {
              const s = STATUS_CFG[f];
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-2 h-9 px-4 rounded-full border text-[12px] font-semibold font-['Outfit',sans-serif] cursor-pointer transition-all duration-200 ${active
                      ? f === "ALL"
                        ? "bg-[#4db87a]/15 border-[#4db87a]/35 text-[#4db87a]"
                        : `${s.ring} ${s.text}`
                      : "bg-[#0f2916] border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20"
                    }`}
                >
                  {f !== "ALL" && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />}
                  {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-['Outfit',sans-serif] ${active ? "bg-white/15 text-white" : "bg-white/[0.05] text-white/30"
                    }`}>
                    {counts[f]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Loading bar ── */}
        <AnimatePresence>
          {landsLoading && (
            <motion.div
              className="h-[2px] bg-[#0f2916] rounded-full mb-5 overflow-hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full w-[55%] bg-gradient-to-r from-transparent via-[#4db87a] to-transparent"
                animate={{ x: ["-100%", "220%"] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Summary tiles ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { val: counts.ALL, lbl: "Total", val_cls: "text-white" },
            { val: counts.PENDING, lbl: "Pending", val_cls: "text-amber-400" },
            { val: counts.APPROVED, lbl: "Approved", val_cls: "text-[#4db87a]" },
            { val: counts.REJECTED, lbl: "Rejected", val_cls: "text-red-400" },
          ].map((s, i) => (
            <div key={i} className="bg-[#0f2916] border border-white/[0.07] rounded-2xl px-5 py-4">
              <div className={`font-['Cormorant_Garant',serif] text-[38px] font-semibold leading-none ${s.val_cls}`}>
                {s.val}
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/25 mt-2 font-['Outfit',sans-serif]">
                {s.lbl}
              </div>
            </div>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="flex items-center gap-3 bg-[#0f2916] border border-white/[0.08] rounded-xl px-4 py-3 mb-5 focus-within:border-[#4db87a]/30 transition-all">
          <svg className="text-white/25 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, owner, or landmark…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[13px] text-white/70 placeholder:text-white/20 font-['Outfit',sans-serif]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-white/25 hover:text-white/60 transition-colors cursor-pointer text-sm">✕</button>
          )}
        </div>

        {/* ── Cards ── */}
        {landsLoading && lands.length === 0 ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0f2916] border border-white/[0.07] flex items-center justify-center text-3xl opacity-40">
              📭
            </div>
            <div>
              <h3 className="font-['Cormorant_Garant',serif] text-[26px] font-semibold text-white/60 mb-1">
                {t("auto.auto_34", "Queue empty")}
              </h3>
              <p className="text-[13px] text-white/25 font-['Outfit',sans-serif]">
                No {filter !== "ALL" ? filter.toLowerCase() + " " : ""}submissions found.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {filtered.map(land => {
              const st = STATUS_CFG[land.status] || STATUS_CFG.PENDING;
              const isVoting = voting[land.id];
              const submitterName =
                land.createdByName || land.submittedByName ||
                (land.createdBy ? `User #${land.createdBy}` : null) ||
                (land.submittedBy ? `User #${land.submittedBy}` : null);

              return (
                <motion.div
                  key={land.id}
                  className="bg-[#0f2916] border border-white/[0.07] rounded-2xl overflow-hidden grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr] hover:border-white/[0.13] hover:shadow-[0_4px_32px_rgba(0,0,0,0.4)] transition-all duration-200 group"
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.38 } } }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden bg-[#0c1e11] min-h-[160px]">
                    <CardImage landId={land.id} />
                    {land.status === "APPROVED" && (
                      <div className="absolute inset-0 bg-[#4db87a]/12 flex items-center justify-center">
                        <span className="text-[10px] tracking-[0.12em] uppercase font-semibold text-[#4db87a] font-['Outfit',sans-serif]">{t("auto.auto_35", "✓ Approved")}</span>
                      </div>
                    )}
                    {land.status === "REJECTED" && (
                      <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                        <span className="text-[10px] tracking-[0.12em] uppercase font-semibold text-red-400 font-['Outfit',sans-serif]">{t("auto.auto_36", "✕ Rejected")}</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 flex flex-col gap-3 min-w-0">
                    {/* Title + badge */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <h2 className="font-['Cormorant_Garant',serif] text-[18px] sm:text-[20px] font-semibold text-white leading-tight">
                        {land.title || "Untitled Land"}
                      </h2>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10.5px] font-semibold shrink-0 font-['Outfit',sans-serif] ${st.ring}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                        <span className={st.text}>{st.label}</span>
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-white/30 font-['Outfit',sans-serif]">
                      {land.areaSqm && <span>⬛ {(land.areaSqm / 10000).toFixed(2)} ha</span>}
                      {land.ownerName && <span>👤 {land.ownerName}</span>}
                      {land.ownerPhone && <span className="hidden sm:inline">📞 {land.ownerPhone}</span>}
                      {land.createdAt && (
                        <span>🗓 {new Date(land.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                      {land.waterAvailable && <span>💧 {land.waterAvailable}</span>}
                    </div>

                    {/* Description */}
                    {land.description && (
                      <p className="text-[12.5px] text-white/30 leading-relaxed line-clamp-2 font-['Outfit',sans-serif] font-light">
                        {land.description}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {land.soilType && <Tag>{land.soilType}</Tag>}
                      {land.ownershipType && <Tag>{land.ownershipType}</Tag>}
                      {land.fencing !== undefined && <Tag>{land.fencing ? "Fenced" : "No Fence"}</Tag>}
                      {land.accessRoad && <Tag>{land.accessRoad}</Tag>}
                      {land.landStatus && <Tag>{land.landStatus}</Tag>}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between flex-wrap gap-3 mt-auto pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => setSelectedId(land.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0c1e11] border border-white/10 rounded-xl text-[12px] font-semibold text-white/60 font-['Outfit',sans-serif] hover:text-[#4db87a] hover:border-[#4db87a]/30 hover:bg-[#4db87a]/8 transition-all duration-150 cursor-pointer"
                        >
                          {t("auto.auto_37", "↗ Full Detail")}
                        </button>
                        {submitterName && (
                          <span className="flex items-center gap-2 text-[11px] text-white/25 font-['Outfit',sans-serif]">
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {submitterName[0]?.toUpperCase()}
                            </span>
                            {submitterName}
                          </span>
                        )}
                      </div>

                      {land.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVote(land.id, "APPROVE")}
                            disabled={!!isVoting}
                            className="px-3.5 py-2 bg-[#4db87a]/12 border border-[#4db87a]/30 rounded-xl text-[12px] font-semibold text-[#4db87a] font-['Outfit',sans-serif] cursor-pointer hover:bg-[#4db87a]/18 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                          >
                            {isVoting === "APPROVE" ? "⏳" : "✓ Approve"}
                          </button>
                          <button
                            onClick={() => handleVote(land.id, "REJECT")}
                            disabled={!!isVoting}
                            className="px-3.5 py-2 bg-red-500/[0.06] border border-red-500/20 rounded-xl text-[12px] font-semibold text-red-400/70 font-['Outfit',sans-serif] cursor-pointer hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                          >
                            {isVoting === "REJECT" ? "⏳" : "✕ Reject"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}