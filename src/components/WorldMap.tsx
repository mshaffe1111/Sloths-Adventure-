import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { testUnlockOn } from '../game/testUnlock.ts';
import type { LevelConfig } from '../game/types.ts';
import { WORLDS_DATA } from '../game/worldsData.ts';
import { VistaCanvas, WorldThumb, requestThumbs } from './VistaCanvas.tsx';
import { SaveLoadDialog } from './SaveLoadDialog.tsx';

interface WorldMapProps {
  levels: LevelConfig[];
  selectedWorldId: number;
  onSelectWorld: (worldId: number) => void;
  onSelectLevel: (level: LevelConfig) => void;
  onBackToTitle: () => void;
  /** the hidden Thorn Gate has been found, so the Hollow can be replayed from here */
  secretFound?: boolean;
  onPlaySecret?: () => void;
  thornHeart?: boolean;
  /** the stage Continue would start; the map opens on it */
  resumeId?: string;
  onSaveLoaded: () => void;
  onOpenTrophies?: () => void;
}

const fmtTime = (s: number) => (s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '—');

/** smooth curve through points (Catmull-Rom as cubic beziers) */
function curve(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  levels,
  selectedWorldId,
  onSelectWorld,
  onSelectLevel,
  onBackToTitle,
  secretFound,
  onPlaySecret,
  thornHeart,
  resumeId,
  onSaveLoaded,
  onOpenTrophies,
}) => {
  const [activeWorldId, setActiveWorldId] = useState<number>(selectedWorldId);
  const [saveOpen, setSaveOpen] = useState(false);
  // a locked world says why when tapped (a disabled button gives no feedback on a phone)
  const [lockedMsg, setLockedMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!lockedMsg) return;
    const t = window.setTimeout(() => setLockedMsg(null), 2200);
    return () => window.clearTimeout(t);
  }, [lockedMsg]);
  // the medallion strip scrolls sideways: bring the current world into view when the map opens or the world changes
  useEffect(() => {
    document.querySelector('.map-med.on')?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [activeWorldId]);
  const curWorld = WORLDS_DATA.find((w) => w.id === activeWorldId) || WORLDS_DATA[0];
  const worldLevels = useMemo(() => levels.filter((l) => l.worldIndex === activeWorldId), [levels, activeWorldId]);
  const totalStars = levels.reduce((a, l) => a + (l.stars || 0), 0);

  const worldUnlocked = (id: number) => id === 1 || testUnlockOn() || levels.some((l) => l.worldIndex === id - 1 && l.miniIndex === 10 && l.completed);

  // which stage the card is showing: the one to play next in this world, else the last one reached
  const defaultPick = () => {
    const r = worldLevels.find((l) => l.id === resumeId);
    if (r) return r.id;
    const next = worldLevels.find((l) => (l.unlocked || l.miniIndex === 1) && !l.completed);
    return (next ?? worldLevels[worldLevels.length - 1])?.id;
  };
  const [pickId, setPickId] = useState<string | undefined>(defaultPick);
  useEffect(() => {
    setPickId(defaultPick());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorldId]);
  const picked = worldLevels.find((l) => l.id === pickId) ?? worldLevels[0];

  // paint the little world pictures one by one, this world first
  useEffect(() => {
    requestThumbs([activeWorldId, ...WORLDS_DATA.map((w) => w.id).filter((id) => id !== activeWorldId)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // trail geometry follows the space it is given
  const trailRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 800, h: 200 });
  useLayoutEffect(() => {
    const el = trailRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodes = useMemo(() => {
    const n = worldLevels.length || 10;
    const { w, h } = box;
    const wide = w >= 640 && w > h * 1.25;
    const padX = Math.max(34, Math.min(60, w * 0.06));
    const pts: { x: number; y: number }[] = [];
    if (wide) {
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        pts.push({ x: padX + t * (w - padX * 2), y: h * 0.52 + Math.sin(i * 0.95 + 0.5) * h * 0.2 });
      }
    } else {
      const perRow = Math.ceil(n / 2);
      const rows = 2;
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const x = padX + ((row % 2 === 0 ? col : perRow - 1 - col) / (perRow - 1)) * (w - padX * 2);
        const y = h * (rows === 2 ? (row === 0 ? 0.3 : 0.74) : 0.5) + Math.sin(col * 1.4 + row) * h * 0.05;
        pts.push({ x, y });
      }
    }
    return { pts, wide };
  }, [box, worldLevels.length]);

  const pathD = useMemo(() => curve(nodes.pts), [nodes]);
  const nodeSize = Math.max(34, Math.min(46, box.w / 17));

  const hereIdx = worldLevels.findIndex((l) => l.id === resumeId);

  return (
    <div className="fixed inset-0 z-40 bg-[#10241a] flex flex-col select-none font-game text-white overflow-hidden">
      <div key={activeWorldId} className="absolute inset-0 map-fade">
        <VistaCanvas worlds={[activeWorldId]} pan={6} front={false} />
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(8,20,13,.78) 0%, rgba(8,20,13,.12) 24%, rgba(8,20,13,.1) 52%, rgba(8,20,13,.82) 100%)' }} />

      {/* header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-3 sm:px-6 pt-2.5 sm:pt-4">
        <button type="button" onClick={onBackToTitle} className="ui-chip ui-chip-btn" aria-label="Back to the main menu">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Menu
        </button>
        <div className="text-center min-w-0 order-3 basis-full sm:order-none sm:basis-auto">
          <div className="ui-kicker">World {curWorld.id} of 10</div>
          <h1 className="map-title truncate">{curWorld.name}</h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
          {thornHeart && (
            <span className="ui-chip" title="Thorn Heart: +1 max heart">
              💜 +1
            </span>
          )}
          {onOpenTrophies && (
            <button type="button" className="ui-chip ui-chip-btn" onClick={onOpenTrophies} aria-label="Trophy Room">
              🏆
            </button>
          )}
          <span className="ui-chip" aria-label={`${totalStars} of 300 stars`}>
            <span className="text-amber-300">★</span>
            <span className="tabular-nums">{totalStars}/300</span>
          </span>
          <button type="button" onClick={() => setSaveOpen(true)} className="ui-chip ui-chip-btn">
            Save / Load
          </button>
        </div>
      </div>
      <p className="relative z-10 text-center font-sans text-[11px] sm:text-xs text-emerald-50/80 [text-shadow:0_1px_3px_rgba(0,0,0,.7)] px-4 truncate">{curWorld.subtitle}</p>

      {/* the trail */}
      <div ref={trailRef} className="relative z-10 flex-1 min-h-0">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          <path d={pathD} fill="none" stroke="rgba(10,18,12,.55)" strokeWidth={nodeSize * 0.62} strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD} fill="none" stroke="#e9c987" strokeWidth={nodeSize * 0.4} strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
          <path d={pathD} fill="none" stroke="#8a6030" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" opacity=".8" />
        </svg>

        {secretFound && activeWorldId === 7 && onPlaySecret && (
          <button type="button" onClick={onPlaySecret} className="ui-chip ui-chip-btn absolute right-3 top-1 z-20" style={{ borderColor: 'rgba(196,160,255,.7)' }}>
            🌿 Thornbark's Hollow
          </button>
        )}

        {worldLevels.map((lvl, i) => {
          const p = nodes.pts[i];
          if (!p) return null;
          const isBoss = lvl.miniIndex === 10;
          const open = lvl.unlocked || lvl.miniIndex === 1;
          const size = isBoss ? nodeSize * 1.3 : nodeSize;
          const sel = lvl.id === picked?.id;
          return (
            <React.Fragment key={lvl.id}>
              <button
                type="button"
                onClick={() => {
                  // a second tap on the picked stage plays it
                  if (sel && open) onSelectLevel(lvl);
                  else setPickId(lvl.id);
                }}
                className={`map-node ${open ? (lvl.completed ? 'done' : 'ready') : 'locked'} ${isBoss ? 'boss' : ''} ${sel ? 'sel' : ''}`}
                style={{ left: p.x - size / 2, top: p.y - size / 2, width: size, height: size }}
                aria-label={`Stage ${lvl.id}: ${lvl.name}${lvl.completed ? `, ${lvl.stars} stars` : open ? '' : ', locked'}`}
              >
                {!open ? <LockIcon /> : isBoss ? <span className="map-boss-glyph">☠</span> : <span>{lvl.miniIndex}</span>}
              </button>
              {open && lvl.completed && (
                <div className="map-stars" style={{ left: p.x - 20, top: p.y + size / 2 + 1 }} aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <i key={n} className={n <= lvl.stars ? 'on' : ''}>
                      ★
                    </i>
                  ))}
                </div>
              )}
              {i === hereIdx && !lvl.completed && (
                <div className="map-here" style={{ left: p.x - 15, top: p.y - size / 2 - 33 }} aria-hidden="true">
                  🦥
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* footer: world medallions + the card for the picked stage */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 px-3 sm:px-6 pb-2.5 sm:pb-4">
        {lockedMsg && (
          <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center pointer-events-none">
            <span className="ui-chip">🔒 {lockedMsg}</span>
          </div>
        )}
        <div className="map-meds flex-1 min-w-0" role="tablist" aria-label="Worlds">
          {WORLDS_DATA.map((w) => {
            const open = worldUnlocked(w.id);
            const on = w.id === activeWorldId;
            const cleared = levels.filter((l) => l.worldIndex === w.id && l.completed).length;
            return (
              <button
                key={w.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-disabled={!open}
                onClick={() => {
                  if (!open) {
                    setLockedMsg(`Beat World ${w.id - 1}'s boss to open this world`);
                    return;
                  }
                  setActiveWorldId(w.id);
                  onSelectWorld(w.id);
                }}
                className={`map-med ${on ? 'on' : ''} ${open ? '' : 'locked'}`}
                title={open ? `${w.name} · ${cleared}/10` : 'Clear the previous world to open'}
              >
                <WorldThumb world={w.id} size={on ? 52 : 42} className="map-med-pic" />
                <span className="map-med-n">{open ? w.id : '🔒'}</span>
                {open && cleared > 0 && <span className="map-med-bar" style={{ ['--p' as string]: `${cleared * 10}%` }} />}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="map-card">
            <div className="min-w-0 flex-1">
              <div className="ui-kicker">
                Stage {picked.id}
                {picked.miniIndex === 10 ? ' · Boss' : ''}
              </div>
              <div className="map-card-name truncate">{picked.name}</div>
              <div className="map-card-desc">{picked.description}</div>
              <div className="map-card-meta">
                <span>
                  {[1, 2, 3].map((n) => (
                    <i key={n} className={`map-cs ${n <= picked.stars ? 'on' : ''}`}>
                      ★
                    </i>
                  ))}
                </span>
                {picked.completed && <span>Best {fmtTime(picked.bestTime)}</span>}
                {picked.completed && picked.highScore > 0 && <span>{picked.highScore.toLocaleString()} pts</span>}
              </div>
            </div>
            {picked.unlocked || picked.miniIndex === 1 ? (
              <button type="button" className="title-btn title-btn-start map-play" onClick={() => onSelectLevel(picked)} data-start="true">
                {picked.completed ? 'REPLAY' : 'PLAY'}
              </button>
            ) : (
              <div className="map-locked">Clear the stage before it to open this one</div>
            )}
          </div>
        )}
      </div>

      {saveOpen && <SaveLoadDialog onClose={() => setSaveOpen(false)} onLoaded={onSaveLoaded} />}
    </div>
  );
};

const LockIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="55%" height="55%" fill="currentColor" aria-hidden="true">
    <path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2zm-8-2a3 3 0 0 1 6 0v2H9V7z" />
  </svg>
);
