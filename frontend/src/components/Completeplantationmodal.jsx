import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const BASE_URL = import.meta.env.VITE_API_URL;

/* ─────────────────────────────────────────────────────────────────
   CompletePlantationModal
   Shown to the user who originally marked the land "Under Plantation".
   Collects:
     • image proof (1–5 photos)
     • trees actually planted
     • additional capacity (how many more can be planted)
     • brief notes
   Then POSTs to /api/lands/my/:id/plantation-complete
   ───────────────────────────────────────────────────────────────── */
export default function CompletePlantationModal({ land, onClose, onSuccess }) {
  const [form, setForm] = useState({
    treesPlanted: "",
    moreCapacity: "",
    notes: "",
  });
  const [photos, setPhotos] = useState([]);          // { file, previewUrl }[]
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* ── photo handling ── */
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

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!form.treesPlanted) { setError("Please enter how many trees were planted."); return; }
    if (photos.length === 0) { setError("Please upload at least one proof photo."); return; }
    setError(""); setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("treesPlanted",  form.treesPlanted);
      fd.append("moreCapacity",  form.moreCapacity);
      fd.append("notes",         form.notes);
      photos.forEach(p => fd.append("images", p.file));

      const res = await fetch(`${BASE_URL}/api/lands/${land.id}/plantation-complete`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || `Server error (${res.status})`);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .cp-overlay {
          position:fixed;inset:0;background:rgba(8,24,15,.58);
          z-index:10001;display:flex;align-items:center;justify-content:center;
          padding:20px;backdrop-filter:blur(6px);overflow-y:auto;
        }
        .cp-modal {
          background:#faf8f4;border-radius:22px;width:100%;max-width:560px;
          box-shadow:0 28px 90px rgba(13,51,32,.26);overflow:hidden;
          margin:auto;
        }
        .cp-header {
          background:linear-gradient(135deg,#0d3320 0%,#2d8a55 100%);
          padding:28px 32px 22px;position:relative;
        }
        .cp-header-badge {
          display:inline-flex;align-items:center;gap:6px;
          background:rgba(255,255,255,.15);border-radius:20px;
          padding:4px 12px;font-size:11.5px;color:rgba(255,255,255,.85);
          font-weight:600;letter-spacing:.4px;text-transform:uppercase;margin-bottom:10px;
        }
        .cp-header h2 { font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:#fff;letter-spacing:-.3px; }
        .cp-header p  { font-size:13px;color:rgba(255,255,255,.62);margin-top:4px; }
        .cp-close {
          position:absolute;top:16px;right:16px;width:32px;height:32px;
          border-radius:50%;background:rgba(255,255,255,.12);border:none;
          color:white;font-size:16px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:background .15s;
        }
        .cp-close:hover { background:rgba(255,255,255,.22); }

        .cp-body { padding:26px 32px 22px;display:flex;flex-direction:column;gap:18px; }

        /* photo uploader */
        .cp-drop {
          border:2px dashed #c5d5cc;border-radius:12px;padding:22px;
          text-align:center;cursor:pointer;transition:border-color .2s,background .2s;
          background:#f5f1eb;
        }
        .cp-drop.over { border-color:#2d8a55;background:#e8f5ee; }
        .cp-drop-icon { font-size:28px;margin-bottom:6px; }
        .cp-drop-text { font-size:13.5px;color:#4a5e52;font-weight:500; }
        .cp-drop-sub  { font-size:12px;color:#8a9e92;margin-top:3px; }
        .cp-photos { display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px; }
        .cp-photo-thumb {
          aspect-ratio:1;border-radius:9px;overflow:hidden;
          position:relative;border:1.5px solid #dde5e0;
        }
        .cp-photo-thumb img { width:100%;height:100%;object-fit:cover;display:block; }
        .cp-photo-remove {
          position:absolute;top:4px;right:4px;width:20px;height:20px;
          border-radius:50%;background:rgba(0,0,0,.65);color:white;
          border:none;cursor:pointer;font-size:11px;display:flex;
          align-items:center;justify-content:center;
        }

        /* form grid */
        .cp-grid { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
        .cp-field { display:flex;flex-direction:column;gap:6px; }
        .cp-field.full { grid-column:1/-1; }
        .cp-label {
          font-size:11.5px;font-weight:700;text-transform:uppercase;
          letter-spacing:.7px;color:#4a5e52;
        }
        .cp-req { color:#c0392b;margin-left:2px; }
        .cp-input, .cp-textarea {
          padding:10px 14px;border:1.5px solid #dde5e0;border-radius:9px;
          font-family:'DM Sans',sans-serif;font-size:14px;
          background:#fff;color:#0f1a14;outline:none;
          transition:border-color .2s,box-shadow .2s;width:100%;
        }
        .cp-input:focus, .cp-textarea:focus {
          border-color:#2d8a55;box-shadow:0 0 0 3px rgba(45,138,85,.1);
        }
        .cp-textarea { resize:none;min-height:72px;line-height:1.5; }
        .cp-hint { font-size:11.5px;color:#6b7a72;margin-top:2px; }

        .cp-error {
          padding:9px 14px;background:#fff5f5;border:1px solid #fecaca;
          border-radius:8px;font-size:12.5px;color:#c0392b;
          display:flex;align-items:center;gap:7px;
        }

        .cp-footer {
          padding:14px 32px 24px;display:flex;gap:10px;justify-content:flex-end;
          border-top:1px solid #e8ede9;
        }
        .cp-btn-cancel {
          padding:10px 20px;border-radius:9px;border:1.5px solid #dde5e0;
          background:#fff;color:#6b7a72;font-family:'DM Sans',sans-serif;
          font-size:14px;cursor:pointer;transition:border-color .15s;
        }
        .cp-btn-cancel:hover { border-color:#0d3320;color:#0d3320; }
        .cp-btn-submit {
          padding:10px 24px;border-radius:9px;border:none;
          background:linear-gradient(135deg,#16a34a,#0d3320);
          color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;
          font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;
          transition:opacity .15s,transform .1s;
        }
        .cp-btn-submit:hover:not(:disabled) { opacity:.9; }
        .cp-btn-submit:active:not(:disabled) { transform:scale(.98); }
        .cp-btn-submit:disabled { opacity:.45;cursor:not-allowed; }
        .cp-spin {
          width:13px;height:13px;border:2px solid rgba(255,255,255,.35);
          border-top-color:#fff;border-radius:50%;
          animation:cp-spin .6s linear infinite;
        }
        @keyframes cp-spin { to { transform:rotate(360deg) } }

        /* success state */
        .cp-success {
          text-align:center;padding:48px 32px;
          display:flex;flex-direction:column;align-items:center;gap:14px;
        }
        .cp-success-icon { font-size:52px; }
        .cp-success h3 { font-family:'Fraunces',serif;font-size:22px;color:#0d3320; }
        .cp-success p  { font-size:13.5px;color:#6b7a72;max-width:300px;line-height:1.6; }

        @media(max-width:540px) {
          .cp-body { padding:20px 18px; }
          .cp-footer { padding:12px 18px 20px; }
          .cp-grid { grid-template-columns:1fr; }
          .cp-header { padding:22px 18px 18px; }
        }
      `}</style>

      <motion.div className="cp-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && !submitting && onClose()}>
        <motion.div className="cp-modal"
          initial={{ scale: .93, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: .93, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}>

          <div className="cp-header">
            <button className="cp-close" onClick={onClose} disabled={submitting}>✕</button>
            <div className="cp-header-badge">🌳 Mark Complete</div>
            <h2>Plantation Complete!</h2>
            <p>{land?.title || "This site"} — submit your proof and final details</p>
          </div>

          <div className="cp-body">

            {/* Photo uploader */}
            <div>
              <label className="cp-label" style={{ display: "block", marginBottom: 8 }}>
                Photo Proof <span className="cp-req">*</span>
                <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#6b7a72", marginLeft: 6 }}>
                  (up to 5 images)
                </span>
              </label>

              {photos.length < 5 && (
                <div
                  className={`cp-drop${dragOver ? " over" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}>
                  <div className="cp-drop-icon">📸</div>
                  <div className="cp-drop-text">Click or drag photos here</div>
                  <div className="cp-drop-sub">JPG, PNG, WEBP — show the planted area</div>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden
                    onChange={e => addFiles(e.target.files)} />
                </div>
              )}

              {photos.length > 0 && (
                <div className="cp-photos">
                  {photos.map((p, i) => (
                    <div key={i} className="cp-photo-thumb">
                      <img src={p.previewUrl} alt="" />
                      <button className="cp-photo-remove" onClick={() => removePhoto(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Numbers */}
            <div className="cp-grid">
              <div className="cp-field">
                <label className="cp-label">Trees Planted <span className="cp-req">*</span></label>
                <input type="number" className="cp-input" placeholder="e.g. 95" min="1"
                  value={form.treesPlanted} onChange={e => set("treesPlanted", e.target.value)} />
                <span className="cp-hint">Actual number planted today</span>
              </div>

              <div className="cp-field">
                <label className="cp-label">More Can Be Planted</label>
                <input type="number" className="cp-input" placeholder="e.g. 40" min="0"
                  value={form.moreCapacity} onChange={e => set("moreCapacity", e.target.value)} />
                <span className="cp-hint">Remaining capacity estimate</span>
              </div>

              <div className="cp-field full">
                <label className="cp-label">Field Notes</label>
                <textarea className="cp-textarea"
                  placeholder="e.g. Soil was rocky in the north corner, water access good from the canal. Recommend native shrubs for perimeter…"
                  value={form.notes} onChange={e => set("notes", e.target.value)} />
              </div>
            </div>

            {error && <div className="cp-error">⚠️ {error}</div>}
          </div>

          <div className="cp-footer">
            <button className="cp-btn-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
            <button className="cp-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? <><div className="cp-spin" /> Uploading…</>
                : "✅ Mark Plantation Complete"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}