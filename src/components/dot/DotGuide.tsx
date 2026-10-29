import { sound } from '../../game/audio.ts';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { LevelConfig } from '../../game/types.ts';
import type { GameEngine } from '../../game/engine.ts';
import type { CoachStep } from '../../game/touchCoach.ts';
import type { ControlStyle } from '../../game/controlPrefs.ts';
import { lessonDotLine, lessonOfLine, lessonStale, type LessonId } from '../../game/lessons.ts';
import { dotLine, dotText, engineGuideLine, swapLine } from '../../game/dotLines.ts';
import { countedText, GuideQueue, noteSaid, readMs, showFor, wordCount, type GuideLine, type MoveId, type Showing, type TopicId } from '../../game/dotGuide.ts';
import { MoveWatch, StruggleWatch, inDanger, type StruggleHelp } from '../../game/dotGuideWatch.ts';
import { SKIP_ARM_MS, SKIP_DONE, SKIP_DONE_MS, dotHelp, helpAllows, knownMoveTip, markMoveDone, markSkillSeen, markSkipOffered, movesDone, offersSkip, seenSkills, skipTapCounts, skipTips } from '../../game/dotGuideHelp.ts';
import { recorder } from '../../game/playRecorder.ts';
import { emptyGuideView, toScreenX, toScreenY, type GuideView } from '../../game/dotGuideView.ts';
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
import { DOT_PERCH_FRAMES, DOT_PERCH_URL, TAIL_H, TAIL_W, drawBubble, perchArtReady, perchStyle, pieceStyle, ringBox, setPiece, useHudArt, hudArtReady, type PerchPose } from '../hud/painted.tsx';
import './dotGuide.css';

warmDot();

/**
 * Dot's guide (Matt's pick C, 2026-10-26). The one teaching surface in play: every line (stage tips, the
 * lessons, the first-stage coach, the goal, story asides, journal notes, struggle help) goes through one queue (game/dotGuide.ts), one at
 * a time. Dot flies in on a sparkle trail and perches on the scenery near the thing she is teaching, with a glowing ring and an arrow on
 * it; her parchment bubble sits beside her, on screen and clear of the HUD, the thumbs, the animals and Pokey. For the controls, or
 * with no perch in view, she hovers beside Pokey on the empty side behind him.
 *
 * It takes no touches (a tap is a punch): lines leave by themselves. It reads the stage each frame through engine.guideView (no
 * allocations), moves Dot, the ring and the arrow by writing their transforms directly, and only re-renders when the line changes.
 */
export interface DotGuideProps {
  level: LevelConfig;
  engine: () => GameEngine | null;
  /** the stage is on screen and running (not the menu, not a reader) */
  playing: boolean;
  ratio: number;
  hp: number;
  guide?: { text: string; ms: number; n: number; passed?: boolean } | null;
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
const SPARKS = 7;

/** perch: on the scenery by the thing; hover: beside Pokey; pokey: his own thought (no Dot); corner: a boss fight, out of the arena's middle */
type Mode = 'perch' | 'hover' | 'pokey' | 'corner';
interface Plan {
  mode: Mode;
  /** perch: her feet in the world; hover: her middle on screen */
  wx: number;
  wy: number;
  sx: number;
  sy: number;
  target: Target | null;
  topic?: TopicId;
  /** the bubble, relative to her (perch) or on screen (hover, Pokey's own thought) */
  bub: BubblePlace | null;
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
    this.applies = waysideApplies(level);
    this.dot = dotPresent(this.world, this.mini);
    this.L = wasShown(this.world, this.mini, 'L');
    this.H = wasShown(this.world, this.mini, 'H');
    this.F = wasShown(this.world, this.mini, 'F');
    this.lastGuide = guideN;
    this.queue = new GuideQueue(CALM_WORLDS.has(this.world) && !/-D$/.test(level.id));
  }

  /** queue a line if Dot's help lets it through */
  say(l: GuideLine): void {
    if (!helpAllows(l, this.help, this.seen, this.storyOn)) return;
    // (toned down: not a stage tip for a move already done in an earlier stage)
    if (this.queue.calm && knownMoveTip(l, this.movesBefore)) return;
    this.queue.push(l, this.clock);
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
    if (l) this.say(l);
  }

  /** the engine says he is past the spot an engine line was about (StageHint.passX): that line goes, done or not */
  passedLine(text: string): void {
    const l = engineGuideLine(text, this.stageId, { dot: this.dot });
    if (l) this.queue.clear((q) => q.key === l.key, this.clock);
  }
}

const storyKey = (f: WayFlag) => `story:${f}`;
/** the worlds where Dot is toned down (Matt, 2026-10-28) */
const CALM_WORLDS = new Set([1, 2, 3, 4]);
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
  const ringRef = useRef<SVGGElement>(null);
  const ringA = useRef<SVGCircleElement>(null);
  const ringB = useRef<SVGCircleElement>(null);
  const arrowG = useRef<SVGGElement>(null);
  const arrowA = useRef<SVGPathElement>(null);
  const arrowB = useRef<SVGPathElement>(null);
  const bubRef = useRef<HTMLDivElement>(null);
  // the painted pieces (hud/painted.tsx), once their sheet has loaded: the 9-slice bubble and its tail, the teal ring and arrow, and
  // Dot's perched poses. The drawn stand-ins (the CSS bubble, the SVG ring, her old perch frame) until then.
  const art = useHudArt();
  const bubArt = useRef<HTMLCanvasElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);
  const pRing = useRef<HTMLSpanElement>(null);
  const pRingA = useRef<HTMLSpanElement>(null);
  const pRingB = useRef<HTMLSpanElement>(null);
  const pArrow = useRef<HTMLSpanElement>(null);
  const pArrowIn = useRef<HTMLSpanElement>(null);
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
    run.help = skipTips();
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
    run.lastGuide = guide.n;
    // (a move tip about a spot he is now past: it goes, up or waiting, done or not)
    if (guide.passed) {
      run.passedLine(guide.text);
      return;
    }
    if (!guide.text) {
      // (in a boss fight every line of hers belongs to an attack: its end takes it down)
      run.queue.clear((l) => l.source === 'engine' && (l.kind === 'danger' || run.view.boss), run.clock);
      return;
    }
    run.engineLine(guide.text, guide.ms);
  }, [guide?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  // a first-time lesson: one of Dot's lines (the engine did not stop for it)
  useEffect(() => {
    // (already on the vine or the trunk: the lesson starts after its "grab it" step)
    const l = lessonId ? lessonDotLine(lessonId, undefined, run.view.swinging || run.view.climbing || run.view.hanging) : undefined;
    if (l) run.say(l);
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
    let ringOn = false;
    let arrowOn = false;
    let bubIn = false;
    let bubOut = false;
    let styles: Record<string, FrameStyle> | null = null;
    let stylesFor = 0;
    let off = true;
    const v = run.view;
    // the painted pieces: what is on, and what was last written (so a frame writes only what changed)
    let pRingOn = false;
    let pArrowOn = false;
    let perchOn = false;
    let ringD = 0;
    let arrowW = 0;
    let arrowH = 0;
    let arrowSet = false;
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
      if (target && l.topic !== 'controls') perch = choosePerch(v, target, safe);
      if (perch) {
        p.mode = 'perch';
        p.wx = perch.x;
        p.wy = perch.y;
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
      run.hard.push(pokeyRect(v, 4));
      safeNow();
      for (const k of stageKo) run.hard.push(k);
      const w = weakSpotRect(v);
      if (w) run.hard.push(w);
      // the way forward (the platform tops ahead and the next landing, QA v189: it sat along a pillar's top in 4-2) and her own ring
      // and the thing it is on
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

    /** the bubble is up: Dot chirps, once per line (SN-7) */
    const bubbleUp = () => {
      const s = run.show;
      if (!s) return;
      if (s.line.who === 'Dot' && run.chirpN !== s.n) {
        run.chirpN = s.n;
        sound.dotChirp();
      }
    };

    /** a boss fight: the corner band (and her spot beside it) */
    const placeCorner = (p: Plan) => {
      hardNow();
      const c = cornerBubble(v, run.bw, run.bh, safeNow(), run.hard);
      p.bub = c.bub;
      p.sx = c.dot.x;
      p.sy = c.dot.y;
      p.placedAt = run.clock;
      bubbleUp();
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
      p.bub = placeBubble(spot.x, my, run.bw, run.bh, safe, rects, order, frame ? frame.w / 2 + 6 : 28, run.hard, frame ? frame.h / 2 : 18, pokeyRect(v, 4));
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
      bubbleUp();
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
        run.help = dotHelp();
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
        arrowW = dotW < 52 ? 22 : 26;
        arrowH = (arrowW * 120) / 96;
        arrowSet = false;
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
      const danger = !v.flight && (inDanger(v) || v.boss || v.chase);
      run.queue.tick(run.clock, { danger, hold: cardUp, moveCount: run.countMove, swinging: run.view.swinging, gone: run.gone, stale: run.stale });
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
          if (!v.flight && offersSkip(ev.show.line, run.help, run.seen)) {
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
            setShow(null);
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
      if (!cur && run.state === 'there' && run.clock - run.endedAt > LEAVE_AFTER_MS) {
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
            // (Pokey, the open weak spot, the way ahead, her ring: whatever has come under it since it was placed)
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
      if (p?.mode === 'pokey' && cur && !p.bub && run.measuredN === cur.n) {
        const safe = safeNow();
        const rects = dangerRects(v, run.rects);
        rects.push(pokeyRect(v, 12));
        landingRects(v, rects);
        popupRects(v, rects);
        hardNow();
        p.bub = placeBubble(p.sx, p.sy, run.bw, run.bh, safe, rects, ['above', v.facing > 0 ? 'left' : 'right', 'below'], 26, run.hard, 26, pokeyRect(v, 4));
      }
      if (bub && cur && p?.bub && there && run.measuredN === cur.n) {
        let bx = p.mode === 'perch' ? run.dsx + p.bubDx : p.bub.x;
        let by = p.mode === 'perch' ? run.dsy + p.bubDy : p.bub.y;
        const safe = safeNow().rect;
        bx = Math.max(safe.x0, Math.min(safe.x1 - run.bw, bx));
        by = Math.max(safe.y0, Math.min(safe.y1 - run.bh, by));
        bub.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`;
        run.lastBx = bx;
        run.lastBy = by;
        bubIn = toggle(bub, 'in', true, bubIn);
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
      } else {
        bubIn = toggle(bub, 'in', false, bubIn);
        bubOut = toggle(bub, 'out', false, bubOut);
      }

      // the ring and the arrow on the thing she teaches
      const tgt0 = cur && run.state === 'there' && p?.target ? p.target : null;
      const tsx = tgt0 ? toScreenX(v, tgt0.x) : 0;
      const tsy = tgt0 ? toScreenY(v, tgt0.y) : 0;
      const tgt = tgt0 && tsx > -10 && tsx < v.cssW + 10 && tsy > -10 && tsy < v.cssH + 10 ? tgt0 : null;
      const showRing = !!tgt;
      // painted: the teal ring and arrow pieces (the SVG ones until the sheet is in)
      const painted = hudArtReady() && !!pRing.current && !!pArrow.current;
      if (painted && tgt) {
        const tx = toScreenX(v, tgt.x);
        const ty = toScreenY(v, tgt.y);
        const r = Math.round(Math.max(18, Math.min(40, tgt.r * v.zoom)));
        const ring = pRing.current!;
        if (r !== ringD) {
          ringD = r;
          const d = ringBox(r);
          const db = ringBox(r + 7);
          ring.style.width = `${db.toFixed(1)}px`;
          ring.style.height = `${db.toFixed(1)}px`;
          if (pRingA.current) {
            setPiece(pRingA.current, 'ring', d);
            pRingA.current.style.left = pRingA.current.style.top = `${((db - d) / 2).toFixed(1)}px`;
          }
          if (pRingB.current) setPiece(pRingB.current, 'ringDashed', db);
        }
        const db = ringBox(r + 7);
        ring.style.transform = `translate3d(${(tx - db / 2).toFixed(1)}px, ${(ty - db / 2).toFixed(1)}px, 0)`;
        // the arrow: just outside the ring on her side of it, pointing in at the thing (above it when she is close, or not perched by it)
        if (!arrowSet && pArrowIn.current && arrowW > 0) {
          setPiece(pArrowIn.current, 'arrow', arrowW);
          pArrow.current!.style.width = `${arrowW}px`;
          pArrow.current!.style.height = `${arrowH.toFixed(1)}px`;
          arrowSet = true;
        }
        let ux = run.dsx - tx;
        let uy = run.dsy - (p?.mode === 'perch' ? 20 : 0) - ty;
        const ul = Math.hypot(ux, uy);
        if (p?.mode === 'pokey' || ul < r + arrowH + 24) {
          ux = 0;
          uy = -1;
        } else {
          ux /= ul;
          uy /= ul;
        }
        const ad = r + arrowH * 0.5 + 6;
        const ang = (Math.atan2(-uy, -ux) * 180) / Math.PI - 90;
        pArrow.current!.style.transform = `translate3d(${(tx + ux * ad - arrowW / 2).toFixed(1)}px, ${(ty + uy * ad - arrowH / 2).toFixed(1)}px, 0) rotate(${ang.toFixed(1)}deg)`;
      }
      pRingOn = toggle(pRing.current, 'on', painted && showRing, pRingOn);
      pArrowOn = toggle(pArrow.current, 'on', painted && showRing && arrowSet, pArrowOn);
      if (painted) {
        // (the SVG stand-ins stay off)
        arrowOn = toggle(arrowG.current, 'on', false, arrowOn);
        ringOn = toggle(ringRef.current, 'on', false, ringOn);
        return;
      }
      if (tgt && ringA.current && ringB.current) {
        const tx = toScreenX(v, tgt.x);
        const ty = toScreenY(v, tgt.y);
        const r = Math.max(18, Math.min(40, tgt.r * v.zoom));
        ringA.current.setAttribute('cx', tx.toFixed(1));
        ringA.current.setAttribute('cy', ty.toFixed(1));
        ringA.current.setAttribute('r', r.toFixed(1));
        ringB.current.setAttribute('cx', tx.toFixed(1));
        ringB.current.setAttribute('cy', ty.toFixed(1));
        ringB.current.setAttribute('r', (r + 8).toFixed(1));
        // the arrow: a dotted curve from her to the ring's edge
        const sx = run.dsx;
        const sy = run.dsy - (p?.mode === 'perch' ? 18 : 0);
        const dx = tx - sx;
        const dy = ty - sy;
        const len = Math.hypot(dx, dy);
        const wantArrow = p?.mode !== 'pokey' && len > r + 50;
        if (wantArrow && arrowA.current && arrowB.current) {
          const ux = dx / len;
          const uy = dy / len;
          const x1 = sx + ux * 24;
          const y1 = sy + uy * 24;
          const x2 = tx - ux * (r + 10);
          const y2 = ty - uy * (r + 10);
          // bow the curve upward (away from the ground)
          const nx = -uy * (ux > 0 ? 1 : -1);
          const ny = ux * (ux > 0 ? 1 : -1);
          const bow = Math.min(60, len * 0.18);
          const cx = (x1 + x2) / 2 + nx * bow * (ny > 0 ? -1 : 1);
          const cy = (y1 + y2) / 2 + ny * bow * (ny > 0 ? -1 : 1);
          const d = `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
          arrowA.current.setAttribute('d', d);
          arrowB.current.setAttribute('d', d);
        }
        arrowOn = toggle(arrowG.current, 'on', wantArrow, arrowOn);
      } else arrowOn = toggle(arrowG.current, 'on', false, arrowOn);
      ringOn = toggle(ringRef.current, 'on', showRing, ringOn);
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
          const h = run.struggle.death(run.alive.x, run.alive.y, fell ? 'fall' : run.alive.foe ? 'foe' : 'other');
          if (h) run.sayHelp(h, h.cause === 'fall' ? 'gap' : h.cause === 'foe' ? 'foe' : undefined);
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
        const s = run.struggle.step(dt, v.px, v.py, run.touching > 0);
        if (s) {
          const tp: TopicId | undefined = findTarget('trunk', v) ? 'trunk' : findTarget('vine', v) ? 'vine' : findTarget('ledge', v) ? 'ledge' : undefined;
          run.sayHelp(s, tp);
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
          else run.say({ key: storyKey(due.flag), text: sw?.text ?? due.line.text, kind: due.flag === 'F' ? 'info' : 'story', who: due.line.who, source: 'story', waitMs: due.flag === 'H' ? 9000 : 60000 });
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
      <svg className="dg-fx" aria-hidden="true">
        <defs>
          <marker id="dg-ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#fff4d8" stroke="#3a200c" strokeWidth="1.2" />
          </marker>
        </defs>
        <g ref={ringRef} className="dg-ringg">
          <circle ref={ringB} className="dg-ring2" cx="-100" cy="-100" r="30" />
          <circle ref={ringA} className="dg-ring" cx="-100" cy="-100" r="22" />
        </g>
        <g ref={arrowG} className="dg-arrowg">
          <path ref={arrowB} className="dg-arrow-sh" d="M0 0" />
          <path ref={arrowA} className="dg-arrow" d="M0 0" markerEnd="url(#dg-ah)" />
        </g>
      </svg>
      {Array.from({ length: SPARKS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            sparkRefs.current[i] = el;
          }}
          className="dg-spark"
        />
      ))}
      <span ref={pRing} className="dg-pring" aria-hidden="true">
        <span ref={pRingB} className="dg-pring-b" />
        <span ref={pRingA} className="dg-pring-a" />
      </span>
      <span ref={pArrow} className="dg-parrow" aria-hidden="true">
        <span ref={pArrowIn} className="dg-parrow-in" />
      </span>
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
          {tag && <span className={`dg-tag ${tag === 'Pokey' ? 'pokey' : ''}`}>{tag}</span>}
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
