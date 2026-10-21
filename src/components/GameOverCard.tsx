import React from 'react';
import type { LevelConfig } from '../game/types.ts';
import type { StageStats } from '../game/badges.ts';
import { HeroPose } from './HeroPose.tsx';
import { ClrChips, ClrRibbon, type ChipSpec } from './ClrParts.tsx';
import { totalKills, tuckeredLine } from './stageSummary.ts';

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

const fmtTime = (s: number) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;

interface GameOverCardProps {
  levelConfig: LevelConfig;
  score: number;
  stats?: StageStats | null;
  onRetry: () => void;
  onOpenMap: () => void;
}

/** Out of lives: the same card family as Stage Cleared, in dusk colours, with Pokey having a lie-down and a kind word. */
export const GameOverCard: React.FC<GameOverCardProps> = ({ levelConfig, score, stats, onRetry, onOpenMap }) => {
  const heroW = typeof window === 'undefined' ? 240 : window.innerHeight <= 520 ? 130 : Math.min(240, window.innerWidth - 120);
  const heroH = Math.round(Math.max(90, Math.min(170, (typeof window !== 'undefined' ? window.innerHeight : 700) * 0.24)));
  const chips: ChipSpec[] = [{ label: 'Score', value: score.toLocaleString(), colour: '#fde68a' }];
  if (stats && stats.timeSec > 0) chips.push({ label: 'Time', value: fmtTime(stats.timeSec) });
  if (stats && stats.floraTotal > 0) chips.push({ label: 'Flowers', value: `${stats.floraCollected}/${stats.floraTotal}` });
  if (stats && totalKills(stats) > 0) chips.push({ label: 'Foes', value: String(totalKills(stats)) });

  return (
    <div className="clr-scrim lost select-none">
      <div className="clr-card lost" role="dialog" aria-label="Out of lives">
        <ClrRibbon title="TUCKERED OUT!" tone="dusk" />

        <div className="clr-hero">
          <HeroPose frame="ko" height={heroH} maxWidth={heroW} className="clr-pose ko" label="Pokey is having a lie-down" />
        </div>

        <div className="clr-main">
          <div className="clr-stage">Stage {levelConfig.id} &middot; {levelConfig.name}</div>

          <div className="clr-praise lost">
            <b>Out of lives</b>
            <span>{tuckeredLine(levelConfig.id)}</span>
          </div>

          <ClrChips chips={chips} />

          <p className="clr-safe">Your stars and finished stages are safe.</p>

          <button type="button" className="pm-go" data-start="true" onClick={onRetry}>
            Try again
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#022c22" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          {!COARSE && <p className="clr-note">Space or Enter to try again</p>}

          <div className="clr-sec one">
            <button type="button" className="clr-btn2" onClick={onOpenMap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" />
                <path d="M9 4v14M15 6v14" />
              </svg>
              World map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
