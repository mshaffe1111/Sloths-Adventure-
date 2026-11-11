/**
 * The art inventory: every art piece in the master catalog (reference/art/CATALOG-MASTER.csv), as the engine reads it.
 *
 * inventory.json is written by `python3 tools/art/catalog_master.py --emit` and never hand-edited. It is loaded lazily (a dynamic
 * import, its own chunk: never in the main JS), so call `loadInventory()` once and query the result.
 *
 * Matt, 11-11: made things (sawn, carved, built) are never World 1 art; `byWorld(1, ...)` leaves them out unless `includeMade`.
 */

export type Layer =
  | 'platform' | 'step' | 'soft landing' | 'climb' | 'danger look' | 'decor near' | 'decor mid' | 'backdrop'
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
}

export interface InventoryFile {
  note: string;
  cols: string[];
  rows: unknown[][];
}

export const STANDABLE: ReadonlySet<string> = new Set(['platform', 'step', 'soft landing']);
const LEVEL: ReadonlySet<string> = new Set([...STANDABLE, 'danger look', 'climb', 'decor near', 'decor mid', 'backdrop']);
const PLAY_SLOT = ['landing', 'climbable', 'other/', 'new slot', 'stageArtData', 'pickCut', 'w1CutArt'];

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
}

export class Inventory {
  readonly rows: readonly ArtRow[];
  private readonly ids = new Map<string, ArtRow>();
  private readonly slots = new Map<string, ArtRow[]>();

  constructor(data: InventoryFile) {
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

  /** Pieces that fit world `w` (any position in its worlds list). Made things are left out of World 1 unless `includeMade`. */
  byWorld(w: number, q: WorldQuery = {}): ArtRow[] {
    return this.rows.filter((r) =>
      r.worlds.includes(w)
      && !(w === 1 && r.made_thing && !q.includeMade)
      && (q.layer === undefined || r.layer === q.layer)
      && (q.slot === undefined || r.engine_slot === q.slot)
      && (q.minW === undefined || r.w >= q.minW)
      && (q.maxW === undefined || r.w <= q.maxW)
      && (q.standable === undefined || standable(r) === q.standable));
  }

  /**
   * The play slots (standable, climb and danger) that world `w` has fewer than 3 usable pieces for, sorted. Same rule as the catalog's
   * per-world **Gaps** line (catalog_master.py write_md), except that World 1 never counts made things. Lava is World 9's only, and a
   * 'new slot: World N ...' only its own world's.
   */
  gaps(w: number): string[] {
    const all = new Set<string>();
    for (const r of this.rows) {
      if ((STANDABLE.has(r.layer) || r.layer === 'danger look' || r.layer === 'climb') && PLAY_SLOT.some((p) => r.engine_slot.startsWith(p))) {
        all.add(r.engine_slot);
      }
    }
    const have = new Map<string, number>();
    for (const r of this.byWorld(w)) {
      if (LEVEL.has(r.layer) && usable(r)) have.set(r.engine_slot, (have.get(r.engine_slot) ?? 0) + 1);
    }
    return [...all].filter((k) => {
      if ((have.get(k) ?? 0) >= 3) return false;
      if (k.startsWith('new slot: lava') && w !== 9) return false;
      const m = /^new slot: World (\d+)/.exec(k);
      return !(m && Number(m[1]) !== w);
    }).sort();
  }
}

let loading: Promise<Inventory> | null = null;

/** The inventory, loaded once on first call (its own chunk). */
export function loadInventory(): Promise<Inventory> {
  loading ??= import('./inventory.json').then((m) => new Inventory((m.default ?? m) as unknown as InventoryFile));
  return loading;
}
