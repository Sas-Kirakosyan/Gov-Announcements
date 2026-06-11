import type { Announcement } from '@/types';
import { useBookmarks } from '@/context/BookmarksContext';

interface BookmarkButtonProps {
  announcement: Announcement;
  /** `icon` for compact card use, `full` for the detail page. */
  variant?: 'icon' | 'full';
}

/** Toggles the bookmark state of an announcement from anywhere in the app. */
export function BookmarkButton({
  announcement,
  variant = 'icon',
}: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useBookmarks();
  const bookmarked = isBookmarked(announcement.id);

  const label = bookmarked ? 'Remove bookmark' : 'Add bookmark';

  return (
    <button
      type="button"
      className={`bookmark-button bookmark-button--${variant}${
        bookmarked ? ' is-active' : ''
      }`}
      aria-pressed={bookmarked}
      aria-label={label}
      title={label}
      onClick={(e) => {
        // Cards are wrapped in a link; don't navigate when toggling.
        e.preventDefault();
        e.stopPropagation();
        toggle(announcement);
      }}
    >
      <span className="bookmark-button__icon" aria-hidden="true">
        {bookmarked ? '★' : '☆'}
      </span>
      {variant === 'full' && (
        <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      )}
    </button>
  );
}
