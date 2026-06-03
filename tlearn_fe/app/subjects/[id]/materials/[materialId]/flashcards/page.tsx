'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Brain, Loader2 } from 'lucide-react';

import { useFlashcards } from '@/hooks/useFlashcards';
import { FlashcardReviewQuality } from '@/types/FlashCard';
import { Button } from '@/components/ui/button';
import {
  ChooseModeStep,
  ChooseReviewSetStep,
  CompletedStep,
  FlashcardPageMode,
  PageHeader,
  ReviewFilter,
  Stats,
  StudyStep,
  StudyView,
} from '@/components/Materials/flashcards/FlashcardStudyComponents';

export default function MaterialFlashcardsPage() {
    const params = useParams();

    const subjectId = params.id as string;
    const materialId = params.materialId as string;

    const {
        flashcards,
        flashcardLoading,
        reviewLoadingId,
        getFlashcardsByMode,
        reviewFlashcard,
        resetProgressLoading,
        resetMaterialProgress,
    } = useFlashcards(materialId);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [pageMode, setPageMode] = useState<FlashcardPageMode>('view');
    const [studyStep, setStudyStep] = useState<StudyStep>('chooseMode');
    const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
    const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
    const [sessionRememberedCount, setSessionRememberedCount] = useState(0);
    const [sessionForgotCount, setSessionForgotCount] = useState(0);
    const previousFlashcardIdsRef = useRef<string>('');
    const currentIndexRef = useRef(0);

    useEffect(() => {
        getFlashcardsByMode('all', 1, 10);
    }, [getFlashcardsByMode]);

    useEffect(() => {

        const currentFlashcardIds = flashcards.map((card) => card.id).join('|');

        if (previousFlashcardIdsRef.current === currentFlashcardIds) return;

        previousFlashcardIdsRef.current = currentFlashcardIds;

        setCurrentIndex(0);

        setFlipped(false);

    }, [flashcards]);

    const currentCard = flashcards[currentIndex];
    const totalCards = flashcards.length;
    const canReview = pageMode === 'review' && studyStep === 'study';

    const stats = useMemo<Stats>(() => {
        return {
            remembered: flashcards.filter(
                (card) => card.progress?.lastQuality === FlashcardReviewQuality.Good
            ).length,
            forgot: flashcards.filter(
                (card) => card.progress?.lastQuality === FlashcardReviewQuality.Again
            ).length,
            notStudied: flashcards.filter((card) => !card.progress).length,
        };
    }, [flashcards]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    const resetSessionStats = () => {
        setSessionReviewedCount(0);
        setSessionRememberedCount(0);
        setSessionForgotCount(0);
    };

    const goNext = () => {
        setFlipped(false);
        setCurrentIndex((prev) => {
            const nextIndex = prev >= flashcards.length - 1 ? prev : prev + 1;
            currentIndexRef.current = nextIndex;
            return nextIndex;
        });
    };

    const goPrevious = () => {
        setFlipped(false);
        setCurrentIndex((prev) => {
            const nextIndex = prev <= 0 ? prev : prev - 1;
            currentIndexRef.current = nextIndex;
            return nextIndex;
        });
    };

    const chooseViewMode = async () => {
        setPageMode('view');
        setStudyStep('study');
        resetSessionStats();
        currentIndexRef.current = 0;
        setCurrentIndex(0);
        setFlipped(false);
        await getFlashcardsByMode('all', 1, 10);
    };

    const chooseReviewMode = () => {
        setPageMode('review');
        setStudyStep('chooseReviewSet');
        resetSessionStats();
        currentIndexRef.current = 0;
        setCurrentIndex(0);
        setFlipped(false);
    };

    const startReview = async (filter: ReviewFilter) => {
        setPageMode('review');
        setReviewFilter(filter);
        setStudyStep('study');
        resetSessionStats();
        currentIndexRef.current = 0;
        setCurrentIndex(0);
        setFlipped(false);
        await getFlashcardsByMode(filter, 1, 10);
    };

    const startReviewAllFromBeginning = async () => {
        const confirmed = confirm(
            'Ôn tất cả sẽ reset toàn bộ tiến trình FlashCard của bạn trong tài liệu này. Bạn có chắc muốn ôn lại từ đầu không?'
        );

        if (!confirmed) return;

        const result = await resetMaterialProgress();

        if (!result.success) return;

        await startReview('all');
    };

    const restartCurrentReview = async () => {
        const confirmed = confirm(
            'Bạn có chắc muốn reset toàn bộ tiến trình học FlashCard của bạn trong tài liệu này không?'
        );

        if (!confirmed) return;

        const result = await resetMaterialProgress();

        if (!result.success) return;

        await startReview('all');
    };

    const backToChooseMode = () => {
        setStudyStep('chooseMode');
        setPageMode('view');
        resetSessionStats();
        currentIndexRef.current = 0;
        setCurrentIndex(0);
        setFlipped(false);
        getFlashcardsByMode('all', 1, 10);
    };

    const handleReview = async (quality: FlashcardReviewQuality) => {
        const reviewingIndex = currentIndexRef.current;
        const reviewingCard = flashcards[reviewingIndex];

        if (!reviewingCard || !canReview) return;

        const result = await reviewFlashcard(reviewingCard.id, quality);

        if (!result.success) return;

        setSessionReviewedCount((prev) => prev + 1);

        if (quality === FlashcardReviewQuality.Good) {
            setSessionRememberedCount((prev) => prev + 1);
        }

        if (quality === FlashcardReviewQuality.Again) {
            setSessionForgotCount((prev) => prev + 1);
        }

        if (reviewingIndex >= flashcards.length - 1) {
            setFlipped(false);
            setStudyStep('completed');
            return;
        }

        const nextIndex = reviewingIndex + 1;
        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);
        setFlipped(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!currentCard || studyStep !== 'study') return;

            if (event.key === ' ') {
                event.preventDefault();
                setFlipped((prev) => !prev);
            }

            if (pageMode !== 'review') {
                if (event.key === 'ArrowRight') goNext();
                if (event.key === 'ArrowLeft') goPrevious();
            }

            if (!canReview || !flipped) return;

            if (event.key === '1') handleReview(FlashcardReviewQuality.Again);
            if (event.key === '2') handleReview(FlashcardReviewQuality.Good);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentCard, flipped, reviewLoadingId, canReview, studyStep, pageMode, flashcards]);

    return (
        <div className="flex min-h-screen flex-col bg-[#f6f7fb]">
            <PageHeader subjectId={subjectId} materialId={materialId} />

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
                {flashcardLoading ? (
                    <div className="flex h-[520px] items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang tải flashcard...
                    </div>
                ) : flashcards.length === 0 && studyStep === 'study' ? (
                    <div className="flex h-[520px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white text-center text-muted-foreground">
                        <Brain className="mb-3 h-12 w-12" />
                        <p className="text-base font-semibold">Không có FlashCard phù hợp</p>
                        <p className="mt-1 text-sm">
                            Thử chọn tập ôn khác hoặc tạo thêm FlashCard cho tài liệu này.
                        </p>
                        <Button className="mt-5" onClick={backToChooseMode}>
                            Chọn lại chế độ
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                       

                        {studyStep === 'chooseMode' && (
                            <ChooseModeStep
                                onChooseView={chooseViewMode}
                                onChooseReview={chooseReviewMode}
                            />
                        )}

                        {studyStep === 'chooseReviewSet' && (
                            <ChooseReviewSetStep
                                resetProgressLoading={resetProgressLoading}
                                onBack={backToChooseMode}
                                onStartReview={startReview}
                                onStartReviewAllFromBeginning={startReviewAllFromBeginning}
                            />
                        )}

                        {studyStep === 'study' && currentCard && (
                            <StudyView
                                currentCard={currentCard}
                                currentIndex={currentIndex}
                                totalCards={totalCards}
                                pageMode={pageMode}
                                reviewFilter={reviewFilter}
                                stats={stats}
                                flipped={flipped}
                                reviewLoadingId={reviewLoadingId}
                                onFlip={() => setFlipped((prev) => !prev)}
                                onPrevious={goPrevious}
                                onNext={goNext}
                                onReview={handleReview}
                                onBackToChooseMode={backToChooseMode}
                            />
                        )}

                        {studyStep === 'completed' && (
                            <CompletedStep
                                reviewFilter={reviewFilter}
                                totalCards={totalCards}
                                sessionRememberedCount={sessionRememberedCount}
                                sessionForgotCount={sessionForgotCount}
                                sessionReviewedCount={sessionReviewedCount}
                                resetProgressLoading={resetProgressLoading}
                                onRestart={restartCurrentReview}
                                onChooseAnotherSet={() => setStudyStep('chooseReviewSet')}
                                onBackToChooseMode={backToChooseMode}
                            />
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}