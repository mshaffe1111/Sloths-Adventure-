import React from 'react';
import type { Tier } from '../game/badges.ts';

const GLYPH: Record<string, string> = {
  paw: '🐾', star: '⭐', shield: '🛡️', ghost: '👻', flower: '🌸', bolt: '⚡', boot: '🥾', burst: '💥',
  compass: '🧭', crown: '👑', trophy: '🏆', book: '📖', key: '🗝️', heart: '💚', medal: '🎖️',
};

/** a round medal: tier-coloured rim, the badge's glyph inside; grey when not earned yet */
export const BadgeMedal: React.FC<{ icon: string; tier: Tier; earned: boolean; size?: number }> = ({ icon, tier, earned, size = 52 }) => (
  <div className={`tr-medal tr-${tier} ${earned ? '' : 'tr-off'}`} style={{ width: size, height: size, fontSize: size * 0.5 }} aria-hidden>
    {GLYPH[icon] ?? '⭐'}
  </div>
);
