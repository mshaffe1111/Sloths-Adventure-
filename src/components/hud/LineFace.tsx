/**
 * A little one's face in a goal slot, on a stage whose little ones follow him home (2-3; game/followFaces.ts says which state, ENG-23's
 * mock-up the look: reference/qa-reports/ENG-23/stills/hud-mock-*.webp). Cut from World 2's own Happy paintings on w2-props (the sheet
 * 2-3 draws its little ones from, so it is loaded before the stage starts); a ring for its state: lit green hiding, dim out in the open,
 * grey with an amber '!' spooked back, gold home. Nothing drawn in its place before the sheet has loaded: the slot's own icon stays.
 */
import React from 'react';
import { W2_FRAMES } from '../../game/w2PropsData.ts';
import type { FaceState } from '../../game/followFaces.ts';
import type { FollowKind } from '../../game/follow.ts';

const URL_W2_PROPS = new URL('../../assets/props/w2-props.webp', import.meta.url).href;
let sheet: { w: number; h: number } | null = null;
const waiting = new Set<() => void>();
function useSheet(): { w: number; h: number } | null {
  const [, bump] = React.useState(0);
  React.useEffect(() => {
    if (sheet) return;
    const on = () => bump((n) => n + 1);
    waiting.add(on);
    if (waiting.size === 1) {
      const im = new Image();
      im.onload = () => {
        sheet = { w: im.naturalWidth, h: im.naturalHeight };
        for (const f of [...waiting]) f();
        waiting.clear();
      };
      im.src = URL_W2_PROPS;
    }
    return () => void waiting.delete(on);
  }, []);
  return sheet;
}

const FRAME: Record<FollowKind, { x: number; y: number; w: number; h: number }> = { duck: W2_FRAMES.duckHappy, otter: W2_FRAMES.otterHappy, capy: W2_FRAMES.capyHappy };
const RING: Record<FaceState, string> = {
  hid: '0 0 0 2px #bef264, 0 0 9px 3px rgba(190,242,100,0.85)',
  open: '0 0 0 2px rgba(120,113,108,0.9)',
  spooked: '0 0 0 2px #f59e0b',
  home: '0 0 0 2px #facc15, 0 0 8px 2px rgba(250,204,21,0.8)',
};
const FILTER: Record<FaceState, string> = { hid: 'none', open: 'brightness(0.55) saturate(0.6)', spooked: 'grayscale(1) brightness(0.8)', home: 'none' };
const LABEL: Record<FaceState, string> = { hid: 'hiding', open: 'out in the open', spooked: 'ran back to hide', home: 'home' };

/** the face, `size` px across (the slot's own size: it never grows the plate) */
export const LineFace: React.FC<{ kind: FollowKind; st: FaceState; size: number }> = ({ kind, st, size }) => {
  const s = useSheet();
  if (!s) return null;
  const f = FRAME[kind];
  // (the head: the painting at 1.25 x the slot across its width, its top 8% down the circle, as the mock-up)
  const k = (size * 1.25) / f.w;
  return (
    <span
      className={`vh-face vh-face-${st}`}
      role="img"
      aria-label={`${kind === 'capy' ? 'capybara' : kind}: ${LABEL[st]}`}
      style={{ width: size, height: size, borderRadius: '50%', position: 'relative', display: 'block', boxShadow: RING[st], filter: 'none' }}
    >
      {/* (the painting, toned for its state; the '!' beside it keeps its own amber: a filter here would grey it too) */}
      <span
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          backgroundColor: st === 'hid' ? '#365314' : '#3f3a33', backgroundImage: `url(${URL_W2_PROPS})`, backgroundRepeat: 'no-repeat',
          backgroundSize: `${s.w * k}px ${s.h * k}px`, backgroundPosition: `${-(f.x * k) + (size - f.w * k) / 2}px ${-(f.y * k) + size * 0.08}px`,
          filter: FILTER[st],
        }}
      />
      {st === 'spooked' && (
        <span className="vh-face-bang" style={{ width: Math.round(size * 0.45), height: Math.round(size * 0.45), fontSize: Math.round(size * 0.38) }}>!</span>
      )}
    </span>
  );
};
