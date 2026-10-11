import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Calendar, Clock, Tag } from 'lucide-react';
import { Task, Category, Course, Priority } from '../types';
import { formatDate } from '../utils/streakEngine';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  initialTask?: Task | null;
  categories: Category[];
  courses: Course[];
  defaultDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  categories,
  courses,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-univ');
  const [courseId, setCourseId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [dueDate, setDueDate] = useState(defaultDate || formatDate(new Date()));
  const [dueTime, setDueTime] = useState('20:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isExamOrAssignment, setIsExamOrAssignment] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategoryId(initialTask.categoryId);
      setCourseId(initialTask.courseId || '');
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate || formatDate(new Date()));
      setDueTime(initialTask.dueTime || '20:00');
      setEstimatedMinutes(initialTask.estimatedMinutes || 45);
      setRecurrence(initialTask.recurrence === 'custom' ? 'weekly' : initialTask.recurrence);
      setTags(initialTask.tags || []);
      setIsExamOrAssignment(!!initialTask.isExamOrAssignment);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || 'cat-univ');
      setCourseId('');
      setPriority('normal');
      setDueDate(defaultDate || formatDate(new Date()));
      setDueTime('20:00');
      setEstimatedMinutes(45);
      setRecurrence('none');
      setTags([]);
      setIsExamOrAssignment(false);
    }
  }, [initialTask, isOpen, categories, defaultDate]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskToSave: Task = {
      id: initialTask?.id || `t-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      courseId: courseId || undefined,
      priority,
      dueDate,
      dueTime,
      estimatedMinutes: Number(estimatedMinutes),
      recurrence,
      completed: initialTask?.completed || false,
      completedAt: initialTask?.completedAt,
      tags,
      isExamOrAssignment,
    };

    onSave(taskToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D1A29]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl shadow-[6px_6px_0px_#2D1A29] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div className="bg-[#F7B5CD] border-b-2 border-[#2D1A29] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#2D1A29] font-bold">
              Dispatch Errand
            </span>
            <span className="text-xs text-[#6E2D5B]">·</span>
            <span className="text-xs font-serif italic text-[#521828]">
              {initialTask ? 'Revise Directive' : 'New Assignment or Task'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#2D1A29] hover:bg-[#FFFFFF]/40 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Title of Task / Errand *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete Vector Calculus Problem Set 4"
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F7B5CD] text-[#2D1A29]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Details & Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes, textbook page numbers, or FL Studio patch ideas..."
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F7B5CD] text-[#2D1A29]"
            />
          </div>

          {/* Category & Academic Course Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                Link Course (Optional)
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              >
                <option value="">No Course (Personal / General)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'normal', 'high', 'urgent'] as Priority[]).map((p) => {
                  const isSel = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-1.5 text-xs font-bold capitalize rounded-lg border border-[#2D1A29] transition-all ${
                        isSel
                          ? p === 'urgent'
                            ? 'bg-[#9E2A2B] text-white shadow-[1px_1px_0px_#2D1A29]'
                            : p === 'high'
                            ? 'bg-[#F4C462] text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                            : 'bg-[#D2E59E] text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                          : 'bg-[#FDFBF7] text-[#521828]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#6E2D5B]" />
                Estimated Duration
              </label>
              <select
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              >
                <option value={15}>15 minutes (Quick errand)</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour (Lecture review)</option>
                <option value={90}>1.5 hours (Problem set)</option>
                <option value={120}>2 hours (Deep session)</option>
              </select>
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#6E2D5B]" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#6E2D5B]" />
                Target Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              />
            </div>
          </div>

          {/* Recurrence & Exam Flag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                Recurring Rule
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as 'none' | 'daily' | 'weekly')}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              >
                <option value="none">One-time Task</option>
                <option value="daily">Repeats Daily</option>
                <option value="weekly">Repeats Weekly on this Day</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2D1A29]">
                <input
                  type="checkbox"
                  checked={isExamOrAssignment}
                  onChange={(e) => setIsExamOrAssignment(e.target.checked)}
                  className="w-4 h-4 accent-[#9E2A2B] rounded"
                />
                Official Exam / Graded Assignment
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#6E2D5B]" />
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g. Calculus, ExamPrep, Vital"
                className="flex-1 px-3 py-1.5 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-bold bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-lg text-[#2D1A29] hover:bg-[#F7B5CD]"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-mono-numbers px-2 py-0.5 bg-[#F5EBE1] border border-[#2D1A29] rounded-md text-[#2D1A29]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#9E2A2B] hover:text-black font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-[#2D1A29]/20 gap-3">
            {initialTask && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you wish to delete this errand?')) {
                    onDelete(initialTask.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#9E2A2B] hover:bg-[#FDE8F0] border-2 border-[#9E2A2B] rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#2D1A29] bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl hover:bg-[#EADBC8] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#2D1A29] bg-[#D2E59E] border-2 border-[#2D1A29] rounded-xl shadow-[2px_2px_0px_#2D1A29] hover:bg-[#BFE07D] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Errand</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
