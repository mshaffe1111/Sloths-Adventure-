// re-run listed cast runs: GEN2_DRAFT=3-1 npx tsx <this> <list.json> <out.jsonl>
import path from 'node:path';
import fs from 'node:fs';
const root = process.cwd();
const [list, out] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
fs.writeFileSync(out, '');
for (const [bot, setting, seed] of JSON.parse(fs.readFileSync(list, 'utf8'))) {
  const r = cb.castRun(bot, setting, '3-1', seed);
  fs.appendFileSync(out, JSON.stringify({ bot, setting, seed, end: r.end, time: r.time, rescues: r.rescues, stuck: r.stuck, dark: r.dark }) + '\n');
}
