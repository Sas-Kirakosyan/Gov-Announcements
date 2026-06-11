import type { Category } from '@/types';

/** Small colour-coded pill showing an announcement's category. */
export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`category-badge category-badge--${category.toLowerCase()}`}
    >
      {category}
    </span>
  );
}
