import { SubjectPermission } from "./Invite";

export interface User {
  id: string;
  fullName: string;
  email: string;
  subscriptionType: string;
  isEmailVerified: boolean;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;

  materialCount: number;

  createdAt: string;
}

export interface SubjectList {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;

  materialCount: number;
  createdAt: string;
  isOwner: boolean;
  isMember: boolean;
  myPermission: SubjectPermission;
  role: string;
  ownerName: string;
  ownerEmail: string;

}
export enum SubjectFilterType {

  All = 1,

  Owned = 2,

  Joined = 3,

}


export interface SubjectMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  permission: string;
  joinedAt: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  subjectId: string;
  subjectName: string;
  flashcardCount: number;
  createdAt: string;
  updatedAt?: string;
  isCollaborative: boolean;
}
export interface CreateLearningMaterialRequest {

  title: string;

  content: string;

  summary?: string;

  subjectId: string;

}

export interface InvitationInfo {
  token: string;
  subjectId: string;
  subjectName: string;
  email: string;
  permission: string;
  expiresAt?: string;
}

export interface CollaborationInfo {
  materialId: string;
  materialTitle: string;
  subjectId: string;
  hubUrl: string;
  hubToken: string;
  version: number;
  snapshot?: string;
  isCollaborative: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  error?: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface MessageResponse {

  message: string;

}