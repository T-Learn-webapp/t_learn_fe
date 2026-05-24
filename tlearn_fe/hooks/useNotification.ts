import { useCallback, useState } from 'react';

import { notificationsApi } from '@/services/modules/notification';
import { NotificationDto } from '@/types/Notification';
import { toast } from '@/lib/toast';

export function useNotifications() {
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const prependNotification = useCallback(
    (notification: NotificationDto) => {
      setNotifications((prev) => {
        const existed = prev.some((item) => item.id === notification.id);

        if (existed) return prev;

        return [notification, ...prev].slice(0, pagination.pageSize || 10);
      });

      setPagination((prev) => ({
        ...prev,
        totalCount: prev.totalCount + 1,
      }));
    },
    [pagination.pageSize]
  );

  const getNotifications = useCallback(
    async (
      pageNumber: number = 1,
      pageSize: number = 10,
      isRead?: boolean
    ) => {
      setNotificationLoading(true);

      try {
        const res = await notificationsApi.getAll({
          pageNumber,
          pageSize,
          isRead,
        });

        if (res.data?.isSuccess && res.data?.data) {
          const data = res.data.data;

          setNotifications(data.items);

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

        return {
          success: false,
        };
      } catch (error: any) {
        console.error('Get notifications error:', error);

        toast.error(
          error?.response?.data?.message ||
            'Không thể tải thông báo'
        );

        return {
          success: false,
          error,
        };
      } finally {
        setNotificationLoading(false);
      }
    },
    []
  );

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await notificationsApi.markAsRead(notificationId);

      if (res.data?.isSuccess) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
        );

        return {
          success: true,
        };
      }

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Mark notification as read error:', error);

      return {
        success: false,
        error,
      };
    }
  };

  const markAllAsRead = async () => {
    setNotificationLoading(true);

    try {
      const res = await notificationsApi.markAllAsRead();

      if (res.data?.isSuccess) {
        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            isRead: true,
          }))
        );

        toast.success('Đã đánh dấu tất cả thông báo là đã đọc');

        return {
          success: true,
        };
      }

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Mark all notifications as read error:', error);

      toast.error(
        error?.response?.data?.message ||
          'Không thể đánh dấu tất cả là đã đọc'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setNotificationLoading(false);
    }
  };

  return {
    notificationLoading,
    notifications,
    unreadCount,
    pagination,
    getNotifications,
    markAsRead,
    markAllAsRead,
    prependNotification,
  };
}