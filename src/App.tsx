import { lazy, Suspense } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { EmptyState } from '@/ui/EmptyState';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { Loading } from '@/ui/Loading';
import common from '@/styles/common.module.css';
import styles from './App.module.css';

const FeedPage = lazy(() => import('@/pages/FeedPage'));
const DetailPage = lazy(() => import('@/pages/DetailPage'));
const BookmarksPage = lazy(() => import('@/pages/BookmarksPage'));

export function App() {
  const location = useLocation();
  return (
    <div>
      <NavBar />
      <main className={styles.main}>
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/announcements" replace />} />
              <Route path="/announcements" element={<FeedPage />} />
              <Route path="/announcements/:id" element={<DetailPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route
                path="*"
                element={
                  <section>
                    <EmptyState title="Page not found.">
                      <Link to="/announcements" className={common.button}>
                        Go to feed
                      </Link>
                    </EmptyState>
                  </section>
                }
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
