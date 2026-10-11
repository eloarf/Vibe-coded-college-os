export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent' | 'unrecorded';

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color
  bgLight: string;
  borderColor: string;
  icon: string;
  isCustom?: boolean;
}

export interface Semester {
  id: string;
  name: string; // e.g., "Semester 1"
  academicYear: string; // e.g., "2026/27"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
  targetGPA?: number;
}

export interface Course {
  id: string;
  code: string; // e.g. "PSYC1011"
  name: string; // e.g. "General Psychology"
  instructor?: string;
  room?: string; // e.g. "B59-2-005"
  credits: number;
  color: string;
  semesterId: string;
  notes?: string;
  targetGrade?: string;
  currentGrade?: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "HH:MM" e.g. "08:30"
  endTime: string; // "HH:MM" e.g. "10:20"
  sessionType: 'lecture' | 'tutorial' | 'lab' | 'seminar';
  room?: string;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  note?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  courseId?: string; // Optional course attachment
  priority: Priority;
  startDate?: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  estimatedMinutes?: number;
  recurrence: 'none' | 'daily' | 'weekly' | 'custom';
  recurrenceDays?: number[]; // [1, 2, 3, 4, 5]
  completed: boolean;
  completedAt?: string;
  tags: string[];
  notes?: string;
  isExamOrAssignment?: boolean;
  weightPercentage?: number;
}

export interface Habit {
  id: string;
  title: string;
  categoryId: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  targetDays: number[]; // [0..6] days of week
  icon: string;
  timeOfDay?: string; // "05:45"
  durationMinutes?: number;
  notes?: string;
  color?: string;
  archived?: boolean;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  habitId: string;
  completed: boolean;
  completedAt?: string;
}

export interface StreakFreezeLog {
  date: string;
  habitId: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'academic' | 'habits' | 'tasks' | 'music' | 'special';
  xpReward: number;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  honorific: string;
  roomNumber: string;
  soundEnabled: boolean;
  avatarIcon: string;
}

export interface RPGState {
  xp: number;
  level: number;
  streakFreezesAvailable: number;
  freezesUsed: StreakFreezeLog[];
  unlockedAchievementIds: string[];
  totalTasksCompleted: number;
  totalHabitsCompleted: number;
  totalLecturesAttended: number;
  perfectDaysCount: number;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  mood?: 'triumphant' | 'reflective' | 'studious' | 'creative' | 'peaceful';
  promptUsed?: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  user: UserProfile;
  rpg: RPGState;
  semesters: Semester[];
  activeSemesterId: string;
  courses: Course[];
  classSessions: ClassSession[];
  attendance: AttendanceRecord[];
  habits: Habit[];
  habitLogs: Record<string, HabitLog>; // Key: "YYYY-MM-DD_habitId"
  tasks: Task[];
  categories: Category[];
  taskCompletionsByDate: Record<string, string[]>; // "YYYY-MM-DD": [taskId1, taskId2]
  perfectDays: Record<string, boolean>; // "YYYY-MM-DD": true
  journalEntries: Record<string, JournalEntry>; // Key: "YYYY-MM-DD"
}
