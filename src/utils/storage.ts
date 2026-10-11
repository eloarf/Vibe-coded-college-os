import { AppState, Achievement } from '../types';
import { formatDate, addDays } from './streakEngine';

const STORAGE_KEY = 'the_grand_academic_hotel_os_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-step',
    title: 'The Grand Arrival',
    description: 'Check in for your first day at the Academy and log an activity.',
    icon: 'DoorOpen',
    category: 'special',
    xpReward: 50,
  },
  {
    id: 'ach-streak-3',
    title: 'Trio of Discipline',
    description: 'Maintain a 3-day consecutive habit streak without breaking.',
    icon: 'Flame',
    category: 'streak',
    xpReward: 100,
  },
  {
    id: 'ach-streak-7',
    title: 'Flawless Week',
    description: 'Achieve a 7-day uninterrupted streak in any discipline.',
    icon: 'Award',
    category: 'streak',
    xpReward: 250,
  },
  {
    id: 'ach-perfect-day',
    title: 'The Master Ledger',
    description: 'Score a Perfect Day: complete 100% of all scheduled habits and tasks.',
    icon: 'Sparkles',
    category: 'habits',
    xpReward: 150,
  },
  {
    id: 'ach-maestro',
    title: 'The FL Studio Maestro',
    description: 'Log 10 music production and sound design sessions.',
    icon: 'Music',
    category: 'music',
    xpReward: 200,
  },
  {
    id: 'ach-punctual',
    title: 'Punctual Scholar',
    description: 'Record 10 consecutive attended lectures with zero unexcused absences.',
    icon: 'GraduationCap',
    category: 'academic',
    xpReward: 200,
  },
  {
    id: 'ach-task-slayer',
    title: 'Errands Dispatched',
    description: 'Complete 25 academic or personal tasks.',
    icon: 'CheckCheck',
    category: 'tasks',
    xpReward: 250,
  },
  {
    id: 'ach-dawn-patrol',
    title: 'Dawn Patrol Runner',
    description: 'Complete morning run and calisthenics 5 times.',
    icon: 'Footprints',
    category: 'habits',
    xpReward: 150,
  },
];

export function getInitialState(): AppState {
  const today = new Date();
  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(addDays(today, -1));
  const twoDaysAgoStr = formatDate(addDays(today, -2));
  const threeDaysAgoStr = formatDate(addDays(today, -3));
  const fourDaysAgoStr = formatDate(addDays(today, -4));

  return {
    user: {
      name: 'Fraole',
      honorific: 'Master',
      roomNumber: 'Suite 101',
      soundEnabled: true,
      avatarIcon: 'Key',
    },
    rpg: {
      xp: 420,
      level: 3,
      streakFreezesAvailable: 2,
      freezesUsed: [],
      unlockedAchievementIds: ['ach-first-step', 'ach-streak-3'],
      totalTasksCompleted: 8,
      totalHabitsCompleted: 14,
      totalLecturesAttended: 12,
      perfectDaysCount: 3,
    },
    semesters: [
      {
        id: 'sem-2026-1',
        name: 'Semester 1',
        academicYear: '2026/27',
        startDate: '2026-09-01',
        endDate: '2027-01-31',
        isCurrent: true,
        targetGPA: 3.85,
      },
      {
        id: 'sem-2026-2',
        name: 'Semester 2',
        academicYear: '2026/27',
        startDate: '2027-02-15',
        endDate: '2027-06-30',
        isCurrent: false,
        targetGPA: 3.9,
      },
    ],
    activeSemesterId: 'sem-2026-1',
    categories: [
      {
        id: 'cat-univ',
        name: 'University Academics',
        color: '#6E2D5B',
        bgLight: '#FBF0F6',
        borderColor: '#E8B3D3',
        icon: 'GraduationCap',
      },
      {
        id: 'cat-music',
        name: 'Music & Production',
        color: '#A62B46',
        bgLight: '#FCEDF0',
        borderColor: '#F6B7C3',
        icon: 'Music',
      },
      {
        id: 'cat-pers',
        name: 'Personal Development',
        color: '#1F4E4B',
        bgLight: '#EEF7F6',
        borderColor: '#AFD7D4',
        icon: 'Sparkles',
      },
      {
        id: 'cat-habit',
        name: 'Daily Disciplines & Health',
        color: '#6B8E23',
        bgLight: '#F3F9EA',
        borderColor: '#CBE597',
        icon: 'Heart',
      },
      {
        id: 'cat-chores',
        name: 'Living & Quarters',
        color: '#B57314',
        bgLight: '#FDF7EB',
        borderColor: '#EED39E',
        icon: 'Home',
      },
    ],
    courses: [
      {
        id: 'c-psyc',
        code: 'PSYC1011',
        name: 'General Psychology',
        instructor: 'Dr. Alistair Finch',
        room: 'B59-2-005',
        credits: 3,
        color: '#6E2D5B',
        semesterId: 'sem-2026-1',
        notes: 'Cognitive behavioral modules & sensory perception experiments.',
        targetGrade: 'A',
      },
      {
        id: 'c-anth',
        code: 'ANTH1002',
        name: 'Social Anthropology',
        instructor: 'Prof. Clara Dupuis',
        room: 'A12-104',
        credits: 3,
        color: '#A62B64',
        semesterId: 'sem-2026-1',
        notes: 'Cultural rituals, kinship systems, ethnographic fieldwork.',
        targetGrade: 'A',
      },
      {
        id: 'c-gees',
        code: 'GEES1005',
        name: 'Geography',
        instructor: 'Dr. Henrik Vogel',
        room: 'C30-201',
        credits: 3,
        color: '#1F4E4B',
        semesterId: 'sem-2026-1',
        notes: 'Geomorphology, spatial cartography, climate systems.',
        targetGrade: 'A',
      },
      {
        id: 'c-math',
        code: 'MATH1007',
        name: 'Applied Mathematics',
        instructor: 'Prof. O. Kowalski',
        room: 'M04-101',
        credits: 4,
        color: '#1B3B8A',
        semesterId: 'sem-2026-1',
        notes: 'Differential equations, linear algebra, vector calculus.',
        targetGrade: 'A-',
      },
      {
        id: 'c-entr',
        code: 'ENTR1006',
        name: 'Entrepreneurship',
        instructor: 'Madam M. Beauregard',
        room: 'E22-305',
        credits: 3,
        color: '#D46A1E',
        semesterId: 'sem-2026-1',
        notes: 'Venture design, lean modeling, financial unit economics.',
        targetGrade: 'A',
      },
      {
        id: 'c-eng',
        code: 'FLEN1003',
        name: 'Communicative English',
        instructor: 'Mr. Julian Croft',
        room: 'L01-102',
        credits: 3,
        color: '#2E7D32',
        semesterId: 'sem-2026-1',
        notes: 'Academic rhetoric, technical writing, symposium debate.',
        targetGrade: 'A',
      },
      {
        id: 'c-phil',
        code: 'PHIL1009',
        name: 'Logic & Critical Thinking',
        instructor: 'Dr. Thaddeus Moore',
        room: 'P08-204',
        credits: 3,
        color: '#9E2A2B',
        semesterId: 'sem-2026-1',
        notes: 'Syllogistic logic, fallacies, propositional calculus.',
        targetGrade: 'A',
      },
    ],
    classSessions: [
      // Monday
      { id: 's-psyc-mon', courseId: 'c-psyc', dayOfWeek: 1, startTime: '08:30', endTime: '10:20', sessionType: 'lecture', room: 'B59-2-005' },
      { id: 's-anth-mon', courseId: 'c-anth', dayOfWeek: 1, startTime: '13:30', endTime: '15:20', sessionType: 'lecture', room: 'A12-104' },
      // Tuesday
      { id: 's-gees-tue', courseId: 'c-gees', dayOfWeek: 2, startTime: '10:30', endTime: '12:20', sessionType: 'lecture', room: 'C30-201' },
      { id: 's-math-tue', courseId: 'c-math', dayOfWeek: 2, startTime: '14:00', endTime: '16:50', sessionType: 'tutorial', room: 'M04-101' },
      // Wednesday
      { id: 's-entr-wed', courseId: 'c-entr', dayOfWeek: 3, startTime: '10:30', endTime: '12:20', sessionType: 'lecture', room: 'E22-305' },
      // Thursday
      { id: 's-eng-thu', courseId: 'c-eng', dayOfWeek: 4, startTime: '10:30', endTime: '12:20', sessionType: 'lecture', room: 'L01-102' },
      { id: 's-phil-thu', courseId: 'c-phil', dayOfWeek: 4, startTime: '13:30', endTime: '15:20', sessionType: 'lecture', room: 'P08-204' },
      // Friday
      { id: 's-math-fri', courseId: 'c-math', dayOfWeek: 5, startTime: '08:30', endTime: '10:20', sessionType: 'lecture', room: 'M04-101' },
      { id: 's-eng-fri', courseId: 'c-eng', dayOfWeek: 5, startTime: '14:00', endTime: '15:50', sessionType: 'tutorial', room: 'L01-102' },
    ],
    attendance: [
      { id: 'att-1', courseId: 'c-psyc', date: fourDaysAgoStr, status: 'present', timestamp: `${fourDaysAgoStr}T08:35:00` },
      { id: 'att-2', courseId: 'c-anth', date: fourDaysAgoStr, status: 'present', timestamp: `${fourDaysAgoStr}T13:35:00` },
      { id: 'att-3', courseId: 'c-gees', date: threeDaysAgoStr, status: 'present', timestamp: `${threeDaysAgoStr}T10:32:00` },
      { id: 'att-4', courseId: 'c-math', date: threeDaysAgoStr, status: 'present', timestamp: `${threeDaysAgoStr}T14:05:00` },
      { id: 'att-5', courseId: 'c-entr', date: twoDaysAgoStr, status: 'present', timestamp: `${twoDaysAgoStr}T10:30:00` },
      { id: 'att-6', courseId: 'c-eng', date: yesterdayStr, status: 'present', timestamp: `${yesterdayStr}T10:30:00` },
      { id: 'att-7', courseId: 'c-phil', date: yesterdayStr, status: 'late', note: 'Arrived 4 mins late after library consultation', timestamp: `${yesterdayStr}T13:34:00` },
    ],
    habits: [
      {
        id: 'h-run',
        title: 'Morning Run & Calisthenics',
        categoryId: 'cat-habit',
        frequency: 'custom',
        targetDays: [1, 3, 5], // Mon, Wed, Fri
        icon: 'Footprints',
        timeOfDay: '05:45',
        durationMinutes: 45,
        notes: 'Warm-up stretch, 5km brisk run around the courtyard, pull-up pyramid.',
        color: '#6B8E23',
      },
      {
        id: 'h-journ',
        title: '15-Min Evening Journaling',
        categoryId: 'cat-pers',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6], // Daily
        icon: 'BookOpen',
        timeOfDay: '20:15',
        durationMinutes: 15,
        notes: 'Reflect on lectures, creative ideas, daily gratitude ledger.',
        color: '#1F4E4B',
      },
      {
        id: 'h-music',
        title: 'Personal Music Study & FL Studio',
        categoryId: 'cat-music',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6], // Daily
        icon: 'Music',
        timeOfDay: '20:30',
        durationMinutes: 60,
        notes: 'Sound design, melody arrangement, mix bus compression experiments.',
        color: '#A62B46',
      },
      {
        id: 'h-study',
        title: 'Deep Focus Academic Revision',
        categoryId: 'cat-univ',
        frequency: 'weekdays',
        targetDays: [1, 2, 3, 4, 5],
        icon: 'Cpu',
        timeOfDay: '17:00',
        durationMinutes: 90,
        notes: 'Calculus problem sets and Psychology reading notes.',
        color: '#6E2D5B',
      },
      {
        id: 'h-water',
        title: 'Hydration & Posture Reset',
        categoryId: 'cat-habit',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        icon: 'Droplet',
        timeOfDay: '12:30',
        durationMinutes: 5,
        notes: 'Drink 2.5L clean water, posture alignment check.',
        color: '#1B3B8A',
      },
    ],
    habitLogs: {
      [`${fourDaysAgoStr}_h-journ`]: { date: fourDaysAgoStr, habitId: 'h-journ', completed: true },
      [`${fourDaysAgoStr}_h-music`]: { date: fourDaysAgoStr, habitId: 'h-music', completed: true },
      [`${threeDaysAgoStr}_h-journ`]: { date: threeDaysAgoStr, habitId: 'h-journ', completed: true },
      [`${threeDaysAgoStr}_h-music`]: { date: threeDaysAgoStr, habitId: 'h-music', completed: true },
      [`${twoDaysAgoStr}_h-run`]: { date: twoDaysAgoStr, habitId: 'h-run', completed: true },
      [`${twoDaysAgoStr}_h-journ`]: { date: twoDaysAgoStr, habitId: 'h-journ', completed: true },
      [`${twoDaysAgoStr}_h-music`]: { date: twoDaysAgoStr, habitId: 'h-music', completed: true },
      [`${twoDaysAgoStr}_h-study`]: { date: twoDaysAgoStr, habitId: 'h-study', completed: true },
      [`${yesterdayStr}_h-journ`]: { date: yesterdayStr, habitId: 'h-journ', completed: true },
      [`${yesterdayStr}_h-music`]: { date: yesterdayStr, habitId: 'h-music', completed: true },
      [`${yesterdayStr}_h-study`]: { date: yesterdayStr, habitId: 'h-study', completed: true },
      [`${yesterdayStr}_h-water`]: { date: yesterdayStr, habitId: 'h-water', completed: true },
    },
    tasks: [
      {
        id: 't-math-prob',
        title: 'Complete Vector Calculus Problem Set 4',
        description: 'Questions 14 through 28 from Kowalski handbook on Stokes Theorem.',
        categoryId: 'cat-univ',
        courseId: 'c-math',
        priority: 'high',
        startDate: yesterdayStr,
        dueDate: todayStr,
        dueTime: '18:00',
        estimatedMinutes: 90,
        recurrence: 'none',
        completed: false,
        tags: ['Math', 'Calculus', 'Urgent'],
        notes: 'Check lecture notes from Friday regarding green curl.',
        isExamOrAssignment: true,
        weightPercentage: 10,
      },
      {
        id: 't-psyc-read',
        title: 'Review Chapter 5: Neurotransmitters & Cognition',
        description: 'Summarize acetylcholine and dopamine pathways for Friday quiz.',
        categoryId: 'cat-univ',
        courseId: 'c-psyc',
        priority: 'normal',
        dueDate: todayStr,
        dueTime: '21:00',
        estimatedMinutes: 45,
        recurrence: 'none',
        completed: false,
        tags: ['Psychology', 'Reading'],
      },
      {
        id: 't-fl-bass',
        title: 'Synthesize Sub-Bass Patch in Vital / FL Studio',
        description: 'Design warm analog-style 808 with harmonic saturation for upcoming track.',
        categoryId: 'cat-music',
        priority: 'normal',
        dueDate: todayStr,
        dueTime: '22:00',
        estimatedMinutes: 40,
        recurrence: 'none',
        completed: false,
        tags: ['FL Studio', 'Sound Design'],
      },
      {
        id: 't-anth-essay',
        title: 'Draft Ethnographic Outline for Social Anthropology',
        description: 'Propose field observation site and theoretical framework.',
        categoryId: 'cat-univ',
        courseId: 'c-anth',
        priority: 'high',
        dueDate: formatDate(addDays(today, 3)),
        dueTime: '23:59',
        estimatedMinutes: 120,
        recurrence: 'none',
        completed: false,
        tags: ['Anthropology', 'Essay'],
        isExamOrAssignment: true,
        weightPercentage: 15,
      },
      {
        id: 't-gees-map',
        title: 'GIS Topographical Map Projection Assignment',
        description: 'Generate contour map layer using coordinates provided in lab.',
        categoryId: 'cat-univ',
        courseId: 'c-gees',
        priority: 'normal',
        dueDate: formatDate(addDays(today, 5)),
        estimatedMinutes: 60,
        recurrence: 'none',
        completed: false,
        tags: ['Geography', 'Lab'],
        isExamOrAssignment: true,
        weightPercentage: 10,
      },
      {
        id: 't-room-clean',
        title: 'Suite 101 Desk Reorganization & Stationery Restock',
        categoryId: 'cat-chores',
        priority: 'low',
        dueDate: formatDate(addDays(today, 1)),
        estimatedMinutes: 30,
        recurrence: 'weekly',
        completed: true,
        completedAt: `${yesterdayStr}T18:00:00`,
        tags: ['Suite', 'Tidy'],
      },
    ],
    taskCompletionsByDate: {
      [yesterdayStr]: ['t-room-clean'],
    },
    perfectDays: {
      [twoDaysAgoStr]: true,
    },
    journalEntries: {
      [yesterdayStr]: {
        id: `j-${yesterdayStr}`,
        date: yesterdayStr,
        title: 'Reflections on Logic & FL Studio Compression',
        content: 'Attended Communicative English and Logic lectures today. Dr. Moore emphasized propositional calculus and avoiding affirming the consequent. Later this evening in Suite 101, dialed in warm analog saturation on the master mix bus in FL Studio. Steady progress across disciplines.',
        mood: 'studious',
        promptUsed: 'What was your core intellectual breakthrough today?',
        wordCount: 46,
        createdAt: `${yesterdayStr}T20:25:00`,
        updatedAt: `${yesterdayStr}T20:25:00`,
      },
      [twoDaysAgoStr]: {
        id: `j-${twoDaysAgoStr}`,
        date: twoDaysAgoStr,
        title: 'Morning Courtyard Run & Entrepreneurship Case Study',
        content: 'Brisk 5km run at 05:45 through the courtyard mist. Solved unit economics model for Madam Beauregard’s entrepreneurship class. Grateful for quiet focus and disciplined habits.',
        mood: 'triumphant',
        promptUsed: 'What was today’s victory?',
        wordCount: 31,
        createdAt: `${twoDaysAgoStr}T20:20:00`,
        updatedAt: `${twoDaysAgoStr}T20:20:00`,
      },
    },
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Merge defensively with defaults
    const defaults = getInitialState();
    return {
      user: { ...defaults.user, ...(parsed.user || {}) },
      rpg: { ...defaults.rpg, ...(parsed.rpg || {}) },
      semesters: parsed.semesters && parsed.semesters.length > 0 ? parsed.semesters : defaults.semesters,
      activeSemesterId: parsed.activeSemesterId || defaults.activeSemesterId,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : defaults.categories,
      courses: parsed.courses && parsed.courses.length > 0 ? parsed.courses : defaults.courses,
      classSessions: parsed.classSessions && parsed.classSessions.length > 0 ? parsed.classSessions : defaults.classSessions,
      attendance: parsed.attendance || defaults.attendance,
      habits: parsed.habits && parsed.habits.length > 0 ? parsed.habits : defaults.habits,
      habitLogs: parsed.habitLogs || defaults.habitLogs,
      tasks: parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks : defaults.tasks,
      taskCompletionsByDate: parsed.taskCompletionsByDate || defaults.taskCompletionsByDate,
      perfectDays: parsed.perfectDays || defaults.perfectDays,
      journalEntries: parsed.journalEntries || defaults.journalEntries,
    };
  } catch (e) {
    console.error('Failed to load local storage state:', e);
    return getInitialState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function exportStateAsJson(state: AppState): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `the_grand_academic_os_backup_${formatDate(new Date())}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
