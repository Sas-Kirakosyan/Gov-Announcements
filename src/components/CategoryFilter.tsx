import type { CategoryFilter as CategoryFilterValue } from '@/types';

const OPTIONS: CategoryFilterValue[] = [
  'All',
  'Health',
  'Transport',
  'Education',
  'Infrastructure',
];

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}

/** Segmented control for filtering the feed by category. */
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div
      className="category-filter"
      role="group"
      aria-label="Filter by category"
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={`category-filter__option${
            value === option ? ' is-active' : ''
          }`}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
