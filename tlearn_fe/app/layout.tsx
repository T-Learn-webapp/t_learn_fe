import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/layout/AppShell';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LearnFlash - Học tập thông minh',
  description: 'Nền tảng học tập với flashcard và real-time collaboration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={cn('font-sans', geist.variable)}>
      <body className={cn(inter.className, 'min-h-screen bg-slate-50')}>
        <AuthProvider>
          <AppShell>
          <div className="relative min-h-screen overflow-hidden">
            {/* Họa tiết nền */}
            <div className="pointer-events-none fixed inset-0 -z-10">
              {/* Gradient nền chính */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />

              {/* Blob trang trí góc trên trái */}
              <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

              {/* Blob trang trí góc dưới phải */}
              <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />

              {/* Blob nhẹ ở giữa */}
              <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-100/40 blur-3xl" />

              {/* Pattern dạng lưới */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

              {/* Radial fade để lưới mềm hơn */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_70%)] opacity-80" />
            </div>

            {children}
          </div>
          </AppShell>

          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}