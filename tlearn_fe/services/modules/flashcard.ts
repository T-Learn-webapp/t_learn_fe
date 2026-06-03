import { api } from '../api-client';

import {
    ApiResponse,
    PagedResult,
} from '@/types';

import {
    CreateManyFlashcardsRequest,
    FlashcardDto,
    FlashcardProgressDto,
    GeneratedFlashcardDto,
    GenerateAIFlashcardsRequest,

    GetFlashcardsParams,
    ReviewFlashcardProgressRequest,
    UpdateManyFlashcardsRequest,
} from '@/types/FlashCard';

export const flashcardsApi = {
    getByMaterial: (

        materialId: string,

        params?: GetFlashcardsParams

    ) =>

        api.get<ApiResponse<PagedResult<FlashcardDto>>>(
            `/api/flashcards/material/${materialId}`,
            {

                params: {

                    pageNumber: params?.pageNumber,

                    pageSize: params?.pageSize,

                    searchTerm: params?.searchTerm,

                    Status: params?.status,

                },

            }

        ),



    reviewProgress: (
        flashCardId: string,
        data: ReviewFlashcardProgressRequest
    ) =>
        api.patch<ApiResponse<FlashcardProgressDto>>(
            `/api/flashcards/${flashCardId}/progress`,
            data
        ),

    createMany: (data: CreateManyFlashcardsRequest) =>
        api.post<ApiResponse<FlashcardDto[]>>(
            '/api/flashcards/many',
            data
        ),

    generateAI: (data: GenerateAIFlashcardsRequest) =>
        api.post<ApiResponse<GeneratedFlashcardDto[]>>(
            '/api/flashcards/generate-ai',
            data
        ),
    updateMany: (data: UpdateManyFlashcardsRequest) =>
        api.put<ApiResponse<FlashcardDto[]>>(
            '/api/flashcards/many',
            data
        ),
    resetProgressByMaterial: (materialId: string) =>

        api.post<ApiResponse<boolean>>(

            `/api/flashcards/material/${materialId}/reset-progress`

        ),
};