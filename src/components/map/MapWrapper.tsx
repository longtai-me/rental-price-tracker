"use client";
import dynamic from 'next/dynamic';
import { SpinnerGap } from '@phosphor-icons/react';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--card-bg)', borderRadius: '16px' }}>
      <SpinnerGap className="spinner"  size={32} weight="regular" />
    </div>
  )
});

interface MapWrapperProps {
  data: any[];
  onMarkerClick: (item: any) => void;
  externalCenter?: [number, number] | null;
  onBoundsChange?: (bounds: {minLat: number, maxLat: number, minLng: number, maxLng: number}) => void;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <MapComponent {...props} />;
}
