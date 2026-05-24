import { api } from '../api-client';
import { ApiResponse, PagedResult, Subject, SubjectFilterType, SubjectList, SubjectMember } from '@/types';

export const subjectsApi = {
  getAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    filter?: SubjectFilterType;
  }) =>
    api.get<ApiResponse<PagedResult<SubjectList>>>('/api/subjects', {
      params,
    }),

  getMy: (params?: { pageNumber?: number; pageSize?: number; onlyPublic?: boolean }) =>
    api.get<ApiResponse<PagedResult<Subject>>>('/api/subjects/my', { params }),

  getPublic: (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
    api.get<ApiResponse<PagedResult<Subject>>>('/api/subjects/public', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Subject>>(`/api/subjects/${id}`),

  create: (data: { name: string; description?: string; }) =>
    api.post<ApiResponse<Subject>>('/api/subjects', data),

  update: (id: string, data: { name: string; description?: string; }) =>
    api.put<ApiResponse<Subject>>(`/api/subjects/${id}`, data),

  delete: (id: string) => api.delete(`/api/subjects/${id}`),

  getMembers: (id: string, params?: { pageNumber?: number; pageSize?: number }) =>
    api.get<ApiResponse<PagedResult<SubjectMember>>>(`/api/subjects/${id}/members`, { params }),

  updateMemberPermission: (subjectId: string, memberId: string, permission: string) =>
    api.put(`/api/subjects/${subjectId}/members/${memberId}/permission`, { permission }),

  removeMember: (subjectId: string, memberId: string) =>
    api.delete<ApiResponse<boolean>>(`/api/subjects/${subjectId}/members/${memberId}`),
};