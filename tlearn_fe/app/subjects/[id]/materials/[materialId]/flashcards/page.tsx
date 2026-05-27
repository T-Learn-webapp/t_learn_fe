'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Brain,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    Keyboard,
    Loader2,
    RotateCcw,
    Sparkles,
    Pencil,
    Plus
} from 'lucide-react';

import { useFlashcards } from '@/hooks/useFlashcards';
import {
    FlashcardDto,
    FlashcardReviewQuality,
} from '@/types/FlashCard';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const qualityOptions = [
    {
        label: 'Quên',
        description: 'Học lại',
        value: FlashcardReviewQuality.Again,
        className: 'bg-red-600 hover:bg-red-700 text-white',
    },
    {
        label: 'Khó',
        description: 'Cần ôn sớm',
        value: FlashcardReviewQuality.Hard,
        className: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
    {
        label: 'Nhớ',
        description: 'Làm được',
        value: FlashcardReviewQuality.Good,
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    {
        label: 'Dễ',
        description: 'Rất chắc',
        value: FlashcardReviewQuality.Easy,
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
];

const getQualityLabel = (quality?: FlashcardReviewQuality | null) => {
    switch (quality) {
        case FlashcardReviewQuality.Again:
            return 'Quên';
        case FlashcardReviewQuality.Hard:
            return 'Khó';
        case FlashcardReviewQuality.Good:
            return 'Nhớ';
        case FlashcardReviewQuality.Easy:
            return 'Dễ';
        default:
            return 'Chưa học';
    }
};

function FlashcardStudyCard({
    card,
    flipped,
    onFlip,
}: {
    card: FlashcardDto;
    flipped: boolean;
    onFlip: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onFlip}
            className="group relative flex min-h-[420px] w-full items-center justify-center rounded-[2rem] border bg-white px-6 py-10 text-center shadow-sm transition-all hover:border-indigo-200 hover:shadow-xl md:min-h-[520px] md:px-14"
        >
            <div className="absolute left-5 top-5 flex items-center gap-2">
                <Badge variant={flipped ? 'default' : 'outline'}>
                    {flipped ? 'Mặt sau' : 'Mặt trước'}
                </Badge>

                {card.isAIGenerated && (
                    <Badge variant="secondary" className="gap-1">
                        <Sparkles size={12} />
                        AI
                    </Badge>
                )}
            </div>

            <div className="absolute right-5 top-5 hidden items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
                <RotateCcw size={14} />
                Bấm để lật
            </div>

            <div className="mx-auto flex max-w-4xl flex-col items-center">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
                    {flipped ? 'Câu trả lời' : 'Câu hỏi'}
                </p>

                <h2 className="whitespace-pre-wrap text-2xl font-bold leading-relaxed text-slate-950 md:text-4xl md:leading-relaxed">
                    {flipped ? card.back : card.front}
                </h2>

                {!flipped && card.hint && (
                    <div className="mt-10 max-w-2xl rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm leading-6 text-indigo-700">
                        <span className="font-semibold">Gợi ý:</span> {card.hint}
                    </div>
                )}

                <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground sm:hidden">
                    <RotateCcw size={16} />
                    Bấm vào thẻ để lật
                </div>
            </div>
        </button>
    );
}

export default function MaterialFlashcardsPage() {
    const params = useParams();
    const router = useRouter();

    const subjectId = params.id as string;
    const materialId = params.materialId as string;

    const {
        flashcards,
        flashcardLoading,
        reviewLoadingId,
        pagination,
        mode,
        getFlashcards,
        getDueFlashcards,
        reviewFlashcard,
    } = useFlashcards(materialId);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
    useEffect(() => {
        getFlashcards(1, 10);
    }, [getFlashcards]);

    useEffect(() => {
        setCurrentIndex(0);
        setFlipped(false);
    }, [flashcards]);

    const currentCard = flashcards[currentIndex];

    useEffect(() => {
        setSessionReviewedCount(0);
    }, [mode]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!currentCard) return;

            if (event.key === ' ') {
                event.preventDefault();
                setFlipped((prev) => !prev);
            }

            if (event.key === 'ArrowRight') {
                goNext();
            }

            if (event.key === 'ArrowLeft') {
                goPrevious();
            }

            if (!flipped) return;

            if (event.key === '1') handleReview(FlashcardReviewQuality.Again);
            if (event.key === '2') handleReview(FlashcardReviewQuality.Hard);
            if (event.key === '3') handleReview(FlashcardReviewQuality.Good);
            if (event.key === '4') handleReview(FlashcardReviewQuality.Easy);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentCard, flipped, reviewLoadingId]);


    const studiedCount = useMemo(() => {
        return flashcards.filter((card) => !!card.progress).length;
    }, [flashcards]);

    const progressPercent = useMemo(() => {
        if (flashcards.length === 0) return 0;

        return Math.round((studiedCount / flashcards.length) * 100);
    }, [studiedCount, flashcards.length]);

    const goNext = () => {
        setFlipped(false);

        setCurrentIndex((prev) => {
            if (prev >= flashcards.length - 1) return prev;
            return prev + 1;
        });
    };

    const goPrevious = () => {
        setFlipped(false);

        setCurrentIndex((prev) => {
            if (prev <= 0) return prev;
            return prev - 1;
        });
    };

    const handleReview = async (quality: FlashcardReviewQuality) => {
        if (!currentCard) return;

        const result = await reviewFlashcard(currentCard.id, quality);

        if (result.success) {
            setSessionReviewedCount((prev) => prev + 1);
            goNext();
        }
    };

    const formatDate = (date?: string | null) => {
        if (!date) return 'Chưa có';

        return new Date(date).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const loadPage = (pageNumber: number) => {
        if (mode === 'due') {
            getDueFlashcards(pageNumber, pagination.pageSize);
            return;
        }

        getFlashcards(pageNumber, pagination.pageSize);
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f6f7fb]">
            <header className="sticky top-0 z-30 border-b bg-white/90 shadow-sm backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                router.push(`/subjects/${subjectId}/materials/${materialId}`)
                            }
                            className="shrink-0"
                        >
                            <ArrowLeft size={18} />
                        </Button>


                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-bold text-slate-900">
                                Chế độ học FlashCard
                            </h1>
                            <p className="truncate text-sm text-muted-foreground">
                                Lật thẻ, tự nhớ đáp án, rồi đánh giá mức độ ghi nhớ của bạn.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={() =>
                                router.push(`/subjects/${subjectId}/materials/${materialId}/flashcards/create`)
                            }
                            className="gap-2"
                        >
                            <Plus size={16} />
                            
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.push(`/subjects/${subjectId}/materials/${materialId}/flashcards/update`)
                            }
                            className="gap-2"
                        >
                            <Pencil size={16} />
                            
                        </Button>
                        <Button
                            variant={mode === 'all' ? 'default' : 'outline'}
                            onClick={() => getFlashcards(1, 10)}
                            className="gap-2"
                        >
                            <Brain size={16} />
                            Tất cả
                        </Button>

                        <Button
                            variant={mode === 'due' ? 'default' : 'outline'}
                            onClick={() => getDueFlashcards(1, 10)}
                            className="gap-2"
                        >
                            <Clock3 size={16} />
                            Cần ôn
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
                {flashcardLoading ? (
                    <div className="flex h-[520px] items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang tải flashcard...
                    </div>
                ) : flashcards.length === 0 ? (
                    <div className="flex h-[520px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white text-center text-muted-foreground">
                        <Brain className="mb-3 h-12 w-12" />
                        <p className="text-base font-semibold">Chưa có FlashCard</p>
                        <p className="mt-1 text-sm">
                            Khi tài liệu có flashcard, bạn có thể học và theo dõi tiến trình ở đây.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-6">
                            <section className="rounded-3xl border bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">
                                            {currentIndex + 1}/{flashcards.length} thẻ
                                        </Badge>

                                        <Badge variant="outline">
                                            Đã học {studiedCount}/{flashcards.length}
                                        </Badge>

                                        <Badge variant="outline">
                                            Tiến độ {progressPercent}%
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                                        <Button
                                            variant="outline"
                                            onClick={goPrevious}
                                            disabled={currentIndex === 0}
                                            className="gap-2"
                                        >
                                            <ChevronLeft size={16} />
                                            Trước
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={goNext}
                                            disabled={currentIndex >= flashcards.length - 1}
                                            className="gap-2"
                                        >
                                            Sau
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-indigo-600 transition-all"
                                        style={{
                                            width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                                        }}
                                    />
                                </div>
                            </section>

                            <FlashcardStudyCard
                                card={currentCard}
                                flipped={flipped}
                                onFlip={() => setFlipped((prev) => !prev)}
                            />

                            <section className="rounded-3xl border bg-white p-5 shadow-sm">
                                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Đánh giá mức độ ghi nhớ
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Chọn sau khi bạn đã lật thẻ để hệ thống tính ngày ôn tiếp theo.
                                        </p>
                                    </div>

                                    {currentCard.progress && (
                                        <Badge variant="secondary" className="gap-1.5">
                                            <CheckCircle2 size={13} />
                                            Lần trước: {getQualityLabel(currentCard.progress.lastQuality)}
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    {qualityOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            disabled={
                                                reviewLoadingId === currentCard.id ||
                                                !flipped
                                            }
                                            onClick={() => handleReview(option.value)}
                                            className={`h-auto flex-col gap-1 rounded-2xl py-4 ${option.className}`}
                                        >
                                            {reviewLoadingId === currentCard.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <span className="font-semibold">{option.label}</span>
                                            )}

                                            <span className="text-[11px] opacity-90">
                                                {option.description}
                                            </span>
                                        </Button>
                                    ))}
                                </div>

                                {!flipped && (
                                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Eye size={13} />
                                        Hãy lật thẻ trước khi đánh giá.
                                    </p>
                                )}
                            </section>

                            {currentCard.progress && (
                                <section className="rounded-3xl border bg-white p-4 text-sm shadow-sm">
                                    <h3 className="mb-3 font-semibold text-slate-900">
                                        Tiến trình của thẻ hiện tại
                                    </h3>

                                    <div className="grid gap-3 md:grid-cols-4">
                                        <div className="rounded-2xl bg-slate-50 p-3">
                                            <p className="text-xs text-muted-foreground">Số lần lặp</p>
                                            <p className="mt-1 font-bold">
                                                {currentCard.progress.repetitionCount}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-3">
                                            <p className="text-xs text-muted-foreground">Khoảng cách</p>
                                            <p className="mt-1 font-bold">
                                                {currentCard.progress.interval} ngày
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-3">
                                            <p className="text-xs text-muted-foreground">Ease factor</p>
                                            <p className="mt-1 font-bold">
                                                {currentCard.progress.easeFactor}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-3">
                                            <p className="text-xs text-muted-foreground">Ôn tiếp</p>
                                            <p className="mt-1 text-xs font-semibold">
                                                {formatDate(currentCard.progress.nextReviewDate)}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            <Separator />

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={!pagination.hasPreviousPage || flashcardLoading}
                                        onClick={() => loadPage(pagination.pageNumber - 1)}
                                    >
                                        Trang trước
                                    </Button>

                                    <span className="text-sm text-muted-foreground">
                                        Trang {pagination.pageNumber}/{pagination.totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        disabled={!pagination.hasNextPage || flashcardLoading}
                                        onClick={() => loadPage(pagination.pageNumber + 1)}
                                    >
                                        Trang sau
                                    </Button>
                                </div>
                            )}
                        </div>

                        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                            <section className="rounded-3xl border bg-white p-5 shadow-sm">
                                <p className="text-sm font-semibold text-slate-900">Phiên học</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Theo dõi nhanh tiến độ trong phiên hiện tại.
                                </p>

                                <div className="mt-5 space-y-3">
                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm">
                                        <span className="text-muted-foreground">Đang học</span>
                                        <span className="font-bold text-slate-900">
                                            {currentIndex + 1}/{flashcards.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm">
                                        <span className="text-muted-foreground">Đã đánh giá</span>
                                        <span className="font-bold text-slate-900">
                                            {sessionReviewedCount}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm">
                                        <span className="text-muted-foreground">Đã từng học</span>
                                        <span className="font-bold text-slate-900">
                                            {studiedCount}/{flashcards.length}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-3xl border bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Keyboard size={16} />
                                    Phím tắt
                                </div>

                                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                                    <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">Space</kbd> Lật thẻ</p>
                                    <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">←</kbd> Thẻ trước</p>
                                    <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">→</kbd> Thẻ sau</p>
                                    <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">1</kbd> Quên</p>
                                    <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">2</kbd> Khó</p>
                                    <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">3</kbd> Nhớ</p>
                                    <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">4</kbd> Dễ</p>
                                </div>
                            </section>
                        </aside>
                    </div>
                )}
            </main>



        </div>
    );
}