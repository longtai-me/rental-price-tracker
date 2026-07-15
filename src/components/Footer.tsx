import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p className="copyright">
          &copy; {currentYear} 租屋實價登錄 Tracker. All rights reserved.
        </p>
        <div className="legal-links">
          <Link href="/legal/privacy" className="footer-link">隱私權政策</Link>
          <span className="separator">|</span>
          <Link href="/legal/terms" className="footer-link">服務條款與免責聲明</Link>
          <span className="separator">|</span>
          <a href="https://github.com/longtai-me/rental-price-tracker" target="_blank" rel="noopener noreferrer" className="footer-link">開源專案 (GitHub)</a>
        </div>
      </div>
    </footer>
  );
}
