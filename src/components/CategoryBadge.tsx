import type { Category } from '@/types';
import styles from './CategoryBadge.module.css';

/** Small colour-coded pill showing an announcement's category. */
export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`${styles.badge} ${styles[category.toLowerCase()]}`}>
      {category}
    </span>
  );
}
