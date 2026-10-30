/**
 * The one line on a guardian's card before the fight (polish-c's BossCards.tsx, BOSS_DOT_LINE), under Dot's rules (the Dot rework,
 * 2026-10-29): under 10 words, the thumb move or the thing to watch, and said by whoever is with Pokey. Dot is away for World 6's
 * second half, all of World 7 and World 10 (wayside.ts dotPresent), so those cards are Pokey's own thought, never Dot's.
 * BossCards.tsx takes its line from here once polish-c and polish-dot meet.
 */
import { dotPresent } from './wayside.ts';

/** by world (11: Thornbark's secret Hollow) */
export const BOSS_CARD_TEXT: Readonly<Record<number, string>> = {
  1: 'When the floor flashes, get off it!',
  2: 'He rolls hard. Hit him while he is dizzy.',
  3: 'He fades away. Turn and find him!',
  4: 'Stay close to the rocks, Pokey.',
  5: 'Jump the venom, then hit what glows.',
  6: 'Low sweep, jump. High swipe, duck.',
  7: 'Jump the hammer, then hit what glows.',
  8: 'Low rings, jump. High rings, stay down.',
  9: 'Fire comes at chest height. Duck or jump!',
  10: 'The last giant. Hit whatever glows!',
  11: 'He copies you. Wait for the red glow.',
};

/** the card's line and who says it: Dot, or Pokey when she is away (the guardian is each world's tenth stage) */
export function bossCardLine(world: number, secret = false): { who: 'Dot' | 'Pokey'; text: string } {
  const key = secret ? 11 : world;
  const text = BOSS_CARD_TEXT[key] ?? 'Watch for the red glow.';
  return { who: secret || dotPresent(world, 10) ? 'Dot' : 'Pokey', text };
}
