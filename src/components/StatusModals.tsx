import React from 'react';
import type { LevelConfig } from '../game/types.ts';

interface StatusModalsProps {
  screen: 'paused' | 'victory' | 'game_over' | 'boss_intro' | 'story_ending';
  levelConfig: LevelConfig;
  starsEarned: number;
  timeSec: number;
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onNextStage: () => void;
  onOpenMap: () => void;
  onOpenTitle: () => void;
  onViewStory?: () => void;
  onStartBossFight?: () => void;
  onSaveProgressToDesktop?: () => void;
  onSaveSnapshotToDesktop?: () => void;
}

function getStageStoryClue(levelId: string): string {
  const parts = levelId.split('-').map(Number);
  const stage = parts[1] || 1;
  switch (stage) {
    case 1:
      return "🌸 Daisy's Petal: You spotted a fresh pink petal from Daisy's flower fluttering downstream! Milo knows she was carried into the highland canopy!";
    case 2:
      return "🌿 Woven Ribbon: Daisy's hand-woven vine ribbon was found caught on a branch! She left it as a trail for Milo to follow!";
    case 3:
      return "🐾 Rescued Critters: A chirping jungle marmoset points upward: 'The lady with the flower was taken toward the sacred temple!'";
    case 4:
      return "🦅 Talon Gouges: Fresh Harpy Eagle claw marks on ancient banyan bark confirm General Iron-Claw flew towards the summit!";
    case 5:
      return "✨ Secret Carving: Hidden under thick leaves, Daisy carved a sweet note on the trunk: 'Milo, I know you will save me!'";
    case 6:
      return "💨 Feathers in the Wind: Golden Harpy feathers litter the canyon rim, proof that you are closing in on Daisy!";
    case 7:
      return "🗿 Ancient Inscription: The stone idol reveals: 'True courage and sharp claws shall shatter the tyrant's cage.'";
    case 8:
      return "💕 Echoing Voice: In the quiet jungle mist, you hear Daisy calling your name from the mountain fortress ahead!";
    case 9:
      return "⚡ Fortress Gate: The summit gates are within reach! Daisy's cage hangs from the highest bough of the Boss Lair!";
    default:
      return "🎉 Daisy Rescued: Milo shatters the golden cage with a thunderous Mega Claw strike! Daisy leaps into your arms!";
  }
}

export const StatusModals: React.FC<StatusModalsProps> = ({
  screen,
  levelConfig,
  starsEarned,
  timeSec,
  score,
  onResume,
  onRestart,
  onNextStage,
  onOpenMap,
  onOpenTitle,
  onViewStory,
  onStartBossFight,
  onSaveProgressToDesktop,
  onSaveSnapshotToDesktop,
}) => {
  // --- 1. PAUSE MODAL ---
  if (screen === 'paused') {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 select-none font-game">
        <div className="w-full max-w-sm bg-gradient-to-b from-emerald-950 to-stone-950 border-2 border-emerald-500/60 rounded-3xl p-6 text-center shadow-2xl shadow-emerald-950/60 text-white">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase mb-2">
            Game Paused
          </div>
          <h2 className="text-3xl font-black text-amber-300 text-stroke mb-6">
            TAKE A BREATHER
          </h2>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-900/50 active:scale-95 transition-transform"
            >
              RESUME PLAY [Esc]
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 rounded-2xl bg-emerald-900/50 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-200 font-bold text-sm active:scale-95 transition-transform"
            >
              RESTART STAGE [R]
            </button>

            {/* Desktop Save Options */}
            <div className="grid grid-cols-2 gap-2 my-1">
              {onSaveSnapshotToDesktop && (
                <button
                  type="button"
                  onClick={onSaveSnapshotToDesktop}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-black text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Save Photo
                </button>
              )}
              {onSaveProgressToDesktop && (
                <button
                  type="button"
                  onClick={onSaveProgressToDesktop}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-black text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Save Backup
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenMap}
              className="w-full py-2.5 rounded-2xl bg-stone-900/70 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-sm active:scale-95 transition-transform"
            >
              WORLD MAP
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. VICTORY / STAGE CLEAR MODAL ---
  if (screen === 'victory') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 select-none font-game">
        <div className="w-full max-w-md bg-gradient-to-b from-emerald-900 via-emerald-950 to-stone-950 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-emerald-900/60 text-white">
          <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            STAGE CLEARED!
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-amber-300 text-stroke mb-4">
            JUNGLE VICTORY!
          </h2>

          {/* 3 Animated Stars */}
          <div className="flex items-center justify-center gap-3 my-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-12 h-12 transition-transform duration-300 ${
                  s <= starsEarned ? 'scale-110 text-amber-400' : 'scale-90 text-stone-700'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-md" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            ))}
          </div>

          {/* Metrics Tiles */}
          <div className="grid grid-cols-2 gap-3 my-5">
            <div className="bg-black/50 border border-emerald-500/30 p-3 rounded-2xl">
              <span className="text-[11px] text-emerald-300/80 block uppercase font-sans">Clear Time</span>
              <span className="text-xl font-black text-white tabular-nums">{timeSec}s</span>
            </div>
            <div className="bg-black/50 border border-emerald-500/30 p-3 rounded-2xl">
              <span className="text-[11px] text-emerald-300/80 block uppercase font-sans">Stage Score</span>
              <span className="text-xl font-black text-amber-300 tabular-nums">{score.toLocaleString()}</span>
            </div>
          </div>

          {/* Story Clue Card (Daisy Rescue Arc) */}
          <div className="bg-emerald-950/80 border border-amber-400/50 rounded-2xl p-3 my-3 text-left flex items-start gap-2.5 shadow-inner">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-base">
              🌸
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-black text-[11px] uppercase tracking-wider">
                  Daisy's Trail: Clue Found!
                </span>
                {onViewStory && (
                  <button
                    type="button"
                    onClick={onViewStory}
                    className="text-[10px] text-emerald-300 hover:text-white underline font-bold"
                  >
                    Cinema ➔
                  </button>
                )}
              </div>
              <p className="text-stone-200 text-xs mt-1 leading-snug">
                {getStageStoryClue(levelConfig.id)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-6">
            <button
              type="button"
              data-start="true"
              onClick={onNextStage}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-base shadow-lg shadow-amber-600/50 active:scale-95 transition-transform"
            >
              NEXT STAGE [Space / Enter]
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onRestart}
                className="py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-200 text-xs font-bold active:scale-95 transition-transform"
              >
                Replay Stage
              </button>
              <button
                type="button"
                onClick={onOpenMap}
                className="py-2.5 rounded-xl bg-stone-900/70 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold active:scale-95 transition-transform"
              >
                World Map
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. GAME OVER MODAL ---
  if (screen === 'game_over') {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none font-game">
        <div className="w-full max-w-md bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-red-600/70 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-red-950/60 text-white">
          <div className="inline-block px-3 py-1 rounded-full bg-red-950 border border-red-500/40 text-red-400 text-xs font-bold uppercase mb-2">
            Sloth Fainted!
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-red-500 text-stroke mb-3">
            DEFEATED IN BATTLE
          </h2>
          <p className="text-xs text-stone-300 font-sans max-w-sm mx-auto mb-6">
            The jungle predators were too fierce! Dust yourself off and try again—Daisy is counting on you!
          </p>

          <div className="bg-black/50 border border-stone-800 p-3.5 rounded-2xl mb-6">
            <span className="text-[11px] text-stone-400 block uppercase font-sans">Final Score</span>
            <span className="text-2xl font-black text-amber-300 tabular-nums">{score.toLocaleString()}</span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-900/50 active:scale-95 transition-transform"
            >
              TRY AGAIN [Space / Enter]
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
    return (
      <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none font-game">
        <div className="w-full max-w-lg bg-gradient-to-b from-red-950 via-stone-950 to-black border-2 border-red-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl text-white">
          <div className="inline-block px-4 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-xs font-black uppercase tracking-wider mb-2">
            STAGE BOSS LAIR
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-amber-400 text-stroke mb-2">
            {levelConfig.name}
          </h2>

          <div className="bg-black/60 border border-red-500/30 p-4 rounded-2xl my-5 text-left">
            <p className="text-amber-200 font-mono text-sm italic mb-2">
              "{levelConfig.description}"
            </p>
            <p className="text-xs text-stone-300 font-sans">
              Tactical Advice: Dodge seismic shockwaves by jumping on upper branches or swinging from vines. Watch for attack telegraph rings and counter-attack with Mega Punch!
            </p>
          </div>

          <button
            type="button"
            data-start="true"
            onClick={onStartBossFight || onResume}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-lg shadow-xl shadow-red-900/50 active:scale-95 transition-transform"
          >
            COMMENCE BATTLE! [Enter]
          </button>
        </div>
      </div>
    );
  }

  // --- 5. STORY ENDING REUNION CUTSCENE ---
  if (screen === 'story_ending') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-pink-950 to-black flex items-center justify-center p-4 select-none font-game text-white">
        <div className="w-full max-w-lg bg-stone-950/90 border-2 border-pink-400 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="text-5xl mb-3">❤️</div>
          <h2 className="text-3xl sm:text-4xl font-black text-pink-300 text-stroke mb-2">
            DAISY IS SAVED!
          </h2>
          <p className="text-sm text-pink-100 font-sans max-w-md mx-auto mb-6">
            Against all odds, Sloth trekked through 10 perilous rainforest worlds, conquered 100 daunting trials, and defeated General Iron-Claw! Sloth and Daisy are finally reunited, peacefully swinging through the sunlit canopy forever!
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
