import { api } from '../api-client';

import {
    ApiResponse,
    PagedResult,
    LearningMaterial,
    CreateLearningMaterialRequest,
    CollaborationInfo,
} from '@/types';

export interface GetMaterialsBySubjectParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
}

export interface UpdateLearningMaterialInfoRequest {
    title: string;
    summary?: string;
}

export interface UpdateLearningMaterialContentRequest {
    content: string;
}

export const materialsApi = {
    getBySubject: (
        subjectId: string,
        params?: GetMaterialsBySubjectParams
    ) =>
        api.get<ApiResponse<PagedResult<LearningMaterial>>>(
            `/api/subjects/${subjectId}/materials/`,
            {
                params,
            }
        ),

    getById: (id: string) =>
        api.get<ApiResponse<LearningMaterial>>(
            `/api/materials/${id}`
        ),

    create: (data: CreateLearningMaterialRequest) =>
        api.post<ApiResponse<LearningMaterial>>(
            '/api/materials',
            data
        ),

    updateInfo: (
        id: string,
        data: UpdateLearningMaterialInfoRequest
    ) =>
        api.patch<ApiResponse<LearningMaterial>>(
            `/api/materials/${id}/info`,
            data
        ),

    updateContent: (
        id: string,
        data: UpdateLearningMaterialContentRequest
    ) =>
        api.put<ApiResponse<LearningMaterial>>(
            `/api/materials/${id}/content`,
            data
        ),

    delete: (id: string) =>
        api.delete<ApiResponse<boolean>>(
            `/api/materials/${id}`
        ),

    getMy: (params?: { subjectId?: string; pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
        api.get<ApiResponse<PagedResult<LearningMaterial>>>('/api/materials/my', { params }),



    update: (id: string, data: { title: string; content?: string; summary?: string }) =>
        api.put<ApiResponse<LearningMaterial>>(`/api/materials/${id}`, data),



    toggleCollaborative: (id: string, isCollaborative: boolean) =>
        api.put(`/api/materials/${id}/collaborative`, isCollaborative),

    getCollaborationInfo: (id: string) =>
        api.get<ApiResponse<CollaborationInfo>>(`/api/materials/${id}/collaboration-info`),

};