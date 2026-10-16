import React from 'react';
import '../../styles/components/checkbox.css';

export function Checkbox({
  checked = false,
  onChange,
  size = 'md', // sm | md
  className = '',
  disabled = false,
  id,
}) {
  return (
    <label className={`checkbox-wrapper checkbox-${size} ${className}`} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
        className="checkbox-native"
      />
      <span className={`checkbox-custom ${checked ? 'checked' : ''}`}>
        <svg
          className="checkbox-svg"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );
}

export default Checkbox;
