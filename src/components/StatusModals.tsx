import React from 'react';
import type { LevelConfig } from '../game/types.ts';
import { BOSS_TIPS } from '../game/bossDefs.ts';
import { PauseMenu } from './PauseMenu.tsx';
import type { SkillId } from '../game/skills.ts';
import { StageCleared } from './StageCleared.tsx';
import { Icon } from './icons/index.tsx';
import { Crest } from './icons/Crest.tsx';
import { crestName } from './icons/crests.ts';
import { HeroPose } from './HeroPose.tsx';

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
const keyHint = (k: string) => (COARSE ? '' : ` [${k}]`);

interface StatusModalsProps {
  screen: 'paused' | 'victory' | 'game_over' | 'boss_intro' | 'story_ending';
  levelConfig: LevelConfig;
  starsEarned: number;
  timeSec: number;
  score: number;
  newBest: boolean;
  bestScore: number;
  prevId: string | null;
  nextId: string | null;
  isMuted: boolean;
  trophyCount: number;
  trophyTotal: number;
  skills: Set<SkillId>;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  onNextStage: () => void;
  onPrevStage: () => void;
  onOpenMap: () => void;
  onOpenTitle: () => void;
  onOpenTrophies: () => void;
  onOpenCards: () => void;
  onViewStory?: () => void;
  onStartBossFight?: () => void;
}

export const StatusModals: React.FC<StatusModalsProps> = ({
  screen,
  levelConfig,
  starsEarned,
  timeSec,
  score,
  newBest,
  bestScore,
  prevId,
  nextId,
  isMuted,
  trophyCount,
  trophyTotal,
  skills,
  onToggleMute,
  onResume,
  onRestart,
  onNextStage,
  onPrevStage,
  onOpenMap,
  onOpenTitle,
  onOpenTrophies,
  onOpenCards,
  onStartBossFight,
}) => {
  // --- 1. PAUSE MENU (opened by the Menu button) ---
  if (screen === 'paused') {
    return (
      <PauseMenu
        levelConfig={levelConfig}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onResume={onResume}
        onRestart={onRestart}
        onOpenTrophies={onOpenTrophies}
        onOpenCards={onOpenCards}
        onOpenMap={onOpenMap}
        trophyCount={trophyCount}
        trophyTotal={trophyTotal}
        skills={skills}
      />
    );
  }

  // --- 2. STAGE CLEARED ---
  if (screen === 'victory') {
    return (
      <StageCleared
        levelConfig={levelConfig}
        starsEarned={starsEarned}
        timeSec={timeSec}
        score={score}
        newBest={newBest}
        bestScore={bestScore}
        prevId={prevId}
        nextId={nextId}
        onNext={onNextStage}
        onPrev={onPrevStage}
        onReplay={onRestart}
        onOpenMap={onOpenMap}
      />
    );
  }

  // --- 3. GAME OVER MODAL ---
  if (screen === 'game_over') {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none font-game">
        <div className="modal-card w-full max-w-md bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-red-600/70 rounded-3xl p-6 sm:p-8 max-h-full overflow-y-auto text-center shadow-2xl shadow-red-950/60 text-white">
          <div className="inline-block px-3 py-1 rounded-full bg-red-950 border border-red-500/40 text-red-400 text-xs font-bold uppercase mb-2">
            Sloth Fainted!
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-red-500 text-stroke mb-3">
            DEFEATED IN BATTLE
          </h2>
          <p className="text-xs text-stone-300 font-sans max-w-sm mx-auto mb-6">
            Out of lives! Dust yourself off and try again. Meeca is counting on you!
          </p>

          <div className="bg-black/50 border border-stone-800 p-3.5 rounded-2xl mb-6">
            <span className="text-[11px] text-stone-400 block uppercase font-sans">Final Score</span>
            <span className="text-2xl font-black text-amber-300 tabular-nums">{score.toLocaleString()}</span>
          </div>

          <div className="modal-actions flex flex-col gap-3">
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-900/50 active:scale-95 transition-transform"
            >
              TRY AGAIN{keyHint('Space / Enter')}
            </button>
            <button
              type="button"
              onClick={onOpenMap}
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-sm active:scale-95 transition-transform"
            >
              BACK TO WORLD MAP
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. BOSS INTRO MODAL ---
  if (screen === 'boss_intro') {
    const bossKey = levelConfig.secret ? 'thornbark' : levelConfig.worldIndex;
    const bossCrestSize = typeof window !== 'undefined' && window.innerHeight < 520 ? 72 : 112;
    return (
      <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none font-game">
        <div className="w-full max-w-lg bg-gradient-to-b from-red-950 via-stone-950 to-black border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-h-full overflow-y-auto text-center shadow-2xl text-white">
          <div className="inline-block px-4 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-xs font-black uppercase tracking-wider mb-2">
            {levelConfig.secret ? 'SECRET BOSS' : 'STAGE BOSS LAIR'}
          </div>

          <div className="boss-intro-crest" style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 6px' }}>
            <Crest world={bossKey} size={bossCrestSize} label={crestName(bossKey)} className="boss-intro-medal" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-amber-400 text-stroke mb-2">
            {levelConfig.name}
          </h2>

          <div className="bg-black/60 border border-red-500/30 p-4 rounded-2xl my-5 text-left">
            <p className="text-amber-200 font-mono text-sm italic mb-2">
              "{levelConfig.description}"
            </p>
            <p className="text-xs text-stone-300 font-sans">
              {BOSS_TIPS[levelConfig.secret ? 11 : levelConfig.worldIndex] ?? 'Watch for the red warning.'}
            </p>
            <p className="text-xs text-amber-200/90 font-sans mt-2">
              A red glow means an attack is coming: light hits bounce off, but a hook or a Mega Punch breaks it. When it tires out, hit it with everything.
            </p>
            {typeof window !== 'undefined' && window.innerHeight > window.innerWidth && (
              <p className="text-xs text-sky-300 font-sans mt-2 font-bold">Turn your phone sideways to see the whole fight.</p>
            )}
          </div>

          <button
            type="button"
            data-start="true"
            onClick={onStartBossFight || onResume}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-lg shadow-xl shadow-red-900/50 active:scale-95 transition-transform"
          >
            COMMENCE BATTLE!{keyHint('Enter')}
          </button>
        </div>
      </div>
    );
  }

  // --- 5. STORY ENDING REUNION CUTSCENE ---
  if (screen === 'story_ending') {
    const endingH = typeof window !== 'undefined' && window.innerHeight < 520 ? 76 : 120;
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-pink-950 to-black flex items-center justify-center p-4 select-none font-game text-white">
        <div className="w-full max-w-lg bg-stone-950/90 border-2 border-pink-400 rounded-3xl p-6 sm:p-8 max-h-full overflow-y-auto text-center shadow-2xl">
          <div className="ending-pair" aria-hidden="true">
            <HeroPose frame="idle_a" height={endingH} className="ending-pokey" />
            <Icon name="heart" size={endingH * 0.3} className="ending-heart" />
            <Crest world="meeca" size={endingH * 0.82} className="ending-meeca" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-pink-300 text-stroke mb-2">
            MEECA IS SAVED!
          </h2>
          <p className="text-sm text-pink-100 font-sans max-w-md mx-auto mb-6">
            Pokey trekked through ten perilous realms, passed one hundred trials, and faced down General Iron-Claw himself. Meeca is home, the Heartbloom is glowing, and the canopy is at peace again.
          </p>

          <div className="bg-black/50 border border-amber-400/40 p-4 rounded-2xl mb-6">
            <span className="text-xs text-amber-300 uppercase font-sans">Grand Expedition Score</span>
            <div className="text-3xl font-black text-amber-400 tabular-nums">{score.toLocaleString()}</div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onOpenMap}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg active:scale-95 transition-transform"
            >
              VISIT WORLD MAP
            </button>
            <button
              type="button"
              onClick={onOpenTitle}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold"
            >
              Main Title Screen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
