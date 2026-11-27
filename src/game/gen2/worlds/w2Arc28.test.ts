/**
 * w2Arc28.test — 2-8 "Before the Water Rises": the story keeper's words, held word for word (BUILD-28 step 2; level.md rule 17).
 * The keeper's file is reference/story/lines-2-8.md (KEEPER-28, t-keeper-28@943984c2f). The stage's lay tests come with its first clean roll.
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
import { FLOOD_CARD_28, GOAL_LINES_28, LINES_28, MISSION_28, PAGE_28, lineId28 } from './w2Arc28.ts';
import { loadInventory } from '../../art/inventory.ts';

// (ENG-CUT-b's named limit: the lay checks a cut against its world's inventory only once loadInventory(world) has read it; every 2-8
//  build here waits for World 2's, so a cut the inventory refuses fails the island's section by name instead of being laid unchecked)
await loadInventory(2);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

/** the keeper's rows: id (`w28.<key>`) -> the Line column, from both tables (the lines, and the keeper's additions) */
function keeperRows(): Map<string, string> {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-2-8.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const line of md.split('\n')) {
    const cells = line.split(' | ');
    const id = /`(w28\.[A-Za-z0-9]+)`/.exec(cells.find((c) => /`w28\./.test(c)) ?? '')?.[1];
    if (!id || !line.startsWith('|') || cells.length < 4) continue;
    rows.set(id, cells[cells.length - 2].trim());
  }
  return rows;
}

test("2-8's words are the story keeper's, word for word (lines-2-8.md, t-keeper-28@943984c2f), and no keeper line is left out", () => {
  const rows = keeperRows();
  const held = new Map<string, string>([
    ...Object.entries(LINES_28).map(([k, v]) => [lineId28(k as keyof typeof LINES_28), v] as [string, string]),
    ['w28.mission', MISSION_28],
    ['w28.goalStart', GOAL_LINES_28.goalStart],
    ['w28.goalLate', GOAL_LINES_28.goalLate],
    ['w28.floodCard', FLOOD_CARD_28.text],
    ['w28.page', PAGE_28],
  ]);
  assert.equal(rows.size, 12, "the keeper's file has 12 w28 rows (10 lines, the card, the page)");
  for (const [id, line] of rows) assert.equal(held.get(id), line, `${id} is the keeper's line, verbatim`);
  for (const id of held.keys()) assert.ok(rows.has(id), `${id} is a keeper row (no player word that is not the keeper's)`);
  assert.ok(/card name \*\*Rising Water\*\*/.test(fs.readFileSync(path.join(root, 'reference/story/lines-2-8.md'), 'utf8')), 'the card name is the keeper\'s');
  assert.equal(FLOOD_CARD_28.name, 'Rising Water');
});

test('no placeholder ships in 2-8\'s words', () => {
  const all = [...Object.values(LINES_28), MISSION_28, GOAL_LINES_28.goalStart, GOAL_LINES_28.goalLate, FLOOD_CARD_28.name, FLOOD_CARD_28.text, PAGE_28];
  for (const line of all) {
    assert.ok(line.trim().length > 0, 'a line is empty');
    assert.ok(!/TODO|TBD|XXX|placeholder|lorem/i.test(line), `a placeholder: ${line}`);
  }
});

// (BUILD-28-f, ENG-TIPLEFT's finding: the fork-rest brick's job 'rest' fits every R, and the deal gave it n6, the OUTBOUND rest, so Dot's
//  fork line was said on the right leg long before the fork. Its window now pins it to the fork's own rest.)
test("2-8: Dot's fork line is laid at the fork's own rest (the node just before the fork, beside it on the home leg), on seeds 1-40 x both settings", () => {
  const cfg = generateAllLevels().find((c) => c.id === '2-8' && !c.secret)!;
  const bad: string[] = [];
  for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= 40; seed++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (buildGen2Stage({ config: cfg, kit: listedStage('2-8')!.kit(), seed, difficulty: d }) as any).gen2;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tips = g.fills.filter((f: any) => f.role === 'tip' && f.what === 'w28.fork');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const at = (uid: string) => g.sections.find((s: any) => s.uid === uid);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fork = g.sections.find((s: any) => s.template === 'w2-28-fork');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const forkAt = g.plan.findIndex((p: any) => p.template === 'w2-28-fork');
    if (tips.length !== 1 || !fork || forkAt < 1) { bad.push(`${d} ${seed}: ${tips.length} fork lines, fork ${fork ? 'laid' : 'missing'}`); continue; }
    const rest = at(tips[0].section);
    const why = [
      rest?.template !== 'w2-28-fork-rest' && `said in ${rest?.template}`,
      rest?.node !== g.plan[forkAt - 1].node && `said at ${rest?.node}, the fork's rest is ${g.plan[forkAt - 1].node}`,
      // (beside: nothing laid between them on the home leg; a join's hop may part them)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rest && (rest.x0 < fork.x1 - 1 || g.sections.some((s: any) => s !== rest && s !== fork && s.x0 >= fork.x1 - 1 && s.x1 <= rest.x0 + 1 && s.x1 > s.x0))
        && `the rest (${rest.x0}-${rest.x1}) is not beside the fork (${fork.x0}-${fork.x1})`,
      rest && !(tips[0].x >= rest.x0 && tips[0].x <= rest.x1) && `the line x ${tips[0].x} is outside its rest`,
    ].filter(Boolean);
    if (why.length) bad.push(`${d} ${seed}: ${why.join('; ')}`);
  }
  assert.deepEqual(bad, [], bad.slice(0, 6).join('\n'));
});

// (BUILD-28-f, the lead's ruling (b): the reed island stands IN the water: a porch over the channel, the river under its whole width, its
//  surface about 42 px under the island's top, as cut; 340 wide on Normal, the row's stand line; Easy's landing widening is accepted)
test('2-8: the reed island stands in the water (the river under its whole width, its surface 35-50 px under its top), 340 wide on Normal, wearing its painted cut (w2-reed28#reed-isle-28), seeds 1-40 x both settings', () => {
  const cfg = generateAllLevels().find((c) => c.id === '2-8' && !c.secret)!;
  const row = listedStage('2-8')!;
  const bad: string[] = [];
  for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= 40; seed++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const st0 = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d }) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sec = st0.gen2.sections.find((s: any) => s.template === 'w2-28-island');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const st = worldFinish(row)(st0, false, d) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cage = st0.gen2.fills.find((f: any) => f.socket === 'cage3');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isl = st.platforms.find((p: any) => cage && p.x <= cage.x && p.x + p.width >= cage.x && p.y >= cage.y - 5 && p.y <= cage.y + 60);
    if (!sec || !isl) { bad.push(`${d} ${seed}: no island under cage 3`); continue; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const under = (st.rivers ?? []).find((r: any) => r.x0 <= isl.x && r.x1 >= isl.x + isl.width && r.surfaceY > isl.y);
    const why = [
      !under && `no river under its whole width (${Math.round(isl.x)}+${isl.width})`,
      under && !(under.surfaceY - isl.y >= 35 && under.surfaceY - isl.y <= 50) && `the surface is ${under.surfaceY - isl.y} px under its top`,
      d === 'normal' && isl.width !== 340 && `${isl.width} px wide, not 340`,
      isl.cut !== 'w2-reed28#reed-isle-28' && `it wears cut '${isl.cut}', not the reed island's painted piece`,
    ].filter(Boolean);
    if (why.length) bad.push(`${d} ${seed}: ${why.join('; ')}`);
  }
  assert.deepEqual(bad, [], bad.slice(0, 6).join('\n'));
});
