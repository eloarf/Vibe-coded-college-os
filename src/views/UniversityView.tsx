import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Sparkles,
} from 'lucide-react';
import { AppState, Course, ClassSession, AttendanceRecord, Semester } from '../types';
import { calculateCourseAttendance, formatDate } from '../utils/streakEngine';

interface UniversityViewProps {
  state: AppState;
  onOpenClassModal: (course?: Course | null, session?: ClassSession | null) => void;
  onOpenAttendanceModal: (course: Course, date: string, existing?: AttendanceRecord | null) => void;
  onSwitchSemester: (semesterId: string) => void;
  onAddSemester: (semester: Semester) => void;
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.75,
  'B+': 3.5,
  'B': 3.0,
  'B-': 2.75,
  'C+': 2.5,
  'C': 2.0,
};

export const UniversityView: React.FC<UniversityViewProps> = ({
  state,
  onOpenClassModal,
  onOpenAttendanceModal,
  onSwitchSemester,
  onAddSemester,
}) => {
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [newSemName, setNewSemName] = useState('Semester 2');
  const [newSemYear, setNewSemYear] = useState('2026/27');
  const [newSemTargetGpa, setNewSemTargetGpa] = useState(3.9);

  const activeSemester = state.semesters.find((s) => s.id === state.activeSemesterId) || state.semesters[0];
  const coursesInSemester = state.courses.filter((c) => c.semesterId === activeSemester.id);
  const todayStr = formatDate(new Date());

  // Calculate Term GPA based on target/current grades
  let totalCredits = 0;
  let totalGradePoints = 0;
  coursesInSemester.forEach((c) => {
    const grade = c.currentGrade || c.targetGrade || 'A';
    const points = GRADE_POINTS[grade] ?? 4.0;
    totalCredits += c.credits;
    totalGradePoints += points * c.credits;
  });
  const calculatedGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '4.00';

  // Overall attendance across all active courses
  let allPresent = 0;
  let allTotal = 0;
  coursesInSemester.forEach((c) => {
    const stats = calculateCourseAttendance(c.id, state.attendance);
    allPresent += stats.totalPresent + stats.totalLate * 0.7 + stats.totalExcused;
    allTotal += stats.totalSessions;
  });
  const overallAttendanceRate = allTotal > 0 ? Math.round((allPresent / allTotal) * 100) : 100;

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      name: newSemName,
      academicYear: newSemYear,
      startDate: `${formatDate(new Date())}`,
      endDate: `${new Date().getFullYear() + 1}-06-30`,
      isCurrent: true,
      targetGPA: Number(newSemTargetGpa),
    };
    onAddSemester(newSem);
    setShowAddSemester(false);
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-5 pb-16 md:pb-6 animate-in fade-in duration-150">
      
      {/* Symmetrical Academy Header */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold">
                The Grand Hotel Academy
              </span>
              <span className="text-[#6E2D5B]">·</span>
              <span className="text-xs font-mono-numbers text-[#521828]">
                {activeSemester?.academicYear}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-extrabold text-[#2D1A29]">
              Curriculum & Academic Registry
            </h1>
            <p className="text-xs sm:text-sm text-[#521828] mt-1">
              Comprehensive course syllabus, roll call attendance streaks, credit weighting, and GPA targets.
            </p>
          </div>

          {/* Semester Selector & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl p-1">
              {state.semesters.map((sem) => (
                <button
                  key={sem.id}
                  onClick={() => onSwitchSemester(sem.id)}
                  className={`px-3 py-1.5 text-xs font-bold font-hotel-badge uppercase rounded-lg transition-all ${
                    sem.id === activeSemester.id
                      ? 'bg-[#F7B5CD] text-[#2D1A29] border border-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                      : 'text-[#521828] hover:bg-[#FFFFFF]'
                  }`}
                >
                  {sem.name}
                </button>
              ))}
              <button
                onClick={() => setShowAddSemester(true)}
                className="px-2 py-1 text-xs font-bold text-[#6E2D5B] hover:bg-[#FFFFFF] rounded-lg"
                title="Create New Semester"
              >
                + Term
              </button>
            </div>

            <button
              onClick={() => onOpenClassModal(null, null)}
              className="px-4 py-2 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl text-xs font-hotel-badge uppercase tracking-wider font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Course</span>
            </button>
          </div>
        </div>

        {/* 3-Card Academic Key Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t-2 border-[#2D1A29]/15">
          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] p-3 rounded-xl shadow-[2px_2px_0px_#2D1A29]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#521828] block">
              Estimated Semester GPA
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono-numbers text-[#2D1A29]">
                {calculatedGPA}
              </span>
              <span className="text-[10px] font-mono-numbers text-[#6E2D5B] font-semibold">
                Target: {activeSemester?.targetGPA || 3.85}
              </span>
            </div>
            <p className="text-[11px] text-[#521828] mt-1">
              Weighted across {totalCredits} academic credits
            </p>
          </div>

          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] p-3 rounded-xl shadow-[2px_2px_0px_#2D1A29]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#521828] block">
              Term Attendance Rate
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono-numbers text-[#1F4E4B]">
                {overallAttendanceRate}%
              </span>
              <span className="text-[10px] text-[#6E2D5B] font-semibold">
                {allTotal} Lectures Recorded
              </span>
            </div>
            <p className="text-[11px] text-[#521828] mt-1">
              Flawless lecture attendance grants +25 XP
            </p>
          </div>

          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] p-3 rounded-xl shadow-[2px_2px_0px_#2D1A29]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#521828] block">
              Registered Courses
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono-numbers text-[#2D1A29]">
                {coursesInSemester.length}
              </span>
              <span className="text-[10px] text-[#6E2D5B] font-semibold">
                Active Modules
              </span>
            </div>
            <p className="text-[11px] text-[#521828] mt-1">
              {state.classSessions.filter((s) => coursesInSemester.some((c) => c.id === s.courseId)).length} meeting slots / week
            </p>
          </div>
        </div>
      </div>

      {/* New Semester Creation Card (Collapsible) */}
      {showAddSemester && (
        <form
          onSubmit={handleCreateSemester}
          className="bg-[#FDE8F0] border-2 border-[#2D1A29] rounded-2xl p-4 shadow-[4px_4px_0px_#2D1A29] space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[#2D1A29]">
              Configure New Academic Term
            </h3>
            <button
              type="button"
              onClick={() => setShowAddSemester(false)}
              className="text-xs font-bold text-[#9E2A2B]"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#2D1A29] mb-1">
                Term Name
              </label>
              <input
                type="text"
                required
                value={newSemName}
                onChange={(e) => setNewSemName(e.target.value)}
                placeholder="e.g. Semester 2"
                className="w-full px-3 py-1.5 text-xs bg-white border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#2D1A29] mb-1">
                Academic Year
              </label>
              <input
                type="text"
                required
                value={newSemYear}
                onChange={(e) => setNewSemYear(e.target.value)}
                placeholder="e.g. 2026/27"
                className="w-full px-3 py-1.5 text-xs bg-white border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#2D1A29] mb-1">
                Target GPA Goal
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="4.0"
                value={newSemTargetGpa}
                onChange={(e) => setNewSemTargetGpa(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
              />
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-[#D2E59E] border-2 border-[#2D1A29] rounded-xl text-xs font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29]"
            >
              Create Term Registry
            </button>
          </div>
        </form>
      )}

      {/* Courses Catalog & Attendance Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-serif-display font-bold text-[#2D1A29]">
          Enrolled Course Catalog ({coursesInSemester.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coursesInSemester.map((course) => {
            const sessions = state.classSessions.filter((s) => s.courseId === course.id);
            const attStats = calculateCourseAttendance(course.id, state.attendance);

            return (
              <div
                key={course.id}
                className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#2D1A29] flex flex-col justify-between"
              >
                <div>
                  {/* Course Header */}
                  <div className="flex items-start justify-between gap-2 border-b-2 border-[#2D1A29]/15 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono-numbers font-bold text-xs px-2 py-0.5 rounded border border-[#2D1A29]"
                          style={{
                            backgroundColor: `${course.color}20`,
                            color: course.color,
                          }}
                        >
                          {course.code}
                        </span>
                        <span className="text-xs font-bold text-[#6E2D5B]">
                          {course.credits} Credits
                        </span>
                        <span className="text-xs font-mono-numbers text-[#521828]">
                          Target: {course.targetGrade || 'A'}
                        </span>
                      </div>
                      <h3 className="text-base font-serif font-bold text-[#2D1A29] mt-1">
                        {course.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => onOpenClassModal(course, sessions[0] || null)}
                      className="px-2.5 py-1 text-xs font-bold bg-[#F5EBE1] hover:bg-[#EADBC8] border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Instructor & Room Info */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-[#521828]">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-[#6E2D5B] shrink-0" />
                      <span className="truncate">{course.instructor || 'Instructor Assigned'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono-numbers truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#6E2D5B] shrink-0" />
                      <span className="truncate">{course.room || 'Campus Hall'}</span>
                    </div>
                  </div>

                  {/* Scheduled Slots */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E2D5B] block">
                      Weekly Sessions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sessions.map((sess) => (
                        <span
                          key={sess.id}
                          className="text-[11px] font-mono-numbers px-2 py-0.5 bg-[#FDFBF7] border border-[#2D1A29] rounded-md text-[#2D1A29]"
                        >
                          {DAYS[sess.dayOfWeek]} {sess.startTime}–{sess.endTime} ({sess.sessionType})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes snippet */}
                  {course.notes && (
                    <p className="text-xs text-[#521828] mt-2.5 italic bg-[#FDFBF7] p-2 rounded-lg border border-[#2D1A29]/15">
                      "{course.notes}"
                    </p>
                  )}
                </div>

                {/* Course Attendance Strip */}
                <div className="mt-4 pt-3 border-t-2 border-[#2D1A29]/15 flex items-center justify-between bg-[#F5EBE1] -mx-4 -mb-4 p-3 rounded-b-xl border-t">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#521828] block">Attendance</span>
                      <span className="text-sm font-bold font-mono-numbers text-[#2D1A29]">
                        {attStats.attendancePercentage}%
                      </span>
                    </div>
                    <div className="border-l border-[#2D1A29]/20 pl-3">
                      <span className="text-[10px] font-bold uppercase text-[#521828] block">Streak</span>
                      <span className="text-sm font-bold font-mono-numbers text-[#1F4E4B] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#DCA136]" />
                        {attStats.currentStreak}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAttendanceModal(course, todayStr)}
                    className="px-3 py-1.5 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-lg text-xs font-bold text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29] active:translate-x-0.5"
                  >
                    Roll Call
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
