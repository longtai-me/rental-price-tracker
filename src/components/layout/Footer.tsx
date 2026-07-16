import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-gray-500 text-sm mb-4 md:mb-0">
          &copy; {currentYear} 租屋實價登錄 Tracker. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500">
          <Link href="/legal/privacy" className="hover:text-blue-600 transition-colors">隱私權政策</Link>
          <span className="hidden md:inline text-gray-300">|</span>
          <Link href="/legal/terms" className="hover:text-blue-600 transition-colors">服務條款與免責聲明</Link>
        </div>
      </div>
    </footer>
  );
}
