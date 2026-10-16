import React from 'react';
import '../../styles/components/search.css';

export function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search tasks or commands...',
  autoFocus = false,
  className = '',
}) {
  return (
    <div className={`searchbar-wrapper ${className}`}>
      <span className="searchbar-icon">🔍</span>
      <input
        type="text"
        className="searchbar-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {value && (
        <button
          type="button"
          className="searchbar-clear-btn"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
