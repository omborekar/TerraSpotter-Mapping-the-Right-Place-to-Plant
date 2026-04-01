import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;

const statusBadge = (status) => {
  const map = {
    PENDING:  { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Pending Review" },
    APPROVED: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Approved" },
    REJECTED: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", label: "Rejected" },
  };
  return map[status] || map.PENDING;
};

function InfoRow({ icon, label, value }) {
  if (!value && value !== false && value !== 0) return null;
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoIcon}>{icon}</span>
      <div>
        <div style={styles.infoLabel}>{label}</div>
        <div style={styles.infoValue}>{String(value)}</div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

export default function AdminLandDetail({ landId, user, onBack, onVote, voting: externalVoting }) {
  const [land, setLand]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [voting, setVoting]     = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews]   = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${BASE_URL}/api/lands/${landId}`, { withCredentials: true }),
      axios.get(`${BASE_URL}/api/lands/${landId}/recommendations`, { withCredentials: true }).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/api/lands/${landId}/reviews`, { withCredentials: true }).catch(() => ({ data: [] })),
    ])
      .then(([landRes, recRes, revRes]) => {
        setLand(landRes.data);
        setRecommendations(recRes.data || []);
        setReviews(revRes.data || []);
      })
      .catch(e => setError("Failed to load land details."))
      .finally(() => setLoading(false));
  }, [landId]);

  const handleVote = async (vote) => {
    setVoting(v => ({ ...v, [landId]: vote }));
    try {
      await axios.post(`${BASE_URL}/lands/${landId}/verify`, null, {
        withCredentials: true,
        params: { vote, userId: user.id },
      });
      // refresh land
      const res = await axios.get(`${BASE_URL}/api/lands/${landId}`, { withCredentials: true });
      setLand(res.data);
      if (onVote) onVote(landId, vote);
    } catch (err) {
      alert("Error processing vote");
    } finally {
      setVoting(v => ({ ...v, [landId]: null }));
    }
  };

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{ color: "#7a9485", marginTop: 16 }}>Loading land details…</p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <span style={{ fontSize: 40 }}>⚠️</span>
      <p style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p>
      <button style={styles.backBtn} onClick={onBack}>← Back to Queue</button>
    </div>
  );

  const images = land.images?.map(i => i.imageUrl) || land.imageUrls || [];
  const badge  = statusBadge(land.status);
  const isVoting = voting[landId] || externalVoting?.[landId];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --forest: #0b2e1a; --mid: #1f5c35; --leaf: #2d8a55; --sprout: #3db06e;
          --mint: #d4f0e0; --pale: #edf7f2; --white: #fff;
          --ink: #111b14; --body: #3d5244; --muted: #7a9485;
          --line: #dceee4; --sand: #f9fbf9;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--sand); }

        .det-thumb { cursor: pointer; transition: all 0.2s; border-radius: 8px; overflow: hidden; border: 2px solid transparent; }
        .det-thumb:hover { transform: scale(1.03); }
        .det-thumb.active { border-color: #2d8a55; }
        .det-thumb img { width: 100%; height: 60px; object-fit: cover; display: block; }

        .det-rec-card { background: #edf7f2; border: 1px solid #dceee4; border-radius: 12px; padding: 16px; }
        .det-rec-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #0b2e1a; margin-bottom: 6px; }
        .det-rec-score { font-size: 12px; font-weight: 600; color: #2d8a55; margin-bottom: 6px; }
        .det-rec-reason { font-size: 13px; color: #3d5244; line-height: 1.6; }

        .det-review-card { background: white; border: 1px solid #dceee4; border-radius: 12px; padding: 20px; }
        .det-review-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .det-review-user { font-size: 13px; font-weight: 600; color: #0b2e1a; }
        .det-review-rating { font-size: 13px; color: #d97706; font-weight: 700; }
        .det-review-body { font-size: 13.5px; color: #3d5244; line-height: 1.65; }

        .map-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #edf7f2; border: 1px solid #dceee4; border-radius: 8px; color: #1f5c35; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .map-link:hover { background: #d4f0e0; }
      `}</style>

      <div style={styles.page}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={onBack}>
            ← Back to Queue
          </button>
          <div style={styles.topRight}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
              {badge.label}
            </span>
            <span style={styles.idTag}>#{land.id}</span>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.titleBlock}
        >
          <h1 style={styles.pageTitle}>{land.title || "Untitled Land"}</h1>
          {land.nearbyLandmark && (
            <p style={styles.pageSub}>📍 Near {land.nearbyLandmark}</p>
          )}
        </motion.div>

        <div style={styles.mainGrid}>
          {/* LEFT — images + details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Gallery */}
            {images.length > 0 ? (
              <div style={styles.galleryCard}>
                <div style={styles.mainImgWrap}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={images[activeImg]}
                      alt={`Land image ${activeImg + 1}`}
                      style={styles.mainImg}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </AnimatePresence>
                  <span style={styles.imgCounter}>{activeImg + 1} / {images.length}</span>
                </div>
                {images.length > 1 && (
                  <div style={styles.thumbRow}>
                    {images.map((url, i) => (
                      <div
                        key={i}
                        className={`det-thumb${activeImg === i ? " active" : ""}`}
                        onClick={() => setActiveImg(i)}
                        style={{ flex: 1, minWidth: 60, maxWidth: 90 }}
                      >
                        <img src={url} alt={`thumb-${i}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.noImgCard}>
                <span style={{ fontSize: 48 }}>🌍</span>
                <p style={{ color: "#7a9485", marginTop: 12 }}>No images uploaded</p>
              </div>
            )}

            {/* Description */}
            {land.description && (
              <Section title="Description">
                <p style={{ fontSize: 14, color: "#3d5244", lineHeight: 1.75 }}>{land.description}</p>
              </Section>
            )}

            {/* Notes */}
            {land.notes && (
              <Section title="Additional Notes">
                <p style={{ fontSize: 14, color: "#3d5244", lineHeight: 1.75 }}>{land.notes}</p>
              </Section>
            )}

            {/* Plant Recommendations */}
            {recommendations.length > 0 && (
              <Section title="🌱 ML Plant Recommendations">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {recommendations.map((r, i) => (
                    <div key={i} className="det-rec-card">
                      <div className="det-rec-name">{r.plantName}</div>
                      {r.suitabilityScore && (
                        <div className="det-rec-score">
                          Suitability: {(r.suitabilityScore * 100).toFixed(0)}%
                        </div>
                      )}
                      {r.reason && <div className="det-rec-reason">{r.reason}</div>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Community Reviews */}
            {reviews.length > 0 && (
              <Section title={`💬 Community Reviews (${reviews.length})`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reviews.map((r, i) => (
                    <div key={i} className="det-review-card">
                      <div className="det-review-head">
                        <span className="det-review-user">User #{r.userId}</span>
                        <span className="det-review-rating">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      </div>
                      {r.feasibilityNote && <p style={{ fontSize: 12, color: "#7a9485", marginBottom: 6 }}>Feasibility: {r.feasibilityNote} · Permission: {r.permissionNote}</p>}
                      {r.body && <p className="det-review-body">{r.body}</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Action card */}
            {land.status === "PENDING" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={styles.actionCard}
              >
                <div style={styles.actionTitle}>Admin Decision</div>
                <p style={styles.actionSub}>Review all details before approving or rejecting this submission.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                  <button
                    style={styles.btnApprove}
                    onClick={() => handleVote("APPROVE")}
                    disabled={!!isVoting}
                  >
                    {isVoting === "APPROVE" ? "Approving…" : "✅ Approve Submission"}
                  </button>
                  <button
                    style={styles.btnReject}
                    onClick={() => handleVote("REJECT")}
                    disabled={!!isVoting}
                  >
                    {isVoting === "REJECT" ? "Rejecting…" : "❌ Reject Submission"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Ownership */}
            <div style={styles.sideCard}>
              <div style={styles.sideCardTitle}>Ownership Details</div>
              <InfoRow icon="👤" label="Owner Name"      value={land.ownerName} />
              <InfoRow icon="📞" label="Phone"           value={land.ownerPhone} />
              <InfoRow icon="🏷" label="Ownership Type" value={land.ownershipType} />
              <InfoRow icon="✅" label="Permission"     value={land.permissionStatus} />
            </div>

            {/* Land Info */}
            <div style={styles.sideCard}>
              <div style={styles.sideCardTitle}>Land Information</div>
              <InfoRow icon="📐" label="Area"          value={land.areaSqm ? `${land.areaSqm.toLocaleString()} sqm (${(land.areaSqm/10000).toFixed(3)} ha)` : null} />
              <InfoRow icon="🪨" label="Soil Type"     value={land.soilType} />
              <InfoRow icon="📊" label="Land Status"   value={land.landStatus} />
              <InfoRow icon="🔒" label="Fencing"       value={land.fencing !== undefined ? (land.fencing ? "Yes" : "No") : null} />
              <InfoRow icon="🛤" label="Access Road"   value={land.accessRoad} />
              <InfoRow icon="📍" label="Landmark"      value={land.nearbyLandmark} />
            </div>

            {/* Water */}
            <div style={styles.sideCard}>
              <div style={styles.sideCardTitle}>Water Availability</div>
              <InfoRow icon="💧" label="Available"  value={land.waterAvailable} />
              <InfoRow icon="🔁" label="Frequency"  value={land.waterFrequency} />
            </div>

            {/* Location */}
            {(land.centroidLat || land.centroidLng) && (
              <div style={styles.sideCard}>
                <div style={styles.sideCardTitle}>Location</div>
                <InfoRow icon="🌐" label="Latitude"  value={land.centroidLat?.toFixed(6)} />
                <InfoRow icon="🌐" label="Longitude" value={land.centroidLng?.toFixed(6)} />
                <div style={{ marginTop: 14 }}>
                  <a
                    href={`https://maps.google.com/?q=${land.centroidLat},${land.centroidLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    🗺 Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Submission meta */}
            <div style={styles.sideCard}>
              <div style={styles.sideCardTitle}>Submission Info</div>
              <InfoRow icon="🆔" label="Land ID"       value={land.id} />
              <InfoRow icon="👤" label="Submitted by"  value={land.createdBy ? `User #${land.createdBy}` : null} />
              <InfoRow icon="📅" label="Submitted on"  value={land.createdAt ? new Date(land.createdAt).toLocaleString("en-IN") : null} />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "36px 32px 80px",
    fontFamily: "'DM Sans', sans-serif",
    background: "#f9fbf9",
    minHeight: "100vh",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 28, gap: 16, flexWrap: "wrap",
  },
  topRight: { display: "flex", alignItems: "center", gap: 10 },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 18px", background: "white", border: "1px solid #dceee4",
    borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#0b2e1a",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  idTag: {
    fontSize: 12, fontWeight: 700, color: "#7a9485",
    background: "#f9fbf9", border: "1px solid #dceee4",
    padding: "4px 10px", borderRadius: 6,
  },
  titleBlock: { marginBottom: 32 },
  pageTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px,4vw,40px)",
    fontWeight: 800, color: "#0b2e1a", lineHeight: 1.15, marginBottom: 6,
  },
  pageSub: { fontSize: 15, color: "#7a9485" },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 28,
    alignItems: "start",
  },

  galleryCard: {
    background: "white", border: "1px solid #dceee4",
    borderRadius: 18, overflow: "hidden",
    boxShadow: "0 4px 20px rgba(11,46,26,0.06)",
  },
  mainImgWrap: { position: "relative", height: 380, background: "#edf7f2" },
  mainImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  imgCounter: {
    position: "absolute", bottom: 14, right: 14,
    background: "rgba(0,0,0,0.5)", color: "white", fontSize: 12,
    fontWeight: 600, padding: "4px 10px", borderRadius: 100,
    backdropFilter: "blur(4px)",
  },
  thumbRow: {
    display: "flex", gap: 8, padding: "12px 16px",
    overflowX: "auto", background: "white",
  },
  noImgCard: {
    background: "white", border: "1px solid #dceee4", borderRadius: 18,
    height: 280, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },

  section: {
    background: "white", border: "1px solid #dceee4",
    borderRadius: 16, padding: "24px 28px",
    boxShadow: "0 2px 8px rgba(11,46,26,0.04)",
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700,
    color: "#0b2e1a", marginBottom: 16, paddingBottom: 12,
    borderBottom: "1px solid #dceee4",
  },

  sideCard: {
    background: "white", border: "1px solid #dceee4",
    borderRadius: 16, padding: "22px 24px",
    boxShadow: "0 2px 8px rgba(11,46,26,0.04)",
  },
  sideCardTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
    color: "#0b2e1a", marginBottom: 14, paddingBottom: 10,
    borderBottom: "1px solid #dceee4", textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  infoRow: {
    display: "flex", gap: 12, alignItems: "flex-start",
    padding: "9px 0", borderBottom: "1px solid #f3f8f5",
  },
  infoIcon: { fontSize: 15, marginTop: 2, flexShrink: 0 },
  infoLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a9485", marginBottom: 2 },
  infoValue: { fontSize: 13.5, fontWeight: 500, color: "#111b14" },

  actionCard: {
    background: "linear-gradient(135deg, #0b2e1a, #1f5c35)",
    borderRadius: 16, padding: "28px 24px",
    boxShadow: "0 8px 32px rgba(11,46,26,0.2)",
  },
  actionTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
    color: "white", marginBottom: 6,
  },
  actionSub: { fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 },
  btnApprove: {
    width: "100%", padding: "13px", background: "#3db06e", color: "white",
    border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.2s", opacity: 1,
  },
  btnReject: {
    width: "100%", padding: "13px", background: "rgba(255,255,255,0.08)", color: "#fca5a5",
    border: "1.5px solid rgba(252,165,165,0.3)", borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
  },

  center: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "60vh", gap: 12,
    fontFamily: "'DM Sans', sans-serif", color: "#3d5244",
  },
  spinner: {
    width: 36, height: 36, borderRadius: "50%",
    border: "3px solid #dceee4", borderTopColor: "#2d8a55",
    animation: "spin 0.7s linear infinite",
  },
};