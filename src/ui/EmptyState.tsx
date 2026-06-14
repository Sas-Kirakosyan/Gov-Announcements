import type { ReactNode } from 'react';
import common from '@/styles/common.module.css';

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

/** Friendly placeholder shown when a list has no items to display. */
export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className={common.state}>
      <p className={common.stateIcon} aria-hidden="true">
        📭
      </p>
      <p className={common.stateMessage}>{title}</p>
      {children}
    </div>
  );
}
