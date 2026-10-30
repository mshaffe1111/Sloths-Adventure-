import { starsPossible } from './mapStars.ts';
import { newLookSoon } from '../game/newLookSoon.ts';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { testUnlockOn } from '../game/testUnlock.ts';
import type { LevelConfig } from '../game/types.ts';
import { WORLDS_DATA } from '../game/worldsData.ts';
import { WorldThumb, requestThumbs } from './VistaCanvas.tsx';
import { SceneBackdrop } from './title/TitleScene.tsx';
import { Plaque } from './KitParts.tsx';
import { SaveLoadDialog } from './SaveLoadDialog.tsx';
import { HeroPose } from './HeroPose.tsx';
import { Icon, KitPiece } from './icons/index.tsx';
import { Crest } from './icons/Crest.tsx';
import { stageTypeInfo } from './icons/stageTypes.ts';
import { MEECA_STAGE_ID } from '../game/extraStages.ts';
import { TRAILS, TRAILS_SIZE } from '../game/trailsData.ts';
import { trailStamps, type TrailStamp } from './mapTrail.ts';

const TRAILS_URL = new URL('../assets/ui/trails.webp', import.meta.url).href;

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
  /** Pokey's satchel: the finds, his journal, the story scenes */
  onOpenSatchel?: () => void;
  /** the card has rested on a stage that can be played: its picture sheets can be got ready (stagePreload.ts) */
  onPick?: (level: LevelConfig) => void;
}

const fmtTime = (s: number) => (s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '—');

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
  onOpenSatchel,
  onPick,
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
  // a world's first stage is open once the world is: its first in the list (World 5's is Meeca's own, 5-M, before 5-1: required)
  const firstOf = (l: LevelConfig) => l.id === worldLevels[0]?.id;
  const totalStars = levels.reduce((a, l) => a + (l.stars || 0), 0);
  const allStars = starsPossible(levels);

  const worldUnlocked = (id: number) => id === 1 || testUnlockOn() || levels.some((l) => l.worldIndex === id - 1 && l.miniIndex === 10 && l.completed);

  // which stage the card is showing: the one to play next in this world, else the last one reached
  const defaultPick = () => {
    const r = worldLevels.find((l) => l.id === resumeId);
    if (r) return r.id;
    const next = worldLevels.find((l) => (l.unlocked || firstOf(l)) && !l.completed);
    return (next ?? worldLevels[worldLevels.length - 1])?.id;
  };
  const [pickId, setPickId] = useState<string | undefined>(defaultPick);
  useEffect(() => {
    setPickId(defaultPick());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorldId]);
  const picked = worldLevels.find((l) => l.id === pickId) ?? worldLevels[0];
  // once the card has stayed on a playable stage for a moment (not while flicking through worlds), get that stage's sheets ready
  const pickedOpen = !!picked && (picked.unlocked || firstOf(picked));
  useEffect(() => {
    if (!picked || !pickedOpen || !onPick) return;
    const t = window.setTimeout(() => onPick(picked), 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked?.id, pickedOpen]);

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

  // the stages are drawn bigger when there is room between them (a portrait phone has two rows of five)
  const gap = nodes.pts.length > 1 ? Math.min(...nodes.pts.slice(1).map((p, i) => Math.hypot(p.x - nodes.pts[i].x, p.y - nodes.pts[i].y))) : 80;
  const nodeSize = nodes.wide ? Math.max(34, Math.min(46, box.w / 17)) : Math.max(36, Math.min(46, gap * 0.56));
  const bossSize = Math.round(nodeSize * 1.5);
  const badgePx = Math.max(18, Math.round(nodeSize * 0.42));
  // (each piece a little longer than the gap between them, so a rope or a chain reads as one line and stones as a row of steps)
  const trailPieces = TRAILS[activeWorldId] ?? TRAILS[1];
  const pieceLen = nodeSize * 1.15;
  const stamps = useMemo(() => trailStamps(nodes.pts, pieceLen * 0.72), [nodes, pieceLen]);
  const drawPiece = (t: TrailStamp, i: number) => {
    const f = trailPieces[t.v];
    const h = (pieceLen * f.h) / f.w;
    return (
      <g key={i} transform={`translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${t.angle.toFixed(1)})`}>
        <svg x={-pieceLen / 2} y={-h / 2} width={pieceLen} height={h} viewBox={`${f.x} ${f.y} ${f.w} ${f.h}`} preserveAspectRatio="none">
          <image href={TRAILS_URL} width={TRAILS_SIZE.w} height={TRAILS_SIZE.h} />
        </svg>
      </g>
    );
  };

  const hereIdx = worldLevels.findIndex((l) => l.id === resumeId);
  // the next stage to play in this world: it gets the pulse ring (and the boss a glow)
  const nextIdx = worldLevels.findIndex((l) => (l.unlocked || firstOf(l)) && !l.completed);

  return (
    <div className="fixed inset-0 z-40 bg-[#10241a] flex flex-col select-none font-game text-white overflow-hidden">
      <div key={activeWorldId} className="absolute inset-0 map-fade">
        <SceneBackdrop world={activeWorldId} />
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(8,20,13,.78) 0%, rgba(8,20,13,.12) 24%, rgba(8,20,13,.1) 52%, rgba(8,20,13,.82) 100%)' }} />

      {/* header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-3 sm:px-6 pt-2.5 sm:pt-4">
        <button type="button" onClick={onBackToTitle} className="ui-chip ui-chip-btn" aria-label="Back to the start screen">
          <Icon name="arrow" size={13} rotate={180} />
          Start
        </button>
        <div className="text-center min-w-0 order-3 basis-full sm:order-none sm:basis-auto">
          <div className="ui-kicker">
            World {curWorld.id} of 10
            {/* (a world still waiting on its rebuild: it plays as it is, and says its new look is on the way, newLookSoon.ts; on the kicker's
                line, where there is room both ways, so the header keeps its shape) */}
            {newLookSoon(curWorld.id) && <span className="map-soon">New look coming soon</span>}
          </div>
          {/* (a long name, World 10's, steps its lettering down so it is never cut on a phone) */}
          <Plaque as="h1" className={`map-title${curWorld.name.length > 18 ? ' long' : ''}`}>
            {curWorld.name}
          </Plaque>
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
          {onOpenSatchel && (
            <button type="button" className="ui-chip ui-chip-btn" onClick={onOpenSatchel} aria-label="Pokey's satchel">
              <Icon name="book" size={17} />
            </button>
          )}
          <span className="ui-chip" aria-label={`${totalStars} of ${allStars} stars`}>
            <Icon name="star" size={15} />
            <span className="tabular-nums">{totalStars}/{allStars}</span>
          </span>
          <button type="button" onClick={() => setSaveOpen(true)} className="ui-chip ui-chip-btn">
            Save / Load
          </button>
        </div>
      </div>
      <p className="relative z-10 text-center font-sans text-xs text-emerald-50/80 [text-shadow:0_1px_3px_rgba(0,0,0,.7)] px-4 truncate">{curWorld.subtitle}</p>

      {/* the trail */}
      <div ref={trailRef} className="relative z-10 flex-1 min-h-0">
        <svg key={activeWorldId} className="map-trail absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          {/* the road: this world's own painted pieces laid along the path (Matt, 2026-10-30: vine rope, stepping stones, glowworm
              roots, clouds, orchid stems, boardwalk, temple steps, moonlit roots, cooled lava, iron chain), in full colour where Pokey
              has been, dimmed for the road still ahead */}
          {/* (a soft shadow under the whole road so it reads on the darkest backdrops; the road ahead a little faded, never faint) */}
          <g className="map-road ahead">{stamps.filter((t) => !worldLevels[t.seg]?.completed).map(drawPiece)}</g>
          <g className="map-road">{stamps.filter((t) => worldLevels[t.seg]?.completed).map(drawPiece)}</g>
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
          const open = lvl.unlocked || firstOf(lvl);
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
                style={{ left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, ['--i' as string]: i }}
                aria-label={`Stage ${lvl.id}: ${lvl.name}, ${type.label}${lvl.completed ? `, ${lvl.stars} stars` : open ? '' : ', locked'}`}
              >
                {isBoss ? (
                  <Crest world={lvl.worldIndex} size={size} locked={!open} className="map-crest" />
                ) : (
                  <>
                    {/* an extra stage between the world's own (extraStages.ts) shows whose it is, not a number: Dot's flier, Meeca's face */}
                    {!open ? <KitPiece piece="lockBadge" width={size} className="map-lockbadge" /> : lvl.id === MEECA_STAGE_ID ? <Crest world="meeca" size={Math.round(size * 0.74)} bare /> : lvl.miniIndex > 10 ? <Icon name="hummingbird" size={Math.round(size * 0.62)} /> : <span>{lvl.miniIndex}</span>}
                    <span className="map-tbadge" style={{ width: badgePx, height: badgePx }} title={type.label}>
                      <Icon name={type.icon} size={Math.round(badgePx * 0.78)} />
                    </span>
                  </>
                )}
              </button>
              {open && lvl.completed && (
                <div className="map-stars" style={{ left: p.x - 20, top: p.y + size / 2 + (sel ? 6 : 2) }} aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <KitPiece key={n} piece={n <= lvl.stars ? 'starFull' : 'starEmpty'} width={11} className={n <= lvl.stars ? 'ic on' : 'ic'} />
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
            {picked.unlocked || firstOf(picked) ? (
              <button type="button" className="gx-plank gx-plank-gold map-play" onClick={() => onSelectLevel(picked)} data-start="true">
                <Icon name="play" size={18} />
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
