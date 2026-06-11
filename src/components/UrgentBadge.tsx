/** Indicator shown only for urgent announcements. */
export function UrgentBadge() {
  return (
    <span className="urgent-badge" role="status">
      <span className="urgent-badge__dot" aria-hidden="true" /> Urgent
    </span>
  );
}
