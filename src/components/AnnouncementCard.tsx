import { Link } from 'react-router-dom';
import type { Announcement } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import { UrgentBadge } from '@/components/UrgentBadge';
import { BookmarkButton } from '@/components/BookmarkButton';

interface AnnouncementCardProps {
  announcement: Announcement;
  /** Query string to preserve so Back from the detail page restores filters. */
  search?: string;
}

/** A single announcement row in the feed / bookmarks list. */
export function AnnouncementCard({
  announcement,
  search = '',
}: AnnouncementCardProps) {
  return (
    <li className={`card${announcement.isUrgent ? ' card--urgent' : ''}`}>
      <Link
        to={`/announcements/${announcement.id}${search}`}
        className="card__link"
      >
        <div className="card__badges">
          <CategoryBadge category={announcement.category} />
          {announcement.isUrgent && <UrgentBadge />}
        </div>
        <h2 className="card__title">{announcement.title}</h2>
        <p className="card__excerpt">{announcement.body}</p>
      </Link>
      <div className="card__actions">
        <BookmarkButton announcement={announcement} />
      </div>
    </li>
  );
}
