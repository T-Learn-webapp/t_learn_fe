import { api } from '../api-client';

import {
  ApiResponse,
  PagedResult,
} from '@/types';

import {
  GetMaterialVersionsParams,
  MaterialContentVersionDetailDto,
  MaterialContentVersionDto,
} from '@/types/MaterialVersion';

export const materialVersionApi = {
  getList: (
    materialId: string,
    params?: GetMaterialVersionsParams
  ) =>
    api.get<ApiResponse<PagedResult<MaterialContentVersionDto>>>(
      `/api/materials/${materialId}/versions`,
      {
        params,
      }
    ),

  getDetail: (
    materialId: string,
    versionId: string
  ) =>
    api.get<ApiResponse<MaterialContentVersionDetailDto>>(
      `/api/materials/${materialId}/versions/${versionId}`
    ),
};