import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sound } from '../../game/audio.ts';
import type { LevelConfig } from '../../game/types.ts';
import type { GameEngine } from '../../game/engine.ts';
import type { CoachStep } from '../../game/touchCoach.ts';
import type { ControlStyle } from '../../game/controlPrefs.ts';
import { lessonDotLine, lessonOfLine, lessonSaidBy, lessonStale, type LessonId } from '../../game/lessons.ts';
import { DotSay } from '../../game/dotSay.ts';
import { PUZZLE_STEPS } from '../../game/dotTips.ts';
import { dotLine, dotText, engineGuideLine, swapLine } from '../../game/dotLines.ts';
import { countedText, GuideQueue, isUrgent, noteSaid, roomMaySay, readMs, showFor, wordCount, type GuideLine, type MoveId, type Showing, type TopicId } from '../../game/dotGuide.ts';
import { MoveWatch, StruggleWatch, inDanger, type DeathCause, type StruggleHelp } from '../../game/dotGuideWatch.ts';
import { SKIP_ARM_MS, SKIP_DONE, SKIP_DONE_MS, dotHelp, helpAllows, markMoveDone, markSkillSeen, markSkipOffered, movesDone, offersSkip, seenSkills, skipTapCounts, skipTips, type DotHelp } from '../../game/dotGuideHelp.ts';
import { recorder } from '../../game/playRecorder.ts';
import { emptyGuideView, toScreenX, toScreenY, type GuidePlatform, type GuideView } from '../../game/dotGuideView.ts';
import {
  aheadRect,
  bubbleMaxW,
  BUBBLE_TAG_H,
  choosePerch,
  dangerRects,
  findTarget,
  guideSafeArea,
  hoverOrder,
  hoverSpot,
  landingRects,
  perchPoseFor,
  placeBubble,
  popupRects,
  weakSpotRect,
  cornerBubble,
  pokeyRect,
  type BubblePlace,
  type Perch,
  type Rect,
  type SafeArea,
  type Target,
} from '../../game/dotGuidePerch.ts';
import { HURT_WINDOW_MS, dotPresent, dueLine, hidesFern, markShown, wasShown, waysideApplies, waysideEnabled, type WayFlag } from '../../game/wayside.ts';
import { findForStage, loadFinds } from '../../game/finds.ts';
import { DOT_ATLAS_SIZE, DOT_ATLAS_URL, DOT_FRAMES, flyFrame, warmDot } from '../../game/dotSprite.ts';
import { COACH_TEXT } from '../CoachOverlay.tsx';
import { fadeCovered, measurePieces, type FadePiece } from '../hud/seeThrough.ts';
import { DOT_PERCH_FRAMES, DOT_PERCH_URL, TAIL_H, TAIL_W, drawBubble, perchArtReady, perchStyle, pieceStyle, useHudArt, type PerchPose } from '../hud/painted.tsx';
import './dotGuide.css';

warmDot();

/**
 * Dot's guide (Matt's pick C, 2026-10-26). The one teaching surface in play: every line (stage tips, the
 * lessons, the first-stage coach, the goal, story asides, journal notes, struggle help) goes through one queue (game/dotGuide.ts), one at
 * a time. Dot flies in on a sparkle trail and perches on the scenery beside the thing she is teaching (no ring, no arrow: Matt, 2026-10-29), on
 * it; her parchment bubble sits beside her, on screen and clear of the HUD, the thumbs, the animals and Pokey. For the controls, or
 * with no perch in view, she hovers beside Pokey on the empty side behind him.
 *
 * It takes no touches (a tap is a punch): lines leave by themselves. It reads the stage each frame through engine.guideView (no
 * allocations), moves Dot and her bubble by writing their transforms directly, and only re-renders when
 * the line changes.
 */
/**
 * The engine's lines as the app hands them over: the newest, and the last few with their numbers. Two lines can come in one frame (a
 * room's first line and a stage tip passed on the same step), and the app's state keeps only the last, so the few before it ride along
 * and none is lost (1-6: the first seesaw room's line vanished that way).
 */
export interface GuideFeed {
  text: string;
  ms: number;
  n: number;
  passed?: boolean;
  recent?: ReadonlyArray<{ text: string; ms: number; n: number; passed?: boolean }>;
}
export interface DotGuideProps {
  level: LevelConfig;
  engine: () => GameEngine | null;
  /** the stage is on screen and running (not the menu, not a reader) */
  playing: boolean;
  ratio: number;
  hp: number;
  guide?: GuideFeed | null;
  coachStep?: CoachStep;
  coachStyle?: ControlStyle;
  lessonId?: LessonId | null;
  /** the goal's count (for Dot's "That's all of them!") */
  count?: { cur: number; target: number };
}

// ───────────────────────────── Dot's sprite frames, worked out once ─────────────────────────────

const FRAME_NAMES = ['fly0', 'fly1', 'fly2', 'fly3', 'perch'] as const;
interface FrameStyle {
  w: number;
  h: number;
  size: string;
  pos: string;
  f: -1 | 1;
}
function frameStyles(dotW: number): Record<string, FrameStyle> {
  const k = dotW / 128;
  const out: Record<string, FrameStyle> = {};
  for (const n of FRAME_NAMES) {
    const fr = DOT_FRAMES[n];
    if (!fr) continue;
    out[n] = { w: fr.w * k, h: fr.h * k, size: `${DOT_ATLAS_SIZE.w * k}px ${DOT_ATLAS_SIZE.h * k}px`, pos: `${-fr.x * k}px ${-fr.y * k}px`, f: fr.f };
  }
  return out;
}

const FLY_MS = 600;
const LEAVE_AFTER_MS = 1600;
/** with another line waiting, she stays this long before flying off */
const LINGER_MS = 4000;
/** a bubble fades out over this long when its line ends */
const BUBBLE_FADE_MS = 300;
const SPARKS = 7;

/** perch: on the scenery by the thing; hover: beside Pokey; pokey: his own thought (no Dot); corner: a boss fight, out of the arena's middle */
type Mode = 'perch' | 'hover' | 'pokey' | 'corner';
interface Plan {
  mode: Mode;
  /** perched on the thing itself (a log): she rides it, at this far from its left end */
  on?: { plat: GuidePlatform; dx: number };
  /** perch: her feet in the world; hover: her middle on screen */
  wx: number;
  wy: number;
  sx: number;
  sy: number;
  target: Target | null;
  topic?: TopicId;
  /** the bubble, relative to her (perch) or on screen (hover, Pokey's own thought) */
  bub: BubblePlace | null;
  /** Pokey's own thought: whether he was on a vine, a liana or a rope when it was placed (it moves once when he grabs or lets go) */
  bubHeld?: boolean;
  /** when Pokey's thought was last placed (performance.now ms): swinging, he may carry himself under it, and it moves at most this often */
  bubAt?: number;
  bubDx: number;
  bubDy: number;
  placedAt: number;
  /** a perch was tried for this line and left no room for the bubble: she stays hovering */
  noPerch?: boolean;
  /** how much of the keep-outs (the HUD, the thumbs, a carving) the bubble covered when it was placed */
  ko?: number;
}

/** everything one run of a stage keeps: the queue, the watches, the story bookkeeping and Dot's flight */
class GuideRun {
  view: GuideView = emptyGuideView();
  /** Worlds 1-4 have Dot toned down (dotGuide.ts CALM); not Dot's own flight */
  queue: GuideQueue;
  /** the moves this phone did in earlier stages (a stage tip for one is not said again), and those marked so far */
  movesBefore = movesDone();
  movesMarked = new Set<string>();
  moves = new MoveWatch();
  struggle = new StruggleWatch();
  /** the line Dot last chirped for (SN-7: once per line) */
  chirpN = -1;
  clock = 0;
  lastT = -1;
  help = dotHelp();
  seen = seenSkills();
  /** this stage was cleared before on this save (a replay) */
  replay = false;
  /** when her bubble last moved off Pokey (performance.now ms) */
  awayAt = -1e9;
  /** the bubble of the line that just ended fades until then (performance.now ms) */
  fadeUntil = 0;
  /** how long he has been in the air (ms of play), not holding on */
  airMs = 0;
  /** the camera was showing something last frame */
  wasReveal = false;
  /** he was in a puzzle room last frame */
  wasInRoom = false;
  /** inside a puzzle room, what waits (made once: no new function each frame) */
  hushRoom = (l: GuideLine): boolean => !roomMaySay(l);
  /** while the camera shows something (a reveal), only the urgent lines: the story aside waits until after it (the lead, 2026-10-29) */
  hushReveal = (l: GuideLine): boolean => !isUrgent(l);
  /** what the setting lets her say, and what counts as heard (dotSay.ts) */
  dotSay: DotSay;
  storyOn = waysideEnabled();
  applies: boolean;
  dot: boolean;
  world: number;
  mini: number;
  stageId: string;
  // story asides (as the old Wayside did: wayside.ts dueLine)
  L: boolean;
  H: boolean;
  F: boolean;
  hurtAt = -1;
  prevHp = -1;
  storyMarked = false;
  nextStoryCheck = 0;
  // deaths and progress
  prevLives = -1;
  alive = { x: 0, y: 0, foe: false, falling: false };
  restartPending = true;
  prevJumpRun = 0;
  // lines from the engine
  lastGuide: number;
  // the line on screen and Dot
  show: Showing | null = null;
  plan: Plan | null = null;
  bw = 0;
  bh = 0;
  measuredN = -1;
  state: 'away' | 'flying' | 'there' | 'leaving' = 'away';
  fromX = 0;
  fromY = 0;
  flyT0 = 0;
  endedAt = -1e9;
  dsx = -100;
  dsy = -100;
  face: -1 | 1 = 1;
  sparks: { x: number; y: number }[] = Array.from({ length: SPARKS * 2 }, () => ({ x: -100, y: -100 }));
  sparkHead = 0;
  sparkFade = 0;
  nextCheck = 0;
  lastReplan = -1e9;
  rects: Rect[] = [];
  hard: Rect[] = [];
  touching = 0;
  coachWas: CoachStep = null;
  goalDone = false;
  /** the line (its n) that carries the Skip tips button, and where the bubble last sat (the "tips off" note goes there) */
  skipN = -1;
  /** the move counter, for the queue (made once: no new function each frame) */
  countMove = (m: MoveId): number => this.moves.count(m);
  /** a move tip's thing is nowhere in view (made once) */
  /** a lesson's line whose thing he has done meanwhile, or the heart's once he is at full health (lessons.ts lessonStale) */
  stale = (l: GuideLine): boolean => {
    const id = lessonOfLine(l);
    return !!id && lessonStale(id, this.view);
  };
  gone = (l: GuideLine): boolean => !!l.topic && GONE_TOPICS.has(l.topic) && !findTarget(l.topic, this.view);
  /** when she last landed (ms of play): she says her line from then */
  landedAt = 0;
  lastBx = 16;
  lastBy = 80;

  constructor(level: LevelConfig, guideN: number) {
    this.world = level.worldIndex;
    this.mini = level.miniIndex;
    this.stageId = level.id;
    this.replay = stageCleared(level.id);
    this.applies = waysideApplies(level);
    this.dot = dotPresent(this.world, this.mini);
    this.L = wasShown(this.world, this.mini, 'L');
    this.H = wasShown(this.world, this.mini, 'H');
    this.F = wasShown(this.world, this.mini, 'F');
    this.lastGuide = guideN;
    // (calm in every world: World 5 had no calm rules, DOT-8; not Dot's own flight)
    this.queue = new GuideQueue(!/-D$/.test(level.id));
    this.dotSay = new DotSay(this.queue, this.help, this.seen, this.movesBefore, this.storyOn);
  }

  /** the setting (the menu, or Skip tips) */
  setHelp(h: DotHelp): void {
    this.help = h;
    this.dotSay.setHelp(h);
  }

  /** queue a line if Dot's help lets it through */
  say(l: GuideLine): void {
    this.dotSay.storyOn = this.storyOn;
    this.dotSay.say(l, this.clock);
  }

  sayHelp(h: StruggleHelp, topic: TopicId | undefined): void {
    this.say({ key: h.key, text: h.text, kind: 'struggle', who: this.dot ? 'Dot' : 'Pokey', topic: topic ?? (h.kind === 'kicks' ? 'controls' : undefined), source: 'struggle' });
  }

  /**
   * A line from the engine, in its old words: what it is comes from those words (a warning, the locked exit, a tip and the move that
   * closes it), and what is said is Matt's approved line for it (dotLines.ts). A cut line is not said.
   */
  engineLine(text: string, ms: number): void {
    const v = this.view;
    const l = engineGuideLine(text, this.stageId, { boss: v.boss, flight: v.flight, dot: this.dot, ms });
    if (!l) return;
    // (a replay of a stage already cleared, its goal met in full: no "Still N to collect!", DOT-17)
    if (l.counted && this.replay) return;
    // (a puzzle's first line: its next steps come on struggle there, whether or not the setting says this one, dotTips.ts)
    const steps = PUZZLE_STEPS[l.key.slice('engine:'.length)];
    if (steps) this.puzzle = { key: l.key, x: v.px, y: v.py, n: 0, nudge: steps.nudge, move: steps.move, topic: steps.topic };
    this.say(l);
  }

  /** the puzzle he is at (a stage-hint puzzle: 4-3's pool), and how far her help there has gone */
  puzzle: { key: string; x: number; y: number; n: number; nudge: string; move?: string; topic?: TopicId } | null = null;

  /** struggle at the puzzle: the nudge, then (Help only) the move */
  puzzleHelp(): boolean {
    const pz = this.puzzle;
    if (!pz || pz.n >= 2) return false;
    pz.n++;
    const text = pz.n === 1 ? pz.nudge : pz.move;
    if (!text) return true;
    this.say({ key: `${pz.key}:${pz.n === 1 ? 'nudge' : 'move'}`, text, kind: 'struggle', who: this.dot ? 'Dot' : 'Pokey', topic: pz.topic, step: pz.n === 1 ? 'nudge' : 'move', source: 'struggle' });
    return true;
  }

  /** the engine says he is past the spot an engine line was about (StageHint.passX): that line goes, done or not */
  passedLine(text: string): void {
    const l = engineGuideLine(text, this.stageId, { dot: this.dot });
    if (l) this.queue.clear((q) => q.key === l.key, this.clock);
  }
}

const storyKey = (f: WayFlag) => `story:${f}`;
/** cleared on this save (`sloth_lvl_<id>` holds { completed: true }) */
function stageCleared(id: string): boolean {
  try {
    const raw = localStorage.getItem(`sloth_lvl_${id}`);
    return !!raw && !!JSON.parse(raw)?.completed;
  } catch {
    return false;
  }
}
/** the thing she is pointing at, when it is a platform she can sit on (a log he pushes, or one floating in a pool) */
function thingUnder(v: GuideView, t: Target): GuidePlatform | null {
  for (const p of v.platforms) if ((p.push || p.art === 'poolLog') && !p.broken && t.x >= p.x && t.x <= p.x + p.width && Math.abs(t.y - p.y) < 60) return p;
  return null;
}

/** room kept clear round Pokey when her bubble is placed (px): it sat a hair over his head, upright at 2-1's river (the rework's
 *  Polish check); "on him" for moving it away is still his own outline (pokeyRect 4) */
const POKEY_ROOM = 24;

/** the half of the screen away from Pokey (sideways: the other side; upright: the other end), within the safe area */
function awayHalf(v: GuideView, safe: SafeArea, pr: Rect): SafeArea {
  const r = { ...safe.rect };
  const cx = (pr.x0 + pr.x1) / 2;
  const cy = (pr.y0 + pr.y1) / 2;
  if (v.cssW >= v.cssH) {
    if (cx < v.cssW / 2) r.x0 = Math.max(r.x0, v.cssW / 2);
    else r.x1 = Math.min(r.x1, v.cssW / 2);
  } else if (cy > v.cssH / 2) r.y1 = Math.min(r.y1, v.cssH / 2);
  else r.y0 = Math.max(r.y0, v.cssH / 2);
  return { rect: r, keepOut: safe.keepOut };
}

/** a line where she points at the thing after struggle (she goes right by it; nothing is drawn on it) */
const pointing = (l: GuideLine) => l.kind === 'struggle' || l.step === 'nudge' || l.step === 'move';
/** a struggle within this far of a puzzle's first line is struggle at the puzzle (px) */
const PUZZLE_NEAR = 900;

const nearPushLog = (v: GuideView, x: number) => v.platforms.some((p) => p.push && Math.abs(p.x + p.width / 2 - x) < 500);

/** what got him, for the help after a second death in one spot (DOT-10) */
function deathCause(v: GuideView, at: { x: number; y: number; foe: boolean }, fell: boolean): DeathCause {
  // (what the engine says got him, when it says: Polish A2's GuideView.lostTo, set in loseLife)
  const lost = (v as unknown as { lostTo?: string }).lostTo;
  if (lost === 'water' && !nearPushLog(v, at.x)) return 'water';
  if (lost === 'hurt') return at.foe ? 'foe' : 'other';
  if (at.foe && !fell) return 'foe';
  if (!fell) return 'other';
  // (by a log he was to push: the log first, where Easy players lost the most lives)
  if (nearPushLog(v, at.x)) return 'pushLog';
  for (const p of v.platforms) if (p.type === 'fragile' && Math.abs(p.x + p.width / 2 - at.x) < 200) return 'crumble';
  // (World 2's rivers: a missed log)
  if (v.stageId.startsWith('2-')) return 'water';
  return 'fall';
}
/** a move tip about one of these is over once none of them is in view (dotGuide.ts CALM.goneMs) */
const GONE_TOPICS = new Set<TopicId>(['trunk', 'vine', 'rope', 'log', 'foe']);
const MOVE_IDS: MoveId[] = ['run', 'jump', 'double', 'grab', 'climb', 'leap', 'glide', 'punch', 'kick', 'crouch', 'push', 'bounce'];
/** the goals with a count to fill */
const QUOTA = new Set(['harvest', 'relic_hunt', 'purge', 'gauntlet', 'rescue']);

export const DotGuide: React.FC<DotGuideProps> = (props) => {
  const { level, guide, coachStep, lessonId } = props;
  const [run] = useState(() => new GuideRun(level, guide?.n ?? 0));
  // (the dev build lets the screenshot tools look inside: window.__dotGuide())
  useEffect(() => {
    if (import.meta.env?.DEV) (window as unknown as { __dotGuide?: () => GuideRun }).__dotGuide = () => run;
  }, [run]);
  const [show, setShow] = useState<Showing | null>(null);
  const latest = useRef(props);
  latest.current = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const sprRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sparkRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bubRef = useRef<HTMLDivElement>(null);
  // the painted pieces (hud/painted.tsx), once their sheet has loaded: the 9-slice bubble and its tail, and Dot's perched poses. The
  // drawn stand-ins (the CSS bubble, her old perch frame) until then.
  const art = useHudArt();
  const bubArt = useRef<HTMLCanvasElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);
  const perchRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastArt = useRef<HTMLCanvasElement>(null);
  const [toast, setToast] = useState<{ x: number; y: number; n: number } | null>(null);

  // Skip tips (her very first tip on this phone): Dot's help goes to Quiet, the rest of this line goes at once, and a short note says
  // how to turn tips back on. The button swallows its touch: it is never also a punch or a jump. It needs a deliberate tap: for its
  // first SKIP_ARM_MS it is faded and lets touches through to the game, and only a touch that went down on it counts (QA: a
  // first-timer on Quiet from his first second). Pressing it is logged for the QA team.
  const swallow = (e: React.SyntheticEvent) => e.stopPropagation();
  const skipAt = useRef(0);
  const skipDown = useRef(false);
  const [skipArmed, setSkipArmed] = useState(false);
  const skipShown = run.skipN >= 0 && show?.n === run.skipN;
  useEffect(() => {
    if (!skipShown) return;
    skipAt.current = performance.now();
    skipDown.current = false;
    setSkipArmed(false);
    recorder.event('skipOffer', show!.line.key);
    const t = window.setTimeout(() => setSkipArmed(true), SKIP_ARM_MS);
    return () => window.clearTimeout(t);
  }, [skipShown]); // eslint-disable-line react-hooks/exhaustive-deps
  const onSkipDown = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    skipDown.current = true;
  };
  const onSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const shownMs = performance.now() - skipAt.current;
    // (a click with no pointer behind it, detail 0, is a key: Enter or Space on the focused button)
    if (!skipTapCounts(shownMs, skipDown.current, e.detail === 0)) {
      recorder.event('skipIgnored', `${(shownMs / 1000).toFixed(1)}s${skipDown.current ? '' : ' not down here'}`);
      return;
    }
    recorder.event('skipTips', `${(shownMs / 1000).toFixed(1)}s ${show?.line.key ?? ''}`);
    run.setHelp(skipTips());
    run.skipN = -1;
    // (what Quiet would not have said goes too; the locked-exit lines stay)
    run.queue.clear((l) => !helpAllows(l, 'quiet', run.seen, run.storyOn), run.clock, true);
    setToast({ x: run.lastBx, y: run.lastBy, n: performance.now() });
  };
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), SKIP_DONE_MS + 300);
    return () => window.clearTimeout(t);
  }, [toast]);
  useLayoutEffect(() => {
    const el = toastRef.current;
    if (!toast || !el || !toastArt.current || !art) return;
    drawBubble(toastArt.current, el.offsetWidth, el.offsetHeight);
  }, [toast, art]);

  // a line from the engine (a stage tip, the goal, the sealed door, a warning); an empty one says the moment has passed
  useEffect(() => {
    if (!guide || guide.n <= run.lastGuide) return;
    // (every line since the last one seen, in order: two in one frame are both said)
    for (const g of guide.recent ?? [guide]) {
      if (g.n <= run.lastGuide) continue;
      run.lastGuide = g.n;
      // (a move tip about a spot he is now past: it goes, up or waiting, done or not)
      if (g.passed) run.passedLine(g.text);
      // (in a boss fight every line of hers belongs to an attack: its end takes it down)
      else if (!g.text) run.queue.clear((l) => l.source === 'engine' && (l.kind === 'danger' || run.view.boss), run.clock);
      else run.engineLine(g.text, g.ms);
    }
    run.lastGuide = guide.n;
  }, [guide?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  // a first-time lesson: one of Dot's lines, or Pokey's while she is away (the engine did not stop for it)
  useEffect(() => {
    // (already on the vine or the trunk: the lesson starts after its "grab it" step)
    const l = lessonId ? lessonDotLine(lessonId, undefined, run.view.swinging || run.view.climbing || run.view.hanging) : undefined;
    // (Dot's while she is with him; his own thought while she is away, World 7 above all)
    if (l) run.say(lessonSaidBy(l, run.dot));
  }, [lessonId, run]);

  // the first-stage coach: each step is a line that stays until its move is done; a step that moves on takes its line down
  useEffect(() => {
    const key = coachStep ? `coach:${coachStep}` : '';
    const was = run.coachWas;
    run.coachWas = coachStep ?? null;
    run.queue.clear((l) => l.source === 'coach' && l.key !== key && l.key !== 'coach:runKick', run.clock);
    if (!coachStep) return;
    const style = latest.current.coachStyle ?? 'screen';
    // (the approved lines are for the touch screen; the on-screen pad keeps the coach card's own words)
    const t = COACH_TEXT[style][coachStep];
    const text = style === 'screen' ? dotLine(`coach.${coachStep}`)?.text ?? null : coachStep === 'nice' ? null : t.title;
    // right after the run step, before the jump: slide slowly to run, flick fast to kick (Matt's added line)
    if (was === 'run' && coachStep !== 'run' && style === 'screen') {
      const rk = dotLine('coach.runKick')?.text;
      if (rk) run.say({ key: 'coach:runKick', text: rk, kind: 'teach', who: 'Dot', topic: 'controls', gesture: 'slide', skill: 'coach:runKick', source: 'coach' });
    }
    if (!text) return;
    run.say({
      key,
      text,
      kind: coachStep === 'nice' ? 'info' : 'teach',
      who: 'Dot',
      move: coachStep === 'run' ? 'run' : coachStep === 'jump' ? 'jump' : undefined,
      topic: coachStep === 'jump' ? 'gap' : 'controls',
      skill: `coach:${coachStep}`,
      source: 'coach',
    });
  }, [coachStep, run]);

  // a thumb on the glass (the stuck help only counts time he is trying)
  useEffect(() => {
    const on = (e: TouchEvent) => {
      run.touching = e.touches.length;
    };
    window.addEventListener('touchstart', on, { passive: true, capture: true });
    window.addEventListener('touchend', on, { passive: true, capture: true });
    window.addEventListener('touchcancel', on, { passive: true, capture: true });
    return () => {
      window.removeEventListener('touchstart', on, true);
      window.removeEventListener('touchend', on, true);
      window.removeEventListener('touchcancel', on, true);
    };
  }, [run]);

  // the bubble is measured once, when its line goes up (its spot is worked out from its size)
  useLayoutEffect(() => {
    const el = bubRef.current;
    if (!show || !el) return;
    run.bw = el.offsetWidth;
    run.bh = el.offsetHeight;
    run.measuredN = show.n;
    // the painted bubble body, drawn once for this line at its size (crisp at the screen's pixel ratio)
    if (art && bubArt.current) drawBubble(bubArt.current, run.bw, run.bh);
  }, [show, run, art]);

  // the frame loop
  useEffect(() => {
    let raf = 0;
    let frame: FrameStyle | null = null;
    let frameName = '';
    let flip = 0;
    let wings = false;
    let dotOn = false;
    let bubIn = false;
    let bubOut = false;
    let styles: Record<string, FrameStyle> | null = null;
    let stylesFor = 0;
    let off = true;
    const v = run.view;
    // the painted pieces: what is on, and what was last written (so a frame writes only what changed)
    let perchOn = false;
    let perchPose = '';
    let perchK = 0;
    let tailL = NaN;
    let tailT = NaN;
    let tailF = '';
    let tailFor = -1;
    // the new HUD's pieces, faded while something he needs is under one (hud/seeThrough.ts): measured every 0.4 s, checked each frame
    const fades: FadePiece[] = [];
    let fadesAt = -1e9;

    /**
     * The safe area (the HUD's own helper, or the fallback band), plus whatever HUD pieces are on screen right now: the old HUD's glass
     * plates, and anything the new HUD marks with data-hud-keepout. Read from the page at most every 0.4 s.
     */
    let safeCache: SafeArea | null = null;
    let safeAt = -1e9;
    /** the stage's own keep-outs among them (World 5's carvings): words to read, so her bubble keeps off them as hard as off Pokey */
    const stageKo: Rect[] = [];
    const safeNow = (): SafeArea => {
      const t = performance.now();
      if (safeCache && t - safeAt < 400) return safeCache;
      const base = guideSafeArea(v.cssW, v.cssH);
      const keepOut = base.keepOut.slice();
      stageKo.length = 0;
      document.querySelectorAll('.hud-glass, [data-hud-keepout]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return;
        const k = { x0: r.left - 6, y0: r.top - 6, x1: r.right + 6, y1: r.bottom + 6 };
        keepOut.push(k);
        if (el.getAttribute('data-hud-keepout') === 'stage') stageKo.push(k);
      });
      safeCache = { rect: base.rect, keepOut };
      safeAt = t;
      return safeCache;
    };

    const setFrame = (name: string) => {
      if (name === frameName || !styles) return;
      frameName = name;
      frame = styles[name] ?? styles.fly1;
      const els = sprRefs.current;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const fs = i === 0 ? frame : styles[i === 1 ? 'fly3' : 'fly0'] ?? frame;
        el.style.width = `${fs.w}px`;
        el.style.height = `${fs.h}px`;
        el.style.backgroundSize = fs.size;
        el.style.backgroundPosition = fs.pos;
      }
    };
    let flipW = 0;
    const setFace = (face: -1 | 1) => {
      const f = frame ? (face === frame.f ? 1 : -1) : 1;
      if ((f === flip && (!frame || frame.w === flipW)) || !flipRef.current) return;
      flip = f;
      flipW = frame?.w ?? 0;
      // (mirrored about her own middle: the box is as wide as the frame)
      flipRef.current.style.transform = f < 0 ? `translateX(${flipW.toFixed(1)}px) scaleX(-1)` : '';
    };
    const toggle = (el: Element | null, cls: string, on: boolean, was: boolean): boolean => {
      if (on !== was && el) el.classList.toggle(cls, on);
      return on;
    };

    /** where she goes for this line, and where her bubble sits */
    const planFor = (l: GuideLine): Plan => {
      const safe = safeNow();
      const target = l.at ? { x: l.at.x, y: l.at.y, r: 30 } : findTarget(l.topic, v);
      const p: Plan = { mode: 'hover', wx: 0, wy: 0, sx: 0, sy: 0, target, topic: l.topic, bub: null, bubDx: 0, bubDy: 0, placedAt: run.clock };
      if (v.flight) {
        // Dot's own flight: she is the one flying, so her line sits in the band under the top HUD, with no ring
        p.mode = 'pokey';
        p.target = null;
        p.sx = v.cssW / 2;
        p.sy = safe.rect.y0;
        return p;
      }
      if (l.who !== 'Dot') {
        // Pokey's own thought, or the petal: no Dot, the bubble beside his head
        p.mode = 'pokey';
        const r = pokeyRect(v, 0);
        p.sx = (r.x0 + r.x1) / 2;
        p.sy = r.y0 + 10;
        return p;
      }
      if (v.boss) {
        // a boss fight: her bubble in a corner band away from the boss, Dot by it (cornerBubble, once the bubble is measured)
        p.mode = 'corner';
        p.target = null;
        p.sx = v.facing > 0 ? 40 : v.cssW - 40;
        p.sy = safe.rect.y0 + 70;
        return p;
      }
      let perch: Perch | null = null;
      // pointing after struggle: she perches on the thing itself when it is something to stand on (the log), at its far end from him
      const on = target && pointing(l) ? thingUnder(v, target) : null;
      if (on) {
        const dx = v.px < on.x + on.width / 2 ? on.width - 26 : 26;
        p.on = { plat: on, dx };
        perch = { x: on.x + dx, y: on.y };
      } else if (target && l.topic !== 'controls') perch = choosePerch(v, target, safe);
      if (perch) {
        p.mode = 'perch';
        p.wx = perch.x;
        p.wy = perch.y;
      } else if (target && l.topic !== 'controls' && pointing(l)) {
        // no perch by it: she hovers just above the thing itself, a little to the side (she is the pointer: no ring, no arrow)
        const tx = toScreenX(v, target.x);
        const ty = toScreenY(v, target.y);
        const side = tx > v.cssW / 2 ? -1 : 1;
        p.sx = Math.max(safe.rect.x0 + 30, Math.min(safe.rect.x1 - 30, tx + side * 46));
        p.sy = Math.max(safe.rect.y0 + 40, Math.min(safe.rect.y1 - 30, ty - 56));
      } else {
        const h = hoverSpot(v);
        p.sx = h.x;
        p.sy = h.y;
      }
      return p;
    };

    /** her spot on screen now (a perch moves with the scenery) */
    const spotNow = (p: Plan, out: { x: number; y: number }) => {
      if (p.mode === 'perch') {
        // (on the thing itself: it may move, a log being pushed, and she rides it)
        if (p.on) {
          p.wx = p.on.plat.x + p.on.dx;
          p.wy = p.on.plat.y;
        }
        out.x = toScreenX(v, p.wx);
        out.y = toScreenY(v, p.wy);
      } else {
        out.x = p.sx;
        out.y = p.sy;
      }
      return out;
    };
    const spot = { x: 0, y: 0 };

    /** what her bubble must cover least of all: Pokey, and a boss's open weak spot with its NOW! marker */
    const hardNow = (p?: Plan) => {
      run.hard.length = 0;
      run.hard.push(pokeyRect(v, POKEY_ROOM));
      safeNow();
      for (const k of stageKo) run.hard.push(k);
      const w = weakSpotRect(v);
      if (w) run.hard.push(w);
      // the way forward (the platform tops ahead and the next landing, QA v189: it sat along a pillar's top in 4-2) and the thing she
      // points at
      landingRects(v, run.hard);
      const t = p?.target;
      if (t) {
        const tx = toScreenX(v, t.x);
        const ty = toScreenY(v, t.y);
        const r = Math.max(18, Math.min(40, t.r * v.zoom)) + 22;
        run.hard.push({ x0: tx - r, y0: ty - r - 16, x1: tx + r, y1: ty + r });
      }
    };

    /** how much of the keep-outs a bubble at (x, y) covers, its name tag included: a carving that scrolls under it since is news */
    const koCover = (x: number, y: number): number => {
      let a = 0;
      for (const k of safeNow().keepOut) {
        const w = Math.min(x + run.bw, k.x1) - Math.max(x, k.x0);
        const h = Math.min(y + run.bh, k.y1) - Math.max(y - BUBBLE_TAG_H, k.y0);
        if (w > 0 && h > 0) a += w * h;
      }
      return a;
    };

    /** a boss fight: the corner band (and her spot beside it) */
    const placeCorner = (p: Plan) => {
      hardNow();
      const c = cornerBubble(v, run.bw, run.bh, safeNow(), run.hard);
      p.bub = c.bub;
      p.sx = c.dot.x;
      p.sy = c.dot.y;
      p.placedAt = run.clock;
    };

    const placeBub = (p: Plan) => {
      if (!run.bw) return;
      if (p.mode === 'corner') {
        placeCorner(p);
        return;
      }
      const safe = safeNow();
      spotNow(p, spot);
      const rects = dangerRects(v, run.rects);
      rects.push(pokeyRect(v));
      if (p.mode !== 'perch') rects.push(aheadRect(v));
      // the landings ahead of him (the block he must jump to) and the score pop-ups
      landingRects(v, rects);
      popupRects(v, rects);
      // her middle: a perched Dot stands on her spot, so her middle is a little above it
      const my = p.mode === 'perch' ? spot.y - 22 : spot.y;
      const order = p.mode === 'perch' ? (['above', 'left', 'right', 'below'] as const) : hoverOrder(v);
      hardNow(p);
      // (Pokey himself, never under it while anywhere else is free: QA v200 upright)
      p.bub = placeBubble(spot.x, my, run.bw, run.bh, safe, rects, order, frame ? frame.w / 2 + 6 : 28, run.hard, frame ? frame.h / 2 : 18, pokeyRect(v, POKEY_ROOM));
      if (p.mode === 'perch' && (p.bub.cost ?? 0) > 0) {
        // no room for her bubble beside this perch without covering Pokey, an animal or the HUD: she hovers beside him instead
        const h = hoverSpot(v);
        p.mode = 'hover';
        p.noPerch = true;
        p.sx = h.x;
        p.sy = h.y;
        p.bub = null;
        run.state = 'flying';
        run.flyT0 = performance.now();
        run.fromX = run.dsx;
        run.fromY = run.dsy - (frame ? frame.h / 2 : 0);
        run.lastReplan = run.clock;
        return;
      }
      p.bubDx = p.bub.x - spot.x;
      p.bubDy = p.bub.y - spot.y;
      p.ko = koCover(p.bub.x, p.bub.y);
      p.placedAt = run.clock;
    };

    const startLine = (s: Showing) => {
      const p = planFor(s.line);
      run.plan = p;
      run.show = s;
      if (p.mode === 'pokey') {
        run.state = run.state === 'away' ? 'away' : 'leaving';
        run.flyT0 = performance.now();
        run.fromX = run.dsx;
        run.fromY = run.dsy;
        return;
      }
      // fly in from where she is, or from the top corner behind him
      if (run.state === 'away' || run.dsx < -50) {
        run.fromX = v.facing > 0 ? -30 : v.cssW + 30;
        run.fromY = safeNow().rect.y0 - 10;
      } else {
        run.fromX = run.dsx;
        run.fromY = run.dsy;
      }
      run.state = 'flying';
      run.flyT0 = performance.now();
      run.sparkFade = 1;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const P = latest.current;
      const e = P.engine();
      if (e) e.guideView(v);
      const live = !!e && v.live && P.playing && v.cssW > 0;
      if (!live) {
        if (!off && rootRef.current) rootRef.current.dataset.off = '1';
        off = true;
        if (e) run.lastT = v.t;
        return;
      }
      if (off) {
        if (rootRef.current) delete rootRef.current.dataset.off;
        // (back from the menu: Dot's help or the story switch may have changed there)
        run.setHelp(dotHelp());
        run.storyOn = waysideEnabled();
      }
      off = false;
      if (now - fadesAt > 400) {
        fadesAt = now;
        measurePieces(document, fades);
      }
      fadeCovered(v, fades);
      if (!styles || stylesFor !== v.cssH) {
        const dotW = v.cssH < 430 && v.cssW > v.cssH ? 44 : 52;
        styles = frameStyles(dotW);
        stylesFor = v.cssH;
        frameName = '';
        // (her painted perched poses are at twice her flight sheet's scale: drawn at half, she is the same size sitting as flying)
        perchK = (dotW / 128) * 0.5;
        perchPose = '';
      }

      // the guide's clock: milliseconds of play (it stands still while paused, and holds while he is hurt)
      const dt = run.lastT < 0 ? 0 : Math.max(0, Math.min(100, (v.t - run.lastT) * 1000));
      run.lastT = v.t;
      if (dt > 0) {
        if (!v.hurt) run.clock += dt;
        run.moves.step(v);
        if (!v.flight) perceive(dt);
      }

      // the queue
      // (no line starts while the stage-start goal card is up: the two share the top-centre lane, QA v189)
      const cardUp = document.documentElement.dataset.hudCard === '1';
      // (and not mid-jump: a line that can wait waits until he is down, or has been in the air under 0.3 s, DOT-17)
      const holding = v.climbing || v.swinging || v.hanging || v.gliding;
      run.airMs = v.grounded || holding ? 0 : run.airMs + dt;
      const danger = !v.flight && (inDanger(v) || v.boss || v.chase || run.airMs > 300);
      // (in a puzzle room: the room's lines win, and no chatter while he thinks; walking in, chatter up for its minimum time goes)
      const inRoom = v.kit.length > 0;
      if (inRoom && !run.wasInRoom) {
        run.queue.dropWaiting((l) => !roomMaySay(l) && l.kind !== 'story');
        run.queue.clear((l) => !roomMaySay(l), run.clock);
      }
      run.wasInRoom = inRoom;
      // (a reveal begins with a story aside up: it steps out of the way, and comes back after)
      if (v.reveal && !run.wasReveal && run.queue.cur?.line.kind === 'story') {
        const l = run.queue.cur.line;
        run.queue.clear((q) => q.key === l.key, run.clock, true);
        run.queue.push(l, run.clock);
      }
      run.wasReveal = v.reveal;
      run.queue.tick(run.clock, { danger, hold: cardUp, moveCount: run.countMove, swinging: run.view.swinging, gone: run.gone, stale: run.stale, hush: v.reveal ? run.hushReveal : inRoom ? run.hushRoom : undefined });
      // (a line up its minimum time is heard: its tip, its lesson and its thing are kept, DOT-1)
      run.dotSay.keep(run.clock);
      // (the moves he has done, kept for later stages)
      if (run.queue.calm && run.movesMarked.size < MOVE_IDS.length) {
        for (const m of MOVE_IDS) if (!run.movesMarked.has(m) && run.moves.count(m) > 0) {
          run.movesMarked.add(m);
          markMoveDone(m);
        }
      }
      for (const ev of run.queue.drain()) {
        if (ev.type === 'start') {
          noteSaid(ev.show.line);
          // her very first tip on this phone carries the Skip tips button (once per device)
          if (!v.flight && offersSkip(ev.show.line, run.help, run.stageId)) {
            markSkipOffered();
            run.skipN = ev.show.n;
          }
          run.storyMarked = false;
          startLine(ev.show);
          setShow(ev.show);
        } else {
          const l = ev.show.line;
          if (l.skill && (ev.why === 'done' || (ev.why === 'read' && !l.move))) {
            markSkillSeen(l.skill);
            run.seen.add(l.skill);
          }
          // what follows it: the next step of a lesson once this one is done, a second half once read
          if (l.next && (ev.why === 'done' || ev.why === 'read')) run.say(l.next);
          if (run.show === ev.show) {
            run.show = null;
            run.endedAt = run.clock;
            // (its bubble fades out over 0.3 s, a move tip's too, rather than vanishing: DOT-17; a new line replaces it at once)
            const n = ev.show.n;
            run.fadeUntil = now + BUBBLE_FADE_MS;
            window.setTimeout(() => setShow((s) => (s && s.n === n ? null : s)), BUBBLE_FADE_MS);
          }
        }
      }
      const cur = run.show;
      // a story line counts as heard (and is not said again on a replay) once it has been up 1.5 s
      if (cur && cur.line.source === 'story' && !run.storyMarked && run.clock - cur.startedAt >= 1500) {
        run.storyMarked = true;
        const f = cur.line.key.slice(-1) as WayFlag;
        markShown(run.world, run.mini, f);
        run[f] = true;
      }

      // Dot's flight
      const p = run.plan;
      // (she stays on her perch a little longer when another line is waiting: not away and back again, DOT-17)
      if (!cur && run.state === 'there' && run.clock - run.endedAt > (run.queue.size > 0 ? LINGER_MS : LEAVE_AFTER_MS)) {
        run.state = 'leaving';
        run.flyT0 = now;
        run.fromX = run.dsx;
        run.fromY = run.dsy - (p?.mode === 'perch' && frame ? frame.h / 2 : 0);
      }
      const vis = run.state !== 'away';
      // perched, with her painted poses loaded: the posed painting stands in for the sprite
      const perched = run.state === 'there' && p?.mode === 'perch' && perchArtReady();
      dotOn = toggle(dotRef.current, 'on', vis && !perched, dotOn);
      if (run.state === 'flying' && p) {
        const u = Math.min(1, (now - run.flyT0) / FLY_MS);
        const k = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        spotNow(p, spot);
        // (a perch is her feet; in flight she is drawn from her middle)
        const ty = p.mode === 'perch' ? spot.y - (frame ? frame.h / 2 : 20) + 4 : spot.y;
        run.dsx = run.fromX + (spot.x - run.fromX) * k;
        run.dsy = run.fromY + (ty - run.fromY) * k - Math.sin(Math.PI * u) * 46;
        run.face = spot.x >= run.fromX ? 1 : -1;
        if (u >= 1) {
          run.state = 'there';
          run.landedAt = run.clock;
          placeBub(p);
        }
      } else if (run.state === 'leaving') {
        const u = Math.min(1, (now - run.flyT0) / FLY_MS);
        const ex = v.facing > 0 ? -60 : v.cssW + 60;
        run.dsx = run.fromX + (ex - run.fromX) * u;
        run.dsy = run.fromY - 140 * u * u;
        run.face = ex >= run.fromX ? 1 : -1;
        if (u >= 1) {
          run.state = 'away';
          run.dsx = -100;
        }
      } else if (run.state === 'there' && p) {
        spotNow(p, spot);
        const bob = p.mode === 'hover' ? Math.sin(now / 260) * 3 : 0;
        run.dsx = spot.x;
        run.dsy = spot.y + bob;
        // a perch scrolled off screen, or Pokey (or an animal) under the bubble: move once, then settle (0.8 s)
        if (run.clock >= run.nextCheck) {
          run.nextCheck = run.clock + 250;
          if (p.topic && p.topic !== 'controls') {
            // (an animal moves: follow it; a thing that has scrolled away is swapped for the next one of its kind on screen, and one
            // not in view when the line began is picked up when it comes into view)
            const t2 = findTarget(p.topic, v);
            const tx = p.target ? toScreenX(v, p.target.x) : -1;
            const gone = tx < 0 || tx > v.cssW;
            if (t2 && (gone || Math.hypot(t2.x - p.target!.x, t2.y - p.target!.y) < 140)) p.target = t2;
          }
          if (run.clock - run.lastReplan > 800 && cur) {
            const safe = safeNow().rect;
            const offScreen = p.mode === 'perch' && (spot.x < safe.x0 || spot.x > safe.x1 || spot.y < safe.y0 + 30 || spot.y > safe.y1);
            const pr = pokeyRect(v, 8);
            const b = p.bub;
            const bx = b ? (p.mode === 'perch' ? spot.x + p.bubDx : b.x) : 0;
            const by = b ? (p.mode === 'perch' ? spot.y + p.bubDy : b.y) : 0;
            // (Pokey, the open weak spot, the way ahead, the thing she points at: whatever has come under it since it was placed)
            let covered = false;
            if (b) {
              const ty = by - BUBBLE_TAG_H;
              hardNow(p);
              for (const h of run.hard) if (bx < h.x1 && bx + run.bw > h.x0 && ty < h.y1 && by + run.bh > h.y0) covered = true;
              if (!covered && pr && bx < pr.x1 && bx + run.bw > pr.x0 && ty < pr.y1 && by + run.bh > pr.y0) covered = true;
              // (a carving has scrolled in under it since it was placed: QA v194, 5-1's first tree)
              if (!covered && p.ko !== undefined && koCover(bx, by) > p.ko + 400) covered = true;
            }
            // hovering for want of a perch: one may have come into view since (the camera moves on with him)
            const perch = p.mode === 'hover' && !p.noPerch && p.target && p.topic !== 'controls' && run.clock - run.lastReplan > 1000 ? choosePerch(v, p.target, safeNow()) : null;
            // an animal has walked up to her perch: she moves off it
            let crowded = false;
            if (p.mode === 'perch') for (const en of v.enemies) if (!en.defeated && Math.abs(en.x - p.wx) < 100 && Math.abs(en.y - p.wy) < 100) crowded = true;
            if (offScreen || crowded) {
              run.lastReplan = run.clock;
              startLine(cur);
            } else if (perch) {
              run.lastReplan = run.clock;
              p.mode = 'perch';
              p.wx = perch.x;
              p.wy = perch.y;
              run.state = 'flying';
              run.flyT0 = now;
              run.fromX = run.dsx;
              run.fromY = run.dsy;
            } else if (covered) {
              run.lastReplan = run.clock;
              placeBub(p);
            }
          }
        }
      }
      if (p && p.mode === 'hover' && run.state === 'there' && p.bub && run.clock - p.placedAt > 2000 && cur) {
        // hovering: she stays beside him even when he walks on (her bubble moves with her, once, after a settle)
        const h = hoverSpot(v);
        if (Math.abs(h.x - p.sx) > v.cssW * 0.22 || Math.abs(h.y - p.sy) > v.cssH * 0.2) {
          p.sx = h.x;
          p.sy = h.y;
          run.state = 'flying';
          run.flyT0 = now;
          run.fromX = run.dsx;
          run.fromY = run.dsy;
        }
      }

      // her sprite: wings blur while she flies or hovers, the perch painting when she sits
      const sitting = run.state === 'there' && p?.mode === 'perch';
      setFrame(sitting ? 'perch' : flyFrame(now / 1000));
      if (sitting && p?.target) run.face = toScreenX(v, p.target.x) >= run.dsx ? 1 : -1;
      else if (run.state === 'there' && p?.mode === 'hover') run.face = v.facing;
      setFace(run.face);
      wings = toggle(dotRef.current, 'wings', !sitting, wings);
      if (dotRef.current && frame) {
        // (a perched Dot stands on her spot; a flying one is centred on it)
        const ox = frame.w / 2;
        const oy = sitting ? frame.h - 4 : frame.h / 2;
        dotRef.current.style.transform = `translate3d(${(run.dsx - ox).toFixed(1)}px, ${(run.dsy - oy).toFixed(1)}px, 0)`;
      }
      const pe = perchRef.current;
      perchOn = toggle(pe, 'on', perched, perchOn);
      if (perched && pe) {
        // her pose: talking while she says it, then pointing at the thing (ahead, up or down); her feet on the same spot in every pose
        const tg = cur && p?.target ? p.target : null;
        const tdx = tg ? toScreenX(v, tg.x) - run.dsx : null;
        const tdy = tg ? toScreenY(v, tg.y) - (run.dsy - 20) : 0;
        const pose = perchPoseFor(cur ? run.clock - Math.max(cur.startedAt, run.landedAt) : -1, cur ? wordCount(cur.line.text) : 0, !!cur?.line.move, tdx, tdy, now) as PerchPose;
        if (pose !== perchPose) {
          perchPose = pose;
          const ps = perchStyle(pose, perchK);
          pe.style.width = `${ps.w.toFixed(1)}px`;
          pe.style.height = `${ps.h.toFixed(1)}px`;
          pe.style.backgroundSize = ps.size;
          pe.style.backgroundPosition = ps.pos;
        }
        // (painted facing left; mirrored to face right, about her own middle)
        const f = DOT_PERCH_FRAMES[pose];
        const flipR = run.face > 0 ? 1 : 0;
        const fx = flipR ? f.w - f.fx : f.fx;
        pe.style.transform = `translate3d(${(run.dsx - fx * perchK).toFixed(1)}px, ${(run.dsy + 3 - f.fy * perchK).toFixed(1)}px, 0)${flipR ? ' scaleX(-1)' : ''}`;
      }

      // the sparkle trail she flies in on
      const flying = run.state === 'flying' || run.state === 'leaving';
      if (flying) {
        run.sparkHead = (run.sparkHead + 1) % run.sparks.length;
        const sp = run.sparks[run.sparkHead];
        sp.x = run.dsx - run.face * 18;
        sp.y = run.dsy + 6;
        run.sparkFade = 1;
      } else run.sparkFade = Math.max(0, run.sparkFade - dt / 400);
      const sEls = sparkRefs.current;
      for (let i = 0; i < SPARKS; i++) {
        const el = sEls[i];
        if (!el) continue;
        const sp = run.sparks[(run.sparkHead - i * 2 + run.sparks.length * 4) % run.sparks.length];
        const o = run.sparkFade * (1 - i / SPARKS) * 0.9;
        el.style.opacity = o > 0.02 ? o.toFixed(2) : '0';
        if (o > 0.02) el.style.transform = `translate3d(${sp.x.toFixed(1)}px, ${sp.y.toFixed(1)}px, 0) scale(${(1 - i / (SPARKS + 2)).toFixed(2)})`;
      }

      // the bubble: placed once she has landed, beside her
      const bub = bubRef.current;
      if (p?.mode === 'corner' && cur && !p.bub && run.measuredN === cur.n) placeCorner(p);
      const there = run.state === 'there' || ((p?.mode === 'pokey' || p?.mode === 'corner') && !!cur);
      if (p?.mode === 'pokey' && cur && !p.bub && run.measuredN === cur.n && v.flight) {
        p.bub = { x: Math.max(16, (v.cssW - run.bw) / 2), y: p.sy, tail: 'b', at: 0 };
      }
      const held = !!(v.climbing || v.swinging || v.hanging);
      // (on a liana he swings under a bubble placed when he grabbed: it moves off him, now and then, never every frame)
      const onHim = (b: BubblePlace) => {
        const r = pokeyRect(v, 0);
        return b.x < r.x1 && b.x + run.bw > r.x0 && b.y - BUBBLE_TAG_H < r.y1 && b.y + run.bh > r.y0;
      };
      if (p?.mode === 'pokey' && p.bub && !v.flight && (p.bubHeld !== held || (held && onHim(p.bub) && now - (p.bubAt ?? 0) > 700))) {
        const r = pokeyRect(v, 0);
        p.sx = (r.x0 + r.x1) / 2;
        p.sy = r.y0 + 10;
        p.bub = null;
      }
      if (p?.mode === 'pokey' && cur && !p.bub && run.measuredN === cur.n) {
        const safe = safeNow();
        const rects = dangerRects(v, run.rects);
        rects.push(pokeyRect(v, 12));
        landingRects(v, rects);
        popupRects(v, rects);
        hardNow();
        // (on a vine, a liana or a rope what he needs to see is above him: his thought goes under him first, World 7's climbs above all)
        const side = v.facing > 0 ? 'left' : 'right';
        const order: Parameters<typeof placeBubble>[6] = held ? ['below', side, 'above'] : ['above', side, 'below'];
        // (held, the bubble hangs from his feet: measured from his head, every spot under him lies on him)
        const ay = held ? pokeyRect(v, 0).y1 - 10 : p.sy;
        p.bub = placeBubble(p.sx, ay, run.bw, run.bh, safe, rects, order, 26, run.hard, 26, pokeyRect(v, POKEY_ROOM));
        p.bubHeld = held;
        p.bubAt = now;
      }
      if (bub && cur && p?.bub && there && run.measuredN === cur.n) {
        let bx = p.mode === 'perch' ? run.dsx + p.bubDx : p.bub.x;
        let by = p.mode === 'perch' ? run.dsy + p.bubDy : p.bub.y;
        const safe = safeNow().rect;
        bx = Math.max(safe.x0, Math.min(safe.x1 - run.bw, bx));
        by = Math.max(safe.y0, Math.min(safe.y1 - run.bh, by));
        // never on Pokey (the lead, 2026-10-29: a story box sat on him at 6-8's crown): if he has come under it, or the camera has
        // carried him there, it moves to the half of the screen away from him (at most twice a second)
        const pr = pokeyRect(v, 4);
        if (bx < pr.x1 && bx + run.bw > pr.x0 && by - BUBBLE_TAG_H < pr.y1 && by + run.bh > pr.y0 && now - run.awayAt > 500) {
          run.awayAt = now;
          const far = awayHalf(v, safeNow(), pr);
          const nb = placeBubble((far.rect.x0 + far.rect.x1) / 2, (far.rect.y0 + far.rect.y1) / 2, run.bw, run.bh, far, [], ['above', 'below', 'left', 'right'], 0, [pr], 0, pr);
          bx = nb.x;
          by = nb.y;
          if (p.mode === 'perch') {
            p.bubDx = bx - run.dsx;
            p.bubDy = by - run.dsy;
          } else p.bub = { ...nb };
        }
        bub.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`;
        run.lastBx = bx;
        run.lastBy = by;
        bubIn = toggle(bub, 'in', true, bubIn);
        // (its reading time counts from now, not from when it left the queue: DOT-7)
        run.queue.onScreen(run.clock);
        // and Dot chirps as her bubble opens, once per line (SN-7, Polish A2's sound)
        if (cur.line.who === 'Dot' && run.chirpN !== cur.n) {
          run.chirpN = cur.n;
          sound.dotChirp();
        }
        // an info line stays fully readable until its last 0.3 s
        const left = cur.line.move ? Infinity : showFor(cur.line) - (run.clock - cur.startedAt);
        bubOut = toggle(bub, 'out', left < 300, bubOut);
        const pt = tailRef.current;
        if (pt && tailFor !== cur.n) {
          tailFor = cur.n;
          tailF = '';
        }
        if (pt) {
          // the painted tail (it points down-left as painted): along the bottom edge under her, or the top edge when she is above the
          // bubble; beside her, at the end nearest her. Mirrored to point the other way.
          const side = p.bub.tail;
          const up = side === 't' || ((side === 'l' || side === 'r') && run.dsy - 20 < by + run.bh / 2);
          let right: boolean;
          let left: number;
          if (side === 'b' || side === 't') {
            const at = Math.max(18, Math.min(run.bw - 18, run.dsx - bx));
            right = at > run.bw / 2;
            left = right ? at - TAIL_W + 5 : at - 5;
          } else {
            right = side === 'r';
            left = right ? run.bw - TAIL_W - 12 : 12;
          }
          left = Math.round(Math.max(10, Math.min(run.bw - TAIL_W - 10, left)));
          const top = Math.round(up ? -TAIL_H + 2 : run.bh - 2);
          const fl = p.mode === 'pokey' ? 'none' : `${right ? -1 : 1},${up ? -1 : 1}`;
          if (left !== tailL || top !== tailT || fl !== tailF) {
            tailL = left;
            tailT = top;
            tailF = fl;
            pt.style.left = `${left}px`;
            pt.style.top = `${top}px`;
            pt.style.display = fl === 'none' ? 'none' : '';
            pt.style.transform = fl === 'none' ? '' : `scale(${fl})`;
          }
        }
        const tail = pt ? null : bub.querySelector<HTMLElement>('.dg-tail');
        if (tail) {
          tail.className = `dg-tail ${p.bub.tail}`;
          const at = p.bub.tail === 'b' || p.bub.tail === 't' ? Math.max(14, Math.min(run.bw - 30, run.dsx - bx - 8)) : Math.max(12, Math.min(run.bh - 28, run.dsy - 20 - by));
          if (p.bub.tail === 'b' || p.bub.tail === 't') {
            tail.style.left = `${at.toFixed(0)}px`;
            tail.style.top = '';
          } else {
            tail.style.top = `${at.toFixed(0)}px`;
            tail.style.left = '';
          }
          tail.style.display = p.mode === 'pokey' ? 'none' : '';
        }
      } else if (bub && bubIn && !cur && now < run.fadeUntil) {
        bubOut = toggle(bub, 'out', true, bubOut);
      } else {
        bubIn = toggle(bub, 'in', false, bubIn);
        bubOut = toggle(bub, 'out', false, bubOut);
      }

      // nothing drawn on the thing: no ring, no arrow, no sparkle (Matt, 2026-10-29: "that horrible blue pointer, the helper, I want that
      // out"). After struggle she flies to the thing and perches by it; the words do the rest
    };

    /** what the guide notices each frame of play: story lines due, deaths, being stuck, kicking the air, new journal pages */
    const perceive = (dt: number) => {
      const q = run.queue;
      // a respawn (or the first frame): progress counts from where he stands
      if (run.prevLives < 0) run.prevLives = v.lives;
      if (run.prevHp < 0) run.prevHp = v.hp;
      if (run.restartPending) {
        run.struggle.restart(v.px, v.py);
        run.restartPending = false;
      }
      if (!v.boss) {
        if (v.hp > 0 && v.py < v.levelH - 10) {
          let foe = false;
          for (const en of v.enemies) if (!en.defeated && Math.abs(en.x - v.px) < 150 && Math.abs(en.y - v.py) < 160) foe = true;
          run.alive.x = v.px;
          run.alive.y = v.py;
          // (an animal close by, not any hit: still blinking from a falling rock or a thorn is not a foe, and the punch tip after it
          // made no sense; World 4's builder, 2026-10-28: 4-7 has nothing to punch)
          run.alive.foe = foe;
          run.alive.falling = !v.grounded && v.vy > 400;
        }
        if (v.lives < run.prevLives) {
          const fell = run.alive.y > v.levelH - 140 || (run.alive.falling && !run.alive.foe);
          const h = run.struggle.death(run.alive.x, run.alive.y, deathCause(v, run.alive, fell), run.help === 'teach');
          // (two deaths at a puzzle are its two failed tries: the puzzle's own next step, not the death help)
          const atPuzzle = !!run.puzzle && Math.abs(run.alive.x - run.puzzle.x) < PUZZLE_NEAR;
          if (h && !(atPuzzle && run.puzzleHelp())) run.sayHelp(h, h.cause === 'fall' || h.cause === 'gapWide' ? 'gap' : h.cause === 'foe' ? 'foe' : h.cause === 'pushLog' || h.cause === 'water' ? 'log' : h.cause === 'crumble' ? 'crumble' : undefined);
          run.restartPending = true;
        }
        const k = run.moves.kicked;
        if (k) {
          const h = run.struggle.kick(k.near);
          if (h) run.sayHelp(h, 'controls');
        }
        const jr = run.moves.count('jump') + run.moves.count('run') + run.moves.count('grab');
        if (jr !== run.prevJumpRun) {
          run.prevJumpRun = jr;
          run.struggle.otherMove();
        }
        // back and forth with no progress (never a clock, DOT-11); not in a puzzle room (the room's own watch helps there)
        if (run.puzzle && Math.abs(v.px - run.puzzle.x) > PUZZLE_NEAR) run.puzzle = null;
        const s = v.kit.length ? null : run.struggle.step(dt, v.px, v.py);
        if (s && !run.puzzleHelp()) {
          // (she flies to the way on: the next trunk, vine or ledge ahead; with none in view she says nothing, no promise of an arrow)
          const tp: TopicId | undefined = findTarget('trunk', v) ? 'trunk' : findTarget('vine', v) ? 'vine' : findTarget('ledge', v) ? 'ledge' : undefined;
          if (tp) run.sayHelp(s, tp);
        }
      }
      run.prevLives = v.lives;

      // a fall: the story's reply comes a beat later (wayside.ts)
      if (v.hp < run.prevHp && v.hp > 0 && run.hurtAt < 0) run.hurtAt = run.clock;
      if (v.hp <= 0) run.hurtAt = -1;
      run.prevHp = v.hp;

      // story asides (the "Story lines in stages" switch; Dot's help does not silence them)
      // (not on 7-4's slide: an aside in the banner would cover the flume ahead; its line is in the hall, before it)
      if (run.applies && run.storyOn && !v.slide && run.clock >= run.nextStoryCheck) {
        run.nextStoryCheck = run.clock + 200;
        if (run.hurtAt >= 0 && run.clock - run.hurtAt > HURT_WINDOW_MS) run.hurtAt = -1;
        const due = dueLine({
          world: run.world,
          mini: run.mini,
          ratio: latest.current.ratio,
          playedMs: run.clock,
          hurtAgoMs: run.hurtAt >= 0 ? run.clock - run.hurtAt : undefined,
          shownL: run.L,
          shownH: run.H,
          fernOpen: hidesFern(run.world, run.mini) && !loadFinds().includes(findForStage(run.world, run.mini)?.id ?? ''),
          shownF: run.F,
        });
        if (due && !q.has(storyKey(due.flag))) {
          if (due.flag === 'H') run.hurtAt = -1;
          // (a line already heard is marked as soon as it is; one cut short comes back by itself, from the queue)
          run[due.flag] = true;
          // Matt's approved words for it (a cut line is not said: it counts as said, so it does not come back)
          const sw = swapLine(due.line.text);
          if (sw?.text === null) markShown(run.world, run.mini, due.flag);
          else {
            // (an exchange, wayside.ts `more`: each reply is its own bubble, said once the one before it has been read)
            const reply = (i: number): GuideLine | undefined => {
              const m = due.line.more?.[i];
              if (!m) return undefined;
              return { key: `${storyKey(due.flag)}:${i + 1}`, text: swapLine(m.text)?.text ?? m.text, kind: 'story', who: m.who, source: 'story', waitMs: 60000, next: reply(i + 1) };
            };
            run.say({ key: storyKey(due.flag), text: sw?.text ?? due.line.text, kind: due.flag === 'F' ? 'info' : 'story', who: due.line.who, source: 'story', waitMs: due.flag === 'H' ? 9000 : 60000, next: reply(0) });
          }
        }
      }

      // (new journal pages: the approved lines cut the note; the new HUD marks the Menu button instead, research D8)

      // the last one of the goal's count is in: Dot closes the loop (research D9)
      const cnt = latest.current.count;
      if (!run.goalDone && cnt && cnt.target > 1 && cnt.cur >= cnt.target && QUOTA.has(latest.current.level.objectiveType ?? '')) {
        run.goalDone = true;
        // (a "Still {n}" line still waiting, or up, is old news now)
        q.clear((l) => !!l.counted, run.clock, true);
        const t = dotText('goal.done');
        if (t) run.say({ key: 'goal:done', text: t, kind: 'goal', who: run.dot ? 'Dot' : 'Pokey', topic: 'exit', source: 'engine' });
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run]);

  const l = show?.line;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 400;
  const tag = l?.who === 'Petal' ? null : l?.who;
  return (
    <div ref={rootRef} className="dg-root" data-off="1" aria-hidden={!l && !toast}>
      {Array.from({ length: SPARKS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            sparkRefs.current[i] = el;
          }}
          className="dg-spark"
        />
      ))}
      <div ref={perchRef} className="dg-perch" style={{ backgroundImage: `url(${DOT_PERCH_URL})` }} />
      <div ref={dotRef} className="dg-dot">
        <div ref={flipRef} style={{ position: 'relative' }}>
          {[1, 2, 0].map((i) => (
            <div
              key={i}
              ref={(el) => {
                sprRefs.current[i] = el;
              }}
              className={`dg-spr ${i === 0 ? 'main' : 'blur'}`}
              style={{ backgroundImage: `url(${DOT_ATLAS_URL})`, transform: i === 1 ? 'translate(-3px,-2px)' : i === 2 ? 'translate(-2px,3px)' : undefined }}
            />
          ))}
        </div>
      </div>
      {l && (
        <div
          key={show!.n}
          ref={bubRef}
          className={`dg-bub ${l.kind === 'story' ? 'story' : ''} ${l.who === 'Petal' ? 'narr' : ''}${art ? ' painted' : ''}`}
          role="status"
          aria-live="polite"
          style={{ maxWidth: bubbleMaxW(vw, vh) }}
        >
          {art && <canvas ref={bubArt} className="dg-bub-art" aria-hidden="true" />}
          {art ? <span ref={tailRef} className="dg-ptail" aria-hidden="true" style={pieceStyle('tail', TAIL_W)} /> : <span className="dg-tail b" />}
          {tag && <span className={`dg-tag ${tag === 'Pokey' ? 'pokey' : tag === 'Flicker' ? 'flicker' : ''}`}>{tag}</span>}
          <div className="dg-bub-body">
            <p>{l.counted && props.count ? countedText(l.text, props.count.target - props.count.cur) : l.text}</p>
            {run.skipN === show!.n && (
              <button
                type="button"
                className={`dg-skip${skipArmed ? '' : ' unarmed'}`}
                onClick={onSkip}
                onPointerDown={onSkipDown}
                onPointerUp={swallow}
                onTouchStart={swallow}
                onTouchEnd={swallow}
                onMouseDown={swallow}
                aria-label="Skip tips: Dot only speaks when she must"
              >
                <span>Skip tips</span>
              </button>
            )}
          </div>
        </div>
      )}
      {toast && (
        <div ref={toastRef} key={toast.n} className={`dg-bub dg-toast${art ? ' painted' : ''}`} role="status" aria-live="polite" style={{ transform: `translate3d(${toast.x.toFixed(1)}px, ${toast.y.toFixed(1)}px, 0)`, maxWidth: bubbleMaxW(vw, vh) }}>
          {art && <canvas ref={toastArt} className="dg-bub-art" aria-hidden="true" />}
          <div className="dg-bub-body">
            <p>{SKIP_DONE}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/** for the tests and tools: how long a line stays (re-exported so a probe can check a screenshot's timing) */
export const lineReadMs = readMs;
