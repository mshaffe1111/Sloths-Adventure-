import React from 'react';
import { HERO_ATLAS_SIZE, HERO_FRAMES } from '../game/heroAtlasData.ts';
import { heroSpriteEnabled } from '../game/heroSprite.ts';
import { STD_ATLAS_SIZE, STD_ATLAS_URL, stdUi } from '../game/heroStandard.ts';
import { PaintedIcon } from './icons/PaintedIcon.tsx';

const ATLAS_URL = new URL('../assets/hero/hero-atlas.webp', import.meta.url).href;

/**
 * One of the painted Pokey face portraits as a small icon (the lives counter). Falls back to the drawn sloth face
 * when the classic hero is selected, so the classic look stays whole.
 */
export const HeroFaceIcon: React.FC<{ size?: number; face?: string; className?: string }> = ({ size = 20, face = 'face_happy', className }) => {
  const sf = stdUi(face);
  const f = sf ?? HERO_FRAMES[face];
  const url = sf ? STD_ATLAS_URL : ATLAS_URL;
  const atlasW = sf ? STD_ATLAS_SIZE.w : HERO_ATLAS_SIZE.w;
  const atlasH = sf ? STD_ATLAS_SIZE.h : HERO_ATLAS_SIZE.h;
  if (!heroSpriteEnabled() || !f) {
    return (
      <span className={className} style={{ display: 'inline-flex' }} aria-hidden="true">
        <PaintedIcon name="satchel" size={size * 0.9} />
      </span>
    );
  }
  const k = size / f.w;
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size * (f.h / f.w),
        backgroundImage: `url(${url})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${atlasW * k}px ${atlasH * k}px`,
        backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
      }}
    />
  );
};
