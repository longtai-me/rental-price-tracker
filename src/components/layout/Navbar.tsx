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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 55" className="h-10 w-auto">
              <path d="M15 45 L15 25 L35 10 L55 25 L55 45 Z" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M5 15 L25 35 L40 25 L65 45" fill="none" stroke="#e53e3e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M50 45 L65 45 L65 30" fill="none" stroke="#e53e3e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col justify-center translate-y-[2px]">
              <span className="font-[800] text-[22px] leading-none text-[#0f172a] tracking-tight">Rental Price</span>
              <span className="font-[600] text-[15px] leading-none text-[#64748b] tracking-widest mt-1">TRACKER</span>
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
