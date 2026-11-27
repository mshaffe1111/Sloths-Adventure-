/**
 * World 2's stages as sections in versions (the variety pass, 2026-10-28; STAGE-RULES §2 "Variety across rolls", GEMINI-LEDGER C1/C3/C4).
 *
 * Each stage keeps its beats in order (Learn, Develop, Twist, Finish), but the Develop, Twist and Finish come in two or three authored
 * versions, and a roll picks one way down the river for the whole stage: a "flavour" (2-1's deep river, its creek of stones and lily pads,
 * or its reeds of snakes and mooring posts). The 200-roll tool compares the order of things to do between rolls (action 3-grams): a
 * version picked on its own for each section still leaves most of the stage alike, so the flavour carries through the stage, and inside
 * it the Finish deals its crossings from a shuffle bag with a cooldown, so no crossing comes twice in a row and the order changes roll to
 * roll. The bank's dressing rotates with the roll too (W2Look).
 *
 * The builder is stateless (the same layout number always builds the same stage, so a retry keeps its layout); `w2Picks` says which
 * versions a layout number gets, so the game can choose a fresh roll whose versions differ from the last one a player saw.
 *
 * The kit (rivers, ponds, stones, posts, cages, the ferry, the court's bell...) is in w2Stages.ts; this file only orders it.
 */
import { CooldownQueue, ShuffleBag, type Rng } from './gen2/variety.ts';
import { stream } from './protoStage.ts';
import type { RoomTips } from './puzzleKit.ts';
import type { Collectible, LevelConfig, Platform, Vine } from './types.ts';

export type W2Plan = '2-8';
type Critter = 'capy' | 'duck' | 'otter';
type Stream = ReturnType<typeof stream>;

/** the bank's dressing for a roll: reeds and poles, the moorings (jetty posts and spare logs), or the village's cottages */
export type W2Look = 'reeds' | 'moorings' | 'cottages';

/** the kit World 2's sections are built from (w2Stages.ts makes it, over its own cursor and lists) */
export interface W2Kit {
  R: Stream;
  config: LevelConfig;
  V: Vine[];
  C: Collectible[];
  readonly x: number;
  readonly bankY: number;
  readonly expert: number;
  addExpert(s: number): void;
  run(len: number): void;
  /** start a new bank at x, its top at y */
  open(at: number, y?: number): void;
  beat(name: string, f: () => void): void;
  flag(): void;
  hint(x: number, text: string, pad?: string, keys?: string): void;
  rest(len: number, flowers?: boolean): void;
  startWalk(len: number): void;
  breath(): void;
  snakeBank(): void;
  guardedRest(len: number, at?: number): void;
  river(dir: 1 | -1, speed: number, logs: number, logW: number, opts?: { safe?: boolean; flowers?: number; tag?: string; lead?: number; tail?: number; gap?: number }): { x0: number; x1: number };
  stones(n: number, opts?: { safe?: boolean; flowers?: boolean; wide?: boolean }): void;
  lilyPond(pads: number, deepFlowers?: boolean, special?: { at: number; put: (cx: number, top: number) => void }, opts?: { safe?: boolean }): void;
  swingRiver(n: number, opts?: { safe?: boolean; island?: number; flow?: number; frames?: boolean }): void;
  stairs(rise: number, up: boolean): void;
  porchRun(n: number, water: boolean, tail?: number, safe?: boolean): { path: Platform | null; xs: number; px: number };
  floodBasin(islands: number, cageAt: number[], seconds: number, opts?: { safe?: boolean; across?: boolean; need?: number; tips?: RoomTips }): void;
  cageRoom(o: { need: number; mode: 'bank' | 'across' | 'high'; critter: Critter; safe?: boolean; tips?: RoomTips }): void;
  sandbar(dirA: 1 | -1, dirB: 1 | -1, speed: number, logW: number, opts?: { safe?: boolean; flowers?: number; tag?: string }): void;
  island(len: number): void;
  postUp(): void;
  channels(n: number, opts?: { safe?: boolean; flowers?: boolean }): void;
  heart(x: number, y: number): void;
  goldenSeed(x: number, y: number): void;
  piece(n: string, x: number, b: number, w: number, extra?: Record<string, unknown>): void;
  row(x0: number, x1: number, y: number, n: number, v?: Collectible['botanicalVariant']): void;
  arc(x0: number, x1: number, yTop: number, n: number, v?: Collectible['botanicalVariant'], lift?: number): void;
  flower(x: number, y: number, v?: Collectible['botanicalVariant']): void;
  turtle(x: number, surface?: number, range?: number): void;
  snake(x: number, surface: number, range?: number): void;
  /** note a stretch as one piece of the stage (meta.pieces) */
  mark(k: string, x0: number): void;
  nextCid(): number;
  /** the animals placed so far */
  enemies(): number;
  /** World 2's story note for this stage (finds.ts), or null */
  noteId(): string | null;
  /** where a log rides, an island's top, the plain bank before a stage's first danger, the stage's quick-player target */
  LOG_Y: number;
  ISLAND_TOP: number;
  START_WALK: number;
  EXPERT_SECONDS: number;
  G: number;
  STONE: number;
}

/** the flavours each stage rolls among */
export const W2_FLAVOURS: Record<W2Plan, readonly string[]> = {
  '2-8': ['islands', 'channels', 'reeds', 'logs'],
};
const LOOKS: readonly W2Look[] = ['reeds', 'moorings', 'cottages'];

export interface W2Picks {
  flavour: string;
  look: W2Look;
  /** the seeded stream the sections draw their turns from (apart from the build's own, so the lengths and spacing stay as rolled) */
  rng: Rng;
}

/**
 * Which flavour each stage takes for a draw of 0..3. The draw is the layout number's own (the same for every stage of the world), and the
 * tables pair the stages that share a world's ideas so that one roll never gives them the same kind of way across (the 200-roll tool
 * compares each stage with the same roll of the others: "no two stages of a world alike", STAGE-RULES §2): 2-3 and 2-8 (the cages),
 * (2-1, 2-2, 2-4, 2-5, 2-6 and 2-7 are gen2's: gen2/worlds/w2.ts, w2Arc24.ts, w2Arc25.ts, w2Arc26.ts, w2Arc27.ts)
 */
const BY_DRAW: Record<W2Plan, readonly string[]> = {
  '2-8': ['channels', 'reeds', 'logs', 'islands'],
};

/** which versions a layout number gets: the stage's flavour and the bank's dressing (a retry with the same number gets the same) */
export function w2Picks(plan: W2Plan, seed: number): W2Picks {
  const s = stream(seed * 131 + plan.charCodeAt(2) * 17 + 5);
  const draw = new ShuffleBag(stream(seed * 131 + 5).f, [0, 1, 2, 3]).draw()!;
  const flavour = BY_DRAW[plan][draw];
  const look = new ShuffleBag(s.f, LOOKS).draw()!;
  return { flavour, look, rng: s.f };
}

/**
 * The Finish's dealer: crossings drawn from a shuffle bag, each kind kept out for `cool` draws after it is used (so never twice in a row),
 * and the bag refilled and reshuffled when it runs out.
 */
class Turns<K extends string> {
  private bag: ShuffleBag<K>;
  private cool: CooldownQueue<K>;
  constructor(rng: Rng, readonly kinds: readonly K[], cool = 1) {
    this.bag = new ShuffleBag(rng, kinds);
    this.cool = new CooldownQueue<K>(Math.min(cool, kinds.length - 1));
  }
  next(): K {
    // (a bag's next draw blocked by the cooldown is put off: draw again, at most a bag's worth of tries)
    for (let i = 0; i < 8; i++) {
      const k = this.bag.draw()!;
      if (this.cool.allows(k)) {
        this.cool.use(k);
        return k;
      }
    }
    const k = this.bag.draw()!;
    this.cool.use(k);
    return k;
  }
}

/** build a stage's sections in the order its flavour gives */
export function buildW2Sections(plan: W2Plan, k: W2Kit, picks: W2Picks): void {
  PLANS[plan](k, picks.flavour, picks.rng);
}

/** a river with him (two logs) or back at him (closer logs, coming toward him) */
const narrow = (k: W2Kit, dir: 1 | -1, speed: number, o: { safe?: boolean; flowers?: number } = {}) =>
  dir === 1 ? k.river(1, speed + 4, 2, 108, o) : k.river(-1, speed, 2, 108, { ...o, gap: 80 });

/** a short burst's rest: a little more bank than a breath, a second or so to breathe after a burst of hops (Gemini's rest pad) */
const pause = (k: W2Kit) => k.rest(k.R.r(300, 340), false);

/** the river's ways across, and the banks between them, as the dealers deal them */
type Kind =
  | 'with' | 'back' | 'wide' | 'sandbar' | 'stones' | 'pond' | 'channels' | 'snake' | 'post' | 'swing2' | 'swing3'
  | 'porches' | 'high';
/** Dot's tip the first time a kind comes in a stage (before it: STAGE-RULES §1 "Teaching"), as [touch, pad, keys] */
const TEACH: Partial<Record<Kind, [string, string?, string?]>> = {
  with: ['Deep water now. Stay on the logs!'],
  high: ['Flowers up high! Double jump from a log.'],
  back: ['This river flows back at you. Wait for a log, then hop on.'],
  sandbar: ['A sandbar! The far river flows back at you.'],
  stones: ['Stepping stones. Hop, hop, hop!'],
  pond: ['Lily pads hold you. Hop across!'],
  channels: ['Reed islands. Hop from one to the next!'],
  post: ['Climb the post to get up the bank!', 'Climb the post: hold Up to get up the bank!', 'Climb the post: hold W or Up to get up the bank!'],
  swing2: ['Jump into a vine to grab it. Let go at the front!'],
  swing3: ['Jump into a vine to grab it. Let go at the front!'],
  porches: ['Up the steps, and hop along the porches!'],
};
/** kinds that teach the same thing (a tip said for one is not said again for the other) */
const SAME: Partial<Record<Kind, string>> = { swing2: 'swing', swing3: 'swing', with: 'logs', wide: 'logs' };

/**
 * One stage's crossings: each kind built from the kit, Dot's tip the first time a kind comes (with a breath of bank after it, so her
 * words are up before the water: 2-2's first-timer drowned 0.6 s after the pond's tip came up), and the logs a little quicker as the
 * stage goes on (the climax near the end: Gemini's sawtooth, STAGE-RULES §2 "Tension").
 */
class Crossings {
  private told = new Set<string>();
  n = 0;
  constructor(private k: W2Kit, private o: { flowers?: boolean; bankFlowers?: boolean; speed?: number } = {}) {}
  /** the kinds already met (taught in the Learn, say) */
  know(...kinds: Kind[]) {
    for (const kd of kinds) this.told.add(SAME[kd] ?? kd);
  }
  go(kind: Kind) {
    const k = this.k;
    const key = SAME[kind] ?? kind;
    const tip = TEACH[kind];
    if (tip && !this.told.has(key)) {
      this.told.add(key);
      this.taughtAt = k.x;
      k.hint(k.x + 10, tip[0], tip[1], tip[2]);
      k.rest(k.R.r(240, 280), false);
    }
    const sp = (this.o.speed ?? 62) + Math.min(14, this.n * 1.5);
    const fl = this.o.flowers;
    const n = this.n++;
    // (shorter logs on a quicker river: the ride on a 120 px log at 62-70 px/s was a hair over two seconds with nothing to do, the dead
    // time on 2-2's rolls)
    // (and every other one a narrow river, one log's ride: hop on, hop off)
    if (kind === 'with') k.river(1, sp + 6, n % 2 ? 1 : 2, 106, fl ? { flowers: n % 2 ? 3 : 6 } : {});
    else if (kind === 'back') k.river(-1, sp - 4, 2, 108, { gap: 80, ...(fl ? { flowers: 6 } : {}) });
    // (a three-log river is a long ride with nothing to do: over two seconds standing on a log, the dead time on 2-1 and 2-2's rolls.
    // The wide river is two logs at a lick instead)
    else if (kind === 'wide') k.river(1, sp + 8, 2, 122, fl ? { flowers: 6 } : {});
    else if (kind === 'high') {
      // flowers high over the river too: a double jump from a log reaches the top row
      const r = k.river(1, sp + 8, 2, 110, { flowers: 5 });
      k.arc(r.x0 + 70, r.x1 - 70, k.LOG_Y - 170, 4, 'orchid', 30);
    }
    else if (kind === 'sandbar') k.sandbar(n % 2 ? -1 : 1, n % 2 ? 1 : -1, sp, 116, fl ? { flowers: 4 } : {});
    else if (kind === 'stones') k.stones(k.R.i(4, 5), { wide: true, flowers: fl });
    else if (kind === 'pond') k.lilyPond(k.R.i(4, 6), !!fl);
    else if (kind === 'channels') k.channels(k.R.i(3, 5), { flowers: fl });
    else if (kind === 'snake') k.snakeBank();
    else if (kind === 'post') k.postUp();
    else if (kind === 'swing2') k.swingRiver(2);
    else if (kind === 'swing3') k.swingRiver(3);
    else if (kind === 'porches') {
      // (the porches along the bank, at its own height: the carved steps up and down either side were four and more seconds of plain
      // walking, 2026-10-28)
      k.porchRun(3, true);
    }
  }
  /** a golden seed over a short stretch of bank: the top of a double jump from its middle */
  seedBank() {
    const k = this.k;
    const x0 = k.x;
    k.rest(k.R.r(320, 360), false);
    k.goldenSeed((x0 + k.x) / 2, k.G - 190);
  }
  /** deal `count` crossings from a dealer, a breath between them and a rest after every third (bursts and rests: Gemini's rhythm) */
  deal(turns: Turns<Kind>, count: number, flag = true) {
    for (let i = 0; i < count; i++) this.step(turns.next(), i, turns.kinds);
    if (flag) this.k.flag();
  }
  private last: Kind | null = null;
  private taughtAt = -1e9;
  /** a kind not yet taught, so close after the last tip that Dot would still be waiting out her gap between lines (~10 s) */
  private tooSoon(kind: Kind): boolean {
    return !!TEACH[kind] && !this.told.has(SAME[kind] ?? kind) && this.k.x - this.taughtAt < 3200;
  }
  /** `walked`: he has just walked a bank (a fight's, a gate's): no more bank before the crossing */
  step(kind: Kind, i: number, among: readonly Kind[] = [], walked = false) {
    // (a new kind right after another's tip waits: a kind already met comes first, if the roll has one)
    if (this.tooSoon(kind)) {
      const known = among.find((kd) => kd !== kind && !this.tooSoon(kd) && kd !== 'post');
      if (known) kind = known;
    }
    // (a snake's bank is its own breath; a post's drop off the high bank and the walk on are too)
    const after = this.last;
    this.last = kind;
    const x0 = this.k.x;
    if (kind !== 'snake' && kind !== 'post' && after !== 'snake' && !walked) {
      if (i % 3 === 2) pause(this.k);
      else this.k.breath();
    }
    // (2-2's flowers along the banks between the crossings too, where the hops show the way over the water)
    if (this.o.bankFlowers && this.k.x - x0 > 140) this.k.row(x0 + 40, this.k.x - 40, this.k.G - 34, 2, 'hibiscus');
    this.go(kind);
    // (over a snake's bank: a hop over the snake gathers them)
    if (this.o.bankFlowers && kind === 'snake') {
      const x1 = this.k.x;
      this.k.arc(x1 - 300, x1 - 60, this.k.G - 70, 4, 'hibiscus', 50);
    }
  }
}

const PLANS: Record<W2Plan, (k: W2Kit, flavour: string, rng: Rng) => void> = {
  // ======================================================================================================================
  // 2-8 Reed Cages: more little ones caught in the reeds, in reed cages hung on pulleys off the islands of still water that rises once he
  // steps in. Each cage's island has its pile of river stones and its counter-basket: a stone in, and the cage comes up out of the water
  // and opens. Learn on basins where a fall costs nothing; then the deep basins, rolled: wide basins of many islands; basins with rivers
  // and channels between; or the reeds, snakes on the banks between basins. The twist puts the stones on the island before the cage's,
  // across the water, to be thrown over while the water climbs.
  '2-8': (k, flavour, rng) => {
    const { R } = k;
    // the reeds between the basins, by the roll: more basins, close together; channels and stepping stones; snakes on the banks; or the
    // log rivers
    type T = Kind | 'basin' | 'across';
    const kinds: Record<string, T[]> = {
      islands: ['basin', 'across', 'basin', 'pond'],
      channels: ['channels', 'basin', 'stones', 'channels', 'across'],
      reeds: ['snake', 'basin', 'snake', 'across', 'snake'],
      logs: ['with', 'basin', 'back', 'across', 'sandbar'],
    };
    const cross = new Crossings(k, { speed: 64 });
    const turns = new Turns<T>(rng, kinds[flavour], 1);
    const go = (t: T, n: number) => {
      if (t === 'basin' || t === 'across') {
        k.breath();
        if (t === 'basin') k.floodBasin(3, n % 2 ? [1] : [0, 2], 26);
        else k.floodBasin(3, [1], 26, { across: true });
      } else cross.step(t, n, kinds[flavour].filter((x): x is Kind => x !== 'basin' && x !== 'across'));
    };
    k.beat('Learn: the water rises', () => {
      k.run(R.r(200, 240));
      k.hint(180, 'More little ones in the reeds! Free them before the water rises.');
      k.floodBasin(2, [1], 30, { safe: true, tips: { enter: "The water's rising round that cage!", nudge: 'The basket lifts the cage.', move: 'A stone in the basket. Quick!', mech: 'flood' } });
      k.hint(k.x - 220, 'Back on the bank before the islands go under!');
      k.breath();
      k.floodBasin(3, [0, 2], 30, { safe: true });
      k.flag();
    });
    k.beat('Develop: deep water', () => {
      k.breath();
      k.hint(k.x + 10, 'Deep water now. Be quick!');
      k.floodBasin(3, [1, 2], 26);
      k.heart(k.x - 40, k.G - 60);
      go(turns.next(), 1);
      go(turns.next(), 2);
      k.flag();
    });
    k.beat('Twist: stones across the water', () => {
      k.breath();
      k.floodBasin(3, [1], 26, { across: true, tips: { enter: 'The stones are on the next island.', hold: 'Flick toward the cage’s island to throw it.', nudge: 'Too far to carry it over.', move: 'Throw one over to the cage’s island.' } });
      k.heart(k.x - 40, k.G - 60);
      go(turns.next(), 3);
      k.breath();
      // a golden seed over the middle of a basin, a double jump from an island before it floods
      const sx = k.x;
      k.floodBasin(4, [2], 26, { across: true });
      k.goldenSeed(sx + (k.x - sx) * 0.3, k.ISLAND_TOP - 170);
      k.flag();
    });
    k.beat('Finish: before the water rises', () => {
      let n = 0;
      const cages = () => k.C.filter((c) => c.type === 'cage').length;
      // (and cages enough, about one and a half times the goal, whatever the reeds between the basins)
      while ((k.expert < k.EXPERT_SECONDS - 14 || cages() < 10) && n < 10) {
        go(cages() < 10 && n >= 2 && n % 2 ? 'basin' : turns.next(), n);
        if (++n % 2 === 0) k.flag();
      }
      k.rest(R.r(300, 400), false);
    });
  },
};
