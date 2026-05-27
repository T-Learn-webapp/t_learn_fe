'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { useFlashcards } from '@/hooks/useFlashcards';
import {
  FlashcardDto,
  UpdateFlashcardItemRequest,
} from '@/types/FlashCard';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const mapFlashcardToUpdateItem = (
  flashcard: FlashcardDto
): UpdateFlashcardItemRequest => ({
  id: flashcard.id,
  front: flashcard.front || '',
  back: flashcard.back || '',
  hint: flashcard.hint || '',
  isAIGenerated: flashcard.isAIGenerated,
});

export default function UpdateFlashcardsPage() {
  const params = useParams();
  const router = useRouter();

  const subjectId = params.id as string;
  const materialId = params.materialId as string;

  const {
    flashcards,
    flashcardLoading,
    updateFlashcardLoading,
    getFlashcards,
    updateManyFlashcards,
  } = useFlashcards(materialId);

  const [items, setItems] = useState<UpdateFlashcardItemRequest[]>([]);

  useEffect(() => {
    getFlashcards(1, 100);
  }, [getFlashcards]);

  useEffect(() => {
    setItems(flashcards.map(mapFlashcardToUpdateItem));
  }, [flashcards]);

  const isLoading = flashcardLoading || updateFlashcardLoading;

  const updateItem = (
    index: number,
    field: keyof UpdateFlashcardItemRequest,
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

  const removeItemFromForm = (index: number) => {
    setItems((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleSave = async () => {
    const result = await updateManyFlashcards(items);

    if (result.success) {
      router.push(`/subjects/${subjectId}/materials/${materialId}/flashcards`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <header className="sticky top-0 z-30 border-b bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push(
                  `/subjects/${subjectId}/materials/${materialId}/flashcards`
                )
              }
              className="shrink-0"
            >
              <ArrowLeft size={18} />
            </Button>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-900">
                Cập nhật FlashCard
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                Chỉnh sửa nhiều FlashCard của tài liệu hiện tại.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/subjects/${subjectId}/materials/${materialId}/flashcards/create`
                )
              }
              disabled={isLoading}
              className="gap-2"
            >
              <Plus size={16} />
              Tạo mới
            </Button>

            <Button
              onClick={handleSave}
              disabled={isLoading || items.length === 0}
              className="gap-2"
            >
              {updateFlashcardLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {flashcardLoading ? (
          <div className="flex h-[420px] items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải FlashCard...
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white text-center text-muted-foreground">
            <p className="text-base font-semibold">Chưa có FlashCard để sửa</p>
            <p className="mt-1 text-sm">
              Hãy tạo FlashCard trước rồi quay lại chỉnh sửa.
            </p>

            <Button
              className="mt-5 gap-2"
              onClick={() =>
                router.push(
                  `/subjects/${subjectId}/materials/${materialId}/flashcards/create`
                )
              }
            >
              <Plus size={16} />
              Tạo FlashCard
            </Button>
          </div>
        ) : (
          <section className="space-y-5">
            <div className="flex flex-col gap-3 rounded-3xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Danh sách FlashCard
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mặt trước và mặt sau nằm cùng một hàng để chỉnh sửa nhanh.
                </p>
              </div>

              <Badge variant="secondary">
                {items.length} thẻ
              </Badge>
            </div>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-3xl border bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
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
                    disabled={isLoading}
                    onClick={() => removeItemFromForm(index)}
                    className="text-destructive hover:text-destructive"
                    title="Bỏ khỏi danh sách cập nhật"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Câu hỏi / Mặt trước *</Label>

                    <textarea
                      value={item.front}
                      onChange={(event) =>
                        updateItem(index, 'front', event.target.value)
                      }
                      disabled={isLoading}
                      placeholder="Nhập mặt trước..."
                      className="min-h-28 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                      placeholder="Nhập mặt sau..."
                      className="min-h-28 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Gợi ý</Label>

                  <Input
                    value={item.hint || ''}
                    onChange={(event) =>
                      updateItem(index, 'hint', event.target.value)
                    }
                    disabled={isLoading}
                    placeholder="Nhập gợi ý..."
                  />
                </div>
              </div>
            ))}

            <div className="sticky bottom-4 z-20 rounded-3xl border bg-white/90 p-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Lưu thay đổi cho {items.length} FlashCard?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Những thẻ bạn bỏ khỏi danh sách chỉ không gửi lên API cập nhật, không bị xóa khỏi database.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/subjects/${subjectId}/materials/${materialId}/flashcards`
                      )
                    }
                    disabled={isLoading}
                  >
                    Hủy
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={isLoading || items.length === 0}
                    className="gap-2"
                  >
                    {updateFlashcardLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}