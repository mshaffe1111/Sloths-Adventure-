import React from 'react';
import { HERO_ATLAS_SIZE, HERO_FRAMES } from '../game/heroAtlasData.ts';
import { heroSpriteEnabled } from '../game/heroSprite.ts';
import { STD_ATLAS_SIZE, STD_ATLAS_URL, stdUi } from '../game/heroStandard.ts';
import { Icon } from './icons/index.tsx';

const ATLAS_URL = new URL('../assets/hero/hero-atlas.webp', import.meta.url).href;

/** one full painted Pokey pose (jump_up, idle_a, land...) at a chosen height in px; the classic hero shows the drawn sloth face */
export const HeroPose: React.FC<{ frame: string; height: number; className?: string; label?: string }> = ({ frame, height, className, label }) => {
  const sf = stdUi(frame);
  const f = sf ?? HERO_FRAMES[frame];
  const url = sf ? STD_ATLAS_URL : ATLAS_URL;
  const atlasW = sf ? STD_ATLAS_SIZE.w : HERO_ATLAS_SIZE.w;
  const atlasH = sf ? STD_ATLAS_SIZE.h : HERO_ATLAS_SIZE.h;
  if (!heroSpriteEnabled() || !f) {
    return (
      <span className={className} role="img" aria-label={label} style={{ display: 'inline-flex', alignItems: 'flex-end', height }}>
        <Icon name="sloth" size={height * 0.7} />
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
