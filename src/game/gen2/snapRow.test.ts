/**
 * SNAP STONES (ENG-25; 2-5.md NEW 1): a 'snap' pad row as gen2 lays it (rideLay.ts layPads, place `pads`), its bar (snapClock), its
 * fairness (snapFaults: every rule planted on a built row and named), its window against 2-5.md's flight, and in the real engine (RealPlay,
 * pieces/padPiece.ts): solid always, a bite only while its bar is on four (out of its creak), a heart that HOLDS him (no knock into the
 * river), the jaw's count 1-4 for the drawer. World-neutral: the toy kit's ground, World 2's finish.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, keptFoes } from './pipeline.ts';
import { layPads, padFaults, snapClock, snapFaults, snapWindow, SNAP_FAIR, SNAP_LAY, type PadRow } from './rideLay.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from './toyWorld.ts';
import { withTestStage } from './listed.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { w2Finish } from './worlds/w2.ts';
import { RealPlay, withFixtureConfig } from '../realPlay.ts';
import { padShows, snapCount } from '../pieces/padPiece.ts';
import { brickCount } from '../beatBrick.ts';
import { snapFrame, SNAP_ART } from '../snapStoneArt.ts';
import { beatAt, beatOf, checkClock } from '../clock.ts';
import { setDifficulty } from '../difficulty.ts';
import type { SectionTemplate, WorldKit } from './types.ts';
import type { LevelConfig, Platform } from '../types.ts';

const ROWS = {
  step: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75 } },
  wave: { by: 'snap', pads: ['snap', 'snap', 'snap', 'stone', 'snap'], gap: 30, snap: { count: 0.75, wave: true } },
  /** a TEACHING row (R-165.337, the lead's ruling 11-20: a teach never costs a heart): its bite jolts and holds, no heart */
  teach: { by: 'snap', pads: ['snap'], gap: 30, snap: { count: 0.75 }, safe: true, freeBite: true },
} as const satisfies Record<string, PadRow>;

test('the bar: four counts, the bite the fourth, out of a creak at the end of the third; Easy stretches it; the count reads 1-4', () => {
  const d = snapClock('snap-x', { count: 0.75 });
  assert.deepEqual(d.phases.map((p) => [p.name, p.seconds]), [['off', 1.75], ['warn', SNAP_LAY.warn], ['on', 0.75]]);
  assert.deepEqual(checkClock(d), []);
  const b = beatOf(d, false);
  assert.deepEqual([0.1, 0.8, 1.6, 2.1, 2.3, 2.99].map((t) => brickCount(b, beatAt(b, t))), [1, 2, 3, 3, 4, 4]);
  const e = beatOf(d, true);
  assert.equal(e.period, 4.5, 'Easy: the bar x1.5');
  assert.deepEqual([0.1, 1.2, 2.3, 3.4].map((t) => brickCount(e, beatAt(e, t))), [1, 2, 3, 4]);
});

test('the lay: a snap row is stones 80 px wide, solid, painted by the pad piece, biting on the row\'s bar; a wave each a count later', () => {
  let id = 1;
  const step = layPads(ROWS.step, 'step', 1000, 800, () => id++);
  assert.equal(step.pads.length, 3);
  for (const p of step.pads) {
    assert.equal(p.width, SNAP_LAY.w);
    assert.equal(p.type, 'solid');
    assert.equal(p.art, 'snapStone');
    assert.deepEqual({ ...p.pad, shift: p.pad!.shift ?? 0 }, { by: 'beat', on: 'bites', clock: 'snap-step', look: 'snap', shift: 0 });
  }
  assert.deepEqual(step.pads.map((p, i) => p.x - (i ? step.pads[i - 1].x + SNAP_LAY.w : 1000)), [30, 30, 30], '30 px of water each side (SNAP_FAIR.gap\'s low end, ENG-25c)');
  assert.deepEqual(step.clocks.map((c) => c.id), ['snap-step']);
  const wave = layPads(ROWS.wave, 'wave', 1000, 800, () => id++);
  assert.deepEqual(wave.pads.map((p) => (p.pad ? p.pad.shift ?? 0 : 'rest')), [0, -0.75, -1.5, 'rest', -2.25], 'the wave runs ahead, across a rest');
  assert.throws(() => layPads({ by: 'snap', pads: ['snap', 'small'], gap: 40, snap: { count: 0.75 } } as PadRow, 'bad', 0, 800, () => id++), /lays only/);
  assert.throws(() => layPads({ by: 'snap', pads: ['snap'], gap: 40 } as PadRow, 'bad', 0, 800, () => id++), /no bar/);
});

test('the window against 2-5.md\'s flight (out/snapClock-*.txt): within 0.05 s, never over it', () => {
  const d = (c: number) => snapClock('w', { count: c }, 1.5);
  const at = (n: number, c: number, wave: boolean, easy: boolean) => snapWindow(d(c), Array.from({ length: n }, (_, i) => (wave ? -i * c : 0)), easy);
  // [n, count, wave, easy, flown window (s)]
  for (const [n, c, wave, easy, flown] of [[1, 0.75, false, false, 2.27], [3, 0.75, false, false, 1.40], [3, 0.6, false, false, 0.93], [5, 0.75, false, false, 0.53], [3, 0.75, true, false, 1.63], [5, 0.75, true, false, 1.0], [3, 0.75, true, true, 2.0], [5, 0.75, true, true, 0.63]] as const) {
    const w = at(n, c, wave, easy);
    assert.ok(w <= flown + 1e-6 && flown - w <= 0.05, `${n} ${wave ? 'wave' : 'in step'} count ${c} ${easy ? 'Easy' : 'Normal'}: ${w} s vs flown ${flown}`);
  }
});

/** a built stage with one pond of this row (the toy kit, the game's own pipeline) */
const ID = '2-95';
const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };
const pond = (row: string): SectionTemplate => ({
  id: `toy-snap-${row}`, name: 'snap stones', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
    { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'pads', after: 'near', row }, main: true, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
});
const kitOf = (rows: Record<string, PadRow>, row: string): WorldKit => ({
  ...toyKit,
  manifest: { ...toyKit.manifest, world: 2, pads: rows, creatures: [], props: [], pairs: [], tips: {}, sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop') }, pond(row)] },
});
function built(rows: Record<string, PadRow>, row: string) {
  const kit = kitOf(rows, row);
  for (let seed = 1; seed <= 40; seed++) {
    const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
    if (st.platforms.some((p) => p.pad?.on === 'bites')) return { st, kit, seed };
  }
  throw new Error(`no roll lays ${row}`);
}

test('snapFaults: the toy rows are fair on a built stage; padFaults leaves snap stones to it (one model per rule)', () => {
  for (const row of Object.keys(ROWS)) {
    const { st } = built(ROWS, row);
    assert.deepEqual(snapFaults(st), [], row);
    assert.deepEqual(padFaults(st), [], `${row}: padFaults does not judge a snap stone's 80 px by a lily's 124`);
    assert.deepEqual((st.gen2.errors ?? []).filter((e) => /snap|pads/.test(e)), [], `${row}: the stage's wet verdict passes`);
  }
});

test('snapFaults: each rule, planted on a built pond, is caught and names itself', () => {
  const plant = (row: PadRow, edit?: (ps: Platform[]) => void) => {
    const { st } = built({ p: row }, 'p');
    const ps = st.platforms.map((p) => ({ ...p, ...(p.pad ? { pad: { ...p.pad } } : {}) }));
    edit?.(ps.filter((p) => p.pad?.on === 'bites'));
    return snapFaults({ ...st, platforms: ps }).join(' | ');
  };
  assert.match(plant({ by: 'snap', pads: ['snap', 'snap', 'snap', 'snap'], gap: 40, snap: { count: 0.75 } }), /4 stones in step .* over 3/);
  assert.match(plant({ by: 'snap', pads: ['snap', 'snap'], gap: 60, snap: { count: 0.75 } }), /60 px of water .* not 30-40/);
  assert.match(plant({ by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 40, snap: { count: 0.75 } }, (s) => { s[1].pad!.shift = 0.75; }), /wave runs back at him/);
  assert.match(plant({ by: 'snap', pads: ['snap', 'snap'], gap: 40, snap: { count: 0.75 } }, (s) => { s[0].width = 100; }), /100 px wide, not the flown 80/);
  assert.match(plant({ by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 40, snap: { count: 0.5 } }), /window to leave the bank on Normal, under 0.9/);
  assert.match(plant({ by: 'snap', pads: ['snap', 'snap', 'snap', 'snap', 'snap'], gap: 40, snap: { count: 0.75, wave: true } }), /Easy's window .* under Normal's/);
  assert.match(plant({ by: 'snap', pads: ['snap'], gap: 40, snap: { count: 0.75, warn: 0.3 } }), /warn of 0.3 s is under the 0.5/);
  // (2-5.md's own rows lay fair: the teach, the practice, the quickening, Easy's wave of 3 and Normal's wave of 5 on Normal's own window)
  assert.equal(plant({ by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 40, snap: { count: 0.6 } }), '', 'the quickening (3 in step at 0.6)');
  assert.equal(plant({ by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75, wave: true } }), '', 'a wave of 3');
});

test("snapFaults by setting (BUILD-25): a Normal build skips Easy's comparison (its Easy twin is what Easy plays); an Easy build, and a call with no setting, still judge it", () => {
  const { st } = built({ p: { by: 'snap', pads: ['snap', 'snap', 'snap', 'snap', 'snap'], gap: 40, snap: { count: 0.75, wave: true } } }, 'p');
  const easyLine = /Easy's window .* under Normal's/;
  assert.doesNotMatch(snapFaults(st, 'normal').join(' | '), easyLine, 'Normal: its row is never played on Easy');
  assert.match(snapFaults(st, 'easy').join(' | '), easyLine, 'Easy: the row it lays is judged against Normal');
  assert.match(snapFaults(st).join(' | '), easyLine, 'no setting: both');
});

/** a section with two snap ponds in a row, each on its own row (near, mid, far) */
const twoPonds = (a: string, b: string): SectionTemplate => ({
  id: 'toy-snap-two', name: 'two snap ponds', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
    { key: 'mid', shape: 'bank', w: [300, 300], place: { kind: 'pads', after: 'near', row: a }, main: true, landing: true },
    { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'pads', after: 'mid', row: b }, main: true, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
});
function builtTwo(rows: Record<string, PadRow>) {
  const kit: WorldKit = { ...kitOf(rows, 'a'), manifest: { ...kitOf(rows, 'a').manifest, sections: [...kitOf(rows, 'a').manifest.sections.filter((q) => !q.id.startsWith('toy-snap-')), twoPonds('a', 'b')] } };
  for (let seed = 1; seed <= 40; seed++) {
    const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
    if (st.platforms.filter((p) => p.pad?.on === 'bites').length === 2) return st;
  }
  throw new Error('no roll lays the two ponds');
}

test('PadRow.clock (BUILD-25, 2-5.md "one count for the whole river"): two rows naming one clock keep ONE bar; two bars under one name throw; unnamed, each row its own', () => {
  const one = { by: 'snap', pads: ['snap'], gap: 30, snap: { count: 0.75 }, clock: 'river' } as const satisfies PadRow;
  const st = builtTwo({ a: one, b: one });
  assert.deepEqual(st.platforms.filter((p) => p.pad?.on === 'bites').map((p) => p.pad!.clock), ['snap-river', 'snap-river']);
  assert.deepEqual((st.clocks ?? []).filter((c) => c.id.startsWith('snap-')).map((c) => c.id), ['snap-river'], 'one bar, listed once');
  assert.throws(() => builtTwo({ a: one, b: { ...one, snap: { count: 0.6 } } }), /keeps clock snap-river on another bar/);
  const own = builtTwo({ a: { ...one, clock: undefined }, b: { ...one, clock: undefined } });
  assert.deepEqual(own.platforms.filter((p) => p.pad?.on === 'bites').map((p) => p.pad!.clock), ['snap-a', 'snap-b']);
});

test('level with the banks (ENG-25c): every floor of a snap pond stands with its top level with the banks, as 2-5.md\'s flight flew it', () => {
  // (snapClock.ts flies the bank, the stones and the far bank all at one height; ENG-25 laid them 34 px down, so the last hop up was unflown)
  for (const row of Object.keys(ROWS)) {
    const { st } = built(ROWS, row);
    const r = (st.rivers ?? []).find((z) => z.speed === 0 && st.platforms.some((p) => p.pad?.on === 'bites' && p.x > z.x0 && p.x < z.x1))!;
    const near = st.platforms.find((p) => p.type === 'solid' && !p.pad && Math.abs(p.x + p.width - r.x0) <= 1)!;
    const far = st.platforms.find((p) => p.type === 'solid' && !p.pad && Math.abs(p.x - r.x1) <= 1)!;
    assert.ok(near && far, `${row}: the pond's two banks`);
    assert.equal(far.y, near.y, `${row}: the far bank level with the near one`);
    const floors = st.platforms.filter((p) => p.x > r.x0 - 1 && p.x + p.width < r.x1 + 1);
    assert.equal(floors.length, ROWS[row as keyof typeof ROWS].pads.length, `${row}: every floor of the row`);
    for (const p of floors) assert.equal(p.y, near.y, `${row}: the floor at x=${p.x} (${p.art ?? p.style}) tops at ${p.y}, the banks at ${near.y}`);
  }
  // (planted by name: a stone set down into the water, as ENG-25 laid it; and one raised over the banks)
  const { st } = built(ROWS, 'wave');
  const plant = (dy: number, which: (p: Platform) => boolean) => snapFaults({ ...st, platforms: st.platforms.map((p) => (which(p) ? { ...p, y: p.y + dy } : p)) }).join(' | ');
  const first = st.platforms.find((p) => p.pad?.on === 'bites')!;
  assert.match(plant(34, (p) => p === first), new RegExp(`snap stone at x=${Math.round(first.x)} stands 34 px below the banks: not level with the banks`));
  assert.match(plant(-20, (p) => p === first), /stands 20 px above the banks: not level with the banks/);
  assert.match(plant(34, (p) => p.style === 'moss_stone'), /plain stone at x=\d+ stands 34 px below the banks: not level with the banks/);
});

test('in play: a snap stone is a floor always; it bites only on four, out of its creak; the bite HOLDS him (no knock off the stone)', () => {
  const { kit, seed, st } = built(ROWS, 'step');
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  setDifficulty('normal');
  withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      withFixtureConfig(cfg, () => {
        const sim = new RealPlay(ID, seed, cfg);
        const stone = (sim as unknown as { platforms: Platform[] }).platforms.find((p) => p.pad?.on === 'bites')!;
        sim.p.x = stone.x + stone.width / 2;
        sim.p.y = stone.y - 60;
        sim.p.vx = sim.p.vy = 0;
        // (RealPlay keeps him safe from hurts by default, realPlay.ts `safe`: the bite is the thing tested here)
        sim.safe = false;
        sim.p.invincibleTimer = 0;
        const hp0 = sim.p.hp;
        let firstBite = -1, warned = false, counts = new Set<number>(), vxAfter = NaN, onAfter = false;
        for (let f = 0; f < 30 * 4 && firstBite < 0; f++) {
          sim.frame();
          const s = padShows(stone)!;
          assert.ok(s.solid && !stone.broken, 'a floor always');
          counts.add(snapCount(stone)!);
          if (s.tell > 0 && s.tell < 1) warned = true;
          if (sim.p.hp < hp0) {
            firstBite = sim.t;
            vxAfter = sim.p.vx;
          }
        }
        assert.ok(firstBite > 0, 'it bites him as he stands through four');
        assert.ok(warned, 'its creak came first');
        assert.deepEqual([...counts].sort(), [1, 2, 3, 4].filter((c) => counts.has(c)).sort());
        assert.ok(counts.has(4) && counts.size >= 2, `the count reads on: ${[...counts]}`);
        assert.equal(vxAfter, 0, 'the bite holds him: no knock to the side');
        for (let f = 0; f < 30 && !onAfter; f++) { sim.frame(); onAfter = sim.p.grounded && sim.p.x > stone.x && sim.p.x < stone.x + stone.width; }
        assert.ok(onAfter, 'he comes back down on the stone, not in the river');
        assert.equal(sim.p.hp, hp0 - 1, 'one bite, one heart');
      });
    } finally {
      undo();
    }
  });
});

test('the straddle (ENG-25c, the lead\'s ruling 11-19): a stone bites him only when his MIDDLE is over it, not one his toes barely touch', () => {
  // (his feet stand 13 px past a floor's end, so over 30 px of water he can stand across two stones; the wave toy's child Easy v2 was
  // bitten at x 1849 with his middle over the water, 14 px short of the biting stone. Any world: the pad piece's rule, by the platform)
  const { kit, seed, st } = built(ROWS, 'step');
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  setDifficulty('normal');
  withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      withFixtureConfig(cfg, () => {
        // (he stands still at `at` through a whole bar and more: the hearts it took, and that he stood there all along)
        const standAt = (at: (s: Platform[]) => number) => {
          const sim = new RealPlay(ID, seed, cfg);
          const stones = (sim as unknown as { platforms: Platform[] }).platforms.filter((p) => p.pad?.on === 'bites').sort((a, b) => a.x - b.x);
          sim.safe = false;
          const x = at(stones);
          sim.stand(x, stones[1].y);
          const hp0 = sim.p.hp;
          let stood = true;
          for (let f = 0; f < 30 * 4; f++) {
            sim.p.invincibleTimer = 0;
            sim.frame();
            // (the bite holds him where he stands, lifting him a few px: he never moves along and never drops into the water)
            if (Math.abs(sim.p.x - x) > 1 || sim.p.y > stones[1].y + 5) stood = false;
          }
          return { lost: hp0 - sim.p.hp, stood };
        };
        // (his middle over the water, 10 px short of stone 2; his toes on it)
        const water = standAt((s) => s[1].x - 10);
        assert.ok(water.stood, 'he stands across the water on stone 2\'s lip');
        assert.equal(water.lost, 0, 'his middle over the water: the stone his toes touch does not bite him');
        // (his middle just over stone 2: it bites)
        const over = standAt((s) => s[1].x + 4);
        assert.ok(over.lost >= 1, 'his middle over the stone: it bites on four');
      });
    } finally {
      undo();
    }
  });
});

test('SNAP_FAIR cites 2-5.md\'s flown tap (13 frames) and its rulings', () => {
  assert.equal(Math.round(SNAP_FAIR.hop * 30), 13);
  assert.deepEqual([SNAP_FAIR.inStep, SNAP_FAIR.window, SNAP_FAIR.gap[0], SNAP_FAIR.gap[1]], [3, 0.9, 30, 40]);
});

test('the jaw\'s frames read as the bar: counts 1-3 open a notch each; four claps (SNAP) and holds shut (SHUT); five on the sheet', () => {
  assert.equal(SNAP_ART.frames, 5);
  assert.deepEqual([1, 2, 3].map((c) => snapFrame(c, false)), [1, 2, 3], 'OPEN-1, OPEN-2, OPEN-3');
  assert.deepEqual([0, 0.2, 0.39, 0.5, 0.99].map((u) => snapFrame(4, true, u)), [4, 4, 4, 0, 0], 'the bite: SNAP, then SHUT');
});

test('a teaching row (R-165.337): the bite jolts and holds him as any bite does, and costs no heart; planted: the same row without freeBite costs one', () => {
  const bite = (rows: Record<string, PadRow>) => {
    const { kit, seed, st } = built(rows, 'teach');
    const dict: string[] = [];
    const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
    setDifficulty('normal');
    return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
      const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
      try {
        return withFixtureConfig(cfg, () => {
          const sim = new RealPlay(ID, seed, cfg);
          const stone = (sim as unknown as { platforms: Platform[] }).platforms.find((p) => p.pad?.on === 'bites')!;
          sim.p.x = stone.x + stone.width / 2;
          sim.p.y = stone.y - 60;
          sim.p.vx = sim.p.vy = 0;
          sim.safe = false;
          sim.p.invincibleTimer = 0;
          const hp0 = sim.p.hp;
          let jolted = false, vx = NaN;
          for (let f = 0; f < 30 * 4 && !jolted; f++) {
            sim.frame();
            if (sim.p.invincibleTimer > 0) { jolted = true; vx = sim.p.vx; }
          }
          return { free: stone.pad?.freeBite === true, jolted, vx, lost: hp0 - sim.p.hp };
        });
      } finally {
        undo();
      }
    });
  };
  const t = bite(ROWS);
  assert.ok(t.free && t.jolted, 'the teaching stone bites (the jolt, its safe time)');
  assert.equal(t.vx, 0, 'it holds him on the stone');
  assert.equal(t.lost, 0, 'no heart for a teach');
  const plant = bite({ ...ROWS, teach: { ...ROWS.teach, freeBite: undefined } as PadRow });
  assert.ok(!plant.free && plant.jolted && plant.lost === 1, `the plant: the same row without freeBite costs a heart (lost ${plant.lost})`);
});
