import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AnnouncementsProvider } from '@/context/AnnouncementsContext';
import { BookmarksProvider } from '@/context/BookmarksContext';
import type { Post } from '@/types';

// Shared, hoist-safe render counter for the mocked CategoryFilter.
const probe = vi.hoisted(() => ({ renders: 0 }));

// Replace CategoryFilter with a memoized stand-in that mirrors the real one's
// React.memo. A commit here therefore means FeedPage handed it a *changed*
// prop — exactly what the stable-callback optimization is meant to prevent.
vi.mock('@/components/CategoryFilter', async () => {
  const { memo } = await import('react');
  return {
    CategoryFilter: memo(function CategoryFilter() {
      probe.renders += 1;
      return <div data-testid="category-filter" />;
    }),
  };
});

// id 1 -> Transport, id 2 -> Education: predictable, irrelevant to this test.
const posts: Post[] = [
  { id: 1, userId: 1, title: 'new bus routes', body: 'b' },
  { id: 2, userId: 1, title: 'school enrolment opens', body: 'b' },
];

function mockFetchOk(data: Post[] = posts) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => data,
    }) as unknown as typeof fetch,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  probe.renders = 0;
});

describe('FeedPage filter control re-renders', () => {
  it('does not re-render CategoryFilter while typing in the search box', async () => {
    mockFetchOk();
    const user = userEvent.setup();

    // Import after vi.mock is registered so FeedPage picks up the stand-in.
    const { default: FeedPage } = await import('@/pages/FeedPage');

    render(
      <MemoryRouter initialEntries={['/announcements']}>
        <BookmarksProvider>
          <AnnouncementsProvider>
            <FeedPage />
          </AnnouncementsProvider>
        </BookmarksProvider>
      </MemoryRouter>,
    );

    // Wait until the feed has loaded and settled (URL normalization done).
    await screen.findByTestId('category-filter');
    await screen.findByRole('searchbox');
    const baseline = probe.renders;

    await user.type(screen.getByRole('searchbox'), 'bus');

    // The category value is unchanged and onChange is referentially stable, so
    // the memoized CategoryFilter must not re-render on any of the keystrokes.
    expect(probe.renders).toBe(baseline);
  });
});
