import { Link } from 'react-router-dom';
import type { Announcement } from '@/types';
import { BadgeGroup } from '@/components/BadgeGroup';
import { BookmarkButton } from '@/components/BookmarkButton';
import styles from './AnnouncementCard.module.css';

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
    <li className={`${styles.card}${announcement.isUrgent ? ` ${styles.cardUrgent}` : ''}`}>
      <Link
        to={`/announcements/${announcement.id}${search}`}
        className={styles.link}
      >
        <BadgeGroup announcement={announcement} />
        <h2 className={styles.title}>{announcement.title}</h2>
        <p className={styles.excerpt}>{announcement.body}</p>
      </Link>
      <div className={styles.actions}>
        <BookmarkButton announcement={announcement} />
      </div>
    </li>
  );
}
