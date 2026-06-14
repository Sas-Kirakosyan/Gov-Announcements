import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  BookmarksProvider,
  useBookmarks,
} from '@/context/BookmarksContext';
import type { Announcement } from '@/types';

const announcement: Announcement = {
  id: 42,
  title: 'Park Renovation',
  body: 'The central park will be renovated.',
  category: 'Infrastructure',
  isUrgent: false,
};

const STORAGE_KEY = 'gov-announcements:bookmarks';

function wrapper({ children }: { children: ReactNode }) {
  return <BookmarksProvider>{children}</BookmarksProvider>;
}

describe('BookmarksContext', () => {
  it('toggles a bookmark on and off', () => {
    const { result } = renderHook(() => useBookmarks(), { wrapper });

    expect(result.current.count).toBe(0);
    expect(result.current.isBookmarked(42)).toBe(false);

    act(() => result.current.toggle(announcement));
    expect(result.current.count).toBe(1);
    expect(result.current.isBookmarked(42)).toBe(true);

    act(() => result.current.toggle(announcement));
    expect(result.current.count).toBe(0);
    expect(result.current.isBookmarked(42)).toBe(false);
  });

  it('persists bookmarks to localStorage', () => {
    const { result } = renderHook(() => useBookmarks(), { wrapper });

    act(() => result.current.toggle(announcement));

    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? '{}',
    );
    expect(stored['42']).toMatchObject({ id: 42, title: 'Park Renovation' });
  });

  it('rehydrates persisted bookmarks on mount', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 42: announcement }),
    );

    const { result } = renderHook(() => useBookmarks(), { wrapper });

    expect(result.current.count).toBe(1);
    expect(result.current.bookmarks[0]).toMatchObject({ id: 42 });
  });

  it('recovers gracefully from corrupt storage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not-json');

    const { result } = renderHook(() => useBookmarks(), { wrapper });

    expect(result.current.count).toBe(0);
  });
});
