import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  User,
  Shield,
  HelpCircle,
  Check,
  Key,
} from 'lucide-react';
import { AppState, UserProfile } from '../types';
import { exportStateAsJson, getInitialState } from '../utils/storage';

interface SettingsViewProps {
  state: AppState;
  onUpdateUser: (user: UserProfile) => void;
  onRestoreState: (importedState: AppState) => void;
  onResetDefault: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateUser,
  onRestoreState,
  onResetDefault,
}) => {
  const [name, setName] = useState(state.user.name);
  const [honorific, setHonorific] = useState(state.user.honorific);
  const [roomNumber, setRoomNumber] = useState(state.user.roomNumber);
  const [soundEnabled, setSoundEnabled] = useState(state.user.soundEnabled);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim() || 'Fraole',
      honorific: honorific.trim() || 'Master',
      roomNumber: roomNumber.trim() || 'Suite 101',
      soundEnabled,
      avatarIcon: state.user.avatarIcon,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as AppState;
        if (parsed.user && parsed.courses && parsed.habits) {
          onRestoreState(parsed);
          alert('Grand Academic Hotel ledger successfully restored from backup!');
        } else {
          alert('Invalid backup file format. Expected a valid Grand Academic OS JSON file.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 pb-16 md:pb-6 animate-in fade-in duration-150">
      
      {/* Symmetrical Header */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold">
            Hotel Administration & Archive
          </span>
          <span className="text-[#6E2D5B]">·</span>
          <span className="text-xs font-mono-numbers text-[#521828]">
            Settings & Registry
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-extrabold text-[#2D1A29]">
          Guest Registry & Ledger Archive
        </h1>
        <p className="text-xs sm:text-sm text-[#521828] mt-1 max-w-xl">
          Customize your resident credentials, manage sound feedback, and download full ledger archives for GitHub Pages deployment.
        </p>
      </div>

      {/* Guest Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29] space-y-4"
      >
        <div className="flex items-center justify-between border-b-2 border-[#2D1A29]/15 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#6E2D5B]" />
            <h2 className="text-base font-serif-display font-bold text-[#2D1A29]">
              Resident Credentials & Room Key
            </h2>
          </div>
          {savedNotice && (
            <span className="text-xs font-bold text-[#1F4E4B] flex items-center gap-1 bg-[#D2E59E] px-2.5 py-1 rounded-md border border-[#2D1A29]">
              <Check className="w-3.5 h-3.5" />
              Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Honorific / Title
            </label>
            <input
              type="text"
              value={honorific}
              onChange={(e) => setHonorific(e.target.value)}
              placeholder="e.g. Master, Doctor, Lord"
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl text-[#2D1A29]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fraole"
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl font-bold text-[#2D1A29]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1A29] mb-1">
              Quarters / Room Number
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Suite 101"
              className="w-full px-3 py-2 text-sm bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl font-mono-numbers text-[#2D1A29]"
            />
          </div>
        </div>

        {/* Sound Feedback Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl">
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[#2D1A29]" />
            ) : (
              <VolumeX className="w-5 h-5 text-[#9E2A2B]" />
            )}
            <div>
              <span className="text-xs font-bold text-[#2D1A29] block">
                Hotel Reception Bell & Tactile Sounds
              </span>
              <span className="text-[11px] text-[#521828]">
                Procedural Web Audio API chime on roll call, checkoff, and level up.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${
              soundEnabled
                ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29]'
                : 'bg-white border-[#2D1A29] text-[#521828]'
            }`}
          >
            {soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        <div className="text-right pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl text-xs font-hotel-badge uppercase tracking-wider font-bold text-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5"
          >
            Save Resident Credentials
          </button>
        </div>
      </form>

      {/* Backup, Restore & Reset */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29] space-y-4">
        <div className="border-b-2 border-[#2D1A29]/15 pb-3">
          <h2 className="text-base font-serif-display font-bold text-[#2D1A29]">
            Data Preservation & GitHub Pages Portability
          </h2>
          <p className="text-xs text-[#521828] mt-0.5">
            All records are stored locally in your browser's localStorage. Download a JSON copy for safekeeping across devices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download JSON Backup */}
          <button
            onClick={() => exportStateAsJson(state)}
            className="p-4 rounded-xl border-2 border-[#2D1A29] bg-[#FDFBF7] hover:bg-[#F5EBE1] text-left shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all group"
          >
            <Download className="w-5 h-5 text-[#1F4E4B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-[#2D1A29] uppercase font-hotel-badge">
              Export Archive JSON
            </h3>
            <p className="text-[11px] text-[#521828] mt-1">
              Download complete backup containing all courses, habits, streaks, and attendance logs.
            </p>
          </button>

          {/* Restore JSON Backup */}
          <label className="p-4 rounded-xl border-2 border-[#2D1A29] bg-[#FDFBF7] hover:bg-[#F5EBE1] text-left shadow-[2px_2px_0px_#2D1A29] cursor-pointer group">
            <Upload className="w-5 h-5 text-[#6E2D5B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-[#2D1A29] uppercase font-hotel-badge">
              Restore from JSON
            </h3>
            <p className="text-[11px] text-[#521828] mt-1">
              Upload a previously exported backup file to restore all ledger records.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Reset Factory Defaults */}
          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to reset to initial default schedule? This will re-seed your original timetable and habits.'
                )
              ) {
                onResetDefault();
              }
            }}
            className="p-4 rounded-xl border-2 border-[#9E2A2B] bg-[#FDE8F0] hover:bg-[#FCD8E3] text-left shadow-[2px_2px_0px_#9E2A2B] active:translate-x-0.5 active:translate-y-0.5 transition-all group"
          >
            <RotateCcw className="w-5 h-5 text-[#9E2A2B] mb-2 group-hover:rotate-[-45deg] transition-transform" />
            <h3 className="text-xs font-bold text-[#9E2A2B] uppercase font-hotel-badge">
              Reset to Defaults
            </h3>
            <p className="text-[11px] text-[#521828] mt-1">
              Restores Fraole's complete prototype courses, timetable, and habit routines.
            </p>
          </button>
        </div>
      </div>

      {/* GitHub Pages Deployment Note */}
      <div className="bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-2xl p-4 text-xs text-[#521828] space-y-1">
        <span className="font-bold font-hotel-badge uppercase tracking-wider text-[#2D1A29] block">
          Deploying to GitHub Pages
        </span>
        <p>
          This application is 100% client-side compatible: zero backend server requirements, zero external database locks, zero API keys required for core operations. To deploy on GitHub Pages, run <code className="bg-white px-1.5 py-0.5 rounded border border-[#2D1A29] font-mono-numbers">npm run build</code> and publish the <code className="bg-white px-1.5 py-0.5 rounded border border-[#2D1A29] font-mono-numbers">dist</code> directory.
        </p>
      </div>

    </div>
  );
};
