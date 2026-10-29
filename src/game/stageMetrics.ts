/**
 * Numbers about a generated stage: how varied it is, how long the empty stretches are, how fair the jumps are, how the flags are spaced.
 *
 * The tests check these against the owner's targets and scripts/measure-stages.ts prints them, so what is promised and what is checked are the
 * same code. Everything here reads a finished GeneratedStage (nothing is built or changed).
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Enemy, Platform } from './types.ts';

/** distance from an enemy's origin to its feet (predatorAI.FEET; a frog and an eagle are added) */
const FEET: Record<string, number> = { snake: 14, ocelot: 19, jaguar: 24, boa: 16, caiman: 15, tayra: 15, harpy: 16, frog: 14, spider: 12 };

export const isThin = (p: Platform) => p.height < 50;
const isBank = (p: Platform) => p.type === 'solid' && p.height >= 50;
const isBridge = (p: Platform) => p.type === 'solid' && p.style === 'canopy_bridge';

/** the x-extent a player can use on a platform (a moving platform's whole sweep, a log's whole river) */
export function platExt(p: Platform): [number, number] {
  if (p.type === 'moving') return [(p.baseX ?? p.x) - (p.moveRange ?? 0), (p.baseX ?? p.x) + (p.moveRange ?? 0) + p.width];
  if (p.type === 'drift' && p.drift) return [p.drift.x0, p.drift.x1];
  return [p.x, p.x + p.width];
}

/** the height of the surface an enemy walks on */
export function surfaceOf(e: Enemy): number {
  return e.y + (FEET[e.type] ?? e.height / 2);
}

export interface JumpEdge {
  /** the platform the jump starts from and the one it lands on */
  from: Platform;
  to: Platform;
  /** the x of the take-off (the near edge of `from`) and of the landing (the near edge of `to`), and the gap between */
  takeoffX: number;
  landX: number;
  gap: number;
  dir: 1 | -1;
}

/**
 * Every direct hop between two platforms: the next platform that starts beyond the edge of this one, within a jump's reach. Only ordinary
 * footing counts (not river logs, moving platforms or mushrooms: their hops are not a take-off from a fixed edge).
 */
/** how far (px) a ground animal's patrol keeps from a jump's take-off and from its landing (the clearance check below; gen2's patchFor) */
export const JUMP_CLEAR = 120;

export function jumpEdges(src: GeneratedStage | Platform[]): JumpEdge[] {
  const all = Array.isArray(src) ? src : src.platforms;
  const plats = all.filter((p) => !p.broken && p.type !== 'drift' && p.type !== 'moving' && p.type !== 'bouncy');
  const sorted = [...plats].sort((a, b) => a.x - b.x);
  const out: JumpEdge[] = [];
  for (const a of sorted) {
    const a1 = a.x + a.width;
    // a branch over a stretch of ground is not an edge to jump from: the ground is below it and carries on
    if (a.height < 50 && all.some((c) => c.height >= 50 && !c.broken && c.x <= a.x + 2 && c.x + c.width >= a1 - 2 && c.y > a.y + 30)) continue;
    // a step: ground that carries on right beside this platform (up or down) is not an edge to jump from
    if (sorted.some((c) => c !== a && c.x >= a1 - 6 && c.x <= a1 + 8 && Math.abs(c.y - a.y) <= 130)) continue;
    let best: Platform | null = null;
    for (const b of sorted) {
      if (b === a || b.x < a1 + 24) {
        if (b.x > a1 + 600) break;
        continue;
      }
      if (b.x > a1 + 330) break;
      if (Math.abs(a.y - b.y) > 180) continue;
      // something already standing in the gap means this is not a bare hop
      const covered = sorted.some((c) => c !== a && c !== b && c.x < b.x && c.x + c.width > a1 && Math.abs(c.y - a.y) < 40)
        // (or the ground runs on under the whole gap: a hop over solid ground is a step, not a leap over a pit)
        || sorted.some((c) => c !== a && c !== b && c.height >= 50 && c.x <= a1 + 6 && c.x + c.width >= b.x - 6 && c.y >= Math.min(a.y, b.y) - 6);
      if (covered) continue;
      if (!best || b.x < best.x) best = b;
    }
    if (best) out.push({ from: a, to: best, takeoffX: a1, landX: best.x, gap: best.x - a1, dir: 1 });
  }
  return out;
}

export interface StageMetrics {
  id: string;
  width: number;
  kinds: string[];
  distinctKinds: number;
  /** longest run of the same piece kind in a row, and the biggest share of the stage's length one kind covers */
  longestSameRun: number;
  maxKindShare: number;
  maxKind: string;
  /** hazard-free stretches (px): from the start to the first hazard, the longest in between (not inside a breather), and from the last hazard to the exit */
  freeStart: number;
  freeInterior: number;
  freeEnd: number;
  /** the share of the stage body that is plain ground: flat bank with no thin platform, vine, zone, gap or river within 60 px (the audit's own definition) */
  plainShare: number;
  /** the same, but a step in the ground also counts as something there */
  plainShareRelief: number;
  /** jumps with a ground animal's patrol within 120 px of the take-off / of the landing */
  takeoffsNearEnemy: number;
  landingsNearEnemy: number;
  /** landings narrower than 64 px */
  narrowLandings: number;
  /** flag-to-flag distances, and the distance from the spawn to the first flag */
  flagGaps: number[];
  firstFlag: number;
  lastFlagToExit: number;
  /** platform styles on thin platforms */
  styleCounts: Record<string, number>;
  styleDistinct: number;
  maxStyleShare: number;
  enemyTypes: string[];
}

/** the bare gaps in the ground path (pits): x-intervals wider than 40 px with no bank, bridge or plank over them */
export function bareGaps(stage: GeneratedStage): Array<[number, number]> {
  const cover: Array<[number, number]> = [];
  for (const p of stage.platforms) {
    if (p.broken || p.type === 'drift') continue;
    if (isBank(p) || isBridge(p) || p.type === 'fragile') cover.push(platExt(p));
  }
  cover.sort((a, b) => a[0] - b[0]);
  const out: Array<[number, number]> = [];
  let end = -Infinity;
  for (const [x0, x1] of cover) {
    if (end > -Infinity && x0 - end > 40) out.push([end, x0]);
    end = Math.max(end, x1);
  }
  return out;
}

/** hazard blocks (x-intervals): a bare gap in the footing, a ground animal's patch, a zone, a river, a moving/fragile/bouncy platform, a swing, a required rope */
export function hazardBlocks(stage: GeneratedStage): Array<[number, number]> {
  const out: Array<[number, number]> = bareGaps(stage);
  for (const p of stage.platforms) {
    if (p.broken || p.type === 'drift') continue;
    const [x0, x1] = platExt(p);
    if (p.type === 'moving' || p.type === 'fragile' || p.type === 'bouncy') out.push([x0 - 30, x1 + 30]);
  }
  for (const e of stage.enemies) {
    if (e.type === 'eagle') out.push([e.x - 120, e.x + 120]);
    else out.push([e.patrolMinX - 40, e.patrolMaxX + 40]);
  }
  for (const z of stage.zones ?? []) out.push([z.x0, z.x1]);
  for (const r of stage.rivers ?? []) out.push([r.x0, r.x1]);
  for (const v of stage.vines) if (v.vineType === 'swing_liana') out.push([v.x - 60, v.x + 60]);
  for (const r of stage.ropes ?? []) if (r.required) out.push([r.x0, r.x1]);
  // a two-lane fork is something to decide at, from where the lanes part to where they meet
  for (const f of stage.lanes ?? []) out.push([f.x0, f.x1]);
  out.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const b of out) {
    const last = merged[merged.length - 1];
    if (last && b[0] <= last[1]) last[1] = Math.max(last[1], b[1]);
    else merged.push([b[0], b[1]]);
  }
  return merged;
}

export function measureStage(stage: GeneratedStage): StageMetrics {
  const W = stage.config.levelWidth;
  const pieces = stage.meta?.pieces ?? [];
  const real = pieces.filter((p) => p.k !== 'flat' && p.k !== 'checkpoint' && p.k !== 'spacer');
  const kinds = real.map((p) => p.k);
  const counts = new Map<string, number>();
  const lens = new Map<string, number>();
  for (const p of real) {
    counts.set(p.k, (counts.get(p.k) ?? 0) + 1);
    lens.set(p.k, (lens.get(p.k) ?? 0) + (p.x1 - p.x0));
  }
  let longestSameRun = 0;
  let run = 0;
  for (let i = 0; i < kinds.length; i++) {
    run = i > 0 && kinds[i] === kinds[i - 1] ? run + 1 : 1;
    longestSameRun = Math.max(longestSameRun, run);
  }
  let maxKind = '';
  let maxLen = 0;
  for (const [k, l] of lens) if (l > maxLen) { maxLen = l; maxKind = k; }

  // ---- hazard-free stretches ----
  const blocks = hazardBlocks(stage);
  const breathers = [...pieces.filter((p) => p.k === 'breather'), ...(stage.meta?.breathers ?? []).map(([x0, x1]) => ({ x0, x1 }))];
  const inBreather = (x0: number, x1: number) => breathers.some((b) => x0 >= b.x0 - 10 && x1 <= b.x1 + 10);
  const sx = stage.spawnX;
  const ex = stage.exitTotemX;
  const horizontal = stage.config.objectiveType !== 'ascent';
  let freeStart = 0;
  let freeInterior = 0;
  let freeEnd = 0;
  if (horizontal) {
    freeStart = blocks.length ? Math.max(0, blocks[0][0] - sx) : ex - sx;
    freeEnd = blocks.length ? Math.max(0, ex - blocks[blocks.length - 1][1]) : ex - sx;
    for (let i = 1; i < blocks.length; i++) {
      const a = blocks[i - 1][1];
      const b = blocks[i][0];
      if (b - a > freeInterior && !inBreather(a, b)) freeInterior = b - a;
    }
  }

  // ---- plain ground ----
  const BIN = 50;
  const nb = Math.ceil(W / BIN);
  const flat = new Uint8Array(nb);
  const structure = new Uint8Array(nb);
  const relief = new Uint8Array(nb);
  const mark = (arr: Uint8Array, x0: number, x1: number) => {
    for (let b = Math.max(0, Math.floor(x0 / BIN)); b <= Math.min(nb - 1, Math.floor(x1 / BIN)); b++) arr[b] = 1;
  };
  const PAD = 60;
  const banks = stage.platforms.filter((p) => isBank(p) && !isBridge(p) && !p.broken);
  for (const p of banks) for (let b = 0; b < nb; b++) { const c = b * BIN + BIN / 2; if (c >= p.x + 50 && c <= p.x + p.width - 50) flat[b] = 1; }
  for (const p of stage.platforms) {
    if (p.broken || isBank(p) || isBridge(p)) continue;
    const [x0, x1] = platExt(p);
    mark(structure, x0 - PAD, x1 + PAD);
  }
  for (const v of stage.vines) mark(structure, v.x - PAD, v.x + PAD);
  for (const z of stage.zones ?? []) mark(structure, z.x0, z.x1);
  for (const r of stage.rivers ?? []) mark(structure, r.x0, r.x1);
  for (const f of stage.lanes ?? []) mark(structure, f.x0, f.x1);
  for (const g of bareGaps(stage)) mark(structure, g[0] - PAD, g[1] + PAD);
  for (const v of banks) {
    for (const w of banks) if (v !== w && Math.abs(v.x + v.width - w.x) <= 3 && Math.abs(v.y - w.y) > 4) mark(relief, w.x - PAD, w.x + PAD);
  }
  const bodyX0 = sx + 600;
  const bodyX1 = ex - 500;
  let body = 0;
  let plain = 0;
  let plainRelief = 0;
  for (let b = 0; b < nb; b++) {
    const c = b * BIN + BIN / 2;
    if (c < bodyX0 || c > bodyX1) continue;
    body++;
    if (flat[b] && !structure[b]) { plain++; if (!relief[b]) plainRelief++; }
  }

  // ---- jumps next to animals ----
  let takeoffsNearEnemy = 0;
  let landingsNearEnemy = 0;
  let narrowLandings = 0;
  const ground = stage.enemies.filter((e) => e.type !== 'eagle');
  for (const j of jumpEdges(stage)) {
    if (j.to.width < 64 && j.gap >= 24) narrowLandings++;
    for (const e of ground) {
      const sf = surfaceOf(e);
      const onFrom = e.patrolMaxX >= j.from.x - 1 && e.patrolMinX <= j.from.x + j.from.width + 1 && Math.abs(sf - j.from.y) <= 8;
      if (onFrom && j.takeoffX - e.patrolMaxX < JUMP_CLEAR) { takeoffsNearEnemy++; break; }
    }
    for (const e of ground) {
      const sf = surfaceOf(e);
      const onTo = e.patrolMaxX >= j.to.x - 1 && e.patrolMinX <= j.to.x + j.to.width + 1 && Math.abs(sf - j.to.y) <= 8;
      if (onTo && e.patrolMinX - j.landX < JUMP_CLEAR) { landingsNearEnemy++; break; }
    }
  }

  // ---- flags ----
  const flags = [...(stage.checkpoints ?? [])].map((c) => c.x).sort((a, b) => a - b);
  const flagGaps: number[] = [];
  for (let i = 1; i < flags.length; i++) flagGaps.push(flags[i] - flags[i - 1]);

  // ---- styles ----
  const styleCounts: Record<string, number> = {};
  let thin = 0;
  for (const p of stage.platforms) {
    if (p.broken || !isThin(p) || p.type === 'drift' || p.type === 'bouncy') continue;
    const s = p.style ?? 'none';
    styleCounts[s] = (styleCounts[s] ?? 0) + 1;
    thin++;
  }
  const maxStyleShare = thin ? Math.max(...Object.values(styleCounts)) / thin : 0;

  return {
    id: stage.config.id,
    width: W,
    kinds,
    distinctKinds: counts.size,
    longestSameRun,
    maxKindShare: W ? maxLen / W : 0,
    maxKind,
    freeStart,
    freeInterior,
    freeEnd,
    plainShare: body ? plain / body : 0,
    plainShareRelief: body ? plainRelief / body : 0,
    takeoffsNearEnemy,
    landingsNearEnemy,
    narrowLandings,
    flagGaps,
    firstFlag: flags.length ? flags[0] - sx : ex - sx,
    lastFlagToExit: flags.length ? ex - flags[flags.length - 1] : ex - sx,
    styleCounts,
    styleDistinct: Object.keys(styleCounts).length,
    maxStyleShare,
    enemyTypes: [...new Set(stage.enemies.map((e) => e.type))],
  };
}
