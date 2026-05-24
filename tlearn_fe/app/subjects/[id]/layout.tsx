'use client';

import { useEffect, useState, startTransition } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  UserPlus,
  Trash2,
  Plus,
  Users,
  BookOpen,
  ClipboardList,
} from 'lucide-react';


import { TodoListModal } from '@/components/Materials/todos/TodoListModal';
import { InviteMemberModal } from '@/components/subjects/InviteMemberModal';
import { subjectsApi } from '@/services/modules/subject';
import { materialsApi } from '@/services/modules/material';
import { toast } from '@/lib/toast';
import { Subject, LearningMaterial } from '@/types';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { CreateMaterialModal } from '@/components/Materials/CreateMaterialModal';
import {
  useInvite,
  mapStringToPermission,
  mapStringPermissionToVn
} from '@/hooks/useInvite';

import { useTodoCounts } from '@/hooks/useTodoCount';
import { SubjectPermission } from '@/types/Invite';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';


import { useSubjectMemberRealtime } from '@/hooks/useSubjectMemberRealtime';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SubjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useAuthContext();


  const [subject, setSubject] = useState<Subject | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateMaterialModal, setShowCreateMaterialModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [memberRealtimeTick, setMemberRealtimeTick] = useState(0);

  const {
    members,
    getMembers,
    updatePermission,
    removeMember,
  } = useInvite(id as string);

  useEffect(() => {
    loadData();
    getMembers();
  }, [id, getMembers]);

  useEffect(() => {
    const handleMaterialUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<LearningMaterial>;
      const updatedMaterial = customEvent.detail;

      if (!updatedMaterial?.id) return;

      setMaterials((prev) =>
        prev.map((material) =>
          material.id === updatedMaterial.id
            ? {
              ...material,
              ...updatedMaterial,
            }
            : material
        )
      );
    };


    const handleMaterialDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      const deletedMaterialId = customEvent.detail?.id;

      if (!deletedMaterialId) return;

      setMaterials((prev) =>
        prev.filter((material) => material.id !== deletedMaterialId)
      );
    };

    window.addEventListener('material-updated', handleMaterialUpdated);
    window.addEventListener('material-deleted', handleMaterialDeleted);

    return () => {
      window.removeEventListener('material-updated', handleMaterialUpdated);
      window.removeEventListener('material-deleted', handleMaterialDeleted);
    };
  }, []);

  useSubjectMemberRealtime({
    enabled: !!subject?.id && !!user?.id,
    subjectId: subject?.id,
    onMemberJoined: () => {
      getMembers();
      loadData();
    },
  });
  const loadData = async () => {
    setLoading(true);

    try {
      const [subjectRes, materialsRes] = await Promise.all([
        subjectsApi.getById(id as string),
        materialsApi.getBySubject(id as string, {
          pageSize: 50,
        }),
      ]);

      if (subjectRes.data) {
        setSubject(subjectRes.data.data!);
      }

      if (materialsRes.data) {
        setMaterials(materialsRes.data.data?.items || []);
      }
    } catch (error) {
      toast.fromError(error, 'Không thể tải dữ liệu chủ đề');
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa chủ đề này?')) return;

    try {
      await subjectsApi.delete(id as string);
      toast.success('Đã xóa chủ đề');
      router.push('/subjects');
    } catch (error) {
      toast.fromError(error, 'Không thể xóa chủ đề');
    }
  };


  const isOwner = user?.id === subject?.ownerId;

  const currentMember = members.find(
    (member) => member.userId === user?.id
  );

  const currentPermission = currentMember
    ? mapStringToPermission(currentMember.permission)
    : null;

  const canManageTodo =
    isOwner || currentPermission === SubjectPermission.Manage;



  const {
    todoCounts,
    loadTodoCounts,
  } = useTodoCounts({
    subjectId: subject?.id,
    materials,
    currentUserId: user?.id,
    canManageTodo,
  });


  useEffect(() => {
    if (!subject?.id || materials.length === 0) return;

    loadTodoCounts();
  }, [subject?.id, materials.length, canManageTodo, user?.id, loadTodoCounts]);
  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-background">
        <div className="w-72 border-r bg-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Đang tải dữ liệu không gian học tập...
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Không tìm thấy chủ đề
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r bg-card shadow-sm transition-transform duration-300 ${isSidebarOpen
          ? 'translate-x-0'
          : '-translate-x-full'
          }`}
      >

        {/* Header */}
        <div className="p-4 space-y-4">
          <Link href="/subjects" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen size={18} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">TLearn</p>
              <p className="text-[11px] text-muted-foreground">
                Study together
              </p>
            </div>
          </Link>
          <Separator />
          <div className="flex items-center gap-3">


            <div className="min-w-0 flex-1">
              <h1
                className="truncate text-sm font-semibold"
                title={subject.name}
              >
                {subject.name}
              </h1>

              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {materials.length} bài học
                </Badge>


              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              className="gap-1.5"
            >
              <UserPlus size={14} />
              Mời
            </Button>

            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setShowCreateMaterialModal(true)}
            >
              <Plus size={14} />
              Thêm bài
            </Button>
          </div>
        </div>

        <Separator />

        {/* Members */}
        <div className="p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users size={14} />
            Thành viên
          </div>

          {members.length === 0 ? (
            <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
              Chưa có thành viên nào.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const currentPermission = mapStringToPermission(member.permission);

                const isSubjectOwner =
                  String(member.userId).toLowerCase() ===
                  String(subject?.ownerId).toLowerCase();

                const isCurrentUser =
                  String(member.userId).toLowerCase() ===
                  String(user?.id).toLowerCase();

                const canEditThisMemberPermission =
                  isOwner && !isSubjectOwner && !isCurrentUser;

                const canRemoveThisMember =
                  isOwner && !isSubjectOwner && !isCurrentUser;

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-lg border bg-background p-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {member.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-medium">
                          {member.userName}
                        </p>

                        {isCurrentUser && (
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            Bạn
                          </Badge>
                        )}
                      </div>

                      <p className="truncate text-[10px] text-muted-foreground">
                        {member.userEmail}
                      </p>
                    </div>

                    {isSubjectOwner ? (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        Chủ sở hữu
                      </Badge>
                    ) : canEditThisMemberPermission ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <Select
                          value={String(currentPermission)}
                          onValueChange={(value) =>
                            updatePermission(
                              member.id,
                              Number(value) as SubjectPermission
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[92px] text-xs">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value={String(SubjectPermission.ViewOnly)}>
                              Chỉ xem
                            </SelectItem>
                            <SelectItem value={String(SubjectPermission.Comment)}>
                              Bình luận
                            </SelectItem>
                            <SelectItem value={String(SubjectPermission.Edit)}>
                              Chỉnh sửa
                            </SelectItem>
                            <SelectItem value={String(SubjectPermission.Manage)}>
                              Quản lý
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {canRemoveThisMember && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Xóa thành viên"
                            onClick={async () => {
                              if (!confirm('Bạn có chắc muốn xóa thành viên này khỏi chủ đề?')) return;

                              await removeMember(member.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {mapStringPermissionToVn(member.permission)}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Materials */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <FileText size={14} />
            Tài liệu môn học
          </div>

          <ScrollArea className="flex-1 px-2 pb-3">
            {materials.length === 0 ? (
              <div className="mx-2 rounded-xl border border-dashed p-6 text-center">
                <BookOpen className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Chưa có bài học nào.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {materials.map((material) => {
                  const isActive = pathname.includes(
                    `/materials/${material.id}`
                  );

                  return (
                    <div
                      key={material.id}
                      className={`group flex items-stretch rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        }`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative mt-1 h-7 shrink-0 gap-1 rounded-full px-2 text-[11px]"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedMaterialId(material.id);
                          setShowTodoModal(true);
                        }}
                        title="TodoList"
                      >
                        <ClipboardList size={13} />
                        {(todoCounts[material.id] || 0) > 0 && (
                          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow">
                            {todoCounts[material.id]}
                          </span>
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          startTransition(() => {
                            router.push(
                              `/subjects/${subject.id}/materials/${material.id}`
                            );
                          });
                        }}
                        className="min-w-0 flex-1 px-3 py-2 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              📄 {material.title}
                            </span>

                            {material.isCollaborative && (
                              <span
                                className="h-2 w-2 shrink-0 rounded-full bg-green-500"
                                title="Real-time"
                              />
                            )}
                          </div>

                          {/* {material.summary && (
                            <p className="mt-0.5 truncate text-xs font-normal text-muted-foreground">
                              {material.summary}
                            </p>
                          )} */}
                        </div>
                      </button>


                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        {isOwner && (
          <>
            <Separator />

            <div className="p-3">
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                onClick={handleDelete}
              >
                <Trash2 size={14} />
                Xóa không gian này
              </Button>
            </div>
          </>
        )}
      </aside>

      {/* Toggle sidebar */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 z-50 h-9 w-9 rounded-full bg-background shadow-md transition-all duration-300"
        style={{
          left: isSidebarOpen ? '270px' : '12px',
        }}
      >
        {isSidebarOpen ? (
          <ChevronLeft size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </Button>

      {/* Main content */}
      <main
        className={`flex min-h-screen min-w-0 flex-col bg-background transition-[margin] duration-300 ${isSidebarOpen
          ? 'md:ml-72'
          : 'md:ml-0'
          }`}
      >
        {children}
      </main>


      <CreateMaterialModal
        open={showCreateMaterialModal}
        subjectId={subject.id}
        onClose={() => setShowCreateMaterialModal(false)}
        onCreated={() => {
          setShowCreateMaterialModal(false);
          loadData();
        }}
      />
      <TodoListModal
        open={showTodoModal}
        subjectId={subject.id}
        learningMaterialId={selectedMaterialId}
        members={members}
        currentUserId={user?.id}
        canManageTodo={canManageTodo}
        onChanged={loadTodoCounts}
        onClose={() => {
          setShowTodoModal(false);
          setSelectedMaterialId('');
        }}
      />

      <InviteMemberModal
        open={showInviteModal}
        subjectId={subject.id}
        onClose={() => setShowInviteModal(false)}
        onInvited={() => {
          loadData();
          getMembers();
        }}
      />

    </div>
  );
}