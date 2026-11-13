/**
 * What a stage's goal is, in the new HUD's words and pictures: the counter's icon, and the stage-start goal card's line
 * ("This stage: collect 33 petals"). Pure, so it is tested without a screen.
 */
import { relicArt } from '../../game/stagePlan.ts';
import { stageFlowers } from '../../game/flowerSprites.ts';
import { MEECA_STAGE_ID } from '../../game/extraStages.ts';

/** the picture for the goal: a painted pickup (src/assets/pickups), a flower from the flower sheet, or a drawn stand-in */
export type GoalIcon =
  | { kind: 'pickup'; name: string }
  | { kind: 'flower'; num: number }
  | { kind: 'drawn'; name: 'idol' | 'foe' | 'cage' | 'door' | 'carving' };

export interface GoalInfo {
  /** 'count': a quota (counter or slots); 'distance': get to the end (the trail); 'boss': the boss bar is the goal; 'none' */
  kind: 'count' | 'distance' | 'boss' | 'none';
  /** the goal card's main line, e.g. "This stage: collect 33 petals" */
  line: string;
  /** the card's second line, e.g. "to open the shrine" */
  sub: string;
  /** the counter's icon */
  icon: GoalIcon;
  /** one icon per slot (small quotas, in stage order where the stage says it) */
  slotIcon: (i: number) => GoalIcon;
  /** the noun for the counter's accessible label ("petals") */
  noun: string;
  /**
   * a collect, rescue or beat-the-animals stage: the counter also shows, small and light, how far along the stage he is (QA v200, 5-3
   * and 5-5 upright: the goal count alone gave no sense of how much was left; and 1-9 and 2-5, 2026-10-28)
   */
  far?: boolean;
  /**
   * a word on the counter before the count (Meeca's stage: "Warnings 1/5"). QA 2026-10-29: "M. 1/5" had no word for what it counts,
   * and her first trail mark (not a warning) read as "my mark didn't count"
   */
  word?: string;
}

interface Cfg {
  id: string;
  worldIndex: number;
  miniIndex: number;
  objectiveType: string;
  targetCount: number;
}

const DIST: Record<string, string> = {
  sprint: 'reach the shrine',
  ascent: 'climb to the top',
  stealth: 'sneak to the end',
  vine_runner: 'swing to the end',
};

function words(world: number, type: string): { verb: string; one: string; many: string } | null {
  if (type === 'harvest') {
    // (one pickup, Meeca's petal, but World 8's night blooms: petals.ts)
    const [one, many] = world === 8 ? ['night bloom', 'night blooms'] : ['petal', 'petals'];
    return { verb: 'collect', one, many };
  }
  if (type === 'relic_hunt') {
    // (World 1's search follows Meeca's marks, 1-5: stagePlan.ts GOAL_WORDS says the same)
    const w = ({ 1: ['mark', 'marks'], 3: ['keepsake', 'keepsakes'], 5: ['message', 'messages'], 9: ['thread', 'threads'] } as Record<number, string[]>)[world] ?? ['relic', 'relics'];
    return { verb: 'find', one: w[0], many: w[1] };
  }
  if (type === 'gauntlet' && world === 4) return { verb: 'beat', one: 'guard', many: 'guards' };
  if (type === 'purge' || type === 'gauntlet') return { verb: 'beat', one: 'predator', many: 'predators' };
  if (type === 'rescue') return { verb: 'free', one: 'animal', many: 'animals' };
  return null;
}

/**
 * What the goal sign shows (R-165.155): the progress TO the goal, stopping at it. A goal can be smaller than what a stage holds (1-3:
 * every trapped snake, the bare-branch ones optional), and clears past it count nowhere visible: "11/10" reads as a bug. A count goal
 * only (target over 0); anything else is shown as it is.
 */
export const goalShown = (cur: number, target: number): number => (target > 0 ? Math.min(cur, target) : cur);

/** a creature's word on the card, by its id (the stage's data: engine.ts goalCreature): one, or the plural ("harpy" -> "harpies") */
export function creatureNoun(id: string, n: number): string {
  const one = id.replace(/_/g, ' ');
  if (n === 1) return one;
  if (/[^aeiou]y$/.test(one)) return `${one.slice(0, -1)}ies`;
  if (/(s|x|ch|sh)$/.test(one)) return `${one}es`;
  return `${one}s`;
}

/**
 * `creature`: the stage's own animal (engine.ts goalCreature), for a purge's card, the story keeper's line (the lead, 11-12): "This
 * stage: send 13 snakes on their way" / "to open the shrine." ("send 1 boa on its way"). Before the stage has said which, "animals"
 */
export function goalInfo(cfg: Cfg, dotStage = false, creature?: string): GoalInfo {
  const type = cfg.objectiveType;
  const w = cfg.worldIndex;
  if (cfg.id === MEECA_STAGE_ID) {
    // Meeca's stage counts her warnings: a scrap of bark with "M." scratched on it, "1/5" (the approved mock-ups)
    const icon: GoalIcon = { kind: 'drawn', name: 'carving' };
    return { kind: 'count', line: `This stage: carve ${cfg.targetCount} warnings`, sub: 'for Pokey to find', icon, slotIcon: () => icon, noun: 'warnings', word: 'Warnings' };
  }
  if (type === 'boss_lair') {
    const icon: GoalIcon = { kind: 'drawn', name: 'foe' };
    return { kind: 'boss', line: '', sub: '', icon, slotIcon: () => icon, noun: '' };
  }
  if (dotStage) {
    const icon: GoalIcon = { kind: 'drawn', name: 'door' };
    return { kind: 'distance', line: 'This stage: fly to the gap', sub: '', icon, slotIcon: () => icon, noun: '' };
  }
  if (type in DIST) {
    const icon: GoalIcon = { kind: 'drawn', name: 'door' };
    return { kind: 'distance', line: `This stage: ${DIST[type]}`, sub: '', icon, slotIcon: () => icon, noun: '' };
  }
  const g = words(w, type);
  if (!g || cfg.targetCount <= 0) {
    const icon: GoalIcon = { kind: 'drawn', name: 'door' };
    return { kind: 'none', line: '', sub: '', icon, slotIcon: () => icon, noun: '' };
  }
  const n = cfg.targetCount;
  const purge = type === 'purge';
  const noun = purge ? creatureNoun(creature ?? 'animal', n) : n === 1 ? g.one : g.many;
  const line = purge ? `This stage: send ${n} ${noun} on ${n === 1 ? 'its' : 'their'} way` : `This stage: ${g.verb} ${n} ${noun}`;
  let icon: GoalIcon;
  let slotIcon: (i: number) => GoalIcon;
  if (type === 'harvest') {
    icon = w !== 8 ? { kind: 'pickup', name: 'petal' } : { kind: 'flower', num: stageFlowers(w, cfg.miniIndex)[0] };
    slotIcon = () => icon;
  } else if (type === 'relic_hunt') {
    // (her marks, World 1's search: Meeca's carved bark scrap, the painted 'carving', never the stone idol)
    const none: GoalIcon = w === 1 ? { kind: 'drawn', name: 'carving' } : { kind: 'drawn', name: 'idol' };
    const art = relicArt(w, 0);
    icon = art ? { kind: 'pickup', name: art } : none;
    slotIcon = (i) => {
      const a = relicArt(w, i);
      return a ? { kind: 'pickup', name: a } : none;
    };
  } else if (type === 'rescue') {
    icon = { kind: 'drawn', name: 'cage' };
    slotIcon = () => icon;
  } else {
    icon = { kind: 'drawn', name: 'foe' };
    slotIcon = () => icon;
  }
  // (a beat-the-animals stage too: 1-9's and 2-5's counters showed no sense of how much stage was left, QA 2026-10-28)
  return { kind: 'count', line, sub: purge ? 'to open the shrine.' : 'to open the shrine', icon, slotIcon, noun: purge ? noun : g.many, far: type === 'harvest' || type === 'rescue' || type === 'purge' || type === 'gauntlet' };
}
