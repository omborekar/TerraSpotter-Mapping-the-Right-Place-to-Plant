import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
const BASE_URL = import.meta.env.VITE_API_URL;

import PlantationForm          from "./PlantationForm.jsx";
import CompletePlantationModal from "./CompletePlantationModal.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ── helpers ── */
const Chip = ({ children, color = "green" }) => (
  <span className={`sd-chip sd-chip-${color}`}>{children}</span>
);
const StatCard = ({ icon, label, value, sub }) => (
  <div className="sd-stat">
    <span className="sd-stat-icon">{icon}</span>
    <div>
      <div className="sd-stat-val">{value}</div>
      <div className="sd-stat-lbl">{label}</div>
      {sub && <div className="sd-stat-sub">{sub}</div>}
    </div>
  </div>
);
const InfoRow = ({ label, value }) => value ? (
  <div className="sd-info-row">
    <span className="sd-info-label">{label}</span>
    <span className="sd-info-value">{value}</span>
  </div>
) : null;
const SpinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: "spin .7s linear infinite", flexShrink: 0 }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/* ── mini star display ── */
function MiniStars({ value = 0, count = 0 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: 13, filter: n <= Math.round(value) ? "none" : "grayscale(1) opacity(.3)" }}>⭐</span>
      ))}
      <span style={{ fontSize: 12, color: "var(--smoke)", marginLeft: 2 }}>
        {value > 0 ? `${value} (${count})` : "No reviews yet"}
      </span>
    </div>
  );
}

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

/* ── Inline WriteReview form ── */
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
      const res = await fetch(`${BASE_URL}/api/lands/${landId}/reviews`, {
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
      <p className="wr-sub">Rate this site's feasibility and share your on-ground experience</p>

      <div className="wr-section">
        <label className="wr-label">Overall Rating <span style={{ color: "var(--danger)" }}>*</span></label>
        <StarRating value={form.rating} onChange={v => set("rating", v)} size={30} />
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
          value={form.body}
          onChange={e => set("body", e.target.value)} />
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
   TAB IDs
══════════════════════════════════════════════════════════════════ */
const TAB_DETAILS = "details";
const TAB_REVIEWS = "reviews";

/* ══════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════ */
export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [land, setLand]         = useState(null);
  const [images, setImages]     = useState([]);
  const [recs, setRecs]         = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [galleryIdx, setGalleryIdx] = useState(null);

  const [activeTab, setActiveTab] = useState(TAB_DETAILS);

  const [plantFormOpen, setPlantFormOpen] = useState(false);
  const [completeOpen, setCompleteOpen]   = useState(false);
  const [volunteerOpen, setVolunteerOpen] = useState(false);

  const [refreshStatus, setRefreshStatus] = useState("idle");
  const [refreshError,  setRefreshError]  = useState("");
  const successTimerRef = useRef(null);

  /* ── load ── */
  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`${BASE_URL}/api/lands/${id}`,                { credentials: "include" }).then(r => r.json()),
      fetch(`${BASE_URL}/api/lands/${id}/images`,          { credentials: "include" }).then(r => r.json()).catch(() => []),
      fetch(`${BASE_URL}/api/lands/${id}/recommendations`, { credentials: "include" }).then(r => r.json()).catch(() => []),
      fetch(`${BASE_URL}/api/lands/${id}/reviews`,         { credentials: "include" }).then(r => r.json()).catch(() => []),
    ]).then(([l, imgs, rec, rv]) => {
      setLand(l);
      setImages(Array.isArray(imgs) ? imgs : []);
      setRecs(Array.isArray(rec) ? rec : []);
      setReviews(Array.isArray(rv) ? rv : []);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => () => clearTimeout(successTimerRef.current), []);

  /* ── refresh recs ── */
  const handleRefreshRecs = async () => {
    if (refreshStatus === "loading") return;
    setRefreshStatus("loading"); setRefreshError("");
    try {
      const res = await fetch(`${BASE_URL}/api/lands/${id}/recommendations/refresh`, {
        method: "POST", credentials: "include",
      });
      if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try { const b = await res.json(); msg = b.message || b.error || msg; } catch {}
        throw new Error(msg);
      }
      const updated = await fetch(`${BASE_URL}/api/lands/${id}/recommendations`, { credentials: "include" }).then(r => r.json()).catch(() => []);
      setRecs(Array.isArray(updated) ? updated : []);
      setRefreshStatus("success");
      successTimerRef.current = setTimeout(() => setRefreshStatus("idle"), 3000);
    } catch (err) {
      setRefreshError(err.message || "Could not refresh.");
      setRefreshStatus("error");
      successTimerRef.current = setTimeout(() => { setRefreshStatus("idle"); setRefreshError(""); }, 5000);
    }
  };

  /* ── derived ── */
  const approxTrees  = land?.areaSqm ? Math.floor(land.areaSqm / 20) : null;
  const hasMap       = land?.centroidLat && land?.centroidLng;
  const isUnderPlant = land?.landStatus === "Under Plantation";
  const isMyPlantation = isUnderPlant; // replace with real auth check

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="sd-splash"><div className="sd-spinner" /></div>;
  if (!land)   return (
    <div className="sd-splash">
      <p style={{ color: "var(--danger)" }}>Land not found.</p>
      <button className="sd-btn-back" onClick={() => navigate(-1)}>← Go back</button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest:#0d3320; --canopy:#1a5c38; --leaf:#2d8a55; --sprout:#4db87a;
          --mist:#e8f5ee; --sand:#f5f1eb; --cream:#faf8f4;
          --ink:#0f1a14; --smoke:#6b7a72; --line:#dde5e0; --white:#ffffff;
          --danger:#c0392b; --amber:#d97706;
          --sh:0 2px 16px rgba(13,51,32,.08);
          --sh-lg:0 10px 48px rgba(13,51,32,.14);
        }
        body { font-family:'DM Sans',sans-serif; background:var(--sand); color:var(--ink); }

        .sd-splash { min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px; }
        .sd-spinner { width:32px;height:32px;border:3px solid var(--line);border-top-color:var(--forest);border-radius:50%;animation:spin .7s linear infinite; }
        @keyframes spin{to{transform:rotate(360deg)}}

        .sd-page { max-width:1160px;margin:0 auto;padding:48px 36px 80px; }
        .sd-back { display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:500;color:var(--smoke);background:none;border:none;cursor:pointer;padding:0;font-family:'DM Sans',sans-serif;margin-bottom:28px;transition:color .15s; }
        .sd-back:hover { color:var(--forest); }

        .sd-hero { margin-bottom:28px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap; }
        .sd-hero-left { display:flex;flex-direction:column;gap:10px; }
        .sd-title { font-family:'Fraunces',serif;font-size:36px;font-weight:600;letter-spacing:-.4px;color:var(--forest);line-height:1.1; }
        .sd-coords { font-size:13px;color:var(--smoke); }
        .sd-badges { display:flex;gap:8px;flex-wrap:wrap; }

        .sd-chip { display:inline-flex;align-items:center;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:.2px; }
        .sd-chip-green  { background:var(--mist);color:var(--canopy); }
        .sd-chip-amber  { background:#fef9c3;color:#92400e; }
        .sd-chip-blue   { background:#e0f2fe;color:#0c4a6e; }
        .sd-chip-gray   { background:#f3f4f6;color:#374151; }
        .sd-chip-red    { background:#fee2e2;color:#991b1b; }
        .sd-chip-purple { background:#f3e8ff;color:#6b21a8; }

        .sd-hero-actions { display:flex;flex-direction:column;gap:8px;align-items:flex-end; }
        .sd-plant-btn { padding:12px 26px;background:var(--forest);color:white;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s,transform .1s;flex-shrink:0; }
        .sd-plant-btn:hover  { background:var(--canopy); }
        .sd-plant-btn:active { transform:scale(.98); }
        .sd-complete-btn { padding:12px 26px;background:linear-gradient(135deg,#16a34a,#0d3320);color:white;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .15s,transform .1s;flex-shrink:0;display:flex;align-items:center;gap:8px; }
        .sd-complete-btn:hover  { opacity:.9; }
        .sd-complete-btn:active { transform:scale(.98); }

        /* gallery */
        .sd-gallery { display:grid;gap:8px;margin-bottom:32px; }
        .sd-gallery.has-1    { grid-template-columns:1fr; }
        .sd-gallery.has-2    { grid-template-columns:1fr 1fr; }
        .sd-gallery.has-3    { grid-template-columns:2fr 1fr;grid-template-rows:200px 200px; }
        .sd-gallery.has-many { grid-template-columns:2fr 1fr;grid-template-rows:200px 200px; }
        .sd-gallery-cell { border-radius:12px;overflow:hidden;cursor:pointer;position:relative;background:var(--mist); }
        .sd-gallery-cell img { width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s; }
        .sd-gallery-cell:hover img { transform:scale(1.04); }
        .sd-gallery-cell:first-child { grid-row:1/3; }
        .sd-gallery-cell.col2-top { grid-column:2;grid-row:1; }
        .sd-gallery-cell.col2-bot { grid-column:2;grid-row:2;position:relative; }
        .sd-gallery-more { position:absolute;inset:0;background:rgba(13,51,32,.65);display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:700;font-family:'Fraunces',serif;backdrop-filter:blur(2px); }
        .sd-no-img { height:200px;border-radius:12px;background:var(--mist);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--smoke);font-size:13.5px;margin-bottom:32px; }
        .sd-no-img span { font-size:32px;opacity:.4; }

        /* TABS */
        .sd-tabs { display:flex;gap:0;border-bottom:2px solid var(--line);margin-bottom:24px; }
        .sd-tab { padding:12px 22px;font-size:14px;font-weight:600;border:none;background:none;cursor:pointer;color:var(--smoke);border-bottom:2px solid transparent;margin-bottom:-2px;font-family:'DM Sans',sans-serif;transition:color .15s,border-color .15s;display:flex;align-items:center;gap:7px; }
        .sd-tab.active { color:var(--forest);border-bottom-color:var(--forest); }
        .sd-tab:hover:not(.active) { color:var(--leaf); }
        .sd-tab-badge { background:var(--mist);color:var(--canopy);border-radius:20px;padding:2px 8px;font-size:11px;font-weight:700; }

        .sd-body { display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start; }

        .sd-card { background:var(--white);border-radius:16px;border:1px solid var(--line);box-shadow:var(--sh);padding:28px 30px; }
        .sd-card + .sd-card { margin-top:20px; }

        .sd-card-head { display:flex;align-items:center;gap:12px;padding-bottom:18px;border-bottom:1px solid var(--line);margin-bottom:20px; }
        .sd-card-icon { width:38px;height:38px;border-radius:10px;background:var(--mist);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0; }
        .sd-card-head h3 { font-size:16px;font-weight:600;color:var(--forest); }
        .sd-card-head p  { font-size:12.5px;color:var(--smoke);margin-top:2px; }

        .sd-refresh-btn { margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;border:1.5px solid var(--line);background:white;color:var(--forest);transition:all .18s;white-space:nowrap;flex-shrink:0; }
        .sd-refresh-btn:hover:not(:disabled) { border-color:var(--leaf);background:var(--mist);color:var(--canopy); }
        .sd-refresh-btn:disabled { opacity:.55;cursor:not-allowed; }
        .sd-refresh-btn.is-loading { color:var(--smoke);border-color:var(--line); }
        .sd-refresh-btn.is-success { border-color:#16a34a;background:#f0fdf4;color:#16a34a; }
        .sd-refresh-btn.is-error   { border-color:var(--danger);background:#fff5f5;color:var(--danger); }

        .sd-refresh-error { margin-bottom:14px;padding:9px 14px;background:#fff5f5;border:1px solid #fecaca;border-radius:8px;font-size:12.5px;color:var(--danger);display:flex;align-items:center;gap:8px; }

        .sd-recs-empty { text-align:center;padding:32px 20px;color:var(--smoke);font-size:13.5px;border:1.5px dashed var(--line);border-radius:10px; }
        .sd-recs-empty span { font-size:28px;display:block;margin-bottom:8px;opacity:.5; }

        .sd-recs { display:flex;flex-direction:column;gap:10px; }
        .sd-rec { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:var(--sand);border-radius:9px;border:1px solid var(--line);animation:recFadeIn .3s ease both; }
        @keyframes recFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .sd-rec-name   { font-size:14px;font-weight:600;color:var(--forest); }
        .sd-rec-reason { font-size:12.5px;color:var(--smoke);margin-top:2px; }
        .sd-rec-score  { font-family:'Fraunces',serif;font-size:18px;color:var(--leaf);flex-shrink:0; }
        .sd-rec-bar-wrap { width:60px;height:4px;background:var(--line);border-radius:2px;flex-shrink:0; }
        .sd-rec-bar { height:100%;border-radius:2px;background:var(--leaf); }

        .sd-rec-skeleton { height:58px;border-radius:9px;background:linear-gradient(90deg,var(--sand) 25%,#edf2ed 50%,var(--sand) 75%);background-size:200% 100%;animation:shimmer 1.2s infinite;border:1px solid var(--line); }
        @keyframes shimmer { to{background-position:-200% 0} }

        .sd-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:12px; }
        .sd-stat { background:var(--sand);border-radius:10px;padding:14px 16px;display:flex;align-items:flex-start;gap:10px;border:1px solid var(--line); }
        .sd-stat-icon { font-size:18px;flex-shrink:0;margin-top:1px; }
        .sd-stat-val  { font-family:'Fraunces',serif;font-size:20px;color:var(--forest);line-height:1; }
        .sd-stat-lbl  { font-size:11px;text-transform:uppercase;letter-spacing:.7px;color:var(--smoke);margin-top:2px; }
        .sd-stat-sub  { font-size:11.5px;color:var(--smoke);margin-top:1px; }

        .sd-info-grid { display:grid;grid-template-columns:1fr 1fr;gap:0; }
        .sd-info-row  { display:flex;flex-direction:column;gap:3px;padding:12px 0;border-bottom:1px solid #f3f3f1; }
        .sd-info-row:nth-child(odd)  { padding-right:20px; }
        .sd-info-row:nth-child(even) { padding-left:20px;border-left:1px solid #f3f3f1; }
        .sd-info-label { font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--smoke); }
        .sd-info-value { font-size:14px;color:var(--ink);font-weight:500; }

        /* ── REVIEWS TAB ── */
        .rv-header { display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px; }
        .rv-header-title { font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:var(--forest); }
        .rv-see-all-link {
          display:inline-flex;align-items:center;gap:5px;
          font-size:13px;font-weight:600;color:var(--leaf);
          text-decoration:none;transition:color .15s;
        }
        .rv-see-all-link:hover { color:var(--forest); }

        .rv-summary-inline { display:flex;align-items:center;gap:16px;padding:14px 18px;background:var(--sand);border-radius:10px;border:1px solid var(--line);margin-bottom:20px;flex-wrap:wrap; }
        .rv-big { font-family:'Fraunces',serif;font-size:38px;color:var(--forest);line-height:1; }

        .rv-list { display:flex;flex-direction:column;gap:12px;margin-bottom:20px; }
        .rv-card { background:var(--sand);border-radius:12px;border:1px solid var(--line);padding:16px 18px; }
        .rv-card-top { display:flex;align-items:center;gap:10px;margin-bottom:10px; }
        .rv-avatar { width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--canopy),var(--sprout));color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0; }
        .rv-name { font-size:13.5px;font-weight:600;color:var(--ink); }
        .rv-date { font-size:11.5px;color:var(--smoke);margin-top:1px; }
        .rv-tag { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11.5px;font-weight:500;margin:2px 3px 2px 0; }
        .rv-tag-green { background:var(--mist);color:var(--canopy); }
        .rv-tag-blue  { background:#e0f2fe;color:#0c4a6e; }
        .rv-body-text { font-size:13px;color:var(--smoke);line-height:1.65;margin-top:9px;font-style:italic;border-left:3px solid var(--leaf);padding-left:11px; }
        .rv-empty-state { text-align:center;padding:32px 16px;color:var(--smoke);font-size:13.5px; }
        .rv-empty-state span { font-size:32px;display:block;margin-bottom:8px;opacity:.4; }

        /* ── Write review inline ── */
        .wr-divider { border:none;border-top:1.5px solid var(--line);margin:24px 0; }
        .wr-box { background:var(--sand);border-radius:12px;border:1px solid var(--line);padding:22px 22px 18px; }
        .wr-title { font-family:'Fraunces',serif;font-size:17px;font-weight:600;color:var(--forest);margin-bottom:3px; }
        .wr-sub { font-size:12.5px;color:var(--smoke);margin-bottom:16px; }
        .wr-section { margin-bottom:14px; }
        .wr-label { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#4a5e52;display:block;margin-bottom:6px; }
        .wr-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
        .wr-field { display:flex;flex-direction:column;gap:5px; }
        .wr-select, .wr-textarea {
          padding:9px 12px;border:1.5px solid var(--line);border-radius:8px;
          font-family:'DM Sans',sans-serif;font-size:13px;
          background:#fff;color:var(--ink);outline:none;
          transition:border-color .2s,box-shadow .2s;width:100%;
        }
        .wr-select { appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7a72' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px; }
        .wr-select:focus, .wr-textarea:focus { border-color:var(--leaf);box-shadow:0 0 0 3px rgba(45,138,85,.1); }
        .wr-textarea { resize:none;min-height:80px;line-height:1.55; }
        .wr-error   { margin:10px 0;padding:8px 12px;background:#fff5f5;border:1px solid #fecaca;border-radius:7px;font-size:12.5px;color:var(--danger); }
        .wr-success { margin:10px 0;padding:8px 12px;background:#f0fdf4;border:1px solid #86efac;border-radius:7px;font-size:12.5px;color:#14532d;font-weight:500; }
        .wr-submit { margin-top:14px;padding:10px 22px;background:var(--forest);color:white;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:background .15s,transform .1s; }
        .wr-submit:hover:not(:disabled) { background:var(--canopy); }
        .wr-submit:active:not(:disabled) { transform:scale(.98); }
        .wr-submit:disabled { opacity:.45;cursor:not-allowed; }

        .sd-map-wrap { height:220px;border-radius:10px;overflow:hidden;margin-bottom:16px; }
        .sd-no-map { height:160px;border-radius:10px;background:var(--mist);display:flex;align-items:center;justify-content:center;color:var(--smoke);font-size:13px;margin-bottom:16px; }
        .sd-sidebar-meta { display:flex;flex-direction:column;gap:0;margin-bottom:18px; }
        .sd-sidebar-row { display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f3f3f1;font-size:13.5px; }
        .sd-sidebar-row:last-child { border-bottom:none; }
        .sd-sidebar-key   { color:var(--smoke); }
        .sd-sidebar-value { font-weight:500;color:var(--ink); }

        .sd-plant-btn-full { width:100%;padding:13px;background:var(--forest);color:white;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14.5px;font-weight:600;cursor:pointer;transition:background .15s;text-align:center; }
        .sd-plant-btn-full:hover { background:var(--canopy); }
        .sd-complete-btn-full { width:100%;padding:13px;background:linear-gradient(135deg,#16a34a,#0d3320);color:white;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14.5px;font-weight:600;cursor:pointer;text-align:center;transition:opacity .15s;display:flex;align-items:center;justify-content:center;gap:8px; }
        .sd-complete-btn-full:hover { opacity:.9; }
        .sd-share-btn { width:100%;padding:10px;background:white;color:var(--forest);border:1.5px solid var(--line);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;margin-top:10px;transition:border-color .15s; }
        .sd-share-btn:hover { border-color:var(--forest); }
        .sd-btn-back { padding:10px 20px;background:var(--forest);color:white;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;margin-top:12px; }

        .sd-banner { display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;margin-bottom:20px;font-size:13.5px;font-weight:500; }
        .sd-banner-plant { background:#f0fdf4;border:1.5px solid #86efac;color:#14532d; }
        .sd-banner-done  { background:#eff6ff;border:1.5px solid #93c5fd;color:#1e3a5f; }
        .sd-banner-icon  { font-size:20px;flex-shrink:0; }

        .sd-lb-overlay { position:fixed;inset:0;background:rgba(0,0,0,.93);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px; }
        .sd-lb-close { position:absolute;top:18px;right:18px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.12);border:none;color:white;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s; }
        .sd-lb-close:hover { background:rgba(255,255,255,.22); }
        .sd-lb-main { position:relative;max-width:840px;width:100%;display:flex;align-items:center;justify-content:center;flex:1; }
        .sd-lb-main img { max-height:68vh;max-width:100%;border-radius:12px;object-fit:contain;box-shadow:0 8px 48px rgba(0,0,0,.5); }
        .sd-lb-nav { position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.12);border:none;color:white;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;backdrop-filter:blur(4px); }
        .sd-lb-nav:hover { background:rgba(255,255,255,.22); }
        .sd-lb-nav.prev { left:-54px; }
        .sd-lb-nav.next { right:-54px; }
        .sd-lb-count { color:rgba(255,255,255,.5);font-size:13px;margin-top:12px;font-family:'DM Sans',sans-serif; }
        .sd-lb-thumbs { display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;justify-content:center;max-width:840px; }
        .sd-lb-thumb { width:50px;height:50px;border-radius:7px;overflow:hidden;border:2px solid transparent;cursor:pointer;opacity:.5;transition:all .15s; }
        .sd-lb-thumb.on { border-color:white;opacity:1; }
        .sd-lb-thumb img { width:100%;height:100%;object-fit:cover; }

        .sd-vol-overlay { position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px; }
        .sd-vol-modal { background:white;border-radius:16px;padding:36px;width:100%;max-width:420px;box-shadow:var(--sh-lg);display:flex;flex-direction:column;gap:16px; }
        .sd-vol-modal h2 { font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:var(--forest); }
        .sd-vol-modal p  { font-size:13.5px;color:var(--smoke);line-height:1.65; }
        .sd-vol-label { font-size:12.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#4a5e52; }
        .sd-vol-textarea { width:100%;padding:10px 14px;border:1.5px solid var(--line);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;resize:none;min-height:88px;outline:none;transition:border-color .2s;margin-top:6px; }
        .sd-vol-textarea:focus { border-color:var(--leaf);box-shadow:0 0 0 3px rgba(45,138,85,.1); }
        .sd-vol-actions { display:flex;gap:10px;justify-content:flex-end; }
        .sd-vol-cancel { padding:9px 18px;border-radius:7px;border:1.5px solid var(--line);background:white;color:var(--smoke);font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer; }
        .sd-vol-submit { padding:9px 22px;border-radius:7px;background:var(--forest);color:white;border:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s; }
        .sd-vol-submit:hover { background:var(--canopy); }

        @media(max-width:900px){
          .sd-page { padding:28px 16px 60px; }
          .sd-body { grid-template-columns:1fr; }
          .sd-stats { grid-template-columns:1fr 1fr; }
          .sd-gallery.has-3,.sd-gallery.has-many { grid-template-columns:1fr 1fr;grid-template-rows:auto; }
          .sd-gallery-cell:first-child { grid-row:auto; }
          .sd-lb-nav.prev { left:-6px; }
          .sd-lb-nav.next { right:-6px; }
          .wr-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="sd-page">

        <button className="sd-back" onClick={() => navigate(-1)}>← Back to browse</button>

        {/* hero */}
        <motion.div className="sd-hero"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
          <div className="sd-hero-left">
            <h1 className="sd-title">{land.title || "Unnamed Land"}</h1>
            {land.centroidLat && (
              <p className="sd-coords">📍 {land.centroidLat.toFixed(5)}, {land.centroidLng.toFixed(5)}</p>
            )}
            <div className="sd-badges">
              {land.landStatus && (
                <Chip color={
                  land.landStatus === "Barren" ? "amber" :
                  land.landStatus === "Under Plantation" ? "purple" :
                  land.landStatus === "Plantation Complete" ? "blue" : "green"
                }>{land.landStatus}</Chip>
              )}
              {land.status && (
                <Chip color={land.status === "APPROVED" ? "green" : land.status === "REJECTED" ? "red" : "amber"}>
                  {land.status === "APPROVED" ? "✓ Verified" : land.status === "REJECTED" ? "✗ Rejected" : "⏳ Pending"}
                </Chip>
              )}
              {land.permissionStatus && (
                <Chip color={land.permissionStatus.toLowerCase().includes("yes") ? "green" : "gray"}>
                  {land.permissionStatus}
                </Chip>
              )}
            </div>
            <MiniStars value={Number(avgRating)} count={reviews.length} />
          </div>

          <div className="sd-hero-actions">
            {isMyPlantation ? (
              <button className="sd-complete-btn" onClick={() => setCompleteOpen(true)}>
                ✅ Mark Plantation Complete
              </button>
            ) : land.landStatus !== "Under Plantation" && land.landStatus !== "Plantation Complete" ? (
              <button className="sd-plant-btn" onClick={() => setPlantFormOpen(true)}>
                🌱 I want to plant here
              </button>
            ) : null}
          </div>
        </motion.div>

        {/* plantation status banner */}
        {land.landStatus === "Under Plantation" && (
          <div className="sd-banner sd-banner-plant">
            <span className="sd-banner-icon">🌿</span>
            <div>
              <strong>Plantation in progress</strong>
              {land.plantationDetail && (
                <span style={{ marginLeft: 8, fontWeight: 400 }}>
                  — {land.plantationDetail.teamSize} volunteers · {land.plantationDetail.treesToPlant} trees planned · {land.plantationDetail.method || ""}
                </span>
              )}
            </div>
          </div>
        )}
        {land.landStatus === "Plantation Complete" && (
          <div className="sd-banner sd-banner-done">
            <span className="sd-banner-icon">🎉</span>
            <div>
              <strong>Plantation complete!</strong>
              {land.completionDetail && (
                <span style={{ marginLeft: 8, fontWeight: 400 }}>
                  — {land.completionDetail.treesPlanted} trees planted
                  {land.completionDetail.moreCapacity ? ` · ${land.completionDetail.moreCapacity} more possible` : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* gallery */}
        {images.length === 0 ? (
          <div className="sd-no-img"><span>📷</span>No photos uploaded yet</div>
        ) : (
          <motion.div
            className={`sd-gallery has-${images.length === 1 ? "1" : images.length === 2 ? "2" : images.length === 3 ? "3" : "many"}`}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .08 }}>
            {images.slice(0, 3).map((img, i) => (
              <div key={img.id}
                className={`sd-gallery-cell${i === 1 ? " col2-top" : i === 2 ? " col2-bot" : ""}`}
                onClick={() => setGalleryIdx(i)}>
                <img src={`/uploads/${img.imageUrl}`} alt=""
                  onError={e => { e.target.src = "https://via.placeholder.com/600x400/e8f5ee/0d3320?text=🌿"; }} />
                {i === 2 && images.length > 3 && (
                  <div className="sd-gallery-more">+{images.length - 3}</div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* TABS */}
        <div className="sd-tabs">
          <button className={`sd-tab${activeTab === TAB_DETAILS ? " active" : ""}`}
            onClick={() => setActiveTab(TAB_DETAILS)}>
            🌍 Details
          </button>
          <button className={`sd-tab${activeTab === TAB_REVIEWS ? " active" : ""}`}
            onClick={() => setActiveTab(TAB_REVIEWS)}>
            ⭐ Reviews
            {reviews.length > 0 && <span className="sd-tab-badge">{reviews.length}</span>}
          </button>
        </div>

        <div className="sd-body">

          {/* ── LEFT ── */}
          <div>
            <AnimatePresence mode="wait">

              {activeTab === TAB_DETAILS && (
                <motion.div key="details"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: .25 }}>

                  <div className="sd-card" style={{ marginBottom: 20 }}>
                    <div className="sd-stats">
                      <StatCard icon="📐" label="Area"       value={land.areaSqm ? `${Number(land.areaSqm).toLocaleString()} m²` : "—"} />
                      <StatCard icon="🌱" label="Est. Trees"  value={approxTrees ? `~${approxTrees}` : "—"} sub="1 tree / 20 m²" />
                      <StatCard icon="💧" label="Water"       value={land.waterAvailable || "—"} />
                      <StatCard icon="🔁" label="Frequency"   value={land.waterFrequency || "—"} />
                    </div>
                  </div>

                  <div className="sd-card" style={{ marginBottom: 20 }}>
                    <div className="sd-card-head">
                      <div className="sd-card-icon">🌍</div>
                      <div><h3>Land Details</h3><p>Physical characteristics and access information</p></div>
                    </div>
                    <div className="sd-info-grid">
                      <InfoRow label="Land Status"     value={land.landStatus} />
                      <InfoRow label="Ownership"       value={land.ownershipType} />
                      <InfoRow label="Road Access"     value={land.accessRoad} />
                      <InfoRow label="Fencing"         value={land.fencing} />
                      <InfoRow label="Soil Type"       value={land.soilType} />
                      <InfoRow label="Nearby Landmark" value={land.nearbyLandmark} />
                      <InfoRow label="Owner Name"      value={land.ownerName} />
                      <InfoRow label="Owner Phone"     value={land.ownerPhone} />
                    </div>
                    {land.notes && (
                      <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--sand)", borderRadius: 9, fontSize: 13.5, color: "var(--smoke)", fontStyle: "italic", lineHeight: 1.65, borderLeft: "3px solid var(--leaf)" }}>
                        "{land.notes}"
                      </div>
                    )}
                  </div>

                  <div className="sd-card">
                    <div className="sd-card-head">
                      <div className="sd-card-icon">🌿</div>
                      <div>
                        <h3>Recommended Tree Species</h3>
                        <p>Based on land type, water availability, and local climate</p>
                      </div>
                      <button
                        className={`sd-refresh-btn${refreshStatus === "loading" ? " is-loading" : refreshStatus === "success" ? " is-success" : refreshStatus === "error" ? " is-error" : ""}`}
                        onClick={handleRefreshRecs}
                        disabled={refreshStatus === "loading"}
                        title="Re-run ML model">
                        {refreshStatus === "loading" && <SpinIcon />}
                        {refreshStatus === "success" && "✓"}
                        {refreshStatus === "error"   && "✕"}
                        {refreshStatus === "idle"    && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                          </svg>
                        )}
                        {refreshStatus === "loading" ? "Refreshing…" : refreshStatus === "success" ? "Updated!" : refreshStatus === "error" ? "Failed" : "Refresh"}
                      </button>
                    </div>

                    {refreshStatus === "error" && refreshError && (
                      <div className="sd-refresh-error">⚠️ {refreshError}</div>
                    )}

                    {refreshStatus === "loading" ? (
                      <div className="sd-recs">
                        {[1,2,3,4,5].map(n => <div key={n} className="sd-rec-skeleton" style={{ animationDelay: `${n * 0.07}s` }} />)}
                      </div>
                    ) : recs.length === 0 ? (
                      <div className="sd-recs-empty">
                        <span>🌱</span>
                        No recommendations yet.<br />
                        <small>Click <strong>Refresh</strong> to fetch from the ML model.</small>
                      </div>
                    ) : (
                      <div className="sd-recs">
                        {recs.map((r, idx) => (
                          <div key={r.id ?? idx} className="sd-rec" style={{ animationDelay: `${idx * 0.06}s` }}>
                            <div style={{ flex: 1 }}>
                              <div className="sd-rec-name">{r.plantName}</div>
                              {r.reason && <div className="sd-rec-reason">{r.reason}</div>}
                            </div>
                            {r.suitabilityScore != null && (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <span className="sd-rec-score">{Math.round(r.suitabilityScore * 100)}%</span>
                                <div className="sd-rec-bar-wrap">
                                  <div className="sd-rec-bar" style={{ width: `${r.suitabilityScore * 100}%` }} />
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

              {/* ══════ REVIEWS TAB ══════ */}
              {activeTab === TAB_REVIEWS && (
                <motion.div key="reviews"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: .25 }}>

                  <div className="sd-card">
                    {/* header row */}
                    <div className="rv-header">
                      <div>
                        <div className="rv-header-title">⭐ Community Reviews</div>
                        <div style={{ fontSize: 12.5, color: "var(--smoke)", marginTop: 3 }}>
                          Feasibility &amp; permission assessments from the field
                        </div>
                      </div>
                      <Link to={`/lands/${id}/reviews`} className="rv-see-all-link">
                        See all reviews ↗
                      </Link>
                    </div>

                    {/* summary bar — shown when reviews exist */}
                    {reviews.length > 0 && (
                      <div className="rv-summary-inline">
                        <div className="rv-big">{avgRating}</div>
                        <div>
                          <MiniStars value={Number(avgRating)} count={reviews.length} />
                          <div style={{ fontSize: 12, color: "var(--smoke)", marginTop: 3 }}>avg. community rating</div>
                        </div>
                      </div>
                    )}

                    {/* preview: latest 3 reviews */}
                    {reviews.length === 0 ? (
                      <div className="rv-empty-state">
                        <span>🌿</span>
                        No reviews yet — be the first to assess this site!
                      </div>
                    ) : (
                      <div className="rv-list">
                        {reviews.slice(0, 3).map((rv, i) => (
                          <div key={rv.id ?? i} className="rv-card">
                            <div className="rv-card-top">
                              <div className="rv-avatar">{rv.userName?.[0]?.toUpperCase() || "?"}</div>
                              <div>
                                <div className="rv-name">{rv.userName || "Anonymous"}</div>
                                <div className="rv-date">
                                  {rv.createdAt ? new Date(rv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                                </div>
                              </div>
                              <div style={{ marginLeft: "auto" }}>
                                <MiniStars value={rv.rating || 0} />
                              </div>
                            </div>
                            {rv.feasibilityNote && <span className="rv-tag rv-tag-green">✅ {rv.feasibilityNote}</span>}
                            {rv.permissionNote  && <span className="rv-tag rv-tag-blue">🔐 {rv.permissionNote}</span>}
                            {rv.body && <p className="rv-body-text">"{rv.body}"</p>}
                          </div>
                        ))}
                        {reviews.length > 3 && (
                          <Link to={`/lands/${id}/reviews`}
                            style={{ display: "block", textAlign: "center", fontSize: 13, color: "var(--leaf)", fontWeight: 600, textDecoration: "none", padding: "8px 0" }}>
                            + {reviews.length - 3} more reviews — view all ↗
                          </Link>
                        )}
                      </div>
                    )}

                    {/* ── WRITE REVIEW FORM inline ── */}
                    <hr className="wr-divider" />
                    <WriteReview
                      landId={id}
                      onPosted={created => setReviews(prev => [created, ...prev])}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .18 }}>
            <div className="sd-card">
              {hasMap ? (
                <div className="sd-map-wrap">
                  <MapContainer center={[land.centroidLat, land.centroidLng]} zoom={15}
                    style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[land.centroidLat, land.centroidLng]} />
                  </MapContainer>
                </div>
              ) : (
                <div className="sd-no-map">📍 No coordinates available</div>
              )}

              <div className="sd-sidebar-meta">
                <div className="sd-sidebar-row">
                  <span className="sd-sidebar-key">Status</span>
                  <span className="sd-sidebar-value">{land.status || "PENDING"}</span>
                </div>
                <div className="sd-sidebar-row">
                  <span className="sd-sidebar-key">Area</span>
                  <span className="sd-sidebar-value">{land.areaSqm ? `${Number(land.areaSqm).toLocaleString()} m²` : "—"}</span>
                </div>
                <div className="sd-sidebar-row">
                  <span className="sd-sidebar-key">Est. trees</span>
                  <span className="sd-sidebar-value">{approxTrees ? `~${approxTrees}` : "—"}</span>
                </div>
                <div className="sd-sidebar-row">
                  <span className="sd-sidebar-key">Submitted</span>
                  <span className="sd-sidebar-value">
                    {land.createdAt
                      ? new Date(land.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </span>
                </div>
                {reviews.length > 0 && (
                  <div className="sd-sidebar-row">
                    <span className="sd-sidebar-key">Community rating</span>
                    <span className="sd-sidebar-value">{avgRating} ⭐ ({reviews.length})</span>
                  </div>
                )}
              </div>

              {isMyPlantation ? (
                <button className="sd-complete-btn-full" onClick={() => setCompleteOpen(true)}>
                  ✅ Mark Plantation Complete
                </button>
              ) : land.landStatus !== "Under Plantation" && land.landStatus !== "Plantation Complete" ? (
                <button className="sd-plant-btn-full" onClick={() => setPlantFormOpen(true)}>
                  🌱 I want to plant here
                </button>
              ) : null}

              <button className="sd-share-btn" onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("Link copied!");
              }}>
                🔗 Share this land
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {galleryIdx !== null && (
          <motion.div className="sd-lb-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setGalleryIdx(null)}>
            <button className="sd-lb-close" onClick={() => setGalleryIdx(null)}>✕</button>
            <div className="sd-lb-main">
              {galleryIdx > 0 && (
                <button className="sd-lb-nav prev" onClick={() => setGalleryIdx(i => i - 1)}>‹</button>
              )}
              <motion.img key={galleryIdx}
                src={`/uploads/${images[galleryIdx]?.imageUrl}`}
                initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .18 }}
                onError={e => { e.target.src = "https://via.placeholder.com/800x600/e8f5ee/0d3320?text=🌿"; }} />
              {galleryIdx < images.length - 1 && (
                <button className="sd-lb-nav next" onClick={() => setGalleryIdx(i => i + 1)}>›</button>
              )}
            </div>
            <div className="sd-lb-count">{galleryIdx + 1} / {images.length}</div>
            <div className="sd-lb-thumbs">
              {images.map((img, i) => (
                <div key={img.id} className={`sd-lb-thumb ${i === galleryIdx ? "on" : ""}`}
                  onClick={() => setGalleryIdx(i)}>
                  <img src={`/uploads/${img.imageUrl}`}
                    onError={e => { e.target.src = "https://via.placeholder.com/50/e8f5ee/0d3320?text=🌿"; }} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLANTATION START FORM */}
      <AnimatePresence>
        {plantFormOpen && (
          <PlantationForm
            land={land}
            onClose={() => setPlantFormOpen(false)}
            onSuccess={() => {
              setPlantFormOpen(false);
              setLand(l => ({ ...l, landStatus: "Under Plantation" }));
            }}
          />
        )}
      </AnimatePresence>

      {/* COMPLETE PLANTATION MODAL */}
      <AnimatePresence>
        {completeOpen && (
          <CompletePlantationModal
            land={land}
            onClose={() => setCompleteOpen(false)}
            onSuccess={() => {
              setCompleteOpen(false);
              setLand(l => ({ ...l, landStatus: "Plantation Complete" }));
            }}
          />
        )}
      </AnimatePresence>

      {/* VOLUNTEER MODAL (legacy) */}
      <AnimatePresence>
        {volunteerOpen && (
          <motion.div className="sd-vol-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setVolunteerOpen(false)}>
            <motion.div className="sd-vol-modal"
              initial={{ scale: .95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: .95, opacity: 0 }} transition={{ duration: .15 }}>
              <h2>🌱 Volunteer to Plant</h2>
              <p>You're expressing interest in <strong>{land.title || "this land"}</strong>. Leave a note for the coordinator.</p>
              <div>
                <label className="sd-vol-label">Your message (optional)</label>
                <textarea className="sd-vol-textarea"
                  placeholder="e.g. I can bring a team of 5 on weekends…" />
              </div>
              <div className="sd-vol-actions">
                <button className="sd-vol-cancel" onClick={() => setVolunteerOpen(false)}>Cancel</button>
                <button className="sd-vol-submit" onClick={() => setVolunteerOpen(false)}>Register Interest →</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}