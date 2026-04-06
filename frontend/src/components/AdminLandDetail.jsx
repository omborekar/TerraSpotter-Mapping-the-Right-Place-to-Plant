/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Admin detail view for approving or rejecting land submissions.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;

const statusBadge = (status) => {
  const map = {
    PENDING:  { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "Pending Review" },
    APPROVED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Approved" },
    REJECTED: { cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", label: "Rejected" },
  };
  return map[status] || map.PENDING;
};

/* ─── Skeleton primitives ─── */
function Bone({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 bg-[length:200%_100%] rounded-lg ${className}`} />
  );
}

function SkeletonDetail() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* topbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Bone className="h-9 w-36" />
        <div className="flex gap-2">
          <Bone className="h-7 w-28 rounded-full" />
          <Bone className="h-7 w-16 rounded-md" />
        </div>
      </div>
      {/* title */}
      <div className="space-y-2">
        <Bone className="h-10 w-2/3" />
        <Bone className="h-5 w-1/3" />
      </div>
      {/* main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Bone className="w-full h-80 rounded-2xl" />
          <Bone className="w-full h-36 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Bone className="w-full h-48 rounded-2xl" />
          <Bone className="w-full h-52 rounded-2xl" />
          <Bone className="w-full h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── InfoRow ─── */
function InfoRow({ icon, label, value }) {
  if (!value && value !== false && value !== 0) return null;
  return (
    <div className="flex gap-3 items-start py-2.5 border-b border-emerald-50 last:border-0">
      <span className="text-base mt-0.5 shrink-0">{icon}</span>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900">{String(value)}</div>
      </div>
    </div>
  );
}

/* ─── Section card ─── */
function Section({ title, children }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-sm uppercase tracking-wider text-green-900 pb-3 mb-4 border-b border-emerald-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ─── Side card ─── */
function SideCard({ title, children }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 pb-3 mb-3 border-b border-emerald-100">
        {title}
      </h4>
      {children}
    </div>
  );
}

/* ─── Main component ─── */
export default function AdminLandDetail({ landId, user, onBack, onVote, voting: externalVoting }) {
  const [land, setLand]               = useState(null);
  const [images, setImages]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeImg, setActiveImg]     = useState(0);
  const [voting, setVoting]           = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews]         = useState([]);

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
      await axios.post(`${BASE_URL}/lands/${landId}/verify`, null, {
        withCredentials: true,
        params: { vote, userId: user.id },
      });
      const res = await axios.get(`${BASE_URL}/api/lands/${landId}`, { withCredentials: true });
      setLand(res.data);
      if (onVote) onVote(landId, vote);
    } catch {
      alert("Error processing vote");
    } finally {
      setVoting(v => ({ ...v, [landId]: null }));
    }
  };

  if (loading) return <SkeletonDetail />;

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="text-5xl">⚠️</span>
      <p className="text-red-600 font-medium">{error}</p>
      <button
        onClick={onBack}
        className="px-5 py-2.5 bg-white border border-emerald-200 text-green-900 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
      >
        ← Back to Queue
      </button>
    </div>
  );

  const imageUrls = images.map(i => i.imageUrl);
  const badge     = statusBadge(land.status);
  const isVoting  = voting[landId] || externalVoting?.[landId];

  return (
    <div className="min-h-screen bg-[#f9fbf9] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-green-900 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
          >
            ← Back to Queue
          </button>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-white border border-emerald-100 px-2.5 py-1 rounded-lg">
              #{land.id}
            </span>
          </div>
        </div>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-7"
        >
          <h1 className="font-extrabold text-3xl sm:text-4xl text-green-950 leading-tight">
            {land.title || "Untitled Land"}
          </h1>
          {land.nearbyLandmark && (
            <p className="text-sm text-emerald-500 mt-1.5">📍 Near {land.nearbyLandmark}</p>
          )}
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Gallery */}
            {imageUrls.length > 0 ? (
              <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="relative h-72 sm:h-96 bg-emerald-50">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={imageUrls[activeImg]}
                      alt={`Land image ${activeImg + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onError={e => { e.target.src = "https://via.placeholder.com/600x380/e8f5ee/0d3320?text=🌿"; }}
                    />
                  </AnimatePresence>
                  <span className="absolute bottom-3 right-3 bg-black/50 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {activeImg + 1} / {imageUrls.length}
                  </span>
                </div>
                {imageUrls.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto bg-white">
                    {imageUrls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImg === i ? "border-emerald-500 scale-105" : "border-transparent hover:border-emerald-300"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`thumb-${i}`}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = "https://via.placeholder.com/80x56/e8f5ee/0d3320?text=🌿"; }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-emerald-100 rounded-2xl h-60 flex flex-col items-center justify-center gap-3 shadow-sm">
                <span className="text-5xl opacity-40">🌍</span>
                <p className="text-sm text-emerald-400">No images uploaded</p>
              </div>
            )}

            {/* Description */}
            {land.description && (
              <Section title="Description">
                <p className="text-sm text-gray-600 leading-relaxed">{land.description}</p>
              </Section>
            )}

            {/* Notes */}
            {land.notes && (
              <Section title="Additional Notes">
                <p className="text-sm text-gray-600 leading-relaxed">{land.notes}</p>
              </Section>
            )}

            {/* ML Recommendations */}
            {recommendations.length > 0 && (
              <Section title="🌱 ML Plant Recommendations">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {recommendations.map((r, i) => (
                    <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="font-bold text-sm text-green-900 mb-1">{r.plantName}</div>
                      {r.suitabilityScore != null && (
                        <div className="text-xs font-semibold text-emerald-600 mb-1.5">
                          Suitability: {(r.suitabilityScore * 100).toFixed(0)}%
                        </div>
                      )}
                      {r.reason && <div className="text-xs text-gray-600 leading-relaxed">{r.reason}</div>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Community Reviews */}
            {reviews.length > 0 && (
              <Section title={`💬 Community Reviews (${reviews.length})`}>
                <div className="space-y-3">
                  {reviews.map((r, i) => (
                    <div key={i} className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm font-semibold text-green-900">
                          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-green-700 to-emerald-400 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {(r.userName || r.name || "?")?.[0]?.toUpperCase()}
                          </span>
                          {r.userName || r.name || `User #${r.userId}`}
                        </span>
                        <span className="text-amber-500 text-sm font-bold">
                          {"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}
                        </span>
                      </div>
                      {(r.feasibilityNote || r.permissionNote) && (
                        <p className="text-xs text-emerald-500 mb-1.5">
                          {r.feasibilityNote && `✅ ${r.feasibilityNote}`}
                          {r.feasibilityNote && r.permissionNote && " · "}
                          {r.permissionNote && `🔐 ${r.permissionNote}`}
                        </p>
                      )}
                      {r.createdAt && (
                        <p className="text-xs text-gray-400 mb-2">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                      {r.body && (
                        <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-emerald-400 pl-3 italic">
                          "{r.body}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* RIGHT sidebar */}
          <div className="space-y-4">

            {/* Action card – PENDING */}
            {land.status === "PENDING" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-950 to-green-800 rounded-2xl p-6 shadow-xl"
              >
                <h3 className="font-extrabold text-white text-lg mb-1">Admin Decision</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-5">
                  Review all details before approving or rejecting this submission.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleVote("APPROVE")}
                    disabled={!!isVoting}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors"
                  >
                    {isVoting === "APPROVE" ? "⏳ Approving…" : "✅ Approve Submission"}
                  </button>
                  <button
                    onClick={() => handleVote("REJECT")}
                    disabled={!!isVoting}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed text-red-300 border border-red-300/30 font-bold text-sm rounded-xl transition-colors"
                  >
                    {isVoting === "REJECT" ? "⏳ Rejecting…" : "❌ Reject Submission"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Already decided banner */}
            {land.status !== "PENDING" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 shadow-lg ${
                  land.status === "APPROVED"
                    ? "bg-gradient-to-br from-green-800 to-green-700"
                    : "bg-gradient-to-br from-red-900 to-red-700"
                }`}
              >
                <div className="font-extrabold text-white text-lg mb-1">
                  {land.status === "APPROVED" ? "✅ Approved" : "❌ Rejected"}
                </div>
                <p className="text-white/60 text-sm">
                  This submission has already been {land.status.toLowerCase()}.
                </p>
              </motion.div>
            )}

            {/* Ownership */}
            <SideCard title="Ownership Details">
              <InfoRow icon="👤" label="Owner Name"     value={land.ownerName} />
              <InfoRow icon="📞" label="Phone"          value={land.ownerPhone} />
              <InfoRow icon="🏷" label="Ownership Type" value={land.ownershipType} />
              <InfoRow icon="✅" label="Permission"     value={land.permissionStatus} />
            </SideCard>

            {/* Land Info */}
            <SideCard title="Land Information">
              <InfoRow icon="📐" label="Area"        value={land.areaSqm ? `${land.areaSqm.toLocaleString()} sqm (${(land.areaSqm / 10000).toFixed(3)} ha)` : null} />
              <InfoRow icon="🪨" label="Soil Type"   value={land.soilType} />
              <InfoRow icon="📊" label="Land Status" value={land.landStatus} />
              <InfoRow icon="🔒" label="Fencing"     value={land.fencing !== undefined ? (land.fencing ? "Yes" : "No") : null} />
              <InfoRow icon="🛤" label="Access Road" value={land.accessRoad} />
              <InfoRow icon="📍" label="Landmark"    value={land.nearbyLandmark} />
            </SideCard>

            {/* Water */}
            <SideCard title="Water Availability">
              <InfoRow icon="💧" label="Available"  value={land.waterAvailable} />
              <InfoRow icon="🔁" label="Frequency"  value={land.waterFrequency} />
            </SideCard>

            {/* Location */}
            {(land.centroidLat || land.centroidLng) && (
              <SideCard title="Location">
                <InfoRow icon="🌐" label="Latitude"  value={land.centroidLat?.toFixed(6)} />
                <InfoRow icon="🌐" label="Longitude" value={land.centroidLng?.toFixed(6)} />
                <a
                  href={`https://maps.google.com/?q=${land.centroidLat},${land.centroidLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-green-800 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  🗺 Open in Google Maps
                </a>
              </SideCard>
            )}

            {/* Submission info */}
            <SideCard title="Submission Info">
              <InfoRow icon="🆔" label="Land ID"         value={land.id} />
              <InfoRow icon="👤" label="Submitted by"    value={land.createdByName || land.submittedByName || (land.createdBy ? `User #${land.createdBy}` : null)} />
              <InfoRow icon="📅" label="Submitted on"    value={land.createdAt ? new Date(land.createdAt).toLocaleString("en-IN") : null} />
              <InfoRow icon="🖼" label="Photos uploaded" value={images.length > 0 ? `${images.length} photo${images.length > 1 ? "s" : ""}` : "None"} />
            </SideCard>

          </div>
        </div>
      </div>
    </div>
  );
}