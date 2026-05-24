'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export type SubjectMemberJoinedRealtimeDto = {
  subjectId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  permission?: string;
};

type UseSubjectMemberRealtimeParams = {
  enabled?: boolean;
  subjectId?: string;
  onMemberJoined?: (payload: SubjectMemberJoinedRealtimeDto) => void;
};

export function useSubjectMemberRealtime({
  enabled = true,
  subjectId,
  onMemberJoined,
}: UseSubjectMemberRealtimeParams) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const callbackRef = useRef(onMemberJoined);

  useEffect(() => {
    callbackRef.current = onMemberJoined;
  }, [onMemberJoined]);

  useEffect(() => {
    if (!enabled || !subjectId) return;

    let isMounted = true;
    let isStarted = false;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/todo`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    connectionRef.current = connection;

    connection.on('SubjectMemberJoined', (payload: any) => {
      const normalizedPayload: SubjectMemberJoinedRealtimeDto = {
        subjectId: payload?.subjectId || payload?.SubjectId,
        userId: payload?.userId || payload?.UserId,
        userName: payload?.userName || payload?.UserName,
        userEmail: payload?.userEmail || payload?.UserEmail,
        permission: payload?.permission || payload?.Permission,
      };

      if (
        normalizedPayload.subjectId &&
        String(normalizedPayload.subjectId).toLowerCase() !==
          String(subjectId).toLowerCase()
      ) {
        return;
      }

      callbackRef.current?.(normalizedPayload);
    });

    const startConnection = async () => {
      try {
        await connection.start();

        isStarted = true;

        if (!isMounted) {
          await connection.stop();
          return;
        }

        console.log('Subject member realtime connected');
      } catch (error) {
        if (!isMounted) return;

        console.error('Subject member realtime connection failed:', error);
      }
    };

    startConnection();

    return () => {
      isMounted = false;

      connection.off('SubjectMemberJoined');

      const currentConnection = connectionRef.current;
      connectionRef.current = null;

      if (
        currentConnection &&
        isStarted &&
        currentConnection.state !== signalR.HubConnectionState.Disconnected
      ) {
        currentConnection.stop().catch((error) => {
          console.error('Stop subject member realtime failed:', error);
        });
      }
    };
  }, [enabled, subjectId]);
}