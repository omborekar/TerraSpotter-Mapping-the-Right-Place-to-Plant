/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Admin panel for reviewing and approving pending land submissions.
 */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminLandDetail from "./AdminLandDetail";

const BASE_URL = import.meta.env.VITE_API_URL;

const statusBadge = (status) => {
  const map = {
    PENDING:  { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "Pending" },
    APPROVED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Approved" },
    REJECTED: { cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", label: "Rejected" },
  };
  return map[status] || map.PENDING;
};

/* ─── Bone skeleton ─── */
function Bone({ className = "" }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 animate-pulse ${className}`}
    />
  );
}

/* ─── Skeleton for a single land card ─── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[200px_1fr] shadow-sm">
      <Bone className="h-44 sm:h-auto sm:min-h-[180px] rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <Bone className="h-5 w-2/3" />
          <Bone className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Bone className="h-4 w-24" />
          <Bone className="h-4 w-28" />
          <Bone className="h-4 w-20" />
        </div>
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-4/5" />
        <div className="flex gap-2 pt-1">
          <Bone className="h-6 w-16 rounded-md" />
          <Bone className="h-6 w-20 rounded-md" />
          <Bone className="h-6 w-14 rounded-md" />
        </div>
        <div className="pt-2 flex justify-between items-center border-t border-emerald-50">
          <div className="flex gap-2">
            <Bone className="h-8 w-28 rounded-xl" />
            <Bone className="h-8 w-20 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Bone className="h-8 w-24 rounded-xl" />
            <Bone className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CardImage ─── */
function CardImage({ landId }) {
  const [thumb, setThumb]   = useState(null);
  const [extra, setExtra]   = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/lands/${landId}/images`, { withCredentials: true })
      .then(res => {
        const imgs = Array.isArray(res.data) ? res.data : [];
        if (imgs.length > 0) {
          setThumb(imgs[0].imageUrl);
          setExtra(imgs.length - 1);
          setStatus("loaded");
        } else {
          setStatus("empty");
        }
      })
      .catch(() => setStatus("empty"));
  }, [landId]);

  if (status === "loading") {
    return (
      <div className="w-full h-full min-h-[180px] bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 animate-pulse" />
    );
  }

  if (status === "empty" || !thumb) {
    return (
      <div className="w-full h-full min-h-[180px] bg-emerald-50 flex flex-col items-center justify-center gap-1.5">
        <span className="text-3xl opacity-40">🌍</span>
        <p className="text-xs text-emerald-400">No photos</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[180px]">
      <img
        src={thumb}
        alt="land"
        className="w-full h-full object-cover"
        onError={e => { e.target.src = "https://via.placeholder.com/220x220/edf7f2/0b2e1a?text=🌿"; }}
      />
      {extra > 0 && (
        <span className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          +{extra} more
        </span>
      )}
    </div>
  );
}

/* ─── Summary tile ─── */
function SumTile({ value, label, color }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-2xl px-5 py-4 hover:shadow-md transition-shadow">
      <div className={`font-extrabold text-4xl leading-none mb-1.5 ${color}`}>{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">{label}</div>
    </div>
  );
}

/* ─── Main component ─── */
export default function AdminPendingLands() {
  const [lands, setLands]               = useState([]);
  const [user, setUser]                 = useState(null);
  const [sessionLoading, setSessionLoad] = useState(true);
  const [landsLoading, setLandsLoading] = useState(false);
  const [voting, setVoting]             = useState({});
  const [selectedId, setSelectedId]     = useState(null);
  const [filter, setFilter]             = useState("ALL");

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
      try {
        res = await axios.get(`${BASE_URL}/api/lands`, { withCredentials: true });
      } catch {
        res = await axios.get(`${BASE_URL}/api/lands/pending`, { withCredentials: true });
      }
      setLands(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchLands:", err);
    } finally {
      setLandsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchLands();
  }, [user, fetchLands]);

  const handleVote = async (landId, vote) => {
    setVoting(v => ({ ...v, [landId]: vote }));
    try {
      await axios.post(`${BASE_URL}/lands/${landId}/verify`, null, {
        withCredentials: true,
        params: { vote, userId: user.id },
      });
      setLands(prev =>
        prev.map(l =>
          l.id === landId ? { ...l, status: vote === "APPROVE" ? "APPROVED" : "REJECTED" } : l
        )
      );
      fetchLands();
    } catch {
      alert("Error processing vote. Please try again.");
      fetchLands();
    } finally {
      setVoting(v => ({ ...v, [landId]: null }));
    }
  };

  /* ── Guards ── */
  if (sessionLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div className="space-y-2">
          <Bone className="h-4 w-24" />
          <Bone className="h-9 w-56" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Bone key={i} className="h-9 w-24 rounded-full" />)}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => <Bone key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  if (!user?.role) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-emerald-600">
      <span className="text-5xl">🔒</span>
      <p className="font-medium">No active session</p>
    </div>
  );

  if (user.role !== "ADMIN") return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-emerald-600">
      <span className="text-5xl">🚫</span>
      <p className="font-medium">Access Denied — Admins only</p>
    </div>
  );

  /* ── Detail drill-in ── */
  if (selectedId) return (
    <AdminLandDetail
      landId={selectedId}
      user={user}
      onBack={() => { setSelectedId(null); fetchLands(); }}
      onVote={handleVote}
      voting={voting}
    />
  );

  const filtered = filter === "ALL" ? lands : lands.filter(l => l.status === filter);
  const counts = {
    ALL:      lands.length,
    PENDING:  lands.filter(l => l.status === "PENDING").length,
    APPROVED: lands.filter(l => l.status === "APPROVED").length,
    REJECTED: lands.filter(l => l.status === "REJECTED").length,
  };

  const filterLabels = { ALL: "All", PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" };

  return (
    <div className="min-h-screen bg-[#f9fbf9] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-500 mb-1">Admin Panel</div>
            <h1 className="font-extrabold text-3xl sm:text-4xl text-green-950 leading-tight">Land Review Queue</h1>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  filter === f
                    ? "bg-green-950 text-white border-green-950"
                    : "bg-white text-gray-600 border-emerald-200 hover:border-emerald-400 hover:text-green-900"
                }`}
              >
                {filterLabels[f]}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  filter === f ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-400"
                }`}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading bar ── */}
        {landsLoading && (
          <div className="h-1 rounded-full mb-4 overflow-hidden bg-emerald-100">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-green-600 animate-[loadbar_1.2s_linear_infinite] bg-[length:200%_100%]" />
          </div>
        )}

        {/* ── Summary tiles ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          <SumTile value={counts.ALL}      label="Total Submissions" color="text-green-950" />
          <SumTile value={counts.PENDING}  label="Awaiting Review"   color="text-orange-600" />
          <SumTile value={counts.APPROVED} label="Approved"          color="text-emerald-600" />
          <SumTile value={counts.REJECTED} label="Rejected"          color="text-red-600" />
        </div>

        {/* ── Land cards ── */}
        {landsLoading && lands.length === 0 ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-emerald-400">
            <div className="text-5xl mb-4">🌿</div>
            <h3 className="font-bold text-xl text-green-900 mb-2">
              No {filter === "ALL" ? "" : filterLabels[filter].toLowerCase() + " "}submissions
            </h3>
            <p className="text-sm">Check back later or adjust your filter.</p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {filtered.map(land => {
              const badge    = statusBadge(land.status);
              const isVoting = voting[land.id];
              const submitterName =
                land.createdByName || land.submittedByName ||
                (land.createdBy   ? `User #${land.createdBy}`   : null) ||
                (land.submittedBy ? `User #${land.submittedBy}` : null);
              const submitterInitial = (submitterName || "?")?.[0]?.toUpperCase();

              return (
                <motion.div
                  key={land.id}
                  className="bg-white border border-emerald-100 rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[200px_1fr] shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-200 transition-all"
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <CardImage landId={land.id} />
                    {land.status === "APPROVED" && (
                      <div className="absolute inset-0 bg-emerald-700/20 flex items-center justify-center">
                        <span className="font-extrabold text-green-800 text-sm tracking-widest">✓ APPROVED</span>
                      </div>
                    )}
                    {land.status === "REJECTED" && (
                      <div className="absolute inset-0 bg-red-700/15 flex items-center justify-center">
                        <span className="font-extrabold text-red-800 text-sm tracking-widest">✕ REJECTED</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col gap-3">
                    {/* Title + badge */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <h2 className="font-bold text-base text-green-950 leading-snug">
                        {land.title || "Untitled Land"}
                      </h2>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${badge.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                      {land.areaSqm   && <span>📐 {(land.areaSqm / 10000).toFixed(2)} ha</span>}
                      {land.ownerName && <span>👤 {land.ownerName}</span>}
                      {land.ownerPhone && <span>📞 {land.ownerPhone}</span>}
                      {land.createdAt  && (
                        <span>🗓 {new Date(land.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                      {land.waterAvailable && <span>💧 {land.waterAvailable}</span>}
                    </div>

                    {/* Description */}
                    {land.description && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{land.description}</p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {land.soilType      && <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-100 text-green-700 px-2.5 py-0.5 rounded-md">🪨 {land.soilType}</span>}
                      {land.ownershipType && <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-100 text-green-700 px-2.5 py-0.5 rounded-md">🏷 {land.ownershipType}</span>}
                      {land.fencing !== undefined && (
                        <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-100 text-green-700 px-2.5 py-0.5 rounded-md">
                          {land.fencing ? "🔒 Fenced" : "⛓ No Fence"}
                        </span>
                      )}
                      {land.accessRoad && <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-100 text-green-700 px-2.5 py-0.5 rounded-md">🛤 {land.accessRoad}</span>}
                      {land.landStatus && <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-100 text-green-700 px-2.5 py-0.5 rounded-md">📊 {land.landStatus}</span>}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-auto border-t border-emerald-50">
                      <div className="flex items-center flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedId(land.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-green-900 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          🔍 View Details
                        </button>
                        {submitterName && (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-green-700 to-emerald-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {submitterInitial}
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
                            className="px-4 py-2 bg-green-950 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors"
                          >
                            {isVoting === "APPROVE" ? "⏳ Approving…" : "✅ Approve"}
                          </button>
                          <button
                            onClick={() => handleVote(land.id, "REJECT")}
                            disabled={!!isVoting}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-colors"
                          >
                            {isVoting === "REJECT" ? "⏳ Rejecting…" : "❌ Reject"}
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

      <style>{`
        @keyframes loadbar {
          to { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}