/**
 * meecaPlay — Meeca's stage (5-M, "On the March North") in play: the title card, the night camp (she tiptoes), the two paths that look
 * the same, Flicker's light and his following her, the carving (trace a circle on the trunk: "Round and round"), her thoughts and the
 * others' words, Flicker's hints when asked, the moonflower, and the ending with Lieutenant Pell and the blanket. The stage itself is
 * meecaStage.ts; its puzzle rooms are the shared kit's (puzzlePlay.ts, which the engine runs as for any stage with rooms); the drawing
 * is meecaArt.ts. The engine runs her on Pokey's own physics and touch controls, and hands this file what it needs through `MeecaHost`:
 *
 *   filter()  before the physics: during the card and the scenes the controls are not hers; at a trunk, a circle traced (or the hold
 *             key held) is a carving, and she stands still for it. (She cannot fight: the engine takes the punch and the kick away
 *             after the kit has had its tap.)
 *   after()   after the physics: she does not walk past a trunk she has not marked yet (she says why), and stands still in the scenes.
 *   step()    the card, the prologue's moments, Flicker, the carving, the scenes.
 *
 * Nothing can hurt her: no pits that kill, no animals, a puzzle never costs a life, and she is never sent back.
 */
import { carveChars, carveSeconds, CIRCLE_S, MEECA_G, PRACTICE_ID, TIPTOE, type MeecaStage, type MeecaTrunk } from './meecaStage.ts';
import { FLICKER_HINTS, FLICKER_NUDGES, MEECA_CARD, MEECA_ENDING_A, MEECA_ENDING_B, MEECA_GOAL, MEECA_SAY, ROOM_LINES, type MeecaLine, type MeecaSceneLine, type Speaker } from './meecaLines.ts';
import { markCarvingsDone, recordCarving } from './meecaCarved.ts';
import { markTipHeard, tipHeard } from './tipMemory.ts';
import { tipText, type TipLine } from './puzzleKit.ts';
import type { KitPlay } from './puzzlePlay.ts';
import type { PlayerState as Player } from './types.ts';

export type MeecaPhase = 'card' | 'play' | 'look' | 'endingA' | 'last' | 'endingB' | 'done';
export type GuardPose = 'march' | 'walk' | 'idle' | 'offer';

export interface Guard {
  x: number;
  y: number;
  face: 1 | -1;
  pose: GuardPose;
  poseT: number;
  coat: 'a' | 'b';
}

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
  /** the stage's puzzle rooms (the kit), for what holds her, what she carries and the moonflower */
  kit(): KitPlay | null;
  /** the scene is over: the stage is cleared */
  win(): void;
  sfx?(kind: 'scratch' | 'cut' | 'card' | 'next' | 'blanket' | 'blink' | 'step'): void;
  /** a step one plain jump climbs, right against her on that side (engine.ts stepAt): a plain walk into it stops */
  stepAt?(dir: -1 | 1): boolean;
  score?(n: number): void;
  /**
   * every picture the stage's first view needs has arrived (her sheet, the camp's night art, the ground's): the card waits for it (QA
   * 2026-10-31, Matt's phone: on a first visit the card was tapped away before they had come, and her thought showed over an empty
   * forest, no Meeca, no ground, for about three seconds). Unset: ready.
   */
  artReady?(): boolean;
}

/** the card takes a tap even with pictures still on their way after this long (s): a phone that never gets them can still play */
export const CARD_ART_WAIT = 12;

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
  /** the hold key / button held (the keys' and pads' way of carving) */
  hold?: boolean;
  /** how far a finger traced round a circle since the last frame (radians: TouchController.tsx, circleTrace.ts) */
  circle?: number;
  /** a finger held still on the glass (TouchController.tsx): carves only after HOLD_AFTER_TRIES tries that did not */
  touchHold?: boolean;
  /** tries at the carving that carved nothing since the last frame (TouchController.tsx) */
  carveTry?: number;
}

const near = (a: number, b: number, d: number) => Math.abs(a - b) <= d;
/** how long a short line of hers (or a bubble) stays up: her thoughts are under ten words */
export const lineSecs = (text: string): number => Math.max(2.4, 1.2 + 0.32 * text.trim().split(/\s+/).length);
/** a line waiting this far behind her, once she has walked on, is dropped: its moment has gone */
const STALE = 520;
/** how near her feet must be to where she stands to carve */
export const CARVE_REACH = 46;
/**
 * Anywhere this near the trunk's middle (px, either side) is its carving spot, beyond its own half-width (QA 2026-10-29: circles traced
 * with her standing at the middle of the trunk did nothing; only its left foot carved). It takes in the spot she stops at when she
 * tries to walk on past it (PAST).
 */
export const CARVE_SIDE = 72;
/** Meeca's tap reaches this much further than Pokey's, and behind her too (puzzlePlay.ts KitHost reachK; QA 2026-10-29) */
export const MEECA_REACH = 1.5;
/** Flicker's nudges: a room (or a trunk) with nothing new done for this long gets the first, then the second (s; QA 2026-10-29) */
export const NUDGE_S = [20, 40] as const;
/** holding something, stood still this long, her hold line comes again (s), and not again for this long after */
export const HOLD_IDLE_S = 6;
const HOLD_AGAIN_S = 12;
/** a finger held still on the glass at a trunk for this long after the hold registers (a mega, at ~0.46 s): Flicker says to trace */
const CARVE_HOLD_S = 1.0;
/** a plain walk pushed this long into a step one hop climbs brings her words on the hop (s) */
export const STEP_PUSH_S = 0.8;
/** she will not go past a trunk she has not marked by more than this (the old stop: the wall is now nearer, WALL_PAD) */
export const PAST = 120;
/** the wall at a trunk not cut yet: her middle stops this far past its far side (so she is still at its carving spot, CARVE_SIDE) */
export const WALL_PAD = 14;
/** more than this in one frame is her being put somewhere (a flag, a test), not a move into the wall (px; her run is ~10 a frame) */
export const WALL_STEP = 48;
/** tries at a trunk that carved nothing (a still tap, or a finger held still: TouchController.tsx) before a still finger held down carves too (the accessible way) */
export const HOLD_AFTER_TRIES = 3;
/** at a trunk, a slide walks her only after this long (s): long enough for a circle to show it is one */
export const STEER_WAIT = 0.35;
/** how long the "done" moment shows (the M glowing, Flicker happy) */
export const DONE_S = 1.6;
/** at a trunk, the ring's middle stays at least this far in from the left edge of the view (world px: the ring, its glow, Flicker) */
export const RING_MARGIN = 110;
/** the shortest time a scene line stays before a tap moves it on */
const LINE_MIN = 0.45;
const FADE_OUT = 1.2;
/** the moonflower scene: she stops and looks this long, then Pell walks in */
export const LOOK_S = 2.6;
const PELL_WALK = 110;

/** a line on the screen: her thought cloud, or someone's bubble */
export interface Said {
  who: Speaker;
  text: string;
  at: number;
  until: number;
}

export class MeecaPlay {
  phase: MeecaPhase = 'card';
  t = 0;
  cardT = 0;
  cardOut = -1;
  /** seconds cut into each trunk */
  cut: number[];
  /** the trunks marked, in order (the trail mark is the first) */
  marked = 0;
  carvingNow = false;
  private carveLeft = 0;
  private letterAt = -1;
  /** she is standing where a trunk is to be cut (the circle gesture is live: the engine tells the touch controls) */
  carveSpot = false;
  /** the trunk the "trace a circle" ring is over (at every carving spot, while she is not carving), or -1 */
  ringOn = -1;
  /** the ghost finger tracing the ring too (the first carving only) */
  ringFinger = false;
  /** Flicker's nudges: the room (or trunk) she is in, how long nothing new has happened there, what it has done, and how many said */
  private nudgeAt = '';
  private nudgeIdle = 0;
  private readonly nudgeSeen = new Map<string, Set<string>>();
  private readonly nudged = new Map<string, number>();
  /** her hands full and her stood still: how long; when the hold line came again */
  private holdIdle = 0;
  private holdAgainAt = -99;
  /** a finger held still at a trunk: when the hold registered, and when Flicker last said to trace */
  private pokeAt = -1;
  private pokeSaidAt = -99;
  /** pushing into a one-hop step: for how long, and the hop's words said when and how often */
  private pushT = 0;
  private stepSaidAt = -99;
  private stepTold = 0;
  /** on screen: her thought, and someone's bubble (Flicker, the Butler) */
  thought: Said | null = null;
  bubble: Said | null = null;
  private queue: Array<{ who: Speaker; text: string; secs?: number; x: number }> = [];
  private said = new Set<string>();
  readonly saidAt: Array<{ id: string; t: number; x: number }> = [];
  /** Flicker: where he is, and how much he shows (he blinks on in the woods) */
  flicker = { x: 0, y: 0, on: false, show: 0 };
  /** the ending: Pell and his two soldiers, the story box's line and since when, the blanket, the fade */
  pell: Guard;
  soldiers: Guard[];
  line = -1;
  lineAt = 0;
  scene: readonly MeecaSceneLine[] = MEECA_ENDING_A;
  turned = false;
  wrapped = false;
  small = false;
  fade = 0;
  lookT = 0;
  private endT = 0;
  private won = false;
  private tapped = false;
  private hold = false;
  private touchHold = false;
  private circle = 0;
  /** at the trunk to cut now: the tries that carved nothing (a tap, a poke, a flick), and when the last was */
  tries = 0;
  private tryAt = -99;
  /** the still-finger way of carving is open (after HOLD_AFTER_TRIES tries) */
  holdOk = false;
  /** the last trunk cut, and when (the "done" moment: its M glows, Flicker is glad) */
  doneTrunk = -1;
  doneAt = -99;
  private steer: -1 | 0 | 1 = 0;
  /** when the steer last changed */
  private steerAt = -99;
  private camX = NaN;
  private camY = NaN;
  /** Flicker's hints asked for, by room, and in all (the medal counts them) */
  private hintStep = new Map<string, number>();
  hintsAsked = 0;
  /** what the stuck watch told us (Easy's sparkle is the kit's; this keeps the room, for the hint) */
  private stuckIn = '';

  /** the trails' way through, the platforms one after another (the camera shows the next one: engine.ts landingToShow) */
  readonly route: number[];

  constructor(readonly st: MeecaStage, private readonly host: MeecaHost) {
    this.cut = st.trunks.map(() => 0);
    this.route = st.trails.flatMap((tr) => tr.steps.flatMap((s) => (s.kind === 'plat' ? [s.id] : [])));
    this.home = { x: st.spawn.x, y: st.spawn.y };
    const c = st.clearing;
    this.pell = { x: c.pellFrom, y: c.y, face: -1, pose: 'idle', poseT: 0, coat: 'a' };
    this.soldiers = c.soldiers.map((s, i) => ({ x: c.pellFrom + 60 + i * 70, y: c.y, face: -1, pose: 'idle', poseT: 0, coat: s.coat }));
  }

  // ───────────────────────────── what the engine and the HUD ask ─────────────────────────────

  /** the warnings cut so far (the HUD's "M. 1/5"): the trail mark is not one */
  get count(): number {
    return Math.max(0, this.marked - 1);
  }
  readonly goal = MEECA_GOAL;
  /** the trunk to mark next, or null once all are cut */
  get next(): MeecaTrunk | null {
    return this.st.trunks[this.marked] ?? null;
  }
  /** a soft chair holds her: the wiggle's arrows are drawn (meecaArt.ts drawMeecaFront) */
  get wiggling(): boolean {
    return !!this.host.kit()?.chairHeld;
  }
  /** the card is still waiting on the stage's pictures (it says so where "tap to begin" goes, and takes no tap) */
  get cardWaiting(): boolean {
    return this.phase === 'card' && this.cardT < CARD_ART_WAIT && !(this.host.artReady?.() ?? true);
  }
  /** the HUD steps aside for the card and the scenes */
  get cinematic(): boolean {
    return (this.phase === 'card' && this.cardOut < 0) || this.phase === 'look' || this.phase === 'endingA' || this.phase === 'endingB' || this.phase === 'done';
  }
  /** the scene's line on screen now, if any */
  get sceneLine(): MeecaSceneLine | null {
    return (this.phase === 'endingA' || this.phase === 'endingB' || this.phase === 'done') && this.line >= 0 ? this.scene[this.line] ?? null : null;
  }
  /** the words on the screen now, as the stage draws them on its canvas: the page puts them in its text too (MeecaWords.tsx) */
  screenWords(): Array<{ kind: 'card' | 'thought' | 'pell' | 'scene'; text: string }> {
    const out: Array<{ kind: 'card' | 'thought' | 'pell' | 'scene'; text: string }> = [];
    if (this.phase === 'card' || (this.cardOut >= 0 && this.cardOut < 1)) {
      const title = MEECA_CARD.title.join(' ');
      const kicker = MEECA_CARD.kicker.replace(' · ', ': ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      const tap = MEECA_CARD.tap.charAt(0) + MEECA_CARD.tap.slice(1).toLowerCase();
      out.push({ kind: 'card', text: `${kicker}. ${title}. ${MEECA_CARD.sub.join(' ')} ${tap}.` });
    }
    if (this.thought && this.phase !== 'card') out.push({ kind: 'thought', text: `Meeca thinks: ${this.thought.text}` });
    if (this.bubble) out.push({ kind: 'pell', text: `${this.bubble.who === 'butler' ? 'The Butler' : 'Flicker'}: ${this.bubble.text}` });
    const l = this.sceneLine;
    if (l) out.push({ kind: 'scene', text: `${l.who}: ${l.text}` });
    return out;
  }
  /** how close the view comes in (1 = as usual): the scenes, closer */
  zoomWant(): number {
    if (this.phase === 'look') return 1 + 0.12 * Math.min(1, this.lookT / 1.5);
    if (this.phase !== 'endingA' && this.phase !== 'endingB' && this.phase !== 'done') return 1;
    return 1.25;
  }
  /** a share of the stage done, for the progress bar */
  ratio(): number {
    return Math.max(0, Math.min(1, this.host.player.x / this.st.width));
  }
  /** her run, as a share: on tiptoe through the camp */
  speedK(): number {
    return this.host.player.x < this.st.campEnd && this.phase === 'play' ? TIPTOE / 285 : 1;
  }
  /** she is in the camp, on tiptoe (the drawing) */
  get tiptoe(): boolean {
    return this.host.player.x < this.st.campEnd && this.phase === 'play';
  }
  /** how far each trunk's words are cut (0..n characters, a fraction for the one under the pin) */
  cutChars(i: number): number {
    const tr = this.st.trunks[i];
    if (!tr) return 0;
    if (i < this.marked) return carveChars(tr.lines);
    let s = this.cut[i] ?? 0;
    let n = 0;
    for (const line of tr.lines) {
      for (const ch of line) {
        if (ch === ' ') continue;
        const need = carveSeconds([/[A-Z]/.test(ch) ? 'A' : '.']);
        if (s >= need) {
          s -= need;
          n++;
        } else return n + s / need;
      }
    }
    return n;
  }
  /** the room she is in (the kit's), or the trail mark's moment, for the hint */
  private hintRoom(): string {
    const kit = this.host.kit();
    const k = kit?.inRoom ?? -1;
    if (k >= 0 && kit) return kit.rooms[k].spec.id;
    const nx = this.next;
    if (nx?.room) return nx.room;
    if (nx && nx.index < 0) return 'mark';
    return 'none';
  }
  /**
   * Flicker's hint, asked for from the pause menu: the room's next step of help (never the answer), and the last again once they are
   * all given. Null until Flicker is with her.
   */
  askHint(): string | null {
    if (!this.flicker.on) return null;
    const room = this.hintRoom();
    const steps = FLICKER_HINTS[room] ?? FLICKER_HINTS.none;
    const i = this.hintStep.get(room) ?? 0;
    this.hintStep.set(room, Math.min(steps.length - 1, i + 1));
    this.hintsAsked++;
    const text = steps[Math.min(i, steps.length - 1)];
    this.sayNow('flicker', text, 4);
    return text;
  }
  /** Flicker can be asked now (he is with her, and nothing is on the screen that the menu would hide) */
  get canAsk(): boolean {
    return this.flicker.on && this.phase === 'play';
  }
  /** the kit's stuck watch fired in a room (Easy's sparkle is the kit's own; nothing is said: hints are only on request) */
  stuck(room: string) {
    this.stuckIn = room;
  }
  /** where Flicker's light is (the kit's room-5 glow is him) */
  flickerAt(): { x: number; y: number } | null {
    return this.flicker.on ? { x: this.flicker.x, y: this.flicker.y } : null;
  }

  /** a room's line from the kit (puzzleKit.ts RoomTips): her thought, or the speaker's bubble */
  kitLine(key: string, line: TipLine, seconds: number) {
    if (this.said.has(key)) return;
    this.said.add(key);
    const who: Speaker = typeof line === 'string' ? 'meeca' : line.who;
    this.saidAt.push({ id: key, t: this.t, x: this.host.player.x });
    this.queue.push({ who, text: tipText(line), secs: Math.min(seconds, lineSecs(tipText(line)) + 0.6), x: this.host.player.x });
  }

  // ───────────────────────────── before the physics ─────────────────────────────

  filter(s: MeecaControls) {
    this.tapped = s.punchPressed || s.kickPressed || s.megaPunchPressed || s.jumpPressed;
    this.hold = !!s.hold;
    this.touchHold = !!s.touchHold;
    this.circle = Math.abs(s.circle ?? 0);
    s.circle = 0;
    // a try at the trunk that carved nothing: the touch controls say (a still tap, or a finger held still, there; never a slide, a flick
    // or a circle). QA 2026-10-31: guessed here from taps, every flick at the trunk counted, since a touch starts as a tap
    const tried = s.carveTry ?? 0;
    s.carveTry = 0;
    if (tried > 0 && this.carveSpot && !this.carvingNow) {
      this.tryAt = this.t;
      this.tries += tried;
      if (this.tries >= HOLD_AFTER_TRIES && !this.holdOk) {
        this.holdOk = true;
        this.saidAt.push({ id: MEECA_SAY.carveHoldOk.id, t: this.t, x: this.host.player.x });
        this.sayNow('flicker', MEECA_SAY.carveHoldOk.text, lineSecs(MEECA_SAY.carveHoldOk.text) + 1);
        this.pokeSaidAt = this.t;
      }
    }
    // (a still finger held down is the touch controls' mega: at a trunk it carves nothing, and Flicker says to trace instead)
    if (s.megaPunchPressed && this.carveSpot) this.pokeAt = this.t;
    if (this.circle > 0) this.pokeAt = -1;
    s.megaPunchPressed = false;
    const steer = s.left ? -1 : s.right ? 1 : 0;
    if (steer !== this.steer) this.steerAt = this.t;
    this.steer = steer;
    // at a trunk, a new slide waits a moment before it walks her: a circle starts as a slide until it has turned enough to be one, and
    // that start walked her off the carving spot (QA 2026-10-31, the real app: 180 px before the circle took). Walking away still works
    if (this.carveSpot && steer !== 0 && this.t - this.steerAt < STEER_WAIT) s.left = s.right = false;
    const locked = this.phase !== 'play' && this.phase !== 'last';
    if (locked) {
      s.left = s.right = s.up = s.down = s.jumpPressed = s.jumpHeld = false;
      s.punchPressed = s.kickPressed = false;
      this.steer = 0;
      return;
    }
    // she has no leaf (she is not Pokey): a thumb held down through a fall never opens a glide. (Only past the top of the jump: the
    // hang at its top, and the short hop's cut on the way up, are as his.)
    // (But not on the frame of a new press with a jump to spare: the second jump. QA 2026-10-29, "level with the lip and drops back":
    // a second flick just past the top of the first jump started the jump and, its hold taken away that same frame, the engine's
    // variable-height cut stopped it at once, so a second jump past the top gave nothing at all.)
    const p = this.host.player;
    if (!p.grounded && !p.climbing && p.vy >= 90 && !(s.jumpPressed && p.jumpsLeft > 0)) s.jumpHeld = false;
    // at a trunk, tracing a circle (or holding the hold key) is carving: she stands still for it
    if (this.carveSpot && (this.circle > 0 || this.hold || (this.holdOk && this.touchHold) || this.carveLeft > 0)) {
      s.left = s.right = s.jumpPressed = false;
      s.down = false;
      this.steer = 0;
    }
  }

  // ───────────────────────────── after the physics ─────────────────────────────

  after() {
    const p = this.host.player;
    if (this.phase === 'card') {
      Object.assign(p, { x: this.home.x, y: this.home.y, vx: 0, vy: 0, grounded: true, climbing: false, ducking: false, facing: 1 });
      this.lastX = p.x;
      return;
    }
    if (this.phase !== 'play' && this.phase !== 'last') {
      p.vx = 0;
      this.lastX = p.x;
      return;
    }
    // she does not leave a trunk behind unmarked: the trail is the point. The trunk is a wall from the sky to the ground until it is cut
    // (QA 2026-10-31, Matt: "it just puts you back to where the cocoon is"): it stopped her only on the path's own ground, so a hop over
    // the cocoon and a climb up the post took her past it, and the first time she touched the path's height again, far on, she was put
    // back by the trunk. Now nothing gets past it, by any way or at any height, and she is only ever stopped where she meets it.
    this.wallCheck(p);
  }

  /** where she was at the end of the last frame (NaN: nowhere yet, or just put somewhere) */
  private lastX = NaN;
  /** where the card holds her: her bedroll, or the flag a cut-off run is picked up from */
  private home = { x: 0, y: 0 };
  /** when the wall's words were last said */
  private wallSaidAt = -99;
  /** the far face of the next trunk to cut, which she cannot pass (her middle stops here), or +Infinity once all are cut */
  wallX(): number {
    const nx = this.next;
    return nx ? nx.x + nx.w / 2 + WALL_PAD : Infinity;
  }
  /** she was put somewhere (a flag, a fall, a test): the wall does not drag her back from there */
  placed() {
    this.lastX = NaN;
  }
  /**
   * The stage starts at a flag (a run the phone cut off, flagResume.ts): every trunk behind it was cut on that run (a flag only counts
   * once she has passed it, and she cannot pass a trunk she has not cut), and Flicker is with her past his place.
   */
  resumeAt(x: number) {
    this.home = { x, y: this.st.spawn.y };
    for (let tr = this.next; tr && tr.x < x; tr = this.next) {
      this.cut[this.marked] = carveSeconds(tr.lines);
      this.marked++;
    }
    if (x >= this.st.flickerX && !this.flicker.on) Object.assign(this.flicker, { on: true, show: 1, x, y: this.st.spawn.y - 130 });
    for (const id of ['camp', 'high', 'lost', 'flicker', 'carve']) this.said.add(id);
    this.lastX = NaN;
  }
  private wallCheck(p: Player) {
    const wall = this.wallX();
    const was = this.lastX;
    // (only where she walks, hops or climbs into it this frame: a jump of more than a frame's move is her being put somewhere, never
    // something to undo)
    if (Number.isFinite(was) && was <= wall + 0.5 && p.x > wall && p.x - was <= WALL_STEP) {
      p.x = wall;
      p.vx = Math.min(0, p.vx);
      if (p.isVineSwinging) p.vx = 0;
      if (this.t - this.wallSaidAt >= 5) {
        this.wallSaidAt = this.t;
        const nx = this.next!;
        const l = nx.index < 0 ? MEECA_SAY.wallMark : MEECA_SAY.wallWarn;
        this.saidAt.push({ id: l.id, t: this.t, x: p.x });
        this.sayNow(l.who, l.text, lineSecs(l.text) + 0.6);
      }
    }
    this.lastX = p.x;
  }

  // ───────────────────────────── the frame ─────────────────────────────

  step(dt: number) {
    this.t += dt;
    const p = this.host.player;
    if (this.phase === 'card') {
      this.cardT += dt;
      if (this.tapped && this.cardT > 0.6 && !this.cardWaiting) {
        this.phase = 'play';
        this.cardOut = 0;
        this.host.sfx?.('card');
        this.say(MEECA_SAY.camp);
      }
    } else if (this.cardOut >= 0 && this.cardOut < 1) this.cardOut = Math.min(1, this.cardOut + dt / 0.6);
    if (this.phase === 'play' || this.phase === 'last') {
      this.stepPrologue();
      this.stepCarve(dt);
      this.stepHelp(dt);
      if (this.phase === 'play') {
        this.stepNudge(dt);
        this.stepMoon();
      }
    } else if (this.phase === 'look') this.stepLook(dt);
    else if (this.phase === 'endingA' || this.phase === 'endingB') this.stepScene(dt);
    this.stepFlicker(dt);
    this.pell.poseT += dt;
    for (const s of this.soldiers) s.poseT += dt;
    // the lines, one at a time (a bubble and a thought may share the screen)
    if (this.thought && this.t > this.thought.until) this.thought = null;
    if (this.bubble && this.t > this.bubble.until) this.bubble = null;
    for (let i = 0; i < this.queue.length; i++) {
      const q = this.queue[i];
      if (Math.abs(p.x - q.x) > STALE) {
        this.queue.splice(i, 1);
        i--;
        continue;
      }
      const slot = q.who === 'meeca' ? this.thought : this.bubble;
      if (slot) continue;
      const s: Said = { who: q.who, text: q.text, at: this.t, until: this.t + Math.max(q.secs ?? 0, lineSecs(q.text)) };
      if (q.who === 'meeca') this.thought = s;
      else this.bubble = s;
      this.queue.splice(i, 1);
      i--;
    }
  }

  /** the camp, the paths that look the same, and Flicker's light blinking on */
  private stepPrologue() {
    const p = this.host.player;
    if (p.x >= this.st.highX) this.say(MEECA_SAY.high);
    if (p.x >= this.st.forkX) this.say(MEECA_SAY.lost);
    if (!this.flicker.on && p.x >= this.st.flickerX) {
      this.flicker.on = true;
      this.flicker.x = this.st.flickerAt.x;
      this.flicker.y = this.st.flickerAt.y;
      this.host.sfx?.('blink');
      this.say(MEECA_SAY.flicker);
    }
    if (p.x >= this.st.darkX0 + 40) this.say(MEECA_SAY.shy);
  }

  /**
   * The help that comes by itself (QA batch 2026-10-29): while a soft chair holds her, its "Wiggle, wiggle!" stays up; by the practice
   * pinecone, how to pick it up; her hands full and her stood still, how to throw or set it down, again; a finger held still at a trunk,
   * Flicker says to trace a circle; and part-way along two of the trails, Flicker says they are getting somewhere.
   */
  private stepHelp(dt: number) {
    const p = this.host.player;
    const kit = this.host.kit();
    if (kit?.chairHeld) {
      const text = ROOM_LINES.sit.chair;
      if (this.thought?.text === text) this.thought.until = Math.max(this.thought.until, this.t + 0.6);
      else this.thought = { who: 'meeca', text, at: this.t, until: this.t + Math.max(1.5, lineSecs(text)) };
    }
    const practice = kit?.restingAt(PRACTICE_ID);
    if (practice && p.grounded && Math.abs(p.x - practice.x) < 170 && Math.abs(p.y - practice.y) < 10) this.say(MEECA_SAY.pick);
    const tip = kit?.heldTip() ?? null;
    if (tip && p.grounded && Math.abs(p.vx) < 5) this.holdIdle += dt;
    else this.holdIdle = 0;
    if (tip && this.holdIdle >= HOLD_IDLE_S && this.t - this.holdAgainAt >= HOLD_AGAIN_S) {
      this.holdAgainAt = this.t;
      this.holdIdle = 0;
      const text = tipText(tip);
      this.saidAt.push({ id: 'holdAgain', t: this.t, x: p.x });
      this.queue.push({ who: typeof tip === 'string' ? 'meeca' : tip.who, text, x: p.x });
    }
    if (this.pokeAt >= 0 && this.carveSpot && !this.carvingNow && !this.holdOk && this.t - this.pokeAt >= CARVE_HOLD_S) {
      this.pokeAt = -1;
      if (this.t - this.pokeSaidAt >= 6) {
        this.pokeSaidAt = this.t;
        this.sayNow('flicker', MEECA_SAY.carveHold.text, lineSecs(MEECA_SAY.carveHold.text) + 0.6);
        this.saidAt.push({ id: MEECA_SAY.carveHold.id, t: this.t, x: p.x });
      }
    }
    if (!this.carveSpot) this.pokeAt = -1;
    // pushing into a step one hop climbs, a plain walk stopped dead: the hop (her own words; again after 20 s if still pushing, three
    // times at most)
    const d = this.steer;
    if (d && p.grounded && !p.climbing && Math.abs(p.vx) < 20 && !kit?.holding && this.host.stepAt?.(d)) this.pushT += dt;
    else this.pushT = 0;
    if (this.pushT >= STEP_PUSH_S && this.stepTold < 3 && this.t - this.stepSaidAt >= 20) {
      this.pushT = 0;
      this.stepTold++;
      this.stepSaidAt = this.t;
      this.said.add(MEECA_SAY.stepHop.id);
      this.saidAt.push({ id: MEECA_SAY.stepHop.id, t: this.t, x: p.x });
      this.sayNow('meeca', MEECA_SAY.stepHop.text, lineSecs(MEECA_SAY.stepHop.text) + 0.6);
    }
    // (part-way along: at the start of the second section of the trail after room 1, and of the one after room 3)
    const sec = (i: number) => this.st.trails[i]?.sections[1];
    const a = sec(2), b = sec(4);
    if (a && p.x >= a.x0 && p.x < a.x1) this.say(MEECA_SAY.trailA);
    if (b && p.x >= b.x0 && p.x < b.x1) this.say(MEECA_SAY.trailB);
  }

  /**
   * Flicker's nudges (QA batch 2026-10-29: a player stood 32 s in room 3 and nothing was said; a bot stalled 70 s there, 25 s in room 4
   * and at the dark bank of room 5): in a room whose way on is still shut, or at a trunk she is not carving, nothing new done for about
   * 20 s brings his first nudge, about 40 s the second, stronger one. Something new done (a plate pressed, a thing picked up, a step
   * lit: anything the room has not seen yet) starts the clock again. They point at the piece; the answer is still hers.
   */
  private stepNudge(dt: number) {
    const kit = this.host.kit();
    let at = '';
    let key = '';
    let lines: readonly [string, string] | undefined;
    const k = kit?.inRoom ?? -1;
    if (kit && k >= 0 && !kit.solved(k)) {
      at = kit.rooms[k].spec.id;
      key = kit.progressKey(k);
      lines = FLICKER_NUDGES[at];
    } else if (this.carveSpot && this.next) {
      at = `carve:${this.next.id}`;
      key = String(Math.floor((this.cut[this.marked] ?? 0) * 3));
      lines = FLICKER_NUDGES.carve;
    }
    if (!at || !lines || !this.flicker.on) {
      this.nudgeAt = '';
      return;
    }
    if (at !== this.nudgeAt) {
      this.nudgeAt = at;
      this.nudgeIdle = 0;
    }
    let seen = this.nudgeSeen.get(at);
    if (!seen) this.nudgeSeen.set(at, (seen = new Set()));
    if (!seen.has(key)) {
      seen.add(key);
      this.nudgeIdle = 0;
    }
    // (a chair holding her has its own words up)
    if (!kit?.chairHeld) this.nudgeIdle += dt;
    const n = this.nudged.get(at) ?? 0;
    if (n >= lines.length || this.nudgeIdle < NUDGE_S[n]) return;
    this.nudged.set(at, n + 1);
    const id = `nudge:${at}:${n}`;
    this.saidAt.push({ id, t: this.t, x: this.host.player.x });
    this.queue.push({ who: 'flicker', text: lines[n], secs: lineSecs(lines[n]) + 1.2, x: this.host.player.x });
  }

  /** Flicker: blinking on, then with her (a little ahead and over her head, bobbing); at a trunk he hovers by the words */
  private stepFlicker(dt: number) {
    const f = this.flicker;
    if (!f.on) return;
    f.show = Math.min(1, f.show + dt / 0.5);
    const p = this.host.player;
    const nx = this.next;
    let tx = p.x + (p.facing >= 0 ? 30 : -30);
    let ty = p.y - 100 + Math.sin(this.t * 2.4) * 6;
    // (blinking on, he stays put a moment: she comes to him)
    if (this.t - (this.saidAt.find((s) => s.id === 'flicker')?.t ?? -9) < 1.6) {
      tx = f.x;
      ty = f.y;
    } else if (this.doneTrunk >= 0 && this.t - this.doneAt < DONE_S + 1.2 && this.st.trunks[this.doneTrunk]) {
      // (a trunk just cut: he rises up beside the carving, glad, so his words sit above it and the new M shows)
      const d = this.st.trunks[this.doneTrunk];
      tx = d.textX + 70;
      ty = d.textY - 95 + Math.sin(this.t * 3) * 4;
    } else if (nx && this.carveSpot) {
      tx = nx.textX + 52;
      ty = nx.textY - 10 + Math.sin(this.t * 3) * 4;
    } else if ((this.phase === 'endingB' || this.phase === 'done') && this.small) {
      // (small: he comes down and sits by her feet, meecaArt.ts drawFlicker's sad clip)
      tx = p.x + 26;
      ty = p.y - 24;
    }
    const k = Math.min(1, dt * 4);
    f.x += (tx - f.x) * k;
    f.y += (ty - f.y) * k;
  }

  /** a circle traced at the next trunk (or the hold key held) cuts its words, a letter at a time */
  private stepCarve(dt: number) {
    const p = this.host.player;
    const tr = this.next;
    this.carveSpot = false;
    this.carvingNow = false;
    this.ringOn = -1;
    this.ringFinger = false;
    if (!tr) return;
    // (the last warning waits for its scene: she cuts it with Pell standing there)
    if (tr.index === MEECA_GOAL - 1 && this.phase !== 'last') return;
    const kit = this.host.kit();
    // (her own spot by its left foot, or anywhere along the trunk and a step either side of it)
    const along = near(p.x, tr.standX, CARVE_REACH) || near(p.x, tr.x, tr.w / 2 + CARVE_SIDE);
    const at = along && Math.abs(p.y - tr.standY) < 8 && p.grounded && !p.climbing && !kit?.holding;
    if (!at) {
      this.carveLeft = 0;
      return;
    }
    this.carveSpot = true;
    // the ring that says "trace a circle" shows at every trunk, with the ghost finger tracing it (QA 2026-10-31: the first time only, and
    // the blind tester never learned it), whenever she is there and not cutting: as she comes, and again after a try that carved nothing
    this.ringOn = this.marked;
    this.ringFinger = true;
    if (this.marked === 0) this.say(MEECA_SAY.carve);
    if (tr.index === MEECA_GOAL - 1) this.say(MEECA_SAY.last);
    const add = this.circle * CIRCLE_S + (this.hold || (this.holdOk && this.touchHold) ? dt : 0);
    if (add > 0) this.carveLeft = 0.25;
    else this.carveLeft = Math.max(0, this.carveLeft - dt);
    if (add <= 0 && this.carveLeft <= 0) return;
    this.carvingNow = true;
    p.facing = tr.x >= p.x ? 1 : -1;
    p.vx = 0;
    const i = this.marked;
    const before = Math.floor(this.cutChars(i));
    this.cut[i] += add;
    const after = Math.floor(this.cutChars(i));
    if (add > 0 && (after !== before || this.letterAt < 0 || this.t - this.letterAt > 0.3)) {
      this.letterAt = this.t;
      this.host.sfx?.('scratch');
    }
    if (this.cut[i] >= carveSeconds(tr.lines) - 1e-6) this.finishTrunk(tr);
  }

  private finishTrunk(tr: MeecaTrunk) {
    const i = this.marked;
    this.cut[i] = carveSeconds(tr.lines);
    this.marked++;
    this.carvingNow = false;
    this.carveLeft = 0;
    this.letterAt = -1;
    this.host.sfx?.('cut');
    if (!tipHeard(this.host.stageId, 'meeca:ring')) markTipHeard(this.host.stageId, 'meeca:ring');
    // the "done": the M glows, Flicker is glad and says so (the next trunk starts with its own tries)
    this.doneTrunk = i;
    this.doneAt = this.t;
    this.tries = 0;
    this.lastX = NaN;
    if (tr.index !== MEECA_GOAL - 1) {
      const l = tr.index < 0 ? MEECA_SAY.carveDoneMark : MEECA_SAY.carveDone;
      this.saidAt.push({ id: l.id, t: this.t, x: this.host.player.x });
      this.sayNow('flicker', l.text, lineSecs(l.text) + 0.4);
    }
    if (tr.index < 0) return;
    this.host.score?.(500);
    recordCarving({ id: tr.id, lines: [...tr.lines], along: Math.round((tr.x / this.st.width) * 1000) / 1000, high: tr.standY < MEECA_G - 100, caught: 0 });
    if (tr.index === MEECA_GOAL - 1) this.startScene(MEECA_ENDING_B, 'endingB');
  }

  /** the moonflower opens (Flicker's light reached it): she stops to look at it, and that is when Pell steps out */
  private stepMoon() {
    const kit = this.host.kit();
    const room = kit?.rooms.find((r) => r.spec.id === 'look');
    if (!room?.moons[0]?.open) return;
    this.phase = 'look';
    this.lookT = 0;
    this.thought = null;
    this.bubble = null;
    this.queue.length = 0;
    this.say(MEECA_SAY.wonder);
  }

  private stepLook(dt: number) {
    const p = this.host.player;
    this.lookT += dt;
    Object.assign(p, { vx: 0, ducking: false });
    if (p.grounded) p.facing = this.st.clearing.moonX >= p.x ? 1 : -1;
    if (this.lookT < LOOK_S) return;
    // Pell and his two soldiers walk in from the far side of the clearing, lanterns up
    const c = this.st.clearing;
    const walk = (g: Guard, to: number) => {
      const was = g.x;
      g.x = Math.max(to, g.x - PELL_WALK * dt);
      const want: GuardPose = g.x > to + 0.5 ? 'march' : 'idle';
      if (want !== g.pose) {
        g.pose = want;
        g.poseT = 0;
      }
      return was !== g.x;
    };
    let moving = walk(this.pell, c.pellAt);
    this.soldiers.forEach((s, i) => { moving = walk(s, c.soldiers[i].x) || moving; });
    if ((!moving && this.lookT > LOOK_S + 0.4) || this.lookT > LOOK_S + 8) this.startScene(MEECA_ENDING_A, 'endingA');
  }

  private startScene(lines: readonly MeecaSceneLine[], phase: 'endingA' | 'endingB') {
    this.phase = phase;
    this.scene = lines;
    this.line = 0;
    this.lineAt = this.t;
    this.endT = 0;
    this.thought = null;
    this.bubble = null;
    this.queue.length = 0;
    if (phase === 'endingB') markCarvingsDone();
    this.beat(lines[0]);
  }

  private beat(l: MeecaSceneLine | undefined) {
    if (!l) return;
    if (l.beat === 'turn') this.turned = true;
    if (l.beat === 'small') this.small = true;
    if (l.beat === 'offer') {
      this.pell.pose = 'offer';
      this.pell.poseT = 0;
    }
    if (l.beat === 'wrap') {
      this.wrapped = true;
      this.pell.pose = 'idle';
      this.pell.poseT = 0;
      this.host.sfx?.('blanket');
    }
  }

  private stepScene(dt: number) {
    const p = this.host.player;
    Object.assign(p, { vx: 0, ducking: false });
    if (this.endT >= 0 && this.fade > 0) {
      this.endT += dt;
      this.fade = Math.min(1, this.endT / FADE_OUT);
      if (this.endT >= FADE_OUT + 0.2 && !this.won) {
        this.won = true;
        this.phase = 'done';
        this.host.win();
      }
      return;
    }
    if (!this.tapped || this.t - this.lineAt < LINE_MIN) return;
    this.host.sfx?.('next');
    if (this.line + 1 >= this.scene.length) {
      if (this.phase === 'endingA') {
        // back to her: the last warning, with Pell standing by
        this.phase = 'last';
        this.line = -1;
        this.pell.face = -1;
        return;
      }
      this.fade = 0.001;
      this.endT = 0;
      return;
    }
    this.line++;
    this.lineAt = this.t;
    this.beat(this.scene[this.line]);
  }

  /** a line of the stage's: a teaching one once per device, and none twice in a run */
  say(l: MeecaLine) {
    if (this.said.has(l.id)) return;
    this.said.add(l.id);
    if (l.teach) {
      const key = `meeca:${l.id}`;
      if (tipHeard(this.host.stageId, key)) return;
      markTipHeard(this.host.stageId, key);
    }
    this.saidAt.push({ id: l.id, t: this.t, x: this.host.player.x });
    this.queue.push({ who: l.who, text: l.text, x: this.host.player.x });
  }
  /** a line said now, over what was waiting (a hint asked for) */
  private sayNow(who: Speaker, text: string, secs: number) {
    const s: Said = { who, text, at: this.t, until: this.t + Math.max(secs, lineSecs(text)) };
    if (who === 'meeca') this.thought = s;
    else this.bubble = s;
  }

  /**
   * The camera in the scenes (elsewhere the engine's own, which frames the puzzle rooms): the card's opening shot of the camp, the
   * moonflower and her looking up at it, and the two of them above the story box at the end.
   */
  /** how far the view has leaned to show the trunk she is carving (0..1) */
  private ringLean = 0;
  /**
   * At a trunk to cut, the view keeps the ring on the bark and Flicker beside it well inside the screen (QA 2026-10-31, the blind tester
   * upright: the ring and Flicker's light sat half off the left edge). Eased in and out; the engine's own framing otherwise.
   */
  private ringFrame(cam: { x: number; viewportWidth: number }, dt: number) {
    const tr = this.next;
    const on = this.carveSpot && !!tr;
    this.ringLean = Math.max(0, Math.min(1, this.ringLean + (on ? dt : -dt) / 0.5));
    if (!tr || this.ringLean <= 0) return;
    const k = this.ringLean * this.ringLean * (3 - 2 * this.ringLean);
    const vw = cam.viewportWidth;
    // (the ring's left edge and Flicker's glow at least RING_MARGIN in; never so far that she leaves the view on the right)
    const want = Math.max(Math.min(cam.x, tr.textX - RING_MARGIN), this.host.player.x + 40 - vw);
    cam.x = Math.max(0, cam.x + (want - cam.x) * k);
  }

  camera(cam: { x: number; y: number; viewportWidth: number; viewportHeight: number }, dt = 1 / 30) {
    const p = this.host.player;
    const vw = cam.viewportWidth;
    const vh = cam.viewportHeight;
    const ease = Math.min(1, dt * 3);
    let want: { x: number; y: number } | null = null;
    if (this.phase === 'card' || (this.cardOut >= 0 && this.cardOut < 1)) want = { x: Math.max(0, p.x - vw * (vh > vw ? 0.42 : 0.62)), y: MEECA_G + 60 - vh * (vh > vw ? 0.62 : 0.86) };
    else if (this.phase === 'look' || this.phase === 'endingA' || this.phase === 'endingB' || this.phase === 'done') {
      const c = this.st.clearing;
      const mid = this.phase === 'look' && this.lookT < LOOK_S ? (p.x + c.moonX) / 2 : (p.x + Math.min(this.pell.x, p.x + 260)) / 2;
      want = { x: mid - vw / 2, y: c.y + 40 - vh * (vh > vw ? 0.6 : 0.72) };
    }
    if (!want) {
      this.camX = NaN;
      this.ringFrame(cam, dt);
      return;
    }
    this.camX = Number.isFinite(this.camX) ? this.camX + (want.x - this.camX) * ease : cam.x;
    this.camY = Number.isFinite(this.camY) ? this.camY + (want.y - this.camY) * ease : cam.y;
    cam.x = Math.max(0, Math.min(this.st.width - vw, this.camX));
    cam.y = this.camY;
  }
}
