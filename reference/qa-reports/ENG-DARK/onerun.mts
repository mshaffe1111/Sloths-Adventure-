// one bot run on the 3-1 draft from the tree in cwd: every rescue with x, y, t (castBots strips y and t)
// npx tsx onerun.mts <bot> <setting> <seed>
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seedArg] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const { firstTimer } = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const who = cb.CAST_BOTS[bot][setting];
const r = firstTimer('3-1', Number(seedArg), who, {});
console.log(bot, setting, seedArg, 'end', r.end, 't', r.time?.toFixed?.(1), 'rescues', r.rescues, 'dark', JSON.stringify(r.dark ?? null));
for (const s of r.stuck) console.log('  stuck', JSON.stringify({ x: s.x, y: s.y, t: s.t, what: s.what }));
