import React from 'react';
import {
  Award,
  Sparkles,
  Shield,
  Flame,
  CheckCircle2,
  Key,
  Star,
  Lock,
  DoorOpen,
  Music,
  GraduationCap,
  Footprints,
  CheckCheck,
} from 'lucide-react';
import { AppState, Achievement } from '../types';
import {
  HOTEL_RANKS,
  getRankForLevel,
  getXpForNextLevel,
} from '../utils/streakEngine';
import { INITIAL_ACHIEVEMENTS } from '../utils/storage';

interface ProgressViewProps {
  state: AppState;
  onBuyStreakFreeze: () => void;
}

const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  DoorOpen,
  Flame,
  Award,
  Sparkles,
  Music,
  GraduationCap,
  CheckCheck,
  Footprints,
};

export const ProgressView: React.FC<ProgressViewProps> = ({
  state,
  onBuyStreakFreeze,
}) => {
  const currentRank = getRankForLevel(state.rpg.level);
  const nextLevelXp = getXpForNextLevel(state.rpg.level);
  const xpInCurrentLevel = state.rpg.xp % nextLevelXp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / nextLevelXp) * 100));

  return (
    <div className="space-y-5 pb-16 md:pb-6 animate-in fade-in duration-150">
      
      {/* Symmetrical Grand Society Hall Banner */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F7B5CD] border-2 border-[#2D1A29] flex items-center justify-center shadow-[3px_3px_0px_#2D1A29] shrink-0">
              <Key className="w-8 h-8 text-[#2D1A29]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#6E2D5B] font-bold">
                  Society of Cross Keys
                </span>
                <span className="text-[#6E2D5B]">·</span>
                <span className="text-xs font-mono-numbers text-[#521828]">
                  Tier {state.rpg.level}
                </span>
              </div>
              <h1 className="text-2xl font-serif-display font-extrabold text-[#2D1A29]">
                {currentRank.title}
              </h1>
              <p className="text-xs text-[#521828] italic">
                "{currentRank.perk}"
              </p>
            </div>
          </div>

          {/* Streak Freeze Vault */}
          <div className="bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl p-3 flex items-center justify-between sm:justify-start gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#521828] block">
                Streak Freeze Vault
              </span>
              <span className="text-base font-bold font-mono-numbers text-[#2D1A29] flex items-center gap-1.5 mt-0.5">
                <Shield className="w-4 h-4 text-[#A62B46]" />
                {state.rpg.streakFreezesAvailable} Equipped
              </span>
            </div>
            <button
              onClick={onBuyStreakFreeze}
              disabled={state.rpg.xp < 150}
              className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-all ${
                state.rpg.xp >= 150
                  ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29] hover:bg-[#BFE07D]'
                  : 'bg-white/50 border-[#2D1A29]/30 text-[#2D1A29]/40 cursor-not-allowed'
              }`}
            >
              Acquire (150 XP)
            </button>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-5 pt-4 border-t-2 border-[#2D1A29]/15">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="font-hotel-badge text-[#2D1A29] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#DCA136]" />
              Level {state.rpg.level} Progress
            </span>
            <span className="font-mono-numbers text-[#6E2D5B]">
              {xpInCurrentLevel} / {nextLevelXp} XP ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#F7B5CD] via-[#D2E59E] to-[#F4C462] border-r-2 border-[#2D1A29] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4 Lifetime Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#2D1A29]/25 text-center">
            <span className="text-[10px] uppercase font-bold text-[#521828] block">Total XP Earned</span>
            <span className="text-xl font-bold font-mono-numbers text-[#2D1A29]">{state.rpg.xp}</span>
          </div>
          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#2D1A29]/25 text-center">
            <span className="text-[10px] uppercase font-bold text-[#521828] block">Habits Checked</span>
            <span className="text-xl font-bold font-mono-numbers text-[#2D1A29]">{state.rpg.totalHabitsCompleted}</span>
          </div>
          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#2D1A29]/25 text-center">
            <span className="text-[10px] uppercase font-bold text-[#521828] block">Lectures Attended</span>
            <span className="text-xl font-bold font-mono-numbers text-[#2D1A29]">{state.rpg.totalLecturesAttended}</span>
          </div>
          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#2D1A29]/25 text-center">
            <span className="text-[10px] uppercase font-bold text-[#521828] block">Perfect Days</span>
            <span className="text-xl font-bold font-mono-numbers text-[#A62B46]">{state.rpg.perfectDaysCount}</span>
          </div>
        </div>
      </div>

      {/* Society Medals & Achievements */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif-display font-bold text-[#2D1A29]">
              The Grand Society Medals
            </h2>
            <p className="text-xs text-[#521828]">
              Luggage tags and honorable distinctions awarded for collegiate discipline.
            </p>
          </div>
          <span className="text-xs font-mono-numbers font-bold text-[#6E2D5B] bg-[#F5EBE1] px-2.5 py-1 rounded-lg border border-[#2D1A29]">
            {state.rpg.unlockedAchievementIds.length} / {INITIAL_ACHIEVEMENTS.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {INITIAL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = state.rpg.unlockedAchievementIds.includes(ach.id);
            const Icon = ACHIEVEMENT_ICONS[ach.icon] || Award;

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-[#FDFBF7] border-[#2D1A29] shadow-[3px_3px_0px_#2D1A29]'
                    : 'bg-[#F5EBE1]/40 border-[#2D1A29]/20 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-[#D2E59E] border-[#2D1A29] text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                      : 'bg-white border-[#2D1A29]/30 text-[#2D1A29]/30'
                  }`}
                >
                  {isUnlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[#2D1A29] truncate">
                      {ach.title}
                    </h3>
                    <span className="text-[10px] font-mono-numbers font-bold text-[#6E2D5B]">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-[#521828] mt-0.5 line-clamp-2">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hotel Hierarchy Registry */}
      <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#2D1A29]">
        <h2 className="text-base font-serif-display font-bold text-[#2D1A29] mb-1">
          Concierge Ranks Hierarchy
        </h2>
        <p className="text-xs text-[#521828] mb-4">
          All formal grades recognized by the Hotel Council.
        </p>

        <div className="divide-y divide-[#2D1A29]/15">
          {HOTEL_RANKS.map((rank) => {
            const isPassed = state.rpg.level >= rank.level;
            const isCurrent = currentRank.title === rank.title;

            return (
              <div
                key={rank.level}
                className={`py-2.5 px-3 flex items-center justify-between text-xs transition-colors rounded-lg ${
                  isCurrent
                    ? 'bg-[#F7B5CD]/30 font-bold border border-[#2D1A29]'
                    : isPassed
                    ? 'text-[#2D1A29]'
                    : 'text-[#2D1A29]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 font-mono-numbers font-bold text-[#6E2D5B]">
                    Lvl {rank.level}
                  </span>
                  <div>
                    <span className="font-serif font-bold text-sm text-[#2D1A29] block">
                      {rank.title} {isCurrent && '★ (Current)'}
                    </span>
                    <span className="text-[11px] text-[#521828] italic">
                      {rank.perk}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isPassed ? (
                    <span className="text-[#1F4E4B] font-bold">Attained</span>
                  ) : (
                    <span className="text-[#521828]/50">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
