/**
 * World 3's DOWN tower bricks, counted (KIT-W3a, R-165.504). Each climb and bounce brick of W3_DOWN_TOWER is laid by a roll of 3-1's
 * TRIMMED node code (AUDIT-W3 codes-trim-rolled.txt) in the readied 3-1 draft's tower, and counted from the built stage's sections.
 * w3.ts's manifest has no graphs yet (3-1's build gives it its own), so the kit here holds that one code as its graph, the way the audit's
 * kit does (AUDIT-W3 w3Audit.ts auditKit): the way down's bricks typed (drops 'ground', the walk 'floating', the ledge as the arrival, a
 * rest and the exit), the tower's bricks as they are. The rolls may still carry refusals the bricks do not own (3-1's after-roll, the
 * REPORT): this file asserts the bricks are DEALT where the code asks them, not that a roll is clean.
 *
 * Planted reds (each a test below): a brick taken out of the pool -> its count drops to none; w3-cap-down's ledge back at 240-260 -> the
 * double reaches the lip from the entry shelf (the bounce, the beat's job, is skipped).
 */
import '../../headlessDom.ts';
import { readied, readyDraft } from '../../../../tools/engine/draft.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, layLocal, rngFor } from '../pipeline.ts';
import { LISTED } from '../listed.ts';
import { parseCode } from '../nodeCode.ts';
import { TYPE_OF_LETTER } from '../nodeAsks.ts';
import { FLOWN_ARCS } from '../reach.ts';
import { generateAllLevels } from '../../worldsData.ts';
import type { ContentType, GraphBrief, NodeJob, SectionTemplate, StageBudget, WorldKit } from '../types.ts';
import { W3_DOWN_TOWER, w3CapDown, w3Drops, w3Ledge, w3Walk } from './w3.ts';

const DRAFT = '3-1';
/** 3-1's trimmed code (AUDIT-W3 codes-trim-rolled.txt): its c and b beats are the tower's climb and bounce */
const CODE = 'A Tg1 D_ Pf1< Xg1> R Dc1_ Wf1> R Pb1< Cg1> R Sf1_< E';
const SEEDS = [1, 2, 3, 4];
const BOTH = ['normal', 'easy'] as const;
const CAP = 20;
const ALL_JOBS: NodeJob[] = ['teach', 'practise', 'test', 'combine', 'twist', 'signature', 'descent', 'climb', 'flow'];

/** the way down's bricks, typed as the audit types them, then the tower's (as w3.ts holds them, or a planted pool) */
function pool(tower: readonly SectionTemplate[]): SectionTemplate[] {
  return [
    { ...w3Ledge, id: 'w3t-arrive', jobs: ['arrive'], content: 'structural', phases: ['start'] },
    { ...w3Ledge, id: 'w3t-rest', jobs: ['rest'], content: 'structural', phases: ['rest'], maxPerStage: CAP },
    { ...w3Ledge, id: 'w3t-exit', jobs: ['exit'], content: 'structural', phases: ['goal'] },
    { ...w3Drops, id: 'w3t-drops', jobs: ALL_JOBS, content: 'ground', maxPerStage: CAP },
    { ...w3Walk, id: 'w3t-walk', jobs: ALL_JOBS, content: 'floating', maxPerStage: CAP },
    ...tower,
  ];
}

/** the readied draft's kit with 3-1's trimmed code as its one graph (the brief dealt exactly from the code's content letters) */
function kitWith(tower: readonly SectionTemplate[]): WorldKit {
  const k = LISTED[DRAFT].kit();
  const deal: Partial<Record<ContentType, number>> = {};
  for (const t of parseCode(CODE)) {
    const ty = t.content ? TYPE_OF_LETTER[t.content] : undefined;
    if (ty) deal[ty] = (deal[ty] ?? 0) + 1;
  }
  const brief = { ends: 'quiet', trend: 'level', branching: 'none', teaches: [], deal, dealExact: true } as GraphBrief;
  const archetype = ((config() as unknown as { objective?: { type?: string } }).objective?.type ?? 'sprint') as never;
  return { ...k, manifest: { ...k.manifest, sections: pool(tower), required: {}, graphs: { list: [{ id: `w3t-${DRAFT}`, archetype, code: CODE }], briefs: { [DRAFT]: brief }, maxPerStage: CAP } } } as WorldKit;
}
const config = () => generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!;

type Built = { gen2: { sections: Array<{ template: string; node: string }>; budget: StageBudget } };
const rolls = new Map<string, Built>();
function roll(seed: number, d: (typeof BOTH)[number], tower: readonly SectionTemplate[] = W3_DOWN_TOWER, tag = 'kit'): Built {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const k = `${tag}:${seed}:${d}`;
  if (!rolls.has(k)) rolls.set(k, buildGen2Stage({ config: config(), kit: kitWith(tower), seed, difficulty: d }) as unknown as Built);
  return rolls.get(k)!;
}

/** the code's node ids by content letter (a token per node, n1 first) */
const nodesAsking = (letter: string) => parseCode(CODE).flatMap((t, i) => (t.content === letter ? [`n${i + 1}`] : []));
/** each tower brick's count over the rolls */
function counts(tower: readonly SectionTemplate[], tag: string, seeds = SEEDS): Map<string, number> {
  const ids = new Set(W3_DOWN_TOWER.map((t) => t.id));
  const n = new Map<string, number>([...ids].map((id) => [id, 0]));
  for (const d of BOTH) for (const seed of seeds) for (const s of roll(seed, d, tower, tag).gen2.sections) if (ids.has(s.template)) n.set(s.template, n.get(s.template)! + 1);
  return n;
}

test("3-1's trimmed code asks one climb and one bounce beat, and the tower holds two shapes of each (more pieces, never fewer)", () => {
  assert.deepEqual(nodesAsking('c'), ['n7']);
  assert.deepEqual(nodesAsking('b'), ['n10']);
  const of = (c: string) => W3_DOWN_TOWER.filter((t) => t.content === c).map((t) => t.id);
  assert.deepEqual(of('climb'), ['w3-root-down', 'w3-two-roots']);
  assert.deepEqual(of('bounce'), ['w3-cap-down', 'w3-cap-steps']);
});

test('every c and b beat of 3-1 is laid by the tower bricks of its kind, and every brick is laid and counted (4 seeds x both)', () => {
  const kind = new Map(W3_DOWN_TOWER.map((t) => [t.id, t.content]));
  for (const d of BOTH) for (const seed of SEEDS) {
    const secs = roll(seed, d).gen2.sections;
    for (const [letter, content] of [['c', 'climb'], ['b', 'bounce']] as const) for (const node of nodesAsking(letter)) {
      const at = secs.filter((s) => s.node === node);
      assert.ok(at.length > 0, `${d} ${seed}: node ${node} ('${letter}') holds sections`);
      for (const s of at) assert.equal(kind.get(s.template), content, `${d} ${seed}: node ${node} ('${letter}') holds ${s.template}, not a tower ${content} brick`);
    }
  }
  const n = counts(W3_DOWN_TOWER, 'kit');
  for (const [id, c] of n) assert.ok(c > 0, `${id} is laid by no roll of 3-1's trimmed code (${[...n].map(([k, v]) => `${k} ${v}`).join(', ')})`);
});

test('PLANTED: a brick taken out of the pool is counted by no roll, and the beat is laid by its other shape', () => {
  const full = counts(W3_DOWN_TOWER, 'kit', [1]);
  for (const gone of W3_DOWN_TOWER) {
    const less = W3_DOWN_TOWER.filter((t) => t !== gone);
    const n = counts(less, `less-${gone.id}`, [1]);
    assert.ok(full.get(gone.id)! > 0, `${gone.id}: counted in the full pool (seed 1, both)`);
    assert.equal(n.get(gone.id), 0, `${gone.id} out of the pool: its count drops to none`);
    const twin = less.find((t) => t.content === gone.content)!;
    assert.ok(n.get(twin.id)! > 0, `${gone.id} out: its beat is laid by ${twin.id}`);
  }
});

// ───────────────────────────── w3-cap-down: the bounce is the way onto the lip ─────────────────────────────

/** the farthest a double flick from 70 px carries him, over every flown scope (reach.ts: 283-287 px) */
const DOUBLE_REACH = Math.max(...FLOWN_ARCS.filter((a) => a.move === 'double-flick').map((a) => a.gap.from70));
/** the least gap from the entry shelf's end to the lip's near edge, over 40 local lays of the brick at each setting's real budget */
function lipGap(tpl: SectionTemplate): number {
  let least = Infinity;
  for (const d of BOTH) {
    const budget = roll(1, d).gen2.budget;
    for (let i = 1; i <= 40; i++) {
      const L = layLocal(tpl, budget, rngFor(i, 3101));
      const a = L.pieces.find((p) => p.key === 'a')!, w = L.pieces.find((p) => p.key === 'w')!;
      assert.ok(w.y > a.y, `${d} lay ${i}: the lip lies under the entry shelf (${Math.round(w.y - a.y)} px)`);
      least = Math.min(least, w.x - (a.x + a.w));
    }
  }
  return least;
}

test("w3-cap-down's lip lies past a double from the entry shelf at every lay (the bounce is the beat's way)", () => {
  assert.ok(DOUBLE_REACH >= 283, `the flown double flick: ${DOUBLE_REACH} px`);
  const g = lipGap(w3CapDown);
  assert.ok(g > DOUBLE_REACH, `entry shelf to lip: ${Math.round(g)} px, within a double's ${DOUBLE_REACH} px`);
});

test("PLANTED: w3-cap-down's ledge back at 240-260 lets the double reach the lip (the check goes red)", () => {
  const planted: SectionTemplate = { ...w3CapDown, pieces: w3CapDown.pieces.map((p) => (p.key === 'b' ? { ...p, w: [240, 260] as [number, number] } : p)) };
  const g = lipGap(planted);
  assert.ok(g <= DOUBLE_REACH, `planted ledge 240-260: entry shelf to lip ${Math.round(g)} px, past the double's ${DOUBLE_REACH} px (the plant is not caught)`);
});
