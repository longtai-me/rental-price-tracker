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
      <body>
        <ToastProvider>
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
