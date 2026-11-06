/**
 * Two of 1-1's story promises, as checks any build can be judged by (Round 6, the supervisor's PASS, the lead 11-05 9:40 PM):
 *   - V19b, the floor rises into the canopy: the end log stands higher than the route where the bough window begins (the stage's last
 *     third, BOUGH_WINDOW 0.67), so net-zero versions may not stack up and flatten the climb;
 *   - the seed: the golden seed more than 200 px over the ground under it (past a double) with a mushroom within 260 px below it
 *     (stage11.test.ts's promise, the seed perch's low version included).
 */
import type { Platform } from './types.ts';

interface StageLike { platforms: readonly Platform[]; collectibles: ReadonlyArray<{ type: string; x: number; y: number }>; exitTotemX: number; exitTotemY: number; spawnX?: number }

/** where the bough window begins: this share of the way from the spawn to the exit */
export const WINDOW_AT = 0.67;

/** V19b: the route's height where the bough window begins (the highest standable piece there: the strictest reading) and the end log's */
export function endAboveWindow(st: StageLike): { windowX: number; windowY: number; endY: number; pass: boolean } {
  const x0 = st.spawnX ?? 0, windowX = Math.round(x0 + WINDOW_AT * (st.exitTotemX - x0));
  const at = st.platforms.filter((p) => !p.broken && p.type !== 'bouncy' && !(p as { catch?: boolean }).catch && windowX >= p.x && windowX <= p.x + p.width);
  const windowY = at.length ? Math.min(...at.map((p) => p.y)) : NaN;
  return { windowX, windowY, endY: Math.round(st.exitTotemY), pass: Number.isFinite(windowY) && st.exitTotemY < windowY };
}

/** the seed's promise: every breach by name (empty: kept; no seed is a breach) */
export function seedPromise(st: StageLike): string[] {
  const seeds = st.collectibles.filter((c) => c.type === 'seed');
  if (seeds.length !== 1) return [`${seeds.length} golden seeds (one)`];
  const s = seeds[0];
  const out: string[] = [];
  const ground = st.platforms.filter((p) => p.type === 'solid' && p.height >= 90 && s.x >= p.x - 200 && s.x <= p.x + p.width + 200 && p.y > s.y).sort((a, b) => a.y - b.y)[0];
  if (!ground || ground.y - s.y <= 200) out.push(`the seed at x ${Math.round(s.x)} is ${ground ? Math.round(ground.y - s.y) : 'over no'} px over the ground (more than 200)`);
  if (!st.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - s.x) < 260 && p.y > s.y)) out.push(`no mushroom within 260 px below the seed at x ${Math.round(s.x)}`);
  return out;
}

/** a text id (dot.separated, no spaces: "hint.1-1.double", "coach.nice"): never words a player should see */
const RAW_ID = /^[a-z][\w-]*(\.[\w-]+)+$/i;
/**
 * What the player sees (the red team, RT-ENGINE.md #1, 11-05: Dot said "hint.1-1.double" on gen2 rolls): every line the stage will put on
 * screen (its hints: Dot's stage lines, each with its pad and keys wording) is words, never a raw text id. Empty: all words
 */
export function rawTextIds(st: { proto?: { hints?: ReadonlyArray<{ x: number; text: string; pad?: string; keys?: string }> } }): string[] {
  const out: string[] = [];
  for (const h of st.proto?.hints ?? []) {
    for (const [k, v] of [['text', h.text], ['pad', h.pad], ['keys', h.keys]] as const) {
      if (typeof v === 'string' && RAW_ID.test(v.trim())) out.push(`Dot's line at x ${Math.round(h.x)} shows the raw id "${v}" (${k}), not words`);
    }
  }
  return out;
}

/** a teach's lines, by the move its node's token teaches (gen2 node tokens: T + content + the move's digit, 1 a jump, 2 a double) */
const TEACH_WORDS: Record<string, string[]> = { '1': ['coach.jump', 'hint.1-1.gaps'], '2': ['coach.nice', 'hint.1-1.double'] };
/**
 * TT4 (Round 7, the designer 11-06): on a gen2 stage, every teach node's line is said before the first piece that needs its move: its
 * block where the node has one, else its first gap (a piece more than 40 px past the route's reach so far; for the double also a rise past a single jump). `words(id)` gives a line's words
 * as a hint carries them. Empty: every teach in order
 */
export function teachOrder(st: { platforms: readonly Platform[]; proto?: { hints?: ReadonlyArray<{ x: number; text: string }> }; gen2?: { nodes?: ReadonlyArray<{ token: string; x0: number; x1: number; block?: number }> } }, words: (id: string) => string | undefined): string[] {
  const out: string[] = [];
  for (const n of st.gen2?.nodes ?? []) {
    const m = /^T\w*?([12])/.exec(n.token);
    if (!m) continue;
    const texts = TEACH_WORDS[m[1]].map(words).filter((t): t is string => !!t);
    const said = (st.proto?.hints ?? []).filter((h) => texts.includes(h.text) && h.x >= n.x0 - 40 && h.x <= n.x1).map((h) => h.x);
    let need = n.block;
    if (need === undefined) {
      const ps = st.platforms.filter((p) => !p.broken && p.type !== 'bouncy' && p.x + p.width > n.x0 && p.x < n.x1).sort((a, b) => a.x - b.x);
      // (a gap past the route's reach, or for the double a rise past a single jump's, 112 px: a bank a double away up)
      let reach = ps[0] ? ps[0].x + ps[0].width : n.x0, lastY = ps[0]?.y ?? 0;
      for (const p of ps.slice(1)) { if (p.x > reach + 40 || (m[1] === '2' && p.y < lastY - 112 && p.width >= 60)) { need = p.x > reach + 40 ? reach : p.x; break; } reach = Math.max(reach, p.x + p.width); if (p.width >= 60) lastY = p.y; }
    }
    if (!said.length) out.push(`${n.token} at x ${Math.round(n.x0)}: no teach line said in it`);
    else if (need !== undefined && Math.min(...said) >= need) out.push(`${n.token}: its line at x ${Math.round(Math.min(...said))} comes after the first piece that needs the move (x ${Math.round(need)})`);
  }
  return out;
}
