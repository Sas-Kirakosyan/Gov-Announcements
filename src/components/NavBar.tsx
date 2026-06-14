import { NavLink } from 'react-router-dom';
import { useBookmarks } from '@/context/BookmarksContext';
import styles from './NavBar.module.css';

/** Top navigation bar with a live bookmark count badge. */
export function NavBar() {
  const { count } = useBookmarks();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to="/announcements" className={styles.brand}>
          <span aria-hidden="true">🏛️</span>
          Gov Announcements
        </NavLink>

        <nav className={styles.links} aria-label="Primary">
          <NavLink to="/announcements" className={linkClass}>
            Feed
          </NavLink>
          <NavLink to="/bookmarks" className={linkClass}>
            Bookmarks
            <span className={styles.badge} aria-label={`${count} bookmarked`}>
              {count}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
