/**
 * Icon register gate (Matt, 2026-11-01: "Standards need enforced... Same for all icons in the game. Polish.").
 *
 * Every icon a player sees is a painted object (src/components/icons/PaintedIcon.tsx, made by reference/methods/icons.md), not the
 * old vector <Icon> glyph. This test fails when:
 *  - a player-facing component renders <Icon> more times than iconRegister.allow.json lets it (a new vector icon crept in);
 *  - a file renders it fewer times than its entry: lower the entry (the list only shrinks, and it ends empty);
 *  - a painted icon file is missing, over 60 KB, or over 4096 px, or a painted name has no file.
 * The list began (2026-11-01) as every <Icon> use that day.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import allow from './iconRegister.allow.json' with { type: 'json' };

const ROOT = new URL('../..', import.meta.url).pathname;
const SRC = join(ROOT, 'src/components');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(n) && !/\.test\./.test(n) ? [p] : [];
  });
}

/** <Icon uses per file (the definition file itself is the glyph set, not a use) */
export function iconUses(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const f of walk(SRC)) {
    const rel = relative(ROOT, f);
    if (rel === 'src/components/icons/index.tsx') continue;
    const n = (readFileSync(f, 'utf8').match(/<Icon\b/g) ?? []).length;
    if (n) out[rel] = n;
  }
  return out;
}

test('no player-facing component renders the old vector <Icon> beyond the allow-list, and the list only shrinks', () => {
  const uses = iconUses();
  const list = allow as Record<string, number>;
  const over = Object.entries(uses).filter(([f, n]) => n > (list[f] ?? 0)).map(([f, n]) => `${f}: ${n} <Icon> (allowed ${list[f] ?? 0})`);
  assert.deepEqual(over, [], `vector <Icon> used where a painted icon belongs (use <PaintedIcon>, reference/methods/icons.md):\n${over.join('\n')}`);
  const under = Object.entries(list).filter(([f, n]) => (uses[f] ?? 0) < n).map(([f, n]) => `${f}: allowed ${n}, uses ${uses[f] ?? 0}`);
  assert.deepEqual(under, [], `lower these in src/components/iconRegister.allow.json (the list only shrinks):\n${under.join('\n')}`);
});

/** width and height of a webp from its header (VP8, VP8L or VP8X) */
function webpSize(b: Buffer): [number, number] {
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
}

test('every painted icon has its file, each under 60 KB and 4096 px', async () => {
  const dir = join(ROOT, 'src/assets/icons');
  const files = readdirSync(dir).filter((n) => n.endsWith('.webp'));
  const src = readFileSync(join(SRC, 'icons/PaintedIcon.tsx'), 'utf8');
  const names = [...src.match(/PAINTED_NAMES = \[([^\]]*)\]/)![1].matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((n) => n !== 'mute');
  const missing = names.filter((n) => !files.includes(`${n}.webp`));
  assert.deepEqual(missing, [], `painted names with no file in src/assets/icons: ${missing.join(', ')}`);
  for (const f of files) {
    const b = readFileSync(join(dir, f));
    assert.ok(b.length < 60 * 1024, `${f} is ${b.length} bytes (cap 60 KB)`);
    const [w, h] = webpSize(b);
    assert.ok(w > 0 && h > 0 && w <= 4096 && h <= 4096, `${f} is ${w}x${h}`);
  }
});
