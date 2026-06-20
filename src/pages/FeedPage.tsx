import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryFilter as CategoryFilterValue } from '@/types';
import { useAnnouncements } from '@/context/AnnouncementsContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { filterAnnouncements } from '@/lib/filtering';
import { paginate } from '@/lib/pagination';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { Button } from '@/ui/Button';
import { SearchBar } from '@/ui/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Pagination } from '@/ui/Pagination';
import { Loading } from '@/ui/Loading';
import { ErrorState } from '@/ui/ErrorState';
import { EmptyState } from '@/ui/EmptyState';
import common from '@/styles/common.module.css';
import styles from './FeedPage.module.css';

/** Announcements shown per page in the feed. */
const PAGE_SIZE = 12;

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
  const { status, announcements, error, retry, ensureLoaded } =
    useAnnouncements();
  const [searchParams, setSearchParams] = useSearchParams();

  // The list is fetched lazily so deep-linking to a detail page doesn't pull
  // the whole feed. The Feed is the page that needs it, so kick it off here.
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  // Before the lazy fetch has started, status is 'idle'; show the loading UI
  // for it too so there's no flash of an empty feed.
  const isLoading = status === 'loading' || status === 'idle';

  const query = searchParams.get('q') ?? '';
  const category = parseCategory(searchParams.get('category'));
  const rawPage = searchParams.get('page');
  const requestedPage = Number(rawPage) || 1;

  // react-router recreates `setSearchParams` whenever the URL's query string
  // changes (its identity depends on the current params), so closing over it
  // directly would give `updateParams` a new identity on every keystroke and
  // bust the memo on SearchBar/CategoryFilter. Read the latest one from a ref
  // instead, keeping `updateParams` — and the handlers derived from it — stable
  // for the lifetime of the page.
  const setSearchParamsRef = useRef(setSearchParams);
  useEffect(() => {
    setSearchParamsRef.current = setSearchParams;
  });

  const updateParams = useCallback(
    (next: { q?: string; category?: CategoryFilterValue; page?: number }) => {
      setSearchParamsRef.current(
        (prev) => {
          const params = new URLSearchParams(prev);
          // Changing the search or category resets paging back to the first page,
          // otherwise a narrower result set could leave you stranded on a page
          // that no longer exists.
          if (next.q !== undefined) {
            if (next.q) params.set('q', next.q);
            else params.delete('q');
            params.delete('page');
          }
          if (next.category !== undefined) {
            if (next.category !== 'All') params.set('category', next.category);
            else params.delete('category');
            params.delete('page');
          }
          if (next.page !== undefined) {
            if (next.page > 1) params.set('page', String(next.page));
            else params.delete('page');
          }
          return params;
        },
        { replace: true },
      );
    },
    [],
  );

  const handleSearch = useCallback(
    (q: string) => updateParams({ q }),
    [updateParams],
  );
  const handleCategory = useCallback(
    (c: CategoryFilterValue) => updateParams({ category: c }),
    [updateParams],
  );

  const visible = useMemo(
    () => filterAnnouncements(announcements, query, category),
    [announcements, query, category],
  );

  // The visible count updates on every keystroke, but the polite live region
  // that voices it is debounced so rapid typing doesn't spam assistive tech.
  const resultLabel = `${visible.length} ${
    visible.length === 1 ? 'announcement' : 'announcements'
  }${query || category !== 'All' ? ' match your filters' : ''}`;
  const announcedLabel = useDebouncedValue(resultLabel, 500);

  // Paginate the already-filtered list. `paginate` clamps an out-of-range page
  // (e.g. a stale deep link), so `pageData.page` is the authoritative value.
  const pageData = useMemo(
    () => paginate(visible, requestedPage, PAGE_SIZE),
    [visible, requestedPage],
  );

  // Normalize the page in the URL to the clamped, canonical value once data has
  // loaded. paginate only clamps for *display*; without this the address bar
  // could keep a stale/invalid value (?page=999, ?page=abc, a redundant ?page=1)
  // and propagate it into every card's detail back-link via `linkSearch`.
  // Gated on `success` so a deep link to a high page isn't reset to 1 while the
  // list is still empty during loading.
  const canonicalPage = pageData.page > 1 ? String(pageData.page) : null;
  useEffect(() => {
    if (status === 'success' && rawPage !== canonicalPage) {
      updateParams({ page: pageData.page });
    }
    // updateParams is stable (wraps setSearchParams); rawPage/canonicalPage
    // capture every meaningful change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, rawPage, canonicalPage]);

  const goToPage = (page: number) => {
    updateParams({ page });
    window.scrollTo({ top: 0 });
  };

  // Preserve the active filters in each card's detail link.
  const search = searchParams.toString();
  const linkSearch = search ? `?${search}` : '';

  return (
    <section>
      <div className={common.pageHeader}>
        <h1>Announcements</h1>
        <p className={common.pageSubtitle}>
          Official updates from your local government.
        </p>
      </div>

      <div className={styles.controls}>
        <SearchBar value={query} onChange={handleSearch} />
        <CategoryFilter value={category} onChange={handleCategory} />
      </div>

      {isLoading && <Loading label="Loading announcements…" />}

      {status === 'error' && (
        <ErrorState
          message={error ?? 'Failed to load announcements.'}
          onRetry={retry}
        />
      )}

      {status === 'success' && (
        <>
          <p className={styles.meta}>{resultLabel}</p>
          {/* Debounced, visually hidden mirror so screen readers hear the
              settled result count rather than one update per keystroke. */}
          <p className={common.srOnly} aria-live="polite" aria-atomic="true">
            {announcedLabel}
          </p>

          {visible.length === 0 ? (
            <EmptyState title="No announcements match your search and filters.">
              <Button
                variant="ghost"
                onClick={() => updateParams({ q: '', category: 'All' })}
              >
                Clear filters
              </Button>
            </EmptyState>
          ) : (
            <>
              <ul className={common.cardList} aria-label="Announcements">
                {pageData.items.map((a) => (
                  <AnnouncementCard
                    key={a.id}
                    announcement={a}
                    search={linkSearch}
                  />
                ))}
              </ul>

              <Pagination
                page={pageData.page}
                totalPages={pageData.totalPages}
                onChange={goToPage}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
