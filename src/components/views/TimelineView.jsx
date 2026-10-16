import React, { useState, useMemo } from 'react';
import {
  format,
  addDays,
  subDays,
  differenceInDays,
  parseISO,
  isValid,
  isToday,
} from 'date-fns';
import { useTaskStore } from '../../store/useTaskStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { TimelineIcon } from '../ui/Icons';
import '../../styles/components/timeline.css';

export function TimelineView() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const tasks = useTaskStore((state) => state.tasks);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  const [zoom, setZoom] = useState('week'); // day | week | month
  const [centerDate, setCenterDate] = useState(new Date());

  const dayWidth = zoom === 'day' ? 60 : zoom === 'week' ? 36 : 14;
  const totalDays = zoom === 'day' ? 30 : zoom === 'week' ? 60 : 120;

  const startDate = useMemo(() => {
    return subDays(centerDate, Math.floor(totalDays / 3));
  }, [centerDate, totalDays]);

  const daysArray = useMemo(() => {
    const list = [];
    for (let i = 0; i < totalDays; i++) {
      list.push(addDays(startDate, i));
    }
    return list;
  }, [startDate, totalDays]);

  if (!activePage) {
    return (
      <div className="empty-view-state">
        <TimelineIcon size={44} color="var(--border)" />
        <h3>No Page Selected</h3>
      </div>
    );
  }

  return (
    <div className="timeline-view-container anim-fade-in">
      {/* Timeline Controls */}
      <div className="timeline-controls-bar">
        <div className="timeline-zoom-group">
          <span className="timeline-label">Granularity:</span>
          <button
            type="button"
            className={`zoom-btn ${zoom === 'day' ? 'active' : ''}`}
            onClick={() => setZoom('day')}
          >
            Day
          </button>
          <button
            type="button"
            className={`zoom-btn ${zoom === 'week' ? 'active' : ''}`}
            onClick={() => setZoom('week')}
          >
            Week
          </button>
          <button
            type="button"
            className={`zoom-btn ${zoom === 'month' ? 'active' : ''}`}
            onClick={() => setZoom('month')}
          >
            Month
          </button>
        </div>

        <button
          type="button"
          className="timeline-today-btn"
          onClick={() => setCenterDate(new Date())}
        >
          Jump to Today
        </button>
      </div>

      <div className="timeline-chart-frame">
        {/* Left Column: Fixed Task List */}
        <div className="timeline-tasks-sidebar">
          <div className="timeline-sidebar-header">Tasks ({tasks.length})</div>
          <div className="timeline-sidebar-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="timeline-task-row-label"
                onClick={() => setActiveTaskId(task.id)}
              >
                <span className="task-row-status-dot" data-status={task.status} />
                <span className="task-row-text">{task.title || 'Untitled task'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area: Horizontal Scrollable Timeline Canvas */}
        <div className="timeline-axis-canvas">
          {/* Header Row: Dates */}
          <div
            className="timeline-header-row"
            style={{ width: `${totalDays * dayWidth}px` }}
          >
            {daysArray.map((day) => {
              const isTodayDay = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`timeline-day-col-header ${isTodayDay ? 'is-today' : ''}`}
                  style={{ width: `${dayWidth}px` }}
                >
                  <span className="day-name">{format(day, 'EEE')[0]}</span>
                  <span className="day-number">{format(day, 'd')}</span>
                  {format(day, 'd') === '1' && (
                    <span className="month-tag">{format(day, 'MMM')}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid Rows for Tasks */}
          <div
            className="timeline-bars-body"
            style={{ width: `${totalDays * dayWidth}px` }}
          >
            {tasks.map((task) => {
              let barLeft = null;
              let barWidth = Math.max(dayWidth * 2, 70);

              if (task.due_date) {
                try {
                  const dueDate = parseISO(task.due_date);
                  if (isValid(dueDate)) {
                    const diffDays = differenceInDays(dueDate, startDate);
                    if (diffDays >= 0 && diffDays < totalDays) {
                      barLeft = diffDays * dayWidth;
                    }
                  }
                } catch {}
              }

              return (
                <div key={task.id} className="timeline-bar-row">
                  {barLeft !== null ? (
                    <div
                      className={`timeline-task-bar ${task.status === 'done' ? 'is-done' : ''}`}
                      style={{
                        left: `${barLeft}px`,
                        width: `${barWidth}px`,
                        backgroundColor: task.color || 'var(--burgundy)',
                      }}
                      onClick={() => setActiveTaskId(task.id)}
                      title={`${task.title} (Due: ${task.due_date})`}
                    >
                      <span className="bar-label">{task.title || 'Untitled'}</span>
                    </div>
                  ) : (
                    <div className="no-date-hint">No due date</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineView;
