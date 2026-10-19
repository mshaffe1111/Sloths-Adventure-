import React from 'react';
import type { LevelConfig } from '../game/types.ts';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';

interface GameHUDProps {
  levelConfig: LevelConfig;
  hp: number;
  maxHp: number;
  currentObjectiveCount: number;
  targetObjectiveCount: number;
  distanceRatio?: number;
  score: number;
  /** the Menu button: pauses the game and opens the pause menu */
  onMenu: () => void;
  bossHp?: number;
  bossMaxHp?: number;
  bossName?: string;
  bossPhase?: number;
  activePowerUp?: 'speed' | 'invincible' | 'magnet' | null;
  powerUpTimer?: number;
  lives?: number;
}

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';

/** what the card says the stage is about, by objective */
const GOAL_TEXT: Record<string, string> = {
  sprint: 'Reach the sanctuary',
  ascent: 'Climb to the top',
  stealth: 'Sneak to the end',
  vine_runner: 'Swing to the end',
};
const COUNT_TEXT: Record<string, string> = {
  harvest: 'flowers',
  purge: 'predators',
  gauntlet: 'predators',
  relic_hunt: 'idols',
  rescue: 'animals freed',
};

const POWER_UPS = {
  speed: { label: 'Cheetah speed', color: '#6ee7b7', border: 'rgba(52,211,153,.85)' },
  invincible: { label: 'Solar shield', color: '#fde047', border: 'rgba(250,204,21,.85)' },
  magnet: { label: 'Nectar magnet', color: '#7dd3fc', border: 'rgba(56,189,248,.85)' },
} as const;

/**
 * The in-game HUD. Three groups across the top and nothing else:
 *   left: hearts and lives   |   middle: Menu and score   |   right: ONE card with the stage name and how far you are
 * Sound, restart, trophies and cards live in the Menu (which pauses the game).
 */
export const GameHUD: React.FC<GameHUDProps> = ({
  levelConfig,
  hp,
  maxHp,
  currentObjectiveCount,
  targetObjectiveCount,
  distanceRatio = 0,
  score,
  onMenu,
  bossHp,
  bossMaxHp,
  bossName,
  bossPhase,
  activePowerUp,
  powerUpTimer,
  lives = 3,
}) => {
  const isBoss = bossHp !== undefined && bossMaxHp !== undefined;
  const isDistance = levelConfig.objectiveType in GOAL_TEXT;
  const distPercent = Math.min(100, Math.max(0, Math.round(distanceRatio * 100)));
  const countRatio = Math.min(1, currentObjectiveCount / Math.max(1, targetObjectiveCount));
  const done = currentObjectiveCount >= targetObjectiveCount;
  const barPercent = isDistance ? distPercent : Math.round(countRatio * 100);
  const stageNo = levelConfig.secret ? 'Secret' : levelConfig.id;
  const power = activePowerUp ? POWER_UPS[activePowerUp] : null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[35] select-none font-game pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pt-[max(1rem,env(safe-area-inset-top))] sm:pl-[max(1.25rem,env(safe-area-inset-left))] sm:pr-[max(1.25rem,env(safe-area-inset-right))]">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-4">
        {/* LEFT: hearts and lives */}
        <div className="flex flex-col items-start gap-1.5">
          <div className="hud-glass flex gap-[3px] sm:gap-1 rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2" role="img" aria-label={`Health: ${hp} of ${maxHp} hearts`}>
            {Array.from({ length: maxHp }).map((_, i) => {
              const full = i < hp;
              return (
                <svg key={i} viewBox="0 0 24 24" className={`w-[18px] h-[18px] sm:w-6 sm:h-6 transition-transform duration-200 ${full ? '' : 'scale-90'}`} aria-hidden="true">
                  <path d={HEART_PATH} fill={full ? '#f43f5e' : 'rgba(255,255,255,.1)'} stroke={full ? '#fecdd3' : 'rgba(254,205,211,.45)'} strokeWidth="1.6" />
                </svg>
              );
            })}
          </div>
          <div className="hud-glass flex items-center gap-1.5 rounded-full py-[3px] pl-[3px] pr-3" role="img" aria-label={`Lives: ${lives}`}>
            <span className="rounded-full overflow-hidden bg-amber-200 w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] flex items-center justify-center">
              <HeroFaceIcon size={26} face="face_happy" />
            </span>
            <span className="text-base sm:text-lg font-semibold tabular-nums leading-none">&times; {lives}</span>
          </div>
        </div>

        {/* MIDDLE: menu and score */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onMenu}
            className="hud-glass pointer-events-auto flex items-center gap-2 h-10 sm:h-12 rounded-2xl pl-2.5 pr-2.5 sm:pl-3 sm:pr-4 text-emerald-50 active:scale-95 transition-transform hover:bg-emerald-900/80"
            aria-label="Menu (pauses the game)"
            title="Menu [Esc]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span className="max-sm:hidden text-[17px] font-semibold">Menu</span>
          </button>
          <div className="hud-glass flex items-center gap-1.5 sm:gap-2 h-10 sm:h-12 rounded-2xl px-2.5 sm:pl-3 sm:pr-[18px]" aria-label={`Score ${score.toLocaleString()}`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" aria-hidden="true">
              <path d={STAR_PATH} fill="#fbbf24" stroke="#92400e" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <span className="text-lg sm:text-[22px] font-bold text-amber-200 tabular-nums tracking-wide">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* RIGHT: stage name and distance, one card */}
        <div className="flex justify-end">
          <div className="hud-glass flex flex-col gap-1 sm:gap-[7px] rounded-[18px] px-2.5 pt-1.5 pb-2 sm:px-3.5 sm:pt-2.5 sm:pb-3 w-[168px] sm:w-[250px]">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-base sm:text-xl font-bold text-amber-400 leading-none">{stageNo}</span>
              <span className="text-[12px] sm:text-[15px] font-medium text-emerald-50 text-right leading-tight truncate">{levelConfig.name}</span>
            </div>
            {!isBoss && (
              <>
                <div className="relative h-[14px]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={barPercent} aria-label="Progress">
                  <div className="absolute inset-x-0 top-1 h-2 rounded-full bg-white/20" />
                  <div className="absolute left-0 top-1 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-[width] duration-100" style={{ width: `${barPercent}%` }} />
                  {isDistance && (
                    <>
                      <span
                        className="absolute top-0 w-4 h-4 -ml-2 rounded-full bg-amber-200 border-2 border-amber-800 transition-[left] duration-100"
                        style={{ left: `${Math.max(2, Math.min(94, barPercent))}%` }}
                      />
                      <svg viewBox="0 0 18 22" className="absolute -right-1 -top-1 w-[18px] h-[22px]" aria-hidden="true">
                        <path d="M2 21V9a7 7 0 0 1 14 0v12Z" fill="#a7f3d0" stroke="#065f46" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </div>
                <div className="flex justify-between gap-2 text-[11px] sm:text-[13px] font-medium text-emerald-200 leading-none">
                  {isDistance ? (
                    <>
                      <span className="tabular-nums">{distPercent}% there</span>
                      <span className={distPercent >= 85 ? 'text-amber-300 font-semibold animate-pulse' : ''}>
                        {distPercent >= 85 ? 'Sanctuary ahead!' : GOAL_TEXT[levelConfig.objectiveType]}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="tabular-nums">
                        {currentObjectiveCount} / {targetObjectiveCount} {COUNT_TEXT[levelConfig.objectiveType] ?? ''}
                      </span>
                      <span className={done ? 'text-amber-300 font-semibold animate-pulse' : ''}>{done ? 'Sanctuary open!' : 'Sanctuary sealed'}</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* boss health: a strip under the top row */}
      {isBoss && (
        <div className="mt-2 flex justify-center">
          <div className="hud-glass w-[min(26rem,70vw)] rounded-2xl px-3 py-1.5" style={{ borderColor: 'rgba(248,113,113,.6)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-red-300 font-bold text-[11px] sm:text-sm uppercase tracking-wider truncate">{bossName || 'Stage boss'}</span>
              <span className="flex items-center gap-1" aria-label={`Phase ${bossPhase ?? 1} of 3`}>
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`inline-block w-2.5 h-2.5 rounded-full border ${n <= (bossPhase ?? 1) ? 'bg-red-500 border-red-200' : 'bg-stone-800 border-stone-500'}`} />
                ))}
              </span>
            </div>
            <div className="h-3 rounded-full bg-stone-900 border border-stone-600 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600 transition-[width] duration-150" style={{ width: `${Math.max(0, Math.min(100, (bossHp! / bossMaxHp!) * 100))}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* power-up banner */}
      {power && (
        <div className="mt-2 flex justify-center">
          <div className="hud-glass flex items-center gap-2.5 rounded-full px-4 py-1.5 animate-pulse" style={{ borderColor: power.border, color: power.color }}>
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor" aria-hidden="true">
              <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
            </svg>
            <span className="text-sm sm:text-[15px] font-semibold">{power.label}</span>
            <span className="text-sm tabular-nums">{Math.max(0, Math.ceil(powerUpTimer || 0))}s</span>
          </div>
        </div>
      )}
    </div>
  );
};
