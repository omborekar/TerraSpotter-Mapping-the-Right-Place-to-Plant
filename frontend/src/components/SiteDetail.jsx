/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Site detail page — Verdant Editorial redesign. Cormorant Garant + Outfit.
*/
import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import LoadingSpinner from "./ui/LoadingSpinner";
import PlantationForm from "./PlantationForm.jsx";
import CompletePlantationModal from "./CompletePlantationModal.jsx";

const BASE_URL = import.meta.env.VITE_API_URL;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── Status chip ──────────────────────────────────────────────
function Chip({ children, variant = "green" }) {
  const cls = {
    green: "bg-emerald-50  text-emerald-800  border-emerald-200/80",
    amber: "bg-amber-50   text-amber-800   border-amber-200/80",
    blue: "bg-sky-50     text-sky-800     border-sky-200/80",
    gray: "bg-[#f7f3ec]  text-[#8a7d6e]  border-[#e0d8cf]",
    red: "bg-red-50     text-red-700     border-red-200/80",
    purple: "bg-violet-50  text-violet-800  border-violet-200/80",
  }[variant] || "bg-[#f7f3ec] text-[#8a7d6e] border-[#e0d8cf]";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold font-['Outfit',sans-serif] ${cls}`}>
      {children}
    </span>
  );
}

// ─── Star rating ──────────────────────────────────────────────
function StarRating({ value, onChange, readOnly = false, size = 26 }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor – not feasible", "Unlikely – needs work", "Possible with effort", "Good – recommended", "Excellent – perfect site"];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n}
            onClick={() => !readOnly && onChange?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            style={{ fontSize: size }}
            className={`bg-none border-none p-0 leading-none transition-all duration-100 ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} ${(hover || value) >= n ? "" : "grayscale opacity-30"}`}
          >⭐</button>
        ))}
      </div>
      {!readOnly && (hover || value) > 0 && (
        <span className="text-[11.5px] text-[#6b5e4e] italic font-['Outfit',sans-serif]">{labels[hover || value]}</span>
      )}
    </div>
  );
}

// ─── Mini stars ───────────────────────────────────────────────
function MiniStars({ value = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className="text-[13px]" style={{ filter: n <= Math.round(value) ? "none" : "grayscale(1) opacity(.3)" }}>⭐</span>
      ))}
      <span className="text-[12px] text-[#b5ac9e] ml-1 font-['Outfit',sans-serif]">
        {value > 0 ? `${value} (${count})` : "No reviews yet"}
      </span>
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────
const InfoRow = ({ label, value }) => value ? (
  <div className="flex flex-col gap-1 py-3 border-b border-[#f0ebe2] last:border-0">
    <span className="text-[10.5px] font-semibold uppercase tracking-[0.8px] text-[#b5ac9e] font-['Outfit',sans-serif]">{label}</span>
    <span className="text-[13.5px] font-medium text-[#0c1e11] font-['Outfit',sans-serif]">{value}</span>
  </div>
) : null;

// ─── Write review ─────────────────────────────────────────────
function WriteReview({ landId, onPosted }) {
  const [form, setForm] = useState({ rating: 0, feasibilityNote: "", permissionNote: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = "w-full px-4 py-2.5 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4] transition-all appearance-none";

  const handlePost = async () => {
    if (!form.rating) { setError("Please select a star rating."); return; }
    setError(""); setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/lands/${landId}/reviews`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const b = await res.json().catch(() => { }); throw new Error(b?.error || b?.message || `Error ${res.status}`); }
      const created = await res.json();
      onPosted?.(created);
      setForm({ rating: 0, feasibilityNote: "", permissionNote: "", body: "" });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-[#f7f3ec] border border-[#ede8de] rounded-2xl p-5 sm:p-6">
      <h3 className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#0c1e11] mb-1">✍️ Write a Review</h3>
      <p className="text-[12.5px] text-[#8a7d6e] mb-5 font-light">Rate this site's feasibility and share your on-ground experience</p>

      <div className="mb-4">
        <label className="block text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating value={form.rating} onChange={v => set("rating", v)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">Feasibility Note</label>
          <select className={inputCls} value={form.feasibilityNote} onChange={e => set("feasibilityNote", e.target.value)}>
            <option value="">— Select —</option>
            {["Highly feasible", "Feasible with preparation", "Needs soil treatment", "Water access issue", "Not feasible currently"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">Permission Status</label>
          <select className={inputCls} value={form.permissionNote} onChange={e => set("permissionNote", e.target.value)}>
            <option value="">— Select —</option>
            {["Permission confirmed", "Permission in process", "Verbal permission only", "No permission yet", "Government / public land"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-1.5">
        <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">Detailed Review</label>
        <textarea className={inputCls + " resize-none min-h-[80px] leading-relaxed"}
          placeholder="Describe the site conditions, access, soil quality, what you observed…"
          value={form.body} onChange={e => set("body", e.target.value)} />
      </div>

      {error && <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200/80 rounded-xl text-[12px] text-red-700 font-medium font-['Outfit',sans-serif]">⚠️ {error}</div>}
      {success && <div className="mb-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[12px] text-emerald-700 font-semibold font-['Outfit',sans-serif]">✅ Review posted!</div>}

      <button onClick={handlePost} disabled={submitting || !form.rating}
        className="mt-1 px-6 py-2.5 rounded-xl bg-[#0c1e11] text-white text-[13px] font-semibold font-['Outfit',sans-serif] cursor-pointer hover:bg-[#163d25] disabled:opacity-45 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
        {submitting ? "Posting…" : "Post Review →"}
      </button>
    </div>
  );
}

// ─── Refresh icon ─────────────────────────────────────────────
const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const TAB_DETAILS = "details";
const TAB_REVIEWS = "reviews";

// ─── Main ─────────────────────────────────────────────────────
export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [land, setLand] = useState(null);
  const [images, setImages] = useState([]);
  const [recs, setRecs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryIdx, setGalleryIdx] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_DETAILS);
  const [plantOpen, setPlantOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [refreshSt, setRefreshSt] = useState("idle");
  const [refreshErr, setRefreshErr] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`${BASE_URL}/api/lands/${id}`, { credentials: "include" }).then(r => r.json()),
      fetch(`${BASE_URL}/api/lands/${id}/images`, { credentials: "include" }).then(r => r.json()).catch(() => []),
      fetch(`${BASE_URL}/api/lands/${id}/recommendations`, { credentials: "include" }).then(r => r.json()).catch(() => []),
      fetch(`${BASE_URL}/api/lands/${id}/reviews`, { credentials: "include" }).then(r => r.json()).catch(() => []),
    ]).then(([l, imgs, rec, rv]) => {
      setLand(l); setImages(Array.isArray(imgs) ? imgs : []);
      setRecs(Array.isArray(rec) ? rec : []); setReviews(Array.isArray(rv) ? rv : []);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleRefreshRecs = async () => {
    if (refreshSt === "loading") return;
    setRefreshSt("loading"); setRefreshErr("");
    try {
      const res = await fetch(`${BASE_URL}/api/lands/${id}/recommendations/refresh`, { method: "POST", credentials: "include" });
      if (!res.ok) { const b = await res.json().catch(() => { }); throw new Error(b?.message || `Error ${res.status}`); }
      const updated = await fetch(`${BASE_URL}/api/lands/${id}/recommendations`, { credentials: "include" }).then(r => r.json()).catch(() => []);
      setRecs(Array.isArray(updated) ? updated : []); setRefreshSt("success");
      timerRef.current = setTimeout(() => setRefreshSt("idle"), 3000);
    } catch (err) {
      setRefreshErr(err.message || "Could not refresh."); setRefreshSt("error");
      timerRef.current = setTimeout(() => { setRefreshSt("idle"); setRefreshErr(""); }, 5000);
    }
  };

  const approxTrees = land?.areaSqm ? Math.floor(land.areaSqm / 20) : null;
  const hasMap = land?.centroidLat && land?.centroidLng;
  const isUnderPlant = land?.landStatus === "Under Plantation";
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0;

  if (loading) return <LoadingSpinner text="Loading site details…" />;
  if (!land) return (
    <div className="min-h-screen bg-[#f7f3ec] flex flex-col items-center justify-center gap-4 font-['Outfit',sans-serif]">
      <p className="text-red-500 text-sm">Land not found.</p>
      <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-xl bg-[#0c1e11] text-white text-sm font-semibold cursor-pointer">← Go back</button>
    </div>
  );

  const inputSelCls = "w-full px-4 py-2.5 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none font-['Outfit',sans-serif] focus:border-[#4db87a] hover:border-[#c8bfb4] transition-all appearance-none";

  return (
    <>
      <Helmet>
        <title>{land?.title ? `${land.title} — TerraSpotter` : "Land details — TerraSpotter"}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="min-h-screen bg-[#f7f3ec] font-['Outfit',sans-serif]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10 pb-24">

          {/* Back */}
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#b5ac9e] hover:text-[#0c1e11] transition-colors mb-7 cursor-pointer bg-none border-none">
            ← Back to browse
          </button>

          {/* Hero */}
          <motion.div className="mb-7 flex items-start justify-between gap-5 flex-wrap"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col gap-3">
              <h1 className="font-['Cormorant_Garant',serif] text-[clamp(28px,4.5vw,48px)] font-semibold text-[#0c1e11] leading-[0.95] tracking-[-0.5px]">
                {land.title || "Unnamed Land"}
              </h1>
              {land.centroidLat && (
                <p className="text-[12.5px] text-[#b5ac9e]">📍 {land.centroidLat.toFixed(5)}, {land.centroidLng.toFixed(5)}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                {land.landStatus && (
                  <Chip variant={land.landStatus === "Barren" ? "amber" : land.landStatus === "Under Plantation" ? "purple" : land.landStatus === "Plantation Complete" ? "blue" : "green"}>
                    {land.landStatus}
                  </Chip>
                )}
                {land.status && (
                  <Chip variant={land.status === "APPROVED" ? "green" : land.status === "REJECTED" ? "red" : "amber"}>
                    {land.status === "APPROVED" ? "✓ Verified" : land.status === "REJECTED" ? "✗ Rejected" : "⏳ Pending"}
                  </Chip>
                )}
                {land.permissionStatus && (
                  <Chip variant={land.permissionStatus.toLowerCase().includes("yes") ? "green" : "gray"}>
                    {land.permissionStatus}
                  </Chip>
                )}
              </div>
              <MiniStars value={Number(avgRating)} count={reviews.length} />
            </div>

            <div className="flex flex-col gap-2">
              {isUnderPlant ? (
                <button onClick={() => setCompleteOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#0c1e11] text-white text-[13.5px] font-semibold cursor-pointer hover:opacity-90 transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(12,30,17,0.2)] flex items-center gap-2">
                  ✅ Mark Plantation Complete
                </button>
              ) : land.landStatus !== "Plantation Complete" ? (
                <button onClick={() => setPlantOpen(true)}
                  className="px-5 py-3 rounded-xl bg-[#0c1e11] text-white text-[13.5px] font-semibold cursor-pointer hover:bg-[#163d25] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(12,30,17,0.2)]">
                  🌱 I want to plant here
                </button>
              ) : null}
            </div>
          </motion.div>

          {/* Status banners */}
          {land.landStatus === "Under Plantation" && (
            <div className="flex items-center gap-3 px-5 py-3.5 mb-6 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[13.5px] text-emerald-800 font-medium">
              <span className="text-xl">🌿</span>
              <div>
                <strong>Plantation in progress</strong>
                {land.plantationDetail && (
                  <span className="ml-2 font-normal text-emerald-700">
                    — {land.plantationDetail.teamSize} volunteers · {land.plantationDetail.treesToPlant} trees planned
                  </span>
                )}
              </div>
            </div>
          )}
          {land.landStatus === "Plantation Complete" && (
            <div className="flex items-center gap-3 px-5 py-3.5 mb-6 bg-sky-50 border border-sky-200/80 rounded-xl text-[13.5px] text-sky-800 font-medium">
              <span className="text-xl">🎉</span>
              <strong>Plantation complete!</strong>
              {land.completionDetail && (
                <span className="font-normal ml-1">— {land.completionDetail.treesPlanted} trees planted</span>
              )}
            </div>
          )}

          {/* Gallery */}
          {images.length === 0 ? (
            <div className="h-[200px] rounded-2xl bg-[#f2ede3] border border-[#ede8de] flex flex-col items-center justify-center gap-2 mb-7">
              <span className="text-3xl opacity-30">📷</span>
              <span className="text-[13px] text-[#b5ac9e]">No photos uploaded yet</span>
            </div>
          ) : (
            <motion.div
              className={`grid gap-2 mb-7 rounded-2xl overflow-hidden ${images.length === 1 ? "grid-cols-1" :
                  images.length === 2 ? "grid-cols-2" :
                    "grid-cols-[2fr_1fr] grid-rows-[200px_200px]"
                }`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
            >
              {images.slice(0, 3).map((img, i) => (
                <div key={img.id}
                  className={`relative overflow-hidden cursor-pointer bg-[#e8f0ec] ${i === 1 && images.length > 2 ? "row-start-1 col-start-2" :
                      i === 2 ? "row-start-2 col-start-2" : ""
                    }`}
                  onClick={() => setGalleryIdx(i)}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = "https://via.placeholder.com/600x400/f2ede3/0c1e11?text=🌿"; }} />
                  {i === 2 && images.length > 3 && (
                    <div className="absolute inset-0 bg-[#0c1e11]/65 flex items-center justify-center font-['Cormorant_Garant',serif] text-[32px] font-semibold text-white backdrop-blur-[2px]">
                      +{images.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-0 border-b border-[#e0d8cf] mb-6">
            {[
              { key: TAB_DETAILS, label: "🌍 Details" },
              { key: TAB_REVIEWS, label: `⭐ Reviews${reviews.length > 0 ? ` (${reviews.length})` : ""}` },
            ].map(t => (
              <button key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-3 text-[13.5px] font-semibold border-b-2 -mb-px transition-all duration-150 cursor-pointer font-['Outfit',sans-serif] ${activeTab === t.key
                    ? "text-[#0c1e11] border-[#0c1e11]"
                    : "text-[#b5ac9e] border-transparent hover:text-[#0c1e11]"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Body grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-5 items-start">

            {/* LEFT */}
            <div>
              <AnimatePresence mode="wait">

                {activeTab === TAB_DETAILS && (
                  <motion.div key="details"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .22 }}>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      {[
                        { icon: "📐", lbl: "Area", val: land.areaSqm ? `${Number(land.areaSqm).toLocaleString()} m²` : "—" },
                        { icon: "🌱", lbl: "Est. Trees", val: approxTrees ? `~${approxTrees}` : "—" },
                        { icon: "💧", lbl: "Water", val: land.waterAvailable || "—" },
                        { icon: "🔁", lbl: "Frequency", val: land.waterFrequency || "—" },
                      ].map(s => (
                        <div key={s.lbl} className="bg-white border border-[#ede8de] rounded-xl p-4 flex items-start gap-3">
                          <span className="text-lg">{s.icon}</span>
                          <div>
                            <div className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#0c1e11] leading-none">{s.val}</div>
                            <div className="text-[9.5px] font-semibold uppercase tracking-[0.8px] text-[#b5ac9e] mt-1">{s.lbl}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Land details */}
                    <div className="bg-white border border-[#ede8de] rounded-2xl p-5 sm:p-6 mb-5">
                      <div className="flex items-center gap-3 pb-4 border-b border-[#f0ebe2] mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-base shrink-0">🌍</div>
                        <div>
                          <h3 className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#0c1e11]">Land Details</h3>
                          <p className="text-[12px] text-[#b5ac9e] font-light">Physical characteristics and access info</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <InfoRow label="Land Status" value={land.landStatus} />
                        <InfoRow label="Ownership" value={land.ownershipType} />
                        <InfoRow label="Road Access" value={land.accessRoad} />
                        <InfoRow label="Fencing" value={land.fencing} />
                        <InfoRow label="Soil Type" value={land.soilType} />
                        <InfoRow label="Nearby Landmark" value={land.nearbyLandmark} />
                        <InfoRow label="Owner Name" value={land.ownerName} />
                        <InfoRow label="Owner Phone" value={land.ownerPhone} />
                      </div>
                      {land.notes && (
                        <div className="mt-4 px-4 py-3 bg-[#f7f3ec] rounded-xl border-l-4 border-[#4db87a]/50 text-[13px] text-[#6b5e4e] italic leading-relaxed font-light">
                          "{land.notes}"
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white border border-[#ede8de] rounded-2xl p-5 sm:p-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-[#f0ebe2] mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-base shrink-0">🌿</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#0c1e11]">Recommended Species</h3>
                          <p className="text-[12px] text-[#b5ac9e] font-light">ML-powered, based on soil, water & climate</p>
                        </div>
                        <button
                          onClick={handleRefreshRecs}
                          disabled={refreshSt === "loading"}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[12px] font-semibold cursor-pointer transition-all shrink-0 ${refreshSt === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : refreshSt === "error" ? "border-red-300 bg-red-50 text-red-600"
                                : refreshSt === "loading" ? "border-[#e0d8cf] text-[#b5ac9e] cursor-not-allowed"
                                  : "border-[#e0d8cf] bg-white text-[#0c1e11] hover:border-[#4db87a] hover:bg-emerald-50"
                            }`}
                        >
                          {refreshSt === "loading" && <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
                          {refreshSt === "success" && "✓"}
                          {refreshSt === "error" && "✕"}
                          {refreshSt === "idle" && <RefreshIcon />}
                          {refreshSt === "loading" ? "Refreshing…" : refreshSt === "success" ? "Updated!" : refreshSt === "error" ? "Failed" : "Refresh"}
                        </button>
                      </div>

                      {refreshSt === "error" && refreshErr && (
                        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200/80 rounded-xl text-[12px] text-red-700">⚠️ {refreshErr}</div>
                      )}

                      {refreshSt === "loading" ? (
                        <div className="flex flex-col gap-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-14 rounded-xl bg-gradient-to-r from-[#f0ebe2] via-[#e8e2d8] to-[#f0ebe2] bg-[length:200%_100%] animate-pulse" />
                          ))}
                        </div>
                      ) : recs.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-[#e0d8cf] rounded-xl">
                          <span className="text-3xl block mb-2 opacity-40">🌱</span>
                          <p className="text-[13px] text-[#b5ac9e]">No recommendations yet.<br />Click Refresh to fetch from ML model.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {recs.map((r, idx) => (
                            <div key={r.id ?? idx} className="flex items-center gap-3 px-4 py-3 bg-[#f7f3ec] border border-[#ede8de] rounded-xl">
                              <div className="flex-1 min-w-0">
                                <div className="text-[13.5px] font-semibold text-[#0c1e11]">{r.plantName}</div>
                                {r.reason && <div className="text-[11.5px] text-[#b5ac9e] font-light mt-0.5 truncate">{r.reason}</div>}
                              </div>
                              {r.suitabilityScore != null && (
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#2d8a55]">
                                    {Math.round(r.suitabilityScore * 100)}%
                                  </span>
                                  <div className="w-14 h-1 bg-[#e0d8cf] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#4db87a] rounded-full" style={{ width: `${r.suitabilityScore * 100}%` }} />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === TAB_REVIEWS && (
                  <motion.div key="reviews"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .22 }}>
                    <div className="bg-white border border-[#ede8de] rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="font-['Cormorant_Garant',serif] text-[20px] font-semibold text-[#0c1e11]">⭐ Community Reviews</h3>
                          <p className="text-[12px] text-[#b5ac9e] mt-0.5 font-light">Feasibility & permission assessments from the field</p>
                        </div>
                        <Link to={`/lands/${id}/reviews`} className="text-[12.5px] font-semibold text-[#4db87a] no-underline hover:text-[#2d8a55] transition-colors">
                          See all ↗
                        </Link>
                      </div>

                      {reviews.length > 0 && (
                        <div className="flex items-center gap-5 px-5 py-4 bg-[#f7f3ec] border border-[#ede8de] rounded-xl flex-wrap">
                          <div className="font-['Cormorant_Garant',serif] text-[44px] font-semibold text-[#0c1e11] leading-none">{avgRating}</div>
                          <div>
                            <MiniStars value={Number(avgRating)} count={reviews.length} />
                            <div className="text-[11px] text-[#b5ac9e] mt-1">avg. community rating</div>
                          </div>
                        </div>
                      )}

                      {reviews.length === 0 ? (
                        <div className="text-center py-8 text-[13.5px] text-[#b5ac9e]">
                          <span className="text-3xl block mb-2 opacity-40">🌿</span>
                          No reviews yet — be the first to assess this site!
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {reviews.slice(0, 3).map((rv, i) => (
                            <div key={rv.id ?? i} className="bg-[#f7f3ec] border border-[#ede8de] rounded-xl p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                  {rv.userName?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-semibold text-[#0c1e11]">{rv.userName || "Anonymous"}</div>
                                  <div className="text-[11px] text-[#b5ac9e]">
                                    {rv.createdAt ? new Date(rv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                                  </div>
                                </div>
                                <MiniStars value={rv.rating || 0} />
                              </div>
                              <div className="flex gap-1.5 flex-wrap mb-2">
                                {rv.feasibilityNote && <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700">✅ {rv.feasibilityNote}</span>}
                                {rv.permissionNote && <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700">🔐 {rv.permissionNote}</span>}
                              </div>
                              {rv.body && <p className="text-[12.5px] text-[#6b5e4e] italic leading-relaxed border-l-2 border-[#4db87a]/40 pl-3 font-light">"{rv.body}"</p>}
                            </div>
                          ))}
                          {reviews.length > 3 && (
                            <Link to={`/lands/${id}/reviews`} className="text-center text-[13px] text-[#4db87a] font-semibold no-underline py-2 hover:text-[#2d8a55] transition-colors">
                              + {reviews.length - 3} more reviews — view all ↗
                            </Link>
                          )}
                        </div>
                      )}

                      <div className="border-t border-[#ede8de] pt-5">
                        <WriteReview landId={id} onPosted={created => setReviews(prev => [created, ...prev])} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT SIDEBAR */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}>
              <div className="bg-white border border-[#ede8de] rounded-2xl overflow-hidden">
                {hasMap ? (
                  <div className="h-[220px]">
                    <MapContainer center={[land.centroidLat, land.centroidLng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                      <Marker position={[land.centroidLat, land.centroidLng]} />
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-[140px] bg-[#f2ede3] flex items-center justify-center text-[13px] text-[#b5ac9e]">📍 No coordinates</div>
                )}

                <div className="p-5 flex flex-col gap-0">
                  {[
                    { key: "Status", val: land.status || "PENDING" },
                    { key: "Area", val: land.areaSqm ? `${Number(land.areaSqm).toLocaleString()} m²` : "—" },
                    { key: "Est. trees", val: approxTrees ? `~${approxTrees}` : "—" },
                    { key: "Submitted", val: land.createdAt ? new Date(land.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                    ...(reviews.length > 0 ? [{ key: "Rating", val: `${avgRating} ⭐ (${reviews.length})` }] : []),
                  ].map(r => (
                    <div key={r.key} className="flex items-center justify-between py-2.5 border-b border-[#f0ebe2] last:border-0 text-[13px]">
                      <span className="text-[#b5ac9e]">{r.key}</span>
                      <span className="font-medium text-[#0c1e11]">{r.val}</span>
                    </div>
                  ))}
                </div>

                <div className="px-5 pb-5 flex flex-col gap-2.5">
                  {isUnderPlant ? (
                    <button onClick={() => setCompleteOpen(true)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#0c1e11] text-white text-[13.5px] font-semibold cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-2">
                      ✅ Mark Plantation Complete
                    </button>
                  ) : land.landStatus !== "Plantation Complete" ? (
                    <button onClick={() => setPlantOpen(true)}
                      className="w-full py-3.5 rounded-xl bg-[#0c1e11] text-white text-[13.5px] font-semibold cursor-pointer hover:bg-[#163d25] transition-all">
                      🌱 I want to plant here
                    </button>
                  ) : null}

                  <button
                    onClick={() => { navigator.clipboard?.writeText(window.location.href); alert("Link copied!"); }}
                    className="w-full py-3 rounded-xl border border-[#e0d8cf] bg-white text-[#0c1e11] text-[13px] font-medium cursor-pointer hover:border-[#0c1e11] transition-all">
                    🔗 Share this land
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {galleryIdx !== null && (
          <motion.div className="fixed inset-0 bg-black/93 z-[99999] flex flex-col items-center justify-center p-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setGalleryIdx(null)}>
            <button onClick={() => setGalleryIdx(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
              ✕
            </button>
            <div className="relative max-w-4xl w-full flex items-center justify-center flex-1 gap-4">
              {galleryIdx > 0 && (
                <button className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center text-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/15"
                  onClick={() => setGalleryIdx(i => i - 1)}>‹</button>
              )}
              <motion.img key={galleryIdx} src={images[galleryIdx]?.imageUrl}
                className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl flex-1"
                initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .18 }}
                onError={e => { e.target.src = "https://via.placeholder.com/800x600?text=🌿"; }} />
              {galleryIdx < images.length - 1 && (
                <button className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center text-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/15"
                  onClick={() => setGalleryIdx(i => i + 1)}>›</button>
              )}
            </div>
            <p className="text-white/30 text-[12px] mt-3 mb-3">{galleryIdx + 1} / {images.length}</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setGalleryIdx(i)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${i === galleryIdx ? "border-[#4db87a] opacity-100 scale-105" : "border-transparent opacity-40 hover:opacity-70"}`}>
                  <img src={img.imageUrl} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {plantOpen && (
          <PlantationForm land={land} onClose={() => setPlantOpen(false)}
            onSuccess={() => { setPlantOpen(false); setLand(l => ({ ...l, landStatus: "Under Plantation" })); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completeOpen && (
          <CompletePlantationModal land={land} onClose={() => setCompleteOpen(false)}
            onSuccess={() => { setCompleteOpen(false); setLand(l => ({ ...l, landStatus: "Plantation Complete" })); }} />
        )}
      </AnimatePresence>
    </>
  );
}