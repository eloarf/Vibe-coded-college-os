import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  BookOpen,
  Filter,
} from 'lucide-react';
import { AppState, Course, ClassSession, Task, Habit } from '../types';
import { formatDate, parseDate, addDays } from '../utils/streakEngine';

interface CalendarViewProps {
  state: AppState;
  onOpenTaskModal: (task?: Task | null, defaultDate?: string) => void;
  onOpenClassModal: () => void;
  onOpenAttendanceModal: (course: Course, date: string) => void;
  onToggleHabit: (habitId: string, date: string) => void;
}

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarView: React.FC<CalendarViewProps> = ({
  state,
  onOpenTaskModal,
  onOpenClassModal,
  onOpenAttendanceModal,
  onToggleHabit,
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedDateStr = formatDate(selectedDate);
  const todayStr = formatDate(new Date());

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      const prev = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
      setSelectedDate(prev);
    } else if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(addDays(selectedDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
      setSelectedDate(next);
    } else if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Helper to fetch all events on a specific date string
  const getEventsForDate = (dateStr: string) => {
    const d = parseDate(dateStr);
    const dayOfWeek = d.getDay();

    // Classes scheduled on this day of week
    const classes = state.classSessions
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .map((s) => {
        const course = state.courses.find((c) => c.id === s.courseId);
        return {
          id: s.id,
          type: 'class' as const,
          title: course ? `${course.code} ${s.sessionType}` : 'Lecture',
          time: s.startTime,
          endTime: s.endTime,
          color: course?.color || '#6E2D5B',
          location: s.room || course?.room,
          course,
          session: s,
        };
      });

    // Habits scheduled on this day of week
    const habits = state.habits
      .filter((h) => !h.archived && h.targetDays.includes(dayOfWeek))
      .map((h) => {
        const cat = state.categories.find((c) => c.id === h.categoryId);
        const isDone = !!state.habitLogs[`${dateStr}_${h.id}`]?.completed;
        return {
          id: h.id,
          type: 'habit' as const,
          title: h.title,
          time: h.timeOfDay || '20:00',
          endTime: undefined,
          color: cat?.color || '#A62B46',
          location: undefined,
          completed: isDone,
          habit: h,
        };
      });

    // Tasks due on this date
    const tasks = state.tasks
      .filter((t) => t.dueDate === dateStr)
      .map((t) => {
        const cat = state.categories.find((c) => c.id === t.categoryId);
        return {
          id: t.id,
          type: 'task' as const,
          title: t.title,
          time: t.dueTime || '23:59',
          endTime: undefined,
          color: cat?.color || '#1F4E4B',
          location: undefined,
          completed: t.completed,
          task: t,
        };
      });

    const combined = [...classes, ...habits, ...tasks];
    combined.sort((a, b) => a.time.localeCompare(b.time));
    return combined;
  };

  // Render Month View
  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding from previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl shadow-[4px_4px_0px_#2D1A29] overflow-hidden">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 bg-[#F5EBE1] border-b-2 border-[#2D1A29] text-center py-2 text-xs font-bold font-hotel-badge uppercase text-[#2D1A29]">
          {dayLabels.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-[90px] sm:auto-rows-[115px]">
          {days.map((dateObj, idx) => {
            if (!dateObj) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="bg-[#FDFBF7]/50 border-r border-b border-[#2D1A29]/15"
                />
              );
            }

            const dStr = formatDate(dateObj);
            const isToday = dStr === todayStr;
            const isSelected = dStr === selectedDateStr;
            const events = getEventsForDate(dStr);

            return (
              <div
                key={dStr}
                onClick={() => setSelectedDate(dateObj)}
                className={`p-1 sm:p-2 border-r border-b border-[#2D1A29]/20 cursor-pointer transition-all overflow-hidden relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FDE8F0] ring-2 ring-[#2D1A29] z-10'
                    : 'bg-[#FFFFFF] hover:bg-[#FDFBF7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono-numbers font-bold rounded-md px-1.5 py-0.5 ${
                      isToday
                        ? 'bg-[#2D1A29] text-[#D2E59E]'
                        : isSelected
                        ? 'text-[#6E2D5B] font-extrabold'
                        : 'text-[#2D1A29]'
                    }`}
                  >
                    {dateObj.getDate()}
                  </span>
                  {events.length > 0 && (
                    <span className="text-[10px] font-mono-numbers text-[#6E2D5B] hidden sm:inline">
                      {events.length}
                    </span>
                  )}
                </div>

                {/* Event Snippets */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {events.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[10px] font-medium truncate px-1 py-0.5 rounded border border-[#2D1A29]/20"
                      style={{
                        backgroundColor: `${ev.color}20`,
                        color: ev.color,
                        borderColor: ev.color,
                      }}
                    >
                      {ev.time.substring(0, 5)} {ev.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-[9px] font-mono-numbers text-[#521828] font-bold text-center">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Week View (06:00 to 22:00)
  const renderWeekView = () => {
    // Determine start of week (Sunday)
    const current = new Date(selectedDate);
    const day = current.getDay();
    const weekStart = addDays(current, -day);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }

    const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

    return (
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl shadow-[4px_4px_0px_#2D1A29] overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row */}
          <div className="grid grid-cols-8 bg-[#F5EBE1] border-b-2 border-[#2D1A29] text-center py-2">
            <div className="text-xs font-bold font-hotel-badge text-[#521828] py-1">Hour</div>
            {weekDays.map((d) => {
              const dStr = formatDate(d);
              const isToday = dStr === todayStr;
              return (
                <div
                  key={dStr}
                  onClick={() => setSelectedDate(d)}
                  className={`text-xs font-bold py-1 cursor-pointer rounded-lg mx-1 ${
                    isToday ? 'bg-[#2D1A29] text-[#D2E59E]' : 'text-[#2D1A29] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <span className="block font-hotel-badge uppercase text-[10px]">
                    {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                  <span className="font-mono-numbers text-xs">{d.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Hourly Grid */}
          <div className="divide-y divide-[#2D1A29]/15">
            {hours.map((hour) => {
              const timeLabel = `${String(hour).padStart(2, '0')}:00`;
              return (
                <div key={hour} className="grid grid-cols-8 min-h-[52px]">
                  <div className="border-r border-[#2D1A29]/20 px-2 py-1 text-right text-[11px] font-mono-numbers text-[#521828] bg-[#FDFBF7]">
                    {timeLabel}
                  </div>
                  {weekDays.map((d) => {
                    const dStr = formatDate(d);
                    const events = getEventsForDate(dStr).filter((ev) => {
                      const evHour = parseInt(ev.time.split(':')[0], 10);
                      return evHour === hour;
                    });

                    return (
                      <div
                        key={`${dStr}-${hour}`}
                        onClick={() => setSelectedDate(d)}
                        className="border-r border-[#2D1A29]/15 p-1 relative hover:bg-[#FDFBF7] cursor-pointer"
                      >
                        {events.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-1 rounded text-[10px] font-bold border border-[#2D1A29] mb-1 truncate"
                            style={{
                              backgroundColor: `${ev.color}25`,
                              color: ev.color,
                            }}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Day & Agenda View
  const renderDayView = () => {
    const events = getEventsForDate(selectedDateStr);

    return (
      <div className="space-y-4">
        <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#2D1A29]">
          <div className="flex items-center justify-between border-b-2 border-[#2D1A29]/15 pb-3 mb-4">
            <div>
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold">
                Daily Ledger
              </span>
              <h2 className="text-xl font-serif-display font-extrabold text-[#2D1A29]">
                {selectedDate.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
            </div>
            <button
              onClick={() => onOpenTaskModal(null, selectedDateStr)}
              className="px-3 py-1.5 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl text-xs font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Errand</span>
            </button>
          </div>

          {events.length === 0 ? (
            <p className="text-xs text-[#521828] text-center py-8 italic">
              No entries recorded for this ledger date.
            </p>
          ) : (
            <div className="space-y-2.5">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border-2 border-[#2D1A29] bg-[#FDFBF7] shadow-[2px_2px_0px_#2D1A29] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 shrink-0 font-mono-numbers text-xs font-bold text-[#2D1A29]">
                      {ev.time}
                      {ev.endTime && <span className="block text-[10px] text-[#6E2D5B] font-normal">-{ev.endTime}</span>}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#2D1A29] truncate">{ev.title}</h4>
                      {ev.location && (
                        <span className="text-[11px] font-mono-numbers text-[#1F4E4B] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {ev.type === 'class' && ev.course && (
                      <button
                        onClick={() => onOpenAttendanceModal(ev.course!, selectedDateStr)}
                        className="px-2.5 py-1 text-xs font-bold bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-lg hover:bg-[#F7B5CD]"
                      >
                        Roll Call
                      </button>
                    )}
                    {ev.type === 'habit' && ev.habit && (
                      <button
                        onClick={() => onToggleHabit(ev.habit!.id, selectedDateStr)}
                        className="px-2.5 py-1 text-xs font-bold bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-lg hover:bg-[#D2E59E]"
                      >
                        {ev.completed ? 'Done ✅' : 'Check In'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-16 md:pb-6 animate-in fade-in duration-150">
      
      {/* Calendar Top Control Bar */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_#2D1A29] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border-2 border-[#2D1A29] bg-[#FDFBF7] hover:bg-[#F5EBE1] active:translate-x-0.5 text-[#2D1A29]"
            aria-label="Previous Month or Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h2 className="text-base sm:text-lg font-serif-display font-bold text-[#2D1A29] min-w-[170px] text-center">
            {selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </h2>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border-2 border-[#2D1A29] bg-[#FDFBF7] hover:bg-[#F5EBE1] active:translate-x-0.5 text-[#2D1A29]"
            aria-label="Next Month or Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-lg hover:bg-[#EADBC8]"
          >
            Today
          </button>
        </div>

        {/* View Toggles & Add Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center p-0.5 bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl">
            {(['month', 'week', 'day'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  viewMode === mode
                    ? 'bg-[#F7B5CD] text-[#2D1A29] border border-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                    : 'text-[#521828] hover:bg-[#FFFFFF]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenClassModal}
            className="px-3 py-1.5 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl text-xs font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Class</span>
          </button>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

    </div>
  );
};
