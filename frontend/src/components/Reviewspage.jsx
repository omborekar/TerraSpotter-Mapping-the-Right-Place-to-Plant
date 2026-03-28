import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
const BASE_URL = import.meta.env.VITE_API_URL;

/* ── Star Rating widget ── */
function StarRating({ value, onChange, readOnly = false, size = 28 }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor – not feasible", "Unlikely – needs work", "Possible with effort", "Good – recommended", "Excellent – perfect site"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n}
            onClick={() => !readOnly && onChange?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            style={{
              background: "none", border: "none", cursor: readOnly ? "default" : "pointer",
              padding: 0, fontSize: size, lineHeight: 1,
              filter: (hover || value) >= n ? "none" : "grayscale(1) opacity(.3)",
              transform: !readOnly && hover === n ? "scale(1.2)" : "scale(1)",
              transition: "transform .12s, filter .12s",
            }}>
            ⭐
          </button>
        ))}
      </div>
      {!readOnly && (hover || value) > 0 && (
        <span style={{ fontSize: 12, color: "#4a5e52", fontStyle: "italic" }}>
          {labels[hover || value]}
        </span>
      )}
    </div>
  );
}

/* ── Single review card ── */
function ReviewCard({ review }) {
  return (
    <motion.div className="rv-card"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .3 }}>
      <div className="rv-card-top">
        <div className="rv-avatar">{review.userName?.[0]?.toUpperCase() || "?"}</div>
        <div>
          <div className="rv-name">{review.userName || "Anonymous"}</div>
          <div className="rv-date">
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
          </div>
        </div>
        <div className="rv-stars" style={{ marginLeft: "auto" }}>
          <StarRating value={review.rating} readOnly size={18} />
        </div>
      </div>
      {review.feasibilityNote && (
        <div className="rv-tag rv-tag-green">✅ Feasibility: {review.feasibilityNote}</div>
      )}
      {review.permissionNote && (
        <div className="rv-tag rv-tag-blue">🔐 Permission: {review.permissionNote}</div>
      )}
      {review.body && (
        <p className="rv-body">"{review.body}"</p>
      )}
    </motion.div>
  );
}

/* ── Write-a-review panel ── */
function WriteReview({ landId, onPosted }) {
  const [form, setForm] = useState({ rating: 0, feasibilityNote: "", permissionNote: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePost = async () => {
    if (form.rating === 0) { setError("Please select a star rating."); return; }
    setError(""); setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/lands/${landId}/reviews`, {   // ← fixed URL
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || b.message || `Error (${res.status})`);
      }
      const created = await res.json();
      onPosted?.(created);
      setForm({ rating: 0, feasibilityNote: "", permissionNote: "", body: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wr-box">
      <h3 className="wr-title">✍️ Write a Review</h3>
      <p className="wr-sub">Rate this site's feasibility and share your experience</p>

      <div className="wr-section">
        <label className="wr-label">Overall Rating <span className="wr-req">*</span></label>
        <StarRating value={form.rating} onChange={v => set("rating", v)} size={32} />
      </div>

      <div className="wr-row">
        <div className="wr-field">
          <label className="wr-label">Feasibility Note</label>
          <select className="wr-select" value={form.feasibilityNote} onChange={e => set("feasibilityNote", e.target.value)}>
            <option value="">— Select —</option>
            <option value="Highly feasible">Highly feasible</option>
            <option value="Feasible with preparation">Feasible with preparation</option>
            <option value="Needs soil treatment">Needs soil treatment</option>
            <option value="Water access issue">Water access issue</option>
            <option value="Not feasible currently">Not feasible currently</option>
          </select>
        </div>
        <div className="wr-field">
          <label className="wr-label">Permission Status</label>
          <select className="wr-select" value={form.permissionNote} onChange={e => set("permissionNote", e.target.value)}>
            <option value="">— Select —</option>
            <option value="Permission confirmed">Permission confirmed</option>
            <option value="Permission in process">Permission in process</option>
            <option value="Verbal permission only">Verbal permission only</option>
            <option value="No permission yet">No permission yet</option>
            <option value="Government / public land">Government / public land</option>
          </select>
        </div>
      </div>

      <div className="wr-field" style={{ marginTop: 14 }}>
        <label className="wr-label">Detailed Review</label>
        <textarea className="wr-textarea"
          placeholder="Describe the site conditions, access, soil quality, what you observed on ground…"
          value={form.body} onChange={e => set("body", e.target.value)} />
      </div>

      {error   && <div className="wr-error">⚠️ {error}</div>}
      {success && <div className="wr-success">✅ Review posted successfully!</div>}

      <button className="wr-submit" onClick={handlePost} disabled={submitting || form.rating === 0}>
        {submitting ? "Posting…" : "Post Review →"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest:#0d3320; --canopy:#1a5c38; --leaf:#2d8a55; --sprout:#4db87a;
          --mist:#e8f5ee; --sand:#f5f1eb; --cream:#faf8f4;
          --ink:#0f1a14; --smoke:#6b7a72; --line:#dde5e0; --white:#ffffff;
          --danger:#c0392b;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--sand); color:var(--ink); }
        .rv-page { max-width:860px;margin:0 auto;padding:44px 32px 80px; }
        .rv-back { display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:500;color:var(--smoke);background:none;border:none;cursor:pointer;padding:0;font-family:'DM Sans',sans-serif;margin-bottom:24px;transition:color .15s; }
        .rv-back:hover { color:var(--forest); }

        .rv-crumb { display:flex;align-items:center;gap:8px;font-size:13px;color:var(--smoke);margin-bottom:20px; }
        .rv-crumb a { color:var(--leaf);text-decoration:none;font-weight:500; }
        .rv-crumb a:hover { text-decoration:underline; }

        .rv-hero { margin-bottom:32px; }
        .rv-hero h1 { font-family:'Fraunces',serif;font-size:30px;font-weight:600;color:var(--forest);letter-spacing:-.3px; }
        .rv-hero p { font-size:14px;color:var(--smoke);margin-top:6px; }

        .rv-summary {
          background:var(--white);border-radius:14px;border:1px solid var(--line);
          padding:20px 24px;display:flex;align-items:center;gap:28px;
          margin-bottom:28px;flex-wrap:wrap;
        }
        .rv-big-score { font-family:'Fraunces',serif;font-size:52px;color:var(--forest);line-height:1; }
        .rv-score-meta { display:flex;flex-direction:column;gap:4px; }
        .rv-score-meta small { font-size:12px;color:var(--smoke); }
        .rv-dist { display:flex;flex-direction:column;gap:5px;flex:1;min-width:180px; }
        .rv-dist-row { display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--smoke); }
        .rv-dist-bar-wrap { flex:1;height:5px;background:var(--line);border-radius:3px;overflow:hidden; }
        .rv-dist-bar { height:100%;background:var(--leaf);border-radius:3px;transition:width .5s; }

        .rv-list { display:flex;flex-direction:column;gap:14px;margin-bottom:32px; }
        .rv-card { background:var(--white);border-radius:13px;border:1px solid var(--line);padding:20px 22px; }
        .rv-card-top { display:flex;align-items:center;gap:12px;margin-bottom:12px; }
        .rv-avatar { width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--canopy),var(--sprout));color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0; }
        .rv-name { font-size:14px;font-weight:600;color:var(--ink); }
        .rv-date { font-size:12px;color:var(--smoke);margin-top:1px; }
        .rv-tag { display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500;margin:3px 4px 3px 0; }
        .rv-tag-green { background:var(--mist);color:var(--canopy); }
        .rv-tag-blue  { background:#e0f2fe;color:#0c4a6e; }
        .rv-body { font-size:13.5px;color:var(--smoke);line-height:1.65;margin-top:10px;font-style:italic;border-left:3px solid var(--leaf);padding-left:12px; }
        .rv-empty { text-align:center;padding:40px 20px;color:var(--smoke);font-size:14px; }
        .rv-empty span { font-size:36px;display:block;margin-bottom:10px;opacity:.4; }

        .wr-box { background:var(--white);border-radius:14px;border:1px solid var(--line);padding:28px 28px 24px; }
        .wr-title { font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--forest);margin-bottom:4px; }
        .wr-sub { font-size:13px;color:var(--smoke);margin-bottom:20px; }
        .wr-section { margin-bottom:16px; }
        .wr-label { font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#4a5e52;display:block;margin-bottom:7px; }
        .wr-req { color:var(--danger); }
        .wr-row { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
        .wr-field { display:flex;flex-direction:column;gap:6px; }
        .wr-select, .wr-textarea {
          padding:10px 14px;border:1.5px solid var(--line);border-radius:9px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;
          background:#fff;color:var(--ink);outline:none;
          transition:border-color .2s,box-shadow .2s;width:100%;
        }
        .wr-select { appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7a72' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px; }
        .wr-select:focus, .wr-textarea:focus { border-color:var(--leaf);box-shadow:0 0 0 3px rgba(45,138,85,.1); }
        .wr-textarea { resize:none;min-height:90px;line-height:1.55; }
        .wr-error { margin:12px 0;padding:9px 14px;background:#fff5f5;border:1px solid #fecaca;border-radius:8px;font-size:12.5px;color:var(--danger); }
        .wr-success { margin:12px 0;padding:9px 14px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:12.5px;color:#14532d;font-weight:500; }
        .wr-submit {
          margin-top:16px;padding:11px 26px;background:var(--forest);color:white;border:none;
          border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;
          cursor:pointer;transition:background .15s,transform .1s;
        }
        .wr-submit:hover:not(:disabled) { background:var(--canopy); }
        .wr-submit:active:not(:disabled) { transform:scale(.98); }
        .wr-submit:disabled { opacity:.45;cursor:not-allowed; }

        @media(max-width:640px) {
          .rv-page { padding:24px 14px 60px; }
          .wr-row { grid-template-columns:1fr; }
          .rv-summary { gap:16px; }
        }
      `}</style>

      <div className="rv-page">
        <button className="rv-back" onClick={() => navigate(-1)}>← Back</button>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--smoke)" }}>Loading…</div>
        ) : (
          <>
            <div className="rv-crumb">
              <Link to={`/lands/${id}`}>{land?.title || "Land"}</Link>
              <span>›</span>
              <span>Reviews</span>
            </div>

            <div className="rv-hero">
              <h1>Site Reviews</h1>
              <p>{land?.title || "This land"} — community assessments on feasibility &amp; planting permissions</p>
            </div>

            {reviews.length > 0 && (
              <div className="rv-summary">
                <div className="rv-big-score">{avgRating}</div>
                <div className="rv-score-meta">
                  <StarRating value={Math.round(avgRating)} readOnly size={20} />
                  <small>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</small>
                </div>
                <div className="rv-dist">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct = Math.round((count / reviews.length) * 100);
                    return (
                      <div key={star} className="rv-dist-row">
                        <span>{star}★</span>
                        <div className="rv-dist-bar-wrap">
                          <div className="rv-dist-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ width: 24, textAlign: "right" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rv-list">
              {reviews.length === 0 ? (
                <div className="rv-empty">
                  <span>🌿</span>
                  No reviews yet. Be the first to assess this site!
                </div>
              ) : (
                reviews.map((rv, i) => <ReviewCard key={rv.id ?? i} review={rv} />)
              )}
            </div>

            {/* Write review form — always visible */}
            <WriteReview
              landId={id}
              onPosted={created => setReviews(prev => [created, ...prev])}
            />
          </>
        )}
      </div>
    </>
  );
}