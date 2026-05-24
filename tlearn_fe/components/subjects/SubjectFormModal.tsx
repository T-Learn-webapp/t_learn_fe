'use client';

import { useEffect } from 'react';
import { BookOpen, Loader2, Pencil, Plus } from 'lucide-react';

import { Subject, SubjectList } from '@/types';
import { useSubject } from '@/hooks/useSubject';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SubjectFormMode = 'create' | 'edit';

type SubjectFormModalProps = {
  open: boolean;
  mode: SubjectFormMode;
  subject?: Subject | SubjectList | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function SubjectFormModal({
  open,
  mode,
  subject,
  onClose,
  onSuccess,
}: SubjectFormModalProps) {
  const {
    formData,
    loading,
    updateField,
    resetForm,
    fillFormFromSubject,
    createSubject,
    updateSubject,
  } = useSubject();

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!open) return;

    if (isEdit && subject) {
      fillFormFromSubject(subject);
      return;
    }

    resetForm();
  }, [open, isEdit, subject]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result =
      isEdit && subject?.id
        ? await updateSubject(subject.id, {
            onSuccess: () => {
              onSuccess?.();
              handleClose();
            },
          })
        : await createSubject(event, {
            redirect: false,
            onSuccess: () => {
              onSuccess?.();
              handleClose();
            },
          });

    if (!result.success) return;
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {isEdit ? <Pencil size={22} /> : <BookOpen size={22} />}
          </div>

          <DialogTitle>
            {isEdit ? 'Cập nhật chủ đề' : 'Tạo chủ đề mới'}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? 'Chỉnh sửa tên và mô tả của không gian học tập.'
              : 'Tạo một không gian học tập để thêm tài liệu, TodoList và mời thành viên.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Tên chủ đề *</Label>

            <Input
              id="subject-name"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Ví dụ: Lập trình C#"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-description">Mô tả</Label>

            <textarea
              id="subject-description"
              rows={4}
              value={formData.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Mô tả ngắn về chủ đề này..."
              disabled={loading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>

            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : isEdit ? (
                <>
                  <Pencil size={16} />
                  Cập nhật
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Tạo chủ đề
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}