import React from 'react';
import type { SkillId } from '../game/skills.ts';

/** the picture drawn inside each skill medallion (96 x 96 design units) */
const GLYPH: Record<SkillId, React.ReactNode> = {
  shimmy: (
    <>
      <path d="M10 38 Q48 52 86 38" fill="none" stroke="#fde68a" strokeWidth="6" strokeLinecap="round" />
      <path d="M10 38 Q48 52 86 38" fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
      <circle cx="10" cy="38" r="5" fill="#92400e" />
      <circle cx="86" cy="38" r="5" fill="#92400e" />
      <path d="M34 76 C30 62 34 54 48 54 C62 54 66 62 62 76Z" fill="#a16207" stroke="#451a03" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M36 54 C34 44 36 40 40 38M48 52 C48 42 48 38 48 36M60 54 C62 44 60 40 56 38" fill="none" stroke="#fef3c7" strokeWidth="4.5" strokeLinecap="round" />
    </>
  ),
};

/** A round gold-ringed skill badge. `locked` greys it out for a skill that has not been learned yet. */
export const SkillIcon: React.FC<{ skill: SkillId; size?: number; locked?: boolean }> = ({ skill, size = 96, locked = false }) => {
  const id = `sk-${skill}-${locked ? 'l' : 'u'}`;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true" className="shrink-0">
      <defs>
        <radialGradient id={id} cx="50%" cy="35%" r="70%">
          <stop offset="0" stopColor={locked ? '#3b4a44' : '#34d399'} />
          <stop offset="1" stopColor={locked ? '#1c2723' : '#065f46'} />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="44" fill={`url(#${id})`} stroke={locked ? '#6b7f77' : '#fbbf24'} strokeWidth="5" />
      <circle cx="48" cy="48" r="37" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" />
      <g opacity={locked ? 0.45 : 1}>{GLYPH[skill]}</g>
    </svg>
  );
};
