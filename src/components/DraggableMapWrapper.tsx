"use client";
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const DraggableMapPicker = dynamic(() => import('./DraggableMapPicker'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
      <Loader2 className="spinner" size={24} />
      <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>載入地圖中...</span>
    </div>
  ),
});

export default DraggableMapPicker;
