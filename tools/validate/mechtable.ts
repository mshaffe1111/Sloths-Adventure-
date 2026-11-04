/**
 * R-150.4: the mechanics-in-use table for World 1 (1-1..1-9 and the boss, 1-10). What each stage holds, counted from the stage as the
 * engine builds it (D19) on every layout, and what the first-timer bot actually used on the way, against every mechanic the engine has
 * in any world (STAGE-RULES §0.1 "everything builds on everything", §0b.5 pairs).
 *   npx tsx tools/validate/mechtable.ts [--layouts 16] [--bot 3] [--out reference/qa-reports/validator]
 * Writes <out>/mechanics-world1.md and .json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { stageSpec } from '../../src/game/stagePlan.ts';
import { MECHS, pairsOf, sixThings } from './mechanics.ts';
import { botRun, sim } from './play.ts';

const arg = (k: string, d: string) => {
  const i = process.argv.indexOf(k);
  return i >= 0 ? process.argv[i + 1] : d;
};
const LAYOUTS = Number(arg('--layouts', '16'));
const BOT = Number(arg('--bot', '3'));
const OUT = arg('--out', 'reference/qa-reports/validator');
const IDS = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '1-10'];
type Eng = Record<string, any>;

// every mechanic the engine has: the ones any stage of the game uses (layout 1, Normal)
const inGame = new Map<string, string[]>();
for (const c of generateAllLevels()) {
  if (c.secret) continue;
  let s;
  try {
    s = sim(c.id, 1, 'normal');
  } catch {
    continue;
  }
  for (const m of MECHS) if (m.count(s.stage as Eng, s.e as Eng) > 0) inGame.set(m.id, [...(inGame.get(m.id) ?? []), c.id]);
}

interface Row { id: string; name: string; counts: Record<string, { min: number; max: number; layouts: number }>; six: string[]; pairs: string[]; used: Record<string, string>; bot: string }
const rows: Row[] = [];
for (const id of IDS) {
  const counts: Row['counts'] = {};
  const six = new Set<string>();
  for (let v = 1; v <= LAYOUTS; v++) {
    const s = sim(id, v, 'normal');
    for (const m of MECHS) {
      const k = m.count(s.stage as Eng, s.e as Eng);
      const c = counts[m.id] ?? { min: Infinity, max: 0, layouts: 0 };
      c.min = Math.min(c.min, k);
      c.max = Math.max(c.max, k);
      if (k > 0) c.layouts++;
      counts[m.id] = c;
    }
    for (const t of sixThings(s.stage as Eng, s.e as Eng)) six.add(t);
  }
  // what the bot used (Normal, layouts 1..BOT, trial 0); the boss's arena is not a walk, so no bot there
  const used: Record<string, string> = {};
  let bot = '-';
  if (id !== '1-10') {
    const runs = Array.from({ length: BOT }, (_, i) => botRun(id, i + 1, 'normal', { trial: 0 }));
    const sum = (k: keyof (typeof runs)[0]['met']) => runs.map((r) => r.met[k] ?? 0).join('/');
    Object.assign(used, { liana: sum('swung'), trunk: sum('climbed'), rope: sum('roped'), mushroom: sum('bounced'), breaking: sum('brokeUnder'), bush: sum('hid'), push: sum('pushed'), fights: sum('fought'), eagleHits: sum('eagleHits') });
    bot = runs.map((r) => `${r.run.end} ${Math.round(r.run.time)} s, ${r.run.rescues} rescues`).join('; ');
  }
  const sixArr = [...six];
  rows.push({ id, name: stageSpec(1, Number(id.split('-')[1]))?.name ?? (id === '1-10' ? 'the boss lair (Venom Fang)' : id), counts, six: sixArr, pairs: pairsOf(sixArr), used, bot });
  process.stderr.write(`${id} done\n`);
}

// ----- the markdown -----
const base = execSync('git log --oneline -1').toString().trim().slice(0, 70);
const now = execSync("TZ=America/New_York date '+%Y-%m-%d %-I:%M %p ET'").toString().trim();
const usedW1 = MECHS.filter((m) => rows.some((r) => r.counts[m.id].max > 0));
const cell = (c: { min: number; max: number; layouts: number }) => (c.max === 0 ? '' : c.min === c.max ? `${c.max}` : `${c.min}-${c.max}${c.layouts < LAYOUTS ? ` (${c.layouts}/${LAYOUTS})` : ''}`);
const lines: string[] = [];
lines.push(`# World 1 mechanics in use (R-150.4)`, '', `Made ${now} by tools/validate/mechtable.ts on ${base}. Every stage as the engine builds it (RealPlay: generateStage, withGoals), Normal, layouts 1-${LAYOUTS}. A cell is the count on a layout (min-max over the layouts; "(n/${LAYOUTS})" when only n layouts have it; blank: none on any layout).`, '');
lines.push(`## What each stage holds`, '', `| mechanic | ${IDS.join(' | ')} |`, `|---|${IDS.map(() => '---').join('|')}|`);
for (const m of usedW1) lines.push(`| ${m.label} | ${rows.map((r) => cell(r.counts[m.id])).join(' | ')} |`);
lines.push('', `## The six things and their pairs (STAGE-RULES §0b.5: run, jump, branches, vines, wind, slow; 15 pairs in all)`, '', `| stage | things | pairs |`, `|---|---|---|`);
for (const r of rows) lines.push(`| ${r.id} ${r.name} | ${r.six.join(', ')} | ${r.pairs.length}: ${r.pairs.join(', ')} |`);
const allPairs = new Set(rows.flatMap((r) => r.pairs));
lines.push('', `World 1 shows ${allPairs.size} of the 15 pairs. Wind and slow-downs are not in World 1 at all, so none of their 9 pairs appear.`);
lines.push('', `## What the first-timer bot actually used (Normal, layouts 1-${BOT}, trial 0, the fixed bot; per layout)`, '', `| stage | lianas swung | trunks climbed | ropes | mushroom bounces | branches broken | hid in a bush | logs pushed | animals beaten | eagle hits | the runs |`, `|---|---|---|---|---|---|---|---|---|---|---|`);
for (const r of rows) lines.push(`| ${r.id} | ${r.used.liana ?? '-'} | ${r.used.trunk ?? '-'} | ${r.used.rope ?? '-'} | ${r.used.mushroom ?? '-'} | ${r.used.breaking ?? '-'} | ${r.used.bush ?? '-'} | ${r.used.push ?? '-'} | ${r.used.fights ?? '-'} | ${r.used.eagleHits ?? '-'} | ${r.bot} |`);
lines.push('', 'A run with more than 3 rescues was not really played by the bot (its rescues put it past spots it could not do): read its "used" numbers as a floor. A 0 under "branches broken" on a stage that holds them (1-5) means the run never stood on one: the way on goes along the floor under them (the validator\'s branch probe crosses them on purpose: see its pages).');
// each mechanic: where it first appears, and whether it ever comes back
lines.push('', `## Built once, never back (STAGE-RULES §0.1: a mechanic taught comes back, harder or combined)`, '', `| mechanic | stages that hold it (on any layout) | first | comes back later in World 1? |`, `|---|---|---|---|`);
for (const m of usedW1) {
  if (m.id === 'gap') continue;
  const where = rows.filter((r) => r.counts[m.id].max > 0).map((r) => r.id);
  lines.push(`| ${m.label} | ${where.join(', ')} | ${where[0]} | ${where.length > 1 ? 'yes' : '**no**'} |`);
}
lines.push('', `## What the engine has that World 1 never uses`, '', `| mechanic | where the game uses it |`, `|---|---|`);
for (const m of MECHS) if (!usedW1.includes(m) && inGame.has(m.id)) lines.push(`| ${m.label} | ${inGame.get(m.id)!.slice(0, 6).join(', ')}${inGame.get(m.id)!.length > 6 ? ` and ${inGame.get(m.id)!.length - 6} more` : ''} |`);
lines.push('', '## How it is counted', '', '- From the stage data (tools/validate/mechanics.ts MECHS): platforms by type (mushroom = bouncy, breaking = fragile or a crumble time, moving, lifts, river logs, logs to push), vines by type (lianas, trunks, silk), ropes, updrafts, zones by kind (wind, web, spore, dark, tide, crumbling floor, geyser, bolt), animals by type, the eagle\'s watched stretches and the bushes, the chase, thorn vines, water, puzzle rooms, cages and finds. "gaps to jump" counts solid ledges, a stand-in for how much plain jumping there is.', '- What the player used comes from the first-timer bot playing the real engine (tools/validate/play.ts botRun), frame by frame: starts of a swing, a climb, a rope hang, a bounce, a duck into a bush, a push; breaking pieces broken by the run\'s end; animals beaten; eagle hits.', '- The engine\'s mechanics are those any stage of any world uses on layout 1 (Normal).');
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'mechanics-world1.md'), lines.join('\n') + '\n');
fs.writeFileSync(path.join(OUT, 'mechanics-world1.json'), JSON.stringify({ base, made: now, layouts: LAYOUTS, rows, inGame: Object.fromEntries(inGame) }, null, 1));
process.stderr.write(`wrote ${path.join(OUT, 'mechanics-world1.md')}\n`);
