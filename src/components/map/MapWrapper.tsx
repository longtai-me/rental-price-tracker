"use client";
import dynamic from 'next/dynamic';
import { SpinnerGap } from '@phosphor-icons/react';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-white rounded-2xl">
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
