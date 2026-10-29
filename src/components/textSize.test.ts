import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** every style sheet and component under src */
function files(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(css|tsx)$/.test(f)) out.push(p);
  }
  return out;
}

test('no text under 12 px on a phone (UI-14)', () => {
  const small: string[] = [];
  for (const f of files('src')) {
    const s = readFileSync(f, 'utf8');
    for (const m of s.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) if (+m[1] < 12) small.push(`${f}: ${m[0]}`);
    for (const m of s.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) if (+m[1] < 12) small.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(small, []);
});
