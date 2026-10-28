/**
 * World 3's section versions (the variety pass, 2026-10-28; STAGE-RULES §2 "Variety across rolls", GEMINI-LEDGER C1, C3, C4, C8).
 *
 * The 200-roll tool found every World 3 stage 91-99% alike from roll to roll: the platforms moved, but the order of things to do never
 * changed. Now each stage has two or three authored versions of its main sections (Start, Learn, Develop, Twist, Finish), and the layout
 * roll picks one of each:
 *   - the versions of a section come out of a shuffle bag (gen2/variety.ts ShuffleBag) drawn on the roll's own stream, and a cooldown
 *     (CooldownQueue) over the whole stage keeps one kind of stretch from turning up in two sections of one stage (a dark twist after a
 *     dark develop), so a stage always mixes its world's things;
 *   - the Finish draws its pieces from a shuffle bag (C1) instead of cycling them in a fixed order;
 *   - `mirror` flips the order of the pieces inside a section where nothing depends on it (C8, as far as a side-scroller allows; the
 *     sinkhole climb mirrors for real: its first trunk on the left or the right);
 *   - the grotto's dressing (which pieces stand on the floor, which hang from the roof) rotates with the roll, the stages taking turns
 *     between two halves of the sets (STAGE-RULES §4, as artRoll.ts rollLook does for the kit's sets).
 * The picks are a pure function of the stage and the layout number: a retry keeps the stage, a fresh roll changes it. (Keeping the version
 * a player saw last out of their next roll needs the last roll remembered; that is layoutMemory.ts's job, see the report.)
 */
import { CooldownQueue, ShuffleBag, pickWeighted, type Rng } from './gen2/variety.ts';

/** how many versions each section of each stage has (a section with 1 is the same on every roll) */
export const W3_VERSIONS: Record<string, { start: number; learn: number; develop: number; twist: number; finish: number }> = {
  '3-1': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-2': { start: 3, learn: 2, develop: 3, twist: 2, finish: 3 },
  '3-3': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-4': { start: 1, learn: 2, develop: 3, twist: 3, finish: 2 },
  '3-5': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-6': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-7': { start: 3, learn: 2, develop: 3, twist: 2, finish: 3 },
  '3-8': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-9': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
};

/** the kind of stretch each version is, by stage and section: the stage's cooldown keeps one kind out of two sections */
const KINDS: Record<string, Partial<Record<'develop' | 'twist' | 'finish', readonly string[]>>> = {
  '3-1': { develop: ['spore', 'abyss', 'vine'], twist: ['spore', 'abyss', 'vine'], finish: ['vine', 'spore', 'abyss'] },
  '3-2': { develop: ['fern', 'dark', 'vine'], twist: ['dark', 'plate'], finish: ['fern', 'dark', 'vine'] },
  '3-3': { develop: ['shelf', 'dark', 'abyss'], twist: ['spore', 'shelf', 'floor'], finish: ['shelf', 'dark', 'vine'] },
  '3-4': { develop: ['rope', 'hops', 'dark'], twist: ['rope', 'prowl', 'dark'] },
  '3-5': { develop: ['row', 'abyss', 'dark'], twist: ['dark', 'abyss', 'row'], finish: ['row', 'spore', 'abyss'] },
  '3-6': { develop: ['stones', 'spore', 'abyss'], twist: ['dark', 'spore', 'abyss'], finish: ['stones', 'abyss', 'shelf'] },
  '3-7': { develop: ['eyes', 'vine', 'abyss'], twist: ['dark', 'plate'], finish: ['vine', 'eyes', 'abyss'] },
  '3-8': { develop: ['chain', 'abyss', 'row'], twist: ['chain', 'abyss', 'dark'], finish: ['chain', 'row', 'abyss'] },
  '3-9': { develop: ['tree', 'dark', 'abyss'], twist: ['floor', 'shelf', 'dark'], finish: ['tree', 'abyss', 'dark'] },
};

/** the grotto's dressing sets: what stands on the floor and what hangs from the roof (two halves, the stages take turns) */
export const W3_DECOR_SETS = [
  { floor: ['stalagmites', 'mushrooms', 'fern', 'stalagmites', 'clawRock'], hang: ['stalactite', 'glowLit'] },
  { floor: ['mushrooms', 'clawRock', 'mushrooms', 'stalagmites'], hang: ['glowLit', 'mossCurtain'] },
  { floor: ['stalagmites', 'stalagmites', 'fern', 'pawprint'], hang: ['stalactite', 'stalactite', 'glowLit'] },
  { floor: ['clawRock', 'fern', 'mushrooms', 'bones'], hang: ['mossCurtain', 'stalactite'] },
] as const;
export type W3DecorSet = (typeof W3_DECOR_SETS)[number];

export interface W3Pick {
  start: number;
  learn: number;
  develop: number;
  twist: number;
  finish: number;
  /** flip the order of the pieces inside a section where nothing depends on it */
  mirror: boolean;
  decor: W3DecorSet;
  /** a shuffle bag over the given pieces, on the roll's own stream (the Finish's pieces, C1) */
  bag: <T>(items: readonly T[]) => () => T;
  /** the roll's own stream (0..1), apart from the layout's dice */
  rng: Rng;
}

/** a small seeded stream of its own (mulberry32), so the picks never shift the layout's dice */
function rngOf(seed: number): Rng {
  let a = (seed * 2246822519 + 0x9e3779b9) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** World 3's picks for one stage on one layout number */
export function w3Pick(stage: string, seed: number): W3Pick {
  const v = W3_VERSIONS[stage];
  const no = Number(stage.split('-')[1]) || 0;
  const rng = rngOf(seed * 31 + no * 7919);
  const one = (n: number) => new ShuffleBag(rng, Array.from({ length: n }, (_, i) => i)).draw() ?? 0;
  // the roll's theme: one kind of stretch the roll leans on (two rolls of a stage then differ in what they ask most, not only in where:
  // the 200-roll tool scores rolls by their mix of actions). Each section leans on the theme; the Twist never repeats the Develop's
  // kind (the stage's cooldown), so the middle of a stage always changes pace.
  const kinds = KINDS[stage] ?? {};
  const all = [...new Set(Object.values(kinds).flat())];
  const theme = all.length ? all[Math.floor(rng() * all.length)] : '';
  const cool = new CooldownQueue<string>(1);
  const pick = (sec: 'develop' | 'twist' | 'finish', n: number) => {
    const ks = kinds[sec];
    if (!ks) return one(n);
    const ids = Array.from({ length: n }, (_, i) => i);
    const allowed = sec === 'twist' ? ids.filter((i) => cool.allows(ks[i])) : ids;
    const i = pickWeighted(rng, allowed.length ? allowed : ids, (i) => (ks[i] === theme ? 3 : 1)) ?? 0;
    cool.use(ks[i]);
    return i;
  };
  const start = one(v.start);
  const learn = one(v.learn);
  const develop = pick('develop', v.develop);
  const twist = pick('twist', v.twist);
  const finish = pick('finish', v.finish);
  const mirror = rng() < 0.5;
  // the decor: stages take turns between the two halves of the sets, the roll picks inside the half
  const half = no % 2 === 0 ? [0, 1] : [2, 3];
  const decor = W3_DECOR_SETS[pickWeighted(rng, half, () => 1) ?? half[0]];
  const bag = <T,>(items: readonly T[]) => {
    const b = new ShuffleBag(rng, items.map((_, i) => i));
    return () => items[b.draw() ?? 0];
  };
  return { start, learn, develop, twist, finish, mirror, decor, bag, rng };
}
