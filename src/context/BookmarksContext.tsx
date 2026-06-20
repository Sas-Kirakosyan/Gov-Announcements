import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Announcement } from '@/types';
import { readJSON, writeJSON } from '@/lib/storage';

const STORAGE_KEY = 'gov-announcements:bookmarks';

interface BookmarksContextValue {
  /** Saved announcements, most-recently bookmarked first. */
  bookmarks: Announcement[];
  count: number;
  isBookmarked: (id: number) => boolean;
  /** Add the announcement if absent, otherwise remove it. */
  toggle: (announcement: Announcement) => void;
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

/**
 * We persist the full announcement object (not just its id) so the Bookmarks
 * page renders standalone — even on a cold refresh before the feed has loaded,
 * or after the source post would otherwise need re-fetching.
 */
type StoredBookmarks = Record<number, Announcement>;

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<StoredBookmarks>(() =>
    readJSON<StoredBookmarks>(STORAGE_KEY, {}),
  );

  // Persist on every change.
  useEffect(() => {
    writeJSON(STORAGE_KEY, map);
  }, [map]);

  const isBookmarked = useCallback((id: number) => id in map, [map]);

  const toggle = useCallback((announcement: Announcement) => {
    setMap((prev) => {
      const next = { ...prev };
      if (announcement.id in next) {
        delete next[announcement.id];
      } else {
        next[announcement.id] = announcement;
      }
      return next;
    });
  }, []);

  // Newest first: rely on insertion order of the stored object's keys.
  const bookmarks = useMemo(() => Object.values(map).reverse(), [map]);

  const value = useMemo<BookmarksContextValue>(
    () => ({
      bookmarks,
      count: bookmarks.length,
      isBookmarked,
      toggle,
    }),
    [bookmarks, isBookmarked, toggle],
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext);
  if (!ctx) {
    throw new Error('useBookmarks must be used within a BookmarksProvider.');
  }
  return ctx;
}
