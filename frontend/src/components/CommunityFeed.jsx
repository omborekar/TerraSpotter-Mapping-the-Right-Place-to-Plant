import { useTranslation } from "react-i18next";
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Community feed — Verdant Editorial redesign. Cormorant Garant + Outfit.
*/
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine, TrendingUp, Heart, Sprout, Clock,
  Users, Activity, Star, MapPin, CheckCircle,
  Crosshair, X, Navigation,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ─── helpers ──────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "Some time ago";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Skeleton bones ───────────────────────────────────────────
const Bone = ({ className = "" }) => (
  <div className={`rounded-lg bg-gradient-to-r from-[#ede8de] via-[#e0d8ce] to-[#ede8de] bg-[length:200%_100%] animate-pulse ${className}`} />
);

const BoneDark = ({ className = "" }) => (
  <div className={`rounded-lg bg-gradient-to-r from-white/[0.05] via-white/[0.11] to-white/[0.05] bg-[length:200%_100%] animate-pulse ${className}`} />
);

// ─── Animated counter ─────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const seen = useRef(false);

  useEffect(() => {
    if (!target || seen.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      seen.current = true;
      const num = parseFloat(target);
      const dur = 1600;
      const steps = 55;
      const inc = num / steps;
      let cur = 0;
      const t = setInterval(() => {
        cur = Math.min(cur + inc, num);
        setCount(Number.isInteger(num) ? Math.floor(cur) : parseFloat(cur.toFixed(1)));
        if (cur >= num) clearInterval(t);
      }, dur / steps);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Review Modal ─────────────────────────────────────────────
function ReviewModal({ completionId, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return alert("Please select a rating!");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", comment);
      const res = await fetch(`${BASE_URL}/api/plantations/${completionId}/review`, {
        method: "POST", body: formData, credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit review");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#0b1d10]/85 backdrop-blur-[8px] z-[9999] flex items-center justify-center p-5"
      onClick={e => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#f7f3ec] rounded-2xl max-w-[520px] w-full relative overflow-hidden shadow-2xl border border-[#ede8de]"
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", bounce: 0.25 }}
      >
        {/* Accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-[#0c1e11] via-[#4db87a] to-[#0c1e11]" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#b5ac9e] hover:text-[#0c1e11] transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-4 h-px bg-[#4db87a]" />
            <span className="text-[10px] font-semibold tracking-[2.5px] uppercase text-[#4db87a] font-['Outfit',sans-serif]">
              {t("auto.auto_68", "Community Review")}
            </span>
          </div>
          <h2 className="font-['Cormorant_Garant',serif] text-[30px] font-semibold text-[#0c1e11] mb-6 leading-tight">
            {t("auto.auto_69", "Share your experience")}
          </h2>

          <label className="block text-[10.5px] font-semibold text-[#8a7d6e] uppercase tracking-[1.2px] mb-3 font-['Outfit',sans-serif]">
            {t("auto.auto_70", "Overall rating")}
          </label>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(v => (
              <Star
                key={v}
                size={28}
                className="cursor-pointer transition-transform duration-150 hover:scale-110"
                fill={(hovered || rating) >= v ? "#c9a84c" : "transparent"}
                stroke={(hovered || rating) >= v ? "#c9a84c" : "#e0d8cf"}
                onMouseEnter={() => setHovered(v)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(v)}
              />
            ))}
          </div>

          <label className="block text-[10.5px] font-semibold text-[#8a7d6e] uppercase tracking-[1.2px] mb-3 font-['Outfit',sans-serif]">
            {t("auto.auto_71", "Your observations (optional)")}
          </label>
          <textarea
            className="w-full min-h-[96px] px-4 py-3 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none resize-vertical mb-6 font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 transition-all leading-relaxed placeholder:text-[#c8bfb4]"
            placeholder="How is the plantation doing? Was it a good community effort?"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="w-full py-3.5 bg-[#0c1e11] text-white rounded-xl text-[14px] font-semibold font-['Outfit',sans-serif] cursor-pointer hover:bg-[#163d25] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(12,30,17,0.2)]"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t("auto.auto_72", "Submitting…")}</>
            ) : "Submit Review"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Feed Card ────────────────────────────────────────────────
function FeedCard({ update, distStr, onClick, onReview, onGrowth }) {
  const images = update.images || [];
  const thumbSrc = images[0] || null;
  const avgRating = update.reviews?.length
    ? (update.reviews.reduce((s, r) => s + r.rating, 0) / update.reviews.length).toFixed(1)
    : null;

  return (
    <motion.article
      className="bg-white border border-[#ede8de] rounded-2xl overflow-hidden cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(12,30,17,0.1)] transition-all duration-300 group"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-[#e8f0ec]">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={update.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.src = "https://placehold.co/480x270?text=🌿"; }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 bg-[#f2ede3]">
            <TreePine size={36} strokeWidth={1} className="text-[#b5ac9e]" />
            <span className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif]">{t("auto.auto_74", "No photos")}</span>
          </div>
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm text-white text-[10.5px] font-semibold px-2.5 py-1 rounded-full font-['Outfit',sans-serif]">
          <Clock size={9} />
          {timeAgo(update.completedAt)}
        </div>
        {distStr && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#0c1e11] text-[10.5px] font-bold px-2.5 py-1 rounded-full font-['Outfit',sans-serif]">
            <MapPin size={9} />
            {distStr}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 pt-5 pb-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-['Cormorant_Garant',serif] text-[21px] font-semibold text-[#0c1e11] leading-tight mb-1">
            {update.title || "Plantation Site"}
          </h3>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#b5ac9e] font-['Outfit',sans-serif]">
            <MapPin size={11} strokeWidth={1.5} />
            {update.location || "Location unknown"}
          </div>
        </div>

        {update.notes && (
          <p className="text-[13px] text-[#6b5e4e] leading-[1.7] font-['Outfit',sans-serif] font-light line-clamp-2 flex-1">
            {update.notes}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-5 pt-3 border-t border-[#ede8de]">
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#8a7d6e] font-['Outfit',sans-serif]">
            <TreePine size={12} className="opacity-50" />
            <span className="font-semibold text-[#0c1e11]">{(update.treesPlanted || 0).toLocaleString()}</span>
            <span>{t("auto.auto_75", "trees")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#8a7d6e] font-['Outfit',sans-serif]">
            <Users size={12} className="opacity-50" />
            <span className="font-medium">{update.teamName || "Community"}</span>
          </div>
          {avgRating && (
            <div className="flex items-center gap-1 ml-auto">
              <Star size={11} fill="#c9a84c" stroke="#c9a84c" />
              <span className="text-[11.5px] font-semibold text-[#0c1e11] font-['Outfit',sans-serif]">{avgRating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={onReview}
          className="py-2.5 rounded-xl border-[1.5px] border-[#e0d8cf] bg-white text-[12px] font-semibold text-[#0c1e11] font-['Outfit',sans-serif] cursor-pointer hover:border-[#4db87a]/50 hover:text-[#2d8a55] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Star size={12} />
          {t("auto.auto_76", "Add Review")}
        </button>
        <button
          onClick={onGrowth}
          className="py-2.5 rounded-xl bg-[#0c1e11] text-[12px] font-semibold text-white font-['Outfit',sans-serif] cursor-pointer hover:bg-[#163d25] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(12,30,17,0.2)]"
        >
          <TrendingUp size={12} />
          {t("auto.auto_77", "Track Growth")}
        </button>
      </div>
    </motion.article>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function CommunityFeed() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plantations, setPlantations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("recent");
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(null); // { completionId }

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [planRes, statsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/plantations/completed`, { credentials: "include" }),
        fetch(`${BASE_URL}/api/growth/stats`, { credentials: "include" }),
      ]);
      if (planRes.ok) setPlantations(await planRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) { console.error("Failed to fetch community data:", err); }
    finally { setLoading(false); }
  };

  const handleNearest = () => {
    if (userLoc) { setFilter("nearest"); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFilter("nearest");
        setLocLoading(false);
      },
      err => { console.error(err); setLocLoading(false); alert("Location access denied or unavailable."); }
    );
  };

  const sorted = [...plantations].sort((a, b) => {
    if (filter === "recent") return new Date(b.completedAt) - new Date(a.completedAt);
    if (filter === "popular") return (b.reviews?.length || 0) - (a.reviews?.length || 0);
    if (filter === "nearest" && userLoc) {
      return getDistance(userLoc.lat, userLoc.lng, a.centroidLat, a.centroidLng) -
        getDistance(userLoc.lat, userLoc.lng, b.centroidLat, b.centroidLng);
    }
    return 0;
  });

  const heroStats = [
    { val: plantations.length || 0, label: "Completed Plantations" },
    { val: stats?.totalUpdates || 0, label: "Growth Updates" },
    { val: `${stats?.avgSurvivalRate || 0}%`, label: "Avg Survival Rate" },
  ];

  const filterBtns = [
    { key: "recent", label: "Recent" },
    { key: "popular", label: "Popular" },
    { key: "nearest", label: "Nearest to me", icon: true },
  ];

  return (
    <div className="font-['Outfit',sans-serif] bg-[#f7f3ec] min-h-screen">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0c1e11] pb-14 pt-16 sm:pt-20 sm:pb-18">
        {/* Glow blobs */}
        <div className="absolute top-[-15%] right-[-8%] w-[520px] h-[520px] rounded-full bg-[#163d25] opacity-35 blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-[#c9a84c]/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        />

        <div className="relative z-10 max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-px bg-[#4db87a]/50" />
              <span className="text-[10px] font-semibold tracking-[3px] uppercase text-[#4db87a]/70">
                {t("auto.auto_78", "TerraSpotter — Community Pulse")}
              </span>
            </div>

            <h1 className="font-['Cormorant_Garant',serif] text-[clamp(52px,9vw,104px)] font-semibold text-white leading-[0.88] tracking-[-2px] mb-6">
              {t("auto.auto_79", "Watching forests")}<br />
              <em className="not-italic text-[#c9a84c]">{t("auto.auto_80", "come alive")}</em>
            </h1>

            <div className="w-14 h-px bg-white/20 mb-10" />
          </motion.div>

          {/* Hero stats */}
          <div className="flex flex-wrap gap-0">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="pr-12 mr-12 border-r border-white/10 last:border-0 last:pr-0 last:mr-0">
                  <BoneDark className="h-16 w-24 mb-2" />
                  <BoneDark className="h-2.5 w-28" />
                </div>
              ))
            ) : heroStats.map((s, i) => (
              <motion.div
                key={s.label}
                className="pr-10 sm:pr-14 mr-10 sm:mr-14 border-r border-white/10 last:border-0 last:pr-0 last:mr-0 mb-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.55 }}
              >
                <div className="font-['Cormorant_Garant',serif] text-[clamp(44px,6vw,72px)] font-semibold text-white leading-none tracking-[-1.5px]">
                  {s.val}
                </div>
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/35 mt-2 font-['Outfit',sans-serif]">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY NAV ── */}
      <div className="sticky top-0 z-50 bg-[#f2ede3] border-b border-[#e0d8cf]">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16 h-[58px] flex items-center justify-between gap-5 flex-wrap">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#b5ac9e] font-['Outfit',sans-serif]">
            {loading ? "Loading…" : `${sorted.length} Plantation${sorted.length !== 1 ? "s" : ""}`}
          </span>

          <div className="flex gap-1.5">
            {filterBtns.map(f => (
              <button
                key={f.key}
                onClick={f.icon ? handleNearest : () => setFilter(f.key)}
                className={`inline-flex items-center gap-2 h-8 px-4 rounded-full border text-[11.5px] font-semibold font-['Outfit',sans-serif] cursor-pointer transition-all duration-200 ${filter === f.key
                    ? "bg-[#0c1e11] border-[#0c1e11] text-white"
                    : "bg-transparent border-transparent text-[#8a7d6e] hover:text-[#0c1e11]"
                  }`}
              >
                {f.icon && (
                  locLoading
                    ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    : <Crosshair size={11} />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16 py-14 sm:py-16">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b5ac9e] font-['Outfit',sans-serif] whitespace-nowrap">
            Community Plantations Feed · {new Date().getFullYear()}
          </span>
          <div className="flex-1 h-px bg-[#e0d8cf]" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[#ede8de] rounded-2xl overflow-hidden">
                <Bone className="aspect-video rounded-none" />
                <div className="p-5 flex flex-col gap-3">
                  <Bone className="h-6 w-3/5" />
                  <Bone className="h-3.5 w-2/5" />
                  <Bone className="h-3.5 w-full" />
                  <Bone className="h-3.5 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f2ede3] border border-[#ede8de] flex items-center justify-center">
              <Sprout size={28} strokeWidth={1} className="text-[#b5ac9e]" />
            </div>
            <div>
              <h3 className="font-['Cormorant_Garant',serif] text-[30px] font-semibold text-[#0c1e11] mb-2">
                {t("auto.auto_81", "No completed plantations yet")}
              </h3>
              <p className="text-[13.5px] text-[#b5ac9e] max-w-xs leading-relaxed font-light">
                {t("auto.auto_82", "Completed plantations will appear here once they've been recorded.")}
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {sorted.map((u, idx) => {
              let distanceStr = null;
              if (userLoc && u.centroidLat && u.centroidLng) {
                const dist = getDistance(userLoc.lat, userLoc.lng, u.centroidLat, u.centroidLng);
                distanceStr = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
              }
              return (
                <FeedCard
                  key={u.id || idx}
                  update={u}
                  distStr={distanceStr}
                  onReview={e => { e.stopPropagation(); setReviewModal({ completionId: u.id }); }}
                  onGrowth={e => { e.stopPropagation(); navigate(`/lands/${u.landId}/growth`); }}
                  onClick={() => navigate(`/lands/${u.landId}`)}
                />
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── REVIEW MODAL ── */}
      <AnimatePresence>
        {reviewModal && (
          <ReviewModal
            completionId={reviewModal.completionId}
            onClose={() => setReviewModal(null)}
            onSuccess={() => { setReviewModal(null); fetchAll(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}