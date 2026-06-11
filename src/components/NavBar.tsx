import { NavLink } from 'react-router-dom';
import { useBookmarks } from '@/context/BookmarksContext';

/** Top navigation bar with a live bookmark count badge. */
export function NavBar() {
  const { count } = useBookmarks();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/announcements" className="navbar__brand">
          <span className="navbar__brand-mark" aria-hidden="true">
            🏛️
          </span>
          Gov Announcements
        </NavLink>

        <nav className="navbar__links" aria-label="Primary">
          <NavLink to="/announcements" className="navbar__link">
            Feed
          </NavLink>
          <NavLink to="/bookmarks" className="navbar__link">
            Bookmarks
            <span
              className="navbar__badge"
              aria-label={`${count} bookmarked`}
            >
              {count}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
