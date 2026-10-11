import React, { useState } from 'react';
import { X, Check, CheckCircle2, Clock, ShieldCheck, XCircle, Award } from 'lucide-react';
import { Course, AttendanceRecord, AttendanceStatus } from '../types';
import { calculateCourseAttendance } from '../utils/streakEngine';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => void;
  course: Course;
  date: string;
  existingRecord?: AttendanceRecord | null;
  attendanceHistory: AttendanceRecord[];
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  course,
  date,
  existingRecord,
  attendanceHistory,
}) => {
  const [status, setStatus] = useState<AttendanceStatus>(existingRecord?.status || 'present');
  const [note, setNote] = useState(existingRecord?.note || '');

  if (!isOpen) return null;

  const stats = calculateCourseAttendance(course.id, attendanceHistory);

  const STATUS_OPTIONS: {
    status: AttendanceStatus;
    label: string;
    description: string;
    icon: React.ElementType;
    bgActive: string;
    textActive: string;
    borderActive: string;
  }[] = [
    {
      status: 'present',
      label: 'Present',
      description: 'Attended full lecture on time (+25 XP)',
      icon: CheckCircle2,
      bgActive: 'bg-[#D2E59E]',
      textActive: 'text-[#2D1A29]',
      borderActive: 'border-[#2D1A29]',
    },
    {
      status: 'late',
      label: 'Late',
      description: 'Arrived after bell (+15 XP)',
      icon: Clock,
      bgActive: 'bg-[#F4C462]',
      textActive: 'text-[#2D1A29]',
      borderActive: 'border-[#2D1A29]',
    },
    {
      status: 'excused',
      label: 'Excused',
      description: 'Sanctioned absence / verified leave',
      icon: ShieldCheck,
      bgActive: 'bg-[#FFD4BA]',
      textActive: 'text-[#2D1A29]',
      borderActive: 'border-[#2D1A29]',
    },
    {
      status: 'absent',
      label: 'Absent',
      description: 'Unexcused missed session',
      icon: XCircle,
      bgActive: 'bg-[#9E2A2B]',
      textActive: 'text-[#FFFFFF]',
      borderActive: 'border-[#2D1A29]',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: AttendanceRecord = {
      id: existingRecord?.id || `att-${course.id}-${date}-${Date.now()}`,
      courseId: course.id,
      date,
      status,
      note: note.trim() || undefined,
      timestamp: new Date().toISOString(),
    };
    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D1A29]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl shadow-[6px_6px_0px_#2D1A29] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div
          className="px-5 py-3.5 border-b-2 border-[#2D1A29] flex items-center justify-between"
          style={{ backgroundColor: course.color ? `${course.color}25` : '#F7B5CD' }}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#2D1A29] font-bold">
                Roll Call Registry
              </span>
              <span className="text-xs">·</span>
              <span className="text-xs font-mono-numbers font-bold text-[#6E2D5B]">
                {date}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#2D1A29] mt-0.5">
              {course.code} — {course.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#2D1A29] hover:bg-[#FFFFFF]/40 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Attendance Metrics Bar */}
        <div className="grid grid-cols-3 border-b-2 border-[#2D1A29] bg-[#FDFBF7] text-center py-2.5 px-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#521828] block">Attendance Rate</span>
            <span className="text-base font-bold font-mono-numbers text-[#2D1A29]">
              {stats.attendancePercentage}%
            </span>
          </div>
          <div className="border-x border-[#2D1A29]/20">
            <span className="text-[10px] uppercase font-bold text-[#521828] block">Current Streak</span>
            <span className="text-base font-bold font-mono-numbers text-[#1B4947] flex items-center justify-center gap-1">
              <Award className="w-4 h-4 text-[#DCA136]" />
              {stats.currentStreak} Classes
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#521828] block">Attended / Total</span>
            <span className="text-base font-bold font-mono-numbers text-[#2D1A29]">
              {stats.totalPresent + stats.totalLate}/{stats.totalSessions}
            </span>
          </div>
        </div>

        {/* Selection Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29]">
              Select Attendance Status
            </label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.status;
                const Icon = opt.icon;
                return (
                  <button
                    type="button"
                    key={opt.status}
                    onClick={() => setStatus(opt.status)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `${opt.bgActive} ${opt.borderActive} ${opt.textActive} shadow-[2px_2px_0px_#2D1A29]`
                        : 'bg-[#FDFBF7] border-[#2D1A29]/30 text-[#2D1A29] hover:bg-[#F5EBE1]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isSelected ? opt.textActive : 'text-[#521828]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{opt.label}</span>
                        {isSelected && <span className="text-[10px] font-bold uppercase">Active</span>}
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'opacity-90' : 'text-[#521828]'}`}>
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Roll Call Note / Justification (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Arrived 4 mins late after library consultation"
              className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2D1A29]/20">
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
              <span>Record Roll Call</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
