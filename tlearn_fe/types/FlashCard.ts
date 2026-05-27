export enum FlashcardReviewQuality {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

export interface FlashcardProgressDto {
  flashcardId: string;
  userId: string;
  easeFactor: number;
  interval: number;
  repetitionCount: number;
  nextReviewDate: string;
  lastReviewedAt: string;
  lastQuality: FlashcardReviewQuality;
}

export interface FlashcardDto {
  id: string;
  front: string;
  back: string;
  hint?: string | null;
  isAIGenerated: boolean;
  materialId: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt?: string | null;
  progress?: FlashcardProgressDto | null;
}

export interface ReviewFlashcardProgressRequest {
  quality: FlashcardReviewQuality;
}

export interface GetFlashcardsParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface GetDueFlashcardsParams {
  materialId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateFlashcardItemRequest {
  front: string;
  back: string;
  hint?: string;
  isAIGenerated: boolean;
}

export interface CreateManyFlashcardsRequest {
  materialId: string;
  flashcards: CreateFlashcardItemRequest[];
}

export interface GenerateAIFlashcardsRequest {
  materialId: string;
  count: number;
}

export interface GeneratedFlashcardDto {
  front: string;
  back: string;
  hint?: string | null;
}
export interface UpdateFlashcardItemRequest {
  id: string;
  front: string;
  back: string;
  hint?: string;
  isAIGenerated: boolean;
}

export interface UpdateManyFlashcardsRequest {
  materialId: string;
  flashcards: UpdateFlashcardItemRequest[];
}