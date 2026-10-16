import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
  isValid,
} from 'date-fns';
import { useTaskStore } from '../../store/useTaskStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { isOverdue } from '../../utils/date';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../ui/Icons';
import '../../styles/components/calendar.css';

export function CalendarView() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleDayClick = async (dateObj) => {
    if (!activePage) return;
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const newTask = await createTask({
      page_id: activePage.id,
      title: 'New scheduled task',
      due_date: dateStr,
      status: 'todo',
    });
    if (newTask) {
      setActiveTaskId(newTask.id);
    }
  };

  const renderDaysHeader = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="calendar-grid-header">
        {days.map((day) => (
          <div key={day} className="calendar-weekday-title">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isTodayDate = isSameDay(day, new Date());

        const dayTasks = tasks.filter((t) => {
          if (!t.due_date) return false;
          try {
            const parsed = parseISO(t.due_date);
            return isValid(parsed) && isSameDay(parsed, cloneDay);
          } catch {
            return false;
          }
        });

        days.push(
          <div
            key={day.toISOString()}
            className={`calendar-day-cell ${!isCurrentMonth ? 'outside-month' : ''} ${
              isTodayDate ? 'is-today' : ''
            }`}
            onClick={() => handleDayClick(cloneDay)}
          >
            <div className="calendar-cell-top">
              <span className={`calendar-cell-num ${isTodayDate ? 'today-pill' : ''}`}>
                {format(day, 'd')}
              </span>
            </div>

            <div className="calendar-cell-tasks">
              {dayTasks.slice(0, 3).map((task) => {
                const overdue = isOverdue(task.due_date) && task.status !== 'done';

                return (
                  <div
                    key={task.id}
                    className={`calendar-task-chip ${task.status === 'done' ? 'is-done' : ''} ${
                      overdue ? 'is-overdue' : ''
                    }`}
                    style={{
                      borderLeftColor: task.color || (overdue ? 'var(--coral-red)' : 'var(--burgundy)'),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTaskId(task.id);
                    }}
                    title={task.title}
                  >
                    <span className="chip-title">{task.title || 'Untitled task'}</span>
                  </div>
                );
              })}

              {dayTasks.length > 3 && (
                <div className="calendar-more-link">+{dayTasks.length - 3} more</div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} className="calendar-grid-row">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="calendar-grid-body">{rows}</div>;
  };

  if (!activePage) {
    return (
      <div className="empty-view-state">
        <CalendarIcon size={44} color="var(--border)" />
        <h3>No Page Selected</h3>
      </div>
    );
  }

  return (
    <div className="calendar-view-container anim-fade-in">
      <div className="calendar-nav-toolbar">
        <div className="calendar-nav-left">
          <h2 className="calendar-month-heading">{format(currentMonth, 'MMMM yyyy')}</h2>
        </div>
        <div className="calendar-nav-controls">
          <button
            type="button"
            className="cal-btn"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </button>
          <button
            type="button"
            className="cal-btn-icon"
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            title="Previous month"
          >
            <ChevronLeftIcon size={14} />
          </button>
          <button
            type="button"
            className="cal-btn-icon"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            title="Next month"
          >
            <ChevronRightIcon size={14} />
          </button>
        </div>
      </div>

      <div className="calendar-main-grid">
        {renderDaysHeader()}
        {renderCells()}
      </div>
    </div>
  );
}

export default CalendarView;
