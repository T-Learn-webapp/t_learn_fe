'use client';

import { useCallback, useState } from 'react';

import { flashcardsApi } from '@/services/modules/flashcard';
import {
    CreateFlashcardItemRequest,
    FlashcardDto,
    FlashcardProgressDto,
    FlashcardReviewQuality,
    UpdateManyFlashcardsRequest
} from '@/types/FlashCard';

import { toast } from 'sonner';

type FlashcardMode = 'all' | 'due';

export function useFlashcards(materialId?: string) {
    const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
    const [flashcardLoading, setFlashcardLoading] = useState(false);
    const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);
    const [mode, setMode] = useState<FlashcardMode>('all');
    const [createFlashcardLoading, setCreateFlashcardLoading] = useState(false);
    const [updateFlashcardLoading, setUpdateFlashcardLoading] = useState(false);

    const [generateAILoading, setGenerateAILoading] = useState(false);
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
    });

    const applyPagination = (data: any) => {
        setPagination({
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
            hasPreviousPage: data.hasPreviousPage,
            hasNextPage: data.hasNextPage,
        });
    };

    const getFlashcards = useCallback(
        async (
            pageNumber: number = 1,
            pageSize: number = 10
        ) => {
            if (!materialId) {
                return {
                    success: false,
                };
            }

            setMode('all');
            setFlashcardLoading(true);

            try {
                const res = await flashcardsApi.getByMaterial(materialId, {
                    pageNumber,
                    pageSize,
                });

                if (res.data?.isSuccess && res.data?.data) {
                    setFlashcards(res.data.data.items || []);
                    applyPagination(res.data.data);

                    return {
                        success: true,
                        data: res.data.data,
                    };
                }

                toast.error(res.data?.error || 'Không thể tải flashcard');

                return {
                    success: false,
                };
            } catch (error: any) {
                console.error('Get flashcards error:', error);

                toast.error(
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'Không thể tải flashcard'
                );

                return {
                    success: false,
                    error,
                };
            } finally {
                setFlashcardLoading(false);
            }
        },
        [materialId]
    );


    const createManyFlashcards = async (
        flashcardItems: CreateFlashcardItemRequest[]
    ) => {
        if (!materialId) {
            toast.error('Không tìm thấy tài liệu');
            return {
                success: false,
            };
        }

        const validItems = flashcardItems.filter(
            (item) => item.front.trim() && item.back.trim()
        );

        if (validItems.length === 0) {
            toast.error('Vui lòng nhập ít nhất một flashcard hợp lệ');
            return {
                success: false,
            };
        }

        setCreateFlashcardLoading(true);

        try {
            const res = await flashcardsApi.createMany({
                materialId,
                flashcards: validItems.map((item) => ({
                    front: item.front.trim(),
                    back: item.back.trim(),
                    hint: item.hint?.trim() || undefined,
                    isAIGenerated: item.isAIGenerated,
                })),
            });

            if (res.data?.isSuccess && res.data?.data) {
                const createdFlashcards = res.data.data ?? [];

                toast.success(`Đã tạo ${createdFlashcards.length} flashcard`);

                setFlashcards((prev) => [
                    ...createdFlashcards,
                    ...prev,
                ]);

                return {
                    success: true,
                    data: createdFlashcards,
                };
            }

            toast.error(res.data?.error || 'Không thể tạo flashcard');

            return {
                success: false,
            };
        } catch (error: any) {
            console.error('Create many flashcards error:', error);

            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Không thể tạo flashcard'
            );

            return {
                success: false,
                error,
            };
        } finally {
            setCreateFlashcardLoading(false);
        }
    };

    const updateManyFlashcards = async (
        flashcardItems: UpdateFlashcardItemRequest[]
    ) => {
        if (!materialId) {
            toast.error('Không tìm thấy tài liệu');
            return {
                success: false,
            };
        }

        const validItems = flashcardItems.filter(
            (item) =>
                item.id &&
                item.front.trim() &&
                item.back.trim()
        );

        if (validItems.length === 0) {
            toast.error('Vui lòng nhập ít nhất một flashcard hợp lệ');
            return {
                success: false,
            };
        }

        setUpdateFlashcardLoading(true);

        try {
            const res = await flashcardsApi.updateMany({
                materialId,
                flashcards: validItems.map((item) => ({
                    id: item.id,
                    front: item.front.trim(),
                    back: item.back.trim(),
                    hint: item.hint?.trim() || undefined,
                    isAIGenerated: item.isAIGenerated,
                })),
            });

            if (res.data?.isSuccess && res.data?.data) {
                const updatedFlashcards = res.data.data ?? [];

                toast.success(`Đã cập nhật ${updatedFlashcards.length} flashcard`);

                setFlashcards((prev) =>
                    prev.map((card) => {
                        const updated = updatedFlashcards.find((x) => x.id === card.id);

                        return updated
                            ? {
                                ...card,
                                ...updated,
                            }
                            : card;
                    })
                );

                return {
                    success: true,
                    data: updatedFlashcards,
                };
            }

            toast.error(res.data?.error || 'Không thể cập nhật flashcard');

            return {
                success: false,
            };
        } catch (error: any) {
            console.error('Update many flashcards error:', error);

            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Không thể cập nhật flashcard'
            );

            return {
                success: false,
                error,
            };
        } finally {
            setUpdateFlashcardLoading(false);
        }
    };

    const generateAIFlashcards = async (count: number) => {
        if (!materialId) {
            toast.error('Không tìm thấy tài liệu');
            return {
                success: false,
            };
        }

        if (!count || count <= 0) {
            toast.error('Số lượng flashcard phải lớn hơn 0');
            return {
                success: false,
            };
        }

        setGenerateAILoading(true);

        try {
            const res = await flashcardsApi.generateAI({
                materialId,
                count,
            });

            if (res.data?.isSuccess && res.data?.data) {
                toast.success(`AI đã tạo nháp ${res.data.data.length} flashcard`);

                return {
                    success: true,
                    data: res.data.data,
                };
            }

            toast.error(res.data?.error || 'Không thể tạo flashcard bằng AI');

            return {
                success: false,
            };
        } catch (error: any) {
            console.error('Generate AI flashcards error:', error);

            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Không thể tạo flashcard bằng AI'
            );

            return {
                success: false,
                error,
            };
        } finally {
            setGenerateAILoading(false);
        }
    };

    const getDueFlashcards = useCallback(
        async (
            pageNumber: number = 1,
            pageSize: number = 10
        ) => {
            if (!materialId) {
                return {
                    success: false,
                };
            }

            setMode('due');
            setFlashcardLoading(true);

            try {
                const res = await flashcardsApi.getDue({
                    materialId,
                    pageNumber,
                    pageSize,
                });

                if (res.data?.isSuccess && res.data?.data) {
                    setFlashcards(res.data.data.items || []);
                    applyPagination(res.data.data);

                    return {
                        success: true,
                        data: res.data.data,
                    };
                }

                toast.error(res.data?.error || 'Không thể tải flashcard cần ôn');

                return {
                    success: false,
                };
            } catch (error: any) {
                console.error('Get due flashcards error:', error);

                toast.error(
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'Không thể tải flashcard cần ôn'
                );

                return {
                    success: false,
                    error,
                };
            } finally {
                setFlashcardLoading(false);
            }
        },
        [materialId]
    );


    const reviewFlashcard = async (
        flashcardId: string,
        quality: FlashcardReviewQuality
    ) => {
        setReviewLoadingId(flashcardId);

        try {
            const res = await flashcardsApi.reviewProgress(flashcardId, {
                quality,
            });

            if (res.data?.isSuccess && res.data?.data) {
                const progress: FlashcardProgressDto = res.data.data;

                setFlashcards((prev) =>
                    prev.map((card) =>
                        card.id === flashcardId
                            ? {
                                ...card,
                                progress,
                            }
                            : card
                    )
                );

                toast.success('Đã cập nhật tiến trình học');

                return {
                    success: true,
                    data: progress,
                };
            }

            toast.error(res.data?.error || 'Không thể cập nhật tiến trình');

            return {
                success: false,
            };
        } catch (error: any) {
            console.error('Review flashcard error:', error);

            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Không thể cập nhật tiến trình'
            );

            return {
                success: false,
                error,
            };
        } finally {
            setReviewLoadingId(null);
        }
    };

    const reloadCurrentMode = async () => {
        if (mode === 'due') {
            return getDueFlashcards(pagination.pageNumber, pagination.pageSize);
        }

        return getFlashcards(pagination.pageNumber, pagination.pageSize);
    };

    return {
        flashcards,
        setFlashcards,

        flashcardLoading,
        reviewLoadingId,

        pagination,
        mode,

        createFlashcardLoading,

        updateFlashcardLoading,
        updateManyFlashcards,
        
        generateAILoading,
        createManyFlashcards,
        generateAIFlashcards,

        getFlashcards,
        getDueFlashcards,
        reviewFlashcard,
        reloadCurrentMode,
    };
}