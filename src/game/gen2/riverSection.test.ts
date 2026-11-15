/**
 * The river as a gen2 section (ENG-W2b, 11-15; reference/qa-reports/ENG-W2/REPORT.md EXACT NEXT STEP 1a-1h; the place rule signed off by the
 * lead 11:14 AM ET): place `river` lays the far bank the row's river width past `after`, level; layStage lays the water and its logs from
 * the same row (riverLay layRiver) BEFORE the check, so levelCheck and riverFaults judge what the game plays; checkStage holds every log
 * river to riverFaults; dropsOf reads a fall in a river as the river's (a life, or a splash back), never a log as a floor; the crossing is
 * asked as a ride, never a 600-800 px jump. World-neutral (level.md rule 21-22): proven on World 2's rows under World 2's ground and under
 * World 6's. Planted: each rule below was red before ENG-W2b (the type did not exist; a laid river had no logs, no fairness, a log read as
 * a floor), and each fault plant names the rule it breaks.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, checkStage, dropsOf, layLocal, planBudget, rngFor } from './pipeline.ts';
import { LOG_DROP, surfaceBelowBank } from '../river.ts';
import { riverFaults, riverWidth } from './riverLay.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from './toyWorld.ts';
import { W2_GROUND, W2_RIVERS } from './worlds/w2.ts';
import { W6_GROUND } from './worlds/w6.ts';
import type { Gen2Stage, SectionPiece, SectionTemplate, WorldKit, WorldManifest } from './types.ts';
import type { Difficulty } from '../difficulty.ts';

// ───────────────────────── a toy river section on any world's ground ─────────────────────────
const near: SectionPiece = { key: 'near', shape: 'bank', w: [320, 320], place: { kind: 'start' }, main: true };
const far = (row: string, after = 'near'): SectionPiece => ({ key: `far-${row}`, shape: 'bank', w: [360, 360], place: { kind: 'river', after, row }, main: true, landing: true });
const riverSection = (rows: string[], id = 'toy-river'): SectionTemplate => {
  const pieces: SectionPiece[] = [near];
  let after = 'near';
  for (const r of rows) { const p = far(r, after); pieces.push(p); after = p.key; }
  return { id, name: 'a river', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, pieces, entry: { piece: 'near', kind: 'ground' }, exit: { piece: after, kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false, maxPerStage: 1 };
};
/** a world's manifest with World 2's river table, on `ground` (World 2's or World 6's), its sections a meadow and the river */
const kitOn = (ground: { y: number; bankH: number }, sections: SectionTemplate[], rivers: WorldManifest['rivers'] = W2_RIVERS): WorldKit => ({
  ...toyKit,
  manifest: { ...toyKit.manifest, ground: { ...toyKit.manifest.ground, y: ground.y, bankH: ground.bankH }, corridor: { top: ground.y - 260, bottom: ground.y + 60, soft: 80 }, rivers, sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false }, ...sections], creatures: [], props: [], pairs: [], tips: {} },
});
const budgetOf = (k: WorldKit, s: Difficulty = 'normal') => planBudget(toyCfg('5-3', 'sprint'), k.manifest, s);

// ───────────────────────── the place rule (1a, 1b, 1f) ─────────────────────────
for (const [name, ground] of [['World 2', W2_GROUND], ['World 6', W6_GROUND]] as const) {
  for (const s of ['normal', 'easy'] as const) {
    test(`${name} ground, ${s}: place 'river' lays the far bank the row's width past 'after', level; the water is a river gap; the crossing is a ride`, () => {
      const k = kitOn(ground, []);
      for (const row of Object.keys(W2_RIVERS) as Array<keyof typeof W2_RIVERS>) {
        const L = layLocal(riverSection([row]), budgetOf(k, s), rngFor(3, 1), false, { rivers: k.manifest.rivers });
        const a = L.pieces.find((p) => p.key === 'near')!, b = L.pieces.find((p) => p.key === `far-${row}`)!;
        assert.equal(b.x - (a.x + a.w), riverWidth(W2_RIVERS[row]), `${row}: the water is the row's width`);
        assert.equal(b.y, a.y, `${row}: the banks are level`);
        assert.deepEqual(b.river, { row, from: 'near' });
        const g = L.gaps.find((q) => q.river === row)!;
        assert.ok(g, `${row}: its gap is the river's`);
        assert.equal(g.x0, a.x + a.w);
        assert.equal(g.x1, b.x);
        assert.equal(!!g.soft, !!(W2_RIVERS[row] as { safe?: boolean }).safe, `${row}: a safe row splashes him back`);
        assert.equal(!!g.water, !(W2_RIVERS[row] as { safe?: boolean }).safe, `${row}: a deep row is water`);
        const ask = L.asks!.find((q) => q.key === b.key)!;
        assert.equal(ask.move, 'ride', `${row}: the crossing is a ride, never a ${Math.round(b.x - a.x - a.w)} px jump`);
      }
    });
  }
}

test("place 'river' fails by name: a row the world lacks, a world with no river table, a mirrored section", () => {
  const k = kitOn(W2_GROUND, []);
  assert.throws(() => layLocal(riverSection(['rapids']), budgetOf(k), rngFor(1), false, { rivers: k.manifest.rivers }), /river row "rapids"/);
  assert.throws(() => layLocal(riverSection(['deep']), budgetOf(k), rngFor(1), false, {}), /no river row of that name/);
  assert.throws(() => layLocal(riverSection(['deep']), budgetOf(k), rngFor(1), true, { rivers: k.manifest.rivers }), /mirrored section/);
});

// ───────────────────────── the stage: logs laid, judged, read (1c, 1d, 1e) ─────────────────────────
/** a stage of the toy world with one river section of `rows`: the first seed in 1-40 whose roll lays it (a meadow-only roll has none) */
function riverStage(ground: { y: number; bankH: number }, rows: string[], s: Difficulty = 'normal'): Gen2Stage {
  const k = kitOn(ground, [riverSection(rows)]);
  for (let seed = 1; seed <= 40; seed++) {
    const st = buildGen2Stage({ config: toyCfg('5-3', 'sprint'), kit: k, seed, difficulty: s });
    if (st.rivers?.length) return st;
  }
  throw new Error(`no roll of 1-40 lays the river ${rows.join(', ')}`);
}

for (const [name, ground] of [['World 2', W2_GROUND], ['World 6', W6_GROUND]] as const) {
  for (const s of ['normal', 'easy'] as const) {
    test(`${name} ground, ${s}: a rolled stage lays each river's water and its logs, fair by riverFaults, and the check passes them`, () => {
      const st = riverStage(ground, ['ride', 'deep', 'back'], s);
      assert.equal(st.rivers!.length, 3, 'three rivers');
      for (const r of st.rivers!) {
        const logs = st.platforms.filter((p) => p.type === 'drift' && p.drift!.x0 === r.x0 && p.drift!.x1 === r.x1);
        assert.ok(logs.length >= 3, `river at ${r.x0}: ${logs.length} logs`);
        const nearBank = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 1)!;
        const farBank = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x - r.x1) <= 1)!;
        assert.ok(nearBank && farBank, `river at ${r.x0}: a bank at each end`);
        assert.equal(nearBank.y, farBank.y, 'level banks');
        assert.equal(r.surfaceY, nearBank.y + surfaceBelowBank, 'the surface under the banks, after every shift');
        for (const p of logs) assert.equal(p.drift!.baseY, nearBank.y + LOG_DROP, 'each log floats at LOG_DROP under the bank, after every shift');
        // nothing laid in the water: no pit bed, no stair, no bough
        const under = st.platforms.filter((p) => p.type !== 'drift' && p.x >= r.x0 + 1 && p.x + p.width <= r.x1 - 1);
        assert.deepEqual(under.map((p) => `${p.type}@${p.x},${p.y}`), [], 'nothing is laid in the water');
      }
      assert.ok(st.rivers!.some((r) => r.safe), 'the safe row splashes him back');
      assert.ok(st.rivers!.some((r) => r.dir === -1), 'the back row flows at him');
      assert.deepEqual(riverFaults(st), []);
      assert.deepEqual(st.gen2.errors, [], 'the roll is clean');
      assert.ok(checkStage(st, st.gen2.budget).ok, 'the check passes it');
    });
  }
}

test('dropsOf: a fall in a deep river is a life in its water, in a safe one a splash back to the bank he left; a log is never a floor', () => {
  const st = riverStage(W2_GROUND, ['ride', 'deep'], 'normal');
  const drops = dropsOf(st);
  for (const r of st.rivers!) {
    const d = drops.find((q) => q.x0 < r.x1 && q.x1 > r.x0)!;
    assert.ok(d, `river at ${r.x0} has its Drop`);
    if (r.safe) assert.deepEqual([d.ends, d.look], [{ kind: 'putback', to: 'take-off' }, 'water-art']);
    else assert.deepEqual([d.ends, d.look], [{ kind: 'life', cause: 'water' }, 'water-art']);
  }
});

test('checkStage holds every log river to riverFaults (planted: logs pulled out of step, a near bank cut under the board)', () => {
  const st = riverStage(W2_GROUND, ['deep'], 'normal');
  assert.ok(checkStage(st, st.gen2.budget).ok);
  const r = st.rivers![0];
  // logs out of step: the second log's offset moved half a spacing
  const bent: Gen2Stage = { ...st, platforms: st.platforms.map((p) => (p.drift && p.drift.x0 === r.x0 && p.id === st.platforms.find((q) => q.drift?.x0 === r.x0 && q !== st.platforms.find((z) => z.drift?.x0 === r.x0))!.id ? { ...p, drift: { ...p.drift, offset: p.drift.offset + 1.3 } } : p)) };
  assert.ok(checkStage(bent, st.gen2.budget).errors.some((e) => /river: .*not evenly spaced/.test(e)), 'uneven logs are named');
  // the near bank cut to 80 px (under RIVER_LAY.board): nowhere to wait for a log
  const cut: Gen2Stage = { ...st, platforms: st.platforms.map((p) => (p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 1 ? { ...p, x: r.x0 - 80, width: 80 } : p)) };
  assert.ok(checkStage(cut, st.gen2.budget).errors.some((e) => /river: .*of bank to wait on/.test(e)), 'a short bank is named');
});

// ───────────────────────── World 6's own kit (1h: the lay is world-neutral; not a ground row's numbers, the real kit) ─────────────────────────
test("World 6's own kit (6-2, its sections, its finish-free roll) lays a river section from World 2's rows, fair and clean on both settings", async () => {
  const { w6Kit } = await import('./worlds/w6.ts');
  const { generateAllLevels } = await import('../worldsData.ts');
  const cfg62 = generateAllLevels().find((l) => l.id === '6-2')!;
  const k6 = w6Kit(2);
  const k: WorldKit = { ...k6, manifest: { ...k6.manifest, rivers: W2_RIVERS, sections: [...k6.manifest.sections, riverSection(['ride', 'deep'], 'w6-toy-river')] } };
  for (const s of ['normal', 'easy'] as const) {
    let st: Gen2Stage | undefined;
    for (let seed = 1; seed <= 60 && !st; seed++) {
      const b = buildGen2Stage({ config: { ...cfg62, unlocked: true }, kit: k, seed, difficulty: s });
      if (b.rivers?.some((r) => r.speed > 0)) st = b;
    }
    assert.ok(st, `${s}: a roll of 1-60 lays the river`);
    const logRivers = st.rivers!.filter((r) => r.speed > 0);
    assert.equal(logRivers.length, 2);
    for (const r of logRivers) assert.ok(st.platforms.filter((p) => p.drift?.x0 === r.x0).length >= 3);
    assert.deepEqual(riverFaults(st), []);
    assert.deepEqual(st.gen2.errors.filter((e) => /river/.test(e)), [], `${s}: no river fault in the roll's errors`);
  }
});

// ───────────────────────── ENGINE-WORTHY 1: two World 1 verdicts read World 2's water (item 2; the lead's ruling 11-14) ─────────────────────────
test("drop.unwarned: painted water wants Dot's line at the FIRST water only, no sign; a dark void still wants both, every time (planted)", async () => {
  const { dropVerdicts } = await import('./verdicts.ts');
  const water = (x0: number, warn?: { dotLine: string; leadPx: number; sign: true }) => ({ x0, x1: x0 + 700, lipY: 580, ends: { kind: 'life', cause: 'water' }, look: 'water-art', ...(warn ? { warn } : {}) });
  const dot = { dotLine: "This river's deep. Stay on the logs!", leadPx: 800, sign: true as const };
  const judge = (drops: unknown[]) => dropVerdicts({ setting: 'normal', policy: 'per-gap', drops: drops as never }).filter((v) => v.name === 'drop.unwarned');
  assert.deepEqual(judge([water(2000, dot), water(4000), water(6000)]), [], 'the first warned, the rest painted: kept');
  const noDot = judge([water(2000), water(4000, dot)]);
  assert.equal(noDot.length, 1, 'the first water with no Dot line is named');
  assert.match(noDot[0].line, /first water at x 2000/);
  // (a dark drop is no painted water: Dot's line and the sign, every time)
  const dark = { x0: 3000, x1: 3300, lipY: 580, ends: { kind: 'life', cause: 'void' }, look: 'void-dark' };
  assert.equal(judge([water(2000, dot), dark]).length, 1, 'an unwarned dark drop is still named');
});

test('floor.unmarked: a gap laid AS water, or inside a river, is marked by its water; the same gap with no water is unmarked (planted)', async () => {
  const { floorlessGaps } = await import('./promises11.ts');
  const bank = (id: number, x: number, w: number) => ({ id, x, y: 580, width: w, height: 400, type: 'solid' as const });
  const platforms = [bank(1, 0, 1000), bank(2, 1300, 1000)];
  assert.equal(floorlessGaps({ platforms, heartFalls: [] } as never).length, 1, 'planted: the bare gap is unmarked');
  assert.deepEqual(floorlessGaps({ platforms, heartFalls: [], gen2: { falls: [{ x0: 1000, x1: 1300, y: 580, kind: 'water' }] } } as never), [], 'a water fall');
  assert.deepEqual(floorlessGaps({ platforms, heartFalls: [], rivers: [{ x0: 1000, x1: 1300 }] } as never), [], 'a river');
  assert.equal(floorlessGaps({ platforms, heartFalls: [], gen2: { falls: [{ x0: 1000, x1: 1300, y: 580, kind: 'soft' }] } } as never).length, 1, 'a soft fall is no water');
});
