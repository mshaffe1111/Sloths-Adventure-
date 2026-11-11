/**
 * ENGINE-AUDIT-C finding C-02 (2026-11-11), the whole-game count. Asserts the CORRECT behaviour; FAILS on t-int-1-1 @ fa5ad9d1.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/dot-pad-lines.test.ts   (about 10 s)
 *
 * The engine says a stage hint in the wording for the controls in use (engine.ts: `mode === 'pad' ? h.pad : mode === 'keys' ? h.keys :
 * h.text`). Dot's guide then works out what the line IS from those words (dotLines.ts engineGuideLine): Matt's approved table is keyed
 * by the TOUCH wording only, so a pad or keys wording misses it and is classified by regex instead. The same hint must be the same
 * line (cut or said, its kind, the move that closes it, its id) whatever the controls.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { generateStage } from '../../../../src/game/stageGenerator.ts';
import { engineGuideLine } from '../../../../src/game/dotLines.ts';
import type { GuideLine } from '../../../../src/game/dotGuide.ts';

const sig = (l: GuideLine | null) => (l ? `${l.kind}|${l.move ?? '-'}|${l.step ?? '-'}|${l.mech ?? '-'}|${l.thing ? 'thing' : '-'}|${/^engine:[A-Za-z0-9.\-]+$/.test(l.key) ? 'approved' : 'raw words'}` : 'CUT (not said)');

test('C-02: every stage hint is the same line on touch, on the pad and on keys', () => {
  const bad: string[] = [];
  let hints = 0;
  let cutButSaid = 0;
  for (const lvl of generateAllLevels()) {
    const st = generateStage(lvl, 'normal') as { proto?: { hints?: Array<{ text: string; pad: string; keys: string }> } };
    for (const h of st.proto?.hints ?? []) {
      hints++;
      const touch = engineGuideLine(h.text, lvl.id, { dot: true });
      for (const [mode, words] of [['pad', h.pad], ['keys', h.keys]] as const) {
        if (words === h.text) continue;
        const other = engineGuideLine(words, lvl.id, { dot: true });
        if (sig(touch) === sig(other)) continue;
        if (!touch && other) cutButSaid++;
        bad.push(`${lvl.id} ${mode}: touch [${sig(touch)}] "${h.text}"  vs  [${sig(other)}] "${words}"`);
      }
    }
  }
  assert.equal(bad.length, 0, `${bad.length} wordings of ${hints} stage hints are a different line off touch (${cutButSaid} of them: cut on touch, still said):\n${bad.slice(0, 12).join('\n')}\n...`);
});
