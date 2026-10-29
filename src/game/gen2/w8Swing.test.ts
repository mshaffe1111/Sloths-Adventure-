/**
 * World 8's liana stages on gen2 (gen2/worlds/w8Swing.ts, w8Rooms.ts), built through buildGen2Stage on 20 raw rolls, Normal and Easy, on
 * the kit the game builds with (w8Game.ts w8GameKit, then w8Finish): the sections are each laid in their own space and never mirrored;
 * every roll is held to World 8's checks (w8Harness.ts checkW8Roll: levelCheck, its room and its dark, the quick route swings every
 * liana, 2:00 or more, flags close enough); and every liana's swing can be judged in the dark: each point of its swing is in the light of
 * the fireflies or of Pokey's lantern from the swing's bough.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../worldsData.ts';
import type { LevelConfig, Vine } from '../types.ts';
import { buildGen2Stage, layLocal, maxGap, planBudget, rngFor, VINE } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { checkW8Roll, type Played } from './w8Harness.ts';
import { w8Finish, w8Kit } from './worlds/w8.ts';
import { w8GameKit } from './worlds/w8Game.ts';
import { W8_SWING_SECTIONS } from './worlds/w8Swing.ts';

const levels = generateAllLevels();
const lv = (id: string): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const STAGES = ['8-3', '8-5'];
/** Pokey's lantern (zoneArt.ts drawDarkness heroR: 210 px about a point 30 px over his feet); EDGE keeps clear of its soft rim */
const LANTERN = { r: 210, up: 30 } as const;
const EDGE = 0.9;

const cache = new Map<string, Gen2Stage>();
const buildW8 = (id: string, seed: number, difficulty: 'easy' | 'normal') => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) cache.set(k, w8Finish(buildGen2Stage({ config: lv(id), kit: w8GameKit(Number(id.split('-')[1]), difficulty), seed, difficulty })));
  return cache.get(k)!;
};

test('the liana sections: each laid in its own space (600-1700 px, 370 more a liana), level at its ends, hops a third of a jump or so, never mirrored', () => {
  for (const d of ['normal', 'easy'] as const) {
    const budget = planBudget(lv('8-3'), w8Kit(3).manifest, d);
    for (const s of W8_SWING_SECTIONS) {
      const keys = new Set(s.pieces.map((p) => p.key));
      for (const k of s.sockets) assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      assert.equal(s.mirrorable, false, s.id);
      for (let r = 1; r <= 30; r++) {
        const L = layLocal(s, budget, rngFor(r));
        const lianas = L.pieces.filter((p) => p.shape === 'liana').length;
        assert.ok(lianas >= 1, s.id);
        assert.ok(L.width >= 600 && L.width <= 1700 + 370 * lianas, `${s.id} ${d}: ${L.width} px`);
        assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id} ${d}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
        const swung = (g: { x0: number; x1: number }) => L.pieces.some((p) => p.shape === 'liana' && p.x >= g.x0 - 1 && p.x <= g.x1 + 1);
        for (const g of L.gaps) if (!swung(g)) assert.ok(g.x1 - g.x0 <= Math.max(60, maxGap(0, false, budget.margin) * 0.45) + 1, `${s.id}: a ${g.x1 - g.x0} px hop`);
      }
      // (a dark stretch: from its lit first bough, never on it; onto its lit last bough, never on it; nothing standing in it)
      const ends = s.sockets.filter((k) => k.id === 'darkFrom' || k.id === 'darkTo').map((k) => k.on);
      if (ends.length) {
        assert.ok(!ends.includes(s.entry.piece) && !ends.includes(s.exit.piece), `${s.id}: its dark reaches its lit ends`);
        // (and level with its lit boughs: dropped below them, the soft pit under its swing sinks past the boughs' feet, w8Swing.ts header)
        for (const key of [ends[0], s.exit.piece]) {
          const pc = s.pieces.find((p) => p.key === key)!;
          if (pc.place.kind === 'walk') assert.ok(!pc.place.dy, `${s.id}: ${key} steps ${String(pc.place.dy)}`);
        }
        for (const k of s.sockets.filter((q) => q.role === 'enemy')) assert.ok(k.on === s.entry.piece || k.on === s.exit.piece, `${s.id}.${k.id} stands in the dark`);
      }
    }
  }
});

/** each point of a liana's swing (either end, the middle of each half, its bottom) in a firefly's light or the lantern from its bough */
function swingLit(st: Gen2Stage, v: Vine): string | null {
  const dark = (st.zones ?? []).filter((z) => z.kind === 'dark' && v.x > z.x0 && v.x < z.x1);
  if (!dark.length) return null;
  const len = v.bottomY - v.topY;
  const amp = v.swingAmp ?? VINE.amp;
  // (the bough it hangs past: the nearest top whose end is within its reach, to its left, near its foot)
  const bough = st.platforms
    .filter((p) => p.x + p.width <= v.x && v.x - (p.x + p.width) < 240 && Math.abs(p.y - v.bottomY) < 60)
    .sort((a, b) => b.x + b.width - (a.x + a.width))[0];
  const lantern = bough ? [{ x: bough.x + bough.width - 20, y: bough.y - LANTERN.up, r: LANTERN.r }] : [];
  const lights = [...dark.flatMap((z) => z.lights ?? []), ...lantern];
  for (const a of [-1, -0.5, 0, 0.5, 1]) {
    const p = { x: v.x + Math.sin(a * amp) * len, y: v.topY + Math.cos(a * amp) * len };
    if (!lights.some((l) => Math.hypot(l.x - p.x, l.y - p.y) <= l.r * EDGE)) return `the swing at ${Math.round(p.x)}, ${Math.round(p.y)} is dark`;
  }
  return null;
}

for (const id of STAGES) {
  test(`${id} on 20 raw rolls, Normal and Easy: World 8's checks (its room, its dark, every liana swung, 2:00 or more), every swing in the dark lit`, () => {
    let inDark = 0;
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = buildW8(id, seed, difficulty);
        const at = `${id} seed ${seed} (${difficulty})`;
        checkW8Roll(st as unknown as Played, at, id);
        for (const v of st.vines.filter((x) => x.vineType === 'swing_liana')) {
          const why = swingLit(st, v);
          assert.equal(why, null, `${at}: ${why}`);
          if ((st.zones ?? []).some((z) => z.kind === 'dark' && v.x > z.x0 && v.x < z.x1)) inDark++;
        }
      }
    }
    assert.ok(inDark >= 40, `${id}: only ${inDark} lianas in the dark over 40 rolls`);
  });
}
