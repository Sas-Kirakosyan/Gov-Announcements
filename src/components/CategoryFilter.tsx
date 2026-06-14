import type { CategoryFilter as CategoryFilterValue } from '@/types';
import styles from './CategoryFilter.module.css';

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
    <div className={styles.filter} role="group" aria-label="Filter by category">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={
            value === option
              ? `${styles.option} ${styles.optionActive}`
              : styles.option
          }
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
