/**
 * 5-4 Silk Bridges (w5Stage54.ts): the first stage of the dusk. Every roll can be finished and runs its length; the pace (a safe first
 * silk line over solid ground, then one over a gap, then chains); soft pits with a step out and catch ledges under the chains; the
 * sheets on open ground away from every take-off; the Seamstress's tell; and the chains crossed in the real engine with a real thumb
 * (the touch rules, touchGestures.ts, upright and sideways: a flick up and forward somewhere in the forward swing lets go).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G, HAND_STAGES, STAGE_SECONDS, stageSeconds } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { PAST_SHRINE } from './rules.ts';
import { findForStage, FIND_STAGE_IN } from './finds.ts';
import { levelConfig, RealPlay } from './realPlay.ts';
import { TIMED, vineAmp } from './physics.ts';
import { SEAMSTRESS, SHEET, SIT, stepSeam, newSeam, laced, W5_TEACH, type W5Extras } from './w5Kit.ts';
import { W5_HINTS } from './w5Lines.ts';
import { CATCH_Y, type W54Info } from './w5Stage54.ts';
import { engineGuideLine } from './dotLines.ts';
import { classifyLine, isUrgent } from './dotGuide.ts';
import { TouchGestures, type GestureSink } from './touchGestures.ts';
import { MIN_TOUCH_JUMP_HOLD_MS } from './inputEngine.ts';
import { w5BackdropStem, w5Mood } from './w5Backdrop.ts';
import type { Platform } from './types.ts';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
type Built = ReturnType<typeof buildProtoStage> & { w54info: W54Info };
const build = (s: number) => buildProtoStage(levelConfig('5-4'), s, HAND_STAGES['5-4']) as Built;
const w5 = (st: Built) => st.proto.w5 as W5Extras;
const words = (s: string) => s.trim().split(/\s+/).length;

test('5-4 is hand-built, about two and three quarter minutes for a quick player, in the dusk (the first dusk stage)', () => {
  assert.equal(HAND_STAGES['5-4'], '5-4');
  assert.ok(STAGE_SECONDS['5-4'] >= 150 && STAGE_SECONDS['5-4'] <= 180);
  assert.equal(w5Mood('5-4'), 'dusk');
  assert.equal(w5Mood('5-3'), 'gold');
  assert.match(w5BackdropStem('5-4')!, /^w5dusk/);
  for (const s of SEEDS.slice(0, 3)) assert.equal(w5(build(s)).mood, 'dusk');
});

test('5-4: every roll can be finished, has one exit, runs its full length, needs no pickup moved, and keeps nothing past the shrine', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds('5-4'), `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups moved`);
    const lim = st.exitTotemX + PAST_SHRINE;
    for (const c of st.collectibles) assert.ok(c.x <= lim, `seed ${s}: ${c.type} past the shrine`);
    const x = w5(st);
    for (const sh of x.sheets ?? []) assert.ok(sh.x1 <= lim, `seed ${s}: a sheet past the shrine`);
    for (const sm of x.seamstresses ?? []) assert.ok(sm.x <= lim, `seed ${s}: the Seamstress past the shrine`);
    for (const c of x.chairs ?? []) assert.ok(c.x <= lim, `seed ${s}: a chair past the shrine`);
    for (const v of st.vines) assert.ok(v.x <= lim, `seed ${s}: a silk line past the shrine`);
    for (const e of st.enemies) assert.ok(e.patrolMaxX <= lim, `seed ${s}: a spider past the shrine`);
    // (crumbling platforms are never needed: there are none)
    assert.ok(!st.platforms.some((p) => p.type === 'fragile' || p.crumbleAfter !== undefined), `seed ${s}`);
  }
});

test('5-4: flags all along (one at least every 45 s for a quick player) and hearts on the way', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const f = st.w54info.flagSeconds;
    for (let i = 1; i < f.length; i++) assert.ok(f[i] - f[i - 1] <= 45, `seed ${s}: ${Math.round(f[i] - f[i - 1])} s between flags ${i - 1} and ${i}`);
    assert.ok((st.checkpoints ?? []).length >= 6, `seed ${s}`);
    assert.ok(st.collectibles.filter((c) => c.type === 'heart').length >= 3, `seed ${s}`);
  }
});

/** the ground at G under [x0, x1] */
const solidUnder = (st: Built, x0: number, x1: number) => st.platforms.some((p) => p.y === G && p.x <= x0 && p.x + p.width >= x1);

test('5-4 pace: a safe first silk line over solid ground, then one line over a gap, then chains of two and more', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const inf = st.w54info;
    const first = st.vines.find((v) => v.id === inf.firstLine.vine)!;
    assert.ok(first.silk && first.isSwingingVine, `seed ${s}: the first line is silk`);
    // solid ground under all of its swing, either way
    assert.ok(solidUnder(st, first.x - 320, first.x + 320), `seed ${s}: open ground under the first silk line`);
    // its end above his head as he walks under it (taken with a hop, never by walking into it)
    assert.ok(first.bottomY + 30 < G, `seed ${s}`);
    const silk = st.vines.filter((v) => v.vineType === 'swing_liana').sort((a, b) => a.x - b.x);
    assert.equal(silk[0].id, first.id, `seed ${s}: the first silk line is the first thing to swing on`);
    assert.ok(silk.every((v) => v.silk), `seed ${s}: every swinging line is silk`);
    assert.ok(inf.chains[0].edge > first.x, `seed ${s}: the first gap after the first line`);
    assert.equal(inf.chains[0].vines.length, 1, `seed ${s}: one line over the first gap`);
    assert.ok(inf.chains[1].vines.length === 2 && !inf.chains[1].high, `seed ${s}: then two`);
    assert.ok(inf.chains.slice(2).some((c) => c.vines.length >= 3), `seed ${s}: then three`);
    assert.ok(inf.chains.some((c) => c.high), `seed ${s}: and the high bridge`);
    // every chain passed its physics checks (grab, catch, land)
    for (const c of inf.chains) assert.ok(c.checked, `seed ${s}: the chain at ${c.edge} was built unchecked`);
  }
});

test('5-4: every drop is a soft pit with a step out, and a catch ledge under every gap of a chain, a plain hop up from the floor', () => {
  for (const s of SEEDS) {
    const st = build(s);
    for (const c of st.w54info.chains) {
      const pitStart = c.high ? c.edge + 40 : c.edge;
      const floor = st.platforms.find((p) => p.y > G + 60 && p.x <= pitStart && p.x + p.width >= c.far - 20);
      assert.ok(floor, `seed ${s}: no floor under the chain at ${c.edge}`);
      // the step out at the far wall, one plain jump each
      assert.ok(st.platforms.some((p) => p.y === floor!.y - 55 && p.x + p.width >= c.far - 80), `seed ${s}: no step out of the pit at ${c.edge}`);
      assert.equal(c.ledges.length, c.vines.length - 1, `seed ${s}: a catch ledge under each gap of the chain at ${c.edge}`);
      const vs = c.vines.map((id) => st.vines.find((v) => v.id === id)!);
      for (const [k, id] of c.ledges.entries()) {
        const l = st.platforms.find((p) => p.id === id)!;
        assert.equal(l.y, CATCH_Y);
        assert.ok(floor!.y - l.y <= 70, `seed ${s}: the ledge is a plain hop up from the floor`);
        // under the gap before the line it leads to, and short of it
        assert.ok(l.x > vs[k].x && l.x + l.width < vs[k + 1].x, `seed ${s}: a ledge at ${l.x} is not under the gap`);
      }
      if (c.high) {
        const start = st.platforms.find((p) => p.id === c.start)!;
        assert.ok(G - start.y <= 2 * 92 && st.platforms.some((p) => p.y === G - 92 && p.x + p.width > start.x && p.x < start.x), `seed ${s}: a step up to the high bridge`);
      }
    }
    // and the only drops are those pits: every stretch of the path at G is joined by a chain or a pit
    const banks = st.platforms.filter((p) => p.y === G && p.height === 90).sort((a, b) => a.x - b.x);
    for (let i = 1; i < banks.length; i++) {
      const gap0 = banks[i - 1].x + banks[i - 1].width, gap1 = banks[i].x;
      if (gap1 - gap0 < 2) continue;
      assert.ok(st.platforms.some((p) => p.y > G + 60 && p.x <= gap0 && p.x + p.width >= gap1), `seed ${s}: a drop at ${gap0} with no soft floor`);
    }
  }
});

test("5-4: the silk sheets hang on open ground, well away from every take-off, and the Seamstress knits one, at its far end", () => {
  for (const s of SEEDS) {
    const st = build(s);
    const x = w5(st);
    const sheets = x.sheets ?? [];
    assert.ok(sheets.length >= 3, `seed ${s}: ${sheets.length} sheets`);
    for (const sh of sheets) {
      assert.ok(solidUnder(st, sh.x0 - 40, sh.x1 + 40), `seed ${s}: a sheet over a drop`);
      assert.ok(sh.bottom === G && sh.top < G - 200, `seed ${s}`);
      // no reason to stand by one: no take-off, no line, no spider within 300 px
      for (const c of st.w54info.chains) assert.ok(c.edge - sh.x1 > 300 || sh.x0 - c.far > 300, `seed ${s}: a sheet at ${sh.x0} beside the chain at ${c.edge}`);
      for (const v of st.vines) assert.ok(Math.abs(v.x - (sh.x0 + sh.x1) / 2) > (sh.x1 - sh.x0) / 2 + 300, `seed ${s}: a silk line by a sheet`);
      for (const e of st.enemies) assert.ok(e.patrolMinX > sh.x1 + 100 || e.patrolMaxX < sh.x0 - 100, `seed ${s}: a spider by a sheet`);
    }
    const seam = x.seamstresses ?? [];
    assert.equal(seam.length, 1, `seed ${s}: the Seamstress, once`);
    const her = sheets[seam[0].sheet];
    assert.ok(seam[0].x > her.x1 && seam[0].x - her.x1 < 80 && seam[0].dir === -1, `seed ${s}: at the far end, facing her sheet`);
    assert.equal(st.w54info.seamSheet, seam[0].sheet);
    // she comes after the first sheet has been taught
    assert.ok(seam[0].sheet >= 1, `seed ${s}`);
  }
});

test("5-4's lines: in Dot's voice and Matt's rules (tips 8 words or fewer that name the thumb move), naming the silk", () => {
  const st = build(1);
  for (const h of [W5_HINTS.s54start, W5_HINTS.s54admire, W5_HINTS.s54chain, W5_HINTS.s54high, W5_HINTS.s54end]) {
    assert.ok(st.proto.hints.some((q) => q.text === h.old), `"${h.old}" is in the stage`);
    assert.ok(words(h.text) <= 8, `"${h.text}"`);
    assert.equal(engineGuideLine(h.old, '5-4')!.text, h.text);
  }
  for (const t of [W5_TEACH.silk, W5_TEACH.sheet, W5_TEACH.seamstress, W5_TEACH.laced]) {
    const l = engineGuideLine(t, '5-4', { dot: true })!;
    assert.ok(words(l.text) <= 8, `"${l.text}"`);
    assert.match(l.text, /flick|slide|tap/i, `"${l.text}" names the thumb move`);
  }
  // the silk is named, never "it" alone (QA: "And don't admire it" named nothing)
  assert.match(engineGuideLine(W5_TEACH.sheet, '5-4')!.text, /silk/);
  assert.match(W5_HINTS.s54admire.text, /admire the silk/);
  // the silk line's tip, then how to let go
  const silk = engineGuideLine(W5_TEACH.silk, '5-4', { dot: true })!;
  assert.match(silk.text, /silk/);
  assert.match(silk.next!.text, /flick up and forward to let go/i);
  // the lace is a warning: it breaks in over whatever she is saying
  assert.equal(classifyLine(W5_TEACH.laced).kind, 'danger');
  assert.ok(isUrgent(engineGuideLine(W5_TEACH.laced, '5-4', { dot: true })!));
});

test('5-4 holds no World 5 find (finds.ts), so there is none to place', () => {
  assert.equal(FIND_STAGE_IN[5]?.note, undefined);
  assert.equal(findForStage(5, 4), null);
  for (const s of SEEDS.slice(0, 4)) assert.equal(build(s).collectibles.filter((c) => c.type === 'find').length, 0);
});

// ───────────────────────────── the Seamstress and the sheets ─────────────────────────────

test("the Seamstress's rule: she looks up only at a player lingering by her sheet in full view, tells for at least 0.6 s, and is called off by moving on", () => {
  assert.ok(SEAMSTRESS.tell >= 0.6);
  const dt = 1 / 30;
  let st = newSeam();
  // running past: never looks up
  for (let i = 0; i < 90; i++) st = stepSeam(st, { lingering: false, seen: true }, dt).st;
  assert.equal(st.phase, 'knit');
  // lingering out of view: she keeps knitting
  for (let i = 0; i < 90; i++) st = stepSeam(st, { lingering: true, seen: false }, dt).st;
  assert.equal(st.phase, 'knit');
  // lingering in view: she looks up, and casts only after the whole tell
  let castAt = -1, tellAt = -1;
  for (let i = 0; i < 90 && castAt < 0; i++) {
    const r = stepSeam(st, { lingering: true, seen: true }, dt);
    if (r.st.phase === 'tell' && st.phase === 'knit') tellAt = i * dt;
    if (r.cast) castAt = i * dt;
    st = r.st;
  }
  assert.ok(tellAt >= 0 && castAt - tellAt >= 0.6, `tell at ${tellAt.toFixed(2)}, cast at ${castAt.toFixed(2)}`);
  // moving on during the tell calls it off
  st = newSeam();
  for (let i = 0; i < 30 && st.phase !== 'tell'; i++) st = stepSeam(st, { lingering: true, seen: true }, dt).st;
  assert.equal(st.phase, 'tell');
  const r = stepSeam(st, { lingering: false, seen: true }, dt);
  assert.ok(!r.cast && r.st.phase === 'knit');
  // her lace alone never wraps him
  assert.ok(laced(0.84) < 1 && laced(0) === SEAMSTRESS.lace && laced(0.95) === 0.95);
});

/** stand him at x on the ground, take one step (so the stage has seen him move), and let go */
function standAt(sim: RealPlay, x: number) {
  sim.stand(x, G);
  for (let i = 0; i < 3; i++) sim.frame({ right: true });
  for (let i = 0; i < 6; i++) sim.frame();
}

test('5-4 in the real engine: lingering by a silk sheet brings the creep on faster than standing anywhere else; running past brings none', () => {
  const st = build(1);
  const sheet = w5(st).sheets![0];
  const creepAt = (x: number) => {
    const sim = new RealPlay('5-4', 1);
    sim.safe = false;
    standAt(sim, x);
    for (let i = 0; i < 30 * 8; i++) {
      sim.frame();
      if (sim.e.w5.silk > 0) return i / 30;
    }
    return Infinity;
  };
  const atSheet = creepAt((sheet.x0 + sheet.x1) / 2);
  const away = creepAt(sheet.x0 - 500);
  assert.ok(atSheet < away - 0.6, `the creep came at ${atSheet.toFixed(2)} s by the sheet, ${away.toFixed(2)} s away from it`);
  assert.ok(Math.abs(away - SIT.drowse) < 0.3);
  // a dawdle in front of it (slower than SHEET.pace) counts too
  const sim = new RealPlay('5-4', 1);
  sim.safe = false;
  standAt(sim, sheet.x0 - 20);
  let silk = 0;
  for (let i = 0; i < 30 * 6 && sim.p.x < sheet.x1 - 20; i++) {
    sim.frame({ right: i % 3 === 0 });
    silk = Math.max(silk, sim.e.w5.silk);
  }
  assert.ok(Math.abs(sim.p.vx) < SHEET.pace || silk > 0, 'dawdling');
  // running straight past: no silk at all
  const run = new RealPlay('5-4', 1);
  run.safe = false;
  standAt(run, sheet.x0 - 300);
  let most = 0;
  for (let i = 0; i < 30 * 3; i++) {
    run.frame({ right: true });
    most = Math.max(most, run.e.w5.silk);
  }
  assert.ok(run.p.x > sheet.x1 && most === 0, `ran past at x ${Math.round(run.p.x)} with silk ${most}`);
});

test("5-4 in the real engine: lingering at the Seamstress's sheet, she looks up (on screen, warned for 0.8 s), then her lace lands; walking on calls it off", () => {
  for (const [w, h] of [[390, 844], [844, 390]]) {
    const st = build(1);
    const x = w5(st);
    const sm = x.seamstresses![0];
    const sheet = x.sheets![sm.sheet];
    try {
      localStorage.removeItem('sloth_tips_5-4');
    } catch {
      /* no storage */
    }
    const sim = new RealPlay('5-4', 1);
    sim.safe = false;
    const e = sim.e;
    e.viewCssW = w;
    e.viewCssH = h;
    e.introT = 99;
    e.applyZoom();
    standAt(sim, sheet.x1 - 60);
    const seams = e.w5.seams as Array<{ phase: string }>;
    let tellAt = -1, castAt = -1;
    for (let i = 0; i < 30 * 4 && castAt < 0; i++) {
      sim.frame();
      if (seams[0].phase === 'tell' && tellAt < 0) tellAt = sim.t;
      if (seams[0].phase === 'cast' && castAt < 0) castAt = sim.t;
    }
    assert.ok(tellAt > 0 && castAt - tellAt >= 0.6, `${w}x${h}: tell ${tellAt.toFixed(2)} cast ${castAt.toFixed(2)}`);
    for (let i = 0; i < 10; i++) sim.frame();
    assert.ok(e.w5.silk >= SEAMSTRESS.lace - 0.05, `${w}x${h}: silk ${e.w5.silk}`);
    assert.ok(sim.said.some((s) => s.text === W5_TEACH.laced), `${w}x${h}: Dot says what happened`);
    // and walking on during the tell: no lace
    const sim2 = new RealPlay('5-4', 1);
    sim2.safe = false;
    sim2.e.viewCssW = w;
    sim2.e.viewCssH = h;
    sim2.e.introT = 99;
    sim2.e.applyZoom();
    standAt(sim2, sheet.x1 - 60);
    const s2 = sim2.e.w5.seams as Array<{ phase: string }>;
    for (let i = 0; i < 30 * 3 && s2[0].phase !== 'tell'; i++) sim2.frame();
    assert.equal(s2[0].phase, 'tell');
    for (let i = 0; i < 30; i++) sim2.frame({ right: true });
    assert.ok(!sim2.said.some((s) => s.text === W5_TEACH.laced) && (s2[0].phase as string) !== 'cast', `${w}x${h}: walked on, and she cast anyway`);
  }
});

// ───────────────────────────── the chains, with a real thumb ─────────────────────────────

interface Flick { len: number; ms: number; steps: number; deg: number }
/** the QA rig's flick, and real thumbs' (Steph's: 110 to 300 px, 0.5 to 1.8 px/ms, leaning 20 to 48 degrees) */
const FLICKS: Flick[] = [
  { len: 80, ms: 60, steps: 3, deg: 35 },
  { len: 111, ms: 111, steps: 7, deg: 27 },
  { len: 203, ms: 203, steps: 13, deg: 41 },
  { len: 302, ms: 165, steps: 10, deg: 22 },
];
/**
 * when in the forward swing the thumb starts its flick (the swing's angle, radians past hanging straight down): from the bottom of the
 * swing to past its front (the press then lands after the sweet spot, and counts as the leap it gave: physics.ts RELEASE.late)
 */
const FLICK_AT = [-0.1, 0.2, 0.45, 0.65];

/**
 * Cross a chain from a run-up, thumbs on the glass: the steering thumb slid right and held (left 18% of the screen), the other thumb
 * flicking up and forward to jump at the edge and to let go of each line once its swing comes forward past `at`. True when he lands on
 * the far side; false when he drops into the pit (or the swing never lets go).
 */
function thumbCross(seed: number, c: W54Info['chains'][number], f: Flick, at: number, view: { w: number; h: number }): { ok: boolean; why: string } {
  const r = new RealPlay('5-4', seed);
  const farY = c.farY;
  // (on the take-off: the path, or the high bridge's branch, at least 200 px long)
  r.stand(c.edge - (c.high ? 170 : 220), c.y);
  const held = { left: false, right: false, up: false, down: false, jump: false };
  let press = false;
  let pressAt = -1e9, upAt = Infinity;
  const sink: GestureSink = {
    move: (d) => { held.left = d === 'left'; held.right = d === 'right'; },
    duck: () => {},
    // (as the app's input does, inputEngine.ts: a quick flick's press counts for at least MIN_TOUCH_JUMP_HOLD_MS, or it is a hop)
    jumpPress: (lean) => { press = true; held.jump = true; pressAt = now; upAt = Infinity; r.input.state.jumpLean = lean ?? 0; },
    jumpRelease: () => { upAt = Math.max(now, pressAt + MIN_TOUCH_JUMP_HOLD_MS); },
    punch: () => {}, kick: () => {}, mega: () => {},
    climb: (d) => { held.up = d < 0; held.down = d > 0; },
    feedback: () => {},
  };
  const g = new TouchGestures(sink, () => view.w, {
    assist: () => true, air: () => !r.p.grounded && !r.p.isVineSwinging, refined: () => true, kickNear: () => false,
    onVine: () => !!r.p.isVineSwinging || !!r.p.climbing, onSwing: () => !!r.p.isVineSwinging, onRope: () => false,
  });
  let now = 5000, acc = 0;
  const tick = (ms: number) => {
    const end = now + ms;
    while (now < end) {
      const d = Math.min(10, end - now);
      now += d;
      acc += d;
      if (Math.floor(now / 30) !== Math.floor((now - d) / 30)) g.tick(now);
      if (acc >= 33) {
        acc -= 33;
        if (now >= upAt) held.jump = false;
        r.frame({ ...held, press });
        press = false;
      }
    }
  };
  // the steering thumb: down, slid 70 px right over four moves, and held
  const sx = Math.round(view.w * 0.18), sy = Math.round(view.h * 0.72);
  let x = sx;
  g.down(1, x, sy, now);
  tick(33);
  for (let k = 1; k <= 4; k++) {
    x = Math.round(x + (sx + 70 - x) / (5 - k));
    g.move(1, x, sy, now);
    tick(25);
  }
  const flick = () => {
    let ax = Math.round(view.w * 0.78), ay = Math.round(view.h * 0.62);
    const ux = Math.sin((f.deg * Math.PI) / 180), uy = -Math.cos((f.deg * Math.PI) / 180);
    g.down(2, ax, ay, now);
    for (let k = 1; k <= f.steps; k++) {
      tick(f.ms / f.steps);
      ax += (ux * f.len) / f.steps;
      ay += (uy * f.len) / f.steps;
      g.move(2, ax, ay, now);
    }
    tick(20);
    g.up(2, ax, ay, now);
  };
  let jumped = false;
  let edgeShare = 9, waited = 0;
  let lastVine = -1;
  let prevA = 9, flickAt = -1e9;
  const lets = new Set<number>();
  for (let i = 0; i < 30 * 14; i++) {
    const p = r.p;
    if (p.grounded && Math.abs(p.y - farY) < 2 && p.x > c.far + 20) return { ok: true, why: '' };
    if (p.y > G + 40) return { ok: false, why: `fell into the pit at x ${Math.round(p.x)} (lines let go: ${[...lets].join(',')})` };
    if (!jumped && p.grounded && p.x >= c.edge - 45) {
      // (the first line swings on its own, physics.ts: he waits at the edge until it swings back toward him, as a player does)
      const first = r.vines.find((q) => q.id === c.vines[0]);
      const share = first ? (first.swingAngle ?? 0) / Math.max(0.05, vineAmp(first)) : 0;
      const coming = !first || vineAmp(first) < 0.05 || (share < 0.3 && share > -0.5 && share < edgeShare);
      edgeShare = share;
      if (coming || waited++ > 30 * 6) {
        jumped = true;
        flick();
        continue;
      }
      held.right = false;
      tick(33);
      held.right = true;
      continue;
    }
    if (p.isVineSwinging) {
      // (each time the swing comes forward through `at`: a flick the moment he catches a line is not a let-go, the catch's own press
      // being spent, so a thumb that flicked too soon flicks again on the next swing forward, as a player does)
      if (p.swingVineId !== lastVine) prevA = 9;
      lastVine = p.swingVineId ?? -1;
      // (`at` in radians of the old 0.8 swing: the same share of each line's own swing now, physics.ts swingSetup)
      const own = r.vines.find((q) => q.id === p.swingVineId);
      const amp = own ? vineAmp(own) : TIMED.amp;
      const a = ((p.swingAngle ?? 0) / Math.max(0.05, amp)) * 0.8, om = p.swingAngularVelocity ?? 0;
      const moving = om > 0.075 * amp * ((2 * Math.PI) / TIMED.period);
      const through = moving && a >= at && (prevA < at || prevA === 9);
      prevA = moving ? a : -9;
      if (through && now - flickAt > 500) {
        lets.add(lastVine);
        flickAt = now;
        flick();
        continue;
      }
    } else prevA = 9;
    tick(33);
  }
  return { ok: false, why: `still going at x ${Math.round(r.p.x)} y ${Math.round(r.p.y)} swinging ${r.p.isVineSwinging}` };
}

test('5-4 in the real engine: every chain is crossed with a real thumb, a flick up and forward from the bottom of the swing to its front, upright and sideways', () => {
  const bad: string[] = [];
  let n = 0;
  for (const seed of [1, 38]) {
    const st = build(seed);
    for (const c of st.w54info.chains) {
      for (const view of [{ w: 390, h: 844 }, { w: 844, h: 390 }]) {
        for (const f of FLICKS) {
          for (const at of FLICK_AT) {
            n++;
            const out = thumbCross(seed, c, f, at, view);
            if (!out.ok) bad.push(`seed ${seed} ${c.high ? 'high ' : ''}chain of ${c.vines.length} at ${c.edge}, ${view.w}x${view.h}, ${f.len}px/${f.ms}ms ${f.deg}deg from ${at}: ${out.why}`);
          }
        }
      }
    }
  }
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} of ${n} crossings failed`);
});

test('5-4: a miss in a chain lands on a catch ledge or the soft floor, and from the ledge a jump catches the next line', () => {
  for (const seed of [1, 38, 75]) {
    const st = build(seed);
    for (const c of st.w54info.chains) {
      for (const [k, id] of c.ledges.entries()) {
        const l = st.platforms.find((p) => p.id === id) as Platform;
        // (the lines swing on their own, physics.ts: a player on the ledge waits for the line; the jump is tried at eight moments of its
        // swing, and must catch it at two or more, a quarter of every swing)
        let caught = 0;
        for (let m = 0; m < 8; m++) {
          const sim = new RealPlay('5-4', seed);
          sim.stand(l.x + 20, l.y);
          sim.vineClock = (m / 8) * TIMED.period;
          let grabbed = false, second = false;
          for (let i = 0; i < 60 && !grabbed; i++) {
            const near = sim.p.grounded && sim.p.x > l.x + l.width - 40;
            // (a running jump off its end, and the second jump at the top of it where the line hangs high: a high bridge's)
            const again = !sim.p.grounded && !second && c.high && sim.p.vy > -80;
            if (again) second = true;
            sim.frame({ right: true, press: near || again, jump: !sim.p.grounded });
            if (sim.p.isVineSwinging && sim.p.swingVineId === c.vines[k + 1]) grabbed = true;
          }
          if (grabbed) caught++;
        }
        assert.ok(caught >= 2, `seed ${seed}: from the ledge at ${l.x} the line ${c.vines[k + 1]} is caught at ${caught} of 8 moments of its swing`);
      }
    }
  }
});
