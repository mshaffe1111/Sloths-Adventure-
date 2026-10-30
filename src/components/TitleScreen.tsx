import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { TitleScene, type TitleSceneHandle } from './title/TitleScene.tsx';
import { FullscreenButton } from './gameUi.tsx';
import { CarvedLogo, carvedLogoReady } from './title/CarvedLogo.tsx';
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
import { bootDone, bootProgress, bootShowing, fontsReady, waitForAll } from '../game/boot.ts';

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

/**
 * How the title comes on (2026-10-28). The first time, the splash (index.html) stays up until the fonts, the first painting and both
 * sloths are all here, then fades as the whole title arrives together: the painting settles in, the letters of the logo drop one by
 * one, the ribbon unfurls, the two of them hop onto their log and the buttons come up in turn. Coming back to it later, the same
 * entrance plays, quicker. Leaving it, the buttons and the logo step away before the next screen comes on.
 */
type Phase = 'wait' | 'arrive' | 'leave';

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

  // ---- the entrance ----
  const scene = useRef<TitleSceneHandle>(null);
  const [phase, setPhase] = useState<Phase>('wait');
  /** the name has been carved: the buttons come up */
  const [named, setNamed] = useState(false);
  const [cold] = useState(() => bootShowing());
  useEffect(() => {
    let live = true;
    const go = () => {
      if (!live) return;
      bootDone();
      scene.current?.arrive();
      setPhase('arrive');
    };
    void waitForAll({
      checks: [() => !!scene.current?.ready(), carvedLogoReady],
      promises: [fontsReady()],
      // the first time, as long as the splash may wait; coming back, everything is already here
      ms: cold ? 15000 : 1500,
      onProgress: (p) => bootProgress(0.3 + 0.7 * p),
    }).then(go);
    return () => {
      live = false;
    };
  }, [cold]);
  const leaving = useRef(false);
  /** step away (the logo and the buttons go), then go on to the next screen */
  const leave = (then: () => void) => {
    if (leaving.current) return;
    leaving.current = true;
    const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setPhase('leave');
    window.setTimeout(then, reduced ? 60 : 240);
  };

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
    } else leave(onStartGame);
  };
  const covered = saveOpen || newOpen || menuOpen || howOpen || intro;

  return (
    <div className={`gx2 select-none gx2-${phase}${cold ? '' : ' gx2-back'}${named ? ' gx2-named' : ''}${covered ? ' gx2-covered' : ''}`}>
      <TitleScene ref={scene} worlds={SHOWCASE} hold={13} stageSelector=".gx2-stage" dim={covered} />

      <div className="gx2-ui">
        <div className="gx2-top">
          <span className="gx2-tag">10 Worlds · 100 Stages</span>
          <div className="gx2-top-r">
            {!isInstalled && onInstallDesktop && (
              <button type="button" onClick={onInstallDesktop} className="gx-plank gx-plank-sm" title="Install the game as an app">
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
              <Icon name={isMuted ? 'mute' : 'speaker'} size={22} />
            </button>
            <FullscreenButton />
          </div>
        </div>

        <div className="gx2-logo">
          <CarvedLogo go={phase === 'arrive'} onName={() => setNamed(true)} />
          <span className="gx2-glint g1" aria-hidden="true" />
          <span className="gx2-glint g2" aria-hidden="true" />
          <span className="gx2-glint g3" aria-hidden="true" />
        </div>
        <div className="gx2-stage" aria-hidden="true" />

        <div className="gx2-post">
          <button type="button" data-start="true" onClick={start} className="gx-sign gx2-sign" style={{ ['--i' as string]: 0 }}>
            <span className="gx-shine" aria-hidden="true" />
            <span className="gx-sign-t">{resume ? 'CONTINUE' : 'START ADVENTURE'}</span>
            {resume && (
              <span className="gx-sign-s">
                {resume.stage} <i>·</i> {resume.stars} <Icon name="star" size={12} />
              </span>
            )}
          </button>
          <div className="gx2-planks">
            <button type="button" onClick={() => leave(onOpenMap)} className="gx-plank" style={{ ['--i' as string]: 1 }}>
              <Icon name="map" size={20} />
              World Map
            </button>
            <button type="button" onClick={() => leave(onViewStory)} className="gx-plank" style={{ ['--i' as string]: 2 }}>
              <Icon name="scroll" size={20} />
              Story
            </button>
            <button type="button" onClick={() => setHowOpen(true)} className="gx-plank" style={{ ['--i' as string]: 3 }}>
              <Icon name="bulb" size={20} />
              How to Play
            </button>
            <button type="button" onClick={() => setMenuOpen(true)} className="gx-plank" aria-label="Settings" data-menu="true" style={{ ['--i' as string]: 4 }}>
              <Icon name="gear" size={20} />
              Settings
            </button>
          </div>
          <div className="gx-tags">
            <button type="button" onClick={() => leave(onOpenTrophies)} className="gx-plank gx-plank-sm" style={{ ['--i' as string]: 5 }}>
              <Icon name="trophy" size={16} />
              Trophies{badgeCount ? ` · ${badgeCount}` : ''}
            </button>
            <button type="button" onClick={() => setSaveOpen(true)} className="gx-plank gx-plank-sm" style={{ ['--i' as string]: 6 }}>
              <Icon name="save" size={16} />
              Save / Load
            </button>
            <button type="button" onClick={() => setNewOpen(true)} className="gx-plank gx-plank-sm" style={{ ['--i' as string]: 7 }}>
              <Icon name="leaf" size={16} />
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
            className="gx-plank gx-plank-sm"
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
            leave(onStartGame);
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
