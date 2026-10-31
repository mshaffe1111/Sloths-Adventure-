import React from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import { DotPerched } from './KitParts.tsx';
import { sound } from '../game/audio.ts';
import type { LevelConfig } from '../game/types.ts';
import { HeroPose } from './HeroPose.tsx';
import { getStageClue } from './stageClue.ts';
import type { StageStats } from '../game/badges.ts';
import { ClrChips, ClrRibbon, useShortScreen, type ChipSpec } from './ClrParts.tsx';
import { floraChip, praiseFor, totalKills } from './stageSummary.ts';
import { ModeChip } from './ModeChip.tsx';
import { confettiPieces, type ConfettiPiece } from './fx/confetti.ts';
import { COUNT_MS, COUNT_START_MS, countProgress, countValue, medalsAtMs, starTimes, tickTimes } from './fx/countUp.ts';
import { BadgeMedal } from './BadgeMedal.tsx';
import { KitPiece } from './icons/index.tsx';
import type { BadgeDef } from '../game/badges.ts';
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
  /** the medals this run earned, shown in a row under the stars (UI-9) */
  medals?: BadgeDef[];
  /** ids of the stages either side of this one, or null when there is none (first stage, last stage, secret stage) */
  prevId: string | null;
  nextId: string | null;
  onNext: () => void;
  onPrev: () => void;
  onReplay: () => void;
  onOpenMap: () => void;
}

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
const UPRIGHT_ORDER = ['Time', 'Score', 'Best', 'Your best', 'Petals', 'Petal goal', 'Hits taken', 'Lives lost', 'Foes'];
const uprightChips = (chips: ChipSpec[]): ChipSpec[] =>
  [...chips].sort((a, b) => UPRIGHT_ORDER.indexOf(a.label) - UPRIGHT_ORDER.indexOf(b.label)).slice(0, 6);

/** sideways, seven chips share one row: the two-word labels are cut to one, so none wraps at 12 px (UI-14) */
const SHORT_LABEL: Record<string, string> = { 'Petal goal': 'Petals', 'Hits taken': 'Hits', 'Lives lost': 'Lives', 'Your best': 'Best' };
const shortLabel = (c: ChipSpec): ChipSpec => (SHORT_LABEL[c.label] ? { ...c, label: SHORT_LABEL[c.label] } : c);

const CONFETTI_PATH: Record<ConfettiPiece['kind'], React.ReactNode> = {
  star: <path d="M12 2l2.6 6.3 6.8.6-5.2 4.4 1.6 6.7L12 16.4 6.2 20l1.6-6.7L2.6 8.9l6.8-.6z" />,
  leaf: <ellipse cx="12" cy="12" rx="10" ry="5" />,
  dot: <circle cx="12" cy="12" r="6" />,
};

/** the confetti: thrown once as the card opens, falling over 1.6 s (UI-3); held still where motion is turned down */
const Confetti: React.FC<{ stars: number }> = React.memo(({ stars }) => {
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
});

/**
 * The card's clock (fx/countUp.ts): ms since it opened, ticking each frame until the medals are in, with the sounds on the same
 * timeline (a soft tick while the numbers count, a chime as they land, a ring for each star, the medal chime). skip() jumps to the end.
 * With motion turned down it starts at the end: final numbers, the stars already up.
 */
const DONE_MS = 1e6;
function useCardClock(stars: number, hasMedals: boolean, score: number): { ms: number; skip: () => void } {
  const reduced = React.useMemo(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);
  const [ms, setMs] = React.useState(reduced ? DONE_MS : 0);
  const timers = React.useRef<number[]>([]);
  const raf = React.useRef(0);
  const clear = React.useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    cancelAnimationFrame(raf.current);
  }, []);
  React.useEffect(() => {
    const end = hasMedals ? medalsAtMs(stars) : Math.max(COUNT_START_MS + COUNT_MS, ...starTimes(stars));
    const at = (t: number, f: () => void) => timers.current.push(window.setTimeout(f, t));
    if (reduced) {
      // (no count to hear: the stars ring together, as the card shows them)
      if (stars > 0) at(200, () => sound.playStar(stars));
      if (hasMedals) at(500, () => sound.playShrineUnlocked());
      return clear;
    }
    for (const t of tickTimes(score)) at(t, () => sound.playUiTap());
    at(COUNT_START_MS + COUNT_MS, () => sound.playUiConfirm());
    starTimes(stars).forEach((t, i) => at(t, () => sound.playStar(i + 1)));
    if (hasMedals) at(medalsAtMs(stars), () => sound.playShrineUnlocked());
    const t0 = performance.now();
    let last = -1;
    const step = () => {
      const now = performance.now() - t0;
      // (stepped at the game's 30 fps: the card re-draws a few pieces each step, not every display frame)
      if (now - last >= 33) {
        last = now;
        setMs(now);
      }
      if (now < end + 50) raf.current = requestAnimationFrame(step);
      else done.current = true;
    };
    raf.current = requestAnimationFrame(step);
    return clear;
    // (once, as the card opens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const done = React.useRef(reduced);
  const skip = React.useCallback(() => {
    if (done.current) return;
    done.current = true;
    clear();
    if (stars > 0) sound.playStar(stars);
    setMs(DONE_MS);
  }, [clear, stars]);
  return { ms, skip };
}

/** the row of medals this run earned: they come in after the last star, with the medal chime (UI-9) */
const Medals: React.FC<{ medals: BadgeDef[]; on: boolean; size: number }> = ({ medals, on, size }) => (
  <div className={`clr-medals${on ? ' in' : ''}`} role="img" aria-label={`New medal${medals.length > 1 ? 's' : ''}: ${medals.map((b) => b.name).join(', ')}`}>
    <span className="clr-medals-k">New {medals.length > 1 ? 'medals' : 'medal'}</span>
    {medals.map((b) => (
      <BadgeMedal key={b.id} badge={b} earned size={size} />
    ))}
  </div>
);

const fmtTime = (s: number) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;

/** The stage-cleared card: celebrate, show the result, the next clue, then where to go (next, previous, again, map). */
export const StageCleared: React.FC<StageClearedProps> = ({ levelConfig, starsEarned, timeSec, score, newBest, bestScore, stats, medals, prevId, nextId, onNext, onPrev, onReplay, onOpenMap }) => {
  const secret = !!levelConfig.secret;
  const short = useShortScreen();
  const upright = useUpright();

  const medalRow = (medals ?? []).slice(0, 6);
  const { ms, skip } = useCardClock(secret ? 0 : starsEarned, medalRow.length > 0, score);
  const p = countProgress(ms);
  const landed = starTimes(secret ? 0 : starsEarned).filter((t) => t <= ms).length;
  const counted = ms >= COUNT_START_MS + COUNT_MS;
  const medalsIn = ms >= medalsAtMs(secret ? 0 : starsEarned);

  const clue = getStageClue(levelConfig.id);
  // Pokey's pose follows the result: arms up for three stars, a fist pump for two, a content smile for one
  const pose = starsEarned >= 3 ? 'cheer_b' : starsEarned === 2 ? 'cheer_a' : 'idle';
  const poseLabel = starsEarned >= 3 ? 'Pokey cheers with both arms up' : starsEarned === 2 ? 'Pokey pumps a fist' : 'Pokey smiles, pleased with himself';
  const praise = praiseFor(stats, starsEarned);
  const extra: ChipSpec[] = [];
  // (the flowers chip means the same on every card: stageSummary.ts floraChip, UI-10; the count goes up with the score)
  const flora = floraChip(stats);
  if (flora) extra.push({ label: flora.label, value: `${countValue(flora.cur, p)}/${flora.of}`, colour: counted && flora.full ? '#f9a8d4' : undefined });
  if (stats) extra.push({ label: 'Foes', value: String(totalKills(stats)) });
  // hits are the hearts knocked off him; a fall into a pit or the water costs a life with no hit, so lives lost get their own chip
  // ("Hits taken 0" after three falls read as a lie, 2026-10-25), and the green "clean run" colour only shows when neither happened
  if (stats) extra.push({ label: 'Hits taken', value: String(stats.heartsLost), colour: stats.heartsLost === 0 && stats.livesLost === 0 ? '#6ee7b7' : undefined });
  if (stats && stats.livesLost > 0) extra.push({ label: 'Lives lost', value: String(stats.livesLost) });
  const heroW = typeof window !== 'undefined' && window.innerHeight <= 520 ? 120 : 196;
  const heroH = Math.round(Math.max(130, Math.min(300, (typeof window !== 'undefined' ? window.innerHeight : 700) * 0.42)));
  // (made once: the count re-draws the card 30 times a second for a moment, and Pokey and Dot never change in it)
  const hero = React.useMemo(
    () => (
      <div className="clr-hero">
        <HeroPose frame={pose} height={heroH} maxWidth={heroW} className={`clr-pose s${starsEarned}`} label={poseLabel} />
        {/* Dot, his guide, perched beside him for the moment (painted perch frame, held still) */}
        <DotPerched size={58} className="clr-dot" facing="left" />
      </div>
    ),
    [pose, heroH, heroW, starsEarned, poseLabel],
  );

  return (
    // (a tap anywhere that is not a button skips the count to the end)
    <div className="clr-scrim select-none" onPointerDown={(e) => !(e.target as HTMLElement).closest('button') && skip()}>
      <GhostOnExit />
      <Confetti stars={secret ? 3 : starsEarned} />

      <div className="clr-card clr-won" role="dialog" aria-label="Stage cleared">
        <ClrRibbon title={secret ? 'THORNBARK IS FREE!' : 'STAGE CLEARED!'} />

        {hero}

        <div className="clr-main">
          <div className="flex flex-col items-center gap-1">
            <div className="clr-stage">
              {secret ? 'Secret stage' : `Stage ${levelConfig.id}`} &middot; {levelConfig.name} <ModeChip />
            </div>
            {!secret && (
              <div className="clr-starrow">
              {/* (upright the hero column is gone, so Pokey stands here, beside his stars: UI-1) */}
              {upright && <HeroPose frame={pose} height={96} maxWidth={84} className={`clr-pose clr-mini s${starsEarned}`} label={poseLabel} />}
              <div className="clr-stars" role="img" aria-label={`${starsEarned} of 3 stars`}>
                {[1, 2, 3].map((s) => {
                  // (each earned star stays an empty slot until its turn, then drops in: the counts first, then the stars)
                  const on = s <= landed;
                  const size = s === 2 ? 70 : 56;
                  return (
                    <KitPiece key={s} piece={on ? 'starFull' : 'starEmpty'} width={size} className={`clr-star ${on ? 'on' : ''}`} />
                  );
                })}
              </div>
              {short && medalRow.length > 0 && <Medals medals={medalRow} on={medalsIn} size={30} />}
              </div>
            )}
            {/* the medals this run earned, under the stars (UI-9; sideways, beside them, where there is no height to spare) */}
            {!short && medalRow.length > 0 && <Medals medals={medalRow} on={medalsIn} size={38} />}
          </div>

          {!secret && (
            <div className={`clr-praise${landed >= starsEarned && counted ? ' in' : ''}`}>
              <b>{praise.title}</b>
              <span>{praise.sub}</span>
            </div>
          )}

          {(() => {
            const main: ChipSpec[] = [
              { label: 'Time', value: fmtTime(timeSec * p) },
              { label: 'Score', value: countValue(score, p).toLocaleString(), colour: '#fde68a' },
              // ("New!" waits for the score to finish counting, then pops)
              { label: newBest ? 'Best' : 'Your best', value: newBest ? (counted ? 'New!' : '\u2013') : bestScore.toLocaleString(), colour: '#6ee7b7', pop: newBest && counted },
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
