/**
 * predators/ways — how the roster's data plays in one world (moved out of roster.ts, which stays data only under its world-data
 * exemption; this file is engine code under the generality gate, R-165.153).
 */
import { ALLIES, CASTS, TAUGHT } from './roster.ts';
import { isZonePost } from './lure.ts';
import type { PredatorDef, Way } from './types.ts';

/**
 * An animal as it plays in one world: the ways that world has not been taught yet are taken off its list, the food chain is off it
 * when nothing it fears lives there, and it answers no lure before the first one (the bell) is taught. The same object back when
 * nothing changes. A stage lays its cast through this, so a way can never appear before its move (predatorRoster.test.ts). A fear of a
 * zone kind (the spore cloud) is no creature, so no world's cast is asked for it: the stage lays its patch, and lureLay.ts lureFaults
 * holds that stage to a post the animal can be drawn to.
 */
export function inWorld(def: PredatorDef, world: number): PredatorDef {
  const about: readonly string[] = [...(CASTS[world] ?? []), ...(ALLIES[world] ?? [])];
  const keep = (w: Way): boolean => TAUGHT[w] <= world && (w !== 'lure' || !def.fears || def.fears.some((k) => about.includes(k) || isZonePost({ fear: k })));
  const ways = Object.keys(def.beatenBy) as Way[];
  const deaf = def.hears !== undefined && TAUGHT.bell > world;
  if (ways.every(keep) && !deaf) return def;
  const beatenBy: PredatorDef['beatenBy'] = {};
  for (const w of ways) if (keep(w)) Object.assign(beatenBy, { [w]: def.beatenBy[w] });
  return { ...def, beatenBy, hears: deaf ? undefined : def.hears };
}
