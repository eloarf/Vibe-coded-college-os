import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  BookOpen,
  Sparkles,
  Calendar,
  Flame,
  Trash2,
  ChevronRight,
  Search,
} from 'lucide-react';
import { JournalEntry } from '../types';
import { formatDate } from '../utils/streakEngine';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  onDelete?: (date: string) => void;
  initialDate?: string;
  existingEntry?: JournalEntry | null;
  allEntries: Record<string, JournalEntry>;
}

const REFLECTION_PROMPTS = [
  'What was your primary intellectual or music breakthrough today?',
  'What challenged your focus, and how did you resolve it?',
  'Three distinct victories from today’s lectures and routines.',
  'What creative sound design or melody ideas sparked in FL Studio?',
  'What are you quietly grateful for as evening settles in Suite 101?',
];

const MOODS: { id: JournalEntry['mood']; label: string; icon: string }[] = [
  { id: 'triumphant', label: 'Triumphant', icon: '👑' },
  { id: 'studious', label: 'Studious', icon: '📖' },
  { id: 'creative', label: 'Creative', icon: '🎵' },
  { id: 'reflective', label: 'Reflective', icon: '☕' },
  { id: 'peaceful', label: 'Peaceful', icon: '🌿' },
];

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  existingEntry,
  allEntries,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'archive'>('write');
  const [date, setDate] = useState(initialDate || formatDate(new Date()));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('reflective');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [searchArchive, setSearchArchive] = useState('');

  // Load entry for chosen date or existing entry
  useEffect(() => {
    const targetDate = initialDate || formatDate(new Date());
    setDate(targetDate);
    const entry = existingEntry || allEntries[targetDate];
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setMood(entry.mood || 'reflective');
      setSelectedPrompt(entry.promptUsed || '');
    } else {
      setTitle('');
      setContent('');
      setMood('reflective');
      setSelectedPrompt(REFLECTION_PROMPTS[0]);
    }
    setActiveTab('write');
  }, [isOpen, initialDate, existingEntry, allEntries]);

  if (!isOpen) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const entryToSave: JournalEntry = {
      id: existingEntry?.id || `j-${date}`,
      date,
      title: title.trim() || undefined,
      content: content.trim(),
      mood,
      promptUsed: selectedPrompt || undefined,
      wordCount,
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(entryToSave);
    onClose();
  };

  const handleSelectArchiveDate = (entryDate: string) => {
    setDate(entryDate);
    const entry = allEntries[entryDate];
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setMood(entry.mood || 'reflective');
      setSelectedPrompt(entry.promptUsed || '');
    }
    setActiveTab('write');
  };

  // Archive filtered
  const sortedArchive = Object.values(allEntries)
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((e) => {
      if (!searchArchive.trim()) return true;
      const q = searchArchive.toLowerCase();
      return (
        e.date.includes(q) ||
        (e.title && e.title.toLowerCase().includes(q)) ||
        e.content.toLowerCase().includes(q)
      );
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D1A29]/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] border-3 border-[#2D1A29] rounded-2xl shadow-[8px_8px_0px_#2D1A29] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Wes Anderson Stationery Header */}
        <div className="bg-[#F5EBE1] border-b-2 border-[#2D1A29] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F7B5CD] border-2 border-[#2D1A29] flex items-center justify-center shadow-[1px_1px_0px_#2D1A29]">
              <BookOpen className="w-4 h-4 text-[#2D1A29]" />
            </div>
            <div>
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold block">
                Suite 101 Evening Ledger
              </span>
              <span className="text-xs font-serif italic text-[#521828]">
                Daily Reflection & Intellectual Journal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Toggles */}
            <div className="flex p-0.5 bg-white border-2 border-[#2D1A29] rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`px-2.5 py-1 text-xs font-bold font-hotel-badge uppercase rounded transition-all ${
                  activeTab === 'write' ? 'bg-[#F7B5CD] text-[#2D1A29]' : 'text-[#521828]'
                }`}
              >
                Compose
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('archive')}
                className={`px-2.5 py-1 text-xs font-bold font-hotel-badge uppercase rounded transition-all ${
                  activeTab === 'archive' ? 'bg-[#F7B5CD] text-[#2D1A29]' : 'text-[#521828]'
                }`}
              >
                Archive ({Object.keys(allEntries).length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#2D1A29] hover:bg-black/5 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'write' ? (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Streak & Automatic Checkoff Notice */}
            <div className="p-3 bg-[#F1F8E4] border-2 border-[#A7C55E] rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Flame className="w-4 h-4 text-[#A62B46] fill-[#A62B46] shrink-0" />
                <span className="text-[#2D1A29] font-medium leading-tight">
                  Committing this entry automatically marks your <strong>15-Min Evening Journaling</strong> habit complete and advances your streak!
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white border border-[#2D1A29] text-[10px] font-bold font-mono-numbers text-[#6E2D5B] shrink-0">
                +25 XP
              </span>
            </div>

            {/* Date Picker & Mood Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#6E2D5B]" />
                  Ledger Entry Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl font-mono-numbers text-[#2D1A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                  Evening Disposition / Mood
                </label>
                <div className="flex gap-1">
                  {MOODS.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMood(m.id)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center transition-all ${
                        mood === m.id
                          ? 'bg-[#F7B5CD] border-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                          : 'bg-[#FDFBF7] border-[#2D1A29]/30 hover:bg-[#F5EBE1]'
                      }`}
                      title={m.label}
                    >
                      <span className="mr-0.5">{m.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reflection Prompts Carousel */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2D1A29] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#DCA136]" />
                  Evening Prompt Inquiries
                </label>
                <span className="text-[10px] text-[#521828] italic">Click to adopt prompt</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REFLECTION_PROMPTS.map((prompt, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`text-[11px] text-left px-2.5 py-1 rounded-lg border transition-all ${
                      selectedPrompt === prompt
                        ? 'bg-[#F4C462] text-[#2D1A29] border-[#2D1A29] font-semibold shadow-[1px_1px_0px_#2D1A29]'
                        : 'bg-[#FDFBF7] text-[#521828] border-[#2D1A29]/20 hover:border-[#2D1A29]'
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                Reflection Title / Heading (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Breakthrough on Stokes Theorem & Analog Mix Bus"
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2D1A29]">
                  Daily Reflection Prose *
                </label>
                <span className="text-[10px] font-mono-numbers text-[#6E2D5B]">
                  {wordCount} words
                </span>
              </div>
              <textarea
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Record your thoughts on lectures, music design in FL Studio, physical calisthenics, or personal victories today..."
                className="w-full p-3 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29] leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#F7B5CD]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-[#2D1A29]/15">
              {allEntries[date] && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this reflection entry?')) {
                      onDelete(date);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#9E2A2B] hover:bg-[#FDE8F0] border-2 border-[#9E2A2B] rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
                  Close
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#2D1A29] bg-[#D2E59E] border-2 border-[#2D1A29] rounded-xl shadow-[2px_2px_0px_#2D1A29] hover:bg-[#BFE07D] active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Commit to Ledger</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Archive View */
          <div className="p-5 space-y-3 max-h-[82vh] overflow-y-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#521828] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchArchive}
                onChange={(e) => setSearchArchive(e.target.value)}
                placeholder="Search reflections by date or keywords..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              />
            </div>

            {sortedArchive.length === 0 ? (
              <p className="text-xs text-[#521828] text-center py-8 italic">
                No archived reflections found matching your search.
              </p>
            ) : (
              <div className="space-y-2.5">
                {sortedArchive.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleSelectArchiveDate(entry.date)}
                    className="p-3.5 rounded-xl border-2 border-[#2D1A29] bg-[#FDFBF7] hover:bg-[#FFFFFF] shadow-[2px_2px_0px_#2D1A29] cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-numbers font-bold text-xs text-[#6E2D5B]">
                          {entry.date}
                        </span>
                        {entry.mood && (
                          <span className="text-xs">
                            {MOODS.find((m) => m.id === entry.mood)?.icon}
                          </span>
                        )}
                        <span className="text-[10px] text-[#521828] font-mono-numbers">
                          ({entry.wordCount} words)
                        </span>
                      </div>
                      {entry.title && (
                        <h4 className="text-xs font-bold text-[#2D1A29] mt-0.5 truncate">
                          {entry.title}
                        </h4>
                      )}
                      <p className="text-xs text-[#521828] mt-1 line-clamp-2 italic">
                        "{entry.content}"
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#6E2D5B] group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
