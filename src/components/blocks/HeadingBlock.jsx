import React, { useRef, useEffect } from 'react';

export function HeadingBlock({
  block,
  onChange,
  onEnter,
  onBackspaceEmpty,
  autoFocus = false,
}) {
  const textareaRef = useRef(null);
  const level = block.level || 2;

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
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onEnter) onEnter();
    } else if (e.key === 'Backspace' && (!block.content || block.content === '')) {
      e.preventDefault();
      if (onBackspaceEmpty) onBackspaceEmpty();
    }
  };

  return (
    <div className={`block-item heading-block heading-level-${level}`}>
      <textarea
        ref={textareaRef}
        className={`block-textarea heading-textarea heading-h${level}`}
        value={block.content || ''}
        placeholder={`Heading ${level}`}
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

export default HeadingBlock;
