import { useTranslation } from "react-i18next";
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Plantation Showcase — Verdant Editorial redesign.
*/
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Calendar, TreePine, Users, Camera, X, ChevronLeft, ChevronRight, Check } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Bone = ({ className = "" }) => (
  <div className={`rounded-lg bg-gradient-to-r from-[#f0ebe2] via-[#e8e2d8] to-[#f0ebe2] bg-[length:200%_100%] animate-pulse ${className}`} />
);

const BoneDark = ({ className = "" }) => (
  <div className={`rounded-lg bg-gradient-to-r from-white/[0.05] via-white/[0.11] to-white/[0.05] bg-[length:200%_100%] animate-pulse ${className}`} />
);

// ─── Stars display ────────────────────────────────────────────
const StarRow = ({ value = 0, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size}
        fill={i <= Math.round(value) ? "#c9a84c" : "transparent"}
        stroke={i <= Math.round(value) ? "#c9a84c" : "#e0d8cf"}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// ─── Animated counter ─────────────────────────────────────────
function Counter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const seen = useRef(false);
  useEffect(() => {
    if (!target || seen.current) return;
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      seen.current = true;
      const num = parseFloat(String(target).replace(/,/g, ""));
      let cur = 0; const steps = 55; const inc = num / steps;
      const t = setInterval(() => {
        cur = Math.min(cur + inc, num);
        setCount(Number.isInteger(num) ? Math.floor(cur) : parseFloat(cur.toFixed(1)));
        if (cur >= num) clearInterval(t);
      }, 1600 / steps);
    }, { threshold: 0.3 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [target]);
  return <span ref={ref}>{typeof target === "number" ? count.toLocaleString() : count}</span>;
}

// ─── Main ─────────────────────────────────────────────────────
export default function PlantationShowcase() {
  const { t } = useTranslation();
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchPlantations(); }, []);

  const fetchPlantations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/plantations/completed`, { credentials: "include" });
      const data = await res.json();
      setPlantations(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const sorted = [...plantations].sort((a, b) => {
    if (filter === "recent") return new Date(b.completedAt) - new Date(a.completedAt);
    if (filter === "popular") return (b.reviews?.length || 0) - (a.reviews?.length || 0);
    return 0;
  });

  const totalTrees = plantations.reduce((s, p) => s + (p.treesPlanted || 0), 0);
  const totalReviews = plantations.reduce((s, p) => s + (p.reviews?.length || 0), 0);

  return (
    <div className="font-['Outfit',sans-serif] bg-[#f7f3ec] min-h-screen">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0c1e11] pb-14 pt-16 sm:pt-20">
        <div className="absolute top-[-12%] left-[-8%] w-[520px] h-[520px] rounded-full bg-[#163d25] opacity-30 blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-6%] w-[400px] h-[400px] rounded-full bg-[#c9a84c]/8 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        />

        <div className="relative z-10 max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-px bg-[#4db87a]/50" />
              <span className="text-[10px] font-semibold tracking-[3px] uppercase text-[#4db87a]/70">
                {t("auto.auto_267", "TerraSpotter — Green Legacy Archive")}
              </span>
            </div>
            <h1 className="font-['Cormorant_Garant',serif] text-[clamp(56px,9vw,108px)] font-semibold text-white leading-[0.88] tracking-[-2px] mb-6">
              {t("auto.auto_268", "Where land")}<br /><em className="not-italic text-[#c9a84c]">{t("auto.auto_269", "becomes forest")}</em>
            </h1>
            <div className="w-14 h-px bg-white/20 mb-10" />
          </motion.div>

          <div className="flex flex-wrap gap-0">
            {loading ? [...Array(3)].map((_, i) => (
              <div key={i} className="pr-12 mr-12 border-r border-white/10 last:border-0 last:pr-0 last:mr-0">
                <BoneDark className="h-16 w-28 mb-2" />
                <BoneDark className="h-2.5 w-32" />
              </div>
            )) : [
              { val: plantations.length, lbl: "Plantations Completed" },
              { val: totalTrees, lbl: "Trees in the Ground" },
              { val: totalReviews, lbl: "Community Voices" },
            ].map((s, i) => (
              <motion.div key={s.lbl}
                className="pr-10 sm:pr-14 mr-10 sm:mr-14 border-r border-white/10 last:border-0 last:pr-0 last:mr-0 mb-6"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
              >
                <div className="font-['Cormorant_Garant',serif] text-[clamp(48px,7vw,80px)] font-semibold text-white leading-none tracking-[-1.5px]">
                  <Counter target={s.val} />
                </div>
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/35 mt-2 font-['Outfit',sans-serif]">
                  {s.lbl}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY NAV ── */}
      <div className="sticky top-0 z-50 bg-[#f2ede3] border-b border-[#e0d8cf]">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16 h-[58px] flex items-center justify-between gap-5">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#b5ac9e]">
            {loading ? "Loading…" : `${sorted.length} Record${sorted.length !== 1 ? "s" : ""}`}
          </span>
          <div className="flex gap-1">
            {[{ key: "all", label: "All" }, { key: "recent", label: "Recent" }, { key: "popular", label: "Popular" }].map(f => (
              <button key={f.key}
                onClick={() => setFilter(f.key)}
                className={`h-8 px-4 rounded-full text-[11.5px] font-semibold border transition-all duration-200 cursor-pointer ${filter === f.key
                    ? "bg-[#0c1e11] border-[#0c1e11] text-white"
                    : "bg-transparent border-transparent text-[#8a7d6e] hover:text-[#0c1e11]"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16 py-14 sm:py-16">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b5ac9e] whitespace-nowrap">
            Field Reports · {new Date().getFullYear()}
          </span>
          <div className="flex-1 h-px bg-[#e0d8cf]" />
        </div>

        {loading ? (
          <div className="flex flex-col divide-y divide-[#e0d8cf]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0">
                <Bone className="aspect-[4/3] lg:aspect-auto rounded-none min-h-[240px]" />
                <div className="p-8 lg:p-12 flex flex-col gap-4">
                  <Bone className="h-3 w-28" />
                  <Bone className="h-10 w-3/4" />
                  <Bone className="h-10 w-1/2" />
                  <Bone className="h-3.5 w-full" /><Bone className="h-3.5 w-5/6" /><Bone className="h-3.5 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f2ede3] border border-[#ede8de] flex items-center justify-center">
              <TreePine size={28} strokeWidth={1} className="text-[#b5ac9e]" />
            </div>
            <h3 className="font-['Cormorant_Garant',serif] text-[28px] font-semibold text-[#0c1e11]">
              {t("auto.auto_270", "No records yet")}
            </h3>
            <p className="text-[13.5px] text-[#b5ac9e] font-light">{t("auto.auto_271", "Be the first to complete a plantation.")}</p>
          </div>
        ) : (
          <motion.div
            className="flex flex-col divide-y divide-[#e0d8cf] border-y border-[#e0d8cf]"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {sorted.map((p, idx) => (
              <PlantationRow key={p.id} plantation={p} onClick={() => setSelected(p)} />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            plantation={selected}
            onClose={() => setSelected(null)}
            onReview={() => setShowReview(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReview && (
          <ReviewModal
            plantation={selected}
            onClose={() => setShowReview(false)}
            onSuccess={() => { setShowReview(false); fetchPlantations(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Plantation Row ───────────────────────────────────────────
function PlantationRow({ plantation, onClick }) {
  const avgRating = plantation.reviews?.length
    ? (plantation.reviews.reduce((s, r) => s + r.rating, 0) / plantation.reviews.length).toFixed(1)
    : null;
  const imgSrc = plantation.images?.[0];

  return (
    <motion.article
      className="grid grid-cols-1 lg:grid-cols-[380px_1fr] cursor-pointer group hover:bg-[#f2ede3]/60 transition-all duration-300 relative overflow-hidden"
      onClick={onClick}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#e8f0ec] min-h-[260px] lg:min-h-[320px]">
        {imgSrc ? (
          <>
            <img
              src={imgSrc} alt={plantation.title}
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              onError={e => { e.target.src = "https://placehold.co/400x300?text=🌿"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {plantation.images?.length > 1 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm text-white text-[10.5px] font-semibold px-2.5 py-1 rounded-full font-['Outfit',sans-serif]">
                <Camera size={10} /> {plantation.images.length} photos
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f2ede3]">
            <TreePine size={36} strokeWidth={1} className="text-[#b5ac9e]" />
            <span className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif]">{t("auto.auto_273", "No photos")}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-8 py-10 lg:px-14 lg:py-12 flex flex-col">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#2d8a55] font-['Outfit',sans-serif]">
            {new Date(plantation.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          {plantation.teamName && (
            <>
              <span className="w-1 h-1 rounded-full bg-[#c4d9cc]" />
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#b5ac9e] font-['Outfit',sans-serif]">
                {plantation.teamName}
              </span>
            </>
          )}
        </div>

        <h2 className="font-['Cormorant_Garant',serif] text-[clamp(26px,3vw,42px)] font-semibold text-[#0c1e11] leading-[1.05] tracking-[-0.5px] mb-3">
          {plantation.title}
        </h2>

        <div className="flex items-center gap-1.5 text-[12px] text-[#b5ac9e] mb-5 font-['Outfit',sans-serif]">
          <MapPin size={12} strokeWidth={1.5} />
          {plantation.location}
        </div>

        {plantation.notes && (
          <p className="text-[13.5px] text-[#6b5e4e] leading-[1.8] font-light line-clamp-3 mb-8 flex-1">
            {plantation.notes}
          </p>
        )}

        <div className="flex items-end justify-between gap-4 mt-auto flex-wrap">
          <div className="flex gap-8">
            <div>
              <div className="font-['Cormorant_Garant',serif] text-[38px] font-semibold text-[#0c1e11] leading-none">
                {(plantation.treesPlanted || 0).toLocaleString()}
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b5ac9e] mt-1.5">{t("auto.auto_274", "Trees")}</div>
            </div>
            <div>
              <div className="font-['Cormorant_Garant',serif] text-[38px] font-semibold text-[#0c1e11] leading-none">
                {plantation.reviews?.length || 0}
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b5ac9e] mt-1.5">{t("auto.auto_275", "Reviews")}</div>
            </div>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2 border border-[#e0d8cf] rounded-full px-4 py-2">
              <StarRow value={parseFloat(avgRating)} />
              <span className="font-['Cormorant_Garant',serif] text-[20px] font-semibold text-[#c9a84c]">{avgRating}</span>
            </div>
          )}
        </div>

        {/* Hover CTA */}
        <div className="absolute bottom-10 right-14 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hidden lg:flex items-center gap-2 bg-[#0c1e11] text-white text-[10px] font-semibold tracking-[0.15em] uppercase px-4 py-2.5 rounded-sm">
          {t("auto.auto_276", "View Record")} <ChevronRight size={12} />
        </div>
      </div>
    </motion.article>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────
function DetailModal({ plantation, onClose, onReview }) {
  const [cur, setCur] = useState(0);
  const images = plantation.images || [];
  const avgRating = plantation.reviews?.length
    ? (plantation.reviews.reduce((s, r) => s + r.rating, 0) / plantation.reviews.length).toFixed(1)
    : "—";

  return (
    <motion.div
      className="fixed inset-0 bg-[#0c1e11]/85 backdrop-blur-[14px] z-[1000] flex items-start justify-center p-5 sm:p-8 overflow-y-auto font-['Outfit',sans-serif]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-[#f7f3ec] w-full max-w-[900px] my-auto overflow-hidden shadow-2xl border border-[#ede8de] rounded-sm"
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 28 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full border border-[#e0d8cf] bg-[#f7f3ec] flex items-center justify-center text-[#8a7d6e] hover:bg-[#f2ede3] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="relative aspect-video bg-[#0c1e11] overflow-hidden">
            <img src={images[cur]} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {images.length > 1 && (
              <>
                <button onClick={() => setCur((cur - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/75 transition-all cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCur((cur + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/75 transition-all cursor-pointer">
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setCur(i)}
                      className={`h-[3px] rounded-full cursor-pointer transition-all duration-250 ${i === cur ? "bg-white w-7" : "bg-white/40 w-4"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="px-8 sm:px-12 py-10 sm:py-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px bg-[#2d8a55]" />
            <span className="text-[10px] font-semibold tracking-[2.5px] uppercase text-[#2d8a55]">{t("auto.auto_278", "Field Report")}</span>
          </div>
          <h2 className="font-['Cormorant_Garant',serif] text-[clamp(28px,4.5vw,50px)] font-semibold text-[#0c1e11] leading-[0.95] tracking-[-0.5px] mb-6">
            {plantation.title}
          </h2>

          <div className="flex flex-wrap gap-5 py-5 border-t border-b border-[#e0d8cf] mb-8 text-[12.5px] text-[#8a7d6e]">
            <span className="flex items-center gap-2"><MapPin size={12} strokeWidth={1.5} />{plantation.location}</span>
            <span className="flex items-center gap-2">
              <Calendar size={12} strokeWidth={1.5} />
              {new Date(plantation.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-2"><Users size={12} strokeWidth={1.5} />{plantation.teamName || "Green Team"}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-[#e0d8cf] border border-[#e0d8cf] mb-8">
            {[
              { val: (plantation.treesPlanted || 0).toLocaleString(), lbl: "Trees Planted" },
              { val: plantation.moreCapacity || 0, lbl: "More Capacity" },
              { val: avgRating, lbl: "Avg Rating" },
            ].map((s, i) => (
              <div key={i} className="bg-[#f7f3ec] px-5 py-5 text-center">
                <div className="font-['Cormorant_Garant',serif] text-[44px] font-semibold text-[#0c1e11] leading-none tracking-[-0.5px]">
                  {s.val}
                </div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b5ac9e] mt-2">{s.lbl}</div>
              </div>
            ))}
          </div>

          {plantation.notes && (
            <div className="border-l-4 border-[#0c1e11] pl-5 py-1 mb-8">
              <p className="font-['Cormorant_Garant',serif] text-[18px] font-normal italic text-[#2e2e24] leading-[1.75]">
                "{plantation.notes}"
              </p>
            </div>
          )}

          <button
            onClick={onReview}
            className="w-full py-4 bg-[#0c1e11] text-white text-[11px] font-semibold tracking-[0.18em] uppercase font-['Outfit',sans-serif] flex items-center justify-center gap-2.5 hover:bg-[#163d25] transition-colors cursor-pointer mb-10 rounded-sm"
          >
            <Star size={13} strokeWidth={1.5} /> {t("auto.auto_279", "Write a Review")}
          </button>

          {plantation.reviews?.length > 0 && (
            <div className="border-t border-[#e0d8cf] pt-8">
              <h3 className="font-['Cormorant_Garant',serif] text-[24px] font-semibold text-[#0c1e11] mb-5">
                Community Reviews ({plantation.reviews.length})
              </h3>
              <div className="flex flex-col gap-4">
                {plantation.reviews.map((r, i) => (
                  <div key={i} className="border-b border-[#e0d8cf] pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13.5px] font-semibold text-[#0c1e11]">{r.userName}</span>
                      <div className="flex items-center gap-2">
                        <StarRow value={r.rating} size={12} />
                        <span className="text-[11px] text-[#b5ac9e]">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {r.comment && <p className="text-[13px] text-[#6b5e4e] leading-relaxed italic font-light">"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────
function ReviewModal({ plantation, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const addFiles = files => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 5 - photos.length);
    setPhotos(p => [...p, ...valid.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))].slice(0, 5));
  };

  const removePhoto = idx => {
    setPhotos(p => { URL.revokeObjectURL(p[idx].previewUrl); return p.filter((_, i) => i !== idx); });
  };

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write a comment"); return; }
    setError(""); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("rating", rating);
      fd.append("comment", comment);
      photos.forEach(p => fd.append("images", p.file));
      const res = await fetch(`${BASE_URL}/api/plantations/${plantation.id}/review`, {
        method: "POST", credentials: "include", body: fd,
      });
      if (!res.ok) { const b = await res.json().catch(() => { }); throw new Error(b?.message || `Error ${res.status}`); }
      onSuccess();
    } catch (err) { setError(err.message || "Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#0c1e11]/85 backdrop-blur-[8px] z-[1001] flex items-center justify-center p-5 font-['Outfit',sans-serif]"
      style={{ zIndex: 1001 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && !submitting && onClose()}
    >
      <motion.div
        className="bg-[#f7f3ec] w-full max-w-[520px] rounded-sm overflow-hidden shadow-2xl border border-[#ede8de]"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-[3px] bg-gradient-to-r from-[#0c1e11] via-[#4db87a] to-[#0c1e11]" />
        <div className="p-8 sm:p-10 relative">
          <button onClick={onClose} disabled={submitting}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#e0d8cf] flex items-center justify-center text-[#b5ac9e] hover:bg-[#f2ede3] transition-colors cursor-pointer">
            <X size={14} />
          </button>

          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-4 h-px bg-[#4db87a]" />
            <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#4db87a]">{t("auto.auto_280", "Review")}</span>
          </div>
          <h2 className="font-['Cormorant_Garant',serif] text-[32px] font-semibold text-[#0c1e11] mb-6 leading-tight tracking-[-0.3px]">
            {t("auto.auto_281", "Leave a Review")}
          </h2>

          <label className="block text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] mb-3">
            {t("auto.auto_282", "Rating")} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={28}
                fill={s <= (hovered || rating) ? "#c9a84c" : "transparent"}
                stroke={s <= (hovered || rating) ? "#c9a84c" : "#e0d8cf"}
                strokeWidth={1.5}
                className="cursor-pointer transition-transform hover:scale-110"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
              />
            ))}
          </div>

          <label className="block text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] mb-3">
            {t("auto.auto_283", "Your Review")} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Describe what you observed — the growth, the terrain, the atmosphere…"
            className="w-full min-h-[100px] px-4 py-3 border-[1.5px] border-[#e0d8cf] rounded-none bg-white text-sm text-[#0c1e11] outline-none resize-vertical mb-5 font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 transition-all leading-relaxed placeholder:text-[#c8bfb4]"
          />

          <label className="block text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] mb-3">
            {t("auto.auto_284", "Photos (Optional)")}
          </label>
          {photos.length < 5 && (
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-[#e0d8cf] rounded-none py-5 px-4 text-center cursor-pointer bg-[#f2ede3] hover:border-[#4db87a]/50 hover:bg-emerald-50/40 transition-all mb-3"
            >
              <Camera size={20} className="mx-auto text-[#b5ac9e] mb-1.5" />
              <div className="text-[12px] text-[#8a7d6e]">{t("auto.auto_285", "Click to upload")}</div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => addFiles(e.target.files)} />
            </div>
          )}
          {photos.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-5">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#e0d8cf]">
                  <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/65 text-white cursor-pointer text-[10px] flex items-center justify-center hover:bg-red-600/80 transition-colors">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200/80 rounded text-[12.5px] text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={onClose} disabled={submitting}
              className="flex-1 py-3.5 border border-[#e0d8cf] bg-transparent text-[#8a7d6e] text-[11px] font-semibold tracking-[0.1em] uppercase cursor-pointer hover:border-[#0c1e11] hover:text-[#0c1e11] transition-all rounded-sm">
              {t("auto.auto_286", "Cancel")}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3.5 bg-[#0c1e11] text-white text-[11px] font-semibold tracking-[0.1em] uppercase cursor-pointer hover:bg-[#163d25] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 rounded-sm">
              {submitting
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("auto.auto_287", "Submitting…")}</>
                : <><Check size={13} />{t("auto.auto_288", "Submit Review")}</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}