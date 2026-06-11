import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Announcement } from '@/types';
import { fetchAnnouncements } from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

interface AnnouncementsContextValue {
  status: Status;
  announcements: Announcement[];
  error: string | null;
  /** Re-run the initial fetch (used by the error-state Retry button). */
  retry: () => void;
  /** Look up a cached announcement by id, or `undefined` if not loaded. */
  getById: (id: number) => Announcement | undefined;
}

const AnnouncementsContext = createContext<AnnouncementsContextValue | null>(
  null,
);

/**
 * Fetches the full announcement list once and shares it across the app. The
 * Feed, Detail, and Bookmarks pages all read from this single in-memory cache
 * so navigating between them never triggers a second list request.
 */
export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Index by id for O(1) detail lookups, recomputed only when data changes.
  const byId = useMemo(() => {
    const map = new Map<number, Announcement>();
    for (const a of announcements) map.set(a.id, a);
    return map;
  }, [announcements]);

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);
    try {
      const data = await fetchAnnouncements(controller.signal);
      if (controller.signal.aborted) return;
      setAnnouncements(data);
      setStatus('success');
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while loading announcements.',
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  const getById = useCallback(
    (id: number) => byId.get(id),
    [byId],
  );

  const value = useMemo<AnnouncementsContextValue>(
    () => ({ status, announcements, error, retry: load, getById }),
    [status, announcements, error, load, getById],
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
