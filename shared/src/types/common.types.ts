export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  meta?: IPaginationMeta;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ISearchQuery extends IPaginationQuery {
  q: string;
}
