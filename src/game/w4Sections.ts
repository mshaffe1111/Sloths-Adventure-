/**
 * World 4's section versions (the variety pass, 2026-10-28; STAGE-RULES §2 "Variety across rolls", GEMINI-LEDGER C1, C3, C4, C8).
 *
 * The 200-roll tool found every World 4 stage 89-99.8% alike from roll to roll: the platforms moved, but the order of things to do
 * never changed. Each stage now has two or three authored versions of its main sections (Develop, Twist, Finish, and the Start where it
 * was always the same), and the layout roll picks among them here:
 *   - one pick per section, through a CooldownQueue, so neighbouring sections of one roll don't use the same version id;
 *   - the Finish draws its pieces from a ShuffleBag (no fixed `n % k` loop), weighted toward the roll's own theme, so two rolls'
 *     finishes differ in what they hold, not only in their order;
 *   - mirroring where a section is symmetric (`flip`).
 * Everything comes from the layout number alone (the same number always builds the same stage: a retry keeps its layout, a fresh
 * roll changes it), on its own random stream, so the geometry's dice in protoStage.ts are untouched by these picks.
 */
import { CooldownQueue, pickWeighted, ShuffleBag, type Rng } from './gen2/variety.ts';

/** the stage's own stream for the version picks: the layout number and the stage id, mixed */
export function versionRng(seed: number, stage: string): Rng {
  let h = 2166136261 >>> 0;
  for (const ch of stage) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  let a = (Math.imul(seed >>> 0, 2654435761) ^ h) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A roll's choices for one stage: `pick` takes one version for a section (the cooldown keeps the id the roll just used out while
 * another is left), `bag` gives a finish's pieces (each piece's weight is how many times it goes in the bag), `chance` and `theme`
 * are the roll's own coin and its theme (one id from a list, picked once per stage and remembered).
 */
export class W4Roll {
  readonly rng: Rng;
  private cool = new CooldownQueue<string>(1);
  private themes = new Map<string, string>();
  constructor(seed: number, stage: string) {
    this.rng = versionRng(seed, stage);
  }
  /** one of the versions, evenly, never the id this roll used last when another is left (ids are shared across a stage's sections) */
  pick<T extends string>(versions: readonly T[], weight: (v: T) => number = () => 1): T {
    const order: T[] = [];
    const left = [...versions];
    while (left.length) {
      const v = pickWeighted(this.rng, left, weight)!;
      order.push(v);
      left.splice(left.indexOf(v), 1);
    }
    return this.cool.pick(order)!;
  }
  /** the roll's theme for `key`, picked once (weighted) and kept */
  theme<T extends string>(key: string, themes: readonly T[], weight: (v: T) => number = () => 1): T {
    const had = this.themes.get(key);
    if (had !== undefined) return had as T;
    const t = pickWeighted(this.rng, themes, weight)!;
    this.themes.set(key, t);
    return t;
  }
  chance(p: number): boolean {
    return this.rng() < p;
  }
  /** a bag of the finish's pieces: `count` copies of each per bag (0 leaves it out of this roll) */
  bag<T>(items: readonly T[], count: (item: T) => number): ShuffleBag<T> {
    return new ShuffleBag(this.rng, items.filter((it) => count(it) > 0), count);
  }
}
