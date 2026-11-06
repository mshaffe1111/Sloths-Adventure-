/**
 * The fun validator's real-engine probes (fun-validator, PLAN-TO-80 Phase A.1). Each plays the stage as the engine builds it (D19):
 *   - holdRight: a player who only holds the way on, hopping only when stopped dead or at an edge with a ledge ahead (the thumb that
 *     "just holds right", PLAN-TO-80 A.2);
 *   - branchRuns / branchOutrun: every run of breaking branches, crossed by holdRight: does one ever give way under him?
 *   - eagleOutrun: every watched stretch, crossed by holdRight with damage on and the engine's own camera (the eagle's sweep is drawn
 *     across the view), started at several points of its rhythm: does it ever hurt him?
 *   - botRun: the first-timer bot (tools/inspect/firsttimer.ts, the fixed one), optionally with the clumsy thumb (taps +-100 ms, 15% less
 *     air control: research 2026-11-04 §1) or with the hide never learned, recording what he met frame by frame.
 */
import '../../src/game/headlessDom.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { GameEngine } from '../../src/game/engine.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { FirstTimerRun, FT_ADULT, FT_KID, firstTimer, type FirstTimer, type FTRun } from '../inspect/firsttimer.ts';
import type { Platform } from '../../src/game/types.ts';
import type { Setting } from './core.ts';

type Eng = Record<string, any>;
const DT = 1 / 30;

/** the real camera back on, at a phone's size (the bot's own sideways phone, or upright) */
export function cameraOn(sim: RealPlay, portrait = false) {
  const e = sim.e as Eng;
  e.updateCamera = (GameEngine.prototype as unknown as Record<string, () => void>).updateCamera.bind(e);
  const vw = portrait ? 412 : 915, vh = portrait ? 915 : 412;
  e.canvas.getBoundingClientRect = () => ({ width: vw, height: vh, left: 0, top: 0 });
  e.resizeCanvas();
  e.introT = 99;
  e.applyZoom();
}

/** the ledge under his feet, if any */
const floorAt = (ps: readonly Platform[], x: number, y: number, tol = 6) =>
  ps.find((p) => !p.broken && p.type !== 'bouncy' && x >= p.x - 2 && x <= p.x + p.width + 2 && y >= p.y - tol && y <= p.y + 14);

export interface HoldResult {
  reached: boolean; t: number; x: number;
  /** falls into a pit or the water (the harness's loseLife: realPlay.ts sets `died`), and hits taken */
  falls: Array<{ x: number; y: number }>; hits: number;
  stuck: boolean; skips: Array<{ from: number; to: number }>;
}
/**
 * Hold the way on until x passes `untilX` (or `secs` run out). He hops (a full flick, 0.25 s) only when stopped dead for 0.15 s or when
 * the ledge under him ends within 40 px with another ahead within 240 px and 90 px up or down, and flicks again once when falling short
 * with nothing under him: no waiting, no hiding, no timing. `each`: called every frame (the probes watch with it). `skip`: where he is stuck for 2 s, or after a fall, he is put on the next ledge
 * on and the skip is counted (the eagle's probe, which reads only the stretches he really ran); without it a fall or being stuck ends the
 * run (the chase's and the branches' probes: there a fall is the answer).
 */
export function holdRight(sim: RealPlay, untilX: number, secs: number, each?: (sim: RealPlay) => void, skip = false): HoldResult {
  const skips: Array<{ from: number; to: number }> = [];
  const falls: Array<{ x: number; y: number }> = [];
  let held = 0;
  let blocked = 0;
  let lastX = sim.p.x;
  let hits = 0;
  let hp = sim.p.hp;
  let stillFor = 0;
  let ground = { x: sim.p.x, y: sim.p.y };
  const res = (reached: boolean, t: number, stuck = false): HoldResult => ({ reached, t, x: sim.p.x, falls, hits, stuck, skips });
  /** put him on the next ledge on from x (false: there is none) */
  const ahead = (from: number): boolean => {
    const next = sim.platforms.filter((q) => !q.broken && q.type !== 'bouncy' && q.x + q.width > from + 80 && q.x < from + 900 && q.width >= 60).sort((a, b) => Math.max(a.x, from + 80) - Math.max(b.x, from + 80) || b.y - a.y)[0];
    if (!next) return false;
    sim.stand(Math.min(Math.max(next.x + 20, from + 80), next.x + next.width - 10), next.y);
    sim.p.invincibleTimer = 0;
    skips.push({ from: Math.round(from), to: Math.round(sim.p.x) });
    stillFor = 0;
    lastX = sim.p.x;
    return true;
  };
  sim.died = false;
  for (let i = 0; i < secs * 30; i++) {
    const p = sim.p;
    if (p.x >= untilX) return res(true, i * DT);
    if (p.grounded) ground = { x: p.x, y: p.y };
    if (!held && p.grounded) {
      blocked = Math.abs(p.x - lastX) < 0.8 ? blocked + DT : 0;
      const here = floorAt(sim.platforms, p.x, p.y);
      const atEdge = here && p.x > here.x + here.width - 40;
      const ledge = atEdge && sim.platforms.some((q) => !q.broken && q !== here && q.x > here.x + here.width - 10 && q.x < here.x + here.width + 240 && Math.abs(q.y - here.y) < 90);
      if (blocked >= 0.15 || ledge) {
        held = 8;
        blocked = 0;
      }
    }
    // (falling short with nothing under him: the second flick, once, as anyone does who sees the gap is wider than the jump)
    if (!held && !p.grounded && p.vy > 0 && p.jumpsLeft > 0 && !p.climbing && !p.isVineSwinging && !p.hanging
      && !sim.platforms.some((q) => !q.broken && p.x >= q.x - 10 && p.x <= q.x + q.width + 10 && q.y >= p.y && q.y < p.y + 140)) held = 8;
    lastX = p.x;
    sim.frame(held > 0 ? { right: true, jump: true, press: held === 8 } : { right: true });
    if (held > 0) held--;
    if (sim.p.hp < hp) hits++;
    hp = sim.p.hp;
    each?.(sim);
    if (sim.died) {
      falls.push({ x: Math.round(sim.p.x), y: Math.round(sim.p.y) });
      sim.died = false;
      if (!skip || !ahead(ground.x)) return res(false, i * DT);
      continue;
    }
    stillFor = Math.abs(sim.p.x - lastX) < 0.5 ? stillFor + DT : 0;
    if (skip && stillFor > 2) {
      // (stuck on something holding right can't pass, a puzzle or a wall to climb: put him on the next ledge on, and say so)
      if (ahead(sim.p.x)) continue;
    }
    if (stillFor > 6) return res(false, i * DT, true);
  }
  return res(false, secs);
}

/** a stage on a setting, as the engine builds it on entry */
export function sim(id: string, layout: number, setting: Setting): RealPlay {
  setDifficulty(setting);
  return new RealPlay(id, layout);
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Breaking branches

/** a breaking piece: fragile, or a tile with its own crumble time */
export const breaks = (p: Platform) => !p.broken && (p.type === 'fragile' || p.crumbleAfter !== undefined);
export interface BranchRun { x0: number; x1: number; y: number; ids: number[] }
/** the stage's runs of breaking pieces (pieces within 320 px of each other and 120 px up or down are one run) */
export function branchRuns(ps: readonly Platform[]): BranchRun[] {
  const out: BranchRun[] = [];
  for (const p of [...ps].filter(breaks).sort((a, b) => a.x - b.x)) {
    const l = out[out.length - 1];
    if (l && p.x - l.x1 < 320 && Math.abs(p.y - l.y) < 120) {
      l.x1 = Math.max(l.x1, p.x + p.width);
      l.ids.push(p.id);
    } else out.push({ x0: p.x, x1: p.x + p.width, y: p.y, ids: [p.id] });
  }
  return out;
}

/** `verdict`: bites (a piece gave way under him), outrun (across, none under him, no fall), or not judged (holding right never got across,
 *  or he fell with nothing giving way: the quality supervisor, 11-04, 1-6 read "0 gave way under him → bites") */
export interface BranchVerdict { run: BranchRun; crossed: boolean; gaveWay: number; underHim: number; fell: boolean; outrun: boolean; verdict: 'bites' | 'outrun' | 'not judged'; note: string }
/**
 * Cross each run holding right from just before it (standing on the ground or ledge he would come from). A piece "gives way under him"
 * when it breaks while he stands on it or within 3 frames of stepping off; the run is outrun when he crosses it with none giving way under
 * him and without falling (PLAN-TO-80 A.2: "snap twigs you can't outrun by just holding right").
 */
export function branchOutrun(id: string, layout: number, setting: Setting): BranchVerdict[] {
  return branchOutrunWith(() => sim(id, layout, setting));
}
/** the same on any world `make` builds (a bare fixture world in the tests) */
export function branchOutrunWith(make: () => RealPlay): BranchVerdict[] {
  const runs = branchRuns(make().platforms);
  const out: BranchVerdict[] = [];
  for (const run of runs) {
    const s = make();
    s.safe = false;
    const first = s.platforms.find((p) => p.id === run.ids[0])!;
    // (start on the ledge he comes from: the nearest non-breaking ledge ending before the run, at about its height; else on the first piece)
    const from = s.platforms.filter((p) => !breaks(p) && p.type !== 'bouncy' && p.x + p.width <= first.x + 4 && p.x + p.width > first.x - 400 && Math.abs(p.y - first.y) < 140).sort((a, b) => b.x + b.width - (a.x + a.width))[0];
    if (from) s.stand(Math.max(from.x + 10, from.x + from.width - 160), from.y);
    else s.stand(first.x + 10, first.y);
    let gave = 0, under = 0, fell = false;
    const lastOn = new Map<number, number>();
    let frame = 0;
    const r = holdRight(s, run.x1 + 60, 30, (q) => {
      frame++;
      const on = q.standingOn;
      if (run.ids.includes(on)) lastOn.set(on, frame);
      for (const pid of run.ids) {
        const p = q.platforms.find((pp) => pp.id === pid)!;
        if (p.broken && !(p as Platform & { _seen?: boolean })._seen) {
          (p as Platform & { _seen?: boolean })._seen = true;
          gave++;
          if (frame - (lastOn.get(pid) ?? -99) <= 3) under++;
        }
      }
      if (q.p.y > run.y + 140 && q.p.x > run.x0 && q.p.x < run.x1) fell = true;
    });
    if (r.falls.length) fell = true;
    const outrun = r.reached && under === 0 && !fell;
    const verdict = under > 0 ? 'bites' : outrun ? 'outrun' : 'not judged';
    out.push({ run, crossed: r.reached, gaveWay: gave, underHim: under, fell, outrun, verdict, note: r.stuck ? 'the hold-right player got stuck before the end' : !r.reached ? 'the hold-right player never got across' : fell && !under ? 'he fell with nothing giving way under him' : '' });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// The eagle (and every watcher)

export interface ZoneVerdict {
  x0: number; x1: number;
  /** tries that ran through this stretch (not skipped over), and of those the ones the eagle never hurt him in */
  ran: number; unhurt: number;
  /** eagle hits in it over all tries, and passes that warned or saw him while he was in it */
  hits: number; warned: number; seen: number;
  /**
   * each hit in it: seconds from the screech (the warn phase, its shadow at the view's edge) and from the shadow finding him (seen) to the
   * hit, how long the screech and its shadow at the view's edge came before the sweep (shadowFor), and whether his spot was in the
   * camera's view when it found him. Warned: half a second or more of screech and shadow before the sweep, half a second or more from
   * the shadow finding him to the hit, and in view (the quality
   * supervisor, 11-04: where the eagle hurts, check the hit was warned, half a second, with a shadow)
   */
  hitLeads: Array<{ warn: number; seen: number; shadowFor: number; inView: boolean; warned: boolean }>;
  /** most of the tries that ran it came through unhurt, never hiding */
  outrun: boolean;
}
export interface EagleVerdict { tries: number; zones: ZoneVerdict[]; hitsAll: number; skips: number; portrait: boolean }
/** the starts tried (s of standing just before the watched stretches): spread over the eagle's rhythm (calm 5-11 s, warn 2 s, pass 2.6 s) */
export const EAGLE_WAITS = [0, 1.5, 3, 4.5, 6, 7.5];
/**
 * Cross the stage's watched stretches holding right, from 300 px before the first to past the last, damage on, the engine's camera on
 * (upright or sideways), never hiding. Each try waits a different time first, so the eagle's rhythm meets him at a different point.
 * Where holding right can't go on (a puzzle, a wall to climb) he is put on the next ledge (counted); a stretch counts for a try only
 * if he ran at least 70% of it. A stretch is outrun when most tries that ran it took no eagle hit in it (research §6 / PLAN-TO-80 A.2:
 * the eagle's shadow should lock on; "eagles can be outrun", Matt 2026-11-04).
 */
export function eagleOutrun(id: string, layout: number, setting: Setting, portrait = false): EagleVerdict | null {
  return eagleOutrunWith(() => sim(id, layout, setting), portrait);
}
export function eagleOutrunWith(make: () => RealPlay, portrait = false): EagleVerdict | null {
  const zones = ((make().e as Eng).proto?.watch ?? []) as Array<{ x0: number; x1: number; setback?: number }>;
  const z = zones.filter((q) => q.setback === undefined).sort((p, q) => p.x0 - q.x0);
  if (!z.length) return null;
  const x0 = z[0].x0, x1 = Math.max(...z.map((q) => q.x1));
  const zv: ZoneVerdict[] = z.map((q) => ({ x0: Math.round(q.x0), x1: Math.round(q.x1), ran: 0, unhurt: 0, hits: 0, warned: 0, seen: 0, hitLeads: [], outrun: false }));
  let hitsAll = 0, skips = 0;
  const inZone = (x: number) => zv.findIndex((q) => x >= q.x0 && x <= q.x1);
  for (const wait of EAGLE_WAITS) {
    const s = make();
    s.safe = false;
    cameraOn(s, portrait);
    const ground = s.platforms.filter((p) => !p.broken && p.type !== 'bouncy' && p.x < x0 - 300 && p.x + p.width > x0 - 300).sort((a, b) => b.y - a.y)[0];
    s.stand(x0 - 300, ground?.y ?? s.stage.spawnY);
    s.p.invincibleTimer = 0;
    for (let i = 0; i < wait * 30; i++) s.frame();
    const e = s.e as Eng;
    const covered = zv.map(() => 0);
    const hit = zv.map(() => 0);
    let lastX = s.p.x, hp = s.p.hp, wasSeen = false, wasPhase = e.watch?.phase;
    // (the stretch the current pass first saw him in, or that it warned in: a pass under way finishes after he leaves the stretch, and its
    // dive counts against the stretch it came over)
    let passZone = -1, warnT = -1, passT = -1, seenT = -1, seenInView = false, ft = 0;
    const leads: Array<Array<ZoneVerdict['hitLeads'][number]>> = zv.map(() => []);
    const r = holdRight(s, x1 + 200, 240, () => {
      const x = s.p.x, k = inZone(x);
      if (k >= 0 && x > lastX && x - lastX < 40) covered[k] += x - lastX;
      const w = e.watch;
      ft += 1 / 30;
      if (w?.phase === 'warn' && wasPhase !== 'warn') {
        warnT = ft;
        passZone = k;
        if (k >= 0) zv[k].warned++;
      }
      if (w?.phase === 'pass' && wasPhase !== 'pass') passT = ft;
      if (w?.seen && !wasSeen) {
        seenT = ft;
        const cam = e.camera as { x: number; viewportWidth: number } | undefined;
        seenInView = !cam || (s.p.x > cam.x && s.p.x < cam.x + cam.viewportWidth);
        if (k >= 0) passZone = k;
        if (passZone >= 0) zv[passZone].seen++;
      }
      // (an eagle hit: hurt while the pass that saw him dives)
      if (s.p.hp < hp && w?.phase === 'pass' && w.seen) {
        hitsAll++;
        if (passZone >= 0) {
          hit[passZone]++;
          const wl = +(ft - warnT).toFixed(2), sl = +(ft - seenT).toFixed(2);
          leads[passZone].push({ warn: wl, seen: sl, inView: seenInView, shadowFor: +(passT - warnT).toFixed(2), warned: warnT >= 0 && passT >= warnT && passT - warnT >= 0.5 && sl >= 0.5 && seenInView });
        }
      }
      wasSeen = !!w?.seen;
      wasPhase = w?.phase;
      hp = s.p.hp;
      lastX = x;
      s.p.invincibleTimer = Math.min(s.p.invincibleTimer, 1.2); // (the harness's safe timer off: real hits)
    }, true);
    skips += r.skips.length;
    zv.forEach((q, k) => {
      if (covered[k] >= 0.7 * (q.x1 - q.x0)) {
        q.ran++;
        q.hits += hit[k];
        q.hitLeads.push(...leads[k]);
        if (!hit[k]) q.unhurt++;
      }
    });
  }
  for (const q of zv) q.outrun = q.ran > 0 && q.unhurt * 2 > q.ran;
  return { tries: EAGLE_WAITS.length, zones: zv, hitsAll, skips, portrait };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// The first-timer bot, with what he met

export interface Met { swung: number; climbed: number; roped: number; bounced: number; /** of `bounced`, off a mushroom (engine.ts bounce kind 'spring'), not a stomp off an animal */ sprung: number; brokeUnder: number; hid: number; pushed: number; fought: number; eagleHits: number;
  /** 1-8's collapse: the closest its front came to him while it ran (px; null: no chase) and how often it caught him */
  chaseMinGap: number | null; chaseCaught: number;
  /** the share of the chase's running frames with its collapse front inside the camera's view, and where it came closest (Pokey's x, the front) */
  chaseOnScreen: number | null; chaseClosest: { x: number; front: number; t: number } | null }
export interface BotRecord {
  run: FTRun;
  met: Met;
  /** his jumps: where he took off, where he landed, and whether the landing's near edge was in the camera's view at take-off */
  jumps: Array<{ x: number; y: number; landX: number; inView: boolean; ok: boolean }>;
  /** the furthest x his feet reached in the run's own sim */
  reachX: number;
  /** second jumps he made in the run's own sim, and how many of them inside `without`'s stretch (0 when the limit holds) */
  doubled: { all: number; inside: number };
}
/**
 * `without`: the limited agent (NODES.md §1 `test`, R2 §2 L5: Nelson & Smith; Green et al. 2018): inside [x0, x1] the bot has no second
 * jump (every air jump past the coyote time is spent) or no bounce (every mushroom in the stretch taken away, its stump kept: B6). Its
 * probes play under the same limit, so it plans as a player without the move would
 */
export interface BotOpts { trial?: number; portrait?: boolean; noHide?: boolean; clumsy?: boolean; without?: { move: 'double' | 'bounce' | Array<'double' | 'bounce'>; x0: number; x1: number } }
/** research §1's clumsy thumb: taps +-100 ms (a uniform +-0.1 s has sd 0.058), 15% less air control */
export const CLUMSY = { tapSd: 0.058, air: 0.85 };

export function botRun(id: string, layout: number, setting: Setting, o: BotOpts = {}): BotRecord {
  const base = setting === 'easy' ? FT_KID : FT_ADULT;
  const who: FirstTimer = o.clumsy ? { ...base, name: base.name, thumb: [base.thumb[0], Math.max(base.thumb[1], CLUMSY.tapSd)] } : base;
  const P = FirstTimerRun.prototype as unknown as Eng;
  const takeIn0 = P.takeIn;
  if (o.noHide) P.takeIn = function (this: Eng) { takeIn0.call(this); this.learned.delete('hide'); };
  const frame0 = RealPlay.prototype.frame;
  const met: Met = { swung: 0, climbed: 0, roped: 0, bounced: 0, sprung: 0, brokeUnder: 0, hid: 0, pushed: 0, fought: 0, eagleHits: 0, chaseMinGap: null, chaseCaught: 0, chaseOnScreen: null, chaseClosest: null };
  const chase = new Map<RealPlay, { min: number; caught: number; was: boolean; frames: number; seen: number; at: { x: number; front: number; t: number } | null }>();
  const cams = new Map<RealPlay, Array<{ t: number; x0: number; x1: number; y0: number; y1: number }>>();
  const state = new Map<RealPlay, Eng>();
  const brokeSeen = new Set<Platform>();
  const reach = new Map<RealPlay, number>();
  const dbl = new Map<RealPlay, { all: number; inside: number }>(), wasDbl = new Map<RealPlay, boolean>();
  const W = o.without;
  const noMove = (m: 'double' | 'bounce') => !!W && (Array.isArray(W.move) ? W.move.includes(m) : W.move === m);
  const limited = new WeakSet<RealPlay>();
  RealPlay.prototype.frame = function (this: RealPlay, pad?: unknown) {
    const p = this.p;
    if (W) {
      if (noMove('bounce') && !limited.has(this)) {
        limited.add(this);
        // (NODES §8.7 B6: the mushroom is taken away and its stump kept; a solid cap would be a step no player ever has, and a double
        // off it outreaches the bounce)
        const ps = this.platforms as Platform[];
        for (let i = ps.length - 1; i >= 0; i--) if (ps[i].type === 'bouncy' && ps[i].x + ps[i].width > W.x0 && ps[i].x < W.x1) ps.splice(i, 1);
      }
      // (any jump in the air is the engine's second jump (engine.ts: not grounded, past the coyote time): none inside the stretch)
      if (noMove('double') && p.x + p.width > W.x0 && p.x < W.x1 && !p.grounded && !((this.e as Eng).coyoteTimer > 0)) p.jumpsLeft = 0;
    }
    const was = { vx: p.vx, air: !p.grounded, swing: !!p.isVineSwinging, climb: !!p.climbing, hang: !!p.hanging, bounce: !!p.bounce, cover: !!(this.e as Eng).input?.inCover && !!p.ducking, push: !!p.pushing };
    const r = (frame0 as (this: RealPlay, pad?: unknown) => unknown).call(this, pad);
    if (o.clumsy && was.air && !p.grounded && !p.isVineSwinging && !p.climbing && !p.hanging) p.vx = was.vx + (p.vx - was.vx) * CLUMSY.air;
    reach.set(this, Math.max(reach.get(this) ?? -Infinity, p.x));
    if (!wasDbl.get(this) && p.isDoubleJumping) { const d = dbl.get(this) ?? { all: 0, inside: 0 }; d.all++; if (W && p.x + p.width > W.x0 && p.x < W.x1) d.inside++; dbl.set(this, d); }
    wasDbl.set(this, !!p.isDoubleJumping);
    const st = state.get(this) ?? {};
    if (!was.swing && p.isVineSwinging) met.swung++;
    if (!was.climb && p.climbing) met.climbed++;
    if (!was.hang && p.hanging) met.roped++;
    if (!was.bounce && p.bounce) { met.bounced++; if (p.bounce.kind === 'spring') met.sprung++; }
    const cover = !!(this.e as Eng).input?.inCover && !!p.ducking;
    if (!was.cover && cover) met.hid++;
    if (!was.push && p.pushing) met.pushed++;
    // (breaking pieces broken during the run, as they break: they grow back before it ends)
    for (const q of this.platforms as Platform[]) if (q.type === 'fragile' && q.broken && !brokeSeen.has(q)) brokeSeen.add(q);
    state.set(this, st);
    const ch = (this.e as Eng).chase;
    if (ch?.active && ch.hold <= 0) {
      const c = chase.get(this) ?? { min: Infinity, caught: 0, was: false, frames: 0, seen: 0, at: null };
      const gap = p.x - ch.front;
      if (gap < c.min) c.at = { x: Math.round(p.x), front: Math.round(ch.front), t: +(this.e as Eng).gameTime.toFixed(1) };
      c.min = Math.min(c.min, gap);
      // (is the collapse front on screen? the camera's view this frame)
      const cam = (this.e as Eng).camera;
      c.frames++;
      if (ch.front >= cam.x && ch.front <= cam.x + cam.viewportWidth) c.seen++;
      const now = gap <= 24;
      if (now && !c.was) c.caught++;
      c.was = now;
      chase.set(this, c);
    }
    const e = this.e as Eng;
    const cam = e.camera;
    let list = cams.get(this);
    if (!list) cams.set(this, (list = []));
    list.push({ t: e.gameTime, x0: cam.x, x1: cam.x + cam.viewportWidth, y0: cam.y, y1: cam.y + cam.viewportHeight });
    return r;
  } as typeof RealPlay.prototype.frame;
  let run: FTRun;
  try {
    setDifficulty(setting);
    run = firstTimer(id, layout, who, { trial: o.trial ?? 0, portrait: o.portrait } as never);
  } finally {
    RealPlay.prototype.frame = frame0;
    P.takeIn = takeIn0;
  }
  // (the run's own sim plays the most frames; the bot's probes make short ones)
  const [mainSim, camList] = [...cams.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const e = mainSim.e as Eng;
  met.fought = (e.enemies ?? []).filter((m: Eng) => m.defeated).length;
  const ch = chase.get(mainSim);
  if (ch) {
    met.chaseMinGap = Math.round(ch.min);
    met.chaseCaught = ch.caught;
    met.chaseOnScreen = ch.frames ? +(ch.seen / ch.frames).toFixed(2) : null;
    met.chaseClosest = ch.at;
  }
  met.eagleHits = run.harms.filter((h) => h.kind === 'hit' && h.cause === 'watcher').length;
  met.brokeUnder = (e.platforms as Platform[]).filter((p) => brokeSeen.has(p)).length;
  const camAt = (t: number) => {
    let best = camList[0];
    for (const c of camList) if (c.t <= t + 1e-6) best = c;
    return best;
  };
  const jumps = (run.tries ?? []).filter((tr) => tr.running && tr.land).map((tr) => {
    const c = camAt(tr.t0);
    const land = (e.platforms as Platform[]).find((p) => p.id === tr.land!.id);
    const edge = land ? (land.x > tr.x ? land.x : land.x + land.width) : tr.land!.x;
    const ly = land ? land.y : tr.land!.y;
    return { x: Math.round(tr.x), y: Math.round(tr.y), landX: Math.round(edge), inView: edge >= c.x0 && edge <= c.x1 && ly >= c.y0 && ly <= c.y1, ok: tr.ok };
  });
  return { run, met, jumps, reachX: Math.round(reach.get(mainSim) ?? run.x), doubled: dbl.get(mainSim) ?? { all: 0, inside: 0 } };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// The collapsing branch (1-8's chase, chase.ts)

export interface ChaseVerdict { start: number; end: number; reached: boolean; caught: number; minGap: number; skips: number; falls: number; outrun: boolean; judged: boolean; endedAt: number }
/**
 * Run the chase holding right from its start: the closest the collapse front comes (px) and how often it catches him. Outrun when he
 * reaches the end uncaught with the front never within 150 px (about half a second at his run: the pressure never really bites).
 */
export const CHASE_CLOSE = 150;
export function chaseOutrun(id: string, layout: number, setting: Setting): ChaseVerdict | null {
  return chaseOutrunWith(() => sim(id, layout, setting));
}
export function chaseOutrunWith(make: () => RealPlay): ChaseVerdict | null {
  const s = make();
  const plan = (s.e as Eng).proto?.chase as { start: number; end: number } | undefined;
  if (!plan) return null;
  s.safe = false;
  const ground = s.platforms.filter((p) => !p.broken && p.type !== 'bouncy' && p.x < plan.start - 200 && p.x + p.width > plan.start - 200).sort((a, b) => a.y - b.y)[0];
  s.stand(plan.start - 200, ground?.y ?? s.stage.spawnY);
  s.p.invincibleTimer = 0;
  const e = s.e as Eng;
  let minGap = Infinity, caught = 0, was = false;
  const r = holdRight(s, plan.end - 40, 240, () => {
    const c = e.chase;
    if (c?.active) minGap = Math.min(minGap, s.p.x - c.front);
    const now = !!c?.active && s.p.x - c.front <= 24;
    if (now && !was) caught++;
    was = now;
    // (no skipping ahead here: a player stuck in the chase is a player the chase catches; the fixture with a wall proved a skip hid it)
  }, false);
  const gap = Number.isFinite(minGap) ? Math.round(minGap) : -1;
  // (not judged when holding right never gets through: falls into the gaps send him back and the chase restarts, so its pressure can't be
  // read; the page says so)
  return { start: plan.start, end: plan.end, reached: r.reached, caught, minGap: gap, skips: r.skips.length, falls: r.falls.length, outrun: r.reached && caught === 0 && gap > CHASE_CLOSE, judged: r.reached || caught > 0, endedAt: Math.round(r.x) };
}

/**
 * The clumsy thumb's jumps toward the shrine (the quality supervisor's 1-2 REDO, 11-04: two 0% jumps on the gentlest stage). Every 0% jump
 * on 1-2 was the bot hopping back the way it came, off a branch's near end on to the branch before it: it lands, but loses route
 * progress, and the bot counts that as a miss (firsttimer.ts after(): "ok" is getting on along the way). A jump the stage asks for goes
 * toward the shrine; the ones back are counted on the page, not against the floor.
 */
export function towardShrine<T extends { x: number; dir: number; running?: boolean }>(tries: readonly T[], exitX: number): { on: T[]; back: number } {
  const on = tries.filter((t) => t.dir === 0 || Math.sign(exitX - t.x) === t.dir);
  return { on, back: tries.length - on.length };
}
