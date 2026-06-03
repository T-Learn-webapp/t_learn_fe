import { api } from '../api-client';
import { ApiResponse } from '@/types';
import {
  SubscriptionPlanDto,
  UpgradePaymentRequest,
  UpgradePaymentResponse,
} from '@/types/Subscription';

export const subscriptionApi = {
  getPlans: () =>
    api.get<ApiResponse<SubscriptionPlanDto[]>>('/api/subscription-plans'),

  upgrade: (data: UpgradePaymentRequest) =>
    api.post<ApiResponse<UpgradePaymentResponse>>('/api/payments/upgrade', data),
};