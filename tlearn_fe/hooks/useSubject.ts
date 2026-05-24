'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { subjectsApi } from '@/services/modules/subject';
import { Subject, SubjectList, SubjectFilterType } from '@/types';
import { toast } from 'sonner';

export interface SubjectFormData {
  name: string;
  description: string;
}

type UseSubjectOptions = {
  autoLoad?: boolean;
  pageSize?: number;
};

export function useSubject(options: UseSubjectOptions = {}) {
  const {
    autoLoad = false,
    pageSize = 50,
  } = options;

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const [subjects, setSubjects] = useState<SubjectList[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [filter, setFilter] = useState<SubjectFilterType>(
    SubjectFilterType.All
  );

  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    description: ''

  });

  const updateField = <K extends keyof SubjectFormData>(
    field: K,
    value: SubjectFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''

    });
  };

  const fillFormFromSubject = (data: Subject) => {
    setFormData({
      name: data.name || '',
      description: data.description || ''
    });
  };


  const changeFilter = async (nextFilter: SubjectFilterType) => {

    setFilter(nextFilter);

    await loadSubjects(searchTerm, nextFilter);

  };

  const loadSubjects = useCallback(
    async (
      customSearchTerm?: string,
      customFilter?: SubjectFilterType
    ) => {
      setSubjectsLoading(true);

      try {
        const res = await subjectsApi.getAll({
          searchTerm: customSearchTerm ?? searchTerm,
          filter: customFilter ?? filter,
          pageSize,
        });

        if (res.data?.isSuccess) {
          const items = res.data?.data?.items || [];

          setSubjects(Array.isArray(items) ? items : []);

          return {
            success: true,
            data: items,
          };
        }

        toast.error(res.data?.error || 'Không thể tải danh sách chủ đề');
        setSubjects([]);

        return {
          success: false,
        };
      } catch (error) {
        console.error('Load subjects error:', error);

        toast.error('Không thể tải danh sách chủ đề');
        setSubjects([]);

        return {
          success: false,
          error,
        };
      } finally {
        setSubjectsLoading(false);
      }
    },
    [searchTerm, filter, pageSize]
  );

  const getSubjectById = useCallback(async (subjectId: string) => {
    if (!subjectId) {
      return {
        success: false,
      };
    }

    setSubjectLoading(true);

    try {
      const res = await subjectsApi.getById(subjectId);

      if (res.data?.isSuccess && res.data?.data) {
        setSubject(res.data.data);
        fillFormFromSubject(res.data.data);

        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể tải thông tin chủ đề');

      return {
        success: false,
      };
    } catch (error) {
      console.error('Get subject by id error:', error);

      toast.error('Không thể tải thông tin chủ đề');

      return {
        success: false,
        error,
      };
    } finally {
      setSubjectLoading(false);
    }
  }, []);

  const createSubject = async (
    e?: React.FormEvent,
    options?: {
      redirect?: boolean;
      onSuccess?: () => void;
    }
  ) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chủ đề');
      return {
        success: false,
      };
    }

    setLoading(true);

    try {
      const res = await subjectsApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      });

      if (res.data?.isSuccess && res.data?.data) {
        toast.success('Đã tạo chủ đề mới thành công!');

        resetForm();

        options?.onSuccess?.();

        if (options?.redirect !== false) {
          router.push(`/subjects/${res.data.data.id}`);
        }

        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể tạo chủ đề');

      return {
        success: false,
      };
    } catch (error) {
      console.error('Lỗi khi tạo chủ đề trong hook:', error);

      toast.error('Không thể tạo chủ đề');

      return {
        success: false,
        error,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async (

    subjectId: string,
    options?: {
      redirect?: boolean;
      onSuccess?: () => void;
    }

  ) => {

    if (!subjectId) {

      toast.error('Không tìm thấy chủ đề');

      return {

        success: false,

      };

    }

    if (!formData.name.trim()) {

      toast.error('Vui lòng nhập tên chủ đề');

      return {

        success: false,

      };

    }

    setLoading(true);

    try {

      const res = await subjectsApi.update(subjectId, {

        name: formData.name.trim(),

        description: formData.description.trim() || undefined


      });

      if (res.data?.isSuccess && res.data?.data) {

        toast.success('Đã cập nhật chủ đề');

        setSubject?.(res.data.data);

        setSubjects?.((prev) =>

          prev.map((item) =>

            item.id === subjectId

              ? {

                ...item,

                ...res.data.data,

              }

              : item

          )

        );

        options?.onSuccess?.();

        if (options?.redirect) {

          router.push(`/subjects/${subjectId}`);

        }

        return {

          success: true,

          data: res.data.data,

        };

      }

      toast.error(res.data?.error || 'Không thể cập nhật chủ đề');

      return {

        success: false,

      };

    } catch (error) {

      console.error('Update subject error:', error);

      toast.error('Không thể cập nhật chủ đề');

      return {

        success: false,

        error,

      };

    } finally {

      setLoading(false);

    }

  };

  const deleteSubject = async (

  subjectId: string,

  options?: {

    redirect?: boolean;

    onSuccess?: () => void;

  }

) => {

  if (!subjectId) {

    toast.error('Không tìm thấy chủ đề');

    return {

      success: false,

    };

  }

  setLoading(true);

  try {

    const res = await subjectsApi.delete(subjectId);

    if (res.data?.isSuccess) {

      toast.success('Đã xóa chủ đề');

      setSubjects?.((prev) =>

        prev.filter((item) => item.id !== subjectId)

      );

      options?.onSuccess?.();

      if (options?.redirect) {

        router.push('/subjects');

      }

      return {

        success: true,

      };

    }

    toast.error(res.data?.error || 'Không thể xóa chủ đề');

    return {

      success: false,

    };

  } catch (error) {

    console.error('Delete subject error:', error);

    toast.error('Không thể xóa chủ đề');

    return {

      success: false,

      error,

    };

  } finally {

    setLoading(false);

  }

};

  const searchSubjects = async () => {
    return loadSubjects(searchTerm);
  };

  useEffect(() => {
    if (!autoLoad) return;

    loadSubjects();
  }, [autoLoad, loadSubjects]);

  return {
    // state form
    formData,
    setFormData,
    updateField,
    resetForm,
    fillFormFromSubject,

    // list
    subjects,
    setSubjects,
    subjectsLoading,
    searchTerm,
    setSearchTerm,
    loadSubjects,
    searchSubjects,
    filter,
    setFilter,
    changeFilter,


    // detail
    subject,
    setSubject,
    subjectLoading,
    getSubjectById,

    // actions
    loading,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}