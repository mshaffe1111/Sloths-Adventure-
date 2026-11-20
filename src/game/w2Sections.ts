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

export type W2Plan = '2-3' | '2-6' | '2-7' | '2-8' | '2-9';
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
  lift(up: boolean, high?: number): { sx: number; top: number };
  guardedHigh(len: number): void;
  mailman(a: number, b: number, y?: number): void;
  patientDoor(dx: number, y?: number): void;
  villageEnd(): void;
  floodBasin(islands: number, cageAt: number[], seconds: number, opts?: { safe?: boolean; across?: boolean; need?: number; tips?: RoomTips }): void;
  cageRoom(o: { need: number; mode: 'bank' | 'across' | 'high'; critter: Critter; safe?: boolean; tips?: RoomTips }): void;
  bellGate(tips: RoomTips): { gateX: number; bellX: number };
  bellGallery(guards: number): void;
  sandbar(dirA: 1 | -1, dirB: 1 | -1, speed: number, logW: number, opts?: { safe?: boolean; flowers?: number; tag?: string }): void;
  island(len: number): void;
  postUp(): void;
  /** off the end of high ground, down to the bank */
  dropDown(): void;
  channels(n: number, opts?: { safe?: boolean; flowers?: boolean }): void;
  heart(x: number, y: number): void;
  goldenSeed(x: number, y: number): void;
  piece(n: string, x: number, b: number, w: number, extra?: Record<string, unknown>): void;
  row(x0: number, x1: number, y: number, n: number, v?: Collectible['botanicalVariant']): void;
  arc(x0: number, x1: number, yTop: number, n: number, v?: Collectible['botanicalVariant'], lift?: number): void;
  flower(x: number, y: number, v?: Collectible['botanicalVariant']): void;
  turtle(x: number, surface?: number, range?: number): void;
  guard(x: number, surface?: number, range?: number): void;
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

/** the flavours each stage rolls among (2-6 is World 1's climbing stage built up the bank houses: protoStage.ts buildKapok) */
export const W2_FLAVOURS: Record<Exclude<W2Plan, '2-6'>, readonly string[]> = {
  '2-3': ['posts', 'ponds', 'snakes', 'vines'],
  '2-7': ['porches', 'lifts', 'swings', 'logs'],
  '2-8': ['islands', 'channels', 'reeds', 'logs'],
  '2-9': ['lilies', 'porches', 'sandbars', 'gates'],
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
 * 2-4 and 2-7 (swings and lifts). (2-1, 2-2, 2-4 and 2-5 are gen2's: gen2/worlds/w2.ts, w2Arc24.ts, w2Arc25.ts)
 */
const BY_DRAW: Record<Exclude<W2Plan, '2-6'>, readonly string[]> = {
  '2-3': ['posts', 'ponds', 'snakes', 'vines'],
  '2-8': ['channels', 'reeds', 'logs', 'islands'],
  '2-7': ['porches', 'lifts', 'swings', 'logs'],
  '2-9': ['porches', 'lilies', 'sandbars', 'gates'],
};

/** which versions a layout number gets: the stage's flavour and the bank's dressing (a retry with the same number gets the same) */
export function w2Picks(plan: W2Plan, seed: number): W2Picks {
  const s = stream(seed * 131 + plan.charCodeAt(2) * 17 + 5);
  const draw = new ShuffleBag(stream(seed * 131 + 5).f, [0, 1, 2, 3]).draw()!;
  const flavour = plan === '2-6' ? 'climb' : BY_DRAW[plan][draw];
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
export function buildW2Sections(plan: Exclude<W2Plan, '2-6'>, k: W2Kit, picks: W2Picks): void {
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
  | 'frames' | 'porches' | 'lift' | 'high';
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
  frames: ['Swing across on the rope frames!'],
  porches: ['Up the steps, and hop along the porches!'],
  lift: ['Step into the basket. It carries you up!'],
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
    else if (kind === 'frames') k.swingRiver(n % 3 === 2 ? 3 : 2, { frames: true });
    else if (kind === 'porches') {
      // (the porches along the bank, at its own height: the carved steps up and down either side were four and more seconds of plain
      // walking, every roll of 2-7, 2026-10-28; the steps stay in the Learn)
      k.porchRun(3, true);
    } else {
      // up by the basket, along the high road (a snake on it, then porches out over the water at its height), and a drop off its end
      // (the ride down had nothing to do in it: with the walk on, five seconds and more, 2026-10-28. The rise stays past a double jump:
      // at 150-170 px the kid bot jumped for the top instead of riding, and missed)
      k.lift(true);
      k.guardedHigh(k.R.r(240, 280));
      k.porchRun(2, true);
      k.dropDown();
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
    // (a snake's bank is its own breath; a post's drop off the high bank and the walk on are too, and so is the basket's ride down)
    const after = this.last;
    this.last = kind;
    const x0 = this.k.x;
    if (kind !== 'snake' && kind !== 'post' && after !== 'lift' && after !== 'snake' && !walked) {
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

const PLANS: Record<Exclude<W2Plan, '2-6'>, (k: W2Kit, flavour: string, rng: Rng) => void> = {
  // ======================================================================================================================
  // 2-3 Stuck in the Reeds: little ones in reed cages hung over the water on ropes, each over its pulley with a counter-basket on the
  // bank (Matt's sheet). Stones in the basket lift a cage out of the water, and all the way up its floor drops open. Learn with one
  // stone over water that costs nothing; then the cages come in a rolled order (a heavier one, two stones; stones on a reed island across
  // a channel, thrown over; a basket hung high, the stones flicked up into it), and between the cages the reeds: the mooring posts up
  // onto the high banks, lily ponds and stepping stones, or snakes in the reeds and sandbars, by the roll.
  '2-3': (k, flavour, rng) => {
    const { R } = k;
    const critters = R.shuffle<Critter>(['capy', 'duck', 'otter']);
    const STONE = k.STONE;
    // the four cages after the first, in the roll's order (each with its own tip the first time its kind comes)
    type Cage = 'heavy' | 'across' | 'high' | 'high1';
    const orders: Record<string, Cage[]> = {
      posts: ['heavy', 'across', 'high', 'high1'],
      ponds: ['across', 'heavy', 'high1', 'high'],
      snakes: ['heavy', 'high', 'across', 'high1'],
      vines: ['across', 'high1', 'heavy', 'high'],
    };
    const told = new Set<string>();
    const cage = (c: Cage, i: number) => {
      const critter = critters[i % 3];
      const first = !told.has(c === 'high1' ? 'high' : c);
      told.add(c === 'high1' ? 'high' : c);
      // (a puzzle never costs a life, STAGE-RULES §3: a slip into a cage's pool is a splash and back to the bank, LV-8: 2-3 drowned the
      // first-timer in the second cage's pool at 19 s)
      if (c === 'heavy') k.cageRoom({ need: STONE * 2, mode: 'bank', critter, safe: true, tips: first ? { enter: 'A heavy one! It barely moves.', nudge: 'One stone lifts it halfway.', move: 'Two stones in the basket.' } : undefined });
      else if (c === 'across')
        k.cageRoom({ need: STONE, mode: 'across', critter, safe: true, tips: first ? { enter: 'The stones are on the island.', hold: 'Hands full! Flick toward the bank to throw it.', nudge: 'Too far to carry it over.', move: 'Throw one over to the bank.' } : undefined });
      else k.cageRoom({ need: c === 'high' ? STONE * 2 : STONE, mode: 'high', critter, safe: true, tips: first ? { enter: 'The basket hangs high.', nudge: 'Too high to drop it in.', move: 'Flick up to throw!' } : undefined });
    };
    /** the reeds between two cages, by the roll */
    const kinds: Record<string, Kind[]> = {
      posts: ['post', 'post', 'post', 'with'],
      ponds: ['pond', 'stones', 'pond', 'stones'],
      snakes: ['snake', 'snake', 'channels', 'snake'],
      vines: ['swing2', 'swing3', 'swing2', 'stones'],
    };
    const cross = new Crossings(k, { speed: 58 });
    const turns = new Turns<Kind>(rng, kinds[flavour], flavour === 'posts' || flavour === 'snakes' ? 0 : 1);
    const order = orders[flavour];
    k.beat('Learn: a cage on a rope', () => {
      k.run(R.r(160, 200));
      k.hint(150, 'Little ones are stuck in reed cages. Free them!');
      k.cageRoom({
        need: STONE, mode: 'bank', safe: true, critter: critters[0],
        tips: { enter: 'A little one, in a cage on a rope!', hold: 'Tap by the basket to drop it in.', open: 'Up it comes! The little one is free!', nudge: 'That basket pulls the rope.', move: 'Drop a stone in the basket.', mech: 'cageLift' },
      });
      k.breath();
      // the reeds' first way across costs no life
      if (flavour === 'posts') {
        cross.go('post');
        narrow(k, 1, 55, { safe: true });
        cross.know('with');
      } else if (flavour === 'ponds') {
        k.hint(k.x + 20, 'Lily pads hold you. Hop across!');
        k.lilyPond(4, false, undefined, { safe: true });
        cross.know('pond');
      } else if (flavour === 'snakes') {
        k.hint(k.x + 20, 'Reed islands. Hop from one to the next!');
        k.channels(3, { safe: true });
        cross.know('channels');
      } else {
        k.hint(k.x + 20, 'Swing over the water! Jump into a vine to grab it.');
        k.swingRiver(2, { safe: true });
        cross.know('swing2');
      }
      k.flag();
    });
    k.beat(`Develop: ${order[0] === 'heavy' ? 'a heavier cage' : 'stones across the water'}`, () => {
      k.breath();
      cage(order[0], 1);
      k.heart(k.x - 40, k.G - 60);
      cross.deal(turns, 2);
    });
    k.beat('Twist: stones across the water', () => {
      k.breath();
      cage(order[1], 2);
      k.heart(k.x - 40, k.G - 60);
      cross.deal(turns, 2, false);
      cross.seedBank();
      k.flag();
    });
    k.beat('Finish: the high baskets', () => {
      k.breath();
      cage(order[2], 3);
      k.heart(k.x - 40, k.G - 60);
      cross.deal(turns, 2, false);
      k.breath();
      cage(order[3], 4);
      let n = 0;
      const target = k.EXPERT_SECONDS + (flavour === 'ponds' ? 2 : 12);
      while (k.expert < target && n < 14) {
        cross.step(turns.next(), n, turns.kinds);
        if (++n % 2 === 0) k.flag();
      }
      k.rest(R.r(300, 400), false);
    });
  },

  // ======================================================================================================================
  // 2-7 The Mailman's Route: the long way round the river, the way the mailman goes: up the carved steps, along the porches over the
  // water, into the basket of a rope lift and up the bank, over the river on the logs and on the rope-swing frames, and past every door
  // marked PLEASE BE PATIENT to the end of his round. The round he takes is rolled: the porches, the lifts and the high road, or the
  // swing frames.
  '2-7': (k, flavour, rng) => {
    const { R } = k;
    // the mailman's round, by the roll: the porches and the carved steps; the basket lifts and the high road; the rope-swing frames over
    // the river; or the river itself, the logs and the sandbars
    const kinds: Record<string, Kind[]> = {
      porches: ['porches', 'porches', 'with', 'porches'],
      lifts: ['lift', 'snake', 'lift', 'with', 'lift'],
      swings: ['frames', 'frames', 'frames', 'back'],
      logs: ['with', 'back', 'snake', 'sandbar', 'with'],
    };
    const cross = new Crossings(k, { speed: 66 });
    cross.know('porches');
    const turns = new Turns<Kind>(rng, kinds[flavour], 0);
    k.beat('Learn: up the steps, along the porches', () => {
      k.run(R.r(140, 170));
      k.hint(140, 'Follow the mailman’s route round the village!');
      k.mailman(160, 380);
      k.stairs(Math.round(R.r(110, 130)), true);
      k.hint(k.x - 100, 'Hop along the porches');
      // the first porches: over the water, but a splash only puts him back on the steps
      k.porchRun(3, true, undefined, true);
      k.patientDoor(k.x - 60);
      k.dropDown();
      k.flag();
      k.piece('mailbox', k.x - 40, k.G + 2, 54);
    });
    k.beat(`Develop: the round, ${flavour}`, () => {
      cross.step(turns.next(), 0, turns.kinds);
      k.heart(k.x - 60, k.G - 60);
      cross.step(turns.next(), 1, turns.kinds);
      cross.step(turns.next(), 2, turns.kinds);
      k.flag();
      k.piece('mailbox', k.x - 40, k.G + 2, 54);
    });
    k.beat('Twist: up the bank and over the river', () => {
      k.breath();
      // every round goes up by the basket lift once, and over the river on the swing frames once
      if (flavour !== 'lifts') cross.go('lift');
      k.breath();
      k.patientDoor(k.x - 110);
      if (flavour !== 'swings') cross.go('frames');
      k.heart(k.x - 40, k.G - 60);
      // a golden seed above the next lift's crane: a double jump from the basket at the top
      const lf = k.lift(true);
      k.goldenSeed(lf.sx + 48, lf.top - 175);
      k.porchRun(2, true);
      // (down off the high ground's end: a drop, not the carved steps' long walk)
      k.dropDown();
      k.flag();
    });
    k.beat('Finish: the end of the round', () => {
      let n = 0;
      const target = k.EXPERT_SECONDS - 4 + (flavour === 'logs' ? 26 : flavour === 'lifts' ? 8 : 14);
      while (k.expert < target && n < 16) {
        cross.step(turns.next(), n, turns.kinds);
        if (++n % 2 === 0) k.flag();
      }
      // (a short bank to the village with a low rise in it: its walk is the easy walk out, and the two together were over four seconds
      // with nothing to do on some rolls)
      k.breath();
      k.heart(k.x - 60, k.G - 60);
      k.villageEnd();
    });
  },

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

  // ======================================================================================================================
  // 2-9 The River King's Court: fight through the court to the king. His guards (royal snappers, upright with spears) block a blow to
  // the front, jab further than a snapper bites, and need two hits; from behind, or open after a jab, they go down; a kick staggers one
  // back into whoever stands behind him. The court's bell is the stage's own: rung, every guard in earshot comes to look at it
  // (noise.ts), noticing nobody. Learn: the court gate opens to the bell, and one guard at a time; then the court, rolled: its lily ponds
  // with guards between, its porches over the water, or its sandbars; the twist is the gallery, porches over the court floor with the
  // bell at their head: ring it and the guards below all turn to it, and he hops down behind them; then a row of guards close enough for
  // one good kick to bowl them over, to the king.
  '2-9': (k, flavour, rng) => {
    const { R } = k;
    /** a stretch of bank with guards (and snappers between them) spread along it, clear of the flags at either end */
    const guardBank = (n: number, spacing: [number, number], snappers = 0) => {
      const x0g = k.x;
      k.run(R.r(110, 140));
      for (let i = 0; i < n; i++) {
        k.run(R.r(spacing[0], spacing[1]));
        k.guard(k.x);
        if (i < snappers) {
          k.run(R.r(spacing[0] * 0.6, spacing[1] * 0.6));
          k.turtle(k.x);
        }
      }
      k.run(R.r(200, 230));
      k.row(x0g + 100, k.x - 100, k.G - 34, Math.max(2, Math.round((k.x - x0g) / 220)), 'hibiscus');
      k.addExpert((k.x - x0g) / 285 + n * 2.4 + snappers * 1.6);
      k.mark(`guards${n}`, x0g);
    };
    /** the court's dressing along a stretch of bank: lanterns on posts and the king's banners, taking turns (Matt's court sheet) */
    const courtLanterns = (x0c: number, x1c: number) => {
      let i = 0;
      for (let lx = x0c + 80; lx < x1c - 60; lx += R.r(240, 320)) {
        if (i++ % 2) k.piece('banner', lx, k.G + 6, 64, { flip: R.chance(0.5) });
        else k.piece('lantern', lx, k.G + 4, 40);
      }
    };
    // the court's ways between its guard banks, by the roll: its lily ponds; its porches over the water up the carved steps; its sandbars;
    // or its gates, each opened by a bell (the guards come to look at it)
    type T = Kind | 'gate';
    const kinds: Record<string, T[]> = {
      lilies: ['pond', 'pond', 'stones'],
      porches: ['porches', 'porches', 'with'],
      sandbars: ['sandbar', 'back', 'sandbar'],
      gates: ['gate', 'gate', 'with'],
    };
    const cross = new Crossings(k, { speed: 62 });
    cross.know('with');
    const turns = new Turns<T>(rng, kinds[flavour], 0);
    const way = (n: number) => {
      const t = turns.next();
      if (t === 'gate') {
        k.breath();
        // another of the court's gates: its bell, and a guard past it within earshot (a bell nobody hears is no puzzle: puzzleCheck)
        const g = k.bellGate({});
        // (the guard well within the bell's earshot, noise.ts NOISE.hear 520 px, and close past the gate: a long walk either side of
        // him was the dead time on the gates' rolls)
        k.run(R.r(130, 160));
        k.guard(Math.max(k.x, g.bellX + 420), k.G, 100);
        k.run(R.r(200, 230));
        k.addExpert(4);
      } else if (t === 'porches' && k.expert > k.EXPERT_SECONDS - 24) cross.step('with', n, [], true);
      else cross.step(t, n, kinds[flavour].filter((x): x is Kind => x !== 'gate'), true);
    };
    k.beat('Learn: the court bell, one guard', () => {
      k.run(R.r(120, 150));
      k.hint(120, 'The river king’s court! The gate opens to the bell.');
      k.piece('sign', 120, k.G + 4, 132, { text: ['THE KING’S', 'COURT'] });
      // the court gate: the bell beside it (the first bell: no guard this side of the gate, and nothing to fall in)
      const g = k.bellGate({ enter: "The court gate's shut.", open: 'Dong! The gate opens. The guards come looking.', nudge: 'That bell, by the gate.', move: 'Ring the court bell. Tap it!', mech: 'bellGate' });
      // the first guard, past the gate: near enough to hear the bell, and come to look
      // (the guard's tip before the first guard: it was said 240 px past him, after the first jab, the first-timer bot 2026-10-28)
      // (and further back, by the bell: the tip 360 px short of the guard was up only after his first jab, 2026-10-28)
      k.hint(g.bellX + 40, 'Head-on he blocks. Hit him from behind, or kick him!');
      k.run(R.r(220, 260));
      k.guard(Math.max(k.x, g.bellX + 520), k.G, 100);
      k.run(R.r(280, 320));
      k.addExpert(4);
      guardBank(2, [320, 380]);
      // (the court's first river costs no life, and Dot speaks of it first: the first-timer drowned in it before any word of water)
      k.hint(k.x - 200, 'Flick up when a log drifts close.');
      narrow(k, 1, 62, { safe: true });
      k.flag();
    });
    k.beat(`Develop: the court’s ${flavour}`, () => {
      way(0);
      guardBank(1, [200, 240]);
      way(1);
      k.heart(k.x - 40, k.G - 60);
      guardBank(2, [280, 340], 2);
      way(2);
      k.flag();
    });
    k.beat('Twist: the gallery', () => {
      k.breath();
      k.hint(k.x + 20, 'Up to the gallery! Ring the bell, and come down behind the guards.');
      k.bellGallery(3);
      k.heart(k.x - 40, k.G - 60);
      const c0 = k.x;
      // close together: a guard kicked along this bank meets every one behind him
      k.hint(k.x + 20, 'The court! Kick one guard into the rest!');
      guardBank(4, [110, 140]);
      courtLanterns(c0, k.x);
      // a golden seed high over the court: the top of a double jump from the middle of the bank
      k.goldenSeed((c0 + k.x) / 2, k.G - 190);
      way(3);
      k.flag();
    });
    k.beat('Finish: to the king', () => {
      let n = 0;
      while (k.expert < k.EXPERT_SECONDS + 8 && n < 14) {
        k.breath();
        const c = k.x;
        // (the court's guards by the roll too: rows of four on the porches' court, pairs by the ponds, one at each gate, and snappers
        // out on the sandbars)
        if (flavour === 'porches') guardBank(n % 2 ? 3 : 4, [120, 150]);
        else if (flavour === 'gates') guardBank(n % 2 ? 1 : 2, [260, 320], 1);
        else if (flavour === 'sandbars') {
          guardBank(1, [200, 240]);
          k.island(R.r(470, 520));
          k.turtle(k.x - R.r(250, 290), k.G, 90);
          k.turtle(k.x - R.r(120, 140), k.G, 60);
          k.addExpert(4);
        } else guardBank(n % 3 === 0 ? 4 : 2, n % 3 === 0 ? [120, 150] : [260, 320], n % 2);
        courtLanterns(c, k.x);
        way(n + 4);
        if (++n % 2 === 0) k.flag();
      }
      // the king's court: through the archway, along the lily-pad carpet between the banners, to his throne on its dais, the shell
      // gong beside it. (The throne is empty: the king waits in his lair, the boss fight.)
      k.rest(R.r(140, 200), false);
      const k0 = k.x;
      k.run(100);
      k.piece('archway', k.x, k.G + 6, 230);
      k.run(110);
      k.piece('sign', k.x, k.G + 4, 140, { text: ['BOW TO', 'THE KING'] });
      // the king's own guard at the foot of the carpet, the last of them
      k.guard(k.x + 150, k.G, 90);
      k.addExpert(2.4);
      k.run(100);
      for (let i = 0; i < 3; i++) k.piece('lilyCarpet', k.x + 90 + i * 170, k.G + 16, 200);
      k.piece('banner', k.x + 30, k.G + 6, 70);
      k.piece('banner', k.x + 480, k.G + 6, 70, { flip: true });
      k.run(460);
      k.piece('gong', k.x - 30, k.G + 6, 120);
      k.piece('dais', k.x + 140, k.G + 14, 250);
      k.piece('throne', k.x + 140, k.G - 30, 200);
      k.run(480); // the sanctuary door stands past the dais, not in front of the throne
      k.addExpert((k.x - k0) / 285);
    });
  },
};
