import { Habit, HabitLog, StreakFreezeLog, AttendanceRecord, Task } from '../types';

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDayDifference(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

export interface HabitStreakResult {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completedToday: boolean;
  isDueToday: boolean;
  weeklyConsistency: number; // 0 to 100%
  monthlyConsistency: number; // 0 to 100%
  lastCompletedDate?: string;
  streakStatus: 'active' | 'pending_today' | 'broken' | 'frozen';
}

/**
 * Calculates genuine consecutive streaks for a habit based on its scheduled days.
 * If a habit is only scheduled Mon/Wed/Fri, missing Tuesday is NOT a break!
 * If today is not yet completed, the streak from yesterday is preserved as 'pending_today'.
 */
export function calculateHabitStreak(
  habit: Habit,
  habitLogs: Record<string, HabitLog>,
  freezes: StreakFreezeLog[] = [],
  referenceDateStr?: string
): HabitStreakResult {
  const today = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const todayStr = formatDate(today);
  const targetDays = habit.targetDays || [0, 1, 2, 3, 4, 5, 6];

  const todayKey = `${todayStr}_${habit.id}`;
  const completedToday = !!habitLogs[todayKey]?.completed;
  const isDueToday = targetDays.includes(today.getDay());

  // Count total completions across all time
  let totalCompleted = 0;
  let lastCompletedDate: string | undefined;

  // Gather all past scheduled dates up to today (going back up to 365 days)
  const scheduledDates: { dateStr: string; date: Date }[] = [];
  for (let i = 365; i >= 0; i--) {
    const d = addDays(today, -i);
    if (targetDays.includes(d.getDay())) {
      scheduledDates.push({ dateStr: formatDate(d), date: d });
    }
  }

  // Set of dates where freeze was applied
  const freezeDates = new Set(
    freezes.filter((f) => f.habitId === habit.id).map((f) => f.date)
  );

  // Scan history to calculate longest streak and total completed
  let longestStreak = 0;
  let runningStreak = 0;

  for (const { dateStr } of scheduledDates) {
    const key = `${dateStr}_${habit.id}`;
    const isCompleted = !!habitLogs[key]?.completed;
    const isFrozen = freezeDates.has(dateStr);

    if (isCompleted) {
      totalCompleted++;
      lastCompletedDate = dateStr;
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else if (isFrozen) {
      // Freeze preserves streak without breaking or resetting
      // runningStreak stays unchanged
    } else {
      // If this date is today and it's not over yet, don't break the historical streak!
      if (dateStr === todayStr) {
        // Today is not complete yet, running streak stands
      } else {
        runningStreak = 0;
      }
    }
  }

  // Calculate current streak by walking backward from today
  let currentStreak = 0;
  let streakStatus: 'active' | 'pending_today' | 'broken' | 'frozen' = 'broken';

  // Walk backward from scheduled dates
  const reversedDates = [...scheduledDates].reverse();

  let startIndex = 0;
  if (isDueToday) {
    if (completedToday) {
      currentStreak = 1;
      streakStatus = 'active';
      startIndex = 1; // start checking yesterday
    } else {
      // Today is due but not yet completed. The streak from yesterday is still valid until day ends!
      startIndex = 1;
      streakStatus = 'pending_today';
    }
  } else {
    // Habit is not due today. Check previous scheduled day.
    startIndex = 0;
    streakStatus = 'active';
  }

  // Check previous scheduled days
  for (let i = startIndex; i < reversedDates.length; i++) {
    const { dateStr } = reversedDates[i];
    // Skip if it is today
    if (dateStr === todayStr) continue;

    const key = `${dateStr}_${habit.id}`;
    const isCompleted = !!habitLogs[key]?.completed;
    const isFrozen = freezeDates.has(dateStr);

    if (isCompleted) {
      currentStreak++;
    } else if (isFrozen) {
      if (streakStatus !== 'active' && streakStatus !== 'pending_today') {
        streakStatus = 'frozen';
      }
    } else {
      // Break encountered in consecutive scheduled chain
      break;
    }
  }

  if (currentStreak === 0 && !completedToday) {
    streakStatus = 'broken';
  }

  // Calculate Weekly Consistency (last 7 calendar days)
  let past7Scheduled = 0;
  let past7Completed = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, -i);
    if (targetDays.includes(d.getDay())) {
      past7Scheduled++;
      const key = `${formatDate(d)}_${habit.id}`;
      if (habitLogs[key]?.completed) past7Completed++;
    }
  }
  const weeklyConsistency = past7Scheduled > 0 ? Math.round((past7Completed / past7Scheduled) * 100) : 100;

  // Calculate Monthly Consistency (last 30 calendar days)
  let past30Scheduled = 0;
  let past30Completed = 0;
  for (let i = 0; i < 30; i++) {
    const d = addDays(today, -i);
    if (targetDays.includes(d.getDay())) {
      past30Scheduled++;
      const key = `${formatDate(d)}_${habit.id}`;
      if (habitLogs[key]?.completed) past30Completed++;
    }
  }
  const monthlyConsistency = past30Scheduled > 0 ? Math.round((past30Completed / past30Scheduled) * 100) : 100;

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompleted,
    completedToday,
    isDueToday,
    weeklyConsistency,
    monthlyConsistency,
    lastCompletedDate,
    streakStatus,
  };
}

/**
 * Real Course Attendance Streak
 * Only actual lecture/tutorial dates that occurred count.
 * Missing a day where no lecture was held NEVER breaks an attendance streak!
 */
export function calculateCourseAttendance(
  courseId: string,
  records: AttendanceRecord[]
): {
  attendancePercentage: number;
  currentStreak: number;
  totalPresent: number;
  totalLate: number;
  totalExcused: number;
  totalAbsent: number;
  totalSessions: number;
} {
  const courseRecords = records
    .filter((r) => r.courseId === courseId && r.status !== 'unrecorded')
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  let totalPresent = 0;
  let totalLate = 0;
  let totalExcused = 0;
  let totalAbsent = 0;

  courseRecords.forEach((r) => {
    if (r.status === 'present') totalPresent++;
    else if (r.status === 'late') totalLate++;
    else if (r.status === 'excused') totalExcused++;
    else if (r.status === 'absent') totalAbsent++;
  });

  const totalSessions = courseRecords.length;
  // Weighted percentage: present = 100%, excused = 100%, late = 70%, absent = 0%
  const effectiveAttended = totalPresent + totalExcused + totalLate * 0.7;
  const attendancePercentage = totalSessions > 0 ? Math.round((effectiveAttended / totalSessions) * 100) : 100;

  // Current Streak (consecutive present or late without absence)
  let currentStreak = 0;
  for (const r of courseRecords) {
    if (r.status === 'present' || r.status === 'late' || r.status === 'excused') {
      currentStreak++;
    } else if (r.status === 'absent') {
      break;
    }
  }

  return {
    attendancePercentage,
    currentStreak,
    totalPresent,
    totalLate,
    totalExcused,
    totalAbsent,
    totalSessions,
  };
}

/**
 * Calculates Daily Completion Rate and Perfect Day status
 */
export function calculateDailyCompletion(
  dateStr: string,
  habits: Habit[],
  tasks: Task[],
  habitLogs: Record<string, HabitLog>
): {
  totalItems: number;
  completedItems: number;
  percentage: number;
  isPerfect: boolean;
} {
  const date = parseDate(dateStr);
  const dayOfWeek = date.getDay();

  // Habits due on this day
  const dueHabits = habits.filter((h) => !h.archived && h.targetDays.includes(dayOfWeek));
  let completedHabits = 0;
  dueHabits.forEach((h) => {
    const key = `${dateStr}_${h.id}`;
    if (habitLogs[key]?.completed) completedHabits++;
  });

  // Tasks due on this day
  const dueTasks = tasks.filter((t) => t.dueDate === dateStr);
  let completedTasks = 0;
  dueTasks.forEach((t) => {
    if (t.completed) completedTasks++;
  });

  const totalItems = dueHabits.length + dueTasks.length;
  const completedItems = completedHabits + completedTasks;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isPerfect = totalItems > 0 && completedItems === totalItems;

  return {
    totalItems,
    completedItems,
    percentage,
    isPerfect,
  };
}

/**
 * RPG Level and Title calculations
 */
export const HOTEL_RANKS = [
  { level: 1, title: 'Lobby Attendant', perk: 'New arrival to the academy' },
  { level: 3, title: 'Junior Luggage Porter', perk: 'Carrying coursework with grace' },
  { level: 5, title: 'Elevator Operator Extraordinaire', perk: 'Ascending through the semesters' },
  { level: 8, title: 'Patisserie Courier', perk: 'Delivering sharp focus and precision' },
  { level: 12, title: 'Keeper of the Room Keys', perk: 'Mastery over daily schedules' },
  { level: 16, title: 'Sous-Concierge of the East Wing', perk: 'Harmonious music & study balance' },
  { level: 20, title: 'Grand Concierge of the Academy', perk: 'Commanding high distinction' },
  { level: 25, title: 'Master of Ceremonies', perk: 'Flawless habit execution' },
  { level: 30, title: 'Keeper of the Imperial Ledger', perk: 'Impeccable semester GPA & consistency' },
  { level: 40, title: 'Grand Chancellor of the Hotel Academy', perk: 'Living legend of the society' },
];

export function getRankForLevel(level: number): { title: string; perk: string } {
  let activeRank = HOTEL_RANKS[0];
  for (const rank of HOTEL_RANKS) {
    if (level >= rank.level) {
      activeRank = rank;
    }
  }
  return activeRank;
}

export function getXpForNextLevel(currentLevel: number): number {
  return Math.floor(120 * Math.pow(currentLevel, 1.35));
}
