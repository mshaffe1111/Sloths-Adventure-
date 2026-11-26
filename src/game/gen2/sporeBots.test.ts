/**
 * THE SPORE PUFF'S LIGHT, ITS TOY (ENG-SPORE, R-165.449; ADR-004; level.md rules 21 and 23: a new piece proven on a planted toy on a REAL
 * row). World 3's first stage drafted down (stageTable.ts DRAFT_TABLE '3-1'); on its roll 1 (Normal) the dark DROP rim at the left end of
 * 846-1099 (y 927) comes down 194 px onto 607-830, which reaches 239 px past the rim with nothing between (probes/drops.mts: the draft's
 * clean way-down drops, nothing under a full run's carry, are 156-194 px on rolls 1-12, none at 240; 3-1.md lays puff shelves 160-320 px
 * down; roll 1's 195 px drop at 613 has a piece 65 px under it that a running drop lands on, roll 3's 217 px one a shelf a run carries
 * past). That shelf is given a spore puff by the
 * brick's own builders (gen2/spore.ts sporeZoneOn, and the
 * light gen2/dark.ts glowZone hangs for a puff: puffLight), in place of its glowworm, on 3-1's beat (zones.ts SPORE: 6.4 s, warn 1.0,
 * active 2.2), so the landing is lit only over the puff's warning and cloud (3.2 s of 6.4).
 *   - the bot, put 30 px from the rim with the puff dark, stands until the light has been lit DARK_AHEAD, drops, and lands in light (GREEN);
 *   - flown from a stand 30 px from the rim at 128 points of the cycle, a press that sees the landing lit lands in light 38-42% of it
 *     (3-1.md's row 'A drop on a puff's light');
 *   - PLANT the light off (a clock never lit): the bot waits at the rim forever (RED), and darkGaps names the rim (RED);
 *   - PLANT no warn: levelCheck's fairness verdict refuses the puff (RED).
 * No stage, seed or x lives in engine code: the row's numbers live here, in the toy.
 */
import '../headlessDom.ts';
import { readied, readyDraft } from '../../../tools/engine/draft.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clockLitAt, SPORE, sporeRecipes, type Zone } from '../zones.ts';
import { DARK_EMIT, DARK_GLOW, DARK_ZONE, darkGaps, darkRims, litAhead, type DarkRim, type RimCrossing } from './dark.ts';
import type { StageSink } from './types.ts';
import { puffLight, sporeZoneOn } from './spore.ts';
import { validateStage } from '../levelCheck.ts';
import type { GeneratedStage } from '../stageGenerator.ts';

const DRAFT = '3-1', SEED = 1, RIM = { x: 846, y: 927, dir: -1 } as const;
const ready = () => { if (readied !== DRAFT) readyDraft(DRAFT); };
type Light = NonNullable<Zone['lights']>[number];

/** the row's rim, and its landing's glowworm turned into the shelf's puff (the brick's builders; offset 0: dark until 3.2 s) */
function plantPuff(stage: GeneratedStage, spec: { warn?: number } = {}, lightOff = false, roll = 0): { rim: DarkRim; puff: Zone; light: Light } {
  const rim = darkRims(stage as never).find((q) => q.x === RIM.x && Math.round(q.y) === RIM.y && q.dir === RIM.dir);
  assert.ok(rim?.drop && rim.light?.sleep, `the draft's roll ${SEED} has its dark drop at (${RIM.x}, ${RIM.y}), its landing's light asleep`);
  const puff = sporeZoneOn(rim.onto, spec, () => roll);
  stage.zones!.push(puff);
  const light = rim.light!;
  delete light.id;
  delete light.sleep;
  Object.assign(light, puffLight(puff, rim.land.x, DARK_ZONE.lightUp, DARK_GLOW.light));
  if (lightOff) light.clock!.len = 0;
  return { rim, puff, light };
}

/** the bot put 30 px from the rim (facing over it) at 0.5 s, the puff planted first; the run's crossings and his touchdown on the shelf */
async function run(lightOff: boolean, cap: number, roll = 0) {
  ready();
  const { firstTimer, FT_ADULT } = await import('../../../tools/inspect/firsttimer.ts');
  let p: ReturnType<typeof plantPuff> | undefined, put = false, landT: number | undefined, crossings: RimCrossing[] = [], end = { x: 0, y: 0 }, landAt = { x: 0, y: 0 };
  firstTimer(DRAFT, SEED, { ...FT_ADULT, setting: 'normal' }, { cap, onFrame(sim, b) {
    if (!p) {
      p = plantPuff(sim.stage, {}, lightOff, roll);
      // (his dark rims read again from the planted stage, as a stage laid with the puff gives them: glowRimsOf's clocked rims)
      (b as { glowRims?: unknown }).glowRims = undefined;
    }
    if (!put && sim.e.gameTime > 0.5) {
      put = true;
      (b as { placeAt(x: number, y: number): void }).placeAt(p.rim.x - RIM.dir * 30, p.rim.y);
      sim.p.facing = RIM.dir;
    }
    const w = (b as { rimWatch?: { crossings: RimCrossing[] } | null }).rimWatch;
    crossings = (w?.crossings ?? []).filter((c) => c.rim.piece === p!.rim.piece && c.rim.dir === RIM.dir);
    if (crossings.length && landT === undefined && sim.p.grounded) { landT = sim.e.gameTime; landAt = { x: Math.round(sim.p.x), y: Math.round(sim.p.y) }; }
    end = { x: sim.p.x, y: sim.p.y };
  } });
  return { p: p!, crossings, landT, end, landAt };
}

test("the puff's light: put at the rim with the puff dark, the bot stands until it has been lit 1 s, drops, and lands in light (GREEN)", async () => {
  const r = await run(false, 14);
  assert.ok(r.crossings.length >= 1, 'he went over the rim onto the puff shelf');
  const c = r.crossings[0];
  assert.ok(c.litAt !== undefined && c.t - c.litAt >= 1, `seen lit 1 s ahead (lit at ${c.litAt}, went at ${c.t.toFixed(2)})`);
  assert.ok(c.t > 3.2 + 1, `he waited for the puff (dark until 3.2 s); went at ${c.t.toFixed(2)} s`);
  assert.deepEqual(litAhead(r.crossings, 'normal'), []);
  assert.ok(Math.abs(r.landAt.y - r.p.rim.onto.y) <= 4, `he came down on the puff shelf (${r.landAt.x}, ${r.landAt.y}; the shelf ${Math.round(r.p.rim.onto.x)}-${Math.round(r.p.rim.onto.x + r.p.rim.onto.width)} at ${Math.round(r.p.rim.onto.y)})`);
  assert.ok(r.landT !== undefined && clockLitAt(r.p.light.clock!, r.landT) !== undefined, `he landed in light (${r.landT?.toFixed(2)} s, went ${r.crossings[0].t.toFixed(2)})`);
});

test("put at the rim as the puff's window is closing (lit 2.8 s, 0.4 s left: less than the way down): he does not drop into it; he waits for the next window and lands in light (GREEN)", async () => {
  // (the beat's offset 5.5 s: the window closes at 0.9 s and opens again at 4.1 s)
  const r = await run(false, 14, 5.5 / 6.4);
  assert.ok(r.crossings.length >= 1, 'he went over the rim onto the puff shelf');
  assert.ok(r.crossings[0].t > 4.1 + 1, `he waited for the next window (opens 4.1 s); went at ${r.crossings[0].t.toFixed(2)} s`);
  assert.ok(r.landT !== undefined && clockLitAt(r.p.light.clock!, r.landT) !== undefined, `he landed in light (${r.landT?.toFixed(2)} s)`);
});

test("PLANT the puff's light off: the bot waits at the rim forever (RED), and darkGaps names the rim (RED)", async () => {
  const r = await run(true, 14);
  assert.equal(r.crossings.length, 0, 'never over the rim');
  assert.ok(Math.abs(r.end.y - r.p.rim.y) <= 4 && Math.abs(r.end.x - r.p.rim.x) <= 90, `still standing at the rim at 14 s (${Math.round(r.end.x)}, ${Math.round(r.end.y)})`);
});

test("the laid row's verdicts: darkGaps keeps the puff's 3.2 s window; the light off, it names the rim; no warn, levelCheck refuses the puff (RED)", async () => {
  ready();
  const { generateAllLevels } = await import('../worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../stageGenerator.ts');
  const build = () => { setLayoutVariant(SEED); try { return generateStage({ ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }, 'normal'); } finally { setLayoutVariant(null); } };
  const named = (m: string) => m.includes(`x ${RIM.x}, y ${RIM.y}`);
  const kept = build();
  const { puff } = plantPuff(kept);
  assert.deepEqual(darkGaps(kept).filter(named), [], 'lit 3.2 s, 1 s ahead + the drop: kept');
  assert.deepEqual(validateStage(kept).errors.filter((e) => e.startsWith(`spore zone at x=${Math.round(puff.x0)}`)), [], 'the puff on its beat: fair');
  const off = build();
  plantPuff(off, {}, true);
  assert.ok(darkGaps(off).some((m) => named(m) && m.includes('clocked light too short')), 'the light off: named');
  const nowarn = build();
  const q = plantPuff(nowarn, { warn: 0 });
  assert.ok(validateStage(nowarn).errors.some((e) => e.startsWith(`spore zone at x=${Math.round(q.puff.x0)}`) && e.includes('warning of 0s is too short')), 'no warn: refused');
});

test("the bot's wait for a clocked light REMOVED (noGlowWait, rule 21's plant): put at the rim with the puff dark, he drops on the dark (RED)", async () => {
  ready();
  const { firstTimer, FT_ADULT } = await import('../../../tools/inspect/firsttimer.ts');
  let p: ReturnType<typeof plantPuff> | undefined, put = false, crossings: RimCrossing[] = [];
  firstTimer(DRAFT, SEED, { ...FT_ADULT, setting: 'normal', noGlowWait: true }, { cap: 8, onFrame(sim, b) {
    p ??= plantPuff(sim.stage);
    if (!put && sim.e.gameTime > 0.5) { put = true; (b as { placeAt(x: number, y: number): void }).placeAt(p.rim.x - RIM.dir * 30, p.rim.y); sim.p.facing = RIM.dir; }
    crossings = ((b as { rimWatch?: { crossings: RimCrossing[] } | null }).rimWatch?.crossings ?? []).filter((c) => c.rim.piece === p!.rim.piece && c.rim.dir === RIM.dir);
  } });
  assert.ok(crossings.length >= 1, 'he went over the rim');
  assert.equal(litAhead(crossings, 'normal').length, 1, "'lit 1 s ahead' names the drop");
});

test("flown (3-1.md 'A drop on a puff's light'): from a stand 30 px from the rim, a press that sees the landing lit lands in light 38-42% of the cycle", async () => {
  ready();
  const { RealPlay } = await import('../realPlay.ts');
  const sim = new RealPlay(DRAFT, SEED);
  const { rim, light } = plantPuff(sim.stage);
  const c = light.clock!, N = 128;
  let good = 0, worst = 0;
  const travel: number[] = [];
  for (let k = 0; k < N; k++) {
    sim.stand(rim.x - RIM.dir * 30, rim.y);
    sim.p.facing = RIM.dir;
    for (let f = 0; f < 6; f++) sim.frame({});
    // (the puff's beat set so this press falls k/N into its cycle)
    const t0 = sim.e.gameTime;
    c.offset = ((((k / N) * c.period - t0) % c.period) + c.period) % c.period;
    const sees = clockLitAt(c, t0) !== undefined;
    let landT: number | undefined;
    for (let f = 0; f < 60 && landT === undefined; f++) {
      sim.frame(RIM.dir > 0 ? { right: true } : { left: true });
      if (sim.p.grounded && sim.p.y > rim.y + 4) landT = sim.e.gameTime;
    }
    assert.ok(landT !== undefined && Math.abs(sim.p.y - rim.onto.y) <= 4, `press ${k}: down on the shelf (at ${Math.round(sim.p.x)}, ${Math.round(sim.p.y)}, grounded ${sim.p.grounded}, t ${landT})`);
    travel.push(landT! - t0);
    if (sees && clockLitAt(c, landT!) !== undefined) good++;
  }
  // (the worst wait: from the end of one run of good presses to the start of the next, as a share of the cycle)
  const share = good / N;
  worst = c.period * (1 - share);
  const air = travel.reduce((a, b) => a + b, 0) / N;
  console.log(`flown: ${good}/${N} presses land in light (${(share * 100).toFixed(1)}% of the cycle), press to touchdown ${air.toFixed(2)} s, worst wait ${worst.toFixed(2)} s`);
  assert.ok(share >= 0.38 && share <= 0.43, `lands in light ${(share * 100).toFixed(1)}% of the cycle`);
});

test("the brick lays it: the recipe is zones.ts's data (SPORE, 3-1's beat), and the glowworms' dark the brick lays over a puff shelf hangs the puff's clocked light over that landing, no glowworm", async () => {
  assert.deepEqual([SPORE.period, SPORE.warn, SPORE.active], [6.4, 1.0, 2.2]);
  const r1 = sporeRecipes(1)[0];
  assert.deepEqual([r1.period, r1.warn, r1.active], [SPORE.period, SPORE.warn, SPORE.active], "the old generator's 3-1 recipe IS SPORE");
  ready();
  const { generateAllLevels } = await import('../worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../stageGenerator.ts');
  setLayoutVariant(SEED);
  let st: GeneratedStage;
  try { st = generateStage({ ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }, 'normal'); } finally { setLayoutVariant(null); }
  const rim = darkRims(st as never).find((q) => q.x === RIM.x && Math.round(q.y) === RIM.y && q.dir === RIM.dir)!;
  const z = st.zones!.find((q) => q.kind === 'dark' && q.x0 <= rim.x && q.x1 >= rim.x && q.top <= rim.y && q.bottom >= rim.land.y)!;
  assert.ok(z, 'the rim lies in a glowworms\' dark');
  // (the dark laid again by the brick's own emitters over the row, the shelf's puff laid first as a section's zone is)
  const puff = sporeZoneOn(rim.onto, {}, () => 0.5);
  const out = { platforms: st.platforms, zones: [puff] as Zone[], extras: {}, enemies: [], collectibles: [], proto: {} } as unknown as StageSink;
  DARK_EMIT.darkFrom({ x: z.x0, y: z.top + DARK_GLOW.above } as never, undefined as never, out);
  DARK_EMIT.darkToGlow({ x: z.x1, y: z.bottom - DARK_GLOW.below } as never, undefined as never, out);
  const dark = out.zones.find((q) => q.kind === 'dark')!;
  const lit = darkRims({ platforms: st.platforms, zones: [dark] }).find((q) => q.x === RIM.x && Math.round(q.y) === RIM.y && q.dir === RIM.dir)!;
  assert.ok(lit.light?.clock, "the drop's landing is lit by the puff's clocked light");
  assert.deepEqual(lit.light.clock, { period: 6.4, from: 3.2, len: 3.2, offset: puff.offset }, 'it glows over warn + active (3.2 s of 6.4), on the puff\'s own beat');
  assert.ok(lit.light.id === undefined && !lit.light.sleep, 'no glowworm: no id, never asleep');
  assert.equal(dark.lights!.filter((l) => Math.abs(l.x - rim.land.x) < 70 && Math.abs(l.y - (rim.land.y - DARK_ZONE.lightUp)) < 70 && !l.clock).length, 0, 'no glowworm over the shelf');
  assert.deepEqual(darkGaps({ platforms: st.platforms, zones: [dark] }).filter((m) => m.includes(`x ${RIM.x}, y ${RIM.y}`)), []);
});
