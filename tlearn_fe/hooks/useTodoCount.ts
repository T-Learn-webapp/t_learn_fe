import { useCallback, useState } from 'react';

import { todosApi } from '@/services/modules/todo';
import { LearningMaterial } from '@/types';
import { TodoStatus } from '@/types/TodoItemDto';

type UseTodoCountsParams = {
  subjectId?: string;
  materials: LearningMaterial[];
  currentUserId?: string;
  canManageTodo: boolean;
};

export function useTodoCounts({
  subjectId,
  materials,
  currentUserId,
  canManageTodo,
}: UseTodoCountsParams) {
  const [todoCounts, setTodoCounts] = useState<Record<string, number>>({});
  const [todoCountsLoading, setTodoCountsLoading] = useState(false);

  const loadTodoCounts = useCallback(async () => {
    if (!subjectId || materials.length === 0) {
      setTodoCounts({});
      return;
    }

    setTodoCountsLoading(true);

    try {
      const entries = await Promise.all(
        materials.map(async (material) => {
          const res = await todosApi.getAll({
            subjectId,
            learningMaterialId: material.id,
          });

          const todos = res.data?.data?.items || [];

          const count = todos.reduce((total, todo) => {
            const isTodoUncompleted = todo.assignedUsers.some((assigned) => {
              const isUncompleted = assigned.status !== TodoStatus.Completed;

              if (!isUncompleted) return false;

              if (canManageTodo) return true;

              return assigned.userId === currentUserId;
            });

            return isTodoUncompleted ? total + 1 : total;
          }, 0);

          return [material.id, count] as const;
        })
      );

      setTodoCounts(Object.fromEntries(entries));
    } catch (error) {
      console.error('Load todo counts error:', error);
      setTodoCounts({});
    } finally {
      setTodoCountsLoading(false);
    }
  }, [subjectId, materials, currentUserId, canManageTodo]);

  return {
    todoCounts,
    todoCountsLoading,
    loadTodoCounts,
  };
}