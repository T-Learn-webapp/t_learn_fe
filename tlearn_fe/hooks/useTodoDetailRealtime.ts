'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export type TodoAssignmentUpdatedRealtimeDto = {
  todoId: string;
  todoStatus: string;
  assignmentUserId: string;
  assignmentStatus: string;
};

type UseTodoDetailRealtimeParams = {
  enabled?: boolean;
  todoId?: string | null;
  onAssignmentUpdated?: (
    payload: TodoAssignmentUpdatedRealtimeDto
  ) => void;
};

export function useTodoDetailRealtime({
  enabled = true,
  todoId,
  onAssignmentUpdated,
}: UseTodoDetailRealtimeParams) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const callbackRef = useRef(onAssignmentUpdated);

  useEffect(() => {
    callbackRef.current = onAssignmentUpdated;
  }, [onAssignmentUpdated]);

  useEffect(() => {
    if (!enabled || !todoId) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/todo`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    connectionRef.current = connection;

    connection.on(
      'TodoAssignmentUpdated',
      (payload: TodoAssignmentUpdatedRealtimeDto) => {
        if (
          String(payload.todoId).toLowerCase() !==
          String(todoId).toLowerCase()
        ) {
          return;
        }

        callbackRef.current?.(payload);
      }
    );

    const startConnection = async () => {
      try {
        await connection.start();

        await connection.invoke('JoinTodoGroup', todoId);

        console.log('Todo detail realtime connected:', todoId);
      } catch (error) {
        console.error('Todo detail realtime connection failed:', error);
      }
    };

    startConnection();

    connection.onreconnected(async () => {
      try {
        await connection.invoke('JoinTodoGroup', todoId);
      } catch (error) {
        console.error('Rejoin todo group failed:', error);
      }
    });

    return () => {
      connection.off('TodoAssignmentUpdated');

      const currentConnection = connectionRef.current;
      connectionRef.current = null;

      if (currentConnection) {
        currentConnection
          .invoke('LeaveTodoGroup', todoId)
          .catch(console.error)
          .finally(() => {
            currentConnection.stop().catch(console.error);
          });
      }
    };
  }, [enabled, todoId]);
}