/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Browse lands listing — Tailwind, grid/list toggle, skeleton loaders, responsive.
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
  iconUrl:        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── utils ────────────────────────────────────────────────────
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371, dLat = ((lat2-lat1)*Math.PI)/180, dLon = ((lon2-lon1)*Math.PI)/180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: e => onMapClick(e.latlng) });
  return null;
};

const statusStyle = (s) => {
  const map = {
    "Vacant":                  "bg-emerald-50 text-emerald-800 border-emerald-200",
    "Barren":                  "bg-amber-50 text-amber-800 border-amber-200",
    "Roadside Strip":          "bg-sky-50 text-sky-800 border-sky-200",
    "Roadside":                "bg-sky-50 text-sky-800 border-sky-200",
    "Open Ground":             "bg-green-50 text-green-800 border-green-200",
    "Agricultural (unused)":   "bg-yellow-50 text-yellow-800 border-yellow-200",
    "Industrial Wasteland":    "bg-red-50 text-red-800 border-red-200",
  };
  return map[s] || "bg-slate-50 text-slate-700 border-slate-200";
};

// ─── Skeleton card ────────────────────────────────────────────
const CardSkeleton = ({ list = false }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm
    ${list ? "flex flex-row" : "flex flex-col"}`}>
    <div className={`bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse
      ${list ? "w-48 sm:w-64 shrink-0" : "h-44"}`} />
    <div className={`p-5 flex flex-col gap-3 flex-1`}>
      <div className="h-4 w-3/5 rounded-lg bg-slate-100 animate-pulse" />
      <div className="h-3 w-2/5 rounded-lg bg-slate-100 animate-pulse" />
      <div className="flex gap-2 mt-1">
        <div className="h-7 w-20 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-7 w-16 rounded-xl bg-slate-100 animate-pulse" />
      </div>
      <div className="flex gap-2 mt-auto pt-2">
        <div className="h-9 w-5 flex-1 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  </div>
);

// ─── Image strip ─────────────────────────────────────────────
const ImageStrip = ({ landId, onOpenGallery, compact = false }) => {
  const [images, setImages]     = useState([]);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/lands/${landId}/images`, { credentials:"include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setImages(data); })
      .catch(() => {})
      .finally(() => setImgLoading(false));
  }, [landId]);

  if (imgLoading) return (
    <div className={`bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse
      ${compact ? "h-36 sm:h-full" : "h-44"} w-full`} />
  );

  if (images.length === 0) return (
    <div className={`flex flex-col items-center justify-center gap-2
      bg-[#f0ede8] ${compact ? "h-36 sm:h-full" : "h-44"} w-full`}>
      <span className="text-3xl opacity-40">🌿</span>
      <p className="text-xs text-slate-400">No photos yet</p>
    </div>
  );

  const shown = images.slice(0, 3);
  const extra = images.length - 3;

  return (
    <div
      onClick={() => onOpenGallery(images)}
      className={`relative flex items-end overflow-hidden cursor-pointer bg-[#f0ede8] group
        ${compact ? "h-36 sm:h-full" : "h-44"} w-full p-3`}>
      {/* background — last image fills */}
      <img
        src={shown[0]?.imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-200"
        onError={e => { e.target.style.display="none"; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* thumbnails row */}
      <div className="relative z-10 flex items-end gap-0">
        {shown.map((img, i) => (
          <div key={img.id}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg shrink-0"
            style={{ marginLeft: i === 0 ? 0 : -10, zIndex: shown.length - i }}>
            <img src={img.imageUrl} alt="" className="w-full h-full object-cover"
              onError={e => { e.target.src="https://via.placeholder.com/64x64/e8f5ee/0d3320?text=🌿"; }} />
          </div>
        ))}
        {extra > 0 && (
          <div className="w-9 h-9 rounded-full bg-[#0d3320] text-white flex items-center justify-center
                         text-xs font-bold ml-1.5 border-2 border-white shadow-lg shrink-0">
            +{extra}
          </div>
        )}
      </div>

      {/* view all pill */}
      <span className="absolute bottom-3 right-3 z-10 bg-[#0d3320]/85 text-white text-[11px] font-semibold
                       px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        View all →
      </span>
    </div>
  );
};

// ─── Grid card ────────────────────────────────────────────────
const GridCard = ({ land, onOpenGallery, onNavigate }) => {
  const approxTrees = land.areaSqm ? Math.floor(land.areaSqm / 20) : null;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col
                 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer group">
      {/* image */}
      <div className="relative">
        <ImageStrip landId={land.id} onOpenGallery={onOpenGallery} />
        <span className={`absolute top-2.5 left-2.5 z-10 text-[11px] font-semibold px-2.5 py-1
                         rounded-full border ${statusStyle(land.landStatus)}`}>
          {land.landStatus || "Unspecified"}
        </span>
      </div>

      {/* body */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111] leading-snug line-clamp-1">
            {land.title || "Unnamed Land"}
          </h3>
          {land.centroidLat && land.centroidLng && (
            <p className="text-xs text-slate-400 mt-0.5">
              📍 {land.centroidLat.toFixed(4)}, {land.centroidLng.toFixed(4)}
            </p>
          )}
        </div>

        {/* metrics */}
        <div className="bg-[#f7f3ee] rounded-xl p-3 flex flex-col gap-2">
          <div className="flex gap-5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📐</span>
              <span className="text-sm font-semibold text-[#0d3320]">
                {land.areaSqm ? Number(land.areaSqm).toLocaleString() : "—"}
              </span>
              <span className="text-xs text-slate-400">m²</span>
            </div>
            {approxTrees && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🌱</span>
                <span className="text-sm font-semibold text-[#0d3320]">~{approxTrees}</span>
                <span className="text-xs text-slate-400">trees</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {land.waterAvailable && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">
                💧 {land.waterAvailable}
              </span>
            )}
            {land.ownershipType && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">
                🏛 {land.ownershipType}
              </span>
            )}
            {land.permissionStatus && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border
                ${land.permissionStatus?.toLowerCase().includes("yes")
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-500"}`}>
                {land.permissionStatus?.toLowerCase().includes("yes") ? "✅" : "⏳"} {land.permissionStatus}
              </span>
            )}
          </div>
        </div>

        {land.notes && (
          <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-2">"{land.notes}"</p>
        )}

        <div className="mt-auto pt-1">
          <button
            onClick={() => onNavigate(land.id)}
            className="w-full py-2.5 rounded-xl bg-[#0d3320] text-white text-sm font-semibold
                       hover:bg-[#1a5c38] transition-colors duration-150 cursor-pointer">
            View site & plant here →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── List card ────────────────────────────────────────────────
const ListCard = ({ land, onOpenGallery, onNavigate }) => {
  const approxTrees = land.areaSqm ? Math.floor(land.areaSqm / 20) : null;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
      {/* image — fixed width on sm+ */}
      <div className="relative sm:w-52 md:w-64 shrink-0">
        <ImageStrip landId={land.id} onOpenGallery={onOpenGallery} compact />
        <span className={`absolute top-2.5 left-2.5 z-10 text-[11px] font-semibold px-2.5 py-1
                         rounded-full border ${statusStyle(land.landStatus)}`}>
          {land.landStatus || "Unspecified"}
        </span>
      </div>

      {/* body */}
      <div className="p-4 sm:p-5 flex flex-col gap-2.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-[#111] leading-snug truncate">
              {land.title || "Unnamed Land"}
            </h3>
            {land.centroidLat && land.centroidLng && (
              <p className="text-xs text-slate-400 mt-0.5">
                📍 {land.centroidLat.toFixed(4)}, {land.centroidLng.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* metrics row */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📐</span>
            <span className="text-sm font-semibold text-[#0d3320]">
              {land.areaSqm ? Number(land.areaSqm).toLocaleString() : "—"}
            </span>
            <span className="text-xs text-slate-400">m²</span>
          </div>
          {approxTrees && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🌱</span>
              <span className="text-sm font-semibold text-[#0d3320]">~{approxTrees}</span>
              <span className="text-xs text-slate-400">trees</span>
            </div>
          )}
          {land.waterAvailable && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f7f3ee] border border-slate-200 text-slate-500">
              💧 {land.waterAvailable}
            </span>
          )}
          {land.ownershipType && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f7f3ee] border border-slate-200 text-slate-500 hidden sm:inline-flex">
              🏛 {land.ownershipType}
            </span>
          )}
          {land.permissionStatus && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border hidden md:inline-flex
              ${land.permissionStatus?.toLowerCase().includes("yes")
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-[#f7f3ee] border-slate-200 text-slate-500"}`}>
              {land.permissionStatus?.toLowerCase().includes("yes") ? "✅" : "⏳"} {land.permissionStatus}
            </span>
          )}
        </div>

        {land.notes && (
          <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-1 hidden sm:block">"{land.notes}"</p>
        )}

        <div className="mt-auto pt-1 flex gap-2">
          <button
            onClick={() => onNavigate(land.id)}
            className="flex-1 py-2.5 rounded-xl bg-[#0d3320] text-white text-sm font-semibold
                       hover:bg-[#1a5c38] transition-colors duration-150 cursor-pointer text-center">
            View site & plant here →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────
const Browse = () => {
  const navigate = useNavigate();
  const [lands,        setLands]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [viewMode,     setViewMode]     = useState("grid"); // "grid" | "list"
  const [mapOpen,      setMapOpen]      = useState(false);
  const [pinLocation,  setPinLocation]  = useState(null);
  const [pinRadius,    setPinRadius]    = useState(50);
  const [gallery,      setGallery]      = useState(null);
  const [galleryIdx,   setGalleryIdx]   = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/lands`, { credentials:"include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLands(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mapOpen && mapRef.current) setTimeout(() => mapRef.current.invalidateSize(), 300);
  }, [mapOpen]);

  // keyboard nav for gallery
  useEffect(() => {
    if (!gallery) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") setGalleryIdx(i => Math.min(i+1, gallery.length-1));
      if (e.key === "ArrowLeft")  setGalleryIdx(i => Math.max(i-1, 0));
      if (e.key === "Escape")     setGallery(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gallery]);

  const handleMapClick = (latlng) => {
    setPinLocation({ lat: latlng.lat, lng: latlng.lng });
    setMapOpen(false);
  };

  const openGallery = (images, startIdx = 0) => {
    setGallery(images);
    setGalleryIdx(startIdx);
  };

  const filtered = lands.filter(land => {
    const q = search.toLowerCase();
    const keyMatch =
      (land.title       || "").toLowerCase().includes(q) ||
      (land.ownerName   || "").toLowerCase().includes(q) ||
      (land.landStatus  || "").toLowerCase().includes(q);
    const filterMatch = activeFilter ? land.landStatus === activeFilter : true;
    const pinMatch = pinLocation && land.centroidLat && land.centroidLng
      ? distanceKm(pinLocation.lat, pinLocation.lng, land.centroidLat, land.centroidLng) <= pinRadius
      : true;
    return keyMatch && filterMatch && pinMatch;
  });

  const statusTypes = [...new Set(lands.map(l => l.landStatus).filter(Boolean))];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        body { font-family:'DM Sans',sans-serif; background:#f7f3ee; }
        .line-clamp-1 { display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        input[type=range] { accent-color:#2d8a55; }
      `}</style>

      <Helmet>
        <title>TerraSpotter — Browse Sites</title>
        <meta name="description" content="Browse plantation sites available for afforestation." />
      </Helmet>

      <div className="min-h-screen bg-[#f7f3ee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">

          {/* ── HEADER ──────────────────────────────── */}
          <motion.div
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
            className="mb-8">
            <h1 style={{ fontFamily:"'DM Serif Display',serif" }}
              className="text-3xl sm:text-4xl lg:text-5xl text-[#0d3320] leading-tight tracking-tight mb-2">
              Browse Plantation Sites
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Explore verified land parcels available for afforestation across the region.
            </p>
          </motion.div>

          {/* ── CONTROLS ────────────────────────────── */}
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:0.05 }}
            className="flex flex-col gap-3 mb-6">

            {/* search row */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* search box */}
              <div className="flex-1 flex items-center gap-2.5 bg-white border border-slate-200
                              rounded-xl px-4 py-3 shadow-sm focus-within:border-emerald-400
                              focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <span className="text-slate-400 shrink-0">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, status, or owner…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 outline-none text-sm text-[#111] bg-transparent placeholder:text-slate-300"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="text-slate-300 hover:text-slate-500 transition-colors text-sm cursor-pointer shrink-0">✕</button>
                )}
              </div>

              {/* pin button */}
              <button
                onClick={() => setMapOpen(true)}
                className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl border text-sm font-medium
                            transition-all duration-150 cursor-pointer shadow-sm whitespace-nowrap
                            ${pinLocation
                              ? "bg-[#0d3320] text-white border-[#0d3320]"
                              : "bg-white text-[#0d3320] border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"}`}>
                <span>📍</span>
                <span className="hidden sm:inline">{pinLocation ? "Change pin" : "Near location"}</span>
              </button>

              {/* view toggle */}
              <div className="shrink-0 flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-3 transition-all duration-150 cursor-pointer
                    ${viewMode === "grid" ? "bg-[#0d3320] text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                  title="Grid view">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
                    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
                    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/>
                    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-3 transition-all duration-150 cursor-pointer border-l border-slate-200
                    ${viewMode === "list" ? "bg-[#0d3320] text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                  title="List view">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="2" width="14" height="2.5" rx="1.25" fill="currentColor"/>
                    <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" fill="currentColor"/>
                    <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* pin info bar */}
            <AnimatePresence>
              {pinLocation && (
                <motion.div
                  initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }} className="overflow-hidden">
                  <div className="flex items-center flex-wrap gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200
                                  rounded-xl text-sm text-emerald-800">
                    <span>📍</span>
                    <span>Within <strong>{pinRadius} km</strong> of {pinLocation.lat.toFixed(4)}, {pinLocation.lng.toFixed(4)}</span>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-emerald-600">Radius:</span>
                      <input type="range" min={10} max={200} step={10} value={pinRadius}
                        onChange={e => setPinRadius(Number(e.target.value))}
                        className="w-20" />
                      <span className="text-xs font-semibold text-emerald-700 w-14">{pinRadius} km</span>
                      <button
                        onClick={() => { setPinLocation(null); setPinRadius(50); }}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border border-emerald-300
                                   bg-white text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer">
                        Clear
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-1">Filter:</span>
              {statusTypes.map(type => (
                <button key={type}
                  onClick={() => setActiveFilter(activeFilter === type ? "" : type)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 cursor-pointer
                    ${activeFilter === type
                      ? "bg-[#0d3320] border-[#0d3320] text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-[#0d3320]"}`}>
                  {type}
                </button>
              ))}
              {activeFilter && (
                <button onClick={() => setActiveFilter("")}
                  className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium
                             text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                  ✕ Clear
                </button>
              )}
            </div>
          </motion.div>

          {/* ── RESULTS META ────────────────────────── */}
          {!loading && (
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-400">
                Showing <span className="font-semibold text-[#0d3320]">{filtered.length}</span> of {lands.length} sites
              </p>
              {filtered.length !== lands.length && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Filters active
                </span>
              )}
            </div>
          )}

          {/* ── CARDS ───────────────────────────────── */}
          {loading ? (
            // ── SKELETON ──────────────────────────────
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              : "flex flex-col gap-4"}>
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} list={viewMode === "list"} />)}
            </div>
          ) : filtered.length === 0 ? (
            // ── EMPTY STATE ───────────────────────────
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-5xl">🌾</span>
              <h3 style={{ fontFamily:"'DM Serif Display',serif" }}
                className="text-2xl text-[#0d3320]">No sites found</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                Try adjusting your search, filters, or proximity radius.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            // ── GRID VIEW ─────────────────────────────
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((land, i) => (
                <motion.div key={land.id}
                  initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.3, delay: Math.min(i * 0.04, 0.3) }}>
                  <GridCard
                    land={land}
                    onOpenGallery={imgs => openGallery(imgs, 0)}
                    onNavigate={id => navigate(`/lands/${id}`)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            // ── LIST VIEW ─────────────────────────────
            <div className="flex flex-col gap-4">
              {filtered.map((land, i) => (
                <motion.div key={land.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.25, delay: Math.min(i * 0.03, 0.25) }}>
                  <ListCard
                    land={land}
                    onOpenGallery={imgs => openGallery(imgs, 0)}
                    onNavigate={id => navigate(`/lands/${id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── MAP MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target === e.currentTarget && setMapOpen(false)}>
            <motion.div
              className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
              style={{ height:"clamp(400px,78vh,700px)" }}
              initial={{ scale:0.96, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.96, opacity:0 }}
              transition={{ duration:0.18 }}>

              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-[#0d3320]">📍 Drop a pin to search nearby</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Click anywhere on the map to set your search location</p>
                </div>
                <button onClick={() => setMapOpen(false)}
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center
                             text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer text-sm">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <MapContainer center={[19.0, 76.0]} zoom={6}
                  style={{ height:"100%", width:"100%" }} ref={mapRef}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {pinLocation && <Marker position={[pinLocation.lat, pinLocation.lng]} />}
                  {lands.filter(l => l.centroidLat && l.centroidLng).map(l => (
                    <Marker key={l.id} position={[l.centroidLat, l.centroidLng]}>
                      <Popup><strong>{l.title || "Land"}</strong><br />{l.landStatus}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GALLERY LIGHTBOX ──────────────────────── */}
      <AnimatePresence>
        {gallery && (
          <motion.div
            className="fixed inset-0 bg-black/92 z-[99999] flex flex-col items-center justify-center p-4 sm:p-6"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target === e.currentTarget && setGallery(null)}>

            {/* close */}
            <button onClick={() => setGallery(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                         text-white hover:bg-white/20 transition-colors cursor-pointer text-lg backdrop-blur-sm">
              ✕
            </button>

            {/* main image */}
            <div className="relative max-w-3xl w-full flex items-center justify-center flex-1">
              {galleryIdx > 0 && (
                <button
                  className="absolute left-0 sm:-left-14 z-10 w-11 h-11 rounded-full bg-white/10 border-none text-white
                             flex items-center justify-center text-2xl hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
                  onClick={() => setGalleryIdx(i => i-1)}>‹</button>
              )}

              <motion.img
                key={galleryIdx}
                src={gallery[galleryIdx]?.imageUrl}
                initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
                transition={{ duration:0.18 }}
                className="max-h-[62vh] max-w-full rounded-xl object-contain shadow-2xl"
                onError={e => { e.target.src="https://via.placeholder.com/800x600/e8f5ee/0d3320?text=🌿"; }}
              />

              {galleryIdx < gallery.length - 1 && (
                <button
                  className="absolute right-0 sm:-right-14 z-10 w-11 h-11 rounded-full bg-white/10 border-none text-white
                             flex items-center justify-center text-2xl hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
                  onClick={() => setGalleryIdx(i => i+1)}>›</button>
              )}
            </div>

            {/* counter */}
            <p className="text-white/50 text-sm mt-3 mb-3">{galleryIdx+1} / {gallery.length}</p>

            {/* thumbnails */}
            <div className="flex gap-2 flex-wrap justify-center max-w-xl">
              {gallery.map((img, i) => (
                <button key={img.id} onClick={() => setGalleryIdx(i)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer
                              transition-all duration-150
                              ${i === galleryIdx ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}>
                  <img src={img.imageUrl} className="w-full h-full object-cover"
                    onError={e => { e.target.src="https://via.placeholder.com/56x56/e8f5ee/0d3320?text=🌿"; }} />
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