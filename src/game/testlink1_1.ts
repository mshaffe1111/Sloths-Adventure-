/**
 * How 1-1 is built. The card's own Play button is gen2 1-1 from the proven-seed list (below). The rest is TEST-LINK ONLY, REMOVE BEFORE
 * ANY RELEASE with the restored old 1-1 block in protoStage.ts (new replaces old): Matt's picker (the lead, 11-05: he compares OLD 1-1 with
 * gen2 1-1's Rolls A, B and C on his phone), in a QA build with its flag only (pickerOn); the pick holds until another is made.
 *   - 'play': gen2 1-1, a fresh proven seed each press of Play;
 *   - 'old': main's 1-1 builder as it is (protoStage.ts with 1-1's mixer spec skipped);
 *   - 'A' | 'B' | 'C': gen2 1-1 from World 1's kit (gen2/worlds/w1.ts), the seed from testlink1_1.json, which the lead sets at publish.
 */
import ROLLS from './testlink1_1.json';
import { qaBuild } from './playRecorder.ts';
import { provenSeedFor, provenSeeds } from './gen2/seedList.ts';

export type Pick11 = 'play' | 'old' | 'A' | 'B' | 'C';
let pick: Pick11 = 'play';
/** set the pick ('play': the card's own Play button; the others only from Matt's picker in a QA build) */
export const setPick11 = (p: Pick11): void => { pick = p; };
/** how 1-1 is built now: gen2 from the proven-seed list ('play') outside a QA build */
export const pick11 = (): Pick11 => (qaBuild() ? pick : 'play');
/** the seed of a gen2 roll */
export const roll11Seed = (p: 'A' | 'B' | 'C'): number => (ROLLS as Record<string, number>)[p];
/** whether 1-1's mixer spec is skipped (the old builder) */
export const skip11Spec = (id: string): boolean => id === '1-1' && pick11() === 'old';

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

/** Matt's picker (Old 1-1, Rolls A/B/C) shows only in a QA build with its flag: ?pick11 once (kept on the device), never for testers */
export function pickerOn(): boolean {
  if (!qaBuild()) return false;
  try {
    if (typeof location !== 'undefined' && new URLSearchParams(location.search).has('pick11')) localStorage.setItem('sloth_qa_pick11', '1');
    return localStorage.getItem('sloth_qa_pick11') === '1';
  } catch {
    return false;
  }
}

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
