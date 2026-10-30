/**
 * The game's one icon set. Every glyph is hand-built on a 24x24 grid in the same house style as the stage-cleared card:
 * a warm fill, a darker outline of the same hue, chunky rounded strokes and a little highlight. Nothing here depends on
 * a phone's emoji font, so the icons look the same on every device and sit comfortably next to the painted art.
 *
 *   <Icon name="star" size={20} />                      decorative (aria-hidden)
 *   <Icon name="lock" size={20} label="Locked" />       the icon alone carries the meaning, so it gets a name
 *
 * `arrow`, `check` and `cross` are interface glyphs: they draw in the surrounding text colour (currentColor) so they sit
 * on a gold button as well as on a green one. `rotate` turns any icon (an arrow pointing left is `rotate={180}`).
 * The painted creature crests live in ./Crest.tsx, and which glyph goes with which stage type in ./stageTypes.ts.
 *
 * Painted (menu kit option A, Matt 2026-10-30): every icon that has a painted version in the kit (src/assets/ui/ui-kit.webp, Hugging
 * Face takes in the style of the game's art) draws that instead of the vector glyph, so the start screen, Settings, Stage Cleared
 * and the map are one set. It is still an <svg> of the asked size (its viewBox is the icon's square in the kit sheet), so every rule
 * that sizes or shades `.ic` or `svg` keeps working. arrow, check and cross stay vector: they take the colour of the text around them.
 */
import React from 'react';
import { UI_KIT, UI_KIT_SIZE } from '../../game/uiKitData.ts';

export type IconName =
  // the general set
  | 'lock' | 'star' | 'heart' | 'thornHeart' | 'trophy' | 'book' | 'scroll' | 'map' | 'leaf' | 'flower' | 'sparkle' | 'note'
  | 'shield' | 'swords' | 'boot' | 'key' | 'bolt' | 'paw' | 'magnet' | 'bulb' | 'compass' | 'crown' | 'check' | 'cross' | 'arrow'
  // a few more the menus and badges need
  | 'medal' | 'burst' | 'ghost' | 'sloth' | 'hummingbird' | 'cage'
  // the title and the menus (2026-10-28): sound, full screen, settings, the cards, play, restart, save
  | 'speaker' | 'mute' | 'expand' | 'shrink' | 'gear' | 'cards' | 'play' | 'restart' | 'save'
  // the nine stage types (a boss stage is shown by its painted crest; `boss` is the plain heraldic stand-in)
  | 'sprint' | 'harvest' | 'purge' | 'ascent' | 'stealth' | 'vine' | 'relic' | 'rescue' | 'gauntlet' | 'boss';

export interface IconProps {
  name: IconName;
  /** pixels, or any CSS length such as "1em" (default 24) */
  size?: number | string;
  /** a spoken name; without one the icon is decorative and hidden from screen readers */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  /** degrees, clockwise */
  rotate?: number;
}

// ---- the palette: [fill, outline, highlight] per colour family ----
const GOLD = { f: '#fbbf24', o: '#92400e', h: '#fde68a' };
const PINK = { f: '#f472b6', o: '#9d174d', h: '#fbcfe8' };
const VIOLET = { f: '#a78bfa', o: '#5b21b6', h: '#ddd6fe' };
const GREEN = { f: '#4ade80', o: '#166534', h: '#bbf7d0' };
const MINT = { f: '#34d399', o: '#065f46', h: '#a7f3d0' };
const ORANGE = { f: '#fb923c', o: '#9a3412', h: '#fed7aa' };
const PEACH = { f: '#fdba74', o: '#9a3412', h: '#ffedd5' };
const SKY = { f: '#60a5fa', o: '#1e3a8a', h: '#bfdbfe' };
const CYAN = { f: '#22d3ee', o: '#155e75', h: '#cffafe' };
const RED = { f: '#f87171', o: '#991b1b', h: '#fecaca' };
const STEEL = { f: '#cbd5e1', o: '#475569', h: '#f1f5f9' };
const WOOD = { f: '#b98a52', o: '#5d3f1b', h: '#e3c08c' };
const PAPER = { f: '#fef3c7', o: '#92400e', h: '#ffffff' };

const W = 1.7; // outline weight on the 24-unit grid: still a clear line at 14px
const base = { strokeWidth: W, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

/** a path drawn as an outlined shape */
const shape = (d: string, c: { f: string; o: string }, extra?: React.SVGProps<SVGPathElement>) => <path d={d} fill={c.f} stroke={c.o} {...base} {...extra} />;
/** a stroke with a dark edge: draw the outline wide, then the colour narrower on top */
const tube = (d: string, c: { f: string; o: string }, w = 3, key?: string) => (
  <g key={key}>
    <path d={d} fill="none" stroke={c.o} strokeWidth={w + W * 1.3} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={c.f} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const shine = (d: string, c = '#ffffff', o = 0.75, w = 1.3) => <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" opacity={o} />;

// five petals around a middle: one path, so the outline can be drawn once around the whole bloom
const petals = (cx: number, cy: number, ring: number, r: number, n = 5, start = -90) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((start + (360 / n) * i) * Math.PI) / 180;
    const x = cx + Math.cos(a) * ring;
    const y = cy + Math.sin(a) * ring;
    d += `M${(x + r).toFixed(2)} ${y.toFixed(2)}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0z`;
  }
  return d;
};

// a sword pointing up, centred on x=12: used twice, turned, for the crossed swords
const sword = (rot: number, key: string) => (
  <g key={key} transform={`rotate(${rot} 12 12)`}>
    {shape('M12 1.4l2.3 2.4v9.5H9.7V3.8z', STEEL)}
    {shape('M7.6 13.3h8.8v2.2H7.6z', GOLD)}
    {shape('M10.9 15.5h2.2v3.8h-2.2z', WOOD)}
    <circle cx="12" cy="20.4" r="1.45" fill={GOLD.f} stroke={GOLD.o} strokeWidth={1.4} />
  </g>
);

const ART: Record<IconName, React.ReactNode> = {
  lock: (
    <>
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke={STEEL.o} strokeWidth={4.1} strokeLinecap="round" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke={STEEL.f} strokeWidth={2} strokeLinecap="round" />
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.8" fill={GOLD.f} stroke={GOLD.o} {...base} />
      {shine('M7 13.4h2.4', GOLD.h, 0.9)}
      <circle cx="12" cy="15" r="1.7" fill={GOLD.o} />
      <path d="M12 15.5v2.6" stroke={GOLD.o} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  star: (
    <>
      {shape('M12 2.6l2.8 5.9 6.4.9-4.7 4.5 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.4l6.4-.9z', GOLD)}
      {shine('M7.2 9.9l2.6-.4', '#fff7d6', 0.9)}
    </>
  ),
  heart: (
    <>
      {shape('M12 20.6C5 15.6 2.4 11.6 2.4 8.1a4.9 4.9 0 0 1 9.6-1.5 4.9 4.9 0 0 1 9.6 1.5c0 3.5-2.6 7.5-9.6 12.5z', PINK)}
      {shine('M5.3 8a2.5 2.5 0 0 1 2.4-2.1', PINK.h, 0.95, 1.5)}
    </>
  ),
  thornHeart: (
    <>
      {shape('M4.2 5.4 2.4 3.2 6.1 4.4zM19.8 5.4l1.8-2.2-3.7 1.2zM3 13.4 1.2 14.9l2.7-.4zM21 13.4l1.8 1.5-2.7-.4zM12 22.8l-1.4-2.4h2.8z', VIOLET, { strokeWidth: 1.2 })}
      {shape('M12 20.2C5.3 15.4 2.9 11.5 2.9 8.2a4.6 4.6 0 0 1 9.1-1.4 4.6 4.6 0 0 1 9.1 1.4c0 3.3-2.4 7.2-9.1 12z', VIOLET)}
      {shine('M5.6 8.1a2.3 2.3 0 0 1 2.2-2', VIOLET.h, 0.95, 1.5)}
    </>
  ),
  trophy: (
    <>
      <path d="M7 5.4H3.8v1.9a3.5 3.5 0 0 0 3.7 3.4M17 5.4h3.2v1.9a3.5 3.5 0 0 1-3.7 3.4" fill="none" stroke={GOLD.o} strokeWidth={2.9} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5.4H3.8v1.9a3.5 3.5 0 0 0 3.7 3.4M17 5.4h3.2v1.9a3.5 3.5 0 0 1-3.7 3.4" fill="none" stroke={GOLD.f} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
      {shape('M7 3.2h10v6.3a5 5 0 0 1-10 0z', GOLD)}
      {shape('M10.6 14.2h2.8v3.3h-2.8z', GOLD, { fill: '#d97706' })}
      {shape('M7.8 17.5h8.4a1 1 0 0 1 1 1v1.9H6.8v-1.9a1 1 0 0 1 1-1z', GOLD, { fill: '#d97706' })}
      {shine('M9.4 5.4v3.6', GOLD.h, 0.95, 1.4)}
    </>
  ),
  book: (
    <>
      {shape('M2.8 5.6c3-1.3 6.2-1.1 9.2.9v13c-3-2-6.2-2.2-9.2-.9z', PAPER)}
      {shape('M21.2 5.6c-3-1.3-6.2-1.1-9.2.9v13c3-2 6.2-2.2 9.2-.9z', PAPER)}
      {shine('M5.2 9.1c1.6-.3 3.2-.2 4.7.5M5.2 12.4c1.6-.3 3.2-.2 4.7.5M14.1 9.6c1.5-.7 3.1-.8 4.7-.5M14.1 12.9c1.5-.7 3.1-.8 4.7-.5', '#d6a756', 1, 1.2)}
    </>
  ),
  scroll: (
    <>
      {shape('M6.4 5.5h11.2v13H6.4z', PAPER)}
      {shine('M9 9.4h6M9 12.2h6M9 15h3.6', '#d6a756', 1, 1.3)}
      {shape('M6 2.8h12a1.9 1.9 0 0 1 0 3.8H6a1.9 1.9 0 0 1 0-3.8z', PAPER, { fill: '#f6d78a' })}
      {shape('M6 17.4h12a1.9 1.9 0 0 1 0 3.8H6a1.9 1.9 0 0 1 0-3.8z', PAPER, { fill: '#f6d78a' })}
    </>
  ),
  map: (
    <>
      {shape('M3 6.6l6-2.4 6 2.4 6-2.4v13.2l-6 2.4-6-2.4-6 2.4z', PAPER, { fill: '#fde68a' })}
      {shine('M9 4.4v13.2M15 7v13.2', '#d6a756', 1, 1.3)}
      <path d="M16.6 10.4l3 3m0-3l-3 3" stroke="#dc2626" strokeWidth={1.9} strokeLinecap="round" />
    </>
  ),
  leaf: (
    <>
      {shape('M20.2 3.8C10.4 3.4 4.2 8.6 4.2 14.4c0 2 .8 3.8 2.2 5 6.6.1 14.2-4.4 13.8-15.6z', GREEN)}
      <path d="M4.6 20.4C8 14.6 12 11 16.4 8.8" fill="none" stroke={GREEN.o} strokeWidth={1.6} strokeLinecap="round" />
      {shine('M9.4 8.4c2.2-1.2 4.6-1.7 7-1.6', GREEN.h, 0.8, 1.3)}
    </>
  ),
  flower: (
    <>
      <path d={petals(12, 12, 5.4, 3.7)} fill="none" stroke={PINK.o} strokeWidth={W + 2.4} strokeLinejoin="round" />
      <path d={petals(12, 12, 5.4, 3.7)} fill={PINK.f} stroke="none" />
      <circle cx="12" cy="12" r="3.1" fill={GOLD.f} stroke={GOLD.o} strokeWidth={1.5} />
      {shine('M10.7 11.2a1.5 1.5 0 0 1 1.1-.7', '#fff7d6', 0.95, 1.1)}
    </>
  ),
  sparkle: (
    <>
      {shape('M12 2.4c.8 5.2 2.9 7.3 8.6 9.6-5.7 2.3-7.8 4.4-8.6 9.6-.8-5.2-2.9-7.3-8.6-9.6C9.1 9.7 11.2 7.6 12 2.4z', GOLD, { fill: '#fde047' })}
      {shape('M19.4 2.8l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7z', GOLD, { strokeWidth: 1.2 })}
    </>
  ),
  note: (
    <>
      {shape('M9 6.2l10.4-2v3.5L9 9.7z', SKY)}
      <path d="M9 7.5v10.4M19.4 5.9v9.6" stroke={SKY.o} strokeWidth={2.1} strokeLinecap="round" fill="none" />
      <ellipse cx="6.6" cy="18.2" rx="3" ry="2.4" transform="rotate(-18 6.6 18.2)" fill={SKY.f} stroke={SKY.o} strokeWidth={1.6} />
      <ellipse cx="17" cy="16.2" rx="3" ry="2.4" transform="rotate(-18 17 16.2)" fill={SKY.f} stroke={SKY.o} strokeWidth={1.6} />
    </>
  ),
  shield: (
    <>
      {shape('M12 2.6l7.6 2.6v6.3c0 4.7-3.2 8.2-7.6 10-4.4-1.8-7.6-5.3-7.6-10V5.2z', SKY)}
      <path d="M12 2.6v18.9c-4.4-1.8-7.6-5.3-7.6-10V5.2z" fill={SKY.h} opacity={0.55} />
      <path d="M12 2.6l7.6 2.6v6.3c0 4.7-3.2 8.2-7.6 10-4.4-1.8-7.6-5.3-7.6-10V5.2z" fill="none" stroke={SKY.o} {...base} />
      {shape('M12 7.4l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z', GOLD, { strokeWidth: 1.1 })}
    </>
  ),
  swords: <>{sword(-45, 'a')}{sword(45, 'b')}</>,
  boot: (
    <>
      {shape('M6.6 2.8h7.6v8.2l5.2 2.4a3.4 3.4 0 0 1 2 3.1v1.6H6.6z', WOOD)}
      {shape('M6.6 2.8h7.6v3.6H6.6z', WOOD, { fill: WOOD.h })}
      {shape('M5.4 17.9h16.4a.9.9 0 0 1 .9.9v1.5a.9.9 0 0 1-.9.9H5.4a.9.9 0 0 1-.9-.9v-1.5a.9.9 0 0 1 .9-.9z', WOOD, { fill: '#7c5a2e' })}
      {shine('M16.2 14.7l2.1 1', WOOD.h, 0.9, 1.2)}
    </>
  ),
  key: (
    <>
      {tube('M10.9 11.1 19.8 20M16.4 16.6l2.5-2.5M19 19.2l1.7-1.7', GOLD, 2.3, 'shaft')}
      <circle cx="8" cy="8" r="5" fill={GOLD.f} stroke={GOLD.o} {...base} />
      <circle cx="6.9" cy="6.9" r="1.7" fill={GOLD.o} />
      {shine('M10.6 5.3a3.2 3.2 0 0 1 1.5 1.9', GOLD.h, 0.95, 1.3)}
    </>
  ),
  bolt: (
    <>
      {shape('M14 2L4.6 13.4h6.1L9.6 22l9.8-12.2h-6.4z', GOLD)}
      {shine('M12.9 5.6 8.6 10.8', '#fff7d6', 0.9, 1.3)}
    </>
  ),
  paw: (
    <>
      {shape('M12 12.2c-3 0-5.6 2.5-5.6 5.2 0 1.9 1.5 2.9 3 2.9 1 0 1.7-.5 2.6-.5s1.6.5 2.6.5c1.5 0 3-1 3-2.9 0-2.7-2.6-5.2-5.6-5.2z', PEACH)}
      {shape('M5.4 9.3a1.9 2.5 0 1 0 .1 0zM9.2 4.9a1.9 2.5 0 1 0 .1 0zM14.8 4.9a1.9 2.5 0 1 0 .1 0zM18.6 9.3a1.9 2.5 0 1 0 .1 0z', PEACH, { strokeWidth: 1.5 })}
    </>
  ),
  magnet: (
    <>
      {shape('M4.8 3.4h5v8.1a2.2 2.2 0 0 0 4.4 0V3.4h5v8.1a7.2 7.2 0 0 1-14.4 0z', RED)}
      {shape('M4.8 3.4h5v4.2h-5zM14.2 3.4h5v4.2h-5z', STEEL)}
      {shine('M7.3 11v2.2', RED.h, 0.9, 1.4)}
    </>
  ),
  bulb: (
    <>
      {shape('M12 2.4a6.4 6.4 0 0 0-3.9 11.5c.8.6 1.3 1.4 1.3 2.4v.7h5.2v-.7c0-1 .5-1.8 1.3-2.4A6.4 6.4 0 0 0 12 2.4z', GOLD, { fill: '#fde047' })}
      {shape('M9.4 17.4h5.2v1.9a1.4 1.4 0 0 1-1.4 1.4h-2.4a1.4 1.4 0 0 1-1.4-1.4z', STEEL)}
      {shine('M8.6 7.6A3.6 3.6 0 0 1 11 5.3', '#fffbe0', 0.95, 1.4)}
      <path d="M10.4 12.9 12 10.5l1.6 2.4" fill="none" stroke={GOLD.o} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9.4" fill={PAPER.f} stroke={GOLD.o} strokeWidth={1.8} />
      <circle cx="12" cy="12" r="9.4" fill="none" stroke={GOLD.f} strokeWidth={0.9} opacity={0.9} />
      {shape('M16.2 7.8l-2.2 6.2L7.8 16.2 10 10z', RED, { strokeWidth: 1.3 })}
      {shape('M7.8 16.2l2.2-6.2 4 4z', STEEL, { strokeWidth: 1.3 })}
      <circle cx="12" cy="12" r="1.1" fill={GOLD.o} />
    </>
  ),
  crown: (
    <>
      {shape('M3.2 17.2 2.4 7.4l5.2 4.2L12 4.4l4.4 7.2 5.2-4.2-.8 9.8z', GOLD)}
      {shape('M3.4 17.2h17.2v3.2H3.4z', GOLD, { fill: '#f59e0b' })}
      <circle cx="12" cy="9.9" r="1.3" fill={RED.f} stroke={RED.o} strokeWidth={1} />
      <circle cx="6.3" cy="12.8" r="1" fill={SKY.f} stroke={SKY.o} strokeWidth={0.9} />
      <circle cx="17.7" cy="12.8" r="1" fill={SKY.f} stroke={SKY.o} strokeWidth={0.9} />
    </>
  ),
  check: <path d="M4.8 12.6l4.8 4.8 9.6-10.2" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />,
  cross: <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" />,
  arrow: <path d="M4.5 12h14M12.5 5.5 19 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />,

  speaker: (
    <>
      {shape('M3.4 9.2h3.8l5-4.2v14l-5-4.2H3.4z', WOOD, { fill: '#f6d78a', stroke: '#7c4a1c' })}
      {tube('M15.4 8.6a4.6 4.6 0 0 1 0 6.8', SKY, 1.9, 'a')}
      {tube('M18.2 5.8a8.6 8.6 0 0 1 0 12.4', SKY, 1.9, 'b')}
      {shine('M5 10.8v1.6', '#fff7d6', 0.9)}
    </>
  ),
  mute: (
    <>
      {shape('M3.4 9.2h3.8l5-4.2v14l-5-4.2H3.4z', WOOD, { fill: '#f6d78a', stroke: '#7c4a1c' })}
      {tube('M15.6 9.2l5 5.6M20.6 9.2l-5 5.6', RED, 2.1)}
    </>
  ),
  expand: (
    <>
      {tube('M3.8 9V3.8H9M15 3.8h5.2V9M3.8 15v5.2H9M20.2 15v5.2H15', GOLD, 2.4)}
    </>
  ),
  shrink: (
    <>
      {tube('M9 3.8V9H3.8M15 3.8V9h5.2M9 20.2V15H3.8M15 20.2V15h5.2', GOLD, 2.4)}
    </>
  ),
  gear: (
    <>
      {shape('M10.3 2.6h3.4l.5 2.5 1.8.8 2.1-1.4 2.4 2.4-1.4 2.1.8 1.8 2.5.5v3.4l-2.5.5-.8 1.8 1.4 2.1-2.4 2.4-2.1-1.4-1.8.8-.5 2.5h-3.4l-.5-2.5-1.8-.8-2.1 1.4-2.4-2.4 1.4-2.1-.8-1.8-2.5-.5v-3.4l2.5-.5.8-1.8-1.4-2.1 2.4-2.4 2.1 1.4 1.8-.8z', WOOD)}
      <circle cx="12" cy="12" r="3.3" fill="#f6d78a" stroke={WOOD.o} strokeWidth={1.6} />
      {shine('M8.2 7.2l1.4-.7', WOOD.h, 0.95, 1.4)}
    </>
  ),
  cards: (
    <>
      {shape('M4.2 6.6l7.4-2.2 3.6 12.4-7.4 2.2z', PAPER, { fill: '#bbf7d0', stroke: GREEN.o })}
      {shape('M10.6 4.4h8a1.6 1.6 0 0 1 1.6 1.6v13a1.6 1.6 0 0 1-1.6 1.6h-8A1.6 1.6 0 0 1 9 19V6a1.6 1.6 0 0 1 1.6-1.6z', PAPER)}
      {shape('M12 7.4h5.2v5.4H12z', ORANGE, { strokeWidth: 1.2, fill: '#fdba74' })}
      {shine('M12 15.4h5.2M12 17.6h3.4', '#d6a756', 1, 1.2)}
    </>
  ),
  play: <path d="M7.4 4.6v14.8l12-7.4z" fill="currentColor" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />,
  restart: (
    <>
      {tube('M19.4 12.6A7.4 7.4 0 1 1 16.6 6.2', MINT, 2.4)}
      {shape('M14.2 2.8l5.6 1.8-2.6 5z', MINT, { strokeWidth: 1.3 })}
    </>
  ),
  save: (
    <>
      {shape('M4 4.4h12.6l3.4 3.4v11.8H4z', SKY)}
      {shape('M7.2 4.4h8v4.8h-8z', PAPER, { strokeWidth: 1.3 })}
      {shape('M7 13.2h10v6.4H7z', PAPER, { strokeWidth: 1.3 })}
      {shine('M9 15.6h6M9 17.6h4', '#d6a756', 1, 1.1)}
    </>
  ),

  medal: (
    <>
      <path d="M7.4 2.4h4l1.4 6.2-3.2.7zM16.6 2.4h-4l-1.4 6.2 3.2.7z" fill={RED.f} stroke={RED.o} {...base} strokeWidth={1.4} />
      <circle cx="12" cy="15" r="6.6" fill={GOLD.f} stroke={GOLD.o} {...base} />
      <circle cx="12" cy="15" r="4" fill="none" stroke={GOLD.o} strokeWidth={1.2} opacity={0.7} />
      {shape('M12 11.9l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z', GOLD, { fill: '#fff7d6', strokeWidth: 1 })}
    </>
  ),
  burst: (
    <>
      {shape('M12 1.8l2.3 5.1 5.4-2-2 5.4 5.1 2.5-5.1 2.5 2 5.4-5.4-2L12 22.2l-2.3-5.1-5.4 2 2-5.4L1.2 11.2l5.1-2.5-2-5.4 5.4 2z', ORANGE, { fill: '#fb923c' })}
      {shape('M12 7.2l1.2 2.7 2.9.3-2.2 2 .6 2.9-2.5-1.5-2.5 1.5.6-2.9-2.2-2 2.9-.3z', GOLD, { strokeWidth: 1.2 })}
    </>
  ),
  ghost: (
    <>
      {shape('M12 2.8a7.2 7.2 0 0 0-7.2 7.2v10.2l2.4-1.9 2.4 1.9 2.4-1.9 2.4 1.9 2.4-1.9 2.4 1.9V10A7.2 7.2 0 0 0 12 2.8z', STEEL, { fill: '#e2e8f0' })}
      <ellipse cx="9.2" cy="10.4" rx="1.4" ry="1.8" fill="#334155" />
      <ellipse cx="14.8" cy="10.4" rx="1.4" ry="1.8" fill="#334155" />
      {shine('M7.6 6.4a5.4 5.4 0 0 1 3-1.6', '#ffffff', 0.95, 1.4)}
    </>
  ),
  sloth: (
    <>
      {shape('M12 3.4c5 0 8.6 3.3 8.6 8 0 4.9-3.7 8.4-8.6 8.4s-8.6-3.5-8.6-8.4c0-4.7 3.6-8 8.6-8z', WOOD, { fill: '#c99a62' })}
      {shape('M12 7.2c3.7 0 6.1 2 6.1 5s-2.4 5.6-6.1 5.6-6.1-2.6-6.1-5.6 2.4-5 6.1-5z', PAPER, { fill: '#f3e1bd', strokeWidth: 1.3, stroke: '#7c5a2e' })}
      <path d="M5.2 9.6c1.5.7 3 2 3.6 4M18.8 9.6c-1.5.7-3 2-3.6 4" fill="none" stroke="#5d3f1b" strokeWidth={2.6} strokeLinecap="round" />
      <circle cx="8.9" cy="12" r="1.2" fill="#2b1a0a" />
      <circle cx="15.1" cy="12" r="1.2" fill="#2b1a0a" />
      <path d="M10.9 14.3h2.2l-1.1 1.2z" fill="#2b1a0a" stroke="#2b1a0a" strokeWidth={1} strokeLinejoin="round" />
      <path d="M10.2 16.4c1 .7 2.6.7 3.6 0" fill="none" stroke="#7c5a2e" strokeWidth={1.2} strokeLinecap="round" />
    </>
  ),
  hummingbird: (
    <>
      {shape('M3.2 20.6 9.4 14.4 8 9.8c-.5-2.5 1-4.6 3.5-4.8 2.4-.2 4.4 1.5 4.7 3.6l.4 2.3-3.6 3.9z', GREEN)}
      {shape('M13 6.2C14 3.6 17 2.8 19.4 4.6c-2.2.2-3.6 1.3-4 3.3z', MINT)}
      {shape('M16 7.6l5.6-1.6-4.4 3.3', GOLD, { strokeWidth: 1.3 })}
      <circle cx="12.8" cy="8" r="1" fill="#14301f" />
      {shape('M9.6 14.2c-.6-3.4-3.4-5.9-6.8-5.9 1 4.4 3.6 6.5 6.8 5.9z', MINT, { fill: '#6ee7b7' })}
    </>
  ),
  cage: (
    <>
      <path d="M12 2.2v2.2" stroke={GOLD.o} strokeWidth={2} strokeLinecap="round" />
      {shape('M4.8 20.4V11a7.2 7.2 0 0 1 14.4 0v9.4z', GOLD, { fill: '#fde68a' })}
      <path d="M9.4 4.6v15.8M14.6 4.6v15.8M4.8 12.4h14.4" stroke={GOLD.o} strokeWidth={1.5} fill="none" />
      {shape('M3.2 20.4h17.6v1.8H3.2z', GOLD, { fill: '#d97706' })}
    </>
  ),

  // ---- the nine stage types ----
  sprint: (
    <>
      {shape('M15.6 2.4 8 12.2h5.2l-1.2 7.4 8.2-10.2H15z', GOLD)}
      <path d="M2.6 8.4h4.2M1.8 12.6h4.6M3.4 16.8h4.4" stroke={GOLD.o} strokeWidth={1.9} strokeLinecap="round" fill="none" />
    </>
  ),
  harvest: (
    <>
      <path d={petals(12, 7.4, 3.4, 2.5)} fill="none" stroke={PINK.o} strokeWidth={W + 1.8} strokeLinejoin="round" />
      <path d={petals(12, 7.4, 3.4, 2.5)} fill={PINK.f} stroke="none" />
      <circle cx="12" cy="7.4" r="2" fill={GOLD.f} stroke={GOLD.o} strokeWidth={1.2} />
      {shape('M3.4 12.2h17.2l-1.7 8.2a1.6 1.6 0 0 1-1.6 1.2H6.7a1.6 1.6 0 0 1-1.6-1.2z', WOOD)}
      {shine('M7.4 15.4v3.6M12 15.4v3.6M16.6 15.4v3.6', '#7c5a2e', 0.9, 1.3)}
    </>
  ),
  purge: (
    <>
      {shape('M6.2 10.6V8.6a1.9 1.9 0 0 1 3.5-1 1.9 1.9 0 0 1 3.4-.1 1.9 1.9 0 0 1 3.3 0 1.9 1.9 0 0 1 3 1.6v6.2a6.2 6.2 0 0 1-6.2 6.2h-.7a6.2 6.2 0 0 1-6.2-6.2v-1.2l-1.5-1.1a1.5 1.5 0 0 1 2.1-2z', ORANGE, { fill: '#fdba74' })}
      <path d="M9.7 7.6v3.8M13.1 7.4v4M16.4 7.5v3.8" stroke={ORANGE.o} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      {shine('M9 17.2a4 4 0 0 0 3.2 1.6', '#ffedd5', 0.9, 1.3)}
    </>
  ),
  ascent: (
    <>
      {shape('M1.8 21.2 9.4 8.6l3.2 4.6 2.4-3.4 7.2 11.4z', MINT)}
      {shape('M9.4 8.6l1.8 2.7-1.4-.4-1.2 1.1-1 .1z', STEEL, { fill: '#f1f5f9', strokeWidth: 1.1 })}
      {shape('M18 1.8l3.4 4.4h-2.3v4.1h-2.2V6.2h-2.3z', GOLD, { strokeWidth: 1.3 })}
    </>
  ),
  stealth: (
    <>
      {shape('M1.8 12S5.6 5.4 12 5.4 22.2 12 22.2 12 18.4 18.6 12 18.6 1.8 12 1.8 12z', PAPER, { fill: '#ede9fe', stroke: VIOLET.o })}
      <circle cx="12" cy="12" r="4.2" fill={VIOLET.f} stroke={VIOLET.o} strokeWidth={1.5} />
      <circle cx="12" cy="12" r="1.9" fill="#2e1065" />
      <circle cx="10.8" cy="10.8" r="0.9" fill="#ffffff" />
    </>
  ),
  vine: (
    <>
      {tube('M13.2 2.2c-2.4 1.4-2.6 3.6-.8 5.2-3.8.4-6.8 2.8-6.8 6.2 0 3.5 2.7 6.3 6.4 6.3s6.4-2.8 6.4-6.3c0-2.9-1.9-5-4.4-5.9', GREEN, 2)}
      {shape('M5.6 13.4c-2.2-.4-3.4-1.9-3.6-4 2.3-.2 3.8.9 3.6 4z', GREEN, { fill: '#86efac', strokeWidth: 1.3 })}
      {shape('M18.6 8c1.9-1.6 3.1-1.7 3.8-1.6-.1 1.8-1.5 3.1-3.8 1.6z', GREEN, { fill: '#86efac', strokeWidth: 1.3 })}
    </>
  ),
  relic: (
    <>
      {shape('M12 21.8 2.6 9.6 6.4 3.2h11.2l3.8 6.4z', CYAN)}
      <path d="M2.6 9.6h18.8M9.4 3.2 7.6 9.6 12 21.8M14.6 3.2l1.8 6.4L12 21.8" stroke={CYAN.o} strokeWidth={1.3} strokeLinejoin="round" fill="none" />
      <path d="M8.4 5.2h3.6" stroke={CYAN.h} strokeWidth={1.4} strokeLinecap="round" opacity={0.95} />
    </>
  ),
  rescue: (
    <>
      <path d="M12 1.8v2.8" stroke={GOLD.o} strokeWidth={2} strokeLinecap="round" />
      {shape('M4.6 20V11a7.4 7.4 0 0 1 14.8 0v9z', GOLD, { fill: '#fde68a' })}
      <path d="M9.3 4.6V20M14.7 4.6V20M4.6 12h14.8" stroke={GOLD.o} strokeWidth={1.5} fill="none" />
      {shape('M3 20h18v2H3z', GOLD, { fill: '#d97706' })}
      {shape('M12 17.6c-2.6-1.9-3.4-3.1-3.4-4.1a1.7 1.7 0 0 1 3.4-.5 1.7 1.7 0 0 1 3.4.5c0 1-.8 2.2-3.4 4.1z', PINK, { strokeWidth: 1.1 })}
    </>
  ),
  gauntlet: <>{sword(-45, 'a')}{sword(45, 'b')}</>,
  boss: (
    <>
      <circle cx="12" cy="12" r="9.6" fill={RED.f} stroke={RED.o} {...base} strokeWidth={1.8} />
      <circle cx="12" cy="12" r="9.6" fill="none" stroke={GOLD.f} strokeWidth={1.1} opacity={0.95} transform="rotate(0)" />
      <circle cx="12" cy="12" r="7.4" fill="#7f1d1d" />
      <path d="M8.6 6.6 15.4 17.4M12 5.6l4.6 12M5.4 9.2 10 18.2" stroke={GOLD.f} strokeWidth={1.7} strokeLinecap="round" fill="none" opacity={0} />
      <path d="M7.4 7.4l3.6 9.4M11.2 6.6l3.4 10M15 7.4l2.2 6.2" stroke="#fde68a" strokeWidth={1.9} strokeLinecap="round" fill="none" />
    </>
  ),
};

export const ICON_NAMES = Object.keys(ART) as IconName[];

/** a 24x24 icon from the game's own set; see the notes at the top of this file */
export const UI_KIT_URL = new URL('../../assets/ui/ui-kit.webp', import.meta.url).href;
/** the icons drawn from the painted kit (the name in the kit is `icon-<name>`) */
export const PAINTED_ICONS: ReadonlySet<IconName> = new Set<IconName>(
  Object.keys(UI_KIT)
    .filter((k) => k.startsWith('icon-'))
    .map((k) => k.slice(5) as IconName)
    .filter((n) => n !== 'arrow' && n !== 'check' && n !== 'cross'),
);

/** one piece of the painted kit sheet as an <svg> (the lock badge and the star slots are drawn the same way) */
export const KitPiece: React.FC<{ piece: string; width: number | string; height?: number | string; className?: string; style?: React.CSSProperties; label?: string }> = ({ piece, width, height, className, style, label }) => {
  const f = UI_KIT[piece];
  // (a square the size of the piece's longer side, the piece in its middle, clipped to the piece so nothing of its neighbours in the
  // sheet shows; a clip path, not a nested svg, so rules that size `svg` inside a button or a row leave it alone)
  const id = React.useId();
  if (!f) return null;
  const m = Math.max(f.w, f.h);
  const ox = (m - f.w) / 2 - f.x;
  const oy = (m - f.h) / 2 - f.y;
  return (
    <svg
      viewBox={`0 0 ${m} ${m}`}
      width={width}
      height={height ?? width}
      className={className}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <clipPath id={id}>
        <rect x={(m - f.w) / 2} y={(m - f.h) / 2} width={f.w} height={f.h} />
      </clipPath>
      <image href={UI_KIT_URL} x={ox} y={oy} width={UI_KIT_SIZE.w} height={UI_KIT_SIZE.h} clipPath={`url(#${id})`} />
    </svg>
  );
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, label, className, style, rotate }) => {
  const s: React.CSSProperties | undefined = rotate ? { ...style, transform: `${style?.transform ?? ''} rotate(${rotate}deg)`.trim() } : style;
  if (PAINTED_ICONS.has(name)) return <KitPiece piece={`icon-${name}`} width={size} className={className ? `ic ${className}` : 'ic'} style={s} label={label} />;
  const art = ART[name];
  if (!art) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className ? `ic ${className}` : 'ic'}
      style={s}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {art}
    </svg>
  );
};
