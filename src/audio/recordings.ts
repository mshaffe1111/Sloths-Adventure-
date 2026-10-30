/**
 * Which recording plays for a piece the game asks for (scenes.ts names pieces by their score's id). Pure, so it is tested without audio.
 *
 *   a piece recorded under its own id (the title, the map, the results, the story, the bosses, Meeca's march) plays that recording
 *   a stage's own composition (composer.ts `gen-<world>-<seed>-<pace>`, themes.ts `world<n>s-<seed>`) has no recording of its own: a
 *     stage is a new composition on every entry, and they cannot all be recorded. It plays one of its world's recordings for that pace
 *     (the manifest's `stages`), chosen by the stage's seed, so the choice changes from entry to entry as the composition did
 */
import type { LoopManifest } from './loops.ts';

/** world and pace of a stage's composed piece; null for any other id */
export function stageOf(id: string): { world: number; pace: string } | null {
  const g = /^gen-(\d{1,2})-\d{1,10}(?:-([a-z]))?$/.exec(id);
  if (g) return { world: Number(g[1]), pace: g[2] ?? 'r' };
  const w = /^world(\d{1,2})s-\d{1,10}$/.exec(id);
  if (w) return { world: Number(w[1]), pace: 'r' };
  return null;
}

/** the recording (a manifest piece name) for a piece; null when there is none */
export function recordingFor(m: LoopManifest, id: string, seed = 0): string | null {
  if (m.pieces[id]) return id;
  const st = stageOf(id);
  if (!st) return null;
  const pick = (list: string[] | undefined) => (list?.length ? list[(seed >>> 0) % list.length] : null);
  // the world's recordings for this pace; or else for any pace of the world (run first: most stages are runs)
  return (
    pick(m.stages[`w${st.world}-${st.pace}`]) ??
    pick(m.stages[`w${st.world}-r`]) ??
    pick(Object.entries(m.stages).find(([k]) => k.startsWith(`w${st.world}-`))?.[1])
  );
}
