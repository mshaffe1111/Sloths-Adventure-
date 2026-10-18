import React from 'react';
import { sound } from '../game/audio.ts';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenMap: () => void;
  onViewStory: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onInstallDesktop?: () => void;
  isInstalled?: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenMap,
  onViewStory,
  isMuted,
  onToggleMute,
  onInstallDesktop,
  isInstalled,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-[#0a2318] via-[#0e3b28] to-[#04170e] flex flex-col justify-between items-center p-6 sm:p-10 select-none font-game text-white overflow-hidden">
      {/* Background ambient decorative botanical elements */}
      <div className="absolute inset-0 pointer-none opacity-25">
        {/* Soft sunbeam rays */}
        <div className="absolute top-0 left-1/4 w-48 h-full bg-gradient-to-b from-amber-200/20 to-transparent transform -rotate-12 blur-xl" />
        <div className="absolute top-0 right-1/3 w-64 h-full bg-gradient-to-b from-amber-300/15 to-transparent transform rotate-12 blur-2xl" />
      </div>

      {/* Top Bar: Worlds indicator, Desktop Save button, Mute toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
            10 Worlds · 100 Missions
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isInstalled && onInstallDesktop && (
            <button
              type="button"
              onClick={onInstallDesktop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-xs font-black text-amber-300 active:scale-95 transition-transform"
              title="Install app shortcut directly to your desktop"
            >
              <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <polyline points="9 8 12 11 15 8" />
              </svg>
              <span>Save to Desktop</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-emerald-500/30 text-xs font-bold text-emerald-200 active:scale-95 transition-transform"
          >
            {isMuted ? 'Audio: Muted' : 'Audio: On'}
          </button>
        </div>
      </div>

      {/* Center: Hero Emblem, Logo & Start CTA */}
      <div className="flex flex-col items-center text-center max-w-xl z-10 my-auto">
        {/* Adorable Sloth Centerpiece Illustration */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            {/* Hanging branch */}
            <path d="M 0 32 Q 50 42 100 30" stroke="#78350f" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M 0 30 Q 50 40 100 28" stroke="#16a34a" strokeWidth="3" fill="none" />
            {/* Hanging leaves */}
            <ellipse cx="25" cy="38" rx="8" ry="4" transform="rotate(25 25 38)" fill="#22c55e" />
            <ellipse cx="78" cy="34" rx="7" ry="4" transform="rotate(-30 78 34)" fill="#4ade80" />
            <circle cx="28" cy="42" r="3" fill="#f43f5e" />

            {/* Sloth hanging by paws */}
            {/* Body */}
            <ellipse cx="50" cy="62" rx="22" ry="24" fill="#a57342" />
            <ellipse cx="50" cy="64" rx="14" ry="16" fill="#fed7aa" />

            {/* Arms holding branch */}
            <path d="M 36 60 Q 30 38 40 33" stroke="#8c5a32" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M 64 60 Q 70 38 60 33" stroke="#8c5a32" strokeWidth="9" strokeLinecap="round" fill="none" />
            {/* Claws gripping */}
            <circle cx="39" cy="32" r="2.5" fill="#fef3c7" />
            <circle cx="42" cy="32" r="2.5" fill="#fef3c7" />
            <circle cx="58" cy="32" r="2.5" fill="#fef3c7" />
            <circle cx="61" cy="32" r="2.5" fill="#fef3c7" />

            {/* Head */}
            <circle cx="50" cy="52" r="16" fill="#a57342" />
            {/* Eye mask */}
            <ellipse cx="44" cy="52" rx="5" ry="4" transform="rotate(-10 44 52)" fill="#3c2010" />
            <ellipse cx="56" cy="52" rx="5" ry="4" transform="rotate(10 56 52)" fill="#3c2010" />
            {/* Muzzle */}
            <ellipse cx="50" cy="56" rx="9" ry="6" fill="#ffeedb" />
            <ellipse cx="50" cy="54" rx="3.5" ry="2.5" fill="#1c1917" />
            {/* Smile */}
            <path d="M 47 58 Q 50 61 53 58" stroke="#3c2010" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Eyes */}
            <circle cx="44" cy="51" r="3.2" fill="#ffffff" />
            <circle cx="44" cy="51" r="2.4" fill="#1f130b" />
            <circle cx="43" cy="50" r="1" fill="#ffffff" />
            <circle cx="56" cy="51" r="3.2" fill="#ffffff" />
            <circle cx="56" cy="51" r="2.4" fill="#1f130b" />
            <circle cx="55" cy="50" r="1" fill="#ffffff" />
          </svg>
        </div>

        {/* Bespoke Title Lockup */}
        <h1 className="text-4xl sm:text-6xl font-black text-amber-300 tracking-wider text-stroke-thick mb-1 uppercase">
          SLOTHS
        </h1>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 text-stroke mb-4 tracking-widest">
          RAINFOREST ADVENTURES
        </div>

        <p className="text-xs sm:text-sm text-emerald-100/80 font-sans max-w-md mx-auto mb-6">
          Daisy has been kidnapped deep into the forbidden canopy fortress! Swing, climb, dodge predators, and unleash your ferocious Claw Punch!
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <button
            type="button"
            data-start="true"
            onClick={onStartGame}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-base shadow-xl shadow-amber-600/40 active:scale-95 transition-transform"
          >
            START GAME [Space]
          </button>

          <button
            type="button"
            onClick={onViewStory}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-pink-400/50 text-white font-extrabold text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <span>📖</span> STORY INTRO
          </button>

          <button
            type="button"
            onClick={onOpenMap}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 border-2 border-emerald-400/50 text-white font-extrabold text-sm shadow-lg active:scale-95 transition-transform"
          >
            WORLD MAP
          </button>
        </div>
      </div>

      {/* Flat Control Hints in Bottom Safe Margin */}
      <div className="w-full text-center z-10 pt-4">
        <p className="text-[11px] sm:text-xs text-emerald-300/60 font-sans tracking-wide">
          WASD / Arrows Move · Space Jump · J / Z Punch (Double-Tap Mega) · W Climb · S Duck · Esc Pause
        </p>
      </div>
    </div>
  );
};
