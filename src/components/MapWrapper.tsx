"use client";
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--card-bg)', borderRadius: '16px' }}>
      <Loader2 className="spinner" size={32} />
    </div>
  )
});

export default MapComponent;
