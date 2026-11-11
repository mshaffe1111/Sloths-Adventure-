// R-165.119 (ENGINE-AUDIT-B B-01): at the double's teach wall a player who never falls got no help at all. The ladder counted put-backs
// only, and while it is on it keeps both older helpers quiet (engine.ts watchForStuck `&& !this.help`; DotGuide.tsx struggle). The lesson
// is a 128-140 px face on solid ground: a miss lands him back where he left, no fall, no put-back. Now each failed try at a wall counts
// on the ladder the same as a put-back (stuckHelper.ts TryWatch, engine.ts helpTries, helpLadder.ts tried). Flown in the real engine at
// 30 fps on listed seeds, both settings: 15 single jumps at the wall, never a fall. Dot's move line at the 3rd try; Easy's steps grow by
// the 8th; Normal's offer at the 12th; the old stuck helper ("Too tall for one jump!") never speaks over the ladder (INT-1-1's ruling).
// Planted: the same 15 jumps with the tries switched off bring nothing (the bug).
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { withPlaySeed } from './testlink1_1.ts';
import { recorder } from './playRecorder.ts';
import { maxGap } from './gen2/pipeline.ts';
import { provenSeeds } from './gen2/seedList.ts';
import { HELP_LINES, HelpLadder, MOVE_LINES, RUNGS, STEP_LINE, skyline } from './helpLadder.ts';
import { TryWatch } from './stuckHelper.ts';

type Box = { x: number; y: number; width: number; height: number };
type Eng = {
  currentStage: { meta: { pieces: Array<{ k: string; x0: number; x1: number }> }; gen2?: { budget?: { margin?: number } } };
  roadBoxes(): Box[];
  helpState(): { on: boolean; grown: unknown[] };
  helpAsk: (o: { reask: boolean }, answer: (yes: boolean) => void) => void;
  stop(): void;
};

/** the double teach's wall in a laid piece: a join no single jump climbs, its lower side 120 px or wider (the help's room) */
function wallOf(e: Eng, setting: 'easy' | 'normal') {
  const piece = e.currentStage.meta.pieces.find((q) => /double-teach/.test(q.k));
  if (!piece) return null;
  const margin = e.currentStage.gen2?.budget?.margin ?? (setting === 'easy' ? 0.65 : 0.82);
  const segs = skyline(piece, e.roadBoxes());
  for (let i = 0; i + 1 < segs.length; i++) {
    const a = segs[i], b = segs[i + 1];
    if (b.x0 - a.x1 > 1 || a.x1 < piece.x0 || a.x1 > piece.x1 || a.x1 - a.x0 < 120) continue;
    if (a.y - b.y > 0 && maxGap(a.y - b.y, false, margin) < 0) return { piece, x: a.x1, y: a.y, rise: a.y - b.y };
  }
  return null;
}

/** the first listed seeds whose double teach is a wall (both settings lay Normal's plan) */
const SEEDS = provenSeeds('1-1').filter((seed) => {
  setDifficulty('normal');
  const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
  const ok = !!wallOf(r.e as unknown as Eng, 'normal');
  (r.e as unknown as Eng).stop();
  return ok;
}).slice(0, 2);

function atTheWall(seed: number, setting: 'easy' | 'normal', tries = true) {
  setDifficulty(setting);
  const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
  const e = r.e as unknown as Eng;
  // (RealPlay stubs watchForStuck as cosmetic: the engine's own runs here, so the old watch counts as in play and must stay quiet)
  delete (r.e as unknown as { watchForStuck?: unknown }).watchForStuck;
  if (!tries) (r.e as unknown as { helpTries: () => void }).helpTries = () => {};
  const events: string[] = [];
  const was = recorder.event;
  recorder.event = function (this: typeof recorder, what: string, detail?: string | number) { events.push(`${what} ${detail ?? ''}`.trim()); return was.call(this, what, detail); } as typeof recorder.event;
  const asked: boolean[] = [];
  e.helpAsk = (o, answer) => { asked.push(o.reask); answer(false); };
  const lineAt: Array<{ text: string; tries: number }> = [];
  try {
    const wall = wallOf(e, setting);
    assert.ok(wall, `seed ${seed} ${setting}: the double teach is a wall`);
    r.stand(wall.x - 60, wall.y);
    for (let i = 0; i < 6; i++) r.frame({});
    let jumps = 0;
    const said0 = r.said.length;
    for (let i = 0; i < 30 * 60 && jumps < 15; i++) {
      const press = r.p.grounded && i % 2 === 0;
      if (press) jumps++;
      r.frame({ right: true, jump: press, press });
      for (let k = 0; k < 12 && press; k++) r.frame({ right: true, jump: true });
      for (let k = 0; k < 60 && !r.p.grounded; k++) r.frame({ right: true });
      for (const s of r.said.slice(said0)) if (!lineAt.some((l) => l.text === s.text)) lineAt.push({ text: s.text, tries: events.filter((v) => v.startsWith('helpTry')).length });
    }
    return { wall, jumps, events, asked, lineAt, said: r.said.slice(said0).map((s) => s.text), grown: e.helpState().grown.length };
  } finally {
    recorder.event = was;
    e.stop();
    setDifficulty('normal');
  }
}

test('the measuring: two listed seeds lay the double teach as a wall', () => {
  assert.equal(SEEDS.length, 2, `seeds with a wall: ${SEEDS.join(', ')}`);
});

for (const seed of SEEDS) for (const setting of ['easy', 'normal'] as const) {
  test(`1-1 seed ${seed} ${setting}: 15 single jumps at the double teach's wall, no fall, bring Dot's line at the 3rd try and the ladder's next rung`, () => {
    const f = atTheWall(seed, setting);
    const tries = f.events.filter((v) => v.startsWith('helpTry')).length;
    assert.equal(f.events.filter((v) => v.startsWith('softFall')).length, 0, 'never a fall');
    assert.ok(tries >= RUNGS.move, `${tries} failed tries counted of ${f.jumps} jumps`);
    const move = MOVE_LINES.double;
    const line = f.lineAt.find((l) => l.text === move.touch || l.text === move.pad);
    assert.ok(line, `Dot's double line (said: ${JSON.stringify(f.said)})`);
    assert.equal(line.tries, RUNGS.move, 'said at the 3rd failed try');
    assert.ok(f.events.some((v) => v.startsWith(`help move`)), 'the ladder fired its move rung');
    if (setting === 'easy') {
      assert.ok(f.grown > 0, 'Easy: the steps grew at the wall (the help\'s room)');
      assert.ok(f.said.includes(STEP_LINE), 'Easy: "A step. Up you go."');
    } else {
      assert.equal(f.grown, 0, 'Normal: the stage never changes by itself');
      assert.equal(f.asked.length, 1, `Normal: the offer at the ${RUNGS.offer}th try (${tries} tries)`);
    }
    // (the old stuck helper never speaks over the ladder: INT-1-1's ruling, kept)
    assert.ok(!f.events.some((v) => v.startsWith('stuckHelp')), 'no stuckHelp');
    assert.ok(!f.said.some((s) => /Too tall/.test(s)), 'no "Too tall for one jump!"');
  });
}

test('planted: with the ladder\'s tries switched off, the same 15 jumps bring no help at all (the bug B-01 named)', () => {
  const f = atTheWall(SEEDS[0], 'normal', false);
  assert.equal(f.said.filter((s) => HELP_LINES.has(s) || /Too tall/.test(s)).length, 0);
  assert.ok(!f.events.some((v) => v.startsWith('help ')));
});

test('TryWatch: a failed try is a jump toward the wall that lands back short of it; nothing else counts', () => {
  const face = { x: 500, dir: 1 as const };
  const fly = (w: TryWatch, o: { vx?: number; held?: -1 | 0 | 1; landX?: number; landY?: number; faceAt?: typeof face | null }) => {
    w.tick({ grounded: true, x: 440, y: 600, vx: 0, held: 0, face: o.faceAt === undefined ? face : o.faceAt });
    let r: number | null = null;
    for (let i = 0; i < 10; i++) r ??= w.tick({ grounded: false, x: 450, y: 560, vx: o.vx ?? 0, held: o.held ?? 0, face: null });
    return r ?? w.tick({ grounded: true, x: o.landX ?? 455, y: o.landY ?? 600, vx: 0, held: 0, face });
  };
  assert.equal(fly(new TryWatch(), { held: 1 }), 500, 'held toward the wall, back on the ground short of it: a try');
  assert.equal(fly(new TryWatch(), { vx: 120 }), 500, 'moving toward it: a try');
  assert.equal(fly(new TryWatch(), {}), null, 'a hop on the spot (a petal) is no try');
  assert.equal(fly(new TryWatch(), { held: -1 }), null, 'a jump away from the wall is no try');
  assert.equal(fly(new TryWatch(), { held: 1, landY: 560 }), null, 'landing higher up is no try');
  assert.equal(fly(new TryWatch(), { held: 1, landX: 520 }), null, 'landing past the face is no try');
  assert.equal(fly(new TryWatch(), { held: 1, faceAt: null }), null, 'no wall ahead, no try');
  const w = new TryWatch();
  w.tick({ grounded: true, x: 440, y: 600, vx: 0, held: 1, face });
  w.tick({ grounded: false, x: 450, y: 560, vx: 100, held: 1, face: null });
  w.reset();
  assert.equal(w.tick({ grounded: true, x: 455, y: 600, vx: 0, held: 0, face }), null, 'a put-back forgets the flight');
});

test('the ladder: a failed try and a put-back count on one count, the same rungs', () => {
  const L = new HelpLadder('normal', [{ k: 'p', x0: 0, x1: 1000 }]);
  assert.deepEqual(L.putBack(400), []);
  assert.deepEqual(L.tried(500), []);
  assert.deepEqual(L.tried(500).map((a) => [a.rung, a.count]), [['move', RUNGS.move]]);
  assert.equal(L.count('p'), 3);
});
