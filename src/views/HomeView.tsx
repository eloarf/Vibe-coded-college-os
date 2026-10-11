import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  CheckSquare,
  Plus,
  BookOpen,
  Music,
  Footprints,
  Droplet,
  Heart,
  Shield,
  ArrowRight,
  Share2,
  TrendingUp,
  Star,
  RefreshCw,
} from 'lucide-react';
import {
  AppState,
  Task,
  Habit,
  ClassSession,
  Course,
  AttendanceRecord,
  JournalEntry,
} from '../types';
import {
  formatDate,
  calculateHabitStreak,
  calculateDailyCompletion,
  HOTEL_RANKS,
  addDays,
  parseDate,
} from '../utils/streakEngine';

interface HomeViewProps {
  state: AppState;
  onToggleHabit: (habitId: string, date: string) => void;
  onToggleTask: (taskId: string) => void;
  onOpenTaskModal: (task?: Task | null, defaultDate?: string) => void;
  onOpenAttendanceModal: (course: Course, date: string, existing?: AttendanceRecord | null) => void;
  onNavigateTab: (tab: any) => void;
  onOpenShare: () => void;
  onOpenJournalModal: (date?: string) => void;
  onSaveJournal: (entry: JournalEntry) => void;
}

const REFLECTION_PROMPTS = [
  'What was your primary intellectual breakthrough or lecture takeaway today?',
  'What creative sound design or melody ideas sparked during FL Studio practice?',
  'Three distinct victories from today’s routines and lectures.',
  'What challenged your focus, and how did your discipline resolve it?',
  'What are you quietly grateful for this evening in Suite 101?',
];

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onToggleHabit,
  onToggleTask,
  onOpenTaskModal,
  onOpenAttendanceModal,
  onNavigateTab,
  onOpenShare,
  onOpenJournalModal,
  onSaveJournal,
}) => {
  const today = new Date();
  const todayStr = formatDate(today);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Quick inline journal reflection state
  const [journalContent, setJournalContent] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalMood, setJournalMood] = useState<JournalEntry['mood']>('reflective');
  const [promptIndex, setPromptIndex] = useState(0);

  // Greeting by hour
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Calculate today's completion rate
  const completion = calculateDailyCompletion(
    todayStr,
    state.habits,
    state.tasks,
    state.habitLogs
  );

  // Today's classes
  const activeSemester = state.semesters.find((s) => s.id === state.activeSemesterId);
  const activeCourseIds = new Set(
    state.courses.filter((c) => c.semesterId === state.activeSemesterId).map((c) => c.id)
  );

  const todaysSessions = state.classSessions
    .filter((s) => s.dayOfWeek === dayOfWeek && activeCourseIds.has(s.courseId))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Today's habits
  const todaysHabits = state.habits
    .filter((h) => !h.archived && h.targetDays.includes(dayOfWeek))
    .sort((a, b) => (a.timeOfDay || '23:59').localeCompare(b.timeOfDay || '23:59'));

  // Today's tasks (due today or overdue)
  const todaysTasks = state.tasks
    .filter((t) => t.dueDate === todayStr || (!t.completed && t.dueDate && t.dueDate < todayStr))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const prioOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return prioOrder[a.priority] - prioOrder[b.priority];
    });

  // Calculate master streak: best current habit streak
  const habitStreaks = state.habits.map((h) =>
    calculateHabitStreak(h, state.habitLogs, state.rpg.freezesUsed, todayStr)
  );
  const maxHabitStreak = habitStreaks.reduce((acc, curr) => Math.max(acc, curr.currentStreak), 0);

  // Check today's journal entry status
  const todaysJournal = state.journalEntries[todayStr];
  const isJournalHabitDone = !!state.habitLogs[`${todayStr}_h-journ`]?.completed;

  // Build 7-day weekly progress visualization data (Monday through Sunday)
  const mondayOffset = (dayOfWeek + 6) % 7; // days since Monday
  const mondayDate = addDays(today, -mondayOffset);

  const weekProgressData = [];
  let weekTotalPercent = 0;
  let weekPerfectCount = 0;

  for (let i = 0; i < 7; i++) {
    const d = addDays(mondayDate, i);
    const dStr = formatDate(d);
    const dayComp = calculateDailyCompletion(dStr, state.habits, state.tasks, state.habitLogs);
    const isToday = dStr === todayStr;
    const isPerfect = dayComp.isPerfect || !!state.perfectDays[dStr];

    if (isPerfect) weekPerfectCount++;
    weekTotalPercent += dayComp.percentage;

    weekProgressData.push({
      dateStr: dStr,
      dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayNumber: d.getDate(),
      percentage: dayComp.percentage,
      totalItems: dayComp.totalItems,
      completedItems: dayComp.completedItems,
      isPerfect,
      isToday,
      isFuture: dStr > todayStr,
    });
  }

  const weeklyAverageConsistency = Math.round(weekTotalPercent / 7);

  // Handle Quick Journal Submit
  const handleQuickJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;

    const words = journalContent.trim().split(/\s+/).length;
    const entry: JournalEntry = {
      id: `j-${todayStr}`,
      date: todayStr,
      title: journalTitle.trim() || undefined,
      content: journalContent.trim(),
      mood: journalMood,
      promptUsed: REFLECTION_PROMPTS[promptIndex],
      wordCount: words,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveJournal(entry);
    setJournalContent('');
    setJournalTitle('');
  };

  // Build unified schedule timeline for today
  interface TimelineItem {
    id: string;
    type: 'class' | 'habit' | 'task';
    title: string;
    subTitle?: string;
    time: string;
    endTime?: string;
    location?: string;
    color: string;
    completed: boolean;
    course?: Course;
    session?: ClassSession;
    habit?: Habit;
    task?: Task;
  }

  const timelineItems: TimelineItem[] = [];

  // Add classes
  todaysSessions.forEach((s) => {
    const course = state.courses.find((c) => c.id === s.courseId);
    if (!course) return;
    const attRecord = state.attendance.find((a) => a.courseId === course.id && a.date === todayStr);
    const isAttended = attRecord ? attRecord.status === 'present' || attRecord.status === 'late' || attRecord.status === 'excused' : false;

    timelineItems.push({
      id: s.id,
      type: 'class',
      title: `${course.code} — ${course.name}`,
      subTitle: `${s.sessionType.toUpperCase()} ${course.instructor ? `· ${course.instructor}` : ''}`,
      time: s.startTime,
      endTime: s.endTime,
      location: s.room || course.room || 'Academy Hall',
      color: course.color,
      completed: isAttended,
      course,
      session: s,
    });
  });

  // Add scheduled habits
  todaysHabits.forEach((h) => {
    const isDone = !!state.habitLogs[`${todayStr}_${h.id}`]?.completed;
    const cat = state.categories.find((c) => c.id === h.categoryId);
    timelineItems.push({
      id: h.id,
      type: 'habit',
      title: h.title,
      subTitle: `${h.durationMinutes ? `${h.durationMinutes} mins · ` : ''}${cat?.name || 'Habit Discipline'}`,
      time: h.timeOfDay || '12:00',
      color: cat?.color || '#A62B46',
      completed: isDone,
      habit: h,
    });
  });

  // Sort timeline chronologically
  timelineItems.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-5 pb-16 md:pb-6 animate-in fade-in duration-150">
      
      {/* Symmetrical Wes Anderson Hero Banner */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold">
                Daily Command Center
              </span>
              <span className="text-[#6E2D5B]">·</span>
              <span className="text-xs font-mono-numbers text-[#521828]">
                {activeSemester?.name || 'Semester 1'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-extrabold text-[#2D1A29]">
              {greeting}, {state.user.name}.
            </h1>
            <p className="text-xs sm:text-sm text-[#521828] mt-1 max-w-xl">
              All directives and hotel ledger items for today are assembled. Discipline is our greatest distinction.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => onOpenTaskModal(null, todayStr)}
              className="px-3.5 py-2 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl text-xs font-hotel-badge uppercase tracking-wider font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Errand</span>
            </button>
            <button
              onClick={() => onNavigateTab('university')}
              className="px-3.5 py-2 bg-[#F7B5CD] hover:bg-[#F39CB8] border-2 border-[#2D1A29] rounded-xl text-xs font-hotel-badge uppercase tracking-wider font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Timetable</span>
            </button>
            <button
              onClick={onOpenShare}
              className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl text-xs font-hotel-badge uppercase tracking-wider font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
              title="Share App with Others"
            >
              <Share2 className="w-4 h-4 text-[#6E2D5B]" />
              <span>Share OS</span>
            </button>
          </div>
        </div>

        {/* 4-Card Wes Anderson Concierge Stat Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t-2 border-[#2D1A29]/15">
          {/* Card 1: Today's Completion */}
          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] p-3 rounded-xl shadow-[2px_2px_0px_#2D1A29]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#521828] block">
              Today's Completion
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono-numbers text-[#2D1A29]">
                {completion.percentage}%
              </span>
              <span className="text-[11px] font-mono-numbers text-[#6E2D5B] font-semibold">
                {completion.completedItems}/{completion.totalItems} done
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#F5EBE1] border border-[#2D1A29] rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-[#D2E59E] border-r border-[#2D1A29] transition-all duration-300"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
          </div>

          {/* Card 2: Authentic Master Streak */}
          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] p-3 rounded-xl shadow-[2px_2px_0px_#2D1A29]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#521828] block">
              Best Active Streak
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono-numbers text-[#A62B46] flex items-center gap-1">
                <Flame className="w-5 h-5 fill-[#A62B46]" />
                {maxHabitStreak}
              </span>
              <span className="text-[10px] font-mono-numbers text-[#6E2D5B] font-semibold">
                Days Unbroken
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#1F4E4B] font-medium">
              <Shield className="w-3.5 h-3.5 text-[#A62B46]" />
              <span>{state.rpg.streakFreezesAvailable} Freezes Equipped</span>
            </div>
          </div>

          {/* Card 3: Lectures Today */}
          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] p-3 rounded-xl shadow-[2px_2px_0px_#2D1A29]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#521828] block">
              Today's Classes
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono-numbers text-[#2D1A29]">
                {todaysSessions.length}
              </span>
              <span className="text-[10px] text-[#6E2D5B] font-semibold">
                {todaysSessions.length === 0 ? 'No lectures today' : 'Sessions Scheduled'}
              </span>
            </div>
            <p className="text-[11px] text-[#521828] mt-1.5 truncate">
              {todaysSessions.length > 0
                ? `${state.courses.find((c) => c.id === todaysSessions[0].courseId)?.code} next`
                : 'Free academic day'}
            </p>
          </div>

          {/* Card 4: Tasks Due */}
          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] p-3 rounded-xl shadow-[2px_2px_0px_#2D1A29]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#521828] block">
              Directives Due
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono-numbers text-[#2D1A29]">
                {todaysTasks.filter((t) => !t.completed).length}
              </span>
              <span className="text-[10px] text-[#6E2D5B] font-semibold">
                Pending Actions
              </span>
            </div>
            <p className="text-[11px] text-[#521828] mt-1.5 truncate">
              {todaysTasks.filter((t) => t.priority === 'urgent' && !t.completed).length > 0
                ? '⚠️ Urgent items waiting'
                : 'All in orderly progress'}
            </p>
          </div>
        </div>
      </div>

      {/* NEW: VISUALIZE DAILY & WEEKLY PROGRESS (7-Day Interactive Column Chart) */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#2D1A29]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#2D1A29]/15 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6E2D5B]" />
              <h2 className="text-base font-serif-display font-bold text-[#2D1A29]">
                Weekly Ledger & Consistency Rhythm
              </h2>
            </div>
            <p className="text-xs text-[#521828]">
              Daily completion rate across Monday through Sunday. Stars denote flawless Perfect Days.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-numbers font-bold text-[#1F4E4B] bg-[#F1F8E4] px-2.5 py-1 rounded-lg border border-[#A7C55E]">
              Avg: {weeklyAverageConsistency}% This Week
            </span>
            <span className="text-xs font-mono-numbers font-bold text-[#DCA136] bg-[#FDF7EB] px-2.5 py-1 rounded-lg border border-[#EED39E] flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#DCA136]" />
              {weekPerfectCount} Perfect
            </span>
          </div>
        </div>

        {/* 7-Day Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-40 pt-6 pb-1">
          {weekProgressData.map((d) => {
            const barHeightPercent = Math.max(12, d.percentage);

            return (
              <div
                key={d.dateStr}
                onClick={() => onOpenJournalModal(d.dateStr)}
                className="flex flex-col items-center justify-end h-full group cursor-pointer"
                title={`${d.dayName} ${d.dayNumber}: ${d.percentage}% completed (${d.completedItems}/${d.totalItems} items)`}
              >
                {/* Perfect Day Star indicator */}
                <div className="h-5 flex items-center justify-center">
                  {d.isPerfect && (
                    <Star className="w-4 h-4 text-[#DCA136] fill-[#DCA136] animate-bounce" />
                  )}
                </div>

                {/* Percentage label */}
                <span className="text-[10px] font-mono-numbers font-bold text-[#521828] mb-1 opacity-80 group-hover:opacity-100">
                  {d.isFuture ? '—' : `${d.percentage}%`}
                </span>

                {/* Vertical Bar */}
                <div className="w-full max-w-[38px] h-24 bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-lg overflow-hidden flex flex-col justify-end shadow-[1px_1px_0px_#2D1A29] group-hover:scale-105 transition-transform">
                  <div
                    className={`w-full transition-all duration-500 rounded-b-md ${
                      d.isPerfect
                        ? 'bg-[#D2E59E] border-t-2 border-[#2D1A29]'
                        : d.percentage >= 50
                        ? 'bg-[#F4C462] border-t-2 border-[#2D1A29]'
                        : d.percentage > 0
                        ? 'bg-[#FFD4BA] border-t-2 border-[#2D1A29]'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${d.isFuture ? 0 : barHeightPercent}%` }}
                  />
                </div>

                {/* Day Label */}
                <div className="text-center mt-2">
                  <span
                    className={`text-[10px] font-bold block uppercase ${
                      d.isToday ? 'text-[#A62B46] font-extrabold' : 'text-[#2D1A29]'
                    }`}
                  >
                    {d.dayName}
                  </span>
                  <span
                    className={`text-[10px] font-mono-numbers block ${
                      d.isToday
                        ? 'bg-[#2D1A29] text-[#D2E59E] px-1 rounded-sm font-bold'
                        : 'text-[#6E2D5B]'
                    }`}
                  >
                    {d.dayNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NEW: INTEGRATED SUITE 101 EVENING JOURNAL & REFLECTION COMPONENT */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#2D1A29]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#2D1A29]/15 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F7B5CD] border-2 border-[#2D1A29] flex items-center justify-center shadow-[1px_1px_0px_#2D1A29]">
              <BookOpen className="w-4 h-4 text-[#2D1A29]" />
            </div>
            <div>
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold block">
                Suite 101 Evening Ledger
              </span>
              <h2 className="text-base font-serif-display font-bold text-[#2D1A29]">
                Daily Reflection & Intellectual Journal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold font-mono-numbers px-2.5 py-1 rounded-lg border-2 flex items-center gap-1.5 ${
                isJournalHabitDone
                  ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29]'
                  : 'bg-[#FDFBF7] border-[#2D1A29] text-[#6E2D5B]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#A62B46] fill-[#A62B46]" />
              <span>{isJournalHabitDone ? 'Journaling Habit: Active ✅' : 'Pending Tonight ⏳'}</span>
            </span>

            <button
              onClick={() => onOpenJournalModal(todayStr)}
              className="px-3 py-1 bg-[#F5EBE1] hover:bg-[#EADBC8] border-2 border-[#2D1A29] rounded-lg text-xs font-bold text-[#2D1A29]"
            >
              Ledger Archive
            </button>
          </div>
        </div>

        {todaysJournal ? (
          /* Today's Reflection Excerpt (Already Completed) */
          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl p-4 shadow-[2px_2px_0px_#2D1A29] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {todaysJournal.mood === 'triumphant'
                    ? '👑'
                    : todaysJournal.mood === 'creative'
                    ? '🎵'
                    : todaysJournal.mood === 'studious'
                    ? '📖'
                    : '☕'}
                </span>
                <span className="font-bold text-xs text-[#2D1A29] capitalize">
                  {todaysJournal.title || 'Today’s Reflection Entry'}
                </span>
                <span className="text-[11px] font-mono-numbers text-[#6E2D5B]">
                  ({todaysJournal.wordCount} words)
                </span>
              </div>
              <button
                onClick={() => onOpenJournalModal(todayStr)}
                className="text-xs font-bold text-[#6E2D5B] hover:underline"
              >
                Revise Entry
              </button>
            </div>

            <p className="text-xs text-[#521828] leading-relaxed italic bg-white p-3 rounded-lg border border-[#2D1A29]/15">
              "{todaysJournal.content}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-[#1F4E4B] pt-1">
              <span className="font-medium">
                Prompt: {todaysJournal.promptUsed || 'Daily Intellectual Reflection'}
              </span>
              <span className="font-bold">✨ Streak Maintained</span>
            </div>
          </div>
        ) : (
          /* Fast In-line Journal Form (Completes Habit Automatically) */
          <form onSubmit={handleQuickJournalSubmit} className="space-y-3">
            {/* Prompt Inquiry Strip */}
            <div className="bg-[#FDF7EB] border-2 border-[#EED39E] rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-[#DCA136] shrink-0" />
                <span className="text-[#2D1A29] italic truncate">
                  "{REFLECTION_PROMPTS[promptIndex]}"
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPromptIndex((prev) => (prev + 1) % REFLECTION_PROMPTS.length)}
                className="p-1 text-[#6E2D5B] hover:bg-white rounded transition-colors shrink-0 flex items-center gap-1 text-[11px] font-bold"
                title="Cycle Prompt"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">New Prompt</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="Heading (e.g. Breakthrough on Vector Calculus & Sub-Bass)"
                  className="w-full px-3 py-1.5 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
                />
              </div>
              <div className="sm:col-span-1">
                <select
                  value={journalMood}
                  onChange={(e) => setJournalMood(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
                >
                  <option value="reflective">☕ Reflective</option>
                  <option value="studious">📖 Studious</option>
                  <option value="creative">🎵 Creative (Music)</option>
                  <option value="triumphant">👑 Triumphant</option>
                  <option value="peaceful">🌿 Peaceful</option>
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              required
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder="Jot down a quick evening reflection on today's lectures, FL Studio music sessions, calisthenics, or personal victories..."
              className="w-full p-3 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29] leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#F7B5CD]"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-[#521828] italic">
                ✨ Committing automatically completes your 15-Min Evening Journal habit and awards +25 XP.
              </span>

              <button
                type="submit"
                className="px-4 py-2 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl text-xs font-hotel-badge uppercase tracking-wider font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Commit Reflection & Advance Streak (+25 XP)</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Grid: Today's Timeline + Habits & Quick Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (7 cols): Today's Ordered Timeline */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6E2D5B]" />
              <h2 className="text-base font-serif-display font-bold text-[#2D1A29]">
                Today's Chronological Itinerary
              </h2>
            </div>
            <span className="text-xs font-mono-numbers text-[#6E2D5B]">
              {timelineItems.length} Events
            </span>
          </div>

          {timelineItems.length === 0 ? (
            <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-8 text-center shadow-[3px_3px_0px_#2D1A29]">
              <Calendar className="w-8 h-8 text-[#A62B46] mx-auto mb-2" />
              <h3 className="font-serif font-bold text-base text-[#2D1A29]">
                No scheduled appointments today
              </h3>
              <p className="text-xs text-[#521828] mt-1">
                You have an open day on the hotel schedule. Rest, produce music in FL Studio, or log an errand.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {timelineItems.map((item) => {
                const isClass = item.type === 'class';
                const isHabit = item.type === 'habit';

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                      item.completed
                        ? 'bg-[#F5EBE1]/80 border-[#2D1A29]/40 opacity-85 shadow-[1px_1px_0px_#2D1A29]'
                        : 'bg-[#FFFFFF] border-[#2D1A29] shadow-[3px_3px_0px_#2D1A29]'
                    }`}
                  >
                    {/* Time Column */}
                    <div className="w-16 sm:w-20 shrink-0 text-left">
                      <span className="text-xs sm:text-sm font-bold font-mono-numbers text-[#2D1A29] block">
                        {item.time}
                      </span>
                      {item.endTime && (
                        <span className="text-[10px] font-mono-numbers text-[#6E2D5B] block">
                          until {item.endTime}
                        </span>
                      )}
                      <span
                        className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border mt-1 font-hotel-badge"
                        style={{
                          borderColor: item.color,
                          color: item.color,
                          backgroundColor: `${item.color}15`,
                        }}
                      >
                        {item.type}
                      </span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm font-bold truncate ${item.completed ? 'line-through text-[#521828]' : 'text-[#2D1A29]'}`}>
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#521828] mt-0.5 truncate">
                        {item.subTitle}
                      </p>
                      {item.location && (
                        <div className="flex items-center gap-1 text-[11px] font-mono-numbers text-[#1F4E4B] mt-1">
                          <MapPin className="w-3 h-3 text-[#1F4E4B]" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Action Target */}
                    <div className="shrink-0 flex items-center">
                      {isClass && item.course ? (
                        <button
                          onClick={() => {
                            const existing = state.attendance.find(
                              (a) => a.courseId === item.course!.id && a.date === todayStr
                            );
                            onOpenAttendanceModal(item.course!, todayStr, existing);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all flex items-center gap-1.5 ${
                            item.completed
                              ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                              : 'bg-[#FDFBF7] border-[#2D1A29] text-[#2D1A29] hover:bg-[#F7B5CD] shadow-[2px_2px_0px_#2D1A29]'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${item.completed ? 'text-[#1F4E4B]' : 'text-[#6E2D5B]'}`} />
                          <span className="hidden sm:inline">{item.completed ? 'Attended' : 'Roll Call'}</span>
                        </button>
                      ) : isHabit && item.habit ? (
                        <button
                          onClick={() => onToggleHabit(item.habit!.id, todayStr)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            item.completed
                              ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                              : 'bg-[#FDFBF7] border-[#2D1A29] text-[#2D1A29] hover:bg-[#F7B5CD] shadow-[2px_2px_0px_#2D1A29]'
                          }`}
                          aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
                        >
                          <CheckCircle2 className={`w-4 h-4 ${item.completed ? 'text-[#1F4E4B]' : 'text-[#6E2D5B]'}`} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Daily Disciplines & Pending Tasks */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Habits & Real Consecutive Streaks */}
          <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 shadow-[4px_4px_0px_#2D1A29]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#A62B46]" />
                <h2 className="text-sm font-serif-display font-bold text-[#2D1A29]">
                  Daily Disciplines & Streaks
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('habits')}
                className="text-xs font-bold text-[#6E2D5B] hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {todaysHabits.map((habit) => {
                const streakData = calculateHabitStreak(
                  habit,
                  state.habitLogs,
                  state.rpg.freezesUsed,
                  todayStr
                );
                const isDone = streakData.completedToday;

                return (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border-2 transition-all ${
                      isDone
                        ? 'bg-[#F3F9EA] border-[#2D1A29]/50 shadow-[1px_1px_0px_#2D1A29]'
                        : 'bg-[#FDFBF7] border-[#2D1A29] shadow-[2px_2px_0px_#2D1A29]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggleHabit(habit.id, todayStr)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29]'
                            : 'bg-white border-[#2D1A29] hover:bg-[#F7B5CD]'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 text-[#2D1A29]" />}
                      </button>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isDone ? 'line-through text-[#521828]' : 'text-[#2D1A29]'}`}>
                          {habit.title}
                        </span>
                        <span className="text-[10px] text-[#6E2D5B] font-mono-numbers">
                          {habit.timeOfDay ? `@ ${habit.timeOfDay}` : 'Anytime'} · {habit.durationMinutes}m
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-[#FFFFFF] border border-[#2D1A29] rounded-md font-mono-numbers text-xs font-bold text-[#A62B46]">
                      <Flame className="w-3.5 h-3.5 fill-[#A62B46]" />
                      <span>{streakData.currentStreak}d</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Tasks / Urgent Directives */}
          <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 shadow-[4px_4px_0px_#2D1A29]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#6E2D5B]" />
                <h2 className="text-sm font-serif-display font-bold text-[#2D1A29]">
                  Directives & Academic Tasks
                </h2>
              </div>
              <button
                onClick={() => onOpenTaskModal(null, todayStr)}
                className="text-xs font-bold text-[#6E2D5B] hover:underline flex items-center gap-0.5"
              >
                <span>+ New</span>
              </button>
            </div>

            {todaysTasks.length === 0 ? (
              <p className="text-xs text-[#521828] text-center py-4 italic">
                No directives remaining for today. Flawless ledger!
              </p>
            ) : (
              <div className="space-y-2">
                {todaysTasks.slice(0, 4).map((task) => {
                  const course = state.courses.find((c) => c.id === task.courseId);
                  return (
                    <div
                      key={task.id}
                      className={`p-2.5 rounded-xl border-2 transition-all flex items-start gap-2.5 ${
                        task.completed
                          ? 'bg-[#F5EBE1] border-[#2D1A29]/40 opacity-75'
                          : task.priority === 'urgent'
                          ? 'bg-[#FDE8F0] border-[#9E2A2B] shadow-[2px_2px_0px_#9E2A2B]'
                          : 'bg-[#FDFBF7] border-[#2D1A29] shadow-[2px_2px_0px_#2D1A29]'
                      }`}
                    >
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`w-5 h-5 rounded-md border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29]'
                            : 'bg-white border-[#2D1A29] hover:bg-[#F7B5CD]'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-[#2D1A29]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            onClick={() => onOpenTaskModal(task)}
                            className={`text-xs font-bold truncate cursor-pointer hover:underline ${
                              task.completed ? 'line-through text-[#521828]' : 'text-[#2D1A29]'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#521828]">
                          {course && (
                            <span className="font-bold text-[#6E2D5B]">
                              {course.code}
                            </span>
                          )}
                          {task.dueTime && (
                            <span className="font-mono-numbers">
                              Due {task.dueTime}
                            </span>
                          )}
                          {task.estimatedMinutes && (
                            <span>{task.estimatedMinutes}m</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
