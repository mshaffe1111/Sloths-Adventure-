import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, HAND_STAGES, stageSeconds } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { rockFits } from './rockfall.ts';
import { glideBrake, glideLift, glideStep, newGlide } from './glide.ts';
import { PHYS, reachGlide } from './physics.ts';
import { buildLongDrop, DRAFT_HOVER, type DraftInfo } from './w4LongDrop.ts';
import type { LevelConfig, Platform } from './types.ts';
import type { Updraft } from './w4Play.ts';

const cfg = { worldIndex: 4, miniIndex: 7, id: '4-7', name: '4-7', objectiveType: 'sprint', targetCount: 1, timeLimit: 0, levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0 } as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build = (s: number) => buildLongDrop(cfg, s);
type Stage = ReturnType<typeof build>;
const platOf = (st: Stage, id: number) => st.platforms.find((p) => p.id === id)!;
/** the ledge a flag stands on */
const flagLedge = (st: Stage, cp: { x: number; y: number }) => st.platforms.find((p) => cp.x >= p.x && cp.x <= p.x + p.width && Math.abs(p.y - cp.y) < 2)!;

test('4-7: every roll can be finished on the leaf, and cannot be without it', () => {
  assert.equal(HAND_STAGES['4-7'], '4-7');
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '4-7');
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    // judged as a stage before the leaf can be counted on (4-6), it must fail: the leaf is needed here
    const without = validateStage({ ...st, config: { ...st.config, miniIndex: 6 } });
    assert.equal(without.ok, false, `seed ${s}: 4-7 can be finished without the leaf`);
    assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds('4-7'), `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok(st.meta!.timing!.layoutSeconds <= stageSeconds('4-7') + 30, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s is far over`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups moved`);
  }
});

test('4-7: it goes down; rocks drop through the gaps (never onto a ledge), with time to spare; updrafts and close flags', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const ys = st.platforms.map((p) => p.y);
    assert.ok(ys[ys.length - 1] - ys[0] > 8000, `seed ${s}: only ${ys[ys.length - 1] - ys[0]} px down`);
    const rocks = st.proto.w4?.rocks ?? [];
    assert.ok(rocks.length >= 8, `seed ${s}: ${rocks.length} rocks`);
    for (const r of rocks) {
      assert.ok(r.air && rockFits(r), `seed ${s}`);
      assert.ok(!st.platforms.some((p) => r.x > p.x - 30 && r.x < p.x + p.width + 30 && p.y > r.top && p.y < r.land), `seed ${s}: a rock falls onto a ledge`);
    }
    assert.ok((st.proto.w4?.updrafts ?? []).length >= 2, `seed ${s}`);
    assert.equal(st.proto.w4?.deepFall, 700);
    assert.equal(st.deepFall, 700, 'the validator knows about the mist');
    assert.equal(st.updrafts, st.proto.w4?.updrafts, 'the validator sees the same warm air the engine does');
    for (const re of [/only way now is down/, /keep your thumb on the glass/, /Too far to jump/, /Rocks are dropping/, /Warm air/]) assert.ok(st.proto.hints.some((h) => re.test(h.text)), `seed ${s}: no hint ${re}`);
  }
});

test('4-7: the path runs back and forth across the cliff, every flag lower than the last and close to it, the shrine furthest right', () => {
  for (const s of SEEDS) {
    const st = build(s);
    assert.equal(st.proto.w4?.descent, true, 'a lower flag is further on');
    // which way each step goes: it must turn at least four times
    let turns = 0;
    let was = 0;
    for (let i = 1; i < st.platforms.length; i++) {
      const a = st.platforms[i - 1], b = st.platforms[i];
      const d = Math.sign(b.x + b.width / 2 - (a.x + a.width / 2));
      if (b.y - a.y > 450 && b.x < a.x + a.width && b.x + b.width > a.x) continue; // (the drop under a turn)
      if (was && d && d !== was) turns++;
      if (d) was = d;
    }
    assert.ok(turns >= 4, `seed ${s}: the path turns only ${turns} times`);
    // flags in the order he reaches them: each lower than the one before, never more than three ledges on, never far
    const flags = st.checkpoints!.map((c) => ({ c, p: flagLedge(st, c) })).sort((a, b) => a.p.id - b.p.id);
    assert.ok(flags.length >= 25, `seed ${s}: ${flags.length} flags`);
    for (let i = 1; i < flags.length; i++) {
      const a = flags[i - 1], b = flags[i];
      assert.ok(b.c.y > a.c.y, `seed ${s}: the flag at ${b.c.x} is not lower than the one before it`);
      assert.ok(b.p.id - a.p.id <= 3, `seed ${s}: ${b.p.id - a.p.id} ledges between flags`);
      assert.ok(Math.hypot(b.c.x - a.c.x, b.c.y - a.c.y) < 3400, `seed ${s}: flags ${Math.round(Math.hypot(b.c.x - a.c.x, b.c.y - a.c.y))} px apart`);
    }
    // the engine keeps him left of the shrine: nothing is further right than it
    const last = st.platforms[st.platforms.length - 1];
    for (const p of st.platforms) if (p !== last) assert.ok(p.x + p.width < st.exitTotemX - 40, `seed ${s}: ledge ${p.id} is right of the shrine`);
    for (const u of st.updrafts!) assert.ok(u.x1 < st.exitTotemX - 40, `seed ${s}`);
    assert.ok(st.config.levelHeight < 15000 && st.config.levelWidth < 24000, `seed ${s}: ${st.config.levelWidth} x ${st.config.levelHeight}`);
  }
});

test('4-7: no short cut: a drop that skips ledges is deeper than a fall into the mist', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const P = st.platforms;
    for (const a of P) {
      for (const b of P) {
        if (b.id <= a.id + 2) continue;
        const drop = b.y - a.y;
        if (drop > 670) continue;
        const gap = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width));
        const r = reachGlide(-drop, true);
        assert.ok(r < 0 || gap > r * 0.97 - 70, `seed ${s}: ledge ${a.id} drops straight to ledge ${b.id} (${drop} px down, ${gap} px across)`);
      }
    }
  }
});

test('4-7: the warm air: a bonus first, then the only way up to a higher ledge, over a gap too wide for the leaf, and with a rock through it', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const kinds = st.drafts47.map((d) => d.kind);
    const first = (k: DraftInfo['kind']) => kinds.indexOf(k);
    assert.ok(first('bonus') >= 0 && first('bonus') < first('up') && first('up') < first('rock') && first('rock') < first('across'), `seed ${s}: ${kinds.join(',')}`);
    assert.ok(kinds.filter((k) => k === 'up').length >= 3 && kinds.filter((k) => k === 'rock').length >= 3 && kinds.filter((k) => k === 'across').length >= 2, `seed ${s}: ${kinds.join(',')}`);
    const reach = new Set(validateStage(st).reachableIds);
    for (const d of st.drafts47) {
      const u = st.updrafts![d.i];
      // nothing stands in the warm air
      assert.ok(!st.platforms.some((p) => p.x < u.x1 && p.x + p.width > u.x0 && p.y > u.top && p.y < u.bottom), `seed ${s}: a ledge in warm air ${d.i}`);
      if (d.kind === 'bonus') continue;
      const A = platOf(st, d.from!), B = platOf(st, d.to!);
      assert.ok(reach.has(B.id), `seed ${s}`);
      if (d.kind === 'up' || d.kind === 'rock') assert.ok(A.y - B.y >= 240, `seed ${s}: the ledge is only ${A.y - B.y} px higher`);
      else assert.ok(B.y >= A.y && B.y - A.y < 150, `seed ${s}`);
      // without this warm air the ledge it leads to cannot be reached, and nor can the shrine
      const res = validateStage({ ...st, updrafts: st.updrafts!.filter((_, j) => j !== d.i) });
      assert.ok(!res.reachableIds.includes(B.id) && !res.ok, `seed ${s}: ledge ${B.id} is reached without warm air ${d.i} (${d.kind})`);
      if (d.kind === 'rock') {
        const rk = st.proto.w4!.rocks!.find((r) => r.x > u.x0 && r.x < u.x1 && r.land > u.top && r.top < u.bottom);
        assert.ok(rk && rk.top < u.top && rk.land > A.y, `seed ${s}: no rock through the warm air`);
        // there is room in the air to be beside the rock, not under it
        assert.ok(u.x1 - u.x0 >= 260, `seed ${s}`);
      }
    }
  }
});

/**
 * the engine's own rules (engine.ts: steer, gravity with the hang at the top, the leaf, the warm air, move) for one flight: set off from
 * the end of A (`jump`: with a jump), steer into the warm air, let go in it until he hangs at its top, then drift across to B
 */
function ride(A: Platform, B: Platform, u: Updraft, jump: boolean, dt: number): boolean {
  const dir = B.x > A.x ? 1 : -1;
  let x = dir > 0 ? A.x + A.width - 4 : A.x + 4;
  let y = A.y;
  let vx = dir * PHYS.maxRun;
  let vy = jump ? -PHYS.jumpV : 0;
  const g = newGlide();
  let phase: 'in' | 'rise' | 'out' = 'in';
  const inAir = (px: number, feet: number) => px >= u.x0 && px <= u.x1 && feet - 32 >= u.top && feet - 32 <= u.bottom;
  for (let i = 0; i < 12 / dt; i++) {
    if (phase === 'in' && (dir > 0 ? x > u.x0 + 70 : x < u.x1 - 70)) phase = 'rise';
    if (phase === 'rise' && y < u.top + DRAFT_HOVER + 30 && vy > -60) phase = 'out';
    const steer = phase === 'rise' ? 0 : dir;
    if (steer) vx = Math.max(-PHYS.maxRun, Math.min(PHYS.maxRun, vx + steer * PHYS.airAcc * dt));
    else vx = Math.abs(vx) <= PHYS.airDec * dt ? 0 : vx - Math.sign(vx) * PHYS.airDec * dt;
    let grav = vy < 0 ? PHYS.gravUp : PHYS.gravDown;
    if (Math.abs(vy) < 90) grav *= 0.72;
    vy = Math.min(PHYS.maxFall, vy + grav * dt);
    const lift = inAir(x, y);
    const cap = glideStep(g, { has: true, airborne: true, held: true, vy, lift }, dt);
    vy = glideBrake(vy, cap, dt);
    if (lift && g.on) vy = glideLift(vy, dt);
    const prev = y;
    x += vx * dt;
    y += vy * dt;
    if (vy >= 0 && prev <= B.y + 14 && y >= B.y && x + 11 > B.x && x - 11 < B.x + B.width) return true;
    if (y > A.y + 690) return false;
  }
  return false;
}

/**
 * the engine's steps: it is locked at 30 fps, and a slow frame is at most 0.05 s (engine.ts loop). (At 60 Hz the leaf's brake, which
 * comes before the lift, would hold a falling sloth sinking at 92 px/s in warm air: the warm air is tuned for 30 fps.)
 */
const TICKS = [1 / 30, 0.05];

test('4-7 the warm air really carries him: by the engine\'s rules, a ride up and a drift across lands on the ledge, at both tick rates', () => {
  for (const s of SEEDS) {
    const st = build(s);
    for (const d of st.drafts47) {
      if (d.kind === 'bonus') continue;
      const A = platOf(st, d.from!), B = platOf(st, d.to!), u = st.updrafts![d.i];
      for (const dt of TICKS) assert.ok(ride(A, B, u, d.kind === 'across', dt), `seed ${s}: the ${d.kind} warm air ${d.i} does not land him on ledge ${B.id} (dt ${dt})`);
      // and without it the same flight falls short
      for (const dt of TICKS) assert.equal(ride(A, B, { ...u, top: u.bottom + 5000, bottom: u.bottom + 6000 }, d.kind === 'across', dt), false, `seed ${s}`);
    }
  }
});

test('4-7: the caves and the turns are taught where they first come, below the ledges above', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const said = (re: RegExp) => st.proto.hints.find((h) => re.test(h.text));
    for (const re of [/cave in the cliff below/, /turns back/, /too high to jump/, /rock drops through the warm air/, /Too far even for the leaf/, /deepest drops/]) assert.ok(said(re), `seed ${s}: no hint ${re}`);
    assert.equal(st.proto.w4!.decor!.filter((d) => d.n === 'cave').length, 2, `seed ${s}: two rest caves`);
    for (const cave of st.proto.w4!.decor!) {
      const ledge = st.platforms.find((p) => cave.x > p.x && cave.x < p.x + p.width && Math.abs(p.y + 12 - cave.b) < 1);
      assert.ok(ledge && ledge.width >= 600, `seed ${s}: a cave with no wide ledge`);
      assert.ok(st.checkpoints!.some((c) => c.x >= ledge!.x && c.x <= ledge!.x + ledge!.width && c.y === ledge!.y), `seed ${s}: no flag in the cave`);
    }
    // each new kind of warm air is explained by the time he stands on the ledge he sets off from
    for (const [kind, re] of [['up', /too high to jump/], ['rock', /rock drops through/], ['across', /Too far even for the leaf/]] as const) {
      const d = st.drafts47.find((q) => q.kind === kind)!;
      const A = platOf(st, d.from!);
      const h = said(re)!;
      assert.ok(h.belowY !== undefined && h.belowY <= A.y && h.x <= A.x + A.width, `seed ${s}: the ${kind} warm air is not explained before it`);
      // (and not up on the ledges far above, where he has already been at that x)
      assert.ok(h.belowY > st.platforms[0].y + 2000, `seed ${s}`);
    }
  }
});

test('4-7 runtime: falling well below the last ledge is a fall into the mist; an updraft lifts the leaf', async () => {
  const { W4Play } = await import('./w4Play.ts');
  const player = { x: 100, y: 1000, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 } as never as import('./types.ts').PlayerState;
  let fell = 0;
  const host = { t: 0, player, platforms: [], vines: [], collectibles: [], zones: [], punch: null, hidden: false, hurt() {}, tip() {}, float() {}, screech() {}, sfx() {}, fellOff: () => fell++ };
  const w = new W4Play({ deepFall: 700, updrafts: [{ x0: 500, x1: 600, top: 800, bottom: 1400 }] }, [], []);
  w.step(1 / 30, host);
  player.grounded = false;
  player.y = 1650;
  w.step(1 / 30, host);
  assert.equal(fell, 0, 'a 650 px fall is not yet into the mist');
  player.y = 1720;
  w.step(1 / 30, host);
  assert.equal(fell, 1);
  w.step(1 / 30, host);
  assert.equal(fell, 1, 'it counts once');
  assert.equal(w.inUpdraft(550, 1000), true);
  assert.equal(w.inUpdraft(650, 1000), false);
});
