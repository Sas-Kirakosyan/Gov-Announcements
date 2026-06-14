import styles from './UrgentBadge.module.css';

/** Indicator shown only for urgent announcements. */
export function UrgentBadge() {
  return (
    <span className={styles.badge} role="status">
      <span className={styles.dot} aria-hidden="true" /> Urgent
    </span>
  );
}
