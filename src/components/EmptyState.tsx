import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

/** Friendly placeholder shown when a list has no items to display. */
export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="state state--empty">
      <p className="state__icon" aria-hidden="true">
        📭
      </p>
      <p className="state__message">{title}</p>
      {children}
    </div>
  );
}
