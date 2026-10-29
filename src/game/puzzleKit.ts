/**
 * puzzleKit — the shared puzzle kit's rules (phase 1, 2026-10-28): one piece type that every puzzle room is built from, for the hand-built
 * stages and the generator alike. Pure: no canvas, no engine. The run state lives in puzzlePlay.ts, the look in puzzleArt.ts, the
 * symbolic check in puzzleCheck.ts (called by levelCheck.ts).
 *
 * A puzzle room is data (RoomSpec): its pieces, each placed relative to the platform it sits on (that platform's id, 0..1 along its
 * top, and an offset: never fixed world x and y), and its wires. Pieces are wired like switches: a gate listens to a Wire such as
 * { all: ['plateA', 'plateB'] } ("open while plate A AND plate B are pressed").
 *
 * Every piece has the same four parts: how it looks (puzzleArt.ts), how it steps, how it is used (a tap within reach in front of Pokey),
 * and how it resets. Phase 1's pieces: the carryable item (acorn, stone, pinecone, cake: one kind with variants), its source (a tree or
 * a pile that drops a fresh one when it is lost), the weight plate, the gate, the lever, the counterweight basket and its lift, the
 * lure beetle and the reset post. Phase 2's (light and mirrors, flowing liquid, water level, seesaw, noise and silk lures, trap chairs)
 * fit the same shape: a piece with a state, a step, an output a wire can read, and (for the check) a few named states.
 *
 * The controls are the game's own intents, read again by the engine (engine.ts kitControls): a tap uses a piece in reach instead of
 * punching; carrying, he walks slower and cannot jump, climb or swing (his hands are full), the jump intent throws the thing up and
 * forward, the kick intent throws it forward, and a tap sets it down.
 */
import type { Platform } from './types.ts';

/** where a piece sits: on platform `on`, `at` of the way along its top (0 left end, 1 right end), moved `dx` across and `dy` down */
export interface Anchor {
  on: number;
  at: number;
  dx?: number;
  dy?: number;
}

/** what a gate (or a lift) listens to: a piece's output by its id, or all / any / not of others */
export type Wire = string | { all: Wire[] } | { any: Wire[] } | { not: Wire };

export type ItemVariant = 'acorn' | 'stone' | 'pinecone' | 'cake' | 'pebble' | 'mushroom' | 'mango';
export interface ItemInfo {
  /** how much it weighs on a plate, in a basket or on a seesaw's end */
  weight: number;
  /** its size (px, half its width) */
  r: number;
  /** a lure beetle eats it */
  food: boolean;
  /** thrown, it lands with a noise the watchers turn to (noise.ts) */
  noisy?: boolean;
  /** it glows: the radius it lights (px), carried, set down or flying (World 3's mushroom) */
  light?: number;
  /** a fruit a trader takes (World 4's capuchin) */
  fruit?: boolean;
}
/** each carryable */
export const ITEM: Record<ItemVariant, ItemInfo> = {
  acorn: { weight: 1, r: 15, food: false, noisy: true },
  stone: { weight: 2, r: 17, food: false, noisy: true },
  pinecone: { weight: 1, r: 16, food: false, noisy: true },
  // (too light to press a plate: the beetle that eats it is what presses one)
  cake: { weight: 0, r: 16, food: true },
  pebble: { weight: 1, r: 11, food: false, noisy: true },
  mushroom: { weight: 1, r: 16, food: false, light: 230 },
  mango: { weight: 1, r: 15, food: false, fruit: true },
};

/** which way a sluice runs its river: with its own current, turned about, or stopped */
export type Flow = 'with' | 'against' | 'still';

export type PieceSpec =
  | { kind: 'item'; id: string; variant: ItemVariant; at?: Anchor; source?: string; for?: string; with?: string }
  | { kind: 'source'; id: string; variant: ItemVariant; at: Anchor; look?: 'tree' | 'pile' }
  | { kind: 'plate'; id: string; at: Anchor; w?: number; need?: number }
  /** `look`: the wall over the door: the root wall (World 1's, the default) or bundled reeds (World 2's court) */
  | { kind: 'gate'; id: string; at: Anchor; open: Wire; latch?: boolean; h?: number; look?: 'roots' | 'reeds' | 'woven' | 'butler' }
  | { kind: 'lever'; id: string; at: Anchor; on?: boolean }
  | { kind: 'basket'; id: string; at: Anchor; mouth: number; need?: number; drop?: number }
  /** `by`: the basket whose weight raises it (a counterweight), or any piece whose output winds it up while on (a pinwheel); `hold`: it
   * stays where it was wound to when that goes off (a ratchet), instead of coming back down; `cage`: the reed cage it hangs (World 2: a
   * cage collectible's id). A cage's lift has no plank to stand on: the cage hangs on the rope where the plank would be, and lifted all
   * the way up its floor drops open and the little one is free (puzzlePlay.ts); `water`: a raft afloat in calm water filling the platform
   * it is anchored on (World 6's well): the water's top rides just under the plank, up to `water` px over that platform's top, and
   * Pokey can swim in it (swim.ts) */
  | { kind: 'lift'; id: string; at: Anchor; w: number; rise: number; by: string; hold?: boolean; cage?: number; water?: number }
  /** `waitNear`: it dozes, not looking about, until he comes this close (px): a cake left by it is eaten while he is there to see */
  | { kind: 'beetle'; id: string; at: Anchor; sight?: number; waitNear?: number }
  | { kind: 'reset'; id: string; at: Anchor }
  /** a plank on a pivot at `at` (its ends' tops at the anchor's height when down): weight on one end lowers it and raises the other into a
   * step `rise` px up. `w`: the whole plank; `rest`: which end is down when the weights are even (-1 the left, 1 the right, 0 level) */
  | { kind: 'seesaw'; id: string; at: Anchor; w?: number; rise?: number; rest?: -1 | 0 | 1 }
  /** a bell hanging at `at`: a tap in reach, or a thrown thing that hits it, rings it, and the watchers near turn to it (noise.ts) */
  | { kind: 'bell'; id: string; at: Anchor }
  /** a ledge in the dark that is there only in a glowing thing's light (World 3): `w` wide, its top at the anchor */
  | { kind: 'ledge'; id: string; at: Anchor; w: number }
  /** a mark (a carved fern stone) that shows only in a glowing thing's light: a sign of the way, nothing to stand on */
  | { kind: 'mark'; id: string; at: Anchor; look?: 'fernStone' | 'crystal' }
  /** a lever-wired shutter over a gust lane (World 4): the stage's zone `zone` (its index) blows only while the shutter is open */
  | { kind: 'shutter'; id: string; at: Anchor; zone: number; open: Wire }
  /** a pinwheel: it spins while a gust blows on it (its output), and wired to a lift it winds the lift up */
  | { kind: 'pinwheel'; id: string; at: Anchor }
  /** a lever-wired sluice gate on the stage's river `river` (its index, World 2): open, the river runs `opened`; shut, `shut` */
  | { kind: 'sluice'; id: string; at: Anchor; river: number; open: Wire; opened?: Flow; shut?: Flow }
  /** a creature that trades (World 4's capuchin on its stump): offered a `wants` (a tap by it while carrying one) it takes it and drops
   * the thing it holds (the item whose `with` is this trader's id) */
  | { kind: 'trader'; id: string; at: Anchor; wants: ItemVariant }
  // ── phase 2b (Meeca's stage, 2026-10-28): the trap chair, the sapling, the silk line, the knot and its ladder, the teapot, the light
  // that follows him (Flicker), the moonflower ──
  /** a soft armchair: its seat (`seat` px up) is a step anyone would use, but sat on it holds you in silk until you wiggle free (slide one
   * way and the other, CHAIR.wiggles times), and pops you off the way you came. Never a way up */
  | { kind: 'chair'; id: string; at: Anchor; seat?: number }
  /** a young sapling rooted at `at`, `h` tall (its climb is the stage's vine `vine`, a kit vine): climbed to the top, it bends over
   * under him and sets him down at `to`, and stays bent (a bridge) */
  | { kind: 'sapling'; id: string; at: Anchor; to: Anchor; h: number; vine: number }
  /** a shining silk line hanging like a vine (the kit vine `vine`): whoever grabs it is held a moment, then dropped. Never a way up */
  | { kind: 'silk'; id: string; at: Anchor; vine: number }
  /** a silk knot (a rolled ladder's tie): a thrown thing that hits it snaps it, for good (its output) */
  | { kind: 'knot'; id: string; at: Anchor }
  /** a vine ladder rolled up at `at` (the top of a bank): it unrolls down the kit vine `vine`, and can be climbed, once `open` is on */
  | { kind: 'ladder'; id: string; at: Anchor; vine: number; open: Wire }
  /** a teapot on its stand: a tap by it tips it over, for good; its tea runs down the trough (`trough`: the points it runs through, to
   * the basket's mouth) into the basket `into`, weighing `weight` there */
  | { kind: 'teapot'; id: string; at: Anchor; into: string; weight?: number; trough?: Anchor[] }
  /** a light that goes with him through the room (Flicker, the firefly): radius `r`, over his head */
  | { kind: 'glow'; id: string; r: number }
  /** a moonflower bud: a light that reaches it opens it (its output, for good), and open it lights `r` px round it */
  | { kind: 'moonflower'; id: string; at: Anchor; r: number };
export type PieceKind = PieceSpec['kind'];

/** a line said in a room: Dot's words (a plain string), or a line with its speaker (Meeca's stage: her thoughts, the Butler, Flicker) */
export type TipLine = string | { who: 'meeca' | 'butler' | 'flicker'; text: string };
/** the words of a line */
export const tipText = (l: TipLine): string => (typeof l === 'string' ? l : l.text);

/** what Dot says in a room, the first time each moment comes (said once per stage: the engine remembers it) */
export interface RoomTips {
  /** coming into the room (it explains the locked way on) */
  enter?: TipLine;
  /** the first time he holds something here */
  hold?: TipLine;
  /** the room's way on opens */
  open?: TipLine;
  /** after real struggle (two failed tries, or back and forth with nothing changing): a nudge that points at the piece, never the move */
  nudge?: TipLine;
  /** after more struggle, and only on "Dot's help: Help": the move itself */
  move?: TipLine;
  /** the thing this room teaches for the first time, when the room is built by a helper that takes only its tips (RoomSpec.mech) */
  mech?: string;
  /** the beetle fell asleep off every plate (the room needs starting again: the post) */
  stuck?: string;
  // ── phase 2b's moments (each the first time it comes) ──
  /** a beetle that was waiting fell asleep where it ate (it shows what a cake does) */
  slept?: TipLine;
  /** sat in the trap chair, and held */
  chair?: TipLine;
  /** caught on the silk line */
  silk?: TipLine;
  /** a tap by the Butler: polite (the first time, and every time after) */
  polite?: TipLine;
  polite2?: TipLine;
  /** after his steam, sleepy */
  yawn?: TipLine;
  /** the teapot tipped over */
  tipped?: TipLine;
  /** a sapling's climb, the first time he stands at its foot */
  climb?: TipLine;
  /** the first light the room's glow finds (a hidden step) */
  lit?: TipLine;
}

export interface RoomSpec {
  id: string;
  /** the room's box: from `left` to `right` (anchors), `above` px over the left anchor's platform top and `below` px under it */
  left: Anchor;
  right: Anchor;
  above: number;
  below: number;
  pieces: PieceSpec[];
  /** the piece that lets him on (a gate or a lift): the camera's and the stuck help's last step, and what the check opens */
  exit: string;
  /** a spot past the way on: the check passes when he can get to the ground there */
  beyond: Anchor;
  /** the platforms a dropped or thrown thing may rest on (anything else it lands on is out of reach: lost, and it comes back) */
  ground: number[];
  tips?: RoomTips;
  /** the thing this room teaches for the first time (the seesaw's first room): "Tips" says its first line once per save (dotTips.ts) */
  mech?: string;
}

export interface KitExtras {
  rooms: RoomSpec[];
}

// ───────────────────────────── numbers ─────────────────────────────

export const KIT = {
  /** the reach of a tap, in front of him (px from his middle), and how far behind him still counts */
  reach: 56,
  behind: 18,
  /** forgiving reach: Normal and Easy */
  reachNormal: 1.25,
  reachEasy: 1.6,
  /** a piece within this much of his feet's height is in reach (above: a lever's handle, a basket's mouth) */
  up: 120,
  down: 40,
  /** carrying: how fast he walks (of his run) */
  carrySpeed: 0.68,
  /** a set-down lands this far in front of him */
  setDown: 30,
  /** a lost thing comes back to its source this long after (s) */
  respawn: 1.2,
  /** how high over its source a fresh one starts its fall (a tree drops it) */
  dropFrom: 260,
  /** what weighs on a plate: Pokey, the beetle */
  pokeyWeight: 3,
  beetleWeight: 3,
  /** the default plate width (px) */
  plateW: 92,
  /** a gate's door (the part that opens) and its whole height (the root wall over the door does not open) */
  doorH: 118,
  gateH: 330,
  gateW: 90,
  /** a lift moves this fast (px/s) */
  liftSpeed: 120,
  /** a basket's mouth: half its width */
  mouthHalf: 30,
  /** a seesaw's plank (px) and how high its raised end stands over its lowered one, and how fast it tips (px/s) */
  seesawW: 240,
  seesawRise: 72,
  seesawSpeed: 260,
  /** a pushed hollow log on a seesaw's end weighs this much (more than Pokey: it holds the end down while he walks the plank) */
  logWeight: 5,
  /** a pinwheel spins in a gust at least this strong, and a wound lift climbs this fast (px/s) */
  spinAt: 0.3,
  windSpeed: 70,
  /** a trader takes the fruit when he is this close (px) */
  tradeReach: 90,
} as const;

/** phase 2b's numbers */
export const CHAIR = {
  /** the seat's height over the floor, and its width */
  seat: 62,
  w: 74,
  /** a wiggle is a change of the way he slides; this many and he is free */
  wiggles: 4,
  /** he sinks in for this long before the wiggling counts (s) */
  sink: 0.55,
  /** held this long with no wiggling at all, it lets him go anyway (s): nobody is ever stuck in it */
  giveUp: 10,
  /** a steady push one way this long counts as a wiggle too (s) */
  strain: 0.5,
  /** popped free: thrown off the way he came */
  popVx: 230,
  popVy: -360,
} as const;
export const SILK = {
  /** caught on it, he hangs this long (s), then drops */
  hold: 1.25,
  /** and shakes it off this long (s), standing */
  shake: 0.8,
  /** shaken off, it hangs out of reach until she is this far from it (px) */
  away: 70,
} as const;
export const SAPLING = {
  /** he is this near its top (px) when it starts to bend */
  near: 46,
  /** the bend takes this long (s) */
  bend: 1.25,
} as const;
export const TEA = {
  /** the pot tips, then the tea runs down the trough this long (s) before the basket is full */
  run: 1.1,
  /** the weight of a basket of tea */
  weight: 1,
} as const;
/** a silk knot's box a thrown thing snaps (world: puzzlePlay.ts and puzzleCheck.ts fly at the same) */
export const knotBox = (k: { x: number; y: number }) => ({ x0: k.x - 20, x1: k.x + 20, y0: k.y - 44, y1: k.y + 10 });
/** Flicker hovers this far over his feet, a little ahead */
export const GLOW = { up: 92, ahead: 26 } as const;

/** the throws: up (the jump intent: up and a little forward) and forward (the kick intent), from his hands */
export const THROW = {
  up: { vx: 100, vy: -820 },
  fwd: { vx: 480, vy: -320 },
  /** where it leaves his hands: in front of him and up at his head */
  handX: 14,
  handY: 70,
  gravity: 1500,
  /** the flight steps at this fixed rate, so the game and the check fly the same arc */
  dt: 1 / 60,
} as const;

export type ThrowKind = 'up' | 'fwd';

/** the reach of a tap for this difficulty */
export const useReach = (easy: boolean): number => KIT.reach * (easy ? KIT.reachEasy : KIT.reachNormal);

/** the lure beetle: how far it sees food on the ground, how fast it walks, how long it eats, its mouth ahead of its middle */
export const BEETLE = { sight: 210, speed: 38, eat: 1.6, yawn: 1.1, mouth: 22, half: 34 } as const;

// ───────────────────────────── placing ─────────────────────────────

/** the world point an anchor names (its platform's top), or null when the platform is not there */
export function anchorAt(a: Anchor, plats: readonly Platform[] | ReadonlyMap<number, Platform>): { x: number; y: number } | null {
  const p = plats instanceof Map ? plats.get(a.on) : (plats as readonly Platform[]).find((q) => q.id === a.on);
  if (!p) return null;
  return { x: p.x + Math.max(0, Math.min(1, a.at)) * p.width + (a.dx ?? 0), y: p.y + (a.dy ?? 0) };
}

/** the platform ids the kit adds for a room's piece (a gate's door and its wall over the door, a lift's plank): the same everywhere */
export function kitPlatId(room: number, piece: string, part = 0): number {
  let h = 7;
  for (let i = 0; i < piece.length; i++) h = (h * 31 + piece.charCodeAt(i)) % 2477;
  return 900000 + room * 10000 + h * 4 + part;
}

/**
 * Add the platforms a stage's rooms need (each gate's door and the root wall over it, each lift's plank), once, when the stage is
 * built: the game and the check then see the same ground. Pieces are placed from the platforms already there.
 */
export function addKitPlatforms(platforms: Platform[], kit: KitExtras): void {
  const byId = new Map(platforms.map((p) => [p.id, p]));
  kit.rooms.forEach((room, ri) => {
    room.pieces.forEach((pc) => {
      if (pc.kind !== 'gate' && pc.kind !== 'lift' && pc.kind !== 'seesaw' && pc.kind !== 'ledge' && pc.kind !== 'chair') return;
      if (platforms.some((p) => p.id === kitPlatId(ri, pc.id, 0))) throw new Error(`room ${room.id}: ${pc.id}'s platform id is taken (rename the piece)`);
      const at = anchorAt(pc.at, byId);
      if (!at) throw new Error(`room ${room.id}: ${pc.id} sits on platform ${pc.at.on}, which is not there`);
      if (pc.kind === 'chair') {
        // (the whole chair is one soft block: its top is the seat)
        const seat = pc.seat ?? CHAIR.seat;
        platforms.push({ id: kitPlatId(ri, pc.id, 0), x: at.x - CHAIR.w / 2, y: at.y - seat, width: CHAIR.w, height: seat, type: 'solid', art: 'kit' });
      } else if (pc.kind === 'seesaw') {
        // its two ends, each half the plank, as they stand at rest
        const w = pc.w ?? KIT.seesawW;
        const [dl, dr] = seesawDy(pc.rest ?? -1, pc.rise ?? KIT.seesawRise);
        const [l, r] = seesawHalves(at.x, w);
        platforms.push({ id: kitPlatId(ri, pc.id, 0), x: l.x, y: at.y + dl, width: l.width, height: 18, type: 'solid', art: 'kit' });
        platforms.push({ id: kitPlatId(ri, pc.id, 1), x: r.x, y: at.y + dr, width: r.width, height: 18, type: 'solid', art: 'kit' });
      } else if (pc.kind === 'ledge') {
        // (not there until a light finds it: the kit makes it solid while it is lit)
        platforms.push({ id: kitPlatId(ri, pc.id, 0), x: at.x - pc.w / 2, y: at.y, width: pc.w, height: 22, type: 'solid', art: 'kit', broken: true });
      } else if (pc.kind === 'gate') {
        const h = pc.h ?? KIT.gateH;
        platforms.push({ id: kitPlatId(ri, pc.id, 0), x: at.x - KIT.gateW / 2, y: at.y - KIT.doorH, width: KIT.gateW, height: KIT.doorH, type: 'solid', art: 'kit' });
        platforms.push({ id: kitPlatId(ri, pc.id, 1), x: at.x - KIT.gateW / 2, y: at.y - h, width: KIT.gateW, height: h - KIT.doorH, type: 'solid', art: 'kit' });
      } else {
        // (a hanging cage's rope end: nothing to stand on, so it is never solid)
        platforms.push({ id: kitPlatId(ri, pc.id, 0), x: at.x - pc.w / 2, y: at.y, width: pc.w, height: 20, type: 'solid', art: 'kit', ...(pc.kind === 'lift' && pc.cage !== undefined ? { broken: true } : {}) });
      }
    });
  });
}

/** the platforms the kit makes that a room's things may rest on without being listed in its `ground` (a seesaw's ends, a hidden ledge) */
export function kitGround(room: RoomSpec, ri: number): number[] {
  const out: number[] = [];
  for (const pc of room.pieces) {
    if (pc.kind === 'seesaw') out.push(kitPlatId(ri, pc.id, 0), kitPlatId(ri, pc.id, 1));
    if (pc.kind === 'ledge') out.push(kitPlatId(ri, pc.id, 0));
  }
  return out;
}

/** a room's box in the world */
export function roomBox(room: RoomSpec, plats: readonly Platform[] | ReadonlyMap<number, Platform>): { x0: number; x1: number; y0: number; y1: number } {
  const l = anchorAt(room.left, plats);
  const r = anchorAt(room.right, plats);
  if (!l || !r) return { x0: 0, x1: 0, y0: 0, y1: 0 };
  return { x0: Math.min(l.x, r.x), x1: Math.max(l.x, r.x), y0: l.y - room.above, y1: l.y + room.below };
}

// ───────────────────────────── wires ─────────────────────────────

/** a wire's value, given each piece's output */
export function evalWire(w: Wire, out: (id: string) => boolean): boolean {
  if (typeof w === 'string') return out(w);
  if ('all' in w) return w.all.every((x) => evalWire(x, out));
  if ('any' in w) return w.any.some((x) => evalWire(x, out));
  return !evalWire(w.not, out);
}

/** the piece ids a wire reads that are false now (the parts still to do), in order; through `not` nothing is listed */
export function falseLeaves(w: Wire, out: (id: string) => boolean, acc: string[] = []): string[] {
  if (typeof w === 'string') {
    if (!out(w)) acc.push(w);
  } else if ('all' in w) for (const x of w.all) falseLeaves(x, out, acc);
  else if ('any' in w) {
    if (!w.any.some((x) => evalWire(x, out))) for (const x of w.any) falseLeaves(x, out, acc);
  }
  return acc;
}

/** every piece id a wire reads */
export function wireIds(w: Wire, acc: string[] = []): string[] {
  if (typeof w === 'string') acc.push(w);
  else if ('all' in w) for (const x of w.all) wireIds(x, acc);
  else if ('any' in w) for (const x of w.any) wireIds(x, acc);
  else wireIds(w.not, acc);
  return acc;
}

// ───────────────────────────── flight ─────────────────────────────

/** a thing in the air: its bottom middle and its speed */
export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** what a flight can meet, besides the ground */
export interface FlightWorld {
  platforms: readonly Platform[];
  /** the room's box: out of it, it is lost */
  box: { x0: number; x1: number; y0: number; y1: number };
  /** baskets' mouths (world): falling into one, it is caught */
  baskets: ReadonlyArray<{ x: number; y: number; half: number }>;
  /** levers' handles (world boxes): knocked as it flies through */
  levers: ReadonlyArray<{ x0: number; x1: number; y0: number; y1: number }>;
}

export type FlightEnd =
  | { kind: 'flying' }
  | { kind: 'ground'; plat: number; x: number }
  | { kind: 'basket'; idx: number }
  | { kind: 'lost' };

/** the start of a throw from his hands */
export function throwStart(kind: ThrowKind, px: number, feetY: number, facing: 1 | -1): Body {
  const v = THROW[kind];
  return { x: px + facing * THROW.handX, y: feetY - THROW.handY, vx: facing * v.vx, vy: v.vy };
}

/**
 * One fixed step of a thing's flight (THROW.dt). It lands on any platform top it comes down onto, bounces back off the side of a tall
 * block (a gate shut, a bank's face), drops into a basket's mouth from above, knocks any lever handle it passes through (the indices
 * go into `knocked`, once each per flight), and is lost once it leaves the room's box.
 */
export function flyStep(b: Body, w: FlightWorld, knocked?: Set<number>, r = 15): FlightEnd {
  const dt = THROW.dt;
  const px = b.x, py = b.y;
  b.vy += THROW.gravity * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  // the side of a tall block: back off it (a gate shut, a wall)
  for (const p of w.platforms) {
    if (p.broken || p.type !== 'solid' || p.height < 50) continue;
    if (b.y <= p.y + 4 || b.y - r * 2 >= p.y + p.height) continue;
    if (b.x + r <= p.x || b.x - r >= p.x + p.width) continue;
    if (px + r <= p.x + 1) {
      b.x = p.x - r;
      b.vx = -Math.abs(b.vx) * 0.35;
    } else if (px - r >= p.x + p.width - 1) {
      b.x = p.x + p.width + r;
      b.vx = Math.abs(b.vx) * 0.35;
    }
  }
  if (knocked) {
    w.levers.forEach((l, i) => {
      if (!knocked.has(i) && b.x + r > l.x0 && b.x - r < l.x1 && b.y > l.y0 && b.y - r * 2 < l.y1) {
        knocked.add(i);
        b.vx = -b.vx * 0.3;
      }
    });
  }
  if (b.vy > 0) {
    for (let i = 0; i < w.baskets.length; i++) {
      const m = w.baskets[i];
      if (py <= m.y && b.y >= m.y && Math.abs(b.x - m.x) <= m.half) return { kind: 'basket', idx: i };
    }
    let best: Platform | null = null;
    for (const p of w.platforms) {
      if (p.broken) continue;
      if (py <= p.y + 2 && b.y >= p.y && b.x >= p.x - 2 && b.x <= p.x + p.width + 2 && (!best || p.y < best.y)) best = p;
    }
    if (best) {
      b.y = best.y;
      return { kind: 'ground', plat: best.id, x: Math.max(best.x + 4, Math.min(best.x + best.width - 4, b.x)) };
    }
  }
  if (b.x < w.box.x0 - 40 || b.x > w.box.x1 + 40 || b.y > w.box.y1 + 60 || b.y < w.box.y0 - 400) return { kind: 'lost' };
  return { kind: 'flying' };
}

/** fly a thing to where it ends (the check's whole flight; the game steps it a frame at a time with flyStep) */
export function flyAll(b: Body, w: FlightWorld, r = 15, maxSteps = 600): { end: FlightEnd; knocked: number[] } {
  const knocked = new Set<number>();
  for (let i = 0; i < maxSteps; i++) {
    const e = flyStep(b, w, knocked, r);
    if (e.kind !== 'flying') return { end: e, knocked: [...knocked] };
  }
  return { end: { kind: 'lost' }, knocked: [...knocked] };
}

/** where a set-down lands: on the plate or basket in reach if there is one (snapped onto it), else just in front of his feet */
export function setDownX(px: number, facing: 1 | -1, plateXs: readonly number[], reach: number): number {
  let best = px + facing * KIT.setDown;
  let bd = Infinity;
  for (const x of plateXs) {
    const ahead = (x - px) * facing;
    if (ahead < -KIT.behind || ahead > reach) continue;
    const d = Math.abs(x - px);
    if (d < bd) {
      bd = d;
      best = x;
    }
  }
  return best;
}

/** is a thing at `x` on a plate centred at `px`, `w` wide */
export const onPlate = (x: number, px: number, w: number): boolean => Math.abs(x - px) <= w / 2;

/** what is pressing a plate: the weights on it against what it needs */
export const plateDown = (weight: number, need = 1): boolean => weight >= need;

/** a lift's height (0 down .. 1 up) for this much weight in its basket */
export const liftLevel = (weight: number, need = 1): number => Math.max(0, Math.min(1, weight / need));

// ───────────────────────────── the beetle ─────────────────────────────

export type BeetleMode = 'idle' | 'walk' | 'eat' | 'yawn' | 'sleep';
export interface BeetleState {
  mode: BeetleMode;
  x: number;
  plat: number;
  dir: 1 | -1;
  /** seconds in this mode */
  t: number;
  /** the food it is going for (an item index), or -1 */
  food: number;
}

/**
 * The beetle's one rule, simple and predictable: it sees food lying on the ground on its own ledge within its sight (and no shut gate
 * between), walks to it, stops with its mouth at it, eats it, yawns and falls asleep where it stands, for good (a room reset wakes it).
 * Asleep it presses whatever plate is under it. `foods`: the food lying still right now (index, platform, x). Returns the food it has
 * just finished eating (its index), or -1.
 */
export function stepBeetle(b: BeetleState, dt: number, foods: ReadonlyArray<{ idx: number; plat: number; x: number }>, sight: number, span: { x0: number; x1: number }, walls: readonly number[]): number {
  b.t += dt;
  const seen = (f: { plat: number; x: number }) =>
    f.plat === b.plat && Math.abs(f.x - b.x) <= sight && !walls.some((w) => (w - b.x) * (w - f.x) < 0);
  if (b.mode === 'idle') {
    let best = -1, bd = Infinity;
    for (const f of foods) if (seen(f) && Math.abs(f.x - b.x) < bd) { bd = Math.abs(f.x - b.x); best = f.idx; }
    if (best >= 0) {
      b.mode = 'walk';
      b.food = best;
      b.t = 0;
    }
    return -1;
  }
  if (b.mode === 'walk') {
    const f = foods.find((q) => q.idx === b.food);
    if (!f || !seen(f)) {
      // (picked up, or moved off): it stops where it is and looks about again
      b.mode = 'idle';
      b.food = -1;
      b.t = 0;
      return -1;
    }
    b.dir = f.x >= b.x ? 1 : -1;
    const stop = f.x - b.dir * BEETLE.mouth;
    const step = BEETLE.speed * dt;
    if (Math.abs(stop - b.x) <= step) {
      b.x = stop;
      b.mode = 'eat';
      b.t = 0;
    } else b.x += Math.sign(stop - b.x) * step;
    b.x = Math.max(span.x0 + BEETLE.half * 0.5, Math.min(span.x1 - BEETLE.half * 0.5, b.x));
    return -1;
  }
  if (b.mode === 'eat' && b.t >= BEETLE.eat) {
    const ate = b.food;
    b.mode = 'yawn';
    b.food = -1;
    b.t = 0;
    return ate;
  }
  if (b.mode === 'yawn' && b.t >= BEETLE.yawn) {
    b.mode = 'sleep';
    b.t = 0;
  }
  return -1;
}

/** where the beetle ends up asleep when it goes for food at `foodX` from `fromX` (the check's shortcut of stepBeetle) */
export const beetleSleepX = (fromX: number, foodX: number): number => foodX - (foodX >= fromX ? 1 : -1) * BEETLE.mouth;

// ───────────────────────────── phase 2a: seesaw, light, river, trade ─────────────────────────────

/** which way a seesaw tips for these weights on its left and right ends: -1 left end down, 1 right end down, `rest` when they are even */
export function seesawTilt(left: number, right: number, rest: -1 | 0 | 1 = -1): -1 | 0 | 1 {
  if (left > right) return -1;
  if (right > left) return 1;
  return rest;
}

/** how far over its down height each end of a seesaw stands for a tilt (0 down, -rise up, -rise/2 level): [left, right] */
export function seesawDy(tilt: -1 | 0 | 1, rise: number): [number, number] {
  if (tilt === -1) return [0, -rise];
  if (tilt === 1) return [-rise, 0];
  return [-rise / 2, -rise / 2];
}

/** a seesaw's two ends as platforms' boxes (x, width) from its pivot: the left half and the right half */
export function seesawHalves(pivotX: number, w: number): [{ x: number; width: number }, { x: number; width: number }] {
  return [{ x: pivotX - w / 2, width: w / 2 }, { x: pivotX, width: w / 2 }];
}

/** is a point lit by any of these lights (a glowing thing's middle and the radius it lights) */
export const isLit = (x: number, y: number, lights: ReadonlyArray<{ x: number; y: number; r: number }>): boolean =>
  lights.some((l) => Math.hypot(l.x - x, l.y - y) <= l.r);

/** a hidden ledge is lit when any light reaches some part of its top */
export function ledgeLit(x0: number, x1: number, y: number, lights: ReadonlyArray<{ x: number; y: number; r: number }>): boolean {
  return lights.some((l) => {
    const cx = Math.max(x0, Math.min(x1, l.x));
    return Math.hypot(cx - l.x, y - l.y) <= l.r;
  });
}

/** how fast a sluice's river clock runs for a flow: 1 with the current, -1 turned about, 0 stopped */
export const flowRate = (f: Flow): number => (f === 'with' ? 1 : f === 'against' ? -1 : 0);

/** a sluice's flow for its wire's value */
export const sluiceFlow = (spec: { opened?: Flow; shut?: Flow }, open: boolean): Flow => (open ? spec.opened ?? 'with' : spec.shut ?? 'still');

/** a river clock running at its sluice's rate eases to a new rate rather than jerking (s to change over) */
export const FLOW_EASE = 0.8;
export function stepFlow(rate: number, want: number, dt: number): number {
  const step = dt / FLOW_EASE * 2;
  return Math.abs(want - rate) <= step ? want : rate + Math.sign(want - rate) * step;
}

/** does a trader take this thing: a fruit it wants */
export const tradeTakes = (wants: ItemVariant, held: ItemVariant): boolean => wants === held;
