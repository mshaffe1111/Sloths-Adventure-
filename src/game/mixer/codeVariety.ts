/**
 * The node-code variety lines (the lead, 11-05: Matt compares rolls as strings). A roll's realised code is gen2's meta.gen2.code (one
 * token per node, the planner's parser writes it); these read the tokens as given, never parse them.
 *   - distinct tokens: how many different tokens a roll holds;
 *   - 3-gram overlap: the share of two rolls' token 3-grams they have in common (Jaccard), between rolls of a stage and against a
 *     neighbour stage's rolls.
 */
export const distinctTokens = (code: readonly string[]) => new Set(code).size;
const grams = (code: readonly string[]) => new Set(code.slice(2).map((_, i) => `${code[i]} ${code[i + 1]} ${code[i + 2]}`));
export function gramOverlap(a: readonly string[], b: readonly string[]): number {
  const A = grams(a), B = grams(b);
  if (!A.size && !B.size) return 0;
  let both = 0;
  for (const g of A) if (B.has(g)) both++;
  return both / (A.size + B.size - both);
}
/** the overlap of every pair from one list of rolls (or between two lists): its mean and its worst pair */
export function overlapSummary(a: ReadonlyArray<readonly string[]>, b?: ReadonlyArray<readonly string[]>): { mean: number; max: number; pairs: number } {
  const xs: number[] = [];
  if (b) for (const p of a) for (const q of b) xs.push(gramOverlap(p, q));
  else for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) xs.push(gramOverlap(a[i], a[j]));
  return { mean: xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0, max: xs.length ? Math.max(...xs) : 0, pairs: xs.length };
}
