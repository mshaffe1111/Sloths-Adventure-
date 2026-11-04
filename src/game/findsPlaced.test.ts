import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { isGen2Stage } from './gen2/game.ts';
import { findForStage } from './finds.ts';

/**
 * Every stage that holds a find places exactly one, on every layout (2026-11-01: 1-4's Notch was missing on 5 of 40 layouts and 4-6's
 * pocket on 6 of 40: on those narrow climbs the flags, measured along the ground alone, ruled out every spot; addFinds now falls back
 * to the flags' true distance, then smaller gaps). All ten worlds: the designed layout, eight random ones, and every layout that was
 * missing its find, on Normal and (for the gen2 stages) Easy. A full sweep of 40 layouts per stage passed when the fix went in, and every
 * stage that already had its find came out byte-identical.
 */
const WAS_MISSING: Record<string, number[]> = { '1-4': [12, 17, 18, 24, 33], '4-6': [9, 14, 23, 30, 38, 40] };

test('every find stage places exactly one find on every layout, in all ten worlds', () => {
  const g = globalThis as { location?: unknown; localStorage?: unknown };
  const had = { location: g.location, localStorage: g.localStorage };
  const store: Record<string, string> = {};
  g.location = { search: '', hash: '', href: 'http://localhost/' };
  g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: () => {} };
  const bad: string[] = [];
  try {
    const stages = generateAllLevels().filter((l) => !l.secret && findForStage(l.worldIndex, l.miniIndex));
    assert.ok(stages.length >= 45, `${stages.length} find stages`);
    for (const cfg of stages) {
      const variants: (number | null)[] = [null, 1, 2, 3, 4, 5, 6, 7, 8, ...(WAS_MISSING[cfg.id] ?? [])];
      for (const diff of isGen2Stage(cfg) ? (['normal', 'easy'] as const) : (['normal'] as const)) {
        for (const v of variants) {
          setLayoutVariant(v);
          try {
            const st = generateStage({ ...cfg, unlocked: true }, diff);
            const n = st.collectibles.filter((c) => c.type === 'find').length;
            if (n !== 1) bad.push(`${cfg.id} ${diff} layout ${v ?? 'designed'}: ${n} finds`);
          } finally {
            setLayoutVariant(null);
          }
        }
      }
    }
  } finally {
    g.location = had.location;
    g.localStorage = had.localStorage;
  }
  assert.deepEqual(bad, []);
});
