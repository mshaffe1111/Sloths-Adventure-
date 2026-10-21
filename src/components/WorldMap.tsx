import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { testUnlockOn } from '../game/testUnlock.ts';
import type { LevelConfig } from '../game/types.ts';
import { WORLDS_DATA } from '../game/worldsData.ts';
import { VistaCanvas, WorldThumb, requestThumbs } from './VistaCanvas.tsx';
import { SaveLoadDialog } from './SaveLoadDialog.tsx';
import { HeroPose } from './HeroPose.tsx';
import { Icon } from './icons/index.tsx';
import { Crest } from './icons/Crest.tsx';
import { stageTypeInfo } from './icons/stageTypes.ts';

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

/** each stretch of the trail between two stages on its own, with the point and direction at its middle (for the claw prints) */
function segments(pts: { x: number; y: number }[]): { d: string; mx: number; my: number; angle: number }[] {
  const out: { d: string; mx: number; my: number; angle: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    // a cubic at t = .5: the point, and its slope
    const mx = (p1.x + 3 * c1x + 3 * c2x + p2.x) / 8;
    const my = (p1.y + 3 * c1y + 3 * c2y + p2.y) / 8;
    const dx = 0.75 * (p2.x + c2x - c1x - p1.x);
    const dy = 0.75 * (p2.y + c2y - c1y - p1.y);
    out.push({
      d: `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)}C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
      mx,
      my,
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    });
  }
  return out;
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
    // room at the ends for the big boss crest (and its picked outline) so it never touches the screen edge
    const padX = wide ? Math.max(40, Math.min(60, w * 0.06)) : 46;
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
  const segs = useMemo(() => segments(nodes.pts), [nodes]);
  // the stages are drawn bigger when there is room between them (a portrait phone has two rows of five)
  const gap = nodes.pts.length > 1 ? Math.min(...nodes.pts.slice(1).map((p, i) => Math.hypot(p.x - nodes.pts[i].x, p.y - nodes.pts[i].y))) : 80;
  const nodeSize = nodes.wide ? Math.max(34, Math.min(46, box.w / 17)) : Math.max(36, Math.min(46, gap * 0.56));
  const bossSize = Math.round(nodeSize * 1.5);
  const badgePx = Math.max(18, Math.round(nodeSize * 0.42));

  const hereIdx = worldLevels.findIndex((l) => l.id === resumeId);
  // the next stage to play in this world: it gets the pulse ring (and the boss a glow)
  const nextIdx = worldLevels.findIndex((l) => (l.unlocked || l.miniIndex === 1) && !l.completed);

  return (
    <div className="fixed inset-0 z-40 bg-[#10241a] flex flex-col select-none font-game text-white overflow-hidden">
      <div key={activeWorldId} className="absolute inset-0 map-fade">
        <VistaCanvas worlds={[activeWorldId]} pan={6} front={false} />
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(8,20,13,.78) 0%, rgba(8,20,13,.12) 24%, rgba(8,20,13,.1) 52%, rgba(8,20,13,.82) 100%)' }} />

      {/* header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-3 sm:px-6 pt-2.5 sm:pt-4">
        <button type="button" onClick={onBackToTitle} className="ui-chip ui-chip-btn" aria-label="Back to the main menu">
          <Icon name="arrow" size={13} rotate={180} />
          Menu
        </button>
        <div className="text-center min-w-0 order-3 basis-full sm:order-none sm:basis-auto">
          <div className="ui-kicker">World {curWorld.id} of 10</div>
          <h1 className="map-title truncate">{curWorld.name}</h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
          {thornHeart && (
            <span className="ui-chip" title="Thorn Heart: +1 max heart">
              <Icon name="thornHeart" size={15} />
              +1
            </span>
          )}
          {onOpenTrophies && (
            <button type="button" className="ui-chip ui-chip-btn" onClick={onOpenTrophies} aria-label="Trophy Room">
              <Icon name="trophy" size={17} />
            </button>
          )}
          <span className="ui-chip" aria-label={`${totalStars} of 300 stars`}>
            <Icon name="star" size={15} />
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
          {/* the road: dark edge, then every stretch in its own colour. Warm gold where Pokey has been, muted sand for what is still ahead */}
          <path d={pathD} fill="none" stroke="rgba(10,18,12,.55)" strokeWidth={nodeSize * 0.62} strokeLinecap="round" strokeLinejoin="round" />
          {segs.map((s, i) => {
            const cleared = !!worldLevels[i]?.completed;
            return (
              <g key={i}>
                <path d={s.d} fill="none" stroke={cleared ? '#f6c244' : '#bfae86'} strokeWidth={nodeSize * 0.4} strokeLinecap="round" opacity={cleared ? 1 : 0.55} />
                {cleared && <path d={s.d} fill="none" stroke="#fde9a3" strokeWidth={nodeSize * 0.13} strokeLinecap="round" opacity=".55" />}
                <path d={s.d} fill="none" stroke={cleared ? '#9a5a14' : '#6d5a3a'} strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" opacity={cleared ? 0.75 : 0.5} />
              </g>
            );
          })}
          {/* a few tiny claw prints, only where Pokey has already walked */}
          {segs.map((s, i) =>
            worldLevels[i]?.completed && i % 2 === 0 ? (
              <g key={`c${i}`} transform={`translate(${s.mx.toFixed(1)} ${s.my.toFixed(1)}) rotate(${s.angle.toFixed(1)}) translate(0 ${i % 4 === 0 ? -1 : 1})`} opacity=".6">
                <path d="M-3.4-3.3q3.4-1.2 6.8 0M-3.9 0q3.9-1.2 7.8 0M-3.4 3.3q3.4-1.2 6.8 0" fill="none" stroke="#6b3d0c" strokeWidth="1.25" strokeLinecap="round" />
              </g>
            ) : null,
          )}
        </svg>

        {secretFound && activeWorldId === 7 && onPlaySecret && (
          <button type="button" onClick={onPlaySecret} className="ui-chip ui-chip-btn absolute right-3 top-1 z-20" style={{ borderColor: 'rgba(196,160,255,.7)' }}>
            <Icon name="leaf" size={15} />
            Thornbark's Hollow
          </button>
        )}

        {worldLevels.map((lvl, i) => {
          const p = nodes.pts[i];
          if (!p) return null;
          const isBoss = lvl.miniIndex === 10;
          const open = lvl.unlocked || lvl.miniIndex === 1;
          const size = isBoss ? bossSize : nodeSize;
          const sel = lvl.id === picked?.id;
          const type = stageTypeInfo(lvl.objectiveType);
          const isNext = i === nextIdx;
          // Pokey stands on the node's top edge; near the top of the trail he is drawn a little smaller so he never rides up under the title
          const pokeyH = Math.round(Math.max(44, Math.min(70, p.y - size / 2 + 6)));
          return (
            <React.Fragment key={lvl.id}>
              {isNext && <span className={`map-ring ${isBoss ? 'boss' : ''}`} style={{ left: p.x - size / 2, top: p.y - size / 2, width: size, height: size }} aria-hidden="true" />}
              <button
                type="button"
                onClick={() => {
                  // a second tap on the picked stage plays it
                  if (sel && open) onSelectLevel(lvl);
                  else setPickId(lvl.id);
                }}
                className={`map-node ${open ? (lvl.completed ? 'done' : 'ready') : 'locked'} ${isBoss ? 'boss' : ''} ${sel ? 'sel' : ''} ${isNext ? 'next' : ''}`}
                data-type={lvl.objectiveType}
                style={{ left: p.x - size / 2, top: p.y - size / 2, width: size, height: size }}
                aria-label={`Stage ${lvl.id}: ${lvl.name}, ${type.label}${lvl.completed ? `, ${lvl.stars} stars` : open ? '' : ', locked'}`}
              >
                {isBoss ? (
                  <Crest world={lvl.worldIndex} size={size} locked={!open} className="map-crest" />
                ) : (
                  <>
                    {!open ? <Icon name="lock" size={Math.round(size * 0.5)} /> : <span>{lvl.miniIndex}</span>}
                    <span className="map-tbadge" style={{ width: badgePx, height: badgePx }} title={type.label}>
                      <Icon name={type.icon} size={Math.round(badgePx * 0.78)} />
                    </span>
                  </>
                )}
              </button>
              {open && lvl.completed && (
                <div className="map-stars" style={{ left: p.x - 20, top: p.y + size / 2 + (sel ? 6 : 2) }} aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <Icon key={n} name="star" size={11} className={n <= lvl.stars ? 'on' : ''} />
                  ))}
                </div>
              )}
              {i === hereIdx && !lvl.completed && (
                <div className="map-here" style={{ left: p.x, top: p.y - size / 2 - pokeyH + 7, height: pokeyH }} aria-hidden="true">
                  <HeroPose frame="idle_a" height={pokeyH} className="map-here-bob" />
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
            <span className="ui-chip">
              <Icon name="lock" size={15} />
              {lockedMsg}
            </span>
          </div>
        )}
        <div className="map-meds flex-1 min-w-0" role="tablist" aria-label="Worlds">
          {WORLDS_DATA.map((w) => {
            const open = worldUnlocked(w.id);
            const on = w.id === activeWorldId;
            const cleared = levels.filter((l) => l.worldIndex === w.id && l.completed).length;
            const mastered = cleared >= 10;
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
                className={`map-med ${on ? 'on' : ''} ${open ? '' : 'locked'} ${mastered ? 'mastered' : ''}`}
                title={open ? `${w.name} · ${cleared}/10${mastered ? ' · all cleared' : ''}` : 'Clear the previous world to open'}
              >
                <WorldThumb world={w.id} size={on ? 52 : 42} className="map-med-pic" />
                <span className="map-med-n">{open ? w.id : <Icon name="lock" size={11} />}</span>
                {open && cleared > 0 && <span className="map-med-bar" style={{ ['--p' as string]: `${cleared * 10}%` }} />}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="map-card">
            {picked.miniIndex === 10 ? (
              <Crest world={picked.worldIndex} size={44} locked={!picked.unlocked} className="map-card-crest" />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="ui-kicker map-kicker">
                {picked.miniIndex !== 10 && <Icon name={stageTypeInfo(picked.objectiveType).icon} size={16} />}
                <span>
                  Stage {picked.id} &middot; {stageTypeInfo(picked.objectiveType).label}
                </span>
              </div>
              <div className="map-card-name">{picked.name}</div>
              <div className="map-card-desc">{picked.description}</div>
              <div className="map-card-meta">
                <span className="map-cstars" role="img" aria-label={`${picked.stars} of 3 stars`}>
                  {[1, 2, 3].map((n) => (
                    <Icon key={n} name="star" size={14} className={n <= picked.stars ? 'on' : ''} />
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
