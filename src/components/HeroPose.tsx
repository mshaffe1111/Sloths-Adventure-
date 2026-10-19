import React from 'react';
import { HERO_ATLAS_SIZE, HERO_FRAMES } from '../game/heroAtlasData.ts';
import { heroSpriteEnabled } from '../game/heroSprite.ts';

const ATLAS_URL = new URL('../assets/hero/hero-atlas.webp', import.meta.url).href;

/** one full painted Slomatt pose (jump_up, idle_a, land...) at a chosen height in px; the classic hero shows the sloth emoji */
export const HeroPose: React.FC<{ frame: string; height: number; className?: string; label?: string }> = ({ frame, height, className, label }) => {
  const f = HERO_FRAMES[frame];
  if (!heroSpriteEnabled() || !f) {
    return (
      <span className={className} role="img" aria-label={label} style={{ fontSize: height * 0.6, lineHeight: 1 }}>
        🦥
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
        backgroundImage: `url(${ATLAS_URL})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${HERO_ATLAS_SIZE.w * k}px ${HERO_ATLAS_SIZE.h * k}px`,
        backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
      }}
    />
  );
};
