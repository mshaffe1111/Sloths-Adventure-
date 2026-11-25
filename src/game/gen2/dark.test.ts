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
import { awakeLights, DARK_AHEAD, DARK_EMIT, DARK_GLOW, DARK_PROPS, DARK_ZONE, darkFlags, darkGaps, darkLandings, darkRims, entryPieces, litAhead, RimWatch, type DarkRim } from './dark.ts';
import type { Platform } from '../types.ts';
import type { StageSink } from './types.ts';
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

/** the cave mouth (the lead's ruling (ii), 11-25): the lights over the landings of the rims of each piece he reaches from outside the box */
function mouthLights(st: { platforms: readonly Platform[]; zones?: readonly Zone[] }, z: Zone) {
  const mouth = entryPieces(st.platforms, z);
  return new Set(darkRims({ platforms: st.platforms, zones: [z] }).filter((r) => r.light && mouth.has(r.piece)).map((r) => r.light!));
}

test("the brick on a real World 3 row, EVERY roll (1-40, both settings): 3-1's drops lie in the dark; every light inside the dark sleeps, EXCEPT the landings you reach from outside it: the cave mouth is lit; and the verdicts hold: darkGaps, darkFlags, darkLandings", () => {
  ready();
  for (let seed = 1; seed <= 40; seed++) for (const d of ['normal', 'easy'] as const) {
    setLayoutVariant(seed);
    let st;
    try { st = generateStage({ ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
    const dark = (st.zones ?? []).filter((z) => z.kind === 'dark');
    assert.ok(dark.length >= 3, `seed ${seed} ${d}: the drops lie in the dark (${dark.length} stretches)`);
    for (const z of dark) {
      // (awake: the cave mouth's (mouthLights, a subset) and the landings a run off a rim with no stop comes down too near (box 14))
      const awake = awakeLights(st.platforms, z), mouth = mouthLights(st, z);
      assert.ok([...mouth].every((l) => awake.has(l)), `seed ${seed} ${d}: the cave mouth is lit`);
      assert.ok(z.lights!.length && z.lights!.every((l) => l.id !== undefined), `seed ${seed} ${d}: every light is a glowworm with an id`);
      const wrong = z.lights!.filter((l) => !l.sleep !== awake.has(l));
      assert.deepEqual(wrong.map((l) => `${l.x},${l.y} ${l.sleep ? 'asleep at the cave mouth or a run-off landing' : 'awake inside the dark'}`), [], `seed ${seed} ${d}: every light sleeps but the cave mouth's and the run-off landings'`);
      assert.ok(z.lights!.some((l) => l.sleep), `seed ${seed} ${d}: a glowworm dark still (some light sleeps)`);
    }
    const ids = dark.flatMap((z) => z.lights!.map((l) => l.id));
    assert.equal(new Set(ids).size, ids.length, `seed ${seed} ${d}: every glowworm has its own id`);
    assert.ok(darkRims(st).length >= dark.length, `seed ${seed} ${d}: rims in the dark`);
    assert.deepEqual(darkGaps(st), [], `seed ${seed} ${d}`);
    assert.deepEqual(darkFlags(st), [], `seed ${seed} ${d}`);
    assert.deepEqual(darkLandings(st, d), [], `seed ${seed} ${d}`);
  }
});

test("the lay leaves every other stage as it was: a stage with no glowworm dark (World 1's, World 6's firefly dark) builds with no glowworm counter in its gen2 extras (lockall moved 37 stages' proto.gen2 when glowFlags wrote it everywhere)", () => {
  for (const id of ['1-1', '6-1']) for (const seed of [1, 2]) {
    setLayoutVariant(seed);
    let st;
    try { st = generateStage({ ...generateAllLevels().find((c) => c.id === id && !c.secret)!, unlocked: true }, 'normal'); } finally { setLayoutVariant(null); }
    const gen2 = (st as { proto?: { gen2?: Record<string, unknown> } }).proto?.gen2 ?? {};
    assert.ok(!Object.keys(gen2).some((k) => /glow/i.test(k)), `${id} seed ${seed}: gen2 extras ${JSON.stringify(Object.keys(gen2))}`);
  }
});

/** the draft's roll `seed` on `d`, built as the game builds it */
function built(seed: number, d: 'normal' | 'easy' = 'normal') {
  ready();
  setLayoutVariant(seed);
  try { return generateStage({ ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
}

/** (ENG-DARK box 14) a SHAPE toy's lay: the glowworm dark `z` of a real row laid again by the brick's own emitters (DARK_EMIT, its
 *  ends at the box's corners) over `platforms` (the real row's, a piece moved by hand), its box grown `deeper` px down */
function relay(z: Zone, platforms: Platform[], deeper: number): Zone {
  const out = { platforms, zones: [] as Zone[], extras: {}, enemies: [], collectibles: [], proto: {} } as unknown as StageSink;
  const at = (x: number, y: number) => ({ x, y }) as never;
  DARK_EMIT.darkFrom(at(z.x0, z.top + DARK_GLOW.above), undefined as never, out);
  DARK_EMIT.darkToGlow(at(z.x1, z.bottom - DARK_GLOW.below + deeper), undefined as never, out);
  return out.zones[0];
}
/** (ENG-DARK box 14) the SHAPE no real roll deals any more (ENG-DOWNBOT's lay, merged): a DEEP drop. Roll 1 Normal's first sleeping DROP
 *  rim whose landing piece, moved by hand to `drop` px under the rim (and `shift` px along), still takes his drop as a drop; with
 *  `floor`, a hand-laid floor that many px under that piece (so its own rims have landings in the dark); the dark laid again (relay) */
function deepDrop(drop: number, shift: (r: DarkRim) => number, floor: number | null, ok: (d: { stage: { platforms: Platform[]; zones: Zone[] }; rim: DarkRim; moved: Platform }) => boolean = () => true, seeds = 1) {
  for (let seed = 1; seed <= seeds; seed++) {
  const st = built(seed, 'normal');
  for (const z of st.zones ?? []) {
    if (z.kind !== 'dark' || !z.lights?.length) continue;
    for (const r of darkRims({ platforms: st.platforms, zones: [z] })) {
      if (!r.drop || !r.light?.sleep) continue;
      const moved: Platform = { ...r.onto, y: r.y + drop, x: r.onto.x + shift(r) };
      const under: Platform[] = floor === null ? [] : [{ ...r.onto, x: moved.x - 400, width: moved.width + 800, y: moved.y + floor }];
      const platforms = [...st.platforms.map((p) => (p === r.onto ? moved : p)), ...under];
      const zone = relay(z, platforms, Math.max(0, moved.y + (floor ?? 0) + 100 - (z.bottom - DARK_GLOW.below)));
      const rim = darkRims({ platforms, zones: [zone] }).find((q) => q.piece === r.piece && q.dir === r.dir);
      const d = rim?.onto === moved && rim.drop && rim.light?.sleep ? { stage: { platforms, zones: [zone] }, rim, moved } : null;
      if (d && ok(d)) return d;
    }
  }
  }
  return null;
}
const named = (r: { x: number; y: number }) => `the rim at x ${r.x}, y ${Math.round(r.y)} `;

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

test("RimWatch: a rim's piece he left some other way is no crossing when he later walks past its end on ground below it", () => {
  ready();
  const r = new RealPlay(DRAFT, 1, draftCfg());
  const rims = darkRims(r.stage);
  const watch = new RimWatch(rims);
  const e = r.e as unknown as Wakes;
  const lit = (l: { id?: number }) => e.glowWake.get(l.id!);
  // (a rim with a piece under it reaching past its end, a piece with no dark rim of its own (out of the dark, as the KID's was): he
  //  stands on the rim's piece, then on that lower piece, and walks past the rim's x)
  const pick = rims.map((rim) => ({ rim, under: r.stage.platforms.find((q) => q.y > rim.y + 100 && q.y < rim.y + 600 && (q.type === 'solid' || q.type === 'fragile') && !rims.some((o) => o.piece === q) && rim.x + rim.dir * 40 >= q.x + 10 && rim.x + rim.dir * 40 <= q.x + q.width - 10 && rim.x - rim.dir * 20 >= q.x && rim.x - rim.dir * 20 <= q.x + q.width) })).find((c) => c.under);
  assert.ok(pick, 'a rim with ground under it reaching past its end');
  const { rim, under } = pick!;
  r.stand(rim.x - rim.dir * 30, rim.y);
  for (let i = 0; i < 5; i++) { r.frame(); watch.step(e.gameTime, r.p, lit); }
  r.stand(rim.x - rim.dir * 20, under!.y);
  for (let i = 0; i < 20; i++) { r.frame(rim.dir > 0 ? { right: true } : { left: true }); watch.step(e.gameTime, r.p, lit); }
  assert.ok((r.p.x - rim.x) * rim.dir > 0 && Math.abs(r.p.y - under!.y) <= 2, `he walked past the rim's x on the ground below (${Math.round(r.p.x)},${Math.round(r.p.y)})`);
  assert.equal(watch.crossings.length, 0, watch.crossings.map((c) => `${c.rim.x},${c.rim.y}`).join(' '));
});

test("RimWatch: a climb down a trunk past a dark rim is its own kind ('climbed'), never 'went over', and 'lit 1 s ahead' does not count it; the same pass as a drop: RED", () => {
  // (the lead's ruling, 11-25: castBots x40 on ef811c2a, middle Easy roll 4, 112.80 s: standing 27 px in from a rim, pad down, he snapped
  //  53 px onto a trunk past it and climbed; RimWatch counted 'went over' with its landing dark. A climb is not a blind drop.)
  ready();
  const r = new RealPlay(DRAFT, 1, draftCfg());
  const rim = darkRims(r.stage).find((q) => q.light?.sleep);
  assert.ok(rim, 'a dark rim with a sleeping light on the real row');
  const pass = (climbing: boolean) => {
    const watch = new RimWatch([rim!]);
    const dark = () => undefined;
    watch.step(10, { x: rim!.x - rim!.dir * 27, y: rim!.y, grounded: true }, dark);
    watch.step(10.1, { x: rim!.x + rim!.dir * 26, y: rim!.y + 12, grounded: false, climbing }, dark);
    return watch.crossings;
  };
  const climbed = pass(true);
  assert.equal(climbed.length, 1, 'the pass is recorded');
  assert.equal(climbed[0].climbed, true, "its kind is 'climbed'");
  assert.deepEqual(litAhead(climbed, 'easy'), [], "'lit 1 s ahead' does not count a climb");
  const dropped = pass(false);
  assert.equal(dropped.length, 1);
  assert.equal(dropped[0].climbed, undefined, "a drop is 'went over'");
  assert.equal(litAhead(dropped, 'easy').length, 1, 'the same pass as a drop, its landing dark: RED');
});

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

test("the cave mouth is lit (ruling (ii)): adult Easy roll 30 drops in from OUTSIDE the dark (x 175) onto a piece whose rim light is laid awake: darkLandings GREEN; that entry landing asleep: RED, the drop named", () => {
  const st = built(30, 'easy');
  assert.deepEqual(darkLandings(st, 'easy'), []);
  const zones: Zone[] = (st.zones ?? []).map((z) => {
    if (z.kind !== 'dark' || !z.lights) return z;
    const mouth = mouthLights(st, z);
    return { ...z, lights: z.lights.map((l) => (mouth.has(l) ? { ...l, sleep: true } : l)) };
  });
  const red = darkLandings({ ...st, zones }, 'easy');
  assert.ok(red.some((m) => m.includes('the rim he left outside the dark: the rim at x 175, y 2190')), red.join('; ') || 'nothing named');
});

/** (ENG-DARK box 14) the hop rim's SHAPE: on Normal rolls 1-10, a hop rim in the dark whose step-off piece (the highest under a body's
 *  width out), moved by hand along so its back end lies 13 px behind his touchdown, is a sleeping rim no other light shows: the dark
 *  laid again (relay) with that piece moved; `own` the same lay with only the lights over the rims' own landings (no second lights) */
const HOP_FLOOR = 540;
function hopStep() {
  for (let seed = 1; seed <= 10; seed++) {
    const st = built(seed, 'normal');
    for (const z of st.zones ?? []) {
      if (z.kind !== 'dark' || !z.lights?.length) continue;
      for (const h of darkRims({ platforms: st.platforms, zones: [z] })) {
        if (h.drop) continue;
        const xs = h.x + h.dir * 24;
        let q: Platform | null = null;
        for (const p of st.platforms) if ((p.type === 'solid' || p.type === 'fragile') && p !== h.piece && xs >= p.x && xs <= p.x + p.width && p.y > h.y + 1 && p.y <= z.bottom && (!q || p.y < q.y)) q = p;
        if (!q) continue;
        const moved: Platform = { ...q, x: h.dir > 0 ? xs - 13 : xs + 13 - q.width };
        // (box 15: a hand floor HOP_FLOOR px under the step-off piece's back end, the wood between taken out, so that edge's own light
        //  hangs past the reach of a stop on the hop rim (GLOW_REACH.down): only the second light can light it. Without it, every hop
        //  rim of rolls 1-10 had that edge's own light near enough to wake with the stop, and no lay went RED without the second lights)
        const bx = h.dir > 0 ? moved.x : moved.x + moved.width, side = -h.dir;
        const lo = Math.min(bx, bx + side * 160), hi = Math.max(bx, bx + side * 160);
        const sq = q;
        const between = (p: Platform) => p !== sq && p !== h.piece && p.y > moved.y && p.y <= moved.y + HOP_FLOOR && p.x < hi && p.x + p.width > lo;
        const floor: Platform = { ...q, x: lo - 240, width: hi - lo + 480, y: moved.y + HOP_FLOOR };
        const platforms = [...st.platforms.filter((p) => !between(p)).map((p) => (p === q ? moved : p)), floor];
        const zone = relay(z, platforms, Math.max(0, floor.y + 100 - (z.bottom - DARK_GLOW.below)));
        const stage = { platforms, zones: [zone] };
        const hop = darkRims(stage).find((r) => r.piece === h.piece && r.dir === h.dir && !r.drop);
        const back = darkRims(stage).find((r) => r.piece === moved && r.dir === -h.dir && r.light?.sleep);
        if (!hop || !back) continue;
        const ownL = new Set(darkRims(stage).map((r) => r.light));
        const own = { platforms, zones: [{ ...zone, lights: zone.lights!.filter((l) => ownL.has(l)) }] };
        if (darkLandings(own, 'normal').some((m) => m.includes(named(hop)) && m.includes(`onto ${named(back)}`))) return { seed, stage, own, hop, back };
      }
    }
  }
  return null;
}

test("a hop rim's step-off landing is lit (the lead's ruling A, 11-25): a SHAPE toy on a real hop rim (hopStep): its step-off piece ends 13 px behind his touchdown; the lay's second light over that touchdown lights it (darkLandings GREEN); the lay without the second lights: RED, the hop rim named", () => {
  // (adult Normal roll 33's hop rim x 951, y 7644 stepping off onto 704-940 was the real row; on ENG-DOWNBOT's lay (merged, box 14) no
  //  hop rim of rolls 1-40 goes red without the second lights (probes/anchors.mts), so the toy is hand-built on a real hop rim)
  const h = hopStep();
  assert.ok(h, 'a hop rim whose step-off edge behind him no other light shows (rolls 1-10)');
  assert.deepEqual(darkLandings(h.stage, 'normal').filter((m) => m.includes(named(h.hop)) && m.includes(`onto ${named(h.back)}`)), []);
});

test("a RUN off a rim with no stop is judged where it lands (darkLandings (iii), ENG-DARK box 14): Normal roll 3 runs off x 442, y 5351 (no stop there) and comes down 36 px from the sleeping rim at x 214, y 5811; the lay wakes that light (GREEN); asleep again: RED, the running step off named", () => {
  // (the 3-1 trial merge of ENG-DOWNBOT: the adult Normal 12 ran off a ledge with no dark stop at 268 px/s, flew 92 px and landed 7 px
  //  from a sleeping rim, which he went over dark: 74 such crossings in 44 of 76 runs. darkLandings modelled only a slow step off)
  const st = built(3, 'normal');
  assert.deepEqual(darkLandings(st, 'normal'), []);
  const run = new Set<object>();
  for (const z of st.zones ?? []) if (z.kind === 'dark' && z.lights?.length) {
    const mouth = mouthLights(st, z);
    for (const l of awakeLights(st.platforms, z)) if (!mouth.has(l)) run.add(l);
  }
  assert.ok(run.size >= 1, 'the lay woke a light for a running step off');
  const zones: Zone[] = (st.zones ?? []).map((z) => (!z.lights ? z : { ...z, lights: z.lights.map((l) => (run.has(l) ? { ...l, sleep: true } : l)) }));
  const red = darkLandings({ ...st, zones }, 'normal');
  assert.ok(red.some((m) => m.includes('a running step off') && m.includes('the rim at x 442, y 5351') && m.includes('onto the rim at x 214, y 5811')), red.join('; ') || 'nothing named');
});

/** a dark rim with a sleeping light on the real row, and RimWatch fed by hand (the x40's crossing judge) */
function watchOne(frames: ReadonlyArray<{ dx: number; dy: number; grounded: boolean }>) {
  ready();
  const r = new RealPlay(DRAFT, 1, draftCfg());
  const rim = darkRims(r.stage).find((q) => q.light?.sleep)!;
  const watch = new RimWatch([rim]);
  frames.forEach((f, i) => watch.step(10 + i / 30, { x: rim.x + rim.dir * f.dx, y: rim.y + f.dy, grounded: f.grounded }, () => undefined));
  return watch.crossings;
}

test("RimWatch: a grounded slide on the edge grace that turns back is no going over (the lead's ruling, 11-25: child Easy 21 x 191 slid 2 px past and turned); a real step off still is", () => {
  const slide = watchOne([{ dx: -20, dy: 0, grounded: true }, { dx: -5, dy: 0, grounded: true }, { dx: 2, dy: 0, grounded: true }, { dx: 1, dy: 0, grounded: true }, { dx: -10, dy: 0, grounded: true }]);
  assert.equal(slide.length, 0, 'the grace slide is not counted');
  const off = watchOne([{ dx: -20, dy: 0, grounded: true }, { dx: 2, dy: 0, grounded: true }, { dx: 6, dy: 1, grounded: false }, { dx: 10, dy: 12, grounded: false }]);
  assert.equal(off.length, 1, 'leaving the ground past the rim is going over');
});

test("RimWatch: a jump UP over a rim onto higher ground is no crossing (the lead's ruling, 11-25: middle Easy 1 x 517 passed 161 px above it); the same jump coming down below the rim is", () => {
  const up = watchOne([{ dx: -30, dy: 0, grounded: true }, { dx: -10, dy: -60, grounded: false }, { dx: 5, dy: -161, grounded: false }, { dx: 30, dy: -130, grounded: false }, { dx: 45, dy: -108, grounded: true }]);
  assert.equal(up.length, 0, 'the jump up onto higher ground');
  const down = watchOne([{ dx: -30, dy: 0, grounded: true }, { dx: -10, dy: -60, grounded: false }, { dx: 5, dy: -161, grounded: false }, { dx: 30, dy: -20, grounded: false }, { dx: 40, dy: 30, grounded: false }]);
  assert.equal(down.length, 1, 'the jump that comes down into the dark below');
  assert.equal(down[0].t, 10 + 2 / 30, 'counted at the pass');
});

test("a wall rim's light hangs no deeper than a stop on the rim reaches (GLOW_REACH.down): a SHAPE toy, a deep drop on a real rim (deepDrop): its light hangs within the reach and a stop wakes it (darkGaps GREEN); its light hung over the landing as before, past the reach: RED", () => {
  // (Normal roll 21's wall-side rim at x 24 was the real row; on ENG-DOWNBOT's lay (merged, box 14) no roll 1-40 has a drop deeper than a
  //  stop's reach (probes/anchors.mts), so the toy is hand-built: roll 1's first sleeping drop rim, its landing piece moved to 560 px under it)
  // (560 px: past the stop's reach (GLOW_REACH.down + DARK_ZONE.lightUp), the light hung at the reach still reaching the landing)
  const d = deepDrop(560, () => 0, null);
  assert.ok(d, 'a deep drop on a real rim');
  const { stage, rim } = d;
  assert.ok(rim.land.y - DARK_ZONE.lightUp > rim.y + GLOW_REACH.down, `the landing lies past the reach (${Math.round(rim.land.y - rim.y)} px down)`);
  assert.ok(rim.light!.y <= rim.y + GLOW_REACH.down, `its light ${Math.round(rim.light!.y - rim.y)} px under the rim`);
  assert.deepEqual(darkGaps(stage).filter((m) => m.includes(named(rim))), []);
  const deep = { ...rim.light!, y: rim.land.y - DARK_ZONE.lightUp };
  const zones: Zone[] = stage.zones.map((z) => ({ ...z, lights: z.lights!.map((l) => (l === rim.light ? deep : l)) }));
  const red = darkGaps({ ...stage, zones });
  assert.ok(red.some((m) => m.includes(`a sleeping light no stop wakes: ${named(rim)}`)), red.join('; ') || 'nothing named');
});

test("an edge BEHIND a dark-rim drop's landing is no edge he lands toward (the lead's ruling (i)): a SHAPE toy, a deep drop on a real rim whose landing piece ends 13 px behind his touchdown, out of that drop's light: darkLandings GREEN; that edge judged as one he lands toward: RED (the plant)", () => {
  // (ENG-DARK box 13: no real row decides the exemption (probes/behind.mts, rolls 1-12); the lead's ruling (box 14): a hand-built SHAPE
  //  toy on a real rim. The drop is deep (deepDrop: 640 px), so the light over its landing hangs at the stop's reach, out of that edge's reach)
  // (640 px: the light hung at the stop's reach (GLOW_REACH.down) hangs 220 px over his landing, past its radius from that edge 13 px
  //  behind (box 15: at 608 px it hung 188 px over it, and a 190 px light 188 px up reaches an edge 13 px aside: no rim held the shape);
  //  the floor 400 px under the landing piece gives that edge its own landing, its light out of the stop's reach)
  // (box 15: on roll 1's first sleeping drop rim the light nearest that landing was another rim's, 90 px over it, and it reached that
  //  edge: the builder now takes the first real drop rim of rolls 1-10 whose shape holds (deepDrop's check))
  const behind = (q: { stage: { platforms: Platform[]; zones: Zone[] }; rim: DarkRim; moved: Platform }) => {
    const b = darkRims(q.stage).find((m) => m.piece === q.moved && m.dir === -q.rim.dir);
    return !!b?.light?.sleep && Math.hypot(q.rim.light!.x - b.x, q.rim.light!.y - b.y) > q.rim.light!.r;
  };
  const d = deepDrop(640, (r) => (r.dir > 0 ? r.x + 24 - 13 - r.onto.x : r.x - 24 + 13 - r.onto.width - r.onto.x), 400, behind, 10);
  assert.ok(d, 'a deep drop on a real rim');
  const { stage, rim, moved } = d;
  const back = darkRims(stage).find((q) => q.piece === moved && q.dir === -rim.dir);
  assert.ok(back?.light?.sleep, "the landing piece's back end is a sleeping rim");
  assert.equal(Math.round((back.x - (rim.x + rim.dir * 24)) * back.dir), 13, 'it lies 13 px behind his touchdown');
  assert.ok(Math.hypot(rim.light!.x - back.x, rim.light!.y - back.y) > rim.light!.r, "the drop's own light does not reach it");
  assert.deepEqual(darkLandings(stage, 'normal').filter((m) => m.includes(named(rim)) && m.includes(`onto ${named(back)}`)), []);
});
