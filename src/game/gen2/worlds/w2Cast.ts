/**
 * World 2's cast rows as kit data (ENG-25; 2-5.md NEW 2; reference/design/PREDATORS.md §2): the SNAPPING TURTLE (predators/world2.ts
 * TURTLE) laid on a stage clock, its snap stones' bar (gen2/rideLay.ts snapClock, a 'snap' row's clock `snap-<row>`): it keeps the count
 * the stones keep, its tell only on the bar's creak and its snap only on four (Enemy.kitBeat; castPlay.ts hands it the clock's read). The
 * first a lesson meets is ASLEEP (level.md rule 7: the kick cannot fail). A kick ends it 'chasedOff': it paddles off downstream, huffy,
 * never hurt, and the purge counts it (engine.ts stepCast `cleared`); a stomp stuns it 1.8 s, then a kick (TURTLE.beatenBy).
 * Rows only: a stage names the cast in its brief (`cast: ['turtle']`) and its snapper rows on the clock of one of its own snap rows.
 * Nothing here is a stage's: no ids, no x (generalitycheck).
 */
import type { ClockId } from '../../stageKit.types.ts';
import type { CreatureDef, StageSink } from '../types.ts';
import type { Enemy } from '../../types.ts';

/** the snapper's body as the hand-built river laid it (w2Stages.ts, 48 x 24, its feet 14 under its middle) */
const BODY = { enemy: 'turtle', terrain: 'flat', minGround: 120, w: 48, h: 24, hp: 1, footY: 14 } as const;

/** the snapper rows for a stage whose stones keep `clock` (`snap-<row>`): the awake one (a purge's top-up) and the sleeper a lesson starts with */
export const w2Snappers = (clock: ClockId): CreatureDef[] => [
  { id: 'snapper', ...BODY, threat: 2, extra: { kitBeat: { clock } }, tags: ['cast', 'topup'] },
  { id: 'snapper-asleep', ...BODY, threat: 1, extra: { asleep: true, kitBeat: { clock } }, easyFirst: true, tags: ['sleeper'] },
];

/** the kit's spawn hook (WorldKit.spawn): a snapper laid on a clock joins the stage's cast, so castPlay.ts runs it on the beat (as a still
 *  row names its watcher, stillLay.ts); an animal with no clock is left as it was */
export function w2CastSpawn(e: Enemy, _c: CreatureDef, out: StageSink): void {
  if (!e.kitBeat) return;
  const cast = (out.proto.cast ??= { kinds: [], traps: [] });
  if (!cast.kinds.includes(e.type)) cast.kinds.push(e.type);
}
