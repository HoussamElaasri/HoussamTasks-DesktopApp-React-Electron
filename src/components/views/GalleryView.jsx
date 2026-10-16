import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import TagBadge from '../ui/TagBadge';
import { formatDate, isOverdue } from '../../utils/date';
import { GalleryIcon, CalendarIcon, PlusIcon } from '../ui/Icons';
import '../../styles/components/gallery.css';

export function GalleryView() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  const handleCreateCard = async () => {
    if (!activePage) return;
    const newTask = await createTask({
      page_id: activePage.id,
      title: 'New visual card',
      status: 'todo',
      color: '#800020',
    });
    if (newTask) {
      setActiveTaskId(newTask.id);
    }
  };

  const getPreviewText = (task) => {
    if (!task.content) return '';
    try {
      const blocks = typeof task.content === 'string' ? JSON.parse(task.content) : task.content;
      if (Array.isArray(blocks) && blocks.length > 0) {
        const textBlock = blocks.find((b) => b.type === 'text' || b.type === 'heading');
        if (textBlock && textBlock.content) return textBlock.content;
      }
    } catch {}
    return '';
  };

  if (!activePage) {
    return (
      <div className="empty-view-state">
        <GalleryIcon size={44} color="var(--border)" />
        <h3>No Page Selected</h3>
      </div>
    );
  }

  return (
    <div className="gallery-view-container anim-fade-in">
      <div className="gallery-grid">
        {tasks.map((task) => {
          const preview = getPreviewText(task);
          const overdue = task.due_date ? isOverdue(task.due_date) : false;

          const tags = Array.isArray(task.tags)
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

          return (
            <div
              key={task.id}
              className="gallery-card"
              onClick={() => setActiveTaskId(task.id)}
            >
              {/* Cover Banner */}
              <div
                className="gallery-card-cover"
                style={{
                  background: task.color
                    ? task.color
                    : 'linear-gradient(135deg, var(--burgundy) 0%, #D45060 100%)',
                }}
              >
                <span className="gallery-status-badge" data-status={task.status}>
                  {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                </span>
              </div>

              {/* Card Body */}
              <div className="gallery-card-body">
                <h3 className="gallery-card-title">{task.title || 'Untitled card'}</h3>
                {preview && <p className="gallery-card-preview">{preview}</p>}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="gallery-card-tags">
                    {tags.slice(0, 3).map((tag) => (
                      <TagBadge key={tag} label={tag} />
                    ))}
                  </div>
                )}

                {/* Footer: Due date */}
                {task.due_date && (
                  <div className={`gallery-card-due ${overdue && task.status !== 'done' ? 'overdue' : ''}`}>
                    <CalendarIcon size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Card */}
        <div className="gallery-card-add" onClick={handleCreateCard}>
          <PlusIcon size={24} className="gallery-add-plus" />
          <span className="gallery-add-text">Add Card</span>
        </div>
      </div>
    </div>
  );
}

export default GalleryView;
