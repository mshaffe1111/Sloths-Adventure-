import React from 'react';
import { HERO_ATLAS_SIZE, HERO_FRAMES } from '../game/heroAtlasData.ts';
import { heroSpriteEnabled } from '../game/heroSprite.ts';

const ATLAS_URL = new URL('../assets/hero/hero-atlas.webp', import.meta.url).href;

/**
 * One of the painted Slomatt face portraits as a small icon (the lives counter). Falls back to the sloth emoji
 * when the classic hero is selected, so the classic look stays whole.
 */
export const HeroFaceIcon: React.FC<{ size?: number; face?: string; className?: string }> = ({ size = 20, face = 'face_happy', className }) => {
  const f = HERO_FRAMES[face];
  if (!heroSpriteEnabled() || !f) {
    return (
      <span className={className} style={{ fontSize: size * 0.85, lineHeight: 1 }} aria-hidden="true">
        🦥
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
        backgroundImage: `url(${ATLAS_URL})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${HERO_ATLAS_SIZE.w * k}px ${HERO_ATLAS_SIZE.h * k}px`,
        backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
      }}
    />
  );
};
