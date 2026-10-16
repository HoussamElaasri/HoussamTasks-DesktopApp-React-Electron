import React from 'react';
import Checkbox from '../ui/Checkbox';

export function ChecklistBlock({
  block,
  onChange,
  onEnter,
  onBackspaceEmpty,
}) {
  const items = block.items || [];

  const handleToggle = (itemId) => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onChange({ items: updated });
  };

  const handleTextChange = (itemId, newText) => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, text: newText } : item
    );
    onChange({ items: updated });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newItem = {
        id: 'item_' + Math.random().toString(36).substring(2, 9),
        text: '',
        checked: false,
      };
      const updated = [...items];
      updated.splice(index + 1, 0, newItem);
      onChange({ items: updated });
    } else if (e.key === 'Backspace' && (!items[index].text || items[index].text === '')) {
      e.preventDefault();
      if (items.length <= 1) {
        if (onBackspaceEmpty) onBackspaceEmpty();
      } else {
        const updated = items.filter((_, idx) => idx !== index);
        onChange({ items: updated });
      }
    }
  };

  return (
    <div className="block-item checklist-block">
      {items.map((item, index) => (
        <div key={item.id || index} className="checklist-item-row">
          <Checkbox
            size="sm"
            checked={!!item.checked}
            onChange={() => handleToggle(item.id)}
          />
          <input
            type="text"
            className={`checklist-item-input ${item.checked ? 'completed anim-strikethrough' : ''}`}
            value={item.text || ''}
            placeholder="To do..."
            onChange={(e) => handleTextChange(item.id, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        </div>
      ))}
      {items.length === 0 && (
        <button
          type="button"
          className="checklist-add-btn"
          onClick={() => {
            onChange({
              items: [{ id: 'item_' + Math.random().toString(36).substring(2, 9), text: '', checked: false }],
            });
          }}
        >
          + Add checklist item
        </button>
      )}
    </div>
  );
}

export default ChecklistBlock;
