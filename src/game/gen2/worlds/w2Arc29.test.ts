/**
 * 2-9 The River King's Court (BUILD-29; reference/design/2-9.md on origin/t-design-29): the built stage, read the way the game builds it
 * (its stage-table row, kit 'w2-29', then World 2's finish), on both settings. The story keeper's words verbatim and where the game says
 * them; the hand build gone; the court lianas' far-bank stone where a plain walk climbs it. Each test names the fault that turns it red.
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage, worldFinish } from '../listed.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { W2_STAGES } from '../../w2Stages.ts';
import { STAGE_LINES } from '../../pokeyJournal.ts';
import { countWord, goalLine, sealedLine } from '../../stagePlan.ts';
import { DRUM_CARD_29, LINES_29, MISSION_29, STAGE_29 } from './w2Arc29.ts';
import { STAGE_TABLE } from './stageTable.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const read = (f: string): string => fs.readFileSync(path.join(root, f), 'utf8');
const cfg = generateAllLevels().find((c) => c.id === STAGE_29 && !c.secret)!;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const memo = new Map<string, Any>();
/** the stage as the game builds it: its listed kit, then World 2's finish */
function built(seed: number, d: 'normal' | 'easy'): Any {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_29)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, worldFinish(row)(st as never, false, d));
  }
  return memo.get(k)!;
}
const SEEDS = [1, 2, 3];
const BOTH = ['normal', 'easy'] as const;

test("2-9's lines are the story keeper's, word for word (reference/story/lines-2-9.md, KEEPER-23-29 t-keeper-23-29), and the game says them", () => {
  const md = read('reference/story/lines-2-9.md');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \d+ \| `([A-Za-z]+)` \|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_29)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(MISSION_29, rows.get('mission'), 'the stage card');
  assert.equal(DRUM_CARD_29.tip, rows.get('drumCard'), "the drum's journal tip");
  assert.ok(md.includes(`**${DRUM_CARD_29.name}**`), 'the card name');
  const page = /^\| `page` \|[^|]*\|[^|]*\| (.+?) \|$/m.exec(md)?.[1].trim();
  assert.equal(STAGE_LINES['2-9'], page, 'the journal page');
  // (where the game says them: the card (stagePlan.ts), the locked shrine, Dot's goal lines and the HUD's count word)
  assert.ok(read('src/game/stagePlan.ts').includes(`S('gauntlet', "The River King's Court", "${MISSION_29}")`), 'stagePlan.ts says MISSION_29');
  assert.equal(sealedLine(2, 'gauntlet'), LINES_29.sealed, "SEALED_LINES '2:gauntlet'");
  assert.equal(goalLine('start', 2, 'gauntlet', 5), LINES_29.goalStart.replace('{n}', '5'), 'goalStart at 5');
  assert.equal(goalLine('late', 2, 'gauntlet', 3), LINES_29.goalLate.replace('{n}', '3'), 'goalLate at 3');
  assert.equal(goalLine('late', 2, 'gauntlet', 1), 'Still 1 snapper to chase off', "goalLate says 'snapper' at 1");
  assert.equal(countWord(2, 'gauntlet'), 'snappers', "the HUD counts 'snappers'");
  // (the old rows: the court's two retired, the posted guard's teach, the float, the wayside line and the clue kept, lines-2-9.md :102-104)
  const dot = read('src/game/dotLinesData.ts');
  assert.ok(!/"hint\.2-9\.(court|guards)"/.test(dot), "the hand-built court's hints are gone");
  for (const id of ['hint.2-9.kick', 'float.blocked', 'way.2-9']) assert.ok(dot.includes(`["${id}", "2-9"`), `${id} is kept`);
  assert.ok(read('src/components/stageClue.ts').includes("'2-9': C('A Crooked Crown',"), 'the clue stays');
});

test("2-9 is gen2's: its own row and kit, the hand build deleted (new replaces old)", () => {
  assert.equal(STAGE_TABLE['2-9']?.kit, 'w2-29');
  assert.equal(W2_STAGES['2-9'], undefined, 'w2Stages.ts holds no 2-9 plan');
});

test("2-9: the court lianas' far-bank moss stone stands in its bank's middle, never at the lip he lands on (plainWalk's 50 px step, BUILD-29-f)", () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${d} seed ${s}: no errors`);
    for (const q of st.gen2.sections.filter((q: Any) => /-(let-go|double)$/.test(q.template))) {
      const stones = st.platforms.filter((p: Any) => p.style === 'moss_stone' && p.x >= q.x0 && p.x + p.width <= q.x1);
      const far = stones.at(-1);
      assert.ok(far, `${d} seed ${s} ${q.template}: a far-bank stone`);
      const under = st.platforms.find((p: Any) => p !== far && Math.abs(p.y - (far.y + far.height)) <= 2 && p.x <= far.x && p.x + p.width >= far.x + far.width);
      assert.ok(under, `${d} seed ${s} ${q.template}: the stone at x ${Math.round(far.x)} stands on a bank`);
      const mid = (far.x + far.width / 2 - under.x) / under.width;
      assert.ok(mid > 0.4 && mid < 0.6, `${d} seed ${s} ${q.template}: the stone at ${mid.toFixed(2)} of its ${Math.round(under.width)} px bank`);
    }
  }
});
