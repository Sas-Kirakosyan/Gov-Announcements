import common from '@/styles/common.module.css';
import { Button } from '@/ui/Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Error state with an optional Retry action. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={common.state} role="alert">
      <p className={common.stateIcon} aria-hidden="true">
        ⚠️
      </p>
      <p className={common.stateMessage}>{message}</p>
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  );
}
