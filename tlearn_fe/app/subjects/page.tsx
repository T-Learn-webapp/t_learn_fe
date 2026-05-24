'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  BookOpen,
  CalendarDays,
  Crown,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';


import { useAuthContext } from '@/components/providers/AuthProvider';
import { useSubject } from '@/hooks/useSubject';
import { SubjectList, SubjectFilterType } from '@/types';
import { SubjectPermission } from '@/types/Invite';
import { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { SubjectFormModal } from '@/components/subjects/SubjectFormModal';
import { Button } from '@/components/ui/button';

const getPermissionLabel = (permission?: SubjectPermission) => {
  switch (permission) {
    case SubjectPermission.ViewOnly:
      return 'Chỉ xem';
    case SubjectPermission.Comment:
      return 'Bình luận';
    case SubjectPermission.Edit:
      return 'Chỉnh sửa';
    case SubjectPermission.Manage:
      return 'Quản lý';
    default:
      return 'Không rõ';
  }
};

const getRoleLabel = (subject: SubjectList) => {
  if (subject.isOwner) return 'Chủ sở hữu';
  if (subject.isMember) return subject.role || 'Thành viên';
  return subject.role || 'Người xem';
};

const getRoleBadgeClass = (subject: SubjectList) => {
  if (subject.isOwner) {
    return 'border-indigo-200 bg-indigo-50 text-indigo-700';
  }

  if (subject.isMember) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  return 'border-gray-200 bg-gray-50 text-gray-600';
};

const getRoleIcon = (subject: SubjectList) => {
  if (subject.isOwner) return <Crown size={13} />;
  if (subject.isMember) return <Users size={13} />;
  return <UserRound size={13} />;
};

export default function SubjectsPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const searchParams = useSearchParams();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectList | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const openCreateModal = () => {

    router.push('/subjects?create=1');

  };

  const closeCreateModal = () => {

    router.push('/subjects');
  };
  const {
    subjects,
    subjectsLoading,
    searchTerm,
    setSearchTerm,
    filter,
    changeFilter,
    loadSubjects,
    deleteSubject,
  } = useSubject({
    autoLoad: !!user && !authLoading,
    pageSize: 50,
  });

  //helper filterOptions:
  const filterOptions = [
    {
      label: 'Tất cả',
      value: SubjectFilterType.All,
    },
    {
      label: 'Của tôi',
      value: SubjectFilterType.Owned,
    },
    {
      label: 'Được tham gia',
      value: SubjectFilterType.Joined,
    },
  ];

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="text-sm text-slate-500">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <p className="mb-2 font-medium text-red-500">
          Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.
        </p>

        <button
          onClick={() => {
            window.location.href = '/login';
          }}
          className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow hover:bg-indigo-700"
        >
          Chuyển đến trang Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Chủ đề học tập
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý các không gian học tập, tài liệu và công việc nhóm của bạn.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus size={16} />
              Tạo chủ đề
            </button>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loadSubjects();
                }
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => changeFilter(option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filter === option.value
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {subjectsLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 h-5 w-2/3 rounded bg-slate-200" />
                <div className="mb-3 h-4 w-full rounded bg-slate-100" />
                <div className="mb-8 h-4 w-4/5 rounded bg-slate-100" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <BookOpen size={30} />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Chưa có chủ đề nào
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Tạo không gian học đầu tiên để bắt đầu thêm tài liệu, mời thành viên
              và quản lý TodoList học tập.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="text-indigo-600 hover:underline"
            >
              Tạo chủ đề đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >
                {subject.isOwner && (
                  <div className="absolute right-3 top-3 z-10 flex gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setEditingSubject(subject);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="Sửa chủ đề"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={async (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (!confirm('Bạn có chắc muốn xóa chủ đề này?')) return;

                        setDeletingSubjectId(subject.id);

                        const result = await deleteSubject(subject.id);

                        setDeletingSubjectId(null);

                        if (result.success) {
                          loadSubjects();
                        }
                      }}
                      disabled={deletingSubjectId === subject.id}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Xóa chủ đề"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}

                <Link
                  href={`/subjects/${subject.id}`}
                  className="block h-full p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-3 pr-16">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-slate-900 transition group-hover:text-indigo-700">
                        {subject.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <UserRound size={13} />
                        <span className="truncate">
                          {subject.ownerName || 'Không rõ người tạo'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getRoleBadgeClass(
                        subject
                      )}`}
                    >
                      {getRoleIcon(subject)}
                      {getRoleLabel(subject)}
                    </span>
                  </div>

                  {subject.description ? (
                    <p className="mb-5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                      {subject.description}
                    </p>
                  ) : (
                    <p className="mb-5 min-h-10 text-sm italic text-slate-400">
                      Chưa có mô tả cho không gian học này.
                    </p>
                  )}

                  <div className="mt-auto space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="mb-2 flex items-center gap-1.5 text-slate-400">
                          <BookOpen size={13} />
                          <span>Bài học</span>
                        </div>

                        <p className="text-base font-bold text-slate-800">
                          {subject.materialCount || 0}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="mb-2 flex items-center gap-1.5 text-slate-400">
                          <ShieldCheck size={13} />
                          <span>Quyền</span>
                        </div>

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {subject.isOwner
                            ? 'Toàn quyền'
                            : getPermissionLabel(subject.myPermission)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex flex-col gap-2 text-xs text-slate-500">
                        <div className="flex min-w-0 items-center gap-2">
                          <Mail size={13} className="shrink-0" />
                          <span className="truncate">
                            {subject.ownerEmail || 'Không có email'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarDays size={13} className="shrink-0" />
                          <span>
                            Tạo ngày{' '}
                            {new Date(subject.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <SubjectFormModal
        open={showCreateModal}
        mode="create"
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadSubjects();
        }}

      />

      <SubjectFormModal
        open={!!editingSubject}
        mode="edit"
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSuccess={() => {
          setEditingSubject(null);
          loadSubjects();

        }}

      />
    </div>
  );
}