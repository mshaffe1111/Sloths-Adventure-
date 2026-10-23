import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { PaintedVista } from './PaintedVista.tsx';
import { FullscreenButton, LogoWord, Ribbon, TitlePair } from './gameUi.tsx';
import { homeScreenTipDue, markHomeScreenTip } from '../game/fullscreen.ts';
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

  // on an iPhone in the browser there is no full screen: say once how to get it (add the game to the Home Screen)
  const [fsTip, setFsTip] = useState(() => homeScreenTipDue());
  const start = () => {
    if (!resume && !howToSeen()) {
      markHowToSeen();
      setIntro(true);
    } else onStartGame();
  };

  return (
    <div className="gx2 select-none">
      <PaintedVista worlds={SHOWCASE} hold={14} pan={9} />
      <div className="gx2-shade" />
      <TitlePair stageSelector=".gx2-stage" />

      <div className="gx2-ui">
        <div className="gx2-top">
          <span className="gx-leaf-tag">10 Worlds · 100 Stages</span>
          <div className="gx2-top-r">
            {!isInstalled && onInstallDesktop && (
              <button type="button" onClick={onInstallDesktop} className="gx-leaf-tag" title="Install the game as an app">
                Install app
              </button>
            )}
            <button
              type="button"
              onClick={onToggleMute}
              className={`gx-token gx-mute${waiting ? ' wait' : ''}`}
              aria-pressed={isMuted}
              aria-label={isMuted ? 'Sound off' : waiting ? 'Tap for sound' : 'Sound on'}
              title={isMuted ? 'Sound off' : waiting ? 'Tap for sound' : 'Sound on'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9z" />
                {isMuted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
              </svg>
            </button>
            <FullscreenButton />
          </div>
        </div>

        <div className="gx2-logo">
          <LogoWord />
          <Ribbon text="RAINFOREST ADVENTURES" />
        </div>
        <div className="gx2-stage" aria-hidden="true" />

        <div className="gx2-post">
          <button type="button" data-start="true" onClick={start} className="gx-sign gx2-sign">
            <span className="gx-sign-t">{resume ? 'CONTINUE' : 'START ADVENTURE'}</span>
            {resume && (
              <span className="gx-sign-s">
                {resume.stage} <i>·</i> {resume.stars} <Icon name="star" size={12} />
              </span>
            )}
          </button>
          <div className="gx2-planks">
            <button type="button" onClick={onOpenMap} className="gx-plank">
              <Icon name="map" size={18} />
              World Map
            </button>
            <button type="button" onClick={onViewStory} className="gx-plank">
              <Icon name="scroll" size={18} />
              Story
            </button>
            <button type="button" onClick={() => setHowOpen(true)} className="gx-plank">
              <Icon name="bulb" size={18} />
              How to Play
            </button>
            <button type="button" onClick={() => setMenuOpen(true)} className="gx-plank" aria-label="Menu" data-menu="true">
              <Icon name="leaf" size={18} />
              Menu
            </button>
          </div>
          <div className="gx-tags">
            <button type="button" onClick={onOpenTrophies} className="gx-leaf-tag">
              <Icon name="trophy" size={14} />
              Trophies{badgeCount ? ` · ${badgeCount}` : ''}
            </button>
            <button type="button" onClick={() => setSaveOpen(true)} className="gx-leaf-tag">
              Save / Load
            </button>
            <button type="button" onClick={() => setNewOpen(true)} className="gx-leaf-tag">
              New Game
            </button>
          </div>
        </div>

        <p className="gx2-credit">
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

      {fsTip && (
        <div className="gx2-tip" role="note">
          <span>
            <b>Full screen on iPhone:</b> tap Share, then <b>Add to Home Screen</b>, and open the game from there.
          </span>
          <button
            type="button"
            className="gx-leaf-tag"
            onClick={() => {
              markHomeScreenTip();
              setFsTip(false);
            }}
          >
            Got it
          </button>
        </div>
      )}

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
