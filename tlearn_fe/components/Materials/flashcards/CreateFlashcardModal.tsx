'use client';

import { useEffect, useState } from 'react';
import {
  Bot,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';

import {
  CreateFlashcardItemRequest,
} from '@/types/FlashCard';

import { useFlashcards } from '@/hooks/useFlashcards';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';

type CreateFlashcardModalProps = {
  open: boolean;
  materialId: string;
  onClose: () => void;
  onCreated?: () => void;
};

type CreateMode = 'manual' | 'ai';

const emptyFlashcard = (): CreateFlashcardItemRequest => ({
  front: '',
  back: '',
  hint: '',
  isAIGenerated: false,
});

export function CreateFlashcardModal({
  open,
  materialId,
  onClose,
  onCreated,
}: CreateFlashcardModalProps) {
  const {
    createFlashcardLoading,
    generateAILoading,
    createManyFlashcards,
    generateAIFlashcards,
  } = useFlashcards(materialId);

  const [mode, setMode] = useState<CreateMode>('manual');
  const [aiCount, setAICount] = useState(5);
  const [items, setItems] = useState<CreateFlashcardItemRequest[]>([
    emptyFlashcard(),
  ]);

  useEffect(() => {
    if (!open) return;

    setMode('manual');
    setAICount(5);
    setItems([emptyFlashcard()]);
  }, [open]);

  const updateItem = (
    index: number,
    field: keyof CreateFlashcardItemRequest,
    value: string | boolean
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      emptyFlashcard(),
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleGenerateAI = async () => {
    const result = await generateAIFlashcards(aiCount);

    if (result.success && result.data) {
      setMode('manual');

      setItems(
        result.data.map((item) => ({
          front: item.front,
          back: item.back,
          hint: item.hint || '',
          isAIGenerated: true,
        }))
      );
    }
  };

  const handleSave = async () => {
    const result = await createManyFlashcards(items);

    if (result.success) {
      onCreated?.();
      onClose();
    }
  };

  const isLoading = createFlashcardLoading || generateAILoading;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-24px)] max-w-5xl flex-col overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <DialogTitle>Tạo FlashCard</DialogTitle>
              <DialogDescription>
                Tạo thủ công hoặc dùng AI để tạo nháp FlashCard từ nội dung tài liệu.
              </DialogDescription>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('manual')}
                disabled={isLoading}
                className="gap-2"
              >
                <Plus size={15} />
                Thủ công
              </Button>

              <Button
                type="button"
                variant={mode === 'ai' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('ai')}
                disabled={isLoading}
                className="gap-2"
              >
                <Bot size={15} />
                AI
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {mode === 'ai' ? (
            <div className="mx-auto max-w-xl space-y-5 rounded-3xl border bg-muted/30 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Sparkles size={24} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Tạo FlashCard bằng AI
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI sẽ đọc nội dung material và tạo flashcard nháp. Quá trình này có thể mất lâu nếu tài liệu dài hoặc số lượng flashcard lớn.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Số lượng FlashCard</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={aiCount}
                  onChange={(event) =>
                    setAICount(Number(event.target.value))
                  }
                  disabled={isLoading}
                />
              </div>

              <Button
                type="button"
                onClick={handleGenerateAI}
                disabled={isLoading}
                className="w-full gap-2"
              >
                {generateAILoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    AI đang tạo flashcard...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Tạo nháp bằng AI
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    Danh sách FlashCard
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bạn có thể chỉnh sửa lại các flashcard AI tạo trước khi lưu.
                  </p>
                </div>

                <Badge variant="secondary">
                  {items.length} thẻ
                </Badge>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-3xl border bg-background p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Thẻ {index + 1}
                      </Badge>

                      {item.isAIGenerated && (
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles size={12} />
                          AI
                        </Badge>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={items.length === 1 || isLoading}
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Câu hỏi / Mặt trước *</Label>
                      <textarea
                        value={item.front}
                        onChange={(event) =>
                          updateItem(index, 'front', event.target.value)
                        }
                        disabled={isLoading}
                        placeholder="Ví dụ: Dependency Injection là gì?"
                        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Câu trả lời / Mặt sau *</Label>
                      <textarea
                        value={item.back}
                        onChange={(event) =>
                          updateItem(index, 'back', event.target.value)
                        }
                        disabled={isLoading}
                        placeholder="Nhập câu trả lời..."
                        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Label>Gợi ý</Label>
                    <Input
                      value={item.hint || ''}
                      onChange={(event) =>
                        updateItem(index, 'hint', event.target.value)
                      }
                      disabled={isLoading}
                      placeholder="Ví dụ: Liên quan đến IoC container"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                disabled={isLoading}
                className="w-full gap-2"
              >
                <Plus size={16} />
                Thêm một thẻ
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="gap-2 px-5 py-4 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || mode === 'ai'}
            className="gap-2"
          >
            {createFlashcardLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Plus size={16} />
                Lưu FlashCard
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}