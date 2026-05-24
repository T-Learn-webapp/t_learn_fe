'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTodo } from '@/hooks/useTodo';
import { MemberDto } from '@/types/member';
import { TodoItemDto, TodoStatus } from '@/types/TodoItemDto';
import { CreateTodoModal } from './CreateTodoModal';
import { UpdateTodoModal } from './UpdateTodoModal';
import { Eye } from 'lucide-react';
import { TodoDetailModal } from './TodoDetailModal';
import { useTodoRealtime } from '@/hooks/useTodoRealtime';
import { getStatusBadgeVariant, getStatusLabel , getStatusBadgeClassName } from './GetTodoStatusColor';

type TodoListModalProps = {
  open: boolean;
  subjectId: string;
  learningMaterialId: string;
  members: MemberDto[];
  currentUserId?: string;
  canManageTodo: boolean;
  onClose: () => void;
  onChanged?: () => void;
};

export function TodoListModal({
  open,
  subjectId,
  learningMaterialId,
  members,
  currentUserId,
  canManageTodo,
  onClose,
  onChanged,
}: TodoListModalProps) {
  const {
    todos,
    todoLoading,
    getTodos,
    deleteTodo,
  } = useTodo(learningMaterialId, subjectId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItemDto | null>(null);

  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);

  useTodoRealtime({
    enabled: open && !!learningMaterialId && !!subjectId,
    learningMaterialId,
    subjectId,
    onTodoCreated: async (todo) => {
      toast.info('Có Todo mới', {
        description: todo.title || 'Danh sách Todo vừa được cập nhật',
      });

      await getTodos();
      onChanged?.();
    },
    onTodoUpdated: async (todo) => {
      toast.info('Todo vừa được cập nhật', {
        description: todo.title || 'Trạng thái công việc đã thay đổi',
      });

      await getTodos();
      onChanged?.();
    },
  });
  useEffect(() => {
    if (!open || !learningMaterialId || !subjectId) return;
    getTodos();
  }, [open, learningMaterialId, subjectId, getTodos]);

  const visibleTodos = useMemo(() => {
    console.log('currentUserId:', currentUserId);
    console.log('todos:', todos);
    console.log('canManageTodo:', canManageTodo);
    if (canManageTodo) return todos;

    return todos.filter((todo) =>
      todo.assignedUsers.some((assigned) => assigned.userId === currentUserId)
    );
  }, [todos, canManageTodo, currentUserId]);

  const uncompletedCount = useMemo(() => {
    return visibleTodos.reduce((count, todo) => {
      const isTodoUncompleted = todo.assignedUsers.some((assigned) => {
        if (assigned.status === TodoStatus.Completed) return false;

        if (canManageTodo) return true;

        return assigned.userId === currentUserId;
      });

      return isTodoUncompleted ? count + 1 : count;
    }, 0);
  }, [visibleTodos, canManageTodo, currentUserId]);

  const handleReload = async () => {
    await getTodos();
    onChanged?.();
  };

  const handleDelete = async (todoId: string) => {
    if (!canManageTodo) {
      toast.error('Bạn không có quyền xóa Todo');
      return;
    }

    if (!confirm('Bạn có chắc muốn xóa công việc này?')) return;

    const result = await deleteTodo(todoId);

    if (result.success) {
      await handleReload();
    }
  };

 
  

  const getMemberName = (userId: string) => {
    const member = members.find((x) => x.userId === userId);
    return member?.userName || member?.userEmail || userId;
  };

  const getAssignedNames = (todo: TodoItemDto) => {
    if (!todo.assignedUsers || todo.assignedUsers.length === 0) {
      return 'Chưa giao cho ai';
    }

    return todo.assignedUsers
      .map((assigned) => getMemberName(assigned.userId))
      .join(', ');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="w-[96vw] max-w-4xl p-0 sm:rounded-2xl">
          <DialogHeader className="border-b px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <DialogTitle className="flex items-center gap-2">
                  <ClipboardList size={20} />
                   Công việc cần làm 
                 
                </DialogTitle>

                <DialogDescription className="mt-1">
                  <Badge variant="outline">
                    {visibleTodos.length} công việc
                  </Badge>
                   {uncompletedCount > 0 && (
                  <Badge variant="destructive">
                    {uncompletedCount} chưa hoàn thành
                  </Badge>
                )}

                 {canManageTodo && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus size={15} />
                    Tạo Todo
                  </Button>
                )}
                </DialogDescription>
              </div>

              
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-6">
            <div className="rounded-xl border bg-background">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">
                    Danh sách công việc
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {canManageTodo
                      ? 'Hiển thị toàn bộ Todo của bài học'
                      : 'Chỉ hiển thị Todo được giao cho bạn'}
                  </p>
                </div>

                {todoLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              <div className="max-h-[560px] overflow-y-auto p-3">
                {visibleTodos.length === 0 ? (
                  <div className="flex h-72 flex-col items-center justify-center text-center text-muted-foreground">
                    <ClipboardList className="mb-3 h-10 w-10" />
                    <p className="text-sm font-medium">Chưa có Todo nào</p>
                    <p className="mt-1 text-xs">
                      {canManageTodo
                        ? 'Tạo công việc đầu tiên cho bài học này.'
                        : 'Bạn chưa được giao công việc nào trong bài này.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="rounded-xl border bg-card p-3 shadow-sm sm:p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                              <h3 className="min-w-0 flex-1 break-words text-sm font-semibold">
                                {todo.title}
                              </h3>
                            </div>

                            {todo.description && (
                              <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-muted-foreground">
                                {todo.description}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {todo.dueDate && (
                                <Badge variant="outline" className="gap-1 text-[10px]">
                                  <CalendarDays size={12} />
                                  {new Date(todo.dueDate).toLocaleDateString('vi-VN')}
                                </Badge>
                              )}

                              <Badge variant="secondary" className="max-w-full gap-1 text-[10px]">
                                <UserRound size={12} className="shrink-0" />
                                <span className="truncate">
                                  {getAssignedNames(todo)}
                                </span>
                              </Badge>
                            </div>

                            {todo.assignedUsers?.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {todo.assignedUsers.map((assigned) => {
                                  if (
                                    !canManageTodo &&
                                    assigned.userId !== currentUserId
                                  ) {
                                    return null;
                                  }

                                  return (
                                    <Badge
                                      key={assigned.userId}
                                      variant={getStatusBadgeVariant(assigned.status)}
                                      className={`max-w-full text-[10px] ${getStatusBadgeClassName(assigned.status)}`}
                                    >
                                      <span className="truncate">
                                        {getMemberName(assigned.userId)} ·{' '}
                                        {getStatusLabel(assigned.status)}
                                      </span>
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-1 self-end sm:self-start">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDetailTodoId(todo.id)}
                              title="Xem chi tiết"
                            >
                              <Eye size={14} />
                            </Button>

                            {canManageTodo && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingTodo(todo)}
                                  title="Sửa Todo"
                                >
                                  <Pencil size={14} />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(todo.id)}
                                  title="Xóa Todo"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateTodoModal
        open={showCreateModal}
        subjectId={subjectId}
        learningMaterialId={learningMaterialId}
        members={members}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleReload}
      />

      <UpdateTodoModal
        open={!!editingTodo}
        subjectId={subjectId}
        learningMaterialId={learningMaterialId}
        todo={editingTodo}
        members={members}
        onClose={() => setEditingTodo(null)}
        onUpdated={handleReload}
      />

      <TodoDetailModal
        open={!!detailTodoId}
        todoId={detailTodoId}
        subjectId={subjectId}
        learningMaterialId={learningMaterialId}
        currentUserId={currentUserId}
        canManageTodo={canManageTodo}
        onClose={() => setDetailTodoId(null)}
        onChanged={handleReload}
      />
    </>
  );
}