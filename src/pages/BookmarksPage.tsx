import { Link } from 'react-router-dom';
import { useBookmarks } from '@/context/BookmarksContext';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EmptyState } from '@/components/EmptyState';

/**
 * Shows only bookmarked announcements. Reads full objects straight from the
 * bookmarks store, so it works even on a cold load before the feed has fetched.
 */
export default function BookmarksPage() {
  const { bookmarks, count } = useBookmarks();

  return (
    <section className="page">
      <div className="page__header">
        <h1>Bookmarks</h1>
        <p className="page__subtitle">
          {count === 0
            ? 'Announcements you save will appear here.'
            : `${count} saved ${count === 1 ? 'announcement' : 'announcements'}.`}
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState title="You haven't bookmarked anything yet.">
          <Link to="/announcements" className="button">
            Browse announcements
          </Link>
        </EmptyState>
      ) : (
        <ul className="card-list">
          {bookmarks.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </ul>
      )}
    </section>
  );
}
