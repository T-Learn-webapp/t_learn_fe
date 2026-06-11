import { api } from '../api-client';
import { ApiResponse, User } from '@/types';

export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<ApiResponse<{ user: User }>>('/api/auth/register', data),
    
  getMe: () =>
    api.get<ApiResponse<User>>('/api/auth/me'),
    
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User }>('/api/auth/login', data),
  
  logout: () => 
    api.post('/api/auth/logout', {}),
  
  verifyEmail: (email: string, token: string) =>
    api.post(`/api/auth/verify-email`, null, { params: { email, token } }),
  
  resendVerification: (email: string) =>
    api.post('/api/auth/resend-verification', { email }),
};