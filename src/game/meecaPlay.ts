/**
 * meecaPlay — Meeca's stage (5-M) in play: the column and its lanterns, her place in line, the guards' look-backs, the carving, the
 * gentle catch, her thoughts, the title card and the blanket scene. The stage itself is meecaStage.ts; the drawing is meecaArt.ts.
 * The engine runs her on Pokey's own physics and touch controls (run, jump, climb, crouch), and hands this file what it needs through
 * `MeecaHost`, as World 5 does (w5Play.ts):
 *
 *   filter()  before the physics: she cannot fight (no punch, kick or mega), and during the card, a catch or the ending the controls
 *             are hers to watch, not to use. In line, a slide back, a jump or a duck takes her out of it.
 *   after()   after the physics: in line, the line carries her (she marches at its pace); out of it she may go a little ahead of her
 *             place (not past Pell) and some way back (not off the end of the line); a catch and the ending move her themselves.
 *   step()    the column, the guards' rhythms, the carving and the catch.
 *
 * The rules that keep it fair (tested in meecaPlay.test.ts and meecaReal.test.ts):
 *   - a guard only sees her while he is LOOKING back, and he only looks after turning round (the tell: TELL seconds, his ring full and
 *     flashing), and only turns when he is fully on screen. If he leaves the screen during his turn, his look sees nothing;
 *   - in her place in line, or crouched in a fern, she is never seen;
 *   - a catch costs no heart and no life: Pell walks her back into line, and what she had cut stays cut;
 *   - the column halts by each tree until its warning is cut, so a warning can never be missed.
 */
import {
  AHEAD_MAX, BACK_MAX, carveChars, carveSeconds, LANE_UP, MARCH, MEECA_G, PELL_AHEAD, pellIndex, SIGHT, TELL, TURN_BACK,
  type MeecaStage, type MeecaTrunk, type WatchRhythm,
} from './meecaStage.ts';
import { MEECA_CARD, MEECA_CAUGHT, MEECA_ENDING, MEECA_GOAL, MEECA_THOUGHTS, PELL_CATCH, type MeecaThought } from './meecaLines.ts';
import { markCarvingsDone, recordCarving } from './meecaCarved.ts';
import { markTipHeard, tipHeard } from './tipMemory.ts';
import { readMs } from './dotGuide.ts';
import type { PlayerState as Player } from './types.ts';

export type MeecaPhase = 'card' | 'play' | 'caught' | 'ending' | 'done';
export type GuardPose = 'march' | 'idle' | 'turn' | 'look' | 'back' | 'walk' | 'catch' | 'offer';
export type WatchPhase = 'away' | 'turn' | 'look' | 'back';

export interface Guard {
  x: number;
  y: number;
  face: 1 | -1;
  pose: GuardPose;
  /** seconds in this pose */
  poseT: number;
}

interface Cycle {
  ph: WatchPhase;
  t: number;
  /** he has been fully on screen for every frame of the turn under way */
  turnSeen: boolean;
}

/** the view (world units) */
export interface MeecaView {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface MeecaHost {
  stageId: string;
  view: MeecaView;
  player: Player;
  /** the scene is over: the stage is cleared */
  win(): void;
  sfx?(kind: 'scratch' | 'cut' | 'turn' | 'caught' | 'card' | 'next' | 'blanket'): void;
  score?(n: number): void;
}

/** what the thumbs did this frame, as the engine's input state says it */
export interface MeecaControls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  punchPressed: boolean;
  kickPressed: boolean;
  megaPunchPressed: boolean;
  /** a thumb held still on the glass (TouchController.tsx), or the hold key / button */
  hold?: boolean;
}

/** a catch, as the tests read it back: who saw her, when his turn began, and how much of it was on screen */
export interface CatchLog {
  t: number;
  by: number;
  turnAt: number;
  turnSeen: boolean;
  trunk: number;
}

const near = (a: number, b: number, d: number) => Math.abs(a - b) <= d;
/** how near her feet must be to where she stands to carve */
export const CARVE_REACH = 46;
/** Pell's walk when he comes for her, and when he leads her back */
const PELL_WALK = 150;
const LEAD_WALK = 130;
/** a fern hides her when she is crouched this close to its middle (a share of its width) */
const FERN_HIDE = 0.46;
/** after leaving the line she must be out of it a moment before stepping back in counts (a slide back starts at her place) */
const REJOIN_AFTER = 0.35;
const REJOIN_NEAR = 24;
/** the shortest time a scene line stays before a tap moves it on */
const LINE_MIN = 0.45;
const FADE_OUT = 1.2;

export class MeecaPlay {
  phase: MeecaPhase = 'card';
  t = 0;
  /** her place in line (x) */
  slotX: number;
  marching = false;
  /** seconds the column has marched (for the march clips) */
  marchClock = 0;
  inLine = false;
  everInLine = false;
  /** 0 on the path, 1 on the column's lane (drawn), eased */
  laneK = 0;
  guards: Guard[];
  /** seconds cut into each tree */
  cut: number[];
  done = 0;
  carvingNow = false;
  /** the carving's sound comes once a letter */
  private letterAt = -1;
  /** the title card: how long it has been up, and its fade after the tap */
  cardT = 0;
  cardOut = -1;
  /** her thought on screen, and the ones waiting */
  thought: { text: string; at: number; until: number } | null = null;
  private thoughts: string[] = [];
  private said = new Set<string>();
  /** Pell's own words beside him (a catch) */
  pellSay: { text: string; until: number } | null = null;
  readonly catches: CatchLog[] = [];
  private caughtOn: number[];
  private catchStep: 'walk' | 'hold' | 'lead' = 'walk';
  private catchT = 0;
  private catchBy = 0;
  /** the ending: where it is, the line on screen and since when, Meeca in the blanket, the fade */
  endStep: 'turn' | 'walk' | 'catch' | 'lines' | 'fade' = 'turn';
  endT = 0;
  line = -1;
  lineAt = 0;
  wrapped = false;
  fade = 0;
  private won = false;
  private leftAt = -9;
  private cycles = new Map<number, Cycle>();
  private tapped = false;
  private camX = NaN;
  private camY = NaN;
  private steer: -1 | 0 | 1 = 0;
  private hold = false;
  readonly pell: number;
  /** every frame a guard was looking back, for the tests: who, when, and whether he was fully on screen */
  readonly looks: Array<{ t: number; by: number; on: boolean }> = [];
  /** when each thought was first said, for the order test */
  readonly saidAt: Array<{ id: string; t: number; x: number; done: number }> = [];

  constructor(readonly st: MeecaStage, private readonly host: MeecaHost) {
    this.slotX = st.slot0;
    this.pell = pellIndex(st);
    this.guards = st.marchers.map((m) => ({ x: st.slot0 + m.ahead, y: MEECA_G - LANE_UP, face: 1, pose: 'idle', poseT: 0 }));
    this.cut = st.trunks.map((tr) => carveSeconds(tr.lines) - carveSeconds(tr.lines, tr.preCut));
    this.caughtOn = st.trunks.map(() => 0);
  }

  // ───────────────────────────── what the engine and the HUD ask ─────────────────────────────

  /** the warnings cut so far (the HUD's "M. n/5") */
  get count(): number {
    return this.done;
  }
  readonly goal = MEECA_GOAL;
  /** the tree she is to carve next, or null once all are cut */
  get next(): MeecaTrunk | null {
    return this.st.trunks[this.done] ?? null;
  }
  /** the HUD steps aside for the card and the ending (its pieces would sit over the card's words and the story box) */
  get cinematic(): boolean {
    return (this.phase === 'card' && this.cardOut < 0) || this.phase === 'ending' || this.phase === 'done';
  }
  /**
   * the words on the screen now, as the stage draws them on its canvas (the "Three days earlier" card, her thought cloud, Pell's words,
   * the ending's story box): the page puts them in its text too (MeecaWords.tsx), so screen readers and QA's bots can read them
   * (QA v200: nothing of 5-M's was in the page)
   */
  screenWords(): Array<{ kind: 'card' | 'thought' | 'pell' | 'scene'; text: string }> {
    const out: Array<{ kind: 'card' | 'thought' | 'pell' | 'scene'; text: string }> = [];
    if (this.phase === 'card' || (this.cardOut >= 0 && this.cardOut < 1)) {
      const title = MEECA_CARD.title.join(' ');
      const kicker = MEECA_CARD.kicker.replace(' · ', ': ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      const tap = MEECA_CARD.tap.charAt(0) + MEECA_CARD.tap.slice(1).toLowerCase();
      out.push({ kind: 'card', text: `${kicker}. ${title}. ${MEECA_CARD.sub.join(' ')} ${tap}.` });
    }
    if (this.thought && this.phase !== 'card') out.push({ kind: 'thought', text: `Meeca thinks: ${this.thought.text}` });
    if (this.pellSay) out.push({ kind: 'pell', text: `Lieutenant Pell: ${this.pellSay.text}` });
    const l = (this.phase === 'ending' || this.phase === 'done') && this.line >= 0 ? MEECA_ENDING[this.line] : null;
    if (l) out.push({ kind: 'scene', text: `${l.who}: ${l.text}` });
    return out;
  }
  /** how close the view comes in (1 = as usual): the ending, closer */
  zoomWant(): number {
    if (this.phase !== 'ending' && this.phase !== 'done') return 1;
    const k = Math.min(1, this.endStep === 'turn' ? 0 : this.endStep === 'walk' ? this.endT / 1.2 : 1);
    return 1 + 0.45 * k * k * (3 - 2 * k);
  }
    /** a share of the stage done, for the progress bar */
  ratio(): number {
    const tr = this.st.trunks;
    return Math.max(0, Math.min(1, (this.slotX - tr[0].x) / Math.max(1, tr[tr.length - 1].x - tr[0].x)));
  }
  /** a guard's look-back rhythm, now: its phase, and how far through it (0..1) */
  watchOf(i: number): { ph: WatchPhase; k: number } | null {
    const c = this.cycles.get(i);
    const r = this.rhythm(i);
    if (!c || !r) return null;
    const dur = c.ph === 'away' ? r.away : c.ph === 'turn' ? TELL : c.ph === 'look' ? r.look : TURN_BACK;
    return { ph: c.ph, k: Math.max(0, Math.min(1, c.t / dur)) };
  }
  /** how far the warning on the next tree has been cut (0..1 per character), for the drawing */
  cutChars(i: number): number {
    const tr = this.st.trunks[i];
    if (!tr) return 0;
    if (i < this.done) return carveChars(tr.lines);
    let s = this.cut[i] ?? 0;
    let n = 0;
    for (const line of tr.lines) {
      for (const ch of line) {
        if (ch === ' ') continue;
        const need = /[A-Z]/.test(ch) ? carveSeconds([ch]) : carveSeconds(['.']);
        if (s >= need) {
          s -= need;
          n++;
        } else return n + s / need;
      }
    }
    return n;
  }
  /** she is hidden from a look: crouched in a fern */
  hidden(p: Player = this.host.player): boolean {
    if (!p.ducking || !p.grounded) return false;
    return this.st.ferns.some((f) => Math.abs(p.x - f.x) <= f.w * FERN_HIDE && Math.abs(p.y - f.y) < 10);
  }

  // ───────────────────────────── before the physics ─────────────────────────────

  filter(s: MeecaControls) {
    this.tapped = s.punchPressed || s.kickPressed || s.megaPunchPressed || s.jumpPressed;
    this.hold = !!s.hold || s.megaPunchPressed;
    // she cannot fight
    s.punchPressed = false;
    s.kickPressed = false;
    s.megaPunchPressed = false;
    this.steer = s.left ? -1 : s.right ? 1 : 0;
    if (this.phase !== 'play') {
      s.left = s.right = s.up = s.down = s.jumpPressed = s.jumpHeld = false;
      this.steer = 0;
      return;
    }
    if (this.inLine) {
      // a slide back, a jump or a duck: out of line (a slide forward only keeps step with it)
      if (s.left || s.jumpPressed || s.down) {
        this.inLine = false;
        this.leftAt = this.t;
      } else s.right = false;
    }
  }

  // ───────────────────────────── after the physics ─────────────────────────────

  after() {
    const p = this.host.player;
    if (this.phase === 'card') {
      // the opening shot: at the first tree, finishing the carving
      Object.assign(p, { x: this.st.spawn.x, y: this.st.spawn.y, vx: 0, vy: 0, grounded: true, climbing: false, ducking: false, facing: 1 });
      return;
    }
    if (this.phase === 'play') {
      if (this.inLine) {
        Object.assign(p, { x: this.slotX, y: MEECA_G, vy: 0, vx: this.marching ? MARCH : 0, grounded: true, climbing: false, ducking: false, facing: 1 });
      } else {
        const lo = Math.max(20, this.slotX - BACK_MAX);
        const hi = this.slotX + AHEAD_MAX;
        if (p.x < lo || p.x > hi) {
          p.x = Math.max(lo, Math.min(hi, p.x));
          if (!p.climbing) p.vx = 0;
        }
        // back in her place: a step into it (going forward, or standing) puts her back in line
        if (this.t - this.leftAt > REJOIN_AFTER && p.grounded && Math.abs(p.y - MEECA_G) < 3 && near(p.x, this.slotX, REJOIN_NEAR) && !p.ducking && this.steer >= 0 && !this.carvingNow) {
          this.inLine = true;
          if (!this.everInLine) this.everInLine = true;
          p.x = this.slotX;
        }
      }
      return;
    }
    // a catch and the ending place her themselves (stepCatch, stepEnding)
    p.vy = p.climbing ? 0 : p.vy;
  }

  // ───────────────────────────── the frame ─────────────────────────────

  step(dt: number) {
    this.t += dt;
    const p = this.host.player;
    for (const g of this.guards) g.poseT += dt;
    if (this.phase === 'card') {
      this.cardT += dt;
      if (this.tapped && this.cardT > 0.6) {
        this.phase = 'play';
        this.cardOut = 0;
        this.host.sfx?.('card');
        this.say(MEECA_THOUGHTS.carve);
      }
    } else if (this.cardOut >= 0 && this.cardOut < 1) this.cardOut = Math.min(1, this.cardOut + dt / 0.6);
    this.stepColumn(dt);
    if (this.phase === 'play') {
      this.stepWatch(dt);
      this.stepCarve(dt);
      this.stepTeach();
    } else if (this.phase === 'caught') this.stepCatch(dt);
    else if (this.phase === 'ending') this.stepEnding(dt);
    this.laneK += ((this.inLine || (this.phase === 'caught' && this.catchStep === 'lead') ? 1 : 0) - this.laneK) * Math.min(1, dt * 10);
    // her thoughts, one at a time
    if (this.thought && this.t > this.thought.until) this.thought = null;
    if (!this.thought && this.thoughts.length && !(this.phase === 'caught' && this.pellSay)) {
      const text = this.thoughts.shift()!;
      this.thought = { text, at: this.t, until: this.t + Math.max(2.6, readMs(text) / 1000 + 0.6) };
    }
    if (this.pellSay && this.t > this.pellSay.until) this.pellSay = null;
    void p;
  }

  /** the column marches, or halts by the next tree until its warning is cut (and waits for her if she is far back) */
  private stepColumn(dt: number) {
    const p = this.host.player;
    const tr = this.next;
    let go = this.phase === 'play' || this.phase === 'card';
    if (tr && this.slotX >= tr.x + tr.haltPast) go = false;
    if (!tr) go = false;
    if (this.phase === 'play' && !this.inLine && this.slotX - p.x > BACK_MAX - 60) go = false;
    this.marching = go;
    if (go) {
      this.slotX += MARCH * dt;
      this.marchClock += dt;
    }
    this.st.marchers.forEach((m, i) => {
      const g = this.guards[i];
      if ((this.phase === 'caught' || this.phase === 'ending') && i === this.pell) return;
      g.x = this.slotX + m.ahead;
      g.y = MEECA_G - LANE_UP;
      const c = this.cycles.get(i);
      const want: GuardPose = c && this.phase === 'play' ? (c.ph === 'away' ? (go ? 'march' : 'idle') : c.ph) : go ? 'march' : 'idle';
      if (want !== g.pose) {
        g.pose = want;
        g.poseT = 0;
      }
      g.face = 1;
    });
  }

  private rhythm(i: number): WatchRhythm | undefined {
    const s = this.st.stretches[Math.min(this.done, this.st.stretches.length - 1)];
    return s.watch.find((w) => w.who === i);
  }

  /** a guard is fully on screen (his whole drawing, lantern and all) */
  onScreen(i: number): boolean {
    const g = this.guards[i];
    const v = this.host.view;
    return g.x - 34 >= v.x0 && g.x + 40 <= v.x1 && g.y - 104 >= v.y0 && g.y + 4 <= v.y1;
  }

  /** she can be seen by guard i, looking back now */
  private seenBy(i: number): boolean {
    if (this.inLine || this.hidden()) return false;
    const p = this.host.player;
    const g = this.guards[i];
    return p.x < g.x + 10 && g.x - p.x < SIGHT;
  }

  /** the guards' look-backs (only once she has been in line: the opening is hers) */
  private stepWatch(dt: number) {
    if (!this.everInLine) return;
    const s = this.st.stretches[Math.min(this.done, this.st.stretches.length - 1)];
    for (const r of s.watch) {
      let c = this.cycles.get(r.who);
      if (!c) {
        c = { ph: 'away', t: r.offset, turnSeen: false };
        this.cycles.set(r.who, c);
      }
      const on = this.onScreen(r.who);
      c.t += dt;
      if (c.ph === 'away') {
        if (c.t >= r.away) {
          if (on) {
            c.ph = 'turn';
            c.t = 0;
            c.turnSeen = true;
            this.host.sfx?.('turn');
          } else c.t = r.away; // waits, ring full, until he is in full view
        }
      } else if (c.ph === 'turn') {
        if (!on) c.turnSeen = false;
        if (c.t >= TELL) {
          c.ph = 'look';
          c.t = 0;
        }
      } else if (c.ph === 'look') {
        this.looks.push({ t: this.t, by: r.who, on });
        if (on && c.turnSeen && this.seenBy(r.who)) {
          this.catches.push({ t: this.t, by: r.who, turnAt: this.t - c.t - TELL, turnSeen: c.turnSeen, trunk: this.done });
          this.startCatch(r.who);
          return;
        }
        if (c.t >= r.look) {
          c.ph = 'back';
          c.t = 0;
        }
      } else if (c.t >= TURN_BACK) {
        c.ph = 'away';
        c.t = 0;
        c.turnSeen = false;
      }
    }
  }

  /** a thumb held still by the next tree cuts its warning, a letter at a time */
  private stepCarve(dt: number) {
    const p = this.host.player;
    const tr = this.next;
    this.carvingNow = false;
    if (!tr || this.inLine) return;
    const at = near(p.x, tr.standX, CARVE_REACH) && Math.abs(p.y - tr.standY) < 8 && p.grounded && !p.ducking && !p.climbing;
    if (!at || !this.hold || this.steer !== 0) return;
    this.carvingNow = true;
    p.facing = 1;
    p.vx = 0;
    const before = Math.floor(this.cutChars(this.done));
    this.cut[this.done] += dt;
    const after = Math.floor(this.cutChars(this.done));
    if (after !== before || this.letterAt < 0) {
      this.letterAt = this.t;
      this.host.sfx?.('scratch');
    }
    if (this.cut[this.done] >= carveSeconds(tr.lines) - 1e-6) this.finishTrunk(tr);
  }

  private finishTrunk(tr: MeecaTrunk) {
    this.cut[tr.index] = carveSeconds(tr.lines);
    this.done++;
    this.carvingNow = false;
    this.letterAt = -1;
    this.host.sfx?.('cut');
    this.host.score?.(500);
    recordCarving({ id: tr.id, lines: [...tr.lines], along: Math.round((tr.x / this.st.width) * 1000) / 1000, high: !!tr.climb, caught: this.caughtOn[tr.index] });
    if (this.done === 1) this.say(MEECA_THOUGHTS.rejoin);
    if (this.done === 2) this.say(MEECA_THOUGHTS.two);
    if (this.done >= this.st.trunks.length) this.startEnding();
  }

  /** the thoughts that wait for their moment */
  private stepTeach() {
    const p = this.host.player;
    const tr = this.next;
    if (!tr) return;
    const pellOn = this.onScreen(this.pell);
    const pc = this.cycles.get(this.pell);
    if (this.everInLine && pc && pellOn) this.say(MEECA_THOUGHTS.ring);
    const halted = !this.marching && this.slotX >= tr.x + tr.haltPast - 1;
    if (this.done === 1 && halted && this.inLine && (pc?.ph === 'away' || pc?.ph === 'back') && this.said.has(MEECA_THOUGHTS.ring.id)) this.say(MEECA_THOUGHTS.slip);
    if (this.done >= 1 && !this.inLine && this.said.has(MEECA_THOUGHTS.slip.id)) {
      for (const [i, c] of this.cycles) {
        const r = this.rhythm(i);
        if (r && this.onScreen(i) && ((c.ph === 'away' && c.t > r.away - 1.6) || c.ph === 'turn')) this.say(MEECA_THOUGHTS.back);
      }
    }
    if (this.done === 2 && this.slotX >= tr.x - 260 && this.st.ferns.some((f) => near(f.x, tr.standX, 160))) this.say(MEECA_THOUGHTS.fern);
    if (this.done === 3 && tr.climb && this.slotX >= tr.climb.treeX - 280) this.say(MEECA_THOUGHTS.climb);
    if (this.done === this.st.trunks.length - 1 && halted) this.say(MEECA_THOUGHTS.last);
    void p;
  }

  /** a thought of hers: a teaching one once per device, and none twice in a run */
  say(th: MeecaThought) {
    if (this.said.has(th.id)) return;
    this.said.add(th.id);
    if (th.teach) {
      const key = `meeca:${th.id}`;
      if (tipHeard(this.host.stageId, key)) return;
      markTipHeard(this.host.stageId, key);
    }
    this.saidAt.push({ id: th.id, t: this.t, x: this.host.player.x, done: this.done });
    this.thoughts.push(th.text);
  }
  /** a thought that may come again (a catch) */
  private think(text: string) {
    this.thoughts.length = 0;
    this.thought = null;
    this.thoughts.push(text);
  }

  // ───────────────────────────── a catch: walked back into line ─────────────────────────────

  private startCatch(by: number) {
    this.phase = 'caught';
    this.catchBy = by;
    this.catchStep = 'walk';
    this.catchT = 0;
    this.inLine = false;
    this.carvingNow = false;
    const n = this.catches.length - 1;
    this.caughtOn[this.done] = (this.caughtOn[this.done] ?? 0) + 1;
    this.host.sfx?.('caught');
    this.think(MEECA_CAUGHT[n % MEECA_CAUGHT.length]);
    this.pellSay = { text: PELL_CATCH[n % PELL_CATCH.length], until: this.t + 2.2 };
    const g = this.guards[this.pell];
    g.face = -1;
    g.pose = 'walk';
    g.poseT = 0;
    // whoever looked turns back to the front
    for (const [i, c] of this.cycles) if (i !== this.pell && c.ph === 'look') { c.ph = 'back'; c.t = 0; }
  }

  private stepCatch(dt: number) {
    const p = this.host.player;
    const g = this.guards[this.pell];
    this.catchT += dt;
    p.vx = 0;
    if (this.catchStep === 'walk') {
      const to = p.x + 40;
      g.x = Math.max(to, g.x - PELL_WALK * dt);
      g.y = MEECA_G - LANE_UP;
      if (g.x <= to + 0.5 || this.catchT > 4) {
        g.x = to;
        // up on a branch or a trunk: she comes down to him
        Object.assign(p, { y: MEECA_G, vy: 0, grounded: true, climbing: false, ducking: false, facing: 1 });
        this.catchStep = 'hold';
        this.catchT = 0;
        g.pose = 'catch';
        g.poseT = 0;
      }
    } else if (this.catchStep === 'hold') {
      Object.assign(p, { vy: 0, grounded: true, climbing: false, ducking: false, facing: 1 });
      if (this.catchT > 1.1) {
        this.catchStep = 'lead';
        this.catchT = 0;
        g.face = 1;
        g.pose = 'walk';
        g.poseT = 0;
      }
    } else {
      // Pell walks her back: he goes ahead to his place, she follows him to hers
      const home = this.slotX + PELL_AHEAD;
      g.x = Math.min(home, g.x + LEAD_WALK * dt);
      const her = Math.min(this.slotX, g.x - 40);
      const move = her - p.x;
      Object.assign(p, { x: p.x + Math.max(-LEAD_WALK * dt, Math.min(LEAD_WALK * dt, move)), y: MEECA_G, vy: 0, grounded: true, climbing: false, ducking: false, facing: 1 });
      p.vx = Math.abs(move) > 0.5 ? LEAD_WALK : 0;
      if (g.x >= home - 0.5 && near(p.x, this.slotX, 1)) {
        p.x = this.slotX;
        this.inLine = true;
        this.everInLine = true;
        this.phase = 'play';
        g.face = 1;
        // every guard starts his rhythm over: no look-back right on the heels of a catch
        this.cycles.clear();
      }
    }
  }

  // ───────────────────────────── the ending: Pell, and the blanket ─────────────────────────────

  private startEnding() {
    this.phase = 'ending';
    this.endStep = 'turn';
    this.endT = 0;
    this.thoughts.length = 0;
    this.thought = null;
    this.cycles.clear();
    const g = this.guards[this.pell];
    g.pose = 'turn';
    g.poseT = 0;
    g.face = 1;
    markCarvingsDone();
  }

  private stepEnding(dt: number) {
    const p = this.host.player;
    const g = this.guards[this.pell];
    this.endT += dt;
    Object.assign(p, { vx: 0, vy: p.grounded ? 0 : p.vy, ducking: false });
    const to = p.x + 52;
    if (this.endStep === 'turn') {
      // he turns round first, the same turn as every look-back
      if (this.endT >= TELL) {
        this.endStep = 'walk';
        this.endT = 0;
        g.face = -1;
        g.pose = 'walk';
        g.poseT = 0;
      }
    } else if (this.endStep === 'walk') {
      g.x = Math.max(to, g.x - PELL_WALK * 0.8 * dt);
      if (g.x <= to + 0.5) {
        g.x = to;
        this.endStep = 'catch';
        this.endT = 0;
        g.pose = 'catch';
        g.poseT = 0;
        this.line = 0;
        this.lineAt = this.t;
      }
    } else if (this.endStep === 'catch' || this.endStep === 'lines') {
      if (this.endStep === 'catch' && this.endT > 1.0) this.endStep = 'lines';
      if (this.tapped && this.t - this.lineAt >= LINE_MIN) {
        this.host.sfx?.('next');
        this.line++;
        this.lineAt = this.t;
        if (this.line >= MEECA_ENDING.length) {
          this.line = MEECA_ENDING.length - 1;
          this.endStep = 'fade';
          this.endT = 0;
          return;
        }
        const beat = MEECA_ENDING[this.line].beat;
        if (beat === 'offer') {
          g.pose = 'offer';
          g.poseT = 0;
        } else if (beat === 'wrap') {
          this.wrapped = true;
          g.pose = 'idle';
          g.poseT = 0;
          this.host.sfx?.('blanket');
        }
      }
    } else if (this.endStep === 'fade') {
      this.fade = Math.min(1, this.endT / FADE_OUT);
      if (this.endT >= FADE_OUT + 0.2 && !this.won) {
        this.won = true;
        this.phase = 'done';
        this.host.win();
      }
    }
  }

  /**
   * The camera: as the engine's, but it keeps the guards who look back in view with her when they fit (upright the view is about 440
   * across): their tell is never off the edge while she is near them.
   */
  camera(cam: { x: number; y: number; viewportWidth: number; viewportHeight: number }, dt = 1 / 30) {
    const p = this.host.player;
    const vw = cam.viewportWidth;
    const vh = cam.viewportHeight;
    const ease = Math.min(1, dt * 4);
    if (this.phase === 'ending' || this.phase === 'done') {
      // the two of them in the middle, above the story box
      const g = this.guards[this.pell];
      const mid = (p.x + g.x) / 2;
      this.camX = Number.isFinite(this.camX) ? this.camX + (mid - vw / 2 - this.camX) * ease : cam.x;
      this.camY = Number.isFinite(this.camY) ? this.camY + (MEECA_G - vh * (vh > vw ? 0.6 : 0.56) - this.camY) * ease : cam.y;
      cam.x = this.camX;
      cam.y = this.camY;
      return;
    }
    // the opening shot: the first tree off to the side of the card (sideways the card has the left half, upright the top)
    if (this.phase === 'card' || (this.cardOut >= 0 && this.cardOut < 1)) {
      const tr = this.st.trunks[0];
      cam.x = Math.max(0, tr.x - vw * (vh > vw ? 0.5 : 0.64));
    }
    // the path low on the screen, the trees, the rings and her thoughts above it, as in the mock-ups (her up on the branch lifts it)
    const want = Math.min(p.y + 60, MEECA_G + 40) - vh * (vh > vw ? 0.8 : 0.9);
    this.camY = Number.isFinite(this.camY) ? this.camY + (want - this.camY) * ease : want;
    cam.y = this.camY;
    this.camX = NaN;
    const watchers = this.st.stretches[Math.min(this.done, this.st.stretches.length - 1)].watch.map((w) => this.guards[w.who].x);
    const front = Math.max(p.x, this.guards[this.pell].x, ...watchers) + 46;
    const back = Math.min(p.x, this.guards[this.pell].x) - 50;
    if (front - back <= vw) cam.x = Math.max(front - vw, Math.min(back, cam.x));
    else cam.x = Math.max(p.x + 120 - vw, Math.min(p.x - 90, cam.x));
    cam.x = Math.max(0, Math.min(this.st.width - vw, cam.x));
  }
}
