import React from 'react';
import type { SkillId } from '../game/skills.ts';
import { PaintedIcon } from './icons/PaintedIcon.tsx';

/**
 * A skill's badge (icons-painted, 2026-11-01): a painted gold-ringed emerald medallion, the knotted vine rope for Shimmy Rope and the
 * leaf parachute for Leaf Glide (tools/art/icons, spec J). `locked` greys it for a skill not learned yet.
 */
export const SkillIcon: React.FC<{ skill: SkillId; size?: number; locked?: boolean }> = ({ skill, size = 96, locked = false }) => (
  <PaintedIcon name={skill === 'shimmy' ? 'shimmy' : 'glide'} size={size} className={`shrink-0${locked ? ' pic-off' : ''}`} />
);
