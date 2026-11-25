/**
 * THE DARK as one gen2 brick (gen2/dark.ts, ENG-DARK, R-165.449; WORLD-3-PLAN F2), proven on a REAL row (level.md rule 23): World 3's
 * first stage drafted down (stageTable.ts DRAFT_TABLE '3-1', readied as the tools ready it), its drops laid in the glowworms' dark.
 *   - the brick: World 6's dark is the one lifted (its names are this file's), every drop's rim in the dark has a sleeping light over
 *     its landing that a stop on the rim's own piece wakes (darkGaps, both settings);
 *   - THE WAKE REACHES BELOW, BOUNDED (zones.ts GLOW_REACH up / down, glowReaches): in the real engine, a stop at a rim wakes the light
 *     over its landing under him, and NOT one in the shaft far below (3-1.md: read by x alone, one stop lit the whole shaft);
 *   - 'every gap lit 1 s ahead' (litAhead, GAME-MAP B9): walked off the rim at once, its landing still dark: RED; stood still until the
 *     landing woke and a second more, then walked off: GREEN.
 * Planted faults: reference/qa-reports/ENG-DARK/planted-faults.py (each one turns a named test here red).
 */
import '../headlessDom.ts';
import { readied, readyDraft } from '../../../tools/engine/draft.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../realPlay.ts';
import { GLOW_REACH, glowReaches, keepsClear, type Zone } from '../zones.ts';
import { DARK_AHEAD, DARK_EMIT, DARK_PROPS, darkFlags, darkGaps, darkRims, litAhead, RimWatch, type DarkRim } from './dark.ts';
import { W6S_EMIT, W6S_PROPS } from './worlds/w6Swing.ts';
import { generateAllLevels } from '../worldsData.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';

const DRAFT = '3-1';
const ready = () => { if (readied !== DRAFT) readyDraft(DRAFT); };
/** the readied draft's own config (RealPlay's level list was built at load, before the draft was readied) */
const draftCfg = () => { ready(); return { ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }; };
type Wakes = { glowWake: Map<number, number>; gameTime: number };

test('the brick: World 6 lays the one lifted dark (its props and emitters ARE gen2/dark.ts\'s)', () => {
  assert.equal(W6S_PROPS, DARK_PROPS);
  assert.equal(W6S_EMIT, DARK_EMIT);
});

test('the brick on a real World 3 row: 3-1\'s drops lie in the dark, every rim\'s landing has a sleeping light a stop on its piece wakes (darkGaps), seeds 1-4 both settings', () => {
  ready();
  for (const seed of [1, 2, 3, 4]) for (const d of ['normal', 'easy'] as const) {
    setLayoutVariant(seed);
    let st;
    try { st = generateStage({ ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
    const dark = (st.zones ?? []).filter((z) => z.kind === 'dark');
    assert.ok(dark.length >= 3, `seed ${seed} ${d}: the drops lie in the dark (${dark.length} stretches)`);
    assert.ok(dark.every((z) => z.lights!.length && z.lights!.every((l) => l.sleep && l.id !== undefined)), `seed ${seed} ${d}: every light is a sleeping glowworm with an id`);
    const ids = dark.flatMap((z) => z.lights!.map((l) => l.id));
    assert.equal(new Set(ids).size, ids.length, `seed ${seed} ${d}: every glowworm has its own id`);
    assert.ok(darkRims(st).length >= dark.length, `seed ${seed} ${d}: rims in the dark`);
    assert.deepEqual(darkGaps(st), [], `seed ${seed} ${d}`);
    assert.deepEqual(darkFlags(st), [], `seed ${seed} ${d}`);
  }
});

/** the draft's roll `seed` on `d`, built as the game builds it */
function built(seed: number, d: 'normal' | 'easy' = 'normal') {
  ready();
  setLayoutVariant(seed);
  try { return generateStage({ ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
}

test("ruling A: the glowworms' dark is the grotto's air: 3-1's first draft roll builds with its flags standing in it (the fireflies' dark keeps the rule)", () => {
  const st = built(1);
  const glow = (st.zones ?? []).filter((z) => z.kind === 'dark' && !keepsClear(z));
  assert.ok(glow.length, 'a glowworm dark');
  const inDark = (st.checkpoints ?? []).filter((c) => glow.some((z) => c.x >= z.x0 && c.x <= z.x1 && c.y >= z.top && c.y <= z.bottom));
  assert.ok(inDark.length >= 3, `flags stand in the glowworms' dark (${inDark.length})`);
  // (the fireflies' dark, Worlds 6 and 8, keeps 'nothing stands inside')
  assert.equal(keepsClear({ kind: 'dark', lights: [{ x: 0, y: 0, r: 190 }] }), true);
  assert.equal(keepsClear({ kind: 'dark', lights: [{ x: 0, y: 0, r: 190, sleep: true, id: 1 }] }), false);
});

test("darkFlags: a flag in the glowworms' dark with no glow lit within 1 s of standing at it: RED (its glowworms taken away); the roll as laid: GREEN", () => {
  const st = built(1);
  assert.deepEqual(darkFlags(st), []);
  const glow = (st.zones ?? []).filter((z) => z.kind === 'dark' && !keepsClear(z));
  const c = (st.checkpoints ?? []).find((q) => glow.some((z) => q.x >= z.x0 && q.x <= z.x1 && q.y >= z.top && q.y <= z.bottom))!;
  // (every glowworm within 600 px of the flag hung 2000 px lower, out of any stop's reach: still a glowworm dark, no glow near the flag)
  const zones: Zone[] = (st.zones ?? []).map((z) => (z.kind === 'dark' && z.lights ? { ...z, lights: z.lights.map((l) => (Math.hypot(l.x - c.x, l.y - c.y) <= 600 ? { ...l, y: l.y + 2000 } : l)) } : z));
  const red = darkFlags({ ...st, zones });
  assert.ok(red.some((m) => m.includes(`x ${Math.round(c.x)}, y ${Math.round(c.y)}`)), red.join('; ') || 'no flag named');
});

/** a drop rim in the dark on seed 1 whose landing is 110-420 px under it, and a sleeping light far below it in the wake's old reach */
function shaftRim(r: RealPlay): { rim: DarkRim; far: { x: number; y: number; id?: number } } {
  const lights = (r.stage.zones ?? []).filter((z) => z.kind === 'dark').flatMap((z) => z.lights ?? []);
  for (const rim of darkRims(r.stage)) {
    const drop = rim.land.y - rim.y;
    if (!rim.light?.sleep || drop < 110 || drop > 420) continue;
    const sx = rim.x - rim.dir * 30;
    // (old reach: by x alone, from where he stands; far: 600 px and more under his feet)
    const far = lights.find((l) => l.y - rim.y >= 600 && (l.x - sx) * rim.dir >= -GLOW_REACH.back && (l.x - sx) * rim.dir <= GLOW_REACH.ahead);
    if (far) return { rim, far };
  }
  throw new Error('no drop rim with a light far below it');
}

test('the wake reaches below, bounded: a stop at a real rim wakes the light over its landing under him, never one in the shaft far below (one dark over the whole shaft: the reach bounds it, not a stretch\'s box)', () => {
  ready();
  const r = new RealPlay(DRAFT, 1, draftCfg());
  const { rim, far } = shaftRim(r);
  // (every stretch's glowworms in ONE dark over the whole way down: a long shaft laid as one stretch, as 3-1's beat 8 is)
  const zs: Zone[] = r.e.currentStage.zones!;
  const dark = zs.filter((z) => z.kind === 'dark');
  const one: Zone = { ...dark[0], x0: Math.min(...dark.map((z) => z.x0)), x1: Math.max(...dark.map((z) => z.x1)), top: Math.min(...dark.map((z) => z.top)), bottom: Math.max(...dark.map((z) => z.bottom)), lights: dark.flatMap((z) => z.lights ?? []) };
  r.e.currentStage.zones = [...zs.filter((z) => z.kind !== 'dark'), one];
  r.stand(rim.x - rim.dir * 30, rim.y);
  r.p.facing = rim.dir;
  r.wait(GLOW_REACH.fade + 1.2);
  const e = r.e as unknown as Wakes;
  assert.ok(r.p.grounded && Math.abs(r.p.y - rim.y) <= 2, `he stood on the rim's piece (y ${r.p.y} vs ${rim.y})`);
  assert.ok(e.glowWake.has(rim.light!.id!), `the landing's light ${Math.round(rim.land.y - rim.y)} px under the rim woke`);
  assert.ok(!e.glowWake.has(far.id!), `a light ${Math.round(far.y - rim.y)} px under him stayed asleep`);
  // (and every light that woke is inside the reach, up and down)
  const all = (r.stage.zones ?? []).flatMap((z) => z.lights ?? []);
  for (const id of e.glowWake.keys()) {
    const l = all.find((q) => q.id === id)!;
    assert.ok(glowReaches(l, r.p.x, r.p.y, rim.dir), `light ${id} at y ${l.y} woke from feet ${Math.round(r.p.y)}`);
  }
});

/** stand him at the rim, wait `wait` s, then walk off it; the rim crossings his run made */
function walkOff(wait: number) {
  const r = new RealPlay(DRAFT, 1, draftCfg());
  const { rim } = shaftRim(r);
  const e = r.e as unknown as Wakes;
  const watch = new RimWatch(darkRims(r.stage));
  const lit = (l: { id?: number }) => e.glowWake.get(l.id!);
  r.stand(rim.x - rim.dir * 30, rim.y);
  r.p.facing = rim.dir;
  for (let i = 0; i < Math.round(wait * 30); i++) { r.frame(); watch.step(e.gameTime, r.p, lit); }
  for (let i = 0; i < 60 && !watch.crossings.length; i++) { r.frame(rim.dir > 0 ? { right: true } : { left: true }); watch.step(e.gameTime, r.p, lit); }
  return { rim, crossings: watch.crossings, at: `rim ${rim.x},${rim.y} dir ${rim.dir}; he ended at ${Math.round(r.p.x)},${Math.round(r.p.y)} ${r.p.grounded ? 'grounded' : 'in the air'}` };
}

test("'every gap lit 1 s ahead' (litAhead): walked off a dark rim at once, before its landing's light: RED", () => {
  ready();
  const { rim, crossings, at } = walkOff(0);
  assert.equal(crossings.length, 1, `he went over one rim (${at})`);
  assert.equal(crossings[0].rim.piece, rim.piece);
  const red = litAhead(crossings, 'normal');
  assert.equal(red.length, 1, red.join('; '));
  assert.match(red[0], /landing dark/);
});

test("'every gap lit 1 s ahead' (litAhead): stood still until the landing woke and a second more, then walked off: GREEN on Normal; Easy asks 1.6 s", () => {
  ready();
  const { crossings } = walkOff(0.7 + 0.2 + DARK_AHEAD.normal + 0.1);
  assert.equal(crossings.length, 1);
  assert.ok(crossings[0].litAt !== undefined, 'its light woke while he stood');
  assert.deepEqual(litAhead(crossings, 'normal'), []);
  assert.equal(litAhead(crossings, 'easy').length, 1, 'the same wait is short of Easy\'s 1.6 s');
});
