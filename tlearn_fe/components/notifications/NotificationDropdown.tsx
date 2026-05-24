'use client';

import { useEffect } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { useNotifications } from '@/hooks/useNotification';
import { useNotificationRealtime } from '@/hooks/useNotificationRealtime';
import { toast } from 'sonner';
export function NotificationDropdown() {
  const router = useRouter();

  const {
    notificationLoading,
    notifications,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    prependNotification
  } = useNotifications();

  useEffect(() => {
    getNotifications(1, 10);
  }, [getNotifications]);

useNotificationRealtime({
    enabled: true,
    onNotificationReceived: (notification) => {
      prependNotification({
        ...notification,
        isRead: false,
      });
      toast.info(notification.title, {
        description: notification.message,

      });
    },
  });
  
  const handleOpenNotification = async (
    notificationId: string,
    actionUrl?: string | null
  ) => {
    await markAsRead(notificationId);

    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
        >
          <Bell size={18} />

          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[calc(100vw-24px)] p-0 sm:w-96"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Thông báo</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : 'Không có thông báo chưa đọc'}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={markAllAsRead}
            disabled={notificationLoading || unreadCount === 0}
          >
            {notificationLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCheck size={14} />
            )}
            Đọc hết
          </Button>
        </div>

        <Separator />

        <ScrollArea className="h-[420px]">
          {notifications.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center text-center text-muted-foreground">
              <Bell className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Chưa có thông báo</p>
              <p className="mt-1 text-xs">
                Khi có công việc hoặc cập nhật mới, thông báo sẽ hiện ở đây.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleOpenNotification(
                      notification.id,
                      notification.actionUrl
                    )
                  }
                  className={`w-full rounded-xl p-3 text-left transition hover:bg-muted ${
                    !notification.isRead ? 'bg-red-50/70' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.isRead
                          ? 'bg-muted-foreground/30'
                          : 'bg-red-500'
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`line-clamp-1 text-sm ${
                            notification.isRead
                              ? 'font-medium'
                              : 'font-semibold'
                          }`}
                        >
                          {notification.title}
                        </p>

                        <Badge
                          variant={notification.isRead ? 'secondary' : 'destructive'}
                          className="shrink-0 text-[10px]"
                        >
                          {notification.type}
                        </Badge>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}