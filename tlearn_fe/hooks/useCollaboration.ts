import { useCallback, useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';

type ActiveUser = {
  userId: string;
  connectionId: string;
  userName?: string;
  userEmail?: string;
  userColor?: string;
};

const normalizeActiveUser = (payload: any): ActiveUser | null => {
  const userId = payload?.userId || payload?.UserId;
  const connectionId = payload?.connectionId || payload?.ConnectionId;

  if (!userId || !connectionId) return null;

  return {
    userId: String(userId),
    connectionId: String(connectionId),
    userName: payload?.userName || payload?.UserName,
    userEmail: payload?.userEmail || payload?.UserEmail,
    userColor: payload?.userColor || payload?.UserColor,
  };
};

const upsertActiveUser = (
  users: ActiveUser[],
  nextUser: ActiveUser
): ActiveUser[] => {
  const existed = users.some(
    (user) => user.connectionId === nextUser.connectionId
  );

  if (existed) {
    return users.map((user) =>
      user.connectionId === nextUser.connectionId
        ? {
            ...user,
            ...nextUser,
          }
        : user
    );
  }

  return [...users, nextUser];
};

const normalizeOperationPayload = (payload: any) => {
  if (typeof payload === 'string') {
    return {
      operation: payload,
      userId: undefined,
      connectionId: undefined,
      userColor: undefined,
    };
  }

  return {
    operation: payload?.operation || payload?.Operation,
    userId: payload?.userId || payload?.UserId,
    connectionId: payload?.connectionId || payload?.ConnectionId,
    userColor: payload?.userColor || payload?.UserColor,
  };
};

export function useCollaboration(materialId: string, userId: string) {
  const [content, setContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestContentRef = useRef('');
  const isMountedRef = useRef(false);
  const isManualSavingRef = useRef(false);

  const clearTimers = () => {
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  const triggerAutoSave = useCallback(
    (latestContent: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const connection = connectionRef.current;

        if (
          !connection ||
          connection.state !== signalR.HubConnectionState.Connected
        ) {
          return;
        }

        try {
          await connection.invoke('SaveSnapshot', materialId, latestContent);
          console.log('Tự động lưu thành công');
        } catch (err) {
          console.error('Tự động lưu thất bại:', err);
        }
      }, 3000);
    },
    [materialId]
  );

  useEffect(() => {
    if (!materialId || !userId) return;

    isMountedRef.current = true;
    let cancelled = false;
    let hasStarted = false;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/collaborationHub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    connection.on('OnlineUsers', (users: ActiveUser[]) => {
      if (cancelled) return;

      const normalizedUsers = users
        .map((user) => normalizeActiveUser(user))
        .filter((user): user is ActiveUser => Boolean(user));

      const uniqueUsers = normalizedUsers.filter(
        (user, index, self) =>
          index === self.findIndex((x) => x.connectionId === user.connectionId)
      );

      setActiveUsers(uniqueUsers);
    });

    connection.on('Joined', (_joinedMaterialId: string, onlineUser?: any) => {
      if (cancelled) return;

      setIsConnected(true);

      const normalizedUser = normalizeActiveUser(onlineUser);

      if (normalizedUser) {
        setActiveUsers((prev) => upsertActiveUser(prev, normalizedUser));
      }
    });

    connection.on('UserJoined', (onlineUser: any) => {
      if (cancelled) return;

      const normalizedUser = normalizeActiveUser(onlineUser);

      if (!normalizedUser) return;

      setActiveUsers((prev) => upsertActiveUser(prev, normalizedUser));
    });

    connection.on('UserLeft', (_leftUserId: string, connectionId: string) => {
      if (cancelled) return;
      if (!connectionId) return;

      setActiveUsers((prev) =>
        prev.filter((user) => user.connectionId !== connectionId)
      );
    });

    connection.on('SnapshotSaved', (_savedMaterialId: string, version: number) => {
      if (cancelled) return;

      if (isManualSavingRef.current) {
        toast.success('Đã lưu nội dung thủ công tài liệu thành công!');
        isManualSavingRef.current = false;
        return;
      }

      console.log('Snapshot saved, version:', version);
    });

    connection.on('SnapshotSaveFailed', (message: string) => {
      if (cancelled) return;

      if (isManualSavingRef.current) {
        toast.error(message || 'Không thể lưu nội dung lúc này');
        isManualSavingRef.current = false;
        return;
      }

      console.error('Snapshot save failed:', message);
    });

    connection.on('MaterialVersionUpdated', (payload: unknown) => {
      if (cancelled) return;

      console.log('Material version updated:', payload);
    });

    connection.on('ReceiveOperation', (payload: unknown) => {
      if (cancelled) return;

      try {
        const normalizedPayload = normalizeOperationPayload(payload);

        if (!normalizedPayload.operation) return;

        const parsed = JSON.parse(String(normalizedPayload.operation));

        if (parsed.type !== 'update') return;
        if (parsed.content === undefined) return;

        const remoteContent = String(parsed.content);

        latestContentRef.current = remoteContent;

        setContent((prev) => {
          if (prev === remoteContent) return prev;
          return remoteContent;
        });
      } catch (err) {
        console.error('Lỗi parse operation dữ liệu phòng:', err);
      }
    });

    connection.on('ReceiveSnapshot', (snapshot: string) => {
      if (cancelled) return;
      if (!snapshot) return;

      latestContentRef.current = snapshot;

      setContent((prev) => {
        if (prev === snapshot) return prev;
        return snapshot;
      });
    });

    connection.onreconnecting(() => {
      if (cancelled) return;
      setIsConnected(false);
    });

    connection.onreconnected(async () => {
      if (cancelled) return;

      setIsConnected(true);

      try {
        await connection.invoke('JoinMaterial', materialId);
        await connection.invoke('RequestSnapshot', materialId);
      } catch (err) {
        console.error('Lỗi join lại phòng realtime:', err);
      }
    });

    connection.onclose(() => {
      if (cancelled) return;
      setIsConnected(false);
    });

    const startHub = async () => {
      try {
        await connection.start();
        hasStarted = true;

        if (cancelled) {
          await connection.stop().catch(() => {});
          return;
        }

        connectionRef.current = connection;

        await connection.invoke('JoinMaterial', materialId);
        await connection.invoke('RequestSnapshot', materialId);
      } catch (err) {
        if (!cancelled) {
          console.error('Kết nối SignalR thất bại:', err);
          setIsConnected(false);
        }
      }
    };

    startHub();

    return () => {
      cancelled = true;
      isMountedRef.current = false;

      clearTimers();

      connection.off('OnlineUsers');
      connection.off('Joined');
      connection.off('ReceiveOperation');
      connection.off('ReceiveSnapshot');
      connection.off('UserJoined');
      connection.off('UserLeft');
      connection.off('SnapshotSaved');
      connection.off('SnapshotSaveFailed');
      connection.off('MaterialVersionUpdated');

      const stopHub = async () => {
        try {
          if (
            hasStarted &&
            connection.state === signalR.HubConnectionState.Connected
          ) {
            await connection
              .invoke('LeaveMaterial', materialId)
              .catch(() => {});

            await connection.stop().catch(() => {});
          }

          /**
           * Không gọi stop() nếu connection vẫn đang Connecting.
           * Nếu startHub() hoàn tất sau khi cancelled = true,
           * nó sẽ tự stop ở đoạn:
           *
           * if (cancelled) {
           *   await connection.stop()
           * }
           */
        } catch (err) {
          console.warn('Bỏ qua lỗi khi dừng SignalR:', err);
        } finally {
          if (connectionRef.current === connection) {
            connectionRef.current = null;
          }
        }
      };

      stopHub();
    };
  }, [materialId, userId]);

  const updateContent = useCallback(
    (newContent: string) => {
      latestContentRef.current = newContent;
      setContent(newContent);

      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }

      sendTimeoutRef.current = setTimeout(async () => {
        const connection = connectionRef.current;

        if (
          !connection ||
          connection.state !== signalR.HubConnectionState.Connected
        ) {
          return;
        }

        const operation = JSON.stringify({
          type: 'update',
          content: latestContentRef.current,
          timestamp: Date.now(),
        });

        try {
          await connection.invoke('SendOperation', materialId, operation);
          triggerAutoSave(latestContentRef.current);
        } catch (err) {
          console.error('Gửi nội dung realtime thất bại:', err);
        }
      }, 500);
    },
    [materialId, triggerAutoSave]
  );

  const saveSnapshot = useCallback(async () => {
    const connection = connectionRef.current;

    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      toast.warning('Mất kết nối dữ liệu máy chủ realtime');
      return;
    }

    try {
      isManualSavingRef.current = true;
      await connection.invoke('SaveSnapshot', materialId, latestContentRef.current);
      // toast.success('Đã lưu nội dung thủ công tài liệu thành công!');
    } catch (error) {
      isManualSavingRef.current = false;
      toast.error('Không thể lưu nội dung lúc này');
    }
  }, [materialId]);

  return {
    content,
    isConnected,
    activeUsers,
    updateContent,
    saveSnapshot,
  };
}