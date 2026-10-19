import React from 'react';
import { sound } from '../game/audio.ts';
import type { LevelConfig } from '../game/types.ts';
import { BOSS_TIPS } from '../game/bossDefs.ts';

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
const keyHint = (k: string) => (COARSE ? '' : ` [${k}]`);

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

/** music and effects volume (saved on the device) */
const AudioSliders: React.FC = () => {
  const [music, setMusic] = React.useState(() => sound.musicVolume);
  const [sfx, setSfx] = React.useState(() => sound.sfxVolume);
  const row = (label: string, value: number, set: (v: number) => void, apply: (v: number) => void) => (
    <label className="flex items-center gap-3 text-xs font-bold text-emerald-200">
      <span className="w-14 text-left">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => {
          const v = Number(e.target.value) / 100;
          set(v);
          apply(v);
        }}
        className="flex-1 accent-amber-400"
        aria-label={`${label} volume`}
      />
      <span className="w-8 text-right tabular-nums text-amber-200">{Math.round(value * 100)}</span>
    </label>
  );
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-emerald-600/30 bg-emerald-950/60 px-4 py-3">
      {row('Music', music, setMusic, (v) => sound.setMusicVolume(v))}
      {row('Effects', sfx, setSfx, (v) => sound.setSfxVolume(v))}
    </div>
  );
};

function getStageStoryClue(levelId: string): string {
  const parts = levelId.split('-').map(Number);
  const stage = parts[1] || 1;
  switch (stage) {
    case 1:
      return "🌸 Jennifur's Petal: A fresh pink petal from Jennifur's flower drifts by. She passed this way!";
    case 2:
      return "🌿 Woven Ribbon: Jennifur's hand-woven vine ribbon is caught on a branch. She left it as a trail for Slomatt!";
    case 3:
      return "🐾 A Helpful Friend: A chirping marmoset points onward: 'The lady with the flower went that way!'";
    case 4:
      return "🦅 Talon Gouges: Fresh harpy-eagle claw marks on the bark show which way General Iron-Claw's patrol flew!";
    case 5:
      return "✨ Secret Carving: Hidden under thick leaves, Jennifur carved a note on the trunk: 'Slomatt, I know you will save me!'";
    case 6:
      return "💨 Feathers in the Wind: Golden feathers litter the trail, proof that you are closing in on Jennifur!";
    case 7:
      return "🗿 Ancient Inscription: The stone idol reads: 'True courage and sharp claws shall shatter the tyrant's cage.'";
    case 8:
      return "💕 Echoing Voice: Through the mist you hear Jennifur calling your name from somewhere ahead!";
    case 9:
      return "⚡ Heavy Air: The air feels heavier. This realm's guardian is close. Get ready!";
    default:
      return "🌸 Another Petal: Jennifur's trail leads on to the next realm!";
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
  // the stars ring in one after another as the victory card appears
  React.useEffect(() => {
    if (screen !== 'victory' || levelConfig.secret) return;
    const ids: number[] = [];
    for (let i = 1; i <= starsEarned; i++) ids.push(window.setTimeout(() => sound.playStar(i), 350 + (i - 1) * 260));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [screen, starsEarned, levelConfig.secret]);

  // --- 1. PAUSE MODAL ---
  if (screen === 'paused') {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 select-none font-game">
        <div className="w-full max-w-sm max-h-full overflow-y-auto bg-gradient-to-b from-emerald-950 to-stone-950 border-2 border-emerald-500/60 rounded-3xl p-6 text-center shadow-2xl shadow-emerald-950/60 text-white">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase mb-2">
            Game Paused
          </div>
          <h2 className="text-3xl font-black text-amber-300 text-stroke mb-6">
            TAKE A BREATHER
          </h2>

          <AudioSliders />

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-900/50 active:scale-95 transition-transform"
            >
              RESUME PLAY{keyHint('Esc')}
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 rounded-2xl bg-emerald-900/50 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-200 font-bold text-sm active:scale-95 transition-transform"
            >
              RESTART STAGE{keyHint('R')}
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
        <div className="w-full max-w-md bg-gradient-to-b from-emerald-900 via-emerald-950 to-stone-950 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 max-h-full overflow-y-auto text-center shadow-2xl shadow-emerald-900/60 text-white">
          <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            {levelConfig.secret ? 'SECRET BOSS DEFEATED!' : 'STAGE CLEARED!'}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-amber-300 text-stroke mb-4">
            {levelConfig.secret ? 'THORNBARK IS FREE!' : 'JUNGLE VICTORY!'}
          </h2>

          {/* 3 Animated Stars */}
          <div className={`flex items-center justify-center gap-3 my-4 ${levelConfig.secret ? 'hidden' : ''}`}>
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

          {!levelConfig.secret && (
            <p className="text-[11px] text-emerald-200/70 font-sans leading-snug -mt-1">
              ★★ keep half your hearts · ★★★ lose no lives and keep ¾ of your hearts (timed stages: finish quickly)
            </p>
          )}

          {/* Metrics Tiles */}
          <div className="grid grid-cols-2 gap-3 my-5">
            <div className="bg-black/50 border border-emerald-500/30 p-3 rounded-2xl">
              <span className="text-[11px] text-emerald-300/80 block uppercase font-sans">Clear Time</span>
              <span className="text-xl font-black text-white tabular-nums">{Math.floor(Math.round(timeSec) / 60)}:{String(Math.round(timeSec) % 60).padStart(2, '0')}</span>
            </div>
            <div className="bg-black/50 border border-emerald-500/30 p-3 rounded-2xl">
              <span className="text-[11px] text-emerald-300/80 block uppercase font-sans">Stage Score</span>
              <span className="text-xl font-black text-amber-300 tabular-nums">{score.toLocaleString()}</span>
            </div>
          </div>

          {levelConfig.secret && (
            <div className="bg-violet-950/80 border border-violet-400/60 rounded-2xl p-3 my-3 text-left flex items-start gap-2.5 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center shrink-0 text-lg">
                💜
              </div>
              <div className="flex-1">
                <span className="text-violet-200 font-black text-[11px] uppercase tracking-wider">Thorn Heart earned!</span>
                <p className="text-stone-200 text-xs mt-1 leading-snug">
                  The thorns fall away and the Jungle Guardian is himself again. His gift: one extra heart, for every stage from now on.
                </p>
              </div>
            </div>
          )}

          {/* Story Clue Card (Jennifur Rescue Arc) */}
          {!levelConfig.secret && (
          <div className="bg-emerald-950/80 border border-amber-400/50 rounded-2xl p-3 my-3 text-left flex items-start gap-2.5 shadow-inner">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-base">
              🌸
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-black text-[11px] uppercase tracking-wider">
                  Jennifur's Trail: Clue Found!
                </span>
              </div>
              <p className="text-stone-200 text-xs mt-1 leading-snug">
                {getStageStoryClue(levelConfig.id)}
              </p>
            </div>
          </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-6">
            <button
              type="button"
              data-start="true"
              onClick={onNextStage}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-base shadow-lg shadow-amber-600/50 active:scale-95 transition-transform"
            >
              {levelConfig.secret ? `BACK TO THE MAP${keyHint('Space / Enter')}` : `NEXT STAGE${keyHint('Space / Enter')}`}
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
        <div className="w-full max-w-md bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-red-600/70 rounded-3xl p-6 sm:p-8 max-h-full overflow-y-auto text-center shadow-2xl shadow-red-950/60 text-white">
          <div className="inline-block px-3 py-1 rounded-full bg-red-950 border border-red-500/40 text-red-400 text-xs font-bold uppercase mb-2">
            Sloth Fainted!
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-red-500 text-stroke mb-3">
            DEFEATED IN BATTLE
          </h2>
          <p className="text-xs text-stone-300 font-sans max-w-sm mx-auto mb-6">
            Out of lives! Dust yourself off and try again. Jennifur is counting on you!
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
    return (
      <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none font-game">
        <div className="w-full max-w-lg bg-gradient-to-b from-red-950 via-stone-950 to-black border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-h-full overflow-y-auto text-center shadow-2xl text-white">
          <div className="inline-block px-4 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-xs font-black uppercase tracking-wider mb-2">
            {levelConfig.secret ? 'SECRET BOSS' : 'STAGE BOSS LAIR'}
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
              <p className="text-xs text-sky-300 font-sans mt-2 font-bold">↻ Turn your phone sideways to see the whole fight.</p>
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
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-pink-950 to-black flex items-center justify-center p-4 select-none font-game text-white">
        <div className="w-full max-w-lg bg-stone-950/90 border-2 border-pink-400 rounded-3xl p-6 sm:p-8 max-h-full overflow-y-auto text-center shadow-2xl">
          <div className="text-5xl mb-3">❤️</div>
          <h2 className="text-3xl sm:text-4xl font-black text-pink-300 text-stroke mb-2">
            JENNIFUR IS SAVED!
          </h2>
          <p className="text-sm text-pink-100 font-sans max-w-md mx-auto mb-6">
            Slomatt trekked through ten perilous realms, passed one hundred trials, and faced down General Iron-Claw himself. Jennifur is home, the Heartbloom is glowing, and the canopy is at peace again.
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
