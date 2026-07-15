import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: '租屋實價登錄 Tracker',
  description: '透明化的租屋實價登錄查詢系統',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
                try {
                  window.trustedTypes.createPolicy('default', {
                    createHTML: (string) => string,
                    createScript: (string) => string,
                    createScriptURL: (string) => string,
                  });
                } catch (e) {}
              }
            `
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <ToastProvider>
          <Navbar />
          <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-20 pb-8 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
