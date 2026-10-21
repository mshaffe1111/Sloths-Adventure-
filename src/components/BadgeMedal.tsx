import React from 'react';
import type { Tier } from '../game/badges.ts';
import { Icon } from './icons/index.tsx';
import { Crest } from './icons/Crest.tsx';
import { badgeIconName } from './icons/badgeIcons.ts';

/**
 * A round medal: a tier-coloured rim (bronze, silver or gold) around a dark green inlay that holds the badge's icon, or a guardian's
 * painted crest for the guardian badges. Grey when not earned yet.
 */
export const BadgeMedal: React.FC<{ icon: string; tier: Tier; earned: boolean; size?: number; /** the world, for a guardian badge */ world?: number }> = ({ icon, tier, earned, size = 52, world }) => (
  <div className={`tr-medal tr-${tier} ${earned ? '' : 'tr-off'}`} style={{ width: size, height: size }} aria-hidden>
    <span className="tr-inlay">{world ? <Crest world={world} size={Math.round(size * 0.74)} bare locked={!earned} /> : <Icon name={badgeIconName(icon)} size={Math.round(size * 0.52)} />}</span>
  </div>
);
