import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { FeedPage } from '@/pages/FeedPage';
import { DetailPage } from '@/pages/DetailPage';
import { BookmarksPage } from '@/pages/BookmarksPage';
import { EmptyState } from '@/components/EmptyState';
import { Link } from 'react-router-dom';

export function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="app__main">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/announcements" replace />}
          />
          <Route path="/announcements" element={<FeedPage />} />
          <Route path="/announcements/:id" element={<DetailPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route
            path="*"
            element={
              <section className="page">
                <EmptyState title="Page not found.">
                  <Link to="/announcements" className="button">
                    Go to feed
                  </Link>
                </EmptyState>
              </section>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
