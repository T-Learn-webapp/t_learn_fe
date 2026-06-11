'use client';

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  RefreshCcw,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import {
  PaymentHistoryDto,
  PaymentStatus,
  PaymentStatusDto,
} from '@/types/Payment';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

type PaymentFilterStatus = PaymentStatus | 'ALL';

const paymentStatusOptions: {
  label: string;
  value: PaymentFilterStatus;
}[] = [
  {
    label: 'Tất cả',
    value: 'ALL',
  },
  {
    label: 'Đang chờ',
    value: 'PENDING',
  },
  {
    label: 'Đã thanh toán',
    value: 'PAID',
  },
  {
    label: 'Thất bại',
    value: 'FAILED',
  },
  {
    label: 'Đã hoàn tiền',
    value: 'REFUNDED',
  },
  {
    label: 'Đã hủy',
    value: 'CANCELLED',
  },
  {
    label: 'Hết hạn',
    value: 'EXPIRED',
  },
];

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
  }).format(amount);
};

const formatDateTime = (date?: string | null) => {
  if (!date) return 'Không có';

  return new Date(date).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusLabel = (status: PaymentStatus | string) => {
  switch (status) {
    case 'PENDING':
      return 'Đang chờ';
    case 'PAID':
      return 'Đã thanh toán';
    case 'FAILED':
      return 'Thất bại';
    case 'REFUNDED':
      return 'Đã hoàn tiền';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'EXPIRED':
      return 'Hết hạn';
    default:
      return status;
  }
};

const getStatusBadgeClass = (status: PaymentStatus | string) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-600 text-white hover:bg-emerald-600';
    case 'PENDING':
      return 'bg-amber-500 text-white hover:bg-amber-500';
    case 'FAILED':
      return 'bg-red-600 text-white hover:bg-red-600';
    case 'CANCELLED':
      return 'bg-slate-600 text-white hover:bg-slate-600';
    case 'EXPIRED':
      return 'bg-zinc-500 text-white hover:bg-zinc-500';
    case 'REFUNDED':
      return 'bg-blue-600 text-white hover:bg-blue-600';
    default:
      return '';
  }
};

const getStatusIcon = (status: PaymentStatus | string) => {
  switch (status) {
    case 'PAID':
      return <CheckCircle2 size={15} />;
    case 'PENDING':
      return <Clock3 size={15} />;
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
      return <XCircle size={15} />;
    default:
      return <CreditCard size={15} />;
  }
};

function PaymentDetailDialog({
  open,
  payment,
  detailLoading,
  syncLoading,
  onClose,
  onSync,
}: {
  open: boolean;
  payment: PaymentStatusDto | null;
  detailLoading: boolean;
  syncLoading: boolean;
  onClose: () => void;
  onSync: (orderCode: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Chi tiết thanh toán</DialogTitle>
          <DialogDescription>
            Kiểm tra trạng thái và đồng bộ lại với PayOS khi cần.
          </DialogDescription>
        </DialogHeader>

        {detailLoading ? (
          <div className="flex h-56 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải chi tiết thanh toán...
          </div>
        ) : !payment ? (
          <div className="flex h-56 items-center justify-center text-muted-foreground">
            Không có dữ liệu thanh toán.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-muted/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                  <p className="mt-1 text-lg font-bold">
                    {payment.orderCode}
                  </p>
                </div>

                <Badge className={`gap-1.5 ${getStatusBadgeClass(payment.status)}`}>
                  {getStatusIcon(payment.status)}
                  {getStatusLabel(payment.status)}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Gói</p>
                  <p className="font-medium">{payment.planName}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Số tiền</p>
                  <p className="font-medium">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Trạng thái PayOS gần nhất</p>
                  <p className="font-medium">
                    {payment.lastPayOSStatus || 'Không có'}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Hết hạn</p>
                  <p className="font-medium">
                    {formatDateTime(payment.expiresAt)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Thanh toán lúc</p>
                  <p className="font-medium">
                    {formatDateTime(payment.paidAt)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Hủy lúc</p>
                  <p className="font-medium">
                    {formatDateTime(payment.cancelledAt)}
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full gap-2"
              variant={payment.isPaid ? 'outline' : 'default'}
              disabled={syncLoading}
              onClick={() => onSync(payment.orderCode)}
            >
              {syncLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                <>
                  <RefreshCcw size={16} />
                  Đồng bộ lại trạng thái PayOS
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentCard({
  payment,
  syncLoading,
  onViewDetail,
  onSync,
}: {
  payment: PaymentHistoryDto;
  syncLoading: boolean;
  onViewDetail: (orderCode: string) => void;
  onSync: (orderCode: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`gap-1.5 ${getStatusBadgeClass(payment.status)}`}>
              {getStatusIcon(payment.status)}
              {getStatusLabel(payment.status)}
            </Badge>

            <Badge variant="outline">
              Order #{payment.orderCode}
            </Badge>
          </div>

          <h3 className="mt-3 text-lg font-bold text-slate-900">
            {payment.planName}
          </h3>

          {payment.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {payment.description}
            </p>
          )}
        </div>

        <div className="text-left md:text-right">
          <p className="text-xl font-bold text-slate-900">
            {formatCurrency(payment.amount, payment.currency)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {payment.planType}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Tạo lúc</p>
          <p className="mt-1 font-medium">{formatDateTime(payment.createdAt)}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Hết hạn</p>
          <p className="mt-1 font-medium">{formatDateTime(payment.expiresAt)}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Thanh toán</p>
          <p className="mt-1 font-medium">{formatDateTime(payment.paidAt)}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Cập nhật</p>
          <p className="mt-1 font-medium">{formatDateTime(payment.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => onViewDetail(payment.orderCode)}
        >
          <Eye size={16} />
          Chi tiết
        </Button>

        {!payment.isPaid && (
          <Button
            className="gap-2"
            disabled={syncLoading}
            onClick={() => onSync(payment.orderCode)}
          >
            {syncLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang đồng bộ...
              </>
            ) : (
              <>
                <RefreshCcw size={16} />
                Đồng bộ
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PaymentHistoryPage() {
  const router = useRouter();

  const {
    payments,
    selectedPayment,
    setSelectedPayment,

    historyLoading,
    detailLoading,
    syncLoadingOrderCode,

    status,
    pagination,

    loadHistory,
    changeStatus,
    getPaymentStatus,
    syncPayment,
  } = usePaymentHistory();

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft size={18} />
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Lịch sử thanh toán
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Theo dõi các giao dịch nâng cấp tài khoản Premium.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              loadHistory(status, pagination.pageNumber, pagination.pageSize)
            }
          >
            <RefreshCcw size={16} />
            Làm mới
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Bộ lọc trạng thái
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Chọn trạng thái để xem các giao dịch tương ứng.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {paymentStatusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={status === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeStatus(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {historyLoading ? (
          <div className="flex h-80 items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải lịch sử thanh toán...
          </div>
        ) : payments.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-white text-center text-slate-500">
            <CreditCard className="mb-3 h-10 w-10" />
            <p className="font-medium">Chưa có giao dịch nào</p>
            <p className="mt-1 text-sm">
              Khi bạn nâng cấp tài khoản, lịch sử thanh toán sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                syncLoading={syncLoadingOrderCode === payment.orderCode}
                onViewDetail={getPaymentStatus}
                onSync={syncPayment}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={!pagination.hasPreviousPage || historyLoading}
              onClick={() =>
                loadHistory(status, pagination.pageNumber - 1, pagination.pageSize)
              }
            >
              Trang trước
            </Button>

            <span className="text-sm text-muted-foreground">
              Trang {pagination.pageNumber}/{pagination.totalPages}
            </span>

            <Button
              variant="outline"
              disabled={!pagination.hasNextPage || historyLoading}
              onClick={() =>
                loadHistory(status, pagination.pageNumber + 1, pagination.pageSize)
              }
            >
              Trang sau
            </Button>
          </div>
        )}
      </main>

      <PaymentDetailDialog
        open={!!selectedPayment || detailLoading}
        payment={selectedPayment}
        detailLoading={detailLoading}
        syncLoading={
          !!selectedPayment &&
          syncLoadingOrderCode === selectedPayment.orderCode
        }
        onClose={() => setSelectedPayment(null)}
        onSync={syncPayment}
      />
    </div>
  );
}