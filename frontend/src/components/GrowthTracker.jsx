import { useTranslation } from "react-i18next";
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Growth Tracker — Verdant Editorial redesign. Cormorant Garant + Outfit.
*/
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine, TrendingUp, Sprout, Droplets, Sun, AlertTriangle, X,
  Plus, ArrowLeft,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ─── Health config ────────────────────────────────────────────
const HEALTH_OPTIONS = [
  { key: "Thriving", icon: <Sun size={13} />, color: "text-[#16a34a]", ring: "bg-[#16a34a]/10 border-[#16a34a]/25", label: "Thriving" },
  { key: "Healthy", icon: <Sprout size={13} />, color: "text-[#65a30d]", ring: "bg-[#65a30d]/10 border-[#65a30d]/25", label: "Healthy" },
  { key: "Struggling", icon: <Droplets size={13} />, color: "text-amber-600", ring: "bg-amber-500/10 border-amber-500/25", label: "Struggling" },
  { key: "Critical", icon: <AlertTriangle size={13} />, color: "text-red-500", ring: "bg-red-500/10   border-red-500/25", label: "Critical" },
];

function getHealth(status) {
  return HEALTH_OPTIONS.find(h => h.key === status) || HEALTH_OPTIONS[1];
}

// ─── Skeleton bone ────────────────────────────────────────────
const Bone = ({ className = "" }) => (
  <div className={`rounded-lg bg-gradient-to-r from-[#f0ebe2] via-[#e8e2d8] to-[#f0ebe2] bg-[length:200%_100%] animate-pulse ${className}`} />
);

const BoneDark = ({ className = "" }) => (
  <div className={`rounded-lg bg-gradient-to-r from-white/[0.05] via-white/[0.11] to-white/[0.05] bg-[length:200%_100%] animate-pulse ${className}`} />
);

// ─── SVG Growth Chart ─────────────────────────────────────────
function GrowthChart({ updates }) {
  const { t } = useTranslation();
  if (!updates || updates.length < 2) return null;
  const W = 800, H = 200, PAD = 48;
  const heights = updates.map(u => u.averageHeightCm || 0);
  const survivals = updates.map(u => u.survivalRate || 0);
  const maxH = Math.max(...heights, 10);

  const pts = (data, maxVal) =>
    data.map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
      const y = H - PAD - (v / maxVal) * (H - PAD * 2);
      return `${x},${y}`;
    }).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none">
        {[0, .25, .5, .75, 1].map(p => (
          <line key={p}
            x1={PAD} x2={W - PAD}
            y1={H - PAD - p * (H - PAD * 2)} y2={H - PAD - p * (H - PAD * 2)}
            stroke="#e0d8cf" strokeWidth="1" strokeDasharray="4,4"
          />
        ))}
        {/* Height line */}
        <polyline points={pts(heights, maxH)}
          fill="none" stroke="#0c1e11" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {heights.map((v, i) => {
          const x = PAD + (i / (heights.length - 1)) * (W - PAD * 2);
          const y = H - PAD - (v / maxH) * (H - PAD * 2);
          return <circle key={i} cx={x} cy={y} r="4.5" fill="#0c1e11" stroke="#fff" strokeWidth="2" />;
        })}
        {/* Survival line */}
        <polyline points={pts(survivals, 100)}
          fill="none" stroke="#c9a84c" strokeWidth="2" strokeDasharray="6,3" strokeLinejoin="round" strokeLinecap="round" />
        {survivals.map((v, i) => {
          const x = PAD + (i / (survivals.length - 1)) * (W - PAD * 2);
          const y = H - PAD - (v / 100) * (H - PAD * 2);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#c9a84c" stroke="#fff" strokeWidth="2" />;
        })}
        {/* Date labels */}
        {updates.map((u, i) => {
          const x = PAD + (i / (updates.length - 1)) * (W - PAD * 2);
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle" fontSize="9" fill="#b5ac9e" fontFamily="'Outfit',sans-serif">
              {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-[11px] text-[#8a7d6e] font-['Outfit',sans-serif]">
          <div className="w-3 h-3 rounded-full bg-[#0c1e11]" /> Avg Height (cm) — max {maxH}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#8a7d6e] font-['Outfit',sans-serif]">
          <div className="w-3 h-3 rounded-full bg-[#c9a84c]" /> {t("auto.auto_176", "Survival Rate (%)")}
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Card ────────────────────────────────────────────
function TimelineCard({ update, onImageClick }) {
  const hConf = getHealth(update.healthStatus);
  const images = update.images?.map(img => typeof img === "string" ? img : img.imageUrl) || [];

  return (
    <motion.div
      className="relative ml-12 bg-white border border-[#ede8de] rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(12,30,17,0.08)] transition-all duration-300"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
    >
      {/* Timeline dot */}
      <div className="absolute -left-[41px] top-7 w-3 h-3 rounded-full border-2 border-[#0c1e11] bg-[#f7f3ec] z-10" />

      <div className="px-6 pt-5 pb-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#2d8a55] font-['Outfit',sans-serif] mb-1">
            {new Date(update.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div className="text-[12px] text-[#b5ac9e] font-['Outfit',sans-serif]">
            👤 {update.userName || "Community member"}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold font-['Outfit',sans-serif] ${hConf.ring} ${hConf.color}`}>
          {hConf.icon} {hConf.label}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 divide-x divide-[#ede8de] mx-6 rounded-xl overflow-hidden border border-[#ede8de] mb-4">
        {[
          { val: update.averageHeightCm || "—", lbl: "Height (cm)" },
          { val: update.survivalRate != null ? `${update.survivalRate}%` : "—", lbl: "Survival" },
          { val: hConf.label, lbl: "Health", colorCls: hConf.color },
        ].map((m, i) => (
          <div key={i} className="bg-[#f7f3ec] px-4 py-3 text-center">
            <div className={`font-['Cormorant_Garant',serif] text-[22px] font-semibold leading-none ${m.colorCls || "text-[#0c1e11]"}`}>
              {m.val}
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b5ac9e] mt-1.5 font-['Outfit',sans-serif]">
              {m.lbl}
            </div>
          </div>
        ))}
      </div>

      {update.notes && (
        <div className="px-6 py-3 border-t border-[#ede8de] text-[13px] text-[#5c5044] leading-[1.75] font-['Outfit',sans-serif] font-light">
          {update.notes}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-2 px-6 py-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onImageClick(img)}
              className="aspect-square rounded-xl overflow-hidden border border-[#ede8de] cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <img src={img} alt={`Growth ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Submit Modal ─────────────────────────────────────────────
function UpdateModal({ landId, landTitle, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ averageHeightCm: "", survivalRate: 75, healthStatus: "Healthy", notes: "" });
  const [photos, setPhotos] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addFiles = files => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 5 - photos.length);
    const entries = valid.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos(prev => [...prev, ...entries].slice(0, 5));
  };

  const removePhoto = idx => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    if (!form.averageHeightCm) { setError("Please enter approximate tree height."); return; }
    if (!form.healthStatus) { setError("Please select a health status."); return; }
    setError(""); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("averageHeightCm", form.averageHeightCm);
      fd.append("survivalRate", form.survivalRate);
      fd.append("healthStatus", form.healthStatus);
      if (form.notes) fd.append("notes", form.notes);
      photos.forEach(p => fd.append("images", p.file));
      const res = await fetch(`${BASE_URL}/api/lands/${landId}/growth-updates`, {
        method: "POST", credentials: "include", body: fd,
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || `Server error (${res.status})`);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-4 py-3 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4] transition-all";

  return (
    <motion.div
      className="fixed inset-0 bg-[#0b1d10]/70 backdrop-blur-[7px] z-[10001] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-['Outfit',sans-serif]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && !submitting && onClose()}
    >
      <motion.div
        className="bg-[#f7f3ec] w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl my-auto border border-[#ede8de]"
        initial={{ scale: 0.93, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        {/* Header */}
        <div className="relative bg-[#0c1e11] px-7 sm:px-8 pt-7 pb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1e11] via-[#0f2916] to-[#071408]" />
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#4db87a]/10 blur-[70px]" />
          <button
            onClick={onClose} disabled={submitting}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/18 transition-all cursor-pointer flex items-center justify-center text-sm"
          >✕</button>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-3">
              <span className="text-sm">🌱</span>
              <span className="text-[11px] font-semibold tracking-[2px] uppercase text-white/75">{t("auto.auto_177", "Growth Update")}</span>
            </div>
            <h2 className="font-['Cormorant_Garant',serif] text-[24px] sm:text-[26px] font-semibold text-white leading-tight mb-1">
              {t("auto.auto_178", "Submit Growth Update")}
            </h2>
            <p className="text-[13px] text-white/45 font-light">
              {landTitle || "Plantation Site"} — document the current state
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 sm:px-8 py-6 flex flex-col gap-5">

          {/* Health status */}
          <div className="flex flex-col gap-2">
            <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">
              {t("auto.auto_179", "Health Status")} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {HEALTH_OPTIONS.map(h => (
                <button
                  key={h.key} type="button"
                  onClick={() => set("healthStatus", h.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[12px] font-medium cursor-pointer transition-all duration-200 ${form.healthStatus === h.key
                      ? `${h.ring} ${h.color} font-semibold`
                      : "border-[#e0d8cf] bg-white text-[#8a7d6e] hover:border-[#4db87a]/40 hover:text-[#0c1e11]"
                    }`}
                >
                  {h.icon} {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">
                {t("auto.auto_180", "Avg Height (cm)")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number" min="1" placeholder="e.g. 45"
                value={form.averageHeightCm} onChange={e => set("averageHeightCm", e.target.value)}
                className={inputCls}
              />
              <span className="text-[11px] text-[#b5ac9e]">{t("auto.auto_181", "Approximate average height")}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">
                {t("auto.auto_182", "Survival Rate")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="0" max="100"
                  value={form.survivalRate}
                  onChange={e => set("survivalRate", parseInt(e.target.value))}
                  className="flex-1 accent-[#4db87a] h-1.5 rounded-full"
                />
                <span className="font-['Cormorant_Garant',serif] text-[22px] font-semibold text-[#0c1e11] min-w-[48px] text-center">
                  {form.survivalRate}%
                </span>
              </div>
              <span className="text-[11px] text-[#b5ac9e]">{t("auto.auto_183", "% of trees that survived")}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">
              {t("auto.auto_184", "Field Notes")}
            </label>
            <textarea
              placeholder="e.g. New shoots visible on most trees. Some insect damage on the eastern perimeter…"
              value={form.notes} onChange={e => set("notes", e.target.value)}
              className={inputCls + " resize-none min-h-[72px] leading-relaxed"}
            />
          </div>

          {/* Photo uploader */}
          <div>
            <label className="block text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] mb-3">
              {t("auto.auto_185", "Photos")}
              <span className="normal-case tracking-normal font-normal text-[#b5ac9e] ml-2">{t("auto.auto_186", "(up to 5 images)")}</span>
            </label>
            {photos.length < 5 && (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${dragOver ? "border-[#4db87a] bg-emerald-50/60" : "border-[#e0d8cf] bg-[#f2ede3] hover:border-[#4db87a]/50 hover:bg-emerald-50/40"
                  }`}
              >
                <div className="text-3xl mb-2">📸</div>
                <div className="text-[13px] font-medium text-[#5c5044]">{t("auto.auto_187", "Click or drag photos here")}</div>
                <div className="text-[11.5px] text-[#b5ac9e] mt-1">{t("auto.auto_188", "JPG, PNG, WEBP — show the plantation growth")}</div>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => addFiles(e.target.files)} />
              </div>
            )}
            {photos.length > 0 && (
              <div className={`grid grid-cols-5 gap-2 ${photos.length < 5 ? "mt-3" : ""}`}>
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-[1.5px] border-[#e0d8cf]">
                    <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/65 text-white cursor-pointer text-[10px] flex items-center justify-center hover:bg-red-600/80 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200/80 rounded-xl text-[12.5px] text-red-700 font-medium"
              >
                <span>⚠️</span> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 sm:px-8 py-5 border-t border-[#ede8de]">
          <button onClick={onClose} disabled={submitting}
            className="px-5 py-2.5 rounded-xl border-[1.5px] border-[#e0d8cf] bg-white text-[13.5px] font-medium text-[#8a7d6e] hover:border-[#0c1e11] hover:text-[#0c1e11] transition-all cursor-pointer disabled:opacity-50">
            {t("auto.auto_189", "Cancel")}
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0c1e11] text-white text-[13.5px] font-semibold hover:bg-[#163d25] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_4px_16px_rgba(12,30,17,0.2)]">
            {submitting ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("auto.auto_190", "Uploading…")}</>
            ) : "🌱 Submit Update"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function GrowthTracker() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [landInfo, setLandInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedImg, setExpandedImg] = useState(null);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [updRes, landRes] = await Promise.all([
        fetch(`${BASE_URL}/api/lands/${id}/growth-updates`, { credentials: "include" }),
        fetch(`${BASE_URL}/api/lands/${id}`, { credentials: "include" }),
      ]);
      setUpdates(await updRes.json());
      setLandInfo(await landRes.json());
    } catch (err) { console.error("Failed to fetch growth data:", err); }
    finally { setLoading(false); }
  };

  const latestHealth = updates[0]?.healthStatus ?? null;
  const latestSurvival = updates[0]?.survivalRate ?? null;
  const hConf = getHealth(latestHealth);

  return (
    <div className="font-['Outfit',sans-serif] bg-[#f7f3ec] min-h-screen">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0c1e11] pb-14 pt-16 sm:pt-20">
        <div className="absolute top-[-12%] left-[-8%] w-[500px] h-[500px] rounded-full bg-[#163d25] opacity-30 blur-[140px]" />
        <div className="absolute bottom-[-18%] right-[-6%] w-[380px] h-[380px] rounded-full bg-[#c9a84c]/8 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        />

        <div className="relative z-10 max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[12px] font-medium text-white/40 hover:text-white transition-colors mb-7 cursor-pointer bg-none border-none"
          >
            <ArrowLeft size={14} /> {t("auto.auto_191", "Back to site")}
          </button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-px bg-[#4db87a]/50" />
              <span className="text-[10px] font-semibold tracking-[3px] uppercase text-[#4db87a]/70 font-['Outfit',sans-serif]">
                {t("auto.auto_192", "Community Growth Tracker")}
              </span>
            </div>

            <h1 className="font-['Cormorant_Garant',serif] text-[clamp(36px,6vw,68px)] font-semibold text-white leading-[0.92] tracking-[-1px] mb-3">
              {loading
                ? <BoneDark className="h-14 w-1/2 inline-block" />
                : <>{landInfo?.title || "Plantation Site"} —{" "}<em className="not-italic text-[#c9a84c]">{t("auto.auto_193", "Growth Journal")}</em></>
              }
            </h1>

            {landInfo?.nearbyLandmark && (
              <p className="text-[14px] text-white/40 mb-8 max-w-[500px] leading-relaxed font-light">
                📍 {landInfo.nearbyLandmark}
              </p>
            )}
          </motion.div>

          {/* Hero stats */}
          <div className="flex flex-wrap gap-0">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="pr-10 sm:pr-14 mr-10 sm:mr-14 border-r border-white/10 last:border-0 last:pr-0 last:mr-0 mb-6">
                  <BoneDark className="h-12 w-20 mb-2" />
                  <BoneDark className="h-2.5 w-24" />
                </div>
              ))
            ) : (
              [
                { val: updates.length, lbl: "Updates" },
                { val: landInfo?.totalTreesPlanted || 0, lbl: "Trees Planted" },
                { val: latestSurvival != null ? `${latestSurvival}%` : "—", lbl: "Survival Rate" },
              ].map((s, i) => (
                <motion.div
                  key={s.lbl}
                  className="pr-10 sm:pr-14 mr-10 sm:mr-14 border-r border-white/10 last:border-0 last:pr-0 last:mr-0 mb-6"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="font-['Cormorant_Garant',serif] text-[clamp(36px,5vw,56px)] font-semibold text-white leading-none tracking-[-1px]">
                    {s.val}
                  </div>
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/35 mt-2 font-['Outfit',sans-serif]">
                    {s.lbl}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── STICKY ACTION BAR ── */}
      <div className="sticky top-0 z-50 bg-[#f2ede3] border-b border-[#e0d8cf]">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16 h-[58px] flex items-center justify-between">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#b5ac9e] font-['Outfit',sans-serif]">
            {loading ? "Loading…" : `${updates.length} Update${updates.length !== 1 ? "s" : ""}`}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-[#0c1e11] text-[#f7f3ec] text-[12px] font-semibold font-['Outfit',sans-serif] cursor-pointer hover:bg-[#163d25] transition-all duration-200 shadow-[0_2px_12px_rgba(12,30,17,0.2)]"
          >
            <Plus size={13} /> {t("auto.auto_194", "Submit Update")}
          </button>
        </div>
      </div>

      {/* ── CHART ── */}
      {!loading && updates.length >= 2 && (
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16 pt-12 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b5ac9e] font-['Outfit',sans-serif] whitespace-nowrap">
              {t("auto.auto_195", "Growth Progression")}
            </span>
            <div className="flex-1 h-px bg-[#e0d8cf]" />
          </div>
          <div className="bg-white border border-[#ede8de] rounded-2xl p-6 sm:p-8">
            <GrowthChart updates={[...updates].reverse()} />
          </div>
        </div>
      )}

      {/* ── TIMELINE ── */}
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 xl:px-16 py-10 sm:py-14 pb-24">
        <div className="flex items-center gap-4 mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b5ac9e] font-['Outfit',sans-serif] whitespace-nowrap">
            Timeline · {updates.length} entries
          </span>
          <div className="flex-1 h-px bg-[#e0d8cf]" />
        </div>

        {loading ? (
          <div className="flex flex-col gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#ede8de] rounded-2xl p-6 flex flex-col gap-3">
                <Bone className="h-3.5 w-36" />
                <Bone className="h-20 w-full" />
                <Bone className="h-3.5 w-3/5" />
              </div>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f2ede3] border border-[#ede8de] flex items-center justify-center">
              <Sprout size={28} strokeWidth={1} className="text-[#b5ac9e]" />
            </div>
            <div>
              <h3 className="font-['Cormorant_Garant',serif] text-[28px] font-semibold text-[#0c1e11] mb-2">
                {t("auto.auto_196", "No growth updates yet")}
              </h3>
              <p className="text-[13.5px] text-[#b5ac9e] max-w-xs leading-relaxed font-light mb-6">
                {t("auto.auto_197", "Be the first to document how this plantation is growing!")}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#0c1e11] text-[#f7f3ec] text-[13px] font-semibold font-['Outfit',sans-serif] cursor-pointer hover:bg-[#163d25] transition-all"
              >
                <Plus size={13} /> {t("auto.auto_198", "Submit First Update")}
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            className="relative pl-0"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {/* Vertical timeline line */}
            <div className="absolute left-[4px] top-0 bottom-0 w-px bg-gradient-to-b from-[#0c1e11] to-[#e0d8cf] rounded-full" />

            <div className="flex flex-col gap-6">
              {updates.map((u, idx) => (
                <TimelineCard key={u.id || idx} update={u} onImageClick={setExpandedImg} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {showModal && (
          <UpdateModal
            landId={id}
            landTitle={landInfo?.title}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedImg && (
          <motion.div
            className="fixed inset-0 bg-black/92 z-[2000] flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setExpandedImg(null)}
          >
            <button
              onClick={() => setExpandedImg(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <motion.img
              src={expandedImg} alt=""
              className="max-w-[90%] max-h-[90vh] rounded-2xl object-contain shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}