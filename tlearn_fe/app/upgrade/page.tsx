'use client';

import {
  CheckCircle2,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useSubscription } from '@/hooks/useSubscription';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { PlanType, SubscriptionPlanDto } from '@/types/Subscription';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
  }).format(amount);
};

const formatDate = (date?: string | null) => {
  if (!date) return null;

  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getPlanHighlight = (planType: PlanType) => {
  switch (planType) {
    case 'PremiumYearly':
      return 'Tiết kiệm hơn';
    case 'PremiumMonthly':
    default:
      return 'Linh hoạt';
  }
};

function UpgradePlanCard({
  plan,
  loading,
  isCurrentPlan,
  hasActiveSubscription,
  onUpgrade,
}: {
  plan: SubscriptionPlanDto;
  loading: boolean;
  isCurrentPlan: boolean;
  hasActiveSubscription: boolean;
  onUpgrade: (planType: PlanType) => void;
}) {
  const isYearly = plan.planType === 'PremiumYearly';

  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isCurrentPlan
          ? 'border-emerald-300 ring-2 ring-emerald-100'
          : isYearly
            ? 'border-indigo-300 ring-2 ring-indigo-100'
            : 'border-slate-200'
      }`}
    >
      <div className="absolute right-5 top-5 flex gap-2">
        {isCurrentPlan ? (
          <Badge className="bg-emerald-600">
            Gói hiện tại
          </Badge>
        ) : isYearly ? (
          <Badge className="bg-indigo-600">
            Khuyên dùng
          </Badge>
        ) : null}
      </div>

      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${
          isCurrentPlan
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-indigo-50 text-indigo-600'
        }`}
      >
        <Crown size={24} />
      </div>

      <div>
        <p
          className={`text-sm font-semibold ${
            isCurrentPlan ? 'text-emerald-600' : 'text-indigo-600'
          }`}
        >
          {isCurrentPlan ? 'Bạn đang sử dụng' : getPlanHighlight(plan.planType)}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {plan.planName}
        </h2>

        {plan.description && (
          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
            {plan.description}
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-slate-900">
            {formatCurrency(plan.amount, plan.currency)}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Thời hạn {plan.durationDays} ngày
        </p>
      </div>

      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Truy cập các tính năng Premium
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Tăng giới hạn sử dụng AI
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Thanh toán bảo mật qua PayOS
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Kích hoạt sau khi thanh toán thành công
        </div>
      </div>

      <Button
        className="mt-8 w-full gap-2"
        variant={isCurrentPlan ? 'secondary' : 'default'}
        disabled={loading || isCurrentPlan || hasActiveSubscription}
        onClick={() => onUpgrade(plan.planType)}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang tạo thanh toán...
          </>
        ) : isCurrentPlan ? (
          <>
            <CheckCircle2 size={16} />
            Đang sử dụng
          </>
        ) : hasActiveSubscription ? (
          <>
            <ShieldCheck size={16} />
            Nâng cấp
          </>
        ) : (
          <>
            <ShieldCheck size={16} />
            Nâng cấp ngay
          </>
        )}
      </Button>
    </div>
  );
}

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const {
    plans,
    plansLoading,
    upgradeLoadingPlan,
    upgrade,
  } = useSubscription();

  const hasActiveSubscription = !!user?.hasActiveSubscription;
  const currentPlanType = user?.currentPlanType as PlanType | null | undefined;
  const currentPlanName = user?.currentPlanName || user?.subscriptionType || 'Free';
  const remainingVipDays = user?.remainingVipDays ?? 0;
  const subscriptionEndDate = formatDate(user?.subscriptionEndDate);

  const aiRemainingCount = user?.aiRemainingCount ?? 0;
  const aiUsageLimit = user?.aiUsageLimit ?? 0;
  const aiUsageResetAt = formatDate(user?.aiUsageResetAt);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Nâng cấp thành viên
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Chọn gói Premium phù hợp và thanh toán qua PayOS.
            </p>
          </div>

          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge
                variant={hasActiveSubscription ? 'default' : 'secondary'}
                className="mb-3 gap-1.5"
              >
                <Crown size={13} />
                {hasActiveSubscription ? currentPlanName : 'Free'}
              </Badge>

              <h2 className="text-2xl font-bold text-slate-900">
                {hasActiveSubscription
                  ? 'Thông tin gói thành viên của bạn'
                  : 'Mở khóa trải nghiệm học tập tốt hơn'}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Sau khi chọn gói, hệ thống sẽ tạo liên kết thanh toán và chuyển bạn sang PayOS để quét mã QR.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:min-w-[420px]">
              <div className="rounded-2xl border bg-indigo-50 p-4 text-indigo-700">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Crown size={18} />
                  Gói hiện tại
                </div>

                <p className="mt-2 text-xl font-bold">
                  {hasActiveSubscription ? currentPlanName : 'Free'}
                </p>

                {hasActiveSubscription ? (
                  <p className="mt-1 text-xs">
                    Còn {remainingVipDays} ngày
                    {subscriptionEndDate ? ` · hết hạn ${subscriptionEndDate}` : ''}
                  </p>
                ) : (
                  <p className="mt-1 text-xs">
                    Chưa có gói Premium đang hoạt động
                  </p>
                )}
              </div>

              <div className="rounded-2xl border bg-emerald-50 p-4 text-emerald-700">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles size={18} />
                  Lượt AI
                </div>

                <p className="mt-2 text-xl font-bold">
                  {aiRemainingCount}/{aiUsageLimit}
                </p>

                {aiUsageResetAt && (
                  <p className="mt-1 text-xs">
                    Reset: {aiUsageResetAt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {plansLoading ? (
          <div className="flex h-80 items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải danh sách gói...
          </div>
        ) : plans.length === 0 ? (
          <div className="flex h-80 items-center justify-center rounded-3xl border border-dashed bg-white text-slate-500">
            Hiện chưa có gói nâng cấp nào.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <UpgradePlanCard
                key={plan.id}
                plan={plan}
                loading={upgradeLoadingPlan === plan.planType}
                isCurrentPlan={
                  hasActiveSubscription && currentPlanType === plan.planType
                }
                hasActiveSubscription={hasActiveSubscription}
                onUpgrade={upgrade}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}