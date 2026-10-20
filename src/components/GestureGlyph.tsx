import React from 'react';

/**
 * A small picture of a thumb gesture: a faint arrow for the path and a glowing dot that slides along it.
 * Used in How to Play and in the first-stage coaching, so the same picture means the same thing in both places.
 */
export type GlyphKind = 'run' | 'jump' | 'up' | 'down' | 'flick' | 'tap' | 'hold';

interface Spec {
  /** where the thumb starts, and how far it moves (in the 72 x 56 box) */
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** a quick gesture is drawn quick */
  fast?: boolean;
}

const SPECS: Record<GlyphKind, Spec> = {
  run: { x: 12, y: 28, dx: 46, dy: 0 },
  jump: { x: 14, y: 46, dx: 40, dy: -34 },
  up: { x: 36, y: 48, dx: 0, dy: -38 },
  down: { x: 36, y: 8, dx: 0, dy: 38 },
  flick: { x: 20, y: 28, dx: 30, dy: 0, fast: true },
  tap: { x: 36, y: 28, dx: 0, dy: 0 },
  hold: { x: 36, y: 28, dx: 0, dy: 0 },
};

export const GestureGlyph: React.FC<{ kind: GlyphKind; size?: number; bare?: boolean }> = ({ kind, size = 72, bare = false }) => {
  const s = SPECS[kind];
  const moving = s.dx !== 0 || s.dy !== 0;
  const x2 = s.x + s.dx;
  const y2 = s.y + s.dy;
  // the arrowhead: two short strokes back from the tip
  const ang = Math.atan2(s.dy, s.dx);
  const head = (a: number) => `${x2 - Math.cos(ang + a) * 8},${y2 - Math.sin(ang + a) * 8}`;
  return (
    <svg
      className={`cg cg-${kind}${bare ? ' cg-bare' : ''}`}
      width={size}
      height={(size * 56) / 72}
      viewBox="0 0 72 56"
      role="img"
      aria-label={`${kind} gesture`}
    >
      {moving && (
        <>
          <line x1={s.x} y1={s.y} x2={x2} y2={y2} className="cg-path" />
          <polyline points={`${head(0.5)} ${x2},${y2} ${head(-0.5)}`} className="cg-path cg-head" />
        </>
      )}
      {kind === 'hold' && <circle cx={s.x} cy={s.y} r="14" className="cg-ring" />}
      {kind === 'tap' && <circle cx={s.x} cy={s.y} r="10" className="cg-ripple" />}
      <g
        className={`cg-dot${s.fast ? ' cg-fast' : ''}`}
        style={{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px` } as React.CSSProperties}
      >
        <circle cx={s.x} cy={s.y} r="8.5" className="cg-halo" />
        <circle cx={s.x} cy={s.y} r="5.2" className="cg-core" />
      </g>
    </svg>
  );
};
