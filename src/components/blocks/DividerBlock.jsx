import React from 'react';

export function DividerBlock({ onBackspaceEmpty }) {
  return (
    <div
      className="block-item divider-block"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          if (onBackspaceEmpty) onBackspaceEmpty();
        }
      }}
    >
      <hr className="divider-line" />
    </div>
  );
}

export default DividerBlock;
