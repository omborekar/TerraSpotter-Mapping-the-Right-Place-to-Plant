import { useTranslation } from "react-i18next";
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Browse lands — Verdant Editorial redesign. Cormorant Garant + Outfit fonts.
*/
import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const BASE_URL = import.meta.env.VITE_API_URL;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── utils ────────────────────────────────────────────────────
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: e => onMapClick(e.latlng) });
  return null;
};

const statusConfig = (s) => {
  const map = {
    "Vacant": { dot: "bg-emerald-400", chip: "bg-emerald-50 text-emerald-800 border-emerald-200/80" },
    "Barren": { dot: "bg-amber-400", chip: "bg-amber-50 text-amber-800 border-amber-200/80" },
    "Roadside Strip": { dot: "bg-sky-400", chip: "bg-sky-50 text-sky-800 border-sky-200/80" },
    "Roadside": { dot: "bg-sky-400", chip: "bg-sky-50 text-sky-800 border-sky-200/80" },
    "Open Ground": { dot: "bg-green-400", chip: "bg-green-50 text-green-800 border-green-200/80" },
    "Agricultural (unused)": { dot: "bg-yellow-400", chip: "bg-yellow-50 text-yellow-800 border-yellow-200/80" },
    "Industrial Wasteland": { dot: "bg-red-400", chip: "bg-red-50 text-red-800 border-red-200/80" },
  };
  return map[s] || { dot: "bg-slate-400", chip: "bg-slate-50 text-slate-700 border-slate-200/80" };
};

// ─── Skeleton ────────────────────────────────────────────────
const Shimmer = ({ className = "" }) => (
  <div className={`rounded-xl bg-gradient-to-r from-[#f0ebe2] via-[#e8e2d8] to-[#f0ebe2] animate-pulse ${className}`} />
);

const GridSkeleton = () => (
  <div className="bg-white rounded-2xl border border-[#ede8de] overflow-hidden flex flex-col shadow-sm">
    <Shimmer className="h-48 rounded-none rounded-t-2xl" />
    <div className="p-5 flex flex-col gap-3">
      <Shimmer className="h-4 w-3/5" />
      <Shimmer className="h-3 w-2/5" />
      <div className="flex gap-2 mt-1">
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      <Shimmer className="h-10 w-full mt-2 rounded-xl" />
    </div>
  </div>
);

const ListSkeleton = () => (
  <div className="bg-white rounded-2xl border border-[#ede8de] overflow-hidden flex flex-row shadow-sm">
    <Shimmer className="w-52 shrink-0 rounded-none rounded-l-2xl h-[140px]" />
    <div className="p-5 flex flex-col gap-3 flex-1">
      <Shimmer className="h-4 w-2/5" />
      <Shimmer className="h-3 w-1/3" />
      <div className="flex gap-2 mt-1">
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      <Shimmer className="h-10 w-40 mt-auto rounded-xl" />
    </div>
  </div>
);

// ─── Image strip ─────────────────────────────────────────────
const ImageStrip = ({ landId, onOpenGallery, compact = false }) => {
  const [images, setImages] = useState([]);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/lands/${landId}/images`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setImages(data); })
      .catch(() => { })
      .finally(() => setImgLoading(false));
  }, [landId]);

  const h = compact ? "h-36 sm:h-full" : "h-48";

  if (imgLoading) return <Shimmer className={`${h} w-full rounded-none`} />;

  if (images.length === 0) return (
    <div className={`flex flex-col items-center justify-center gap-2 bg-[#f2ede3] ${h} w-full`}>
      <span className="text-3xl opacity-30">🌿</span>
      <p className="text-xs text-[#b5ac9e] font-['Outfit',sans-serif]">{t("auto.auto_38", "No photos yet")}</p>
    </div>
  );

  const shown = images.slice(0, 3);
  const extra = images.length - 3;

  return (
    <div
      onClick={() => onOpenGallery(images)}
      className={`relative overflow-hidden cursor-pointer bg-[#f2ede3] group ${h} w-full`}
    >
      <img
        src={shown[0]?.imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={e => { e.target.style.display = "none"; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Thumbnail row */}
      <div className="absolute bottom-3 left-3 flex items-end gap-0 z-10">
        {shown.map((img, i) => (
          <div
            key={img.id}
            className="w-11 h-11 rounded-lg overflow-hidden border-2 border-white shadow-md shrink-0"
            style={{ marginLeft: i === 0 ? 0 : -6, zIndex: shown.length - i }}
          >
            <img src={img.imageUrl} alt="" className="w-full h-full object-cover"
              onError={e => { e.target.style.display = "none"; }} />
          </div>
        ))}
        {extra > 0 && (
          <div className="w-8 h-8 rounded-full bg-[#0b1d10]/80 text-white flex items-center justify-center text-[10px] font-bold ml-1 border-2 border-white shadow-md shrink-0 font-['Outfit',sans-serif]">
            +{extra}
          </div>
        )}
      </div>

      {/* Hover pill */}
      <span className="absolute bottom-3 right-3 z-10 bg-[#0b1d10]/75 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 font-['Outfit',sans-serif]">
        {t("auto.auto_40", "View all →")}
      </span>
    </div>
  );
};

// ─── Grid Card ────────────────────────────────────────────────
const GridCard = ({ land, onOpenGallery, onNavigate }) => {
  const cfg = statusConfig(land.landStatus);
  const approxTrees = land.areaSqm ? Math.floor(land.areaSqm / 20) : null;

  return (
    <div className="bg-white rounded-2xl border border-[#ede8de] shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(12,30,17,0.1)] transition-all duration-300 group">
      {/* Image */}
      <div className="relative">
        <ImageStrip landId={land.id} onOpenGallery={onOpenGallery} />
        <span className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border font-['Outfit',sans-serif] ${cfg.chip}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
          {land.landStatus || "Unspecified"}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="font-['Cormorant_Garant',serif] text-[19px] font-semibold text-[#0c1e11] leading-snug line-clamp-1">
            {land.title || "Unnamed Land"}
          </h3>
          {land.centroidLat && land.centroidLng && (
            <p className="text-[11.5px] text-[#b5ac9e] mt-1 font-['Outfit',sans-serif]">
              📍 {land.centroidLat.toFixed(4)}, {land.centroidLng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#f7f3ec] rounded-xl px-3 py-2.5 flex flex-col">
            <span className="text-[10px] text-[#b5ac9e] uppercase tracking-[1.2px] font-semibold font-['Outfit',sans-serif] mb-0.5">{t("auto.auto_41", "Area")}</span>
            <span className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#0c1e11] leading-tight">
              {land.areaSqm ? Number(land.areaSqm).toLocaleString() : "—"}
              <span className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif] font-normal ml-1">{t("auto.auto_42", "m²")}</span>
            </span>
          </div>
          {approxTrees ? (
            <div className="bg-[#f7f3ec] rounded-xl px-3 py-2.5 flex flex-col">
              <span className="text-[10px] text-[#b5ac9e] uppercase tracking-[1.2px] font-semibold font-['Outfit',sans-serif] mb-0.5">{t("auto.auto_43", "~Trees")}</span>
              <span className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#2d8a55] leading-tight">
                {approxTrees}
                <span className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif] font-normal ml-1">{t("auto.auto_44", "est.")}</span>
              </span>
            </div>
          ) : <div />}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {land.waterAvailable && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f7f3ec] border border-[#ede8de] text-[#8a7d6e] font-['Outfit',sans-serif]">
              💧 {land.waterAvailable}
            </span>
          )}
          {land.ownershipType && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f7f3ec] border border-[#ede8de] text-[#8a7d6e] font-['Outfit',sans-serif]">
              🏛 {land.ownershipType}
            </span>
          )}
          {land.permissionStatus?.toLowerCase().includes("yes") && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-['Outfit',sans-serif]">
              {t("auto.auto_45", "✅ Permitted")}
            </span>
          )}
        </div>

        {land.notes && (
          <p className="text-[12px] text-[#b5ac9e] italic leading-relaxed line-clamp-2 font-['Outfit',sans-serif]">
            "{land.notes}"
          </p>
        )}

        <div className="mt-auto">
          <button
            onClick={() => onNavigate(land.id)}
            className="w-full py-3 rounded-xl bg-[#0c1e11] text-white text-[13.5px] font-semibold font-['Outfit',sans-serif] hover:bg-[#163d25] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 group-hover:bg-[#163d25]"
          >
            {t("auto.auto_46", "View site")}
            <span className="text-[#4db87a]">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── List Card ────────────────────────────────────────────────
const ListCard = ({ land, onOpenGallery, onNavigate }) => {
  const cfg = statusConfig(land.landStatus);
  const approxTrees = land.areaSqm ? Math.floor(land.areaSqm / 20) : null;

  return (
    <div className="bg-white rounded-2xl border border-[#ede8de] shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-[0_8px_32px_rgba(12,30,17,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Image */}
      <div className="relative sm:w-52 md:w-60 shrink-0">
        <ImageStrip landId={land.id} onOpenGallery={onOpenGallery} compact />
        <span className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border font-['Outfit',sans-serif] ${cfg.chip}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
          {land.landStatus || "Unspecified"}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-['Cormorant_Garant',serif] text-[19px] font-semibold text-[#0c1e11] leading-snug truncate">
              {land.title || "Unnamed Land"}
            </h3>
            {land.centroidLat && land.centroidLng && (
              <p className="text-[11.5px] text-[#b5ac9e] mt-0.5 font-['Outfit',sans-serif]">
                📍 {land.centroidLat.toFixed(4)}, {land.centroidLng.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {land.areaSqm && (
            <div className="flex items-baseline gap-1">
              <span className="font-['Cormorant_Garant',serif] text-[17px] font-semibold text-[#0c1e11]">
                {Number(land.areaSqm).toLocaleString()}
              </span>
              <span className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif]">{t("auto.auto_47", "m²")}</span>
            </div>
          )}
          {approxTrees && (
            <>
              <span className="w-px h-3 bg-[#e0d8cf]" />
              <div className="flex items-baseline gap-1">
                <span className="font-['Cormorant_Garant',serif] text-[17px] font-semibold text-[#2d8a55]">~{approxTrees}</span>
                <span className="text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif]">{t("auto.auto_48", "trees")}</span>
              </div>
            </>
          )}
          {land.waterAvailable && (
            <>
              <span className="w-px h-3 bg-[#e0d8cf]" />
              <span className="text-[11.5px] text-[#8a7d6e] font-['Outfit',sans-serif]">💧 {land.waterAvailable}</span>
            </>
          )}
          {land.ownershipType && (
            <span className="text-[11.5px] text-[#8a7d6e] font-['Outfit',sans-serif] hidden md:inline">🏛 {land.ownershipType}</span>
          )}
          {land.permissionStatus?.toLowerCase().includes("yes") && (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-['Outfit',sans-serif] hidden sm:inline-flex">
              {t("auto.auto_49", "✅ Permitted")}
            </span>
          )}
        </div>

        {land.notes && (
          <p className="text-[12px] text-[#b5ac9e] italic leading-relaxed line-clamp-1 font-['Outfit',sans-serif] hidden sm:block">
            "{land.notes}"
          </p>
        )}

        <div className="mt-auto">
          <button
            onClick={() => onNavigate(land.id)}
            className="py-2.5 px-5 rounded-xl bg-[#0c1e11] text-white text-[13.5px] font-semibold font-['Outfit',sans-serif] hover:bg-[#163d25] transition-colors duration-200 cursor-pointer inline-flex items-center gap-2"
          >
            {t("auto.auto_50", "View site")} <span className="text-[#4db87a]">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────
const Browse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [mapOpen, setMapOpen] = useState(false);
  const [pinLocation, setPinLocation] = useState(null);
  const [pinRadius, setPinRadius] = useState(50);
  const [gallery, setGallery] = useState(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/lands`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLands(data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mapOpen && mapRef.current) setTimeout(() => mapRef.current.invalidateSize(), 300);
  }, [mapOpen]);

  useEffect(() => {
    if (!gallery) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") setGalleryIdx(i => Math.min(i + 1, gallery.length - 1));
      if (e.key === "ArrowLeft") setGalleryIdx(i => Math.max(i - 1, 0));
      if (e.key === "Escape") setGallery(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gallery]);

  const handleMapClick = (latlng) => {
    setPinLocation({ lat: latlng.lat, lng: latlng.lng });
    setMapOpen(false);
  };

  const filtered = lands.filter(land => {
    const q = search.toLowerCase();
    const keyMatch =
      (land.title || "").toLowerCase().includes(q) ||
      (land.ownerName || "").toLowerCase().includes(q) ||
      (land.landStatus || "").toLowerCase().includes(q);
    const filterMatch = activeFilter ? land.landStatus === activeFilter : true;
    const pinMatch = pinLocation && land.centroidLat && land.centroidLng
      ? distanceKm(pinLocation.lat, pinLocation.lng, land.centroidLat, land.centroidLng) <= pinRadius
      : true;
    return keyMatch && filterMatch && pinMatch;
  });

  const statusTypes = [...new Set(lands.map(l => l.landStatus).filter(Boolean))];

  return (
    <>
      <Helmet>
        <title>{t("auto.auto_52", "TerraSpotter — Browse Sites")}</title>
        <meta name="description" content="Browse plantation sites available for afforestation." />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="min-h-screen bg-[#f7f3ec] font-['Outfit',sans-serif]">

        {/* ── PAGE HEADER ──────────────────────────── */}
        <div className="bg-[#0c1e11] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1e11] via-[#0f2916] to-[#081410]" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#163d25] opacity-30 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 mb-5">
                <div className="w-5 h-px bg-[#4db87a]/50" />
                <span className="text-[#4db87a] text-[10.5px] font-semibold tracking-[3px] uppercase">
                  {t("auto.auto_53", "Plantation sites")}
                </span>
              </div>
              <h1 className="font-['Cormorant_Garant',serif] text-[44px] sm:text-[56px] font-semibold text-white leading-[0.92] tracking-[-0.8px] mb-4">
                {t("auto.auto_54", "Browse available")}<br />
                <em className="not-italic text-[#4db87a]">{t("auto.auto_55", "land parcels")}</em>
              </h1>
              <p className="text-white/40 text-[14.5px] leading-relaxed max-w-[420px] font-light">
                {t("auto.auto_56", "Explore verified sites across India ready for afforestation — filter by type, location, and more.")}
              </p>
            </motion.div>

            {/* Stats row */}
            {!loading && (
              <motion.div
                className="flex items-center gap-6 mt-8 pt-8 border-t border-white/[0.08]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <span className="font-['Cormorant_Garant',serif] text-[28px] font-semibold text-[#4db87a]">{lands.length}</span>
                  <span className="text-white/30 text-[12px] ml-2 uppercase tracking-[1px]">{t("auto.auto_57", "Total sites")}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <span className="font-['Cormorant_Garant',serif] text-[28px] font-semibold text-[#4db87a]">{filtered.length}</span>
                  <span className="text-white/30 text-[12px] ml-2 uppercase tracking-[1px]">{t("auto.auto_58", "Showing")}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── CONTROLS ─────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-6 flex flex-col gap-4">

          {/* Search + Actions row */}
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="flex-1 flex items-center gap-3 bg-white border border-[#e0d8cf] rounded-xl px-4 py-3 shadow-sm focus-within:border-[#4db87a] focus-within:ring-2 focus-within:ring-[#4db87a]/10 transition-all">
              <svg className="text-[#b5ac9e] shrink-0" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, status, owner…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm text-[#0c1e11] bg-transparent placeholder:text-[#c8bfb4]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#c8bfb4] hover:text-[#8a7d6e] transition-colors cursor-pointer text-sm shrink-0">✕</button>
              )}
            </div>

            {/* Pin button */}
            <button
              onClick={() => setMapOpen(true)}
              className={`shrink-0 flex items-center gap-2 h-[46px] px-4 rounded-xl border text-[13px] font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shadow-sm ${pinLocation
                  ? "bg-[#0c1e11] text-white border-[#0c1e11]"
                  : "bg-white text-[#0c1e11] border-[#e0d8cf] hover:border-[#4db87a] hover:bg-emerald-50/50"
                }`}
            >
              <span>📍</span>
              <span className="hidden sm:inline">{pinLocation ? "Change pin" : "Near me"}</span>
            </button>

            {/* View toggle */}
            <div className="shrink-0 flex bg-white border border-[#e0d8cf] rounded-xl overflow-hidden shadow-sm h-[46px]">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={`px-3.5 flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === "grid" ? "bg-[#0c1e11] text-white" : "text-[#b5ac9e] hover:text-[#0c1e11]"
                  }`}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
                  <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
                  <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
                  <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List view"
                className={`px-3.5 flex items-center justify-center border-l border-[#e0d8cf] transition-all duration-200 cursor-pointer ${viewMode === "list" ? "bg-[#0c1e11] text-white" : "text-[#b5ac9e] hover:text-[#0c1e11]"
                  }`}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1" y="2" width="13" height="2.2" rx="1.1" fill="currentColor" />
                  <rect x="1" y="6.4" width="13" height="2.2" rx="1.1" fill="currentColor" />
                  <rect x="1" y="10.8" width="13" height="2.2" rx="1.1" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {/* Pin info bar */}
          <AnimatePresence>
            {pinLocation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center flex-wrap gap-4 px-4 py-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-sm text-emerald-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium">{t("auto.auto_59", "Within")} <strong>{pinRadius} km</strong> of {pinLocation.lat.toFixed(4)}, {pinLocation.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-xs text-emerald-600 font-medium">{t("auto.auto_60", "Radius")}</span>
                    <input
                      type="range" min={10} max={200} step={10}
                      value={pinRadius}
                      onChange={e => setPinRadius(Number(e.target.value))}
                      className="w-24 accent-emerald-600"
                    />
                    <span className="text-xs font-semibold text-emerald-700 w-12">{pinRadius} km</span>
                    <button
                      onClick={() => { setPinLocation(null); setPinRadius(50); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      {t("auto.auto_61", "Clear")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter chips */}
          {statusTypes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10.5px] font-semibold text-[#b5ac9e] uppercase tracking-[1.5px] mr-1">{t("auto.auto_62", "Filter:")}</span>
              {["All", ...statusTypes].map(type => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type === "All" ? "" : (activeFilter === type ? "" : type))}
                  className={`h-8 px-3.5 rounded-full border text-[12px] font-medium transition-all duration-200 cursor-pointer ${(type === "All" && !activeFilter) || activeFilter === type
                      ? "bg-[#0c1e11] border-[#0c1e11] text-white shadow-sm"
                      : "bg-white border-[#e0d8cf] text-[#8a7d6e] hover:border-[#4db87a]/50 hover:text-[#0c1e11]"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── CONTENT ──────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16">
          {loading ? (
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              : "flex flex-col gap-4"}>
              {[...Array(6)].map((_, i) =>
                viewMode === "grid"
                  ? <GridSkeleton key={i} />
                  : <ListSkeleton key={i} />
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f2ede3] border border-[#ede8de] flex items-center justify-center text-3xl">
                🌾
              </div>
              <div>
                <h3 className="font-['Cormorant_Garant',serif] text-[28px] font-semibold text-[#0c1e11] mb-2">
                  {t("auto.auto_63", "No sites found")}
                </h3>
                <p className="text-[13.5px] text-[#b5ac9e] max-w-xs leading-relaxed">
                  {t("auto.auto_64", "Try adjusting your search terms, filters, or proximity radius.")}
                </p>
              </div>
              {(search || activeFilter || pinLocation) && (
                <button
                  onClick={() => { setSearch(""); setActiveFilter(""); setPinLocation(null); }}
                  className="text-[13px] font-semibold text-[#2d8a55] border border-emerald-200 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  {t("auto.auto_65", "Clear all filters")}
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((land, i) => (
                <motion.div key={land.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.35) }}>
                  <GridCard
                    land={land}
                    onOpenGallery={imgs => { setGallery(imgs); setGalleryIdx(0); }}
                    onNavigate={id => navigate(`/lands/${id}`)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((land, i) => (
                <motion.div key={land.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.28) }}>
                  <ListCard
                    land={land}
                    onOpenGallery={imgs => { setGallery(imgs); setGalleryIdx(0); }}
                    onNavigate={id => navigate(`/lands/${id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MAP MODAL ────────────────────────────────── */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            className="fixed inset-0 bg-black/55 z-[9999] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setMapOpen(false)}
          >
            <motion.div
              className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#ede8de]"
              style={{ height: "clamp(420px,78vh,700px)" }}
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#ede8de] shrink-0">
                <div>
                  <h3 className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#0c1e11]">
                    {t("auto.auto_66", "Drop a pin to search nearby")}
                  </h3>
                  <p className="text-[12.5px] text-[#b5ac9e] mt-0.5 font-['Outfit',sans-serif]">
                    {t("auto.auto_67", "Click anywhere on the map to set your search location")}
                  </p>
                </div>
                <button
                  onClick={() => setMapOpen(false)}
                  className="w-9 h-9 rounded-xl border border-[#e0d8cf] flex items-center justify-center text-[#b5ac9e] hover:bg-[#f7f3ec] hover:text-[#0c1e11] transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MapContainer center={[19.0, 76.0]} zoom={6}
                  style={{ height: "100%", width: "100%" }} ref={mapRef}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {pinLocation && <Marker position={[pinLocation.lat, pinLocation.lng]} />}
                  {lands.filter(l => l.centroidLat && l.centroidLng).map(l => (
                    <Marker key={l.id} position={[l.centroidLat, l.centroidLng]}>
                      <Popup>
                        <strong className="font-['Outfit',sans-serif]">{l.title || "Land"}</strong>
                        <br />{l.landStatus}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GALLERY LIGHTBOX ─────────────────────────── */}
      <AnimatePresence>
        {gallery && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-[99999] flex flex-col items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setGallery(null)}
          >
            <button
              onClick={() => setGallery(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
            >
              ✕
            </button>

            <div className="relative max-w-4xl w-full flex items-center justify-center flex-1 gap-4">
              <button
                className={`w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center text-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/10 shrink-0 ${galleryIdx === 0 ? "opacity-25 pointer-events-none" : ""}`}
                onClick={() => setGalleryIdx(i => i - 1)}
              >‹</button>

              <motion.img
                key={galleryIdx}
                src={gallery[galleryIdx]?.imageUrl}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="max-h-[62vh] max-w-full rounded-2xl object-contain shadow-2xl flex-1"
                onError={e => { e.target.src = "https://via.placeholder.com/800x600/f2ede3/0c1e11?text=🌿"; }}
              />

              <button
                className={`w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center text-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/10 shrink-0 ${galleryIdx >= gallery.length - 1 ? "opacity-25 pointer-events-none" : ""}`}
                onClick={() => setGalleryIdx(i => i + 1)}
              >›</button>
            </div>

            <p className="text-white/30 text-[12.5px] mt-4 mb-4 font-['Outfit',sans-serif]">
              {galleryIdx + 1} / {gallery.length}
            </p>

            <div className="flex gap-2 flex-wrap justify-center max-w-lg">
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setGalleryIdx(i)}
                  className={`w-13 h-13 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all duration-200 ${i === galleryIdx ? "border-[#4db87a] opacity-100 scale-105" : "border-transparent opacity-40 hover:opacity-70"
                    }`}
                >
                  <img src={img.imageUrl} className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = "none"; }} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Browse;