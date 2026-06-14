import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryFilter as CategoryFilterValue } from '@/types';
import { useAnnouncements } from '@/context/AnnouncementsContext';
import { filterAnnouncements } from '@/lib/filtering';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';

const VALID_CATEGORIES: CategoryFilterValue[] = [
  'All',
  'Health',
  'Transport',
  'Education',
  'Infrastructure',
];

function parseCategory(raw: string | null): CategoryFilterValue {
  return VALID_CATEGORIES.includes(raw as CategoryFilterValue)
    ? (raw as CategoryFilterValue)
    : 'All';
}

/**
 * The feed. Search and category state live in the URL query string, which
 * makes them the single source of truth: filters survive navigation to the
 * detail page and back, and are shareable/bookmarkable links.
 */
export default function FeedPage() {
  const { status, announcements, error, retry } = useAnnouncements();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const category = parseCategory(searchParams.get('category'));

  const updateParams = (next: { q?: string; category?: CategoryFilterValue }) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next.q !== undefined) {
          if (next.q) params.set('q', next.q);
          else params.delete('q');
        }
        if (next.category !== undefined) {
          if (next.category !== 'All') params.set('category', next.category);
          else params.delete('category');
        }
        return params;
      },
      { replace: true },
    );
  };

  const visible = useMemo(
    () => filterAnnouncements(announcements, query, category),
    [announcements, query, category],
  );

  // Preserve the active filters in each card's detail link.
  const search = searchParams.toString();
  const linkSearch = search ? `?${search}` : '';

  return (
    <section className="page">
      <div className="page__header">
        <h1>Announcements</h1>
        <p className="page__subtitle">
          Official updates from your local government.
        </p>
      </div>

      <div className="feed-controls">
        <SearchBar
          value={query}
          onChange={(q) => updateParams({ q })}
        />
        <CategoryFilter
          value={category}
          onChange={(c) => updateParams({ category: c })}
        />
      </div>

      {status === 'loading' && <Loading label="Loading announcements…" />}

      {status === 'error' && (
        <ErrorState
          message={error ?? 'Failed to load announcements.'}
          onRetry={retry}
        />
      )}

      {status === 'success' && (
        <>
          <p className="feed-meta" aria-live="polite">
            {visible.length}{' '}
            {visible.length === 1 ? 'announcement' : 'announcements'}
            {(query || category !== 'All') && ' match your filters'}
          </p>

          {visible.length === 0 ? (
            <EmptyState title="No announcements match your search and filters.">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => updateParams({ q: '', category: 'All' })}
              >
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <ul className="card-list">
              {visible.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  announcement={a}
                  search={linkSearch}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
