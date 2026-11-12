import { PaintedIcon } from './icons/PaintedIcon.tsx';
import { TextGlyph } from './icons/TextGlyph.tsx';
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
import { COUNT_MS, COUNT_START_MS, countProgress, countValue, medalsAtMs, starTimes } from './fx/countUp.ts';
import { createCardClock, DONE_MS, type CardClock } from './fx/cardClock.ts';
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
 * The card's clock (fx/cardClock.ts): ms since it opened, with the sounds on the same timeline; skip() jumps to the end. With motion
 * turned down it starts at the end: final numbers, the stars already up. The medals may be known a moment after the card opens
 * (App.tsx works them out in its own effect): the clock then runs on until their row is in.
 */
function useCardClock(stars: number, hasMedals: boolean, score: number): { ms: number; skip: () => void } {
  const reduced = React.useMemo(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);
  const [ms, setMs] = React.useState(reduced ? DONE_MS : 0);
  const clock = React.useRef<CardClock | null>(null);
  React.useEffect(() => {
    const c = createCardClock({
      stars,
      score,
      reduced,
      host: {
        now: () => performance.now(),
        setTimeout: (f, t) => window.setTimeout(f, t),
        clearTimeout: (id) => window.clearTimeout(id),
        raf: (f) => requestAnimationFrame(f),
        cancelRaf: (id) => cancelAnimationFrame(id),
        setMs,
      },
      sounds: { tick: () => sound.playUiTap(), counted: () => sound.playUiConfirm(), star: (n) => sound.playStar(n), medals: () => sound.playShrineUnlocked() },
    });
    clock.current = c;
    return c.dispose;
    // (once, as the card opens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (hasMedals) clock.current?.medals();
  }, [hasMedals]);
  const skip = React.useCallback(() => clock.current?.skip(), []);
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
              <PaintedIcon name="thornHeart" size={32} className="shrink-0 mt-0.5" />
              <div>
                <h3 style={{ color: '#5b21b6' }}>Thorn Heart earned!</h3>
                <p>The thorns fall away and the Jungle Guardian is himself again. His gift: one extra heart, for every stage from now on.</p>
              </div>
            </div>
          ) : (
            <div className="clr-clue">
              <PaintedIcon name="heart" size={30} className="shrink-0 mt-0.5" />
              <div>
                <h3>Meeca's trail: {clue.title}</h3>
                <p>{clue.text}</p>
              </div>
            </div>
          )}

          <button type="button" className="pm-go" data-start="true" onClick={onNext}>
            {nextId ? `Next stage ${nextId}` : 'Back to the map'}
            <TextGlyph name="arrow" size={24} />
          </button>
          {!COARSE && <p className="clr-note">Space or Enter for the next stage</p>}

          <div className="clr-sec">
            <button type="button" className="clr-btn2" onClick={onPrev} disabled={!prevId} aria-label={prevId ? `Play previous stage ${prevId}` : 'No previous stage'}>
              <PaintedIcon name="back" size={22} />
              Previous
            </button>
            <button type="button" className="clr-btn2" onClick={onReplay}>
              <PaintedIcon name="restart" size={22} />
              Play again
            </button>
            <button type="button" className="clr-btn2" onClick={onOpenMap}>
              <PaintedIcon name="map" size={24} />
              World map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
