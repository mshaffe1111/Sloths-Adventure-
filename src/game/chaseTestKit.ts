/**
 * chaseTestKit — the tests' way to a LAID chase (gen2 chaseLay, run by pieces/chasePiece.ts) on whichever stages lay one, with no stage
 * id, seed or x of the game's in the tests (ENG-LOOK (1): the hand-built 1-8 and the engine's own collapse are deleted; the rules its
 * tests held now hold on every chase stage). Test support only: nothing in the game imports it.
 */
import { STAGE_TABLE } from './gen2/worlds/stageTable.ts';
import { RealPlay } from './realPlay.ts';
import type { ChaseLay, ChaseRun } from './chase.ts';
import type { Platform } from './types.ts';

let found: string[] | null = null;
/** every listed stage that lays a chase (the stage table's rows, each built once on Normal); never empty, or the rules hold on nothing */
export function laidChaseStages(): string[] {
  if (found) return found;
  found = Object.keys(STAGE_TABLE).filter((id) => !!new RealPlay(id, 1).stage.chase?.stretches.length);
  if (!found.length) throw new Error('no listed stage lays a chase: the chase rules would hold on nothing');
  return found;
}

/** the running chase piece's run (its fronts, one a stretch) on an engine */
export function chaseRunOf(e: unknown): ChaseRun {
  const piece = (e as { pieces: Array<{ kind: string; run?: ChaseRun }> }).pieces.find((q) => q.kind === 'chase');
  if (!piece?.run) throw new Error('no chase piece runs on this stage');
  return piece.run;
}

/**
 * A stretch past the first with a flag on the living fork before it (a laid chase's flags are on its forks only, gen2/chaseLay.ts):
 * the first such stretch long enough to run `room` px into, its index and that flag (the last one before its crack)
 */
export function forkFlag(lay: ChaseLay, checkpoints: ReadonlyArray<{ x: number; y: number }>, room = 1200): { i: number; flag: { x: number; y: number } } {
  for (let i = 1; i < lay.stretches.length; i++) {
    const st = lay.stretches[i];
    if (st.end - st.start < room + 200) continue;
    const prev = lay.stretches[i - 1].end;
    const on = checkpoints.filter((c) => c.x >= prev && c.x < st.start).sort((a, b) => b.x - a.x)[0];
    if (on) return { i, flag: { x: on.x, y: on.y } };
  }
  throw new Error('no stretch past the first has a flag on its fork');
}

/** the chase section at or just past x (its top the highest there) and the x to stand him at on it: where he runs on the branch */
export function sectionAt(platforms: readonly Platform[], x: number): { pl: Platform; x: number } {
  const secs = platforms.filter((q) => q.chase && !q.broken && q.width >= 60).sort((a, b) => a.x - b.x || a.y - b.y);
  const pl = secs.find((q) => x >= q.x + 10 && x <= q.x + q.width - 10) ?? secs.find((q) => q.x + 10 > x);
  if (!pl) throw new Error(`no branch section at or past x ${Math.round(x)}`);
  return { pl, x: Math.max(pl.x + 10, Math.min(pl.x + pl.width - 10, x)) };
}
