import axios from 'axios';
import { ApiResponse, PagedResult, Subject, SubjectMember, LearningMaterial, CollaborationInfo, InvitationInfo } from '@/types';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Auth
export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post('/api/auth/register', data),
  getMe: () =>
    api.get('/api/auth/me'),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  
  logout: () => api.post('/api/auth/logout', {}),
  
  verifyEmail: (email: string, token: string) =>
    api.post(`/api/auth/verify-email?email=${email}&token=${token}`),
  
  resendVerification: (email: string) =>
    api.post('/api/auth/resend-verification', { email }),
};

// Subjects
// export const subjectsApi = {
//   getAll: (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
//     api.get<ApiResponse<PagedResult<Subject>>>('/api/subjects', { params }),
  
//   getMy: (params?: { pageNumber?: number; pageSize?: number; onlyPublic?: boolean }) =>
//     api.get<ApiResponse<PagedResult<Subject>>>('/api/subjects/my', { params }),
  
//   getPublic: (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
//     api.get<ApiResponse<PagedResult<Subject>>>('/api/subjects/public', { params }),
  
//   getById: (id: string) =>
//     api.get<ApiResponse<Subject>>(`/api/subjects/${id}`),
  
//   create: (data: { name: string; description?: string; color?: string; icon?: string; isPublic?: boolean }) =>
//     api.post<ApiResponse<Subject>>('/api/subjects', data),
  
//   update: (id: string, data: { name: string; description?: string; color?: string; icon?: string; isPublic?: boolean }) =>
//     api.put<ApiResponse<Subject>>(`/api/subjects/${id}`, data),
  
//   delete: (id: string) => api.delete(`/api/subjects/${id}`),
  
//   getMembers: (id: string, params?: { pageNumber?: number; pageSize?: number }) =>
//     api.get<ApiResponse<PagedResult<SubjectMember>>>(`/api/subjects/${id}/members`, { params }),
  
//   updateMemberPermission: (subjectId: string, memberId: string, permission: string) =>
//     api.put(`/api/subjects/${subjectId}/members/${memberId}/permission`, { permission }),
  
//   removeMember: (subjectId: string, memberId: string) =>
//     api.delete(`/api/subjects/${subjectId}/members/${memberId}`),
// };

// Materials


// Invitations
// export const invitationsApi = {
//   getInfo: (token: string) =>
//     api.get<ApiResponse<InvitationInfo>>(`/api/invitations/info?token=${token}`),
  
//   invite: (subjectId: string, data: { email: string; permission: string }) =>
//     api.post(`/api/invitations/subjects/${subjectId}/invite`, data),
  
//   accept: (token: string) =>
//     api.post('/api/invitations/accept', { token }),
  
//   acceptWithRegistration: (token: string, password: string, fullName: string) =>
//     api.post('/api/invitations/accept-with-registration', { token, password, fullName }),
// };