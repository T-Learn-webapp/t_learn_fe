export interface TodoItemDto {
  id: string;
  learningMaterialId: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  createdByUserId: string;
  assignedUsers: TodoAssignedUserDto[];
}

export interface TodoDetailDto {

  id: string;

  title: string;

  description?: string;

  status: TodoStatus;

  dueDate?: string | null;

  learningMaterialId: string;

  learningMaterialTitle: string;

  subjectId: string;

  subjectName: string;

  createdByUserId: string;

  createdByUserName: string;

  createdAt: string;

  updatedAt?: string | null;

  assignedUsers: TodoDetailAssignedUserDto[];

}

export interface TodoDetailAssignedUserDto {

  userId: string;

  userName: string;

  status: TodoStatus;

  assignedAt: string;

  completedAt?: string | null;

}

export interface TodoAssignedUserDto {
  userId: string;
  status: TodoStatus;
}

export enum TodoStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
}


export interface CreateTodoCommand {
  learningMaterialId: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  assignedUserIds: string[];
}

export interface AssignTodoMemberRequest {
  userIds: string[];
}

export interface UpdateTodoCommand {
  todoId: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  assignedUserIds: string[];
}

export interface UpdateTodoAssignmentStatusRequest {
  assignedUserId: string;
  status: string;
}