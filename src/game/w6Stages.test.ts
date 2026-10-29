import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { easyHoldCheck, validateStage } from './levelCheck.ts';
import { easyStage } from './easyMode.ts';
import { buildStiltClimb, STILT_COLUMN, STILT_CREATURES } from './w6Stages.ts';
import { newTide, restartTide, stepTide, TIDE, type TideSetting } from './risingTide.ts';
import { lianaRelease, VINE } from './gen2/pipeline.ts';
import { LIANA, WATER_LINE } from './gen2/types.ts';
import { W6_CREATURES } from './gen2/worlds/w6.ts';
import { JUMP_CLEAR } from './stageMetrics.ts';
import { swingSetup } from './physics.ts';
import { setDifficulty } from './difficulty.ts';
import { RealPlay, levelConfig } from './realPlay.ts';
import { firstTimer, FT_ADULT, FT_KID } from '../../tools/inspect/firsttimer.ts';
import type { Platform } from './types.ts';

const cfg = levelConfig('6-8');
const SEEDS = Array.from({ length: 12 }, (_, i) => 1 + i * 37);
const build = (s: number) => buildStiltClimb(cfg, s);
type Stage = ReturnType<typeof build>;
const plat = (st: Stage, id: number) => st.platforms.find((p) => p.id === id)!;
/** a fresh phone: no tip heard yet in this stage (tipMemory.ts) */
const clearTips = () => {
  try {
    localStorage.removeItem('sloth_tips_6-8');
  } catch {
    /* no storage */
  }
};
const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
after(() => setDifficulty('normal'));

test('6-8: hand-built, an ascent; every roll can be climbed on Normal and on Easy (a 70% hold), inside the column, about 2:10 quick', () => {
  assert.equal(HAND_STAGES['6-8'], '6-8');
  assert.equal(cfg.objectiveType, 'ascent');
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '6-8') as Stage;
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.deepEqual(easyHoldCheck(easyStage(build(s))), [], `seed ${s} Easy`);
    for (const p of st.platforms) assert.ok(p.x >= STILT_COLUMN.x0 && p.x + p.width <= STILT_COLUMN.x1, `seed ${s}: platform ${p.id} leaves the column`);
    for (const p of st.platforms) assert.notEqual(p.type, 'fragile', 'nothing crumbles');
    // (no shelf stands at a liana's anchor: pressing up there for a root would grab the liana)
    for (const v of st.vines.filter((q) => q.vineType === 'swing_liana')) {
      const at = st.platforms.find((p) => Math.abs(p.y - v.topY) < 90 && v.x > p.x - 60 && v.x < p.x + p.width + 60);
      assert.ok(!at, `seed ${s}: liana ${v.id} hangs from where platform ${at?.id} stands`);
    }
    // (a root never tops out beside the next one up: holding up would run on into it, past the shelf)
    const roots = st.vines.filter((v) => v.vineType === 'tree_climb');
    for (const a of roots) for (const b of roots) if (Math.abs(a.topY + 2 - (b.bottomY + 6)) < 4) assert.ok(Math.abs(a.x - b.x) > 150, `seed ${s}: roots ${a.id} and ${b.id} in line`);
    const climb = st.spawnY - st.stilt68.crown;
    assert.ok(climb > 8500, `seed ${s}: only ${climb} px up`);
    // (a climb counts 20 s short of the 2-minute floor: the inspector's quick route measures about 2:25 on rolls 1-3)
    assert.ok(st.stilt68.expert >= 120 && st.stilt68.expert <= 170, `seed ${s}: ${Math.round(st.stilt68.expert)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups moved`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    assert.ok(Math.abs(st.exitTotemY - st.stilt68.crown) < 2, 'the shrine is on the crown');
  }
});

test('6-8: every liana and the roots are the way on (take one away and the top cannot be reached); the catches are never a short cut', () => {
  for (const s of SEEDS.slice(0, 6)) {
    const st = build(s);
    assert.ok(st.stilt68.lianas.length >= 8, `seed ${s}: ${st.stilt68.lianas.length} lianas`);
    for (const li of st.stilt68.lianas) {
      const res = validateStage({ ...st, vines: st.vines.filter((v) => v.id !== li.vine) });
      assert.equal(res.ok, false, `seed ${s}: the liana ${li.vine} is not needed`);
    }
    assert.equal(validateStage({ ...st, vines: st.vines.filter((v) => v.vineType !== 'tree_climb') }).ok, false, `seed ${s}: the roots are not needed`);
    // the catches: without them the stage is still climbed (they only catch a miss)
    const off = new Set(st.stilt68.catches);
    assert.ok(off.size >= 10, `seed ${s}: ${off.size} catches`);
    assert.ok(validateStage({ ...st, platforms: st.platforms.filter((p) => !off.has(p.id)) }).ok, `seed ${s}: a catch is needed`);
  }
});

test("6-8: every liana's let-go onto its perch gives at least 167 ms on Normal and 300 ms on Easy, at the swing the stage gives it", () => {
  for (const s of SEEDS) {
    const st = build(s);
    const sized = st.vines.map((v) => ({ ...v }));
    swingSetup(sized);
    for (const li of st.stilt68.lianas) {
      const v = sized.find((q) => q.id === li.vine)!;
      const from = plat(st, li.from);
      const to = plat(st, li.to);
      // (the release is flown going right: a liana going left is the same swing mirrored)
      const right = to.x > v.x;
      const m = (x: number) => (right ? x : 2 * v.x - x);
      const far = { x: right ? to.x : m(to.x + to.width), y: to.y, w: to.width };
      assert.ok(right ? from.x + from.width <= v.x : from.x >= v.x, `seed ${s}: the liana hangs past its ledge`);
      for (const [d, need] of [['normal', LIANA.window.normal], ['easy', LIANA.window.easy]] as const) {
        const w = lianaRelease(v, { amp: v.swingAmp!, period: VINE.period[d] }, far, d);
        assert.ok(w >= need, `seed ${s} liana ${v.id} ${d}: ${Math.round(w * 1000)} ms`);
      }
    }
  }
});

test('6-8: the animals are World 6\'s frog and tayra, on the roots past the first flag, clear of every take-off, landing, root and flag', () => {
  for (const k of ['frog', 'tayra'] as const) {
    const c = W6_CREATURES.find((q) => q.enemy === k)!;
    const mine = STILT_CREATURES[k];
    assert.deepEqual([c.w, c.h, c.hp, c.footY], [mine.w, mine.h, mine.hp, mine.footY], `${k} still matches gen2's manifest`);
  }
  for (const s of SEEDS) {
    const st = build(s);
    assert.ok(st.enemies.length >= 5, `seed ${s}`);
    const firstFlag = Math.max(...st.checkpoints!.map((c) => c.y));
    for (const e of st.enemies) {
      const feet = e.y + STILT_CREATURES[e.type as 'frog' | 'tayra'].footY;
      const p = st.platforms.find((q) => Math.abs(q.y - feet) < 2 && e.x >= q.x && e.x <= q.x + q.width) as Platform;
      assert.ok(p, `seed ${s}: animal ${e.id} stands on a ledge`);
      assert.ok(feet < firstFlag, `seed ${s}: animal ${e.id} below the first flag`);
      assert.ok(e.patrolMinX - p.x >= JUMP_CLEAR && p.x + p.width - e.patrolMaxX >= JUMP_CLEAR, `seed ${s}: animal ${e.id} by its ledge's end`);
      for (const v of st.vines) {
        if (v.vineType !== 'tree_climb' || !(Math.abs(v.topY + 2 - p.y) < 4 || Math.abs(v.bottomY + 6 - p.y) < 4)) continue;
        assert.ok(v.x < e.patrolMinX - JUMP_CLEAR || v.x > e.patrolMaxX + JUMP_CLEAR, `seed ${s}: animal ${e.id} by a root`);
      }
    }
  }
});

test('6-8: Dot says the water line on the mudflat before any water can reach him; the stage lines are short; the tide plan fits the stage', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const water = st.proto.hints.find((h) => h.text === WATER_LINE)!;
    assert.ok(water && water.x < 500 && water.aboveY! >= st.spawnY, `seed ${s}: the water line on the mudflat`);
    for (const h of st.proto.hints) if (h.text !== WATER_LINE) assert.ok(words(h.text) < 10, `seed ${s}: "${h.text}"`);
    for (const re of [/stops at the flags/, /Wait for the swing/, /Spring tide/, /Stone towers/]) assert.ok(st.proto.hints.some((h) => re.test(h.text)), `seed ${s}: ${re}`);
    const tide = st.proto.tide!;
    assert.ok(tide.low > st.spawnY + 30, 'the water starts under the mudflat');
    assert.ok(tide.turnAbove < st.spawnY - 300, 'it turns once he is up the first root');
    assert.ok(tide.springAbove < tide.turnAbove - 5000, 'the spring tide is the climax, high up');
    assert.equal(tide.holds.length, 1, 'the first liana\'s shelf holds the tide');
  }
});

/**
 * a careful player: the quick route ledge by ledge, `slow` times slower, waiting a full extra swing at every liana and standing a
 * moment at every flag; his feet go up a root (or a hop) at an even speed. The tide replayed on it, by its own rules.
 */
function replay(st: Stage, set: TideSetting, slow: number) {
  const plan = st.proto.tide!;
  const flags = new Set(st.checkpoints!.map((c) => c.y));
  const pts: Array<{ t: number; y: number; rest: number }> = [];
  let t = 0, prevQ = 0;
  for (const r of st.stilt68.route) {
    const p = plat(st, r.id);
    t += (r.t - prevQ) * slow + (r.by === 'liana' ? VINE.period.easy : 0);
    prevQ = r.t;
    pts.push({ t, y: p.y, rest: flags.has(p.y) ? 1.5 : 0 });
    t += flags.has(p.y) ? 1.5 : 0;
  }
  const s = newTide(plan);
  let closest = Infinity;
  const dt = 1 / 30;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const t0 = a.t + a.rest;
    for (let u = a.t; u < b.t; u += dt) {
      const feet = u < t0 ? a.y : a.y + ((b.y - a.y) * (u - t0)) / Math.max(dt, b.t - t0);
      stepTide(s, plan, set, dt, feet, u < t0 && a.rest > 0);
      if (s.on) closest = Math.min(closest, s.y - feet);
    }
  }
  return closest;
}

test('6-8: the tide never comes within 120 px of a careful player (Normal: half the quick pace; Easy: a third), on every roll', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const n = replay(st, TIDE.normal, 2);
    const e = replay(st, TIDE.easy, 3);
    assert.ok(n >= 120, `seed ${s} Normal: ${Math.round(n)} px`);
    assert.ok(e >= 120, `seed ${s} Easy: ${Math.round(e)} px`);
  }
});

test('6-8: the tide by its rules: still until he is up the first root, a churn, rises, holds at a flag, catches a player who stops long, starts again under his flag', () => {
  const plan = { low: 10000, turnAbove: 9600, springAbove: 2000, holds: [] };
  for (const set of [TIDE.normal, TIDE.easy]) {
    const s = newTide(plan);
    assert.equal(stepTide(s, plan, set, 1, 9990, false), null);
    assert.equal(s.on, false);
    assert.equal(stepTide(s, plan, set, 1 / 30, 9500, false), 'turned');
    for (let i = 0; i < Math.round((set.warn - 0.1) * 30); i++) stepTide(s, plan, set, 1 / 30, 9500, false);
    assert.equal(s.y, 10000, 'it churns first, then rises');
    for (let i = 0; i < 30; i++) stepTide(s, plan, set, 1 / 30, 9500, false);
    assert.ok(s.y < 10000);
    const y0 = s.y;
    for (let i = 0; i < 300; i++) stepTide(s, plan, set, 1 / 30, 9500, true);
    assert.equal(s.y, y0, 'slack water at a flag');
    // he stands still between flags: it reaches him in the end (Normal under a minute and a half, Easy in under three)
    let t = 0;
    while (s.y > 9500 + 20 && t < 400) {
      stepTide(s, plan, set, 1 / 30, 9500, false);
      t += 1 / 30;
    }
    assert.ok(t < (set === TIDE.normal ? 90 : 180), `caught after ${Math.round(t)} s`);
    assert.ok(t > (set === TIDE.normal ? 30 : 60), `caught after only ${Math.round(t)} s`);
    restartTide(s, plan, set, 9500);
    assert.equal(s.y, 9500 + set.under);
    restartTide(s, plan, set, 10000);
    assert.deepEqual([s.y, s.on], [10000, false], 'back at the start: as it began');
  }
  assert.ok(TIDE.easy.speed < TIDE.normal.speed && TIDE.easy.band > TIDE.normal.band && TIDE.easy.warn > TIDE.normal.warn, 'Easy is gentler');
});

test('6-8 in the real engine: the water is the stage\'s, still on the mudflat, turns up the first root with Dot\'s line, holds at a flag and drowns a long stop', () => {
  for (const d of ['normal', 'easy'] as const) {
    setDifficulty(d);
    clearTips();
    const rp = new RealPlay('6-8', 1);
    const e = rp.e as unknown as { tide: { y: number; on: boolean }; currentStage: { waterY: number } };
    const st = rp.stage as Stage;
    // the mudflat: nothing moves, nothing hurts in the opening seconds
    rp.stand(st.spawnX, st.spawnY);
    for (let i = 0; i < 6 * 30; i++) rp.frame({ right: i < 60 });
    assert.equal(rp.died, false);
    assert.equal(e.tide.on, false);
    assert.equal(e.currentStage.waterY, st.proto.tide!.low);
    // up the first root: it turns
    const first = plat(st, st.stilt68.route[1].id);
    rp.stand(first.x + first.width / 2, first.y);
    rp.wait(0.2);
    assert.equal(e.tide.on, true, d);
    assert.ok(rp.said.some((l) => /tide's coming in/.test(l.text)), 'Dot says it turns');
    rp.wait(8);
    assert.ok(e.currentStage.waterY < st.proto.tide!.low - 10, `${d}: the water rises (${e.currentStage.waterY})`);
    // at a flag it holds
    const cp = st.checkpoints![0];
    rp.stand(cp.x, cp.y);
    rp.wait(1);
    const held = e.tide.y;
    rp.wait(10);
    assert.equal(e.tide.y, held, `${d}: slack water at the flag`);
    // a long stop between flags: it reaches him
    const mid = plat(st, st.stilt68.route.find((r) => plat(st, r.id).y < cp.y - 300 && r.by === 'root')!.id);
    e.tide.y = mid.y + 500;
    rp.stand(mid.x + 40, mid.y);
    let t = 0;
    while (!rp.died && t < 240) {
      rp.frame();
      t += 1 / 30;
    }
    assert.ok(rp.died, `${d}: never caught`);
    assert.ok(t > 25, `${d}: caught after ${Math.round(t)} s`);
  }
  setDifficulty('normal');
});

test('6-8 in the real engine: the way up works as the game plays it (each root climbed, each hop landed), on two rolls', () => {
  for (const seed of [1, 2]) {
    const rp = new RealPlay('6-8', seed);
    const st = rp.stage as Stage;
    const rt = st.stilt68.route;
    const fails: string[] = [];
    for (let i = 1; i < rt.length; i++) {
      const a = plat(st, rt[i - 1].id), b = plat(st, rt[i].id);
      if (rt[i].by === 'liana') continue; // (the let-go is the engine's own pressWindow: the window test above)
      if (rt[i].by === 'root') {
        const v = st.vines.find((q) => q.vineType === 'tree_climb' && Math.abs(q.bottomY + 6 - a.y) < 4 && Math.abs(q.topY + 2 - b.y) < 4 && q.x >= a.x - 60 && q.x <= a.x + a.width + 60)!;
        rp.stand(v.x + (v.x > a.x + a.width / 2 ? -30 : 30), a.y);
        let ok = false;
        for (let f = 0; f < 6 * 30 && !ok; f++) {
          rp.frame({ up: true, ...(f > 60 ? { [b.x + b.width / 2 > v.x ? 'right' : 'left']: true } : {}) });
          ok = rp.p.grounded && Math.abs(rp.p.y - b.y) < 3;
        }
        if (!ok) fails.push(`root ${a.id}->${b.id}`);
      } else {
        // (a running hop: from the far end of the ledge, the press about 30 px short of the edge, held)
        const right = b.x > a.x + a.width / 2;
        const edge = right ? a.x + a.width : a.x;
        rp.stand(right ? a.x + 20 : a.x + a.width - 20, a.y);
        let pressed = -1, ok = false;
        for (let f = 0; f < 4 * 30 && !ok; f++) {
          const pad: Record<string, boolean> = { [right ? 'right' : 'left']: true };
          if (pressed < 0 && Math.abs(edge - rp.p.x) < 30) {
            pad.press = true;
            pressed = f;
          } else if (pressed >= 0 && f - pressed < 18) pad.jump = true;
          rp.frame(pad);
          ok = rp.p.grounded && Math.abs(rp.p.y - b.y) < 3 && rp.p.x >= b.x - 5 && rp.p.x <= b.x + b.width + 5;
        }
        if (!ok) fails.push(`hop ${a.id}->${b.id}`);
      }
    }
    assert.deepEqual(fails, [], `seed ${seed}`);
  }
});

test('6-8 first-timers: nothing hurts before the water line; lives lost stay inside World 6\'s band (at most 3 a minute)', () => {
  for (const who of [FT_KID, FT_ADULT]) {
    const run = firstTimer('6-8', 1, who, { fresh: true });
    const first = run.harms[0];
    assert.ok(!first || first.t > 10, `${who.name}: hurt at ${first?.t} s`);
    assert.ok(run.perMin.lives <= 3, `${who.name}: ${run.perMin.lives} lives a minute`);
  }
});
