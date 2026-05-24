import {
  SubjectPermission,
  InviteRequest,
  UpdateMemberPermissionRequest,
  AcceptInvitationRequest,
  
  AcceptInvitationWithRegistrationRequest,
  AcceptInvitationResult,
} from "@/types/Invite";

import { MemberDto } from "@/types/member";

import { api } from "../api-client";
import {
  ApiResponse,
  MessageResponse,
  PagedResult,
} from "@/types";

export const mapPermissionToString = (
  permission: SubjectPermission
): string => {
  switch (permission) {
    case SubjectPermission.ViewOnly:
      return "ViewOnly";

    case SubjectPermission.Comment:
      return "Comment";

    case SubjectPermission.Edit:
      return "Edit";

    case SubjectPermission.Manage:
      return "Manage";

    default:
      return "ViewOnly";
  }
};

export const inviteApi = {
  inviteMember: (
    subjectId: string,
    data: InviteRequest
  ) =>
    api.post<ApiResponse<boolean>>(
      `/api/invitations/subjects/${subjectId}/invite`,
      {
        email: data.email,
        permission: mapPermissionToString(data.permission),
      }
    ),

  updateMemberPermission: (
    subjectId: string,
    memberId: string,
    data: UpdateMemberPermissionRequest
  ) =>
    api.put<MessageResponse>(
      `/api/subjects/${subjectId}/members/${memberId}/permission`,
      {
        permission: mapPermissionToString(data.permission),
      }
    ),

  getListMember: (
    id: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ) =>
    api.get<ApiResponse<PagedResult<MemberDto>>>(
      `/api/subjects/${id}/members`,
      {
        params: {
          pageNumber,
          pageSize,
        },
      }
    ),

  acceptInvitation: (data: AcceptInvitationRequest) =>

    api.post<ApiResponse<AcceptInvitationResult>>(

      '/api/invitations/accept',

      data

    ),

  acceptInvitationWithRegistration: (

    data: AcceptInvitationWithRegistrationRequest

  ) =>

    api.post<ApiResponse<AcceptInvitationResult>>(

      '/api/invitations/accept-with-registration',

      data

    ),
};