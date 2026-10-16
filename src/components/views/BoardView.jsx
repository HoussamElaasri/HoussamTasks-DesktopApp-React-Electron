import React, { useState } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import TagBadge from '../ui/TagBadge';
import { formatDate, isOverdue } from '../../utils/date';
import {
  StatusTodoIcon,
  StatusInProgressIcon,
  StatusDoneIcon,
  CalendarIcon,
  BoardIcon,
  PlusIcon,
} from '../ui/Icons';
import '../../styles/components/board.css';

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: StatusTodoIcon },
  { id: 'in_progress', title: 'In Progress', icon: StatusInProgressIcon },
  { id: 'done', title: 'Done', icon: StatusDoneIcon },
];

const PRIORITY_STRIPS = {
  high: 'var(--coral-red)',
  medium: '#E89B3E',
  low: '#4A90D9',
  none: 'transparent',
};

export function BoardView() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  const moveTask = useTaskStore((state) => state.moveTask);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [newCardTitleByCol, setNewCardTitleByCol] = useState({});
  const [activeAddCol, setActiveAddCol] = useState(null);

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTask(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleAddCard = async (status) => {
    if (!activePage) return;
    const title = newCardTitleByCol[status]?.trim();
    if (!title) return;

    await createTask({
      page_id: activePage.id,
      title,
      status,
      priority: 'none',
    });
    setNewCardTitleByCol((prev) => ({ ...prev, [status]: '' }));
    setActiveAddCol(null);
  };

  if (!activePage) {
    return (
      <div className="empty-view-state">
        <BoardIcon size={44} color="var(--border)" />
        <h3>No Page Selected</h3>
        <p>Select or create a page in the sidebar.</p>
      </div>
    );
  }

  return (
    <div className="board-view-container anim-fade-in">
      <div className="board-columns-scroll">
        {COLUMNS.map((column) => {
          const colTasks = tasks.filter((t) => (t.status || 'todo') === column.id);
          const isOver = dragOverCol === column.id;
          const ColIcon = column.icon;

          return (
            <div
              key={column.id}
              className={`board-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="board-column-header">
                <div className="board-column-title-group">
                  <ColIcon size={16} />
                  <h3 className="board-col-title">{column.title}</h3>
                  <span className="board-col-count">{colTasks.length}</span>
                </div>
                <button
                  type="button"
                  className="board-col-add-btn"
                  onClick={() => setActiveAddCol(column.id)}
                  title="Add card"
                >
                  <PlusIcon size={14} />
                </button>
              </div>

              {/* Cards Container */}
              <div className="board-cards-list">
                {colTasks.map((task) => {
                  const priorityColor = PRIORITY_STRIPS[task.priority || 'none'];
                  const overdue = task.due_date ? isOverdue(task.due_date) : false;
                  const isDone = task.status === 'done';
                  const isDragging = draggedTaskId === task.id;

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
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setDragOverCol(null);
                      }}
                      className={`board-card ${isDragging ? 'is-dragging' : ''} ${
                        isDone ? 'is-done' : ''
                      }`}
                      onClick={() => setActiveTaskId(task.id)}
                    >
                      {/* Top color cover accent if defined */}
                      {task.color && (
                        <div
                          className="card-color-top"
                          style={{ backgroundColor: task.color }}
                        />
                      )}

                      {/* Left Priority strip */}
                      {task.priority && task.priority !== 'none' && (
                        <div
                          className="card-priority-strip"
                          style={{ backgroundColor: priorityColor }}
                        />
                      )}

                      <h4 className="board-card-title">{task.title || 'Untitled task'}</h4>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="board-card-tags">
                          {tags.slice(0, 3).map((tag) => (
                            <TagBadge key={tag} label={tag} />
                          ))}
                          {tags.length > 3 && (
                            <span className="tags-more-count">+{tags.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Card Footer: Due date */}
                      {task.due_date && (
                        <div
                          className={`board-card-due ${overdue && !isDone ? 'overdue' : ''}`}
                        >
                          <CalendarIcon size={12} />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Inline add card */}
                {activeAddCol === column.id ? (
                  <div className="board-inline-add-card">
                    <textarea
                      rows={2}
                      className="board-inline-input"
                      placeholder="Card title..."
                      autoFocus
                      value={newCardTitleByCol[column.id] || ''}
                      onChange={(e) =>
                        setNewCardTitleByCol((prev) => ({
                          ...prev,
                          [column.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddCard(column.id);
                        } else if (e.key === 'Escape') {
                          setActiveAddCol(null);
                        }
                      }}
                    />
                    <div className="board-inline-add-actions">
                      <button
                        type="button"
                        className="board-btn-add"
                        onClick={() => handleAddCard(column.id)}
                      >
                        Add Card
                      </button>
                      <button
                        type="button"
                        className="board-btn-cancel"
                        onClick={() => setActiveAddCol(null)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="board-add-card-placeholder"
                    onClick={() => setActiveAddCol(column.id)}
                  >
                    + Add a card
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BoardView;
