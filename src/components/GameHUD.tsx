import React from 'react';
import type { LevelConfig } from '../game/types.ts';
import { sound } from '../game/audio.ts';

interface GameHUDProps {
  levelConfig: LevelConfig;
  hp: number;
  maxHp: number;
  currentObjectiveCount: number;
  targetObjectiveCount: number;
  distanceRatio?: number;
  score: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onSaveSnapshot?: () => void;
  bossHp?: number;
  bossMaxHp?: number;
  bossName?: string;
  bossTitle?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelConfig,
  hp,
  maxHp,
  currentObjectiveCount,
  targetObjectiveCount,
  distanceRatio = 0,
  score,
  isMuted,
  onToggleMute,
  onPause,
  onSaveSnapshot,
  bossHp,
  bossMaxHp,
  bossName,
  bossTitle,
}) => {
  const isDistanceObjective = [
    'sprint',
    'ascent',
    'stealth',
    'vine_runner',
  ].includes(levelConfig.objectiveType);

  const distPercent = Math.min(100, Math.max(0, Math.round(distanceRatio * 100)));

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none font-game">
      {/* Top Bar: Left Vitality & Stage info, Center Objective, Right Score & Controls */}
      <div className="flex items-start justify-between w-full">
        {/* Left Cluster: HP Hearts & Level Title */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Hearts Vitality Sockets */}
          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-2xl border border-emerald-400/30 shadow-md">
            {Array.from({ length: maxHp }).map((_, idx) => {
              const isFull = idx < hp;
              return (
                <div
                  key={idx}
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
                    isFull ? 'scale-100' : 'scale-90 opacity-40'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow">
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill={isFull ? '#ef4444' : '#450a0a'}
                      stroke={isFull ? '#fee2e2' : '#7f1d1d'}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Current Level Badge */}
          <div className="bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
            <span className="text-amber-400 font-bold text-[11px] sm:text-xs">Stage {levelConfig.id}</span>
            <span className="text-white text-[11px] sm:text-xs font-medium truncate max-w-[110px] sm:max-w-none">
              {levelConfig.name}
            </span>
          </div>
        </div>

        {/* Center: Mission Objective or Boss Health Bar */}
        <div className="flex flex-col items-center pointer-events-auto">
          {bossHp !== undefined && bossMaxHp !== undefined ? (
            <div className="flex flex-col items-center w-48 sm:w-80 bg-black/70 border border-red-500/50 px-3 py-1.5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-red-400 font-black text-[10px] sm:text-xs uppercase tracking-wider truncate">{bossName || 'STAGE BOSS'}</span>
                <span className="text-stone-300 text-[9px] sm:text-[10px] hidden sm:inline">{bossTitle || 'Apex Predator'}</span>
              </div>
              <div className="w-full h-3 bg-stone-900 rounded-full border border-stone-700 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-150 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (bossHp / bossMaxHp) * 100))}%` }}
                />
              </div>
            </div>
          ) : isDistanceObjective ? (
            /* Distance-to-Goal Progress Tracker */
            <div className="flex flex-col items-center bg-black/75 border border-emerald-400/50 px-3 sm:px-4 py-1.5 rounded-2xl shadow-lg backdrop-blur-sm min-w-[160px] sm:min-w-[220px]">
              <div className="flex items-center justify-between w-full text-[10px] sm:text-xs font-black tracking-wide mb-1">
                <span className="text-emerald-300 flex items-center gap-1">
                  <span>🏁</span> RUN TO GOAL
                </span>
                <span className="text-amber-300 font-extrabold tabular-nums">
                  {distPercent}%
                </span>
              </div>
              {/* Progress Track Bar */}
              <div className="w-full h-2.5 bg-emerald-950 rounded-full border border-emerald-600/50 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-100 rounded-full"
                  style={{ width: `${distPercent}%` }}
                />
              </div>
              {distPercent >= 85 && (
                <div className="mt-1 text-[9px] sm:text-[10px] text-amber-300 font-bold animate-pulse tracking-wide">
                  ✨ SHRINE AHEAD! TOUCH TO CLEAR! ✨
                </div>
              )}
            </div>
          ) : (
            /* Item/Enemy Objective Counter */
            <div className="flex flex-col items-center bg-emerald-950/95 border border-emerald-400/60 px-3.5 py-1.5 rounded-2xl shadow-lg shadow-black/50 min-w-[160px]">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1">
                  {levelConfig.objectiveType === 'harvest' ? '🌸 FLORA:' : `${levelConfig.objectiveType.replace('_', ' ')}:`}
                </span>
                <span className="text-white font-extrabold text-xs sm:text-sm tabular-nums">
                  {currentObjectiveCount} / {targetObjectiveCount}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/50 rounded-full border border-emerald-500/40 overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-150 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((currentObjectiveCount / Math.max(1, targetObjectiveCount)) * 100))}%`,
                  }}
                />
              </div>
              {currentObjectiveCount >= targetObjectiveCount ? (
                <span className="text-[9px] sm:text-[10px] text-amber-300 font-bold animate-pulse mt-0.5 tracking-wide">
                  ✨ SHRINE UNLOCKED! TOUCH TO WIN! ✨
                </span>
              ) : (
                <span className="text-[8px] sm:text-[9px] text-emerald-300/70 font-semibold mt-0.5">
                  🔒 Altar Sealed Until Finished
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Cluster: Score, Mute, Pause */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Score Counter */}
          <div className="bg-black/60 border border-amber-400/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl flex items-center gap-1.5 shadow-md">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-amber-300 font-black text-xs sm:text-sm tabular-nums tracking-wide">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Save Snapshot to Desktop Button */}
          {onSaveSnapshot && (
            <button
              type="button"
              onClick={onSaveSnapshot}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black/60 hover:bg-black/80 border border-amber-400/50 flex items-center justify-center text-amber-300 active:scale-95 transition-transform"
              aria-label="Save Photo to Desktop"
              title="Save Snapshot to Desktop"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          )}

          {/* Mute Button */}
          <button
            type="button"
            onClick={onToggleMute}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black/60 hover:bg-black/80 border border-stone-500/50 flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            title="Mute [M]"
          >
            {isMuted ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          {/* Pause Button */}
          <button
            type="button"
            onClick={onPause}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black/60 hover:bg-black/80 border border-stone-500/50 flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Pause Game"
            title="Pause [Esc / P]"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
