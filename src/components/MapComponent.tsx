"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface MapProps {
  data: any[];
  onMarkerClick: (item: any) => void;
}

export default function MapComponent({ data, onMarkerClick }: MapProps) {
  // Center on Taipei by default
  const defaultCenter: [number, number] = [25.0330, 121.5654];
  const center = data.length > 0 && data[0].lat ? [data[0].lat, data[0].lng] as [number, number] : defaultCenter;

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px', zIndex: 10 }}>
      <ChangeView center={center} zoom={13} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {data.map(item => (
        item.lat && item.lng && (
          <Marker 
            key={item.id} 
            position={[item.lat, item.lng]} 
            icon={icon}
            eventHandlers={{
              click: () => onMarkerClick(item)
            }}
          >
            <Popup>
              <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                <strong style={{ fontSize: '1rem' }}>{item.address}</strong><br/>
                租金: <strong>NT$ {item.price.toLocaleString()}</strong><br/>
                {item.type} | {item.layout} | {item.area} 坪
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
