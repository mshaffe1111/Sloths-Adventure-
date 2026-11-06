/**
 * The cadence check (NODES.md §3 `rating`, R1 L4: SMBF's and Shovel Knight's cadence, ramp up then cool down): a stage's section
 * ratings, slot by slot, must ramp and cool, never sit flat. The lead's line (11-05): fail on a flat run like gen2's 6-7 from slot 3 on.
 *
 * The numbers are the porter's JUDGMENT, for the designer to rule: a flat run is FLAT_RUN slots in a row, from slot 3 on, whose
 * ratings span at most FLAT_SPAN; a peak (a rating of at least PEAK, higher than the slot after it) must cool by at least COOL within
 * COOL_WITHIN slots; and the stage's hardest slot comes after its first third (the ramp).
 */
export const CADENCE = { FLAT_RUN: 4, FLAT_SPAN: 1, FROM_SLOT: 3, PEAK: 4, COOL: 2, COOL_WITHIN: 2 } as const;

/** every cadence breach in a stage's ratings (slot order), each naming the slots (1-based) */
export function cadenceBreaches(r: readonly number[], C = CADENCE): string[] {
  const out: string[] = [];
  for (let i = C.FROM_SLOT - 1; i + C.FLAT_RUN <= r.length; i++) {
    const w = r.slice(i, i + C.FLAT_RUN);
    if (Math.max(...w) - Math.min(...w) <= C.FLAT_SPAN) { out.push(`flat: slots ${i + 1}-${i + C.FLAT_RUN} rate ${w.join(', ')} (a span of ${Math.max(...w) - Math.min(...w)})`); break; }
  }
  for (let i = 0; i < r.length - 1; i++) {
    const peak = r[i] >= C.PEAK && r[i] > r[i + 1] && (i === 0 || r[i] >= r[i - 1]);
    if (!peak) continue;
    const after = r.slice(i + 1, i + 1 + C.COOL_WITHIN);
    if (!after.some((x) => x <= r[i] - C.COOL)) out.push(`no cool-down: slot ${i + 1} peaks at ${r[i]}, and the next ${after.length} rate ${after.join(', ')}`);
  }
  const top = r.indexOf(Math.max(...r));
  if (r.length >= 3 && top < Math.floor(r.length / 3)) out.push(`no ramp: the hardest slot (${top + 1}, rating ${r[top]}) is in the first third`);
  return out;
}
