/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Reviews page — Verdant Editorial redesign. Cormorant Garant + Outfit.
*/
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;

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

// ─── Review card ──────────────────────────────────────────────
function ReviewCard({ review }) {
  return (
    <motion.div
      className="bg-white border border-[#ede8de] rounded-2xl p-5"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
          {review.userName?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-[#0c1e11] font-['Outfit',sans-serif]">{review.userName || "Anonymous"}</div>
          <div className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif]">
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
          </div>
        </div>
        <StarRating value={review.rating} readOnly size={16} />
      </div>

      <div className="flex gap-1.5 flex-wrap mb-2">
        {review.feasibilityNote && (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-['Outfit',sans-serif]">
            ✅ {review.feasibilityNote}
          </span>
        )}
        {review.permissionNote && (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 font-['Outfit',sans-serif]">
            🔐 {review.permissionNote}
          </span>
        )}
      </div>

      {review.body && (
        <p className="text-[13px] text-[#6b5e4e] leading-relaxed italic border-l-2 border-[#4db87a]/40 pl-3 font-light font-['Outfit',sans-serif]">
          "{review.body}"
        </p>
      )}
    </motion.div>
  );
}

// ─── Write review ─────────────────────────────────────────────
function WriteReview({ landId, onPosted }) {
  const [form, setForm] = useState({ rating: 0, feasibilityNote: "", permissionNote: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selCls = "w-full px-4 py-3 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4] transition-all appearance-none";

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
    <div className="bg-white border border-[#ede8de] rounded-2xl p-6 sm:p-8">
      <div className="inline-flex items-center gap-2 mb-5">
        <div className="w-4 h-px bg-[#4db87a]" />
        <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#4db87a] font-['Outfit',sans-serif]">Your Review</span>
      </div>
      <h3 className="font-['Cormorant_Garant',serif] text-[22px] font-semibold text-[#0c1e11] mb-1">✍️ Write a Review</h3>
      <p className="text-[12.5px] text-[#8a7d6e] mb-6 font-light font-['Outfit',sans-serif]">
        Rate this site's feasibility and share your experience
      </p>

      <div className="mb-5">
        <label className="block text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] mb-3 font-['Outfit',sans-serif]">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating value={form.rating} onChange={v => set("rating", v)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] font-['Outfit',sans-serif]">
            Feasibility Note
          </label>
          <select className={selCls} value={form.feasibilityNote} onChange={e => set("feasibilityNote", e.target.value)}>
            <option value="">— Select —</option>
            {["Highly feasible", "Feasible with preparation", "Needs soil treatment", "Water access issue", "Not feasible currently"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] font-['Outfit',sans-serif]">
            Permission Status
          </label>
          <select className={selCls} value={form.permissionNote} onChange={e => set("permissionNote", e.target.value)}>
            <option value="">— Select —</option>
            {["Permission confirmed", "Permission in process", "Verbal permission only", "No permission yet", "Government / public land"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-1.5">
        <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] font-['Outfit',sans-serif]">
          Detailed Review
        </label>
        <textarea
          className={selCls + " resize-none min-h-[90px] leading-relaxed"}
          placeholder="Describe the site conditions, access, soil quality, what you observed on ground…"
          value={form.body} onChange={e => set("body", e.target.value)}
        />
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200/80 rounded-xl text-[12.5px] text-red-700 font-medium font-['Outfit',sans-serif]">⚠️ {error}</div>}
      {success && <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[12.5px] text-emerald-700 font-semibold font-['Outfit',sans-serif]">✅ Review posted successfully!</div>}

      <button onClick={handlePost} disabled={submitting || !form.rating}
        className="px-7 py-3 rounded-xl bg-[#0c1e11] text-white text-[13.5px] font-semibold font-['Outfit',sans-serif] cursor-pointer hover:bg-[#163d25] disabled:opacity-45 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
        {submitting ? "Posting…" : "Post Review →"}
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`${BASE_URL}/api/lands/${id}`, { credentials: "include" }).then(r => r.json()),
      fetch(`${BASE_URL}/api/lands/${id}/reviews`, { credentials: "include" }).then(r => r.json()).catch(() => []),
    ]).then(([l, rv]) => {
      setLand(l);
      setReviews(Array.isArray(rv) ? rv : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      <Helmet>
        <title>{land?.title ? `${land.title} — Reviews — TerraSpotter` : "Site reviews — TerraSpotter"}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="min-h-screen bg-[#f7f3ec] font-['Outfit',sans-serif]">
        <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-8 sm:py-10 pb-24">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#b5ac9e] hover:text-[#0c1e11] transition-colors mb-7 cursor-pointer bg-none border-none">
            ← Back
          </button>

          {loading ? (
            <div className="text-center py-16 text-[#b5ac9e] font-light">Loading…</div>
          ) : (
            <>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[12.5px] text-[#b5ac9e] mb-6">
                <Link to={`/lands/${id}`} className="text-[#4db87a] font-medium no-underline hover:underline">
                  {land?.title || "Land"}
                </Link>
                <span>›</span>
                <span>Reviews</span>
              </div>

              {/* Hero */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-4 h-px bg-[#4db87a]" />
                  <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#4db87a]">Community</span>
                </div>
                <h1 className="font-['Cormorant_Garant',serif] text-[36px] sm:text-[44px] font-semibold text-[#0c1e11] leading-[0.95] tracking-[-0.5px] mb-2">
                  Site Reviews
                </h1>
                <p className="text-[13.5px] text-[#8a7d6e] font-light leading-relaxed">
                  {land?.title} — community assessments on feasibility & planting permissions
                </p>
              </div>

              {/* Summary */}
              {reviews.length > 0 && (
                <div className="bg-white border border-[#ede8de] rounded-2xl p-5 sm:p-6 mb-7 flex items-center gap-7 flex-wrap">
                  <div className="font-['Cormorant_Garant',serif] text-[56px] font-semibold text-[#0c1e11] leading-none tracking-[-1px]">
                    {avgRating}
                  </div>
                  <div className="flex flex-col gap-2">
                    <StarRating value={Math.round(avgRating)} readOnly size={20} />
                    <span className="text-[12px] text-[#b5ac9e]">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Distribution bars */}
                  <div className="flex-1 min-w-[180px] flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const pct = Math.round((count / reviews.length) * 100);
                      return (
                        <div key={star} className="flex items-center gap-2.5 text-[11.5px] text-[#b5ac9e]">
                          <span className="w-5">{star}★</span>
                          <div className="flex-1 h-[5px] bg-[#f0ebe2] rounded-full overflow-hidden">
                            <div className="h-full bg-[#4db87a] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reviews list */}
              <div className="flex flex-col gap-3.5 mb-8">
                {reviews.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center gap-3">
                    <span className="text-4xl opacity-30">🌿</span>
                    <p className="text-[14px] text-[#b5ac9e] font-light">No reviews yet. Be the first to assess this site!</p>
                  </div>
                ) : (
                  reviews.map((rv, i) => <ReviewCard key={rv.id ?? i} review={rv} />)
                )}
              </div>

              {/* Write review */}
              <WriteReview
                landId={id}
                onPosted={created => setReviews(prev => [created, ...prev])}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}