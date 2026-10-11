import React from 'react';
import { Volume2, VolumeX, Shield, Sparkles, Key, Share2 } from 'lucide-react';
import { UserProfile, RPGState } from '../types';
import { getRankForLevel, getXpForNextLevel } from '../utils/streakEngine';

interface HeaderProps {
  user: UserProfile;
  rpg: RPGState;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenProgress: () => void;
  onOpenShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  rpg,
  onToggleSound,
  onOpenSettings,
  onOpenProgress,
  onOpenShare,
}) => {
  const currentRank = getRankForLevel(rpg.level);
  const nextLevelXp = getXpForNextLevel(rpg.level);
  const xpInCurrentLevel = rpg.xp % nextLevelXp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / nextLevelXp) * 100));

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="w-full bg-[#F5EBE1] border-b-2 border-[#2D1A29] px-3 sm:px-6 py-2 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Hotel Concierge Crest & User Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 text-left group hover:opacity-95 transition-opacity"
            title="Inspect Hotel Room & Registry"
          >
            <div className="w-10 h-10 rounded-full bg-[#F7B5CD] border-2 border-[#2D1A29] flex items-center justify-center shadow-[2px_2px_0px_#2D1A29] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[1px_1px_0px_#2D1A29] transition-all">
              <Key className="w-5 h-5 text-[#2D1A29]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-hotel-badge text-[10px] tracking-widest text-[#6E2D5B] font-bold uppercase">
                  {user.roomNumber}
                </span>
                <span className="text-[#6E2D5B] text-xs">·</span>
                <span className="text-xs font-semibold text-[#2D1A29]">
                  {user.honorific} {user.name}
                </span>
              </div>
              <p className="text-xs text-[#521828] font-medium italic">
                {currentRank.title}
              </p>
            </div>
          </button>

          {/* Quick Sound & Share Toggle on Mobile */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenShare}
              className="p-2 rounded-lg bg-[#D2E59E] border-2 border-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 text-[#2D1A29]"
              aria-label="Share App"
              title="Share App"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-[#FFFFFF] border-2 border-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 text-[#2D1A29]"
              aria-label={user.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {user.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#A62B46]" />}
            </button>
          </div>
        </div>

        {/* Center: Wes Anderson Grand Budapest Crest & Date */}
        <div className="text-center hidden sm:block">
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-[#2D1A29]/40" />
            <span className="font-hotel-badge text-xs tracking-[0.2em] font-extrabold uppercase text-[#2D1A29]">
              The Grand Academic Hotel
            </span>
            <div className="h-[1px] w-8 bg-[#2D1A29]/40" />
          </div>
          <p className="text-[11px] font-mono-numbers font-medium text-[#6E2D5B] tracking-wide mt-0.5">
            {dateFormatted}
          </p>
        </div>

        {/* Right: RPG Level Bar, Freezes & Audio Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* Level & XP Widget */}
          <button
            onClick={onOpenProgress}
            className="flex-1 md:flex-initial flex items-center gap-2.5 bg-[#FFFFFF] border-2 border-[#2D1A29] px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#2D1A29] hover:bg-[#FDFBF7] active:translate-x-0.5 active:translate-y-0.5 transition-all text-left"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-[#2D1A29] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#DCA136]" />
                  LVL {rpg.level}
                </span>
                <span className="text-[10px] font-mono-numbers text-[#6E2D5B] font-semibold">
                  {xpInCurrentLevel} / {nextLevelXp} XP
                </span>
              </div>
              <div className="w-28 sm:w-32 h-2 bg-[#F5EBE1] border border-[#2D1A29] rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#D2E59E] border-r border-[#2D1A29] transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Streak Freeze Shields */}
          <div
            className="flex items-center gap-1 bg-[#FDE8F0] border-2 border-[#2D1A29] px-2.5 py-1.5 rounded-xl shadow-[2px_2px_0px_#2D1A29]"
            title={`${rpg.streakFreezesAvailable} Streak Freeze Shields Available`}
          >
            <Shield className="w-4 h-4 text-[#A62B46]" />
            <span className="text-xs font-mono-numbers font-bold text-[#2D1A29]">
              {rpg.streakFreezesAvailable}
            </span>
          </div>

          {/* Desktop Share Button */}
          <button
            onClick={onOpenShare}
            className="hidden md:flex p-2 rounded-xl bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 text-[#2D1A29] items-center gap-1.5 px-3"
            aria-label="Share App"
            title="Share with Others / GitHub Pages Deployment"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-bold font-hotel-badge uppercase tracking-wider">Share</span>
          </button>

          {/* Desktop Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="hidden md:flex p-2 rounded-xl bg-[#FFFFFF] border-2 border-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] hover:bg-[#FDFBF7] active:translate-x-0.5 active:translate-y-0.5 text-[#2D1A29]"
            aria-label={user.soundEnabled ? 'Mute Hotel Bell Sound' : 'Enable Hotel Bell Sound'}
            title={user.soundEnabled ? 'Sound is Enabled (Bell Ding)' : 'Sound Muted'}
          >
            {user.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#A62B46]" />}
          </button>
        </div>

      </div>
    </header>
  );
};
