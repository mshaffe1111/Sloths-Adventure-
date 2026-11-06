/**
 * How 1-1 is built: gen2 1-1 from the proven-seed list, always (old 1-1's builder and Matt's Old 1-1 / Rolls picker are deleted: new
 * replaces old, 0.9.5).
 *   - 'play': the card's own Play button, a fresh proven seed each press (every build);
 *   - 'A' | 'B' | 'C': QA measuring only (a QA build, set by the tests and stage.ts --roll, never a button): gen2 1-1 on the seed from
 *     testlink1_1.json, so a check measures a named roll. Not a switch between builders: every pick is gen2.
 */
import ROLLS from './testlink1_1.json';
import { qaBuild } from './playRecorder.ts';
import { provenSeedFor, provenSeeds } from './gen2/seedList.ts';

export type Pick11 = 'play' | 'A' | 'B' | 'C';
let pick: Pick11 = 'play';
/** set the pick ('play': the card's own Play button; A/B/C only from the tests and tools, in a QA build) */
export const setPick11 = (p: Pick11): void => { pick = p; };
/** how 1-1 is built now: gen2 from the proven-seed list ('play') outside a QA build */
export const pick11 = (): Pick11 => (qaBuild() ? pick : 'play');
/** the seed of a gen2 roll */
export const roll11Seed = (p: 'A' | 'B' | 'C'): number => (ROLLS as Record<string, number>)[p];

/**
 * 1-1's Play (the lead, 11-06, Matt: "1-1's Play = gen2, a fresh proven seed per play"): each press of Play draws a seed from the proven
 * list (gen2/seedList.ts), kept until the next press, so a restart or a respawn in the same play builds the same stage. With no draw yet
 * (the tests and the tools) the stage's layout variant picks it, so a run is the same each time
 */
let playSeed: number | null = null;
/** the next play's seed, drawn ahead so its stage can be built while the map is up (buildAhead.ts); Play takes it */
let nextSeed: number | null = null;
/**
 * Which proven entry a play gets (the lead, 11-06: no repeat until the whole list has been played): each device keeps a shuffled order of
 * the list in local storage and takes the next one at each Play; a new list (another length) is shuffled afresh, and a new round never
 * starts with the entry that ended the last. Storage blocked: a fresh shuffle each session, the same rule within it
 */
const ORDER_KEY = 'sloth_play11_order';
let memOrder: { n: number; order: number[]; i: number } | null = null;
function readOrder(n: number, rand: () => number): { n: number; order: number[]; i: number } {
  let o = memOrder;
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (raw) o = JSON.parse(raw);
  } catch {
    /* storage blocked: kept in memory */
  }
  if (!o || o.n !== n || !Array.isArray(o.order) || o.order.length !== n || o.i >= n) {
    const last = o && o.n === n && o.order?.length === n ? o.order[n - 1] : -1;
    const order = Array.from({ length: n }, (_, j) => j);
    for (let j = n - 1; j > 0; j--) { const r = Math.floor(rand() * (j + 1)); [order[j], order[r]] = [order[r], order[j]]; }
    if (n > 1 && order[0] === last) [order[0], order[1]] = [order[1], order[0]];
    o = { n, order, i: 0 };
  }
  return o;
}
function writeOrder(o: { n: number; order: number[]; i: number }) {
  memOrder = o;
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(o));
  } catch {
    /* storage blocked: kept in memory */
  }
}
const drawNext = (rand: () => number): number => {
  const n = provenSeeds('1-1').length;
  const o = readOrder(n, rand);
  writeOrder(o);
  return provenSeedFor('1-1', o.order[o.i]);
};
export const peekPlay11 = (rand: () => number = Math.random): number => (nextSeed ??= drawNext(rand));
export const newPlay11 = (rand: () => number = Math.random): number => {
  playSeed = nextSeed ?? drawNext(rand);
  nextSeed = null;
  // (this entry is played: the next Play takes the one after it)
  const o = readOrder(provenSeeds('1-1').length, rand);
  writeOrder({ ...o, i: o.i + 1 });
  return playSeed;
};
export const play11Seed = (variant: number): number => playSeed ?? provenSeedFor('1-1', variant - 1);
/** run `fn` as if `seed` had been drawn for this play (the build-ahead builds the next play's stage with it) */
export function withPlaySeed<T>(seed: number, fn: () => T): T {
  const was = playSeed;
  playSeed = seed;
  try {
    return fn();
  } finally {
    playSeed = was;
  }
}
/** forget the drawn seeds (tests) */
export const clearPlay11 = (): void => { playSeed = null; nextSeed = null; memOrder = null; try { localStorage.removeItem(ORDER_KEY); } catch { /* blocked */ } };

/**
 * A child process measuring a picked roll (stage.ts --roll, the red team's RT-ENGINE #1: its children graded the mixer's 1-1): set the
 * pick from STAGE_ROLL (A, B or C) and stand in for a QA build, so generateStage builds that roll. Returns the roll and the seed it must
 * measure (the caller asserts it on what it built), or null when no roll is asked for. Throws on an unknown roll: never a silent fallback
 */
export async function applyRollEnv(env: Record<string, string | undefined>): Promise<{ roll: 'A' | 'B' | 'C'; seed: number } | null> {
  const r = env.STAGE_ROLL;
  if (!r) return null;
  if (r !== 'A' && r !== 'B' && r !== 'C') throw new Error(`STAGE_ROLL=${r}: A, B or C`);
  const { asQaBuildForTest } = await import('./playRecorder.ts');
  asQaBuildForTest(true);
  setPick11(r);
  return { roll: r, seed: roll11Seed(r) };
}
