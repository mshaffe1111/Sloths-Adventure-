/**
 * The world notices what you did (2026-10-29 story report, "Playing it like an RPG"): a line that is only said when the player found
 * something (`ifFound`), and the General counting the player's real falls (`withFalls`, only once there is one). Nothing branches: the
 * story is the same, it just notices.
 */
import type { StoryPanel } from './story.ts';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
  'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** how the General says a count: in words up to ninety-nine, and past that "more than a hundred" (so it never reads as a stat dump) */
export function fallsWords(n: number): string {
  if (n > 99) return 'more than a hundred';
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** the panels as this player hears them: the noticed lines for what they found, the falls counted when there are any */
export function noticed(panels: StoryPanel[], found: readonly string[], falls: number): StoryPanel[] {
  return panels
    .filter((p) => !p.ifFound || found.includes(p.ifFound))
    .map((p) => {
      if (!p.withFalls || falls <= 0) return p;
      const n = fallsWords(falls);
      // ({N} at the start of a sentence is capitalized)
      const text = p.withFalls.replace(/(^|[.!?]\s+)\{N\}/g, (_m, pre: string) => pre + cap(n)).replace(/\{N\}/g, n);
      return { ...p, text };
    });
}
