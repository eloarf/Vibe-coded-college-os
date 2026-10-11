import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, BookOpen, Clock, MapPin, User } from 'lucide-react';
import { Course, ClassSession, Semester } from '../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course, session: ClassSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onDeleteCourse?: (courseId: string) => void;
  initialCourse?: Course | null;
  initialSession?: ClassSession | null;
  semesters: Semester[];
  activeSemesterId: string;
}

const PRESET_COLORS = [
  { label: 'Deep Violet (PSYC)', hex: '#6E2D5B' },
  { label: 'Magenta (ANTH)', hex: '#A62B64' },
  { label: 'Deep Teal (GEES)', hex: '#1F4E4B' },
  { label: 'Imperial Blue (MATH)', hex: '#1B3B8A' },
  { label: 'Warm Bronze (ENTR)', hex: '#D46A1E' },
  { label: 'Forest Green (FLEN)', hex: '#2E7D32' },
  { label: 'Burgundy Red (PHIL)', hex: '#9E2A2B' },
  { label: 'Hotel Brass', hex: '#B57314' },
  { label: 'Bubblegum Pink', hex: '#F7B5CD' },
];

const DAYS_OF_WEEK = [
  { num: 1, name: 'Monday' },
  { num: 2, name: 'Tuesday' },
  { num: 3, name: 'Wednesday' },
  { num: 4, name: 'Thursday' },
  { num: 5, name: 'Friday' },
  { num: 6, name: 'Saturday' },
  { num: 0, name: 'Sunday' },
];

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteSession,
  onDeleteCourse,
  initialCourse,
  initialSession,
  semesters,
  activeSemesterId,
}) => {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [credits, setCredits] = useState(3);
  const [color, setColor] = useState('#6E2D5B');
  const [semesterId, setSemesterId] = useState(activeSemesterId);
  const [notes, setNotes] = useState('');
  const [targetGrade, setTargetGrade] = useState('A');

  // Session details
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('10:20');
  const [sessionType, setSessionType] = useState<'lecture' | 'tutorial' | 'lab' | 'seminar'>('lecture');

  useEffect(() => {
    if (initialCourse) {
      setCourseCode(initialCourse.code);
      setCourseName(initialCourse.name);
      setInstructor(initialCourse.instructor || '');
      setRoom(initialCourse.room || '');
      setCredits(initialCourse.credits || 3);
      setColor(initialCourse.color || '#6E2D5B');
      setSemesterId(initialCourse.semesterId || activeSemesterId);
      setNotes(initialCourse.notes || '');
      setTargetGrade(initialCourse.targetGrade || 'A');
    } else {
      setCourseCode('');
      setCourseName('');
      setInstructor('');
      setRoom('');
      setCredits(3);
      setColor('#6E2D5B');
      setSemesterId(activeSemesterId);
      setNotes('');
      setTargetGrade('A');
    }

    if (initialSession) {
      setDayOfWeek(initialSession.dayOfWeek);
      setStartTime(initialSession.startTime);
      setEndTime(initialSession.endTime);
      setSessionType(initialSession.sessionType);
      if (initialSession.room) setRoom(initialSession.room);
    } else {
      setDayOfWeek(1);
      setStartTime('08:30');
      setEndTime('10:20');
      setSessionType('lecture');
    }
  }, [initialCourse, initialSession, isOpen, activeSemesterId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    const courseId = initialCourse?.id || `c-${courseCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
    const course: Course = {
      id: courseId,
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      instructor: instructor.trim() || undefined,
      room: room.trim() || undefined,
      credits: Number(credits) || 3,
      color,
      semesterId,
      notes: notes.trim() || undefined,
      targetGrade,
    };

    const session: ClassSession = {
      id: initialSession?.id || `s-${courseId}-${Date.now()}`,
      courseId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      sessionType,
      room: room.trim() || undefined,
    };

    onSave(course, session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D1A29]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl shadow-[6px_6px_0px_#2D1A29] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div className="bg-[#D2E59E] border-b-2 border-[#2D1A29] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#2D1A29] font-bold">
              Academy Curriculum
            </span>
            <span className="text-xs text-[#2D1A29]">·</span>
            <span className="text-xs font-serif italic text-[#521828]">
              {initialCourse ? 'Modify Course & Session' : 'Register New Course'}
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
          {/* Semester Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Academic Term / Semester *
            </label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.academicYear} — {s.name} {s.isCurrent ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Course Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. PSYC1011"
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl font-mono-numbers uppercase font-bold text-[#2D1A29]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. General Psychology"
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              />
            </div>
          </div>

          {/* Instructor & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#6E2D5B]" />
                Instructor / Professor
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Dr. Alistair Finch"
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#6E2D5B]" />
                Lecture Hall / Room
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. B59-2-005"
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl font-mono-numbers text-[#2D1A29]"
              />
            </div>
          </div>

          {/* Credits & Target Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#6E2D5B]" />
                Credits Weight
              </label>
              <select
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl font-mono-numbers text-[#2D1A29]"
              >
                <option value={1}>1 Credit</option>
                <option value={2}>2 Credits</option>
                <option value={3}>3 Credits (Standard)</option>
                <option value={4}>4 Credits (Applied Math / Lab)</option>
                <option value={5}>5 Credits</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
                Target Honor Grade
              </label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
              >
                <option value="A+">A+ (4.0 GPA)</option>
                <option value="A">A (4.0 GPA)</option>
                <option value="A-">A- (3.75 GPA)</option>
                <option value="B+">B+ (3.5 GPA)</option>
                <option value="B">B (3.0 GPA)</option>
              </select>
            </div>
          </div>

          {/* Session Timing */}
          <div className="p-3 bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl space-y-3">
            <span className="font-hotel-badge text-[11px] font-bold uppercase tracking-widest text-[#2D1A29] block">
              Meeting Day & Schedule
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#2D1A29] mb-1">
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.num} value={d.num}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#2D1A29] mb-1">
                  Session Type
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-lg text-[#2D1A29]"
                >
                  <option value="lecture">Lecture</option>
                  <option value="tutorial">Tutorial / Recitation</option>
                  <option value="lab">Laboratory</option>
                  <option value="seminar">Seminar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#2D1A29] mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#6E2D5B]" />
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-lg font-mono-numbers text-[#2D1A29]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#2D1A29] mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#6E2D5B]" />
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-lg font-mono-numbers text-[#2D1A29]"
                />
              </div>
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Wes Anderson Ledger Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full border-2 border-[#2D1A29] transition-transform ${
                    color === c.hex ? 'scale-125 ring-2 ring-[#2D1A29]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Syllabus & Course Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Office hours, exam weights, reading syllabus..."
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-[#2D1A29]/20 gap-3">
            {initialSession && onDeleteSession ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this class session from your schedule?')) {
                    onDeleteSession(initialSession.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#9E2A2B] hover:bg-[#FDE8F0] border-2 border-[#9E2A2B] rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Slot</span>
              </button>
            ) : initialCourse && onDeleteCourse ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this entire course and its sessions?')) {
                    onDeleteCourse(initialCourse.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#9E2A2B] hover:bg-[#FDE8F0] border-2 border-[#9E2A2B] rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Course</span>
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
                <span>Save Course</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
