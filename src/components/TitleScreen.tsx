import React, { useState } from 'react';
import { TitleDefs, TitleFrame, TitleHero, TitleFireflies, TitleSlomatt } from './TitleScene.tsx';
import { VistaCanvas } from './VistaCanvas.tsx';
import { SaveLoadDialog } from './SaveLoadDialog.tsx';
import { NewGameDialog } from './NewGameDialog.tsx';

/** every biome takes a turn behind the logo */
const SHOWCASE = [1, 2, 4, 6, 3, 8, 5, 7, 9, 10];

export interface ResumeInfo {
  /** "World 2 · Sunlit Riverbank" */
  where: string;
  /** "Stage 2-4 · Mossy Crossing" */
  stage: string;
  stars: number;
  cleared: number;
}

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenMap: () => void;
  onViewStory: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onInstallDesktop?: () => void;
  isInstalled?: boolean;
  /** null on a fresh game */
  resume: ResumeInfo | null;
  onSaveLoaded: () => void;
  /** progress has just been cleared; begin again (skipStory: go straight to play) */
  onNewGame: (skipStory: boolean) => void;
  onOpenTrophies: () => void;
  /** badges earned, shown on the Trophies button */
  badgeCount?: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenMap,
  onViewStory,
  isMuted,
  onToggleMute,
  onInstallDesktop,
  isInstalled,
  resume,
  onSaveLoaded,
  onNewGame,
  onOpenTrophies,
  badgeCount,
}) => {
  const [saveOpen, setSaveOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  return (
    <div className="fixed inset-0 z-40 bg-[#1a2a1c] select-none font-game text-white overflow-hidden">
      <VistaCanvas worlds={SHOWCASE} hold={14} pan={14} />
      <TitleDefs />
      <TitleFrame />
      <TitleFireflies />
      {/* warm light from above, deep edges, and a floor so the buttons always read */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 18%, rgba(255,226,150,.28), transparent 55%), radial-gradient(ellipse at center, transparent 55%, rgba(14,8,4,.55) 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 h-[42%] pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(10,22,14,.72), rgba(10,22,14,0))' }} />

      <div className="relative z-10 flex h-full flex-col items-center px-4 py-3 sm:px-8 sm:py-5">
        <div className="w-full max-w-5xl flex items-center justify-between gap-2">
          <div className="ui-chip">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <span>10 Worlds · 100 Stages</span>
          </div>
          <div className="flex items-center gap-2">
            {!isInstalled && onInstallDesktop && (
              <button type="button" onClick={onInstallDesktop} className="ui-chip ui-chip-btn" title="Install the game as an app">
                Install app
              </button>
            )}
            <button type="button" onClick={onToggleMute} className="ui-chip ui-chip-btn">
              {isMuted ? 'Sound off' : 'Sound on'}
            </button>
          </div>
        </div>

        <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center text-center">
          <TitleHero className="w-full max-w-[1280px] shrink-0 h-[clamp(100px,min(32vh,58.3vw),400px)]" />

          <div className="title-logo-wrap">
            <TitleSlomatt />
            <h1 className="title-logo mt-0">SLOTHS</h1>
          </div>
          <div className="title-ribbon">RAINFOREST ADVENTURES</div>

          <div className="mt-2 sm:mt-4 flex flex-col items-center gap-2 w-full">
            <button type="button" data-start="true" onClick={onStartGame} className="title-btn title-btn-start ui-main">
              <span className="ui-main-t">{resume ? 'CONTINUE' : 'START ADVENTURE'}</span>
              {resume && (
                <span className="ui-main-s">
                  {resume.stage} <i>·</i> {resume.stars}★ earned
                </span>
              )}
            </button>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[340px] sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
              <button type="button" onClick={onViewStory} className="ui-pill ui-pill-rose justify-center">
                Story
              </button>
              <button type="button" onClick={onOpenMap} className="ui-pill ui-pill-green justify-center">
                World Map
              </button>
              <button type="button" onClick={onOpenTrophies} className="ui-pill ui-pill-gold justify-center col-span-2 sm:col-span-1">
                🏆 Trophies{badgeCount ? ` · ${badgeCount}` : ''}
              </button>
              <button type="button" onClick={() => setNewOpen(true)} className="ui-pill ui-pill-wood justify-center">
                New Game
              </button>
              <button type="button" onClick={() => setSaveOpen(true)} className="ui-pill ui-pill-wood justify-center">
                Save / Load
              </button>
            </div>
          </div>
        </div>

        <p className="title-hint w-full text-center font-sans text-[11px] sm:text-xs tracking-wide text-amber-50/80 [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">
          Slide to run · flick up to jump · flick across to kick · tap to punch · hold for a mega · keys: WASD, Space, J K L
        </p>
      </div>

      {saveOpen && <SaveLoadDialog onClose={() => setSaveOpen(false)} onLoaded={onSaveLoaded} />}
      {newOpen && (
        <NewGameDialog
          onClose={() => setNewOpen(false)}
          onBackup={() => {
            setNewOpen(false);
            setSaveOpen(true);
          }}
          onStarted={(skip) => {
            setNewOpen(false);
            onNewGame(skip);
          }}
        />
      )}
    </div>
  );
};
