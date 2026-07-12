export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export function parsePaginationParams(query: Record<string, unknown>): CursorPaginationParams {
  const limitRaw = query.limit ? Number(query.limit) : DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(limitRaw, 1), MAX_PAGE_SIZE);
  const cursor = typeof query.cursor === 'string' ? query.cursor : undefined;
  return { cursor, limit };
}

/**
 * Builds Prisma's cursor pagination args. We always fetch one extra row (limit + 1)
 * to cheaply determine `hasMore` without a separate COUNT query.
 */
export function buildCursorArgs(params: CursorPaginationParams) {
  return {
    take: params.limit! + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  };
}

export function toPaginatedResult<T extends { id: string }>(rows: T[], limit: number): PaginatedResult<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  return { items, nextCursor, hasMore };
}