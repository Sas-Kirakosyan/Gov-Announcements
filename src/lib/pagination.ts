/**
 * Client-side pagination. JSONPlaceholder offers no real paging endpoint, and
 * the feed already holds every announcement in memory (search and category
 * filtering must run without extra network calls), so paging is the last,
 * purely presentational step: filter first, then slice the filtered result.
 *
 * Pure functions so they can be unit-tested and run cheaply on every render.
 */

export interface PageResult<T> {
  /** The items on the (clamped) current page. */
  items: T[];
  /** The current page after clamping into range, 1-based. */
  page: number;
  /** Total number of pages; always at least 1, even for an empty list. */
  totalPages: number;
  /** The page size used to compute the slice. */
  pageSize: number;
  /** Total number of items across all pages. */
  total: number;
}

/**
 * Slice `items` into the page at `page` (1-based), `pageSize` items per page.
 *
 * `page` is defensively normalized: non-integers are truncated, and anything
 * below 1 or above the last page is clamped into range. This keeps deep links
 * such as `?page=0` or `?page=999` from rendering a blank list.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PageResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const start = (current - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    pageSize,
    total,
  };
}

/**
 * Build the sequence of page controls to render: always the first and last
 * page, the current page with `siblings` neighbours on each side, and `'gap'`
 * markers (rendered as an ellipsis) where pages are skipped.
 *
 * e.g. current 5 of 9 → [1, 'gap', 4, 5, 6, 'gap', 9].
 */
export function pageRange(
  current: number,
  totalPages: number,
  siblings = 1,
): (number | 'gap')[] {
  const range: (number | 'gap')[] = [];
  const first = 1;
  const last = totalPages;
  const left = Math.max(first, current - siblings);
  const right = Math.min(last, current + siblings);

  range.push(first);
  if (left > first + 1) range.push('gap');
  for (let page = left; page <= right; page += 1) {
    if (page !== first && page !== last) range.push(page);
  }
  if (right < last - 1) range.push('gap');
  if (last !== first) range.push(last);

  return range;
}
