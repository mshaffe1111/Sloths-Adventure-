// The double teach is spoken (the planner's trace, 11-06; the lead: "a teach that Dot never says is the worst kind of defect"). On gen2
// 1-1 the first-timer was rescued at all five double-teach gaps on 3 of 3 layouts, and not for the gaps: Dot never said either double line.
// - gen2 lays its teach tips from the coach's ids, and Dot swapped only the stage hints' words for Matt's (dotLines.ts SAID), so a coach
//   line went up in its OLD words: coach.jump's 19-word "Slide up and across to jump..." held the screen 11 s, and coach.nice, which Matt
//   cut, was said and read as a jump tip;
// - a plain information line ("A flag!") gave way only to a thing's tip, so the double's tip waited behind it, and a double made before it
//   came took it away unsaid (dotGuide.ts tick: a move tip for a move already done is not said);
// - its socket stood under a second before the first gap.
// Fixed: coach lines are swapped by their words too (Matt's words, or not said when cut), the flag before a hard node stands
// ROLLED_FLAGS.clear px or more ahead of it so its "A flag!" lesson is done before the teach (the queue's rule that a move tip does not push
// an information line aside stands: dotGuide.test, QA v198), and a teach's entry line is said TEACH_LEAD px before its socket.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { engineGuideLine } from '../dotLines.ts';
import { buildGen2Stage, ROLLED_FLAGS } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import { FirstTimerRun, FT_ADULT } from '../../../tools/inspect/firsttimer.ts';

test("Dot says a coach line in Matt's words, and not at all when Matt cut it (planted: the old words went up)", () => {
  assert.equal(engineGuideLine('Nice jump! In the air, flick up again for a double jump.', '1-1', { dot: true }), null, 'coach.nice is cut');
  const j = engineGuideLine('Slide up and across to jump. Keep running and slide your thumb up and forward in one quick move.', '1-1', { dot: true });
  assert.equal(j?.text, 'Flick up and forward to jump.');
  assert.equal(engineGuideLine('Flick up again in the air to jump twice', '1-1', { dot: true })?.move, 'double');
});

test("gen2 1-1 on the game's road: Dot says the double before the first double gap, and the first-timer has learned it there (layouts 1-3)", () => {
  for (const layout of [1, 2, 3]) {
    const r = new FirstTimerRun('1-1', layout, FT_ADULT, {}) as unknown as { play(): void; sim: { stage: { proto?: { gen2?: { nodes?: Array<{ token: string; x0: number }>; falls?: Array<{ x0: number; x1: number }> } } } }; dot: { shown: Array<{ key: string; t0: number }> }; learned: Set<string> };
    const at: Array<{ key: string; x: number }> = [];
    const anyR = r as unknown as { sim: { frame(p?: unknown): void; p: { x: number } }; dot: { shown: Array<{ key: string }> } };
    const frame = anyR.sim.frame.bind(anyR.sim);
    let seen = 0, learnedAt = Infinity;
    anyR.sim.frame = (pad?: unknown) => {
      frame(pad);
      const sh = anyR.dot.shown;
      for (; seen < sh.length; seen++) at.push({ key: sh[seen].key, x: anyR.sim.p.x });
      if (learnedAt === Infinity && r.learned.has('double')) learnedAt = anyR.sim.p.x;
    };
    r.play();
    const g = r.sim.stage.proto?.gen2;
    const teach = (g?.nodes ?? []).find((q) => /^T[a-z]?2/.test(q.token))!;
    const firstGap = Math.min(...(g?.falls ?? []).filter((f) => f.x0 >= teach.x0).map((f) => f.x0));
    const said = at.find((s) => s.key === 'engine:hint.1-1.double');
    assert.ok(said && said.x < firstGap, `layout ${layout}: the double line ${said ? `went up at x ${Math.round(said.x)}` : 'never went up'}, the first double gap at x ${Math.round(firstGap)}`);
    assert.ok(learnedAt < firstGap, `layout ${layout}: learned the double at x ${Math.round(learnedAt)}, the first double gap at x ${Math.round(firstGap)}`);
  }
});

// (tester-page's seed 158, upright, the real page on a fresh save, 11-06: Pokey passed both double lines' trigger points, x 6680 and 7129,
// and Dot showed neither within 20 s: the lines queued behind the old coach words and the first flag's lesson)
test("1-1 seed 158 (the real page's failure): the double line is said inside the teach before its first double gap, with no flag lesson in its way", () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed: 158, difficulty });
    const teach = (st.gen2.nodes ?? []).find((q) => /^T[a-z]?2/.test(q.token))!;
    const firstGap = Math.min(...(st.gen2.falls ?? []).filter((f) => f.x0 >= teach.x0).map((f) => f.x0));
    const hints = st.proto?.hints ?? [];
    const dbl = hints.filter((h) => engineGuideLine(h.text, '1-1', { dot: true })?.key === 'engine:hint.1-1.double');
    assert.ok(dbl.some((h) => h.x >= teach.x0 - 40 && h.x < firstGap), `${difficulty}: the double line at x ${dbl.map((h) => h.x).join(', ') || 'none'}, the teach ${Math.round(teach.x0)}, its first gap ${Math.round(firstGap)}`);
    // (no hint near the teach is said in words Matt cut or replaced)
    for (const h of hints.filter((q) => Math.abs(q.x - teach.x0) < 2500)) { const l = engineGuideLine(h.text, '1-1', { dot: true }); if (l) assert.ok(!/Slide up and across to jump|Nice jump! In the air/.test(l.text), `${difficulty}: "${l.text}" at x ${h.x}`); }
    const flagNear = (st.checkpoints ?? []).filter((f) => f.x > teach.x0 - ROLLED_FLAGS.clear && f.x <= teach.x0 + 150);
    assert.deepEqual(flagNear.map((f) => f.x), [], `${difficulty}: a flag within ${ROLLED_FLAGS.clear} px before the teach, its lesson in the line's way`);
  }
});
