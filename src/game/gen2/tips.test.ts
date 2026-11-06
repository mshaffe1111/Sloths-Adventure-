// Dot's tips in gen2 (the red team, 11-05, RT-PLAYER F1): a tip socket names a Dot line by its id (dotLinesData.ts). The id itself never
// reaches the screen: it is said in its row's words, so the game knows the line (a move row arms the move watch); an id with no row
// FAILS the roll by name (gen2.errors), it is never shown. And gen2 1-1, both settings, shows no dotted id anywhere.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg, kit, manifest } from './toyWorld.ts';
import { engineGuideLine } from '../dotLines.ts';
import { DOT_LINES } from '../dotLinesData.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { WorldKit, WorldManifest } from './types.ts';

const ID = /^[a-z][\w-]*(\.[\w-]+)+$/;
/** the toy world with every tip socket naming `id`, and no kit tips map */
const withTip = (id: string): WorldKit => ({
  ...kit,
  manifest: { ...manifest, tips: undefined, sections: manifest.sections.map((t) => ({ ...t, sockets: t.sockets.map((s) => (s.role === 'tip' ? { ...s, allow: [id], chance: 1 } : s)) })) } as WorldManifest,
});
/** the hints the stage carries for the game (proto.hints) */
const hintsOf = (st: unknown): Array<{ x: number; text: string; pad?: string; keys?: string }> => (st as { proto?: { hints?: never[] } }).proto?.hints ?? [];
const SEEDS = Array.from({ length: 8 }, (_, i) => 3 + i * 41);

test('a tip id is said in its Dot row\'s words, and a move row arms the move watch', () => {
  const row = DOT_LINES.find((r) => r[0] === 'hint.1-1.double')!;
  let shown = 0;
  for (const s of SEEDS) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: withTip('hint.1-1.double'), seed: s, difficulty: 'normal' });
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

test('gen2 1-1 shows no dotted id on either setting (8 seeds)', () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  for (const s of SEEDS) for (const d of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed: s, difficulty: d });
    for (const h of hintsOf(st)) assert.ok(!ID.test(h.text), `seed ${s} ${d}: Dot says "${h.text}" at x ${h.x}`);
  }
});
