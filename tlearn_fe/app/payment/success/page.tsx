'use client';

import { useEffect } from 'react';
import { CheckCircle2, Crown, CreditCard } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/providers/AuthProvider';

export default function PaymentSuccessPage() {
  const { refetchAuth } = useAuthContext();

  useEffect(() => {
    refetchAuth();
  }, [refetchAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
      <div className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Thanh toán thành công
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Gói Premium của bạn đang được hệ thống xác nhận. Nếu tài khoản chưa được nâng cấp ngay, vui lòng tải lại trang sau vài giây.
        </p>

        <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-indigo-700">
          <Crown className="mx-auto mb-2" size={28} />
          <p className="text-sm font-medium">
            Cảm ơn bạn đã nâng cấp tài khoản.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link href="/subjects">
              Về trang chủ đề
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/upgrade">
              Xem gói nâng cấp
            </Link>
          </Button>

          <Button asChild variant="outline" className="gap-2 sm:col-span-2">
            <Link href="/payments/history">
              <CreditCard size={16} />
              Lịch sử thanh toán
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}