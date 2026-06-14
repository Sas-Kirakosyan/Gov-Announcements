import type { Announcement } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import { UrgentBadge } from '@/components/UrgentBadge';
import styles from './BadgeGroup.module.css';

/** An announcement's category badge plus an urgent indicator when applicable. */
export function BadgeGroup({ announcement }: { announcement: Announcement }) {
  return (
    <div className={styles.group}>
      <CategoryBadge category={announcement.category} />
      {announcement.isUrgent && <UrgentBadge />}
    </div>
  );
}
