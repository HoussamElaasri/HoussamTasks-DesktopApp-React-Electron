import React, { useState, useMemo } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import TagBadge from '../ui/TagBadge';
import DatePicker from '../ui/DatePicker';
import { formatDate } from '../../utils/date';
import { TableIcon, EditIcon, TrashIcon, PlusIcon } from '../ui/Icons';
import '../../styles/components/table.css';

export function TableView() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  const [sortField, setSortField] = useState('sort_order');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter
    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, sortField, sortAsc, filterQuery, filterStatus]);

  const handleAddRow = async () => {
    if (!activePage) return;
    await createTask({
      page_id: activePage.id,
      title: 'New task',
      status: 'todo',
      priority: 'none',
    });
  };

  if (!activePage) {
    return (
      <div className="empty-view-state">
        <TableIcon size={44} color="var(--border)" />
        <h3>No Page Selected</h3>
      </div>
    );
  }

  return (
    <div className="table-view-container anim-fade-in">
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div className="table-filter-group">
          <input
            type="text"
            className="table-search-input"
            placeholder="Filter table rows..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          <select
            className="table-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <button type="button" className="table-add-row-btn" onClick={handleAddRow}>
          <PlusIcon size={13} style={{ display: 'inline', marginRight: '4px' }} />
          <span>New Row</span>
        </button>
      </div>

      {/* Table Grid */}
      <div className="table-wrapper">
        <table className="tasks-data-table">
          <thead>
            <tr>
              <th className="th-title" onClick={() => handleSort('title')}>
                <span>Title {sortField === 'title' ? (sortAsc ? '↑' : '↓') : '↕'}</span>
              </th>
              <th className="th-status" onClick={() => handleSort('status')}>
                <span>Status {sortField === 'status' ? (sortAsc ? '↑' : '↓') : '↕'}</span>
              </th>
              <th className="th-priority" onClick={() => handleSort('priority')}>
                <span>Priority {sortField === 'priority' ? (sortAsc ? '↑' : '↓') : '↕'}</span>
              </th>
              <th className="th-due" onClick={() => handleSort('due_date')}>
                <span>Due Date {sortField === 'due_date' ? (sortAsc ? '↑' : '↓') : '↕'}</span>
              </th>
              <th className="th-tags">Tags</th>
              <th className="th-created" onClick={() => handleSort('created_at')}>
                <span>Created {sortField === 'created_at' ? (sortAsc ? '↑' : '↓') : '↕'}</span>
              </th>
              <th className="th-actions"></th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTasks.map((task) => {
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
                <tr key={task.id} className="table-row">
                  {/* Title */}
                  <td className="td-title">
                    <input
                      type="text"
                      className="cell-input"
                      value={task.title}
                      onChange={(e) => updateTask(task.id, { title: e.target.value })}
                      onDoubleClick={() => setActiveTaskId(task.id)}
                    />
                  </td>

                  {/* Status */}
                  <td className="td-status">
                    <select
                      className="cell-select"
                      value={task.status || 'todo'}
                      onChange={(e) => updateTask(task.id, { status: e.target.value })}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="td-priority">
                    <select
                      className="cell-select"
                      value={task.priority || 'none'}
                      onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                    >
                      <option value="none">None</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </td>

                  {/* Due Date */}
                  <td className="td-due">
                    <DatePicker
                      value={task.due_date}
                      onChange={(val) => updateTask(task.id, { due_date: val })}
                    />
                  </td>

                  {/* Tags */}
                  <td className="td-tags">
                    <div className="table-tags-container">
                      {tags.map((tag) => (
                        <TagBadge key={tag} label={tag} />
                      ))}
                    </div>
                  </td>

                  {/* Created */}
                  <td className="td-created">{formatDate(task.created_at)}</td>

                  {/* Actions */}
                  <td className="td-actions">
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => setActiveTaskId(task.id)}
                      title="Open task detail"
                    >
                      <EditIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className="table-action-btn danger"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAndSortedTasks.length === 0 && (
          <div className="table-empty-notice">
            No matching tasks found. Click &quot;+ New Row&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}

export default TableView;
