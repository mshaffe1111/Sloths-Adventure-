/**
 * World 1's cast rows and drop traps as kit data (reference/design/PREDATORS.md §3; GAME-MAP B2): what a World 1 stage whose brief
 * names a cast is laid with. Rows only: no shipped stage's manifest holds them yet (1-3 is laid test-side, tools/engine/library13.ts).
 *
 * A drop trap is a linked pair of props, so a load is never laid without its handle: the RECEPTOR is the load (a hive, a stone) on the
 * animal's own ground, the SOURCE its handle (a vine he shakes, a tendril he cuts) on the ground before it, out of the animal's reach.
 * Both sockets sit on the surface (dn 0): the socket's y is the ground he stands on, and the ground the load comes down on.
 *
 * A trap is ARMED by its animal (`armedTraps`): the load's socket only asks for a trap on that ground; the load is HUNG over the
 * middle of the patch of the animal that stays there, and a load whose animal the lay did not keep (Easy's cut, a flag's pad) is no
 * trap at all. THE PHONE'S NUMBERS, measured on stills of a roll (W1C, 11-12): an upright phone shows about 425 px of stage with him
 * a third of the way in, so from the handle the hung load is 140-190 px on and the animal's whole patch is on screen; a sideways
 * phone shows about 150 px over his head under the HUD, so a load hangs 100 px over its ground, no higher.
 */
import type { TrapPost } from '../../castPlay.types.ts';
import { TRAP } from '../../dropTrap.ts';
import type { Enemy } from '../../types.ts';
import type { LimbPlatform } from '../creak.ts';
import type { CreatureDef, PropDef, PropEmitter, PropPair, StageSink } from '../types.ts';

/** how high over its ground a load hangs (px): over his head as he walks under it (he is 89 px), over a rearing snake, and low enough
 *  that a sideways phone shows it under the HUD from the handle (at 210 it sat behind the goal sign) */
export const TRAP_HANG = 100;

/** the Golden Tree Snake as a laid creature (today's body: 38 x 22, its feet 14 under its middle), on its own 200 px branch: the awake
 *  one (a purge's top-up lays the rows tagged `topup`: never a sleeper) and the sleeping one a lesson starts with */
const SNAKES: CreatureDef[] = [
  { id: 'snake', enemy: 'snake', threat: 2, terrain: 'ledge', minGround: 200, w: 38, h: 22, hp: 1, footY: 14, tags: ['cast', 'topup'] },
  { id: 'snake-asleep', enemy: 'snake', threat: 1, terrain: 'ledge', minGround: 200, w: 38, h: 22, hp: 1, footY: 14, extra: { asleep: true }, easyFirst: true, tags: ['sleeper'] },
];
/** and the same two on a SHORT patch (100 px and more; 1-3's is 105), the snake under a trap: it stays under its load and on an upright phone's screen.
 *  A snake under its own trap costs a beat's threat 1, awake or asleep: he has the tool for it right there, so it is less of a
 *  threat than a bare one (2). That is what lets Normal's later beats hold awake snakes (the lead, 11-12: Normal runs hotter) */
export const W1_CAST_CREATURES: CreatureDef[] = SNAKES.flatMap((c) => [
  c,
  // (ASLEEP under its own trap it is the least threat in the level, half a beat's: a teach beat's budget, 0.3 of the stage's, then
  //  holds the lesson's sleeper AND the "now you" one after it; at 1 the second log lay empty, its hive unhung)
  { ...c, id: c.id === 'snake' ? 'snake-trapped' : 'snake-trapped-asleep', threat: c.id === 'snake' ? 1 : 0.5, minGround: 100, tags: [...(c.tags ?? []).filter((t) => t !== 'topup'), 'trapped'] },
]);

export const W1_TRAP_PROPS: PropDef[] = [
  { id: 'trap-hive', tags: ['trap-load'], w: 60, minApart: 300, beat: true },
  { id: 'trap-stone', tags: ['trap-load'], w: 60, minApart: 300, beat: true },
  { id: 'trap-vine', tags: ['trap-handle'], w: 40, minApart: 300 },
  { id: 'trap-tendril', tags: ['trap-handle'], w: 40, minApart: 300 },
  // (a creaky limb that IS the load, gen2/creak.ts: its socket stands on the limb, and riding it down chases off what it lands beside)
  { id: 'trap-limb', tags: ['trap-limb'], w: 40, minApart: 300, beat: true },
];

/** the two SOCKETS of a pair stand 85-130 px apart: the handle's, and the load's at the near end of the animal's patch. So he stands
 *  at the handle (a step short of it) 105 px or more from the nearest the animal can come (its strike), and the load, hung over the
 *  middle of a 120 px patch, is 140-190 px from the handle */
export const W1_TRAP_PAIRS: PropPair[] = [
  { id: 'vine-hive', source: 'trap-vine', receptor: 'trap-hive', minApart: 85, maxApart: 130 },
  { id: 'tendril-stone', source: 'trap-tendril', receptor: 'trap-stone', minApart: 85, maxApart: 130 },
  { id: 'vine-stone', source: 'trap-vine', receptor: 'trap-stone', minApart: 85, maxApart: 130 },
  { id: 'tendril-hive', source: 'trap-tendril', receptor: 'trap-hive', minApart: 85, maxApart: 130 },
];

const trapsOf = (out: StageSink): TrapPost[] => (out.proto.cast ??= { kinds: [], traps: [] }).traps;
/** the load is laid first (the pair's receptor): its trap waits for its handle */
const load = (what: TrapPost['load']): PropEmitter => (f, _p, out) => {
  const t = trapsOf(out);
  t.push({ id: t.length + 1, kind: 'vine', load: what, x: NaN, y: f.y, loadX: f.x, loadY: f.y - TRAP_HANG, landY: f.y });
};
/** then its handle (the pair's source): the last load laid without one */
const handle = (kind: TrapPost['kind']): PropEmitter => (f, _p, out) => {
  const t = trapsOf(out).find((q) => Number.isNaN(q.x));
  if (t) Object.assign(t, { kind, x: f.x, y: f.y });
};
/**
 * A falling limb (1-5's "he is the stone", 1-4's cluster gate): the socket stands on a creaky limb (gen2/creak.ts); the limb is the load,
 * its trap has no handle, and it lands on the first solid ground under its middle. Laid straight into the stage's traps (no animal
 * arms it: the trap rules, dropTrap.ts limbFaults, say whether an animal stands beside where it lands and none under it)
 */
const limbLoad: PropEmitter = (f, _p, out) => {
  const limb = out.platforms.find((q) => q.type === 'fragile' && q.creak !== undefined && f.x >= q.x && f.x <= q.x + q.width && Math.abs(q.y - f.y) <= 2);
  if (!limb) throw new Error(`w1Cast: a falling limb's socket at x ${Math.round(f.x)} stands on no creaky limb`);
  const mid = limb.x + limb.width / 2;
  const under = out.platforms.filter((q) => q !== limb && q.type !== 'fragile' && q.y > limb.y + limb.height && mid >= q.x && mid <= q.x + q.width).sort((a, b) => a.y - b.y)[0];
  if (!under) throw new Error(`w1Cast: the falling limb at x ${Math.round(mid)} has no ground under it`);
  (limb as LimbPlatform).trapLoad = true;
  const live = (out.proto.cast ??= { kinds: [], traps: [], said: W1_CAST_SAID }).traps;
  live.push({ id: live.length + 1, kind: 'limb', load: 'limb', limb: limb.id, w: limb.width, x: Math.round(mid), y: limb.y, loadX: Math.round(mid), loadY: limb.y + limb.height, landY: under.y });
};
export const W1_TRAP_EMIT: Record<string, PropEmitter> = {
  'trap-hive': load('hive'), 'trap-stone': load('stone'), 'trap-vine': handle('vine'), 'trap-tendril': handle('tendril'),
};

/** Dot's words for World 1's cast (the story keeper's ruling, 11-12, reference/packets/2026-11-12/STORY-LINES.md): once, on the first
 *  trap sprung in World 1, as the snake glides away. Her line for the first PUNCH that sends one gliding is 1-3's wayside line today
 *  (wayside.ts, said at the halfway mark): it moves here when the wayside lets a line wait on a moment instead of a place */
export const W1_CAST_SAID: { trap?: string; punch?: string } = { trap: 'Off he glides, not a scratch, just very offended!' };

/** how near its load's socket an animal must stand, on the ground the load lands on, for the trap to be its own (px) */
export const TRAP_UNDER = 150;
/** the hung load's distance from its handle (px): the trap machine's own rule (dropTrap.ts TRAP.reach) */
export const TRAP_REACH: readonly [number, number] = TRAP.reach;

/**
 * The kit hooks that ARM the traps (a WorldKit's `emit` and `spawn`): the props' emitters above write to a waiting list, and `spawn`,
 * which the lay calls for every animal that STAYS (a socket's or the top-up's), takes the waiting trap whose load socket is on that
 * animal's ground within TRAP_UNDER px, hangs its load over the MIDDLE of the animal's patch and moves it into `proto.cast.traps`,
 * if the hung load is then TRAP_REACH from its handle. A load whose animal was cut (Easy's 60%, a flag's pad, the spacing) is no
 * trap on that setting (measured with the raw emitters, tools/engine/library13.ts --raw-traps: 383 of 902 Easy loads hung over an
 * empty branch).
 */
export function armedTraps(kinds: readonly string[] = ['snake']): { emit: Record<string, PropEmitter>; spawn: (e: Enemy, c: CreatureDef, out: StageSink) => void } {
  const waiting = new WeakMap<StageSink, StageSink>();
  const of = (out: StageSink): StageSink => waiting.get(out) ?? (waiting.set(out, { proto: {} } as StageSink), waiting.get(out)!);
  const emit = Object.fromEntries(Object.entries(W1_TRAP_EMIT).map(([id, fn]) => [id, ((f, p, out) => fn(f, p, of(out))) as PropEmitter]));
  emit['trap-limb'] = limbLoad;
  return { emit, spawn: (e, c, out) => {
    if (!kinds.includes(e.type)) return;
    const hold = of(out).proto.cast?.traps ?? [], top = e.y + (c.footY ?? c.h / 2), mid = (e.patrolMinX + e.patrolMaxX) / 2;
    const k = hold.findIndex((t) => Number.isFinite(t.x) && Math.abs(t.loadX - e.x) <= TRAP_UNDER && Math.abs(t.landY - top) <= 6 && Math.abs(mid - t.x) >= TRAP_REACH[0] && Math.abs(mid - t.x) <= TRAP_REACH[1]);
    if (k < 0) {
      // (a second SLEEPER on the very patch an armed load hangs over (1-3's two snakes on a log, a designed pair): the two coils lie at
      //  the patch's two ends, so the load hangs over its middle, between them, not the 10 px a lone sleeper's load moves off the vine)
      if (e.asleep) for (const t of out.proto.cast?.traps ?? []) if (Math.abs(t.landY - top) <= 6 && t.loadX > e.patrolMinX && t.loadX < e.patrolMaxX) t.loadX = Math.round(mid);
      return;
    }
    const live = (out.proto.cast ??= { kinds: [], traps: [], said: W1_CAST_SAID }).traps;
    const t0 = hold.splice(k, 1)[0];
    // (over a sleeper the load hangs 10 px past the patch's middle, away from the vine: the sleeper lies at the patch's near end, 52 px
    //  before the middle, and a coil and a hive side by side want 60)
    live.push({ ...t0, id: live.length + 1, loadX: Math.round(mid + (e.asleep ? (t0.x < mid ? 10 : -10) : 0)) });
    // (a SLEEPER lies at the end of its patch NEAREST the vine, so its load, hung over the patch's middle, comes down a coil's width
    //  BESIDE it and never on it (nobody is hurt, D11; right under the load, the glide still showed the stone on the snake). The lay
    //  had stood it at the far end (it keeps an animal 120 px from any prop's socket), half off an upright phone's screen from the
    //  vine. One awake paces the whole patch)
    if (e.asleep) e.x = Math.round(t0.x < mid ? e.patrolMinX : e.patrolMaxX);
  } };
}
