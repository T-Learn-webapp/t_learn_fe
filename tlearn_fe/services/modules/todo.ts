import { api } from '../api-client';

import {
  ApiResponse,
  PagedResult,
} from '@/types';

import {
  TodoItemDto,
  CreateTodoCommand,
  UpdateTodoCommand,
  AssignTodoMemberRequest,
  UpdateTodoAssignmentStatusRequest,
  TodoDetailDto,
} from '@/types/TodoItemDto';

export const todosApi = {
  getAll: (params: {
    learningMaterialId: string;
    subjectId: string;
    pageNumber?: number;
    pageSize?: number;
  }) =>
    api.get<ApiResponse<PagedResult<TodoItemDto>>>('/api/todos', {
      params,
    }),

getDetail: (todoId: string) =>

    api.get<ApiResponse<TodoDetailDto>>(`/api/todos/${todoId}`),
  getByMaterial: (
    learningMaterialId: string,
    subjectId: string,
    params?: {
      pageNumber?: number;
      pageSize?: number;
    }
  ) =>
    api.get<ApiResponse<PagedResult<TodoItemDto>>>('/api/todos', {
      params: {
        learningMaterialId,
        subjectId,
        ...params,
      },
    }),

  create: (data: CreateTodoCommand) =>
    api.post<ApiResponse<TodoItemDto>>('/api/todos', data),

  update: (todoId: string, data: UpdateTodoCommand) =>
    api.put<ApiResponse<TodoItemDto>>(`/api/todos/${todoId}`, {
      ...data,
      todoId,
    }),

  delete: (todoId: string) =>
    api.delete<ApiResponse<string>>(`/api/todos/${todoId}`),

  assignMembers: (
    todoId: string,
    data: AssignTodoMemberRequest
  ) =>
    api.post<ApiResponse<TodoItemDto>>(
      `/api/todos/${todoId}/assign`,
      data
    ),

  updateAssignmentStatus: (
    todoId: string,
    data: UpdateTodoAssignmentStatusRequest
  ) =>
    api.put<ApiResponse<TodoItemDto>>(
      `/api/todos/${todoId}/assignment-status`,
      data
    ),
};