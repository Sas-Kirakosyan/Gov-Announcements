import { lazy, Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';

const FeedPage = lazy(() => import('@/pages/FeedPage'));
const DetailPage = lazy(() => import('@/pages/DetailPage'));
const BookmarksPage = lazy(() => import('@/pages/BookmarksPage'));

export function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="app__main">
        <Suspense fallback={<Loading />}>
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
        </Suspense>
      </main>
    </div>
  );
}
