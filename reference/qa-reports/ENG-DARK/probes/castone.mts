import path from 'node:path';
const root = process.cwd();
const [bot, setting, seed] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const r = cb.castRun(bot, setting, '3-1', Number(seed));
console.log(bot, setting, seed, r.end, r.time, r.rescues, JSON.stringify(r.dark));
