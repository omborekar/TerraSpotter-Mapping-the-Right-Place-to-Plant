import { useTranslation } from "react-i18next";
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Form to submit plantation completion details with photos.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const BASE_URL = import.meta.env.VITE_API_URL;

// PlantationForm — modal shown before marking land "Under Plantation"
// Props: land (needs .id, .title), onClose(), onSuccess()
export default function PlantationForm({ land, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    plannedDate: "",
    teamSize: "",
    method: "",
    treesToPlant: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.plannedDate || !form.teamSize || !form.treesToPlant) {
      setError("Please fill in the required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/lands/${land.id}/plantation-start`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plannedDate:   form.plannedDate,
          teamSize:      Number(form.teamSize),
          method:        form.method,
          treesToPlant:  Number(form.treesToPlant),
          notes:         form.notes,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || `Server error (${res.status})`);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .pf-overlay {
          position:fixed;inset:0;background:rgba(8,24,15,.52);
          z-index:10000;display:flex;align-items:center;justify-content:center;
          padding:20px;backdrop-filter:blur(4px);
        }
        .pf-modal {
          background:#faf8f4;border-radius:20px;width:100%;max-width:500px;
          box-shadow:0 24px 80px rgba(13,51,32,.22);overflow:hidden;
        }
        .pf-header {
          background:linear-gradient(135deg,#0d3320 0%,#1a5c38 100%);
          padding:28px 32px 24px;position:relative;
        }
        .pf-header h2 {
          font-family:'Fraunces',serif;font-size:22px;font-weight:600;
          color:#fff;letter-spacing:-.3px;line-height:1.2;
        }
        .pf-header p { font-size:13px;color:rgba(255,255,255,.65);margin-top:4px; }
        .pf-close {
          position:absolute;top:16px;right:16px;
          width:32px;height:32px;border-radius:50%;
          background:rgba(255,255,255,.12);border:none;
          color:white;font-size:16px;cursor:pointer;display:flex;
          align-items:center;justify-content:center;transition:background .15s;
        }
        .pf-close:hover { background:rgba(255,255,255,.22); }
        .pf-body { padding:28px 32px 24px; }
        .pf-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        .pf-field { display:flex;flex-direction:column;gap:6px; }
        .pf-field.full { grid-column:1/-1; }
        .pf-label {
          font-size:11.5px;font-weight:700;text-transform:uppercase;
          letter-spacing:.7px;color:#4a5e52;
        }
        .pf-req { color:#c0392b;margin-left:2px; }
        .pf-input, .pf-select, .pf-textarea {
          padding:10px 14px;border:1.5px solid #dde5e0;border-radius:9px;
          font-family:'DM Sans',sans-serif;font-size:14px;
          background:#fff;color:#0f1a14;outline:none;
          transition:border-color .2s,box-shadow .2s;
          width:100%;
        }
        .pf-input:focus, .pf-select:focus, .pf-textarea:focus {
          border-color:#2d8a55;box-shadow:0 0 0 3px rgba(45,138,85,.1);
        }
        .pf-textarea { resize:none;min-height:72px;line-height:1.5; }
        .pf-select { appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7a72' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px; }
        .pf-hint { font-size:11.5px;color:#6b7a72;margin-top:2px; }
        .pf-error {
          margin-top:4px;padding:9px 14px;background:#fff5f5;
          border:1px solid #fecaca;border-radius:8px;
          font-size:12.5px;color:#c0392b;display:flex;align-items:center;gap:7px;
        }
        .pf-footer {
          padding:16px 32px 24px;display:flex;gap:10px;justify-content:flex-end;
          border-top:1px solid #dde5e0;
        }
        .pf-btn-cancel {
          padding:10px 20px;border-radius:9px;border:1.5px solid #dde5e0;
          background:#fff;color:#6b7a72;font-family:'DM Sans',sans-serif;
          font-size:14px;cursor:pointer;transition:border-color .15s;
        }
        .pf-btn-cancel:hover { border-color:#0d3320;color:#0d3320; }
        .pf-btn-submit {
          padding:10px 24px;border-radius:9px;border:none;
          background:linear-gradient(135deg,#1a5c38,#0d3320);
          color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;
          font-weight:600;cursor:pointer;transition:opacity .15s,transform .1s;
          display:flex;align-items:center;gap:8px;
        }
        .pf-btn-submit:hover:not(:disabled) { opacity:.9; }
        .pf-btn-submit:active:not(:disabled) { transform:scale(.98); }
        .pf-btn-submit:disabled { opacity:.5;cursor:not-allowed; }
        .pf-spin {
          width:13px;height:13px;border:2px solid rgba(255,255,255,.35);
          border-top-color:#fff;border-radius:50%;
          animation:pf-spin .6s linear infinite;
        }
        @keyframes pf-spin { to { transform:rotate(360deg) } }
      `}</style>

      <motion.div className="pf-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="pf-modal"
          initial={{ scale: .94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: .94, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}>

          <div className="pf-header">
            <button className="pf-close" onClick={onClose}>✕</button>
            <h2>{t("auto.auto_250", "🌳 Start Plantation")}</h2>
            <p>{land?.title || "This land"} — fill in the details before marking active</p>
          </div>

          <div className="pf-body">
            <div className="pf-grid">

              <div className="pf-field">
                <label className="pf-label">{t("auto.auto_251", "Planned Date")} <span className="pf-req">*</span></label>
                <input type="date" className="pf-input"
                  value={form.plannedDate} onChange={e => set("plannedDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]} />
              </div>

              <div className="pf-field">
                <label className="pf-label">{t("auto.auto_252", "Team Size")} <span className="pf-req">*</span></label>
                <input type="number" className="pf-input" placeholder="e.g. 8"
                  min="1" max="500"
                  value={form.teamSize} onChange={e => set("teamSize", e.target.value)} />
                <span className="pf-hint">{t("auto.auto_253", "No. of volunteers")}</span>
              </div>

              <div className="pf-field">
                <label className="pf-label">{t("auto.auto_254", "Trees to Plant")} <span className="pf-req">*</span></label>
                <input type="number" className="pf-input" placeholder="e.g. 120"
                  min="1"
                  value={form.treesToPlant} onChange={e => set("treesToPlant", e.target.value)} />
              </div>

              <div className="pf-field">
                <label className="pf-label">{t("auto.auto_255", "Planting Method")}</label>
                <select className="pf-select"
                  value={form.method} onChange={e => set("method", e.target.value)}>
                  <option value="">{t("auto.auto_256", "— Select —")}</option>
                  <option value="Pit Planting">{t("auto.auto_257", "Pit Planting")}</option>
                  <option value="Miyawaki Method">{t("auto.auto_258", "Miyawaki Method")}</option>
                  <option value="Broadcast Seeding">{t("auto.auto_259", "Broadcast Seeding")}</option>
                  <option value="Sapling Transplant">{t("auto.auto_260", "Sapling Transplant")}</option>
                  <option value="Agro-forestry">{t("auto.auto_261", "Agro-forestry")}</option>
                  <option value="Other">{t("auto.auto_262", "Other")}</option>
                </select>
              </div>

              <div className="pf-field full">
                <label className="pf-label">{t("auto.auto_263", "Additional Notes")}</label>
                <textarea className="pf-textarea"
                  placeholder="e.g. We'll be bringing saplings from the nursery, need water tanker support…"
                  value={form.notes} onChange={e => set("notes", e.target.value)} />
              </div>

            </div>

            {error && (
              <div className="pf-error" style={{ marginTop: 14 }}>⚠️ {error}</div>
            )}
          </div>

          <div className="pf-footer">
            <button className="pf-btn-cancel" onClick={onClose}>{t("auto.auto_264", "Cancel")}</button>
            <button className="pf-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><div className="pf-spin" /> {t("auto.auto_265", "Marking…")}</> : "🌿 Mark as Under Plantation →"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}