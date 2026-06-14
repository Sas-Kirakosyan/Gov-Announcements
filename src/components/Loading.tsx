import common from '@/styles/common.module.css';

/** Generic loading state with an accessible label. */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className={common.state} role="status" aria-live="polite">
      <span className={common.spinner} aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
