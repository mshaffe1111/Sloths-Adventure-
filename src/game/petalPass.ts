/**
 * petalPass — the petal trail (petals.ts) with the level check's reach (levelCheck.ts): every stage runs it as it is built, and
 * pickupCheck holds every shipped stage to it (the per-screen cap, no rows, nothing out of reach, nothing below a required jump's arc).
 */
import type { GeneratedStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import { busiestScreen, isPetal, offArc, PER_SCREEN, petalTrail, rowExtras, type PetalOut } from './petals.ts';

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
  let errors = validateStage(stage).errors;
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
    if (!bridges.length) return new Set();
    errors = validateStage({ ...stage, platforms: [...stage.platforms, ...bridges] } as GeneratedStage).errors;
    if (!reachesExit(errors)) return new Set();
    spans = bridges.map((b) => [b.x - 60, b.x + b.width + 60]);
  }
  const ids = new Set<number>();
  for (const e of errors) {
    const m = e.match(OUT_OF_REACH);
    if (!m) continue;
    const c = stage.collectibles.find((x) => x.id === Number(m[1]));
    if (c && spans.some(([a, b]) => c.x > a && c.x < b)) continue;
    ids.add(Number(m[1]));
  }
  return ids;
}

/** the petal trail on a built stage (changed and returned) */
export function petalPass<T extends GeneratedStage>(stage: T, out?: PetalOut): T {
  const o: PetalOut = out ?? ({} as PetalOut);
  petalTrail(stage, unreachablePickups(stage), o);
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
  const b = busiestScreen(petals);
  if (b.n > PER_SCREEN) errors.push(`${b.n} petals on one screen at x=${Math.round(b.x)} (at most ${PER_SCREEN})`);
  return errors;
}
