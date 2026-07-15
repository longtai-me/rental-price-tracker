"use client";
import dynamic from 'next/dynamic';
import { SpinnerGap } from '@phosphor-icons/react';

const DraggableMapPicker = dynamic(() => import('./DraggableMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px] bg-white rounded-lg border border-gray-200">
      <SpinnerGap className="spinner"  size={24} weight="regular" />
      <span className="ml-2 text-gray-500">載入地圖中...</span>
    </div>
  ),
});

export default DraggableMapPicker;
