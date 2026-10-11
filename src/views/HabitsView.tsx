import React from 'react';
import {
  Flame,
  Award,
  Sparkles,
  Shield,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { AppState, Habit } from '../types';
import {
  calculateHabitStreak,
  formatDate,
  addDays,
} from '../utils/streakEngine';

interface HabitsViewProps {
  state: AppState;
  onToggleHabit: (habitId: string, date: string) => void;
  onOpenHabitModal: (habit?: Habit | null) => void;
  onUseStreakFreeze: (habitId: string, date: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  state,
  onToggleHabit,
  onOpenHabitModal,
  onUseStreakFreeze,
}) => {
  const today = new Date();
  const todayStr = formatDate(today);
  const dayOfWeek = today.getDay();

  // Last 14 days list for visual dot-matrix
  const last14Days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    last14Days.push(formatDate(addDays(today, -i)));
  }

  const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-5 pb-16 md:pb-6 animate-in fade-in duration-150">
      
      {/* Symmetrical Header */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold">
                Daily Disciplines & Regimen
              </span>
              <span className="text-[#6E2D5B]">·</span>
              <span className="text-xs font-mono-numbers text-[#521828]">
                Authentic Consecutive Streak Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-extrabold text-[#2D1A29]">
              Habit Streaks & Consistency
            </h1>
            <p className="text-xs sm:text-sm text-[#521828] mt-1 max-w-xl">
              Real streaks calculate consecutive scheduled days without false counts. Missing a non-scheduled day never penalizes your discipline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#FDE8F0] border-2 border-[#2D1A29] px-3 py-2 rounded-xl">
              <Shield className="w-4 h-4 text-[#A62B46]" />
              <span className="text-xs font-mono-numbers font-bold text-[#2D1A29]">
                {state.rpg.streakFreezesAvailable} Freezes
              </span>
            </div>

            <button
              onClick={() => onOpenHabitModal(null)}
              className="px-4 py-2 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl text-xs font-hotel-badge uppercase tracking-wider font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Discipline</span>
            </button>
          </div>
        </div>

        {/* Legend strip clarifying real streak distinctions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t-2 border-[#2D1A29]/15 text-xs">
          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#2D1A29]/30">
            <span className="font-bold text-[#A62B46] block">Current Streak</span>
            <span className="text-[11px] text-[#521828]">Unbroken scheduled chain</span>
          </div>
          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#2D1A29]/30">
            <span className="font-bold text-[#6E2D5B] block">Longest Streak</span>
            <span className="text-[11px] text-[#521828]">All-time maximum run</span>
          </div>
          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#2D1A29]/30">
            <span className="font-bold text-[#1F4E4B] block">Weekly Consistency</span>
            <span className="text-[11px] text-[#521828]">7-day completion %</span>
          </div>
          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#2D1A29]/30">
            <span className="font-bold text-[#DCA136] block">Lifetime Completed</span>
            <span className="text-[11px] text-[#521828]">Total logs recorded</span>
          </div>
        </div>
      </div>

      {/* Habit Cards */}
      <div className="space-y-4">
        {state.habits.map((habit) => {
          const streak = calculateHabitStreak(
            habit,
            state.habitLogs,
            state.rpg.freezesUsed,
            todayStr
          );
          const isDoneToday = streak.completedToday;
          const isDueToday = streak.isDueToday;
          const category = state.categories.find((c) => c.id === habit.categoryId);

          return (
            <div
              key={habit.id}
              className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#2D1A29] space-y-4"
            >
              {/* Habit Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Today checkoff trigger */}
                  <button
                    onClick={() => onToggleHabit(habit.id, todayStr)}
                    className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                      isDoneToday
                        ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29]'
                        : 'bg-[#FFFFFF] border-[#2D1A29] text-[#2D1A29] hover:bg-[#F7B5CD] shadow-[2px_2px_0px_#2D1A29]'
                    }`}
                    title={isDoneToday ? 'Mark today incomplete' : 'Complete today (+20 XP)'}
                  >
                    {isDoneToday && <CheckCircle2 className="w-6 h-6 text-[#2D1A29]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-[#2D1A29]">
                        {habit.title}
                      </span>
                      {category && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border border-[#2D1A29]/30 bg-[#F5EBE1]">
                          {category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#521828]">
                      {habit.timeOfDay && (
                        <span className="font-mono-numbers flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#6E2D5B]" />
                          {habit.timeOfDay} ({habit.durationMinutes}m)
                        </span>
                      )}
                      <span>
                        Cadence: {habit.frequency === 'daily' ? 'Daily' : habit.frequency === 'weekdays' ? 'Mon-Fri' : 'Custom Days'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => onOpenHabitModal(habit)}
                  className="px-3 py-1 text-xs font-bold bg-[#F5EBE1] hover:bg-[#EADBC8] border-2 border-[#2D1A29] rounded-lg text-[#2D1A29] self-start sm:self-auto"
                >
                  Configure
                </button>
              </div>

              {/* 4 Stats Matrix for this specific discipline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FDFBF7] p-3 rounded-xl border border-[#2D1A29]/20">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase text-[#521828] block">Current Streak</span>
                  <span className="text-xl font-bold font-mono-numbers text-[#A62B46] flex items-center justify-center sm:justify-start gap-1">
                    <Flame className="w-4 h-4 fill-[#A62B46]" />
                    {streak.currentStreak} Days
                  </span>
                </div>
                <div className="text-center sm:text-left border-l border-[#2D1A29]/15 pl-2">
                  <span className="text-[10px] font-bold uppercase text-[#521828] block">Longest Record</span>
                  <span className="text-xl font-bold font-mono-numbers text-[#2D1A29] flex items-center justify-center sm:justify-start gap-1">
                    <Award className="w-4 h-4 text-[#DCA136]" />
                    {streak.longestStreak} Days
                  </span>
                </div>
                <div className="text-center sm:text-left border-l border-[#2D1A29]/15 pl-2">
                  <span className="text-[10px] font-bold uppercase text-[#521828] block">7-Day Consistency</span>
                  <span className="text-xl font-bold font-mono-numbers text-[#1F4E4B]">
                    {streak.weeklyConsistency}%
                  </span>
                </div>
                <div className="text-center sm:text-left border-l border-[#2D1A29]/15 pl-2">
                  <span className="text-[10px] font-bold uppercase text-[#521828] block">Lifetime Done</span>
                  <span className="text-xl font-bold font-mono-numbers text-[#2D1A29]">
                    {streak.totalCompleted} Sessions
                  </span>
                </div>
              </div>

              {/* 14-Day Visual Dot Matrix */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#521828]">
                  <span className="font-bold">Past 14 Days History:</span>
                  <span className="font-mono-numbers">
                    {isDueToday ? (isDoneToday ? '✅ Done Today' : '⏳ Due Today') : '💤 Rest Day'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                  {last14Days.map((dStr) => {
                    const d = new Date(dStr);
                    const dNum = d.getDay();
                    const isScheduled = habit.targetDays.includes(dNum);
                    const isCompleted = !!state.habitLogs[`${dStr}_${habit.id}`]?.completed;
                    const isFreezeUsed = state.rpg.freezesUsed.some(
                      (f) => f.habitId === habit.id && f.date === dStr
                    );
                    const isTodayCell = dStr === todayStr;

                    return (
                      <div
                        key={dStr}
                        onClick={() => onToggleHabit(habit.id, dStr)}
                        className={`flex-1 min-w-[28px] max-w-[42px] h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isTodayCell
                            ? 'ring-2 ring-[#2D1A29] font-bold'
                            : ''
                        } ${
                          isCompleted
                            ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29]'
                            : isFreezeUsed
                            ? 'bg-[#FFD4BA] border-[#2D1A29] text-[#2D1A29]'
                            : isScheduled
                            ? dStr < todayStr
                              ? 'bg-[#FDE8F0] border-[#9E2A2B]/40 text-[#9E2A2B]'
                              : 'bg-[#FDFBF7] border-[#2D1A29]/30 text-[#521828]'
                            : 'bg-[#F5EBE1]/40 border-dashed border-[#2D1A29]/20 text-[#2D1A29]/30'
                        }`}
                        title={`${dStr}: ${
                          isCompleted
                            ? 'Completed'
                            : isFreezeUsed
                            ? 'Streak Frozen'
                            : isScheduled
                            ? 'Missed / Scheduled'
                            : 'Off Day'
                        }`}
                      >
                        <span className="text-[9px] uppercase">{DAY_INITIALS[dNum]}</span>
                        <span className="text-[10px] font-mono-numbers">
                          {isCompleted ? '✓' : isFreezeUsed ? '🛡️' : isScheduled ? '—' : '·'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {habit.notes && (
                <p className="text-xs text-[#521828] italic bg-[#FDFBF7] p-2.5 rounded-lg border border-[#2D1A29]/15">
                  "{habit.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
