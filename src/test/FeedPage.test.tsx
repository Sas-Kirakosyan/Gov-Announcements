import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AnnouncementsProvider } from '@/context/AnnouncementsContext';
import { BookmarksProvider } from '@/context/BookmarksContext';
import { FeedPage } from '@/pages/FeedPage';
import type { Post } from '@/types';

// Raw posts chosen so categories are predictable:
//   id 1 -> Transport, id 2 -> Education, id 4 -> Health, id 8 -> Health
const posts: Post[] = [
  { id: 1, userId: 1, title: 'new bus routes', body: 'b' },
  { id: 2, userId: 1, title: 'school enrolment opens', body: 'b' },
  { id: 4, userId: 1, title: 'free flu vaccines', body: 'b' },
  { id: 8, userId: 1, title: 'bus lane health drive', body: 'b' },
];

function renderFeed() {
  return render(
    <MemoryRouter initialEntries={['/announcements']}>
      <BookmarksProvider>
        <AnnouncementsProvider>
          <FeedPage />
        </AnnouncementsProvider>
      </BookmarksProvider>
    </MemoryRouter>,
  );
}

function mockFetchOk() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => posts,
    }),
  );
}

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

  it('shows an error state with a Retry button when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    renderFeed();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /retry/i }),
    ).toBeInTheDocument();
  });
});
