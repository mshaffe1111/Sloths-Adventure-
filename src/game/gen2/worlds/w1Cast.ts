/**
 * World 1's cast rows and drop traps as kit data (reference/design/PREDATORS.md §3; GAME-MAP B2): what a World 1 stage whose brief
 * names a cast is laid with. Rows only: no shipped stage's manifest holds them yet (1-3 is laid test-side, tools/engine/library13.ts).
 *
 * A drop trap is a linked pair of props, so a load is never laid without its handle: the RECEPTOR is the load (a hive, a stone) on the
 * animal's own ground, the SOURCE its handle (a vine he shakes, a tendril he cuts) on the ground before it, out of the animal's reach.
 * Both sockets sit on the surface (dn 0): the socket's y is the ground he stands on, and the ground the load comes down on.
 */
import type { TrapPost } from '../../castPlay.types.ts';
import type { CreatureDef, PropDef, PropEmitter, PropPair, StageSink } from '../types.ts';

/** how high over its ground a load hangs (px): over his head on a double jump's rise, so he can never bump it down by accident */
export const TRAP_HANG = 210;

/** the Golden Tree Snake as a laid creature (today's body: 38 x 22, its feet 14 under its middle), and the sleeping one a lesson starts with */
export const W1_CAST_CREATURES: CreatureDef[] = [
  { id: 'snake', enemy: 'snake', threat: 2, terrain: 'ledge', minGround: 200, w: 38, h: 22, hp: 1, footY: 14, tags: ['cast'] },
  { id: 'snake-asleep', enemy: 'snake', threat: 1, terrain: 'ledge', minGround: 200, w: 38, h: 22, hp: 1, footY: 14, extra: { asleep: true }, easyFirst: true, tags: ['sleeper'] },
];

export const W1_TRAP_PROPS: PropDef[] = [
  { id: 'trap-hive', tags: ['trap-load'], w: 60, minApart: 300, beat: true },
  { id: 'trap-stone', tags: ['trap-load'], w: 60, minApart: 300, beat: true },
  { id: 'trap-vine', tags: ['trap-handle'], w: 40, minApart: 300 },
  { id: 'trap-tendril', tags: ['trap-handle'], w: 40, minApart: 300 },
];

/** the handle stands 150 px or more from its load (a snake strikes within 105, and 42 of reach) and never out of sight of it */
export const W1_TRAP_PAIRS: PropPair[] = [
  { id: 'vine-hive', source: 'trap-vine', receptor: 'trap-hive', minApart: 150, maxApart: 520 },
  { id: 'tendril-stone', source: 'trap-tendril', receptor: 'trap-stone', minApart: 150, maxApart: 520 },
  { id: 'vine-stone', source: 'trap-vine', receptor: 'trap-stone', minApart: 150, maxApart: 520 },
  { id: 'tendril-hive', source: 'trap-tendril', receptor: 'trap-hive', minApart: 150, maxApart: 520 },
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
