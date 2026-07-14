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
          <a href="#" className="disabled-link">關於系統</a>
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
          <a href="#" className="disabled-link" onClick={() => setMenuOpen(false)}>關於系統</a>
        </div>
      )}
    </nav>
  );
}
