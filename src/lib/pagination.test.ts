import { describe, expect, it } from 'vitest';
import { paginate, pageRange } from '@/lib/pagination';

const items = Array.from({ length: 25 }, (_, i) => i + 1); // 1..25

describe('paginate', () => {
  it('returns the first slice for page 1', () => {
    const result = paginate(items, 1, 10);
    expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(25);
  });

  it('returns a partial final page', () => {
    const result = paginate(items, 3, 10);
    expect(result.items).toEqual([21, 22, 23, 24, 25]);
    expect(result.page).toBe(3);
  });

  it('clamps a page above the range to the last page', () => {
    const result = paginate(items, 999, 10);
    expect(result.page).toBe(3);
    expect(result.items).toEqual([21, 22, 23, 24, 25]);
  });

  it('clamps a page below 1 to the first page', () => {
    const result = paginate(items, 0, 10);
    expect(result.page).toBe(1);
    expect(result.items[0]).toBe(1);
  });

  it('truncates a non-integer page', () => {
    const result = paginate(items, 2.9, 10);
    expect(result.page).toBe(2);
    expect(result.items[0]).toBe(11);
  });

  it('reports one page and an empty slice for an empty list', () => {
    const result = paginate([], 1, 10);
    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
  });
});

describe('pageRange', () => {
  it('lists every page without gaps when they fit', () => {
    expect(pageRange(1, 3)).toEqual([1, 2, 3]);
  });

  it('returns a single page', () => {
    expect(pageRange(1, 1)).toEqual([1]);
  });

  it('puts a gap on the right near the start', () => {
    expect(pageRange(1, 9)).toEqual([1, 2, 'gap', 9]);
  });

  it('puts gaps on both sides in the middle', () => {
    expect(pageRange(5, 9)).toEqual([1, 'gap', 4, 5, 6, 'gap', 9]);
  });

  it('puts a gap on the left near the end', () => {
    expect(pageRange(9, 9)).toEqual([1, 'gap', 8, 9]);
  });
});
