import type { Announcement, CategoryFilter } from '@/types';

/**
 * Filter announcements by a free-text title query and a category, applied
 * together. The query is matched case-insensitively against the title; an
 * empty/whitespace query matches everything. A category of "All" matches every
 * category.
 *
 * This is a pure function so it can run on every keystroke without any network
 * activity, and is trivially unit-testable.
 */
export function filterAnnouncements(
  announcements: Announcement[],
  query: string,
  category: CategoryFilter,
): Announcement[] {
  const normalizedQuery = query.trim().toLowerCase();

  return announcements.filter((announcement) => {
    const matchesCategory =
      category === 'All' || announcement.category === category;
    if (!matchesCategory) return false;

    if (normalizedQuery === '') return true;
    return announcement.title.toLowerCase().includes(normalizedQuery);
  });
}
