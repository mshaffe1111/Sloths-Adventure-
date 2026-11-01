/**
 * petalPass — the petal trail (petals.ts) with the level check's reach (levelCheck.ts): every stage runs it as it is built, and
 * pickupCheck holds every shipped stage to it (the per-screen cap, no rows, nothing out of reach, nothing below a required jump's arc).
 */
import type { GeneratedStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import { badPickups } from './flowerReach.ts';
import { skillHeldAt } from './skills.ts';
import { busiestScreen, clumpExtras, fillGaps, KEEP, nightBlooms, ON_FLOOR, isPetal, offArc, PER_SCREEN, petalTrail, rowExtras, type PetalOut } from './petals.ts';

const OUT_OF_REACH = /^(?:flower|leaf|fruit) #(\d+) at \(.*\) is out of reach$/;

const isLiana = (v: GeneratedStage['vines'][number]) => v.vineType === 'swing_liana' || !!v.isSwingingVine || !!v.silk;
const reachesExit = (errors: readonly string[]) => !errors.some((e) => /^exit platform \d+ is not reachable/.test(e));

/**
 * The pickups the level check finds out of reach (by id). As the stages' own tests apply it (tools/inspect/eraRoll.ts checkRoll): the
 * check follows one liana from ledge to ledge, not a chain of them, so where it cannot reach the exit each run of lianas gets a stand-in
 * bridge, and a pickup along a swing is left to the swing checks (flowerReach.ts). Where even then it cannot reach the exit, its reach
 * is no judge of the pickups past where it stopped: none is called out of reach.
 */
export function unreachablePickups(stage: GeneratedStage): Set<number> {
  return judgeReach(stage) ?? new Set();
}

/**
 * unreachablePickups, or null where the check cannot judge the stage (it cannot reach the exit even over the stand-in bridges). `raw`
 * collects every pickup the check does not reach for certain (none forgiven along a swing): the test a new petal has to pass.
 */
function judgeReach(stage: GeneratedStage, raw?: Set<number>): Set<number> | null {
  // (the reach only: the rooms are walked solved, never each solved again, levelCheck CheckOptions.rooms)
  let errors = validateStage(stage, { rooms: false }).errors;
  let spans: Array<[number, number]> = [];
  if (!reachesExit(errors)) {
    const xs = stage.vines.filter(isLiana).map((v) => v.x).sort((a, b) => a - b);
    for (const vx of xs) {
      const l = spans[spans.length - 1];
      if (l && vx - l[1] < 420) l[1] = vx;
      else spans.push([vx, vx]);
    }
    const floor = stage.spawnY ?? 580;
    const bridges = spans.map((sp, i) => ({ id: 90000 + i, x: sp[0] - 260, y: floor, width: sp[1] - sp[0] + 520, height: 20, type: 'solid' as const }));
    if (bridges.length) {
      const bridged = validateStage({ ...stage, platforms: [...stage.platforms, ...bridges] } as GeneratedStage, { rooms: false }).errors;
      if (reachesExit(bridged) || !raw) errors = bridged;
    }
    if (!reachesExit(errors)) {
      if (raw) for (const e of errors) e.match(OUT_OF_REACH) && raw.add(Number(e.match(OUT_OF_REACH)![1]));
      return null;
    }
    spans = bridges.map((b) => [b.x - 60, b.x + b.width + 60]);
  }
  const ids = new Set<number>();
  for (const e of errors) {
    const m = e.match(OUT_OF_REACH);
    if (!m) continue;
    raw?.add(Number(m[1]));
    const c = stage.collectibles.find((x) => x.id === Number(m[1]));
    if (c && spans.some(([a, b]) => c.x > a && c.x < b)) continue;
    ids.add(Number(m[1]));
  }
  // (a new petal over a stand-in bridge is not known to be reached: raw counts it out)
  if (raw) for (const c of stage.collectibles) if (spans.some(([a, b]) => c.x > a && c.x < b)) raw.add(c.id);
  return ids;
}

/** the petal trail on a built stage (changed and returned) */
export function petalPass<T extends GeneratedStage>(stage: T, out?: PetalOut): T {
  const o: PetalOut = out ?? ({} as PetalOut);
  // (5-3's orchid cups hold their flowers close on purpose: no clump rule takes them)
  const cups = new Set((stage as { w5info?: { cupFlowers?: number[] } }).w5info?.cupFlowers ?? []);
  for (const c of stage.collectibles) if (cups.has(c.id)) KEEP.add(c);
  const far = judgeReach(stage);
  petalTrail(stage, far ?? new Set(), o);
  // the long stretches with no trail get one (petals.ts fillGaps), held to the same rules; only where the check can judge the reach
  // (where it cannot judge the whole stage, a new petal stays only where it does reach: before whatever stopped it)
  // (not on World 8's harvests: a flower there is a night bloom, the goal's own)
  // (nor on 5-3's closing orchids: its quota is meant to need the cups, so the path gets no more)
  const orchids = (stage as { w5info?: { orchids?: unknown[] } }).w5info?.orchids?.length;
  if (stage.config.objectiveType !== 'boss_lair' && !nightBlooms(stage) && !orchids) {
    const tried = new Set<string>();
    let kept = 0;
    for (let round = 0; round < 3; round++) {
      const added = fillGaps(stage, tried, !far);
      if (!added.length) break;
      const out2 = new Set<number>();
      const judged = judgeReach(stage, out2) !== null;
      const arc = offArc(stage, added);
      // (and the swing checks' own reach, flowerReach.ts, which the stages' tests hold every pickup to)
      const glide = skillHeldAt('glide', (stage.config.worldIndex - 1) * 10 + stage.config.miniIndex);
      const bad = new Set(badPickups({ platforms: stage.platforms, vines: stage.vines, ropes: stage.ropes, waterY: stage.waterY, glide }, added));
      // (and none only a silk line reaches: a ledge up a silk line is that line's own reward, its cocoons; World 5)
      if (stage.vines.some((v) => v.silk)) {
        for (const e of validateStage({ ...stage, vines: stage.vines.filter((v) => !v.silk) }, { rooms: false }).errors) {
          const m = e.match(OUT_OF_REACH);
          if (m) bad.add(added.find((c) => c.id === Number(m[1]))!);
        }
      }
      const gone = new Set(added.filter((c) => (out2.has(c.id) && (judged || !ON_FLOOR.has(c))) || arc.has(c) || bad.has(c)));
      for (const c of gone) tried.add(`${c.x},${c.y}`);
      if (gone.size) stage.collectibles = stage.collectibles.filter((c) => !gone.has(c));
      kept += added.length - gone.size;
      if (!gone.size) break;
    }
    if (kept) petalTrail(stage, new Set());
    o.filled = kept;
  }
  if (typeof process !== 'undefined' && process.env?.PETAL_DEBUG) console.error('PETALS', stage.config.id, JSON.stringify(o));
  return stage;
}

/** the rules a shipped stage's petals keep (an empty list when it keeps them all) */
export function pickupCheck(stage: GeneratedStage): string[] {
  const petals = stage.collectibles.filter((c) => isPetal(c, stage));
  const errors: string[] = [];
  const far = unreachablePickups(stage);
  for (const c of petals) if (far.has(c.id)) errors.push(`petal #${c.id} at (${Math.round(c.x)}, ${Math.round(c.y)}) is out of reach`);
  for (const c of offArc(stage, petals)) errors.push(`petal #${c.id} at (${Math.round(c.x)}, ${Math.round(c.y)}) hangs below a required jump's arc`);
  const rows = rowExtras(petals);
  if (rows.size) errors.push(`${rows.size} petals stand in solid rows`);
  const clumps = clumpExtras(petals);
  if (clumps.size) errors.push(`${clumps.size} petals stand in clumps`);
  const b = busiestScreen(petals);
  if (b.n > PER_SCREEN) errors.push(`${b.n} petals on one screen at x=${Math.round(b.x)} (at most ${PER_SCREEN})`);
  return errors;
}
