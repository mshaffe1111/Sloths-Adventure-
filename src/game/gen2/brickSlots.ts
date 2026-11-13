/**
 * gen2/brickSlots — one brick library across worlds (GAME-MAP A13): a brick's piece names the inventory's engine slot it fills
 * (src/game/art/inventory.ts ArtRow.engine_slot; for a landing the key is 'landing/platforms <type> <style>'), and each world's manifest
 * carries its own row for the slot (WorldManifest.slots), so the same section lays in every world that has the slot, in that world's art.
 *
 * Nothing here is imported by the game yet (0 bytes shipped): a world that wants bricks builds its `slots` from its inventory file with
 * `worldSlots`, and `asBrick` turns a section authored in one world's styles into a brick (each piece's slot read off its own kind).
 */
import type { Platform } from '../types.ts';
import { usable, type Inventory } from '../art/inventory.ts';
import type { SectionPiece, SectionTemplate, WorldManifest } from './types.ts';

type Style = NonNullable<Platform['style']>;
const STYLES: readonly Style[] = ['branch', 'log', 'moss_stone', 'ruin', 'canopy_bridge', 'fungus_shelf', 'roost_branch'];
const KEY = /^landing\/platforms (solid|bouncy) (\S+)$/;

/** the engine slot a piece fills as the lay would make it today (pipeline layStage `mk`: a bouncy piece is type 'bouncy'; a bank takes the
 *  world's ground style, a branch 'branch', a hollow 'log', anything else 'moss_stone'); undefined for a piece that is no landing (a liana,
 *  a vine) or a crumbling tile (its own kind, 'fragile') */
export function slotOf(pc: Pick<SectionPiece, 'shape' | 'style' | 'crumble'>, ground: Style): string | undefined {
  if (pc.crumble || pc.shape === 'liana' || pc.shape === 'vine') return undefined;
  const style = pc.style ?? (pc.shape === 'bank' ? ground : pc.shape === 'branch' ? 'branch' : pc.shape === 'hollow' ? 'log' : 'moss_stone');
  return `landing/platforms ${pc.shape === 'bouncy' ? 'bouncy' : 'solid'} ${style}`;
}

/** a section authored in one world's styles as a brick: every landing piece (its own and its sub-blocks' versions') names its slot */
export function asBrick<T extends SectionTemplate>(tpl: T, ground: Style): T {
  const piece = (pc: SectionPiece): SectionPiece => { const slot = slotOf(pc, ground); return slot ? { ...pc, slot } : pc; };
  return { ...tpl, pieces: tpl.pieces.map(piece), ...(tpl.subBlocks ? { subBlocks: tpl.subBlocks.map((b) => ({ ...b, versions: b.versions.map((v) => ({ ...v, pieces: v.pieces.map(piece) })) })) } : {}) };
}

/**
 * A world's rows for the slots its bricks name, read off its inventory file: the style the slot's key names and the ids of the pieces
 * that may draw it there: usable (not waiting on a fix), in scale with Pokey, never a made thing in World 1 (Inventory.byWorld), and the
 * world's own best fits when it has any (world_best), else every piece that fits it. A slot the world has no piece for gets NO row, so
 * the lay fails a brick that asks it, by name; `missing` lists them.
 */
export function worldSlots(inv: Inventory, world: number, slots: readonly string[]): { slots: NonNullable<WorldManifest['slots']>; missing: string[] } {
  const out: Record<string, { style: Style; art: string[] }> = {};
  const missing: string[] = [];
  for (const slot of new Set(slots)) {
    const style = KEY.exec(slot)?.[2] as Style | undefined;
    const fit = inv.byWorld(world, { slot }).filter(usable);
    const own = fit.filter((r) => r.world_best === world);
    if (!style || !STYLES.includes(style) || !fit.length) { missing.push(slot); continue; }
    out[slot] = { style, art: (own.length ? own : fit).map((r) => r.id).sort() };
  }
  return { slots: out, missing: missing.sort() };
}
