import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { GameScreen, LevelConfig, BossEntity } from './game/types.ts';
import { generateAllLevels } from './game/worldsData.ts';
import { InputEngine } from './game/inputEngine.ts';
import { GameEngine } from './game/engine.ts';
import { GameHUD } from './game/../components/GameHUD.tsx';
import { TouchController } from './game/../components/TouchController.tsx';
import { WorldMap } from './game/../components/WorldMap.tsx';
import { TitleScreen } from './game/../components/TitleScreen.tsx';
import { StoryPlayer } from './game/../components/StoryPlayer.tsx';
import { INTRO_PANELS, WORLD_STORIES, ENDING_PANELS, bossPanels } from './game/story.ts';
import { WORLDS_DATA } from './game/worldsData.ts';
import { StatusModals } from './game/../components/StatusModals.tsx';
import { sound } from './game/audio.ts';
import { usePWAInstall } from './utils/usePWAInstall.ts';

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
  const [hp, setHp] = useState<number>(5);
  const [score, setScore] = useState<number>(0);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [targetCount, setTargetCount] = useState<number>(1);
  const [distanceRatio, setDistanceRatio] = useState<number>(0);
  const [activePowerUp, setActivePowerUp] = useState<'speed' | 'invincible' | 'magnet' | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

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

  // Check URL parameters (?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startLevel(allLevels[0]);
    }
  }, []);

  // Global Key listeners for Pause (Esc / P) and Title start (Space / Enter)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (screen === 'title') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          startLevel(activeLevel);
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
  }, [screen, activeLevel, allLevels]);

  // Start a specific level
  const startLevel = useCallback((lvl: LevelConfig) => {
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

    setHp(5);
    setLives(3);
    setScore(0);
    setCurrentCount(0);
    setTargetCount(lvl.targetCount);
    setDistanceRatio(0);
    setScreen('playing');

    // Slight delay to allow canvas element mounting
    setTimeout(() => {
      if (!canvasRef.current || !inputEngineRef.current) return;

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
        onVictory: (stars, timeSec, finalScore) => {
          setStarsEarned(stars);
          setClearTime(timeSec);
          setScore(finalScore);

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

  const pauseGame = () => {
    engineRef.current?.pause();
    setScreen('paused');
  };

  const resumeGame = () => {
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
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
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
          onStartGame={() => startLevel(activeLevel)}
          onOpenMap={() => setScreen('world_map')}
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
          panels={bossPanels(
            activeLevel.worldIndex,
            'intro',
            (WORLDS_DATA[activeLevel.worldIndex - 1] || WORLDS_DATA[0]).bossName
          )}
          finishLabel="FIGHT! ⚔"
          skipLabel="Skip to fight"
          onFinish={() => launchEngine(activeLevel)}
        />
      )}

      {/* Boss defeated */}
      {screen === 'boss_defeat' && (
        <StoryPlayer
          panels={bossPanels(
            activeLevel.worldIndex,
            'defeat',
            (WORLDS_DATA[activeLevel.worldIndex - 1] || WORLDS_DATA[0]).bossName
          )}
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
        />
      )}

      {/* Active Game HUD (Only in playing or paused) */}
      {(screen === 'playing' || screen === 'paused') && (
        <>
          <GameHUD
            levelConfig={activeLevel}
            hp={hp}
            maxHp={5}
            currentObjectiveCount={currentCount}
            targetObjectiveCount={targetCount}
            distanceRatio={distanceRatio}
            score={score}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={pauseGame}
            bossHp={activeLevel.objectiveType === 'boss_lair' ? hp * 2 : undefined}
            bossMaxHp={activeLevel.objectiveType === 'boss_lair' ? 10 : undefined}
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
