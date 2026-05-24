'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Cloud,
  History,
  Loader2,
  Pencil,
  Save,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useCollaboration } from '@/hooks/useCollaboration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { toast } from 'sonner';
import { useMaterial } from '@/hooks/useMaterial';
import { subjectsApi } from '@/services/modules/subject';
import { mapStringToPermission } from '@/hooks/useInvite';
import { SubjectPermission } from '@/types/Invite';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then((mod) => mod.CKEditor),
  { ssr: false }
);

export default function MaterialEditorPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;
  const materialId = params.materialId as string;
  const { user } = useAuthContext();

  const {
    material,
    materialLoading,
    updateMaterialInfo,
    deleteMaterial,
  } = useMaterial(materialId);

  const [subjectOwnerId, setSubjectOwnerId] = useState<string | null>(null);
  const [currentPermission, setCurrentPermission] =
    useState<SubjectPermission | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(true);

  const {
    content,
    isConnected,
    activeUsers,
    updateContent,
    saveSnapshot,
  } = useCollaboration(materialId, user?.id || '');



  const [editor, setEditor] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const isRemoteUpdatingRef = useRef(false);

  const [showUpdateInfoModal, setShowUpdateInfoModal] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialSummary, setMaterialSummary] = useState('');
  const [materialActionLoading, setMaterialActionLoading] = useState(false);

  const isOwner =
    !!user?.id &&
    !!subjectOwnerId &&
    String(user.id).toLowerCase() === String(subjectOwnerId).toLowerCase();

  const isManager = currentPermission === SubjectPermission.Manage;
  const isEditor = currentPermission === SubjectPermission.Edit;

  const canManageMaterial = isOwner || isManager;
  const canEditContent = canManageMaterial || isEditor;


  const handleUpdateMaterialInfo = async () => {
    if (!canManageMaterial) {
      toast.error('Bạn không có quyền cập nhật thông tin tài liệu');
      return;
    }

    if (!materialTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề tài liệu');
      return;
    }

    setMaterialActionLoading(true);

    try {
      const result = await updateMaterialInfo({
        title: materialTitle.trim(),
        summary: materialSummary.trim() || undefined,
      });

      if (result.success) {
        const updatedMaterial = result.data;

        if (updatedMaterial) {
          window.dispatchEvent(
            new CustomEvent('material-updated', {
              detail: updatedMaterial,
            })
          );
        }

        setShowUpdateInfoModal(false);
        router.refresh();
      }
    } finally {
      setMaterialActionLoading(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!canManageMaterial) {
      toast.error('Bạn không có quyền xoá tài liệu');
      return;
    }

    if (!confirm('Bạn có chắc muốn xoá tài liệu này?')) return;

    setMaterialActionLoading(true);

    try {
      const result = await deleteMaterial();

      if (result.success) {
        window.dispatchEvent(
          new CustomEvent('material-deleted', {
            detail: {
              id: materialId,
            },
          })
        );

        router.push(`/subjects/${subjectId}`);
        router.refresh();
      }
    } finally {
      setMaterialActionLoading(false);
    }
  };

  const displayActiveUsers = useMemo(() => {
    const normalizedUsers = activeUsers.length > 0
      ? activeUsers
      : user?.id
        ? [
          {
            userId: user.id,
            connectionId: 'local-user',
          },
        ]
        : [];


    return normalizedUsers.slice(0, 5).map((activeUser) => {
      const isMe = activeUser.userId === user?.id;

      return {
        ...activeUser,
        fallback: isMe
          ? 'ME'
          : activeUser.userName?.slice(0, 2)?.toUpperCase() || 'U',
        displayName: isMe ? 'Bạn' : activeUser.userName,
      };
    });
  }, [activeUsers, user?.id]);

  const activeUserCount = Math.max(activeUsers.length, user?.id ? 1 : 0);


  useEffect(() => {
    if (!material) return;

    setMaterialTitle(material.title || '');
    setMaterialSummary(material.summary || '');
  }, [material]);

  useEffect(() => {
    if (!subjectId || !user?.id) return;

    let cancelled = false;

    const loadPermission = async () => {
      setPermissionLoading(true);

      try {
        const [subjectRes, membersRes] = await Promise.all([
          subjectsApi.getById(subjectId),
          subjectsApi.getMembers(subjectId, {
            pageNumber: 1,
            pageSize: 100,
          }),
        ]);

        if (cancelled) return;

        const ownerId = subjectRes.data?.data?.ownerId || null;
        setSubjectOwnerId(ownerId);

        const currentMember = membersRes.data?.data?.items?.find(
          (member) =>
            String(member.userId).toLowerCase() ===
            String(user.id).toLowerCase()
        );

        setCurrentPermission(
          currentMember ? mapStringToPermission(currentMember.permission) : null
        );
      } catch (error) {
        console.error('Load material permission error:', error);
        setCurrentPermission(null);
      } finally {
        if (!cancelled) {
          setPermissionLoading(false);
        }
      }
    };

    loadPermission();

    return () => {
      cancelled = true;
    };
  }, [subjectId, user?.id]);

  useEffect(() => {
    import('@ckeditor/ckeditor5-build-classic').then((mod) => {
      setEditor(() => mod.default);
    });
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const currentData = editorRef.current.getData();
    if (currentData === content) return;

    isRemoteUpdatingRef.current = true;
    editorRef.current.setData(content);

    setTimeout(() => {
      isRemoteUpdatingRef.current = false;
    }, 0);
  }, [content]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (canEditContent) {
      editorRef.current.disableReadOnlyMode?.('permission-lock');
      return;
    }

    editorRef.current.enableReadOnlyMode?.('permission-lock');
  }, [canEditContent, editor]);

  if (!editor) {
    return (
      <div className="flex h-full flex-1 flex-col overflow-hidden bg-muted/40">
        <div className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        <div className="flex flex-1 items-start justify-center overflow-hidden bg-[#f1f3f4] p-8 md:p-12">
          <Skeleton className="h-[760px] w-full max-w-4xl rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-1 flex-col overflow-hidden bg-muted/40">
        <header className="z-30 shrink-0 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground md:text-base">
                    {materialLoading ? 'Đang tải tài liệu...' : material?.title || 'Tài liệu học tập'}
                  </h1>

                  {/* <span
                    className="hidden items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline-flex"
                    title={isConnected ? 'Đang online' : 'Mất kết nối'}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    />
                    {isConnected ? 'Online' : 'Disconnected'}
                  </span> */}
                </div>

                <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                  {permissionLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span className="truncate">Đang kiểm tra quyền truy cập...</span>
                    </>
                  ) : !canEditContent ? (
                    <span className="truncate">Chế độ chỉ xem · Bạn không thể chỉnh sửa nội dung</span>
                  ) : isEditor && !canManageMaterial ? (
                    <span className="truncate">Quyền chỉnh sửa · Chỉ được sửa nội dung tài liệu</span>
                  ) : isConnected ? (
                    <>
                     
                      <span
                        className="hidden items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline-flex"
                        title='Đang online' 
                      >
                        <span
                          className={`h-2 w-2 rounded-full  bg-green-500`}
                        />
                        Online
                      </span>
                    </>
                  ) : (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                       <span
                        className="hidden items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline-flex"
                        title='Mất kết nối'
                      >
                        <span
                          className={`h-2 w-2 rounded-full  bg-red-500`}
                        />
                        Disconnected
                      </span>
                      <span className="truncate">Đang kết nối lại, vẫn có thể tiếp tục soạn thảo</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 items-center justify-between gap-3 md:w-auto md:justify-end">
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex -space-x-2">
                  {displayActiveUsers.map((activeUser) => (
                    <Tooltip key={activeUser.connectionId}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-[10px]">
                            {activeUser.fallback}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>{activeUser.userEmail}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                <Badge variant="outline" className="gap-1 text-xs">
                  <Users size={13} />
                  {activeUserCount} đang chỉnh sửa
                </Badge>
              </div>

              <Separator orientation="vertical" className="hidden h-8 md:block" />

              <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 md:w-auto md:overflow-visible md:pb-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/subjects/${subjectId}/materials/${materialId}/versions`)
                  }
                  className="shrink-0 gap-2"
                >
                  <History size={15} />
                  <span className="hidden sm:inline">Lịch sử</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpdateInfoModal(true)}
                  disabled={materialActionLoading || materialLoading || !canManageMaterial}
                  className="shrink-0 gap-2"
                >
                  <Pencil size={15} />
                  <span className="hidden sm:inline">Đổi tiêu đề</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteMaterial}
                  disabled={materialActionLoading || materialLoading || !canManageMaterial}
                  className="shrink-0 gap-2"
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">Xoá</span>
                </Button>
                <Button
                  size="sm"
                  onClick={saveSnapshot}
                  disabled={!isConnected || !canEditContent}
                  className="shrink-0 gap-2"
                >
                  <Save size={15} />
                  <span className="hidden sm:inline">Lưu phiên bản</span>
                  <span className="sm:hidden">Lưu</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="custom-editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f1f3f4] px-4 py-6 md:px-10 md:py-8">
          <div className="mx-auto w-full max-w-[920px]">
            <div className="mb-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
              <span>Chế độ soạn thảo</span>
              <span className="md:hidden">
                {activeUserCount} người đang chỉnh sửa
              </span>
            </div>

            <div className="docs-page-editor min-h-[1050px] rounded-sm border bg-white shadow-[0_1px_3px_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
              <CKEditor
                editor={editor}
                data=""
                onReady={(editorInstance) => {
                  editorRef.current = editorInstance;
                  editorInstance.setData(content);

                  if (!canEditContent) {
                    editorInstance.enableReadOnlyMode?.('permission-lock');
                  }
                }}
                onChange={(_, editorInstance) => {
                  if (isRemoteUpdatingRef.current || !canEditContent) return;

                  const data = editorInstance.getData();
                  updateContent(data);
                }}
              />
            </div>
          </div>
        </main>

        <Dialog open={showUpdateInfoModal} onOpenChange={setShowUpdateInfoModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cập nhật thông tin tài liệu</DialogTitle>
              <DialogDescription>
                Đổi tiêu đề và tóm tắt ngắn cho tài liệu học tập hiện tại.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="material-title">Tiêu đề</Label>
                <Input
                  id="material-title"
                  value={materialTitle}
                  onChange={(event) => setMaterialTitle(event.target.value)}
                  placeholder="Ví dụ: Tài liệu học ASP.NET Core"
                  disabled={materialActionLoading || !canManageMaterial}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-summary">Tóm tắt</Label>
                <Input
                  id="material-summary"
                  value={materialSummary}
                  onChange={(event) => setMaterialSummary(event.target.value)}
                  placeholder="Tóm tắt ngắn nội dung tài liệu"
                  disabled={materialActionLoading || !canManageMaterial}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowUpdateInfoModal(false)}
                disabled={materialActionLoading}
              >
                Hủy
              </Button>

              <Button
                onClick={handleUpdateMaterialInfo}
                disabled={materialActionLoading || !canManageMaterial}
              >
                {materialActionLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );


}