/**
 * puzzlePlay — a stage's puzzle rooms during a run (the rules are puzzleKit.ts; the look is puzzleArt.ts): the things lying, held,
 * flying and coming back, the plates, gates, levers, baskets and lifts and their wires, the lure beetles, the room reset, Pokey's carry
 * poses, the camera's lean toward the puzzle part that matters now (puzzleCamera.ts), the silent sparkle on Easy when he is clearly
 * stuck, and the piece Dot points at. The engine only lends it what it needs through `KitHost`, as World 4 and 5 do (w4Play.ts,
 * w5Play.ts), and reads the intents it took (engine.ts kitControls).
 */
import {
  anchorAt, BEETLE, evalWire, falseLeaves, flyStep, ITEM, KIT, kitPlatId, liftLevel, onPlate, plateDown, roomBox, setDownX, stepBeetle,
  throwStart, THROW, useReach, type BeetleState, type Body, type FlightWorld, type ItemVariant, type KitExtras, type PieceSpec, type RoomSpec,
  type ThrowKind,
} from './puzzleKit.ts';
import { drawKitArt, handOf, kitArtReady, kitSize } from './puzzleArt.ts';
import type { KitArtName } from './puzzleAtlasData.ts';
import { drawWallArt } from './protoArt.ts';
import { ROOM_CAM, roomZoom } from './puzzleCamera.ts';
import type { Platform, PlayerState as Player } from './types.ts';

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
}
export type KitSfx = 'pick' | 'drop' | 'throw' | 'land' | 'press' | 'gate' | 'lever' | 'munch' | 'lift' | 'reset' | 'lost';

/** the intents the engine hands over this frame, and which the kit took (they are then not a punch, a jump or a kick) */
export interface KitIntents {
  tap: boolean;
  up: boolean;
  side: boolean;
  /** which way the side flick went (-1, 1), or 0 */
  sideDir: number;
}

type ItemMode = 'rest' | 'held' | 'fly' | 'basket' | 'wait' | 'gone';
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
}
interface PlateRun { spec: Extract<PieceSpec, { kind: 'plate' }>; x: number; y: number; plat: number; w: number; down: boolean; show: number }
interface GateRun { spec: Extract<PieceSpec, { kind: 'gate' }>; x: number; y: number; door: Platform; wall: Platform; open: boolean; latched: boolean; show: number; panned: boolean; opened: boolean }
interface LeverRun { spec: Extract<PieceSpec, { kind: 'lever' }>; x: number; y: number; plat: number; on: boolean; show: number }
interface BasketRun { spec: Extract<PieceSpec, { kind: 'basket' }>; x: number; y: number; weight: number; count: number }
interface LiftRun { spec: Extract<PieceSpec, { kind: 'lift' }>; plat: Platform; baseY: number; level: number; basket: number }
interface BeetleRun { spec: Extract<PieceSpec, { kind: 'beetle' }>; st: BeetleState; home: number; span: { x0: number; x1: number }; told: boolean }
interface SourceRun { spec: Extract<PieceSpec, { kind: 'source' }>; x: number; y: number; plat: number }
interface ResetRun { spec: Extract<PieceSpec, { kind: 'reset' }>; x: number; y: number; plat: number }

interface RoomRun {
  spec: RoomSpec;
  ri: number;
  box: { x0: number; x1: number; y0: number; y1: number };
  items: ItemRun[];
  plates: PlateRun[];
  gates: GateRun[];
  levers: LeverRun[];
  baskets: BasketRun[];
  lifts: LiftRun[];
  beetles: BeetleRun[];
  sources: SourceRun[];
  resets: ResetRun[];
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

/** Pokey's pose while he carries, throws or sets down (null: his own sprite) */
type Pose = { kind: 'pick' | 'throw' | 'set'; t: number; dur: number } | null;

const ART_OF: Record<ItemVariant, KitArtName> = { acorn: 'acorn', stone: 'stone', pinecone: 'pinecone', cake: 'cake' };
const PILE_OF: Partial<Record<ItemVariant, KitArtName>> = { acorn: 'acornPile', stone: 'stonePile' };
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
  private focusPt = { x: 0, y: 0, r: 30 };
  private t = 0;
  /** a room's lines still to take down, one a frame */
  private passing: string[] = [];

  constructor(kit: KitExtras, platforms: Platform[]) {
    const byId = new Map(platforms.map((p) => [p.id, p]));
    kit.rooms.forEach((spec, ri) => {
      const at = (pc: PieceSpec) => ('at' in pc && pc.at ? anchorAt(pc.at, byId) : null);
      const room: RoomRun = {
        spec, ri, box: roomBox(spec, byId), items: [], plates: [], gates: [], levers: [], baskets: [], lifts: [], beetles: [], sources: [], resets: [],
        ground: new Set(spec.ground), changes: 0, calm: 0, turns: 0, fails: 0, lastDir: 0, sparkle: false, told: new Set(),
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
          if (plat) room.lifts.push({ spec: pc, plat, baseY: plat.y, level: 0, basket: -1 });
        }
        if (pc.kind === 'beetle' && a) {
          const p = byId.get(pc.at.on)!;
          room.beetles.push({ spec: pc, home: a.x, span: { x0: p.x, x1: p.x + p.width }, told: false, st: { mode: 'idle', x: a.x, plat: pc.at.on, dir: -1, t: 0, food: -1 } });
        }
      }
      for (const l of room.lifts) l.basket = room.baskets.findIndex((b) => b.spec.id === l.spec.by);
      for (const pc of spec.pieces) {
        if (pc.kind !== 'item') continue;
        const src = pc.source ? room.sources.find((s) => s.spec.id === pc.source) : undefined;
        const a = pc.at ? anchorAt(pc.at, byId) : src ? { x: src.x, y: src.y } : null;
        if (!a) continue;
        const plat = pc.at?.on ?? src!.plat;
        const home = { plat, x: a.x, y: a.y };
        room.items.push({
          spec: pc, variant: pc.variant, r: ITEM[pc.variant].r, mode: 'rest', plat, x: a.x, y: a.y, body: { x: 0, y: 0, vx: 0, vy: 0 }, acc: 0,
          knocked: new Set(), flipped: new Set(), wait: 0, basket: -1, spin: 0, home, fromSource: !!src,
        });
      }
      this.rooms.push(room);
    });
  }

  /** his hands are full */
  get holding(): boolean {
    return !!this.held;
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
    return false;
  }

  private flightWorld(room: RoomRun, platforms: readonly Platform[]): FlightWorld {
    return {
      platforms,
      box: room.box,
      baskets: room.baskets.map((b) => ({ x: b.x, y: this.mouthY(room, b), half: KIT.mouthHalf })),
      levers: room.levers.map((l) => ({ x0: l.x - 18, x1: l.x + 18, y0: l.y - 60, y1: l.y })),
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
        this.setDown(room, it, f, h);
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

  private throwIt(room: RoomRun, it: ItemRun, kind: ThrowKind, f: 1 | -1, h: KitHost) {
    const p = h.player;
    it.body = throwStart(kind, p.x, p.y, f);
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
    room.changes++;
    room.sparkle = false;
    h.sfx('reset');
    h.float('STARTING AGAIN', room.resets[0]?.x ?? h.player.x, (room.resets[0]?.y ?? h.player.y) - 110, '#fde68a');
  }

  private home(it: ItemRun) {
    it.mode = 'rest';
    it.plat = it.home.plat;
    it.x = it.home.x;
    it.y = it.home.y;
    it.basket = -1;
  }

  /** a lost thing: it comes back to its source a moment later (one with no source is gone until the room starts again) */
  private lose(room: RoomRun, it: ItemRun, h: KitHost) {
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
    if (!it.fromSource) this.home(it);
    this.held = null;
  }

  // ───────────────────────────── each frame ─────────────────────────────

  /** step every room; returns what carrying does to his run speed (1: nothing) */
  step(dt: number, h: KitHost, platforms: readonly Platform[]): number {
    this.t += dt;
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
            } else this.lose(room, it, h);
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
    for (const l of room.lifts) {
      const b = room.baskets[l.basket];
      const want = b ? liftLevel(b.weight, b.spec.need ?? 1) : 0;
      const before = l.level;
      const step = (KIT.liftSpeed / Math.max(1, l.spec.rise)) * dt;
      l.level = Math.abs(want - l.level) <= step ? want : l.level + Math.sign(want - l.level) * step;
      if (l.level !== before) {
        const ny = l.baseY - l.spec.rise * l.level;
        const dy = ny - l.plat.y;
        l.plat.y = ny;
        if (p.grounded && h.standingOn === l.plat.id) p.y += dy;
        if (Math.floor(this.t * 3) !== Math.floor((this.t - dt) * 3)) h.sfx('lift');
        if (l.level >= 0.999 && before < 0.999) room.changes++;
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
    return null;
  }

  /**
   * The part of the puzzle that matters now: what he holds goes to its target; else, of the parts the way on still waits for, a thing
   * meant for one that is not there yet, or the part itself; and when nothing is left, the way on.
   */
  focus(room: RoomRun): { x: number; y: number; r: number } {
    const exit = room.spec.pieces.find((q) => q.id === room.spec.exit);
    if (this.held && this.held.room === room.ri) {
      const it = room.items[this.held.item];
      const t = it.spec.for ? this.where(room, it.spec.for) : null;
      if (t) return t;
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
          return { x: it.home.x, y: it.home.y - 20, r: 30 };
        }
        return { x: it.x, y: it.y - it.r, r: 28 };
      }
      const w = this.where(room, leaf);
      if (w) return w;
    }
    return this.where(room, room.spec.exit) ?? { x: (room.box.x0 + room.box.x1) / 2, y: room.box.y1 - 80, r: 40 };
  }

  /**
   * What the camera should do (puzzleCamera.ts): inside a room, lean toward the active part and pull back to fit both (never below
   * ROOM_CAM.minZoom); for a moment after a far gate opens, go to it. Null outside every room: the camera is as it always is.
   */
  camFocus(p: Player, vw: number, vh: number): { x: number; y: number; zoom: number; pan: boolean } | null {
    if (this.pan) return { x: this.pan.x, y: this.pan.y, zoom: 1, pan: true };
    if (this.inRoom < 0) return null;
    const f = this.focusPt;
    return { x: f.x, y: f.y, zoom: roomZoom(vw, vh, p.x, p.y - 45, f.x, f.y), pan: false };
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
    drawKitArt(ctx, n, p.x, p.y + 2, { flip: f < 0 });
    // his poses are painted holding an acorn: anything else is drawn in his hands, over it
    if (it && it.variant !== 'acorn') {
      const hand = handOf(n, p.x, p.y + 2, f);
      if (hand) this.drawItem(ctx, it, hand.x, hand.y + kitSize(ART_OF[it.variant], 1.1).h * 0.5, 0, 1.1);
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
    if (pile) drawKitArt(ctx, pile, s.x - 44, s.y + 3, { scale: 0.7 });
    else if (s.spec.variant === 'cake') {
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
    // the root wall over the door (it never opens), then the vine gate in it, shut or open
    if (!drawWallArt(ctx, w.x - 6, w.y, doorTop + 14, w.width + 12)) {
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

  private drawBasket(ctx: CanvasRenderingContext2D, room: RoomRun, b: BasketRun) {
    const my = this.mouthY(room, b);
    const sz = kitSize('basket');
    const bottom = my + sz.h * 0.55;
    if (!drawKitArt(ctx, b.count > 0 ? 'basketFull' : 'basket', b.x, bottom)) {
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 4;
      ctx.strokeRect(b.x - KIT.mouthHalf, my, KIT.mouthHalf * 2, 44);
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
