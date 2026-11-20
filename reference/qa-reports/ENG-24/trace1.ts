import { fixtureSeed, lianaRun } from '../../../tools/inspect/lianaRiverToys.ts';
const seed = fixtureSeed('drop', 'gap280', ['normal', 'easy'], 'deep')!;
if (process.env.NOVFL) (await import('../../../tools/inspect/firsttimer.ts')).SKILLS.vineFromLog = false;
const r = lianaRun('drop', 'gap280', (process.env.TIER ?? 'middle') as never, 'normal', seed, Number(process.env.VAR ?? 1), 'deep', { realInput: true });
console.log(JSON.stringify(r.pieces), r.ontoLog, r.fromLog);
