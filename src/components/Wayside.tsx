import React from 'react';
import type { LevelConfig } from '../game/types.ts';
import { DotGuide, type DotGuideProps } from './dot/DotGuide.tsx';

interface Props {
  level: LevelConfig;
  /** play is running: not paused, and no lesson card, coach step or reader is up */
  active: boolean;
  /** how far along the stage (0-1) */
  ratio: number;
  hp: number;
  /** a guiding line from the engine (a stage tip, the goal, a reminder, the sealed door); `n` counts up with each new one */
  guide?: { text: string; ms: number; n: number } | null;
  /** what Dot's guide needs besides */
  dot: Pick<DotGuideProps, 'engine' | 'playing' | 'coachStep' | 'coachStyle' | 'lessonId' | 'count'>;
}

/**
 * The story and the teaching while you play: Dot's guide (dot/DotGuide.tsx), one line at a time, perched by the thing she is teaching.
 * Mount it with a key that changes for every new run of a stage.
 */
export const Wayside: React.FC<Props> = (props) => <DotGuide level={props.level} ratio={props.ratio} hp={props.hp} guide={props.guide} {...props.dot} />;
