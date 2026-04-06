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

const STATUS = {
  PENDING:  { dot: "#f59e0b", text: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)",  label: "Pending Review" },
  APPROVED: { dot: "#4ade80", text: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.25)",  label: "Approved" },
  REJECTED: { dot: "#f87171", text: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", label: "Rejected" },
};

/* ─── Bone ─── */
function Bone({ style = {} }) {
  return (
    <div style={{
      background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "det-shimmer 1.4s infinite",
      borderRadius: 4,
      ...style,
    }} />
  );
}

function SkeletonDetail() {
  return (
    <div style={S.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <Bone style={{ height: 34, width: 140 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Bone style={{ height: 26, width: 110, borderRadius: 100 }} />
          <Bone style={{ height: 26, width: 60, borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <Bone style={{ height: 36, width: "60%", marginBottom: 10 }} />
        <Bone style={{ height: 14, width: "30%" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Bone style={{ height: 340, borderRadius: 10 }} />
          <Bone style={{ height: 100, borderRadius: 10 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Bone style={{ height: 160, borderRadius: 10 }} />
          <Bone style={{ height: 180, borderRadius: 10 }} />
          <Bone style={{ height: 130, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Data row ─── */
function DataRow({ label, value }) {
  if (!value && value !== false && value !== 0) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", minWidth: 96, paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
        {String(value)}
      </div>
    </div>
  );
}

/* ─── Panel (side card) ─── */
function Panel({ title, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* ─── Section card ─── */
function SectionCard({ title, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "22px 24px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14, paddingBottom: 11, borderBottom: "1px solid var(--border)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* ─── Main ─── */
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
      await axios.post(`${BASE_URL}/lands/${landId}/verify`, null, { withCredentials: true, params: { vote, userId: user.id } });
      const res = await axios.get(`${BASE_URL}/api/lands/${landId}`, { withCredentials: true });
      setLand(res.data);
      if (onVote) onVote(landId, vote);
    } catch { alert("Error processing vote"); }
    finally { setVoting(v => ({ ...v, [landId]: null })); }
  };

  if (loading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root{--bg:#0c0f0d;--surface:#131812;--surface2:#1a2019;--border:rgba(255,255,255,0.07);--text:#e8f0eb;--muted:#6b7e71;--green:#4ade80;--mono:'JetBrains Mono',monospace;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--bg);color:var(--text);}
        @keyframes det-shimmer{to{background-position:-200% 0;}}
      `}</style>
      <SkeletonDetail />
    </>
  );

  if (error) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:#0c0f0d;}`}</style>
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'DM Sans', sans-serif" }}>
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p style={{ color: "#f87171" }}>{error}</p>
        <button onClick={onBack} style={S.backBtn}>← Back to Queue</button>
      </div>
    </>
  );

  const imageUrls = images.map(i => i.imageUrl);
  const st        = STATUS[land.status] || STATUS.PENDING;
  const isVoting  = voting[landId] || externalVoting?.[landId];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:#0c0f0d; --surface:#131812; --surface2:#1a2019;
          --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
          --text:#e8f0eb; --muted:#6b7e71; --subtle:#3a4a3d;
          --green:#4ade80; --green2:#22c55e; --green-dim:rgba(74,222,128,0.12);
          --amber:#fbbf24; --red:#f87171;
          --mono:'JetBrains Mono',monospace;
        }
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;}
        @keyframes det-shimmer{to{background-position:-200% 0;}}

        .det-thumb{cursor:pointer;border-radius:5px;overflow:hidden;border:2px solid transparent;transition:all 0.2s;}
        .det-thumb:hover{border-color:rgba(74,222,128,0.4);}
        .det-thumb.on{border-color:var(--green);}
        .det-thumb img{width:100%;height:52px;object-fit:cover;display:block;}

        .map-link{
          display:inline-flex;align-items:center;gap:6px;
          padding:7px 14px;background:var(--surface2);border:1px solid var(--border2);
          border-radius:6px;color:var(--green);font-size:12px;font-weight:600;
          text-decoration:none;transition:all 0.2s;font-family:'DM Sans',sans-serif;
        }
        .map-link:hover{background:rgba(74,222,128,0.08);border-color:rgba(74,222,128,0.3);}

        @media(max-width:900px){
          .det-main-grid{grid-template-columns:1fr !important;}
        }
        @media(max-width:600px){
          .det-page{padding:20px 16px 60px !important;}
        }
      `}</style>

      <div className="det-page" style={S.page}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <button onClick={onBack} style={S.backBtn} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}>
            ← Back to Queue
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
              {st.label}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", padding: "3px 9px", borderRadius: 5 }}>
              #{land.id}
            </span>
          </div>
        </div>

        {/* ── Title ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 6 }}>
            {land.title || "Untitled Land"}
          </h1>
          {land.nearbyLandmark && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
              📍 {land.nearbyLandmark}
            </div>
          )}
        </motion.div>

        {/* ── Main grid ── */}
        <div
          className="det-main-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, alignItems: "start" }}
        >

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Gallery */}
            {imageUrls.length > 0 ? (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ position: "relative", height: 340, background: "var(--surface2)" }}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={imageUrls[activeImg]}
                      alt={`Land ${activeImg + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onError={e => { e.target.src = "https://via.placeholder.com/600x340/0d1f12/3d7a52?text=🌿"; }}
                    />
                  </AnimatePresence>
                  <span style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", color: "#fff", fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 100 }}>
                    {activeImg + 1} / {imageUrls.length}
                  </span>
                </div>
                {imageUrls.length > 1 && (
                  <div style={{ display: "flex", gap: 6, padding: "10px 12px", background: "var(--surface2)", overflowX: "auto" }}>
                    {imageUrls.map((url, i) => (
                      <div
                        key={i}
                        className={`det-thumb${activeImg === i ? " on" : ""}`}
                        style={{ flexShrink: 0, width: 72 }}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={url} alt={`thumb-${i}`} onError={e => { e.target.src = "https://via.placeholder.com/72x52/0d1f12/3d7a52?text=🌿"; }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, height: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 40, opacity: 0.2 }}>🌍</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>NO IMAGES UPLOADED</span>
              </div>
            )}

            {/* Description */}
            {land.description && (
              <SectionCard title="Description">
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75 }}>{land.description}</p>
              </SectionCard>
            )}

            {/* Notes */}
            {land.notes && (
              <SectionCard title="Additional Notes">
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75 }}>{land.notes}</p>
              </SectionCard>
            )}

            {/* ML Recommendations */}
            {recommendations.length > 0 && (
              <SectionCard title="ML Plant Recommendations">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                  {recommendations.map((r, i) => (
                    <div key={i} style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 8, padding: "12px 14px" }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{r.plantName}</div>
                      {r.suitabilityScore != null && (
                        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)", marginBottom: 5 }}>
                          {(r.suitabilityScore * 100).toFixed(0)}% suitable
                        </div>
                      )}
                      {r.reason && <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{r.reason}</div>}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <SectionCard title={`Community Reviews — ${reviews.length}`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#fff" }}>
                          <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #1a4d2e, #22c55e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            {(r.userName || r.name || "?")?.[0]?.toUpperCase()}
                          </span>
                          {r.userName || r.name || `User #${r.userId}`}
                        </span>
                        <span style={{ color: "#fbbf24", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                          {"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}
                        </span>
                      </div>
                      {(r.feasibilityNote || r.permissionNote) && (
                        <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginBottom: 5 }}>
                          {r.feasibilityNote && `✅ ${r.feasibilityNote}`}
                          {r.feasibilityNote && r.permissionNote && "  ·  "}
                          {r.permissionNote && `🔐 ${r.permissionNote}`}
                        </p>
                      )}
                      {r.createdAt && (
                        <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginBottom: 7 }}>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                      {r.body && (
                        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.65, borderLeft: "2px solid var(--green)", paddingLeft: 10, fontStyle: "italic" }}>
                          "{r.body}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Action card */}
            {land.status === "PENDING" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ background: "var(--surface)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "22px 20px" }}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 10 }}>
                  ADMIN / DECISION
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                  Cast Your Vote
                </h3>
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 18 }}>
                  Review all details carefully before approving or rejecting.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => handleVote("APPROVE")}
                    disabled={!!isVoting}
                    style={{
                      width: "100%", padding: "11px", background: isVoting ? "rgba(74,222,128,0.1)" : "rgba(74,222,128,0.12)",
                      border: "1px solid rgba(74,222,128,0.35)", borderRadius: 7,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                      color: "var(--green)", cursor: isVoting ? "not-allowed" : "pointer",
                      opacity: isVoting ? 0.6 : 1, transition: "all 0.2s",
                    }}
                  >
                    {isVoting === "APPROVE" ? "⏳ Approving…" : "✓ Approve Submission"}
                  </button>
                  <button
                    onClick={() => handleVote("REJECT")}
                    disabled={!!isVoting}
                    style={{
                      width: "100%", padding: "11px", background: "rgba(248,113,113,0.06)",
                      border: "1px solid rgba(248,113,113,0.2)", borderRadius: 7,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                      color: "var(--red)", cursor: isVoting ? "not-allowed" : "pointer",
                      opacity: isVoting ? 0.6 : 1, transition: "all 0.2s",
                    }}
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
                style={{
                  background: land.status === "APPROVED" ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)",
                  border: `1px solid ${land.status === "APPROVED" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                  borderRadius: 10, padding: "18px 20px",
                }}
              >
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: land.status === "APPROVED" ? "var(--green)" : "var(--red)", marginBottom: 4 }}>
                  {land.status === "APPROVED" ? "✓ Approved" : "✕ Rejected"}
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>This submission has been {land.status.toLowerCase()}.</p>
              </motion.div>
            )}

            {/* Ownership */}
            <Panel title="Ownership">
              <DataRow label="Owner"     value={land.ownerName} />
              <DataRow label="Phone"     value={land.ownerPhone} />
              <DataRow label="Type"      value={land.ownershipType} />
              <DataRow label="Permission" value={land.permissionStatus} />
            </Panel>

            {/* Land info */}
            <Panel title="Land Info">
              <DataRow label="Area"       value={land.areaSqm ? `${land.areaSqm.toLocaleString()} sqm` : null} />
              <DataRow label="Hectares"   value={land.areaSqm ? `${(land.areaSqm / 10000).toFixed(3)} ha` : null} />
              <DataRow label="Soil"       value={land.soilType} />
              <DataRow label="Status"     value={land.landStatus} />
              <DataRow label="Fencing"    value={land.fencing !== undefined ? (land.fencing ? "Yes" : "No") : null} />
              <DataRow label="Road"       value={land.accessRoad} />
              <DataRow label="Landmark"   value={land.nearbyLandmark} />
            </Panel>

            {/* Water */}
            <Panel title="Water">
              <DataRow label="Available"  value={land.waterAvailable} />
              <DataRow label="Frequency"  value={land.waterFrequency} />
            </Panel>

            {/* Location */}
            {(land.centroidLat || land.centroidLng) && (
              <Panel title="Coordinates">
                <DataRow label="Lat"  value={land.centroidLat?.toFixed(6)} />
                <DataRow label="Long" value={land.centroidLng?.toFixed(6)} />
                <div style={{ marginTop: 12 }}>
                  <a
                    href={`https://maps.google.com/?q=${land.centroidLat},${land.centroidLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    ↗ Open in Maps
                  </a>
                </div>
              </Panel>
            )}

            {/* Submission info */}
            <Panel title="Submission">
              <DataRow label="Land ID"  value={land.id} />
              <DataRow label="Submitted by" value={land.createdByName || land.submittedByName || (land.createdBy ? `User #${land.createdBy}` : null)} />
              <DataRow label="Date"     value={land.createdAt ? new Date(land.createdAt).toLocaleString("en-IN") : null} />
              <DataRow label="Photos"   value={images.length > 0 ? `${images.length} file${images.length > 1 ? "s" : ""}` : "None"} />
            </Panel>

          </div>
        </div>
      </div>
    </>
  );
}

const S = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 32px 80px",
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    background: "#0c0f0d",
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", background: "#131812", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
    color: "#e8f0eb", cursor: "pointer", transition: "all 0.2s",
  },
};