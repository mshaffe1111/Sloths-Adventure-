/**
 * skills — abilities Pokey learns by clearing particular stages, and uses for the rest of the game.
 *
 * A skill is never stored on its own: it is worked out from which stages have been cleared, so old saves, backups and
 * New Game all stay right with no extra bookkeeping. The level builder and the beatability check use the same table:
 *
 *  - a stage may REQUIRE a skill (the only way across a gap) only from `requiredFromStage` on. Stages unlock in order, so
 *    anyone who reaches that stage has cleared `unlockedBy` and has the skill;
 *  - before that, a skill can only add OPTIONAL extras (bonus routes), and the stage must be finishable without them.
 */

export type SkillId = 'shimmy' | 'glide';

export interface SkillDef {
  id: SkillId;
  name: string;
  /** one sentence for the new-skill card */
  blurb: string;
  /** controls shown on the new-skill card, as [keys, what they do] */
  controls: Array<[string[], string]>;
  /** clearing this stage teaches the skill */
  unlockedBy: string;
  /** the first stage that may need the skill to get across */
  requiredFromStage: string;
}

export const SKILLS: SkillDef[] = [
  {
    id: 'shimmy',
    name: 'Shimmy Rope',
    blurb: 'Grab a rope and creep across, hand over hand. Ropes stretch over gaps the jungle used to make impossible.',
    controls: [
      [['Jump'], 'up into a rope to grab it'],
      [['←', '→'], 'shimmy along it'],
      [['Down', 'Jump'], 'to let go'],
    ],
    unlockedBy: '1-3',
    requiredFromStage: '1-4',
  },
  {
    id: 'glide',
    name: 'Leaf Glide',
    blurb: 'Hold Jump while falling to open a big leaf and drift down slowly, a long way out over the drop. Some drops ahead are too wide to cross without it.',
    controls: [
      [['Jump'], 'then hold Jump as you start to fall'],
      [['←', '→'], 'steer while you drift'],
      [['Let go'], 'to drop normally'],
    ],
    // learned at the start of Act II, when the ledge gives way in World 4 (stagePlan.ts: 4-1 The Broken Ledge, then 4-2 First Glide)
    unlockedBy: '4-1',
    // 4-7 The Long Drop is the first stage with a drop only the leaf can cross (the beatability check simulates the glide, physics.ts)
    requiredFromStage: '4-7',
  },
];

export const SKILL_BY_ID: Record<SkillId, SkillDef> = Object.fromEntries(SKILLS.map((s) => [s.id, s])) as Record<SkillId, SkillDef>;

/** "4-7" -> 37 (world 4, stage 7): the position of a stage in the game, from 1 */
export function missionOf(stageId: string): number {
  const m = /^(\d{1,2})-(\d{1,2})$/.exec(stageId);
  return m ? (Number(m[1]) - 1) * 10 + Number(m[2]) : 0;
}

/** the skills a player has, given which stages they have cleared */
export function skillsFrom(isCleared: (stageId: string) => boolean): Set<SkillId> {
  return new Set(SKILLS.filter((s) => isCleared(s.unlockedBy)).map((s) => s.id));
}

/** the stage (by its place in the game) may need this skill: everyone who gets there has it */
export function skillGuaranteedAt(skill: SkillId, mission: number): boolean {
  return mission >= missionOf(SKILL_BY_ID[skill].requiredFromStage);
}

/** everyone who gets to this stage has learned the skill (stages unlock in order), though the stage may not yet rely on it */
export function skillHeldAt(skill: SkillId, mission: number): boolean {
  return mission > missionOf(SKILL_BY_ID[skill].unlockedBy);
}

/** cleared stages as saved on this device (`sloth_lvl_<id>` holds { completed: true, ... }) */
function clearedInStorage(stageId: string): boolean {
  try {
    const raw = localStorage.getItem(`sloth_lvl_${stageId}`);
    return !!raw && !!JSON.parse(raw)?.completed;
  } catch {
    return false;
  }
}

/**
 * The skills the player has right now on this device. `?skills=all` (for testing) gives every skill.
 * A stage that needs a skill always counts as having it (it can only be reached after the unlocking stage).
 */
export function learnedSkills(stageId?: string): Set<SkillId> {
  try {
    if (new URLSearchParams(window.location.search).get('skills') === 'all') return new Set(SKILLS.map((s) => s.id));
  } catch {
    /* no window */
  }
  const have = skillsFrom(clearedInStorage);
  if (stageId) {
    const at = missionOf(stageId);
    for (const s of SKILLS) if (skillGuaranteedAt(s.id, at)) have.add(s.id);
  }
  return have;
}

/** skills that clearing `stageId` teaches for the first time, given what the player had before (for the new-skill card) */
export function newlyLearned(stageId: string, before: Set<SkillId>): SkillDef[] {
  return SKILLS.filter((s) => s.unlockedBy === stageId && !before.has(s.id));
}
