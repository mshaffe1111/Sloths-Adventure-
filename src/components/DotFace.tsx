import React, { useEffect, useState } from 'react';
import { DOT_ATLAS_SIZE, DOT_ATLAS_URL, DOT_FRAMES, FACE_BOX, talkFace, warmDot, type DotFaceName } from '../game/dotSprite.ts';

warmDot();

/**
 * Dot's painted face. `size` is the width of the box every portrait sits in; the face sits on the bottom-right of it so his beak can open to the left
 * without the head moving, and the whole thing is mirrored so he looks right, towards the line he speaks. While `talking` the mouth cycles through
 * its shapes; otherwise he holds `face`.
 */
export const DotFace: React.FC<{ size?: number; face?: DotFaceName; talking?: boolean; className?: string }> = ({ size = 28, face = 'closed', talking = false, className }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!talking) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t0 = performance.now();
    const id = window.setInterval(() => setTick((performance.now() - t0) / 1000), 90);
    return () => window.clearInterval(id);
  }, [talking]);
  const shown: DotFaceName = talking && tick > 0 ? talkFace(tick) : face;
  const f = DOT_FRAMES[shown] ?? DOT_FRAMES.closed;
  const k = size / FACE_BOX.w;
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{ position: 'relative', display: 'inline-block', flex: 'none', width: size, height: FACE_BOX.h * k, transform: 'scaleX(-1)' }}
    >
      <span
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: f.w * k,
          height: f.h * k,
          backgroundImage: `url(${DOT_ATLAS_URL})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${DOT_ATLAS_SIZE.w * k}px ${DOT_ATLAS_SIZE.h * k}px`,
          backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
        }}
      />
    </span>
  );
};
