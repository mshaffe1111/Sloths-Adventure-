// ENG-BOT27b scratch runner: castRun rows for one stage with SKILLS.reAim set on or off (the off flight is the base: the gate is the only
// reader of SKILLS.reAim and WaitAim.since). Usage (cwd = the frozen tree):
//   node --import tsx run.ts <tree> <stage> <bots> <reaim on|off> <seeds a-b> <par> <out.jsonl>
// A child (argv[2] === '--child') runs its seed list and prints JSON rows.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const child = process.argv[2] === '--child';
const [tree, stage, botsArg, reaim, seedsArg, parArg, out] = process.argv.slice(child ? 3 : 2);
const bots = botsArg.split(',');
const range = (s: string) => s.split(',').flatMap((p) => { const [a, b] = p.split('-').map(Number); return Array.from({ length: (b ?? a) - a + 1 }, (_, i) => a + i); });
const seeds = range(seedsArg);

if (child) {
  const ft = await import(`${tree}/tools/inspect/firsttimer.ts`);
  const cb = await import(`${tree}/tools/inspect/castBots.ts`);
  if (!('reAim' in ft.SKILLS)) throw new Error('no SKILLS.reAim in this tree');
  ft.SKILLS.reAim = reaim === 'on';
  for (const bot of bots) for (const setting of ['normal', 'easy']) {
    if (!cb.CAST_BOTS[bot]?.[setting]) continue;
    for (const seed of seeds) {
      let row;
      try { row = cb.castRun(bot, setting, stage, seed, 'fake'); } catch (err) { row = { bot, setting, stage, seed, end: 'stranded', pass: false, time: 0, rescues: 0, lives: 0, error: String(err).slice(0, 200) }; }
      console.log(JSON.stringify({ ...row, cast: undefined, reaim }));
    }
  }
} else {
  const par = Number(parArg);
  const chunks = Array.from({ length: par }, (_, i) => seeds.filter((_, j) => j % par === i)).filter((c) => c.length);
  const rows: unknown[] = [];
  await Promise.all(chunks.map((c) => new Promise<void>((res) => {
    const ch = spawn(process.execPath, ['--import', 'tsx', process.argv[1], '--child', tree, stage, botsArg, reaim, c.join(','), '1', out], { stdio: ['ignore', 'pipe', 'inherit'], cwd: tree });
    let buf = '';
    ch.stdout.on('data', (b) => (buf += b));
    ch.on('close', () => { for (const l of buf.split('\n')) if (l.startsWith('{')) rows.push(JSON.parse(l)); res(); });
  })));
  fs.writeFileSync(out, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(`${stage} reaim ${reaim}: ${rows.length} rows -> ${out}`);
}
