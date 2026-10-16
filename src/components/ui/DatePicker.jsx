import React, { useState, useRef, useEffect } from 'react';
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
import { formatDate, isOverdue } from '../../utils/date';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons';
import '../../styles/components/datepicker.css';

export function DatePicker({
  value,
  onChange,
  placeholder = 'Add due date',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const initialDate = value && isValid(parseISO(value)) ? parseISO(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : null;
  const overdue = value ? isOverdue(value) : false;

  const renderDaysHeader = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <div className="datepicker-days-header">
        {days.map((d) => (
          <div key={d} className="datepicker-day-name">
            {d}
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
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isTodayDate = isSameDay(day, new Date());

        days.push(
          <button
            key={day.toISOString()}
            type="button"
            className={`datepicker-cell ${
              !isCurrentMonth ? 'outside' : ''
            } ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
            onClick={() => {
              onChange(format(cloneDay, 'yyyy-MM-dd'));
              setIsOpen(false);
            }}
          >
            <span>{format(day, 'd')}</span>
            {isTodayDate && !isSelected && <span className="today-dot" />}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} className="datepicker-week-row">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="datepicker-grid">{rows}</div>;
  };

  return (
    <div className={`datepicker-container ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`datepicker-trigger ${value ? 'has-value' : ''} ${overdue ? 'overdue' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <CalendarIcon size={12} className="datepicker-icon" />
        <span className="datepicker-label">{value ? formatDate(value) : placeholder}</span>
        {value && (
          <span
            className="datepicker-clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            title="Clear date"
          >
            <CloseIcon size={10} />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="datepicker-dropdown anim-slide-down">
          <div className="datepicker-header">
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            >
              <ChevronLeftIcon size={14} />
            </button>
            <span className="datepicker-month-title">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>

          {renderDaysHeader()}
          {renderCells()}

          <div className="datepicker-footer">
            <button
              type="button"
              className="datepicker-quick-btn"
              onClick={() => {
                onChange(format(new Date(), 'yyyy-MM-dd'));
                setIsOpen(false);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="datepicker-quick-btn"
              onClick={() => {
                onChange(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
                setIsOpen(false);
              }}
            >
              Tomorrow
            </button>
            {value && (
              <button
                type="button"
                className="datepicker-quick-btn danger"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
