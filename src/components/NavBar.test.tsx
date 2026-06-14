import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { BookmarksProvider, useBookmarks } from '@/context/BookmarksContext';
import type { Announcement } from '@/types';

const announcement: Announcement = {
  id: 42,
  title: 'Park Renovation',
  body: 'The central park will be renovated.',
  category: 'Infrastructure',
  isUrgent: false,
};

/** A button outside the nav that toggles a bookmark, standing in for a card. */
function ToggleButton() {
  const { toggle } = useBookmarks();
  return <button onClick={() => toggle(announcement)}>toggle</button>;
}

describe('NavBar bookmark count', () => {
  it('reflects bookmark toggles in the badge', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <BookmarksProvider>
          <NavBar />
          <ToggleButton />
        </BookmarksProvider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('0 bookmarked')).toHaveTextContent('0');

    await user.click(screen.getByText('toggle'));
    expect(screen.getByLabelText('1 bookmarked')).toHaveTextContent('1');

    await user.click(screen.getByText('toggle'));
    expect(screen.getByLabelText('0 bookmarked')).toHaveTextContent('0');
  });
});
