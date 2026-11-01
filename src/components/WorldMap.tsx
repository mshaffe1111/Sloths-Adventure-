import { TextGlyph } from './icons/TextGlyph.tsx';
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
import { KitPiece } from './icons/index.tsx';
import { PaintedIcon, paint } from './icons/PaintedIcon.tsx';
import { Crest } from './icons/Crest.tsx';
import { stageTypeInfo } from './icons/stageTypes.ts';
import { MEECA_STAGE_ID } from '../game/extraStages.ts';
import { TRAILS, TRAILS_SIZE } from '../game/trailsData.ts';
import { trailStamps, type TrailStamp } from './mapTrail.ts';
import { BackButton, CornerToken, LeafButton, Popup } from './nav/Nav.tsx';
import { HowToPlay } from './HowToPlay.tsx';
import { TitleSettings } from './TitleSettings.tsx';
import './nav/worldMap.css';

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
  isMuted: boolean;
  onToggleMute: () => void;
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
  isMuted,
  onToggleMute,
}) => {
  const [activeWorldId, setActiveWorldId] = useState<number>(selectedWorldId);
  const [saveOpen, setSaveOpen] = useState(false);
  const [worldsOpen, setWorldsOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // a locked world says why when tapped (a disabled button gives no feedback on a phone)
  const [lockedMsg, setLockedMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!lockedMsg) return;
    const t = window.setTimeout(() => setLockedMsg(null), 2200);
    return () => window.clearTimeout(t);
  }, [lockedMsg]);
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
        pts.push({ x: padX + t * (w - padX * 2), y: h * 0.56 + Math.sin(i * 0.95 + 0.5) * h * 0.17 });
      }
    } else {
      // upright: three rows (4/3/3 for ten stages, Matt 2026-11-01), winding back and forth so the trail fills the screen
      const rows = 3;
      const sizes = Array.from({ length: rows }, (_, r) => Math.floor(n / rows) + (r < n % rows ? 1 : 0));
      const ys = [0.17, 0.5, 0.83];
      let i = 0;
      sizes.forEach((k, row) => {
        // a shorter row sits a little in from the edges, so the turns between rows stay gentle
        const inset = k < sizes[0] ? (w - padX * 2) / (sizes[0] - 1) / 2 : 0;
        for (let col = 0; col < k; col++, i++) {
          const c = row % 2 === 0 ? col : k - 1 - col;
          const x = padX + inset + (k > 1 ? (c / (k - 1)) * (w - padX * 2 - inset * 2) : (w - padX * 2) / 2);
          pts.push({ x, y: h * ys[row] + Math.sin(col * 1.3 + row) * h * 0.035 });
        }
      });
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

  const go = (dir: -1 | 1) => {
    // the arrows step to the next open world, or say why the next one is shut
    const id = activeWorldId + dir;
    if (id < 1 || id > WORLDS_DATA.length) return;
    pickWorld(id);
  };
  const pickWorld = (id: number) => {
    if (!worldUnlocked(id)) {
      setLockedMsg(`Beat World ${id - 1}'s boss to open World ${id}`);
      return;
    }
    setActiveWorldId(id);
    onSelectWorld(id);
  };
  const cleared = worldLevels.filter((l) => l.completed).length;
  const worldStars = worldLevels.reduce((a, l) => a + (l.stars || 0), 0);

  return (
    <div className="wm fixed inset-0 z-40 bg-[#10241a] flex flex-col select-none font-game text-white overflow-hidden">
      <div key={activeWorldId} className="absolute inset-0 map-fade">
        <SceneBackdrop world={activeWorldId} />
      </div>
      <div className="absolute inset-0 pointer-events-none wm-shade" />

      {/* the screen's way back, always top-left (nav/Nav.tsx); Settings top-right, as on the title */}
      <BackButton to="Start Screen" onBack={onBackToTitle} />
      <div className="wm-corner">
        <CornerToken icon="gear" label="Settings" onClick={() => setSettingsOpen(true)} />
      </div>

      {/* the world: its carved name between two big leaf arrows, and how far Pokey has got in it */}
      <header className="wm-head">
        <button type="button" className="wm-arrow" onClick={() => go(-1)} disabled={activeWorldId <= 1} aria-label="Previous world">
          <PaintedIcon name="back" size={28} />
        </button>
        <button type="button" className="wm-name" onClick={() => setWorldsOpen(true)} aria-label={`World ${curWorld.id}, ${curWorld.name}. Choose a world`}>
          <span className="wm-kick">
            World {curWorld.id} of {WORLDS_DATA.length}
            {newLookSoon(curWorld.id) && <span className="map-soon">New look coming soon</span>}
          </span>
          <Plaque as="h1" className={`wm-plaque${curWorld.name.length > 18 ? ' long' : ''}`}>
            {curWorld.name}
          </Plaque>
          <span className="wm-prog">
            <span className="wm-prog-w">World {curWorld.id} of {WORLDS_DATA.length}</span>
            <span>
              <TextGlyph name="check" size={16} /> {cleared} of {worldLevels.length} cleared
            </span>
            <span>
              <PaintedIcon name="star" size={17} /> {worldStars}/{worldLevels.length * 3}
            </span>
            {thornHeart && (
              <span title="Thorn Heart: +1 max heart">
                <PaintedIcon name="thornHeart" size={17} /> +1
              </span>
            )}
          </span>
        </button>
        <button type="button" className="wm-arrow" onClick={() => go(1)} disabled={activeWorldId >= WORLDS_DATA.length} aria-label="Next world" data-locked={worldUnlocked(activeWorldId + 1) ? undefined : 'true'}>
          {worldUnlocked(activeWorldId + 1) || activeWorldId >= WORLDS_DATA.length ? <PaintedIcon name="back" size={28} className="pic-flip" /> : <PaintedIcon name="lock" size={24} />}
        </button>
      </header>

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
                    {!open ? <KitPiece piece="lockBadge" width={size} className="map-lockbadge" /> : lvl.id === MEECA_STAGE_ID ? <Crest world="meeca" size={Math.round(size * 0.74)} bare /> : lvl.miniIndex > 10 ? <PaintedIcon name="pouch" size={Math.round(size * 0.62)} /> : <span>{lvl.miniIndex}</span>}
                    <span className="map-tbadge" style={{ width: badgePx, height: badgePx }} title={type.label}>
                      <PaintedIcon name={paint(type.icon)} size={Math.round(badgePx * 0.95)} />
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

      {/* the foot: the picked stage's card, and the big labelled ways on (the title's leaf tokens) */}
      <div className="wm-foot">
        {picked && (
          <div className="wm-card">
            {picked.miniIndex === 10 && <Crest world={picked.worldIndex} size={50} locked={!pickedOpen} className="map-card-crest" />}
            <div className="min-w-0 flex-1">
              <div className="wm-card-k">
                {picked.miniIndex !== 10 && <PaintedIcon name={paint(stageTypeInfo(picked.objectiveType).icon)} size={20} />}
                <span>
                  Stage {picked.id} &middot; {stageTypeInfo(picked.objectiveType).label}
                </span>
              </div>
              <div className="wm-card-name">{picked.name}</div>
              {pickedOpen && <div className="wm-card-desc">{picked.description}</div>}
              {pickedOpen ? (
                <div className="wm-card-meta">
                  <span className="map-cstars" role="img" aria-label={`${picked.stars} of 3 stars`}>
                    {[1, 2, 3].map((n) => (
                      <PaintedIcon key={n} name="star" size={19} className={n <= picked.stars ? 'on' : 'pic-off'} />
                    ))}
                  </span>
                  {picked.completed && <span>Best {fmtTime(picked.bestTime)}</span>}
                  {picked.completed && picked.highScore > 0 && <span>{picked.highScore.toLocaleString()} pts</span>}
                </div>
              ) : (
                <div className="wm-card-lock">
                  <PaintedIcon name="lock" size={17} /> Clear the stage before it to open this one
                </div>
              )}
            </div>
            {pickedOpen && (
              <button type="button" className="gx-plank gx-plank-gold wm-play" onClick={() => onSelectLevel(picked)} data-start="true">
                <PaintedIcon name="play" size={24} />
                {picked.completed ? 'Replay' : 'Play'}
              </button>
            )}
          </div>
        )}
        <nav className="wm-leaves" aria-label="More">
          <LeafButton icon="compass" name="Worlds" onClick={() => setWorldsOpen(true)} />
          {onOpenSatchel && <LeafButton icon="satchel" name="Satchel" onClick={onOpenSatchel} />}
          <LeafButton icon="bulb" name="How to Play" onClick={() => setHowOpen(true)} />
        </nav>
      </div>

      {lockedMsg && (
        <div className="wm-toast" role="status">
          <PaintedIcon name="lock" size={19} />
          {lockedMsg}
        </div>
      )}

      {worldsOpen && (
        <Popup title="Worlds" label="Choose a world" onClose={() => setWorldsOpen(false)} wide kicker={`${totalStars} of ${allStars} stars in all`}>
          <div className="wm-worlds">
            {WORLDS_DATA.map((w) => {
              const open = worldUnlocked(w.id);
              const done = levels.filter((l) => l.worldIndex === w.id && l.completed).length;
              const all = levels.filter((l) => l.worldIndex === w.id).length || 10;
              return (
                <button
                  key={w.id}
                  type="button"
                  className={`wm-world${w.id === activeWorldId ? ' on' : ''}${open ? '' : ' locked'}`}
                  aria-current={w.id === activeWorldId ? 'true' : undefined}
                  onClick={() => {
                    if (!open) return pickWorld(w.id);
                    pickWorld(w.id);
                    setWorldsOpen(false);
                  }}
                >
                  <Crest world={w.id} size={62} locked={!open} className="wm-world-pic" />
                  <span className="wm-world-t">
                    <small>World {w.id}</small>
                    <b>{w.name}</b>
                    <i>{open ? (done >= all ? 'All cleared!' : `${done} of ${all} cleared`) : `Beat World ${w.id - 1}'s boss`}</i>
                  </span>
                  {!open && <PaintedIcon name="lock" size={24} />}
                  {open && done >= all && <PaintedIcon name="crown" size={24} />}
                </button>
              );
            })}
          </div>
          {secretFound && onPlaySecret && (
            <button type="button" className="st-btn wm-secret" onClick={onPlaySecret}>
              <PaintedIcon name="leaf" size={22} /> Thornbark's Hollow
            </button>
          )}
        </Popup>
      )}
      {howOpen && <HowToPlay onClose={() => setHowOpen(false)} />}
      {settingsOpen && (
        <TitleSettings
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onClose={() => setSettingsOpen(false)}
          onSaveLoad={() => setSaveOpen(true)}
          onStartScreen={onBackToTitle}
          onOpenTrophies={onOpenTrophies}
          updated={null}
        />
      )}
      {saveOpen && <SaveLoadDialog onClose={() => setSaveOpen(false)} onLoaded={onSaveLoaded} />}
    </div>
  );
};
