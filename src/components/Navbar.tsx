'use client';

import Link from 'next/link';
import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
          <Building2 className="logo-icon" />
          <span>租屋實價登錄 Tracker</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links desktop-nav">
          <Link href="/">首頁</Link>
          <Link href="/submit">我要刊登</Link>
          <Link href="/admin">管理員</Link>
          <a href="https://github.com/longtai-me/rental-price-tracker" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>

        {/* Hamburger button */}
        <button
          className="burger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="開關選單"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fade-in">
          <Link href="/" onClick={() => setMenuOpen(false)}>首頁</Link>
          <Link href="/submit" onClick={() => setMenuOpen(false)}>我要刊登</Link>
          <Link href="/admin" onClick={() => setMenuOpen(false)}>管理員</Link>
          <a href="https://github.com/longtai-me/rental-price-tracker" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>GitHub</a>
        </div>
      )}
    </nav>
  );
}
