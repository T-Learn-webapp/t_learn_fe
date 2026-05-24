'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberDto } from '@/types/member';

type TodoFormFieldsProps = {
  title: string;
  description: string;
  dueDate: string;
  assignedUserIds: string[];
  members: MemberDto[];
  disabled?: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onAssignedUserIdsChange: (value: string[]) => void;
};

export function TodoFormFields({
  title,
  description,
  dueDate,
  assignedUserIds,
  members,
  disabled = false,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onAssignedUserIdsChange,
}: TodoFormFieldsProps) {
  const memberOptions = members.map((member) => ({
    userId: member.userId,
    label: member.userName || member.userEmail,
    email: member.userEmail,
  }));

  const toggleAssignedUser = (userId: string) => {
    if (assignedUserIds.includes(userId)) {
      onAssignedUserIdsChange(
        assignedUserIds.filter((id) => id !== userId)
      );
      return;
    }

    onAssignedUserIdsChange([...assignedUserIds, userId]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tiêu đề</Label>
        <Input
          placeholder="Ví dụ: Ôn lại OOP"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>Mô tả</Label>
        <textarea
          placeholder="Mô tả công việc cần làm..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
          className="min-h-24 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label>Hạn hoàn thành</Label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>Giao cho thành viên</Label>

        <Select
          disabled={disabled}
          onValueChange={toggleAssignedUser}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn thành viên" />
          </SelectTrigger>

          <SelectContent>
            {memberOptions.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex min-h-10 flex-wrap gap-1.5 rounded-md border border-dashed p-2">
          {assignedUserIds.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa chọn thành viên nào.
            </p>
          ) : (
            assignedUserIds.map((userId) => {
              const member = memberOptions.find((x) => x.userId === userId);

              return (
                <Badge
                  key={userId}
                  variant="secondary"
                  className="cursor-pointer text-[10px]"
                  onClick={() => !disabled && toggleAssignedUser(userId)}
                >
                  {member?.label || userId} ×
                </Badge>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}