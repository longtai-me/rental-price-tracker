"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
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

function MapController({ externalCenter, onBoundsChange }: { externalCenter?: [number, number] | null; onBoundsChange?: (bounds: any) => void }) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
        });
      }
    }
  });

  useEffect(() => {
    if (externalCenter) {
      map.setView(externalCenter, 13);
    }
  }, [externalCenter, map]);

  return null;
}

interface MapProps {
  data: any[];
  onMarkerClick: (item: any) => void;
  externalCenter?: [number, number] | null;
  onBoundsChange?: (bounds: {minLat: number, maxLat: number, minLng: number, maxLng: number}) => void;
}

const maskAddress = (address: string) => {
  if (!address) return '';
  const lastIndex = Math.max(
    address.lastIndexOf('路'),
    address.lastIndexOf('街'),
    address.lastIndexOf('道'),
    address.lastIndexOf('段'),
    address.lastIndexOf('巷'),
    address.lastIndexOf('弄')
  );
  if (lastIndex !== -1) {
    return address.substring(0, lastIndex + 1);
  }
  return address.replace(/\d+號.*/, '');
};

export default function MapComponent({ data, onMarkerClick, externalCenter, onBoundsChange }: MapProps) {
  // Center on Taipei by default
  const defaultCenter: [number, number] = [25.0330, 121.5654];
  const center = externalCenter || defaultCenter;


  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px', zIndex: 10 }}>
      <MapController externalCenter={externalCenter} onBoundsChange={onBoundsChange} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {data.map((item, index) => {
        if (!item.lat || !item.lng) return null;
        return (
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
                <strong style={{ fontSize: '1rem' }}>{maskAddress(item.address)}</strong><br/>
                租金: <strong>NT$ {item.price.toLocaleString()}</strong><br/>
                {item.propertyType || "其他"} | {item.type} | {item.layout} | {item.area} 坪
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  );
}
