import React from 'react';
import { CELS, CEL_ATLAS_SIZES, CEL_ATLAS_URLS, HEADS } from '../game/storyCels.ts';

/** a painted face from the story sheets (Grandma, Lieutenant Pell, the grandfather) cropped from the top of one standing frame, in a round frame like Pokey's */
export const CelHead: React.FC<{ name: string; size?: number }> = ({ name, size = 22 }) => {
  const spec = HEADS[name];
  const c = spec ? CELS[spec.key] : undefined;
  if (!spec || !c) return null;
  const side = spec.s * c.w; // atlas px the window covers
  const k = size / side;
  const dim = CEL_ATLAS_SIZES[c.a];
  return (
    <span className="sp-ava" style={{ width: size, height: size }} aria-hidden="true">
      <span
        style={{
          display: 'block',
          width: size,
          height: size,
          backgroundImage: `url(${CEL_ATLAS_URLS[c.a]})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${dim.w * k}px ${dim.h * k}px`,
          backgroundPosition: `${-(c.x + spec.x * c.w) * k}px ${-(c.y + spec.y * c.w) * k}px`,
        }}
      />
    </span>
  );
};
