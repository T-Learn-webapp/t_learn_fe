import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import { inviteApi } from '@/services/modules/invite';
import { subjectsApi } from '@/services/modules/subject';
import {
  InviteRequest,
  SubjectPermission,
  UpdateMemberPermissionRequest,
} from '@/types/Invite';

import { MemberDto } from '@/types/member';

const mapPermissionToString = (permission: SubjectPermission): string => {
  switch (permission) {
    case SubjectPermission.ViewOnly: return 'ViewOnly';
    case SubjectPermission.Comment: return 'Comment';
    case SubjectPermission.Edit: return 'Edit';
    case SubjectPermission.Manage: return 'Manage';
    default: return 'ViewOnly';
  }
};

// Helper function ngược lại: Chuyển đổi từ string của Backend về Enum Number để binding lên giao diện
export const mapStringToPermission = (permStr: string): SubjectPermission => {
  switch (permStr) {
    case 'ViewOnly': case '1': return SubjectPermission.ViewOnly;
    case 'Comment': case '2': return SubjectPermission.Comment;
    case 'Edit': case '3': return SubjectPermission.Edit;
    case 'Manage': case '4': return SubjectPermission.Manage;
    default: return SubjectPermission.ViewOnly;
  }
};

export const mapStringPermissionToVn = (permStr: string): string => {
  switch (permStr) {
    case 'ViewOnly': case '1': return "Chỉ xem";
    case 'Comment': case '2': return "Chỉ bình luận";
    case 'Edit': case '3': return "Chỉnh sửa";
    case 'Manage': case '4': return "Quản lý";
    default: return "Chủ sở hữu";
  }
};
export function useInvite(subjectId: string) {
  const [inviteLoading, setLoading] = useState(false);

  const [inviteData, setInviteData] = useState<InviteRequest>({
    email: '',
    permission: SubjectPermission.ViewOnly,
  });

  const [members, setMembers] = useState<MemberDto[]>([]);

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  });

  // Update field helper
  const updateInviteField = (
    field: keyof InviteRequest,
    value: any
  ) => {
    setInviteData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Invite member
  const inviteMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);

    try {
      const res = await inviteApi.inviteMember(
        subjectId,
        inviteData
      );

      if (res.data?.isSuccess) {
        toast.success("Gửi thành công");

        setInviteData({
          email: '',
          permission: SubjectPermission.ViewOnly,
        });

        return {
          success: true,
        };
      }

      toast.error('Không thể gửi lời mời');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Invite member error:', error);

      toast.error(
        error?.response?.data?.message ||
          'Có lỗi xảy ra khi gửi lời mời'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setLoading(false);
    }
  };

  // Get member list
  const getMembers = useCallback(
    async (
      pageNumber: number = 1,
      pageSize: number = 10
    ) => {
      setLoading(true);

      try {
        const res = await inviteApi.getListMember(
          subjectId,
          pageNumber,
          pageSize
        );

        if (
          res.data?.isSuccess &&
          res.data?.data
        ) {
          setMembers(res.data.data.items);
        
          setPagination({
            pageNumber: res.data.data.pageNumber,
            pageSize: res.data.data.pageSize,
            totalCount: res.data.data.totalCount,
          });

          return {
            success: true,
            data: res.data.data,
          };
        }

        return {
          success: false,
        };
      } catch (error) {
        console.error('Get members error:', error);

        toast.error('Không thể tải danh sách thành viên');

        return {
          success: false,
          error,
        };
      } finally {
        setLoading(false);
      }
    },
    [subjectId]
  );

  // Update permission
  const updatePermission = async (
    memberId: string,
    permission: SubjectPermission
  ) => {
    setLoading(true);

    try {
      const payload: UpdateMemberPermissionRequest = {
        permission,
      };

      const res =
        await inviteApi.updateMemberPermission(
          subjectId,
          memberId,
          payload
        );

      if (res.data?.message) {
        toast.success(res.data.message);

        await getMembers(
          pagination.pageNumber,
          pagination.pageSize
        );

        return {
          success: true,
        };
      }

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Update permission error:', error);

      toast.error(
        error?.response?.data?.message ||
          'Không thể cập nhật quyền'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setLoading(false);
    }
  };

  // Remove member
  const removeMember = async (memberId: string) => {
    if (!subjectId || !memberId) {
      toast.error('Không tìm thấy thành viên cần xóa');
      return {
        success: false,
      };
    }

    setLoading(true);

    try {
      const res = await subjectsApi.removeMember(subjectId, memberId);

      if (res.data?.isSuccess) {
        toast.success('Đã xóa thành viên khỏi chủ đề');

        setMembers((prev) =>
          prev.filter((member) => member.id !== memberId)
        );

        setPagination((prev) => ({
          ...prev,
          totalCount: Math.max(prev.totalCount - 1, 0),
        }));

        await getMembers(
          pagination.pageNumber,
          pagination.pageSize
        );

        return {
          success: true,
        };
      }

      toast.error(res.data?.error || 'Không thể xóa thành viên');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Remove member error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể xóa thành viên'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteLoading,

    inviteData,
    updateInviteField,
    inviteMember,

    members,
    pagination,
    getMembers,

    updatePermission,
    removeMember,
  };
}