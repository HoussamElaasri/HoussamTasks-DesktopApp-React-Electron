import React, { useState } from 'react';
import TextBlock from './TextBlock';
import HeadingBlock from './HeadingBlock';
import ChecklistBlock from './ChecklistBlock';
import DividerBlock from './DividerBlock';
import Dropdown from '../ui/Dropdown';
import { PlusIcon, FileTextIcon, CheckIcon, ListIcon } from '../ui/Icons';
import '../../styles/components/blocks.css';

export function BlockRenderer({ blocks = [], onBlocksChange }) {
  const [activeFocusIndex, setActiveFocusIndex] = useState(null);

  const parsedBlocks = Array.isArray(blocks)
    ? blocks
    : typeof blocks === 'string'
    ? (() => {
        try {
          return JSON.parse(blocks);
        } catch {
          return [{ id: 'b_init', type: 'text', content: blocks }];
        }
      })()
    : [];

  const handleUpdateBlock = (index, changes) => {
    const next = [...parsedBlocks];
    next[index] = { ...next[index], ...changes };
    onBlocksChange(next);
  };

  const handleInsertBlock = (index, type, extraProps = {}) => {
    const newBlock = {
      id: 'b_' + Math.random().toString(36).substring(2, 9),
      type,
      ...extraProps,
    };
    if (type === 'checklist' && !newBlock.items) {
      newBlock.items = [{ id: 'i_' + Math.random().toString(36).substring(2, 9), text: '', checked: false }];
    }
    const next = [...parsedBlocks];
    next.splice(index + 1, 0, newBlock);
    onBlocksChange(next);
    setActiveFocusIndex(index + 1);
  };

  const handleDeleteBlock = (index) => {
    if (parsedBlocks.length <= 1) {
      onBlocksChange([{ id: 'b_reset', type: 'text', content: '' }]);
      return;
    }
    const next = parsedBlocks.filter((_, idx) => idx !== index);
    onBlocksChange(next);
    setActiveFocusIndex(Math.max(0, index - 1));
  };

  const blockMenuItems = (index) => [
    { label: 'Paragraph Text', icon: <FileTextIcon size={14} />, onClick: () => handleInsertBlock(index, 'text', { content: '' }) },
    { label: 'Heading 1', icon: <span style={{ fontWeight: 700, fontSize: 13 }}>H1</span>, onClick: () => handleInsertBlock(index, 'heading', { level: 1, content: '' }) },
    { label: 'Heading 2', icon: <span style={{ fontWeight: 600, fontSize: 12 }}>H2</span>, onClick: () => handleInsertBlock(index, 'heading', { level: 2, content: '' }) },
    { label: 'Heading 3', icon: <span style={{ fontWeight: 600, fontSize: 11 }}>H3</span>, onClick: () => handleInsertBlock(index, 'heading', { level: 3, content: '' }) },
    { label: 'Checklist', icon: <CheckIcon size={14} />, onClick: () => handleInsertBlock(index, 'checklist') },
    { label: 'Divider', icon: <span style={{ fontSize: 14 }}>—</span>, onClick: () => handleInsertBlock(index, 'divider') },
  ];

  return (
    <div className="blocks-container">
      {parsedBlocks.map((block, index) => {
        const isFocused = activeFocusIndex === index;

        return (
          <div key={block.id || index} className="block-row-wrapper group">
            <div className="block-actions-left">
              <Dropdown
                align="left"
                trigger={
                  <button type="button" className="block-add-btn" title="Add block below">
                    <PlusIcon size={11} />
                  </button>
                }
                items={blockMenuItems(index)}
              />
            </div>

            <div className="block-content-main">
              {block.type === 'text' && (
                <TextBlock
                  block={block}
                  onChange={(changes) => handleUpdateBlock(index, changes)}
                  onEnter={() => handleInsertBlock(index, 'text', { content: '' })}
                  onBackspaceEmpty={() => handleDeleteBlock(index)}
                  autoFocus={isFocused}
                />
              )}

              {block.type === 'heading' && (
                <HeadingBlock
                  block={block}
                  onChange={(changes) => handleUpdateBlock(index, changes)}
                  onEnter={() => handleInsertBlock(index, 'text', { content: '' })}
                  onBackspaceEmpty={() => handleDeleteBlock(index)}
                  autoFocus={isFocused}
                />
              )}

              {block.type === 'checklist' && (
                <ChecklistBlock
                  block={block}
                  onChange={(changes) => handleUpdateBlock(index, changes)}
                  onEnter={() => handleInsertBlock(index, 'checklist')}
                  onBackspaceEmpty={() => handleDeleteBlock(index)}
                />
              )}

              {block.type === 'divider' && (
                <DividerBlock onBackspaceEmpty={() => handleDeleteBlock(index)} />
              )}
            </div>
          </div>
        );
      })}

      {parsedBlocks.length === 0 && (
        <button
          type="button"
          className="empty-blocks-add-btn"
          onClick={() => handleInsertBlock(-1, 'text', { content: '' })}
        >
          <PlusIcon size={12} style={{ display: 'inline', marginRight: '6px' }} />
          <span>Click to write note or description...</span>
        </button>
      )}
    </div>
  );
}

export default BlockRenderer;
