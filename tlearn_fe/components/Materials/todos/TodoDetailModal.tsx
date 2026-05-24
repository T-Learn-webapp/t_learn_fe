'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  ClipboardList,
  Loader2,
  UserRound,
  BookOpen,
  UserCheck,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { useTodo } from '@/hooks/useTodo';
import { TodoStatus } from '@/types/TodoItemDto';

import { getStatusBadgeVariant, getStatusLabel , getStatusBadgeClassName} from './GetTodoStatusColor';
import { useTodoDetailRealtime } from '@/hooks/useTodoDetailRealtime';

const normalizeStatusValue = (status: TodoStatus | string | number) => {
  return String(status);
};



type TodoDetailModalProps = {
  open: boolean;
  todoId: string | null;
  subjectId: string;
  learningMaterialId: string;
  currentUserId?: string;
  canManageTodo: boolean;
  onClose: () => void;
  onChanged?: () => void;
};

export function TodoDetailModal({
  open,
  todoId,
  subjectId,
  learningMaterialId,
  currentUserId,
  canManageTodo,
  onClose,
  onChanged,
}: TodoDetailModalProps) {
  const {
    todoLoading,
    todoDetail,
    getTodoDetail,
    updateAssignmentStatus,
  } = useTodo(learningMaterialId, subjectId);

const [assignmentStatuses, setAssignmentStatuses] = useState<Record<string, string>>({});


useTodoDetailRealtime({
  enabled: open && !!todoId,
  todoId,
  onAssignmentUpdated: async (payload) => {
    setAssignmentStatuses((prev) => ({
      ...prev,
      [payload.assignmentUserId]: payload.assignmentStatus,
    }));

    if (todoId) {
      await getTodoDetail(todoId);
      onChanged?.();
    }
  },
});

  useEffect(() => {
    if (!open || !todoId) return;

    getTodoDetail(todoId);
  }, [open, todoId]);

  useEffect(() => {
  if (!todoDetail) return;

  const statusMap = Object.fromEntries(
    todoDetail.assignedUsers.map((assigned) => [
      assigned.userId,
      normalizeStatusValue(assigned.status),
    ])
  );

  setAssignmentStatuses(statusMap);
}, [todoDetail]);
  const getStatusLabel = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.Completed:
        return 'Hoàn thành';
      case TodoStatus.InProgress:
        return 'Đang làm';
      case TodoStatus.Pending:
      default:
        return 'Chờ làm';
    }
  };

  

  const handleChangeAssignmentStatus = async (
  assignedUserId: string,
  status: string
) => {
  if (!todoId) return;

  const oldStatus = assignmentStatuses[assignedUserId];

  setAssignmentStatuses((prev) => ({
    ...prev,
    [assignedUserId]: status,
  }));

  const result = await updateAssignmentStatus(
    todoId,
    assignedUserId,
    status
  );

  if (result.success) {
    await getTodoDetail(todoId);
    onChanged?.();
    return;
  }

  setAssignmentStatuses((prev) => ({
    ...prev,
    [assignedUserId]: oldStatus,
  }));
};

  const visibleAssignedUsers = todoDetail?.assignedUsers || [];
    const canUpdateAssignmentStatus = (assignedUserId: string) => {

    if (canManageTodo) return true;

    return (

        String(assignedUserId).toLowerCase() ===

        String(currentUserId).toLowerCase()

    );

    };
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="w-[95vw] max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList size={20} />
            Chi tiết Todo
          </DialogTitle>
          <DialogDescription>
            Xem thông tin Todo và trạng thái hoàn thành của từng thành viên.
          </DialogDescription>
        </DialogHeader>

        {todoLoading && !todoDetail ? (
          <div className="flex h-60 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải chi tiết Todo...
          </div>
        ) : !todoDetail ? (
          <div className="flex h-60 items-center justify-center text-muted-foreground">
            Không tìm thấy Todo
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-semibold">
                    {todoDetail.title}
                  </h3>

                  {todoDetail.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {todoDetail.description}
                    </p>
                  )}
                </div>

                <Badge variant={getStatusBadgeVariant(todoDetail.status)} className={getStatusBadgeClassName(todoDetail.status)}>
                  {getStatusLabel(todoDetail.status)}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen size={15} />
                  <span className="truncate">
                    {todoDetail.learningMaterialTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserRound size={15} />
                  <span className="truncate">
                    Tạo bởi {todoDetail.createdByUserName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays size={15} />
                  <span>
                    Hạn:{' '}
                    {todoDetail.dueDate
                      ? new Date(todoDetail.dueDate).toLocaleString('vi-VN')
                      : 'Không có'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays size={15} />
                  <span>
                    Tạo:{' '}
                    {new Date(todoDetail.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">
                    Thành viên được giao
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {canManageTodo
                      ? 'Owner/Manager có thể chỉnh lại trạng thái của thành viên.'
                      : 'Bạn chỉ xem trạng thái của chính mình.'}
                  </p>
                </div>

                {todoLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                    {visibleAssignedUsers.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Không có thành viên được giao.
                        </div>
                    ) : (
                        visibleAssignedUsers.map((assigned) => {
                        const canEditThisStatus = canUpdateAssignmentStatus(assigned.userId);

                        return (
                            <div
                            key={assigned.userId}
                            className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                <UserCheck size={16} className="text-muted-foreground" />
                                <p className="truncate text-sm font-medium">
                                    {assigned.userName}
                                </p>

                                {String(assigned.userId).toLowerCase() ===
                                    String(currentUserId).toLowerCase() && (
                                    <Badge variant="secondary" className="text-[10px]">
                                    Bạn
                                    </Badge>
                                )}
                                </div>

                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span>
                                    Giao:{' '}
                                    {new Date(assigned.assignedAt).toLocaleString('vi-VN')}
                                </span>

                                {assigned.completedAt && (
                                    <span>
                                    Hoàn thành:{' '}
                                    {new Date(assigned.completedAt).toLocaleString('vi-VN')}
                                    </span>
                                )}
                                </div>
                            </div>

                            {canEditThisStatus ? (
                                <Select
                                value={
                                    assignmentStatuses[assigned.userId] ??
                                    normalizeStatusValue(assigned.status)
                                }
                                disabled={todoLoading}
                                onValueChange={(value) =>
                                    handleChangeAssignmentStatus(assigned.userId, value)
                                }
                                >
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value={String(TodoStatus.Pending)}>
                                    Chờ làm
                                    </SelectItem>
                                    <SelectItem value={String(TodoStatus.InProgress)}>
                                    Đang làm
                                    </SelectItem>
                                    <SelectItem value={String(TodoStatus.Completed)}>
                                    Hoàn thành
                                    </SelectItem>
                                </SelectContent>
                                </Select>
                            ) : (
                                <Badge variant={getStatusBadgeVariant(assigned.status)}>
                                {getStatusLabel(assigned.status)}
                                </Badge>
                            )}
                            </div>
                        );
                        })
                    )}
                    </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}