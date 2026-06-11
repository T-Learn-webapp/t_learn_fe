export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface PaymentHistoryDto {
  id: string;
  orderCode: string;
  amount: number;
  currency: string;
  planType: string;
  planName: string;
  status: PaymentStatus;
  paymentMethod?: string | null;
  description?: string | null;
  payOSPaymentLinkId?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  expiredAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  isPaid: boolean;
  isPending: boolean;
  isCancelled: boolean;
  isExpired: boolean;
}

export interface PaymentStatusDto {
  paymentId: string;
  orderCode: string;
  status: PaymentStatus;
  lastPayOSStatus?: string | null;
  amount: number;
  currency: string;
  planType: string;
  planName: string;
  expiresAt?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  expiredAt?: string | null;
  isPaid: boolean;
  isExpired: boolean;
  isCancelled: boolean;
}