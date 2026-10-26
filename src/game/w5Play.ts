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
  touchesCake, trayAt, W5_TEACH, onScreen, SPIDER5, type ButlerState, type CocoonState, type GateState, type SitState, type ViewBox,
  type W5Extras,
} from './w5Kit.ts';
import {
  carvingBox, drawBlossom, drawButler, drawCake, drawCard, drawCarving, drawChair, drawCocoon, drawDoily, drawFern, drawFlyingTray, drawOrchid,
  drawPennant, drawPiece, drawPinkBell, drawShrineArt, drawSilkOnPokey, drawSilkSheet, drawSleepyOnPokey, drawSteam, drawTeaTable, drawTeapot, drawThread,
  drawW5Light, drawWrappedChair, takeAt,
} from './w5Look.ts';
import { w5ArtReady, type W5Piece as ArtPiece } from './w5Art.ts';
import { drawW5Spider, warmW5Butler, warmW5Spider, type ButlerPose } from './w5Creatures.ts';
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
  float(text: string, x: number, y: number, color: string): void;
  sfx(kind: 'hum' | 'wrap' | 'cake' | 'puff' | 'tray' | 'free' | 'crack'): void;
  /** a creature freed from a cocoon (a rescue stage counts it) */
  rescue?(): void;
  /** a cake was eaten (World 5's cake record) */
  ate?(): void;
}

/** how far ahead (px) a piece is "coming into view" for its first-time line */
const SEE = 560;
/** the Butler is seen from further off (he stands tall with his tray): his line has time to come even after another */
const BUTLER_SEE = 820;
const said = (key: string) => `tip:${key}`;

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
  private orchidOf = new Map<number, number>();
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

  constructor(private readonly w5: W5Extras, platforms: Platform[], _vines: Vine[]) {
    this.eaten = (w5.cakes ?? []).map(() => false);
    this.butlers = (w5.butlers ?? []).map(() => newButler());
    this.trayFly = (w5.butlers ?? []).map(() => null);
    this.threadAt = (w5.threads ?? []).map(() => -99);
    this.cocoons = (w5.cocoons ?? []).map(() => ({ ...newCocoon(), swing: -1 }));
    for (const s of w5.spiders ?? []) this.gates.set(s.id, newGate(!!s.doze));
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
    this.sleepy = 0;
    this.pull = 0;
    this.seated = -1;
    this.veil = 0;
    this.moved = false;
    this.grace = 0;
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
    for (const s of w5.sheets ?? []) {
      if (admiring(s, p.x, p.y, p.vx, p.grounded)) admire = true;
      if (ahead(s.x0, s.bottom, 420)) h.tip(said(W5_TEACH.sheet), W5_TEACH.sheet, 3.6);
    }

    // don't sit: standing still lets the silk creep up him; moving or a wiggle shakes it off; too long, and he is wrapped
    if (h.steer !== 0) this.moved = true;
    this.grace = Math.max(0, this.grace - dt);
    const still = this.moved && this.grace <= 0 && ((p.grounded && !p.climbing && Math.abs(p.vx) < SIT.still && h.steer === 0) || admire);
    const r = stepSit(this.sit, { still, steer: h.steer, seated: seated >= 0, admiring: admire }, dt, !!w5.gentle);
    this.sit = r.s;
    if (r.began) h.tip(said(W5_TEACH.sit), W5_TEACH.sit, 4.2);
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
        this.trayFly[i] = { x: tray.x, y: tray.y, vx: b.dir * 260, vy: -380, at: h.t };
        h.float('TRAY AWAY!', tray.x, tray.y - 40, '#fde68a');
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
    (w5.threads ?? []).forEach((th, i) => {
      if (ahead(th.x0, th.y, 520)) h.tip(said(W5_TEACH.thread), W5_TEACH.thread, 3.8);
      if (h.t - this.threadAt[i] < THREAD.cool || !threadTouched(th, p.x, p.y, !!p.ducking)) return;
      this.threadAt[i] = h.t;
      h.sfx('hum');
      h.float('HMMMM...', (th.x0 + th.x1) / 2, th.y - 50, '#fff7d6');
      let heard = false;
      for (const s of w5.spiders ?? []) {
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
      if (!g.dozing && ahead(e.x, e.y, 600)) h.tip(said(W5_TEACH.spider), W5_TEACH.spider, 3.6);
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
      if (ahead(c.x, c.y)) h.tip(said(W5_TEACH.cocoon), W5_TEACH.cocoon, 3.8);
      if (!h.punch || st.swing === h.swing || !punchReachesCocoon(c, h.punch)) return;
      const nx = { ...hitCocoon(st), swing: h.swing };
      this.cocoons[i] = nx;
      h.sfx('crack');
      if (nx.freed) {
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
    this.veil = Math.max(sitDrowsy(this.sit) * 0.8, this.sleepy > 0 ? 0.55 * Math.min(1, this.sleepy) : 0);
    return { speed: sleepySpeed(this.sleepy) * silkSpeed(this.sit.silk), pull };
  }

  private ateCake(h: W5Host, doze: (s: number) => void) {
    const p = h.player;
    doze(CAKE.sleepy);
    h.ate?.();
    h.sfx('cake');
    h.float('SLEEPY AND SLOW...', p.x, p.y - 96, '#ddd6fe');
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
    for (const tb of w5.tables ?? []) if (vis(tb.x)) drawTeaTable(ctx, tb.x, tb.y, t);
    (w5.chairs ?? []).forEach((c, i) => {
      if (!vis(c.x)) return;
      if (c.wrapped) drawWrappedChair(ctx, c.x, c.y, 84, c.face < 0, i % 3 === 2);
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
      drawOrchid(ctx, o.x, o.y, o.w, s.open, s.phase === 'closing' ? 1 : 0, t, o.y + 260);
    });
    (w5.cocoons ?? []).forEach((c, i) => {
      if (!vis(c.x)) return;
      const st = this.cocoons[i];
      drawCocoon(ctx, c.x, c.y, Math.max(0, 1 - st.since / 0.3), st.hits, st.freed, t);
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
  }

  /** over Pokey: the silk creeping up him, the spiders' marks, the card when he is at the table, a flying tray, the falling petals */
  drawFront(ctx: CanvasRenderingContext2D, t: number, view: { x0: number; x1: number; y0: number; y1: number }) {
    const w5 = this.w5;
    const p = this.player;
    for (const d of w5.decor ?? []) if (d.front && d.x > view.x0 - d.w && d.x < view.x1 + d.w) this.decor(ctx, d, t);
    if (p) drawSilkOnPokey(ctx, p.x, p.y, this.sit.silk, t);
    if (p && this.sleepy > 0) drawSleepyOnPokey(ctx, p.x, p.y, this.sleepy / Math.max(0.1, this.sleepyFor), t);
    for (const s of w5.spiders ?? []) {
      const e = this.enemies.find((q) => q.id === s.id);
      const g = this.gates.get(s.id);
      if (!e || !g || e.defeated || e.x < view.x0 - 100 || e.x > view.x1 + 100) continue;
      ctx.save();
      ctx.textAlign = 'center';
      if (g.phase === 'windup') {
        // the crouch: a red "!" that swells, over a spider tensed to spring
        const u = Math.min(1, g.t / 0.7);
        ctx.font = `800 ${18 + 8 * u}px Fredoka, sans-serif`;
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(40, 10, 20, 0.8)';
        ctx.fillStyle = '#fb7185';
        ctx.strokeText('!', e.x, e.y - 26 - 6 * u);
        ctx.fillText('!', e.x, e.y - 26 - 6 * u);
      } else if (g.phase === 'calm' && g.dozing) {
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
    if (p) {
      for (const tb of w5.tables ?? []) {
        const d = Math.abs(p.x - tb.x);
        if (d < 320) drawCard(ctx, tb.x, tb.y - 170, tb.card, Math.min(1, (320 - d) / 120));
      }
    }
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
  }
}

/** World 5's cocoon reach, for the stage builder (a cocoon must hang where a standing punch lands: COCOON.mid above his fist) */
export const COCOON_HANG = COCOON.mid;
