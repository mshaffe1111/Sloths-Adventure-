import React, { useEffect, useRef, useState } from 'react';
import type { LevelConfig } from '../game/types.ts';
import { DotFace } from './DotFace.tsx';
import { SpeakerMark } from './SpeakerMark.tsx';
import { restFace } from '../game/dotSprite.ts';
import { GAP_MS, HURT_WINDOW_MS, dotPresent, dueLine, guideShowMs, hidesFern, markShown, showMs, wasShown, waysideApplies, waysideEnabled, type WayFlag, type WayLine } from '../game/wayside.ts';
import { findForStage, loadFinds } from '../game/finds.ts';
import { newLookOn } from '../game/newLook.ts';
import { beginStageLook } from '../game/dotGuide.ts';
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
  /** what the new look's guide needs besides (newLook.ts): without it, or with the new look off, this is today's banner */
  dot?: Pick<DotGuideProps, 'engine' | 'playing' | 'coachStep' | 'coachStyle' | 'lessonId' | 'count'>;
}

const WHO: Record<WayLine['who'], { color: string; name: string }> = {
  Dot: { color: '#4fd18b', name: 'Dot' },
  Pokey: { color: '#ffb02e', name: 'Pokey' },
  Petal: { color: '#f58ab4', name: '' },
};

/** Dot's face on his line: his beak moves while he talks (about as long as the line takes to read), then he holds the look the line calls for */
const WayDot: React.FC<{ text: string; hurt: boolean }> = ({ text, hurt }) => {
  const [talking, setTalking] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setTalking(false), Math.min(4200, 700 + text.length * 55));
    return () => window.clearTimeout(id);
  }, [text]);
  return <DotFace size={56} talking={talking} face={restFace(text, hurt)} className="way-dot" />;
};

const TICK_MS = 200;
/** a line counts as heard (and is not repeated on a replay) once it has been up this long */
const HEARD_MS = 1500;
/** a line cut short by Dot's guiding comes back, but a line comes up at most this often in one run of a stage */
const MAX_TRIES = 2;

interface Run {
  played: number;
  hurtAt: number;
  prevHp: number;
  gapUntil: number;
  L: boolean;
  H: boolean;
  F: boolean;
  cur: null | { flag: WayFlag; left: number; seen: number; marked: boolean };
  /** how many times each line has come up in this run: one Dot cut short comes back once, never again after that */
  tries: Record<WayFlag, number>;
  n: number;
  /** the guiding line being said, and the last one taken from the engine */
  guide: null | { text: string; left: number; ms: number; n: number };
  lastGuide: number;
}

/** a guiding line stays up at least as long as a story line of its length, and no longer than this */

/**
 * The story while you play: one small line at a time from Dot, Pokey or the petal, a few per stage (see game/wayside.ts).
 * It reads a stage's own clock (only the time the game is actually running), waits for a calm moment, and never takes a tap.
 * Mount it with a key that changes for every new run of a stage.
 */
export const Wayside: React.FC<Props> = (props) => {
  // the look is fixed for this run of the stage (Wayside is mounted afresh for each run)
  const [look] = useState(() => beginStageLook(!!props.dot && newLookOn()));
  if (look && props.dot) return <DotGuide level={props.level} ratio={props.ratio} hp={props.hp} guide={props.guide} {...props.dot} />;
  return <WaysideBanner {...props} />;
};

/** today's banner (the new look off) */
const WaysideBanner: React.FC<Props> = ({ level, active, ratio, hp, guide }) => {
  const world = level.worldIndex;
  const mini = level.miniIndex;
  const applies = waysideApplies(level);
  const [run] = useState<Run>(() => ({
    played: 0,
    hurtAt: -1,
    prevHp: hp,
    gapUntil: 0,
    L: wasShown(world, mini, 'L'),
    H: wasShown(world, mini, 'H'),
    F: wasShown(world, mini, 'F'),
    cur: null,
    tries: { L: 0, H: 0, F: 0 },
    n: 0,
    guide: null,
    // a line from before this run of the stage is not said again
    lastGuide: guide?.n ?? 0,
  }));
  const [line, setLine] = useState<(WayLine & { n: number }) | null>(null);
  const [guideShown, setGuideShown] = useState<{ text: string; ms: number; n: number } | null>(null);

  // a guiding line comes first: a story line on screen gives way (and, if it was not heard yet, comes again later)
  useEffect(() => {
    if (!guide || guide.n <= run.lastGuide) return;
    run.lastGuide = guide.n;
    // (an empty line takes the one on screen down: the moment it was for has passed)
    if (!guide.text) {
      if (run.guide) {
        run.guide = null;
        setGuideShown(null);
      }
      return;
    }
    if (run.cur) {
      run.cur = null;
      setLine(null);
    }
    const ms = guideShowMs(guide.text, guide.ms);
    run.guide = { text: guide.text, left: ms, ms, n: guide.n };
    setGuideShown({ text: guide.text, ms, n: guide.n });
  }, [guide, run]);

  // the guiding line's clock runs only while play does (a paused game keeps the line up)
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      const g = run.guide;
      if (!g) return;
      g.left -= TICK_MS;
      if (g.left <= 0) {
        run.guide = null;
        run.gapUntil = run.played + GAP_MS;
        setGuideShown(null);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [active, run]);
  const ratioRef = useRef(ratio);
  ratioRef.current = ratio;

  // a fall: remember when (the reply comes a beat later, and only the first one in a stage gets one)
  useEffect(() => {
    if (hp < run.prevHp && hp > 0 && run.hurtAt < 0) run.hurtAt = run.played;
    if (hp <= 0) run.hurtAt = -1;
    run.prevHp = hp;
  }, [hp, run]);

  useEffect(() => {
    if (!applies || !active || !waysideEnabled()) return;
    const id = window.setInterval(() => {
      run.played += TICK_MS;
      // story lines wait while Dot is guiding
      if (run.guide) return;
      const cur = run.cur;
      if (cur) {
        cur.seen += TICK_MS;
        cur.left -= TICK_MS;
        if (!cur.marked && (cur.seen >= HEARD_MS || cur.left <= 0)) {
          markShown(world, mini, cur.flag);
          run[cur.flag] = true;
          cur.marked = true;
        }
        if (cur.left <= 0) {
          run.cur = null;
          run.gapUntil = run.played + GAP_MS;
          setLine(null);
        }
        return;
      }
      if (run.hurtAt >= 0 && run.played - run.hurtAt > HURT_WINDOW_MS) run.hurtAt = -1;
      if (run.played < run.gapUntil) return;
      const due = dueLine({
        world,
        mini,
        ratio: ratioRef.current,
        playedMs: run.played,
        hurtAgoMs: run.hurtAt >= 0 ? run.played - run.hurtAt : undefined,
        shownL: run.L,
        shownH: run.H,
        // a stage that hides a fern says so once at the start, unless the fern's find is already in the Library
        fernOpen: hidesFern(world, mini) && !loadFinds().includes(findForStage(world, mini)?.id ?? ''),
        shownF: run.F,
      });
      if (!due) return;
      // (said twice in this run already, cut short both times: it waits for the next run)
      if (run.tries[due.flag] >= MAX_TRIES) {
        run[due.flag] = true;
        return;
      }
      run.tries[due.flag] += 1;
      if (due.flag === 'H') run.hurtAt = -1;
      run.cur = { flag: due.flag, left: showMs(due.line.text), seen: 0, marked: false };
      run.n += 1;
      setLine({ ...due.line, n: run.n });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [applies, active, world, mini, run]);

  if (guideShown && active && run.guide) {
    // Dot guides; where the story has her away (late World 6, World 7, World 10) it is Pokey's own thought
    const dot = dotPresent(world, mini);
    const g = WHO[dot ? 'Dot' : 'Pokey'];
    return (
      <div
        key={`g${guideShown.n}`}
        className="way way-guide"
        role="status"
        aria-live="polite"
        style={{ ['--dot' as string]: g.color, ['--way-ms' as string]: `${Math.max(1200, guideShown.ms)}ms` }}
      >
        {dot && <WayDot text={guideShown.text} hurt={false} />}
        <span className="way-chip">
          {!dot && (
            <i aria-hidden="true">
              <SpeakerMark name="Pokey" size={20} />
            </i>
          )}
          {g.name}
        </span>
        <p className="way-text">{guideShown.text}</p>
      </div>
    );
  }
  if (!line || !active || !run.cur) return null;
  const w = WHO[line.who];
  const narr = line.who === 'Petal';
  return (
    <div
      key={line.n}
      className={`way ${narr ? 'way-narr' : ''}`}
      role="status"
      aria-live="polite"
      style={{ ['--dot' as string]: w.color, ['--way-ms' as string]: `${Math.max(1200, run.cur.left)}ms` }}
    >
      {line.who === 'Dot' && <WayDot text={line.text} hurt={run.cur.flag === 'H'} />}
      <span className={`way-chip ${w.name ? '' : 'way-bare'}`}>
        {line.who !== 'Dot' && (
          <i aria-hidden="true">
            <SpeakerMark name={line.who} size={20} />
          </i>
        )}
        {w.name}
      </span>
      <p className="way-text">{line.text}</p>
    </div>
  );
};
