/**
 * World 2's gen2 kit (ENG-W2, 11-14; gen2/worlds/w2.ts): 2-1 and 2-2 rolled the way the game rolls them (stageGenerator generateStage:
 * their stage-table rows, World 2's kit and World 2's finish), on both settings. The kit's art is World 2's own from the inventory and
 * in scale with Pokey; every piece is drawn by World 2's art (terrain.ts footingsFor, the engine's own call); every fall is a river with
 * a bank at each end, splash-back where the fall is soft and deep where it is water; the first deep river is flagged and warned in the
 * keeper's words; the arc is laid beat for beat; the hand-built 2-1 and 2-2 are gone.
 * Planted faults: reference/qa-reports/ENG-W2/planted-faults.py (each one turns a named test here red).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateStage, builtOnGen2 } from '../../stageGenerator.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { footingsFor } from '../../terrain.ts';
import { surfaceBelowBank, type RiverZone } from '../../river.ts';
import { W2_STAGES } from '../../w2Stages.ts';
import { listedStage, worldFinish } from '../listed.ts';
import { STAGE_TABLE } from './stageTable.ts';
import { W2_ART, W2_TIPS, w2Finish } from './w2.ts';

/** World 2's stages whose look, rivers and ponds this file holds to World 2's rules (2-1 holds its own in w2Arc21.test.ts) */
const W2_GEN2_STAGES = ['2-2'];
import type { Collectible, Platform } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = (id: string) => generateAllLevels().find((c) => c.id === id && !c.secret)!;
type Built = {
  platforms: Platform[]; collectibles: Collectible[]; rivers?: RiverZone[]; checkpoints?: Array<{ x: number; y: number }>; config: { levelWidth: number };
  proto?: { hints?: Array<{ x: number; text: string }>; mixDress?: unknown[]; decor?: Array<{ n?: string; x: number; front?: boolean }>; gen2?: { waterWarnings?: Array<{ x: number; y: number }> } };
  gen2: { errors?: string[]; sections: Array<{ template: string; x0: number; x1: number }>; falls?: Array<{ x0: number; x1: number; y: number; kind: string }> };
};
const memo = new Map<string, Built>();
/** the stage as the game builds it (its row, its kit, World 2's finish, the game's shared passes) */
function built(id: string, d: 'normal' | 'easy'): Built {
  const k = `${id}:${d}`;
  if (!memo.has(k)) memo.set(k, generateStage(cfg(id), d) as unknown as Built);
  return memo.get(k)!;
}
const BOTH = ['normal', 'easy'] as const;

test('the kit: every World 2 art row it names is in the World 2 inventory, usable and in scale with Pokey (R-165.107)', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(root, 'src/game/art/inventory/w2.json'), 'utf8')) as { cols: string[]; rows: unknown[][] };
  const rows = new Map(inv.rows.map((r) => { const o = Object.fromEntries(inv.cols.map((c, i) => [c, r[i]])) as { id: string; status: string; worlds: number[]; scale_ok: boolean | null }; return [o.id, o]; }));
  for (const [job, ids] of Object.entries(W2_ART)) for (const id of ids) {
    const r = rows.get(id);
    assert.ok(r, `${job}: ${id} is not in the World 2 inventory`);
    assert.ok(r.worlds.includes(2), `${job}: ${id} does not fit World 2`);
    assert.ok(!r.status.startsWith('needs fix'), `${job}: ${id} waits on a fix (${r.status})`);
    assert.notEqual(r.scale_ok, false, `${job}: ${id} is out of scale with Pokey`);
  }
});

test('the rows: 2-1 and 2-2 roll from their own kits over World 2\'s, with World 2\'s finish; the hand-built 2-1 and 2-2 and the placeholder arcs are gone (new replaces old)', () => {
  assert.equal(STAGE_TABLE['2-1']?.kit, 'w2-21', "2-1's row names its own kit, World 2's with 2-1's rows (w2Arc21.ts)");
  assert.equal(STAGE_TABLE['2-2']?.kit, 'w2-22', "2-2's row names its own kit, World 2's with 2-2's rows (w2Arc22.ts)");
  for (const id of ['2-1', '2-2']) {
    const row = listedStage(id)!;
    assert.equal(row.kit().manifest.world, 2);
    assert.equal(worldFinish(row), row.world, `${id}: its world finish is its kit's own`);
    assert.equal(W2_STAGES[id], undefined, `${id}: the hand-built plan is deleted`);
    assert.ok(builtOnGen2(cfg(id)), `${id}: the game builds it on gen2`);
    assert.ok(!row.kit().manifest.sections.some((t) => t.id.startsWith(`w2-${id}-`)), `${id}: no placeholder brick is left in its pool`);
  }
});

test('the look: every piece is drawn by World 2 art as the engine draws it (no World 1 cut piece, no squirrels)', () => {
  // (the crown lily is drawn by the pad piece from World 2's painted pieces: Matt's Victoria pad M-02-a and ART-W2's crown flower, riverArt.ts
  // drawCrownLily, BUILD-22)
  const allowed = new Set(['ground', 'pillar', 'painted rock', 'river art', 'painted-bank', 'step', 'own art (crownLily)']);
  for (const id of W2_GEN2_STAGES) for (const d of BOTH) {
    const st = built(id, d);
    const f = footingsFor(st as never, 2);
    for (const p of st.platforms) {
      const drawn = f.get(p.id)!.drawn;
      assert.ok(allowed.has(drawn), `${id} ${d}: piece ${p.id} (${p.style}, ${p.height} px) is drawn as ${drawn}`);
      assert.equal((p as { cut?: string }).cut, undefined, `${id} ${d}: piece ${p.id} carries World 1's cut art`);
    }
    assert.equal(st.proto?.mixDress, undefined, `${id} ${d}: World 1's dressing (the squirrels) is not World 2's`);
    // (World 2's reeds stand at the rivers' edges, behind him: none drawn in front, where it hid him on a bank's edge)
    const reeds = (st.proto?.decor ?? []).filter((q) => q.n?.startsWith('reed'));
    assert.ok(reeds.length >= (st.rivers ?? []).length / 2, `${id} ${d}: ${reeds.length} reeds`);
    assert.ok(!reeds.some((q) => q.front), `${id} ${d}: a reed drawn in front of him`);
  }
});

test('the rivers: every fall is a river with a bank at each end; soft falls splash him back, water falls are deep', () => {
  for (const id of W2_GEN2_STAGES) for (const d of BOTH) {
    const st = built(id, d);
    const falls = (st.gen2.falls ?? []).filter((f) => f.kind === 'soft' || f.kind === 'water');
    const rv = st.rivers ?? [];
    assert.equal(rv.length, falls.length, `${id} ${d}: a river for every fall`);
    assert.ok(rv.some((r) => r.safe) && rv.some((r) => !r.safe), `${id} ${d}: both kinds`);
    for (const f of falls) {
      const r = rv.find((q) => q.x0 === f.x0 && q.x1 === f.x1)!;
      assert.ok(r, `${id} ${d}: the fall at ${f.x0} has its river`);
      assert.equal(!!r.safe, f.kind === 'soft', `${id} ${d}: the river at ${f.x0} is ${f.kind === 'soft' ? 'splash-back' : 'deep'}`);
      const near = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 2 && p.y + surfaceBelowBank === r.surfaceY || (p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 2 && p.y <= r.surfaceY));
      const far = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x - r.x1) <= 2 && p.y <= r.surfaceY);
      assert.ok(near && far, `${id} ${d}: the river at ${r.x0} has a bank at each end`);
      // (nothing stands under a splash-back river's water: the splash sets him back before he could reach it, and it would be drawn over the water)
      if (r.safe) {
        // (a pond's own floors stand ON its water, never under it: its pads, the crown lily and its stones, at the pad line 8 px over the
        // surface (rideLay PAD_LAY.drop); anything else, or lower, is under the water, BUILD-22)
        const pondFloor = (p: Platform) => r.speed === 0 && (!!p.pad || p.art === 'crownLily' || (p.style === 'moss_stone' && Math.abs(p.y - (r.surfaceY - 8)) <= 1));
        assert.ok(!st.platforms.some((p) => p.type === 'solid' && !pondFloor(p) && p.x < r.x1 - 1 && p.x + p.width > r.x0 + 1 && p.y > r.surfaceY - surfaceBelowBank), `${id} ${d}: a piece under the splash-back river at ${r.x0}`);
        assert.ok(st.platforms.some((p) => p.type === 'solid' && p.x <= r.safe!.backX && p.x + p.width >= r.safe!.backX && p.y === r.safe!.backY), `${id} ${d}: set back on the bank he left`);
      }
    }
  }
});

test("the first deep river: a flag before it and Dot's warning in the keeper's words (lines-2-1.md `deep`, verbatim)", () => {
  assert.equal(W2_TIPS.water, "This river's deep. Don't touch the water!");
  for (const id of W2_GEN2_STAGES) for (const d of BOTH) {
    const st = built(id, d);
    const deep = (st.rivers ?? []).filter((r) => !r.safe).sort((a, b) => a.x0 - b.x0)[0];
    const flags = (st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b);
    assert.ok(flags.some((x) => x < deep.x0), `${id} ${d}: a flag before the first deep river at ${deep.x0}`);
    const warn = (st.proto?.hints ?? []).find((h) => h.text === W2_TIPS.water);
    assert.ok(warn && warn.x < deep.x0, `${id} ${d}: Dot warns before the first deep river`);
    assert.ok((st.proto?.gen2?.waterWarnings ?? []).some((s) => s.x <= deep.x0 && s.x >= deep.x0 - 120), `${id} ${d}: the sign stands at its edge`);
    // (and no warning before a splash-back river: they cost nothing)
    assert.ok(!(st.rivers ?? []).some((r) => r.safe && r.x0 < deep.x0 && (st.proto?.hints ?? []).some((h) => h.text === W2_TIPS.water && h.x >= r.x0 - 600 && h.x < r.x0)), `${id} ${d}: a warning before a splash-back river`);
  }
});

test('the finish: a fall with no bank at one end throws (such a roll is never listed); a second call changes nothing', () => {
  const st = { platforms: [{ id: 1, x: 0, y: 580, width: 300, height: 90, type: 'solid' }] as Platform[], gen2: { falls: [{ x0: 300, x1: 420, y: 580, kind: 'water' }] } };
  assert.throws(() => w2Finish(st), /no bank at one end/);
  const ok = { platforms: [{ id: 1, x: 0, y: 580, width: 300, height: 90, type: 'solid' }, { id: 2, x: 420, y: 580, width: 300, height: 90, type: 'solid' }] as Platform[], gen2: { falls: [{ x0: 300, x1: 420, y: 580, kind: 'soft' }] } };
  const once = JSON.stringify(w2Finish(ok));
  assert.equal(JSON.stringify(w2Finish(ok)), once);
  assert.equal((ok as { rivers?: RiverZone[] }).rivers?.[0].safe?.backX, 230);
});

// ENG-GROUND-b, the join of the out-and-back toy (2-7's shape): a run of falls joined by planks (thin pieces over the water between them)
// is ONE river under a bridge, bank to bank, at one surface. Laid pocket by pocket, its water showed in slices between the planks with
// the backdrop under each plank, and the pocket between two planks stood 20 higher than its neighbours. Every roll of both toys, both
// settings: no plank stands between two pockets; every plank over a river's water has the same river under its whole width, its foot
// over the surface; the river's splash-back is on the bank he came from; every water fall has its river at its height (under the out
// leg's log river a race-leg fall had none: the finish matched rivers by x only). Planted RED on 0f5ca9999 (16 of 16 rolls: plankscan-16.txt).
const { buildGen2Stage } = await import('../pipeline.ts');
const { TOWER } = await import('../tower.ts');
const { towerCfg } = await import('../toyTower.ts');
const { homeKit, POST_CODE, HOME_CODE } = await import('../toyHome.ts');
/** ENG-GROUND-d, the lead's ruling (B): on a stage that lays a run leg under another, a soft gap between two thin pieces over the lower
 *  leg's floor is left open (its water could only hang in mid-air between the planks over that floor). Stated here, not read from the
 *  code under test: the run legs laid wholly under another (his height clear), and a gap whose two lips are thin pieces with a floor of
 *  such a leg (its top in the leg's band) under its whole width */
type LegBox = { travel: string; x0: number; x1: number; y0: number; y1: number };
function openOverFloor(st: { platforms: Platform[]; gen2: { tower?: { legs?: LegBox[] } } }, f: { x0: number; x1: number; y: number; kind: string }): boolean {
  if (f.kind !== 'soft') return false;
  const run = (st.gen2.tower?.legs ?? []).filter((l) => l.travel === 'left' || l.travel === 'right');
  const lows = run.filter((l) => run.some((u) => u !== l && Math.min(u.x1, l.x1) - Math.max(u.x0, l.x0) > 0 && l.y0 >= u.y1 + 48));
  const solid = st.platforms.filter((p) => p.type === 'solid' && !p.broken);
  const lip = (p: Platform) => Math.abs(p.y - f.y) <= 160;
  const near = solid.filter((p) => Math.abs(p.x + p.width - f.x0) <= 2 && lip(p)), far = solid.filter((p) => Math.abs(p.x - f.x1) <= 2 && lip(p));
  if (!near.length || !far.length || near.some((p) => p.height >= 90) || far.some((p) => p.height >= 90)) return false;
  return lows.some((l) => solid.some((p) => p.y >= l.y0 - 2 && p.y <= l.y1 + 2 && p.x <= f.x0 + 1 && p.x + p.width >= f.x1 - 1));
}
test('World 2 finish: planks between falls are a bridge over ONE river, bank to bank (the out-and-back toy, every roll, both settings)', () => {
  const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
  const bad: string[] = [];
  let bridges = 0;
  for (const [name, code] of [['post', POST_CODE], ['home', HOME_CODE]] as const)
    for (const difficulty of ['normal', 'easy'] as const)
      for (let seed = 1; seed <= 4; seed++) {
        const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', code), seed, difficulty }) as never, difficulty) as unknown as { platforms: Platform[]; rivers: RiverZone[]; gen2: { falls: Array<{ x0: number; x1: number; y: number; kind: string }> } };
        const at = `${name} ${difficulty} seed ${seed}`;
        // (every water fall has its river AT ITS HEIGHT: under the out leg's log river the race leg's falls had none)
        // (but a soft gap between two thin pieces over a lower leg's floor, left open by the ruling (B): its own test below)
        for (const f of st.gen2.falls)
          if ((f.kind === 'water' || f.kind === 'soft') && !openOverFloor(st as never, f) && !st.rivers.some((r) => r.x0 <= f.x0 + 2 && r.x1 >= f.x1 - 2 && r.surfaceY > f.y - 20 && r.surfaceY < f.y + 260))
            bad.push(`${at}: the fall x ${f.x0}..${f.x1} (lip ${f.y}) has no water`);
        for (const p of st.platforms) {
          if (p.broken || p.type !== 'solid' || p.height >= 90) continue;
          const l = st.rivers.find((r) => Math.abs(r.x1 - p.x) <= 4 && r.surfaceY > p.y && r.surfaceY - p.y < 120);
          const r = st.rivers.find((r) => Math.abs(r.x0 - (p.x + p.width)) <= 4 && r.surfaceY > p.y && r.surfaceY - p.y < 120);
          if (l && r) bad.push(`${at}: plank x ${Math.round(p.x)} stands between two pockets (surfaces ${Math.round(l.surfaceY)} | ${Math.round(r.surfaceY)})`);
          const under = st.rivers.find((z) => z.x0 < p.x - 1 && z.x1 > p.x + p.width + 1 && z.surfaceY > p.y && z.surfaceY - p.y < 120);
          if (!under) continue;
          bridges++;
          if (p.y + p.height > under.surfaceY) bad.push(`${at}: plank x ${Math.round(p.x)} has its foot in the water`);
          // (the river runs bank to bank: a bank of earth at each end, its top over the water)
          const bank = (x: number) => st.platforms.find((q) => q.type === 'solid' && q.height >= 90 && Math.abs((x === under.x0 ? q.x + q.width : q.x) - x) <= 2 && q.y < under.surfaceY);
          if (!bank(under.x0) || !bank(under.x1)) bad.push(`${at}: the river under plank x ${Math.round(p.x)} (${Math.round(under.x0)}..${Math.round(under.x1)}) has no bank at one end`);
          if (under.safe && !(under.safe.backX < under.x0 || under.safe.backX > under.x1)) bad.push(`${at}: the splash-back is in the river`);
        }
      }
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} faults`);
  assert.ok(bridges >= 16, `the toy's bridges over one river (${bridges} planks)`);
});

// ENG-GROUND-d, the lead's ruling (B): the toy's descent comes down over the race leg's floor by thin stairs, and its soft gaps were filled
// with water from the stairs' height. Each pool lay under the next stair down (he could never reach it) and its paint ran to the view's
// foot as a column over the floor he walks (the lead's painted still, right end sideways); lidded at its bed it hung as a box of water
// between the planks. A soft gap between two thin pieces over a lower leg's floor is left open: no water, and a drop through it, at either
// lip and its middle, lands on wood within the live fall rule going down (tower.ts towerFalls: TOWER.see, a landing he can see), never in
// water. Every roll of both toys, both settings. Planted RED on 8a903ba10: reference/qa-reports/ENG-GROUND/red-d3.txt.
test('World 2 finish: a soft gap between two thin pieces over a lower leg\'s floor is left open, its drop onto wood within the fall rule (the out-and-back toy, every roll, both settings)', () => {
  const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
  const bad: string[] = [];
  let open = 0;
  for (const [name, code] of [['post', POST_CODE], ['home', HOME_CODE]] as const)
    for (const difficulty of ['normal', 'easy'] as const)
      for (let seed = 1; seed <= 4; seed++) {
        const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', code), seed, difficulty }) as never, difficulty) as unknown as { platforms: Platform[]; rivers: RiverZone[]; gen2: { falls: Array<{ x0: number; x1: number; y: number; kind: string }>; tower?: { legs?: LegBox[] } } };
        const at = `${name} ${difficulty} seed ${seed}`;
        for (const f of st.gen2.falls) {
          if (!openOverFloor(st, f)) continue;
          open++;
          const wet = st.rivers.filter((r) => r.x1 > f.x0 + 2 && r.x0 < f.x1 - 2 && r.surfaceY > f.y - 20 && r.surfaceY < f.y + 400);
          if (wet.length) bad.push(`${at}: the gap x ${f.x0}..${f.x1} (lip ${f.y}) is filled (surface ${Math.round(wet[0].surfaceY)})`);
          for (const x of [f.x0 + 8, (f.x0 + f.x1) / 2, f.x1 - 8]) {
            const land = Math.min(...st.platforms.filter((p) => p.type !== 'fragile' && !p.broken && x >= p.x && x <= p.x + p.width && p.y > f.y + 1).map((p) => p.y));
            const splash = st.rivers.find((r) => x >= r.x0 && x <= r.x1 && r.surfaceY > f.y && r.surfaceY < land);
            if (!(land - f.y <= TOWER.see)) bad.push(`${at}: a drop at x ${Math.round(x)} through the gap x ${f.x0}..${f.x1} falls ${Number.isFinite(land) ? Math.round(land - f.y) : 'out'} (the fall rule: ${TOWER.see})`);
            else if (splash) bad.push(`${at}: a drop at x ${Math.round(x)} through the gap lands in water`);
          }
        }
      }
  assert.ok(open >= 16, `the toy's descent has its soft gaps over the race leg's floor (${open})`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} faults`);
});

// ENG-W2FIN (R-165.431, release 4's CI line): a fall over a water wheel's sweep (place `wheel`) runs from the jetty's lip to the sweep's
// far end at the street's height; the street stands over the jetty and reaches in over the top by design, so the fall has no bank at the
// far end and its water is the wheel's pond, a wheel's height under its lip (wheelLay.ts layWheel). The finish's height rule (2-7,
// ENG-GROUND-b) read it as a fall with no river and threw 'no bank at one end' on every wheel (wheelChannel.test's four, the 2-6 draft).
// The wheel's own fall takes its pond as its river (no new river over the sweep, nothing taken out); any OTHER fall over the pond in x
// (another storey's) is still held to its own height and its own banks. Hand-built from the one wheel lay, every row, both settings,
// both ways round. Planted RED on 0077c62c6: reference/qa-reports/ENG-W2FIN/red.txt.
const { layWheel, streetFromJetty, wheelSpan, wheelFaults } = await import('../wheelLay.ts');
const { W2_WHEELS } = await import('./w2.ts');
type WheelFall = { x0: number; x1: number; y: number; kind: string };
/** a wheel laid between its jetty and its street, the way pipeline.ts lays place `wheel` (its gap: the jetty's lip to the sweep's far end
 *  or the street, whichever is further, at the street's height), turned `way` */
function wheelToy(row: keyof typeof W2_WHEELS, d: 'normal' | 'easy', way: 1 | -1) {
  const R0 = W2_WHEELS[row];
  const at = streetFromJetty(R0, d);
  const jetty: Platform = { id: 1, x: way > 0 ? 1000 : 3000, y: 2000, width: 300, height: 24, type: 'solid' };
  const lip = way > 0 ? jetty.x + jetty.width : jetty.x;
  const street: Platform = { id: 2, x: way > 0 ? lip + at.dx : lip - at.dx - 340, y: jetty.y + at.dy, width: 340, height: 24, type: 'solid' };
  let id = 10;
  const laid = layWheel(R0, row, jetty, street, d, () => id++);
  const len = Math.max(at.dx, wheelSpan(R0, d, 0, jetty.y).x1);
  const fall: WheelFall = { x0: way > 0 ? lip : lip - len, x1: way > 0 ? lip + len : lip, y: street.y, kind: 'soft' };
  return { jetty, street, laid, fall, st: { platforms: [jetty, street, ...laid.buckets], rivers: [laid.zone], gen2: { falls: [fall] as WheelFall[] } } };
}
const WHEEL_ROWS = Object.keys(W2_WHEELS) as Array<keyof typeof W2_WHEELS>;
test("World 2 finish: a fall over a water wheel's sweep takes the wheel's pond as its river (every row, both settings, both ways round)", () => {
  const bad: string[] = [];
  for (const row of WHEEL_ROWS) for (const d of ['normal', 'easy'] as const) for (const way of [1, -1] as const) {
    const at = `${row} ${d} way ${way}`;
    const { st, laid } = wheelToy(row, d, way);
    const n = st.platforms.length;
    try { w2Finish(st as never, d); } catch (e) { bad.push(`${at}: ${(e as Error).message}`); continue; }
    if (st.rivers.length !== 1 || st.rivers[0] !== laid.zone) bad.push(`${at}: ${st.rivers.length} rivers over the sweep (only the wheel's pond belongs there)`);
    if (st.platforms.length !== n) bad.push(`${at}: ${n - st.platforms.length} pieces taken out`);
    const faults = wheelFaults(st, d);
    if (faults.length) bad.push(`${at}: ${faults[0]}`);
  }
  assert.deepEqual(bad, []);
});
test("World 2 finish: another storey's fall over a wheel's pond is still held to its own height and its own banks (2-7's height rule)", () => {
  const bad: string[] = [];
  for (const row of WHEEL_ROWS) for (const d of ['normal', 'easy'] as const) for (const way of [1, -1] as const) {
    const at = `${row} ${d} way ${way}`;
    const { st, laid, fall } = wheelToy(row, d, way);
    // (a storey 600 over the street, its soft fall inside the pond in x: its banks earth (90 deep), one each side)
    const y = fall.y - 600, x0 = Math.round((fall.x0 + fall.x1) / 2) - 60, x1 = x0 + 120;
    const up = [{ id: 3, x: x0 - 300, y, width: 300, height: 90, type: 'solid' }, { id: 4, x: x1, y, width: 300, height: 90, type: 'solid' }] as Platform[];
    const withBanks = { ...st, platforms: [...st.platforms, ...up], rivers: [laid.zone], gen2: { falls: [fall, { x0, x1, y, kind: 'soft' }] } };
    w2Finish(withBanks as never, d);
    const own = withBanks.rivers.filter((r) => r !== laid.zone);
    if (own.length !== 1 || own[0].x0 !== x0 || own[0].x1 !== x1 || own[0].surfaceY !== y + surfaceBelowBank) bad.push(`${at}: the upper fall's river ${JSON.stringify(own.map((r) => [r.x0, r.x1, r.surfaceY]))}, not its own at its height (${x0}-${x1}, ${y + surfaceBelowBank})`);
    // (and with no far bank it throws: the pond under it is not its river)
    const noBank = { ...st, platforms: [...st.platforms, up[0]], rivers: [laid.zone], gen2: { falls: [fall, { x0, x1, y, kind: 'soft' }] } };
    try { w2Finish(noBank as never, d); bad.push(`${at}: an upper fall with no far bank over the pond did not throw`); } catch (e) { if (!/no bank at one end/.test((e as Error).message)) bad.push(`${at}: ${(e as Error).message}`); }
  }
  assert.deepEqual(bad, []);
});
