import React from 'react';
import { DIFFICULTY_LABEL, runDifficulty, type Difficulty } from '../game/difficulty.ts';

/** a small Easy / Normal chip: the mode this stage is played on (LV-1: the mode was invisible once a game began) */
export const ModeChip: React.FC<{ mode?: Difficulty; className?: string }> = ({ mode, className }) => {
  const m = mode ?? runDifficulty();
  return (
    <span className={`mode-chip ${m}${className ? ` ${className}` : ''}`} aria-label={`${DIFFICULTY_LABEL[m].name} mode`}>
      {DIFFICULTY_LABEL[m].name}
    </span>
  );
};
