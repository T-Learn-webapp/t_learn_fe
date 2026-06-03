'use client';

import { XCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
      <div className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <XCircle size={36} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Thanh toán đã bị hủy
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Bạn đã hủy quá trình thanh toán. Tài khoản của bạn chưa được nâng cấp.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/upgrade">
              Thử lại
            </Link>
          </Button>

          <Button asChild variant="outline" className="flex-1">
            <Link href="/subjects">
              Về trang chủ đề
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}