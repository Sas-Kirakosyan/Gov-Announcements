import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseFetchResult<T> {
  data: T | null;
  status: FetchStatus;
  error: Error | null;
  /** Re-run the fetcher (used by Retry buttons). */
  reload: () => void;
}

/**
 * Runs an async fetcher and tracks its lifecycle, so the two fetch sites in the
 * app (the announcements list and the single-post detail fallback) don't each
 * re-implement the same abort / status / retry boilerplate.
 *
 * - Aborts the in-flight request on unmount or when `deps` change, and ignores
 *   any result that arrives after an abort (checked via `signal.aborted`, which
 *   covers both a late success and the AbortError throw).
 * - `enabled = false` keeps the hook idle and skips the request entirely — used
 *   by the detail page when the announcement is already in the shared cache.
 * - `reload()` re-triggers the fetcher for error-state retries.
 *
 * `deps` are the values the fetcher depends on (e.g. an id), mirroring the
 * dependency-array contract of `useEffect`/`useMemo`.
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  enabled = true,
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<FetchStatus>(
    enabled ? 'loading' : 'idle',
  );
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Hold the latest fetcher in a ref so callers can pass an inline arrow
  // function without it becoming an effect dependency (which would refetch on
  // every render). Refetching is driven by `deps`, `enabled`, and `reloadKey`.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    // Whenever the key (deps/enabled/reloadKey) changes, `data` from the
    // previous fetch is stale — drop it so consumers can never render a result
    // that belongs to a different key.
    if (!enabled) {
      setData(null);
      setStatus('idle');
      setError(null);
      return;
    }

    const controller = new AbortController();
    setData(null);
    setStatus('loading');
    setError(null);

    fetcherRef.current(controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setStatus('success');
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      },
    );

    return () => controller.abort();
    // `deps` is spread intentionally — it is the caller-declared key set, the
    // same contract as useEffect's own dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reloadKey, ...deps]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, status, error, reload };
}
