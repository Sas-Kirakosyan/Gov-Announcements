import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAnnouncements } from '@/context/AnnouncementsContext';
import { fetchAnnouncement, NotFoundError } from '@/lib/api';
import { useFetch } from '@/hooks/useFetch';
import { BadgeGroup } from '@/components/BadgeGroup';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Button } from '@/ui/Button';
import { Loading } from '@/ui/Loading';
import { ErrorState } from '@/ui/ErrorState';
import { EmptyState } from '@/ui/EmptyState';
import styles from './DetailPage.module.css';

/**
 * Detail view for a single announcement.
 *
 * - When navigating from the feed, the announcement is already in the shared
 *   cache, so the fetch is disabled and no network request is made.
 * - On a direct deep link (cache miss), it falls back to fetching that one
 *   post via `useFetch`, with its own loading / error / not-found states.
 */
export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const validId = Number.isInteger(numericId) && numericId > 0;
  const navigate = useNavigate();
  const location = useLocation();
  const { getById } = useAnnouncements();

  const cached = validId ? getById(numericId) : undefined;

  // Only fetch when the announcement isn't already cached and the id is valid.
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchAnnouncement(numericId, signal),
    [numericId],
  );
  const {
    data: fetched,
    status,
    error,
    reload,
  } = useFetch(fetcher, [numericId], !cached && validId);

  const announcement = cached ?? fetched ?? null;
  const isNotFound =
    !announcement &&
    ((!validId && status === 'idle') || error instanceof NotFoundError);
  const isError = status === 'error' && !(error instanceof NotFoundError);

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
    <section>
      <Button
        variant="ghost"
        className={styles.backButton}
        onClick={handleBack}
      >
        ← Back
      </Button>

      {status === 'loading' && <Loading label="Loading announcement…" />}

      {isError && (
        <ErrorState
          message={error?.message ?? 'Failed to load this announcement.'}
          onRetry={reload}
        />
      )}

      {isNotFound && (
        <EmptyState title={`Announcement #${id} could not be found.`}>
          <Button onClick={() => navigate('/announcements')}>Back to feed</Button>
        </EmptyState>
      )}

      {announcement && status !== 'loading' && (
        <article
          className={`${styles.detail}${
            announcement.isUrgent ? ` ${styles.detailUrgent}` : ''
          }`}
        >
          <BadgeGroup announcement={announcement} />

          <h1 className={styles.title}>{announcement.title}</h1>

          <div className={styles.meta}>
            <span className={styles.id}>Announcement #{announcement.id}</span>
            <BookmarkButton announcement={announcement} variant="full" />
          </div>

          <p className={styles.body}>{announcement.body}</p>
        </article>
      )}
    </section>
  );
}
