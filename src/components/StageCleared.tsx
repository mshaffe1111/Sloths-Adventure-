import React from 'react';
import { sound } from '../game/audio.ts';
import type { LevelConfig } from '../game/types.ts';
import { HeroPose } from './HeroPose.tsx';
import { getStageClue } from './stageClue.ts';
import type { StageStats } from '../game/badges.ts';
import { ClrChips, ClrRibbon, useShortScreen, type ChipSpec } from './ClrParts.tsx';
import { praiseFor, totalKills } from './stageSummary.ts';

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

interface StageClearedProps {
  levelConfig: LevelConfig;
  starsEarned: number;
  timeSec: number;
  score: number;
  /** this run beat the stored best score (or it is the first clear) */
  newBest: boolean;
  bestScore: number;
  /** what happened in the stage (flowers, foes, hits); absent when nothing was reported */
  stats?: StageStats | null;
  /** ids of the stages either side of this one, or null when there is none (first stage, last stage, secret stage) */
  prevId: string | null;
  nextId: string | null;
  onNext: () => void;
  onPrev: () => void;
  onReplay: () => void;
  onOpenMap: () => void;
}

const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';

const fmtTime = (s: number) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;

/** The stage-cleared card: celebrate, show the result, the next clue, then where to go (next, previous, again, map). */
export const StageCleared: React.FC<StageClearedProps> = ({ levelConfig, starsEarned, timeSec, score, newBest, bestScore, stats, prevId, nextId, onNext, onPrev, onReplay, onOpenMap }) => {
  const secret = !!levelConfig.secret;
  const short = useShortScreen();

  // the stars ring in one after another as the card appears
  React.useEffect(() => {
    if (secret) return;
    const ids: number[] = [];
    for (let i = 1; i <= starsEarned; i++) ids.push(window.setTimeout(() => sound.playStar(i), 350 + (i - 1) * 260));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [secret, starsEarned]);

  const clue = getStageClue(levelConfig.id);
  // Pokey's pose follows the result: arms up for three stars, a fist pump for two, a content smile for one
  const pose = starsEarned >= 3 ? 'cheer_b' : starsEarned === 2 ? 'cheer_a' : 'idle';
  const poseLabel = starsEarned >= 3 ? 'Pokey cheers with both arms up' : starsEarned === 2 ? 'Pokey pumps a fist' : 'Pokey smiles, pleased with himself';
  const praise = praiseFor(stats, starsEarned);
  const extra: ChipSpec[] = [];
  if (stats && stats.floraTotal > 0) extra.push({ label: 'Flowers', value: `${stats.floraCollected}/${stats.floraTotal}`, colour: stats.floraCollected >= stats.floraTotal ? '#f9a8d4' : undefined });
  if (stats) extra.push({ label: 'Foes', value: String(totalKills(stats)) });
  if (stats) extra.push({ label: 'Hits taken', value: String(stats.heartsLost), colour: stats.heartsLost === 0 ? '#6ee7b7' : undefined });
  if (stats && stats.maxCombo >= 2) extra.push({ label: 'Best combo', value: `x${stats.maxCombo}` });
  const heroW = typeof window !== 'undefined' && window.innerHeight <= 520 ? 120 : 196;
  const heroH = Math.round(Math.max(130, Math.min(300, (typeof window !== 'undefined' ? window.innerHeight : 700) * 0.42)));

  return (
    <div className="clr-scrim select-none">
      <svg className="clr-confetti" viewBox="0 0 960 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="#fbbf24">
          <path d="M120 120l5 10 11 1-8 8 2 11-10-6-10 6 2-11-8-8 11-1z" />
          <path d="M850 170l4 8 9 1-6 6 1 9-8-5-8 5 1-9-6-6 9-1z" />
          <path d="M90 520l4 8 9 1-6 6 1 9-8-5-8 5 1-9-6-6 9-1z" />
          <path d="M870 520l4 8 9 1-6 6 1 9-8-5-8 5 1-9-6-6 9-1z" />
        </g>
        <g fill="#34d399">
          <ellipse cx="190" cy="70" rx="9" ry="4.5" transform="rotate(-30 190 70)" />
          <ellipse cx="790" cy="90" rx="9" ry="4.5" transform="rotate(35 790 90)" />
          <ellipse cx="880" cy="400" rx="9" ry="4.5" transform="rotate(-20 880 400)" />
          <ellipse cx="60" cy="300" rx="9" ry="4.5" transform="rotate(25 60 300)" />
        </g>
        <g fill="#f472b6">
          <circle cx="260" cy="40" r="5" />
          <circle cx="720" cy="40" r="5" />
          <circle cx="910" cy="300" r="5" />
          <circle cx="50" cy="420" r="5" />
        </g>
      </svg>

      <div className="clr-card" role="dialog" aria-label="Stage cleared">
        <ClrRibbon title={secret ? 'THORNBARK IS FREE!' : 'STAGE CLEARED!'} />

        <div className="clr-hero">
          <HeroPose frame={pose} height={heroH} maxWidth={heroW} className={`clr-pose s${starsEarned}`} label={poseLabel} />
        </div>

        <div className="clr-main">
          <div className="flex flex-col items-center gap-1">
            <div className="clr-stage">{secret ? 'Secret stage' : `Stage ${levelConfig.id}`} &middot; {levelConfig.name}</div>
            {!secret && (
              <div className="clr-stars" role="img" aria-label={`${starsEarned} of 3 stars`}>
                {[1, 2, 3].map((s) => {
                  const on = s <= starsEarned;
                  const size = s === 2 ? 70 : 56;
                  return (
                    <svg key={s} width={size} height={size} viewBox="0 0 24 24" className={`clr-star ${on ? 'on' : ''}`} style={on ? { animationDelay: `${0.25 + (s - 1) * 0.26}s` } : undefined} aria-hidden="true">
                      <path d={STAR_PATH} fill={on ? '#fbbf24' : 'rgba(255,255,255,.1)'} stroke={on ? '#92400e' : '#6b7f77'} strokeWidth="1.2" strokeLinejoin="round" />
                    </svg>
                  );
                })}
              </div>
            )}
          </div>

          {!secret && (
            <div className="clr-praise">
              <b>{praise.title}</b>
              <span>{praise.sub}</span>
            </div>
          )}

          {(() => {
            const main: ChipSpec[] = [
              { label: 'Time', value: fmtTime(timeSec) },
              { label: 'Score', value: score.toLocaleString(), colour: '#fde68a' },
              { label: newBest ? 'Best' : 'Your best', value: newBest ? 'New!' : bestScore.toLocaleString(), colour: '#6ee7b7' },
            ];
            // on a phone held sideways everything goes in one row to save height
            return short ? <ClrChips chips={[...main, ...extra]} small /> : (
              <>
                <ClrChips chips={main} />
                {extra.length > 0 && <ClrChips chips={extra} small />}
              </>
            );
          })()}

          {secret ? (
            <div className="clr-clue" style={{ background: '#ede9fe', borderColor: '#7c3aed', color: '#2e1065' }}>
              <svg className="shrink-0 mt-0.5" width="26" height="26" viewBox="0 0 24 24" fill="#a78bfa" stroke="#5b21b6" strokeWidth="1.4" aria-hidden="true">
                <path d="M12 21C3 14 1 9 1 6a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 23 6c0 3-2 8-11 15z" />
              </svg>
              <div>
                <h3 style={{ color: '#5b21b6' }}>Thorn Heart earned!</h3>
                <p>The thorns fall away and the Jungle Guardian is himself again. His gift: one extra heart, for every stage from now on.</p>
              </div>
            </div>
          ) : (
            <div className="clr-clue">
              <svg className="shrink-0 mt-0.5" width="26" height="26" viewBox="0 0 24 24" fill="#f472b6" stroke="#9d174d" strokeWidth="1.4" aria-hidden="true">
                <path d="M12 21C3 14 1 9 1 6a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 23 6c0 3-2 8-11 15z" />
              </svg>
              <div>
                <h3>Meeca's trail: {clue.title}</h3>
                <p>{clue.text}</p>
              </div>
            </div>
          )}

          <button type="button" className="pm-go" data-start="true" onClick={onNext}>
            {nextId ? `Next stage ${nextId}` : 'Back to the map'}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#022c22" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          {!COARSE && <p className="clr-note">Space or Enter for the next stage</p>}

          <div className="clr-sec">
            <button type="button" className="clr-btn2" onClick={onPrev} disabled={!prevId} aria-label={prevId ? `Play previous stage ${prevId}` : 'No previous stage'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Previous
            </button>
            <button type="button" className="clr-btn2" onClick={onReplay}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Play again
            </button>
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
