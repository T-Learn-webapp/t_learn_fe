'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export interface NotificationRealtimeDto {
  id: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  createdAt: string;
  isRead?: boolean;
}

type UseNotificationRealtimeParams = {
  enabled?: boolean;
  onNotificationReceived: (notification: NotificationRealtimeDto) => void;
};

export function useNotificationRealtime({
  enabled = true,
  onNotificationReceived,
}: UseNotificationRealtimeParams) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const callbackRef = useRef(onNotificationReceived);

  useEffect(() => {
    callbackRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;
    let isStarted = false;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/notifications`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.on(
      'NotificationReceived',
      (payload: NotificationRealtimeDto) => {
        callbackRef.current({
          ...payload,
          isRead: payload.isRead ?? false,
        });
      }
    );

    const startConnection = async () => {
      try {
        if (connection.state !== signalR.HubConnectionState.Disconnected) {
          return;
        }

        await connection.start();

        isStarted = true;

        if (!isMounted) {
          await connection.stop();
          return;
        }

        console.log('Notification hub connected');
      } catch (error: any) {
        if (!isMounted) return;

        console.error('Notification hub connection failed:', error);
      }
    };

    startConnection();

    return () => {
      isMounted = false;

      connection.off('NotificationReceived');

      const currentConnection = connectionRef.current;
      connectionRef.current = null;

      if (
        currentConnection &&
        isStarted &&
        currentConnection.state !== signalR.HubConnectionState.Disconnected
      ) {
        currentConnection.stop().catch((error) => {
          console.error('Stop notification hub failed:', error);
        });
      }
    };
  }, [enabled]);
}