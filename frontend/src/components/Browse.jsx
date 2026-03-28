import React, { useState, useEffect, useRef } from "react";
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

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
};

const statusColor = (s) => {
  const map = {
    Vacant:                  { bg: "#e8f5ee", text: "#0d3320" },
    Barren:                  { bg: "#fef9c3", text: "#92400e" },
    "Roadside Strip":        { bg: "#e0f2fe", text: "#0c4a6e" },
    Roadside:                { bg: "#e0f2fe", text: "#0c4a6e" },
    "Open Ground":           { bg: "#f0fdf4", text: "#166534" },
    "Agricultural (unused)": { bg: "#fef3c7", text: "#92400e" },
    "Industrial Wasteland":  { bg: "#fee2e2", text: "#991b1b" },
  };
  return map[s] || { bg: "#f3f4f6", text: "#374151" };
};

/* ── image gallery strip ── */
const ImageStrip = ({ landId, onOpenGallery }) => {
  const [images, setImages] = useState([]);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/lands/${landId}/images`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setImages(data); })
      .catch(() => {})
      .finally(() => setImgLoading(false));
  }, [landId]);

  if (imgLoading) return (
    <div className="br-img-strip br-img-skeleton">
      <div className="br-img-shimmer" />
    </div>
  );

  if (images.length === 0) return (
    <div className="br-img-strip br-img-empty">
      <span>🌿</span>
      <p>No photos yet</p>
    </div>
  );

  const shown = images.slice(0, 3);
  const extra = images.length - 3;

  return (
    <div className="br-img-strip" onClick={() => onOpenGallery(images)}>
      {shown.map((img, i) => (
        <div key={img.id} className="br-img-thumb"
          style={{ zIndex: shown.length - i, marginLeft: i === 0 ? 0 : -10 }}>
          {/* ✅ FIX: src="/uploads/filename" — served by WebConfig.addResourceHandlers */}
          <img
            src={`/uploads/${img.imageUrl}`}
            alt={`land-${i}`}
            onError={e => { e.target.src = "https://via.placeholder.com/120x90/e8f5ee/0d3320?text=🌿"; }}
          />
        </div>
      ))}
      {extra > 0 && <div className="br-img-extra">+{extra}</div>}
      <span className="br-img-view-all">View all →</span>
    </div>
  );
};

/* ── land card ── */
const LandCard = ({ land, onOpenGallery, onNavigate }) => {
  const sc = statusColor(land.landStatus);
  const approxTrees = land.areaSqm ? Math.floor(land.areaSqm / 20) : null;

  return (
    <div className="br-card">
      <div className="br-card-img-wrap">
        <ImageStrip landId={land.id} onOpenGallery={onOpenGallery} />
        <span className="br-card-status-badge" style={{ background: sc.bg, color: sc.text }}>
          {land.landStatus || "Unspecified"}
        </span>
      </div>

      <div className="br-card-body">
        <h3 className="br-card-title">{land.title || "Unnamed Land"}</h3>

        {land.centroidLat && land.centroidLng && (
          <p className="br-card-loc">
            📍 {land.centroidLat.toFixed(4)}, {land.centroidLng.toFixed(4)}
          </p>
        )}

        <div className="br-card-meta">
          <div className="br-meta-row">
            <div className="br-meta-item">
              <span className="br-meta-icon">📐</span>
              <div>
                <span className="br-meta-val">{land.areaSqm ? Number(land.areaSqm).toLocaleString() : "—"}</span>
                <span className="br-meta-unit"> m²</span>
              </div>
            </div>
            {approxTrees && (
              <div className="br-meta-item">
                <span className="br-meta-icon">🌱</span>
                <div>
                  <span className="br-meta-val">~{approxTrees}</span>
                  <span className="br-meta-unit"> trees</span>
                </div>
              </div>
            )}
          </div>
          <div className="br-meta-tags">
            {land.waterAvailable && <span className="br-tag">💧 {land.waterAvailable}</span>}
            {land.ownershipType  && <span className="br-tag">🏛 {land.ownershipType}</span>}
            {land.permissionStatus && (
              <span className={`br-tag ${land.permissionStatus?.toLowerCase().includes("yes") ? "br-tag-green" : ""}`}>
                {land.permissionStatus?.toLowerCase().includes("yes") ? "✅" : "⏳"} {land.permissionStatus}
              </span>
            )}
          </div>
        </div>

        {land.notes && <p className="br-card-notes">"{land.notes}"</p>}

        {/* ✅ FIX: was "br-card-btn" (undefined class) → now "br-card-btn-primary" (matches CSS) */}
        <div className="br-card-actions">
          <button className="br-card-btn-primary" onClick={() => onNavigate(land.id)}>
            View site & plant here →
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── main ── */
const Browse = () => {
  const navigate = useNavigate();
  const [lands, setLands]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [mapOpen, setMapOpen]           = useState(false);
  const [pinLocation, setPinLocation]   = useState(null);
  const [pinRadius, setPinRadius]       = useState(50);
  const [gallery, setGallery]           = useState(null);
  const [galleryIdx, setGalleryIdx]     = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/lands`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLands(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mapOpen && mapRef.current) setTimeout(() => mapRef.current.invalidateSize(), 300);
  }, [mapOpen]);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --forest: #0d3320; --canopy: #1a5c38; --leaf: #2d8a55; --sprout: #4db87a;
          --mist: #e8f5ee; --sand: #f7f3ee; --ink: #1a1a1a; --smoke: #6b7280;
          --line: #e2e8f0; --white: #ffffff; --radius: 14px;
          --shadow: 0 2px 16px rgba(13,51,32,0.08);
          --shadow-lg: 0 12px 48px rgba(13,51,32,0.15);
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--sand); color: var(--ink); }

        .br-page { min-height: 100vh; padding: 48px 40px 80px; max-width: 1280px; margin: 0 auto; }
        .br-header { margin-bottom: 36px; }
        .br-header h1 { font-family: 'DM Serif Display', serif; font-size: 38px; letter-spacing: -0.5px; color: var(--forest); line-height: 1.15; }
        .br-header p { font-size: 15px; color: var(--smoke); margin-top: 8px; }

        .br-search-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .br-search-wrap {
          flex: 1; display: flex; align-items: center; gap: 10px;
          background: var(--white); border: 1.5px solid var(--line);
          border-radius: 10px; padding: 11px 16px; box-shadow: var(--shadow);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .br-search-wrap:focus-within { border-color: var(--leaf); box-shadow: 0 0 0 3px rgba(45,138,85,0.1); }
        .br-search-wrap input { flex: 1; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--ink); background: transparent; }
        .br-search-wrap input::placeholder { color: #b0b8c1; }
        .br-pin-btn {
          display: flex; align-items: center; gap: 8px; padding: 11px 18px;
          border-radius: 10px; border: 1.5px solid var(--line); background: var(--white);
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
          color: var(--forest); cursor: pointer; box-shadow: var(--shadow); white-space: nowrap;
          transition: all 0.15s;
        }
        .br-pin-btn:hover { border-color: var(--leaf); background: var(--mist); }
        .br-pin-btn.active { background: var(--forest); color: white; border-color: var(--forest); }

        .br-pin-info {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          padding: 12px 16px; background: var(--mist); border: 1px solid #a7f3c4;
          border-radius: 9px; margin-bottom: 16px; font-size: 13.5px; color: var(--canopy);
        }
        .br-pin-radius { display: flex; align-items: center; gap: 8px; margin-left: auto; font-size: 13px; }
        .br-pin-radius input[type=range] { width: 90px; accent-color: var(--leaf); }
        .br-clear-btn {
          padding: 5px 12px; border-radius: 6px; border: 1px solid var(--leaf);
          background: white; color: var(--canopy); font-size: 12.5px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .br-clear-btn:hover { background: var(--mist); }

        .br-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; align-items: center; }
        .br-filter-label { font-size: 12.5px; color: var(--smoke); font-weight: 500; margin-right: 4px; }
        .br-filter-chip {
          padding: 7px 15px; border-radius: 20px; border: 1.5px solid var(--line);
          background: var(--white); font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 500; color: var(--smoke); cursor: pointer; transition: all 0.15s;
        }
        .br-filter-chip:hover { border-color: var(--leaf); color: var(--canopy); }
        .br-filter-chip.active { background: var(--forest); border-color: var(--forest); color: white; }

        .br-results-meta { font-size: 13px; color: var(--smoke); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
        .br-results-meta strong { color: var(--forest); font-weight: 600; }

        .br-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 22px; }

        .br-card {
          background: var(--white); border-radius: var(--radius); border: 1px solid var(--line);
          box-shadow: var(--shadow); overflow: hidden; display: flex; flex-direction: column;
          transition: box-shadow 0.2s, transform 0.2s; cursor: pointer;
        }
        .br-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }

        .br-card-img-wrap { position: relative; }
        .br-card-status-badge {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          font-size: 11.5px; font-weight: 600; padding: 4px 10px;
          border-radius: 20px; letter-spacing: 0.3px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .br-img-strip {
          height: 160px; display: flex; align-items: flex-end;
          padding: 10px; gap: 0; cursor: pointer; position: relative;
          background: #f0ede8; overflow: hidden; transition: filter 0.2s;
        }
        .br-img-strip:hover { filter: brightness(0.95); }
        .br-img-strip:hover .br-img-view-all { opacity: 1; }

        .br-img-skeleton { background: linear-gradient(90deg, #f0ede8 25%, #e8e4df 50%, #f0ede8 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        @keyframes shimmer { to { background-position: -200% 0; } }
        .br-img-shimmer { display: none; }

        .br-img-empty { flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: default; }
        .br-img-empty span { font-size: 28px; opacity: 0.4; }
        .br-img-empty p { font-size: 12px; color: var(--smoke); }

        .br-img-thumb {
          width: 80px; height: 80px; border-radius: 10px; overflow: hidden;
          border: 2.5px solid white; flex-shrink: 0; position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .br-img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .br-img-extra {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--forest); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; margin-left: 6px;
          border: 2.5px solid white; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .br-img-view-all {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(13,51,32,0.85); color: white;
          font-size: 11.5px; font-weight: 600; padding: 4px 10px;
          border-radius: 20px; opacity: 0; transition: opacity 0.2s;
          pointer-events: none;
        }

        .br-card-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .br-card-title { font-size: 15.5px; font-weight: 600; color: var(--ink); line-height: 1.3; }
        .br-card-loc { font-size: 12px; color: var(--smoke); }

        .br-card-meta { background: var(--sand); border-radius: 9px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
        .br-meta-row { display: flex; gap: 20px; }
        .br-meta-item { display: flex; align-items: center; gap: 7px; }
        .br-meta-icon { font-size: 15px; }
        .br-meta-val { font-size: 15px; font-weight: 600; color: var(--forest); }
        .br-meta-unit { font-size: 12px; color: var(--smoke); }

        .br-meta-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .br-tag {
          font-size: 11.5px; padding: 3px 9px; border-radius: 12px;
          background: white; border: 1px solid var(--line); color: var(--smoke); font-weight: 500;
        }
        .br-tag-green { background: var(--mist); border-color: #a7f3c4; color: var(--canopy); }

        .br-card-notes {
          font-size: 12.5px; color: var(--smoke); font-style: italic; line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        /* ✅ FIX: renamed from br-card-btn → br-card-actions + br-card-btn-primary */
        .br-card-actions { display: flex; gap: 8px; margin-top: auto; }
        .br-card-btn-primary {
          flex: 1; padding: 11px 14px; background: var(--forest); color: white;
          border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s;
          text-align: center;
        }
        .br-card-btn-primary:hover { background: var(--canopy); }
        .br-card-btn-ghost {
          padding: 11px 14px; background: white; color: var(--forest);
          border: 1.5px solid var(--line); border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: border-color 0.15s; white-space: nowrap;
        }
        .br-card-btn-ghost:hover { border-color: var(--forest); }

        .br-empty { grid-column: 1/-1; text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .br-empty-icon { font-size: 40px; }
        .br-empty h3 { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--forest); }
        .br-empty p { font-size: 14px; color: var(--smoke); }

        .br-loader { grid-column: 1/-1; display: flex; align-items: center; justify-content: center; padding: 60px; gap: 14px; font-size: 14px; color: var(--smoke); }
        .br-spinner { width: 28px; height: 28px; border: 3px solid var(--line); border-top-color: var(--forest); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .br-map-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .br-map-modal { background: white; width: 100%; max-width: 860px; height: 80vh; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow-lg); }
        .br-map-header { padding: 16px 22px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
        .br-map-header h3 { font-size: 15px; font-weight: 600; color: var(--forest); }
        .br-map-header p { font-size: 12.5px; color: var(--smoke); margin-top: 2px; }
        .br-map-close { padding: 7px 14px; border-radius: 7px; border: 1.5px solid var(--line); background: white; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; color: var(--ink); }
        .br-map-close:hover { background: #f9f9f9; }
        .br-map-body { flex: 1; overflow: hidden; }

        .br-gallery-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 99999;
          display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px;
        }
        .br-gallery-main { position: relative; max-width: 820px; width: 100%; flex: 1; display: flex; align-items: center; justify-content: center; }
        .br-gallery-main img { max-height: 65vh; max-width: 100%; border-radius: 12px; object-fit: contain; box-shadow: 0 8px 48px rgba(0,0,0,0.5); }
        .br-gallery-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.12); border: none; color: white;
          font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s; backdrop-filter: blur(4px);
        }
        .br-gallery-nav:hover { background: rgba(255,255,255,0.22); }
        .br-gallery-nav.prev { left: -52px; }
        .br-gallery-nav.next { right: -52px; }
        .br-gallery-close {
          position: absolute; top: 16px; right: 16px;
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.12); border: none; color: white;
          font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .br-gallery-close:hover { background: rgba(255,255,255,0.22); }
        .br-gallery-counter { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 14px; font-family: 'DM Sans', sans-serif; }
        .br-gallery-thumbs { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; justify-content: center; max-width: 820px; }
        .br-gallery-thumb {
          width: 52px; height: 52px; border-radius: 7px; overflow: hidden;
          border: 2px solid transparent; cursor: pointer; flex-shrink: 0;
          transition: border-color 0.15s, opacity 0.15s; opacity: 0.55;
        }
        .br-gallery-thumb.active { border-color: white; opacity: 1; }
        .br-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }

        @media (max-width: 768px) {
          .br-page { padding: 24px 16px 60px; }
          .br-header h1 { font-size: 28px; }
          .br-gallery-nav.prev { left: -8px; }
          .br-gallery-nav.next { right: -8px; }
        }
      `}</style>

      <div className="br-page">
        <motion.div className="br-header"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <h1>Browse Plantation Sites</h1>
          <p>Explore verified land parcels available for afforestation across the region.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <div className="br-search-row">
            <div className="br-search-wrap">
              <span>🔍</span>
              <input type="text" placeholder="Search by name, status, or owner…"
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <span style={{ cursor:"pointer", color:"var(--smoke)", fontSize:13 }} onClick={() => setSearch("")}>✕</span>}
            </div>
            <button className={`br-pin-btn ${pinLocation ? "active" : ""}`} onClick={() => setMapOpen(true)}>
              📍 {pinLocation ? "Change pin" : "Search near location"}
            </button>
          </div>

          {pinLocation && (
            <motion.div className="br-pin-info" initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}>
              <span>📍</span>
              <span>Within <strong>{pinRadius} km</strong> of {pinLocation.lat.toFixed(4)}, {pinLocation.lng.toFixed(4)}</span>
              <div className="br-pin-radius">
                <span>Radius:</span>
                <input type="range" min={10} max={200} step={10} value={pinRadius}
                  onChange={e => setPinRadius(Number(e.target.value))} />
                <span>{pinRadius} km</span>
              </div>
              <button className="br-clear-btn" onClick={() => { setPinLocation(null); setPinRadius(50); }}>Clear</button>
            </motion.div>
          )}

          <div className="br-filters">
            <span className="br-filter-label">Filter:</span>
            {statusTypes.map(type => (
              <button key={type} className={`br-filter-chip ${activeFilter === type ? "active" : ""}`}
                onClick={() => setActiveFilter(activeFilter === type ? "" : type)}>
                {type}
              </button>
            ))}
            {activeFilter && <button className="br-filter-chip" onClick={() => setActiveFilter("")}>✕ Clear</button>}
          </div>
        </motion.div>

        {!loading && (
          <div className="br-results-meta">
            <span>Showing <strong>{filtered.length}</strong> of {lands.length} sites</span>
            {filtered.length !== lands.length && <span style={{ fontSize:12, color:"var(--leaf)" }}>Filters active</span>}
          </div>
        )}

        <div className="br-grid">
          {loading ? (
            <div className="br-loader"><div className="br-spinner" /> Loading plantation sites…</div>
          ) : filtered.length === 0 ? (
            <div className="br-empty">
              <div className="br-empty-icon">🌾</div>
              <h3>No sites found</h3>
              <p>Try adjusting your search, filters, or radius.</p>
            </div>
          ) : (
            filtered.map((land, i) => (
              <motion.div key={land.id}
                initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:0.3, delay: i * 0.04 }}>
                <LandCard
                  land={land}
                  onOpenGallery={(imgs) => openGallery(imgs, 0)}
                  onNavigate={(id) => navigate(`/lands/${id}`)}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* MAP MODAL */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div className="br-map-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target === e.currentTarget && setMapOpen(false)}>
            <motion.div className="br-map-modal"
              initial={{ scale:0.96, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.96, opacity:0 }} transition={{ duration:0.15 }}>
              <div className="br-map-header">
                <div>
                  <h3>📍 Drop a pin to search nearby</h3>
                  <p>Click anywhere on the map to set your search location</p>
                </div>
                <button className="br-map-close" onClick={() => setMapOpen(false)}>Close</button>
              </div>
              <div className="br-map-body">
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

      {/* GALLERY LIGHTBOX */}
      <AnimatePresence>
        {gallery && (
          <motion.div className="br-gallery-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target === e.currentTarget && setGallery(null)}>
            <button className="br-gallery-close" onClick={() => setGallery(null)}>✕</button>
            <div className="br-gallery-main">
              {galleryIdx > 0 && (
                <button className="br-gallery-nav prev" onClick={() => setGalleryIdx(i => i-1)}>‹</button>
              )}
              {/* ✅ FIX: src="/uploads/filename" resolved by Spring WebConfig */}
              <motion.img key={galleryIdx}
                src={`/uploads/${gallery[galleryIdx]?.imageUrl}`}
                initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
                transition={{ duration:0.18 }}
                onError={e => { e.target.src="https://via.placeholder.com/800x600/e8f5ee/0d3320?text=🌿"; }} />
              {galleryIdx < gallery.length - 1 && (
                <button className="br-gallery-nav next" onClick={() => setGalleryIdx(i => i+1)}>›</button>
              )}
            </div>
            <div className="br-gallery-counter">{galleryIdx+1} / {gallery.length}</div>
            <div className="br-gallery-thumbs">
              {gallery.map((img, i) => (
                <div key={img.id} className={`br-gallery-thumb ${i===galleryIdx?"active":""}`}
                  onClick={() => setGalleryIdx(i)}>
                  <img src={`/uploads/${img.imageUrl}`}
                    onError={e => { e.target.src="https://via.placeholder.com/52x52/e8f5ee/0d3320?text=🌿"; }} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Browse;