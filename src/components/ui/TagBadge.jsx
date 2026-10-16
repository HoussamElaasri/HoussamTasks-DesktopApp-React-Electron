import React from 'react';
import '../../styles/components/tag.css';

const PALETTE = [
  { bg: '#F3E6D5', text: '#5C3826' },
  { bg: '#F8E1DC', text: '#802620' },
  { bg: '#EADCEE', text: '#582B66' },
  { bg: '#DFEAE2', text: '#2B5738' },
  { bg: '#FDECC8', text: '#6E4D1B' },
  { bg: '#E0E8F0', text: '#284664' },
];

function getColorForString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export function TagBadge({
  label,
  color = null,
  onRemove = null,
  className = '',
}) {
  const chosenColor = color ? { bg: color, text: '#2D1A1A' } : getColorForString(label || '');

  return (
    <span
      className={`tag-badge ${className}`}
      style={{ backgroundColor: chosenColor.bg, color: chosenColor.text }}
    >
      <span className="tag-label">#{label}</span>
      {onRemove && (
        <button
          type="button"
          className="tag-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(label);
          }}
          aria-label={`Remove tag ${label}`}
        >
          ✕
        </button>
      )}
    </span>
  );
}

export default TagBadge;
