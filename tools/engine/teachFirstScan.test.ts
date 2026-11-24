// teachFirstScan's own test (R-165.427, TEACH-11): 1-1's first proven roll passes on both settings, and each planted red is caught: the
// double teach moved past its first use (a later section; past the first double in its own section), laid as a plain tip, not laid.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/game/headlessDom.ts';
import { COACH_MOVES, teachFirstMisses, walkSaid, type TeachRoll } from './teachFirstScan.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { LISTED } from '../../src/game/gen2/listed.ts';
import { provenSeeds } from '../../src/game/gen2/seedList.ts';
import { laidAsks } from '../../src/game/gen2/pipeline.ts';
import type { StageHint } from '../../src/game/protoStage.ts';
import type { FilledSocket, PlacedSection } from '../../src/game/gen2/types.ts';

const ID = '1-1';
function roll(setting: 'normal' | 'easy'): TeachRoll {
  try {
    localStorage.clear();
  } catch {
    /* none */
  }
  setDifficulty(setting);
  const p = new RealPlay(ID, provenSeeds(ID)[0]);
  setDifficulty('normal');
  const st = p.stage as unknown as { gen2: { sections: PlacedSection[]; fills: FilledSocket[] }; proto?: { hints?: StageHint[] } };
  const order = (s: string) => { const [w, n] = s.split('-').map(Number); return w * 100 + n; };
  return {
    stageId: ID, sections: st.gen2.sections, fills: st.gen2.fills.map((f) => ({ ...f })), hints: (st.proto?.hints ?? []).map((h) => ({ ...h })),
    asks: laidAsks(st as never), manifest: LISTED[ID].kit().manifest as never, before: (a, b) => order(a) < order(b), coach: COACH_MOVES,
  };
}
/** the roll's double teach: its fill and its hint */
function dbl(r: TeachRoll) {
  const tpl = new Map(r.manifest.sections.map((t) => [t.id, t]));
  const f = r.fills.find((q) => q.role === 'tip' && tpl.get(r.sections.find((s) => s.uid === q.section)!.template)?.teaches === 'double')!;
  const h = r.hints.find((q) => Math.abs(q.x - f.x) < 1)!;
  assert.ok(f && h, 'the roll lays a double teach line');
  return { f: f as { -readonly [K in keyof typeof f]: (typeof f)[K] }, h };
}

test("1-1's first proven roll: every mechanic's first appearance is taught first, laid as a teach line, on Normal and Easy", () => {
  for (const s of ['normal', 'easy'] as const) assert.deepEqual(teachFirstMisses(roll(s)), [], s);
});

test('planted: the double teach moved to a section after the first that shows the double is caught', () => {
  const r = roll('normal');
  const { f } = dbl(r);
  const k = r.sections.findIndex((s) => s.uid === f.section);
  assert.ok(k > 0, 'a section before the teach');
  // (the section before the teach made to require the double: the teach now comes after its first use)
  const before = r.sections[k - 1].template;
  const moved = { ...r, manifest: { ...r.manifest, sections: r.manifest.sections.map((t) => (t.id === before ? { ...t, uses: [...(t.uses ?? []), 'double'] } : t)) } };
  const miss = teachFirstMisses(moved);
  assert.ok(miss.some((m) => m.startsWith('double:') && /laid in .* after .* shows it first/.test(m)), miss.join('\n'));
});

test('planted: the double teach standing past the first double in its own section is caught', () => {
  const r = roll('normal');
  const { f, h } = dbl(r);
  const a = r.asks.find((q) => (q.move === 'double' || q.block === 'double') && q.section === f.section)!;
  assert.ok(a, 'the teach section asks a double');
  const x = Math.max(a.x0, a.x1) + 40;
  f.x = x;
  (h as { x: number }).x = x;
  const miss = teachFirstMisses(r);
  assert.ok(miss.some((m) => m.startsWith('double:') && /stands past the first double/.test(m)), miss.join('\n'));
});

test('planted: the double teach laid as a plain tip (the base before TEACH-11) is caught', () => {
  const r = roll('normal');
  const { h } = dbl(r);
  delete (h as { teach?: true }).teach;
  const miss = teachFirstMisses(r);
  assert.ok(miss.some((m) => m.startsWith('double:') && /plain tip/.test(m)), miss.join('\n'));
});

test('planted: no double teach laid at all is caught', () => {
  const r = roll('normal');
  const { f } = dbl(r);
  const miss = teachFirstMisses({ ...r, fills: r.fills.filter((q) => q !== f) });
  assert.ok(miss.some((m) => m.startsWith('double: no teach line laid')), miss.join('\n'));
});

// (the moment: 1-1 rolls whose double line came late on the base (the brisk walk through Dot's real queue, reference/qa-reports/TEACH-11),
// 15050 on the testers' tall bank: with the line laid as a teach line it is SHOWN before the first double on the default setting; laid as a
// plain tip (the base) it waits out Dot's gap between lines and comes after it on at least one of them)
const LATE_ON_BASE = [15050, 9013, 9652];
test('the walk: 1-1 rolls late on the base show the double line before the first double, Normal (Tips) and Easy (Help)', async () => {
  for (const seed of LATE_ON_BASE) for (const s of ['normal', 'easy'] as const) {
    const w = await walkSaid(ID, seed, s, 'double');
    assert.ok(w.before, `${seed} ${s}: shown at x ${w.shownX} (sent ${w.sentX}), first double at x ${w.needX}`);
  }
});
test('planted: the walk catches the double line laid as a plain tip (the base) coming after the first double', async () => {
  let late = 0;
  for (const seed of LATE_ON_BASE) for (const s of ['normal', 'easy'] as const) if (!(await walkSaid(ID, seed, s, 'double', { plain: true })).before) late++;
  assert.ok(late > 0, 'a plain tip came late on at least one roll');
});
