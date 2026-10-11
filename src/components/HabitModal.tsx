import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Clock, Sparkles } from 'lucide-react';
import { Habit, Category } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  initialHabit?: Habit | null;
  categories: Category[];
}

const DAYS = [
  { num: 1, label: 'Mon' },
  { num: 2, label: 'Tue' },
  { num: 3, label: 'Wed' },
  { num: 4, label: 'Thu' },
  { num: 5, label: 'Fri' },
  { num: 6, label: 'Sat' },
  { num: 0, label: 'Sun' },
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialHabit,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-habit');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'custom'>('daily');
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [timeOfDay, setTimeOfDay] = useState('20:30');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setCategoryId(initialHabit.categoryId);
      setFrequency(initialHabit.frequency);
      setTargetDays(initialHabit.targetDays || [0, 1, 2, 3, 4, 5, 6]);
      setTimeOfDay(initialHabit.timeOfDay || '20:30');
      setDurationMinutes(initialHabit.durationMinutes || 45);
      setNotes(initialHabit.notes || '');
    } else {
      setTitle('');
      setCategoryId(categories[0]?.id || 'cat-habit');
      setFrequency('daily');
      setTargetDays([0, 1, 2, 3, 4, 5, 6]);
      setTimeOfDay('20:30');
      setDurationMinutes(45);
      setNotes('');
    }
  }, [initialHabit, isOpen, categories]);

  if (!isOpen) return null;

  const handleFrequencyChange = (freq: 'daily' | 'weekdays' | 'weekends' | 'custom') => {
    setFrequency(freq);
    if (freq === 'daily') setTargetDays([0, 1, 2, 3, 4, 5, 6]);
    else if (freq === 'weekdays') setTargetDays([1, 2, 3, 4, 5]);
    else if (freq === 'weekends') setTargetDays([6, 0]);
  };

  const toggleDay = (dayNum: number) => {
    setFrequency('custom');
    if (targetDays.includes(dayNum)) {
      if (targetDays.length > 1) {
        setTargetDays(targetDays.filter((d) => d !== dayNum));
      }
    } else {
      setTargetDays([...targetDays, dayNum].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const habitToSave: Habit = {
      id: initialHabit?.id || `h-${Date.now()}`,
      title: title.trim(),
      categoryId,
      frequency,
      targetDays,
      icon: initialHabit?.icon || 'Sparkles',
      timeOfDay,
      durationMinutes: Number(durationMinutes),
      notes: notes.trim() || undefined,
    };

    onSave(habitToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D1A29]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl shadow-[6px_6px_0px_#2D1A29] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div className="bg-[#FFD4BA] border-b-2 border-[#2D1A29] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#2D1A29] font-bold">
              Daily Discipline
            </span>
            <span className="text-xs text-[#2D1A29]">·</span>
            <span className="text-xs font-serif italic text-[#521828]">
              {initialHabit ? 'Refine Discipline' : 'Establish New Habit'}
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
              Habit Name / Routine *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FL Studio Sound Design, Morning Run, Journaling"
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
            />
          </div>

          {/* Category */}
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

          {/* Frequency Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Cadence & Recurrence
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[
                { id: 'daily', label: 'Every Day' },
                { id: 'weekdays', label: 'Mon–Fri' },
                { id: 'weekends', label: 'Sat–Sun' },
                { id: 'custom', label: 'Custom' },
              ].map((preset) => {
                const isActive = frequency === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => handleFrequencyChange(preset.id as any)}
                    className={`py-1.5 px-1 text-xs font-bold rounded-lg border border-[#2D1A29] transition-all text-center ${
                      isActive
                        ? 'bg-[#F7B5CD] text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                        : 'bg-[#FDFBF7] text-[#521828]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Target Days selector */}
            <div className="flex justify-between gap-1 pt-1">
              {DAYS.map((d) => {
                const isSelected = targetDays.includes(d.num);
                return (
                  <button
                    type="button"
                    key={d.num}
                    onClick={() => toggleDay(d.num)}
                    className={`w-9 h-9 rounded-lg border-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                        : 'bg-[#FDFBF7] border-[#2D1A29]/20 text-[#2D1A29]/50'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#521828] mt-1 italic">
              Authentic streak engine: only active on selected days (non-scheduled days do not break your streak).
            </p>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#6E2D5B]" />
                Scheduled Time
              </label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#6E2D5B]" />
                Target Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Journal)</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes (Run)</option>
                <option value={60}>60 minutes (Music)</option>
                <option value={90}>90 minutes (Revision)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Discipline Notes & Guidelines
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on melody arrangement and sub-bass balance."
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-[#2D1A29]/20 gap-3">
            {initialHabit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this habit discipline? Historical completion logs remain intact.')) {
                    onDelete(initialHabit.id);
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
                className="px-4 py-2 text-xs font-bold text-[#2D1A29] bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl hover:bg-[#EADBC8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#2D1A29] bg-[#D2E59E] border-2 border-[#2D1A29] rounded-xl shadow-[2px_2px_0px_#2D1A29] hover:bg-[#BFE07D] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Check className="w-4 h-4" />
                <span>Commit Discipline</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
