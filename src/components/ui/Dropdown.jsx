import React, { useState, useRef, useEffect } from 'react';
import '../../styles/components/dropdown.css';

export function Dropdown({
  trigger,
  items = [], // { label, icon, onClick, danger, disabled, separator }
  align = 'left', // left | right
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`dropdown-wrapper ${className}`} ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={() => setIsOpen((prev) => !prev)}>
        {trigger}
      </div>

      {isOpen && (
        <div className={`dropdown-menu dropdown-align-${align} anim-slide-down`}>
          {items.map((item, index) => {
            if (item.separator) {
              return <div key={index} className="dropdown-separator" />;
            }
            return (
              <button
                key={index}
                className={`dropdown-item ${item.danger ? 'danger' : ''}`}
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
              >
                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                <span className="dropdown-item-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
