import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '@/hooks/useFetch';

describe('useFetch', () => {
  it('transitions loading -> success and exposes the data', async () => {
    const { result } = renderHook(() =>
      useFetch(async () => 'hello', []),
    );

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toBe('hello');
    expect(result.current.error).toBeNull();
  });

  it('transitions loading -> error and captures the error', async () => {
    const { result } = renderHook(() =>
      useFetch(async () => {
        throw new Error('boom');
      }, []),
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.message).toBe('boom');
  });

  it('stays idle and never calls the fetcher when disabled', () => {
    const fetcher = vi.fn(async () => 'x');
    const { result } = renderHook(() => useFetch(fetcher, [], false));

    expect(result.current.status).toBe('idle');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('re-runs the fetcher when reload() is called', async () => {
    const fetcher = vi.fn(async () => 'data');
    const { result } = renderHook(() => useFetch(fetcher, []));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(fetcher).toHaveBeenCalledTimes(1);

    act(() => result.current.reload());

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });

  it('aborts the in-flight request on unmount', () => {
    let capturedSignal: AbortSignal | undefined;
    const fetcher = (signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise<string>(() => {
        /* never resolves */
      });
    };

    const { unmount } = renderHook(() => useFetch(fetcher, []));
    expect(capturedSignal?.aborted).toBe(false);

    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('ignores a superseded result when deps change before it resolves', async () => {
    // Each call captures its resolver so we can settle the fetches out of order.
    const resolvers: Array<(value: string) => void> = [];
    const fetcher = (_signal: AbortSignal) =>
      new Promise<string>((resolve) => resolvers.push(resolve));

    const { result, rerender } = renderHook(
      ({ id }) => useFetch((signal) => fetcher(signal), [id]),
      { initialProps: { id: 1 } },
    );

    // Change the key before the first fetch resolves; this aborts fetch #1.
    rerender({ id: 2 });
    expect(resolvers).toHaveLength(2);

    // Settle the current (second) fetch first.
    act(() => resolvers[1]('second'));
    await waitFor(() => expect(result.current.data).toBe('second'));

    // Now settle the stale (first, aborted) fetch — it must be ignored.
    act(() => resolvers[0]('first'));
    await Promise.resolve();
    expect(result.current.data).toBe('second');
  });

  it('clears stale data when the fetch is disabled', async () => {
    const fetcher = vi.fn(async () => 'value');
    const { result, rerender } = renderHook(
      ({ enabled }) => useFetch(fetcher, [], enabled),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => expect(result.current.data).toBe('value'));

    rerender({ enabled: false });
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
  });
});
