import { describe, expect, it } from 'vitest';
import { filterAnnouncements } from '@/lib/filtering';
import type { Announcement } from '@/types';

const sample: Announcement[] = [
  { id: 1, title: 'New Bus Routes', body: '', category: 'Transport', isUrgent: false },
  { id: 2, title: 'School Enrolment Opens', body: '', category: 'Education', isUrgent: false },
  { id: 4, title: 'Free Flu Vaccines', body: '', category: 'Health', isUrgent: false },
  { id: 3, title: 'Bridge Repair Notice', body: '', category: 'Infrastructure', isUrgent: false },
  { id: 8, title: 'Bus Lane Expansion', body: '', category: 'Health', isUrgent: false },
];

describe('filterAnnouncements', () => {
  it('returns everything for an empty query and All category', () => {
    expect(filterAnnouncements(sample, '', 'All')).toHaveLength(5);
  });

  it('filters by title, case-insensitively', () => {
    const result = filterAnnouncements(sample, 'bus', 'All');
    expect(result.map((a) => a.id)).toEqual([1, 8]);
  });

  it('filters by category alone', () => {
    const result = filterAnnouncements(sample, '', 'Health');
    expect(result.map((a) => a.id)).toEqual([4, 8]);
  });

  it('applies search and category together', () => {
    const result = filterAnnouncements(sample, 'bus', 'Health');
    expect(result.map((a) => a.id)).toEqual([8]);
  });

  it('ignores surrounding whitespace in the query', () => {
    const result = filterAnnouncements(sample, '  bridge  ', 'All');
    expect(result.map((a) => a.id)).toEqual([3]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterAnnouncements(sample, 'zzz', 'All')).toEqual([]);
  });
});
