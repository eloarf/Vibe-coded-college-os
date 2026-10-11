import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Github,
  Globe,
  Award,
  Sparkles,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { AppState } from '../types';
import { getRankForLevel } from '../utils/streakEngine';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);

  if (!isOpen) return null;

  // Primary shareable URL: Use Shared App URL or current origin
  const shareUrl =
    'https://ais-pre-jyabavbgjmtm3m4a57qqtu-783315692318.europe-west2.run.app';

  const rank = getRankForLevel(state.rpg.level);

  // Generate shareable Resident Progress Card text
  const shareableCardText = `🏛️ The Grand Academic Hotel & College Life OS
Resident: ${state.user.honorific} ${state.user.name} (${state.user.roomNumber})
Rank: Tier ${state.rpg.level} — ${rank.title}
XP: ${state.rpg.xp} XP | Freezes: ${state.rpg.streakFreezesAvailable} Equipped
Disciplines & Habits Tracked: ${state.habits.length}
Try this Wes Anderson College Life OS: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      alert(`Shareable Link: ${shareUrl}`);
    }
  };

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(shareableCardText);
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    } catch {
      alert(shareableCardText);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Grand Academic Hotel — College Life OS',
          text: `Check out my college operating system! Level ${state.rpg.level} ${rank.title}.`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D1A29]/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border-3 border-[#2D1A29] rounded-2xl shadow-[8px_8px_0px_#2D1A29] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div className="bg-[#D2E59E] border-b-2 border-[#2D1A29] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F7B5CD] border-2 border-[#2D1A29] flex items-center justify-center shadow-[1px_1px_0px_#2D1A29]">
              <Share2 className="w-4 h-4 text-[#2D1A29]" />
            </div>
            <div>
              <span className="font-hotel-badge text-xs uppercase tracking-widest text-[#2D1A29] font-bold block">
                Hotel Dispatch & Sharing
              </span>
              <span className="text-xs font-serif italic text-[#521828]">
                Passports, Links & Deployment Guide
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#2D1A29] hover:bg-black/5 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Section 1: 1-Click Live App Link */}
          <div className="bg-[#FDFBF7] border-2 border-[#2D1A29] rounded-xl p-4 shadow-[2px_2px_0px_#2D1A29]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E2D5B] block mb-1">
              Method 1 · Instant Live App Link
            </span>
            <h3 className="text-sm font-bold text-[#2D1A29] mb-2">
              Share Direct Live Preview Link
            </h3>
            <p className="text-xs text-[#521828] mb-3">
              Anyone with this link can open and use this full web app on desktop or mobile phone immediately.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-lg font-mono-numbers text-[#2D1A29] truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-[#F7B5CD] hover:bg-[#F39CB8] border-2 border-[#2D1A29] rounded-lg text-xs font-bold text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29] active:translate-x-0.5 flex items-center gap-1 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#1F4E4B]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-3 py-2 bg-[#D2E59E] hover:bg-[#BFE07D] border-2 border-[#2D1A29] rounded-lg text-xs font-bold text-[#2D1A29] shadow-[1px_1px_0px_#2D1A29] active:translate-x-0.5 flex items-center gap-1 shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Shareable Resident Passport / Card */}
          <div className="bg-[#F5EBE1] border-2 border-[#2D1A29] rounded-xl p-4 shadow-[2px_2px_0px_#2D1A29]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A62B46] block">
                Method 2 · Resident Progress Passport
              </span>
              <button
                type="button"
                onClick={handleCopyCard}
                className="text-xs font-bold text-[#6E2D5B] hover:underline flex items-center gap-1"
              >
                {copiedCard ? <Check className="w-3 h-3 text-[#1F4E4B]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCard ? 'Copied Passport!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-xl p-3 text-xs space-y-1.5 font-mono-numbers">
              <div className="flex items-center justify-between font-bold text-[#2D1A29] font-hotel-badge text-[11px]">
                <span>THE GRAND ACADEMIC HOTEL</span>
                <span className="text-[#6E2D5B]">{state.user.roomNumber}</span>
              </div>
              <div className="text-[#521828]">
                Resident: <strong>{state.user.honorific} {state.user.name}</strong>
              </div>
              <div className="flex items-center justify-between text-[#1F4E4B]">
                <span>Rank: {rank.title} (Lvl {state.rpg.level})</span>
                <span>{state.rpg.xp} XP</span>
              </div>
              <div className="text-[11px] text-[#521828] pt-1 border-t border-[#2D1A29]/15">
                Active Disciplines: {state.habits.length} · Freezes: {state.rpg.streakFreezesAvailable} Available
              </div>
            </div>
          </div>

          {/* Section 3: Deploying to GitHub Pages (Step by Step for Non-Programmers) */}
          <div className="bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-xl p-4 shadow-[2px_2px_0px_#2D1A29] space-y-2.5">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-[#2D1A29]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D1A29]">
                Method 3 · Deploying through GitHub Pages
              </h3>
            </div>
            <p className="text-xs text-[#521828] leading-relaxed">
              Because this app is built as a 100% client-side Single Page Application (SPA), it requires no external backend server and runs smoothly on free GitHub Pages:
            </p>

            <ol className="text-xs text-[#521828] space-y-1.5 list-decimal list-inside bg-[#FDFBF7] p-3 rounded-lg border border-[#2D1A29]/20 font-sans">
              <li>
                <strong>Build the app bundle:</strong> In terminal, run <code className="bg-white px-1 py-0.5 rounded border border-[#2D1A29] font-mono-numbers">npm run build</code>. This generates a self-contained <code className="bg-white px-1 py-0.5 rounded border border-[#2D1A29] font-mono-numbers">dist/</code> folder.
              </li>
              <li>
                <strong>Push to GitHub:</strong> Commit and push your code to your GitHub repository (e.g. <code className="bg-white px-1 py-0.5 rounded border border-[#2D1A29] font-mono-numbers">username.github.io/college-os</code>).
              </li>
              <li>
                <strong>Enable GitHub Pages:</strong> Go to your repo <strong>Settings → Pages</strong>, set source to <strong>GitHub Actions</strong> or deploy from the <code className="bg-white px-1 py-0.5 rounded border border-[#2D1A29] font-mono-numbers">gh-pages</code> branch.
              </li>
              <li>
                <strong>Share your URL:</strong> Your personal domain <code className="bg-white px-1 py-0.5 rounded border border-[#2D1A29] font-mono-numbers">https://username.github.io/...</code> is ready for your phone and friends!
              </li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#F5EBE1] border-t-2 border-[#2D1A29] p-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#2D1A29] bg-[#FFFFFF] border-2 border-[#2D1A29] rounded-xl hover:bg-[#FDFBF7] shadow-[2px_2px_0px_#2D1A29]"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
