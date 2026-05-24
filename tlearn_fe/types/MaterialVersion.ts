export interface MaterialContentVersionDto {
  id: string;
  materialId: string;
  versionNumber: number;
  title: string;
  summary?: string | null;
  editedByUserId: string;
  editedByUserName: string;
  createdAt: string;
  changeNote?: string | null;
}

export interface MaterialContentVersionDetailDto {
  id: string;
  materialId: string;
  versionNumber: number;
  title: string;
  content: string;
  summary?: string | null;
  yjsSnapshot?: string | null;
  editedByUserId: string;
  editedByUserName: string;
  createdAt: string;
  changeNote?: string | null;
}

export interface GetMaterialVersionsParams {
  pageNumber?: number;
  pageSize?: number;
}