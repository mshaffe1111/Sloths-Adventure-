// The row rule shared by trace-check.mjs and the critic's trace: a "research row" is
//  (a) any markdown table row that is not a header or a |---| separator, or
//  (b) a numbered list item ("1. ", "**L3. ", "F2. ") that is not a bare source link (no "http").
// Every such line must have a row in reference/engine/CRITIC-SPEC.md's trace, keyed "<file>:<line>".
import { readFileSync } from 'node:fs';
export function researchRows(text) {
  const lines = text.split('\n');
  const rows = [];
  const sep = (l) => /^\|[\s:|-]+\|\s*$/.test(l);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('|')) {
      if (sep(l)) continue;
      if (i + 1 < lines.length && sep(lines[i + 1])) continue; // header row
      rows.push({ line: i + 1, text: l });
    } else if (/^(\*\*)?[A-Z]?[0-9]+[a-z]?\. /.test(l) && !/https?:\/\//.test(l)) {
      rows.push({ line: i + 1, text: l });
    }
  }
  return rows;
}
export function rowsOfFile(path) { return researchRows(readFileSync(path, 'utf8')); }
