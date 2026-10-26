import React, { useEffect, useRef, useState } from 'react';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

import { bossSegmentCount } from '../game/bossHits.ts';

// (the counting lives in bossHits.ts, so the bar and the "what came off" pop over a hit always agree)
export { bossSegmentCount };

interface BossHudProps {
  name: string;
  hp: number;
  maxHp: number;
  phase: number;
  /** one segment per hit, when the boss says how many hits it takes */
  hits?: number;
  /** Pokey's hearts, drawn right under the bar so one glance covers both fighters */
  heroHp: number;
  heroMaxHp: number;
  /** the world's accent colour for the bar */
  accent?: string;
  /**
   * the HUD: the bar hangs on the vine with the world's colour, Pokey's hearts stay in their corner (not drawn
   * here), and the name shrinks to fit before it is cut short
   */
  vine?: boolean;
  /** short landscape (new HUD): "N hits left" becomes N with a little fist */
  compact?: boolean;
}

/** the boss name shrinks (down to 14 px) until it fits on its line, before the ellipsis has to cut it */
function useFitName(name: string, on: boolean) {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    el.style.fontSize = '';
    let size = parseFloat(getComputedStyle(el).fontSize) || 18;
    while (size > 14 && el.scrollWidth > el.clientWidth + 1) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
  }, [name, on]);
  return ref;
}

/**
 * The boss's plate: name, a bar cut into one segment per hit with a gold notch at each phase change, and Pokey's hearts
 * under it. The segments that were just lost flash white and drain away a moment later, so a hit is felt on the bar.
 */
export const BossHud: React.FC<BossHudProps> = ({ name, hp, maxHp, phase, hits, heroHp, heroMaxHp, accent = '#fb923c', vine = false, compact = false }) => {
  const segs = bossSegmentCount(maxHp, hits);
  const per = maxHp / segs;
  const left = Math.max(0, Math.ceil(hp / per - 1e-6));

  // the ghost: the bar's old length, held for a moment, then let go
  const [ghost, setGhost] = useState(left);
  const lastLeft = useRef(left);
  useEffect(() => {
    if (left < lastLeft.current) {
      setGhost(lastLeft.current);
      const t = window.setTimeout(() => setGhost(left), 650);
      lastLeft.current = left;
      return () => window.clearTimeout(t);
    }
    lastLeft.current = left;
    setGhost(left);
    return undefined;
  }, [left]);

  // the same for Pokey's hearts: a heart just lost shows as a flash before it empties
  const [heroGhost, setHeroGhost] = useState(heroHp);
  const lastHero = useRef(heroHp);
  useEffect(() => {
    if (heroHp < lastHero.current) {
      setHeroGhost(lastHero.current);
      const t = window.setTimeout(() => setHeroGhost(heroHp), 700);
      lastHero.current = heroHp;
      return () => window.clearTimeout(t);
    }
    lastHero.current = heroHp;
    setHeroGhost(heroHp);
    return undefined;
  }, [heroHp]);

  const lowHero = heroHp <= 1 && heroHp > 0;
  const nameRef = useFitName(name, vine);
  const notchAt = (r: number) => `${Math.round(r * 1000) / 10}%`;

  return (
    <div className={`boss-hud${vine ? ' vine' : ''}`} style={{ ['--boss-accent' as string]: accent }} role="group" aria-label={vine ? `${name}: ${left} of ${segs} hits left.` : `${name}: ${left} of ${segs} hits left. You have ${heroHp} of ${heroMaxHp} hearts.`}>
      <div className="boss-hud-name">
        <span className="boss-hud-title" ref={nameRef}>{name}</span>
        {vine && compact ? (
          <span className="boss-hud-count fist" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M6 10.5V8a2 2 0 0 1 4 0V7a2 2 0 0 1 4 0v.5a2 2 0 0 1 4 0V14a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5v-2.5a1.5 1.5 0 0 1 3 0" fill="#fbd38d" stroke="#3a2414" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            {left}
          </span>
        ) : (
          <span className="boss-hud-count" aria-hidden="true">
            {left} {left === 1 ? 'hit' : 'hits'} left
          </span>
        )}
      </div>
      <div className="boss-hud-bar" aria-hidden="true">
        <div className="boss-hud-segs">
          {Array.from({ length: segs }).map((_, i) => {
            const on = i < left;
            const fading = !on && i < ghost;
            return <span key={i} className={`boss-seg${on ? ' on' : ''}${fading ? ' ghost' : ''}`} />;
          })}
        </div>
        {/* phase changes: one gold notch each, which lights when the boss has passed it */}
        <span className={`boss-notch${phase >= 2 ? ' passed' : ''}`} style={{ left: notchAt(0.7) }} />
        <span className={`boss-notch${phase >= 3 ? ' passed' : ''}`} style={{ left: notchAt(0.35) }} />
      </div>
      {!vine && <div className={`boss-hud-hearts${lowHero ? ' danger' : ''}`} role="img" aria-label={`Your health: ${heroHp} of ${heroMaxHp} hearts`}>
        {Array.from({ length: heroMaxHp }).map((_, i) => {
          const full = i < heroHp;
          const fading = !full && i < heroGhost;
          const thorn = heroMaxHp > 5 && i === heroMaxHp - 1;
          const fill = full ? (thorn ? '#fbbf24' : '#f43f5e') : fading ? '#ffffff' : 'rgba(255,255,255,.08)';
          const stroke = full ? (thorn ? '#fef3c7' : '#fecdd3') : 'rgba(254,205,211,.4)';
          return (
            <svg key={i} viewBox="0 0 24 24" className={`boss-heart${fading ? ' lost' : ''}`} aria-hidden="true">
              <path d={HEART_PATH} fill={fill} stroke={stroke} strokeWidth="1.6" strokeDasharray={full || fading ? undefined : '3 2.4'} />
            </svg>
          );
        })}
      </div>}
    </div>
  );
};
