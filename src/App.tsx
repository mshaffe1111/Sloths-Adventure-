import { PerfReadout } from './components/PerfReadout.tsx';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { GameScreen, LevelConfig, BossEntity } from './game/types.ts';
import { generateAllLevels } from './game/worldsData.ts';
import { InputEngine } from './game/inputEngine.ts';
import { GameEngine } from './game/engine.ts';
import { enterWorld } from './game/atlasLoader.ts';
import { setExtraLives, startingLives } from './game/assist.ts';
import { setLayoutVariant } from './game/stageGenerator.ts';
import { forgetLayout, layoutForEntry } from './game/layoutMemory.ts';
import { learnedSkills, newlyLearned, type SkillDef, type SkillId } from './game/skills.ts';
import { SkillLearned } from './components/SkillLearned.tsx';
import { GameHUD } from './game/../components/GameHUD.tsx';
import { CoachOverlay } from './components/CoachOverlay.tsx';
import { LessonCard } from './components/LessonCard.tsx';
import { JournalToast } from './components/JournalToast.tsx';
import { Wayside } from './components/Wayside.tsx';
import type { LessonId } from './game/lessons.ts';
import { controlStyle, subscribeControls, type ControlStyle } from './game/controlPrefs.ts';
import type { CoachStep } from './game/touchCoach.ts';
import { ControlSwitch } from './components/ControlSwitch.tsx';
import { WorldMap } from './game/../components/WorldMap.tsx';
import { TitleScreen } from './game/../components/TitleScreen.tsx';
import { StoryPlayer } from './game/../components/StoryPlayer.tsx';
import { INTRO_PANELS, WORLD_MID, WORLD_STORIES, bossPanels, thornbarkPanels } from './game/story.ts';
import { MEMORIES, finalePanels, loadMemories, nextAfterBoss, saveMemories, withMemory, type MemoryId } from './game/storyChapters.ts';
import { victoryPanels } from './game/victoryScenes.ts';
import { WORLDS_DATA } from './game/worldsData.ts';
import { StatusModals } from './game/../components/StatusModals.tsx';
import { sound } from './game/audio.ts';
import { usePWAInstall } from './utils/usePWAInstall.ts';
import { enterWideMode, leaveWideMode } from './game/wideMode.ts';
import { FindReader } from './components/FindReader.tsx';
import { FIND_BY_ID, allFound, loadFinds, saveFinds, withFind } from './game/finds.ts';
import { THORNBARK_LEVEL, gateFound, hasThornHeart, markGateFound, markThornHeart, maxHearts } from './game/secret.ts';
import { warmHeroAtlas } from './game/heroSprite.ts';
import { BADGES, award, evaluate, type BadgeDef, type BadgeStore, type StageStats, recordStage } from './game/badges.ts';
import { anyCakeEaten } from './game/w5Kit.ts';
import { loadBadgeStore, saveBadgeStore, loadCosmetic, saveCosmetic, type CosmeticChoice } from './game/badgeStore.ts';
import { TrophyRoom } from './components/TrophyRoom.tsx';
import { BadgeToast } from './components/BadgeToast.tsx';
import { applyUpdate, autoUpdateAllowed } from './game/updates.ts';
import { ControlTestDone, ControlTestGate, RecordingBadge } from './components/ControlTestGate.tsx';
import { ctestEnabled, newMix, recorder } from './game/playRecorder.ts';
import { CTEST_STAGE_ID } from './game/stageGenerator.ts';
import { DOT_STAGE_ID, newStagesOn } from './game/extraStages.ts';
import { preloadStage, readyToStart } from './game/stagePreload.ts';

const worldStoryKey = (w: number) => `sloth_story_w${w}`;
function hasSeenWorldStory(w: number): boolean {
  try {
    return localStorage.getItem(worldStoryKey(w)) === '1';
  } catch {
    return false;
  }
}
function markWorldStorySeen(w: number) {
  try {
    localStorage.setItem(worldStoryKey(w), '1');
  } catch {}
}
/**
 * World 1's arrival scene (Dot's return and Meeca's first note) plays once, after stage 1-1 is first cleared:
 * a new player plays straight after the prologue, and the note arrives as the reward for the first stage.
 */
const FIRST_NOTE_KEY = 'sloth_story_n1';
function hasSeenFirstNote(): boolean {
  try {
    return localStorage.getItem(FIRST_NOTE_KEY) === '1';
  } catch {
    return false;
  }
}
function markFirstNoteSeen() {
  try {
    localStorage.setItem(FIRST_NOTE_KEY, '1');
  } catch {}
}
/** the scene halfway through a world (after its 5th stage) plays once */
const midStoryKey = (w: number) => `sloth_story_m${w}`;
function hasSeenMidStory(w: number): boolean {
  try {
    return localStorage.getItem(midStoryKey(w)) === '1';
  } catch {
    return false;
  }
}
function markMidStorySeen(w: number) {
  try {
    localStorage.setItem(midStoryKey(w), '1');
  } catch {}
}

/**
 * Once progress is first written, ask the browser to keep this site's storage (saves and the offline game) rather than clear it when space
 * runs low. Asked once per visit, never waited on; a browser may say no or not ask at all, and nothing changes either way.
 */
let askedToKeepStorage = false;
function askToKeepStorage() {
  if (askedToKeepStorage) return;
  askedToKeepStorage = true;
  try {
    void navigator.storage?.persist?.()?.catch?.(() => {});
  } catch {
    /* not offered here */
  }
}

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  // the control test (#ctest in the address): the name screen first, then the test stage, recorded
  const [ctestGate, setCtestGate] = useState(() => ctestEnabled());
  const [recording, setRecording] = useState(false);
  // the test stage cleared: a thank-you instead of carrying on into the next stage of the game (holds the stage to replay)
  const [ctestDone, setCtestDone] = useState<LevelConfig | null>(null);
  const [allLevels, setAllLevels] = useState<LevelConfig[]>(() => generateAllLevels());
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(() => allLevels[0]);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  // where "Continue" goes: the first unlocked stage that has not been cleared yet (the last stage once all are)
  const resumeLevel = React.useMemo(
    () => allLevels.find((l) => (l.unlocked || l.miniIndex === 1 && l.worldIndex === 1) && !l.completed) ?? allLevels[allLevels.length - 1],
    [allLevels],
  );
  const resumeInfo = React.useMemo(() => {
    const cleared = allLevels.filter((l) => l.completed).length;
    if (cleared === 0) return null;
    const w = WORLDS_DATA[resumeLevel.worldIndex - 1] || WORLDS_DATA[0];
    return {
      where: `World ${w.id} · ${w.name}`,
      stage: `Stage ${resumeLevel.id}`,
      stars: allLevels.reduce((a, l) => a + (l.stars || 0), 0),
      cleared,
    };
  }, [allLevels, resumeLevel]);

  // a save file was just loaded: re-read everything the game keeps in storage
  const onSaveLoaded = useCallback(() => {
    const fresh = generateAllLevels();
    setAllLevels(fresh);
    setActiveLevel(fresh[0]);
    setSelectedWorldId(1);
    setSecretFound(gateFound());
    setThornHeart(hasThornHeart());
    setHp(maxHearts());
    setMaxHp(maxHearts());
    setBadgeStore(loadBadgeStore());
    setCosmetic(loadCosmetic());
    setFoundIds(loadFinds());
    setSkills(learnedSkills());
    setNewSkills([]);
  }, []);

  // where the opening story was started from: the title's Story button returns to the title, a new game goes on to 1-1
  const [storyFrom, setStoryFrom] = useState<'title' | 'new'>('title');

  // New Game: progress has just been cleared from storage; rebuild everything from it and begin at stage 1-1
  const onNewGame = useCallback((skipStory: boolean) => {
    const fresh = generateAllLevels();
    setAllLevels(fresh);
    setActiveLevel(fresh[0]);
    setSelectedWorldId(1);
    setSecretFound(gateFound());
    setThornHeart(hasThornHeart());
    setHp(maxHearts());
    setMaxHp(maxHearts());
    setBadgeStore(loadBadgeStore());
    setCosmetic(loadCosmetic());
    setFoundIds(loadFinds());
    setSkills(learnedSkills());
    setNewSkills([]);
    if (skipStory) {
      startLevel(fresh[0]);
    } else {
      // the prologue first: who Pokey and Meeca are, then stage 1-1
      setStoryFrom('new');
      setScreen('story_cutscene');
    }
  }, []);

  // Desktop PWA and saving utilities
  const {
    isInstallable,
    isInstalled,
    isIOS,
    installToDesktop,
    saveSnapshotToDesktop,
    saveProgressToDesktop,
  } = usePWAInstall();

  // Live HUD States
  const [hp, setHp] = useState<number>(() => maxHearts());
  const [maxHp, setMaxHp] = useState<number>(() => maxHearts());
  const [secretFound, setSecretFound] = useState<boolean>(() => gateFound());
  const [thornHeart, setThornHeart] = useState<boolean>(() => hasThornHeart());
  const [score, setScore] = useState<number>(0);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [targetCount, setTargetCount] = useState<number>(1);
  /** the guiding line Dot is saying (a stage tip, the goal, the sealed door): from the engine, shown by Wayside */
  const [guideLine, setGuideLine] = useState<{ text: string; ms: number; n: number } | null>(null);
  const [distanceRatio, setDistanceRatio] = useState<number>(0);
  const [activePowerUp, setActivePowerUp] = useState<'speed' | 'invincible' | 'magnet' | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState<number>(0);
  const [bossInfo, setBossInfo] = useState<{ name: string; hp: number; maxHp: number; phase: number; hits?: number; color?: string; entering?: boolean } | null>(null);
  const [lives, setLives] = useState<number>(3);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);
  // Picks the tune for a stage. A new number each time a stage is entered gives a new composition; retrying keeps it.
  // ?music=1234 pins the number (handy for hearing a particular tune again).
  const [musicSalt, setMusicSalt] = useState<number>(() => {
    const pinned = Number(new URLSearchParams(window.location.search).get('music'));
    return Number.isFinite(pinned) && pinned > 0 ? pinned >>> 0 : (Math.random() * 0x7fffffff) | 0;
  });

  // Victory / Defeat snapshot states
  const [starsEarned, setStarsEarned] = useState<number>(1);
  const [clearTime, setClearTime] = useState<number>(0);
  /** this clear beat the stored best score (or was the first), and the best score now */
  const [newBest, setNewBest] = useState<boolean>(false);
  // skills Pokey has, and any this stage just taught him (shown on the new-skill card before the stage-cleared card)
  const [skills, setSkills] = useState<Set<SkillId>>(() => learnedSkills());
  const [newSkills, setNewSkills] = useState<SkillDef[]>([]);
  const [bestScore, setBestScore] = useState<number>(0);

  // Canvas and Engine refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  /** the short wait before a new engine is built (launchEngine): a second start inside it cancels the first, so two engines never run */
  const launchTimer = useRef(0);
  /** counts launches: a launch still waiting for its sheets is dropped when another starts or a menu comes up meanwhile */
  const launchSeq = useRef(0);
  /** a stage is being played right now (stagePreload.ts then draws nothing on the canvas) */
  const inPlay = useCallback(() => !!engineRef.current?.inPlay(), []);
  // the first-stage lesson (see game/touchCoach.ts): which step is showing, and for which kind of touch controls
  const [coachStep, setCoachStep] = useState<CoachStep>(null);
  // a first-time lesson card (the stage has paused itself; see game/lessons.ts)
  const [lessonId, setLessonId] = useState<LessonId | null>(null);
  // counts every start of a stage, so the in-stage story lines begin fresh on a retry
  const [runId, setRunId] = useState(0);
  const [coachStyle, setCoachStyle] = useState<ControlStyle>(() => controlStyle());
  useEffect(() => subscribeControls(() => setCoachStyle(controlStyle())), []);
  const inputEngineRef = useRef<InputEngine | null>(null);

  // Initialize Input Engine once
  useEffect(() => {
    inputEngineRef.current = new InputEngine();
    return () => {
      inputEngineRef.current?.destroy();
    };
  }, []);

  // ---- the Trophy Room: badges earned, and the rewards Pokey wears ----
  const [badgeStore, setBadgeStore] = useState<BadgeStore>(() => loadBadgeStore());
  const [cosmetic, setCosmetic] = useState<CosmeticChoice>(() => loadCosmetic());
  const [freshBadges, setFreshBadges] = useState<BadgeDef[]>([]);
  const [trophyFrom, setTrophyFrom] = useState<'title' | 'world_map' | 'paused'>('title');
  /** which tab the Trophy Room opens on (the pause menu's Jungle Cards go straight to the creature journal) */
  const [trophyTab, setTrophyTab] = useState<'badges' | 'journal' | 'library'>('badges');
  // ---- story finds: the notes, books and keepsakes picked up, and the one being read ----
  const [foundIds, setFoundIds] = useState<string[]>(() => loadFinds());
  // ---- flashbacks: the ones seen so far, and the one playing ----
  const [memoriesSeen, setMemoriesSeen] = useState<MemoryId[]>(() => loadMemories());
  const [memoryPlay, setMemoryPlay] = useState<{ id: MemoryId; back: 'victory' | 'trophy' } | null>(null);
  const markMemorySeen = (id: MemoryId) => {
    setMemoriesSeen((cur) => {
      const next = withMemory(cur, id);
      if (next !== cur) saveMemories(next);
      return next;
    });
  };
  const [reading, setReading] = useState<string | null>(null);
  /** the find on screen was the last of the 30 */
  const [readingCompletes, setReadingCompletes] = useState(false);
  /** true while a stage is paused because a find was just picked up (so closing the reader resumes it) */
  const pausedForFind = useRef(false);
  const closeReader = () => {
    setReading(null);
    setReadingCompletes(false);
    if (pausedForFind.current) {
      pausedForFind.current = false;
      // closed while the pause menu is up (the app was put away with the reader open): the menu's Resume carries on, not this
      if (screen === 'playing') engineRef.current?.resume();
    }
  };
  /** what the last stage reported; folded in once its result has been saved (see the effect below) */
  const pendingStats = useRef<StageStats | null>(null);
  /** the same report, kept for the result card (stage cleared / out of lives) to show */
  const [lastStats, setLastStats] = useState<StageStats | null>(null);
  /** Game Overs per stage this visit (for the extra-lives offer); cleared when the stage is cleared */
  const failsRef = useRef<Record<string, number>>({});
  const [, bumpFails] = useState(0);
  const badgeCount = React.useMemo(
    () => evaluate({ store: badgeStore, levels: allLevels, gateFound: secretFound, thornHeart }).length,
    [badgeStore, allLevels, secretFound, thornHeart],
  );
  useEffect(() => {
    // after a stage ends (the result is saved by now), or when the saved game changes: hand out whatever is newly earned
    const stats = pendingStats.current;
    if (stats && screen !== 'victory' && screen !== 'game_over' && screen !== 'boss_defeat') return;
    pendingStats.current = null;
    const base = stats ? recordStage(badgeStore, stats) : badgeStore;
    const r = award(base, { levels: allLevels, gateFound: secretFound, thornHeart, stage: stats ?? undefined, cakeFree: !anyCakeEaten() }, Date.now());
    const changed = !!stats || r.fresh.length > 0;
    if (!changed) return;
    setBadgeStore(r.store);
    saveBadgeStore(r.store);
    // a stage just ended: celebrate. Badges found when a save loads or the game opens are filed quietly.
    if (stats && r.fresh.length) {
      setFreshBadges(r.fresh);
      sound.playShrineUnlocked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, allLevels, secretFound, thornHeart]);
  const changeCosmetic = (c: CosmeticChoice) => {
    setCosmetic(c);
    saveCosmetic(c);
  };

  // a new build was installed in the background: swap to it at a calm moment, never in the middle of a stage
  const [updateReady, setUpdateReady] = useState(false);
  useEffect(() => {
    const onUpdate = () => setUpdateReady(true);
    window.addEventListener('sloth-update-ready', onUpdate);
    return () => window.removeEventListener('sloth-update-ready', onUpdate);
  }, []);
  useEffect(() => {
    if (updateReady && (screen === 'title' || screen === 'world_map') && autoUpdateAllowed()) {
      // wait while a pop-up is open (a pasted save code, the guide): the page comes back as it was, minus what was typed
      const go = () => {
        if (!document.querySelector('[role="dialog"]')) void applyUpdate();
      };
      go();
      const id = window.setInterval(go, 2000);
      return () => window.clearInterval(id);
    }
  }, [updateReady, screen]);
  // every time the title shows, look for a newer build (see main.tsx)
  useEffect(() => {
    if (screen === 'title') window.dispatchEvent(new Event('sloth-check-update'));
  }, [screen]);

  // nothing needs the game loop on the menu and story screens, nor the stage it was playing: letting go of the engine frees that
  // stage's world (its terrain, creatures and effects) while the menus are up; the next stage builds a new one
  useEffect(() => {
    if (['title', 'world_map', 'story_cutscene', 'world_story', 'world_mid', 'boss_intro', 'boss_defeat', 'ending_story', 'memory'].includes(screen)) {
      engineRef.current?.stop();
      engineRef.current = null;
      launchSeq.current++;
    }
  }, [screen]);

  // switching apps or locking the phone mid-jump must not drop the player back into live play
  useEffect(() => {
    if (screen !== 'playing') return;
    const onHide = () => {
      if (document.hidden) pauseGame();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', pauseGame);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', pauseGame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // fetch the painted hero while the title is showing
  useEffect(() => {
    warmHeroAtlas();
  }, []);

  // Update body dataset state for CSS and accessibility hooks
  useEffect(() => {
    let bodyState = 'title';
    if (screen === 'playing') bodyState = 'playing';
    else if (screen === 'paused') bodyState = 'paused';
    else if (screen === 'victory' || screen === 'game_over' || screen === 'story_ending') bodyState = 'gameover';
    else if (screen === 'world_map') bodyState = 'map';
    document.body.dataset.state = bodyState;
  }, [screen]);

  // Music and ambience follow the screen. Cutscenes pick their own music panel by panel (see StoryPlayer).
  useEffect(() => {
    const w = activeLevel.worldIndex;
    sound.screen(screen, w, activeLevel.objectiveType === 'boss_lair', activeLevel.id, activeLevel.miniIndex, musicSalt, activeLevel.objectiveType);
    const worldAmbient = (WORLDS_DATA[w - 1] || WORLDS_DATA[0]).ambientType;
    if (screen === 'playing' || screen === 'paused') sound.setAmbient(worldAmbient);
    else if (screen === 'title' || screen === 'world_map') sound.setAmbient('gentle_breeze');
    else if (screen === 'world_story' || screen === 'world_mid' || screen === 'boss_intro' || screen === 'boss_defeat') sound.setAmbient(worldAmbient);
    else if (screen === 'story_cutscene') sound.setAmbient('gentle_breeze');
    else sound.setAmbient(null);
  }, [screen, activeLevel, musicSalt]);

  // Check URL parameters (?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      // ?level=5-10 jumps straight to that stage (handy for checking a boss)
      const wanted = params.get('level');
      startLevel(allLevels.find((l) => l.id === wanted) ?? allLevels[0]);
    }
  }, []);

  // Global Key listeners for Pause (Esc / P) and Title start (Space / Enter)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' && !e.repeat && !document.querySelector('.ui-scrim') && (screen === 'playing' || screen === 'paused' || screen === 'title')) {
        handleToggleMute();
        return;
      }
      if (screen === 'title') {
        // a dialog (Save & Load, New Game, the Menu) owns the keyboard while it is open
        if (document.querySelector('.ui-scrim, .pm-scrim')) return;
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          startLevel(resumeLevel);
        }
      } else if (screen === 'playing') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          pauseGame();
        }
      } else if (screen === 'paused') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          resumeGame();
        } else if (e.code === 'KeyR') {
          e.preventDefault();
          restartLevel();
        }
      } else if (screen === 'victory') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          // a new-skill card is showing: the key dismisses it first
          if (newSkills.length > 0) setNewSkills((q) => q.slice(1));
          else handleNextStage();
        }
      } else if (screen === 'game_over') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          continueRun();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [screen, activeLevel, allLevels, resumeLevel, newSkills]);

  // Start a specific level
  const startLevel = useCallback((lvl: LevelConfig) => {
    // a stage in another world lets the last world's sheets go before this one's story or boss intro loads its own (atlasLoader.ts)
    enterWorld(lvl.worldIndex);
    if (!new URLSearchParams(window.location.search).get('music')) setMusicSalt((Math.random() * 0x7fffffff) | 0);
    // a stage rolls its layout the first time it is entered and keeps it from then on (a retry keeps it too)
    setLayoutVariant(layoutForEntry(lvl));
    setActiveLevel(lvl);
    setSelectedWorldId(lvl.worldIndex);

    // First visit to a world: play its story beat, then continue
    if (lvl.miniIndex === 1 && !hasSeenWorldStory(lvl.worldIndex)) {
      setScreen('world_story');
    } else if (lvl.objectiveType === 'boss_lair') {
      // Boss showdown cutscene before the fight
      setScreen('boss_intro');
    } else {
      launchEngine(lvl);
    }
  }, []);

  // dev only: jump straight into any level (for testing and screenshots); `layout` picks a roll (the designed one when left out)
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as unknown as { __play?: (id: string, layout?: number) => void }).__play = (id: string, layout?: number) => {
      const lvl = id === THORNBARK_LEVEL.id ? THORNBARK_LEVEL : allLevels.find((l) => l.id === id);
      if (lvl) {
        if (layout !== undefined) setLayoutVariant(layout);
        setActiveLevel(lvl);
        launchEngine(lvl);
      }
    };
  }

  // dev only: the running engine, for screenshots and tests
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as unknown as { __engine?: () => unknown }).__engine = () => engineRef.current;
  }

  // dev only: lose every life at once (to test Game Over and Continue)
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as unknown as { __kill?: () => void }).__kill = () => {
      const eng = engineRef.current as unknown as { loseLife: (r: string) => void; lives: number } | null;
      if (eng) for (let i = 0; i < 12 && eng.lives > 0; i++) eng.loseLife('pit');
    };
  }

  // dev only: open a story screen for a level (boss_intro, boss_defeat, world_story) for screenshots
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as unknown as { __story?: (id: string, screen: string) => void }).__story = (id: string, scr: string) => {
      const lvl = id === THORNBARK_LEVEL.id ? THORNBARK_LEVEL : allLevels.find((l) => l.id === id);
      if (!lvl) return;
      setActiveLevel(lvl);
      setScreen(scr as never);
    };
  }

  // the next stage's sheets, got ready behind a card: the stage-cleared card (only for a next stage in this same world, so the sheets
  // of the stage just played are kept for a replay), a world's story or a boss intro (the stage about to start)
  useEffect(() => {
    if (screen === 'victory' && nextStage && nextStage.worldIndex === activeLevel.worldIndex && !ctestEnabled()) void preloadStage(nextStage, canvasRef.current, inPlay);
    else if (screen === 'world_story' || screen === 'boss_intro') void preloadStage(activeLevel, canvasRef.current, inPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, activeLevel.id]);

  // World 8's flashback (the promise) plays inside its world card: it counts as seen once that card opens
  useEffect(() => {
    if (screen === 'world_story' && activeLevel.worldIndex === 8) markMemorySeen('promise');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, activeLevel.worldIndex]);

  // dev only: play a flashback
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as unknown as { __memory?: (id: MemoryId) => void }).__memory = (id: MemoryId) => {
      setMemoryPlay({ id, back: 'trophy' });
      setScreen('memory');
    };
  }

  /** true while World 1's arrival scene plays as the reward after clearing 1-1 (it then goes on to the stage-cleared card) */
  const storyAfterClear = useRef(false);
  const continueAfterWorldStory = (lvl: LevelConfig) => {
    if (storyAfterClear.current) {
      storyAfterClear.current = false;
      markFirstNoteSeen();
      setScreen('victory');
      return;
    }
    markWorldStorySeen(lvl.worldIndex);
    if (lvl.objectiveType === 'boss_lair') setScreen('boss_intro');
    else launchEngine(lvl);
  };

  const launchEngine = useCallback((lvl: LevelConfig) => {
    enterWorld(lvl.worldIndex);
    clearTimeout(launchTimer.current);
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }

    // wide mode: the browser bars go away so the game gets the whole screen (works from the tap that started play)
    enterWideMode();

    setCoachStep(null);
    setLessonId(null);
    setRunId((n) => n + 1);
    setHp(maxHearts());
    setMaxHp(maxHearts());
    setLives(startingLives());
    setScore(0);
    setCurrentCount(0);
    setTargetCount(lvl.targetCount);
    setGuideLine(null);
    setDistanceRatio(0);
    setScreen('playing');

    // the stage's picture sheets, loaded and decoded behind the menu (stagePreload.ts): what is still on its way gets a moment more,
    // so the first frames of play are not the browser decoding a 10 to 20 MB sheet (QA's 376 to 472 ms freezes as a stage began)
    const seq = ++launchSeq.current;
    void readyToStart(lvl, canvasRef.current, inPlay).then(() => {
      if (seq !== launchSeq.current) return;
      // Slight delay to allow canvas element mounting
      launchTimer.current = window.setTimeout(() => {
        if (!canvasRef.current || !inputEngineRef.current) return;
        // The input engine outlives each stage, so drop any direction left over from the last one.
        inputEngineRef.current.clearAll();

        let engine: GameEngine;
        try {
        engine = new GameEngine(canvasRef.current, lvl, inputEngineRef.current, {
          onFatal: () => setScreen('world_map'),
          onGuide: (text, seconds) => setGuideLine((g) => ({ text, ms: seconds * 1000, n: (g?.n ?? 0) + 1 })),
          onStageStats: (s) => {
            pendingStats.current = s;
            setLastStats(s);
          },
          onProgressUpdate: (current, target, curScore, curHp, distRatio, curPowerUp, curPowerTimer) => {
            setCurrentCount(current);
            setTargetCount(target);
            setScore(curScore);
            setHp(curHp);
            if (distRatio !== undefined) {
              setDistanceRatio(distRatio);
            }
            setActivePowerUp(curPowerUp ?? null);
            setPowerUpTimer(curPowerTimer ?? 0);
          },
          onBossUpdate: (info) => setBossInfo(info),
          onCoach: (st) => setCoachStep(st),
          onLesson: (id) => setLessonId(id),
          onFind: (id) => {
            // a new note, book or keepsake: keep it, pause the stage and show it. One already in the Library just gives its line of text.
            const known = loadFinds();
            if (known.includes(id) || !FIND_BY_ID[id]) return;
            const next = withFind(known, id);
            saveFinds(next);
            setFoundIds(next);
            engineRef.current?.pause();
            pausedForFind.current = true;
            setReadingCompletes(allFound(next));
            setReading(id);
          },
          onSecret: () => {
            // the Thorn Gate: a moment to see it open, then the Hollow
            markGateFound();
            setSecretFound(true);
            window.setTimeout(() => startLevel(THORNBARK_LEVEL), 1100);
          },
          onVictory: (stars, timeSec, finalScore) => {
            delete failsRef.current[lvl.id];
            setStarsEarned(stars);
            setClearTime(timeSec);
            setScore(finalScore);

            // the control test is over at its shrine: thank the tester (nothing is saved, and the game does not go on to 1-3)
            if (ctestEnabled() && lvl.id === CTEST_STAGE_ID) {
              setCtestDone(lvl);
              return;
            }

            if (lvl.secret) {
              // Thornbark beaten: the Thorn Heart, no stage to unlock
              markThornHeart();
              setThornHeart(true);
              setMaxHp(maxHearts());
              setScreen('boss_defeat');
              return;
            }

            // Save progression
            saveLevelProgress(lvl.id, stars, finalScore, timeSec);
            // a cleared stage rolls a fresh layout next time (until then a retry keeps the one being learned)
            forgetLayout(lvl.id);

            if (lvl.objectiveType === 'boss_lair') {
              // Boss defeated: play the defeat scene first
              setScreen('boss_defeat');
            } else if (lvl.worldIndex === 1 && lvl.miniIndex === 1 && WORLD_STORIES[1] && !hasSeenFirstNote()) {
              // the first stage is cleared: Dot arrives with Meeca's first note
              storyAfterClear.current = true;
              setScreen('world_story');
            } else if ((lvl.id === DOT_STAGE_ID || (lvl.miniIndex === 5 && !(lvl.worldIndex === 4 && newStagesOn()))) && WORLD_MID[lvl.worldIndex] && !hasSeenMidStory(lvl.worldIndex)) {
              // (in World 4 the halfway scene waits for Dot's own flight after 4-5: she arrives with the note and nine scratches)
              // halfway through a world, Dot catches up with a note from Meeca
              setScreen('world_mid');
            } else {
              setScreen('victory');
            }
          },
          onLivesChange: (l) => setLives(l),
          onDefeat: (finalScore) => {
            failsRef.current[lvl.id] = (failsRef.current[lvl.id] ?? 0) + 1;
            bumpFails((n) => n + 1);
            setScore(finalScore);
            setScreen('game_over');
          },
        });
        } catch (err) {
          console.error('could not start the stage', err);
          setScreen('world_map');
          return;
        }

        engineRef.current?.stop();
        engineRef.current = engine;
        engine.start();
      }, 20);
    });
  }, []);

  const saveLevelProgress = (id: string, stars: number, lvlScore: number, bestTime: number) => {
    try {
      // keep the player's best: a worse replay must never overwrite a better stored result
      let prevStored: { stars?: number; highScore?: number; bestTime?: number } = {};
      try {
        const raw = localStorage.getItem(`sloth_lvl_${id}`);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && typeof parsed === 'object') prevStored = parsed;
      } catch {
        /* unreadable record: treat as none */
      }
      const skillsBefore = learnedSkills();
      const prevScore = typeof prevStored.highScore === 'number' ? prevStored.highScore : 0;
      setNewBest(lvlScore > prevScore);
      setBestScore(Math.max(prevScore, lvlScore));
      const prevTime = typeof prevStored.bestTime === 'number' && prevStored.bestTime > 0 ? prevStored.bestTime : 0;
      const saved = {
        completed: true,
        stars: Math.max(prevStored.stars ?? 0, stars),
        highScore: Math.max(prevStored.highScore ?? 0, lvlScore),
        bestTime: prevTime === 0 ? bestTime : bestTime > 0 ? Math.min(prevTime, bestTime) : prevTime,
      };
      localStorage.setItem(`sloth_lvl_${id}`, JSON.stringify(saved));
      askToKeepStorage();
      setNewSkills(newlyLearned(id, skillsBefore));
      setSkills(learnedSkills());
    } catch {
      /* storage full or blocked: the stage still counts for this session */
    }
    try {
      // Update state and unlock next level
      setAllLevels((prev) => {
        const next = [...prev];
        const idx = next.findIndex((l) => l.id === id);
        if (idx !== -1) {
          next[idx] = {
            ...next[idx],
            completed: true,
            stars: Math.max(next[idx].stars, stars),
            highScore: Math.max(next[idx].highScore, lvlScore),
            bestTime: next[idx].bestTime === 0 ? bestTime : Math.min(next[idx].bestTime, bestTime),
          };
          // Unlock immediately subsequent stage
          if (idx + 1 < next.length) {
            next[idx + 1] = {
              ...next[idx + 1],
              unlocked: true,
            };
          }
        }
        return next;
      });
    } catch {}
  };

  // back at the title the browser bars come back
  useEffect(() => {
    if (screen === 'title') leaveWideMode();
  }, [screen]);

  // the new HUD (beta) flies a pickup from Pokey into its counter
  const heroPoint = useCallback(() => engineRef.current?.heroScreenPoint() ?? null, []);

  const pauseGame = () => {
    engineRef.current?.pause();
    sound.playPause(true);
    setScreen('paused');
  };

  const resumeGame = () => {
    sound.playPause(false);
    setScreen('playing');
    // a lesson card or a just-found note is still up: the stage stays still behind it, and closing it carries on
    if (lessonId || (reading && pausedForFind.current)) return;
    engineRef.current?.resume();
  };

  const restartLevel = () => {
    launchEngine(activeLevel);
  };

  // Game Over -> back in at the last checkpoint with every life; if the engine cannot (it was stopped), start the stage over
  const continueRun = () => {
    const engine = engineRef.current;
    if (engine?.continueFromCheckpoint()) {
      setScreen('playing');
      return;
    }
    restartLevel();
  };

  // the stages either side of this one (none for the secret stage, the first stage or the last)
  const curStageIdx = allLevels.findIndex((l) => l.id === activeLevel.id);
  const nextStage = curStageIdx !== -1 && curStageIdx + 1 < allLevels.length ? allLevels[curStageIdx + 1] : null;
  const prevStage = curStageIdx > 0 ? allLevels[curStageIdx - 1] : null;

  const handleNextStage = () => {
    if (nextStage) startLevel(nextStage);
    else setScreen('world_map');
  };

  const handlePrevStage = () => {
    if (prevStage) startLevel(prevStage);
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black select-none"
      onClickCapture={(e) => {
        // a soft tick on every menu button (not on the in-game touch controls)
        if (screen !== 'playing' && (e.target as HTMLElement).closest?.('button')) sound.playUiTap();
      }}
    >
      {/* Isolated Canvas Container */}
      <div className="absolute inset-0 w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ touchAction: 'none' }}
        />
      </div>

      {ctestGate && (
        <ControlTestGate
          onStart={() => {
            setCtestGate(false);
            setRecording(true);
            const base = allLevels.find((l) => l.id === CTEST_STAGE_ID);
            // the test only asks him to reach the shrine (1-2 itself is a petal hunt, and its shrine would stay sealed)
            const lvl = base && { ...base, name: 'Control Test', objectiveType: 'sprint' as const, targetCount: 1 };
            if (lvl) {
              setActiveLevel(lvl);
              setSelectedWorldId(lvl.worldIndex);
              launchEngine(lvl);
            }
          }}
        />
      )}
      {recording && !ctestDone && (
        <RecordingBadge
          onDone={() => {
            // ending early: note where he was, stop the stage, and go to the questions
            recorder.event('quit');
            engineRef.current?.pause();
            setCtestDone(activeLevel);
          }}
        />
      )}
      {ctestDone && (
        <ControlTestDone
          stretches={engineRef.current?.stretchNames() ?? []}
          onAgain={() => {
            const lvl = ctestDone;
            setCtestDone(null);
            recorder.event('playAgain');
            // a new mix of stretches for the next run
            newMix();
            launchEngine(lvl);
          }}
        />
      )}

      {/* Title Screen View */}
      {screen === 'title' && (
        <TitleScreen
          onStartGame={() => {
            // a brand-new player meets the story first
            if (!resumeInfo && !hasSeenWorldStory(1)) {
              setStoryFrom('new');
              setScreen('story_cutscene');
            } else startLevel(resumeLevel);
          }}
          resume={resumeInfo}
          onSaveLoaded={onSaveLoaded}
          onUnlockToggled={() => setAllLevels(generateAllLevels())}
          onNewGame={onNewGame}
          onOpenMap={() => {
            setSelectedWorldId(resumeLevel.worldIndex);
            setScreen('world_map');
          }}
          onOpenTrophies={() => {
            setTrophyFrom('title');
            setTrophyTab('badges');
            setScreen('trophy');
          }}
          badgeCount={badgeCount}
          trophyTotal={BADGES.length}
          skills={skills}
          onOpenCards={() => {
            setTrophyFrom('title');
            setTrophyTab('journal');
            setScreen('trophy');
          }}
          onViewStory={() => {
            setStoryFrom('title');
            setScreen('story_cutscene');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Story Cutscene Mode */}
      {screen === 'story_cutscene' && (
        <StoryPlayer
          panels={INTRO_PANELS}
          finishLabel="Begin the journey"
          skipLabel="Skip intro"
          onFinish={() => {
            if (storyFrom === 'title') {
              setScreen('title');
              return;
            }
            markWorldStorySeen(1);
            startLevel(allLevels[0]);
          }}
        />
      )}

      {/* World story beat (first visit) */}
      {screen === 'world_story' && WORLD_STORIES[activeLevel.worldIndex] && (
        <StoryPlayer
          panels={WORLD_STORIES[activeLevel.worldIndex].panels}
          finishLabel={storyAfterClear.current ? 'Onward' : "Let's go"}
          onFinish={() => continueAfterWorldStory(activeLevel)}
        />
      )}

      {/* Halfway through a world (first time only) */}
      {screen === 'world_mid' && WORLD_MID[activeLevel.worldIndex] && (
        <StoryPlayer
          key={`mid${activeLevel.worldIndex}`}
          panels={WORLD_MID[activeLevel.worldIndex]}
          finishLabel="Onward"
          skipLabel="Skip scene"
          onFinish={() => {
            markMidStorySeen(activeLevel.worldIndex);
            setScreen('victory');
          }}
        />
      )}

      {/* Boss showdown */}
      {screen === 'boss_intro' && (
        <StoryPlayer
          panels={
            activeLevel.secret
              ? thornbarkPanels('intro')
              : bossPanels(activeLevel.worldIndex, 'intro', (WORLDS_DATA[activeLevel.worldIndex - 1] || WORLDS_DATA[0]).bossName)
          }
          finishLabel="FIGHT!" finishIcon="swords"
          skipLabel="Skip to fight"
          onFinish={() => launchEngine(activeLevel)}
        />
      )}

      {/* Boss defeated */}
      {screen === 'boss_defeat' && (
        <StoryPlayer
          panels={
            activeLevel.secret
              ? thornbarkPanels('defeat')
              : victoryPanels(activeLevel.worldIndex, (WORLDS_DATA[activeLevel.worldIndex - 1] || WORLDS_DATA[0]).bossName) ??
                bossPanels(activeLevel.worldIndex, 'defeat', (WORLDS_DATA[activeLevel.worldIndex - 1] || WORLDS_DATA[0]).bossName)
          }
          finishLabel="Onward"
          onFinish={() => {
            if (activeLevel.worldIndex === 10 && activeLevel.miniIndex === 10) {
              setScreen('ending_story');
              return;
            }
            // the first time this guardian goes down, a flashback plays before the stage-cleared card
            const mem = activeLevel.secret ? undefined : nextAfterBoss(activeLevel.worldIndex, memoriesSeen);
            if (mem) {
              setMemoryPlay({ id: mem, back: 'victory' });
              setScreen('memory');
              return;
            }
            setScreen('victory');
          }}
        />
      )}

      {/* A flashback (after a guardian falls, or replayed from the Library) */}
      {screen === 'memory' && memoryPlay && (
        <StoryPlayer
          key={memoryPlay.id}
          panels={MEMORIES[memoryPlay.id].panels}
          finishLabel="Back"
          skipLabel={MEMORIES[memoryPlay.id].kind === 'memory' ? 'Skip memory' : 'Skip scene'}
          onFinish={() => {
            markMemorySeen(memoryPlay.id);
            const back = memoryPlay.back;
            if (back === 'victory') {
              // a guardian can leave several scenes behind: play the next one before the stage-cleared card
              const next = nextAfterBoss(activeLevel.worldIndex, withMemory(memoriesSeen, memoryPlay.id), memoryPlay.id);
              if (next) {
                setMemoryPlay({ id: next, back });
                return;
              }
            }
            setMemoryPlay(null);
            if (back === 'trophy') {
              setTrophyTab('library');
              setScreen('trophy');
            } else setScreen('victory');
          }}
        />
      )}

      {/* The ending: it carries a line for every keepsake the player found */}
      {screen === 'ending_story' && (
        <StoryPlayer
          panels={finalePanels(foundIds)}
          finishLabel="The End" finishIcon="heart"
          onFinish={() => setScreen('story_ending')}
        />
      )}

      {/* World Map View */}
      {screen === 'world_map' && (
        <WorldMap
          levels={allLevels}
          selectedWorldId={selectedWorldId}
          onSelectWorld={(wId) => setSelectedWorldId(wId)}
          onSelectLevel={(lvl) => startLevel(lvl)}
          onPick={(lvl) => void preloadStage(lvl, canvasRef.current, inPlay)}
          onBackToTitle={() => setScreen('title')}
          secretFound={secretFound}
          thornHeart={thornHeart}
          onPlaySecret={() => startLevel(THORNBARK_LEVEL)}
          resumeId={resumeLevel.id}
          onSaveLoaded={onSaveLoaded}
          onOpenTrophies={() => {
            setTrophyFrom('world_map');
            setTrophyTab('badges');
            setScreen('trophy');
          }}
        />
      )}

      {screen === 'trophy' && (
        <TrophyRoom
          store={badgeStore}
          levels={allLevels}
          gateFound={secretFound}
          thornHeart={thornHeart}
          choice={cosmetic}
          onChoice={changeCosmetic}
          initialTab={trophyTab}
          finds={foundIds}
          memories={memoriesSeen}
          onReplayMemory={(id) => {
            setMemoryPlay({ id, back: 'trophy' });
            setScreen('memory');
          }}
          onOpenFind={(id) => { setReadingCompletes(false); setReading(id); }}
          onBack={() => setScreen(trophyFrom)}
        />
      )}

      {reading && FIND_BY_ID[reading] && <FindReader find={FIND_BY_ID[reading]} onClose={closeReader} completes={readingCompletes} />}

      {/* held back while the stage-cleared and new-skill cards are up: it covered their title ribbons and buttons */}
      {freshBadges.length > 0 && screen !== 'victory' && <BadgeToast badges={freshBadges} onDone={() => setFreshBadges([])} />}

      {/* Active Game HUD (Only in playing or paused) */}
      {(screen === 'playing' || screen === 'paused') && (
        <>
          <GameHUD
            levelConfig={activeLevel}
            hp={hp}
            maxHp={maxHp}
            currentObjectiveCount={currentCount}
            targetObjectiveCount={targetCount}
            distanceRatio={distanceRatio}
            score={score}
            onMenu={pauseGame}
            bossHp={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.hp ?? 1 : undefined}
            bossMaxHp={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.maxHp ?? 1 : undefined}
            bossName={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.name : undefined}
            bossPhase={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.phase : undefined}
            bossHits={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.hits : undefined}
            bossAccent={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.color : undefined}
            bossEntering={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.entering : undefined}
            activePowerUp={activePowerUp}
            powerUpTimer={powerUpTimer}
            lives={lives}
            heroPoint={heroPoint}
            runKey={runId}
          />
          {screen === 'playing' && <CoachOverlay step={coachStep} style={coachStyle} />}
          <PerfReadout stageId={activeLevel.id} />
          <Wayside
            key={`${activeLevel.id}-${runId}`}
            level={activeLevel}
            active={screen === 'playing' && !coachStep && !lessonId && !reading}
            ratio={distanceRatio}
            hp={hp}
            guide={guideLine}
            // the new look's Dot guide (newLook.ts): it reads the stage itself and takes the coach and lessons as her lines
            dot={{ engine: () => engineRef.current, playing: screen === 'playing' && !reading, coachStep, coachStyle, lessonId, count: { cur: currentCount, target: targetCount } }}
          />
          {screen === 'playing' && lessonId && (
            <LessonCard
              id={lessonId}
              onClose={() => {
                setLessonId(null);
                // no clearing of the controls here: a thumb lifted while the card was up has already let go of what it held, and one
                // still on the glass keeps doing what it was (clearing it left the recogniser thinking it steered while nothing moved,
                // so the next touch did nothing; and it dropped a held jump in mid-air)
                engineRef.current?.lessonClosed();
              }}
            />
          )}
          <JournalToast active={screen === 'playing' && !coachStep && !lessonId && !reading} guide={guideLine} />
          {inputEngineRef.current && (
            <ControlSwitch inputEngine={inputEngineRef.current} />
          )}
        </>
      )}

      {/* Status Modals: Paused, Victory, Game Over, Boss Intro, Story Ending */}
      {(screen === 'paused' ||
        (screen === 'victory' && newSkills.length === 0) ||
        screen === 'game_over' ||
        screen === 'story_ending') && (
        <StatusModals
          screen={screen}
          levelConfig={activeLevel}
          starsEarned={starsEarned}
          timeSec={clearTime}
          score={score}
          newBest={newBest}
          bestScore={bestScore}
          stats={lastStats}
          prevId={activeLevel.secret ? null : prevStage?.id ?? null}
          nextId={activeLevel.secret ? null : nextStage?.id ?? null}
          isMuted={isMuted}
          trophyCount={badgeCount}
          trophyTotal={BADGES.length}
          skills={skills}
          onToggleMute={handleToggleMute}
          onResume={resumeGame}
          onRestart={restartLevel}
          onContinue={continueRun}
          fails={failsRef.current[activeLevel.id] ?? 0}
          onTakeHelp={() => {
            setExtraLives(2);
            continueRun();
          }}
          onNextStage={handleNextStage}
          onPrevStage={handlePrevStage}
          onOpenTrophies={() => {
            setTrophyFrom('paused');
            setTrophyTab('badges');
            setScreen('trophy');
          }}
          onOpenCards={() => {
            setTrophyFrom('paused');
            setTrophyTab('journal');
            setScreen('trophy');
          }}
          onOpenMap={() => {
            engineRef.current?.stop();
            setScreen('world_map');
          }}
          onOpenTitle={() => {
            engineRef.current?.stop();
            setScreen('title');
          }}
          onViewStory={() => {
            engineRef.current?.stop();
            setScreen('story_cutscene');
          }}
          onStartBossFight={() => launchEngine(activeLevel)}
        />
      )}

      {/* A skill this stage just taught him: shown before the stage-cleared card */}
      {screen === 'victory' && newSkills.length > 0 && <SkillLearned skill={newSkills[0]} onContinue={() => setNewSkills((q) => q.slice(1))} />}

    </div>
  );
}
