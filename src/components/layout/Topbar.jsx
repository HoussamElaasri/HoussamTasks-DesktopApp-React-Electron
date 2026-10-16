import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useUIStore } from '../../store/useUIStore';
import Dropdown from '../ui/Dropdown';
import {
  ListIcon,
  BoardIcon,
  TableIcon,
  CalendarIcon,
  TimelineIcon,
  GalleryIcon,
  MindMapIcon,
  SearchIcon,
  PlusIcon,
  MenuIcon,
  renderPageIcon,
} from '../ui/Icons';
import '../../styles/components/topbar.css';

const VIEW_ICONS = {
  list: ListIcon,
  board: BoardIcon,
  table: TableIcon,
  calendar: CalendarIcon,
  timeline: TimelineIcon,
  gallery: GalleryIcon,
  mindmap: MindMapIcon,
};

const VIEW_NAMES = {
  list: 'List',
  board: 'Board',
  table: 'Table',
  calendar: 'Calendar',
  timeline: 'Timeline',
  gallery: 'Gallery',
  mindmap: 'Mind Map',
};

export function Topbar() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const views = useWorkspaceStore((state) => state.views);
  const activeView = useWorkspaceStore((state) => state.activeView);
  const sidebarOpen = useWorkspaceStore((state) => state.sidebarOpen);
  const setActiveView = useWorkspaceStore((state) => state.setActiveView);
  const createView = useWorkspaceStore((state) => state.createView);
  const updatePage = useWorkspaceStore((state) => state.updatePage);
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar);

  const saving = useTaskStore((state) => state.saving);
  const lastSaved = useTaskStore((state) => state.lastSaved);
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [pageTitle, setPageTitle] = useState('');

  const handleTitleSubmit = () => {
    if (activePage && pageTitle.trim()) {
      updatePage(activePage.id, { title: pageTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleAddView = (type) => {
    if (activePage) {
      createView(activePage.id, type);
    }
  };

  const addViewDropdownItems = [
    { label: 'List View', icon: <ListIcon size={14} />, onClick: () => handleAddView('list') },
    { label: 'Board View', icon: <BoardIcon size={14} />, onClick: () => handleAddView('board') },
    { label: 'Table View', icon: <TableIcon size={14} />, onClick: () => handleAddView('table') },
    { label: 'Calendar View', icon: <CalendarIcon size={14} />, onClick: () => handleAddView('calendar') },
    { label: 'Timeline View', icon: <TimelineIcon size={14} />, onClick: () => handleAddView('timeline') },
    { label: 'Gallery View', icon: <GalleryIcon size={14} />, onClick: () => handleAddView('gallery') },
    { label: 'Mind Map View', icon: <MindMapIcon size={14} />, onClick: () => handleAddView('mindmap') },
  ];

  return (
    <header className="app-topbar drag-region">
      {/* Left section: Sidebar toggle + Page title */}
      <div className="topbar-left no-drag">
        {!sidebarOpen && (
          <button
            type="button"
            className="topbar-icon-btn sidebar-toggle-btn"
            onClick={toggleSidebar}
            title="Expand Sidebar"
          >
            <MenuIcon size={16} />
          </button>
        )}

        {activePage && (
          <div className="topbar-page-info">
            <span className="topbar-page-icon">
              {renderPageIcon(activePage.icon, { size: 18, color: 'var(--burgundy)' })}
            </span>
            {isEditingTitle ? (
              <input
                type="text"
                className="topbar-page-title-input"
                autoFocus
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  else if (e.key === 'Escape') setIsEditingTitle(false);
                }}
              />
            ) : (
              <h1
                className="topbar-page-title"
                onClick={() => {
                  setPageTitle(activePage.title);
                  setIsEditingTitle(true);
                }}
                title="Click to edit page title"
              >
                {activePage.title}
              </h1>
            )}
          </div>
        )}
      </div>

      {/* Middle section: View Tabs */}
      <div className="topbar-tabs-container no-drag">
        {views.map((v) => {
          const isActive = activeView?.id === v.id;
          const IconComponent = VIEW_ICONS[v.type] || ListIcon;
          const name = VIEW_NAMES[v.type] || v.type;

          return (
            <button
              key={v.id}
              type="button"
              className={`topbar-view-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveView(v.id)}
            >
              <IconComponent size={14} className="view-tab-icon" />
              <span className="view-tab-name">{name}</span>
            </button>
          );
        })}

        {activePage && (
          <Dropdown
            align="left"
            trigger={
              <button type="button" className="topbar-add-view-tab" title="Add a view">
                <PlusIcon size={12} />
                <span>View</span>
              </button>
            }
            items={addViewDropdownItems}
          />
        )}
      </div>

      {/* Right section: Auto-save status + Global Search (leaving room for Windows native titlebar buttons) */}
      <div className="topbar-right no-drag">
        {/* Auto-save status */}
        <div className="topbar-save-status">
          {saving ? (
            <span className="status-saving">
              <span className="status-spinner anim-spin">◌</span> Saving...
            </span>
          ) : lastSaved ? (
            <span className="status-saved">Saved ✓</span>
          ) : null}
        </div>

        {/* Global Search button */}
        <button
          type="button"
          className="topbar-icon-btn search-trigger-btn"
          onClick={openCommandPalette}
          title="Search / Command Palette (Ctrl+K)"
        >
          <SearchIcon size={15} />
        </button>

        {/* Space reserved for Windows native titleBarOverlay window buttons */}
        <div className="topbar-native-overlay-spacer" />
      </div>
    </header>
  );
}

export default Topbar;
