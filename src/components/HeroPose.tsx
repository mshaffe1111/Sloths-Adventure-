import React from 'react';
import { HERO_ATLAS_SIZE, HERO_FRAMES } from '../game/heroAtlasData.ts';
import { heroSpriteEnabled } from '../game/heroSprite.ts';
import { STD_ATLAS_SIZE, STD_ATLAS_URL, stdUi } from '../game/heroStandard.ts';
import { PaintedIcon } from './icons/PaintedIcon.tsx';

const ATLAS_URL = new URL('../assets/hero/hero-atlas.webp', import.meta.url).href;

/** one full painted Pokey pose (jump_up, idle_a, land...) at a chosen height in px; the classic hero shows the drawn sloth face */
export const HeroPose: React.FC<{ frame: string; height: number; className?: string; label?: string; /** shrink the pose, keeping its shape, so it is never wider than this many px */ maxWidth?: number }> = ({ frame, height: wantH, className, label, maxWidth }) => {
  const sf = stdUi(frame);
  const f = sf ?? HERO_FRAMES[frame];
  const height = f && maxWidth ? Math.min(wantH, Math.floor((maxWidth * f.h) / f.w)) : wantH;
  const url = sf ? STD_ATLAS_URL : ATLAS_URL;
  const atlasW = sf ? STD_ATLAS_SIZE.w : HERO_ATLAS_SIZE.w;
  const atlasH = sf ? STD_ATLAS_SIZE.h : HERO_ATLAS_SIZE.h;
  if (!heroSpriteEnabled() || !f) {
    return (
      <span className={className} role="img" aria-label={label} style={{ display: 'inline-flex', alignItems: 'flex-end', height }}>
        <PaintedIcon name="satchel" size={height * 0.7} />
      </span>
    );
  }
  const k = height / f.h;
  return (
    <span
      className={className}
      role="img"
      aria-label={label}
      style={{
        display: 'inline-block',
        width: f.w * k,
        height,
        backgroundImage: `url(${url})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${atlasW * k}px ${atlasH * k}px`,
        backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
      }}
    />
  );
};
