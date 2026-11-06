/**
 * Labels for the testers' recorder (playRecorder.ts) that need the game's tables: kept out of playRecorder itself, which dotLines.ts
 * imports (a cycle the other way).
 *   dotLogId    which of Dot's lines this is, by its review id (dotLinesData.ts), for the 'dot' moment: matched by its old words (the
 *               stage hints carry them) or its new ones; a line the review does not have is logged by its first words, in quotes
 */
import { ALL_DOT_LINES, normWords, swapLine } from './dotLines.ts';

let byNew: Map<string, string> | null = null;
/** the lines already looked up (guide() runs often, World 4's above all: each line's id is worked out once) */
const seen = new Map<string, string>();

export function dotLogId(text: string, stage = ''): string {
  const key = `${stage}|${text}`;
  const hit = seen.get(key);
  if (hit !== undefined) return hit;
  const id = lookUp(text, stage);
  if (seen.size > 600) seen.clear();
  seen.set(key, id);
  return id;
}

function lookUp(text: string, stage: string): string {
  const t = text.trim();
  if (!t) return '';
  const old = swapLine(t, stage);
  if (old) return old.line.id;
  if (!byNew) {
    byNew = new Map();
    for (const l of ALL_DOT_LINES) for (const w of [l.old, l.text, l.then]) if (w && !byNew.has(normWords(w))) byNew.set(normWords(w), l.id);
  }
  return byNew.get(normWords(t)) ?? `"${t.slice(0, 50)}"`;
}
