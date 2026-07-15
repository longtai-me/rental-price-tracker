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

export default MapComponent;
