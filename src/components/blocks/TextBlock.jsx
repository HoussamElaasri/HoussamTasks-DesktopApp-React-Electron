import React, { useRef, useEffect } from 'react';

export function TextBlock({
  block,
  onChange,
  onEnter,
  onBackspaceEmpty,
  autoFocus = false,
}) {
  const textareaRef = useRef(null);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    autoResize();
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [block.content, autoFocus]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onEnter) onEnter();
    } else if (e.key === 'Backspace' && (!block.content || block.content === '')) {
      e.preventDefault();
      if (onBackspaceEmpty) onBackspaceEmpty();
    }
  };

  return (
    <div className="block-item text-block">
      <textarea
        ref={textareaRef}
        className="block-textarea text-block-textarea"
        value={block.content || ''}
        placeholder="Type something..."
        rows={1}
        onChange={(e) => {
          onChange({ content: e.target.value });
          autoResize();
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default TextBlock;
