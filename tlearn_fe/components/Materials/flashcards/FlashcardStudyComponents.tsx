import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Keyboard,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { FlashcardDto, FlashcardReviewQuality } from '@/types/FlashCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type FlashcardPageMode = 'view' | 'review';
export type ReviewFilter = 'all' | 'notStudied' | 'needReview' | 'remembered';
export type StudyStep = 'chooseMode' | 'chooseReviewSet' | 'study' | 'completed';

export type Stats = {
  remembered: number;
  forgot: number;
  notStudied: number;
};

export const getReviewFilterLabel = (filter: ReviewFilter) => {
  switch (filter) {
    case 'notStudied':
      return 'Chưa học';
    case 'needReview':
      return 'Cần ôn';
    case 'remembered':
      return 'Đã thuộc';
    case 'all':
    default:
      return 'Tất cả';
  }
};

const getQualityLabel = (quality?: FlashcardReviewQuality | null) => {
  switch (quality) {
    case FlashcardReviewQuality.Again:
      return 'Chưa nhớ';
    case FlashcardReviewQuality.Good:
      return 'Đã nhớ';
    default:
      return 'Chưa học';
  }
};

const qualityOptions = [
  {
    label: 'Chưa nhớ',
    description: 'Cần học lại',
    value: FlashcardReviewQuality.Again,
    className: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    label: 'Đã nhớ',
    description: 'Tạm ổn',
    value: FlashcardReviewQuality.Good,
    className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
];

export function PageHeader({
  subjectId,
  materialId,
}: {
  subjectId: string;
  materialId: string;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/subjects/${subjectId}/materials/${materialId}`)}
            className="shrink-0"
          >
            <ArrowLeft size={18} />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900">FlashCard</h1>
            <p className="truncate text-sm text-muted-foreground">
              Chọn chế độ học theo từng bước rõ ràng.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => router.push(`/subjects/${subjectId}/materials/${materialId}/flashcards/create`)}
            title="Tạo FlashCard"
          >
            <Plus size={16} />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/subjects/${subjectId}/materials/${materialId}/flashcards/update`)}
            title="Sửa FlashCard"
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}


export function ChooseModeStep({
  onChooseView,
  onChooseReview,
}: {
  onChooseView: () => void;
  onChooseReview: () => void;
}) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Bước 1</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          Bạn muốn dùng FlashCard theo cách nào?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Chọn xem nhanh để lật thẻ tự do, hoặc chọn ôn tập để ghi nhận tiến trình học.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={onChooseView}
          className="rounded-3xl border bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <Eye size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Chế độ xem</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Chỉ xem và lật thẻ. Không hiện nút cập nhật tiến trình.
          </p>
        </button>

        <button
          type="button"
          onClick={onChooseReview}
          className="rounded-3xl border bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <Brain size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Chế độ ôn tập</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Chọn tập ôn, lật thẻ rồi đánh giá Chưa nhớ hoặc Đã nhớ.
          </p>
        </button>
      </div>
    </section>
  );
}

export function ChooseReviewSetStep({
  resetProgressLoading,
  onBack,
  onStartReview,
  onStartReviewAllFromBeginning,
}: {
  resetProgressLoading: boolean;
  onBack: () => void;
  onStartReview: (filter: ReviewFilter) => void;
  onStartReviewAllFromBeginning: () => void;
}) {
  const options = [
    ['all', 'Ôn tất cả', 'Reset tiến trình và ôn lại toàn bộ thẻ từ đầu.'],
    ['notStudied', 'Ôn câu chưa học', 'Chỉ lấy các thẻ chưa có tiến trình.'],
    ['needReview', 'Ôn câu cần học lại', 'Lấy các thẻ hệ thống đánh dấu cần ôn.'],
    ['remembered', 'Xem câu đã thuộc', 'Ôn lại các thẻ đã thuộc.'],
  ] as const;

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Bước 2</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">Chọn tập FlashCard muốn ôn</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Mỗi lựa chọn sẽ tải lại danh sách thẻ theo trạng thái học hiện tại.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {options.map(([filter, title, description]) => (
          <button
            key={filter}
            type="button"
            disabled={resetProgressLoading}
            onClick={() => {
              if (filter === 'all') {
                onStartReviewAllFromBeginning();
                return;
              }

              onStartReview(filter);
            }}
            className="rounded-3xl border bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Badge variant="secondary">{getReviewFilterLabel(filter)}</Badge>
            <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="outline" onClick={onBack}>Quay lại bước 1</Button>
      </div>
    </section>
  );
}

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
        <Badge variant={flipped ? 'default' : 'outline'}>{flipped ? 'Mặt sau' : 'Mặt trước'}</Badge>
        {card.isAIGenerated && (
          <Badge variant="secondary" className="gap-1">
            <Sparkles size={12} /> AI
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
      </div>
    </button>
  );
}

export function StudyView({
  currentCard,
  currentIndex,
  totalCards,
  pageMode,
  reviewFilter,
  stats,
  flipped,
  reviewLoadingId,
  onFlip,
  onPrevious,
  onNext,
  onReview,
  onBackToChooseMode,
}: {
  currentCard: FlashcardDto;
  currentIndex: number;
  totalCards: number;
  pageMode: FlashcardPageMode;
  reviewFilter: ReviewFilter;
  stats: Stats;
  flipped: boolean;
  reviewLoadingId: string | null;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReview: (quality: FlashcardReviewQuality) => void;
  onBackToChooseMode: () => void;
}) {
  const isReviewMode = pageMode === 'review';
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {pageMode === 'review' ? 'Ôn tập' : 'Xem'} · {currentIndex + 1}/{totalCards} thẻ
              </Badge>
              {pageMode === 'review' && <Badge variant="outline">Tập: {getReviewFilterLabel(reviewFilter)}</Badge>}
              <Badge variant="outline">Đã nhớ {stats.remembered}/{totalCards}</Badge>
              <Badge variant="outline">Chưa nhớ {stats.forgot}</Badge>
              <Badge variant="outline">Chưa học {stats.notStudied}</Badge>
            </div>

            {!isReviewMode && (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Button variant="outline" onClick={onPrevious} disabled={currentIndex === 0} className="gap-2">
                  <ChevronLeft size={16} /> Trước
                </Button>
                <Button variant="outline" onClick={onNext} disabled={currentIndex >= totalCards - 1} className="gap-2">
                  Sau <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${((currentIndex + 1) / Math.max(totalCards, 1)) * 100}%` }}
            />
          </div>
        </section>

        <FlashcardStudyCard card={currentCard} flipped={flipped} onFlip={onFlip} />

        {pageMode === 'review' && (
          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Bước 3 · Đánh giá mức độ ghi nhớ</h2>
                <p className="text-xs text-muted-foreground">Lật thẻ trước, sau đó chọn Chưa nhớ hoặc Đã nhớ. Sau khi đánh giá, hệ thống sẽ tự chuyển sang thẻ tiếp theo.</p>
              </div>
              {currentCard.progress && (
                <Badge variant="secondary" className="gap-1.5">
                  <CheckCircle2 size={13} /> Lần trước: {getQualityLabel(currentCard.progress.lastQuality)}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {qualityOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  disabled={reviewLoadingId === currentCard.id || !flipped}
                  onClick={() => onReview(option.value)}
                  className={`h-auto flex-col gap-1 rounded-2xl py-4 ${option.className}`}
                >
                  {reviewLoadingId === currentCard.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span className="font-semibold">{option.label}</span>
                  )}
                  <span className="text-[11px] opacity-90">{option.description}</span>
                </Button>
              ))}
            </div>

            {!flipped && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye size={13} /> Hãy lật thẻ trước khi đánh giá.
              </p>
            )}
          </section>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Phiên học</p>
          <div className="mt-5 space-y-3">
            <InfoRow label="Chế độ" value={pageMode === 'review' ? 'Ôn tập' : 'Xem'} />
            {pageMode === 'review' && <InfoRow label="Tập ôn" value={getReviewFilterLabel(reviewFilter)} />}
            <InfoRow label="Đang ở thẻ" value={`${currentIndex + 1}/${totalCards}`} />
            <InfoRow label="Đã nhớ" value={String(stats.remembered)} valueClassName="text-emerald-700" />
            <InfoRow label="Chưa nhớ" value={String(stats.forgot)} valueClassName="text-red-700" />
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Keyboard size={16} /> Phím tắt
          </div>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">Space</kbd> Lật thẻ</p>
            <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">←</kbd> Thẻ trước</p>
            <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">→</kbd> Thẻ sau</p>
            {pageMode === 'review' && (
              <>
                <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">1</kbd> Chưa nhớ</p>
                <p><kbd className="rounded border bg-slate-50 px-1.5 py-0.5">2</kbd> Đã nhớ</p>
              </>
            )}
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <Button variant="outline" className="w-full" onClick={onBackToChooseMode}>
            Chọn lại từ đầu
          </Button>
        </section>
      </aside>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClassName = 'text-slate-900',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${valueClassName}`}>{value}</span>
    </div>
  );
}

export function CompletedStep({
  reviewFilter,
  totalCards,
  sessionRememberedCount,
  sessionForgotCount,
  sessionReviewedCount,
  resetProgressLoading,
  onRestart,
  onChooseAnotherSet,
  onBackToChooseMode,
}: {
  reviewFilter: ReviewFilter;
  totalCards: number;
  sessionRememberedCount: number;
  sessionForgotCount: number;
  sessionReviewedCount: number;
  resetProgressLoading: boolean;
  onRestart: () => void;
  onChooseAnotherSet: () => void;
  onBackToChooseMode: () => void;
}) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Kết quả</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">Hoàn thành phiên ôn tập</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Bạn đã đi hết các thẻ trong phiên {getReviewFilterLabel(reviewFilter)}.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <ResultBox label="Tổng câu" value={totalCards} />
        <ResultBox label="Đã nhớ trong phiên" value={sessionRememberedCount} className="bg-emerald-50 text-emerald-700" />
        <ResultBox label="Chưa nhớ trong phiên" value={sessionForgotCount} className="bg-red-50 text-red-700" />
        <ResultBox label="Đã đánh giá" value={sessionReviewedCount} className="bg-indigo-50 text-indigo-700" />
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={onRestart} disabled={resetProgressLoading} className="gap-2">
          {resetProgressLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
          {resetProgressLoading ? 'Đang reset...' : 'Ôn lại từ đầu'}
        </Button>
        <Button variant="outline" onClick={onChooseAnotherSet}>Chọn tập ôn khác</Button>
        <Button variant="outline" onClick={onBackToChooseMode}>Về bước 1</Button>
      </div>
    </section>
  );
}

function ResultBox({
  label,
  value,
  className = 'bg-slate-50 text-slate-900',
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl p-5 text-center ${className}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}