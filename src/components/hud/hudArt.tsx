/**
 * The new HUD's pieces of art. Where the game has painted art it is used as it is: the leaves are cut from the falling-leaf sheet
 * (flora/leaves-atlas.webp), the goal icons are the stage's own pickups (assets/pickups) and flowers (flora/flowers-atlas.webp), and
 * Pokey's face is his portrait (HeroFaceIcon). The rest is drawn here as clean stand-ins, in the sprites' dark-brown ink:
 *   the hearts, the vine and its threads, the Menu's three lines, the power-up pod, and the foe, cage, idol and door goal icons.
 */
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

const HEART = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

/** the gradients the hearts and star use, once per HUD */
export const HudDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      <radialGradient id="vh-hg" cx=".36" cy=".3" r=".85">
        <stop offset="0" stopColor="#ff9a96" />
        <stop offset=".42" stopColor="#ee3d4f" />
        <stop offset="1" stopColor="#a3132c" />
      </radialGradient>
      <radialGradient id="vh-tg" cx=".36" cy=".3" r=".85">
        <stop offset="0" stopColor="#fff1a8" />
        <stop offset=".45" stopColor="#fbbf24" />
        <stop offset="1" stopColor="#b86a05" />
      </radialGradient>
    </defs>
  </svg>
);

/** a heart: full (painted red, ink outline, a shine), empty (a dark hollow), lost (a white flash with a crack), thorn (gold) */
export const Heart: React.FC<{ size: number; state: 'full' | 'empty' | 'lost' | 'thorn' }> = ({ size, state }) => {
  if (state === 'empty')
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path d={HEART} fill="rgba(52,26,18,.62)" stroke={INK} strokeWidth="2.3" strokeLinejoin="round" />
        <path d={HEART} fill="none" stroke="rgba(255,214,200,.45)" strokeWidth="1" transform="translate(2.4 2.6) scale(.8)" />
      </svg>
    );
  if (state === 'lost')
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="vh-heart-lost">
        <path d={HEART} fill="#fff" stroke={INK} strokeWidth="2.3" strokeLinejoin="round" />
        <path d="M12 6 L10.4 10 L13 12.4 L11 16.5" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={HEART} fill={state === 'thorn' ? 'url(#vh-tg)' : 'url(#vh-hg)'} stroke={INK} strokeWidth="2.3" strokeLinejoin="round" />
      <ellipse cx="7.6" cy="8" rx="2.6" ry="1.6" fill="#fff" opacity=".8" transform="rotate(-35 7.6 8)" />
    </svg>
  );
};

export const Star: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ flex: 'none' }}>
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="url(#vh-tg)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const Bolt: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill={color} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const MenuLines: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ overflow: 'visible' }}>
    <path d="M5 7h14M5 12h14M5 17h14" stroke={INK} strokeWidth="5.8" strokeLinecap="round" />
    <path d="M5 7h14M5 12h14M5 17h14" stroke="#FFF3D6" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

export const Tick: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#3f8f3a" stroke={INK} strokeWidth="2.2" />
    <path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#fff3d6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** the drawn goal icons, for goals with no painted pickup (stand-ins: see the report) */
const Drawn: React.FC<{ name: 'idol' | 'foe' | 'cage' | 'door' | 'carving'; size: number }> = ({ name, size }) => {
  if (name === 'carving')
    // Meeca's warnings: a scrap of bark with "M." scratched into it
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <rect x="2.5" y="3.5" width="19" height="17" rx="5" fill="#8a6440" stroke={INK} strokeWidth="2" />
        <path d="M5 9.5l14 .6M5 15.8l14 .5" stroke="rgba(58,36,20,.45)" strokeWidth="1" fill="none" />
        <path d="M6.6 16.4l.6-8.4 3 4.6 3-4.8.4 8.6" fill="none" stroke="rgba(38,20,10,.85)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.2 16l.6-8.4 3 4.6 3-4.8.4 8.6" fill="none" stroke="#f7e6c2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16.8" cy="15.6" r="1.3" fill="#f7e6c2" />
      </svg>
    );
  if (name === 'foe')
    // a claw mark on a leaf-green disc: "a predator"
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#7c2d12" stroke={INK} strokeWidth="2" />
        <path d="M8 6.5c1.2 3.6 1.2 7.4-.6 11M12 5.5c1 4 1 8.4-.4 13M16 6.5c1.2 3.6 1 7.4-.8 11" fill="none" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  if (name === 'cage')
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path d="M5 20V9a7 6 0 0 1 14 0v11z" fill="#c08a4a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 20V6.5M12 20V5M15 20V6.5M5 13h14" stroke={INK} strokeWidth="1.6" />
        <path d="M3.5 20.5h17" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  if (name === 'idol')
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path d="M8 21h8l-1-4h-6zM7.5 10a4.5 5 0 0 1 9 0v4a4.5 3 0 0 1-9 0z" fill="url(#vh-tg)" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="10.4" cy="11" r="1" fill={INK} />
        <circle cx="13.6" cy="11" r="1" fill={INK} />
      </svg>
    );
  // the sanctuary door (end of the distance trail)
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M4 22V10a8 8 0 0 1 16 0v12z" fill="#8a6a3a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 22V11a4 4 0 0 1 8 0v11z" fill="#34d399" stroke={INK} strokeWidth="1.6" />
    </svg>
  );
};

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
