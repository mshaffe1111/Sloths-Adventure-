// BOTS FIRST (level.md rule 21; ENG-19b, 1-9.md "be the bait", NEW 5): the tier bots play the kit's boa before any level lays one. A real
// engine on a World 1 stage (no stage id, seed or x of a level's is the bot's), its ground swapped for a planted bough with one boa of
// the cast on it, the bot told to freeze (a player who has met 1-9's beat 2: `knows`).
//  - THE FREEZE: he walks at it; it rears (1.0 s, Easy x1.3) when he moves within its 150 px engage; after his reaction (stopReact, then
//    the thumb's lag, BOTS.md: KID's for the child, ADULT's for middle and expert) his thumb comes off, it is beaten by his stillness and
//    flees, and he walks on. PLANTED: the freeze removed (noFreeze), he walks into its strike.
//  - THE ROOST ("This time, DON'T stop", 1-9.md beat 7): the same boa inside the reach of an eagle's roost (a lure post it fears), on a
//    creaky limb (1.1 s) over a lower bough. It flees in its first rear frame (lure.ts), before any reaction, so he walks on over the limb
//    and is never hit or dropped: the roost needs no reading of the bot's (firsttimer.ts freezePlan). PLANTED: the roost taken away, the
//    same bots stop for it (beaten by stillness) or are hit, so the roost is what lets them walk on. (A drop to the bough below is
//    the bot's own thumb pausing on the 1.1 s limb, with or without the roost: printed, never pinned on the roost.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_CHILD, FT_CHILD_EASY, FT_EXPERT, FT_MIDDLE, FT_MIDDLE_EASY, freshPhone, rng, type FirstTimer } from './firsttimer.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import type { LurePost } from '../../src/game/predators/lure.ts';
import type { Enemy, Platform } from '../../src/game/types.ts';

const Y = 500;
const BOA_X = 1500;
const boa = (): Enemy => ({
  id: 7000, type: 'boa', x: BOA_X, y: Y - 16, vx: 0, vy: 0, width: 58, height: 26, hp: 1, maxHp: 1, facing: -1, patrolMinX: BOA_X, patrolMaxX: BOA_X,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
} as Enemy);

/** the bough: plain ground, or (`limb`) a creaky limb of 250 px under the boa with a lower bough 160 px under it */
function bough(limb: boolean): Platform[] {
  const solid = (id: number, x: number, w: number, y = Y) => ({ id, x, y, width: w, height: 40, type: 'solid' } as Platform);
  if (!limb) return [solid(9000, 0, 3200)];
  return [solid(9000, 0, BOA_X - 125), { id: 9001, x: BOA_X - 125, y: Y, width: 250, height: 30, type: 'fragile', creak: 1.1 } as Platform,
    solid(9002, BOA_X + 125, 3200 - BOA_X - 125), solid(9003, BOA_X - 400, 800, Y + 160)];
}

interface Toy { hits: number; dropped: boolean; far: boolean; way: string | undefined; froze: boolean }
/** one bot over the bough from x 300; `roost`: the boa in an eagle's roost's reach, on the creaky limb (`limb` alone: the limb, no roost) */
function play(who: FirstTimer, seed: number, o: { roost?: boolean; limb?: boolean } = {}): Toy {
  freshPhone(who.setting);
  setDifficulty(who.setting);
  Math.random = rng(seed);
  const route = Array.from({ length: 70 }, (_, i) => ({ x: 300 + i * 40, y: Y }));
  const run = new FirstTimerRun('1-2', seed, who, { route, cap: 40, knows: ['freeze'] });
  const sim = run.sim as unknown as { bare(p: Platform[]): void; stand(x: number, y: number): void; e: any };
  const e = sim.e;
  sim.bare(bough(!!(o.roost || o.limb)));
  const b = boa();
  e.enemies.length = 0;
  e.enemies.push(b);
  const lures: LurePost[] = o.roost ? [{ x: BOA_X, y: Y, fear: 'eagle', reach: 150 }] : [];
  e.proto = { hints: [], covers: [], beats: [], cast: { kinds: ['boa'], traps: [], lures } };
  e.startCast();
  e.checkpoint = { x: 300, y: Y };
  sim.stand(300, Y);
  e.player.hp = e.player.maxHp;
  let hits = 0, dropped = false, far = false, still = 0;
  const frame = (run.sim as any).frame.bind(run.sim);
  (run.sim as any).frame = (pad: unknown) => {
    const hp = e.player.hp;
    frame(pad);
    if (e.player.hp < hp) hits++;
    if (e.player.y + e.player.height > Y + 100) dropped = true;
    if (e.player.x > BOA_X + 500) far = true;
    if (Math.abs(e.player.x - BOA_X) < 200 && Math.abs(e.player.vx) < 5 && e.player.grounded) still++;
  };
  run.play();
  return { hits, dropped, far, way: b.kit?.beatenBy, froze: still > 3 };
}

const TIERS: Array<[string, FirstTimer]> = [['middle', FT_MIDDLE], ['middle easy', FT_MIDDLE_EASY], ['child easy', FT_CHILD_EASY], ['expert', FT_EXPERT]];
const SEEDS = [1, 2, 3, 4, 5, 6];

test('the freeze: every tier bot (child on Easy, middle both, expert) freezes in the boa\'s rear, beats it by stillness and walks on unhurt', () => {
  for (const [name, who] of TIERS) for (const s of SEEDS) {
    const r = play(who, s);
    assert.deepEqual([r.hits, r.way, r.far], [0, 'still', true], `${name} seed ${s}`);
  }
});

test('PLANTED: the freeze removed, every one of those bots fails the toy (its coil or strike takes a heart)', () => {
  for (const [name, who] of TIERS) {
    const hit = SEEDS.filter((s) => play({ ...who, noFreeze: true }, s).hits > 0).length;
    console.log(`${name}: hit on ${hit}/${SEEDS.length} seeds without the freeze`);
    assert.ok(hit >= (name.startsWith('child') ? 1 : SEEDS.length - 1), `${name}: hit on ${hit}/${SEEDS.length} seeds without the freeze`);
  }
});

test('the child on Normal: its reaction (KID\'s stopReact 0.4 s + its thumb) against the 13 frames (0.43 s) Normal leaves: printed, named in the REPORT', () => {
  const R = SEEDS.map((s) => play(FT_CHILD, s));
  console.log(`child normal: unhurt ${R.filter((r) => r.hits === 0).length}/${R.length}, beaten by stillness ${R.filter((r) => r.way === 'still').length}/${R.length}`);
});

test('the roost: by an eagle\'s roost on a creaky limb, every tier walks on: the boa flees in its first rear frame, he is never hit', () => {
  let drops = 0;
  for (const [name, who] of [...TIERS, ['child', FT_CHILD] as [string, FirstTimer]]) for (const s of SEEDS) {
    const r = play(who, s, { roost: true });
    assert.deepEqual([r.hits, r.way, r.far], [0, 'lure', true], `${name} seed ${s}`);
    if (r.dropped) drops++;
  }
  // (a drop to the bough below is the bot's own thumb pausing on a 1.1 s limb, 1-5's creak lesson, with or without the roost: printed)
  console.log(`roost: dropped to the bough below on ${drops}/${SEEDS.length * (TIERS.length + 1)} runs (the limb, not the boa)`);
});

test('PLANTED: the roost taken away, the same bots must stop for the boa (beaten by stillness) or are hit, on every seed: the roost is what lets them walk on', () => {
  for (const [name, who] of [...TIERS, ['child', FT_CHILD] as [string, FirstTimer]]) for (const s of SEEDS) {
    const r = play(who, s, { limb: true });
    assert.ok(r.way === 'still' || r.hits > 0, `${name} seed ${s}: ${JSON.stringify(r)}`);
  }
});

if (process.env.BOA_BOTS_TABLE) test('table', () => {
  for (const [name, who] of [...TIERS, ['child', FT_CHILD] as [string, FirstTimer]]) {
    const row = (o: object, w: FirstTimer) => SEEDS.map((s) => { const r = play(w, s, o); return `${r.hits}${r.dropped ? 'D' : ''}${r.way?.[0] ?? '-'}${r.far ? '' : 'X'}`; }).join(' ');
    console.log(name.padEnd(12), '| freeze', row({}, who), '| none', row({}, { ...who, noFreeze: true }), '| roost', row({ roost: true }, who), '| limb', row({ limb: true }, who));
  }
});
