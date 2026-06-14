import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** Controlled, real-time title search input. */
export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div>
      <label htmlFor="search" className={styles.label}>
        Search announcements
      </label>
      <div>
        <input
          id="search"
          type="search"
          className={styles.input}
          placeholder="Search by title…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
