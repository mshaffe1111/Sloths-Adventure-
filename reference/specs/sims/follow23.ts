/**
 * follow23 — 2-3 "Walk Them Home" (reference/design/2-3.md, DESIGN-23): the followers and the heron flown on the real engine
 * (level.md rule 24). Pokey is engine.ts at 30 fps (realPlay.ts) driven by the game's own InputEngine (a tap is its 80 ms minimum
 * hold, never a FakeInput one-frame press: R-165.284). follow.ts does not exist yet, so the followers here are the CONTRACT the engine
 * packet will build (2-3.md "follow.ts"), written as pure functions below and stepped on Pokey's real recorded path, frame by frame:
 *   - the trail: his feet each frame while he walks or hops off the ground (arclength s); a climb, ride or fall is a WAIT point (the
 *     foot) the line will not pass until he is back on that ground;
 *   - follower i chases the one ahead (follower 0 chases him) along the trail at most PACE px/s, never closer than GAP px;
 *   - over splash-back water a follower paddles: same trail s, drawn at the water's surface.
 * The heron's look: watcher.ts's sweep (warn 2.0 s, pass 2.6 s, sight +-70 px) crossing the ZONE in world x (not the view: upright the
 * tail of the line is off screen), reading each little one: seen if it is in sight and moving, or in sight and outside reed cover
 * (stillness.ts watcherSees with seesStill, inCover's 10 px inset).
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/follow23.ts > reference/specs/sims/out/follow23.txt
 */
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import { GameEngine } from '../../../src/game/engine.ts';
import { WATCH } from '../../../src/game/watcher.ts';
import { PHYS } from '../../../src/game/physics.ts';
import type { Platform } from '../../../src/game/types.ts';

const FLOOR = 800;
const GAP = 34; // spacing between little ones (px, feet to feet), B's pitch; flown below
const r = new RealPlay('2-3', 1);
const inp = new InputEngine();
inp.source = 'pad';
r.e.input = inp;
const out = (s: string) => console.log(s);
const f1 = (n: number) => n.toFixed(1);

// ---------- the follow contract (what follow.ts will be) ----------
interface Pt { x: number; y: number; s: number; wait?: boolean }
class Trail {
  pts: Pt[] = [];
  s = 0;
  open = true; // false while he climbs/rides/falls: the last point is a wait
  push(x: number, y: number) {
    const l = this.pts[this.pts.length - 1];
    if (l && !this.open) { this.open = true; l.wait = false; } // back on the ground: the line may pass the foot
    if (l) this.s += Math.hypot(x - l.x, y - l.y);
    if (!l || Math.abs(x - l.x) + Math.abs(y - l.y) > 0.01) this.pts.push({ x, y, s: this.s });
  }
  hold() { const l = this.pts[this.pts.length - 1]; if (l) { l.wait = true; this.open = false; } }
  at(s: number): { x: number; y: number } {
    const p = this.pts;
    if (s <= p[0].s) return p[0];
    let lo = 0, hi = p.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p[m].s <= s) lo = m; else hi = m; }
    const a = p[lo], b = p[hi], k = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
    return { x: a.x + (b.x - a.x) * Math.min(1, k), y: a.y + (b.y - a.y) * Math.min(1, k) };
  }
  waitS(): number { const l = this.pts[this.pts.length - 1]; return l?.wait ? l.s : Infinity; }
}
interface F { s: number; x: number; y: number; moved: boolean }
function stepLine(t: Trail, line: F[], pace: number, dt: number, gap = GAP) {
  let lead = t.s;
  const cap = t.waitS();
  for (const f of line) {
    const target = Math.min(lead - gap, cap);
    const ds = Math.max(0, Math.min(pace * dt, target - f.s));
    f.moved = ds > 0.05;
    f.s += ds;
    const q = t.at(f.s);
    f.x = q.x; f.y = q.y;
    lead = f.s;
  }
}
function newLine(t: Trail, n: number): F[] {
  return Array.from({ length: n }, (_, i) => { const s = t.s - GAP * (i + 1); const q = t.at(s); return { s, x: q.x, y: q.y, moved: false }; });
}

// ---------- rigs ----------
function ground(pl: Platform[], x: number) {
  r.bare(pl);
  r.stand(x, FLOOR);
  inp.clearAll();
  r.e.input = inp;
  for (let i = 0; i < 4; i++) r.e.update(DT);
}
/** a trail laid back from x along flat ground, so a bunched line can stand behind him */
function trailAt(x: number): Trail { const t = new Trail(); t.push(x - 600, FLOOR); t.push(x, FLOOR); return t; }

// 1. his real speeds
out('## 1. Pokey, real (InputEngine, 30 fps)');
{
  ground([{ id: 1, x: 0, y: FLOOR, width: 9000, height: 200, type: 'solid' } as Platform], 600);
  const x0 = r.p.x;
  inp.triggerTouchMove('right');
  let f = 0; while (r.p.vx < PHYS.maxRun - 1 && f < 60) { r.e.update(DT); f++; }
  out(`run: top speed ${PHYS.maxRun} px/s reached in ${f} frames (${f1(f * DT * 1000)} ms), ${Math.round(r.p.x - x0)} px`);
  for (let i = 0; i < 20; i++) r.e.update(DT);
  const xs = r.p.x; inp.triggerTouchMove('none'); f = 0;
  while (Math.abs(r.p.vx) > 0.5 && f < 60) { r.e.update(DT); f++; }
  out(`stop: let go of right at full run, stands in ${f} frames, ${Math.round(r.p.x - xs)} px on`);
}
// view widths
{
  const e = r.e as unknown as { viewCssW: number; viewCssH: number; introT: number; applyZoom(): void; camera: { viewportWidth: number } };
  for (const [w, h] of [[412, 915], [915, 412]]) { e.viewCssW = w; e.viewCssH = h; e.introT = 99; e.applyZoom(); out(`view ${w}x${h}: ${Math.round(e.camera.viewportWidth)} px of stage across`); }
  void GameEngine;
}

/** run right from `from` with the line bunched behind, let go of right at `release`; step until the tail is still for 0.2 s */
function runStop(n: number, pace: number, from: number, release: number, maxT = 30) {
  ground([{ id: 1, x: 0, y: FLOOR, width: 12000, height: 200, type: 'solid' } as Platform], from);
  const t = trailAt(r.p.x);
  const line = newLine(t, n);
  inp.triggerTouchMove('right');
  let k = 0, stopK = -1, still = 0, maxSpread = 0, heStill = -1;
  for (; k < maxT / DT; k++) {
    if (stopK < 0 && r.p.x >= release) { inp.triggerTouchMove('none'); stopK = k; }
    r.e.update(DT);
    if (r.p.grounded) t.push(r.p.x, r.p.y);
    stepLine(t, line, pace, DT);
    if (heStill < 0 && stopK >= 0 && Math.abs(r.p.vx) < 0.5) heStill = k;
    maxSpread = Math.max(maxSpread, r.p.x - line[n - 1].x);
    still = line.every((f) => !f.moved) && heStill >= 0 ? still + 1 : 0;
    if (still >= 6) break;
  }
  const settled = (k - 5) * DT;
  return { heStop: heStill * DT, settled, bunch: settled - heStill * DT, maxSpread, heX: r.p.x, tailX: line[n - 1].x, line };
}

out('\n## 2. The line on open ground: he runs D px from a stand and lets go; the tail of N=5 (GAP 34)');
out('| D px | pace | he stands at (s) | widest line, him to tail (px) | line still at (s) | bunch after he stands (s) |');
out('|---|---|---|---|---|---|');
for (const pace of [190, 230]) for (const D of [200, 400, 600, 900, 1200]) {
  const q = runStop(5, pace, 1000, 1000 + D);
  out(`| ${D} | ${pace} | ${f1(q.heStop)} | ${Math.round(q.maxSpread)} | ${f1(q.settled)} | ${f1(q.bunch)} |`);
}
out('(bunched, him to tail = 5 x 34 = 170 px; upright he stands ~155 px from the left edge of a 412-wide view, so a bunched tail is just off screen)');

out('\n## 3. Hops: three tap hops in a run (each 1 frame after landing) over flat ground, then he stands; the line hops where he hopped');
for (const pace of [190, 230]) {
  ground([{ id: 1, x: 0, y: FLOOR, width: 12000, height: 200, type: 'solid' } as Platform], 1000);
  const t = trailAt(r.p.x); const line = newLine(t, 5);
  inp.triggerTouchMove('right');
  let hops = 0, since = -1, lift = -1, k = 0, heStop = -1, still = 0;
  const x0 = r.p.x;
  for (; k < 900; k++) {
    if (r.p.grounded && r.p.x > x0 + 120) {
      if (hops < 3 && since === 1) { inp.triggerTouchUp(0, 80); lift = k + 2; hops++; }
      since++;
    } else since = r.p.grounded ? since : 0;
    if (hops >= 3 && r.p.grounded && since > 2 && heStop < 0) { inp.triggerTouchMove('none'); heStop = k; }
    if (k === lift) inp.releaseTouchUp();
    r.e.update(DT);
    t.push(r.p.x, r.p.y);
    stepLine(t, line, pace, DT);
    still = heStop >= 0 && line.every((f) => !f.moved) && Math.abs(r.p.vx) < 0.5 ? still + 1 : 0;
    if (still >= 6) break;
  }
  const along = r.p.x - x0;
  out(`pace ${pace}: ${hops} hops, he went ${Math.round(along)} px; trail ${Math.round(t.s - 600)} px of path (x ${f1((t.s - 600) / along)}); line still ${f1((k - 5 - heStop) * DT)} s after he let go`);
}

out('\n## 4. A climb: he walks to a post foot, climbs out of the trail (the foot is a WAIT), comes back down 0 px or 60 px on; the line waits, then rejoins');
for (const back of [0, 60]) {
  const t = new Trail(); t.push(400, FLOOR); t.push(1000, FLOOR);
  const line = newLine(t, 5);
  t.hold();
  for (let i = 0; i < 90; i++) stepLine(t, line, 190, DT); // 3 s up the post
  const head = Math.round(line[0].x);
  t.push(1000 + back, FLOOR); // he is back on the ground
  let k = 0; for (; k < 300; k++) { stepLine(t, line, 190, DT); if (!line.some((f) => f.moved)) break; }
  out(`down ${back} px on: the first little one waited at x ${head} (the foot - ${1000 - head} px); after he is down the line moved ${f1(k * DT)} s and stands ${Math.round(1000 + back - line[0].x)} px behind him`);
}

// ---------- 5. the heron over clump to clump ----------
interface Clump { x: number; w: number }
const inClump = (cs: Clump[], x: number) => cs.some((c) => x > c.x + 10 && x < c.x + c.w - 10);
/**
 * He stands at the right end of clump A (line bunched inside A). The calm starts at t=0 (a pass just ended); he leaves at `leave` s,
 * runs to clump B and lets go of right `stopIn` px before B's right end. The heron: calm C, warn 2.0, then the look sweeps the zone
 * [A.x - 200, B.x + B.w + 200] from left to right (dir +1) or right to left over WATCH.pass s. Returns the little ones seen.
 */
function heron(n: number, pace: number, G: number, W: number, leave: number, calm: number, dir: 1 | -1, stopIn = 30) {
  const A: Clump = { x: 1000, w: W }, B: Clump = { x: 1000 + W + G, w: W };
  ground([{ id: 1, x: 0, y: FLOOR, width: 12000, height: 200, type: 'solid' } as Platform], A.x + W - 30);
  const t = trailAt(r.p.x); const line = newLine(t, n);
  const z0 = A.x - 200, z1 = B.x + B.w + 200;
  const seen = new Set<number>();
  let tailIn = -1;
  const passAt = calm + WATCH.warn;
  for (let k = 0; k * DT < passAt + WATCH.pass + 0.5; k++) {
    const tt = k * DT;
    if (tt >= leave && r.p.x < B.x + W - stopIn && r.p.vx >= 0) inp.triggerTouchMove('right');
    if (r.p.x >= B.x + W - stopIn - 12) inp.triggerTouchMove('none');
    r.e.update(DT);
    t.push(r.p.x, r.p.y);
    stepLine(t, line, pace, DT);
    if (tailIn < 0 && tt > leave && line.every((f) => inClump([B], f.x) && !f.moved)) tailIn = tt - leave;
    if (tt >= passAt && tt < passAt + WATCH.pass) {
      const u = (tt - passAt) / WATCH.pass;
      const sx = dir === 1 ? z0 - 160 + (z1 - z0 + 320) * u : z1 + 160 - (z1 - z0 + 320) * u;
      line.forEach((f, i) => { if (Math.abs(sx - f.x) < WATCH.sight && (f.moved || !inClump([A, B], f.x))) seen.add(i); });
    }
  }
  return { seen: seen.size, tailIn, heInB: inClump([B], r.p.x) };
}

out('\n## 5. Clump to clump under the heron (N little ones; clumps W px; open mud G px between). "line home" = from his first step to the whole line still inside clump B');
out('| setting | pace | N | W | G | line home (s) | latest he can leave after the calm starts, look from the left / right (s) |');
out('|---|---|---|---|---|---|---|');
const CALM = 5.0; // stillLay.ts STILL_RULE.calmMin
for (const [setting, pace, W] of [['normal', 190, 260], ['normal', 190, 300], ['easy', 230, 340]] as const) {
  setDifficulty(setting);
  for (const n of [3, 5]) for (const G of [200, 350, 500, 650]) {
    const home = heron(n, pace, G, W, 0, 30, 1).tailIn;
    const latest = (dir: 1 | -1) => { let best = -1; for (let L = 0; L <= CALM + WATCH.warn + 1; L += 0.1) { const q = heron(n, pace, G, W, L, CALM, dir); if (q.seen === 0 && q.heInB) best = L; else if (best >= 0) break; } return best; };
    const a = latest(1), b = latest(-1);
    out(`| ${setting} | ${pace} | ${n} | ${W} | ${G} | ${home < 0 ? 'never' : f1(home)} | ${a < 0 ? 'none' : f1(a)} / ${b < 0 ? 'none' : f1(b)} |`);
  }
}
setDifficulty('normal');

out('\n## 6. Clump width: where he can let go of right and still have the whole line (N=5) inside a clump W wide (inCover inset 10 px)');
for (const W of [220, 260, 300, 340]) {
  let ok = 0, tot = 0, lo = Infinity, hi = -Infinity;
  for (let stopIn = 0; stopIn <= W; stopIn += 5) {
    const q = heron(5, 190, 300, W, 0, 30, 1, stopIn);
    tot++;
    if (q.tailIn >= 0 && q.heInB) { ok++; lo = Math.min(lo, stopIn); hi = Math.max(hi, stopIn); }
  }
  out(`W ${W}: let go ${lo === Infinity ? '-' : lo}-${hi === -Infinity ? '-' : hi} px before the far end holds all five (${ok * 5} px of let-go window, ${f1(ok * 5 / PHYS.maxRun)} s at a full run)`);
}

out('\n## 7. The setback: one little one spotted 500 px into the stretch scampers back to the stretch start (300 px/s); he walks back to it and on again');
{
  const run = 500 / 300;
  ground([{ id: 1, x: 0, y: FLOOR, width: 12000, height: 200, type: 'solid' } as Platform], 1500);
  const x0 = r.p.x; inp.triggerTouchMove('left'); let k = 0;
  while (r.p.x > x0 - 500 + 34 && k < 300) { r.e.update(DT); k++; }
  inp.triggerTouchMove('right'); let k2 = 0; while (r.p.x < x0 && k2 < 300) { r.e.update(DT); k2++; }
  inp.triggerTouchMove('none');
  out(`it is back at the start in ${f1(run)} s; he walks back to it and returns in ${f1((k + k2) * DT)} s (his real run both ways); then the stretch again`);
}

// ---------- 8. two herons out of step (beat 7) ----------
/** as heron(), with any number of looks: each look starts its sweep at `at` s (after its warn) from side `dir` */
function looks(n: number, pace: number, G: number, W: number, leave: number, ls: Array<{ at: number; dir: 1 | -1 }>) {
  const A: Clump = { x: 1000, w: W }, B: Clump = { x: 1000 + W + G, w: W };
  ground([{ id: 1, x: 0, y: FLOOR, width: 12000, height: 200, type: 'solid' } as Platform], A.x + W - 30);
  const t = trailAt(r.p.x); const line = newLine(t, n);
  const z0 = A.x - 200, z1 = B.x + B.w + 200;
  const end = Math.max(...ls.map((l) => l.at)) + WATCH.pass;
  let seen = 0;
  for (let k = 0; k * DT < end; k++) {
    const tt = k * DT;
    if (tt >= leave && r.p.x < B.x + W - 30) inp.triggerTouchMove('right');
    if (r.p.x >= B.x + W - 42) inp.triggerTouchMove('none');
    r.e.update(DT); t.push(r.p.x, r.p.y); stepLine(t, line, pace, DT);
    for (const l of ls) if (tt >= l.at && tt < l.at + WATCH.pass) {
      const u = (tt - l.at) / WATCH.pass;
      const sx = l.dir === 1 ? z0 - 160 + (z1 - z0 + 320) * u : z1 + 160 - (z1 - z0 + 320) * u;
      for (const f of line) if (Math.abs(sx - f.x) < WATCH.sight && (f.moved || !inClump([A, B], f.x))) seen++;
    }
  }
  return seen;
}
out('\n## 8. Two herons out of step over one crossing (calm 5.0, warn 2.0, pass 2.6: a 9.6 s cycle each; heron 2 starts `off` s after heron 1; both look over the whole stretch, heron 1 from the left, heron 2 from the right). Safe = no little one seen; leave times over one cycle from the end of a heron-1 look');
out('| setting | pace | G | off (s) | safe leave time, total of 9.6 s | longest safe window (s) |');
out('|---|---|---|---|---|---|');
for (const [setting, pace, W] of [['normal', 190, 260], ['easy', 230, 340]] as const) {
  setDifficulty(setting);
  for (const G of [350, 500]) for (const off of [3.2, 4.8]) {
    const cyc = CALM + WATCH.warn + WATCH.pass;
    const ls: Array<{ at: number; dir: 1 | -1 }> = [];
    for (let c = 0; c < 3; c++) { ls.push({ at: c * cyc + CALM + WATCH.warn, dir: 1 }); ls.push({ at: c * cyc + CALM + WATCH.warn + off - cyc, dir: -1 }); }
    // heron 2's looks before t=0 that are still sweeping, and after; leave L in [0, cyc)
    const ok: boolean[] = [];
    for (let L = 0; L < cyc; L += 0.2) ok.push(looks(5, pace, G, W, L, ls.filter((l) => l.at + WATCH.pass > 0)) === 0);
    let best = 0, run = 0; for (const o of [...ok, ...ok]) { run = o ? run + 1 : 0; best = Math.max(best, Math.min(run, ok.length)); }
    out(`| ${setting} | ${pace} | ${G} | ${off} | ${f1(ok.filter(Boolean).length * 0.2)} | ${f1(best * 0.2)} |`);
  }
}

// ---------- 9. the pond (beat 6): from the stone bank over G px of stones and water to a reed isle; he taps at each lip ----------
/** the stone bank A (W wide), stones of `sw` px with `sg` px of water between, then the isle B (W wide). One look (calm 5) from `dir`. */
function pond(pace: number, n: number, W: number, sw: number, sg: number, k0: number, leave: number, dir: 1 | -1 | 0) {
  const A: Clump = { x: 1000, w: W };
  const pl: Platform[] = [{ id: 1, x: 0, y: FLOOR, width: A.x + W, height: 200, type: 'solid' } as Platform];
  let x = A.x + W + sg;
  for (let i = 0; i < k0; i++) { pl.push({ id: 10 + i, x, y: FLOOR, width: sw, height: 60, type: 'solid' } as Platform); x += sw + sg; }
  const B: Clump = { x, w: W };
  pl.push({ id: 2, x, y: FLOOR, width: 4000, height: 200, type: 'solid' } as Platform);
  ground(pl, A.x + W - 30);
  const t = trailAt(r.p.x); const line = newLine(t, n);
  const z0 = A.x - 200, z1 = B.x + B.w + 200;
  const at = CALM + WATCH.warn;
  let seen = 0, home = -1, fell = false, lift = -1;
  for (let k = 0; k * DT < at + WATCH.pass + 0.5; k++) {
    const tt = k * DT;
    const p = r.p;
    if (tt >= leave && p.x < B.x + W - 30) inp.triggerTouchMove('right');
    if (p.x >= B.x + W - 42) inp.triggerTouchMove('none');
    const on = pl.find((q) => q.id === r.standingOn);
    if (tt >= leave && p.grounded && on && on.id !== 2 && p.x > on.x + on.width - 25 && lift < 0) { inp.triggerTouchUp(0, 80); lift = k + 2; }
    if (k === lift) { inp.releaseTouchUp(); lift = -1; }
    r.e.update(DT); t.push(r.p.x, r.p.y); stepLine(t, line, pace, DT);
    if (r.p.y > FLOOR + 40) { fell = true; break; }
    if (home < 0 && tt > leave && line.every((f) => inClump([B], f.x) && !f.moved)) home = tt - leave;
    if (dir && tt >= at && tt < at + WATCH.pass) {
      const u = (tt - at) / WATCH.pass;
      const sx = dir === 1 ? z0 - 160 + (z1 - z0 + 320) * u : z1 + 160 - (z1 - z0 + 320) * u;
      for (const f of line) if (Math.abs(sx - f.x) < WATCH.sight && (f.moved || !inClump([A, B], f.x))) seen++;
    }
  }
  return { seen, home, fell, G: B.x - (A.x + W) };
}
out('\n## 9. The pond (beat 6): stone bank -> stones over water -> reed isle (both W wide); he taps at each lip (25 px); the line paddles his path. One heron, calm 5.0');
out('| setting | pace | W | stones (w, water between) | G px | line home (s) | latest leave, look from the left / right (s) |');
out('|---|---|---|---|---|---|---|');
for (const [setting, pace, W] of [['normal', 190, 300], ['easy', 230, 340]] as const) {
  setDifficulty(setting);
  for (const [sw, sg, k0] of [[90, 60, 2], [90, 60, 3]]) {
    const base = pond(pace, 5, W, sw, sg, k0, 0, 0);
    const latest = (dir: 1 | -1) => { let best = -1; for (let L = 0; L <= CALM + WATCH.warn + 1; L += 0.1) { const q = pond(pace, 5, W, sw, sg, k0, L, dir); if (q.seen === 0 && !q.fell && q.home >= 0) best = L; else if (best >= 0) break; } return best; };
    out(`| ${setting} | ${pace} | ${W} | ${k0} x ${sw}, ${sg} | ${base.G} | ${base.fell ? 'FELL' : f1(base.home)} | ${f1(latest(1))} / ${f1(latest(-1))} |`);
  }
}
