import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AnnouncementsProvider } from '@/context/AnnouncementsContext';
import { BookmarksProvider } from '@/context/BookmarksContext';
import FeedPage from '@/pages/FeedPage';
import type { Post } from '@/types';

/** Exposes the current query string so tests can assert URL normalization. */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="search">{location.search}</div>;
}

// Raw posts chosen so categories are predictable:
//   id 1 -> Transport, id 2 -> Education, id 4 -> Health, id 8 -> Health
const posts: Post[] = [
  { id: 1, userId: 1, title: 'new bus routes', body: 'b' },
  { id: 2, userId: 1, title: 'school enrolment opens', body: 'b' },
  { id: 4, userId: 1, title: 'free flu vaccines', body: 'b' },
  { id: 8, userId: 1, title: 'bus lane health drive', body: 'b' },
];

function renderFeed(initialEntry = '/announcements') {
  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <BookmarksProvider>
        <AnnouncementsProvider>
          <FeedPage />
          <LocationProbe />
        </AnnouncementsProvider>
      </BookmarksProvider>
    </MemoryRouter>,
  );
}

function mockFetchOk(data: Post[] = posts) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => data,
    }),
  );
}

// 30 posts (> two pages at a page size of 12) with titles we can match on.
const manyPosts: Post[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  userId: 1,
  title: `announcement ${i + 1}`,
  body: 'b',
}));

describe('FeedPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a loading state then renders announcements', async () => {
    mockFetchOk();
    renderFeed();

    expect(screen.getByText(/loading announcements/i)).toBeInTheDocument();

    expect(await screen.findByText('New Bus Routes')).toBeInTheDocument();
    expect(screen.getByText('Free Flu Vaccines')).toBeInTheDocument();
  });

  it('applies search and category filters together', async () => {
    mockFetchOk();
    const user = userEvent.setup();
    renderFeed();

    await screen.findByText('New Bus Routes');

    const list = () => screen.getByRole('list');

    // Search alone: "bus" matches two items.
    await user.type(screen.getByPlaceholderText(/search by title/i), 'bus');
    await waitFor(() => {
      expect(within(list()).getAllByRole('listitem')).toHaveLength(2);
    });

    // Add the Health category: only the Health "bus" item remains.
    await user.click(screen.getByRole('button', { name: 'Health' }));
    await waitFor(() => {
      const items = within(list()).getAllByRole('listitem');
      expect(items).toHaveLength(1);
      expect(within(list()).getByText('Bus Lane Health Drive')).toBeInTheDocument();
    });
  });

  it('limits a page to 12 items and navigates with the pager', async () => {
    mockFetchOk(manyPosts);
    const user = userEvent.setup();
    renderFeed();

    await screen.findByText('Announcement 1');

    const list = () => screen.getByRole('list', { name: /announcements/i });
    expect(within(list()).getAllByRole('listitem')).toHaveLength(12);
    expect(within(list()).queryByText('Announcement 13')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Page 2' }));

    await waitFor(() => {
      expect(within(list()).getByText('Announcement 13')).toBeInTheDocument();
    });
    expect(within(list()).queryByText('Announcement 1')).not.toBeInTheDocument();
  });

  it('clamps an out-of-range deep link to the last page and normalizes the URL', async () => {
    mockFetchOk(manyPosts);
    renderFeed('/announcements?page=999');

    // 30 items / 12 per page = 3 pages; page 3 holds items 25..30.
    expect(await screen.findByText('Announcement 25')).toBeInTheDocument();
    const current = screen.getByRole('button', { name: 'Page 3' });
    expect(current).toHaveAttribute('aria-current', 'page');

    // The stale ?page=999 is rewritten to the canonical page so it can't leak
    // into shared URLs or the cards' detail back-links.
    await waitFor(() => {
      expect(screen.getByTestId('search')).toHaveTextContent('?page=3');
    });
  });

  it('normalizes a junk page value to no page param', async () => {
    mockFetchOk(manyPosts);
    renderFeed('/announcements?page=abc');

    await screen.findByText('Announcement 1');
    await waitFor(() => {
      expect(screen.getByTestId('search').textContent).toBe('');
    });
  });

  it('resets to the first page when the search changes', async () => {
    mockFetchOk(manyPosts);
    const user = userEvent.setup();
    renderFeed('/announcements?page=2');

    await screen.findByText('Announcement 13');

    // Searching narrows results to a single page; the stale page=2 is dropped
    // and the matching item is shown rather than an empty page.
    await user.type(screen.getByPlaceholderText(/search by title/i), 'announcement 1');
    await waitFor(() => {
      expect(screen.getByText('Announcement 1')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('navigation', { name: /pagination/i }),
    ).not.toBeInTheDocument();
  });

  it('shows an error state with a Retry button when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    renderFeed();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /retry/i }),
    ).toBeInTheDocument();
  });
});
