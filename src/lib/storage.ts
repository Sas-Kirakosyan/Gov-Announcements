/**
 * Thin, defensive wrapper around localStorage. Every access is guarded so the
 * app keeps working even when storage is unavailable (private mode, disabled
 * cookies) or holds corrupt JSON.
 */

/** Read and JSON-parse a value, returning `fallback` on any failure. */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** JSON-serialize and write a value. Failures are swallowed (best effort). */
export function writeJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — nothing we can do, keep the app running.
  }
}
