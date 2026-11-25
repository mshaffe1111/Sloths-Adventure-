// one cast bot run with bot fields set (ENG-DARK-j): GEN2_DRAFT=3-1 npx tsx <this> <bot> <setting> <seed> <field=1,...>
// prints the end, time, rescues, dark, and every stuck spot (x, y, t, what)
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seed, fields] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const who = { ...cb.CAST_BOTS[bot][setting], ...Object.fromEntries((fields ?? '').split(',').filter(Boolean).map((f) => [f.split('=')[0], true])) };
const r = ft.firstTimer('3-1', Number(seed), who, { dotSetting: true });
console.log(bot, setting, seed, r.end, r.time, JSON.stringify(r.dark));
for (const s of r.stuck) console.log('stuck', s.x, s.y, s.t, s.rescued ? 'rescued' : '', s.what);
