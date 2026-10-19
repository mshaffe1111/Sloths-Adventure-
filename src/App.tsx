import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { GameScreen, LevelConfig, BossEntity } from './game/types.ts';
import { generateAllLevels } from './game/worldsData.ts';
import { InputEngine } from './game/inputEngine.ts';
import { GameEngine } from './game/engine.ts';
import { setLayoutVariant, rollLayoutVariant } from './game/stageGenerator.ts';
import { GameHUD } from './game/../components/GameHUD.tsx';
import { TouchController } from './game/../components/TouchController.tsx';
import { WorldMap } from './game/../components/WorldMap.tsx';
import { TitleScreen } from './game/../components/TitleScreen.tsx';
import { StoryPlayer } from './game/../components/StoryPlayer.tsx';
import { INTRO_PANELS, WORLD_STORIES, ENDING_PANELS, bossPanels, thornbarkPanels } from './game/story.ts';
import { WORLDS_DATA } from './game/worldsData.ts';
import { StatusModals } from './game/../components/StatusModals.tsx';
import { sound } from './game/audio.ts';
import { usePWAInstall } from './utils/usePWAInstall.ts';
import { enterWideMode, leaveWideMode } from './game/wideMode.ts';
import { THORNBARK_LEVEL, gateFound, hasThornHeart, markGateFound, markThornHeart, maxHearts } from './game/secret.ts';

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

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
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
  }, []);

  // New Game: progress has just been cleared from storage; rebuild everything from it and begin at stage 1-1
  const onNewGame = useCallback(() => {
    const fresh = generateAllLevels();
    setAllLevels(fresh);
    setActiveLevel(fresh[0]);
    setSelectedWorldId(1);
    setSecretFound(gateFound());
    setThornHeart(hasThornHeart());
    setHp(maxHearts());
    setMaxHp(maxHearts());
    startLevel(fresh[0]);
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
  const [distanceRatio, setDistanceRatio] = useState<number>(0);
  const [activePowerUp, setActivePowerUp] = useState<'speed' | 'invincible' | 'magnet' | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState<number>(0);
  const [bossInfo, setBossInfo] = useState<{ name: string; hp: number; maxHp: number; phase: number } | null>(null);
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

  // Canvas and Engine refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const inputEngineRef = useRef<InputEngine | null>(null);

  // Initialize Input Engine once
  useEffect(() => {
    inputEngineRef.current = new InputEngine();
    return () => {
      inputEngineRef.current?.destroy();
    };
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
    sound.screen(screen, w, activeLevel.objectiveType === 'boss_lair', activeLevel.id, activeLevel.miniIndex, musicSalt);
    const worldAmbient = (WORLDS_DATA[w - 1] || WORLDS_DATA[0]).ambientType;
    if (screen === 'playing' || screen === 'paused') sound.setAmbient(worldAmbient);
    else if (screen === 'title' || screen === 'world_map') sound.setAmbient('gentle_breeze');
    else if (screen === 'world_story' || screen === 'boss_intro' || screen === 'boss_defeat') sound.setAmbient(worldAmbient);
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
      if (screen === 'title') {
        // a dialog (Save & Load, New Game) owns the keyboard while it is open
        if (document.querySelector('.ui-scrim')) return;
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
          handleNextStage();
        }
      } else if (screen === 'game_over') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          restartLevel();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [screen, activeLevel, allLevels, resumeLevel]);

  // Start a specific level
  const startLevel = useCallback((lvl: LevelConfig) => {
    if (!new URLSearchParams(window.location.search).get('music')) setMusicSalt((Math.random() * 0x7fffffff) | 0);
    // a fresh layout each time a stage is entered; a retry (restartLevel) keeps it
    setLayoutVariant(rollLayoutVariant());
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

  // dev only: jump straight into any level (for testing and screenshots)
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as unknown as { __play?: (id: string) => void }).__play = (id: string) => {
      const lvl = id === THORNBARK_LEVEL.id ? THORNBARK_LEVEL : allLevels.find((l) => l.id === id);
      if (lvl) launchEngine(lvl);
    };
  }

  const continueAfterWorldStory = (lvl: LevelConfig) => {
    markWorldStorySeen(lvl.worldIndex);
    if (lvl.objectiveType === 'boss_lair') setScreen('boss_intro');
    else launchEngine(lvl);
  };

  const launchEngine = useCallback((lvl: LevelConfig) => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }

    // wide mode: the browser bars go away so the game gets the whole screen (works from the tap that started play)
    enterWideMode();

    setHp(maxHearts());
    setMaxHp(maxHearts());
    setLives(3);
    setScore(0);
    setCurrentCount(0);
    setTargetCount(lvl.targetCount);
    setDistanceRatio(0);
    setScreen('playing');

    // Slight delay to allow canvas element mounting
    setTimeout(() => {
      if (!canvasRef.current || !inputEngineRef.current) return;
      // The input engine outlives each stage, so drop any direction left over from the last one.
      inputEngineRef.current.clearAll();

      const engine = new GameEngine(canvasRef.current, lvl, inputEngineRef.current, {
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
        onSecret: () => {
          // the Thorn Gate: a moment to see it open, then the Hollow
          markGateFound();
          setSecretFound(true);
          window.setTimeout(() => startLevel(THORNBARK_LEVEL), 1100);
        },
        onVictory: (stars, timeSec, finalScore) => {
          setStarsEarned(stars);
          setClearTime(timeSec);
          setScore(finalScore);

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

          if (lvl.objectiveType === 'boss_lair') {
            // Boss defeated: play the defeat scene first
            setScreen('boss_defeat');
          } else {
            setScreen('victory');
          }
        },
        onLivesChange: (l) => setLives(l),
        onDefeat: (finalScore) => {
          setScore(finalScore);
          setScreen('game_over');
        },
      });

      engineRef.current = engine;
      engine.start();
    }, 20);
  }, []);

  const saveLevelProgress = (id: string, stars: number, lvlScore: number, bestTime: number) => {
    try {
      const saved = { completed: true, stars, highScore: lvlScore, bestTime };
      localStorage.setItem(`sloth_lvl_${id}`, JSON.stringify(saved));

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

  const pauseGame = () => {
    engineRef.current?.pause();
    sound.playPause(true);
    setScreen('paused');
  };

  const resumeGame = () => {
    sound.playPause(false);
    setScreen('playing');
    engineRef.current?.resume();
  };

  const restartLevel = () => {
    launchEngine(activeLevel);
  };

  const handleNextStage = () => {
    const curIdx = allLevels.findIndex((l) => l.id === activeLevel.id);
    if (curIdx !== -1 && curIdx + 1 < allLevels.length) {
      const nextLvl = allLevels[curIdx + 1];
      startLevel(nextLvl);
    } else {
      setScreen('world_map');
    }
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

      {/* Title Screen View */}
      {screen === 'title' && (
        <TitleScreen
          onStartGame={() => startLevel(resumeLevel)}
          resume={resumeInfo}
          onSaveLoaded={onSaveLoaded}
          onNewGame={onNewGame}
          onOpenMap={() => {
            setSelectedWorldId(resumeLevel.worldIndex);
            setScreen('world_map');
          }}
          onViewStory={() => setScreen('story_cutscene')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Story Cutscene Mode */}
      {screen === 'story_cutscene' && (
        <StoryPlayer
          panels={INTRO_PANELS}
          finishLabel="Begin the journey ▶"
          skipLabel="Skip intro"
          onFinish={() => {
            markWorldStorySeen(1);
            startLevel(allLevels[0]);
          }}
        />
      )}

      {/* World story beat (first visit) */}
      {screen === 'world_story' && WORLD_STORIES[activeLevel.worldIndex] && (
        <StoryPlayer
          panels={WORLD_STORIES[activeLevel.worldIndex].panels}
          finishLabel="Let's go ▶"
          onFinish={() => continueAfterWorldStory(activeLevel)}
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
          finishLabel="FIGHT! ⚔"
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
              : bossPanels(activeLevel.worldIndex, 'defeat', (WORLDS_DATA[activeLevel.worldIndex - 1] || WORLDS_DATA[0]).bossName)
          }
          finishLabel="Onward ▶"
          onFinish={() =>
            setScreen(activeLevel.worldIndex === 10 && activeLevel.miniIndex === 10 ? 'ending_story' : 'victory')
          }
        />
      )}

      {/* The ending */}
      {screen === 'ending_story' && (
        <StoryPlayer
          panels={ENDING_PANELS}
          finishLabel="The End ❤"
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
          onBackToTitle={() => setScreen('title')}
          secretFound={secretFound}
          thornHeart={thornHeart}
          onPlaySecret={() => startLevel(THORNBARK_LEVEL)}
          resumeId={resumeLevel.id}
          onSaveLoaded={onSaveLoaded}
        />
      )}

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
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={pauseGame}
            bossHp={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.hp ?? 1 : undefined}
            bossMaxHp={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.maxHp ?? 1 : undefined}
            bossName={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.name : undefined}
            bossPhase={activeLevel.objectiveType === 'boss_lair' ? bossInfo?.phase : undefined}
            activePowerUp={activePowerUp}
            powerUpTimer={powerUpTimer}
            lives={lives}
          />
          {inputEngineRef.current && (
            <TouchController inputEngine={inputEngineRef.current} />
          )}
        </>
      )}

      {/* Status Modals: Paused, Victory, Game Over, Boss Intro, Story Ending */}
      {(screen === 'paused' ||
        screen === 'victory' ||
        screen === 'game_over' ||
        screen === 'story_ending') && (
        <StatusModals
          screen={screen}
          levelConfig={activeLevel}
          starsEarned={starsEarned}
          timeSec={clearTime}
          score={score}
          onResume={resumeGame}
          onRestart={restartLevel}
          onNextStage={handleNextStage}
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
    </div>
  );
}
