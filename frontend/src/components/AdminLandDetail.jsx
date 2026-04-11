/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Admin detail view — Verdant Editorial redesign. Cormorant Garant + Outfit.
*/
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;

const STATUS_CFG = {
  PENDING: { dot: "bg-amber-400", text: "text-amber-400", ring: "bg-amber-400/10  border-amber-400/25", label: "Pending Review" },
  APPROVED: { dot: "bg-[#4db87a]", text: "text-[#4db87a]", ring: "bg-[#4db87a]/10  border-[#4db87a]/25", label: "Approved" },
  REJECTED: { dot: "bg-red-400", text: "text-red-400", ring: "bg-red-400/10    border-red-400/25", label: "Rejected" },
};

// ─── Skeleton bone ────────────────────────────────────────────
const Bone = ({ className = "" }) => (
  <div className={`rounded bg-gradient-to-r from-white/[0.04] via-white/[0.09] to-white/[0.04] bg-[length:200%_100%] animate-pulse ${className}`} />
);

function SkeletonDetail() {
  return (
    <div className="min-h-screen bg-[#0b1d10] font-['Outfit',sans-serif] px-6 sm:px-10 py-10 max-w-[1220px] mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <Bone className="h-9 w-36" />
        <div className="flex gap-2">
          <Bone className="h-7 w-28 rounded-full" />
          <Bone className="h-7 w-14 rounded-lg" />
        </div>
      </div>
      <Bone className="h-10 w-1/2 mb-3" />
      <Bone className="h-4 w-40 mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div className="flex flex-col gap-4">
          <Bone className="h-[340px] rounded-2xl" />
          <Bone className="h-24 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-3">
          {[160, 180, 130, 110].map((h, i) => <Bone key={i} className={`h-[${h}px] rounded-2xl`} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Data row ─────────────────────────────────────────────────
function DataRow({ label, value }) {
  if (!value && value !== false && value !== 0) return null;
  return (
    <div className="flex gap-3 items-start py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="font-['Outfit',sans-serif] text-[9.5px] font-semibold tracking-[0.18em] uppercase text-white/30 min-w-[88px] pt-[2px] shrink-0">
        {label}
      </span>
      <span className="font-['Outfit',sans-serif] text-[13px] font-medium text-white/80 leading-relaxed">
        {String(value)}
      </span>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────
function Panel({ title, children }) {
  return (
    <div className="bg-[#0f2916] border border-white/[0.07] rounded-2xl p-5">
      <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[#4db87a]/70 font-['Outfit',sans-serif] mb-3 pb-3 border-b border-white/[0.06]">
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div className="bg-[#0f2916] border border-white/[0.07] rounded-2xl p-5 sm:p-6">
      <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/30 font-['Outfit',sans-serif] mb-4 pb-3 border-b border-white/[0.06]">
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AdminLandDetail({ landId, user, onBack, onVote, voting: externalVoting }) {
  const [land, setLand] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [voting, setVoting] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${BASE_URL}/api/lands/${landId}`, { withCredentials: true }),
      axios.get(`${BASE_URL}/api/lands/${landId}/images`, { withCredentials: true }).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/api/lands/${landId}/recommendations`, { withCredentials: true }).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/api/lands/${landId}/reviews`, { withCredentials: true }).catch(() => ({ data: [] })),
    ])
      .then(([landRes, imgRes, recRes, revRes]) => {
        setLand(landRes.data);
        setImages(Array.isArray(imgRes.data) ? imgRes.data : []);
        setRecommendations(Array.isArray(recRes.data) ? recRes.data : []);
        setReviews(Array.isArray(revRes.data) ? revRes.data : []);
      })
      .catch(() => setError("Failed to load land details."))
      .finally(() => setLoading(false));
  }, [landId]);

  const handleVote = async (vote) => {
    setVoting(v => ({ ...v, [landId]: vote }));
    try {
      await axios.post(`${BASE_URL}/lands/${landId}/verify`, null, { withCredentials: true, params: { vote, userId: user.id } });
      const res = await axios.get(`${BASE_URL}/api/lands/${landId}`, { withCredentials: true });
      setLand(res.data);
      if (onVote) onVote(landId, vote);
    } catch { alert("Error processing vote"); }
    finally { setVoting(v => ({ ...v, [landId]: null })); }
  };

  if (loading) return <SkeletonDetail />;

  if (error) return (
    <div className="min-h-screen bg-[#0b1d10] flex flex-col items-center justify-center gap-4 font-['Outfit',sans-serif]">
      <span className="text-5xl">⚠️</span>
      <p className="text-red-400 text-sm">{error}</p>
      <button
        onClick={onBack}
        className="px-5 py-2.5 rounded-xl bg-[#0f2916] border border-white/12 text-white/70 text-sm font-medium hover:text-white hover:border-white/25 transition-all cursor-pointer"
      >
        ← Back to Queue
      </button>
    </div>
  );

  const imageUrls = images.map(i => i.imageUrl);
  const st = STATUS_CFG[land.status] || STATUS_CFG.PENDING;
  const isVoting = voting[landId] || externalVoting?.[landId];

  return (
    <div className="min-h-screen bg-[#0b1d10] font-['Outfit',sans-serif]">
      <div className="max-w-[1220px] mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10 pb-24">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f2916] border border-white/10 rounded-xl text-[12.5px] font-medium text-white/60 hover:text-white hover:border-[#4db87a]/30 hover:bg-[#4db87a]/8 transition-all duration-200 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Queue
          </button>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-semibold ${st.ring}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
              <span className={st.text}>{st.label}</span>
            </span>
            <span className="font-['Outfit',sans-serif] text-[10.5px] text-white/30 bg-[#0f2916] border border-white/[0.07] px-2.5 py-1 rounded-lg">
              #{land.id}
            </span>
          </div>
        </div>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-['Cormorant_Garant',serif] text-[clamp(26px,4.5vw,44px)] font-semibold text-white leading-[0.95] tracking-[-0.5px] mb-2">
            {land.title || "Untitled Land"}
          </h1>
          {land.nearbyLandmark && (
            <p className="text-[11.5px] text-white/35 tracking-wide font-['Outfit',sans-serif]">
              📍 {land.nearbyLandmark}
            </p>
          )}
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-5 items-start">

          {/* LEFT column */}
          <div className="flex flex-col gap-4">

            {/* Gallery */}
            {imageUrls.length > 0 ? (
              <div className="bg-[#0f2916] border border-white/[0.07] rounded-2xl overflow-hidden">
                {/* Main image */}
                <div className="relative h-[300px] sm:h-[380px] bg-[#0c1e11]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={imageUrls[activeImg]}
                      alt={`Land ${activeImg + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      onError={e => { e.target.src = "https://via.placeholder.com/800x400/0c1e11/4db87a?text=🌿"; }}
                    />
                  </AnimatePresence>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1e11]/50 to-transparent pointer-events-none" />

                  {/* Counter pill */}
                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10.5px] font-semibold px-3 py-1 rounded-full font-['Outfit',sans-serif]">
                    {activeImg + 1} / {imageUrls.length}
                  </span>

                  {/* Prev / next */}
                  {activeImg > 0 && (
                    <button
                      onClick={() => setActiveImg(i => i - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-black/55 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-black/75 transition-all cursor-pointer"
                    >
                      ‹
                    </button>
                  )}
                  {activeImg < imageUrls.length - 1 && (
                    <button
                      onClick={() => setActiveImg(i => i + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-black/55 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-black/75 transition-all cursor-pointer"
                    >
                      ›
                    </button>
                  )}
                </div>

                {/* Thumbnails */}
                {imageUrls.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto [&::-webkit-scrollbar]:hidden bg-[#0c1e11]/50">
                    {imageUrls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all duration-200 ${activeImg === i ? "border-[#4db87a] opacity-100" : "border-transparent opacity-45 hover:opacity-75"
                          }`}
                      >
                        <img
                          src={url}
                          alt={`thumb-${i}`}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = "https://via.placeholder.com/80x64/0c1e11/4db87a?text=🌿"; }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#0f2916] border border-white/[0.07] rounded-2xl h-[220px] flex flex-col items-center justify-center gap-3">
                <span className="text-4xl opacity-20">🌍</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-white/25 font-['Outfit',sans-serif]">No images uploaded</span>
              </div>
            )}

            {/* Description */}
            {land.description && (
              <SectionCard title="Description">
                <p className="text-[13.5px] text-white/50 leading-[1.8] font-light font-['Outfit',sans-serif]">
                  {land.description}
                </p>
              </SectionCard>
            )}

            {/* Notes */}
            {land.notes && (
              <SectionCard title="Additional Notes">
                <p className="text-[13.5px] text-white/50 leading-[1.8] font-light font-['Outfit',sans-serif] border-l-2 border-[#4db87a]/30 pl-4">
                  {land.notes}
                </p>
              </SectionCard>
            )}

            {/* ML Recommendations */}
            {recommendations.length > 0 && (
              <SectionCard title="ML Plant Recommendations">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {recommendations.map((r, i) => (
                    <div key={i} className="bg-[#4db87a]/[0.04] border border-[#4db87a]/12 rounded-xl p-4">
                      <div className="font-['Cormorant_Garant',serif] text-[16px] font-semibold text-white mb-1">{r.plantName}</div>
                      {r.suitabilityScore != null && (
                        <div className="text-[10.5px] font-semibold text-[#4db87a] mb-2 font-['Outfit',sans-serif]">
                          {(r.suitabilityScore * 100).toFixed(0)}% suitable
                        </div>
                      )}
                      {r.reason && (
                        <p className="text-[11.5px] text-white/35 leading-relaxed font-['Outfit',sans-serif] font-light">{r.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <SectionCard title={`Community Reviews — ${reviews.length}`}>
                <div className="flex flex-col gap-3">
                  {reviews.map((r, i) => (
                    <div key={i} className="bg-[#0c1e11] border border-white/[0.07] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {(r.userName || r.name || "?")?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-[13px] font-semibold text-white font-['Outfit',sans-serif]">
                            {r.userName || r.name || `User #${r.userId}`}
                          </span>
                        </div>
                        <span className="text-amber-400 text-[13px] tracking-[1px]">
                          {"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}
                        </span>
                      </div>
                      {r.createdAt && (
                        <p className="text-[10.5px] text-white/25 mb-2 font-['Outfit',sans-serif]">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                      {r.body && (
                        <p className="text-[12.5px] text-white/40 leading-relaxed border-l-2 border-[#4db87a]/30 pl-3 italic font-['Outfit',sans-serif] font-light">
                          "{r.body}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col gap-3">

            {/* Action card — PENDING */}
            {land.status === "PENDING" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0f2916] border border-[#4db87a]/20 rounded-2xl p-5"
              >
                <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[#4db87a] mb-2 font-['Outfit',sans-serif]">
                  Admin · Decision
                </div>
                <h3 className="font-['Cormorant_Garant',serif] text-[20px] font-semibold text-white mb-1.5">
                  Cast Your Vote
                </h3>
                <p className="text-[12.5px] text-white/35 leading-relaxed mb-5 font-['Outfit',sans-serif] font-light">
                  Review all details carefully before approving or rejecting this submission.
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => handleVote("APPROVE")}
                    disabled={!!isVoting}
                    className="w-full py-3 bg-[#4db87a]/12 border border-[#4db87a]/30 rounded-xl text-[13px] font-semibold text-[#4db87a] font-['Outfit',sans-serif] cursor-pointer hover:bg-[#4db87a]/18 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isVoting === "APPROVE" ? "⏳ Approving…" : "✓ Approve Submission"}
                  </button>
                  <button
                    onClick={() => handleVote("REJECT")}
                    disabled={!!isVoting}
                    className="w-full py-3 bg-red-500/[0.06] border border-red-500/20 rounded-xl text-[13px] font-semibold text-red-400/80 font-['Outfit',sans-serif] cursor-pointer hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isVoting === "REJECT" ? "⏳ Rejecting…" : "✕ Reject Submission"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Already decided */}
            {land.status !== "PENDING" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 border ${land.status === "APPROVED"
                    ? "bg-[#4db87a]/[0.06] border-[#4db87a]/20"
                    : "bg-red-500/[0.05] border-red-500/20"
                  }`}
              >
                <div className={`font-['Cormorant_Garant',serif] text-[20px] font-semibold mb-1 ${land.status === "APPROVED" ? "text-[#4db87a]" : "text-red-400"
                  }`}>
                  {land.status === "APPROVED" ? "✓ Approved" : "✕ Rejected"}
                </div>
                <p className="text-[12.5px] text-white/35 font-['Outfit',sans-serif] font-light">
                  This submission has been {land.status.toLowerCase()}.
                </p>
              </motion.div>
            )}

            {/* Ownership */}
            <Panel title="Ownership">
              <DataRow label="Owner" value={land.ownerName} />
              <DataRow label="Phone" value={land.ownerPhone} />
              <DataRow label="Type" value={land.ownershipType} />
              <DataRow label="Permission" value={land.permissionStatus} />
            </Panel>

            {/* Land Info */}
            <Panel title="Land Info">
              <DataRow label="Area" value={land.areaSqm ? `${Number(land.areaSqm).toLocaleString()} m²` : null} />
              <DataRow label="Hectares" value={land.areaSqm ? `${(land.areaSqm / 10000).toFixed(3)} ha` : null} />
              <DataRow label="Soil" value={land.soilType} />
              <DataRow label="Status" value={land.landStatus} />
              <DataRow label="Fencing" value={land.fencing !== undefined ? (land.fencing ? "Yes" : "No") : null} />
              <DataRow label="Road" value={land.accessRoad} />
              <DataRow label="Landmark" value={land.nearbyLandmark} />
            </Panel>

            {/* Water */}
            <Panel title="Water">
              <DataRow label="Available" value={land.waterAvailable} />
              <DataRow label="Frequency" value={land.waterFrequency} />
            </Panel>

            {/* Coordinates */}
            {(land.centroidLat || land.centroidLng) && (
              <Panel title="Coordinates">
                <DataRow label="Lat" value={land.centroidLat?.toFixed(6)} />
                <DataRow label="Long" value={land.centroidLng?.toFixed(6)} />
                <div className="pt-3">
                  <a
                    href={`https://maps.google.com/?q=${land.centroidLat},${land.centroidLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0c1e11] border border-white/10 rounded-xl text-[12px] font-semibold text-[#4db87a] no-underline hover:border-[#4db87a]/30 hover:bg-[#4db87a]/8 transition-all font-['Outfit',sans-serif]"
                  >
                    ↗ Open in Maps
                  </a>
                </div>
              </Panel>
            )}

            {/* Submission meta */}
            <Panel title="Submission">
              <DataRow label="Land ID" value={land.id} />
              <DataRow label="Submitted by" value={land.createdByName || land.submittedByName || (land.createdBy ? `User #${land.createdBy}` : null)} />
              <DataRow label="Date" value={land.createdAt ? new Date(land.createdAt).toLocaleString("en-IN") : null} />
              <DataRow label="Photos" value={images.length > 0 ? `${images.length} file${images.length > 1 ? "s" : ""}` : "None"} />
            </Panel>

          </div>
        </div>
      </div>
    </div>
  );
}