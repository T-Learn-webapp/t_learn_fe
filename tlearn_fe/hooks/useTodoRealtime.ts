'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export type TodoRealtimeDto = {
  id: string;
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  learningMaterialId?: string;
  subjectId?: string;
  createdByUserId?: string;
  assignedUserIds?: string[];
};

type UseTodoRealtimeParams = {
  enabled?: boolean;
  learningMaterialId?: string;
  subjectId?: string;
  onTodoCreated?: (todo: TodoRealtimeDto) => void;
  onTodoUpdated?: (todo: TodoRealtimeDto) => void;
};

export function useTodoRealtime({
  enabled = true,
  learningMaterialId,
  subjectId,
  onTodoCreated,
  onTodoUpdated,
}: UseTodoRealtimeParams) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const onTodoCreatedRef = useRef(onTodoCreated);
  const onTodoUpdatedRef = useRef(onTodoUpdated);

  useEffect(() => {
    onTodoCreatedRef.current = onTodoCreated;
    onTodoUpdatedRef.current = onTodoUpdated;
  }, [onTodoCreated, onTodoUpdated]);

  useEffect(() => {
    if (!enabled) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/todo`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    connectionRef.current = connection;

    const isSameTodoContext = (todo: TodoRealtimeDto) => {
      if (learningMaterialId && todo.learningMaterialId) {
        return todo.learningMaterialId === learningMaterialId;
      }

      if (subjectId && todo.subjectId) {
        return todo.subjectId === subjectId;
      }

      return true;
    };

    connection.on('TodoCreated', (payload: TodoRealtimeDto) => {
      if (!isSameTodoContext(payload)) return;

      onTodoCreatedRef.current?.(payload);
    });

    connection.on('TodoUpdated', (payload: TodoRealtimeDto) => {
      if (!isSameTodoContext(payload)) return;

      onTodoUpdatedRef.current?.(payload);
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('Todo hub connected');
      } catch (error) {
        console.error('Todo hub connection failed:', error);
      }
    };

    startConnection();

    return () => {
      connection.off('TodoCreated');
      connection.off('TodoUpdated');

      connection
        .stop()
        .catch((error) => {
          console.error('Stop todo hub failed:', error);
        });

      connectionRef.current = null;
    };
  }, [enabled, learningMaterialId, subjectId]);
}