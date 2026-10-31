/**
 * The stage-start goal card (new HUD, beta): a short parchment card at the top centre ("This stage: collect 33 petals"), hung on two
 * threads. After its reading time (about 3-4 s), or on the player's first touch or key, it shrinks into the goal counter, so the
 * player sees where the goal lives. It never waits for a tap (a tap is a punch). On a retry of the same stage only a one-second
 * version plays: the icon and "0/16" sliding into the counter.
 *
 * While it is up, <html> carries `data-hud-card="1"`, so Dot's lines can wait for it (the two share the top-centre lane).
 */
import React from 'react';
import type { GoalInfo } from './goalInfo.ts';
import { GoalPic } from './hudArt.tsx';
import { readMs, type HudMode, type LaneRect } from './hudLayout.ts';
import { fillStyle, useHudArt } from './painted.tsx';
import { ModeChip } from '../ModeChip.tsx';
import { easeInLine } from '../../game/difficulty.ts';
import { startGoalCard, type CardPhase } from './goalCardClock.ts';

/** stages whose full card has been shown this session (a retry gets the short one) */
const SEEN = new Set<string>();
/** for the tests and the screenshot tool: forget which cards were seen */
export function forgetGoalCards() {
  SEEN.clear();
}
/** true while a goal card is on screen (Dot's lines may wait for it) */
export function goalCardUp(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.hudCard === '1';
}

interface Props {
  stageId: string;
  /** "1-5 · More Petals" */
  label: string;
  info: GoalInfo;
  target: number;
  lane: LaneRect;
  mode: HudMode;
  /** the counter it shrinks into */
  counter: React.RefObject<HTMLElement | null>;
}

export const GoalCard: React.FC<Props> = ({ stageId, label, info, target, lane, mode, counter }) => {
  const quick = React.useMemo(() => SEEN.has(stageId), [stageId]);
  const [phase, setPhase] = React.useState<CardPhase>('in');
  const [to, setTo] = React.useState<{ x: number; y: number } | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const art = useHudArt();
  const reduced = React.useMemo(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);
  // (its words are read when it starts; a later change of the words, a count arriving from the engine, only redraws it: UI-22)
  const line = React.useRef(info.line);
  line.current = info.line;

  // the clock runs once per stage run (keyed on the stage, never on the words: UI-22, goalCardClock.ts)
  React.useEffect(() => {
    SEEN.add(stageId);
    const root = document.documentElement;
    root.dataset.hudCard = '1';
    // (the reading time of its main line, 1.5 s + 0.5 s a word: about 4 s, never past 4.5 s)
    // (and a moment more for the easing's line, LV-7)
    const ease = easeInLine(stageId);
    const holdMs = quick ? 900 : Math.min(ease ? 6000 : 4500, readMs(ease ? `${line.current} ${ease}` : line.current, 3000));
    const clock = startGoalCard({
      quick,
      holdMs,
      reducedMotion: reduced,
      timers: { set: (fn, ms) => window.setTimeout(fn, ms), clear: (id) => window.clearTimeout(id) },
      // (where the counter is, so it shrinks into it)
      onShrink: () => {
        const me = ref.current?.getBoundingClientRect();
        const c = counter.current?.getBoundingClientRect();
        if (me && c) setTo({ x: c.left + c.width / 2 - (me.left + me.width / 2), y: c.top + c.height / 2 - (me.top + me.height / 2) });
      },
      onPhase: (p) => {
        setPhase(p);
        if (p === 'done') delete root.dataset.hudCard;
      },
    });
    // the first move (a touch anywhere, or a key) sends it to the counter, once it has been seen for a moment
    const onMove = () => clock.poke();
    const opts = { capture: true, passive: true } as const;
    window.addEventListener('pointerdown', onMove, opts);
    window.addEventListener('touchstart', onMove, opts);
    window.addEventListener('keydown', onMove, opts);
    return () => {
      clock.stop();
      window.removeEventListener('pointerdown', onMove, opts);
      window.removeEventListener('touchstart', onMove, opts);
      window.removeEventListener('keydown', onMove, opts);
      delete root.dataset.hudCard;
    };
  }, [stageId, quick, reduced, counter]);

  if (phase === 'done' || info.kind === 'none' || info.kind === 'boss') return null;

  const port = mode === 'port';
  const short = mode === 'short';
  const tiny = short && typeof window !== 'undefined' && window.innerHeight <= 350;
  // painted (painted.tsx): the wood-and-parchment card at its own shape, its words on the parchment (about x 13-86%, y 19-85%); the
  // one-second retry version on the goal plate. The drawn stand-in until the sheet has loaded.
  const pw = art ? Math.min(lane.w, quick ? (tiny ? 124 : 150) : port ? 300 : short ? (tiny ? (window.innerHeight <= 300 ? 210 : 240) : 280) : 330) : 0;
  const ph = art ? Math.round((pw * (quick ? 210 : 667)) / (quick ? 540 : 900)) : 0;
  const w = art ? pw : Math.min(lane.w, port ? 340 : short ? 300 : 360);
  const x = lane.x + (lane.w - w) / 2;
  const top = lane.y + (short ? 0 : 4);
  // the threads go up to the top of the screen sideways (the card hangs from the canopy); upright they are short, clear of the HUD row
  const style: React.CSSProperties = { left: x, top, width: w, ['--th' as string]: `${port ? 10 : top + 4}px` };
  if (art) {
    Object.assign(style, fillStyle(quick ? 'goalPlate' : 'goalCard'), { height: ph, ['--pw' as string]: `${w}px` });
    if (!quick) Object.assign(style, { paddingTop: Math.round(ph * 0.19), paddingBottom: Math.round(ph * 0.15), paddingLeft: Math.round(w * 0.13), paddingRight: Math.round(w * 0.14) });
  }
  const thread = art ? fillStyle('tendril') : undefined;
  if (phase === 'shrink') {
    style.transform = reduced || !to ? undefined : `translate(${to.x}px, ${to.y}px) scale(.14)`;
    style.opacity = 0;
  }
  const icon = short ? 34 : 42;
  const count = info.kind === 'count';
  const words = info.line.replace(/^This stage:\s*/, '');
  // (the first stage after a switch from Easy to Normal says the help fades out, in place of the goal's small line: LV-7)
  const ease = easeInLine(stageId);

  return (
    <div ref={ref} className={`vh-card ${quick ? 'quick' : ''} ${phase}${art ? ' painted' : ''}`} style={style} role="status" aria-live="polite" aria-label={info.line} data-hud-keepout="">
      <span className="vh-card-thread l" aria-hidden="true" style={thread} />
      <span className="vh-card-thread r" aria-hidden="true" style={thread} />
      {quick ? (
        <div className="vh-card-row">
          <GoalPic icon={info.icon} size={icon - 6} />
          <span className="vh-card-big">{count ? `0/${target}` : words}</span>
        </div>
      ) : (
        <>
          <div className="vh-card-label">
            {label} <ModeChip />
          </div>
          <div className="vh-card-row">
            <GoalPic icon={info.icon} size={icon} />
            <div className="vh-card-text">
              <span className="vh-card-pre">This stage:</span>
              <span className="vh-card-big">{words}</span>
              {ease ? <span className="vh-card-sub ease">{ease}</span> : info.sub && !short && <span className="vh-card-sub">{info.sub}</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
