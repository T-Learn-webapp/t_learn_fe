import { api } from '../api-client';

import {
  ApiResponse,
  PagedResult,
} from '@/types';

import {
  NotificationDto,
  GetNotificationsParams,
} from '@/types/Notification';

export const notificationsApi = {
  getAll: (params?: GetNotificationsParams) =>
    api.get<ApiResponse<PagedResult<NotificationDto>>>(
      '/api/Notifications',
      { params }
    ),

  markAsRead: (notificationId: string) =>
    api.put<ApiResponse<boolean>>(
      `/api/Notifications/${notificationId}/read`
    ),

  markAllAsRead: () =>
    api.put<ApiResponse<boolean>>(
      '/api/notifications/read-all'
    ),
};