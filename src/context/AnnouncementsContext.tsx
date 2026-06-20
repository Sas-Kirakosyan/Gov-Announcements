import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Announcement } from '@/types';
import { fetchAnnouncements } from '@/lib/api';
import { useFetch, type FetchStatus } from '@/hooks/useFetch';

interface AnnouncementsContextValue {
  status: FetchStatus;
  announcements: Announcement[];
  error: string | null;
  /** Re-run the initial fetch (used by the error-state Retry button). */
  retry: () => void;
  /** Start the lazy list fetch. Called by the Feed; never by the Detail page. */
  ensureLoaded: () => void;
  /** Look up a cached announcement by id, or `undefined` if not loaded. */
  getById: (id: number) => Announcement | undefined;
}

const AnnouncementsContext = createContext<AnnouncementsContextValue | null>(
  null,
);

// Stable reference so the `byId` / `value` memos don't churn while loading.
const EMPTY_ANNOUNCEMENTS: Announcement[] = [];

/**
 * Fetches the full announcement list once and shares it across the app. The
 * fetch is lazy: it only runs after a page calls `ensureLoaded` (the Feed), so
 * landing directly on the Detail page leaves the cache empty and lets that page
 * fetch a single post by id. Once loaded, the Feed, Detail, and Bookmarks pages
 * all read from this single in-memory cache, so navigating between them never
 * triggers a second list request.
 */

export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const { data, status, error, reload } = useFetch(
    fetchAnnouncements,
    [],
    enabled,
  );
  const announcements = data ?? EMPTY_ANNOUNCEMENTS;

  const ensureLoaded = useCallback(() => setEnabled(true), []);

  // Index by id for O(1) detail lookups, recomputed only when data changes.
  const byId = useMemo(() => {
    const map = new Map<number, Announcement>();
    for (const a of announcements) map.set(a.id, a);
    return map;
  }, [announcements]);

  const getById = useCallback((id: number) => byId.get(id), [byId]);

  const value = useMemo<AnnouncementsContextValue>(
    () => ({
      status,
      announcements,
      error: error?.message ?? null,
      retry: reload,
      ensureLoaded,
      getById,
    }),
    [status, announcements, error, reload, ensureLoaded, getById],
  );

  return (
    <AnnouncementsContext.Provider value={value}>
      {children}
    </AnnouncementsContext.Provider>
  );
}

export function useAnnouncements(): AnnouncementsContextValue {
  const ctx = useContext(AnnouncementsContext);
  if (!ctx) {
    throw new Error(
      'useAnnouncements must be used within an AnnouncementsProvider.',
    );
  }
  return ctx;
}
