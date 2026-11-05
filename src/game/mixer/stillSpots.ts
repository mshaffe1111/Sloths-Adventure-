/**
 * Where stage.ts shoots a stage's stills (the lead, 11-05: the start, each fork's two roads, the double teach's block, the golden seed,
 * and the end log with the bootprint place; upright and sideways). From gen2's meta when the stage builds on gen2 (meta.gen2.nodes:
 * token and x-range, the planner's; a block's own x when the node names one), else from the mixer's beats, as before.
 * Each spot is [name, x, which road the camera follows: 'high' | 'low'].
 */
export type Spot = [string, number, 'high' | 'low'];
interface StageIn {
  spawnX: number;
  exitTotemX: number;
  collectibles: Array<{ type: string; x: number }>;
  proto?: { beats?: Array<[number, number, string]> };
  meta?: { gen2?: { nodes?: Array<{ token: string; x0: number; x1: number; block?: number }> } };
}

export function stillSpots(st: StageIn): Spot[] {
  const spots: Spot[] = [['start', st.spawnX + 80, 'low']];
  const nodes = st.meta?.gen2?.nodes;
  if (nodes) {
    // (a fork is written F[high|low], NODES §8.2: the node's first character; a teach of the double is T with the move digit 2)
    for (const n of nodes) if (n.token.startsWith('F')) spots.push(['fork-high', n.x0 + 120, 'high'], ['fork-low', n.x0 + 120, 'low']);
    const dbl = nodes.find((n) => n.token[0] === 'T' && /^T[a-z]?2/.test(n.token));
    if (dbl) spots.push(['double-teach-block', dbl.block ?? (dbl.x0 + dbl.x1) / 2, 'low']);
  } else {
    const beats = st.proto?.beats ?? [];
    for (const b of beats) if (/fork/.test(b[2].split(':')[0]) && !/crossings/.test(b[2])) spots.push([`fork-${b[2].includes('high road') ? 'high' : 'low'}`, b[0] + 120, b[2].includes('high road') ? 'high' : 'low']);
    const dbl = beats.find((b) => b[2].startsWith('teach double:'));
    if (dbl) spots.push(['double-teach', dbl[0] + 60, 'low']);
  }
  const seed = st.collectibles.find((c) => c.type === 'seed');
  if (seed) spots.push(['golden-seed', seed.x - 100, 'low']);
  // (the end log with the exit totem; the bootprint's place is in its moss, just before the totem)
  spots.push(['end-log', st.exitTotemX - 200, 'low']);
  return spots;
}
