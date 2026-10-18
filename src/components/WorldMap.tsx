import React, { useState } from 'react';
import type { WorldInfo, LevelConfig } from '../game/types.ts';
import { WORLDS_DATA } from '../game/worldsData.ts';

interface WorldMapProps {
  levels: LevelConfig[];
  selectedWorldId: number;
  onSelectWorld: (worldId: number) => void;
  onSelectLevel: (level: LevelConfig) => void;
  onBackToTitle: () => void;
  onSaveProgressToDesktop?: () => void;
  /** the hidden Thorn Gate has been found, so the Hollow can be replayed from here */
  secretFound?: boolean;
  onPlaySecret?: () => void;
  thornHeart?: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  levels,
  selectedWorldId,
  onSelectWorld,
  onSelectLevel,
  onBackToTitle,
  onSaveProgressToDesktop,
  secretFound,
  onPlaySecret,
  thornHeart,
}) => {
  const [activeWorldId, setActiveWorldId] = useState<number>(selectedWorldId);
  const curWorld = WORLDS_DATA.find((w) => w.id === activeWorldId) || WORLDS_DATA[0];
  const worldLevels = levels.filter((lvl) => lvl.worldIndex === activeWorldId);

  // Total stars gathered
  const totalStars = levels.reduce((acc, l) => acc + (l.stars || 0), 0);

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-[#091811] via-[#0d281e] to-[#04120b] flex flex-col p-4 sm:p-8 overflow-y-auto select-none font-game text-white">
      {/* Top Header: Title, Total Stars, Back Button */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-6">
        <button
          type="button"
          onClick={onBackToTitle}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-400/40 text-emerald-200 text-sm font-bold active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Main Menu
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide text-stroke">
            RAINFOREST EXPEDITION MAP
          </h1>
          <p className="text-xs text-emerald-200/70 font-sans">
            Choose a Jungle World and conquer its 10 Mission Stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onSaveProgressToDesktop && (
            <button
              type="button"
              onClick={onSaveProgressToDesktop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold active:scale-95 transition-transform"
              title="Save game backup to desktop"
            >
              <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Backup</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-black/50 border border-amber-400/40 px-3.5 py-1.5 rounded-2xl">
            <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-amber-300 font-black text-sm tabular-nums">{totalStars} / 300</span>
          </div>
          {thornHeart && (
            <div className="flex items-center gap-1 bg-black/50 border border-violet-400/50 px-2.5 py-1.5 rounded-2xl" title="Thorn Heart: +1 max heart">
              <span className="text-sm">💜</span>
              <span className="text-violet-200 font-black text-xs">+1</span>
            </div>
          )}
        </div>
      </div>

      {/* World Selector Tabs (1 to 10) */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {WORLDS_DATA.map((world) => {
            const isSelected = world.id === activeWorldId;
            const isUnlocked = world.id === 1 || levels.some(l => l.worldIndex === world.id - 1 && l.miniIndex === 10 && l.completed);

            return (
              <button
                key={world.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  setActiveWorldId(world.id);
                  onSelectWorld(world.id);
                }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border transition-all text-left flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-emerald-600 border-amber-300 text-white shadow-lg shadow-emerald-700/50 scale-105'
                    : isUnlocked
                    ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-200 hover:bg-emerald-900/60'
                    : 'bg-stone-900/50 border-stone-800 text-stone-500 cursor-not-allowed opacity-50'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                  isSelected ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-900 text-emerald-200'
                }`}>
                  {world.id}
                </div>
                <div className="flex flex-col pr-1">
                  <span className="text-xs font-bold whitespace-nowrap">{world.name}</span>
                  <span className="text-[10px] opacity-70 whitespace-nowrap">{world.bossName}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active World Hero Card */}
      <div className="w-full max-w-5xl mx-auto mb-8 bg-gradient-to-r from-emerald-950/80 to-stone-950/80 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              World {curWorld.id}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
              {curWorld.name}
            </h2>
            <p className="text-sm text-stone-300 font-sans max-w-xl">
              {curWorld.subtitle}
            </p>
          </div>

          <div className="bg-black/50 border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/40 flex items-center justify-center text-red-300 font-black text-xs">
              BOSS
            </div>
            <div>
              <div className="text-xs font-bold text-amber-200">{curWorld.bossName}</div>
              <div className="text-[11px] text-stone-400">{curWorld.bossTitle}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Mini-Stage Node Grid */}
      <div className="w-full max-w-5xl mx-auto flex-1">
        <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Mission Stages (1 - 10)</span>
          <span className="text-stone-400 text-xs font-normal">Stage 10 contains the Apex Boss Lair!</span>
        </h3>

        {secretFound && activeWorldId === 7 && onPlaySecret && (
          <button
            type="button"
            onClick={onPlaySecret}
            className="mb-4 w-full p-3.5 rounded-2xl border border-violet-400/60 bg-gradient-to-r from-violet-950/80 to-emerald-950/70 hover:border-violet-300 text-left flex items-center gap-3 active:scale-[0.99] transition-transform"
          >
            <span className="text-2xl">🌿</span>
            <span className="flex flex-col">
              <span className="text-violet-200 font-black text-sm">Thornbark's Hollow</span>
              <span className="text-stone-300 text-[11px] font-sans">Secret boss. {thornHeart ? 'Thorn Heart earned — fight him again?' : 'Free the Jungle Guardian from the thorns.'}</span>
            </span>
          </button>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
          {worldLevels.map((lvl) => {
            const isBoss = lvl.miniIndex === 10;
            const isUnlocked = lvl.unlocked || lvl.miniIndex === 1;

            return (
              <button
                key={lvl.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(lvl)}
                className={`relative group p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 ${
                  isUnlocked
                    ? isBoss
                      ? 'bg-gradient-to-b from-red-950/70 to-stone-950/80 border-red-500/60 hover:border-red-400 hover:scale-105 shadow-lg shadow-red-950/40'
                      : 'bg-emerald-950/50 border-emerald-500/40 hover:border-emerald-300 hover:scale-105 hover:bg-emerald-900/60 shadow-lg shadow-black/40'
                    : 'bg-stone-950/40 border-stone-800 text-stone-600 opacity-45 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                      isBoss ? 'bg-red-500/30 text-red-300 border border-red-400/40' : 'bg-emerald-800/40 text-emerald-300'
                    }`}>
                      Stage {lvl.id}
                    </span>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starNum) => (
                        <svg
                          key={starNum}
                          className={`w-3.5 h-3.5 ${
                            starNum <= lvl.stars ? 'text-amber-400 fill-amber-400' : 'text-stone-700'
                          }`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-stone-100 mb-1 group-hover:text-amber-300 transition-colors">
                    {lvl.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 line-clamp-2 font-sans mb-3">
                    {lvl.description}
                  </p>
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400/80 font-bold uppercase">
                    {lvl.completed ? 'COMPLETED' : isUnlocked ? 'READY' : 'LOCKED'}
                  </span>
                  {isUnlocked && (
                    <span className="text-xs text-amber-300 font-black group-hover:translate-x-0.5 transition-transform">
                      PLAY →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
