'use client';

import { useCallback, useState } from 'react';

import { materialVersionApi } from '@/services/modules/materialVersion';
import {
  MaterialContentVersionDetailDto,
  MaterialContentVersionDto,
} from '@/types/MaterialVersion';

import { toast } from 'sonner';

export function useMaterialVersions(materialId?: string) {
  const [versions, setVersions] = useState<MaterialContentVersionDto[]>([]);
  const [versionDetail, setVersionDetail] =
    useState<MaterialContentVersionDetailDto | null>(null);

  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionDetailLoading, setVersionDetailLoading] = useState(false);

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const getVersions = useCallback(
    async (
      pageNumber: number = 1,
      pageSize: number = 10
    ) => {
      if (!materialId) {
        return {
          success: false,
        };
      }

      setVersionsLoading(true);

      try {
        const res = await materialVersionApi.getList(materialId, {
          pageNumber,
          pageSize,
        });

        if (res.data?.isSuccess && res.data?.data) {
          const data = res.data.data;

          setVersions(data.items || []);

          setPagination({
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
            hasPreviousPage: data.hasPreviousPage,
            hasNextPage: data.hasNextPage,
          });

          return {
            success: true,
            data,
          };
        }

        toast.error(res.data?.error || 'Không thể tải lịch sử phiên bản');

        return {
          success: false,
        };
      } catch (error: any) {
        console.error('Get material versions error:', error);

        toast.error(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            'Không thể tải lịch sử phiên bản'
        );

        return {
          success: false,
          error,
        };
      } finally {
        setVersionsLoading(false);
      }
    },
    [materialId]
  );

  const getVersionDetail = useCallback(
    async (versionId: string) => {
      if (!materialId || !versionId) {
        return {
          success: false,
        };
      }

      setVersionDetailLoading(true);

      try {
        const res = await materialVersionApi.getDetail(
          materialId,
          versionId
        );

        if (res.data?.isSuccess && res.data?.data) {
          setVersionDetail(res.data.data);

          return {
            success: true,
            data: res.data.data,
          };
        }

        toast.error(res.data?.error || 'Không thể tải chi tiết phiên bản');

        return {
          success: false,
        };
      } catch (error: any) {
        console.error('Get material version detail error:', error);

        toast.error(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            'Không thể tải chi tiết phiên bản'
        );

        return {
          success: false,
          error,
        };
      } finally {
        setVersionDetailLoading(false);
      }
    },
    [materialId]
  );

  const clearVersionDetail = () => {
    setVersionDetail(null);
  };

  return {
    versions,
    versionDetail,

    versionsLoading,
    versionDetailLoading,

    pagination,

    getVersions,
    getVersionDetail,
    clearVersionDetail,
  };
}