// [WR] reads flipped by wayRises, and the run's unlit lines + stuck spots: npx tsx wr.mts <bot> <setting> <seed>
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts')); readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [bot, setting, seed] = process.argv.slice(2);
const r = ft.firstTimer('3-1', Number(seed), cb.CAST_BOTS[bot][setting], { cap: 1200, dotSetting: true });
console.log(`END ${bot} ${setting} ${seed} ${r.end} t ${r.t?.toFixed?.(1)}`);
for (const u of r.dark?.unlit ?? []) console.log('UNLIT', u);
for (const s of r.stuck ?? []) console.log('STUCK', Math.round(s.x), Math.round(s.y), s.t?.toFixed?.(1), s.what);
