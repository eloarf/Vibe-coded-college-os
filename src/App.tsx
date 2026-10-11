import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { HomeView } from './views/HomeView';
import { CalendarView } from './views/CalendarView';
import { UniversityView } from './views/UniversityView';
import { TasksView } from './views/TasksView';
import { HabitsView } from './views/HabitsView';
import { ProgressView } from './views/ProgressView';
import { SettingsView } from './views/SettingsView';

import { TaskModal } from './components/TaskModal';
import { ClassModal } from './components/ClassModal';
import { AttendanceModal } from './components/AttendanceModal';
import { HabitModal } from './components/HabitModal';
import { LevelUpCelebrationModal } from './components/LevelUpCelebrationModal';
import { JournalModal } from './components/JournalModal';
import { ShareModal } from './components/ShareModal';

import {
  AppState,
  Task,
  Course,
  ClassSession,
  Habit,
  AttendanceRecord,
  UserProfile,
  Semester,
  JournalEntry,
} from './types';
import {
  loadState,
  saveState,
  getInitialState,
  INITIAL_ACHIEVEMENTS,
} from './utils/storage';
import {
  formatDate,
  getXpForNextLevel,
  calculateDailyCompletion,
  calculateHabitStreak,
} from './utils/streakEngine';
import {
  playBellDing,
  playLevelUpFanfare,
  playClickSound,
  playFreezeSound,
} from './utils/audio';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDefaultDate, setTaskDefaultDate] = useState<string | undefined>();

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceCourse, setAttendanceCourse] = useState<Course | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>('');
  const [existingAttendanceRecord, setExistingAttendanceRecord] = useState<AttendanceRecord | null>(null);

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalModalDate, setJournalModalDate] = useState<string>(formatDate(new Date()));

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [celebrationLevel, setCelebrationLevel] = useState<number | null>(null);

  // Sync state to local storage on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Audio helper
  const playSound = useCallback(
    (type: 'bell' | 'click' | 'level' | 'freeze') => {
      if (!state.user.soundEnabled) return;
      if (type === 'bell') playBellDing();
      else if (type === 'click') playClickSound();
      else if (type === 'level') playLevelUpFanfare();
      else if (type === 'freeze') playFreezeSound();
    },
    [state.user.soundEnabled]
  );

  // Check achievements & level-up progression
  const awardXP = useCallback(
    (
      amount: number,
      meta?: {
        taskCompleted?: boolean;
        habitCompleted?: boolean;
        habitId?: string;
        lectureAttended?: boolean;
      }
    ) => {
      setState((prev) => {
        const newXp = prev.rpg.xp + amount;
        let currentLevel = prev.rpg.level;
        let nextLevelRequirement = getXpForNextLevel(currentLevel);
        let leveledUp = false;

        // Check if level advanced
        while (newXp >= nextLevelRequirement * currentLevel) {
          currentLevel += 1;
          leveledUp = true;
          nextLevelRequirement = getXpForNextLevel(currentLevel);
        }

        const newFreezes = leveledUp
          ? prev.rpg.streakFreezesAvailable + 1
          : prev.rpg.streakFreezesAvailable;

        const newTotalTasks = meta?.taskCompleted
          ? prev.rpg.totalTasksCompleted + 1
          : prev.rpg.totalTasksCompleted;

        const newTotalHabits = meta?.habitCompleted
          ? prev.rpg.totalHabitsCompleted + 1
          : prev.rpg.totalHabitsCompleted;

        const newTotalLectures = meta?.lectureAttended
          ? prev.rpg.totalLecturesAttended + 1
          : prev.rpg.totalLecturesAttended;

        // Check unlockable achievements
        const unlocked = [...prev.rpg.unlockedAchievementIds];
        INITIAL_ACHIEVEMENTS.forEach((ach) => {
          if (!unlocked.includes(ach.id)) {
            if (ach.id === 'ach-first-step') unlocked.push(ach.id);
            if (ach.id === 'ach-maestro' && meta?.habitId === 'h-music' && newTotalHabits >= 8) {
              unlocked.push(ach.id);
            }
            if (ach.id === 'ach-punctual' && newTotalLectures >= 10) {
              unlocked.push(ach.id);
            }
            if (ach.id === 'ach-task-slayer' && newTotalTasks >= 25) {
              unlocked.push(ach.id);
            }
          }
        });

        if (leveledUp) {
          setTimeout(() => {
            setCelebrationLevel(currentLevel);
            playSound('level');
          }, 200);
        }

        return {
          ...prev,
          rpg: {
            ...prev.rpg,
            xp: newXp,
            level: currentLevel,
            streakFreezesAvailable: newFreezes,
            unlockedAchievementIds: unlocked,
            totalTasksCompleted: newTotalTasks,
            totalHabitsCompleted: newTotalHabits,
            totalLecturesAttended: newTotalLectures,
          },
        };
      });
    },
    [playSound]
  );

  // Toggle habit check-in for a given date
  const handleToggleHabit = useCallback(
    (habitId: string, dateStr: string) => {
      const key = `${dateStr}_${habitId}`;
      const isCurrentlyDone = !!state.habitLogs[key]?.completed;

      setState((prev) => {
        const nextLogs = { ...prev.habitLogs };
        if (isCurrentlyDone) {
          delete nextLogs[key];
        } else {
          nextLogs[key] = {
            date: dateStr,
            habitId,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }

        return {
          ...prev,
          habitLogs: nextLogs,
        };
      });

      if (!isCurrentlyDone) {
        playSound('bell');
        awardXP(20, { habitCompleted: true, habitId });

        // Check if day became a Perfect Day
        setTimeout(() => {
          setState((latest) => {
            const comp = calculateDailyCompletion(
              dateStr,
              latest.habits,
              latest.tasks,
              latest.habitLogs
            );
            if (comp.isPerfect && !latest.perfectDays[dateStr]) {
              awardXP(75);
              return {
                ...latest,
                perfectDays: { ...latest.perfectDays, [dateStr]: true },
                rpg: {
                  ...latest.rpg,
                  perfectDaysCount: latest.rpg.perfectDaysCount + 1,
                },
              };
            }
            return latest;
          });
        }, 100);
      } else {
        playSound('click');
      }
    },
    [state.habitLogs, playSound, awardXP]
  );

  // Toggle task complete
  const handleToggleTask = useCallback(
    (taskId: string) => {
      const target = state.tasks.find((t) => t.id === taskId);
      if (!target) return;

      const willBeCompleted = !target.completed;
      const todayStr = formatDate(new Date());

      setState((prev) => {
        const nextTasks = prev.tasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? new Date().toISOString() : undefined,
            };
          }
          return t;
        });

        return {
          ...prev,
          tasks: nextTasks,
        };
      });

      if (willBeCompleted) {
        playSound('bell');
        const xpBonus = target.priority === 'urgent' ? 30 : target.priority === 'high' ? 25 : 20;
        awardXP(xpBonus, { taskCompleted: true });

        // Check perfect day
        setTimeout(() => {
          setState((latest) => {
            const comp = calculateDailyCompletion(
              todayStr,
              latest.habits,
              latest.tasks,
              latest.habitLogs
            );
            if (comp.isPerfect && !latest.perfectDays[todayStr]) {
              awardXP(75);
              return {
                ...latest,
                perfectDays: { ...latest.perfectDays, [todayStr]: true },
                rpg: {
                  ...latest.rpg,
                  perfectDaysCount: latest.rpg.perfectDaysCount + 1,
                },
              };
            }
            return latest;
          });
        }, 100);
      } else {
        playSound('click');
      }
    },
    [state.tasks, playSound, awardXP]
  );

  // Save Task
  const handleSaveTask = useCallback(
    (task: Task) => {
      setState((prev) => {
        const exists = prev.tasks.some((t) => t.id === task.id);
        const nextTasks = exists
          ? prev.tasks.map((t) => (t.id === task.id ? task : t))
          : [task, ...prev.tasks];
        return { ...prev, tasks: nextTasks };
      });
      playSound('click');
    },
    [playSound]
  );

  // Delete Task
  const handleDeleteTask = useCallback(
    (taskId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      }));
      playSound('click');
    },
    [playSound]
  );

  // Save Course & Session
  const handleSaveCourseAndSession = useCallback(
    (course: Course, session: ClassSession) => {
      setState((prev) => {
        const courseExists = prev.courses.some((c) => c.id === course.id);
        const nextCourses = courseExists
          ? prev.courses.map((c) => (c.id === course.id ? course : c))
          : [...prev.courses, course];

        const sessionExists = prev.classSessions.some((s) => s.id === session.id);
        const nextSessions = sessionExists
          ? prev.classSessions.map((s) => (s.id === session.id ? session : s))
          : [...prev.classSessions, session];

        return {
          ...prev,
          courses: nextCourses,
          classSessions: nextSessions,
        };
      });
      playSound('click');
    },
    [playSound]
  );

  // Delete Course Session
  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      setState((prev) => ({
        ...prev,
        classSessions: prev.classSessions.filter((s) => s.id !== sessionId),
      }));
      playSound('click');
    },
    [playSound]
  );

  // Delete entire Course
  const handleDeleteCourse = useCallback(
    (courseId: string) => {
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
        classSessions: prev.classSessions.filter((s) => s.courseId !== courseId),
        attendance: prev.attendance.filter((a) => a.courseId !== courseId),
      }));
      playSound('click');
    },
    [playSound]
  );

  // Save Attendance
  const handleSaveAttendance = useCallback(
    (record: AttendanceRecord) => {
      setState((prev) => {
        const existingIdx = prev.attendance.findIndex(
          (a) => a.courseId === record.courseId && a.date === record.date
        );
        let nextAttendance = [...prev.attendance];
        if (existingIdx >= 0) {
          nextAttendance[existingIdx] = record;
        } else {
          nextAttendance.push(record);
        }
        return { ...prev, attendance: nextAttendance };
      });

      if (record.status === 'present') {
        playSound('bell');
        awardXP(25, { lectureAttended: true });
      } else if (record.status === 'late') {
        playSound('bell');
        awardXP(15, { lectureAttended: true });
      } else {
        playSound('click');
      }
    },
    [playSound, awardXP]
  );

  // Save Habit
  const handleSaveHabit = useCallback(
    (habit: Habit) => {
      setState((prev) => {
        const exists = prev.habits.some((h) => h.id === habit.id);
        const nextHabits = exists
          ? prev.habits.map((h) => (h.id === habit.id ? habit : h))
          : [...prev.habits, habit];
        return { ...prev, habits: nextHabits };
      });
      playSound('click');
    },
    [playSound]
  );

  // Delete Habit
  const handleDeleteHabit = useCallback(
    (habitId: string) => {
      setState((prev) => ({
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
      }));
      playSound('click');
    },
    [playSound]
  );

  // Save Journal Entry & Automatically Complete Journaling Habit
  const handleSaveJournal = useCallback(
    (entry: JournalEntry) => {
      setState((prev) => {
        const nextEntries = { ...prev.journalEntries, [entry.date]: entry };
        const habitKey = `${entry.date}_h-journ`;
        const habitAlreadyDone = !!prev.habitLogs[habitKey]?.completed;

        const nextLogs = { ...prev.habitLogs };
        if (!habitAlreadyDone) {
          nextLogs[habitKey] = {
            date: entry.date,
            habitId: 'h-journ',
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }

        return {
          ...prev,
          journalEntries: nextEntries,
          habitLogs: nextLogs,
        };
      });

      playSound('bell');
      awardXP(25, { habitCompleted: true, habitId: 'h-journ' });

      // Check if day became a Perfect Day
      setTimeout(() => {
        setState((latest) => {
          const comp = calculateDailyCompletion(
            entry.date,
            latest.habits,
            latest.tasks,
            latest.habitLogs
          );
          if (comp.isPerfect && !latest.perfectDays[entry.date]) {
            awardXP(75);
            return {
              ...latest,
              perfectDays: { ...latest.perfectDays, [entry.date]: true },
              rpg: {
                ...latest.rpg,
                perfectDaysCount: latest.rpg.perfectDaysCount + 1,
              },
            };
          }
          return latest;
        });
      }, 100);
    },
    [playSound, awardXP]
  );

  // Delete Journal Entry
  const handleDeleteJournal = useCallback(
    (entryDate: string) => {
      setState((prev) => {
        const nextEntries = { ...prev.journalEntries };
        delete nextEntries[entryDate];
        return {
          ...prev,
          journalEntries: nextEntries,
        };
      });
      playSound('click');
    },
    [playSound]
  );

  // Use Streak Freeze on a missed day
  const handleUseStreakFreeze = useCallback(
    (habitId: string, dateStr: string) => {
      if (state.rpg.streakFreezesAvailable <= 0) {
        alert('No streak freeze shields remaining in your vault! Earn more with a 7-day streak or buy one for 150 XP.');
        return;
      }

      setState((prev) => ({
        ...prev,
        rpg: {
          ...prev.rpg,
          streakFreezesAvailable: prev.rpg.streakFreezesAvailable - 1,
          freezesUsed: [...prev.rpg.freezesUsed, { habitId, date: dateStr }],
        },
      }));
      playSound('freeze');
      alert(`Streak freeze shield successfully deployed for ${dateStr}! Your consecutive streak is preserved.`);
    },
    [state.rpg.streakFreezesAvailable, playSound]
  );

  // Buy Streak Freeze with XP
  const handleBuyStreakFreeze = useCallback(() => {
    if (state.rpg.xp < 150) {
      alert('You need at least 150 XP to acquire a Streak Freeze shield.');
      return;
    }
    setState((prev) => ({
      ...prev,
      rpg: {
        ...prev.rpg,
        xp: prev.rpg.xp - 150,
        streakFreezesAvailable: prev.rpg.streakFreezesAvailable + 1,
      },
    }));
    playSound('freeze');
  }, [state.rpg.xp, playSound]);

  // Update User Profile
  const handleUpdateUser = useCallback(
    (user: UserProfile) => {
      setState((prev) => ({ ...prev, user }));
      playSound('click');
    },
    [playSound]
  );

  // Toggle Sound
  const handleToggleSound = useCallback(() => {
    setState((prev) => {
      const nextSound = !prev.user.soundEnabled;
      return {
        ...prev,
        user: { ...prev.user, soundEnabled: nextSound },
      };
    });
  }, []);

  // Modal Open Handlers
  const handleOpenTaskModal = (task?: Task | null, defaultDate?: string) => {
    setEditingTask(task || null);
    setTaskDefaultDate(defaultDate);
    setIsTaskModalOpen(true);
  };

  const handleOpenClassModal = (course?: Course | null, session?: ClassSession | null) => {
    setEditingCourse(course || null);
    setEditingSession(session || null);
    setIsClassModalOpen(true);
  };

  const handleOpenAttendanceModal = (
    course: Course,
    date: string,
    existing?: AttendanceRecord | null
  ) => {
    setAttendanceCourse(course);
    setAttendanceDate(date);
    setExistingAttendanceRecord(existing || null);
    setIsAttendanceModalOpen(true);
  };

  const handleOpenHabitModal = (habit?: Habit | null) => {
    setEditingHabit(habit || null);
    setIsHabitModalOpen(true);
  };

  const handleSwitchSemester = (semesterId: string) => {
    setState((prev) => ({ ...prev, activeSemesterId: semesterId }));
    playSound('click');
  };

  const handleAddSemester = (semester: Semester) => {
    setState((prev) => ({
      ...prev,
      semesters: [...prev.semesters, semester],
      activeSemesterId: semester.id,
    }));
    playSound('click');
  };

  const handleRestoreState = (importedState: AppState) => {
    setState(importedState);
    playSound('bell');
  };

  const handleResetDefault = () => {
    const fresh = getInitialState();
    setState(fresh);
    saveState(fresh);
    playSound('bell');
  };

  const pendingTasksCount = state.tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D1A29] flex flex-col font-sans selection:bg-[#F7B5CD]">
      
      {/* Symmetrical Wes Anderson Grand Hotel Header */}
      <Header
        user={state.user}
        rpg={state.rpg}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setCurrentTab('settings')}
        onOpenProgress={() => setCurrentTab('progress')}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* Main View Area with Container Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {currentTab === 'home' && (
          <HomeView
            state={state}
            onToggleHabit={handleToggleHabit}
            onToggleTask={handleToggleTask}
            onOpenTaskModal={handleOpenTaskModal}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onNavigateTab={setCurrentTab}
            onOpenShare={() => setIsShareModalOpen(true)}
            onOpenJournalModal={(d) => {
              setJournalModalDate(d || formatDate(new Date()));
              setIsJournalModalOpen(true);
            }}
            onSaveJournal={handleSaveJournal}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            state={state}
            onOpenTaskModal={handleOpenTaskModal}
            onOpenClassModal={() => handleOpenClassModal(null, null)}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onToggleHabit={handleToggleHabit}
          />
        )}

        {currentTab === 'university' && (
          <UniversityView
            state={state}
            onOpenClassModal={handleOpenClassModal}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onSwitchSemester={handleSwitchSemester}
            onAddSemester={handleAddSemester}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            state={state}
            onToggleTask={handleToggleTask}
            onOpenTaskModal={handleOpenTaskModal}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentTab === 'habits' && (
          <HabitsView
            state={state}
            onToggleHabit={handleToggleHabit}
            onOpenHabitModal={handleOpenHabitModal}
            onUseStreakFreeze={handleUseStreakFreeze}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            state={state}
            onBuyStreakFreeze={handleBuyStreakFreeze}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            state={state}
            onUpdateUser={handleUpdateUser}
            onRestoreState={handleRestoreState}
            onResetDefault={handleResetDefault}
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile & Sub-bar for Desktop */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          playSound('click');
        }}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Interactive Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={editingTask}
        categories={state.categories}
        courses={state.courses.filter((c) => c.semesterId === state.activeSemesterId)}
        defaultDate={taskDefaultDate}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveCourseAndSession}
        onDeleteSession={handleDeleteSession}
        onDeleteCourse={handleDeleteCourse}
        initialCourse={editingCourse}
        initialSession={editingSession}
        semesters={state.semesters}
        activeSemesterId={state.activeSemesterId}
      />

      {attendanceCourse && (
        <AttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          onSave={handleSaveAttendance}
          course={attendanceCourse}
          date={attendanceDate}
          existingRecord={existingAttendanceRecord}
          attendanceHistory={state.attendance}
        />
      )}

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        initialHabit={editingHabit}
        categories={state.categories}
      />

      <LevelUpCelebrationModal
        isOpen={celebrationLevel !== null}
        onClose={() => setCelebrationLevel(null)}
        newLevel={celebrationLevel || 1}
      />

      <JournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onSave={handleSaveJournal}
        onDelete={handleDeleteJournal}
        initialDate={journalModalDate}
        existingEntry={state.journalEntries[journalModalDate] || null}
        allEntries={state.journalEntries}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        state={state}
      />

    </div>
  );
}
