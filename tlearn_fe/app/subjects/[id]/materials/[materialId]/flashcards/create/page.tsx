'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Bot,
    Loader2,
    Plus,
    Save,
    Sparkles,
    Trash2,
} from 'lucide-react';

import { useFlashcards } from '@/hooks/useFlashcards';
import { CreateFlashcardItemRequest } from '@/types/FlashCard';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/components/providers/AuthProvider';

type CreateMode = 'manual' | 'ai';

const emptyFlashcard = (): CreateFlashcardItemRequest => ({
    front: '',
    back: '',
    hint: '',
    isAIGenerated: false,
});

export default function CreateFlashcardPage() {
    const params = useParams();
    const router = useRouter();
    const { user, refetchAuth } = useAuthContext();
    const subjectId = params.id as string;
    const materialId = params.materialId as string;

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

    const isLoading = createFlashcardLoading || generateAILoading;

    const MAX_AI_FLASHCARD_COUNT = 20;
    const aiRemainingCount = user?.aiRemainingCount ?? 0;
    const aiUsageLimit = user?.aiUsageLimit ?? 0;
    const aiUsedCount = user?.aiUsedCount ?? 0;

    const hasAIUsage = aiRemainingCount > 0;
    const aiCountExceedLimit = aiCount > MAX_AI_FLASHCARD_COUNT;
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
        setItems((prev) => [...prev, emptyFlashcard()]);
    };

    const removeItem = (index: number) => {
        setItems((prev) => {
            if (prev.length === 1) return prev;

            return prev.filter((_, itemIndex) => itemIndex !== index);
        });
    };

    const handleGenerateAI = async () => {
        if (!hasAIUsage) {
            return;
        }

        if (aiCountExceedLimit) {
            return;
        }

        const safeCount = Math.min(aiCount, MAX_AI_FLASHCARD_COUNT);

        const result = await generateAIFlashcards(safeCount);

        if (result.success && result.data) {
            await refetchAuth();

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
                                Tạo FlashCard
                            </h1>
                            <p className="truncate text-sm text-muted-foreground">
                                Tạo thủ công hoặc dùng AI tạo nháp từ nội dung tài liệu.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={mode === 'manual' ? 'default' : 'outline'}
                            onClick={() => setMode('manual')}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <Plus size={16} />
                            Thủ công
                        </Button>

                        <Button
                            variant={mode === 'ai' ? 'default' : 'outline'}
                            onClick={() => setMode('ai')}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <Bot size={16} />
                            Tạo bằng AI
                        </Button>

                        <Button
                            onClick={handleSave}
                            disabled={isLoading || items.length === 0}
                            className="gap-2"
                        >
                            {createFlashcardLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Lưu FlashCard
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6">
                {mode === 'ai' ? (
                    <section className="mx-auto max-w-2xl rounded-3xl border bg-white p-6 shadow-sm">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Sparkles size={28} />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <h2 className="text-lg font-bold text-slate-900">

                                Tạo FlashCard bằng AI

                            </h2>

                            <Badge

                                variant={hasAIUsage ? 'secondary' : 'destructive'}

                                className="w-fit gap-1.5"

                            >

                                <Sparkles size={13} />

                                AI còn {aiRemainingCount}/{aiUsageLimit} lượt

                            </Badge>

                        </div>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            AI sẽ đọc nội dung material và tạo flashcard nháp. Quá trình này
                            có thể mất lâu nếu tài liệu dài hoặc số lượng flashcard lớn. Sau
                            khi AI tạo xong, bạn có thể chỉnh sửa từng thẻ trước khi lưu.
                        </p>
                        <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-muted-foreground">
                                    Lượt AI đã dùng hôm nay
                                </span>
                                <span className="font-semibold text-slate-900">
                                    {aiUsedCount}/{aiUsageLimit}
                                </span>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-indigo-600 transition-all"
                                    style={{
                                        width: `${aiUsageLimit > 0 ? (aiUsedCount / aiUsageLimit) * 100 : 0}%`,
                                    }}
                                />
                            </div>

                            {!hasAIUsage && (
                                <p className="mt-3 text-sm font-medium text-red-600">
                                    Bạn đã hết lượt tạo FlashCard bằng AI hôm nay.
                                </p>
                            )}

                            {hasAIUsage && aiCountExceedLimit && (

                                <p className="mt-3 text-sm font-medium text-red-600">

                                    Mỗi lượt AI chỉ có thể tạo tối đa {MAX_AI_FLASHCARD_COUNT} FlashCard.

                                </p>

                            )}
                        </div>

                        <div className="mt-6 space-y-2">
                            <Label>Số lượng FlashCard</Label>

                            <Input

                                type="number"

                                min={1}

                                max={MAX_AI_FLASHCARD_COUNT}

                                value={aiCount}

                                onChange={(event) => {

                                    const value = Number(event.target.value);

                                    if (Number.isNaN(value)) {

                                        setAICount(1);

                                        return;

                                    }

                                    setAICount(Math.max(1, Math.min(value, MAX_AI_FLASHCARD_COUNT)));

                                }}

                                disabled={isLoading || !hasAIUsage}

                            />

                            <p className="text-xs text-muted-foreground">

                                Mỗi lượt AI có thể tạo tối đa {MAX_AI_FLASHCARD_COUNT} FlashCard.

                                Bạn còn {aiRemainingCount}/{aiUsageLimit} lượt AI.

                            </p>
                        </div>

                        <Button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={isLoading || !hasAIUsage || aiCountExceedLimit}
                            className="mt-6 w-full gap-2"
                        >
                            {generateAILoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    AI đang tạo flashcard, vui lòng chờ...
                                </>
                            ) : !hasAIUsage ? (
                                <>
                                    <Sparkles size={16} />
                                    Đã hết lượt AI
                                </>
                            ) : aiCountExceedLimit ? (
                                <>
                                    <Sparkles size={16} />
                                    Tối đa {MAX_AI_FLASHCARD_COUNT} FlashCard/lượt
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Tạo {aiCount} FlashCard bằng AI · còn {aiRemainingCount} lượt
                                </>
                            )}
                        </Button>
                    </section>
                ) : (
                    <section className="space-y-5">
                        <div className="flex flex-col gap-3 rounded-3xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Danh sách FlashCard
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Nhập câu hỏi, câu trả lời và gợi ý. FlashCard do AI tạo cũng
                                    có thể chỉnh sửa tại đây trước khi lưu.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{items.length} thẻ</Badge>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addItem}
                                    disabled={isLoading}
                                    className="gap-2"
                                >
                                    <Plus size={16} />
                                    Thêm thẻ
                                </Button>
                            </div>
                        </div>

                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-3xl border bg-white p-5 shadow-sm"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">Thẻ {index + 1}</Badge>

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
                                        title="Xóa thẻ"
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
                                            placeholder="Ví dụ: Dependency Injection là gì?"
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
                                            placeholder="Nhập câu trả lời..."
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
                                        placeholder="Ví dụ: Liên quan đến IoC container"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="sticky bottom-4 z-20 rounded-3xl border bg-white/90 p-4 shadow-lg backdrop-blur">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Sẵn sàng lưu {items.length} FlashCard?
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Các thẻ thiếu câu hỏi hoặc câu trả lời sẽ không được lưu.
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
                                        disabled={isLoading}
                                        className="gap-2"
                                    >
                                        {createFlashcardLoading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Lưu FlashCard
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