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

/**
 * 2-3.md's two watched beats as a toy (its arc table, beats 4 and 7; never the level): five cages by the start (the line at its longest),
 * then beat 4, two clumps over open mud under one heron (Normal W 260 over G 500, the dial's top; Easy W 340 over G 350), then beat 7,
 * three clumps over G 350 under two herons out of step by 3.2 s (Easy: one heron, W 340). calm 5 s = STILL_RULE.calmMin, as flown.
 */
export function designBeats(setting: 'normal' | 'easy'): Marsh {
  const easy = setting === 'easy';
  const W = easy ? 340 : 260, G4 = easy ? 350 : 500, G7 = 350;
  const b4 = 1200, c4 = [{ x: b4, w: W }, { x: b4 + W + G4, w: W }];
  const z4 = { x0: b4 - 200, x1: c4[1].x + W + 200, calm: [5, 5] as [number, number] };
  const b7 = z4.x1 + 800, c7 = [0, 1, 2].map((i) => ({ x: b7 + i * (W + G7), w: W }));
  const z7 = { x0: b7 - 200, x1: c7[2].x + W + 200, calm: [5, 5] as [number, number] };
  const zones = easy ? [z4, z7] : [z4, z7, { ...z7, lag: 3.2 }];
  return { start: 300, exit: z7.x1 + 1200, cages: [420, 470, 520, 570, 620], covers: [...c4, ...c7].map((c) => ({ ...c, y: TOY_Y, kind: 'reeds' as const })), zones };
}

if (process.argv[1] && process.argv[1].endsWith('lineToy.ts') && process.argv.includes('--read')) {
  // the toys as the meter reads them, on the meter's own scale (1-1 Normal, its fixed anchor layouts 1-4, reads 4)
  const { scoreStage, ANCHOR } = await import('./score.ts');
  const anchor = [1, 2, 3, 4].map((s) => scoreStage(ANCHOR.id, 'normal', s, new Map()).raw).sort((a, b) => a - b);
  const scale = ANCHOR.score / ((anchor[1] + anchor[2]) / 2);
  console.log(`SCALE ${scale.toFixed(5)} (1-1 Normal seeds 1-4)`);
  for (const [name, mk] of [['ENG-23 marsh (lineBot)', () => marsh()], ['2-3.md beats 4 + 7', null]] as const) {
    for (const s of ['normal', 'easy'] as const) {
      const m = mk ? mk() : designBeats(s);
      const r = scoreStage('2-3', s, 1, new Map(), layMarsh(m));
      const line = r.challenges.filter((c) => c.kind.startsWith('line'));
      const pts = line.reduce((a, c) => a + c.points, 0);
      console.log(`-- ${name} ${s}: ${r.minutes} min (route), points ${r.points} (line ${pts.toFixed(2)}), raw ${r.raw.toFixed(2)} = meter ${(r.raw * scale).toFixed(1)}; pieces ${r.pieces.join(' ')}`);
      for (const c of line) console.log(`   t ${c.t.toFixed(1).padStart(5)}s ${c.kind.padEnd(9)} bits ${c.bits.toFixed(2)} x stakes ${c.stakes.toFixed(3)} (${c.cost}) x overlap ${c.overlap.toFixed(1)} x new ${c.novelty.toFixed(2)} = ${c.points.toFixed(2)}  ${c.note}`);
    }
  }
}
