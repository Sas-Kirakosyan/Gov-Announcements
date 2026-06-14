import { Link } from 'react-router-dom';
import { useBookmarks } from '@/context/BookmarksContext';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EmptyState } from '@/ui/EmptyState';
import common from '@/styles/common.module.css';

/**
 * Shows only bookmarked announcements. Reads full objects straight from the
 * bookmarks store, so it works even on a cold load before the feed has fetched.
 */
export default function BookmarksPage() {
  const { bookmarks, count } = useBookmarks();

  return (
    <section>
      <div className={common.pageHeader}>
        <h1>Bookmarks</h1>
        <p className={common.pageSubtitle}>
          {count === 0
            ? 'Announcements you save will appear here.'
            : `${count} saved ${count === 1 ? 'announcement' : 'announcements'}.`}
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState title="You haven't bookmarked anything yet.">
          <Link to="/announcements" className={common.button}>
            Browse announcements
          </Link>
        </EmptyState>
      ) : (
        <ul className={common.cardList}>
          {bookmarks.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </ul>
      )}
    </section>
  );
}
