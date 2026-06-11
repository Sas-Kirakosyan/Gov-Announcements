/** The raw shape returned by the JSONPlaceholder `/posts` endpoint. */
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

/** The four categories an announcement can belong to. */
export type Category = 'Health' | 'Transport' | 'Education' | 'Infrastructure';

/** Categories plus the "All" pseudo-filter used by the category filter UI. */
export type CategoryFilter = 'All' | Category;

/** A government announcement, derived from a {@link Post}. */
export interface Announcement {
  id: number;
  title: string;
  body: string;
  category: Category;
  isUrgent: boolean;
}
