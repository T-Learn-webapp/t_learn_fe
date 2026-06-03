'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Loader2,
  UserRound,
  Users,
} from 'lucide-react';

import { useMaterialVersions } from '@/hooks/useMaterialVersions';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type VersionContributor = {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userColor?: string;
};

const parseContributorsJson = (contributorsJson?: string | null) => {
  if (!contributorsJson) return [] as VersionContributor[];

  try {
    const parsed = JSON.parse(contributorsJson);

    if (!Array.isArray(parsed)) return [] as VersionContributor[];

    const uniqueMap = new Map<string, VersionContributor>();

    parsed.forEach((item) => {
      const contributor: VersionContributor = {
        userId: item?.userId || item?.UserId,
        userName: item?.userName || item?.UserName,
        userEmail: item?.userEmail || item?.UserEmail,
        userColor: item?.userColor || item?.UserColor,
      };

      const key =
        contributor.userId ||
        contributor.userEmail ||
        contributor.userName;

      if (!key) return;

      uniqueMap.set(String(key).toLowerCase(), contributor);
    });

    return Array.from(uniqueMap.values());
  } catch (error) {
    console.error('Parse contributors json error:', error);
    return [] as VersionContributor[];
  }
};

const getContributorFallback = (contributor: VersionContributor) => {
  return (
    contributor.userName?.slice(0, 2)?.toUpperCase() ||
    contributor.userEmail?.slice(0, 2)?.toUpperCase() ||
    contributor.userId?.slice(0, 2)?.toUpperCase() ||
    'U'
  );
};

export default function MaterialVersionDetailPage() {
  const params = useParams();
  const router = useRouter();

  const subjectId = params.id as string;
  const materialId = params.materialId as string;
  const versionId = params.versionId as string;

  const {
    versionDetail,
    versionDetailLoading,
    getVersionDetail,
  } = useMaterialVersions(materialId);

  useEffect(() => {
    getVersionDetail(versionId);
  }, [getVersionDetail, versionId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const contributors = useMemo(() => {
    return parseContributorsJson((versionDetail as any)?.contributorsJson);
  }, [versionDetail]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f3f4]">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push(
                  `/subjects/${subjectId}/materials/${materialId}/versions`
                )
              }
            >
              <ArrowLeft size={18} />
            </Button>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-900">
                Chi tiết phiên bản
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Xem lại nội dung tài liệu tại thời điểm đã lưu.
              </p>
            </div>
          </div>

          {versionDetail && (
            <Badge className="gap-1.5">
              <Clock3 size={13} />
              Version {versionDetail.versionNumber}
            </Badge>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {versionDetailLoading ? (
          <div className="flex h-80 items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải chi tiết phiên bản...
          </div>
        ) : !versionDetail ? (
          <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed bg-white text-slate-500">
            Không tìm thấy phiên bản
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600" />
                    <h2 className="truncate text-lg font-bold text-slate-900">
                      {versionDetail.title}
                    </h2>
                  </div>

                  {versionDetail.summary && (
                    <p className="mt-2 text-sm text-slate-500">
                      {versionDetail.summary}
                    </p>
                  )}
                </div>

                <Badge variant="secondary">
                  #{versionDetail.versionNumber}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <UserRound size={15} />
                  <span>
                    Người sửa: {versionDetail.editedByUserName || 'Không rõ'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={15} />
                  <span>{formatDate(versionDetail.createdAt)}</span>
                </div>
              </div>

              {versionDetail.changeNote && (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  {versionDetail.changeNote}
                </p>
              )}

              {contributors.length > 0 && (
                <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Users size={15} />
                    Thành viên cùng chỉnh sửa khi lưu phiên bản
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {contributors.map((contributor) => (
                      <div
                        key={
                          contributor.userId ||
                          contributor.userEmail ||
                          contributor.userName
                        }
                        className="flex min-w-0 items-center gap-3 rounded-lg border bg-white p-3"
                      >
                        <Avatar
                          className="h-9 w-9 shrink-0 border-2"
                          style={{
                            borderColor: contributor.userColor || '#64748b',
                          }}
                        >
                          <AvatarFallback
                            className="text-xs font-semibold text-white"
                            style={{
                              backgroundColor: contributor.userColor || '#64748b',
                            }}
                          >
                            {getContributorFallback(contributor)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {contributor.userName || 'Không rõ tên'}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {contributor.userEmail || contributor.userId || 'Không có email'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-sm border bg-white shadow-[0_1px_3px_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
              <div className="border-b px-5 py-3">
                <p className="text-sm font-semibold text-slate-700">
                  Nội dung tại phiên bản này
                </p>
              </div>

              <article
                className="prose prose-slate max-w-none px-8 py-8 text-sm leading-7"
                dangerouslySetInnerHTML={{
                  __html:
                    versionDetail.yjsSnapshot ||
                    versionDetail.content ||
                    '<p>Không có nội dung.</p>',
                }}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}