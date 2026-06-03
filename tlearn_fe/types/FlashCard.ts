export enum FlashcardReviewQuality {
  Again = 1,
  
  Good = 2,
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
  learningStatus?: FlashcardLearningStatus;
}

export interface ReviewFlashcardProgressRequest {
  quality: FlashcardReviewQuality;
}
export interface GetFlashcardsParams {
  materialId?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: FlashcardLearningStatus;
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
export enum FlashcardLearningStatus {
  NotStudied = 1,
  Studied = 2,
  NeedReview = 3,
  Remembered = 4,
}