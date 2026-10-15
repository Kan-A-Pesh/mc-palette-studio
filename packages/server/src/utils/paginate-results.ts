interface PaginateResultsParams<T> {
  data: T[];
  total: number;
  input: {
    page: number;
    limit: number;
  };
}

export function paginateResults<T>({
  data,
  total,
  input,
}: PaginateResultsParams<T>) {
  return {
    data: data,
    pagination: {
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
      hasNextPage: input.page < Math.ceil(total / input.limit),
      hasPreviousPage: input.page > 1,
    },
  };
}
