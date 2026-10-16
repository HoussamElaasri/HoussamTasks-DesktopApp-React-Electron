import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useUIStore } from '../../store/useUIStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
  PlusIcon,
  SearchIcon,
  ChevronLeftIcon,
  EditIcon,
  PaletteIcon,
  TrashIcon,
  HomeIcon,
  FileTextIcon,
  FolderIcon,
  TargetIcon,
  SparklesIcon,
  StarIcon,
  BriefcaseIcon,
  BookIcon,
  CodeIcon,
  ZapIcon,
  renderPageIcon,
} from '../ui/Icons';
import '../../styles/components/sidebar.css';

const ICON_CHOICES = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'file', label: 'Document', icon: FileTextIcon },
  { key: 'folder', label: 'Projects', icon: FolderIcon },
  { key: 'target', label: 'Goals', icon: TargetIcon },
  { key: 'sparkles', label: 'Ideas', icon: SparklesIcon },
  { key: 'star', label: 'Starred', icon: StarIcon },
  { key: 'briefcase', label: 'Work', icon: BriefcaseIcon },
  { key: 'book', label: 'Notes', icon: BookIcon },
  { key: 'code', label: 'Dev', icon: CodeIcon },
  { key: 'palette', label: 'Design', icon: PaletteIcon },
  { key: 'zap', label: 'Quick', icon: ZapIcon },
];

export function Sidebar() {
  const pages = useWorkspaceStore((state) => state.pages);
  const activePage = useWorkspaceStore((state) => state.activePage);
  const sidebarOpen = useWorkspaceStore((state) => state.sidebarOpen);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const createPage = useWorkspaceStore((state) => state.createPage);
  const updatePage = useWorkspaceStore((state) => state.updatePage);
  const deletePage = useWorkspaceStore((state) => state.deletePage);
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar);

  const tasks = useTaskStore((state) => state.tasks);
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);
  const openContextMenu = useUIStore((state) => state.openContextMenu);

  const [editingPageId, setEditingPageId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [iconModalPageId, setIconModalPageId] = useState(null);
  const [deleteModalPage, setDeleteModalPage] = useState(null);

  const handleCreateNewPage = async () => {
    const newPage = await createPage('New Page', 'file');
    if (newPage) {
      setEditingPageId(newPage.id);
      setEditingTitle(newPage.title);
    }
  };

  const handleStartRename = (page) => {
    setEditingPageId(page.id);
    setEditingTitle(page.title);
  };

  const handleSaveRename = (pageId) => {
    if (editingTitle.trim()) {
      updatePage(pageId, { title: editingTitle.trim() });
    }
    setEditingPageId(null);
  };

  const handleContextMenu = (e, page) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, [
      {
        label: 'Rename Page',
        icon: <EditIcon size={14} />,
        onClick: () => handleStartRename(page),
      },
      {
        label: 'Change Icon',
        icon: <PaletteIcon size={14} />,
        onClick: () => setIconModalPageId(page.id),
      },
      { separator: true },
      {
        label: 'Delete Page',
        icon: <TrashIcon size={14} />,
        danger: true,
        onClick: () => setDeleteModalPage(page),
      },
    ]);
  };

  const completedCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <>
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-card drag-region">
          <div className="sidebar-brand-inner no-drag">
            <div className="sidebar-logo-frame">
              <img
                src="./Assets/logo.png"
                alt="Logo"
                className="sidebar-logo-img"
                onError={(e) => {
                  if (e.target.src.indexOf('Assets') !== -1) {
                    e.target.src = './logo.png';
                  }
                }}
              />
            </div>
            <div className="sidebar-brand-titles">
              <span className="sidebar-brand-name">HoussamTasks</span>
              <span className="sidebar-brand-sub">Workspace</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-collapse-toggle no-drag"
            onClick={toggleSidebar}
            title="Collapse Sidebar (Ctrl+\)"
          >
            <ChevronLeftIcon size={16} />
          </button>
        </div>

        {/* Quick Action Navigation */}
        <div className="sidebar-actions-panel">
          <button
            type="button"
            className="sidebar-action-btn new-page-action"
            onClick={handleCreateNewPage}
          >
            <PlusIcon size={15} className="action-icon-svg" />
            <span>New Page</span>
          </button>

          <button
            type="button"
            className="sidebar-action-btn search-action"
            onClick={openCommandPalette}
          >
            <SearchIcon size={15} className="action-icon-svg" />
            <span>Search</span>
            <span className="sidebar-shortcut-hint">Ctrl+K</span>
          </button>
        </div>

        {/* Workspace Pages Tree */}
        <div className="sidebar-pages-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">Pages</span>
            <button
              type="button"
              className="sidebar-section-add-btn"
              onClick={handleCreateNewPage}
              title="Add Page"
            >
              <PlusIcon size={12} />
            </button>
          </div>

          <nav className="sidebar-pages-list">
            {pages.map((page) => {
              const isActive = activePage?.id === page.id;
              const isEditing = editingPageId === page.id;

              return (
                <div
                  key={page.id}
                  className={`sidebar-page-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActivePage(page.id)}
                  onContextMenu={(e) => handleContextMenu(e, page)}
                >
                  <span
                    className="sidebar-page-icon-wrapper"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIconModalPageId(page.id);
                    }}
                    title="Change icon"
                  >
                    {renderPageIcon(page.icon, { size: 16, color: isActive ? '#FFF9F2' : '#F3E6D5' })}
                  </span>

                  {isEditing ? (
                    <input
                      type="text"
                      className="sidebar-rename-input"
                      value={editingTitle}
                      autoFocus
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleSaveRename(page.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(page.id);
                        else if (e.key === 'Escape') setEditingPageId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="sidebar-page-title">{page.title}</span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sleek Workspace Footer */}
        <div className="sidebar-footer-card">
          <div className="sidebar-footer-info">
            <div className="sidebar-task-stat-row">
              <span className="sidebar-stat-label">Tasks completed</span>
              <span className="sidebar-stat-val">
                {completedCount}/{tasks.length}
              </span>
            </div>
            <div className="sidebar-mini-progress-bar">
              <div
                className="sidebar-progress-fill"
                style={{
                  width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Modern Icon Picker Modal */}
      <Modal
        isOpen={Boolean(iconModalPageId)}
        onClose={() => setIconModalPageId(null)}
        title="Select Page Icon"
        size="sm"
      >
        <div className="modern-icon-picker-grid">
          {ICON_CHOICES.map((choice) => {
            const IconComponent = choice.icon;
            return (
              <button
                key={choice.key}
                type="button"
                className="icon-choice-tile"
                onClick={() => {
                  if (iconModalPageId) {
                    updatePage(iconModalPageId, { icon: choice.key });
                    setIconModalPageId(null);
                  }
                }}
              >
                <IconComponent size={22} color="var(--burgundy)" />
                <span className="icon-choice-label">{choice.label}</span>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Delete Page Confirmation */}
      <Modal
        isOpen={Boolean(deleteModalPage)}
        onClose={() => setDeleteModalPage(null)}
        title="Delete Page"
        size="sm"
      >
        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
          Are you sure you want to delete &ldquo;{deleteModalPage?.title}&rdquo; and all its tasks?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="ghost" onClick={() => setDeleteModalPage(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deleteModalPage) {
                deletePage(deleteModalPage.id);
                setDeleteModalPage(null);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default Sidebar;
