import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
const BASE_URL = import.meta.env.VITE_API_URL;

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// 🌱 Custom icons
const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

const yellowIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32],
});

const ContributionMap = ({ locations }) => {
  return (
    <MapContainer
      center={[18.4088, 76.5604]} // Latur default
      zoom={6}
      className="h-64 w-full rounded"
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((loc, index) => (
        <Marker
          key={index}
          position={[loc.lat, loc.lng]}
          icon={loc.planted ? greenIcon : yellowIcon}
        >
          <Popup>
            <strong>{loc.title}</strong><br />
            Status: {loc.planted ? "Planted 🌱" : "Pending ⏳"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ContributionMap;