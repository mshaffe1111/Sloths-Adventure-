// Dot's tips in gen2 (the red team, 11-05, RT-PLAYER F1): a tip socket names a Dot line by its id. The id itself never reaches the
// screen: it is said in the kit's words for it (manifest.tips; World 1's W1_TIPS from dotLinesData), so the game knows the line (a move
// row arms the move watch); an id the kit has no words for FAILS the roll by name (gen2.errors), never shown. (That gen2 1-1 shows no
// dotted id is stage.ts's player-sees gate and w1.test's, engine-core.)
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg, kit, manifest } from './toyWorld.ts';
import { engineGuideLine } from '../dotLines.ts';
import { DOT_LINES } from '../dotLinesData.ts';
import type { WorldKit, WorldManifest } from './types.ts';

const ID = /^[a-z][\w-]*(\.[\w-]+)+$/;
/** the toy world with every tip socket naming `id`, and the kit's words `tips` */
const withTip = (id: string, tips?: Record<string, string>): WorldKit => ({
  ...kit,
  manifest: { ...manifest, tips, sections: manifest.sections.map((t) => ({ ...t, sockets: t.sockets.map((s) => (s.role === 'tip' ? { ...s, allow: [id], chance: 1 } : s)) })) } as WorldManifest,
});
/** the hints the stage carries for the game (proto.hints) */
const hintsOf = (st: unknown): Array<{ x: number; text: string; pad?: string; keys?: string }> => (st as { proto?: { hints?: never[] } }).proto?.hints ?? [];
const SEEDS = Array.from({ length: 8 }, (_, i) => 3 + i * 41);

test('a tip id is said in its Dot row\'s words, and a move row arms the move watch', () => {
  const row = DOT_LINES.find((r) => r[0] === 'hint.1-1.double')!;
  let shown = 0;
  for (const s of SEEDS) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: withTip('hint.1-1.double', { 'hint.1-1.double': row[4]! }), seed: s, difficulty: 'normal' });
    for (const h of hintsOf(st)) {
      assert.ok(!ID.test(h.text) && !ID.test(h.pad ?? '') && !ID.test(h.keys ?? ''), `seed ${s}: a hint shows the id "${h.text}"`);
      if (h.text !== row[4]) continue;
      shown++;
      const g = engineGuideLine(h.text, '1-1');
      assert.equal(g?.kind, 'teach', `seed ${s}: the double line is not a teach line (${JSON.stringify(g)})`);
      assert.ok(g?.move, `seed ${s}: the double line arms no move watch`);
    }
  }
  assert.ok(shown > 0, 'no tip laid: the test would not see the rule');
});

test('a tip id with no Dot line fails the roll by name and is never shown', () => {
  for (const s of SEEDS.slice(0, 4)) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: withTip('hint.nowhere.none'), seed: s, difficulty: 'normal' });
    if (!st.gen2.fills.some((f) => f.role === 'tip')) continue;
    assert.ok((st.gen2.errors ?? []).some((e) => /tip "hint\.nowhere\.none" has no Dot line/.test(e)), `seed ${s}: ${JSON.stringify(st.gen2.errors)}`);
    assert.ok(!(hintsOf(st)).some((h) => h.text.includes('hint.nowhere')), `seed ${s}: the id reached the screen`);
  }
});
