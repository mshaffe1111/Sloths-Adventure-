// World 1's floor in gen2 (CHUNK-POOL-BRIEF step 1): the manifest's floorRoll, read only where a world declares it. On the toy world:
// a roll's hop family sets how deep its soft pits' floors lie (shallow on a hop roll, deep on a jump roll), every pit keeps its steps out,
// a ledge gap gets a catch bough, World 1's hollow log is a piece shape with the art's own height, and a mushroom perches on a stump by
// `on`. That every shipped world builds as before is the every-stage lock's proof (tools/engine/lockall.ts: 102/102 unchanged).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg, kit, manifest } from './toyWorld.ts';
import { hollowLogSize } from '../w1NewArt.ts';
import type { SectionTemplate, WorldKit, WorldManifest } from './types.ts';
import type { Platform } from '../types.ts';
import { DOUBLE_RISE } from '../physics.ts';

const hollowPerch: SectionTemplate = {
  id: 'toy-w1-hollow',
  name: 'hollow log and a perched mushroom',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu', 'ki'],
  difficulty: 3,
  pieces: [
    { key: 'bank', shape: 'bank', w: [420, 480], place: { kind: 'start' } },
    { key: 'stump', shape: 'block', w: [60, 60], h: 46, place: { kind: 'on', on: 'bank', at: [0.7, 0.7], h: [46, 46] }, main: false },
    { key: 'mush', shape: 'bouncy', w: [70, 70], h: 30, place: { kind: 'on', on: 'stump', at: [0, 0], h: [30, 30] }, main: false },
    { key: 'log', shape: 'hollow', w: [320, 320], place: { kind: 'walk', after: 'bank', dy: [0, 0] } },
  ],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'log', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  mirrorable: false,
};
const ledges: SectionTemplate = {
  id: 'toy-w1-ledges',
  name: 'two boughs over a gap',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu', 'ki'],
  difficulty: 4,
  pieces: [
    { key: 'a', shape: 'bank', w: [300, 300], place: { kind: 'start' } },
    { key: 'b1', shape: 'branch', w: [200, 200], place: { kind: 'jump', after: 'a', dy: [-40, -40], share: [0.6, 0.6] }, landing: true },
    { key: 'b2', shape: 'branch', w: [220, 220], place: { kind: 'jump', after: 'b1', dy: [0, 0], share: [0.6, 0.6] }, landing: true },
    { key: 'c', shape: 'bank', w: [300, 300], place: { kind: 'jump', after: 'b2', dy: [40, 40], share: [0.5, 0.5] } },
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  mirrorable: false,
};
const FLOOR = { shallow: 70, deep: 240, hopRoll: 0.9, jumpRoll: 0.55, catchDrop: 90 };
const withRoll = (hop: Array<{ range: [number, number]; weight: number }>): WorldKit => ({
  ...kit,
  manifest: { ...manifest, sections: [...manifest.sections, hollowPerch, ledges], floorRoll: { hop, ...FLOOR } } as WorldManifest,
});
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build = (k: WorldKit, seed: number) => buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: k, seed, difficulty: 'normal' });

/** each soft floor: the block the pit laid under a gap between two banks, and how far under the lower lip it lies */
function pitFloors(ps: Platform[]): number[] {
  const out: number[] = [];
  // (the lips are the ground's banks of earth, never a stone standing on one)
  const banks = ps.filter((p) => p.type === 'solid' && p.height >= 120).sort((a, b) => a.x - b.x);
  for (let i = 1; i < banks.length; i++) {
    const a = banks[i - 1], b = banks[i], x0 = a.x + a.width, x1 = b.x;
    if (x1 - x0 < 40) continue;
    const lo = Math.max(a.y, b.y);
    const under = ps.filter((q) => q.x <= (x0 + x1) / 2 && q.x + q.width >= (x0 + x1) / 2 && q.y > lo + 8 && !(q as { catch?: boolean }).catch);
    if (under.length) out.push(Math.max(...under.map((q) => q.y)) - lo);
  }
  return out;
}

test('a hop roll keeps its soft floors at its shallow depth, not the world\'s pitDepth (the toy world\'s is 130)', () => {
  // (shallow 30 here: the toy world's narrow pits already lie 38-70 px down, so a 70 would not show the roll's depth at work)
  const base = withRoll([{ range: [0.99, 1.0], weight: 1 }]);
  const hop: WorldKit = { ...base, manifest: { ...base.manifest, floorRoll: { ...base.manifest.floorRoll!, shallow: 30 } } };
  // (a back pit, under a liana or a glide, keeps its own floor: deep enough that the take-off perch is a double over it (pipeline
  // backPit), whatever the roll: so nine in ten, not every one)
  let nh = 0, nShallow = 0, deeper = 0;
  for (const s of SEEDS) {
    const h = pitFloors(build(hop, s).platforms);
    nh += h.length;
    nShallow += h.filter((d) => d <= 32).length;
    deeper += pitFloors(build(kit, s).platforms).filter((d) => d > 32).length;
  }
  assert.ok(nh > 0, 'no pit laid');
  assert.ok(nShallow >= 0.9 * nh, `${nShallow} of ${nh} floors at the hop roll's depth`);
  assert.ok(deeper > 0, 'the plain toy world never lays a floor deeper than the shallow one: the test would not see the roll');
});

test('the roll\'s family weighs the floor sections: a hop roll draws hop sections, a jump roll jump sections', () => {
  const tag = (id: string, floor: 'hop' | 'jump'): SectionTemplate => ({ ...manifest.sections.find((t) => t.id === 'toy-stumps')!, id, floor, phases: ['sho', 'ten', 'ketsu', 'ki', 'rest'] });
  const fam = (hop: Array<{ range: [number, number]; weight: number }>): WorldKit => ({
    ...kit, manifest: { ...manifest, sections: [...manifest.sections, tag('toy-hop', 'hop'), tag('toy-jump', 'jump')], floorRoll: { hop, ...FLOOR } } as WorldManifest,
  });
  const count = (k: WorldKit, id: string) => SEEDS.reduce((n, s) => n + (build(k, s).gen2?.sections ?? []).filter((x: { template: string }) => x.template === id).length, 0);
  const hopK = fam([{ range: [0.99, 1.0], weight: 1 }]), jumpK = fam([{ range: [0.43, 0.51], weight: 1 }]);
  const [hh, hj, jh, jj] = [count(hopK, 'toy-hop'), count(hopK, 'toy-jump'), count(jumpK, 'toy-hop'), count(jumpK, 'toy-jump')];
  assert.ok(hh > hj && jj > jh, `hop roll: hop ${hh}, jump ${hj}; jump roll: hop ${jh}, jump ${jj}`);
});

test('a ledge gap has a catch bough under it; the hollow log is the art\'s own height; a mushroom perches on its stump', () => {
  const k = withRoll([{ range: [0.74, 0.8], weight: 1 }]);
  let catches = 0, hollows = 0, perched = 0;
  for (const s of SEEDS) {
    const ps = build(k, s).platforms;
    catches += ps.filter((p) => (p as { catch?: boolean }).catch).length;
    for (const p of ps.filter((q) => q.hollow)) {
      hollows++;
      assert.equal(p.height, hollowLogSize('moss', p.width).height, `seed ${s}: hollow at x ${p.x}`);
      assert.equal(p.style, 'log');
    }
    for (const m of ps.filter((q) => q.type === 'bouncy')) {
      const stump = ps.find((q) => q !== m && q.type === 'solid' && Math.abs(q.y - (m.y + m.height)) <= 1 && q.x <= m.x + 1 && q.x + q.width >= m.x + m.width - 1 && q.width <= 80);
      if (stump) perched++;
    }
  }
  assert.ok(catches > 0, 'no catch bough under any ledge gap');
  assert.ok(hollows > 0, 'no hollow log laid');
  assert.ok(perched > 0, 'no mushroom perched on a stump');
});

// (Roll A's 10.8 s quiet stretch, 11-05: inside a section a catch bough hung 90 px under the gap's UPPER lip, so on a bough drop of 110 it
// sat 20 px over the lower bough: a step down, and the descent's two jumps walked off without a beat. A catch is a net under the gap,
// never a stair: it hangs catchDrop under the LOWER lip, inside a section and at a join alike)
const boughDrop: SectionTemplate = {
  id: 'toy-w1-bough-drop',
  name: 'down a bough drop',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu', 'ki'],
  difficulty: 3,
  pieces: [
    { key: 'a', shape: 'branch', w: [400, 400], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [400, 400], place: { kind: 'jump', after: 'a', dy: [110, 110], share: [0.45, 0.45] }, landing: true },
    { key: 'c', shape: 'branch', w: [400, 400], place: { kind: 'jump', after: 'b', dy: [110, 110], share: [0.45, 0.45] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'c', kind: 'ledge' },
  exitDy: 220,
  sockets: [],
  mirrorable: false,
};
test('a catch bough hangs catchDrop under the gap\'s lower lip, never a step between the two (a 110 px bough drop, 16 seeds)', () => {
  const k: WorldKit = { ...kit, manifest: { ...manifest, sections: [...manifest.sections, boughDrop], floorRoll: { hop: [{ range: [0.74, 0.8], weight: 1 }], ...FLOOR } } as WorldManifest };
  let seen = 0;
  for (const s of SEEDS) {
    const ps = build(k, s).platforms;
    // (a catch is laid 30 px before its gap and 50 px past it: pipeline catchUnder)
    for (const c of ps.filter((p) => (p as { catch?: boolean }).catch)) {
      const x0 = c.x + 30, x1 = c.x + c.width - 50;
      const solid = ps.filter((p) => !(p as { catch?: boolean }).catch && p.type !== 'moving');
      const a = solid.filter((p) => Math.abs(p.x + p.width - x0) < 3 && p.y < c.y + FLOOR.catchDrop), b = solid.filter((p) => Math.abs(p.x - x1) < 3 && p.y < c.y + FLOOR.catchDrop);
      if (!a.length || !b.length) continue;
      const lower = Math.max(Math.min(...a.map((p) => p.y)), Math.min(...b.map((p) => p.y)));
      seen++;
      assert.ok(c.y >= lower + FLOOR.catchDrop - 1, `seed ${s}: catch at y ${c.y} under the gap x ${x0}-${x1}, lower lip ${lower} (want >= ${lower + FLOOR.catchDrop})`);
    }
  }
  assert.ok(seen > 0, 'no catch bough under any gap: the test would not see the rule');
});

test('a world without floorRoll builds exactly as before (the toy world, 16 seeds)', () => {
  for (const s of SEEDS) assert.deepEqual(build(kit, s).platforms, build({ ...kit, manifest: { ...manifest } }, s).platforms);
});

test('the golden seed (a \'find\' socket in a required section): one a roll, more than 200 px up past a double, a mushroom within 260 px under it', () => {
  const perch: SectionTemplate = {
    id: 'toy-w1-seedperch', name: 'the golden seed over a mushroom', archetypes: 'any', phases: ['sho', 'ten', 'ketsu', 'ki', 'rest'], difficulty: 3,
    pieces: [
      { key: 'bank', shape: 'bank', w: [520, 560], place: { kind: 'start' } },
      { key: 'stump', shape: 'block', w: [80, 80], h: 46, place: { kind: 'on', on: 'bank', at: [0.3, 0.3], h: [46, 46] }, main: false },
      { key: 'mush', shape: 'bouncy', w: [70, 70], h: 30, place: { kind: 'on', on: 'stump', at: [0, 0], h: [30, 30] }, main: false },
      { key: 'bough', shape: 'branch', w: [270, 270], place: { kind: 'over', on: 'bank', at: [0.3, 0.3], dy: [-(DOUBLE_RISE + 70), -(DOUBLE_RISE + 70)] }, main: false },
    ],
    entry: { piece: 'bank', kind: 'ground' }, exit: { piece: 'bank', kind: 'ground' }, exitDy: 0,
    sockets: [{ id: 'seed', role: 'find', on: 'bough', t: 0.5, dn: 70 }],
    mirrorable: false,
  };
  const k: WorldKit = { ...kit, manifest: { ...manifest, sections: [...manifest.sections, perch], required: { '5-7': [{ section: 'toy-w1-seedperch' }] } } as WorldManifest };
  for (const s of SEEDS) {
    const st = build(k, s);
    const seeds = st.collectibles.filter((c) => c.type === 'seed');
    assert.equal(seeds.length, 1, `seed ${s}: ${seeds.length} golden seeds`);
    const sd = seeds[0];
    const ground = st.platforms.filter((p) => p.type === 'solid' && p.x <= sd.x && p.x + p.width >= sd.x && p.height >= 90).sort((a, b) => a.y - b.y)[0];
    assert.ok(ground && ground.y - sd.y > 200 && ground.y - sd.y > DOUBLE_RISE, `seed ${s}: the seed ${ground ? ground.y - sd.y : '?'} px over the ground under it`);
    assert.ok(st.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - sd.x) < 260 && p.y > sd.y), `seed ${s}: no mushroom within 260 px under the seed`);
  }
});
