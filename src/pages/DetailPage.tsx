import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Announcement } from '@/types';
import { useAnnouncements } from '@/context/AnnouncementsContext';
import { fetchAnnouncement, NotFoundError } from '@/lib/api';
import { CategoryBadge } from '@/components/CategoryBadge';
import { UrgentBadge } from '@/components/UrgentBadge';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';

type LocalStatus = 'idle' | 'loading' | 'error' | 'notfound';

/**
 * Detail view for a single announcement.
 *
 * - When navigating from the feed, the announcement is already in the shared
 *   cache, so no network request is made.
 * - On a direct deep link (cache empty), it falls back to fetching that one
 *   post, with its own loading / error / not-found states.
 */
export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { getById } = useAnnouncements();

  const cached = Number.isInteger(numericId)
    ? getById(numericId)
    : undefined;

  const [fetched, setFetched] = useState<Announcement | null>(null);
  const [status, setStatus] = useState<LocalStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  // Bumping this re-runs the fetch effect (used by the Retry button).
  const [reloadKey, setReloadKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const announcement = cached ?? fetched ?? null;

  // Fetch only when the announcement isn't already available from the cache.
  useEffect(() => {
    if (cached) return;
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setStatus('notfound');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);
    fetchAnnouncement(numericId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setFetched(data);
        setStatus('idle');
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof NotFoundError) {
          setStatus('notfound');
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load this announcement.',
        );
        setStatus('error');
      });

    return () => controller.abort();
  }, [cached, numericId, reloadKey]);

  const handleBack = () => {
    // If the user arrived from within the app, go back so the feed's search
    // and filter state is restored exactly. Otherwise (deep link) send them
    // to the feed.
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/announcements');
    }
  };

  return (
    <section className="page page--detail">
      <button
        type="button"
        className="button button--ghost back-button"
        onClick={handleBack}
      >
        ← Back
      </button>

      {status === 'loading' && <Loading label="Loading announcement…" />}

      {status === 'error' && (
        <ErrorState
          message={error ?? 'Failed to load this announcement.'}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}

      {status === 'notfound' && (
        <EmptyState title={`Announcement #${id} could not be found.`}>
          <button
            type="button"
            className="button"
            onClick={() => navigate('/announcements')}
          >
            Back to feed
          </button>
        </EmptyState>
      )}

      {announcement && status !== 'loading' && (
        <article
          className={`detail${announcement.isUrgent ? ' detail--urgent' : ''}`}
        >
          <div className="detail__badges">
            <CategoryBadge category={announcement.category} />
            {announcement.isUrgent && <UrgentBadge />}
          </div>

          <h1 className="detail__title">{announcement.title}</h1>

          <div className="detail__meta">
            <span className="detail__id">Announcement #{announcement.id}</span>
            <BookmarkButton announcement={announcement} variant="full" />
          </div>

          <p className="detail__body">{announcement.body}</p>
        </article>
      )}
    </section>
  );
}
