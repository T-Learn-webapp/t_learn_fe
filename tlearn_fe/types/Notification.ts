export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

export interface NotificationRealtimeDto {
  id: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface GetNotificationsParams {
  pageNumber?: number;
  pageSize?: number;
  isRead?: boolean;
}