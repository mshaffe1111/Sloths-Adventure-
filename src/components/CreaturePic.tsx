import React from 'react';
import { CREATURE_ART } from '../game/creatureArt.ts';

/** one painted creature, cropped from its sheet to fit the box; a dark silhouette when `locked` */
export const CreaturePic: React.FC<{ id: string; w: number; h: number; locked?: boolean }> = ({ id, w, h, locked }) => {
  const a = CREATURE_ART[id];
  if (!a) return null;
  const k = Math.min(w / a.frame.w, h / a.frame.h);
  return (
    <div
      aria-hidden
      style={{
        width: a.frame.w * k,
        height: a.frame.h * k,
        backgroundImage: `url(${a.url})`,
        backgroundSize: `${a.atlas.w * k}px ${a.atlas.h * k}px`,
        backgroundPosition: `${-a.frame.x * k}px ${-a.frame.y * k}px`,
        backgroundRepeat: 'no-repeat',
        filter: locked ? 'brightness(0) opacity(0.5)' : 'drop-shadow(0 4px 3px rgba(0,0,0,.45))',
      }}
    />
  );
};
