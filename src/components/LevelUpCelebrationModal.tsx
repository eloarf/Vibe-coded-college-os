import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, Check, Key } from 'lucide-react';
import { HOTEL_RANKS, getRankForLevel } from '../utils/streakEngine';

interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  isOpen,
  onClose,
  newLevel,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Launch Wes Anderson pastel fireworks
      const colors = ['#F7B5CD', '#D2E59E', '#F4C462', '#6E2D5B', '#FFD4BA'];
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors,
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
          });
        }, 250);
      } catch (err) {
        console.error('Confetti error:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rank = getRankForLevel(newLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1A29]/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border-3 border-[#2D1A29] rounded-3xl shadow-[8px_8px_0px_#2D1A29] text-center p-6 overflow-hidden">
        
        {/* Decorative Top Cartouche */}
        <div className="w-16 h-16 mx-auto rounded-full bg-[#F7B5CD] border-2 border-[#2D1A29] flex items-center justify-center shadow-[3px_3px_0px_#2D1A29] mb-4">
          <Key className="w-8 h-8 text-[#2D1A29]" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-[1px] w-6 bg-[#2D1A29]/40" />
          <span className="font-hotel-badge text-[10px] uppercase tracking-[0.25em] text-[#6E2D5B] font-bold">
            The Grand Society Honors
          </span>
          <div className="h-[1px] w-6 bg-[#2D1A29]/40" />
        </div>

        <h2 className="text-2xl font-serif-display font-extrabold text-[#2D1A29] mb-1">
          Rank Promoted!
        </h2>
        <p className="text-xs font-mono-numbers text-[#6E2D5B] font-semibold mb-4">
          ACADEMIC TIER LEVEL {newLevel} REACHED
        </p>

        {/* Theatrical Card */}
        <div className="bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-2xl p-4 mb-5 text-center shadow-[2px_2px_0px_#2D1A29]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A62B46] block mb-1">
            New Title Bestowed
          </span>
          <h3 className="text-base font-serif font-bold text-[#2D1A29] mb-1">
            {rank.title}
          </h3>
          <p className="text-xs text-[#521828] italic">
            "{rank.perk}"
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#1F4E4B] mb-5">
          <Sparkles className="w-4 h-4 text-[#DCA136]" />
          <span>+1 Streak Freeze Shield Awarded!</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-xl font-hotel-badge text-xs uppercase tracking-wider font-bold text-[#2D1A29] shadow-[3px_3px_0px_#2D1A29] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Acknowledge Promotion</span>
        </button>

      </div>
    </div>
  );
};
