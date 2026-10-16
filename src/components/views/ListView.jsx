import React, { useState } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import Checkbox from '../ui/Checkbox';
import TagBadge from '../ui/TagBadge';
import { isOverdue, formatDate } from '../../utils/date';
import {
  StatusTodoIcon,
  StatusInProgressIcon,
  StatusDoneIcon,
  CalendarIcon,
  TrashIcon,
  FileTextIcon,
  PriorityFlagIcon,
} from '../ui/Icons';
import '../../styles/components/list.css';

const GROUPS = [
  { status: 'todo', label: 'To Do', icon: StatusTodoIcon },
  { status: 'in_progress', label: 'In Progress', icon: StatusInProgressIcon },
  { status: 'done', label: 'Done', icon: StatusDoneIcon },
];

export function ListView() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTitleByGroup, setNewTitleByGroup] = useState({});

  const handleCreateTask = async (status) => {
    if (!activePage) return;
    const title = newTitleByGroup[status]?.trim() || '';
    const newTask = await createTask({
      page_id: activePage.id,
      title: title || 'New task',
      status,
      priority: 'none',
    });
    setNewTitleByGroup((prev) => ({ ...prev, [status]: '' }));
    if (newTask) {
      setEditingTaskId(newTask.id);
    }
  };

  const handleToggleTask = (task) => {
    const isDone = task.status === 'done';
    updateTask(task.id, {
      status: isDone ? 'todo' : 'done',
    });
  };

  if (!activePage) {
    return (
      <div className="empty-view-state">
        <FileTextIcon size={44} color="var(--border)" />
        <h3>No Page Selected</h3>
        <p>Select or create a page in the sidebar to start organizing.</p>
      </div>
    );
  }

  return (
    <div className="list-view-container anim-fade-in">
      {GROUPS.map((group) => {
        const groupTasks = tasks.filter((t) => (t.status || 'todo') === group.status);
        const GroupIcon = group.icon;

        return (
          <section key={group.status} className="list-group-section">
            <header className="list-group-header">
              <GroupIcon size={16} />
              <h3 className="list-group-title">{group.label}</h3>
              <span className="list-group-count">{groupTasks.length}</span>
            </header>

            <div className="list-group-items">
              {groupTasks.map((task) => {
                const isCompleted = task.status === 'done';
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

                const isEditing = editingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`list-task-row ${isCompleted ? 'is-completed' : ''}`}
                    onClick={() => setActiveTaskId(task.id)}
                  >
                    {/* Priority indicator flag */}
                    {task.priority && task.priority !== 'none' && (
                      <div className="task-priority-indicator">
                        <PriorityFlagIcon priority={task.priority} size={14} />
                      </div>
                    )}

                    <div
                      className="task-checkbox-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        size="sm"
                        checked={isCompleted}
                        onChange={() => handleToggleTask(task)}
                      />
                    </div>

                    <div className="task-title-col">
                      {isEditing ? (
                        <input
                          type="text"
                          className="list-title-input"
                          autoFocus
                          value={task.title}
                          onChange={(e) => updateTask(task.id, { title: e.target.value })}
                          onBlur={() => setEditingTaskId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingTaskId(null);
                            } else if (e.key === 'Escape') {
                              setEditingTaskId(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className={`list-task-title ${isCompleted ? 'anim-strikethrough' : ''}`}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingTaskId(task.id);
                          }}
                        >
                          {task.title || 'Untitled task'}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="task-tags-col" onClick={(e) => e.stopPropagation()}>
                        {tags.map((tag) => (
                          <TagBadge key={tag} label={tag} />
                        ))}
                      </div>
                    )}

                    {/* Due Date */}
                    {task.due_date && (
                      <div
                        className={`task-date-col ${overdue && !isCompleted ? 'overdue' : ''}`}
                        title={overdue ? 'Overdue!' : ''}
                      >
                        <CalendarIcon size={12} />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="task-row-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="task-delete-quick-btn"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add task row */}
              <div className="list-add-task-row">
                <input
                  type="text"
                  className="list-add-input"
                  placeholder={`+ New task in ${group.label}...`}
                  value={newTitleByGroup[group.status] || ''}
                  onChange={(e) =>
                    setNewTitleByGroup((prev) => ({
                      ...prev,
                      [group.status]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTask(group.status);
                    }
                  }}
                />
                {newTitleByGroup[group.status] && (
                  <button
                    type="button"
                    className="list-add-submit-btn"
                    onClick={() => handleCreateTask(group.status)}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default ListView;
