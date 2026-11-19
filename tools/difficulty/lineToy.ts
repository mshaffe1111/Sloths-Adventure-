/**
 * The line channel's toys (METER-4): ENG-23's follow toy (tools/inspect/lineBot.test.ts, "the toy marsh": three cages by the start, two
 * reed clumps of 300 px over 400 px of open mud under one heron, calm 5 s, the exit at 3,000) laid over a built stage so the meter reads
 * it as it reads any stage (score.ts scoreStage's `prep`), and the same marsh as the engine's FollowStage for the pure tests. A toy, never
 * a level: 2-3 is laid by its builder (level.md rule 23). Every number of the marsh is lineBot's; `over` changes one for a planted case.
 */
import type { RealPlay } from '../../src/game/realPlay.ts';
import type { FollowStage } from '../../src/game/followPlay.ts';
import { W2_FOLLOW } from '../../src/game/gen2/worlds/w2.ts';
import type { Bush, WatchZone } from '../../src/game/watcher.ts';
import type { Collectible, Platform } from '../../src/game/types.ts';

export const TOY_Y = 800;
export interface Marsh {
  start: number; exit: number; cages: number[]; covers: Bush[]; zones: WatchZone[];
}
/** lineBot's toy marsh (START 300, EXIT 3000, cages 420/470/520, A 1000 + 300, B 1700 + 300, the heron over 900-2100, calm 5 s) */
export function marsh(over: Partial<Marsh> = {}): Marsh {
  return {
    start: 300, exit: 3000, cages: [420, 470, 520],
    covers: [{ x: 1000, w: 300, y: TOY_Y, kind: 'reeds' }, { x: 1700, w: 300, y: TOY_Y, kind: 'reeds' }],
    zones: [{ x0: 900, x1: 2100, calm: [5, 5] }],
    ...over,
  };
}
const floor = (): Platform => ({ id: 1, x: 0, y: TOY_Y, width: 6000, height: 200, type: 'solid' }) as Platform;

/** the marsh as the engine's FollowStage (what followPlay and lineFaults' safeWindow fly) */
export function marshStage(m: Marsh = marsh()): FollowStage {
  return { exitX: m.exit, dir: 1, zones: m.zones, covers: m.covers, platforms: [floor()], safeWater: [] };
}

/**
 * Lay the marsh over a built stage (RealPlay), as lineBot lays it over 2-3's engine: the bare floor, the cages and the exit, the reeds,
 * the heron's stretch and World 2's follow row on the stage AND the engine (proto), then the engine's own startFollow. `follow: false`
 * lays the same marsh with no follow row (the stretch is then the eagle's: watcher.ts).
 */
export function layMarsh(m: Marsh = marsh(), follow = true): (rp: RealPlay) => void {
  return (rp) => {
    const e = rp.e as unknown as Record<string, any>;
    const st = rp.stage as unknown as Record<string, any>;
    const pl = [floor()];
    rp.bare(pl);
    const cages = m.cages.map((x, i) => ({ id: 300 + i, x, y: TOY_Y - 26, type: 'cage', collected: false, critter: (['duck', 'otter', 'capy'] as const)[i % 3] }) as Collectible);
    const exit = { id: 400, x: m.exit, y: TOY_Y - 40, type: 'exit_totem', collected: false } as Collectible;
    const proto = { hints: [], covers: [], beats: [], movedPickups: [], bushes: m.covers, watch: m.zones, ...(follow ? { follow: W2_FOLLOW } : {}) };
    Object.assign(st, {
      platforms: pl, vines: [], ropes: [], enemies: [], collectibles: [...cages, exit], zones: [], rivers: [], checkpoints: [], heartFalls: [],
      pods: [], gates: [], clusters: [], clocks: [], kit: undefined, spawnX: m.start, spawnY: TOY_Y, exitTotemX: m.exit, exitTotemY: TOY_Y, proto,
      config: { ...st.config, objectiveType: 'rescue', targetCount: m.cages.length, levelWidth: 6000 },
    });
    e.collectibles = st.collectibles;
    e.proto = proto;
    e.cast = null;
    e.walls = e.mode.bounds({ levelWidth: 6000, exit: { x: m.exit, y: TOY_Y }, spawn: { x: m.start, y: TOY_Y } });
    e.startFollow();
  };
}
