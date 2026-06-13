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
import { useTranslation } from "react-i18next";
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
import { useTranslation } from "react-i18next";
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
  <div className={`rounded-xl bg-gradient-to-r from-secondary via-card to-secondary animate-pulse ${className}`} />
);

const GridSkeleton = () => (
  <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
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
  <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-row shadow-sm">
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
  const { t } = useTranslation();
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
    <div className={`flex flex-col items-center justify-center gap-2 bg-secondary ${h} w-full`}>
      <span className="text-3xl opacity-30">🌿</span>
      <p className="text-xs text-muted-foreground font-['Outfit',sans-serif]">{t("auto.auto_38", "No photos yet")}</p>
    </div>
  );

  const shown = images.slice(0, 3);
  const extra = images.length - 3;

  return (
    <div
      onClick={() => onOpenGallery(images)}
      className={`relative overflow-hidden cursor-pointer bg-secondary group ${h} w-full`}
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
  const { t } = useTranslation();
  const cfg = statusConfig(land.landStatus);
  const approxTrees = land.areaSqm ? Math.floor(land.areaSqm / 20) : null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300 group">
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
          <h3 className="font-['Cormorant_Garant',serif] text-[19px] font-semibold text-foreground leading-snug line-clamp-1">
            {land.title || "Unnamed Land"}
          </h3>
          {land.centroidLat && land.centroidLng && (
            <p className="text-[11.5px] text-muted-foreground mt-1 font-['Outfit',sans-serif]">
              📍 {land.centroidLat.toFixed(4)}, {land.centroidLng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary rounded-xl px-3 py-2.5 flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-[1.2px] font-semibold font-['Outfit',sans-serif] mb-0.5">{t("auto.auto_41", "Area")}</span>
            <span className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-foreground leading-tight">
              {land.areaSqm ? Number(land.areaSqm).toLocaleString() : "—"}
              <span className="text-[11px] text-muted-foreground font-['Outfit',sans-serif] font-normal ml-1">{t("auto.auto_42", "m²")}</span>
            </span>
          </div>
          {approxTrees ? (
            <div className="bg-secondary rounded-xl px-3 py-2.5 flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-[1.2px] font-semibold font-['Outfit',sans-serif] mb-0.5">{t("auto.auto_43", "~Trees")}</span>
              <span className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-primary leading-tight">
                {approxTrees}
                <span className="text-[11px] text-muted-foreground font-['Outfit',sans-serif] font-normal ml-1">{t("auto.auto_44", "est.")}</span>
              </span>
            </div>
          ) : <div />}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {land.waterAvailable && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground font-['Outfit',sans-serif]">
              💧 {land.waterAvailable}
            </span>
          )}
          {land.ownershipType && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground font-['Outfit',sans-serif]">
              🏛 {land.ownershipType}
            </span>
          )}
          {land.permissionStatus?.toLowerCase().includes("yes") && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-['Outfit',sans-serif]">
              {t("auto.auto_45", "✅ Permitted")}
            </span>
          )}
        </div>

        {land.notes && (
          <p className="text-[12px] text-muted-foreground italic leading-relaxed line-clamp-2 font-['Outfit',sans-serif]">
            {land.notes}
          </p>
        )}

        <div className="mt-auto">
          <button
            onClick={() => onNavigate(land.id)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[13.5px] font-semibold font-['Outfit',sans-serif] hover:bg-primary/90 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {t("auto.auto_46", "View site")}
            <span className="text-primary-foreground/70">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── List Card ────────────────────────────────────────────────
const ListCard = ({ land, onOpenGallery, onNavigate }) => {
  const { t } = useTranslation();
  const cfg = statusConfig(land.landStatus);
  const approxTrees = land.areaSqm ? Math.floor(land.areaSqm / 20) : null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 group">
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
            <h3 className="font-['Cormorant_Garant',serif] text-[19px] font-semibold text-foreground leading-snug truncate">
              {land.title || "Unnamed Land"}
            </h3>
            {land.centroidLat && land.centroidLng && (
              <p className="text-[11.5px] text-muted-foreground mt-0.5 font-['Outfit',sans-serif]">
                📍 {land.centroidLat.toFixed(4)}, {land.centroidLng.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {land.areaSqm && (
            <div className="flex items-baseline gap-1">
              <span className="font-['Cormorant_Garant',serif] text-[17px] font-semibold text-foreground">
                {Number(land.areaSqm).toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground font-['Outfit',sans-serif]">{t("auto.auto_47", "m²")}</span>
            </div>
          )}
          {approxTrees && (
            <>
              <span className="w-px h-3 bg-border" />
              <div className="flex items-baseline gap-1">
                <span className="font-['Cormorant_Garant',serif] text-[17px] font-semibold text-primary">~{approxTrees}</span>
                <span className="text-[11px] text-muted-foreground font-['Outfit',sans-serif]">{t("auto.auto_48", "trees")}</span>
              </div>
            </>
          )}
          {land.waterAvailable && (
            <>
              <span className="w-px h-3 bg-border" />
              <span className="text-[11.5px] text-muted-foreground font-['Outfit',sans-serif]">💧 {land.waterAvailable}</span>
            </>
          )}
          {land.ownershipType && (
            <span className="text-[11.5px] text-muted-foreground font-['Outfit',sans-serif] hidden md:inline">🏛 {land.ownershipType}</span>
          )}
          {land.permissionStatus?.toLowerCase().includes("yes") && (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-['Outfit',sans-serif] hidden sm:inline-flex">
              {t("auto.auto_49", "✅ Permitted")}
            </span>
          )}
        </div>

        {land.notes && (
          <p className="text-[12px] text-muted-foreground italic leading-relaxed line-clamp-1 font-['Outfit',sans-serif] hidden sm:block">
            {land.notes}
          </p>
        )}

        <div className="mt-auto">
          <button
            onClick={() => onNavigate(land.id)}
            className="py-2.5 px-5 rounded-xl bg-primary text-primary-foreground text-[13.5px] font-semibold font-['Outfit',sans-serif] hover:bg-primary/90 transition-colors duration-200 cursor-pointer inline-flex items-center gap-2"
          >
            {t("auto.auto_50", "View site")} <span className="text-primary-foreground/70">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────
const Browse = () => {
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Browse;