/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Contribution map — Verdant Editorial redesign. Custom markers, satellite tiles.
*/
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const BASE_URL = import.meta.env.VITE_API_URL;

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// ─── Custom SVG markers ───────────────────────────────────────
const makeMarker = (color, pulse = false) =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
        ${pulse ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:cfmap-pulse 2s ease-in-out infinite;"></div>` : ""}
        <div style="
          width:18px;height:18px;border-radius:50%;
          background:${color};border:3px solid white;
          box-shadow:0 2px 10px rgba(0,0,0,0.3),0 0 0 4px ${color}33;
          z-index:1;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });

const plantedMarker = makeMarker("#4db87a", true);
const pendingMarker = makeMarker("#c9a84c", false);

// ─── Tile options ─────────────────────────────────────────────
const TILES = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri World Imagery",
    label: "Satellite", icon: "🛰️",
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap",
    label: "Street", icon: "🗺️",
  },
};

// ─── Main ─────────────────────────────────────────────────────
const ContributionMap = ({ locations = [] }) => {
  const [tileKey, setTileKey] = useState("satellite");

  const planted = locations.filter(l => l.planted).length;
  const pending = locations.filter(l => !l.planted).length;

  return (
    <div className="font-['Outfit',sans-serif] bg-[#f7f3ec] rounded-2xl overflow-hidden border border-[#ede8de] shadow-sm">

      {/* ── Header ── */}
      <div className="bg-[#0c1e11] px-5 py-4 flex items-center justify-between gap-3 flex-wrap relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1e11] to-[#0f2916]" />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#4db87a]/8 blur-[60px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-sm shadow-[0_0_12px_rgba(77,184,122,0.3)]">
            🗺️
          </div>
          <div>
            <h3 className="font-['Cormorant_Garant',serif] text-[16px] font-semibold text-white leading-tight">
              Contribution Map
            </h3>
            <p className="text-[10.5px] text-white/35">
              {locations.length} land parcel{locations.length !== 1 ? "s" : ""} mapped
            </p>
          </div>
        </div>

        {/* Legend + tile switcher */}
        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          {/* Legend */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#4db87a] border border-white/30 shadow-sm" />
              <span className="text-[11px] text-white/55">{planted} Planted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#c9a84c] border border-white/30 shadow-sm" />
              <span className="text-[11px] text-white/55">{pending} Pending</span>
            </div>
          </div>

          {/* Tile switcher */}
          <div className="flex gap-1">
            {Object.entries(TILES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setTileKey(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition-all duration-200 cursor-pointer ${tileKey === key
                    ? "bg-[#4db87a]/20 border-[#4db87a]/40 text-[#4db87a]"
                    : "bg-white/[0.06] border-white/12 text-white/40 hover:text-white/70 hover:bg-white/10"
                  }`}
              >
                <span>{val.icon}</span>
                <span>{val.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="relative">
        {/* Pulse keyframe injected inline only once */}
        <style>{`
          @keyframes cfmap-pulse {
            0%, 100% { transform: scale(1); opacity: 0.25; }
            50%       { transform: scale(2); opacity: 0;    }
          }
          .leaflet-popup-content-wrapper {
            background: #0c1e11 !important;
            border: 1px solid rgba(77,184,122,0.2) !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
          }
          .leaflet-popup-tip { background: #0c1e11 !important; }
          .leaflet-popup-content {
            margin: 12px 14px !important;
            font-family: 'Outfit', sans-serif !important;
          }
          .leaflet-bar a {
            background: #0c1e11 !important;
            color: #4db87a !important;
            border-color: rgba(77,184,122,0.2) !important;
            font-weight: 700 !important;
          }
          .leaflet-bar a:hover { background: #163d25 !important; }
        `}</style>

        <MapContainer
          key={tileKey}
          center={[18.4088, 76.5604]}
          zoom={6}
          style={{ height: 420, width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url={TILES[tileKey].url}
            attribution={TILES[tileKey].attribution}
            maxZoom={19}
          />

          {locations.map((loc, i) => (
            <Marker
              key={i}
              position={[loc.lat, loc.lng]}
              icon={loc.planted ? plantedMarker : pendingMarker}
            >
              <Popup>
                <div className="font-['Outfit',sans-serif] min-w-[160px]">
                  <div className="text-[13.5px] font-semibold text-white mb-1.5 leading-snug">
                    {loc.title}
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${loc.planted
                      ? "bg-[#4db87a]/15 text-[#4db87a]"
                      : "bg-[#c9a84c]/15 text-[#c9a84c]"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${loc.planted ? "bg-[#4db87a]" : "bg-[#c9a84c]"}`} />
                    {loc.planted ? "Planted 🌱" : "Pending ⏳"}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Empty overlay */}
        {locations.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 backdrop-blur-[2px] z-10">
            <div className="bg-[#0c1e11]/80 backdrop-blur-sm border border-[#4db87a]/20 rounded-2xl px-6 py-5 text-center">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="text-[13px] font-medium text-white/60 font-['Outfit',sans-serif]">
                No land parcels mapped yet
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer stats bar ── */}
      <div className="bg-[#f2ede3] border-t border-[#e0d8cf] px-5 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4db87a]" />
          <span className="text-[11.5px] font-medium text-[#5c5044] font-['Outfit',sans-serif]">
            <strong className="text-[#0c1e11]">{planted}</strong> planted
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
          <span className="text-[11.5px] font-medium text-[#5c5044] font-['Outfit',sans-serif]">
            <strong className="text-[#0c1e11]">{pending}</strong> pending
          </span>
        </div>
        <div className="ml-auto text-[11px] text-[#b5ac9e] font-['Outfit',sans-serif]">
          {locations.length} total parcels
        </div>
      </div>
    </div>
  );
};

export default ContributionMap;