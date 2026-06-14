import { pageRange } from '@/lib/pagination';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/**
 * Page navigation for the feed. Renders nothing when there is only one page,
 * so the caller can drop it in unconditionally. The active page is conveyed to
 * assistive tech with `aria-current="page"`.
 */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.nav}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      <ul className={styles.pages}>
        {pageRange(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li
              key={`gap-${index}`}
              className={styles.gap}
              aria-hidden="true"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={
                  item === page
                    ? `${styles.page} ${styles.pageActive}`
                    : styles.page
                }
                onClick={() => onChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={styles.nav}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
