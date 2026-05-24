import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { todosApi } from '@/services/modules/todo';

import {
  TodoItemDto,
  CreateTodoCommand,
  UpdateTodoCommand,
  UpdateTodoAssignmentStatusRequest,
  TodoStatus,
  TodoDetailDto,
} from '@/types/TodoItemDto';

type TodoFormData = {
  title: string;
  description?: string;
  dueDate?: string | null;
  assignedUserIds: string[];
};

export function useTodo(
  learningMaterialId: string,
  subjectId: string
) {
  const [todoLoading, setTodoLoading] = useState(false);
  const [todos, setTodos] = useState<TodoItemDto[]>([]);
  const [todoDetail, setTodoDetail] = useState<TodoDetailDto | null>(null);
  const [todoData, setTodoData] = useState<TodoFormData>({
    title: '',
    description: '',
    dueDate: null,
    assignedUserIds: [],
  });

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const updateTodoField = <K extends keyof TodoFormData>(
    field: K,
    value: TodoFormData[K]
  ) => {
    setTodoData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetTodoForm = () => {
    setTodoData({
      title: '',
      description: '',
      dueDate: null,
      assignedUserIds: [],
    });
  };

  const getTodos = useCallback(
    async (
      pageNumber: number = 1,
      pageSize: number = 10
    ) => {
      if (!learningMaterialId || !subjectId) {
        return {
          success: false,
        };
      }

      setTodoLoading(true);

      try {
        const res = await todosApi.getAll({
          learningMaterialId,
          subjectId,
          pageNumber,
          pageSize,
        });

        if (res.data?.isSuccess && res.data?.data) {
          const data = res.data.data;

          setTodos(data.items);

          setPagination({
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
            hasPreviousPage: data.hasPreviousPage,
            hasNextPage: data.hasNextPage,
          });

          return {
            success: true,
            data,
          };
        }

        toast.error(res.data?.error || 'Không thể tải danh sách công việc');

        return {
          success: false,
        };
      } catch (error: any) {
        console.error('Get todos error:', error);

        toast.error(
          error?.response?.data?.message ||
            'Có lỗi xảy ra khi tải danh sách công việc'
        );

        return {
          success: false,
          error,
        };
      } finally {
        setTodoLoading(false);
      }
    },
    [learningMaterialId, subjectId]
  );

  const getTodoDetail = async (todoId: string) => {

  if (!todoId) {

    toast.error('Không tìm thấy Todo');

    return {

      success: false,

    };

  }

  setTodoLoading(true);

  try {

    const res = await todosApi.getDetail(todoId);

    if (res.data?.isSuccess && res.data?.data) {

      console.log('Todo detail:', res.data.data);
      setTodoDetail(res.data.data);


      return {

        success: true,

        data: res.data.data,

      };

    }

    toast.error(res.data?.error || 'Không thể tải chi tiết Todo');

    return {

      success: false,

    };

  } catch (error: any) {

    console.error('Get todo detail error:', error);

    toast.error(

      error?.response?.data?.message ||

        'Có lỗi xảy ra khi tải chi tiết Todo'

    );

    return {

      success: false,

      error,

    };

  } finally {

    setTodoLoading(false);

  }

};
  
  const createTodo = async (
    customData?: Partial<TodoFormData>
  ) => {
    if (!learningMaterialId) {
      toast.error('Không tìm thấy tài liệu học tập');
      return {
        success: false,
      };
    }

    const finalData = {
      ...todoData,
      ...customData,
    };

    if (!finalData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề công việc');
      return {
        success: false,
      };
    }

    setTodoLoading(true);

    try {
      const payload: CreateTodoCommand = {
        learningMaterialId,
        title: finalData.title.trim(),
        description: finalData.description?.trim() || undefined,
        dueDate: finalData.dueDate || null,
        assignedUserIds: finalData.assignedUserIds || [],
      };

      const res = await todosApi.create(payload);

      if (res.data?.isSuccess) {
        toast.success('Đã tạo công việc mới');

        resetTodoForm();

        await getTodos(
          pagination.pageNumber,
          pagination.pageSize
        );

        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể tạo công việc');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Create todo error:', error);

      toast.error(
        error?.response?.data?.message ||
          'Có lỗi xảy ra khi tạo công việc'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setTodoLoading(false);
    }
  };

  const updateTodo = async (
    todoId: string,
    data: TodoFormData
  ) => {
    if (!todoId) {
      toast.error('Không tìm thấy công việc cần cập nhật');
      return {
        success: false,
      };
    }

    if (!data.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề công việc');
      return {
        success: false,
      };
    }

    setTodoLoading(true);

    try {
      const payload: UpdateTodoCommand = {
        todoId,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        dueDate: data.dueDate || null,
        assignedUserIds: data.assignedUserIds || [],
      };

      const res = await todosApi.update(todoId, payload);

      if (res.data?.isSuccess) {
        toast.success('Đã cập nhật công việc');

        await getTodos(
          pagination.pageNumber,
          pagination.pageSize
        );

        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể cập nhật công việc');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Update todo error:', error);

      toast.error(
        error?.response?.data?.message ||
          'Có lỗi xảy ra khi cập nhật công việc'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setTodoLoading(false);
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!todoId) {
      toast.error('Không tìm thấy công việc cần xóa');
      return {
        success: false,
      };
    }

    setTodoLoading(true);

    try {
      const res = await todosApi.delete(todoId);

      if (res.data?.isSuccess) {
        toast.success('Đã xóa công việc');

        await getTodos(
          pagination.pageNumber,
          pagination.pageSize
        );

        return {
          success: true,
        };
      }

      toast.error(res.data?.error || 'Không thể xóa công việc');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Delete todo error:', error);

      toast.error(
        error?.response?.data?.message ||
          'Có lỗi xảy ra khi xóa công việc'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setTodoLoading(false);
    }
  };

  const updateAssignmentStatus = async (
  todoId: string,
  assignedUserId: string,
  status: string
) => {
  if (!todoId || !assignedUserId) {
    toast.error('Thiếu thông tin Todo hoặc thành viên');
    return {
      success: false,
    };
  }

  setTodoLoading(true);

  try {
    const payload: UpdateTodoAssignmentStatusRequest = {
      assignedUserId,
      status: String(status),
    };

    const res = await todosApi.updateAssignmentStatus(todoId, payload);

    if (res.data?.isSuccess) {
      toast.success('Đã cập nhật trạng thái thành viên');

      await getTodoDetail(todoId);

      await getTodos(
        pagination.pageNumber,
        pagination.pageSize
      );

      return {
        success: true,
        data: res.data.data,
      };
    }

    toast.error(res.data?.error || 'Không thể cập nhật trạng thái');

    return {
      success: false,
    };
  } catch (error: any) {
    console.error('Update assignment status error:', error);

    toast.error(
      error?.response?.data?.message ||
        'Có lỗi xảy ra khi cập nhật trạng thái'
    );

    return {
      success: false,
      error,
    };
  } finally {
    setTodoLoading(false);
  }
};

  return {
    todoLoading,

    todos,
    pagination,
    getTodos,

    todoData,
    setTodoData,
    updateTodoField,
    resetTodoForm,

    createTodo,
    updateTodo,
    deleteTodo,
    updateAssignmentStatus,

    todoDetail,

      setTodoDetail,

      getTodoDetail,
  };
}