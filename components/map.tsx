// components/map.tsx
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack/Next.js
const initLeaflet = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface ClusterMarker {
  id: string;
  name: string;
  position: [number, number];
  description: string;
}

interface MapProps {
  markers: ClusterMarker[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
}

// Helper component to handle map movement
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1.5,
    });
  }, [center, zoom, map]);
  return null;
}

export default function Map({ markers, selectedId, onMarkerClick }: MapProps) {
  useEffect(() => {
    initLeaflet();
  }, []);

  // Determine active center and zoom
  const selectedMarker = markers.find((m) => m.id === selectedId);
  const mapCenter: [number, number] = selectedMarker ? selectedMarker.position : [20, 10];
  const mapZoom = selectedMarker ? 10 : 2;

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={mapZoom} 
      className="h-full w-full rounded-xl z-0"
      style={{ minHeight: '400px', height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Map controller to pan/zoom dynamically */}
      <MapController center={mapCenter} zoom={mapZoom} />

      {markers.map((marker) => (
        <Marker 
          key={marker.id} 
          position={marker.position}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) {
                onMarkerClick(marker.id);
              }
            },
          }}
        >
          <Popup>
            <div className="p-1 space-y-1">
              <h3 className="font-semibold text-sm m-0">{marker.name}</h3>
              <p className="text-xs text-muted-foreground m-0">{marker.description}</p>
              <div className="text-[10px] text-primary font-bold">Click list item for details</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}