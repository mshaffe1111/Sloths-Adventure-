/**
 * The new HUD's pieces of art. Where the game has painted art it is used as it is: the leaves are cut from the falling-leaf sheet
 * (flora/leaves-atlas.webp), the goal icons are the stage's own pickups (assets/pickups) and flowers (flora/flowers-atlas.webp), and
 * Pokey's face is his portrait (HeroFaceIcon). The rest is drawn here as clean stand-ins, in the sprites' dark-brown ink:
 *   the hearts, the vine and its threads, the Menu's three lines, the power-up pod, and the foe, cage, idol and door goal icons.
 */
import { PaintedIcon, preloadPainted, type PaintedName } from '../icons/PaintedIcon.tsx';
import React from 'react';
import { LEAF_ATLAS_SIZE, LEAF_FRAMES } from '../../game/leafAtlasData.ts';
import { FLOWER_ATLAS_SIZE, FLOWER_FRAMES } from '../../game/flowerAtlasData.ts';
import type { GoalIcon } from './goalInfo.ts';

export const INK = '#3a2414';

const LEAF_URL = new URL('../../assets/flora/leaves-atlas.webp', import.meta.url).href;
const FLOWER_URL = new URL('../../assets/flora/flowers-atlas.webp', import.meta.url).href;
let PICKUPS: Record<string, string> = {};
try {
  PICKUPS = import.meta.glob('../../assets/pickups/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  PICKUPS = {};
}
export const pickupUrl = (name: string): string | undefined => PICKUPS[`../../assets/pickups/${name}.webp`];

/** a leaf from the painted leaf sheet, `w` px wide (height follows the leaf) */
export const Leaf: React.FC<{ frame: string; w: number; style?: React.CSSProperties; className?: string }> = ({ frame, w, style, className }) => {
  const f = LEAF_FRAMES[frame];
  if (!f) return null;
  const k = w / f.w;
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        width: w,
        height: f.h * k,
        backgroundImage: `url(${LEAF_URL})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${LEAF_ATLAS_SIZE.w * k}px ${LEAF_ATLAS_SIZE.h * k}px`,
        backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
        filter: 'drop-shadow(0 2px 0 rgba(30,15,5,.5))',
        ...style,
      }}
    />
  );
};



preloadPainted(['heart', 'heartEmpty', 'thornHeart', 'star', 'checkmark', 'seed', 'idol', 'clubs', 'cage', 'home']);

/** a heart (icons-painted, 2026-11-01): the painted heart berry (full), its dry husk (empty), the berry in its bramble (thorn), and
 * the husk flashing white as it is lost */
export const Heart: React.FC<{ size: number; state: 'full' | 'empty' | 'lost' | 'thorn' }> = ({ size, state }) => (
  <PaintedIcon
    name={state === 'full' ? 'heart' : state === 'thorn' ? 'thornHeart' : 'heartEmpty'}
    size={size}
    className={state === 'lost' ? 'vh-heart-lost' : undefined}
  />
);

/** the score's star: the painted gold star */
export const Star: React.FC<{ size: number }> = ({ size }) => <PaintedIcon name="star" size={size} />;

/** a power's timer: the glowing golden seed */
export const Bolt: React.FC<{ size: number; color: string }> = ({ size }) => <PaintedIcon name="seed" size={size} />;

/** the Menu button before the HUD's painted leaf has loaded: the carved cog (Settings) */
export const MenuLines: React.FC<{ size: number }> = ({ size }) => <PaintedIcon name="gear" size={size} />;

/** goal met: the painted vine tick, lifted off the wooden plate by the warm rim */
export const Tick: React.FC<{ size: number }> = ({ size }) => <PaintedIcon name="checkmark" size={size} className="pic-rim" />;

/** the goals with no painted pickup (icons-painted, 2026-11-01): the stone idol, a defeated foe (the clubs), the stick cage, the
 * sanctuary door (the stump door) and Meeca's carved bark scrap */
const DRAWN: Record<'idol' | 'foe' | 'cage' | 'door' | 'carving', PaintedName> = { idol: 'idol', foe: 'clubs', cage: 'cage', door: 'home', carving: 'carving' };
const Drawn: React.FC<{ name: keyof typeof DRAWN; size: number }> = ({ name, size }) => <PaintedIcon name={DRAWN[name]} size={size} />;

/** the goal's icon at `size` px (its longest side) */
export const GoalPic: React.FC<{ icon: GoalIcon; size: number; className?: string; style?: React.CSSProperties }> = ({ icon, size, className, style }) => {
  if (icon.kind === 'pickup') {
    const url = pickupUrl(icon.name);
    if (url) return <img src={url} alt="" aria-hidden="true" draggable={false} className={className} style={{ width: size, height: size, objectFit: 'contain', ...style }} />;
    return <span className={className} style={style}><Drawn name="idol" size={size} /></span>;
  }
  if (icon.kind === 'flower') {
    const f = FLOWER_FRAMES['f' + icon.num];
    if (!f) return <span className={className} style={style}><Drawn name="idol" size={size} /></span>;
    const k = size / Math.max(f.w, f.h);
    return (
      <span className={className} aria-hidden="true" style={{ display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center', ...style }}>
        <span
          style={{
            width: f.w * k,
            height: f.h * k,
            backgroundImage: `url(${FLOWER_URL})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${FLOWER_ATLAS_SIZE.w * k}px ${FLOWER_ATLAS_SIZE.h * k}px`,
            backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
          }}
        />
      </span>
    );
  }
  return <span className={className} style={{ display: 'inline-flex', ...style }}><Drawn name={icon.name} size={size} /></span>;
};

/** the vine's centre line: a gentle wave from x0 to x1 around `base` */
export const vineY = (x: number, base: number, amp = 3.2, ph = 0) => base + amp * Math.sin(x / 38 + ph);

/** a twisted vine drawn in ink and two greens, from x0 to x1 (px in its box), with a curl at the end when asked */
export const Vine: React.FC<{ x0: number; x1: number; base: number; amp?: number; ph?: number; curl?: boolean; style?: React.CSSProperties; className?: string }> = React.memo(
  ({ x0, x1, base, amp = 3.2, ph = 0, curl = false, style, className }) => {
    const d = React.useMemo(() => {
      let a = '', b = '', c = '';
      for (let x = x0; x <= x1; x += 5) {
        const y = vineY(x, base, amp, ph);
        const sep = x === x0 ? 'M' : ' L';
        a += `${sep}${x.toFixed(1)} ${y.toFixed(1)}`;
        b += `${sep}${x.toFixed(1)} ${(y + 2.2 * Math.sin(x / 9)).toFixed(1)}`;
        c += `${sep}${x.toFixed(1)} ${(y - 1.6).toFixed(1)}`;
      }
      const ye = vineY(x1, base, amp, ph);
      const cu = curl ? `M${x1} ${ye.toFixed(1)} q 10 -2 10 7 q 0 7 -7 6 q -5 -1 -3 -5` : '';
      return { a, b, c, cu };
    }, [x0, x1, base, amp, ph, curl]);
    const w = Math.max(x1, 1) + 24;
    return (
      <svg className={className} width={w} height={base + 24} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style }} aria-hidden="true">
        <path d={d.a} fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d.a} fill="none" stroke="#6f8f34" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d.b} fill="none" stroke="#4b6a20" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
        <path d={d.c} fill="none" stroke="#b9d27a" strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
        {d.cu && (
          <>
            <path d={d.cu} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
            <path d={d.cu} fill="none" stroke="#7d9c3c" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}
      </svg>
    );
  },
);
Vine.displayName = 'Vine';
