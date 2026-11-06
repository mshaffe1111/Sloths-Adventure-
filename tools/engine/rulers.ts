/**
 * The rulers stage.ts judges a gen2 stage with, where the old era's did not measure it (the lead's 12:15 and 12:49 PM rulings, 11-06,
 * each replacement with its evidence and a planted failure: tools/engine/rulers.test.ts). Pure: stage.ts gathers the runs and the
 * stages, these say what breaks.
 */
import type { Platform, Rope } from '../../src/game/types.ts';
import { splitsOf } from '../../src/game/passLines.ts';
import { distinctness } from '../../src/game/stageVariety.ts';

/** what a first-timer bot run says, for the required-move gate */
export interface BotSays { end: string; reachX: number; rescueXs: readonly number[]; softFallXs: readonly number[] }
const inside = (xs: readonly number[], x0: number, x1: number) => xs.filter((x) => x >= x0 && x <= x1);

/**
 * The required-move gate on a teach or test node (NODES §1; the lead 12:49 PM): the bot without the node's move must FAIL the node, and
 * a run it got through only by the bot's rescue or a soft fall inside the node did not pass it (the first-timer bot is put further on
 * after falling back three times: firsttimer.ts rescue(); on Roll A the bot without the double "passed" the double teach on 4 rescues
 * and 7 soft falls, never crossing a gap). The full bot must clear the node, and a TEACH without a rescue (a teach the first-timer only
 * gets past by being carried teaches nothing).
 */
export function requiredMoveBreaches(node: { job: 'teach' | 'test'; move: string; x0: number; x1: number }, full: BotSays, lim: BotSays): string[] {
  const out: string[] = [];
  const at = `${node.job} ${node.move}, x ${Math.round(node.x0)}-${Math.round(node.x1)}`;
  const fullOK = full.end === 'shrine' || full.reachX >= node.x1;
  if (!fullOK) out.push(`${at}: the full bot stopped at x ${full.reachX}, before the node's end`);
  const fullRescued = inside(full.rescueXs, node.x0, node.x1);
  if (node.job === 'teach' && fullRescued.length) out.push(`${at}: the full bot was rescued in the teach (x ${fullRescued.join(', ')}): it does not clear it`);
  const carried = [...inside(lim.rescueXs, node.x0, node.x1), ...inside(lim.softFallXs, node.x0, node.x1)];
  const limPassed = (lim.end === 'shrine' || lim.reachX >= node.x1) && !carried.length;
  if (limPassed) out.push(`${at}: a bot without ${node.move} gets past it on its own (reached x ${lim.reachX}): the ${node.move} is not required`);
  return out;
}

/**
 * Splits over the tops he can reach (the lead 12:15, (a)): passLines' splits counted every standable top, and old 1-1's bough decks he
 * cannot reach made 36 of its splits (7 when only reachable tops count; its two-road share 0.608 -> 0.249).
 */
export function reachableSplits(st: { platforms: Platform[]; ropes?: Rope[] }, reachable: ReadonlySet<number>): { splits: number; twoRoad: number } {
  return splitsOf({ ...st, platforms: st.platforms.filter((p) => reachable.has(p.id)) });
}
/** 1-1's reference over reachable tops, measured on old 1-1 (main 68b31e66, 16 layouts, Normal): the median. Two-road is reported only
 *  for 1-1 (the designer and the lead, 12:00: 1-1 is one rising climb, roads are 1-2's) */
export const REACHABLE_REF: Readonly<Record<string, { splitsMin: number; twoRoadReport: number }>> = { '1-1': { splitsMin: 7, twoRoadReport: 0.249 } };

/**
 * New against old (the lead 12:15, (b)): the cosine of era's h:J action tokens was retired as the variety judge (11-05), and it measured
 * how ALIKE the new plays the old. The new stage replaces the old only if each new roll differs from old's rolls at least as much as
 * old's rolls differ from each other: its mean pieces distinctness (stageVariety.ts, 3-grams) against old's rolls >= old's own spread.
 */
export function againstOldBreaches(newRolls: ReadonlyArray<{ id: string; tokens: readonly string[] }>, oldRolls: ReadonlyArray<readonly string[]>, spread: number): string[] {
  return newRolls.flatMap((r) => {
    const d = distinctness([r.tokens, ...oldRolls]).perRoll[0];
    return d < spread ? [`${r.id}: differs from old's rolls by ${d.toFixed(3)} (pieces), under old's own spread ${spread}`] : [];
  });
}

/** the length of a gen2 stage (the lead 12:15, (c); Matt: "at least 2:00, no cap"): the pipeline's own floors, never a band's ceiling */
export function lengthBreaches(m: { typical: number; fast: number }, floors: { target: number; fastFloor: number }, label: string): string[] {
  const out: string[] = [];
  if (m.typical < floors.target) out.push(`${label}: typical ${m.typical.toFixed(0)} s under the floor ${floors.target.toFixed(0)} s`);
  if (m.fast < floors.fastFloor) out.push(`${label}: fast ${m.fast.toFixed(0)} s under the floor ${floors.fastFloor.toFixed(1)} s`);
  return out;
}
