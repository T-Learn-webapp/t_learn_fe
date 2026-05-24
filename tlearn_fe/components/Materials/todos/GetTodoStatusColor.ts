import { Badge } from '@/components/ui/badge';
import { TodoStatus } from '@/types/TodoItemDto';


export const getStatusLabel = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.Completed:
        return 'Hoàn thành';
      case TodoStatus.InProgress:
        return 'Đang làm';
      case TodoStatus.Pending:
      default:
        return 'Chờ làm';
    }
  };

 export const getStatusBadgeVariant = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.Completed:
        return 'secondary';
      case TodoStatus.InProgress:
        return 'outline';
      case TodoStatus.Pending:
      default:
        return 'destructive';
    }
  };
  export const getStatusBadgeClassName = (status: TodoStatus) => {
      switch (status) {
        case TodoStatus.Completed:
          return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
  
        case TodoStatus.InProgress:
          return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100';
  
        case TodoStatus.Pending:
        default:
          return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100';
      }
    };