import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import BlockRenderer from './blocks/BlockRenderer';
import DatePicker from './ui/DatePicker';
import TagBadge from './ui/TagBadge';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { formatDate } from '../utils/date';
import { CloseIcon, TrashIcon, renderPageIcon } from './ui/Icons';
import '../styles/components/taskdetail.css';

const PRESET_COLORS = [
  { label: 'None', value: null },
  { label: 'Burgundy', value: '#800020' },
  { label: 'Coral', value: '#D45060' },
  { label: 'Amber', value: '#E89B3E' },
  { label: 'Emerald', value: '#3E9E72' },
  { label: 'Sky', value: '#4A90D9' },
  { label: 'Purple', value: '#7E57C2' },
];

export function TaskDetailPanel() {
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const activePage = useWorkspaceStore((state) => state.activePage);
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const task = tasks.find((t) => t.id === activeTaskId);

  if (!task) return null;

  const currentTags = Array.isArray(task.tags)
    ? task.tags
    : typeof task.tags === 'string'
    ? (() => {
        try {
          return JSON.parse(task.tags);
        } catch {
          return [];
        }
      })()
    : [];

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (!currentTags.includes(val)) {
        const next = [...currentTags, val];
        updateTask(task.id, { tags: next });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const next = currentTags.filter((t) => t !== tagToRemove);
    updateTask(task.id, { tags: next });
  };

  const handleBlocksChange = (nextBlocks) => {
    updateTask(task.id, { content: nextBlocks });
  };

  return (
    <>
      <div className="task-detail-overlay" onClick={() => setActiveTaskId(null)}>
        <aside
          className="task-detail-panel anim-slide-in-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="detail-top-bar">
            <span className="detail-breadcrumb">
              {activePage && renderPageIcon(activePage.icon, { size: 14, style: { display: 'inline', marginRight: '6px' } })}
              {activePage?.title || 'Workspace'} / Task Details
            </span>
            <button
              type="button"
              className="detail-close-btn"
              onClick={() => setActiveTaskId(null)}
              aria-label="Close detail panel"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          {/* Color accent line */}
          {task.color && (
            <div className="detail-color-strip" style={{ backgroundColor: task.color }} />
          )}

          <div className="detail-scroll-area">
            {/* Title */}
            <div className="detail-title-wrapper">
              <input
                type="text"
                className="detail-title-input"
                value={task.title || ''}
                placeholder="Task title..."
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
              />
            </div>

            {/* Properties Grid */}
            <div className="detail-properties-table">
              {/* Status */}
              <div className="property-row">
                <span className="property-label">Status</span>
                <div className="property-value">
                  <select
                    className="property-select"
                    value={task.status || 'todo'}
                    onChange={(e) => updateTask(task.id, { status: e.target.value })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div className="property-row">
                <span className="property-label">Priority</span>
                <div className="property-value">
                  <select
                    className="property-select"
                    value={task.priority || 'none'}
                    onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="property-row">
                <span className="property-label">Due Date</span>
                <div className="property-value">
                  <DatePicker
                    value={task.due_date}
                    onChange={(newDate) => updateTask(task.id, { due_date: newDate })}
                  />
                </div>
              </div>

              {/* Color Accent */}
              <div className="property-row">
                <span className="property-label">Accent Color</span>
                <div className="property-value color-picker-row">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      className={`color-swatch-btn ${task.color === c.value ? 'selected' : ''}`}
                      style={{ backgroundColor: c.value || 'var(--warm-cream)' }}
                      title={c.label}
                      onClick={() => updateTask(task.id, { color: c.value })}
                    />
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="property-row">
                <span className="property-label">Tags</span>
                <div className="property-value tags-cell-value">
                  <div className="tags-list-inline">
                    {currentTags.map((tag) => (
                      <TagBadge
                        key={tag}
                        label={tag}
                        onRemove={() => handleRemoveTag(tag)}
                      />
                    ))}
                    <input
                      type="text"
                      className="add-tag-inline-input"
                      placeholder="+ Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-divider" />

            {/* Block Content Editor */}
            <div className="detail-blocks-section">
              <h4 className="detail-section-heading">Description & Notes</h4>
              <BlockRenderer
                blocks={task.content}
                onBlocksChange={handleBlocksChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="detail-footer">
            <div className="detail-timestamps">
              <span>Created {formatDate(task.created_at) || 'recently'}</span>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<TrashIcon size={13} />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Task
            </Button>
          </div>
        </aside>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Task"
        size="sm"
      >
        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
          Are you sure you want to delete &ldquo;{task.title || 'Untitled task'}&rdquo;? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteTask(task.id);
              setShowDeleteConfirm(false);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default TaskDetailPanel;
