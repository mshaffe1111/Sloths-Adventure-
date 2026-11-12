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
/** and the same two on a SHORT patch (120 px), the snake under a trap: it stays under its load and on an upright phone's screen.
 *  A snake under its own trap costs a beat's threat 1, awake or asleep: he has the tool for it right there, so it is less of a
 *  threat than a bare one (2). That is what lets Normal's later beats hold awake snakes (the lead, 11-12: Normal runs hotter) */
export const W1_CAST_CREATURES: CreatureDef[] = SNAKES.flatMap((c) => [
  c,
  { ...c, id: c.id === 'snake' ? 'snake-trapped' : 'snake-trapped-asleep', threat: 1, minGround: 120, tags: [...(c.tags ?? []).filter((t) => t !== 'topup'), 'trapped'] },
]);

export const W1_TRAP_PROPS: PropDef[] = [
  { id: 'trap-hive', tags: ['trap-load'], w: 60, minApart: 300, beat: true },
  { id: 'trap-stone', tags: ['trap-load'], w: 60, minApart: 300, beat: true },
  { id: 'trap-vine', tags: ['trap-handle'], w: 40, minApart: 300 },
  { id: 'trap-tendril', tags: ['trap-handle'], w: 40, minApart: 300 },
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
  return { emit, spawn: (e, c, out) => {
    if (!kinds.includes(e.type)) return;
    const hold = of(out).proto.cast?.traps ?? [], top = e.y + (c.footY ?? c.h / 2), mid = (e.patrolMinX + e.patrolMaxX) / 2;
    const k = hold.findIndex((t) => Number.isFinite(t.x) && Math.abs(t.loadX - e.x) <= TRAP_UNDER && Math.abs(t.landY - top) <= 6 && Math.abs(mid - t.x) >= TRAP_REACH[0] && Math.abs(mid - t.x) <= TRAP_REACH[1]);
    if (k < 0) return;
    const live = (out.proto.cast ??= { kinds: [], traps: [], said: W1_CAST_SAID }).traps;
    live.push({ ...hold.splice(k, 1)[0], id: live.length + 1, loadX: Math.round(mid) });
    // (a SLEEPER lies right under its load, in the middle of its patch: the lay stood it 61 px on, at the patch's far end (it keeps an
    //  animal 120 px from any prop's socket), half off an upright phone's screen from the vine. One awake paces the whole patch)
    if (e.asleep) e.x = Math.round(mid);
  } };
}
