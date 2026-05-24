import { useCallback, useEffect, useState } from 'react';

import { materialsApi } from '@/services/modules/material';
import { LearningMaterial } from '@/types';
import { toast } from 'sonner';

export function useMaterial(materialId?: string) {
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [materialLoading, setMaterialLoading] = useState(false);

  const getMaterial = useCallback(async () => {
    if (!materialId) return;

    setMaterialLoading(true);

    try {
      const res = await materialsApi.getById(materialId);

      if (res.data?.isSuccess && res.data?.data) {
        setMaterial(res.data.data);

        console.log('Material data:', res.data.data);
        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể tải tài liệu');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Get material error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể tải tài liệu'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setMaterialLoading(false);
    }
  }, [materialId]);

  const updateMaterialInfo = async (data: {
    title: string;
    summary?: string;
  }) => {
    if (!materialId) {
      return {
        success: false,
      };
    }

    setMaterialLoading(true);

    try {
      const res = await materialsApi.updateInfo(materialId, data);

      if (res.data?.isSuccess && res.data?.data) {
        setMaterial(res.data.data);

        toast.success('Đã cập nhật thông tin tài liệu');

        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể cập nhật tài liệu');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Update material info error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể cập nhật tài liệu'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setMaterialLoading(false);
    }
  };

  const deleteMaterial = async () => {
    if (!materialId) {
      return {
        success: false,
      };
    }

    setMaterialLoading(true);

    try {
      const res = await materialsApi.delete(materialId);

      if (res.data?.isSuccess) {
        toast.success('Đã xoá tài liệu');

        return {
          success: true,
        };
      }

      toast.error(res.data?.error || 'Không thể xoá tài liệu');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Delete material error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể xoá tài liệu'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setMaterialLoading(false);
    }
  };

  useEffect(() => {
    getMaterial();
  }, [getMaterial]);

  return {
    material,
    setMaterial,
    materialLoading,
    getMaterial,
    updateMaterialInfo,
    deleteMaterial,
  };
}