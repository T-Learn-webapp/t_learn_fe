import { useCallback, useEffect, useState } from 'react';
import { paymentsApi } from '@/services/modules/payment';
import {
  PaymentHistoryDto,
  PaymentStatus,
  PaymentStatusDto,
} from '@/types/Payment';
import { toast } from 'sonner';

type PaymentFilterStatus = PaymentStatus | 'ALL';

export function usePaymentHistory() {
  const [payments, setPayments] = useState<PaymentHistoryDto[]>([]);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentStatusDto | null>(null);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [syncLoadingOrderCode, setSyncLoadingOrderCode] =
    useState<string | null>(null);

  const [status, setStatus] = useState<PaymentFilterStatus>('ALL');

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const loadHistory = useCallback(
    async (
      customStatus: PaymentFilterStatus = status,
      pageNumber: number = pagination.pageNumber,
      pageSize: number = pagination.pageSize
    ) => {
      setHistoryLoading(true);

      try {
        const res = await paymentsApi.getHistory({
          status: customStatus,
          pageNumber,
          pageSize,
        });

        if (res.data?.isSuccess && res.data.data) {
          const data = res.data.data;

          setPayments(data.items || []);
          setPagination({
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
            hasPreviousPage: data.hasPreviousPage,
            hasNextPage: data.hasNextPage,
          });

          return {
            success: true,
            data,
          };
        }

        toast.error(res.data?.error || 'Không thể tải lịch sử thanh toán');
        setPayments([]);

        return {
          success: false,
        };
      } catch (error: any) {
        console.error('Load payment history error:', error);

        toast.error(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            'Không thể tải lịch sử thanh toán'
        );

        setPayments([]);

        return {
          success: false,
          error,
        };
      } finally {
        setHistoryLoading(false);
      }
    },
    [status, pagination.pageNumber, pagination.pageSize]
  );

  const changeStatus = async (nextStatus: PaymentFilterStatus) => {
    setStatus(nextStatus);
    await loadHistory(nextStatus, 1, pagination.pageSize);
  };

  const getPaymentStatus = async (orderCode: string) => {
    setDetailLoading(true);

    try {
      const res = await paymentsApi.getStatus(orderCode);

      if (res.data?.isSuccess && res.data.data) {
        setSelectedPayment(res.data.data);

        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể xem chi tiết thanh toán');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Get payment status error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể xem chi tiết thanh toán'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setDetailLoading(false);
    }
  };

  const syncPayment = async (orderCode: string) => {
    setSyncLoadingOrderCode(orderCode);

    try {
      const res = await paymentsApi.sync(orderCode);

      if (res.data?.isSuccess && res.data.data) {
        toast.success('Đã đồng bộ trạng thái thanh toán');

        setSelectedPayment(res.data.data);

        await loadHistory(status, pagination.pageNumber, pagination.pageSize);

        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể đồng bộ thanh toán');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Sync payment error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể đồng bộ thanh toán'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setSyncLoadingOrderCode(null);
    }
  };

  useEffect(() => {
    loadHistory('ALL', 1, 10);
  }, []);

  return {
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
  };
}