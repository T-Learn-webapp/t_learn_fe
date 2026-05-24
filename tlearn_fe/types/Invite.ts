export interface InviteRequest {
    email: string;
    permission: SubjectPermission; // nhưng khi gửi phải đổi qua string
  }
  
export enum SubjectPermission
{
    ViewOnly = 1,
    Comment = 2,
    Edit = 3,
    Manage = 4
}

export interface UpdateMemberPermissionRequest {
    permission: SubjectPermission
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface AcceptInvitationWithRegistrationRequest {
  token: string;
  password: string;
  fullName: string;
}



export interface InvitationPreviewDto {
  token: string;
  subjectId: string;
  subjectName: string;
  email: string;
  permission: string;
  expiresAt?: string | null;
}

export interface AcceptInvitationResult
{
    SubjectId  : string;
    SubjectName : string;
    IsNewUser : boolean;
    UserId : string;
    Email : string;
    FullName : string;
}