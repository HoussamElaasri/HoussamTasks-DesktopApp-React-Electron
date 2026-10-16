import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useTaskStore } from '../store/useTaskStore';
import { highlightMatch } from '../utils/search';
import {
  FileTextIcon,
  CheckIcon,
  ZapIcon,
  PlusIcon,
  ChevronLeftIcon,
  SearchIcon,
  renderPageIcon,
} from './ui/Icons';
import '../styles/components/commandpalette.css';

export function CommandPalette() {
  const isOpen = useUIStore((state) => state.commandPaletteOpen);
  const closeCommandPalette = useUIStore((state) => state.closeCommandPalette);

  const pages = useWorkspaceStore((state) => state.pages);
  const activePage = useWorkspaceStore((state) => state.activePage);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const createPage = useWorkspaceStore((state) => state.createPage);
  const setActiveView = useWorkspaceStore((state) => state.setActiveView);
  const views = useWorkspaceStore((state) => state.views);
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar);

  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct searchable items
  const q = query.trim().toLowerCase();

  // Pages
  const matchedPages = pages
    .filter((p) => !q || p.title.toLowerCase().includes(q))
    .map((p) => ({
      type: 'page',
      id: p.id,
      title: p.title,
      icon: renderPageIcon(p.icon, { size: 16 }),
      action: () => {
        setActivePage(p.id);
        closeCommandPalette();
      },
    }));

  // Tasks
  const matchedTasks = tasks
    .filter((t) => !q || t.title.toLowerCase().includes(q))
    .map((t) => ({
      type: 'task',
      id: t.id,
      title: t.title || 'Untitled task',
      icon: <CheckIcon size={15} color="var(--burgundy)" />,
      sub: activePage?.title,
      action: () => {
        setActiveTaskId(t.id);
        closeCommandPalette();
      },
    }));

  // Commands
  const allCommands = [
    {
      type: 'command',
      id: 'cmd-new-task',
      title: 'New Task in Current Page',
      icon: <PlusIcon size={15} color="var(--burgundy)" />,
      action: async () => {
        if (activePage) {
          const t = await createTask({ page_id: activePage.id, title: 'New Task' });
          if (t) setActiveTaskId(t.id);
        }
        closeCommandPalette();
      },
    },
    {
      type: 'command',
      id: 'cmd-new-page',
      title: 'Create New Page',
      icon: <FileTextIcon size={15} color="var(--burgundy)" />,
      action: async () => {
        await createPage('Untitled Page', 'file');
        closeCommandPalette();
      },
    },
    {
      type: 'command',
      id: 'cmd-toggle-sidebar',
      title: 'Toggle Sidebar',
      icon: <ChevronLeftIcon size={15} color="var(--burgundy)" />,
      action: () => {
        toggleSidebar();
        closeCommandPalette();
      },
    },
    ...views.map((v) => ({
      type: 'command',
      id: `cmd-view-${v.id}`,
      title: `Switch to ${v.type.toUpperCase()} view`,
      icon: <ZapIcon size={15} color="#E89B3E" />,
      action: () => {
        setActiveView(v.id);
        closeCommandPalette();
      },
    })),
  ];

  const matchedCommands = allCommands.filter(
    (c) => !q || c.title.toLowerCase().includes(q)
  );

  const allItems = [...matchedPages, ...matchedTasks, ...matchedCommands].slice(0, 15);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="palette-backdrop" onClick={closeCommandPalette}>
      <div
        className="palette-dialog anim-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="palette-input-bar">
          <SearchIcon size={18} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Search tasks, pages, or commands (Ctrl+K)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="palette-esc-badge">ESC</span>
        </div>

        <div className="palette-results-list">
          {allItems.map((item, index) => {
            const isSelected = selectedIndex === index;
            const parts = highlightMatch(item.title, query);

            return (
              <div
                key={item.id}
                className={`palette-item-row ${isSelected ? 'selected' : ''}`}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="palette-item-icon">{item.icon}</span>
                <div className="palette-item-text">
                  <span className="palette-item-title">
                    {parts.map((p, i) =>
                      p.highlight ? (
                        <mark key={i} className="search-highlight">
                          {p.text}
                        </mark>
                      ) : (
                        <span key={i}>{p.text}</span>
                      )
                    )}
                  </span>
                  {item.sub && <span className="palette-item-sub">{item.sub}</span>}
                </div>
                <span className="palette-item-type-tag">{item.type}</span>
              </div>
            );
          })}

          {allItems.length === 0 && (
            <div className="palette-empty-state">No matching tasks, pages, or commands.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
