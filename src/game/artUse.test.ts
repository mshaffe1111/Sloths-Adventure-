/**
 * Art use gate (Matt, 2026-10-31: "We need to use all the art we create. Its a waste otherwise."; STAGE-RULES §4).
 *
 * tools/art/artuse.mjs lists every packed piece with no draw site and every art file nothing points at. This test fails when:
 *  - a piece is unused and not on the allow-list (artUse.allow.json): draw it before it merges (the list never grows: knowncheck.mjs, LAWS.md law 5);
 *  - an allow-list entry is used now: take it off the list. The list may only shrink.
 * The list began (2026-10-31) as everything unused that day, each entry tagged with the world helper that must place it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import allow from './artUse.allow.json' with { type: 'json' };

interface Row { id: string; file: string; key: string; world: string; why: string }
interface Allowed { id: string; owner: string; world: string; why: string }

test('every packed piece and art file is drawn, or on the reasoned allow-list (which only shrinks)', () => {
  const out = join(mkdtempSync(join(tmpdir(), 'artuse-')), 'rows.json');
  execFileSync(process.execPath, ['tools/art/artuse.mjs', '--json', out], { stdio: 'pipe' });
  const rows = JSON.parse(readFileSync(out, 'utf8')) as Row[];
  const list = allow as Allowed[];
  for (const a of list) assert.ok(a.owner && a.why, `allow-list entry ${a.id} needs an owner and a reason`);
  const allowed = new Set(list.map(a => a.id));
  const unused = new Set(rows.map(r => r.id));
  const fresh = rows.filter(r => !allowed.has(r.id)).map(r => `${r.world} ${r.id}`);
  assert.deepEqual(fresh, [], `unused art: draw it before it merges (artUse.allow.json only shrinks; knowncheck.mjs fails an added entry):\n${fresh.join('\n')}`);
  const placed = list.filter(a => !unused.has(a.id)).map(a => a.id);
  assert.deepEqual(placed, [], `these are drawn now: take them off src/game/artUse.allow.json (the list only shrinks):\n${placed.join('\n')}`);
});
