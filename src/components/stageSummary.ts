import type { StageStats } from '../game/badges.ts';

/** how many foes were knocked out in the stage */
export function totalKills(s: StageStats | null | undefined): number {
  if (!s) return 0;
  return Object.values(s.kills).reduce((a, b) => a + b, 0);
}

export interface FloraChip {
  /** "Flower goal" on a gather stage, "Flowers" elsewhere */
  label: string;
  cur: number;
  of: number;
  /** the goal met, or every flower picked */
  full: boolean;
}

/**
 * The Flowers chip, the same on every card (UI-10): it counts what the HUD's bar counted during the stage. On a gather stage that is
 * the flowers picked against the goal (the bar said 107 and the out-of-lives card "1/122", QA 2-2, 2026-10-28; the win card showed
 * the stage's total, so the one chip meant two things); elsewhere, every flower the stage holds. Null when there are none.
 */
export function floraChip(s: StageStats | null | undefined): FloraChip | null {
  if (!s) return null;
  if (s.floraGoal) return { label: 'Flower goal', cur: s.floraGoal.cur, of: s.floraGoal.target, full: s.floraGoal.cur >= s.floraGoal.target };
  return s.floraTotal > 0 ? { label: 'Flowers', cur: s.floraCollected, of: s.floraTotal, full: s.floraCollected >= s.floraTotal } : null;
}

export interface Praise {
  /** a few words, shown big */
  title: string;
  /** one short line under it */
  sub: string;
}

/**
 * What the stage-cleared card says about how the stage went. The first rule that fits wins, best news first,
 * so a player is told the nicest true thing about their run (never a scolding).
 */
export function praiseFor(s: StageStats | null | undefined, stars: number): Praise {
  if (!s) return stars >= 3 ? { title: 'Splendid!', sub: 'Three stars. Pokey is very pleased.' } : { title: 'Made it!', sub: 'One stage closer to Meeca.' };
  const allFlora = s.floraTotal > 0 && s.floraCollected >= s.floraTotal;
  if (s.livesLost === 0 && s.heartsLost === 0 && allFlora) return { title: 'Flawless!', sub: 'Every flower gathered, not a scratch.' };
  if (allFlora) return { title: 'Green thumb!', sub: 'Every last flower, gathered.' };
  if (s.livesLost === 0 && s.heartsLost === 0) return { title: 'Not a scratch!', sub: 'Pokey got through without a single bump.' };
  if (s.maxCombo >= 5) return { title: 'Combo king!', sub: `A chain of ${s.maxCombo} hits. Pokey surprised himself.` };
  if (totalKills(s) >= 6) return { title: 'Foe flattener!', sub: `${totalKills(s)} troublemakers sent home.` };
  if (s.livesLost > 0) return { title: 'Back on your feet!', sub: 'You fell, you climbed back up, you finished. That is the whole game.' };
  if (stars >= 3) return { title: 'Splendid!', sub: 'Three stars. Pokey is very pleased.' };
  return { title: 'Slow and steady!', sub: 'The sloth way, and it works.' };
}

const TUCKERED = [
  'Even sloths fall out of trees. The trick is climbing back up.',
  'Pokey is having a lie-down. He says it is on purpose.',
  'That one got the better of you. It will not do it twice.',
  'Meeca believes in you. So does Dot. Dot is just louder about it.',
  'Breathe. Tighten the satchel strap. Go again.',
  'Slow and steady took a tumble. Slow and steady goes again.',
];

/** the encouraging line on the game-over card, the same for the same stage so it does not flicker */
export function tuckeredLine(levelId: string): string {
  let h = 0;
  for (let i = 0; i < levelId.length; i++) h = (h * 31 + levelId.charCodeAt(i)) >>> 0;
  return TUCKERED[h % TUCKERED.length];
}
