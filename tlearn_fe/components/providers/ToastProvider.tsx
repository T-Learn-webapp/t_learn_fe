'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'font-sans shadow-lg',
          title: 'text-sm font-medium',
          description: 'text-sm opacity-90',
        },
      }}
    />
  );
}
