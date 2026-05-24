'use client';

import { useEffect } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useInvite } from '@/hooks/useInvite';
import { SubjectPermission } from '@/types/Invite';

type InviteMemberModalProps = {
  open: boolean;
  subjectId: string;
  onClose: () => void;
  onInvited?: () => void;
};

export function InviteMemberModal({
  open,
  subjectId,
  onClose,
  onInvited,
}: InviteMemberModalProps) {
  const {
    inviteLoading,
    inviteData,
    updateInviteField,
    inviteMember,
  } = useInvite(subjectId);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await inviteMember();

    if (result.success) {
      onInvited?.();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mời thành viên vào học</DialogTitle>

          <DialogDescription>
            Nhập email và chọn quyền truy cập cho thành viên mới.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email người nhận</Label>

            <Input
              id="invite-email"
              type="email"
              placeholder="example@email.com"
              value={inviteData.email}
              onChange={(event) =>
                updateInviteField('email', event.target.value)
              }
              disabled={inviteLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Vai trò phân quyền</Label>

            <Select
              value={String(inviteData.permission)}
              onValueChange={(value) =>
                updateInviteField(
                  'permission',
                  Number(value) as SubjectPermission
                )
              }
              disabled={inviteLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quyền" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={String(SubjectPermission.ViewOnly)}>
                  Chỉ xem
                </SelectItem>

                <SelectItem value={String(SubjectPermission.Comment)}>
                  Xem + bình luận
                </SelectItem>

                <SelectItem value={String(SubjectPermission.Edit)}>
                  Sửa nội dung
                </SelectItem>

                <SelectItem value={String(SubjectPermission.Manage)}>
                  Quản lý thành viên
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={inviteLoading}
            >
              Hủy
            </Button>

            <Button type="submit" disabled={inviteLoading}>
              {inviteLoading ? 'Đang gửi...' : 'Gửi lời mời'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}