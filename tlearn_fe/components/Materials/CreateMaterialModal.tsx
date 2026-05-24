'use client';

import { useState } from 'react';

import { materialsApi } from '@/services/modules/material';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import {CreateLearningMaterialRequest} from '@/types';
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



type CreateMaterialModalProps = {
  open: boolean;
  subjectId: string;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateMaterialModal({
  open,
  subjectId,
  onClose,
  onCreated,
}: CreateMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setContent('');
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài học');
      return;
    }

    setLoading(true);

    try {
      const payload: CreateLearningMaterialRequest = {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim() || undefined,
        subjectId,
      };

      await materialsApi.create(payload);

      toast.success('Đã tạo bài học mới');
      resetForm();
      onCreated();
    } catch (error) {
      toast.fromError(error, 'Không thể tạo bài học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo bài học mới</DialogTitle>
          <DialogDescription>
            Tạo nhanh tài liệu học tập ngay trong không gian hiện tại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="material-title">Tiêu đề bài học</Label>
            <Input
              id="material-title"
              placeholder="Ví dụ: Bài 2: OOP trong C#"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="material-summary">Tóm tắt</Label>
            <Input
              id="material-summary"
              placeholder="Tóm tắt ngắn nội dung bài học"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={loading}
            />
          </div> */}

          {/* <div className="space-y-2">
            <Label htmlFor="material-content">Nội dung HTML</Label>
            <textarea
              id="material-content"
              placeholder="<h1>Lập trình hướng đối tượng</h1><p>OOP là...</p>"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              className="min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div> */}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </Button>

          <Button
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo bài học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}