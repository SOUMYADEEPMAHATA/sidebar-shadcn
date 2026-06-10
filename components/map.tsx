// components/map.tsx
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack/Next.js
const initLeaflet = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

export default function Map() {
  useEffect(() => {
    initLeaflet();
  }, []);

  return (
    <MapContainer 
      center={[1.2983199246659607, 103.7902840557283]} 
      zoom={13} 
      className="h-full w-full rounded-xl z-0"
      style={{ minHeight: '400px', height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[1.2983199246659607, 103.7902840557283]}>
        <Popup>Grid Location 1</Popup>
      </Marker>
    </MapContainer>
  );
}