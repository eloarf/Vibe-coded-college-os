import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  CheckCircle2,
  Tag,
  BookOpen,
  Trash2,
  Edit3,
} from 'lucide-react';
import { AppState, Task, Category, Priority } from '../types';
import { formatDate } from '../utils/streakEngine';

interface TasksViewProps {
  state: AppState;
  onToggleTask: (taskId: string) => void;
  onOpenTaskModal: (task?: Task | null) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  state,
  onToggleTask,
  onOpenTaskModal,
  onDeleteTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'completed' | 'all'>('pending');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const todayStr = formatDate(new Date());

  // Filter tasks
  const filteredTasks = state.tasks.filter((t) => {
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  // Sorting
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const prioOrder: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
    if (prioOrder[a.priority] !== prioOrder[b.priority]) {
      return prioOrder[a.priority] - prioOrder[b.priority];
    }
    return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
  });

  const pendingCount = state.tasks.filter((t) => !t.completed).length;
  const completedCount = state.tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-4 pb-16 md:pb-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#2D1A29]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold">
                Orders & Directives
              </span>
              <span className="text-[#6E2D5B]">·</span>
              <span className="text-xs font-mono-numbers text-[#521828]">
                {pendingCount} Pending / {completedCount} Dispatched
              </span>
            </div>
            <h1 className="text-2xl font-serif-display font-extrabold text-[#2D1A29]">
              Academic & Personal Errands
            </h1>
          </div>

          <button
            onClick={() => onOpenTaskModal(null)}
            className="px-4 py-2 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl text-xs font-hotel-badge uppercase tracking-wider font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Directive</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mt-4 pt-3 border-t-2 border-[#2D1A29]/15">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#521828] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, or tag..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29] placeholder:text-[#521828]/60"
            />
          </div>

          {/* Status Tabs */}
          <div className="sm:col-span-4 flex items-center p-0.5 bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl">
            {(['pending', 'completed', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`flex-1 py-1 text-xs font-bold capitalize rounded-lg transition-all ${
                  filterStatus === st
                    ? 'bg-[#F7B5CD] text-[#2D1A29] border border-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                    : 'text-[#521828] hover:bg-[#FFFFFF]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
            >
              <option value="all">All Categories</option>
              {state.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-8 text-center shadow-[3px_3px_0px_#2D1A29]">
            <CheckSquare className="w-8 h-8 text-[#6E2D5B] mx-auto mb-2" />
            <h3 className="font-serif font-bold text-base text-[#2D1A29]">
              No errands match your filter
            </h3>
            <p className="text-xs text-[#521828] mt-1">
              Your ledger is clear or your query returned zero active items.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const course = state.courses.find((c) => c.id === task.courseId);
            const category = state.categories.find((c) => c.id === task.categoryId);
            const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                  task.completed
                    ? 'bg-[#F5EBE1]/70 border-[#2D1A29]/30 opacity-75 shadow-[1px_1px_0px_#2D1A29]'
                    : task.priority === 'urgent'
                    ? 'bg-[#FDE8F0] border-[#9E2A2B] shadow-[3px_3px_0px_#9E2A2B]'
                    : isOverdue
                    ? 'bg-[#FFF2E5] border-[#D46A1E] shadow-[3px_3px_0px_#D46A1E]'
                    : 'bg-[#FFFFFF] border-[#2D1A29] shadow-[3px_3px_0px_#2D1A29]'
                }`}
              >
                {/* Checkbox Trigger */}
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29]'
                      : 'bg-white border-[#2D1A29] hover:bg-[#F7B5CD]'
                  }`}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-[#2D1A29]" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      onClick={() => onOpenTaskModal(task)}
                      className={`text-sm font-bold cursor-pointer hover:underline ${
                        task.completed ? 'line-through text-[#521828]' : 'text-[#2D1A29]'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border font-hotel-badge ${
                        task.priority === 'urgent'
                          ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                          : task.priority === 'high'
                          ? 'bg-[#F4C462] text-[#2D1A29] border-[#2D1A29]'
                          : 'bg-[#F5EBE1] text-[#2D1A29] border-[#2D1A29]/40'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {task.isExamOrAssignment && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#F7B5CD] text-[#2D1A29] border border-[#2D1A29]">
                        Graded Exam/Paper
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-[#521828] mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata Bar */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#521828]">
                    {course && (
                      <span className="font-bold text-[#6E2D5B]">
                        {course.code} ({course.name})
                      </span>
                    )}

                    {category && (
                      <span className="italic">
                        {category.name}
                      </span>
                    )}

                    {task.dueDate && (
                      <span
                        className={`font-mono-numbers flex items-center gap-1 ${
                          isOverdue ? 'text-[#9E2A2B] font-bold' : ''
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {isOverdue ? `Overdue (${task.dueDate})` : `Due ${task.dueDate}`}
                        {task.dueTime ? ` @ ${task.dueTime}` : ''}
                      </span>
                    )}

                    {task.estimatedMinutes && (
                      <span className="flex items-center gap-1 font-mono-numbers">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes}m
                      </span>
                    )}

                    {task.recurrence && task.recurrence !== 'none' && (
                      <span className="font-bold text-[#1F4E4B]">
                        Repeats {task.recurrence}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tg) => (
                        <span
                          key={tg}
                          className="text-[10px] font-mono-numbers px-1.5 py-0.2 bg-[#F5EBE1] border border-[#2D1A29]/30 rounded text-[#2D1A29]"
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Row Actions */}
                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => onOpenTaskModal(task)}
                    className="p-1.5 text-[#521828] hover:text-[#2D1A29] hover:bg-[#F5EBE1] rounded-md transition-all"
                    title="Edit Task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this task?')) onDeleteTask(task.id);
                    }}
                    className="p-1.5 text-[#9E2A2B] hover:bg-[#FDE8F0] rounded-md transition-all"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
