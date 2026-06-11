interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Error state with an optional Retry action. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__icon" aria-hidden="true">
        ⚠️
      </p>
      <p className="state__message">{message}</p>
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
