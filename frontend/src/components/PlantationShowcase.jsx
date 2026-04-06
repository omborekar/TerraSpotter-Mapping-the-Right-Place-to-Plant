/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Showcase page displaying completed plantations and impact metrics.
 */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Calendar, TreePine, Users, MessageSquare, Camera, X, Check } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ─── Bone skeleton ─── */
function Bone({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-green-800/60 via-green-700/40 to-green-800/60 bg-[length:200%_100%] rounded-lg ${className}`} />
  );
}

function BoneLight({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded-lg ${className}`} />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/95 rounded-2xl overflow-hidden shadow-lg">
      <BoneLight className="aspect-[16/10] rounded-none" />
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1.5 flex-1">
            <BoneLight className="h-5 w-3/4" />
            <BoneLight className="h-4 w-1/2" />
          </div>
          <BoneLight className="h-8 w-16 rounded-full shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <BoneLight className="h-14 rounded-xl" />
          <BoneLight className="h-14 rounded-xl" />
        </div>
        <BoneLight className="h-4 w-full" />
        <BoneLight className="h-4 w-4/5" />
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <BoneLight className="h-5 w-24" />
          <BoneLight className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
      {[...Array(3)].map((_, i) => (
        <Bone key={i} className="h-20 w-32 rounded-2xl" />
      ))}
    </div>
  );
}

/* ─── Main component ─── */
export default function PlantationShowcase() {
  const [plantations, setPlantations]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedPlantation, setSelected]   = useState(null);
  const [showReviewModal, setShowReview]     = useState(false);
  const [filter, setFilter]                 = useState("all");

  useEffect(() => {
    fetchPlantations();
  }, []);

  const fetchPlantations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/plantations/completed`, { credentials: "include" });
      const data = await res.json();
      setPlantations(data);
    } catch (err) {
      console.error("Failed to fetch plantations:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlantations = [...plantations].sort((a, b) => {
    if (filter === "recent")  return new Date(b.completedAt) - new Date(a.completedAt);
    if (filter === "popular") return (b.reviews?.length || 0) - (a.reviews?.length || 0);
    return 0;
  });

  const totalTrees   = plantations.reduce((s, p) => s + (p.treesPlanted || 0), 0);
  const totalReviews = plantations.reduce((s, p) => s + (p.reviews?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-800 to-green-950 px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden font-sans">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-green-400/10 blur-3xl animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-green-400/10 blur-3xl animate-[float_20s_ease-in-out_5s_infinite]" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl animate-[float_20s_ease-in-out_10s_infinite]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-xl">
            🌳 Our Green Legacy
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Witness the transformation. Every plantation tells a story of hope,
            growth, and commitment to our planet's future.
          </p>

          {/* Stats */}
          {loading ? <SkeletonStats /> : (
            <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
              {[
                { value: plantations.length,           label: "Plantations" },
                { value: totalTrees.toLocaleString(),  label: "Trees Planted" },
                { value: totalReviews,                 label: "Reviews" },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 px-7 py-4 rounded-2xl">
                  <span className="block text-3xl font-bold text-green-300">{s.value}</span>
                  <span className="text-xs uppercase tracking-widest text-white/60">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          className="flex justify-center gap-3 mb-10 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { key: "all", label: "All Plantations" },
            { key: "recent", label: "Most Recent" },
            { key: "popular", label: "Most Reviewed" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-6 py-3 rounded-full text-sm font-semibold border-2 transition-all ${
                filter === key
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-transparent shadow-lg shadow-green-400/30"
                  : "bg-white/10 text-white/70 border-transparent hover:bg-white/15 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPlantations.length === 0 ? (
          <div className="text-center py-20 text-white/60">
            <TreePine className="w-20 h-20 mx-auto mb-5 opacity-40" />
            <h3 className="text-2xl font-bold text-white mb-2">No Plantations Yet</h3>
            <p>Be the first to complete a plantation and share it with the community!</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredPlantations.map((plantation, idx) => (
              <PlantationCard
                key={plantation.id}
                plantation={plantation}
                index={idx}
                onClick={() => setSelected(plantation)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPlantation && (
          <PlantationDetailModal
            plantation={selectedPlantation}
            onClose={() => setSelected(null)}
            onReview={() => setShowReview(true)}
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <ReviewModal
            plantation={selectedPlantation}
            onClose={() => setShowReview(false)}
            onSuccess={() => { setShowReview(false); fetchPlantations(); }}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(30px, -30px) scale(1.1); }
          66%  { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}

/* ─── PlantationCard ─── */
function PlantationCard({ plantation, index, onClick }) {
  const avgRating = plantation.reviews?.length
    ? (plantation.reviews.reduce((s, r) => s + r.rating, 0) / plantation.reviews.length).toFixed(1)
    : 0;

  return (
    <motion.div
      className="bg-white/95 rounded-2xl overflow-hidden shadow-xl cursor-pointer group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={plantation.images?.[0] || "https://placehold.co/400x250?text=No+Image"}
          alt={plantation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
          <Camera size={12} />
          {plantation.images?.length || 0}
        </div>
      </div>

      <div className="p-6">
        {/* Title + rating */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <h3 className="font-serif text-xl font-semibold text-green-950 mb-1 leading-snug">{plantation.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} />
              {plantation.location}
            </div>
          </div>
          {avgRating > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-full shrink-0">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-amber-600">{avgRating}</span>
            </div>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="flex items-center gap-2.5 bg-green-50 rounded-xl p-2.5">
            <TreePine size={18} className="text-green-600 shrink-0" />
            <div>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Trees</span>
              <span className="block text-base font-bold text-green-950">{plantation.treesPlanted}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-green-50 rounded-xl p-2.5">
            <Calendar size={18} className="text-green-600 shrink-0" />
            <div>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Completed</span>
              <span className="block text-sm font-bold text-green-950">
                {new Date(plantation.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {plantation.notes && (
          <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{plantation.notes}</p>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MessageSquare size={14} />
            {plantation.reviews?.length || 0} reviews
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-950 text-white text-xs font-semibold rounded-lg hover:shadow-md hover:scale-105 transition-all">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── PlantationDetailModal ─── */
function PlantationDetailModal({ plantation, onClose, onReview }) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = plantation.images || [];

  const avgRating = plantation.reviews?.length
    ? (plantation.reviews.reduce((s, r) => s + r.rating, 0) / plantation.reviews.length).toFixed(1)
    : 0;

  return (
    <motion.div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-3xl w-full relative overflow-hidden my-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="relative aspect-video bg-black">
            <img
              src={images[currentImage]}
              alt={`Plantation ${currentImage + 1}`}
              className="w-full h-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xl transition-colors"
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                >‹</button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xl transition-colors"
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                >›</button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`h-2 rounded-full transition-all ${idx === currentImage ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Header */}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-green-950 mb-3">{plantation.title}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5"><MapPin size={14} />{plantation.location}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(plantation.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5"><Users size={14} />by {plantation.teamName || "Green Team"}</span>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-green-900 mb-3">Plantation Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: plantation.treesPlanted, label: "Trees Planted" },
                { value: plantation.moreCapacity || 0, label: "More Capacity" },
                { value: avgRating || "—", label: "Avg Rating" },
              ].map((s, i) => (
                <div key={i} className="bg-green-50 rounded-xl p-4 text-center">
                  <span className="block text-2xl font-bold text-green-600">{s.value}</span>
                  <span className="block text-xs text-gray-500 mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {plantation.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-sm text-green-900 mb-2">Field Notes</h3>
              <div className="bg-gray-50 border-l-4 border-green-500 px-4 py-3 rounded-r-xl text-sm text-gray-600 leading-relaxed">
                {plantation.notes}
              </div>
            </div>
          )}

          {/* Review button */}
          <button
            onClick={onReview}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-green-950 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <Star size={18} />
            Write a Review
          </button>

          {/* Reviews */}
          {plantation.reviews && plantation.reviews.length > 0 && (
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <h3 className="font-bold text-base text-green-900 mb-4">
                Community Reviews ({plantation.reviews.length})
              </h3>
              <div className="space-y-3">
                {plantation.reviews.map((review, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm text-green-900">{review.userName}</span>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {review.images.map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden">
                            <img src={img} alt={`Review ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
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

/* ─── ReviewModal ─── */
function ReviewModal({ plantation, onClose, onSuccess }) {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState("");
  const [photos, setPhotos]       = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const fileRef = useRef(null);

  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 5 - photos.length);
    setPhotos(prev => [...prev, ...valid.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))].slice(0, 5));
  };

  const removePhoto = (idx) => {
    setPhotos(prev => { URL.revokeObjectURL(prev[idx].previewUrl); return prev.filter((_, i) => i !== idx); });
  };

  const handleSubmit = async () => {
    if (!rating)       { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write a comment"); return; }
    setError(""); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("rating", rating);
      fd.append("comment", comment);
      photos.forEach(p => fd.append("images", p.file));
      const res = await fetch(`${BASE_URL}/api/plantations/${plantation.id}/review`, { method: "POST", credentials: "include", body: fd });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.message || `Server error (${res.status})`); }
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1001] flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && !submitting && onClose()}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-xl w-full my-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-7 sm:p-9 relative">
          <button onClick={onClose} disabled={submitting} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>

          <h2 className="font-serif text-2xl font-bold text-green-950 mb-6">Write a Review</h2>

          {/* Rating stars */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-green-900 mb-3">Your Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={34}
                  className={`cursor-pointer transition-colors ${star <= (hovered || rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-green-900 mb-3">Your Review *</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your thoughts about this plantation..."
              className="w-full min-h-28 p-3 border-2 border-gray-200 focus:border-green-500 outline-none rounded-xl text-sm resize-y font-sans transition-colors"
            />
          </div>

          {/* Photos */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-green-900 mb-3">Add Photos (Optional)</label>
            {photos.length < 5 && (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl p-6 text-center cursor-pointer bg-gray-50 hover:bg-green-50 transition-all"
              >
                <Camera size={28} className="mx-auto mb-2 text-gray-400" />
                <div className="text-sm text-gray-500">Click to add photos</div>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => addFiles(e.target.files)} />
              </div>
            )}
            {photos.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-5">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-green-950 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <><Check size={18} />Submit Review</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}