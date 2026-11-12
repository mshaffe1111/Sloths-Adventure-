import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The stills a review is judged on never show Pokey flashing see-through (the lead, 11-05: a still from engine-runs' tool, drawn with his
// invincibility flash on, read as dressing covering him). Each tool may keep him safe while its frames settle, but clears the flash
// right before the frame it draws.
const TOOLS = ['tools/engine/runs/stills-at.mjs', 'tools/engine/runs/hollowStills.mjs', 'tools/validate/stills.mjs', 'tools/validate/chaseshot.mjs'];

test('every review stills tool clears the invincibility flash right before it renders', () => {
  for (const f of TOOLS) {
    const src = readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');
    const renders = [...src.matchAll(/e\.render\(\)/g)];
    assert.ok(renders.length >= 1, `${f}: no render`);
    for (const r of renders) {
      const before = src.slice(Math.max(0, r.index! - 200), r.index);
      assert.match(before, /invincibleTimer = 0;\s*$/, `${f}: renders without clearing the flash first`);
    }
  }
});
