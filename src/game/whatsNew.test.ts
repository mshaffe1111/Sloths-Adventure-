import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WHATS_NEW, releaseLine, formatReleaseDay } from './whatsNew.ts';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };

test("What's New: the top entry is this version (add one entry at the top for every release)", () => {
  assert.equal(WHATS_NEW[0].version, pkg.version, `package.json is ${pkg.version}: add a What's New entry for it at the top of src/game/whatsNew.ts`);
});

test("What's New: newest first, each version listed once, every entry has 3-8 lines", () => {
  const seen = new Set<string>();
  for (let i = 0; i < WHATS_NEW.length; i++) {
    const r = WHATS_NEW[i];
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
    if (i > 0) assert.ok(r.date <= WHATS_NEW[i - 1].date, `${releaseLine(r)} is out of order`);
    if (r.version) {
      assert.ok(!seen.has(r.version), `${r.version} listed twice`);
      seen.add(r.version);
    }
    assert.ok(r.title.trim().length > 0);
    assert.ok(r.items.length >= 3 && r.items.length <= 8, `${releaseLine(r)} has ${r.items.length} lines`);
  }
});

test("What's New: player words only, short lines", () => {
  const banned = /\b(helper|branch|gate|HF|Hugging ?Face|glob|PR|merge|commit|gen2|QA|Gemini|engine|shard)\b/i;
  for (const r of WHATS_NEW) {
    for (const line of [r.title, ...r.items]) {
      assert.ok(!banned.test(line), `workshop word in "${line}"`);
      assert.ok(line.length <= 90, `too long for a kid: "${line}"`);
    }
  }
});

test("What's New: dates read in words", () => {
  assert.equal(formatReleaseDay('2026-11-01'), 'Nov 1, 2026');
  assert.equal(releaseLine({ version: '1.0.0', date: '2026-10-28', part: 'evening', title: 't', items: [] }), 'Version 1.0.0  ·  Oct 28, 2026, evening');
  assert.equal(releaseLine({ date: '2026-10-28', title: 't', items: [] }), 'Oct 28, 2026');
});
