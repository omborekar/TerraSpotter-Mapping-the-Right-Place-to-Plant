/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Modal dialog for marking plantation as complete with proof photos.
 */
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function CompletePlantationModal({ land, onClose, onSuccess }) {
  const [form, setForm] = useState({ treesPlanted: "", moreCapacity: "", notes: "" });
  const [photos, setPhotos]       = useState([]);
  const [dragOver, setDragOver]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addFiles = files => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 5 - photos.length);
    setPhotos(prev => [...prev, ...valid.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))].slice(0, 5));
  };

  const removePhoto = idx => {
    setPhotos(prev => { URL.revokeObjectURL(prev[idx].previewUrl); return prev.filter((_, i) => i !== idx); });
  };

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
        method: "POST", credentials: "include", body: fd,
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
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg: #0c0f0d; --surface: #131812; --surface2: #1a2019;
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
          --text: #e8f0eb; --muted: #6b7e71; --subtle: #3a4a3d;
          --green: #4ade80; --green2: #22c55e; --green-dim: rgba(74,222,128,0.1);
          --red: #f87171; --mono: 'JetBrains Mono', monospace;
          --cream: #f5f0e8;
        }

        @keyframes cpm-spin { to { transform: rotate(360deg); } }
        @keyframes cpm-shimmer {
          0%{background-position:200% 0;} 100%{background-position:-200% 0;}
        }

        .cpm-overlay {
          position: fixed; inset: 0;
          background: rgba(8, 15, 10, 0.88);
          z-index: 10001;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; backdrop-filter: blur(16px) saturate(0.7);
          overflow-y: auto;
        }

        .cpm-modal {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 8px;
          width: 100%; max-width: 560px;
          box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,222,128,0.05);
          overflow: hidden; margin: auto;
        }

        /* ── HEADER ── */
        .cpm-header {
          background: linear-gradient(140deg, #081510 0%, #0d2a18 60%, #162e1e 100%);
          padding: 32px 36px 28px;
          position: relative; overflow: hidden;
          border-bottom: 1px solid rgba(74,222,128,0.12);
        }
        .cpm-header-glow {
          position: absolute; top: -40px; right: -40px;
          width: 180px; height: 180px; border-radius: 50%;
          background: radial-gradient(circle, rgba(74,222,128,0.12), transparent 70%);
          pointer-events: none;
        }
        .cpm-header-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--mono); font-size: 9px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--green); margin-bottom: 14px;
        }
        .cpm-header-tag-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--green);
          animation: cpm-pulse 2s ease-in-out infinite;
        }
        @keyframes cpm-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.5)} }

        .cpm-header h2 {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; color: var(--cream);
          letter-spacing: -0.02em; margin-bottom: 5px;
        }
        .cpm-header-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: var(--muted); font-weight: 300;
        }
        .cpm-close {
          position: absolute; top: 18px; right: 18px;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.06); border: 1px solid var(--border);
          color: var(--muted); font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .cpm-close:hover { background: rgba(255,255,255,0.12); color: var(--text); }

        /* ── BODY ── */
        .cpm-body {
          padding: 28px 36px 22px;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* Photo uploader */
        .cpm-upload-label {
          font-family: var(--mono); font-size: 9px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--green);
          display: block; margin-bottom: 10px;
        }
        .cpm-upload-label span {
          color: var(--muted); font-weight: 400;
          text-transform: none; letter-spacing: 0;
          font-family: 'DM Sans', sans-serif; font-size: 11px;
        }
        .cpm-drop {
          border: 1px dashed rgba(255,255,255,0.12); border-radius: 6px;
          padding: 26px; text-align: center; cursor: pointer;
          background: var(--surface2);
          transition: border-color 0.2s, background 0.2s;
        }
        .cpm-drop.over {
          border-color: rgba(74,222,128,0.4);
          background: rgba(74,222,128,0.04);
        }
        .cpm-drop:hover {
          border-color: rgba(255,255,255,0.2);
        }
        .cpm-drop-icon { font-size: 26px; margin-bottom: 7px; display: block; }
        .cpm-drop-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: var(--muted); font-weight: 400;
        }
        .cpm-drop-sub {
          font-family: var(--mono);
          font-size: 10px; color: var(--subtle); margin-top: 4px;
        }

        .cpm-photo-grid {
          display: grid; grid-template-columns: repeat(5, 1fr);
          gap: 7px; margin-top: 10px;
        }
        .cpm-photo-thumb {
          aspect-ratio: 1; border-radius: 5px; overflow: hidden;
          position: relative; border: 1px solid var(--border2);
        }
        .cpm-photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cpm-photo-rm {
          position: absolute; top: 3px; right: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(0,0,0,0.75); color: var(--text);
          border: none; cursor: pointer; font-size: 10px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .cpm-photo-rm:hover { background: rgba(248,113,113,0.7); }

        /* form fields */
        .cpm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .cpm-field { display: flex; flex-direction: column; gap: 7px; }
        .cpm-field.full { grid-column: 1 / -1; }
        .cpm-label {
          font-family: var(--mono); font-size: 9px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.2em; color: var(--green);
        }
        .cpm-label-req { color: var(--red); margin-left: 3px; }
        .cpm-input, .cpm-textarea {
          padding: 10px 14px;
          border: 1px solid var(--border2); border-radius: 5px;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          background: var(--surface2); color: var(--text); outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          width: 100%;
        }
        .cpm-input:focus, .cpm-textarea:focus {
          border-color: rgba(74,222,128,0.4);
          background: rgba(74,222,128,0.03);
          box-shadow: 0 0 0 3px rgba(74,222,128,0.07);
        }
        .cpm-input::placeholder, .cpm-textarea::placeholder { color: var(--subtle); }
        .cpm-textarea { resize: none; min-height: 76px; line-height: 1.55; }
        .cpm-hint {
          font-family: var(--mono); font-size: 9px; color: var(--subtle);
          letter-spacing: 0.05em;
        }

        /* error */
        .cpm-error {
          padding: 10px 14px;
          background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.2);
          border-radius: 5px; font-family: 'DM Sans', sans-serif;
          font-size: 12.5px; color: var(--red);
          display: flex; align-items: center; gap: 8px;
        }

        /* ── FOOTER ── */
        .cpm-footer {
          padding: 16px 36px 28px;
          display: flex; gap: 10px; justify-content: flex-end;
          border-top: 1px solid var(--border);
        }
        .cpm-btn-cancel {
          padding: 10px 20px; border-radius: 5px;
          border: 1px solid var(--border2); background: transparent;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          color: var(--muted); cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .cpm-btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
        .cpm-btn-submit {
          padding: 10px 24px; border-radius: 5px; border: none;
          background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.3);
          color: var(--green);
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s, opacity 0.2s;
        }
        .cpm-btn-submit:hover:not(:disabled) {
          background: rgba(74,222,128,0.2);
        }
        .cpm-btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .cpm-spin {
          width: 12px; height: 12px;
          border: 2px solid rgba(74,222,128,0.25); border-top-color: var(--green);
          border-radius: 50%; animation: cpm-spin 0.65s linear infinite;
        }

        @media(max-width:540px) {
          .cpm-body { padding: 20px 22px; }
          .cpm-footer { padding: 14px 22px 22px; }
          .cpm-grid { grid-template-columns: 1fr; }
          .cpm-header { padding: 26px 22px 22px; }
        }
      `}</style>

      <motion.div
        className="cpm-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && !submitting && onClose()}
      >
        <motion.div
          className="cpm-modal"
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        >
          {/* ── Header ── */}
          <div className="cpm-header">
            <div className="cpm-header-glow" />
            <button className="cpm-close" onClick={onClose} disabled={submitting}>✕</button>
            <div className="cpm-header-tag">
              <span className="cpm-header-tag-dot" />
              Mark Complete
            </div>
            <h2>Plantation Complete</h2>
            <p className="cpm-header-sub">
              {land?.title || "This site"} — submit proof photos and final details
            </p>
          </div>

          {/* ── Body ── */}
          <div className="cpm-body">

            {/* Photo uploader */}
            <div>
              <label className="cpm-upload-label">
                Photo Proof <span className="cpm-label-req">*</span>
                <span> — up to 5 images</span>
              </label>

              {photos.length < 5 && (
                <div
                  className={`cpm-drop${dragOver ? " over" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                >
                  <span className="cpm-drop-icon">📸</span>
                  <div className="cpm-drop-text">Click or drag photos here</div>
                  <div className="cpm-drop-sub">JPG · PNG · WEBP — show the planted area</div>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden
                    onChange={e => addFiles(e.target.files)} />
                </div>
              )}

              {photos.length > 0 && (
                <div className="cpm-photo-grid">
                  {photos.map((p, i) => (
                    <div key={i} className="cpm-photo-thumb">
                      <img src={p.previewUrl} alt="" />
                      <button className="cpm-photo-rm" onClick={() => removePhoto(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Numbers & notes */}
            <div className="cpm-grid">
              <div className="cpm-field">
                <label className="cpm-label">
                  Trees Planted <span className="cpm-label-req">*</span>
                </label>
                <input type="number" className="cpm-input" placeholder="e.g. 95" min="1"
                  value={form.treesPlanted} onChange={e => set("treesPlanted", e.target.value)} />
                <span className="cpm-hint">actual number planted</span>
              </div>

              <div className="cpm-field">
                <label className="cpm-label">More Can Be Planted</label>
                <input type="number" className="cpm-input" placeholder="e.g. 40" min="0"
                  value={form.moreCapacity} onChange={e => set("moreCapacity", e.target.value)} />
                <span className="cpm-hint">remaining capacity</span>
              </div>

              <div className="cpm-field full">
                <label className="cpm-label">Field Notes</label>
                <textarea className="cpm-textarea"
                  placeholder="e.g. Soil was rocky in the north corner, water access good from the canal…"
                  value={form.notes} onChange={e => set("notes", e.target.value)} />
              </div>
            </div>

            {error && <div className="cpm-error">⚠ {error}</div>}
          </div>

          {/* ── Footer ── */}
          <div className="cpm-footer">
            <button className="cpm-btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button className="cpm-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? <><div className="cpm-spin" /> Uploading…</>
                : "✓ Mark Plantation Complete"
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}