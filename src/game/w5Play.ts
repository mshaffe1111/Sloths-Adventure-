/**
 * w5Play — World 5's pieces of play, run together during a stage (the Orchid Sanctuary): the stillness and the creeping silk, the soft
 * chairs that tug, the cakes and the Butler's tray, the teapots' sleepy steam, the humming threads and the spiders they wake, the silk
 * sheets, the closing orchids, the cocoons and Meeca's carvings. The rules live in w5Kit.ts; this file keeps their state for one run,
 * steps them against Pokey each frame, and draws them (w5Look.ts: stand-ins until the World 5 art lands). The engine only hands it
 * what it needs through `W5Host`, as World 4 does (w4Play.ts).
 */
import {
  BUTLER, CAKE, chairPull, COCOON, hitCocoon, humReaches, inSteam, newButler, newCocoon, newGate, newSit, orchidAt, potAt, punchReachesCocoon,
  admiring, seatedIn, silkSpeed, sitDrowsy, sleepySpeed, SIT, spoutOf, stepButler, stepGate, stepSit, TEAPOT, THREAD, threadTouched,
  touchesCake, trayAt, W5_TEACH, onScreen, SPIDER5, laced, newSeam, SEAMSTRESS, stepSeam, type ButlerState, type CocoonState,
  type GateState, type SeamState, type SitState, type ViewBox, type W5Extras, WOBBLE,
} from './w5Kit.ts';
import { cocoonStop, onRest } from './w5Kit.ts';
import { W5_POUCH } from './w5Lines.ts';
import { readMs } from './dotGuide.ts';
import {
  carvingBox, drawBlossom, drawButler, drawCake, drawCard, drawCarving, drawChair, drawCocoon, drawDoily, drawFern, drawFlyingTray, drawOrchid,
  drawPennant, drawPiece, drawPinkBell, drawShrineArt, drawSilkOnPokey, drawSilkSheet, drawSleepyOnPokey, drawSteam, drawTeaTable, drawTeapot, drawThread,
  drawW5Light, drawWrappedChair, takeAt,
} from './w5Look.ts';
import { w5ArtReady, w5Height, type W5Piece as ArtPiece } from './w5Art.ts';
import { drawSeamstress, drawW5Spider, warmW5Butler, warmW5Seamstress, warmW5Spider, type ButlerPose } from './w5Creatures.ts';
import { W5_FRAMES } from './w5PropsData.ts';
import { drawAura } from './readable.ts';
import type { Collectible, Enemy, Platform, PlayerState as Player, Vine } from './types.ts';

/** what the engine lends World 5 each frame */
export interface W5Host {
  t: number;
  player: Player;
  /** the way he is steering (-1 left, 1 right, 0 neither) */
  steer: -1 | 0 | 1;
  /** what the camera shows (world units): a spider crouches only in full view of it (w5Kit SPIDER5.edge) */
  view?: ViewBox;
  platforms: Platform[];
  collectibles: Collectible[];
  enemies: Enemy[];
  /** his punch landed this frame (at his fist), and which swing it is (one hit per swing) */
  punch: { x: number; y: number } | null;
  swing: number;
  /** a hit that costs a heart (the wrap) */
  hurt(dir: number): void;
  /** a Dot line, once per stage (`key` remembers it) */
  tip(key: string, text: string, seconds: number): void;
  /** the warning on screen has had its moment (the wrap came): take it down, so the next line need not wait behind it */
  clearTip?(): void;
  /** the moment for a line already sent has passed: take it down, up or still waiting (a scene's line he walked away from) */
  passTip?(text: string): void;
  /** a floating word in the world (`life` seconds: the engine's pop-up time when not given) */
  float(text: string, x: number, y: number, color: string, life?: number): void;
  sfx(kind: 'hum' | 'wrap' | 'cake' | 'puff' | 'tray' | 'free' | 'crack'): void;
  /** a creature freed from a cocoon (a rescue stage counts it) */
  rescue?(): void;
  /** a cake was eaten (World 5's cake record) */
  ate?(): void;
}

/** how far ahead (px) a piece is "coming into view" for its first-time line */
const SEE = 560;
/** the Butler is seen from further off (he stands tall with his tray): his line has time to come even after another */
const BUTLER_SEE = 1100;
/** an awake spider's first-time line comes this far ahead (it notices him from SPIDER5.sense, 430 px): time to say it before */
const SPIDER_SEE = 1300;
/** the Seamstress's line comes this far before the start of the sheet she is knitting (she stands at its far end) */
const SEAM_SEE = 760;
/**
 * the cocoons' line comes this far ahead of the first (5-5's EARLY, w5Stages.ts): well before it, so it is up before the cocoon is in
 * reach even when a line about the flag or the fern is being read (QA, v198: it came beside the third, after he had passed two)
 */
const COCOON_SEE = 900;
const said = (key: string) => `tip:${key}`;
/** how much silk must have crept onto him (0..1) for shaking it off to count in the Trophy Room */
export const SILK_SHED_FROM = 0.25;
/** what a cake or the tray did to him stays up this long (s): the engine's 0.8 s pop-up was gone before it was read */
export const W5_POP_LIFE = 1.6;
type W5Box = { x0: number; y0: number; x1: number; y1: number };
/** the table card is drawn at least as large on the screen as at this zoom (upright at 320 x 782, where it reads), up to this scale */
export const CARD_READ_ZOOM = 0.87;
const CARD_MAX_SCALE = 1.8;
/** how many times its size the table card (and World 5's pop-up words, engine.ts drawPopups) is drawn at this zoom */
export const cardScale = (zoom: number): number => Math.max(1, Math.min(CARD_MAX_SCALE, CARD_READ_ZOOM / zoom));

export class W5Play {
  private sit: SitState = newSit();
  /** he has moved since the stage started (or since a respawn): standing at the start, reading Dot's first line, never wraps him */
  private moved = false;
  /** seconds of sleepiness left (a cake, the steam, the Butler's tray), and how long this spell of it was (the moon's ring) */
  private sleepy = 0;
  private sleepyFor = 1;
  /** seconds in which standing still does not count (the stuck-helper has just spoken: its line is read first, not the silk's) */
  private grace = 0;
  private eaten: boolean[];
  private butlers: ButlerState[];
  private trayFly: Array<{ x: number; y: number; vx: number; vy: number; at: number } | null>;
  private threadAt: number[];
  private gates = new Map<number, GateState>();
  private cocoons: Array<CocoonState & { swing: number }>;
  /** the silk lines (World 5's lianas), for Dot's line as the first comes into view */
  private silkLines: Vine[];
  /** the Seamstress at her knitting, and when her last lace was cast (for its flight to him) */
  private seams: SeamState[];
  private laceAt: number[];
  private orchidOf = new Map<number, number>();
  /** where the table card was drawn last frame (world), for Dot's bubble to keep clear of; null when it is not up */
  private cardBox: W5Box | null = null;
  private orchidPlat = new Map<number, Platform>();
  private pull = 0;
  private seated = -1;
  private last = { x: NaN, y: NaN };
  private zzz = 0;
  private enemies: Enemy[] = [];
  private player: Player | null = null;
  private clock = 0;
  /** a line held a moment, to follow the warning it replaces (the wrap's line, after the creep's warning comes down) */
  private pendingTip: { key: string; text: string; seconds: number; at: number } | null = null;
  /** how drowsy the screen shows him (the engine's drowsy veil) */
  veil = 0;
  /** when he last wiggled (a new push left or right) */
  private wiggleAt = -99;
  /** for the jump that sheds silk: was he on the ground last frame */
  private wasGrounded = true;
  /** when he last pulled against the silk (steering or jumping with it on him), and how much was on him then */
  private tugAt = -99;
  private tugSilk = 0;
  /** for the Trophy Room: trays punched away, times the silk was shaken off, and the most silk on him since it was last off */
  private traysKnocked = 0;
  private silkShed = 0;
  private silkPeak = 0;

  /**
   * how far (world px, signed) to draw him off his place this moment: a quick wobble while he pulls against the silk, so being stuck is
   * seen and every push is seen to do something (QA v198: "steering does nothing" with the silk on him). It never moves his body.
   */
  wobble(t: number): number {
    const since = t - this.tugAt;
    if (since < 0 || since > WOBBLE.hold || this.tugSilk <= SIT.showTug) return 0;
    const fade = 1 - since / WOBBLE.hold;
    return Math.sin(t * WOBBLE.rate) * (WOBBLE.px + WOBBLE.perSilk * this.tugSilk) * fade;
  }

  /**
   * the cocoons' middles and the closing orchids' cups, for Dot's ring (dotGuideView.ts GuideView.w5): made once, a cocoon marked done
   * once it is open. Her orchid tip rang Pokey, not the orchid (QA, 5-3, v198)
   */
  readonly guideThings: Array<{ kind: 'cocoon' | 'orchid'; x: number; y: number; done?: boolean }> = [];

  constructor(private readonly w5: W5Extras, platforms: Platform[], vines: Vine[]) {
    this.silkLines = vines.filter((v) => v.silk);
    this.seams = (w5.seamstresses ?? []).map(() => newSeam());
    this.laceAt = (w5.seamstresses ?? []).map(() => -99);
    this.eaten = (w5.cakes ?? []).map(() => false);
    this.butlers = (w5.butlers ?? []).map(() => newButler());
    this.trayFly = (w5.butlers ?? []).map(() => null);
    this.threadAt = (w5.threads ?? []).map(() => -99);
    this.cocoons = (w5.cocoons ?? []).map(() => ({ ...newCocoon(), swing: -1 }));
    for (const s of w5.spiders ?? []) this.gates.set(s.id, newGate(!!s.doze));
    for (const c of w5.cocoons ?? []) this.guideThings.push({ kind: 'cocoon', x: c.x, y: c.y - COCOON.mid });
    // (the bloom's middle: its painted piece hangs from just over the ledge to under it, w5Look.ts drawOrchid)
    for (const o of w5.orchids ?? []) this.guideThings.push({ kind: 'orchid', x: o.x, y: Math.round(o.y + w5Height('orchidOpen', o.w) * 0.4) });
    (w5.orchids ?? []).forEach((o, i) => {
      for (const id of o.petalIds ?? []) this.orchidOf.set(id, i);
      const pl = o.platformId !== undefined ? platforms.find((q) => q.id === o.platformId) : undefined;
      if (pl) this.orchidPlat.set(i, pl);
    });
    // the painted props: start the sheet now (stagePreload.ts has usually decoded it already); the stand-ins cover the moment until then
    w5ArtReady();
    // and the trained creatures this stage holds (World 5 sheets, let go with the world): the spider's clips, the Butler's poses
    if (w5.spiders?.length) warmW5Spider();
    if (w5.butlers?.length) warmW5Butler();
    if (w5.seamstresses?.length) warmW5Seamstress();
    this.silks = vines.filter((v) => v.silk);
  }

  /**
   * Dot's stuck-helper has just spoken (he keeps jumping at a step and landing where he began): for `seconds` the stillness does not
   * count, so her help is what he reads, not the silk's warning over it (QA, 5-1, 2026-10-26: stuck at a step, all she said was "Wake
   * up, Pokey!"). The silk already on him comes off as he hops.
   */
  holdStill(seconds: number) {
    this.grace = Math.max(this.grace, seconds);
  }

  /** everything about him back to fresh (a respawn, or the test harness placing him somewhere new) */
  calm() {
    this.sit = newSit();
    this.silkPeak = 0;
    this.sleepy = 0;
    this.pull = 0;
    this.seated = -1;
    this.veil = 0;
    this.moved = false;
    this.grace = 0;
    this.tugAt = -99;
    this.tugSilk = 0;
    // (the Seamstress back to her knitting)
    this.seams = this.seams.map(() => newSeam());
  }

  /** a spider whose gate is shut (asleep, or crouching to rush): the engine leaves it standing, harmless, for this frame */
  spiderHeld(e: Enemy): boolean {
    const g = this.gates.get(e.id);
    if (!g || g.phase === 'go') return false;
    e.vx = 0;
    return true;
  }

  /** a petal in a shut orchid's cup cannot be picked (or seen) */
  shut(c: Collectible): boolean {
    const i = this.orchidOf.get(c.id);
    if (i === undefined) return false;
    return !orchidAt(this.w5.orchids![i], this.clock).picks;
  }

  /** the silk on him (0..1), for the tests and the look */
  get silk(): number {
    return this.sit.silk;
  }
  get asleep(): number {
    return this.sleepy;
  }

  /**
   * one frame. Returns how much of his walking speed is left (sleepy, or the silk sticking) and the chairs' tug (px/s, + right), which the
   * engine adds to the wind's push.
   */
  step(dt: number, h: W5Host): { speed: number; pull: number } {
    const p = h.player;
    const w5 = this.w5;
    this.clock = h.t;
    if (this.pendingTip && h.t >= this.pendingTip.at) {
      const pt = this.pendingTip;
      this.pendingTip = null;
      h.tip(pt.key, pt.text, pt.seconds);
    }
    this.stepRest(h, dt);
    this.enemies = h.enemies;
    this.player = p;
    // back at a flag (or placed there): a fresh start, no silk carried over
    if (Number.isFinite(this.last.x) && Math.hypot(p.x - this.last.x, p.y - this.last.y) > 260) this.calm();
    this.last = { x: p.x, y: p.y };
    const ahead = (x: number, y: number, far = SEE) => x > p.x - 40 && x - p.x < far && Math.abs(y - p.y) < 260;

    // the orchids: open, closing (it shivers: still a ledge), shut (no ledge, and its petals cannot be picked), opening
    (w5.orchids ?? []).forEach((o, i) => {
      const s = orchidAt(o, h.t);
      const pl = this.orchidPlat.get(i);
      if (pl) pl.broken = !s.solid;
      if (ahead(o.x, o.y)) h.tip(said(W5_TEACH.orchid), W5_TEACH.orchid, 4);
    });

    // the soft chairs tug him toward them as he passes; sitting in one brings the silk on faster
    let pull = 0;
    let seated = -1;
    (w5.chairs ?? []).forEach((c, i) => {
      if (c.wrapped) return;
      pull += chairPull(c, p.x, p.y, p.grounded);
      if (seatedIn(c, p.x, p.y) && p.grounded) seated = i;
      if (ahead(c.x, c.y, 480)) h.tip(said(W5_TEACH.chair), W5_TEACH.chair, 3.6);
    });
    this.pull = pull;
    this.seated = seated;

    // the silk sheets: lingering in front of one counts as standing still (and faster)
    let admire = false;
    const admired = new Set<number>();
    (w5.sheets ?? []).forEach((s, i) => {
      if (admiring(s, p.x, p.y, p.vx, p.grounded)) {
        admire = true;
        admired.add(i);
      }
      if (ahead(s.x0, s.bottom, 420)) h.tip(said(W5_TEACH.sheet), W5_TEACH.sheet, 3.6);
    });

    // the silk lines: Dot's line as the first comes into view (they swing like lianas: the engine's vine rules)
    for (const v of this.silkLines) {
      if (!ahead(v.x, v.bottomY)) continue;
      h.tip(said(W5_TEACH.silk), W5_TEACH.silk, 4);
      break;
    }

    // don't sit: standing still lets the silk creep up him; moving or a wiggle shakes it off; too long, and he is wrapped
    if (h.steer !== 0) this.moved = true;
    this.grace = Math.max(0, this.grace - dt);
    // (wiggling in front of a silk sheet is pulling free, not admiring it: a thumb sliding back and forth there kept him slower than a
    // walk, so it still counted as lingering and the silk came on as fast as he shook it off; separate slides walked him out of it.
    // QA v198: either way frees him now)
    if (h.steer !== 0 && h.steer !== this.sit.steer) this.wiggleAt = h.t;
    const lingering = admire && h.t - this.wiggleAt > WIGGLE_HOLD;
    const still = this.moved && this.grace <= 0 && ((p.grounded && !p.climbing && Math.abs(p.vx) < SIT.still && h.steer === 0) || lingering);
    const r = stepSit(this.sit, { still, steer: h.steer, seated: seated >= 0, admiring: lingering }, dt, !!w5.gentle);
    this.sit = r.s;
    // (taught before it ever catches him: the first time he stops, well before the silk can start. QA v198: the silk "grabbed silently",
    // its line only coming once it was on him)
    if (r.s.still >= SIT.notice && r.s.silk <= 0) h.tip(said(W5_TEACH.still), W5_TEACH.still, 3.4);
    if (r.began) h.tip(said(W5_TEACH.sit), W5_TEACH.sit, 4.2);
    // a jump is a wiggle: it sheds silk at once (and every moment in the air sheds more), so a jump is never lost in the silk
    const tookOff = this.wasGrounded && !p.grounded && p.vy < -200 && !p.climbing && !p.isVineSwinging;
    this.wasGrounded = p.grounded;
    const silkBefore = this.sit.silk;
    if (tookOff && this.sit.silk > 0) this.sit = { ...this.sit, silk: Math.max(0, this.sit.silk - SIT.jump) };
    // pulling against the silk shows: he wobbles in it while he steers or jumps with silk on him (wobble)
    const pulled = Math.max(this.sit.silk, tookOff ? silkBefore : 0);
    // silk that had got a real hold on him (a quarter of the way) and is now all shaken off counts as shaken off once
    this.silkPeak = r.wrapped ? 0 : Math.max(this.silkPeak, silkBefore, this.sit.silk);
    if (this.sit.silk <= 0 && this.silkPeak >= SILK_SHED_FROM) {
      this.silkShed++;
      this.silkPeak = 0;
    }
    if (pulled > SIT.showTug && (h.steer !== 0 || tookOff)) {
      this.tugAt = h.t;
      this.tugSilk = pulled;
    }

    // the Seamstress: knitting; let him linger at her sheet and she looks up (the tell, a "!" over her), then casts lace onto him. Moving
    // on during the tell calls it off. She looks up only in full view on the screen, so the warning is always seen
    (w5.seamstresses ?? []).forEach((sm, i) => {
      const sh = w5.sheets?.[sm.sheet];
      if (sh && ahead(sh.x0, sh.bottom, SEAM_SEE)) h.tip(said(W5_TEACH.seamstress), W5_TEACH.seamstress, 3.8);
      const v = h.view;
      const seen = !v || onScreen(v, sm.x, sm.y - SEAMSTRESS.h / 2, 60, SEAMSTRESS.h, 10);
      const was = this.seams[i];
      // (wiggling free of her lace, as she says to, is not lingering: she does not cast again at a thumb sliding left and right)
      const out = stepSeam(was, { lingering: lingering && admired.has(sm.sheet) && !r.wrapped, seen }, dt);
      this.seams[i] = out.st;
      if (out.st.phase === 'tell' && was.phase === 'knit') h.float('!', sm.x, sm.y - SEAMSTRESS.h - 18, '#fb7185');
      if (out.cast) {
        this.sit = { ...this.sit, silk: laced(this.sit.silk) };
        this.laceAt[i] = h.t;
        h.sfx('puff');
        h.float('LACE!', p.x, p.y - 96, '#f5d0fe');
        h.clearTip?.();
        this.pendingTip = { key: said(W5_TEACH.laced), text: W5_TEACH.laced, seconds: 3.4, at: h.t + 0.15 };
      }
    });
    if (r.wrapped) {
      h.sfx('wrap');
      // (the creep's warning comes down, and the wrap's own line follows a beat later: both are urgent, and one sent over the other
      // would wait behind it until it was old news; the beat lets the screen take the first down before the second arrives)
      h.clearTip?.();
      const at = h.t + 0.15;
      if (w5.gentle) {
        // 5-1 teaches it gently: the silk bursts off and Dot wakes him; no heart
        h.float('WAKE UP!', p.x, p.y - 96, '#f5d0fe');
        this.pendingTip = { key: said(W5_TEACH.wrapGentle), text: W5_TEACH.wrapGentle, seconds: 3.2, at };
      } else {
        h.float('WRAPPED!', p.x, p.y - 96, '#f5d0fe');
        h.hurt(0);
        this.pendingTip = { key: said(W5_TEACH.wrapped), text: W5_TEACH.wrapped, seconds: 3.6, at };
      }
    }

    // sleepiness (a cake, the steam): it wears off
    this.sleepy = Math.max(0, this.sleepy - dt);
    const doze = (secs: number) => {
      if (this.sleepy <= 0) this.zzz = 0;
      if (secs > this.sleepy) this.sleepyFor = secs;
      this.sleepy = Math.max(this.sleepy, secs);
    };

    // the cakes: they look like pickups; touched, he eats one and goes sleepy
    (w5.cakes ?? []).forEach((c, i) => {
      if (this.eaten[i]) return;
      if (ahead(c.x, c.y)) h.tip(said(W5_TEACH.cake), W5_TEACH.cake, 3.8);
      if (!touchesCake(c, p.x, p.y, !!p.ducking)) return;
      this.eaten[i] = true;
      this.ateCake(h, doze);
    });

    // the Butler: he holds out his tray as Pokey comes; punch it away, or walk into it and eat
    (w5.butlers ?? []).forEach((b, i) => {
      const st = this.butlers[i];
      const tray = trayAt(b, st);
      const near = b.dir * (p.x - b.x) > 0 && Math.abs(p.x - b.x) < BUTLER.offer && Math.abs(p.y - b.y) < 80;
      const punched = !!h.punch && Math.hypot(h.punch.x - tray.x, h.punch.y - tray.y) < BUTLER.punch;
      const touch = Math.abs(p.x - tray.x) < 13 + 20 && tray.y > p.y - 38 && tray.y < p.y + 4;
      // (his line as he comes into view, as every first-time tip is: by the time he holds the tray out it is too late to read it)
      if (near || ahead(b.x, b.y, BUTLER_SEE)) h.tip(said(W5_TEACH.butler), W5_TEACH.butler, 3.8);
      const out = stepButler(st, { near, punched, touch }, dt);
      this.butlers[i] = out.st;
      if (out.knocked) {
        this.traysKnocked++;
        this.trayFly[i] = { x: tray.x, y: tray.y, vx: b.dir * 260, vy: -380, at: h.t };
        // (said plainly, and long enough to read: QA 5-2, 2026-10-26, the tap at the tray scored but nothing said what it had done)
        h.float('TRAY AWAY!', tray.x, tray.y - 30, '#fef08a', W5_POP_LIFE);
        h.sfx('tray');
      }
      if (out.ate) this.ateCake(h, doze);
    });

    // the teapots: a rattle, then a puff of sleepy steam; breathe it and he goes sleepy for a moment
    (w5.pots ?? []).forEach((pot) => {
      if (ahead(pot.x, pot.y)) h.tip(said(W5_TEACH.pot), W5_TEACH.pot, 3.8);
      const ph = potAt(pot, h.t);
      if (ph.phase === 'puff' && ph.u < dt / pot.puff + 1e-6 && Math.abs(pot.x - p.x) < 700) h.sfx('puff');
      if (inSteam(pot, h.t, p.x, p.y)) {
        doze(TEAPOT.sleepy);
        h.tip(said(W5_TEACH.steam), W5_TEACH.steam, 3);
      }
    });

    // the humming threads: a touch makes it hum, and the spiders that hear it turn and come
    const alarms = new Set<number>();
    // (while 5-5's pouch scene plays, the garden holds its breath: no spider rouses and a hum calls none, so the scene is never read
    // over a fight. QA, v198: he took two or three hits reading it as he went on)
    const hush = this.restPlaying(h.t);
    (w5.threads ?? []).forEach((th, i) => {
      if (ahead(th.x0, th.y, 520)) h.tip(said(W5_TEACH.thread), W5_TEACH.thread, 3.8);
      if (h.t - this.threadAt[i] < THREAD.cool || !threadTouched(th, p.x, p.y, !!p.ducking)) return;
      this.threadAt[i] = h.t;
      h.sfx('hum');
      h.float('HMMMM...', (th.x0 + th.x1) / 2, th.y - 50, '#fff7d6');
      let heard = false;
      for (const s of hush ? [] : w5.spiders ?? []) {
        const e = h.enemies.find((q) => q.id === s.id);
        if (!e || e.defeated || !humReaches(th, e.x, e.y)) continue;
        alarms.add(s.id);
        heard = true;
      }
      if (heard) h.tip(said(W5_TEACH.hummed), W5_TEACH.hummed, 2.6);
    });

    // the spiders: asleep, or watching; once roused, a crouch (the warning), then the rush (the engine's spider brain). It crouches
    // only in full view on the screen, and a crouch or a rush that leaves the screen is called off, so every rush is warned where it is
    // seen, upright and sideways (QA 2026-10-26: upright on a 320 px phone every crouch had been off the screen)
    for (const s of w5.spiders ?? []) {
      const e = h.enemies.find((q) => q.id === s.id);
      const g = this.gates.get(s.id);
      if (!e || !g || e.defeated) continue;
      const dx = p.x - e.x;
      const dy = p.y - (e.y + 12);
      // (its line well before it can see him and crouch: QA, 2026-10-26, the tip came on the frame of the first bite)
      if (!g.dozing && ahead(e.x, e.y, SPIDER_SEE)) h.tip(said(W5_TEACH.spider), W5_TEACH.spider, 3.6);
      // (the scene's hush: a spider still calm stays so, held where it stands, harmless)
      if (hush && g.phase === 'calm') continue;
      const v = h.view;
      const seen = !v || onScreen(v, e.x, e.y, e.width, e.height, SPIDER5.edge);
      const shown = !v || onScreen(v, e.x, e.y, e.width, e.height);
      const next = stepGate(g, { dx, dy, alarm: alarms.has(s.id), hunting: (e.alertT ?? 0) > 0, grounded: p.grounded, seen, shown }, dt);
      if (next.phase === 'windup' && g.phase === 'calm') {
        e.facing = dx >= 0 ? 1 : -1;
        h.float('!', e.x, e.y - 34, '#fb7185');
      }
      if (next.phase === 'go' && g.phase !== 'go') {
        e.alertT = 4;
        e.state = 'run';
        e.stateT = 0;
        e.facing = dx >= 0 ? 1 : -1;
      }
      this.gates.set(s.id, next);
    }

    // the cocoons: punch one open (a few hits) to free whoever is inside
    (w5.cocoons ?? []).forEach((c, i) => {
      const st = this.cocoons[i];
      st.since += dt;
      if (st.freed) return;
      if (ahead(c.x, c.y, COCOON_SEE)) h.tip(said(W5_TEACH.cocoon), W5_TEACH.cocoon, 3.8);
      // (one tied across the path holds him where his punch lands on it, until it is open)
      const stop = cocoonStop(c, st.freed, p.x, p.y);
      if (stop !== null) {
        // (he bumps it: it jiggles, a soft no)
        if (p.vx > 0 && st.since > 0.8) st.since = 0.15;
        p.x = stop;
        if (p.vx > 0) p.vx = 0;
      }
      if (!h.punch || st.swing === h.swing || !punchReachesCocoon(c, h.punch)) return;
      const nx = { ...hitCocoon(st), swing: h.swing };
      this.cocoons[i] = nx;
      h.sfx('crack');
      if (nx.freed) {
        const g = this.guideThings.find((q) => q.kind === 'cocoon' && q.x === c.x && q.y === c.y - COCOON.mid);
        if (g) g.done = true;
        h.sfx('free');
        h.float('FREED!', c.x, c.y - 90, '#bbf7d0');
        h.rescue?.();
      }
    });

    for (const f of this.trayFly) {
      if (!f) continue;
      f.vy += 1200 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
    }
    if (this.sleepy > 0) {
      this.zzz -= dt;
      if (this.zzz <= 0) {
        this.zzz = 0.9;
        h.float('z', p.x + p.facing * 16, p.y - 66, '#ddd6fe');
      }
    }
    this.stepSilks(h);
    this.veil = Math.max(sitDrowsy(this.sit) * 0.8, this.sleepy > 0 ? 0.55 * Math.min(1, this.sleepy) : 0);
    return { speed: sleepySpeed(this.sleepy) * silkSpeed(this.sit.silk), pull };
  }

  /**
   * what this run did, for the Trophy Room (badges.ts StageStats): cakes avoided (every tray punched away, and on a clear every cake
   * left uneaten), petals picked from the orchids' cups while they were open, and the times the silk was shaken off
   */
  tally(collectibles: readonly Collectible[], win: boolean): { cakesAvoided: number; orchidPetals: number; silkShed: number } {
    const uneaten = win ? this.eaten.filter((e) => !e).length : 0;
    const orchidPetals = collectibles.filter((c) => c.collected && this.orchidOf.has(c.id)).length;
    return { cakesAvoided: this.traysKnocked + uneaten, orchidPetals, silkShed: this.silkShed };
  }

  private ateCake(h: W5Host, doze: (s: number) => void) {
    const p = h.player;
    doze(CAKE.sleepy);
    h.ate?.();
    h.sfx('cake');
    h.float('SLEEPY AND SLOW...', p.x, p.y - 96, '#ddd6fe', W5_POP_LIFE);
    h.tip(said(W5_TEACH.ate), W5_TEACH.ate, 3.2);
  }

  // ───────────────────────────── drawing ─────────────────────────────

  /** the pieces behind Pokey: trunks and their carvings, the table, chairs, sheets, pots and steam, orchids, cocoons, the Butler, threads, cakes */
  drawBack(ctx: CanvasRenderingContext2D, t: number, view: { x0: number; x1: number }) {
    const w5 = this.w5;
    const vis = (x: number, pad = 300) => x > view.x0 - pad && x < view.x1 + pad;
    for (const d of w5.decor ?? []) if (!d.front && vis(d.x, d.w)) this.decor(ctx, d, t);
    (w5.carvings ?? []).forEach((c, i) => {
      if (vis(c.x, 200)) drawCarving(ctx, c, i * 13 + 5);
    });
    for (const s of w5.sheets ?? []) {
      if (!vis((s.x0 + s.x1) / 2, s.x1 - s.x0)) continue;
      const p = this.player;
      const near = p && p.x > s.x0 && p.x < s.x1 ? 1 : 0;
      drawSilkSheet(ctx, s.x0, s.x1, s.top, s.bottom, t, near);
    }
    (w5.seamstresses ?? []).forEach((sm, i) => {
      if (!vis(sm.x, 200)) return;
      const st = this.seams[i];
      // her pose: knitting (her lace spread on the ground before her), looking up with her needles raised (the tell), casting
      const pose = st.phase === 'tell' ? 'tell' : st.phase === 'cast' ? 'attack' : 'idle';
      drawSeamstress(ctx, sm.x, sm.y, sm.dir, pose, t, st.phase === 'tell' ? Math.min(1, st.t / SEAMSTRESS.tell) : 0);
    });
    for (const tb of w5.tables ?? []) if (vis(tb.x)) drawTeaTable(ctx, tb.x, tb.y, t);
    (w5.chairs ?? []).forEach((c, i) => {
      if (!vis(c.x)) return;
      // (never the white stool: it reads as a cocoon, QA v198)
      if (c.wrapped) drawWrappedChair(ctx, c.x, c.y, 84, c.face < 0);
      else {
        const p = this.player;
        const tug = p ? Math.min(1, Math.abs(chairPull(c, p.x, p.y, true)) / 60) : 0;
        drawChair(ctx, c.x, c.y, 84, c.color ?? (i % 2 ? 'lilac' : 'pink'), c.face, tug, t);
      }
    });
    for (const pot of w5.pots ?? []) {
      if (!vis(pot.x)) continue;
      const ph = potAt(pot, t);
      drawTeapot(ctx, pot.x, pot.y, 56, pot.dir, ph.phase === 'warn' ? 0.4 + 0.6 * ph.u : 0, t);
      const s = spoutOf(pot);
      // a warm wisp always (it is always warm), a thick billow on the puff
      const a = ph.phase === 'puff' ? Math.min(1, ph.u * 6, (1 - ph.u) * 4) : 0.2;
      drawSteam(ctx, s.x, s.y, ph.phase === 'puff' ? TEAPOT.rise : 50, a, t, ph.phase === 'puff' ? 1.6 : 0.5);
    }
    (w5.orchids ?? []).forEach((o) => {
      if (!vis(o.x)) return;
      const s = orchidAt(o, t);
      drawOrchid(ctx, o.x, o.y, o.w, s.open, s.phase === 'closing' ? 1 : 0, t, o.stem ?? o.y + 260);
    });
    (w5.cocoons ?? []).forEach((c, i) => {
      if (!vis(c.x)) return;
      const st = this.cocoons[i];
      drawCocoon(ctx, c.x, c.y, Math.max(0, 1 - st.since / 0.3), st.hits, st.freed, t, { look: this.player ? Math.sign(this.player.x - c.x) : 0, block: c.block });
    });
    (w5.butlers ?? []).forEach((b, i) => {
      if (!vis(b.x)) return;
      const st = this.butlers[i];
      const tray = trayAt(b, st);
      const bow = st.phase === 'knocked' ? Math.max(0, 1 - st.t / 0.8) : 0;
      // his pose: lifting the tray as Pokey comes (the tell), holding it right out (the attack), the tray punched away (hurt, then dazed)
      const pose: ButlerPose = st.phase === 'offer' ? (st.t < BUTLER.tell ? 'tell' : 'attack') : st.phase === 'knocked' ? (st.t < 0.35 ? 'hurt' : 'defeated') : 'idle';
      drawButler(ctx, b.x, b.y, b.dir, st.phase === 'knocked' ? { ...tray, out: -1 } : tray, st.cake && st.phase !== 'knocked', t, bow, pose);
    });
    (w5.threads ?? []).forEach((th, i) => {
      if (!vis(th.x0)) return;
      drawThread(ctx, th.x0, th.x1, th.y, Math.max(0, 1 - (t - this.threadAt[i]) / THREAD.hum), t);
    });
    (w5.cakes ?? []).forEach((c, i) => {
      if (this.eaten[i] || !vis(c.x)) return;
      // (it glows like a pickup on purpose: that is the trap)
      drawCake(ctx, c.x, c.y + Math.sin(t * 3 + c.x * 0.02) * 3, 34, t, true, true);
    });
    this.drawFreed(ctx, t, vis);
  }

  /** over Pokey: the silk creeping up him, the spiders' marks, the card when he is at the table, a flying tray, the falling petals */
  /** `zoom`: the view's (css px a world px); `hud`: the bottom of the HUD band along the top, in the world */
  drawFront(ctx: CanvasRenderingContext2D, t: number, view: { x0: number; x1: number; y0: number; y1: number; zoom?: number; hud?: number }) {
    const w5 = this.w5;
    const p = this.player;
    for (const d of w5.decor ?? []) if (d.front && d.x > view.x0 - d.w && d.x < view.x1 + d.w) this.decor(ctx, d, t);
    if (p) drawSilkOnPokey(ctx, p.x + this.wobble(t), p.y, this.sit.silk, t);
    if (p && this.sleepy > 0) drawSleepyOnPokey(ctx, p.x, p.y, this.sleepy / Math.max(0.1, this.sleepyFor), t);
    for (const s of w5.spiders ?? []) {
      const e = this.enemies.find((q) => q.id === s.id);
      const g = this.gates.get(s.id);
      if (!e || !g || e.defeated || e.x < view.x0 - 100 || e.x > view.x1 + 100) continue;
      ctx.save();
      ctx.textAlign = 'center';
      // (the crouch's "!" is drawn over everything, after the light and the pop-up words: drawWarnings)
      if (g.phase === 'calm' && g.dozing) {
        const u = (t * 0.7 + e.id * 0.3) % 1;
        ctx.globalAlpha = 1 - u;
        ctx.font = `700 ${11 + u * 8}px Fredoka, sans-serif`;
        ctx.fillStyle = '#ede9fe';
        ctx.strokeStyle = 'rgba(30, 20, 50, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText('z', e.x + 10 + u * 12, e.y - 20 - u * 26);
        ctx.fillText('z', e.x + 10 + u * 12, e.y - 20 - u * 26);
      }
      ctx.restore();
    }
    (w5.seamstresses ?? []).forEach((sm, i) => {
      if (sm.x < view.x0 - 200 || sm.x > view.x1 + 200) return;
      const since = t - this.laceAt[i];
      if (p && since >= 0 && since < 0.7) drawLaceThrow(ctx, sm.x + sm.dir * 30, sm.y - SEAMSTRESS.h * 0.55, p.x, p.y - 30, Math.min(1, since / 0.25), 1 - Math.max(0, (since - 0.35) / 0.35), t);
    });
    let card: W5Box | null = null;
    if (p) {
      for (const tb of w5.tables ?? []) {
        const d = Math.abs(p.x - tb.x);
        // (as large on the screen as upright at 320 x 782 shows it, where it reads: sideways and short the view is zoomed out, and at
        // 782 x 288 its words were too small to read; QA 5-1, 2026-10-26)
        const s = cardScale(view.zoom ?? CARD_READ_ZOOM);
        // (on a short landscape screen there is no room for it between the HUD and the table: it pops up in the ground under the table)
        const room = { top: view.hud ?? view.y0, below: tb.y + 40, bottom: view.y1 };
        if (d < 320) card = drawCard(ctx, tb.x, tb.y - 170, tb.card, Math.min(1, (320 - d) / 120), s, room) ?? card;
      }
    }
    this.cardBox = card;
    this.trayFly.forEach((f) => {
      if (f && f.y < view.y1 + 200) drawFlyingTray(ctx, f.x, f.y, (t - f.at) * 12);
    });
    if (w5.petals) {
      // petals drifting down through the light
      const vw = view.x1 - view.x0, vh = view.y1 - view.y0;
      ctx.save();
      for (let i = 0; i < 14; i++) {
        const x = view.x0 + ((((i * 173.3 + t * (22 + (i % 4) * 6)) % (vw + 120)) + vw + 120) % (vw + 120)) - 60;
        const y = view.y0 + ((i * 97.1 + t * (34 + (i % 3) * 8)) % (vh + 80)) - 40;
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = i % 3 === 0 ? '#fbcfe8' : i % 3 === 1 ? '#f9a8d4' : '#fde68a';
        ctx.beginPath();
        ctx.ellipse(x + Math.sin(t * 1.3 + i) * 12, y, 5, 2.6, t * 1.7 + i, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /**
   * The warnings, over everything (world space, after the stage's light, the sleepy veil and the pop-up words): a spider's crouch, a red
   * "!" that swells over it, and the Seamstress's look-up. Drawn under the light and the words, sideways at 918 x 370 (zoomed out to show
   * the run ahead) a crouching spider's "!" was a few pixels of washed-out pink under "+100 FLOWER!", and two hearts went at 5-1's
   * spider pair with "the cause not seen" (QA v198). Now it is at least as large on the screen as upright (cardScale), and on top.
   */
  drawWarnings(ctx: CanvasRenderingContext2D, t: number, view: { x0: number; x1: number; zoom?: number }) {
    const k = cardScale(view.zoom ?? CARD_READ_ZOOM);
    const bang = (x: number, y: number, size: number) => {
      ctx.font = `800 ${Math.round(size * k)}px Fredoka, sans-serif`;
      ctx.lineWidth = 4 * k;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(40, 10, 20, 0.85)';
      ctx.fillStyle = '#fb7185';
      ctx.strokeText('!', x, y);
      ctx.fillText('!', x, y);
    };
    ctx.save();
    ctx.textAlign = 'center';
    for (const s of this.w5.spiders ?? []) {
      const e = this.enemies.find((q) => q.id === s.id);
      const g = this.gates.get(s.id);
      if (!e || !g || e.defeated || g.phase !== 'windup' || e.x < view.x0 - 100 || e.x > view.x1 + 100) continue;
      // the crouch: a red "!" that swells, over a spider tensed to spring
      const u = Math.min(1, g.t / 0.7);
      bang(e.x, e.y - 26 - (6 + 10 * (k - 1)) * u - 8 * (k - 1), 18 + 8 * u);
    }
    (this.w5.seamstresses ?? []).forEach((sm, i) => {
      const st = this.seams[i];
      if (st.phase !== 'tell' || sm.x < view.x0 - 200 || sm.x > view.x1 + 200) return;
      // the warning: a red "!" over her that swells through the tell, as the spiders' crouch has
      const u = Math.min(1, st.t / SEAMSTRESS.tell);
      bang(sm.x, sm.y - SEAMSTRESS.h - 14 - 6 * u, 20 + 10 * u);
    });
    ctx.restore();
    void t;
  }

  /** the light of the stage (screen space, after the world is drawn) */
  drawLight(ctx: CanvasRenderingContext2D, vw: number, vh: number, t: number) {
    if (this.w5.mood) drawW5Light(ctx, vw, vh, this.w5.mood, t);
  }

  private decor(ctx: CanvasRenderingContext2D, d: { n: string; x: number; b: number; w: number; flip?: boolean }, t: number) {
    if (d.n === 'fern') drawFern(ctx, d.x, d.b, d.w, t);
    else if (d.n === 'blossom' || d.n === 'blossom2') drawBlossom(ctx, d.x, d.b, d.w, t, d.n === 'blossom2' ? 1 : 0);
    // (a doily on the ground: the painted one laid on its little wooden stool, a cake stand on it)
    else if (d.n === 'doily') {
      if (!drawPiece(ctx, 'doilyStool', d.x, d.b + 2, d.w * 1.7, d.flip)) drawDoily(ctx, d.x, d.b - d.w / 2, d.w / 2);
      else drawPiece(ctx, takeAt(d.x, 2) ? 'cakeTier2' : 'cakeTier', d.x, d.b - d.w * 0.95, d.w * 0.95);
    } else if (d.n === 'wrappedChair') drawWrappedChair(ctx, d.x, d.b, d.w, d.flip);
    else if (d.n === 'wrappedStool') drawWrappedChair(ctx, d.x, d.b, d.w, d.flip, true);
    // (lying in the grass: the painted cocoon, wrapped, or burst open once someone got out)
    else if (d.n === 'cocoon') {
      if (!drawPiece(ctx, 'cocoonWrapped', d.x, d.b + 2, d.w, d.flip)) drawCocoon(ctx, d.x, d.b, 0, 0, false, t);
    } else if (d.n in W5_FRAMES) drawPiece(ctx, d.n as ArtPiece, d.x, d.b, d.w, d.flip);
  }

  /**
   * World 5's own look for a pickup the engine would draw plainly: Pell's note on its pink bell, and the exit as the painted totem. True
   * when it drew (the engine then skips its own); false leaves the engine's (a sealed exit, a hidden find, or the sheet still loading).
   */
  drawItem(ctx: CanvasRenderingContext2D, c: Collectible, t: number, world: number): boolean {
    if (c.collected) return false;
    if (c.type === 'find' && !c.hidden) return drawPinkBell(ctx, c.x, c.y + 26, t, c.id);
    if (c.type === 'exit_totem' && !c.isLocked && w5ArtReady()) {
      ctx.save();
      ctx.translate(c.x, c.y - 100);
      drawAura(ctx, 'take', world, 58, 104, t, 0, 1);
      ctx.restore();
      return drawShrineArt(ctx, c.x, c.y + 30, t, false);
    }
    return false;
  }

  /**
   * A World 5 jumping spider from its trained clips (w5Creatures.ts), crouching through its warning before it rushes. False for a spider
   * that is not World 5's, or a pose the clips do not hold: the engine then draws the painted stills or the vector spider.
   */
  drawSpider(ctx: CanvasRenderingContext2D, e: Enemy, t: number, playerX: number): boolean {
    const g = this.gates.get(e.id);
    if (!g) return false;
    return drawW5Spider(ctx, e, t, playerX, g.phase === 'windup' ? Math.min(1, g.t / 0.7) : null);
  }

  /** a checkpoint as the painted lace pennant (its pole's foot at the flag's spot); false leaves the engine's plain flag */
  drawFlag(ctx: CanvasRenderingContext2D, cp: { x: number; y: number; reached: boolean }, t: number, world: number): boolean {
    if (!w5ArtReady()) return false;
    if (!cp.reached) {
      ctx.save();
      ctx.translate(cp.x + 20, cp.y - 52);
      drawAura(ctx, 'take', world, 30, 40, t, cp.x * 0.01);
      ctx.restore();
    }
    return drawPennant(ctx, cp.x, cp.y, cp.reached, t);
  }

  /**
   * What Dot's bubble must leave clear (world units): Meeca's carvings, the words she is pointing at. The engine marks each on screen
   * the way the HUD marks its own pieces (guideKeepOut.ts), so the guide keeps her bubble off it without knowing about World 5.
   */
  keepOuts(view: { x0: number; x1: number }, out: Array<{ x0: number; y0: number; x1: number; y1: number }>): void {
    out.length = 0;
    for (const c of this.w5.carvings ?? []) {
      const b = carvingBox(c);
      if (b.x1 > view.x0 && b.x0 < view.x1) out.push(b);
    }
    // (and the table's card while it is up: Dot's bubble does not cover it)
    if (this.cardBox) out.push(this.cardBox);
    // (and every cocoon not yet open, and, while the pouch scene plays, Pokey himself: a scene line covered him up to his head and hid a
    // cocoon, so she walked past it, QA v198 sideways)
    (this.w5.cocoons ?? []).forEach((c, i) => {
      if (this.cocoons[i]?.freed || c.x + 40 < view.x0 || c.x - 40 > view.x1) return;
      out.push({ x0: c.x - 36, y0: c.y - COCOON.mid - 48, x1: c.x + 36, y1: c.y + 8 });
    });
    const p = this.player;
    if (p && this.restPlaying(this.clock)) out.push({ x0: p.x - 34, y0: p.y - 78, x1: p.x + 34, y1: p.y + 4 });
    // (and the Seamstress with the "!" over her: her tell is the warning, never under the bubble)
    for (const sm of this.w5.seamstresses ?? []) {
      if (sm.x + 60 > view.x0 && sm.x - 60 < view.x1) out.push({ x0: sm.x - 60, y0: sm.y - SEAMSTRESS.h - 50, x1: sm.x + 60, y1: sm.y });
    }
  }

  // ───────────────────────────── 5-5: the rest branch and its scene, the silk lines' first line, the freed creatures ─────────────────────────────

  /** the silk lines in the stage (Vines with `silk`) */
  private silks: Vine[] = [];
  /** the pouch scene's place in its lines: the next to say, when, and when the last one has been read */
  private scene: { i: number; next: number; end: number } | null = null;

  /**
   * The rest branch (5-5): when he comes to it, the pouch scene plays (w5Lines.ts W5_POUCH), one line at a time, each after the one
   * before has had its reading time (the guide queues them in order if something comes between). While the scene plays, standing on the
   * branch is resting, not sitting: the stillness does not count there (Pokey stood, because the note said so). Off the branch, it does.
   * It plays only on the calm stretch, the branch and the quiet garden after it up to its flag (RestBranch.calm): walked on past that,
   * it waits, and the line up is taken down. It used to play on over the soft pits and the spiders after it (QA v198, sideways).
   */
  private stepRest(h: W5Host, dt: number) {
    const rest = this.w5.rest;
    if (!rest) return;
    const p = h.player;
    const sc = (this.scene ??= { i: -1, next: 0, end: 0 });
    const was = this.inCalm;
    this.inCalm = p.x >= rest.x0 + 30 && p.x <= (rest.calm ?? Infinity);
    if (sc.i < 0 && this.inCalm) {
      sc.i = 0;
      sc.next = h.t;
    }
    if (sc.i >= 0 && !this.inCalm) {
      // (paused: its clock waits for him, and the line he walked off with is not read over the pits)
      sc.next += dt;
      sc.end += dt;
      if (was) {
        // (every line of it already sent goes, up or waiting in Dot's queue: none of it is read over the pits)
        for (let k = 0; k < sc.i && k < W5_POUCH.length; k++) h.passTip?.(W5_POUCH[k].text);
      }
      return;
    }
    while (sc.i >= 0 && sc.i < W5_POUCH.length && h.t >= sc.next) {
      const l = W5_POUCH[sc.i];
      h.tip(`scene:${l.id}`, l.text, readMs(l.text) / 1000);
      sc.i++;
      const wait = readMs(l.text) / 1000 + SCENE_BREATH;
      sc.next = h.t + (W5_POUCH[sc.i]?.after ?? wait);
      sc.end = h.t + wait;
    }
    if (this.restPlaying(h.t) && onRest(rest, p.x, p.y, p.grounded)) this.holdStill(0.25);
  }
  /** he is on the rest branch's calm stretch (where the pouch scene plays) */
  private inCalm = false;

  /** the pouch scene is playing: started, not yet over (its last line still being read), and he is on its calm stretch */
  restPlaying(t: number): boolean {
    const sc = this.scene;
    return !!sc && this.inCalm && sc.i >= 0 && (sc.i < W5_POUCH.length || t < sc.end);
  }

  /** a silk line's first-time line, as it comes into view (it swings like a vine: the liana system) */
  private stepSilks(h: W5Host) {
    const p = h.player;
    for (const v of this.silks) {
      if (v.x > p.x - 40 && v.x - p.x < SEE && Math.abs((v.topY + v.bottomY) / 2 - p.y) < 400) h.tip(said(W5_TEACH.silk), W5_TEACH.silk, 3.6);
    }
  }

  /** a creature just freed from a cocoon: a pale moth that flutters up and away (2.4 s) */
  private drawFreed(ctx: CanvasRenderingContext2D, t: number, vis: (x: number, pad?: number) => boolean) {
    (this.w5.cocoons ?? []).forEach((c, i) => {
      const st = this.cocoons[i];
      if (!st?.freed || st.since > 2.4 || !vis(c.x)) return;
      const u = st.since / 2.4;
      const x = c.x + Math.sin(u * 7 + c.x) * 18 + u * 70;
      const y = c.y - 60 - u * 220;
      const flap = Math.abs(Math.sin(t * 22));
      ctx.save();
      ctx.globalAlpha = Math.min(1, (1 - u) * 3);
      ctx.translate(x, y);
      ctx.scale(1.7, 1.7);
      ctx.fillStyle = '#ede9fe';
      ctx.strokeStyle = '#5b4a6e';
      ctx.lineWidth = 1.5;
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sgn * 7 * (0.4 + 0.6 * flap), -2, 8 * (0.4 + 0.6 * flap), 6, sgn * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#5b4a6e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}

/** the Seamstress's lace flying from her needles (fx, fy) to him (tx, ty): `u` how far it has got, `a` how much of it is still to see */
function drawLaceThrow(ctx: CanvasRenderingContext2D, fx: number, fy: number, tx: number, ty: number, u: number, a: number, t: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  ctx.lineCap = 'round';
  const ex = fx + (tx - fx) * u, ey = fy + (ty - fy) * u;
  const mx = (fx + ex) / 2, my = Math.min(fy, ey) - 40;
  for (const [c, w] of [['rgba(90, 60, 110, 0.5)', 6], ['#fffaf2', 3]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
  }
  // little lace loops along it
  ctx.strokeStyle = '#fffaf2';
  ctx.lineWidth = 1.6;
  for (let i = 1; i <= 5; i++) {
    const k = (i / 6) * u;
    const x = (1 - k) * (1 - k) * fx + 2 * (1 - k) * k * mx + k * k * ((fx + (tx - fx) * u));
    const y = (1 - k) * (1 - k) * fy + 2 * (1 - k) * k * my + k * k * ey;
    ctx.beginPath();
    ctx.arc(x, y + Math.sin(t * 9 + i) * 2, 4.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
/** a wiggle this recent (s) means he is pulling free, not lingering in front of a silk sheet */
export const WIGGLE_HOLD = 0.5;
/** a breath between one line of a scene and the next (a little over dotGuide.ts GUIDE.breathMs) */
const SCENE_BREATH = 0.8;

/** World 5's cocoon reach, for the stage builder (a cocoon must hang where a standing punch lands: COCOON.mid above his fist) */
export const COCOON_HANG = COCOON.mid;
