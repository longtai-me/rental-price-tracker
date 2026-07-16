'use client';

import Link from 'next/link';
import { Buildings, List, X } from '@phosphor-icons/react';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-10 w-auto" fill="none">
              <path d="M8 32 L32 12 L32 52 H8 Z" fill="#4F46E5" />
              <path d="M38 24 H56 V38 L47 52 L38 38 V24 Z" fill="#EF4444" />
            </svg>
            <div className="flex flex-col justify-center" style={{ lineHeight: 1.1 }}>
              <span className="font-[800] text-[20px] text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>Rental Price</span>
              <span className="font-[600] text-[12px] text-[#64748b] uppercase" style={{ letterSpacing: '0.15em', marginTop: 3 }}>TRACKER</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">首頁</Link>
            <Link href="/submit" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">我要刊登</Link>
            <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">管理員</Link>
            <a href="https://github.com/longtai-me/rental-price-tracker" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">GitHub</a>
          </div>

          {/* Hamburger button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="開關選單"
          >
            {menuOpen ? <X size={24} weight="regular" /> : <List size={24} weight="regular" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>首頁</Link>
          <Link href="/submit" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>我要刊登</Link>
          <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>管理員</Link>
          <a href="https://github.com/longtai-me/rental-price-tracker" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>GitHub</a>
        </div>
      )}
    </nav>
  );
}
