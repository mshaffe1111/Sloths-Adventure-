import React from 'react';
import {
  TitleDefs,
  TitleBackdrop,
  TitleFrame,
  TitleHero,
  TitleFireflies,
} from './TitleScene.tsx';

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
    <div className="fixed inset-0 z-40 bg-[#ffcb73] select-none font-game text-white overflow-hidden">
      {/* Painted scenery layers */}
      <TitleDefs />
      <TitleBackdrop />
      <TitleFrame />
      <TitleFireflies />
      {/* Soft edge vignette to pull the eye to the centre */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(26,10,5,.5) 100%)' }}
      />

      {/* Content column */}
      <div className="relative z-10 flex h-full flex-col items-center px-4 py-4 sm:px-8 sm:py-6">
        {/* Top Bar: Worlds indicator, Desktop Save button, Mute toggle */}
        <div className="w-full max-w-5xl flex items-center justify-between">
          <div className="title-pill flex items-center gap-2 px-3.5 py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              10 Worlds · 100 Missions
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isInstalled && onInstallDesktop && (
              <button
                type="button"
                onClick={onInstallDesktop}
                className="title-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-black active:scale-95 transition-transform"
                title="Install app shortcut directly to your desktop"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              className="title-pill px-3 py-1.5 text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform"
            >
              {isMuted ? 'Audio: Muted' : 'Audio: On'}
            </button>
          </div>
        </div>

        {/* Hero, logo and actions */}
        <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center text-center">
          {/* Sloth hanging from the branch */}
          <TitleHero className="w-full max-w-[1280px] shrink-0 h-[clamp(160px,min(44vh,58.3vw),440px)]" />

          <h1 className="title-logo mt-1 sm:mt-2">SLOTHS</h1>
          <div className="title-ribbon">RAINFOREST ADVENTURES</div>

          <div className="mt-5 sm:mt-6 flex w-full max-w-xl flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <button
              type="button"
              data-start="true"
              onClick={onStartGame}
              className="title-btn title-btn-start"
            >
              START GAME <span className="hidden sm:inline text-[0.7em] opacity-70">[Space]</span>
            </button>

            <button type="button" onClick={onViewStory} className="title-btn title-btn-story">
              <span aria-hidden="true">📖</span> STORY INTRO
            </button>

            <button type="button" onClick={onOpenMap} className="title-btn title-btn-map">
              WORLD MAP
            </button>
          </div>
        </div>

        {/* Control hints */}
        <p className="title-hint w-full text-center font-sans text-[11px] sm:text-xs tracking-wide text-amber-50/80 [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">
          WASD / Arrows Move · Space Jump · J / Z Punch (Double-Tap Mega) · W Climb · S Duck · Esc Pause
        </p>
      </div>
    </div>
  );
};
