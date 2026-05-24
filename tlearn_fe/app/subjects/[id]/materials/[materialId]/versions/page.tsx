'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  FileClock,
  Loader2,
  UserRound,
} from 'lucide-react';

import { useMaterialVersions } from '@/hooks/useMaterialVersions';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function MaterialVersionsPage() {
  const params = useParams();
  const router = useRouter();

  const subjectId = params.id as string;
  const materialId = params.materialId as string;

  const {
    versions,
    versionsLoading,
    pagination,
    getVersions,
  } = useMaterialVersions(materialId);

  useEffect(() => {
    getVersions(1, 10);
  }, [getVersions]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push(`/subjects/${subjectId}/materials/${materialId}`)
              }
            >
              <ArrowLeft size={18} />
            </Button>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-900">
                Lịch sử phiên bản
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Xem các lần lưu nội dung của tài liệu học tập.
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="gap-1.5">
            <FileClock size={13} />
            {pagination.totalCount} phiên bản
          </Badge>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {versionsLoading ? (
          <div className="flex h-80 items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải lịch sử phiên bản...
          </div>
        ) : versions.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-white text-center text-slate-500">
            <FileClock className="mb-3 h-10 w-10" />
            <p className="font-medium">Chưa có phiên bản nào</p>
            <p className="mt-1 text-sm">
              Khi tài liệu được lưu, lịch sử phiên bản sẽ hiển thị ở đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="rounded-2xl border bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="gap-1">
                        <Clock3 size={12} />
                        Version {version.versionNumber}
                      </Badge>

                      <h2 className="truncate text-sm font-semibold text-slate-900">
                        {version.title}
                      </h2>
                    </div>

                    {version.summary && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {version.summary}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound size={13} />
                        {version.editedByUserName || 'Không rõ'}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {formatDate(version.createdAt)}
                      </span>
                    </div>

                    {version.changeNote && (
                      <>
                        <Separator className="my-3" />
                        <p className="text-xs text-slate-500">
                          {version.changeNote}
                        </p>
                      </>
                    )}
                  </div>

                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link
                      href={`/subjects/${subjectId}/materials/${materialId}/versions/${version.id}`}
                    >
                      <Eye size={14} />
                      Xem
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPreviousPage || versionsLoading}
              onClick={() =>
                getVersions(pagination.pageNumber - 1, pagination.pageSize)
              }
            >
              Trang trước
            </Button>

            <span className="text-sm text-slate-500">
              Trang {pagination.pageNumber}/{pagination.totalPages}
            </span>

            <Button
              variant="outline"
              disabled={!pagination.hasNextPage || versionsLoading}
              onClick={() =>
                getVersions(pagination.pageNumber + 1, pagination.pageSize)
              }
            >
              Trang sau
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}