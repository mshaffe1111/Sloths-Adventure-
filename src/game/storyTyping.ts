/**
 * When each letter appears. `ms` a letter (each speaker types at their own pace: voiceLine.ts typeMs; 26 when not given), plus a breath where a person would take one: a beat after a sentence ends (so a punchline
 * or a hard truth gets its moment before the next sentence starts) and a longer one after "..." (a hesitation). Tapping still skips ahead.
 */
export function typeSchedule(text: string, ms = 26): number[] {
  const at: number[] = new Array(text.length);
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    t += ms;
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

/** how many letters are typed: the count belongs to the picture and page it was typed on, so a new picture (or page) starts at 0 on its
 *  first render, before any effect runs (StoryPlayer: the voice never says a letter of a line that is not on screen yet) */
export function shownFor(at: { idx: number; page: number; n: number }, idx: number, page: number): number {
  return at.idx === idx && at.page === page ? at.n : 0;
}
