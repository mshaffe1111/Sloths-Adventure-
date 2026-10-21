/**
 * When each letter appears. 26 ms a letter, plus a breath where a person would take one: a beat after a sentence ends (so a punchline
 * or a hard truth gets its moment before the next sentence starts) and a longer one after "..." (a hesitation). Tapping still skips ahead.
 */
export function typeSchedule(text: string): number[] {
  const at: number[] = new Array(text.length);
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    t += 26;
    at[i] = t;
    const c = text[i];
    const next = text[i + 1];
    const boundary = next === undefined || next === ' ' || next === '"' || next === '”';
    if (c === '…') t += 320;
    else if (c === '.' && next !== '.') {
      const ellipsis = text[i - 1] === '.' && text[i - 2] === '.';
      if (ellipsis) t += 320;
      else if (boundary) t += 170;
    } else if ((c === '!' || c === '?') && boundary) t += 170;
    else if ((c === ',' || c === ';' || c === ':') && next === ' ') t += 50;
  }
  return at;
}
