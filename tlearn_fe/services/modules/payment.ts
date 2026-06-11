import { api } from '../api-client';
import { ApiResponse, PagedResult } from '@/types';
import {
  PaymentHistoryDto,
  PaymentStatus,
  PaymentStatusDto,
} from '@/types/Payment';

export const paymentsApi = {
  getHistory: (params?: {
    status?: PaymentStatus | 'ALL';
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const normalizedParams = {
      pageNumber: params?.pageNumber,
      pageSize: params?.pageSize,
      status: params?.status === 'ALL' ? undefined : params?.status,
    };

    return api.get<ApiResponse<PagedResult<PaymentHistoryDto>>>(
      '/api/payments/history',
      {
        params: normalizedParams,
      }
    );
  },

  getStatus: (orderCode: string) =>
    api.get<ApiResponse<PaymentStatusDto>>(
      `/api/payments/${orderCode}/status`
    ),

  sync: (orderCode: string) =>
    api.post<ApiResponse<PaymentStatusDto>>(
      `/api/payments/${orderCode}/sync`
    ),
};