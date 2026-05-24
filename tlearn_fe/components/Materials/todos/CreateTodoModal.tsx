'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

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
import { useTodo } from '@/hooks/useTodo';

type CreateTodoModalProps = {
  open: boolean;
  subjectId: string;
  learningMaterialId: string;
  members: MemberDto[];
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateTodoModal({
  open,
  subjectId,
  learningMaterialId,
  members,
  onClose,
  onCreated,
}: CreateTodoModalProps) {
  const { todoLoading, createTodo } = useTodo(learningMaterialId, subjectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setAssignedUserIds([]);
  };

  const handleClose = () => {
    if (todoLoading) return;
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề công việc');
      return;
    }

    const result = await createTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || null,
      assignedUserIds,
    });

    if (result.success) {
      resetForm();
      onCreated?.();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo Todo mới</DialogTitle>
          <DialogDescription>
            Tạo công việc cần làm cho bài học hiện tại.
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
            onClick={handleClose}
            disabled={todoLoading}
          >
            Hủy
          </Button>

          <Button
            onClick={handleCreate}
            disabled={todoLoading}
            className="gap-2"
          >
            {todoLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            Tạo Todo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}