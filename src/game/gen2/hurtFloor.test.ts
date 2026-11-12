// A hurt floor any world can lay (packet E12 item 2, D43): a place marked `hurt`; WHAT the floor is comes from the world's manifest row
// `hurtFloor`. Proven on a STUB kit that is not World 1's (World 5's kit with its own row, another lesson name and depth, every pit place
// marked `hurt`): the roll lays the floor at that depth with no climb-out, the real engine takes a heart on Normal and none on Easy, the
// drop is typed as a heart fall with its own look, and the same kit with the row removed fails by name. Nothing shipped lays one yet.
//   npx tsx --test src/game/gen2/hurtFloor.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../headlessDom.ts';
import { buildGen2Stage, dropsOf } from './pipeline.ts';
import { dropVerdicts } from './verdicts.ts';
import { GEN2_STAGES } from './game.ts';
import { w5Kit } from './worlds/w5.ts';
import { generateAllLevels } from '../worldsData.ts';
import { RealPlay } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import type { Gen2Stage, WorldKit } from './types.ts';
import type { Drop } from './verdicts.types.ts';

const STAGE = '5-7';
const ROW = { lesson: 'spikes', art: 'stub-spike', depth: [120, 130] as [number, number], clearStart: 900 };
const cfg = { ...generateAllLevels().find((l) => l.id === STAGE)!, unlocked: true };

/** World 5's kit with every `pit` place marked `hurt`, and (unless `row` is false) its own hurtFloor row */
function stubKit(row = true): WorldKit {
  const k = w5Kit(7);
  const sections = k.manifest.sections.map((s) => ({ ...s, pieces: s.pieces.map((p) => (p.place.kind === 'pit' ? { ...p, place: { ...p.place, hurt: true } } : p)) }));
  return { ...k, manifest: { ...k.manifest, sections, ...(row ? { hurtFloor: ROW } : {}) } };
}
type Zone = { x0: number; x1: number; y?: number; soft?: boolean };
const hollows = (st: Gen2Stage): Zone[] => ((st.heartFalls ?? []) as Zone[]).filter((z) => z.y !== undefined);
/** the first seed whose roll lays a hurt place */
function seedWithHollow(): number {
  for (let seed = 1; seed <= 12; seed++) if (hollows(buildGen2Stage({ config: cfg, kit: stubKit(), seed, difficulty: 'normal' })).length) return seed;
  throw new Error('no seed of 1-12 lays a hurt place on the stub kit');
}
const SEED = seedWithHollow();
const build = (difficulty: 'normal' | 'easy', kit = stubKit()) => buildGen2Stage({ config: cfg, kit, seed: SEED, difficulty });

for (const setting of ['normal', 'easy'] as const) {
  test(`laid (${setting}): each hollow's floor is ONE marked piece at the manifest's depth under the lip, no climb-out, and a zone lip to lip with the floor's top as its hurt line`, () => {
    const st = build(setting);
    const hs = hollows(st);
    assert.ok(hs.length >= 1, 'the roll lays a hurt place');
    for (const z of hs) {
      const fall = st.gen2.falls!.find((f) => Math.abs(f.x0 - z.x0) <= 1 && Math.abs(f.x1 - z.x1) <= 1);
      assert.ok(fall, `the hollow ${z.x0}..${z.x1} is one of the route's falls`);
      const inside = st.platforms.filter((p) => p.x >= z.x0 - 1 && p.x + p.width <= z.x1 + 1 && p.y > fall.y);
      assert.equal(inside.length, 1, `one piece in the hollow, no steps out (${inside.length})`);
      const floor = inside[0];
      assert.equal(floor.pit, 'hurt', 'the floor is marked');
      assert.deepEqual([Math.round(floor.x), Math.round(floor.x + floor.width)], [z.x0, z.x1], 'wall to wall');
      assert.equal(Math.round(floor.y), z.y, "the zone's hurt line is the floor's top");
      const depth = floor.y - fall.y;
      assert.ok(depth >= ROW.depth[0] && depth <= ROW.depth[1], `${depth} px under the lip, the row says ${ROW.depth.join('-')}`);
      assert.equal(z.soft, setting === 'easy' ? true : undefined, 'not soft on Normal, soft on Easy');
      // (the banks either side reach down to the floor: no hole under a bank's foot)
      for (const edge of [z.x0, z.x1]) {
        const bank = st.platforms.find((q) => q !== floor && (Math.abs(q.x + q.width - edge) < 3 || Math.abs(q.x - edge) < 3) && q.y <= fall.y + 1 && q.height >= 40);
        if (bank) assert.ok(bank.y + bank.height >= floor.y, `the bank at ${edge} stops ${floor.y - bank.y - bank.height} px over the floor`);
      }
    }
    assert.ok(!st.platforms.some((p) => p.pit === 'hurt' && !hs.some((z) => z.y === Math.round(p.y))), 'no marked floor without its zone');
  });
}

test('without the mark the same kit lays its pits as today (a floor and steps out, no hurt line); with the mark and NO row the roll fails by name', () => {
  const base = buildGen2Stage({ config: cfg, kit: w5Kit(7), seed: SEED, difficulty: 'normal' });
  assert.equal(hollows(base).length, 0);
  assert.ok(!base.platforms.some((p) => p.pit === 'hurt'));
  assert.throws(() => build('normal', stubKit(false)), /lays a hurt place and the world's manifest has no hurtFloor row/);
});

test('typed: a hollow is a heart drop with its own look; a world whose painter draws no hurt floor fails drop.look-lies by name', () => {
  const st = build('normal');
  const z = hollows(st)[0];
  const d = dropsOf(st).find((q) => Math.abs(q.x0 - z.x0) <= 1)!;
  assert.deepEqual(d.ends, { kind: 'heart', to: 'take-off' });
  assert.notEqual(d.look, 'hurt-art', 'no painter draws the stub world\'s hurt floor');
  const v = dropVerdicts({ setting: 'normal', policy: 'per-gap', drops: [d] });
  assert.deepEqual(v.map((q) => q.name), ['drop.look-lies']);
  assert.match(v[0].line, /the heart drop at x \d+\.\.\d+ is drawn as /);
});

test('drop.look-lies covers all three ways: a soft look, a lethal look and the hurt look never stand in for one another (planted)', () => {
  const at = { x0: 100, x1: 300, lipY: 500 };
  const heart = { kind: 'heart', to: 'take-off' } as const, soft = { kind: 'putback', to: 'take-off' } as const, life = { kind: 'life', cause: 'water' } as const;
  const warn = { dotLine: 'x', leadPx: 200, sign: true as const };
  const lies = (d: unknown) => dropVerdicts({ setting: 'normal', policy: 'per-gap', drops: [d as Drop] }).filter((v) => v.name === 'drop.look-lies').map((v) => v.line);
  assert.deepEqual(lies({ ...at, ends: heart, look: 'hurt-art' }), [], 'a heart drop painted as the hurt floor is true');
  assert.deepEqual(lies({ ...at, ends: heart, look: 'pit-floor-art' }), ['the heart drop at x 100..300 is drawn as pit-floor-art'], 'painted as the leaf bed');
  assert.deepEqual(lies({ ...at, ends: heart, look: 'water-art' }), ['the heart drop at x 100..300 is drawn as water-art'], 'painted as water');
  assert.deepEqual(lies({ ...at, ends: heart, look: 'ground' }), ['the heart drop at x 100..300 is drawn as ground']);
  assert.deepEqual(lies({ ...at, ends: soft, look: 'hurt-art' }), ['the soft drop at x 100..300 is drawn as hurt-art'], 'a soft pit painted as the hurt floor');
  assert.deepEqual(lies({ ...at, ends: life, look: 'hurt-art', warn }), ['the lethal drop at x 100..300 is drawn as hurt-art']);
  // (the two ways judged before this item still read as they did)
  assert.deepEqual(lies({ ...at, ends: soft, look: 'water-art' }), ['the soft drop at x 100..300 is drawn as water-art']);
  assert.deepEqual(lies({ ...at, ends: life, look: 'ground', warn }), ['the lethal drop at x 100..300 is drawn as ground']);
  assert.deepEqual(lies({ ...at, ends: soft, look: 'pit-floor-art' }), []);
  assert.deepEqual(lies({ ...at, ends: life, look: 'water-art', warn }), []);
});

/** the real engine on the stub kit's stage: the game's own builder with the stage's kit swapped for the stub (a test seam, restored) */
function play(setting: 'normal' | 'easy'): RealPlay {
  const entry = GEN2_STAGES[STAGE] as { kit: () => WorldKit };
  const was = entry.kit;
  setDifficulty(setting);
  entry.kit = () => stubKit();
  try {
    // (the stage's shipped roll 1: on the stub kit it holds hollows; roll 0 lays no pit place)
    const r = new RealPlay(STAGE, 1);
    // (RealPlay stubs loseLife: the engine's own is put back, so a last heart is a real life lost)
    r.e.loseLife = Object.getPrototypeOf(r.e).loseLife;
    return r;
  } finally {
    entry.kit = was;
    setDifficulty('normal');
  }
}
/** drop him into the hollow from over its middle and run until he is set back (or 90 frames) */
function fallIn(r: RealPlay, z: Zone): void {
  r.p.x = (z.x0 + z.x1) / 2;
  r.p.y = z.y! - 60;
  r.p.vx = 0;
  r.p.vy = 200;
  r.p.grounded = false;
  r.p.invincibleTimer = 0;
  for (let i = 0; i < 90 && r.p.x > z.x0 && r.p.x < z.x1; i++) r.frame();
}
/** walk him onto the hollow's entry ledge so the engine knows the ground he left */
function standBefore(r: RealPlay, z: Zone): { x: number; y: number } {
  const ledge = r.platforms.filter((p) => Math.abs(p.x + p.width - z.x0) < 3 && p.width >= 60).sort((a, b) => a.y - b.y)[0];
  assert.ok(ledge, 'the hollow has an entry ledge');
  r.p.x = ledge.x + ledge.width - 80;
  r.p.y = ledge.y - 4;
  r.p.vx = 0;
  r.p.vy = 0;
  for (let i = 0; i < 20; i++) r.frame();
  assert.ok(r.p.grounded, 'standing on the entry ledge');
  return { x: r.p.x, y: r.p.y };
}

test('hurt, Normal, the real engine with the real heartFall and loseLife: 3 falls are 3 hearts, the last one a life; each sets him back on the ledge he left', () => {
  const r = play('normal');
  r.safe = false;
  const z = hollows(r.stage as unknown as Gen2Stage)[0];
  assert.ok(z && !z.soft, 'the played stage holds a hollow that is not soft');
  r.p.hp = 3;
  const lives = r.e.lives as number;
  const put: number[] = [];
  for (let n = 1; n <= 3; n++) {
    const at = standBefore(r, z);
    fallIn(r, z);
    if (n < 3) {
      assert.equal(r.p.hp, 3 - n, `fall ${n}: one heart`);
      assert.equal(r.e.lives, lives, `fall ${n}: no life`);
      assert.ok(r.p.x <= z.x0 && Math.abs(r.p.y - at.y) < 60, `fall ${n}: set back on the ledge he left (${Math.round(r.p.x)}, ${Math.round(r.p.y)}; the ledge ends at ${z.x0})`);
      assert.ok(r.p.invincibleTimer > 1, `fall ${n}: blinking`);
      put.push(Math.round(r.p.x));
      for (let i = 0; i < 120; i++) r.frame();
      assert.ok(r.p.x <= z.x0, `fall ${n}: he stays on the ledge`);
    } else assert.equal(r.e.lives, lives - 1, 'fall 3, his last heart: a life');
  }
  console.log(`  Normal: the hollow ${z.x0}..${z.x1}, hurt line y ${z.y}; put back at x ${put.join(', ')}`);
});

test('hurt, Easy, the real engine: 3 falls are 0 hearts and 0 lives, each a set-back that blinks', () => {
  const r = play('easy');
  r.safe = false;
  const z = hollows(r.stage as unknown as Gen2Stage)[0];
  assert.ok(z && z.soft, "Easy's hollow is soft");
  const hp = r.p.hp, lives = r.e.lives as number;
  for (let n = 1; n <= 3; n++) {
    const at = standBefore(r, z);
    fallIn(r, z);
    assert.equal(r.p.hp, hp, `fall ${n}: no heart`);
    assert.equal(r.e.lives, lives, `fall ${n}: no life`);
    assert.ok(r.p.x <= z.x0 && Math.abs(r.p.y - at.y) < 60, `fall ${n}: set back on the ledge he left (${Math.round(r.p.x)}, ${Math.round(r.p.y)})`);
    assert.ok(r.p.invincibleTimer > 1.2, `fall ${n}: the hurt blink, longer than a plain soft fall's`);
    for (let i = 0; i < 120; i++) r.frame();
  }
});

test('the floor itself is never where he is put back, and standing on it is the fall (no walking the hollow)', () => {
  const r = play('normal');
  r.safe = false;
  const z = hollows(r.stage as unknown as Gen2Stage)[0];
  standBefore(r, z);
  r.p.hp = 3;
  fallIn(r, z);
  assert.equal(r.p.hp, 2);
  assert.ok(r.e.softAt.y < z.y! - 50, 'the ground he is put back on is the ledge, not the floor');
});

/** plant a pillar with a mushroom on it in the middle of the hollow (hurt floor on both sides: the one zone becomes two) */
function plantPillar(r: RealPlay, z: Zone, lipY: number): { x: number; width: number } {
  const mid = Math.round((z.x0 + z.x1) / 2), id = Math.max(...r.platforms.map((p) => p.id)) + 1;
  const pillar = { id, x: mid - 45, y: lipY, width: 90, height: z.y! - lipY + 40, type: 'solid' as const, style: 'moss_stone' as const };
  r.platforms.push(pillar as never, { id: id + 1, x: mid - 15, y: lipY - 30, width: 30, height: 30, type: 'bouncy', style: 'moss_stone' } as never);
  const zones = r.stage.heartFalls as Zone[];
  zones.splice(zones.indexOf(z), 1, { ...z, x1: mid - 45 }, { ...z, x0: mid + 45 });
  return pillar;
}

test('the put-back: a pillar (a mushroom on it, hurt floor on both sides) is never the put-back spot; the last ledge that is not one is', () => {
  const r = play('normal');
  r.safe = false;
  const z = hollows(r.stage as unknown as Gen2Stage)[0];
  const at = standBefore(r, z);
  const pillar = plantPillar(r, z, at.y);
  const ledge = { ...r.e.softAt };
  // (he stands on the pillar's left shoulder, clear of the cap, for 10 frames)
  r.p.x = pillar.x + 6;
  r.p.y = at.y;
  r.p.vx = 0;
  r.p.vy = 0;
  for (let i = 0; i < 10; i++) r.frame();
  assert.ok(r.p.grounded && Math.abs(r.p.y - at.y) < 2 && r.p.x >= pillar.x && r.p.x <= pillar.x + pillar.width, `standing on the pillar (${Math.round(r.p.x)}, ${Math.round(r.p.y)})`);
  assert.deepEqual({ x: r.e.softAt.x, y: r.e.softAt.y }, { x: ledge.x, y: ledge.y }, 'the put-back spot is still the entry ledge');
  // (a fall into the second half of the hollow, past the pillar: back to the entry ledge, not onto the pillar)
  r.p.hp = 3;
  const [, second] = hollows(r.stage as unknown as Gen2Stage);
  fallIn(r, second);
  assert.equal(r.p.hp, 2);
  assert.ok(r.p.x <= z.x0, `put back on the entry ledge (x ${Math.round(r.p.x)}), not on the pillar at ${pillar.x}`);
  console.log(`  put-back from past the pillar at ${pillar.x}: x ${Math.round(r.p.x)} (the ledge ends at ${z.x0})`);
});

test('the put-back: on a ledge with a mushroom he is put back short of the mushroom, never inside the cap', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const r = play(setting);
    r.safe = false;
    const z = hollows(r.stage as unknown as Gen2Stage)[0];
    const at = standBefore(r, z);
    // (a mushroom 70 px back from the ledge's end; he stands between it and the edge, where the plain rule would put him back)
    const cap = { id: Math.max(...r.platforms.map((p) => p.id)) + 1, x: z.x0 - 70, y: at.y - 30, width: 30, height: 30, type: 'bouncy', style: 'moss_stone' };
    r.platforms.push(cap as never);
    r.p.x = z.x0 - 14;
    r.p.y = at.y;
    r.p.vx = 0;
    r.p.vy = 0;
    for (let i = 0; i < 10; i++) r.frame();
    assert.ok(r.p.grounded && r.p.x > cap.x + cap.width, `${setting}: standing past the mushroom (${Math.round(r.p.x)})`);
    assert.ok(r.e.softAt.x <= cap.x - 30, `${setting}: the put-back spot ${Math.round(r.e.softAt.x)} is short of the mushroom at ${cap.x}`);
    r.p.hp = 3;
    fallIn(r, z);
    assert.ok(r.p.x <= cap.x - 30, `${setting}: put back at ${Math.round(r.p.x)}, short of the mushroom at ${cap.x}`);
    for (let i = 0; i < 60; i++) r.frame();
    assert.ok(r.p.grounded && Math.abs(r.p.y - at.y) < 2 && r.p.x < cap.x, `${setting}: he stands where he was put, not thrown by the cap (${Math.round(r.p.x)}, ${Math.round(r.p.y)})`);
  }
});

test('general by data: no engine line says what the floor IS (the grep, counted against the base)', () => {
  const count = (f: string) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => /thorn/i.test(l)).length;
  assert.equal(count('src/game/gen2/pipeline.ts'), 0);
  assert.equal(count('src/game/gen2/verdicts.ts'), 0);
  assert.equal(count('src/game/gen2/promises11.ts'), 0);
  assert.equal(count('src/game/engine.ts'), THORN_BASE, "engine.ts: World 3's vines only, the count unchanged");
});
const THORN_BASE = 23;
