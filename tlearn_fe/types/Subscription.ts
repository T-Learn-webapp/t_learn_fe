export type PlanType = 'PremiumMonthly' | 'PremiumYearly';

export interface SubscriptionPlanDto {
  id: string;
  planType: PlanType;
  planName: string;
  description?: string | null;
  amount: number;
  currency: string;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
}

export interface UpgradePaymentRequest {
  planType: PlanType;
}

export interface UpgradePaymentResponse {
  paymentId: string;
  orderCode: string;
  paymentLinkId: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
  planType: PlanType;
  planName: string;
  expiresAt: string;
}