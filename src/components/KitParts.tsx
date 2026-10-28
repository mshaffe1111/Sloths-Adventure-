import React from 'react';
import { DOT_PERCH_URL } from './hud/painted.tsx';
import { DOT_PERCH_ATLAS_SIZE, DOT_PERCH_FRAMES } from '../game/dotPerchAtlasData.ts';
import { POKEY_IDLE_URL } from './title/titleCast.ts';

/**
 * The shared kit's character pieces (2026-10-28, Matt: "the same type of detail with the other menus, so it looks consistent"): only
 * painted frames there already are, standing still (no code-made twitching).
 *   PeekPokey   Pokey looking over the top edge of a panel (his title portrait, from the chest up)
 *   DotPerched  Dot sitting on the edge of a panel (her perch pose)
 *   Plaque      a heading carved into a little log, the way the title's name is
 */
export const PeekPokey: React.FC<{ className?: string }> = ({ className }) => (
  <span className={`kit-peek${className ? ` ${className}` : ''}`} aria-hidden="true">
    <img src={POKEY_IDLE_URL} alt="" draggable={false} />
  </span>
);

export const DotPerched: React.FC<{ size?: number; className?: string; facing?: 'left' | 'right' }> = ({ size = 64, className, facing = 'right' }) => {
  const f = DOT_PERCH_FRAMES.perch;
  const k = size / f.w;
  return (
    <span
      className={`kit-dot${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      style={{
        width: f.w * k,
        height: f.h * k,
        backgroundImage: `url(${DOT_PERCH_URL})`,
        backgroundSize: `${DOT_PERCH_ATLAS_SIZE.w * k}px ${DOT_PERCH_ATLAS_SIZE.h * k}px`,
        backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
        transform: facing === 'right' ? 'scaleX(-1)' : undefined,
      }}
    />
  );
};

export const Plaque: React.FC<{ children: React.ReactNode; as?: 'h1' | 'h2'; className?: string; id?: string }> = ({ children, as = 'h2', className, id }) =>
  React.createElement(as, { className: `kit-plaque${className ? ` ${className}` : ''}`, id }, <span>{children}</span>);
