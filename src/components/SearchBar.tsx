interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** Controlled, real-time title search input. */
export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <label htmlFor="search" className="search-bar__label">
        Search announcements
      </label>
      <div className="search-bar__field">
        <input
          id="search"
          type="search"
          className="search-bar__input"
          placeholder="Search by title…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
