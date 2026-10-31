import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { TitleScene, type TitleSceneHandle } from './title/TitleScene.tsx';
import { CarvedLogo, carvedLogoReady } from './title/CarvedLogo.tsx';
import { homeScreenTipDue, markHomeScreenTip } from '../game/fullscreen.ts';
import { SaveLoadDialog } from './SaveLoadDialog.tsx';
import { NewGameDialog } from './NewGameDialog.tsx';
import { TitleSettings } from './TitleSettings.tsx';
import { HowToPlay, howToSeen, markHowToSeen } from './HowToPlay.tsx';
import { ModePick } from './ModePick.tsx';
import { nextStartStep } from './startFlow.ts';
import { modeChosen } from '../game/difficulty.ts';
import { BUILD_TIME, formatBuildTime } from '../game/version.ts';
import { sound } from '../game/audio.ts';
import { Icon, UI_KIT_URL } from './icons/index.tsx';
import type { SkillId } from '../game/skills.ts';
import { testUnlockOn, setTestUnlock, nextTapRun, UNLOCK_TAPS } from '../game/testUnlock.ts';
import { bootDone, bootProgress, bootShowing, fontsReady, waitForAll } from '../game/boot.ts';

/** the painted pieces the title draws (layout B): decoded before it shows, so nothing pops in after the logo */
const TITLE_ART = [
  UI_KIT_URL,
  new URL('../assets/ui/sign-big.webp', import.meta.url).href,
  new URL('../assets/ui/leaf-token.webp', import.meta.url).href,
  new URL('../assets/ui/token.webp', import.meta.url).href,
];
const decodeArt = (url: string): Promise<void> => {
  if (typeof Image === 'undefined') return Promise.resolve();
  const im = new Image();
  im.src = url;
  return im.decode().catch(() => undefined);
};

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
  /** LV-19: a fresh game with no mode kept asks Easy or Normal; where to go once picked (the story, or the map) */
  const [pickThen, setPickThen] = useState<null | (() => void)>(null);
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
      promises: [fontsReady(), ...TITLE_ART.map(decodeArt)],
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
  /** go on to the story / 1-1 (or the map): the how-to first for a brand-new player, then the mode card until a mode is kept (LV-19) */
  const goOn = (then: () => void, toMap = false) => {
    const step = nextStartStep({ hasProgress: !!resume, howToSeen: howToSeen(), modeChosen: modeChosen(), toMap });
    if (step === 'howto') {
      markHowToSeen();
      setIntro(true);
    } else if (step === 'pick') setPickThen(() => then);
    else leave(then);
  };
  const start = () => goOn(onStartGame);
  const covered = saveOpen || newOpen || menuOpen || howOpen || intro || !!pickThen;

  return (
    <div className={`gx2 select-none gx2-${phase}${cold ? '' : ' gx2-back'}${named ? ' gx2-named' : ''}${covered ? ' gx2-covered' : ''}`}>
      <TitleScene ref={scene} worlds={SHOWCASE} hold={13} stageSelector=".gx2-stage" dim={covered} />

      <div className="gx2-ui">
        {/* the corner: sound and Settings, small and out of the way (layout B, Matt 2026-10-30) */}
        <div className="gx2-top">
          <button
            type="button"
            onClick={onToggleMute}
            className={`ttl-token${waiting ? ' wait' : ''}`}
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Sound off' : waiting ? 'Tap for sound' : 'Sound on'}
            title={isMuted ? 'Sound off' : waiting ? 'Tap for sound' : 'Sound on'}
          >
            <Icon name={isMuted ? 'mute' : 'speaker'} size={28} />
          </button>
          <button type="button" onClick={() => setMenuOpen(true)} className="ttl-token" aria-label="Settings" data-menu="true">
            <Icon name="gear" size={28} />
          </button>
        </div>

        <div className="gx2-logo">
          <CarvedLogo go={phase === 'arrive'} onName={() => setNamed(true)} />
          <span className="gx2-glint g1" aria-hidden="true" />
          <span className="gx2-glint g2" aria-hidden="true" />
          <span className="gx2-glint g3" aria-hidden="true" />
        </div>
        <div className="gx2-stage" aria-hidden="true" />

        {/* one big trail sign to play, and under it, tucked close as one group, three leaf tokens */}
        <div className="gx2-post">
          <button type="button" data-start="true" onClick={start} className="ttl-play" style={{ ['--i' as string]: 0 }}>
            <span className="ttl-play-t">
              <Icon name="play" size={30} />
              {resume ? 'CONTINUE' : 'START ADVENTURE'}
            </span>
            {resume && (
              <span className="ttl-play-s">
                {resume.stage} <i>·</i> {resume.stars} <Icon name="star" size={14} />
              </span>
            )}
          </button>
          <div className="ttl-leaves">
            <button type="button" onClick={() => goOn(onOpenMap, true)} className="ttl-leaf" style={{ ['--i' as string]: 1 }}>
              <span className="ttl-leaf-ic">
                <Icon name="map" size={30} />
              </span>
              World Map
            </button>
            <button type="button" onClick={() => leave(onViewStory)} className="ttl-leaf" style={{ ['--i' as string]: 2 }}>
              <span className="ttl-leaf-ic">
                <Icon name="scroll" size={30} />
              </span>
              Story
            </button>
            <button type="button" onClick={() => setHowOpen(true)} className="ttl-leaf" style={{ ['--i' as string]: 3 }}>
              <span className="ttl-leaf-ic">
                <Icon name="bulb" size={30} />
              </span>
              How to Play
            </button>
          </div>
        </div>
        {creditMsg && !menuOpen && (
          <span className="fixed left-1/2 top-14 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-4 py-1.5 text-sm text-amber-200" role="status">
            {creditMsg}
          </span>
        )}
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
        <TitleSettings
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onClose={() => setMenuOpen(false)}
          onOpenTrophies={onOpenTrophies}
          onOpenCards={onOpenCards}
          onSaveLoad={() => setSaveOpen(true)}
          onNewGame={() => setNewOpen(true)}
          trophyCount={badgeCount ?? 0}
          trophyTotal={trophyTotal}
          updated={updated}
          onInstallDesktop={onInstallDesktop}
          isInstalled={isInstalled}
          onTapShaffer={tapShaffer}
          creditMsg={creditMsg}
        />
      )}
      {howOpen && <HowToPlay onClose={() => setHowOpen(false)} />}
      {intro && (
        <HowToPlay
          intro
          onClose={() => {
            setIntro(false);
            goOn(onStartGame);
          }}
        />
      )}
      {pickThen && (
        <ModePick
          onClose={() => setPickThen(null)}
          onPicked={() => {
            const then = pickThen;
            setPickThen(null);
            leave(then);
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
