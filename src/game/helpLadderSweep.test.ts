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
  // (and on its right: from its tread up to the next top, within a jump's reach ahead of it, no more than 60)
  for (const r of rocks) {
    const ahead = stand.filter((q) => q !== r && q.x + q.width > r.x + r.width - 0.5 && q.x <= r.x + r.width + 120 && q.y < r.y - 2 && q.y > r.y - 200);
    if (!ahead.length) continue;
    const next = Math.max(...ahead.map((q) => q.y));
    if (r.y - next > 60.5) out.push(`a rock at x ${Math.round(r.x)} top ${Math.round(r.y)}: the next top ahead is ${Math.round(r.y - next)} px up`);
  }
  // (no two grown boxes share any space: two stairs laid over each other made a 160 px tread across two rocks, the Critic's find)
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], c = boxes[j];
    if (a.x < c.x + c.width - 0.5 && c.x < a.x + a.width - 0.5 && a.y < c.y + c.height - 0.5 && c.y < a.y + a.height - 0.5) out.push(`grown boxes at x ${Math.round(a.x)} and ${Math.round(c.x)} overlap`);
  }
  // (no rock sunk in the stage: a piece over part of it whose top stands above the rock's own top hides its tread; and its foot never
  // below the top of a ledge that runs on past it (a rock may take in a stump wholly inside it, not stand sunk in a ledge: the Critic's
  // find, a rock whose 1 px over lower ground set its foot 63 px down into the ledge under the rest of it)
  for (const r of rocks) for (const q of platforms) {
    if ((q.type !== 'solid' && q.type !== 'bouncy') || q.broken) continue;
    if (!(q.x < r.x + r.width - 0.5 && q.x + q.width > r.x + 0.5)) continue;
    const foot = r.y + r.height;
    if (q.y < r.y - 2 && q.y + q.height > r.y + 2) out.push(`a rock at x ${Math.round(r.x)} top ${Math.round(r.y)} is sunk ${Math.round(r.y - q.y)} px under a piece at x ${Math.round(q.x)}`);
  }
  // (its foot is never sunk in a ledge whose top runs on past it: at either inside edge, the stage's visible top (grown boxes aside)
  // stands above its foot and carries on just outside that edge at the same height: the Critic's find, 63 px into a ledge)
  const solid = platforms.filter((q) => (q.type === 'solid' || q.type === 'bouncy') && !q.broken && !(q as { catch?: boolean }).catch);
  const vis = (x: number) => { let t = Infinity; for (const q of solid) if (x > q.x && x < q.x + q.width && q.y < t) t = q.y; return t; };
  for (const r of rocks) {
    const foot = r.y + r.height;
    for (const [inX, outX] of [[r.x + 1, r.x - 1], [r.x + r.width - 1, r.x + r.width + 1]]) {
      const v = vis(inX);
      if (v > r.y + 2 && v < foot - 2 && Math.abs(vis(outX) - v) <= 2) out.push(`a rock at x ${Math.round(r.x)}: its foot is sunk ${Math.round(foot - v)} px into a ledge (top ${Math.round(v)}) that runs on past it`);
    }
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
      // (the listed seeds, then raw seeds 1-138: the Critic sweeps raw seeds, its finds were at raw 1, 7, 43, 62)
      const runs: Array<[string, () => RealPlay]> = [...seeds.map((sd, i) => [String(sd), () => new RealPlay('1-1', i + 1)] as [string, () => RealPlay]), ...Array.from({ length: 138 }, (_, i) => i + 1).map((sd) => [`raw ${sd}`, () => withPlaySeed(sd, () => new RealPlay('1-1', 1))] as [string, () => RealPlay])];
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
    const kinds = ['floats', 'px face', 'px up', 'overlap', 'sunk'].map((k) => `${k}: ${bad.filter((v) => v.includes(k)).length}`).join(', ');
    const sunk = bad.filter((v) => v.includes('sunk') || v.includes('px up')).slice(0, 6);
    assert.deepEqual([...sunk, ...bad.slice(0, 6)], [], `${bad.length} breaches over ${seeds.length} seeds (${rocks} rocks): ${kinds}`);
  });
}
