export interface PaginationMeta {
  total: number;
  perPage: number;
  page: number;
}

export interface PaginationLinks {
  thisPage: string;
  prevPage: string | null;
  nextPage: string | null;
  lastPage: string;
}

export interface ApiResponse<
  DataType,
  MetaType = undefined,
  LinksType = undefined,
> {
  success: boolean;
  data: DataType;
  message: string;
  meta?: MetaType;
  links?: LinksType;
}

type SuccessResponseOptions<DataType, MetaType, LinksType> = {
  data: DataType;
  message?: string;
  meta?: MetaType;
  links?: LinksType;
};

export function buildSuccessResponse<
  DataType,
  MetaType = undefined,
  LinksType = undefined,
>({
  data,
  message = 'Request successful',
  meta,
  links,
}: SuccessResponseOptions<DataType, MetaType, LinksType>): ApiResponse<
  DataType,
  MetaType,
  LinksType
> {
  return {
    success: true,
    data,
    message,
    ...(meta !== undefined ? { meta } : {}),
    ...(links !== undefined ? { links } : {}),
  };
}

export function buildErrorResponse(
  message: string,
): ApiResponse<null, undefined, undefined> {
  return {
    success: false,
    data: null,
    message,
  };
}
