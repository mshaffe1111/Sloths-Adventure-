/**
 * puzzlePlay — a stage's puzzle rooms during a run (the rules are puzzleKit.ts; the look is puzzleArt.ts): the things lying, held,
 * flying and coming back, the plates, gates, levers, baskets and lifts and their wires, the lure beetles, the room reset, Pokey's carry
 * poses, the camera's lean toward the puzzle part that matters now (puzzleCamera.ts), the silent sparkle on Easy when he is clearly
 * stuck, and the piece Dot points at. The engine only lends it what it needs through `KitHost`, as World 4 and 5 do (w4Play.ts,
 * w5Play.ts), and reads the intents it took (engine.ts kitControls).
 */
import {
  anchorAt, BEETLE, evalWire, falseLeaves, flowRate, flyStep, ITEM, KIT, kitGround, kitPlatId, ledgeLit, liftLevel, onPlate, plateDown, roomBox,
  seesawDy, seesawTilt, setDownX, sluiceFlow, stepBeetle, stepFlow, throwStart, THROW, tradeTakes, useReach, isLit, type BeetleState, type Body,
  type FlightWorld, type ItemVariant, type KitExtras, type PieceSpec, type RoomSpec, type ThrowKind, type Wire, wireIds,
} from './puzzleKit.ts';
import { drawKitArt, handOf, kitArtReady, kitSize } from './puzzleArt.ts';
import { KIT_ART, type KitArtName } from './puzzleAtlasData.ts';
import { drawWallArt } from './protoArt.ts';
import { boxFits, fitZoom, heroBox, ROOM_CAM, roomZoom, unionBox, type CamBox } from './puzzleCamera.ts';
import { NOISE, prune, type Noise } from './noise.ts';
import { zoneEffect, type Zone } from './zones.ts';
import type { RiverZone } from './river.ts';
import { drawW4 } from './w4Art.ts';
import { drawW2Cage } from './riverArt.ts';
import type { Collectible, Platform, PlayerState as Player } from './types.ts';

/** what of the stage the kit's pieces reach beyond its platforms: the gust lanes a shutter shuts, the rivers a sluice runs, the reed cages
 * a lift hangs (World 2) */
export interface KitWorld {
  zones?: Zone[];
  rivers?: RiverZone[];
  collectibles?: Collectible[];
}

export interface KitHost {
  t: number;
  player: Player;
  /** the platform he stands on (-1 none) */
  standingOn: number;
  easy: boolean;
  /** a Dot line, once per stage (`key` remembers it) */
  tip(key: string, text: string, seconds: number): void;
  float(text: string, x: number, y: number, color: string): void;
  /** a room's line whose moment has passed (he has left the room): taken down, up or still waiting */
  passTip?(text: string): void;
  sfx(kind: KitSfx): void;
  /** he is clearly stuck in a room (Flicker's on-request hints hook in here later; Easy's sparkle is the kit's own) */
  stuck?(room: string): void;
  /** a hanging reed cage came all the way up and its floor dropped open: the little one in it is free (World 2) */
  freeCage?(c: Collectible): void;
}
export type KitSfx = 'pick' | 'drop' | 'throw' | 'land' | 'press' | 'gate' | 'lever' | 'munch' | 'lift' | 'reset' | 'lost' | 'ring' | 'tilt' | 'trade' | 'noise';

/** the intents the engine hands over this frame, and which the kit took (they are then not a punch, a jump or a kick) */
export interface KitIntents {
  tap: boolean;
  up: boolean;
  side: boolean;
  /** which way the side flick went (-1, 1), or 0 */
  sideDir: number;
}

type ItemMode = 'rest' | 'held' | 'fly' | 'basket' | 'wait' | 'gone' | 'trader';
interface ItemRun {
  spec: Extract<PieceSpec, { kind: 'item' }>;
  variant: ItemVariant;
  r: number;
  mode: ItemMode;
  plat: number;
  x: number;
  y: number;
  body: Body;
  acc: number;
  knocked: Set<number>;
  /** the knocked levers already flipped this flight */
  flipped: Set<number>;
  /** seconds until a lost one comes back */
  wait: number;
  basket: number;
  spin: number;
  /** where it starts and where a lost one falls back to */
  home: { plat: number; x: number; y: number };
  fromSource: boolean;
  /** in flight from a throw (it lands with a noise if it is a noisy thing), not from a set-down or a drop */
  thrown: boolean;
  /** the trader that holds it at the start (an index), or -1 */
  trader: number;
}
interface PlateRun { spec: Extract<PieceSpec, { kind: 'plate' }>; x: number; y: number; plat: number; w: number; down: boolean; show: number }
interface GateRun { spec: Extract<PieceSpec, { kind: 'gate' }>; x: number; y: number; door: Platform; wall: Platform; open: boolean; latched: boolean; show: number; panned: boolean; opened: boolean }
interface LeverRun { spec: Extract<PieceSpec, { kind: 'lever' }>; x: number; y: number; plat: number; on: boolean; show: number }
interface BasketRun { spec: Extract<PieceSpec, { kind: 'basket' }>; x: number; y: number; weight: number; count: number }
interface LiftRun { spec: Extract<PieceSpec, { kind: 'lift' }>; plat: Platform; baseY: number; level: number; basket: number; unwind?: boolean; cage?: Collectible }
interface BeetleRun { spec: Extract<PieceSpec, { kind: 'beetle' }>; st: BeetleState; home: number; span: { x0: number; x1: number }; told: boolean }
interface SourceRun { spec: Extract<PieceSpec, { kind: 'source' }>; x: number; y: number; plat: number }
interface ResetRun { spec: Extract<PieceSpec, { kind: 'reset' }>; x: number; y: number; plat: number }
interface SeesawRun { spec: Extract<PieceSpec, { kind: 'seesaw' }>; x: number; y: number; foot: number; w: number; rise: number; rest: -1 | 0 | 1; ends: [Platform, Platform]; tilt: -1 | 0 | 1; show: number }
interface BellRun { spec: Extract<PieceSpec, { kind: 'bell' }>; x: number; y: number; plat: number; rung: number }
interface LedgeRun { spec: Extract<PieceSpec, { kind: 'ledge' }>; plat: Platform; lit: boolean; show: number }
interface MarkRun { spec: Extract<PieceSpec, { kind: 'mark' }>; x: number; y: number; show: number }
interface ShutterRun { spec: Extract<PieceSpec, { kind: 'shutter' }>; x: number; y: number; zone: Zone | undefined; open: boolean }
interface PinwheelRun { spec: Extract<PieceSpec, { kind: 'pinwheel' }>; x: number; y: number; spin: boolean; ang: number }
interface SluiceRun { spec: Extract<PieceSpec, { kind: 'sluice' }>; x: number; y: number; river: RiverZone | undefined; open: boolean; rate: number; rafts: Platform[] }
interface TraderRun { spec: Extract<PieceSpec, { kind: 'trader' }>; x: number; y: number; plat: number; done: boolean; t: number }

/** a bell's box a thrown thing knocks (world) */
const bellBox = (b: { x: number; y: number }) => ({ x0: b.x - 26, x1: b.x + 26, y0: b.y - 110, y1: b.y - 20 });

interface RoomRun {
  spec: RoomSpec;
  ri: number;
  box: { x0: number; x1: number; y0: number; y1: number };
  /** the spot past the way on (world), for the camera */
  beyond: { x: number; y: number } | null;
  items: ItemRun[];
  plates: PlateRun[];
  gates: GateRun[];
  levers: LeverRun[];
  baskets: BasketRun[];
  lifts: LiftRun[];
  beetles: BeetleRun[];
  sources: SourceRun[];
  resets: ResetRun[];
  seesaws: SeesawRun[];
  bells: BellRun[];
  ledges: LedgeRun[];
  marks: MarkRun[];
  shutters: ShutterRun[];
  pinwheels: PinwheelRun[];
  sluices: SluiceRun[];
  traders: TraderRun[];
  ground: Set<number>;
  /** a count of every change of the puzzle's state (a plate, a gate, a lever, a basket, a beetle asleep, a thing picked up) */
  changes: number;
  /** the stuck watch (Easy): seconds in the room since the last change, turns about, things that landed with nothing changed */
  calm: number;
  turns: number;
  fails: number;
  lastDir: number;
  sparkle: boolean;
  told: Set<string>;
}

/**
 * A wall of bundled reeds over a gate (World 2's court, in the reeds of its archway and its woven gate): upright bundles side by side,
 * their tops ragged, tied across with two ropes. (The kit's wall piece is World 2's riverbank column: over the court gate it read as a
 * pillar of earth, not a wall.)
 */
function drawReedWall(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, w: number) {
  const n = Math.max(3, Math.round(w / 20));
  const bw = w / n;
  ctx.save();
  ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const bx = x + i * bw;
    const t = top - 6 + ((i * 5) % 3) * 5;
    ctx.fillStyle = i % 2 ? '#b38545' : '#c89a58';
    ctx.strokeStyle = '#4a3014';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + 1, bottom);
    ctx.lineTo(bx + 1, t + 6);
    ctx.lineTo(bx + bw * 0.3, t);
    ctx.lineTo(bx + bw * 0.55, t + 4);
    ctx.lineTo(bx + bw * 0.8, t - 2);
    ctx.lineTo(bx + bw - 1, t + 6);
    ctx.lineTo(bx + bw - 1, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // (the reeds in the bundle)
    ctx.strokeStyle = 'rgba(90, 58, 24, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const k of [0.32, 0.6]) {
      ctx.moveTo(bx + bw * k, t + 8);
      ctx.lineTo(bx + bw * k, bottom);
    }
    ctx.stroke();
  }
  // the two ropes that tie it
  for (const y of [top + 18, top + (bottom - top) * 0.55]) {
    if (y > bottom - 12) continue;
    ctx.fillStyle = '#7a5228';
    ctx.fillRect(x - 2, y, w + 4, 6);
    ctx.strokeStyle = '#3b2610';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y, w + 4, 6);
    ctx.fillStyle = 'rgba(255, 230, 170, 0.35)';
    ctx.fillRect(x - 1, y + 1, w + 2, 1.5);
  }
  ctx.restore();
}

/** where each seesaw painting's round pivot is across its frame (atlas px, measured from puzzle-kit.webp) */
const SEESAW_PIVOT: Record<'seesawLevel' | 'seesawUpR' | 'seesawUpL', number> = { seesawLevel: 105, seesawUpR: 105, seesawUpL: 90 };

/** the active part: where it is, how big a ring Dot's pointer wants, and which piece it is (none: the room's middle) */
type Focus = { x: number; y: number; r: number; id?: string };

/** Pokey's pose while he carries, throws or sets down (null: his own sprite) */
type Pose = { kind: 'pick' | 'throw' | 'set'; t: number; dur: number } | null;

const ART_OF: Record<ItemVariant, KitArtName> = { acorn: 'acorn', stone: 'stone', pinecone: 'pinecone', cake: 'cake', pebble: 'pebble', mushroom: 'mushroom', mango: 'mango' };
/** Pokey's carry poses are painted holding an acorn: carrying anything else, the same pose with the acorn painted out (packkit.py e*) */
const EMPTY_OF: Partial<Record<KitArtName, KitArtName>> = { p2: 'e2', p3: 'e3', p4: 'e4', p5: 'e5', p6: 'e6', p7: 'e7', p8: 'e8', p9: 'e9', p13: 'e13' };
const PILE_OF: Partial<Record<ItemVariant, KitArtName>> = { acorn: 'acornPile', stone: 'stonePile', pebble: 'stonePile' };
/** a reed cage's floor stands this far under its middle (the collectible's y: the cage's floor is its y + this, riverArt.ts) */
const CAGE_FLOOR = 26;

/** the stuck help (Easy): in the room this long with nothing changing, or turning about this often, or this many misses */
export const STUCK = { calm: 20, turns: 8, turnsCalm: 6, fails: 2 } as const;

export class KitPlay {
  readonly rooms: RoomRun[] = [];
  /** the room he is in (its index), or -1 */
  inRoom = -1;
  /** the thing in his hands: its room and index */
  private held: { room: number; item: number } | null = null;
  private pose: Pose = null;
  private pan: { x: number; y: number; t: number } | null = null;
  /** the puzzle piece Dot points at (GuideView.kit): the active part while he is in a room, nothing outside one */
  readonly guideThings: Array<{ x: number; y: number; r: number }> = [];
  private focusPt: Focus = { x: 0, y: 0, r: 30 };
  private t = 0;
  /** a room's lines still to take down, one a frame */
  private passing: string[] = [];

  /** the noises made in the rooms (noise.ts), for the watchers to hear: the engine hands each the one it hears */
  readonly noises: Noise[] = [];

  constructor(kit: KitExtras, platforms: Platform[], world: KitWorld = {}) {
    const byId = new Map(platforms.map((p) => [p.id, p]));
    this.extraZones = (world.zones ?? []).filter((z) => z.kind === 'wind');
    kit.rooms.forEach((spec, ri) => {
      const at = (pc: PieceSpec) => ('at' in pc && pc.at ? anchorAt(pc.at, byId) : null);
      const room: RoomRun = {
        spec, ri, box: roomBox(spec, byId), beyond: anchorAt(spec.beyond, byId), items: [], plates: [], gates: [], levers: [], baskets: [], lifts: [], beetles: [], sources: [], resets: [],
        seesaws: [], bells: [], ledges: [], marks: [], shutters: [], pinwheels: [], sluices: [], traders: [],
        ground: new Set([...spec.ground, ...kitGround(spec, ri)]), changes: 0, calm: 0, turns: 0, fails: 0, lastDir: 0, sparkle: false, told: new Set(),
      };
      for (const pc of spec.pieces) {
        const a = at(pc);
        if (pc.kind === 'source' && a) room.sources.push({ spec: pc, x: a.x, y: a.y, plat: pc.at.on });
        if (pc.kind === 'plate' && a) room.plates.push({ spec: pc, x: a.x, y: a.y, plat: pc.at.on, w: pc.w ?? KIT.plateW, down: false, show: 0 });
        if (pc.kind === 'lever' && a) room.levers.push({ spec: pc, x: a.x, y: a.y, plat: pc.at.on, on: !!pc.on, show: pc.on ? 1 : 0 });
        if (pc.kind === 'basket' && a) room.baskets.push({ spec: pc, x: a.x, y: a.y, weight: 0, count: 0 });
        if (pc.kind === 'reset' && a) room.resets.push({ spec: pc, x: a.x, y: a.y, plat: pc.at.on });
        if (pc.kind === 'gate' && a) {
          const door = byId.get(kitPlatId(ri, pc.id, 0));
          const wall = byId.get(kitPlatId(ri, pc.id, 1));
          if (door && wall) room.gates.push({ spec: pc, x: a.x, y: a.y, door, wall, open: false, latched: false, show: 0, panned: false, opened: false });
        }
        if (pc.kind === 'lift') {
          const plat = byId.get(kitPlatId(ri, pc.id, 0));
          // (a hanging cage: built where it ends up, lifted; it starts down where the rope's end is)
          const cage = pc.cage !== undefined ? world.collectibles?.find((c) => c.id === pc.cage && c.type === 'cage') : undefined;
          if (cage && plat) cage.y = plat.y - CAGE_FLOOR;
          if (plat) room.lifts.push({ spec: pc, plat, baseY: plat.y, level: 0, basket: -1, ...(cage ? { cage } : {}) });
        }
        if (pc.kind === 'seesaw' && a) {
          const l = byId.get(kitPlatId(ri, pc.id, 0));
          const r = byId.get(kitPlatId(ri, pc.id, 1));
          const rest = pc.rest ?? -1;
          if (l && r) room.seesaws.push({ spec: pc, x: a.x, y: a.y, foot: byId.get(pc.at.on)?.y ?? a.y, w: pc.w ?? KIT.seesawW, rise: pc.rise ?? KIT.seesawRise, rest, ends: [l, r], tilt: rest, show: rest });
        }
        if (pc.kind === 'bell' && a) room.bells.push({ spec: pc, x: a.x, y: a.y, plat: pc.at.on, rung: -Infinity });
        if (pc.kind === 'ledge') {
          const plat = byId.get(kitPlatId(ri, pc.id, 0));
          if (plat) room.ledges.push({ spec: pc, plat, lit: false, show: 0 });
        }
        if (pc.kind === 'mark' && a) room.marks.push({ spec: pc, x: a.x, y: a.y, show: 0 });
        if (pc.kind === 'shutter' && a) room.shutters.push({ spec: pc, x: a.x, y: a.y, zone: world.zones?.[pc.zone], open: false });
        if (pc.kind === 'pinwheel' && a) room.pinwheels.push({ spec: pc, x: a.x, y: a.y, spin: false, ang: 0 });
        if (pc.kind === 'sluice' && a) {
          const river = world.rivers?.[pc.river];
          // (2-2's ferry: its raft is painted as the raft it is, over the log the river draws)
          const rafts = river?.raft ? platforms.filter((q) => q.type === 'drift' && q.drift && q.drift.x0 === river.x0 && q.drift.x1 === river.x1) : [];
          room.sluices.push({ spec: pc, x: a.x, y: a.y, river, open: false, rate: 1, rafts });
        }
        if (pc.kind === 'trader' && a) room.traders.push({ spec: pc, x: a.x, y: a.y, plat: pc.at.on, done: false, t: 0 });
        if (pc.kind === 'beetle' && a) {
          const p = byId.get(pc.at.on)!;
          room.beetles.push({ spec: pc, home: a.x, span: { x0: p.x, x1: p.x + p.width }, told: false, st: { mode: 'idle', x: a.x, plat: pc.at.on, dir: -1, t: 0, food: -1 } });
        }
      }
      for (const l of room.lifts) l.basket = room.baskets.findIndex((b) => b.spec.id === l.spec.by);
      for (const pc of spec.pieces) {
        if (pc.kind !== 'item') continue;
        const src = pc.source ? room.sources.find((s) => s.spec.id === pc.source) : undefined;
        const ti = pc.with ? room.traders.findIndex((t) => t.spec.id === pc.with) : -1;
        const tr = room.traders[ti];
        const a = pc.at ? anchorAt(pc.at, byId) : src ? { x: src.x, y: src.y } : tr ? { x: tr.x, y: tr.y } : null;
        if (!a) continue;
        const plat = pc.at?.on ?? src?.plat ?? tr!.plat;
        const home = { plat, x: a.x, y: a.y };
        room.items.push({
          spec: pc, variant: pc.variant, r: ITEM[pc.variant].r, mode: tr ? 'trader' : 'rest', plat, x: a.x, y: a.y, body: { x: 0, y: 0, vx: 0, vy: 0 }, acc: 0,
          knocked: new Set(), flipped: new Set(), wait: 0, basket: -1, spin: 0, home, fromSource: !!src, thrown: false, trader: ti,
        });
      }
      this.rooms.push(room);
    });
  }

  /** his hands are full */
  get holding(): boolean {
    return !!this.held;
  }

  /** is this reed cage hung on a lift (World 2): no punch breaks it, the lift frees it, and the kit draws it */
  holdsCage(c: Collectible): boolean {
    return this.rooms.some((r) => r.lifts.some((l) => l.cage === c));
  }

  /** a room's pieces' outputs, for its wires */
  private output(room: RoomRun, id: string): boolean {
    const pl = room.plates.find((p) => p.spec.id === id);
    if (pl) return pl.down;
    const lv = room.levers.find((p) => p.spec.id === id);
    if (lv) return lv.on;
    const bi = room.baskets.findIndex((p) => p.spec.id === id);
    if (bi >= 0) return room.baskets[bi].weight >= (room.baskets[bi].spec.need ?? 1);
    const g = room.gates.find((p) => p.spec.id === id);
    if (g) return g.open;
    const lf = room.lifts.find((p) => p.spec.id === id);
    if (lf) return lf.level >= 0.999;
    const ss = room.seesaws.find((p) => p.spec.id === id);
    if (ss) return ss.tilt !== ss.rest;
    const bl = room.bells.find((p) => p.spec.id === id);
    if (bl) return this.t - bl.rung < NOISE.dur;
    const sh = room.shutters.find((p) => p.spec.id === id);
    if (sh) return sh.open;
    const pw = room.pinwheels.find((p) => p.spec.id === id);
    if (pw) return pw.spin;
    const sl = room.sluices.find((p) => p.spec.id === id);
    if (sl) return sl.open;
    const td = room.traders.find((p) => p.spec.id === id);
    if (td) return td.done;
    const ld = room.ledges.find((p) => p.spec.id === id);
    if (ld) return ld.lit;
    return false;
  }

  /** the glowing things' light (World 3's mushroom), carried, lying, flying or in a basket: world middle and radius */
  lights(): Array<{ x: number; y: number; r: number }> {
    const out: Array<{ x: number; y: number; r: number }> = [];
    for (const room of this.rooms) {
      for (const it of room.items) {
        const r = ITEM[it.variant].light;
        if (!r || it.mode === 'wait' || it.mode === 'gone' || it.mode === 'trader') continue;
        const b = room.baskets[it.basket];
        const pos = it.mode === 'fly' ? { x: it.body.x, y: it.body.y } : it.mode === 'basket' && b ? { x: b.x, y: this.mouthY(room, b) + 20 } : { x: it.x, y: it.y };
        out.push({ x: pos.x, y: pos.y - it.r, r });
      }
    }
    return out;
  }

  /** make a noise the watchers hear (noise.ts) */
  private noise(x: number, y: number, from: Noise['from'], h: KitHost) {
    this.noises.push({ x, y, t: h.t, r: from === 'bell' ? NOISE.bellHear : NOISE.hear, from });
    h.sfx(from === 'bell' ? 'ring' : 'noise');
  }

  /** ring a bell: it swings, and the watchers near turn to it */
  private ring(room: RoomRun, b: BellRun, h: KitHost) {
    b.rung = this.t;
    room.changes++;
    this.noise(b.x, b.y - 60, 'bell', h);
    h.float('DONG!', b.x, b.y - 130, '#fde68a');
  }

  private flightWorld(room: RoomRun, platforms: readonly Platform[]): FlightWorld {
    return {
      platforms,
      box: room.box,
      baskets: room.baskets.map((b) => ({ x: b.x, y: this.mouthY(room, b), half: KIT.mouthHalf })),
      // (a bell is knocked like a lever's handle: its index comes after the levers')
      levers: [...room.levers.map((l) => ({ x0: l.x - 18, x1: l.x + 18, y0: l.y - 60, y1: l.y })), ...room.bells.map((b) => bellBox(b))],
    };
  }

  private mouthY(room: RoomRun, b: BasketRun): number {
    const li = room.lifts.find((l) => l.spec.by === b.spec.id);
    return b.y - b.spec.mouth + (b.spec.drop ?? 0) * (li ? li.level : 0);
  }

  // ───────────────────────────── the controls ─────────────────────────────

  /**
   * The intents of this frame, read again: carrying, a flick up throws up and forward, a flick toward throws forward and a tap sets it
   * down (all three are his, whatever they do); hands free, a tap with a piece in reach in front of him uses it. Returns what it took.
   */
  control(inp: KitIntents, h: KitHost, platforms: readonly Platform[]): KitIntents {
    const took: KitIntents = { tap: false, up: false, side: false, sideDir: 0 };
    const p = h.player;
    const f: 1 | -1 = p.facing >= 0 ? 1 : -1;
    if (this.held) {
      const room = this.rooms[this.held.room];
      const it = room.items[this.held.item];
      if (inp.up) {
        this.throwIt(room, it, 'up', f, h);
        took.up = true;
      } else if (inp.side) {
        const d: 1 | -1 = inp.sideDir < 0 ? -1 : inp.sideDir > 0 ? 1 : f;
        this.throwIt(room, it, 'fwd', d, h);
        took.side = true;
      } else if (inp.tap) {
        const tr = room.traders.find((t) => !t.done && Math.abs(t.x - p.x) <= KIT.tradeReach && Math.abs(t.y - p.y) <= KIT.up);
        if (tr && tradeTakes(tr.spec.wants, it.variant)) this.trade(room, tr, it, h);
        else this.setDown(room, it, f, h);
        took.tap = true;
      }
      // (a press of the other two while carrying is never a jump or a kick)
      if (inp.up) took.up = true;
      if (inp.side) took.side = true;
      return took;
    }
    if (!inp.tap || !p.grounded) return took;
    const reach = useReach(h.easy);
    const inFront = (x: number, y: number) => {
      const ahead = (x - p.x) * f;
      return ahead >= -KIT.behind && ahead <= reach && y <= p.y + KIT.down && y >= p.y - KIT.up;
    };
    let best: { d: number; go: () => void } | null = null;
    const consider = (x: number, y: number, go: () => void) => {
      if (!inFront(x, y)) return;
      const d = Math.abs(x - p.x);
      if (!best || d < best.d) best = { d, go };
    };
    this.rooms.forEach((room, ri) => {
      if (p.x < room.box.x0 - 80 || p.x > room.box.x1 + 80) return;
      room.items.forEach((it, ii) => {
        if (it.mode === 'rest') consider(it.x, it.y, () => this.pickUp(room, ri, ii, h));
        // (out of a basket hanging low enough to reach: the lift it holds up comes back down)
        if (it.mode === 'basket') {
          const b = room.baskets[it.basket];
          if (b) consider(b.x, this.mouthY(room, b), () => this.pickUp(room, ri, ii, h));
        }
      });
      room.levers.forEach((l) => consider(l.x, l.y, () => this.pull(room, l, h)));
      room.bells.forEach((b) => consider(b.x, b.y, () => this.ring(room, b, h)));
      // (a trader asked with empty hands: Dot says what it wants)
      room.traders.forEach((t) => {
        if (!t.done) consider(t.x, t.y, () => h.float(`IT WANTS A ${t.spec.wants.toUpperCase()}`, t.x, t.y - 120, '#fde68a'));
      });
      room.resets.forEach((r) => consider(r.x, r.y, () => this.resetRoom(room, h, platforms)));
    });
    if (best) {
      (best as { go: () => void }).go();
      took.tap = true;
    }
    return took;
  }

  private pickUp(room: RoomRun, ri: number, ii: number, h: KitHost) {
    const it = room.items[ii];
    it.mode = 'held';
    it.basket = -1;
    this.held = { room: ri, item: ii };
    this.pose = { kind: 'pick', t: 0, dur: 0.28 };
    room.changes++;
    h.sfx('pick');
    if (room.spec.tips?.hold && !room.told.has('hold')) {
      room.told.add('hold');
      h.tip(`kit:${room.spec.id}:hold`, room.spec.tips.hold, 4);
    }
  }

  private pull(room: RoomRun, l: LeverRun, h: KitHost) {
    l.on = !l.on;
    room.changes++;
    h.sfx('lever');
  }

  /** a trader takes the fruit he offers, and drops what it holds in front of it, toward him */
  private trade(room: RoomRun, tr: TraderRun, it: ItemRun, h: KitHost) {
    this.held = null;
    this.pose = { kind: 'set', t: 0, dur: 0.26 };
    it.mode = it.fromSource ? 'wait' : 'gone';
    it.wait = KIT.respawn + 2;
    tr.done = true;
    tr.t = 0;
    room.changes++;
    h.sfx('trade');
    h.float('!', tr.x, tr.y - 120, '#fde68a');
    const ti = room.traders.indexOf(tr);
    const dir = h.player.x >= tr.x ? 1 : -1;
    for (const g of room.items) {
      if (g.trader !== ti || g.mode !== 'trader') continue;
      g.body = { x: tr.x + dir * 20, y: tr.y - 80, vx: dir * 140, vy: -260 };
      g.mode = 'fly';
      g.acc = 0;
      g.thrown = false;
      g.knocked = new Set();
      g.flipped = new Set();
    }
  }

  private throwIt(room: RoomRun, it: ItemRun, kind: ThrowKind, f: 1 | -1, h: KitHost) {
    const p = h.player;
    it.body = throwStart(kind, p.x, p.y, f);
    it.thrown = true;
    it.mode = 'fly';
    it.acc = 0;
    it.knocked = new Set();
    it.flipped = new Set();
    it.spin = 0;
    this.held = null;
    this.pose = { kind: 'throw', t: 0, dur: 0.36 };
    room.changes++;
    h.sfx('throw');
  }

  private setDown(room: RoomRun, it: ItemRun, f: 1 | -1, h: KitHost) {
    const p = h.player;
    const reach = useReach(h.easy);
    this.held = null;
    this.pose = { kind: 'set', t: 0, dur: 0.26 };
    room.changes++;
    // into a basket hanging in reach in front of him
    const bi = room.baskets.findIndex((b) => {
      const my = this.mouthY(room, b);
      const ahead = (b.x - p.x) * f;
      return ahead >= -KIT.behind && ahead <= reach && my >= p.y - KIT.up && my <= p.y;
    });
    if (bi >= 0) {
      it.mode = 'basket';
      it.basket = bi;
      h.sfx('drop');
      return;
    }
    // on a plate in reach (snapped onto it), else in front of his feet: it drops from his hands there
    const plateXs = room.plates.filter((q) => q.plat === h.standingOn).map((q) => q.x);
    const x = setDownX(p.x, f, plateXs, reach);
    it.body = { x, y: p.y - 4, vx: 0, vy: 0 };
    it.thrown = false;
    it.mode = 'fly';
    it.acc = 0;
    it.knocked = new Set();
    it.flipped = new Set();
    h.sfx('drop');
  }

  /** start the room again: things back where they started, the beetles awake at home, the levers, gates and lifts as they were */
  private resetRoom(room: RoomRun, h: KitHost, platforms: readonly Platform[]) {
    void platforms;
    if (this.held && this.held.room === room.ri) this.held = null;
    for (const it of room.items) this.home(it);
    for (const b of room.beetles) b.st = { mode: 'idle', x: b.home, plat: b.st.plat, dir: -1, t: 0, food: -1 };
    for (const l of room.levers) l.on = !!l.spec.on;
    for (const g of room.gates) g.latched = false;
    for (const t of room.traders) t.done = false;
    for (const l of room.lifts) if (l.basket < 0) l.unwind = true;
    for (const b of room.bells) b.rung = -Infinity;
    room.changes++;
    room.sparkle = false;
    h.sfx('reset');
    h.float('STARTING AGAIN', room.resets[0]?.x ?? h.player.x, (room.resets[0]?.y ?? h.player.y) - 110, '#fde68a');
  }

  private home(it: ItemRun) {
    it.mode = it.trader >= 0 ? 'trader' : 'rest';
    it.plat = it.home.plat;
    it.x = it.home.x;
    it.y = it.home.y;
    it.basket = -1;
  }

  /** a lost thing: it comes back to its source a moment later (one with no source is gone until the room starts again) */
  private lose(room: RoomRun, it: ItemRun, h: KitHost) {
    if (it.trader >= 0) {
      // (what a trader dropped comes back by the trader's stump: the trade is never undone)
      this.byTrader(room, it);
      h.sfx('lost');
      room.fails++;
      return;
    }
    it.mode = it.fromSource ? 'wait' : 'gone';
    it.wait = KIT.respawn;
    h.sfx('lost');
    room.fails++;
  }

  /** he lost a life (or was sent back to a flag): what he held goes back to its source */
  onRespawn() {
    if (!this.held) return;
    const room = this.rooms[this.held.room];
    const it = room.items[this.held.item];
    it.mode = it.fromSource ? 'wait' : 'rest';
    it.wait = KIT.respawn;
    if (it.trader >= 0) this.byTrader(room, it);
    else if (!it.fromSource) this.home(it);
    this.held = null;
  }

  /** a traded thing lying on the ground beside its trader */
  private byTrader(room: RoomRun, it: ItemRun) {
    const tr = room.traders[it.trader];
    if (!tr?.done) {
      this.home(it);
      return;
    }
    it.mode = 'rest';
    it.plat = tr.plat;
    it.x = tr.x - 56;
    it.y = tr.y;
  }

  // ───────────────────────────── each frame ─────────────────────────────

  /** step every room; returns what carrying does to his run speed (1: nothing) */
  step(dt: number, h: KitHost, platforms: readonly Platform[]): number {
    this.t += dt;
    prune(this.noises, h.t);
    const p = h.player;
    if (this.pose) {
      this.pose.t += dt;
      if (this.pose.t >= this.pose.dur) this.pose = null;
    }
    const was = this.inRoom;
    this.inRoom = this.rooms.findIndex((r) => p.x >= r.box.x0 && p.x <= r.box.x1 && p.y >= r.box.y0 && p.y <= r.box.y1);
    // out of a room: its lines are old news (one still waiting must not come in the next room)
    // (one a frame: the app keeps only the engine's last line of a frame)
    if (was >= 0 && was !== this.inRoom) for (const text of Object.values(this.rooms[was].spec.tips ?? {})) if (text) this.passing.push(text);
    const next = this.passing.shift();
    if (next) h.passTip?.(next);
    for (const room of this.rooms) this.stepRoom(room, dt, h, platforms);
    if (this.pan) {
      this.pan.t -= dt;
      if (this.pan.t <= 0) this.pan = null;
    }
    // what Dot points at: the active part, while he is in a room
    this.guideThings.length = 0;
    if (this.inRoom >= 0) {
      const f = this.focus(this.rooms[this.inRoom]);
      this.focusPt = f;
      this.guideThings.push(f);
    }
    return this.held ? KIT.carrySpeed : 1;
  }

  private stepRoom(room: RoomRun, dt: number, h: KitHost, platforms: readonly Platform[]) {
    const p = h.player;
    const before = room.changes;
    const inside = this.rooms[this.inRoom] === room;
    if (inside && room.spec.tips?.enter && !room.told.has('enter')) {
      room.told.add('enter');
      h.tip(`kit:${room.spec.id}:enter`, room.spec.tips.enter, 4.5);
    }
    const world = this.flightWorld(room, platforms);
    const byId = (id: number) => platforms.find((q) => q.id === id);
    // things: flying ones fly (at the flight's own fixed step), resting ones stay on their ground, lost ones come back
    let landedQuiet = false;
    for (const it of room.items) {
      if (it.mode === 'held') {
        it.x = p.x + p.facing * 16;
        it.y = p.y - 40;
        continue;
      }
      if (it.mode === 'trader') continue;
      if (it.mode === 'wait') {
        it.wait -= dt;
        if (it.wait <= 0) {
          // a fresh one falls from its tree onto the ground under it (from a pile or a plate of cakes, it is simply there again)
          const tree = room.sources.find((s) => s.spec.id === it.spec.source)?.spec.look === 'tree';
          it.body = { x: it.home.x, y: it.home.y - (tree ? KIT.dropFrom : 6), vx: 0, vy: 0 };
          it.mode = 'fly';
          it.acc = 0;
          it.knocked = new Set();
    it.flipped = new Set();
        }
        continue;
      }
      if (it.mode === 'fly') {
        it.acc += dt;
        it.spin += dt * (it.body.vx >= 0 ? 9 : -9);
        while (it.acc >= THROW.dt && it.mode === 'fly') {
          it.acc -= THROW.dt;
          const end = flyStep(it.body, world, it.knocked, it.r);
          if (end.kind === 'flying') continue;
          if (end.kind === 'ground') {
            if (room.ground.has(end.plat)) {
              it.mode = 'rest';
              it.plat = end.plat;
              it.x = end.x;
              it.y = byId(end.plat)?.y ?? it.body.y;
              h.sfx('land');
              landedQuiet = true;
              // a thrown stone, pebble or acorn lands with a clack the watchers hear (noise.ts)
              if (it.thrown && ITEM[it.variant].noisy) this.noise(it.x, it.y, 'land', h);
            } else this.lose(room, it, h);
            it.thrown = false;
          } else if (end.kind === 'basket') {
            it.mode = 'basket';
            it.basket = end.idx;
            h.sfx('drop');
          } else this.lose(room, it, h);
        }
        // knocked levers flip as it passes
        for (const li of it.knocked) {
          if (it.flipped.has(li)) continue;
          it.flipped.add(li);
          if (li >= room.levers.length) {
            const b = room.bells[li - room.levers.length];
            if (b) this.ring(room, b, h);
            continue;
          }
          const l = room.levers[li];
          l.on = !l.on;
          room.changes++;
          h.sfx('lever');
        }
        if (it.mode === 'fly') {
          it.x = it.body.x;
          it.y = it.body.y;
        }
        continue;
      }
      if (it.mode === 'rest') {
        const g = byId(it.plat);
        if (!g || g.broken) {
          // the ground went from under it (a gate's top opening): it falls
          it.body = { x: it.x, y: it.y, vx: 0, vy: 0 };
          it.mode = 'fly';
          it.acc = 0;
        } else it.y = g.y;
      }
    }
    // beetles: food lying still on their ledge, in sight, with no shut gate between
    const walls = room.gates.filter((g) => !g.open).map((g) => g.x);
    for (const b of room.beetles) {
      const was = b.st.mode;
      const foods: Array<{ idx: number; plat: number; x: number }> = [];
      room.items.forEach((it, i) => { if (it.mode === 'rest' && ITEM[it.variant].food) foods.push({ idx: i, plat: it.plat, x: it.x }); });
      const ate = stepBeetle(b.st, dt, foods, b.spec.sight ?? BEETLE.sight, b.span, walls);
      if (was === 'idle' && b.st.mode === 'walk') h.float('!', b.st.x, this.groundY(b) - 80, '#fde68a');
      if (was !== 'eat' && b.st.mode === 'eat') h.sfx('munch');
      if (ate >= 0) {
        const it = room.items[ate];
        it.mode = it.fromSource ? 'wait' : 'gone';
        it.wait = KIT.respawn + 0.8;
      }
      if (was !== 'sleep' && b.st.mode === 'sleep') {
        room.changes++;
        h.float('Zzz', b.st.x, (byId(b.st.plat)?.y ?? 0) - 70, '#ddd6fe');
        const onAny = room.plates.some((q) => q.plat === b.st.plat && onPlate(b.st.x, q.x, q.w));
        if (!onAny && room.spec.tips?.stuck && !room.told.has('stuck')) {
          room.told.add('stuck');
          h.tip(`kit:${room.spec.id}:stuck`, room.spec.tips.stuck, 4);
        }
      }
    }
    // plates
    for (const pl of room.plates) {
      let w = 0;
      if (p.grounded && h.standingOn === pl.plat && Math.abs(p.x - pl.x) <= pl.w / 2 + 4) w += KIT.pokeyWeight;
      for (const it of room.items) if (it.mode === 'rest' && it.plat === pl.plat && onPlate(it.x, pl.x, pl.w)) w += ITEM[it.variant].weight;
      for (const b of room.beetles) if (b.st.plat === pl.plat && onPlate(b.st.x, pl.x, pl.w)) w += KIT.beetleWeight;
      const down = plateDown(w, pl.spec.need ?? 1);
      if (down !== pl.down) {
        pl.down = down;
        room.changes++;
        if (down) h.sfx('press');
      }
      pl.show += ((pl.down ? 1 : 0) - pl.show) * Math.min(1, dt * 14);
    }
    for (const l of room.levers) l.show += ((l.on ? 1 : 0) - l.show) * Math.min(1, dt * 12);
    // baskets
    for (const b of room.baskets) {
      let w = 0, n = 0;
      const bi = room.baskets.indexOf(b);
      for (const it of room.items) if (it.mode === 'basket' && it.basket === bi) { w += ITEM[it.variant].weight; n++; }
      if (w !== b.weight) room.changes++;
      b.weight = w;
      b.count = n;
    }
    // lifts: the weight in the basket raises them; whoever stands on one rides it, and so does what lies on it
    this.stepPieces(room, dt, h, platforms);
    for (const l of room.lifts) {
      const b = room.baskets[l.basket];
      // (a ratchet lift winds only with him on its plank: wound up empty it would leave him below; puzzleCheck.ts counts it so too)
      const on = !b && evalWire(l.spec.by, (id) => this.output(room, id)) && (!l.spec.hold || (p.grounded && h.standingOn === l.plat.id));
      if (on || l.level <= 0) l.unwind = false;
      const want = b ? liftLevel(b.weight, b.spec.need ?? 1) : on ? 1 : l.spec.hold && !l.unwind ? l.level : 0;
      const before = l.level;
      const step = ((b ? KIT.liftSpeed : KIT.windSpeed) / Math.max(1, l.spec.rise)) * dt;
      l.level = Math.abs(want - l.level) <= step ? want : l.level + Math.sign(want - l.level) * step;
      if (l.level !== before) {
        const ny = l.baseY - l.spec.rise * l.level;
        const dy = ny - l.plat.y;
        l.plat.y = ny;
        if (p.grounded && h.standingOn === l.plat.id) p.y += dy;
        if (Math.floor(this.t * 3) !== Math.floor((this.t - dt) * 3)) h.sfx('lift');
        if (l.level >= 0.999 && before < 0.999) room.changes++;
      }
      // a hanging cage rides the rope's end; all the way up, its floor drops open (once: the little one stays free)
      const c = l.cage;
      if (c && !c.collected) {
        c.y = l.plat.y - CAGE_FLOOR;
        if (l.level >= 0.999) {
          h.freeCage?.(c);
          if (!c.collected) c.collected = true;
        }
      }
    }
    // gates: open while their wire is; a latching one stays open. One closes only once nobody and nothing stands in its way.
    for (const g of room.gates) {
      const want = g.latched || evalWire(g.spec.open, (id) => this.output(room, id));
      if (want && !g.open) {
        g.open = true;
        g.door.broken = true;
        room.changes++;
        h.sfx('gate');
        // the first time a far gate opens, the view goes to it for a moment
        if (!g.panned && Math.abs(g.x - p.x) > 420 * ROOM_CAM.far) {
          g.panned = true;
          this.pan = { x: g.x, y: g.y - 90, t: ROOM_CAM.pan };
        }
        if (!g.opened && g.spec.id === room.spec.exit && room.spec.tips?.open && !room.told.has('open')) {
          room.told.add('open');
          h.tip(`kit:${room.spec.id}:open`, room.spec.tips.open, 3);
        }
        g.opened = true;
      }
      if (want && g.spec.latch) g.latched = true;
      if (!want && g.open) {
        const d = g.door;
        const inWay = (p.x + 22 > d.x && p.x - 22 < d.x + d.width) || room.items.some((it) => (it.mode === 'fly' || it.mode === 'rest') && it.x + it.r > d.x && it.x - it.r < d.x + d.width && it.y > d.y - 4);
        if (!inWay) {
          g.open = false;
          d.broken = false;
          room.changes++;
        }
      }
      g.show += ((g.open ? 1 : 0) - g.show) * Math.min(1, dt * 6);
    }
    for (const l of room.lifts) {
      if (l.spec.id === room.spec.exit && l.level >= 0.999 && room.spec.tips?.open && !room.told.has('open')) {
        room.told.add('open');
        h.tip(`kit:${room.spec.id}:open`, room.spec.tips.open, 3);
      }
    }
    // the stuck watch (Easy only, silent): a sparkle on the important piece once he is clearly stuck here
    if (room.changes !== before) {
      room.calm = 0;
      room.turns = 0;
      room.fails = 0;
      room.sparkle = false;
    } else if (inside) {
      if (landedQuiet) room.fails++;
      room.calm += dt;
      const dir = p.vx > 60 ? 1 : p.vx < -60 ? -1 : 0;
      if (dir && room.lastDir && dir !== room.lastDir) room.turns++;
      if (dir) room.lastDir = dir;
      const stuck = room.calm >= STUCK.calm || (room.turns >= STUCK.turns && room.calm >= STUCK.turnsCalm) || room.fails >= STUCK.fails;
      if (stuck && !room.sparkle) {
        room.sparkle = h.easy;
        h.stuck?.(room.spec.id);
        // (Normal: nothing automatic; the hook above is where Flicker's on-request hints come in)
        if (!h.easy) { room.calm = 0; room.turns = 0; room.fails = 0; }
      }
    }
  }

  /**
   * Phase 2a's pieces, each frame: the seesaws tip toward the heavier end (Pokey, what lies on an end, a pushed log, a beetle asleep on
   * it) and carry what stands on them; a glowing thing's light finds the hidden ledges (solid only while lit) and the marks; a shutter
   * shuts its gust lane while its wire is off; a pinwheel spins in a gust; a sluice runs its river's clock with, against, or not at all.
   */
  private stepPieces(room: RoomRun, dt: number, h: KitHost, platforms: readonly Platform[]) {
    const p = h.player;
    const out = (id: string) => this.output(room, id);
    for (const s of room.seesaws) {
      const w = [0, 0];
      s.ends.forEach((e, k) => {
        if (p.grounded && h.standingOn === e.id) w[k] += KIT.pokeyWeight;
        for (const it of room.items) if (it.mode === 'rest' && it.plat === e.id) w[k] += ITEM[it.variant].weight;
        for (const b of room.beetles) if (b.st.plat === e.id) w[k] += KIT.beetleWeight;
        for (const lg of platforms) {
          if (!lg.push || lg.broken) continue;
          const cx = lg.x + lg.width / 2;
          if (cx >= e.x && cx <= e.x + e.width && Math.abs(lg.y + lg.height - e.y) <= 8) w[k] += KIT.logWeight;
        }
      });
      const tilt = seesawTilt(w[0], w[1], s.rest);
      if (tilt !== s.tilt) {
        s.tilt = tilt;
        room.changes++;
        h.sfx('tilt');
      }
      const dys = seesawDy(s.tilt, s.rise);
      s.ends.forEach((e, k) => {
        const want = s.y + dys[k];
        const step = KIT.seesawSpeed * dt;
        const ny = Math.abs(want - e.y) <= step ? want : e.y + Math.sign(want - e.y) * step;
        const dy = ny - e.y;
        if (!dy) return;
        // whatever stands on the end rides it: Pokey, a pushed log
        for (const lg of platforms) {
          if (!lg.push || lg.broken) continue;
          const cx = lg.x + lg.width / 2;
          if (cx >= e.x && cx <= e.x + e.width && Math.abs(lg.y + lg.height - e.y) <= 8) lg.y += dy;
        }
        e.y = ny;
        if (p.grounded && h.standingOn === e.id) p.y += dy;
      });
      s.show += (s.tilt - s.show) * Math.min(1, dt * 10);
    }
    const lights = this.lights();
    for (const l of room.ledges) {
      const lit = ledgeLit(l.plat.x, l.plat.x + l.plat.width, l.plat.y, lights);
      if (lit !== l.lit) {
        // (it never goes out from under his feet: it fades only once he is off it)
        if (!lit && p.grounded && h.standingOn === l.plat.id) continue;
        l.lit = lit;
        l.plat.broken = !lit;
        room.changes++;
        if (lit && !room.told.has('lit')) {
          room.told.add('lit');
          h.float('A LEDGE!', l.plat.x + l.plat.width / 2, l.plat.y - 40, '#a7f3d0');
        }
      }
      l.show += ((l.lit ? 1 : 0) - l.show) * Math.min(1, dt * 5);
    }
    for (const m of room.marks) m.show += ((isLit(m.x, m.y - 40, lights) ? 1 : 0) - m.show) * Math.min(1, dt * 4);
    for (const s of room.shutters) {
      const open = evalWire(s.spec.open, out);
      if (open !== s.open) {
        s.open = open;
        room.changes++;
        h.sfx('gate');
      }
      if (s.zone) s.zone.shut = !open;
    }
    for (const w of room.pinwheels) {
      const spin = zoneEffect(this.zones, 'wind', w.x, w.y - 70, h.t).strength >= KIT.spinAt;
      if (spin !== w.spin) {
        w.spin = spin;
        room.changes++;
      }
      w.ang += dt * (w.spin ? 14 : 0);
    }
    for (const sl of room.sluices) {
      const open = evalWire(sl.spec.open, out);
      if (open !== sl.open) {
        sl.open = open;
        room.changes++;
        h.sfx('gate');
      }
      const r = sl.river;
      if (!r) continue;
      sl.rate = stepFlow(sl.rate, flowRate(sluiceFlow(sl.spec, open)), dt);
      r.flowT = (r.flowT ?? h.t) + dt * sl.rate;
      r.flowRate = sl.rate;
    }
    for (const t of room.traders) t.t += dt;
  }

  /** the stage's gust lanes, for the pinwheels (a shut one is calm: zones.ts zoneState) */
  private get zones(): Zone[] {
    return this.extraZones;
  }

  private extraZones: Zone[] = [];

  /** is the room's sparkle on (Easy's stuck help) */
  sparkling(room: number): boolean {
    return !!this.rooms[room]?.sparkle;
  }

  // ───────────────────────────── the active part ─────────────────────────────

  /** where a piece is (its middle, world), by id */
  private where(room: RoomRun, id: string): { x: number; y: number; r: number } | null {
    const pl = room.plates.find((q) => q.spec.id === id);
    if (pl) return { x: pl.x, y: pl.y - 10, r: 46 };
    const lv = room.levers.find((q) => q.spec.id === id);
    if (lv) return { x: lv.x, y: lv.y - 30, r: 34 };
    const b = room.baskets.find((q) => q.spec.id === id);
    if (b) return { x: b.x, y: this.mouthY(room, b) + 20, r: 40 };
    const g = room.gates.find((q) => q.spec.id === id);
    if (g) return { x: g.x, y: g.y - 60, r: 56 };
    const lf = room.lifts.find((q) => q.spec.id === id);
    if (lf) return { x: lf.plat.x + lf.plat.width / 2, y: lf.plat.y - 10, r: 50 };
    const it = room.items.find((q) => q.spec.id === id);
    if (it) return { x: it.x, y: it.y - it.r, r: 28 };
    const ss = room.seesaws.find((q) => q.spec.id === id);
    if (ss) return { x: ss.x, y: ss.y - 30, r: 60 };
    const bl = room.bells.find((q) => q.spec.id === id);
    if (bl) return { x: bl.x, y: bl.y - 60, r: 40 };
    const ld = room.ledges.find((q) => q.spec.id === id);
    if (ld) return { x: ld.plat.x + ld.plat.width / 2, y: ld.plat.y - 10, r: 50 };
    const sh = room.shutters.find((q) => q.spec.id === id) ?? room.pinwheels.find((q) => q.spec.id === id) ?? room.sluices.find((q) => q.spec.id === id);
    if (sh) return { x: sh.x, y: sh.y - 60, r: 50 };
    const td = room.traders.find((q) => q.spec.id === id);
    if (td) return { x: td.x, y: td.y - 70, r: 50 };
    return null;
  }

  /**
   * The part of the puzzle that matters now: what he holds goes to its target; else, of the parts the way on still waits for, a thing
   * meant for one that is not there yet, or the part itself; and when nothing is left, the way on.
   */
  focus(room: RoomRun): Focus {
    const exit = room.spec.pieces.find((q) => q.id === room.spec.exit);
    if (this.held && this.held.room === room.ri) {
      const it = room.items[this.held.item];
      const t = it.spec.for ? this.where(room, it.spec.for) : null;
      if (t) return { ...t, id: it.spec.for };
    }
    const out = (id: string) => this.output(room, id);
    let leaves: string[] = [];
    if (exit?.kind === 'gate') leaves = falseLeaves(exit.open, out);
    else if (exit?.kind === 'lift' && !out(exit.id)) leaves = out(exit.by) ? [] : [exit.by];
    // (a part with a thing meant for it comes first: fetching that thing is the step to take; then the parts with none)
    leaves.sort((m, n) => Number(!room.items.some((it) => it.spec.for === m)) - Number(!room.items.some((it) => it.spec.for === n)));
    for (const leaf of leaves) {
      for (const it of room.items) {
        if (it.spec.for !== leaf || it.mode === 'gone' || it.mode === 'held') continue;
        const pl = room.plates.find((q) => q.spec.id === leaf);
        const there = (pl && it.mode === 'rest' && it.plat === pl.plat && onPlate(it.x, pl.x, pl.w)) || (it.mode === 'basket' && room.baskets[it.basket]?.spec.id === leaf);
        if (there) continue;
        if (it.mode === 'wait') {
          return { x: it.home.x, y: it.home.y - 20, r: 30, id: it.spec.id };
        }
        return { x: it.x, y: it.y - it.r, r: 28, id: it.spec.id };
      }
      const w = this.where(room, leaf);
      if (w) return { ...w, id: leaf };
    }
    const e = this.where(room, room.spec.exit);
    return e ? { ...e, id: room.spec.exit } : { x: (room.box.x0 + room.box.x1) / 2, y: room.box.y1 - 80, r: 40 };
  }

  /** a piece's box (world), by id: what must show of it (a cage and its floor, a seesaw's whole plank and its raised end, a gate) */
  private pieceBox(room: RoomRun, id: string): CamBox | null {
    const lf = room.lifts.find((q) => q.spec.id === id);
    if (lf) {
      const pl = lf.plat;
      const top = lf.cage ? kitSize('cageShut').h + 12 : 46;
      return { x0: pl.x - 8, x1: pl.x + pl.width + 8, y0: pl.y - top, y1: pl.y + 28 };
    }
    const ss = room.seesaws.find((q) => q.spec.id === id);
    if (ss) return { x0: ss.x - ss.w / 2 - 12, x1: ss.x + ss.w / 2 + 12, y0: ss.y - ss.rise - 24, y1: ss.y + 16 };
    const g = room.gates.find((q) => q.spec.id === id);
    if (g) return { x0: g.x - KIT.gateW / 2 - 20, x1: g.x + KIT.gateW / 2 + 20, y0: g.y - KIT.doorH - 16, y1: g.y + 8 };
    const b = room.baskets.find((q) => q.spec.id === id);
    if (b) return { x0: b.x - 44, x1: b.x + 44, y0: this.mouthY(room, b) - 34, y1: b.y + 8 };
    const bl = room.bells.find((q) => q.spec.id === id);
    if (bl) return { x0: bl.x - 34, x1: bl.x + 34, y0: bl.y - 122, y1: bl.y + 6 };
    const it = room.items.find((q) => q.spec.id === id);
    if (it) {
      const at = it.mode === 'wait' ? { x: it.home.x, y: it.home.y - 20 } : { x: it.x, y: it.y - it.r };
      return { x0: at.x - 40, x1: at.x + 40, y0: at.y - 40, y1: at.y + it.r + 12 };
    }
    const bt = room.beetles.find((q) => q.spec.id === id);
    if (bt) {
      const gy = room.box.y1 - room.spec.below;
      return { x0: bt.st.x - 40, x1: bt.st.x + 40, y0: gy - 50, y1: gy + 6 };
    }
    const w = this.where(room, id);
    return w ? { x0: w.x - w.r, x1: w.x + w.r, y0: w.y - w.r, y1: w.y + w.r } : null;
  }

  /**
   * What a part works, nearest first (the room's wiring): a thing goes to what it is for (and a thing for a plate a beetle wanders by
   * brings the beetle: the lure and the creature); a basket raises its lift; a plate, lever, bell or pinwheel works the gates, shutters,
   * sluices and lifts wired to it; a trader drops what it holds.
   */
  private worksOn(room: RoomRun, id: string): string[] {
    const out: string[] = [];
    const reads = (w: Wire) => wireIds(w).includes(id);
    for (const pc of room.spec.pieces) {
      if (pc.id === id) {
        if (pc.kind === 'item' && pc.for) {
          out.push(pc.for);
          const pl = room.plates.find((q) => q.spec.id === pc.for);
          if (pl) for (const bt of room.beetles) if (pl.x >= bt.span.x0 && pl.x <= bt.span.x1) out.push(bt.spec.id);
        }
        continue;
      }
      if (pc.kind === 'lift' && pc.by === id) out.push(pc.id);
      if ((pc.kind === 'gate' || pc.kind === 'shutter' || pc.kind === 'sluice') && reads(pc.open)) out.push(pc.id);
      if (pc.kind === 'item' && pc.with === id) out.push(pc.id);
    }
    return out;
  }

  /**
   * The room's key box (puzzleCamera.ts): the active part and, nearest first, what it works and what that works in turn (the stone, its
   * basket, the basket's cage), as much of it as fits in a view vw x vh (world px: the view pulled back as far as a room may). Once the
   * way on is in it, the spot past the way on too (past a seesaw, the bank its raised end reaches), if that fits. Pokey is not in it: the
   * camera adds him.
   */
  keyBox(room: RoomRun, f: Focus, vw: number, vh: number): CamBox {
    let box: CamBox = (f.id ? this.pieceBox(room, f.id) : null) ?? { x0: f.x - f.r, x1: f.x + f.r, y0: f.y - f.r, y1: f.y + f.r };
    if (!f.id) return box;
    const seen = new Set<string>([f.id]);
    const queue = [...this.worksOn(room, f.id)];
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const b = this.pieceBox(room, id);
      if (!b) continue;
      const u = unionBox(box, b);
      if (!boxFits(u, vw, vh)) break;
      box = u;
      queue.push(...this.worksOn(room, id));
    }
    const by = room.beyond;
    if (seen.has(room.spec.exit) && by) {
      const u = unionBox(box, { x0: by.x - 30, x1: by.x + 30, y0: by.y - 60, y1: by.y + 6 });
      if (boxFits(u, vw, vh)) box = u;
    }
    return box;
  }

  /**
   * What the camera should do (puzzleCamera.ts): inside a room, lean toward the active part, and pull back to fit him, it and what it
   * works (keyBox), but never below `floor` of the usual zoom (roomFloor), nor below ROOM_CAM.minZoom for the lean alone; for a moment
   * after a far gate opens, go to it. `vw`, `vh`: the view at the usual zoom. Null outside every room: the camera is as it always is.
   */
  camFocus(p: Player, vw: number, vh: number, floor: number = ROOM_CAM.minZoom): { x: number; y: number; zoom: number; pan: boolean; box?: CamBox } | null {
    if (this.pan) return { x: this.pan.x, y: this.pan.y, zoom: 1, pan: true };
    if (this.inRoom < 0) return null;
    const f = this.focusPt;
    const keys = this.keyBox(this.rooms[this.inRoom], f, vw / floor, vh / floor);
    const box = unionBox(keys, heroBox(p.x, p.y));
    const zoom = Math.min(roomZoom(vw, vh, p.x, p.y - 45, f.x, f.y), fitZoom(vw, vh, box, floor));
    return { x: f.x, y: f.y, zoom, pan: false, box };
  }

  // ───────────────────────────── drawing ─────────────────────────────

  /** the pieces behind Pokey: sources, plates, levers, posts, gates, the pulley and its ropes, baskets, lifts, beetles, things lying */
  drawBack(ctx: CanvasRenderingContext2D, view: { x0: number; x1: number }) {
    for (const room of this.rooms) {
      if (room.box.x1 < view.x0 - 200 || room.box.x0 > view.x1 + 200) continue;
      for (const r of room.resets) this.drawPost(ctx, r);
      for (const s of room.sources) this.drawSource(ctx, room, s);
      for (const pl of room.plates) {
        // the knot plate sits sunk in the ground, its knot just over the grass (pressed, it sinks a little further and glows)
        const pw = pl.w + 10, ph = pw * 0.6;
        ctx.save();
        ctx.beginPath();
        ctx.rect(pl.x - pw, pl.y - ph, pw * 2, ph + 8);
        ctx.clip();
        const drew = drawKitArt(ctx, pl.show > 0.5 ? 'platePressed' : 'plate', pl.x, pl.y + ph * 0.55 + pl.show * 4, { w: pw, h: ph });
        ctx.restore();
        if (!drew) {
          ctx.fillStyle = pl.down ? '#d9b24a' : '#8b6a3e';
          ctx.fillRect(pl.x - pl.w / 2, pl.y - 8 + pl.show * 4, pl.w, 10);
        }
      }
      for (const l of room.levers) {
        if (!drawKitArt(ctx, l.show > 0.5 ? 'leverOn' : 'leverOff', l.x, l.y + 4)) {
          ctx.strokeStyle = '#6b4a2b';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x + (l.on ? 20 : -20), l.y - 46);
          ctx.stroke();
        }
      }
      for (const g of room.gates) this.drawGate(ctx, g);
      for (const m of room.marks) if (m.show > 0.02) drawKitArt(ctx, m.spec.look ?? 'fernStone', m.x, m.y + 3, { alpha: m.show });
      for (const l of room.ledges) this.drawLedge(ctx, l);
      for (const s of room.shutters) this.drawShutter(ctx, s);
      for (const w of room.pinwheels) this.drawPinwheel(ctx, w);
      for (const sl of room.sluices) {
        this.drawSluice(ctx, sl);
        if (!sl.rafts.length || !sl.river) continue;
        // (only over the water: moored under a bank, the bank hides it)
        ctx.save();
        ctx.beginPath();
        ctx.rect(sl.river.x0, sl.river.surfaceY - 400, sl.river.x1 - sl.river.x0, 600);
        ctx.clip();
        // (the painting's deck, about a quarter down it, level with the raft's top: where he stands)
        for (const r of sl.rafts) {
          const h = r.width * 0.44;
          drawKitArt(ctx, 'raft', r.x + r.width / 2, r.y + h * 0.72 + Math.sin(this.t * 2.1 + r.id) * 1.5, { w: r.width * 1.1, h });
        }
        ctx.restore();
      }
      for (const b of room.bells) this.drawBell(ctx, b);
      for (const s of room.seesaws) this.drawSeesaw(ctx, s);
      room.traders.forEach((t, ti) => this.drawTrader(ctx, room, t, ti));
      for (const lf of room.lifts) this.drawLift(ctx, room, lf);
      room.baskets.forEach((b) => this.drawBasket(ctx, room, b));
      for (const b of room.beetles) this.drawBeetle(ctx, b);
      for (const it of room.items) {
        if (it.mode !== 'rest') continue;
        // (on a plate it sits on the knot)
        const pl = room.plates.find((q) => q.plat === it.plat && onPlate(it.x, q.x, q.w));
        this.drawItem(ctx, it, it.x, it.y - (pl ? 14 - pl.show * 4 : 0), 0);
      }
    }
  }

  /** over Pokey: what he holds (when his pose has no hands for it), things in flight, Easy's sparkle */
  drawFront(ctx: CanvasRenderingContext2D, p: Player, drewPose: boolean) {
    for (const room of this.rooms) {
      for (const it of room.items) if (it.mode === 'fly') this.drawItem(ctx, it, it.body.x, it.body.y, it.spin);
      if (room.sparkle && room === this.rooms[this.inRoom]) this.drawSparkle(ctx, this.focusPt);
    }
    if (this.held && !drewPose) {
      const it = this.rooms[this.held.room].items[this.held.item];
      // (his own sprite, before the kit's sheet has loaded: the thing held up over his head)
      this.drawItem(ctx, it, p.x + p.facing * 6, p.y - 86, 0);
    }
  }

  /** Pokey carrying, throwing or setting down, in Matt's poses; false: draw his own sprite (and drawFront shows what he holds) */
  drawPokey(ctx: CanvasRenderingContext2D, p: Player): boolean {
    if (!kitArtReady()) return false;
    const pose = this.pose;
    if (!this.held && !pose) return false;
    if (p.climbing || p.isVineSwinging || p.hanging) return false;
    const f: 1 | -1 = p.facing >= 0 ? 1 : -1;
    const it = this.held ? this.rooms[this.held.room].items[this.held.item] : null;
    let n: KitArtName;
    if (pose?.kind === 'throw') {
      const u = pose.t / pose.dur;
      n = u < 0.3 ? 'p9' : u < 0.6 ? 'p10' : u < 0.85 ? 'p11' : 'p12';
    } else if (pose?.kind === 'set') n = 'p13';
    else if (pose?.kind === 'pick') n = pose.t < pose.dur * 0.5 && it?.variant === 'acorn' ? 'p1' : 'p2';
    else if (!p.grounded) n = 'p4';
    else if (Math.abs(p.vx) > 25) n = (['p5', 'p6', 'p7', 'p8'] as const)[Math.floor(p.walkCycle * 0.5) % 4];
    else n = 'p3';
    // his poses are painted holding an acorn: anything else is drawn in his hands in the same pose with the acorn painted out
    const other = !!it && it.variant !== 'acorn';
    if (other && n === 'p1') n = 'p2';
    const pose2 = other ? EMPTY_OF[n] ?? n : n;
    drawKitArt(ctx, pose2, p.x, p.y + 2, { flip: f < 0 });
    if (it && other) {
      const hand = handOf(pose2, p.x, p.y + 2, f);
      if (hand) this.drawItem(ctx, it, hand.x, hand.y + kitSize(ART_OF[it.variant]).h * 0.5, 0);
    }
    return true;
  }

  private drawItem(ctx: CanvasRenderingContext2D, it: ItemRun, x: number, y: number, rot: number, scale = 1) {
    if (drawKitArt(ctx, ART_OF[it.variant], x, y + 2, { rot, scale })) return;
    ctx.save();
    ctx.fillStyle = it.variant === 'cake' ? '#f9a8d4' : it.variant === 'stone' ? '#94a3b8' : '#92400e';
    ctx.beginPath();
    ctx.arc(x, y - it.r, it.r * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawSource(ctx: CanvasRenderingContext2D, room: RoomRun, s: SourceRun) {
    // (a fresh one drops out of the canopy above onto the pile at the tree's foot: the forest painted behind is its tree)
    void room;
    const pile = PILE_OF[s.spec.variant];
    if (s.spec.look === 'tree' && s.spec.variant === 'acorn' && kitArtReady()) {
      // World 1's painted trunk and leafy branch, its leaves over the spot a fresh acorn falls to, two acorns hanging in them
      const sz = kitSize('acornTree');
      const tx = s.x - sz.w * 0.62;
      drawKitArt(ctx, 'acornTree', tx, s.y + 6);
      const ly = s.y - KIT.dropFrom + 18;
      drawKitArt(ctx, 'acorn', s.x - 26, ly + Math.sin(this.t * 1.7) * 2, { scale: 0.75 });
      drawKitArt(ctx, 'acorn', s.x + 18, ly + 22 + Math.sin(this.t * 1.3 + 1) * 2, { scale: 0.7 });
    }
    if (pile) drawKitArt(ctx, pile, s.x - 44, s.y + 3, { scale: 0.7 });
    else if (s.spec.variant === 'mushroom') {
      // the dim mushrooms the glowing one grew among
      drawKitArt(ctx, 'mushroomDim', s.x - 46, s.y + 3, { scale: 0.8 });
      drawKitArt(ctx, 'mushroomDim', s.x - 70, s.y + 3, { scale: 0.6, flip: true });
    } else if (s.spec.variant === 'mango') {
      drawKitArt(ctx, 'mango', s.x - 40, s.y + 2, { scale: 0.9 });
      drawKitArt(ctx, 'mango', s.x - 62, s.y + 2, { scale: 0.8, flip: true });
    } else if (s.spec.variant === 'cake') {
      drawKitArt(ctx, 'cake', s.x - 40, s.y + 2, { scale: 0.75 });
      drawKitArt(ctx, 'cake', s.x - 62, s.y + 2, { scale: 0.65, flip: true });
    }
  }

  private drawPost(ctx: CanvasRenderingContext2D, r: ResetRun) {
    const drew = drawKitArt(ctx, 'sign', r.x, r.y + 3);
    const sz = kitSize('sign');
    const cy = r.y - (drew ? sz.h * 0.72 : 50);
    ctx.save();
    // the "start again" mark on the board: a circling arrow
    ctx.strokeStyle = '#3b2a14';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(r.x, cy, 9, Math.PI * 0.2, Math.PI * 1.75);
    ctx.stroke();
    ctx.fillStyle = '#3b2a14';
    ctx.beginPath();
    const ax = r.x + Math.cos(Math.PI * 1.75) * 9, ay = cy + Math.sin(Math.PI * 1.75) * 9;
    ctx.moveTo(ax + 6, ay + 1);
    ctx.lineTo(ax - 3, ay - 5);
    ctx.lineTo(ax - 1, ay + 6);
    ctx.fill();
    if (!drew) {
      ctx.fillStyle = '#7c5a32';
      ctx.fillRect(r.x - 3, r.y - 40, 6, 40);
    }
    ctx.restore();
  }

  private drawGate(ctx: CanvasRenderingContext2D, g: GateRun) {
    const w = g.wall;
    const doorTop = g.door.y;
    // the root wall over the door (it never opens), then the vine gate in it, shut or open (World 2's court: a wall of bundled reeds)
    if (g.spec.look === 'reeds') drawReedWall(ctx, w.x - 6, w.y, doorTop + 14, w.width + 12);
    else if (!drawWallArt(ctx, w.x - 6, w.y, doorTop + 14, w.width + 12)) {
      ctx.fillStyle = '#4a3420';
      ctx.fillRect(w.x, w.y, w.width, doorTop - w.y + 10);
    }
    const gw = KIT.gateW + 50;
    if (!drawKitArt(ctx, g.show > 0.5 ? 'gateOpen' : 'gateShut', g.x, g.y + 4, { w: gw, h: KIT.doorH + 10 })) {
      ctx.fillStyle = g.open ? 'rgba(92, 64, 32, 0.35)' : '#6b4a2b';
      ctx.fillRect(g.door.x, doorTop, g.door.width, KIT.doorH);
    }
  }

  private drawLift(ctx: CanvasRenderingContext2D, room: RoomRun, l: LiftRun) {
    const pl = l.plat;
    const b = room.baskets[l.basket];
    if (l.cage && b) return this.drawCageLift(ctx, room, l, b);
    if (!b) {
      // a rope lift a pinwheel winds (World 4): the rope from the top of its climb to the plank, the plank on it
      const cx = pl.x + pl.width / 2;
      const top = l.baseY - l.spec.rise - 120;
      ctx.save();
      ctx.strokeStyle = '#a07a4a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pl.x + 10, pl.y);
      ctx.lineTo(cx, top);
      ctx.lineTo(pl.x + pl.width - 10, pl.y);
      ctx.stroke();
      ctx.restore();
      drawKitArt(ctx, 'winch', cx, top + 30, { scale: 0.6 });
      if (!drawKitArt(ctx, 'liftPlank', cx, pl.y + 16, { w: pl.width + 12, h: 30 })) {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(pl.x, pl.y, pl.width, 16);
      }
      return;
    }
    // the pulley over the two of them, and the ropes from it to the plank's ends and to the basket
    if (b) {
      const px = (b.x + pl.x + pl.width / 2) / 2;
      const py = Math.min(b.y - b.spec.mouth - kitSize('basket').h * 0.45, l.baseY - l.spec.rise) - 50;
      ctx.save();
      ctx.strokeStyle = '#a07a4a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + 14, py + 10);
      ctx.lineTo(pl.x + 8, pl.y - 2);
      ctx.moveTo(px + 18, py + 10);
      ctx.lineTo(pl.x + pl.width - 8, pl.y - 2);
      const top = this.mouthY(room, b) - kitSize('basket').h * 0.45;
      ctx.moveTo(px - 16, py + 10);
      ctx.lineTo(b.x, top + 6);
      ctx.stroke();
      ctx.restore();
      if (!drawKitArt(ctx, 'pulley', px, py + 52, { scale: 0.7 })) {
        ctx.fillStyle = '#6b4a2b';
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (!drawKitArt(ctx, 'liftPlank', pl.x + pl.width / 2, pl.y + 16, { w: pl.width + 12, h: 30 })) {
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(pl.x, pl.y, pl.width, 16);
    }
  }

  /**
   * A reed cage on a rope over a pulley (World 2, Matt's sheet): the post on the bank, the pulley wheel at its top, one rope down to the
   * cage over the water and one to the counter-basket on the bank. The little one shivers in the cage; lifted all the way up, the cage's
   * floor hangs open under it (the engine draws the little one hopping home, riverArt.ts drawW2Cage).
   */
  private drawCageLift(ctx: CanvasRenderingContext2D, room: RoomRun, l: LiftRun, b: BasketRun) {
    const c = l.cage!;
    const cx = l.plat.x + l.plat.width / 2;
    const floor = l.plat.y;
    const cageH = kitSize('cageShut').h;
    const wheelX = (b.x + cx) / 2;
    const wheelY = Math.min(b.y - b.spec.mouth - kitSize('basket2').h, l.baseY - l.spec.rise - cageH) - 40;
    // the post, from the bank up to the pulley's arm
    ctx.save();
    ctx.fillStyle = '#6b4a2b';
    ctx.strokeStyle = '#2f1d0e';
    ctx.lineWidth = 3;
    const postX = wheelX - 34;
    ctx.fillRect(postX - 9, wheelY - 18, 18, b.y - wheelY + 22);
    ctx.strokeRect(postX - 9, wheelY - 18, 18, b.y - wheelY + 22);
    ctx.strokeStyle = '#a07a4a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wheelX + 12, wheelY + 6);
    ctx.lineTo(cx, floor - cageH + 8);
    ctx.moveTo(wheelX - 12, wheelY + 6);
    ctx.lineTo(b.x, this.mouthY(room, b) - kitSize('basket2').h * 0.5);
    ctx.stroke();
    ctx.restore();
    if (!drawKitArt(ctx, 'pulley', wheelX, wheelY + 60, { scale: 0.62 })) {
      ctx.fillStyle = '#6b4a2b';
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!c.collected) {
      // (the little one first, the bars over it)
      drawW2Cage(ctx, c, this.t, true);
      if (!drawKitArt(ctx, 'cageShut', cx, floor + 8)) {
        ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 30, floor - 90, 60, 90);
      }
    } else drawKitArt(ctx, 'cageLifted', cx, floor + 30);
  }

  private drawBasket(ctx: CanvasRenderingContext2D, room: RoomRun, b: BasketRun) {
    const my = this.mouthY(room, b);
    // (World 2's counter-basket, by a hanging cage: the rope basket of river stones)
    if (room.lifts.some((l) => l.cage && room.baskets[l.basket] === b) && drawKitArt(ctx, b.count > 0 ? 'basket2Full' : 'basket2', b.x, my + kitSize('basket2').h * 0.62)) return;
    const sz = kitSize('basket');
    const bottom = my + sz.h * 0.55;
    if (!drawKitArt(ctx, b.count > 0 ? 'basketFull' : 'basket', b.x, bottom)) {
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 4;
      ctx.strokeRect(b.x - KIT.mouthHalf, my, KIT.mouthHalf * 2, 44);
    }
  }

  private drawSeesaw(ctx: CanvasRenderingContext2D, s: SeesawRun) {
    const [l, r] = s.ends;
    const n: 'seesawLevel' | 'seesawUpR' | 'seesawUpL' = s.show < -0.5 ? 'seesawUpR' : s.show > 0.5 ? 'seesawUpL' : 'seesawLevel';
    // (the painted plank and its round pivot, stretched to the plank's length; its feet on the ground under the pivot)
    const sz = kitSize(n);
    const k = (s.w + 24) / sz.w;
    // (over a pit, a post holds the pivot up from the ground under it)
    if (s.foot > s.y + 12) {
      ctx.save();
      ctx.fillStyle = '#5b3a1e';
      ctx.strokeStyle = '#2f1d0e';
      ctx.lineWidth = 3;
      ctx.fillRect(s.x - 13, s.y - 4, 26, s.foot - s.y + 8);
      ctx.strokeRect(s.x - 13, s.y - 4, 26, s.foot - s.y + 8);
      ctx.restore();
    }
    // (drawn by its round pivot, not by its feet: tilted, the painting's low end touches the ground too, so its measured feet sat ~55 px
    // off the pivot, left of the post for the right end up and right of it for the left end up)
    const f = KIT_ART[n];
    if (!drawKitArt(ctx, n, s.x + (f.ax - SEESAW_PIVOT[n]) * f.k * k, s.y + 10, { scale: k })) {
      ctx.save();
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y + 6);
      ctx.lineTo(r.x + r.width, r.y + 6);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawBell(ctx: CanvasRenderingContext2D, b: BellRun) {
    const u = this.t - b.rung;
    const swing = u < 1.6 ? Math.sin(u * 16) * 0.12 * (1 - u / 1.6) : 0;
    if (!drawKitArt(ctx, 'bell', b.x, b.y + 3, { rot: swing })) {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(b.x, b.y - 60, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    if (u < NOISE.dur) {
      // the ring going out: soft arcs either side
      ctx.save();
      ctx.strokeStyle = `rgba(253, 230, 138, ${0.7 * (1 - u / NOISE.dur)})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const rr = 30 + ((u * 90 + i * 40) % 120);
        ctx.beginPath();
        ctx.arc(b.x, b.y - 60, rr, -0.6, 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x, b.y - 60, rr, Math.PI - 0.6, Math.PI + 0.6);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawLedge(ctx: CanvasRenderingContext2D, l: LedgeRun) {
    if (l.show < 0.02) return;
    const pl = l.plat;
    if (!drawKitArt(ctx, 'stonePlate', pl.x + pl.width / 2, pl.y + 26, { w: pl.width + 16, h: 44, alpha: l.show })) {
      ctx.save();
      ctx.globalAlpha *= l.show;
      ctx.fillStyle = '#6b7f6a';
      ctx.fillRect(pl.x, pl.y, pl.width, pl.height);
      ctx.restore();
    }
  }

  private drawShutter(ctx: CanvasRenderingContext2D, s: ShutterRun) {
    if (!drawKitArt(ctx, s.open ? 'shutterOpen' : 'shutterShut', s.x, s.y + 3)) {
      ctx.fillStyle = s.open ? 'rgba(161, 98, 7, 0.4)' : '#a16207';
      ctx.fillRect(s.x - 50, s.y - 110, 100, 110);
    }
  }

  private drawPinwheel(ctx: CanvasRenderingContext2D, w: PinwheelRun) {
    if (drawKitArt(ctx, w.spin ? 'pinwheelSpin' : 'pinwheel', w.x, w.y + 3)) return;
    ctx.save();
    ctx.translate(w.x, w.y - 110);
    ctx.rotate(w.ang);
    ctx.fillStyle = '#a16207';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(0, -6, 34, 12);
    }
    ctx.restore();
  }

  private drawSluice(ctx: CanvasRenderingContext2D, sl: SluiceRun) {
    if (!drawKitArt(ctx, sl.open ? 'sluiceOpen' : 'sluiceShut', sl.x, sl.y + 10)) {
      ctx.fillStyle = sl.open ? 'rgba(120, 80, 40, 0.4)' : '#7c5a32';
      ctx.fillRect(sl.x - 40, sl.y - 100, 80, 100);
    }
  }

  private drawTrader(ctx: CanvasRenderingContext2D, room: RoomRun, t: TraderRun, ti: number) {
    const stump = drawKitArt(ctx, 'tradeStump', t.x, t.y + 4);
    const top = t.y - (stump ? kitSize('tradeStump').h * 0.62 : 30);
    if (!stump) {
      ctx.fillStyle = '#6b4a2b';
      ctx.fillRect(t.x - 40, t.y - 30, 80, 30);
    }
    // the capuchin on its stump (World 4's own painting): holding its thing up until he brings the fruit, then eating it
    const pose = t.done ? 'capEat' : 'capSitBranch';
    if (!drawW4(ctx, pose, t.x, top + 6, 70, { flip: true })) {
      ctx.fillStyle = '#3b2416';
      ctx.beginPath();
      ctx.arc(t.x, top - 30, 24, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const it of room.items) if (it.trader === ti && it.mode === 'trader') this.drawItem(ctx, it, t.x + 18, top - 40 + Math.sin(this.t * 3) * 3, 0, 0.8);
    if (t.done && t.t < 1.6) {
      const want = room.items.find((it) => it.variant === t.spec.wants);
      if (want) this.drawItem(ctx, want, t.x - 8, top - 30, 0, 0.8);
    }
  }

  private drawBeetle(ctx: CanvasRenderingContext2D, b: BeetleRun) {
    const s = b.st;
    const t = this.t;
    let n: KitArtName;
    if (s.mode === 'idle') n = Math.floor(t * 1.2 + b.home) % 2 ? 'b1' : 'b2';
    else if (s.mode === 'walk') n = s.t < 0.35 ? 'b5' : (['b6', 'b7', 'b8', 'b7'] as const)[Math.floor(t * 6) % 4];
    else if (s.mode === 'eat') n = Math.floor(t * 5) % 2 ? 'b10' : 'b11';
    else if (s.mode === 'yawn') n = s.t < BEETLE.yawn * 0.5 ? 'b12' : 'b13';
    else n = Math.floor(t * 0.9) % 2 ? 'b15' : 'b16';
    const ground = this.groundY(b);
    if (!drawKitArt(ctx, n, s.x, ground + 3, { flip: s.dir < 0 })) {
      ctx.fillStyle = '#1e4d5c';
      ctx.beginPath();
      ctx.ellipse(s.x, ground - 22, BEETLE.half, 22, 0, Math.PI, 0);
      ctx.fill();
    }
  }

  private beetleY = new Map<BeetleRun, number>();
  /** the beetle's ground height (its ledge's top, as placed) */
  private groundY(b: BeetleRun): number {
    let y = this.beetleY.get(b);
    if (y === undefined) {
      const room = this.rooms.find((r) => r.beetles.includes(b))!;
      y = room.plates.find((q) => q.plat === b.st.plat)?.y ?? room.items.find((it) => it.home.plat === b.st.plat)?.home.y ?? room.box.y1 - 60;
      this.beetleY.set(b, y);
    }
    return y;
  }

  private drawSparkle(ctx: CanvasRenderingContext2D, f: { x: number; y: number; r: number }) {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const a = this.t * 1.6 + (i * Math.PI * 2) / 5;
      const u = (Math.sin(this.t * 4 + i * 1.7) + 1) / 2;
      const x = f.x + Math.cos(a) * (f.r + 6);
      const y = f.y + Math.sin(a) * (f.r * 0.7 + 4);
      const k = 4 + u * 5;
      ctx.globalAlpha = 0.45 + 0.55 * u;
      ctx.fillStyle = '#fff3b0';
      ctx.beginPath();
      ctx.moveTo(x, y - k * 1.7);
      ctx.quadraticCurveTo(x, y, x + k * 1.7, y);
      ctx.quadraticCurveTo(x, y, x, y + k * 1.7);
      ctx.quadraticCurveTo(x, y, x - k * 1.7, y);
      ctx.quadraticCurveTo(x, y, x, y - k * 1.7);
      ctx.fill();
    }
    ctx.restore();
  }
}
