import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { TitleDefs, TitleFrame, TitleHero, TitleFireflies, TitleSlomatt } from './TitleScene.tsx';
import { VistaCanvas } from './VistaCanvas.tsx';
import { SaveLoadDialog } from './SaveLoadDialog.tsx';
import { NewGameDialog } from './NewGameDialog.tsx';
import { StartMenu } from './StartMenu.tsx';
import { HowToPlay, howToSeen, markHowToSeen } from './HowToPlay.tsx';
import { BUILD_TIME, formatBuildTime } from '../game/version.ts';
import { sound } from '../game/audio.ts';
import { UpdateLink } from './UpdateControls.tsx';
import { Icon } from './icons/index.tsx';
import type { SkillId } from '../game/skills.ts';
import { testUnlockOn, setTestUnlock, nextTapRun, UNLOCK_TAPS } from '../game/testUnlock.ts';

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
  onOpenCards: () => void;
  /** how many trophies there are in all, and the skills learned (the menu shows both) */
  trophyTotal: number;
  skills: Set<SkillId>;
  /** the tester's switch was flipped (stages and worlds open or close): rebuild the stage list */
  onUnlockToggled?: () => void;
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
  onOpenCards,
  trophyTotal,
  skills,
  onUnlockToggled,
  badgeCount,
}) => {
  const [saveOpen, setSaveOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  /** a brand-new player gets the short how-to once, right before the first stage */
  const [intro, setIntro] = useState(false);
  const updated = formatBuildTime(BUILD_TIME);

  // the credit's secret: ten taps in a row on "Shaffer" open (or close again) every stage and world, for testing
  const tapRun = useRef({ n: 0, at: 0 });
  const [creditMsg, setCreditMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!creditMsg) return;
    const t = window.setTimeout(() => setCreditMsg(null), 2200);
    return () => window.clearTimeout(t);
  }, [creditMsg]);
  const tapShaffer = () => {
    const now = Date.now();
    const n = nextTapRun(tapRun.current.n, now - tapRun.current.at);
    tapRun.current = { n: n >= UNLOCK_TAPS ? 0 : n, at: now };
    if (n >= UNLOCK_TAPS) {
      const on = !testUnlockOn();
      setTestUnlock(on);
      onUnlockToggled?.();
      setCreditMsg(on ? 'All stages and worlds unlocked' : 'Stage unlock off');
    } else if (n >= 5) {
      setCreditMsg(`${UNLOCK_TAPS - n} more…`);
    }
  };
  // the browser keeps the game silent until the first touch: say so, instead of claiming "Sound on" over silence
  const waiting = useSyncExternalStore(
    (cb) => {
      window.addEventListener('sloth-audio-state', cb);
      return () => window.removeEventListener('sloth-audio-state', cb);
    },
    () => sound.locked,
    () => false,
  );

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
            <button type="button" onClick={onToggleMute} className={`ui-chip ui-chip-btn${waiting ? ' ui-chip-wait' : ''}`}>
              {isMuted ? 'Sound off' : waiting ? 'Tap for sound' : 'Sound on'}
            </button>
          </div>
        </div>

        <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center text-center">
          <TitleHero className="title-hero w-full max-w-[1280px] shrink-0 h-[clamp(100px,min(28.5vh,58.3vw),400px)]" />

          <div className="title-logo-wrap">
            <TitleSlomatt />
            <h1 className="title-logo mt-0">SLOTHS</h1>
          </div>
          <div className="title-ribbon">RAINFOREST ADVENTURES</div>

          <div className="mt-2 sm:mt-4 flex flex-col items-center gap-2 w-full">
            <button type="button" data-start="true" onClick={() => {
                if (!resume && !howToSeen()) {
                  markHowToSeen();
                  setIntro(true);
                } else onStartGame();
              }}
              className="title-btn title-btn-start ui-main">
              <span className="ui-main-t">{resume ? 'CONTINUE' : 'START ADVENTURE'}</span>
              {resume && (
                <span className="ui-main-s">
                  {resume.stage} <i>·</i> {resume.stars} <Icon name="star" size={13} style={{ verticalAlign: '-2px' }} /> earned
                </span>
              )}
            </button>
            {/* the way into everything else: the Menu (settings, trophies, cards, skills) first, then the three places to go */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-[340px] sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
              <button type="button" onClick={() => setMenuOpen(true)} className="ui-pill ui-pill-cream justify-center inline-flex items-center gap-2" aria-label="Menu" data-menu="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
                Menu
              </button>
              <button type="button" onClick={onOpenMap} className="ui-pill ui-pill-sky justify-center">
                World Map
              </button>
              <button type="button" onClick={() => setHowOpen(true)} className="ui-pill ui-pill-green justify-center">
                How to Play
              </button>
              <button type="button" onClick={onViewStory} className="ui-pill ui-pill-rose justify-center">
                Story
              </button>
            </div>
            {/* your game: smaller, because they are used less often */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={onOpenTrophies} className="ui-chip ui-chip-btn ui-chip-lg">
                <Icon name="trophy" size={16} />
                Trophies{badgeCount ? ` · ${badgeCount}` : ''}
              </button>
              <button type="button" onClick={() => setSaveOpen(true)} className="ui-chip ui-chip-btn ui-chip-lg">
                Save / Load
              </button>
              <button type="button" onClick={() => setNewOpen(true)} className="ui-chip ui-chip-btn ui-chip-lg">
                New Game
              </button>
            </div>
          </div>
        </div>

        <p className="title-credit relative w-full text-center font-sans text-[11px] sm:text-xs tracking-wide text-amber-50/70 [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">
          Created and made by Matt{' '}
          <button type="button" onClick={tapShaffer} className="title-credit-btn" aria-label="Shaffer">
            Shaffer
          </button>
          {updated && (
            <>
              {' '}
              <i>·</i> <span className="whitespace-nowrap">Updated {updated}</span>
            </>
          )}
          {updated && (
            <>
              {' '}
              <i>·</i> <UpdateLink />
            </>
          )}
          {creditMsg && (
            <span className="fixed left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-4 py-1.5 text-sm text-amber-200" role="status">
              {creditMsg}
            </span>
          )}
        </p>
      </div>

      {menuOpen && (
        <StartMenu
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onClose={() => setMenuOpen(false)}
          onOpenTrophies={onOpenTrophies}
          onOpenCards={onOpenCards}
          onOpenMap={onOpenMap}
          onViewStory={onViewStory}
          trophyCount={badgeCount ?? 0}
          trophyTotal={trophyTotal}
          skills={skills}
        />
      )}
      {howOpen && <HowToPlay onClose={() => setHowOpen(false)} />}
      {intro && (
        <HowToPlay
          intro
          onClose={() => {
            setIntro(false);
            onStartGame();
          }}
        />
      )}
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
