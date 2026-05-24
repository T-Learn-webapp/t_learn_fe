'use client';

import { AppHeader } from '@/components/layout/AppHeader';

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="min-h-[calc(100vh-56px)]">
        {children}
      </main>
    </div>
  );
}