// What the help ladder would grow, on every listed 1-1 seed and both settings (R-165.62 attempt 3; the Critic's find on 324cd3cc and
// the lead's ruling 11-11): at every piece, every grown rock stands on something (ground, a log or the rock below it: never in the air)
// and no face is taller than 60 px (a plain jump clears it). Planks (pads) may float (Matt, 11-06). The checker is the test's own,
// independent of the code it checks, so the same file judges 324cd3cc (the red: 60x118 boxes in the air over the floor).
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { withPlaySeed } from './testlink1_1.ts';
import { setDifficulty } from './difficulty.ts';
import { PROVEN_SEEDS } from './gen2/provenSeeds.ts';
import type { Platform } from './types.ts';
import * as ladder from './helpLadder.ts';

type Box = { x: number; y: number; width: number; height: number; plank?: boolean };
type Eng = { currentStage: { meta: { pieces: Array<{ k: string; x0: number; x1: number }> } }; stepBoxes(p: { k: string; x0: number; x1: number }): Box[] };

/** every breach at one built stage: "<piece>: <what>" */
export function breaches(platforms: readonly Platform[], boxes: Box[]): string[] {
  const out: string[] = [];
  // (planks are marked and may float; every other grown box is a rock)
  const rocks = boxes.filter((b) => !b.plank);
  const stand = [...platforms.filter((p) => (p.type === 'solid' || p.type === 'bouncy') && !p.broken), ...rocks];
  for (const r of rocks) {
    const foot = r.y + r.height;
    // (stands: the tops at its foot cover its whole width)
    // (on a top at its foot, or with that part inside a solid piece's body: a rock may take in a narrow stump; never over air)
    const under = stand.filter((q) => q !== r && q.x < r.x + r.width && q.x + q.width > r.x && (Math.abs(q.y - foot) <= 2 || (q.y < foot - 2 && q.y + q.height >= foot - 2)));
    let covered = r.x;
    for (const q of [...under].sort((a, b) => a.x - b.x)) if (q.x <= covered + 1) covered = Math.max(covered, q.x + q.width);
    if (covered < r.x + r.width - 1) out.push(`a rock at x ${Math.round(r.x)} top ${Math.round(r.y)} floats (its foot ${Math.round(foot)} stands on ${Math.round(covered - r.x)} of ${r.width} px)`);
    // (its face: from the top just left of it, the nearest one at or below its own top)
    const left = stand.filter((q) => q !== r && q.x < r.x - 0.5 && q.x + q.width >= r.x - 0.5 && q.y >= r.y - 2 && q.y <= foot + 2);
    const from = left.length ? Math.min(...left.map((q) => q.y)) : foot;
    if (from - r.y > 60.5) out.push(`a rock at x ${Math.round(r.x)} has a ${Math.round(from - r.y)} px face`);
  }
  return out;
}

const seeds = PROVEN_SEEDS['1-1'].seeds;
for (const setting of ['easy', 'normal'] as const) {
  test(`every listed 1-1 seed on ${setting}: every grown rock stands on something and no face is over 60 px`, () => {
    setDifficulty(setting);
    const bad: string[] = [];
    let rocks = 0;
    try {
      // (the listed seeds, then the two raw seeds the Critic named: 1 and 7)
      const runs: Array<[string, () => RealPlay]> = [...seeds.map((sd, i) => [String(sd), () => new RealPlay('1-1', i + 1)] as [string, () => RealPlay]), ...[1, 7].map((sd) => [`raw ${sd}`, () => withPlaySeed(sd, () => new RealPlay('1-1', 1))] as [string, () => RealPlay])];
      for (const [name, make] of runs) {
        const r = make();
        const e = r.e as unknown as Eng;
        for (const pc of e.currentStage.meta.pieces) {
          const boxes = e.stepBoxes(pc);
          rocks += boxes.filter((b) => !b.plank).length;
          for (const b of breaches(r.platforms, boxes)) bad.push(`seed ${name} ${pc.k}: ${b}`);
        }
      }
    } finally {
      setDifficulty('normal');
    }
    assert.ok(rocks > 0, 'the sweep grew rocks');
    // (rises with no room for a whole stair grow nothing: how many, for the report)
    const left = 'takeStairsLeftOut' in ladder ? (ladder as { takeStairsLeftOut(): number }).takeStairsLeftOut() : 0;
    console.log(`# ${setting}: ${rocks} rocks over ${seeds.length} seeds; ${left} rises left without a stair (no room)`);
    assert.deepEqual(bad.slice(0, 12), [], `${bad.length} breaches over ${seeds.length} seeds (${rocks} rocks)`);
  });
}
