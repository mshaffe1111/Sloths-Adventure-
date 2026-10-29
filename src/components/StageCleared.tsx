import React from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import { DotPerched } from './KitParts.tsx';
import { sound } from '../game/audio.ts';
import type { LevelConfig } from '../game/types.ts';
import { HeroPose } from './HeroPose.tsx';
import { getStageClue } from './stageClue.ts';
import type { StageStats } from '../game/badges.ts';
import { ClrChips, ClrRibbon, useShortScreen, type ChipSpec } from './ClrParts.tsx';
import { praiseFor, totalKills } from './stageSummary.ts';
import { confettiPieces, type ConfettiPiece } from './fx/confetti.ts';
import './hud/cleared.css';

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

/** the card laid out in one column (a phone held upright): Pokey goes beside the stars, the chips in rows of three */
const UPRIGHT = '(max-width: 640px) and (min-height: 521px)';
function useUpright(): boolean {
  const [on, setOn] = React.useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(UPRIGHT).matches);
  React.useEffect(() => {
    const m = window.matchMedia?.(UPRIGHT);
    if (!m) return;
    const f = () => setOn(m.matches);
    m.addEventListener?.('change', f);
    return () => m.removeEventListener?.('change', f);
  }, []);
  return on;
}

/** the chips the upright card has room for (two rows of three), the ones that say most about the run first */
const UPRIGHT_ORDER = ['Time', 'Score', 'Best', 'Your best', 'Flowers', 'Hits taken', 'Lives lost', 'Foes', 'Best combo'];
const uprightChips = (chips: ChipSpec[]): ChipSpec[] =>
  [...chips].sort((a, b) => UPRIGHT_ORDER.indexOf(a.label) - UPRIGHT_ORDER.indexOf(b.label)).slice(0, 6);

/** sideways, seven chips share one row: the two-word labels are cut to one, so none wraps at 12 px (UI-14) */
const SHORT_LABEL: Record<string, string> = { 'Hits taken': 'Hits', 'Best combo': 'Combo', 'Lives lost': 'Lives', 'Your best': 'Best' };
const shortLabel = (c: ChipSpec): ChipSpec => (SHORT_LABEL[c.label] ? { ...c, label: SHORT_LABEL[c.label] } : c);

const CONFETTI_PATH: Record<ConfettiPiece['kind'], React.ReactNode> = {
  star: <path d="M12 2l2.6 6.3 6.8.6-5.2 4.4 1.6 6.7L12 16.4 6.2 20l1.6-6.7L2.6 8.9l6.8-.6z" />,
  leaf: <ellipse cx="12" cy="12" rx="10" ry="5" />,
  dot: <circle cx="12" cy="12" r="6" />,
};

/** the confetti: thrown once as the card opens, falling over 1.6 s (UI-3); held still where motion is turned down */
const Confetti: React.FC<{ stars: number }> = ({ stars }) => {
  const pieces = React.useMemo(() => confettiPieces(stars), [stars]);
  return (
    <div className="clr-confetti" aria-hidden="true">
      {pieces.map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={c.size}
          height={c.size}
          fill={c.colour}
          className="clr-bit"
          style={{
            left: `${c.x}%`,
            animationDelay: `${c.delay}ms`,
            animationDuration: `${c.fall}ms`,
            ['--drift' as string]: `${c.drift}vw`,
            ['--spin' as string]: `${c.spin}deg`,
            // (where it rests when motion is turned down: scattered down the screen, as the old still picture was)
            ['--rest' as string]: `${8 + ((i * 37) % 84)}vh`,
          }}
        >
          {CONFETTI_PATH[c.kind]}
        </svg>
      ))}
    </div>
  );
};

const fmtTime = (s: number) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;

/** The stage-cleared card: celebrate, show the result, the next clue, then where to go (next, previous, again, map). */
export const StageCleared: React.FC<StageClearedProps> = ({ levelConfig, starsEarned, timeSec, score, newBest, bestScore, stats, prevId, nextId, onNext, onPrev, onReplay, onOpenMap }) => {
  const secret = !!levelConfig.secret;
  const short = useShortScreen();
  const upright = useUpright();

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
  // hits are the hearts knocked off him; a fall into a pit or the water costs a life with no hit, so lives lost get their own chip
  // ("Hits taken 0" after three falls read as a lie, 2026-10-25), and the green "clean run" colour only shows when neither happened
  if (stats) extra.push({ label: 'Hits taken', value: String(stats.heartsLost), colour: stats.heartsLost === 0 && stats.livesLost === 0 ? '#6ee7b7' : undefined });
  if (stats && stats.livesLost > 0) extra.push({ label: 'Lives lost', value: String(stats.livesLost) });
  if (stats && stats.maxCombo >= 2) extra.push({ label: 'Best combo', value: `x${stats.maxCombo}` });
  const heroW = typeof window !== 'undefined' && window.innerHeight <= 520 ? 120 : 196;
  const heroH = Math.round(Math.max(130, Math.min(300, (typeof window !== 'undefined' ? window.innerHeight : 700) * 0.42)));

  return (
    <div className="clr-scrim select-none">
      <GhostOnExit />
      <Confetti stars={secret ? 3 : starsEarned} />

      <div className="clr-card clr-won" role="dialog" aria-label="Stage cleared">
        <ClrRibbon title={secret ? 'THORNBARK IS FREE!' : 'STAGE CLEARED!'} />

        <div className="clr-hero">
          <HeroPose frame={pose} height={heroH} maxWidth={heroW} className={`clr-pose s${starsEarned}`} label={poseLabel} />
          {/* Dot, his guide, perched beside him for the moment (painted perch frame, held still) */}
          <DotPerched size={58} className="clr-dot" facing="left" />
        </div>

        <div className="clr-main">
          <div className="flex flex-col items-center gap-1">
            <div className="clr-stage">{secret ? 'Secret stage' : `Stage ${levelConfig.id}`} &middot; {levelConfig.name}</div>
            {!secret && (
              <div className="clr-starrow">
              {/* (upright the hero column is gone, so Pokey stands here, beside his stars: UI-1) */}
              {upright && <HeroPose frame={pose} height={96} maxWidth={84} className={`clr-pose clr-mini s${starsEarned}`} label={poseLabel} />}
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
            // on a phone held sideways everything goes in one row to save height; upright, two rows of three (UI-1)
            if (upright) return <ClrChips chips={uprightChips([...main, ...extra])} cols={3} />;
            return short ? <ClrChips chips={[...main, ...extra].map(shortLabel)} small /> : (
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
