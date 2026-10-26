import React, { useSyncExternalStore } from 'react';
import type { BadgeDef, Tier } from '../game/badges.ts';
import { EMBLEM_FRAMES, MEDAL_ATLAS_SIZE, MEDALLION_FRAMES, type MedalFrame } from '../game/medalAtlasData.ts';
import { Icon } from './icons/index.tsx';
import { badgeIconName } from './icons/badgeIcons.ts';

/** the painted medals: four tier medallions and the emblems that sit on them, in one sheet (tools/art/medals/pack.py) */
export const MEDAL_ATLAS_URL = new URL('../assets/medals/medals.webp', import.meta.url).href;

/** the sheet is loaded once for every medal on screen; until it has, the drawn medal shows */
let sheetReady = false;
const subs = new Set<() => void>();
let asked = false;
function askSheet() {
  if (asked || typeof Image === 'undefined') return;
  asked = true;
  const img = new Image();
  img.onload = () => {
    sheetReady = true;
    subs.forEach((f) => f());
  };
  img.src = MEDAL_ATLAS_URL;
}
const subscribe = (f: () => void) => {
  askSheet();
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
const useSheetReady = () => useSyncExternalStore(subscribe, () => sheetReady, () => false);

/** how much of the enamel's width the emblem takes (a little over: it sits proud of the rim's inner edge) */
const EMBLEM_FILL = 1.08;

/** CSS that shows one frame of the medal sheet in a box of w x h css px */
function frameStyle(f: MedalFrame, w: number, h: number): React.CSSProperties {
  const kx = w / f.w;
  const ky = h / f.h;
  return {
    width: w,
    height: h,
    backgroundImage: `url(${MEDAL_ATLAS_URL})`,
    backgroundSize: `${MEDAL_ATLAS_SIZE.w * kx}px ${MEDAL_ATLAS_SIZE.h * ky}px`,
    backgroundPosition: `${-f.x * kx}px ${-f.y * ky}px`,
    backgroundRepeat: 'no-repeat',
  };
}

/**
 * A medal: its tier's painted medallion (bronze, silver, gold or platinum) with its painted emblem on the enamel, and a world medal's
 * number on a little tag. Greyed when not earned yet. Until the sheet has loaded, the drawn medal shows instead (a tier-coloured rim and
 * the icon).
 */
export const BadgeMedal: React.FC<{ badge: Pick<BadgeDef, 'tier' | 'emblem' | 'icon' | 'world'>; earned: boolean; size?: number }> = ({ badge, earned, size = 52 }) => {
  const m = MEDALLION_FRAMES[badge.tier as Tier];
  const e = EMBLEM_FRAMES[badge.emblem];
  const side = Math.round(2 * m.r * size * EMBLEM_FILL);
  const ready = useSheetReady();
  return (
    <div className={`tr-medal ${ready ? 'tr-painted' : `tr-${badge.tier}`} ${earned ? '' : 'tr-off'}`} style={{ width: size, height: size }} aria-hidden>
      {ready ? (
        <>
          <span className="tr-paint" style={frameStyle(m, size, size)} />
          {e && <span className="tr-emblem" style={{ ...frameStyle(e, side, side), left: Math.round(m.cx * size - side / 2), top: Math.round(m.cy * size - side / 2) }} />}
        </>
      ) : (
        <span className="tr-inlay">
          <Icon name={badgeIconName(badge.icon)} size={Math.round(size * 0.5)} />
        </span>
      )}
      {badge.world && <span className="tr-wnum" style={{ fontSize: Math.max(9, Math.round(size * 0.22)) }}>{badge.world}</span>}
    </div>
  );
};
