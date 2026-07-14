import Link from 'next/link';
import { Building2 } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link href="/" className="logo">
          <Building2 className="logo-icon" />
          <span>租屋實價登錄 Tracker</span>
        </Link>
        <div className="nav-links">
          <Link href="/">首頁</Link>
          <a href="#" className="disabled-link">關於系統</a>
        </div>
      </div>
    </nav>
  );
}
