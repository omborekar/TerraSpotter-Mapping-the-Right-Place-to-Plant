import { useTranslation } from "react-i18next";
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Modal for marking plantation complete — Verdant Editorial redesign.
*/
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function CompletePlantationModal({ land, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ treesPlanted: "", moreCapacity: "", notes: "" });
  const [photos, setPhotos] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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

  const handleSubmit = async () => {
    if (!form.treesPlanted) { setError("Please enter how many trees were planted."); return; }
    if (photos.length === 0) { setError("Please upload at least one proof photo."); return; }
    setError(""); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("treesPlanted", form.treesPlanted);
      fd.append("moreCapacity", form.moreCapacity);
      fd.append("notes", form.notes);
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
    <motion.div
      className="fixed inset-0 bg-[#0b1d10]/70 backdrop-blur-[7px] z-[10001] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-['Outfit',sans-serif]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && !submitting && onClose()}
    >
      <motion.div
        className="bg-[#f7f3ec] w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl my-auto border border-[#ede8de]"
        initial={{ scale: 0.93, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        {/* Header */}
        <div className="relative bg-[#0c1e11] px-7 sm:px-8 pt-7 pb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1e11] via-[#0f2916] to-[#071408]" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#4db87a]/10 blur-[80px]" />

          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/18 transition-all cursor-pointer flex items-center justify-center text-sm"
          >
            ✕
          </button>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-3">
              <span className="text-sm">🌳</span>
              <span className="text-[11px] font-semibold tracking-[2px] uppercase text-white/75 font-['Outfit',sans-serif]">
                {t("auto.auto_83", "Mark Complete")}
              </span>
            </div>
            <h2 className="font-['Cormorant_Garant',serif] text-[22px] sm:text-[26px] font-semibold text-white leading-tight mb-1">
              {t("auto.auto_84", "Plantation Complete!")}
            </h2>
            <p className="text-[13px] text-white/45 font-['Outfit',sans-serif] font-light">
              {land?.title || "This site"} — submit proof photos and final details
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 sm:px-8 py-6 flex flex-col gap-5">

          {/* Photo uploader */}
          <div>
            <label className="block text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] mb-3 font-['Outfit',sans-serif]">
              {t("auto.auto_85", "Photo Proof")} <span className="text-red-500">*</span>
              <span className="normal-case tracking-normal font-normal text-[#b5ac9e] ml-2">{t("auto.auto_86", "(up to 5 images)")}</span>
            </label>

            {photos.length < 5 && (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${dragOver
                    ? "border-[#4db87a] bg-emerald-50/60"
                    : "border-[#e0d8cf] bg-[#f2ede3] hover:border-[#4db87a]/50 hover:bg-emerald-50/40"
                  }`}
              >
                <div className="text-3xl mb-2">📸</div>
                <div className="text-[13.5px] font-medium text-[#5c5044] font-['Outfit',sans-serif]">
                  {t("auto.auto_87", "Click or drag photos here")}
                </div>
                <div className="text-[12px] text-[#b5ac9e] mt-1 font-['Outfit',sans-serif]">
                  {t("auto.auto_88", "JPG, PNG, WEBP — show the planted area")}
                </div>
                <input
                  ref={fileRef} type="file" accept="image/*" multiple hidden
                  onChange={e => addFiles(e.target.files)}
                />
              </div>
            )}

            {photos.length > 0 && (
              <div className={`grid grid-cols-5 gap-2 ${photos.length < 5 ? "mt-3" : ""}`}>
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-[1.5px] border-[#e0d8cf]">
                    <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/65 text-white border-none cursor-pointer text-[10px] flex items-center justify-center hover:bg-red-600/80 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Numbers grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] font-['Outfit',sans-serif]">
                {t("auto.auto_89", "Trees Planted")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number" min="1" placeholder="e.g. 95"
                value={form.treesPlanted} onChange={e => set("treesPlanted", e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4] transition-all"
              />
              <span className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif]">{t("auto.auto_90", "Actual number planted today")}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] font-['Outfit',sans-serif]">
                {t("auto.auto_91", "More Can Be Planted")}
              </label>
              <input
                type="number" min="0" placeholder="e.g. 40"
                value={form.moreCapacity} onChange={e => set("moreCapacity", e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4] transition-all"
              />
              <span className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif]">{t("auto.auto_92", "Remaining capacity estimate")}</span>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px] font-['Outfit',sans-serif]">
                {t("auto.auto_93", "Field Notes")}
              </label>
              <textarea
                placeholder="e.g. Soil was rocky in the north corner, water access good from the canal. Recommend native shrubs for perimeter…"
                value={form.notes} onChange={e => set("notes", e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4] transition-all resize-none min-h-[80px] leading-relaxed"
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200/80 rounded-xl text-[12.5px] text-red-700 font-medium font-['Outfit',sans-serif]"
              >
                <span className="shrink-0">⚠️</span> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 sm:px-8 py-5 border-t border-[#ede8de]">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border-[1.5px] border-[#e0d8cf] bg-white text-[13.5px] font-medium text-[#8a7d6e] font-['Outfit',sans-serif] hover:border-[#0c1e11] hover:text-[#0c1e11] transition-all cursor-pointer disabled:opacity-50"
          >
            {t("auto.auto_94", "Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0c1e11] text-white text-[13.5px] font-semibold font-['Outfit',sans-serif] hover:bg-[#163d25] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_4px_16px_rgba(12,30,17,0.2)]"
          >
            {submitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("auto.auto_95", "Uploading…")}
              </>
            ) : "✅ Mark Plantation Complete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}