import { useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAnnouncements } from "@/context/AnnouncementsContext";
import { fetchAnnouncement, NotFoundError } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UrgentBadge } from "@/components/UrgentBadge";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

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
    ((!validId && status === "idle") || error instanceof NotFoundError);
  const isError = status === "error" && !(error instanceof NotFoundError);

  const handleBack = () => {
    // If the user arrived from within the app, go back so the feed's search
    // and filter state is restored exactly. Otherwise (deep link) send them
    // to the feed.
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/announcements");
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

      {status === "loading" && <Loading label="Loading announcement…" />}

      {isError && (
        <ErrorState
          message={error?.message ?? "Failed to load this announcement."}
          onRetry={reload}
        />
      )}

      {isNotFound && (
        <EmptyState title={`Announcement #${id} could not be found.`}>
          <button
            type="button"
            className="button"
            onClick={() => navigate("/announcements")}
          >
            Back to feed
          </button>
        </EmptyState>
      )}

      {announcement && status !== "loading" && (
        <article
          className={`detail${announcement.isUrgent ? " detail--urgent" : ""}`}
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
