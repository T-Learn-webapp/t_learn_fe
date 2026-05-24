'use client';

import { useEffect, useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';

import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TodoFormFields } from './TodoFormFields';
import { MemberDto } from '@/types/member';
import { TodoItemDto } from '@/types/TodoItemDto';
import { useTodo } from '@/hooks/useTodo';

type UpdateTodoModalProps = {
  open: boolean;
  subjectId: string;
  learningMaterialId: string;
  todo: TodoItemDto | null;
  members: MemberDto[];
  onClose: () => void;
  onUpdated?: () => void;
};

export function UpdateTodoModal({
  open,
  subjectId,
  learningMaterialId,
  todo,
  members,
  onClose,
  onUpdated,
}: UpdateTodoModalProps) {
  const { todoLoading, updateTodo } = useTodo(learningMaterialId, subjectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!todo || !open) return;

    setTitle(todo.title);
    setDescription(todo.description || '');
    setDueDate(todo.dueDate ? todo.dueDate.slice(0, 10) : '');
    setAssignedUserIds(todo.assignedUsers?.map((x) => x.userId) || []);
  }, [todo, open]);

  const handleUpdate = async () => {
    if (!todo) return;

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề công việc');
      return;
    }

    const result = await updateTodo(todo.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || null,
      assignedUserIds,
    });

    if (result.success) {
      onUpdated?.();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật Todo</DialogTitle>
          <DialogDescription>
            Chỉnh sửa nội dung, deadline và thành viên được giao.
          </DialogDescription>
        </DialogHeader>

        <TodoFormFields
          title={title}
          description={description}
          dueDate={dueDate}
          assignedUserIds={assignedUserIds}
          members={members}
          disabled={todoLoading}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onDueDateChange={setDueDate}
          onAssignedUserIdsChange={setAssignedUserIds}
        />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={todoLoading}
          >
            Hủy
          </Button>

          <Button
            onClick={handleUpdate}
            disabled={todoLoading}
            className="gap-2"
          >
            {todoLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Pencil size={15} />
            )}
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}