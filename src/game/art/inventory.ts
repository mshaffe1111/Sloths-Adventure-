/**
 * The art inventory: every art piece in the master catalog (reference/art/CATALOG-MASTER.csv), as the engine reads it.
 *
 * inventory/w1.json .. w10.json (the level art that fits each world; a piece is in every world it fits) and inventory/cast.json
 * (characters, enemies, pickups, UI, backdrops) are written by `python3 tools/art/catalog_master.py --emit`, never hand-edited. Each is
 * its own lazy chunk (a dynamic import, never in the main JS): a stage build loads only its world's, `loadInventory(world)`.
 *
 * Matt, 11-11: made things (sawn, carved, built) are never World 1 art; `byWorld(1, ...)` leaves them out unless `includeMade`.
 */

export type Layer =
  | 'platform' | 'step' | 'soft landing' | 'climb' | 'danger look' | 'decor near' | 'decor mid' | 'backdrop'
  // a support (a pole or post that holds a bough or plank up; he does not stand on it): no scale cap (the lead, 11-14, ART-678b)
  | 'support'
  | 'character' | 'enemy' | 'pickup' | 'ui';

export interface ArtRow {
  id: string;
  /** repo path: src/assets/... in the build, or 'origin/<branch>:<path>' for a cut piece not packed into the build yet */
  file: string;
  /** the atlas frame after '#' in the catalog (with its rect when the catalog gives one), or null for a whole image */
  frame: string | null;
  /** the world it fits best, or null for a row shown in menus only */
  world_best: number | null;
  /** every world it fits, best first */
  worlds: number[];
  kind: string;
  layer: Layer;
  /** the catalog's slot key (one key across the catalog parts' wordings, e.g. 'landing/platforms solid log', 'pickCut kind stone') */
  engine_slot: string;
  w: number;
  h: number;
  /** footing: the walking line's y and its x span in the image's own pixels (null when the piece is not stood on) */
  walk_y: number | null;
  walk_x0: number | null;
  walk_x1: number | null;
  float_class: string;
  made_thing: boolean;
  status: string;
  /** drawn height on screen / Pokey's drawn standing height (89.1 units, heroSprite.ts:30,32); null when it has no fixed height
   *  (drawn to fit its platform, tiled, or not level art) */
  pokey_scale: number | null;
  /** inside its layer's range (catalog_master.py SCALE_RANGE); null when its layer has no range or it is terrain or fitted */
  scale_ok: boolean | null;
}

export interface InventoryFile {
  note: string;
  /** 'w1' .. 'w10' or 'cast' */
  file: string;
  cols: string[];
  rows: unknown[][];
  /** Pokey's drawn standing height in world units, the scale's 1.0 */
  pokey_units: number;
  /** world files only: every standable, climb and danger slot in the whole catalog (what gaps() checks a world against) */
  play_slots?: string[];
}

export type InventoryName = `w${number}` | 'cast';
export const LEVEL_LAYERS: ReadonlySet<string> = new Set(['platform', 'step', 'soft landing', 'climb', 'danger look', 'decor near', 'decor mid', 'support']);

export const STANDABLE: ReadonlySet<string> = new Set(['platform', 'step', 'soft landing']);

/** A piece the engine may use: not waiting on a fix (the catalog's 'needs fix ...' status). */
export function usable(r: ArtRow): boolean {
  return !r.status.startsWith('needs fix');
}

/** A piece a player stands on: a standable layer with its footing measured. */
export function standable(r: ArtRow): boolean {
  return STANDABLE.has(r.layer) && r.walk_y !== null && r.walk_x0 !== null && r.walk_x1 !== null;
}

export interface WorldQuery {
  layer?: Layer;
  slot?: string;
  minW?: number;
  maxW?: number;
  standable?: boolean;
  /** World 1 only: also return made things (never placed in World 1; for audits) */
  includeMade?: boolean;
  /** default true: leave out pieces drawn out of scale with Pokey (scale_ok false; R-165.107). false: return them too (for audits) */
  inScale?: boolean;
}

export class Inventory {
  readonly rows: readonly ArtRow[];
  readonly file: string;
  private readonly playSlots: readonly string[];
  private readonly ids = new Map<string, ArtRow>();
  private readonly slots = new Map<string, ArtRow[]>();

  constructor(data: InventoryFile) {
    this.file = data.file;
    this.playSlots = data.play_slots ?? [];
    const c = data.cols;
    this.rows = data.rows.map((a) => {
      const o: Record<string, unknown> = {};
      for (let i = 0; i < c.length; i++) o[c[i]] = a[i];
      return o as unknown as ArtRow;
    });
    for (const r of this.rows) {
      this.ids.set(r.id, r);
      const s = this.slots.get(r.engine_slot);
      if (s) s.push(r); else this.slots.set(r.engine_slot, [r]);
    }
  }

  byId(id: string): ArtRow | undefined {
    return this.ids.get(id);
  }

  bySlot(slot: string): readonly ArtRow[] {
    return this.slots.get(slot) ?? [];
  }

  /**
   * Pieces in this file that fit world `w` (any position in its worlds list). Made things are left out of World 1 unless `includeMade`.
   * A world file holds every piece that fits its world, so ask world N's file about world N.
   */
  byWorld(w: number, q: WorldQuery = {}): ArtRow[] {
    return this.rows.filter((r) =>
      r.worlds.includes(w)
      && !(w === 1 && r.made_thing && !q.includeMade)
      && !(q.inScale !== false && r.scale_ok === false)
      && (q.layer === undefined || r.layer === q.layer)
      && (q.slot === undefined || r.engine_slot === q.slot)
      && (q.minW === undefined || r.w >= q.minW)
      && (q.maxW === undefined || r.w <= q.maxW)
      && (q.standable === undefined || standable(r) === q.standable));
  }

  /**
   * The play slots (standable, climb and danger, across the whole catalog) that world `w` has fewer than 3 usable pieces for, sorted.
   * Same rule as the catalog's per-world **Gaps** line (catalog_master.py write_md), except that World 1 never counts made things. Lava
   * is World 9's only, and a 'new slot: World N ...' only its own world's. Ask world N's file (the cast file has no play slots).
   */
  gaps(w: number): string[] {
    if (this.file !== `w${w}`) throw new Error(`gaps(${w}) asked of inventory file ${this.file}: load world ${w}'s`);
    const have = new Map<string, number>();
    for (const r of this.byWorld(w)) {
      if (usable(r)) have.set(r.engine_slot, (have.get(r.engine_slot) ?? 0) + 1);
    }
    return this.playSlots.filter((k) => {
      if ((have.get(k) ?? 0) >= 3) return false;
      if (k.startsWith('new slot: lava') && w !== 9) return false;
      const m = /^new slot: World (\d+)/.exec(k);
      return !(m && Number(m[1]) !== w);
    }).sort();
  }
}

// one loader a file, spelled out so the bundler gives each its own chunk and nothing else is pulled in
const FILES: Record<InventoryName, () => Promise<{ default: unknown }>> = {
  w1: () => import('./inventory/w1.json'), w2: () => import('./inventory/w2.json'), w3: () => import('./inventory/w3.json'),
  w4: () => import('./inventory/w4.json'), w5: () => import('./inventory/w5.json'), w6: () => import('./inventory/w6.json'),
  w7: () => import('./inventory/w7.json'), w8: () => import('./inventory/w8.json'), w9: () => import('./inventory/w9.json'),
  w10: () => import('./inventory/w10.json'), cast: () => import('./inventory/cast.json'),
};
const loading = new Map<InventoryName, Promise<Inventory>>();

/** One world's level art (1-10), or 'cast' (characters, enemies, pickups, UI, backdrops); each loaded once, on first call. */
export function loadInventory(which: number | 'cast'): Promise<Inventory> {
  const name: InventoryName = which === 'cast' ? 'cast' : `w${which}`;
  const load = FILES[name];
  if (!load) return Promise.reject(new Error(`no inventory file for ${String(which)}`));
  let p = loading.get(name);
  if (!p) {
    p = load().then((m) => new Inventory((m.default ?? m) as InventoryFile));
    loading.set(name, p);
  }
  return p;
}
