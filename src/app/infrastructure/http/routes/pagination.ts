import type { ParsedQs } from 'qs';
import type {
  PaginationLinks,
  PaginationMeta,
} from '../responses/ApiResponse.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;

function getQueryValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }

  return undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function buildBaseSearchParams(query: ParsedQs): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (key === 'page' || key === 'per_page') {
      continue;
    }

    if (typeof value === 'string') {
      params.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          params.append(key, item);
        }
      }
    }
  }

  return params;
}

function buildPageUrl(
  path: string,
  query: ParsedQs,
  page: number,
  perPage: number,
): string {
  const params = buildBaseSearchParams(query);
  params.set('page', String(page));
  params.set('per_page', String(perPage));

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function parsePaginationQuery(query: ParsedQs): {
  page: number;
  perPage: number;
} {
  const page = parsePositiveInt(getQueryValue(query.page), DEFAULT_PAGE);
  const requestedPerPage = parsePositiveInt(
    getQueryValue(query.per_page),
    DEFAULT_PER_PAGE,
  );
  const perPage = Math.min(requestedPerPage, MAX_PER_PAGE);

  return {
    page,
    perPage,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number,
): PaginationMeta {
  return {
    total,
    perPage,
    page,
  };
}

export function buildPaginationLinks(
  path: string,
  query: ParsedQs,
  page: number,
  perPage: number,
  total: number,
): PaginationLinks {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    thisPage: buildPageUrl(path, query, page, perPage),
    prevPage: page > 1 ? buildPageUrl(path, query, page - 1, perPage) : null,
    nextPage:
      page < totalPages ? buildPageUrl(path, query, page + 1, perPage) : null,
    lastPage: buildPageUrl(path, query, totalPages, perPage),
  };
}

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): { data: T[]; total: number } {
  const total = items.length;
  const start = (page - 1) * perPage;

  return {
    data: items.slice(start, start + perPage),
    total,
  };
}

export function parseDateQuery(
  query: ParsedQs,
  key: string,
  mode: 'start' | 'end',
): Date | null | 'invalid' {
  const raw = getQueryValue(query[key]);

  if (!raw) {
    return null;
  }

  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
  const value = dateOnlyPattern.test(raw)
    ? mode === 'start'
      ? `${raw}T00:00:00.000Z`
      : `${raw}T23:59:59.999Z`
    : raw;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'invalid';
  }

  return parsed;
}
