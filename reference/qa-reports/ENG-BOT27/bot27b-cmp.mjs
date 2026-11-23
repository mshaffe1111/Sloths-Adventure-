// ENG-BOT27b: rule 28 table from two row files (off = base, on = reAim child-only). node cmp.mjs <stage> <off.jsonl> <on.jsonl> [floor]
import fs from 'node:fs';
const [stage, offF, onF, floorArg] = process.argv.slice(2);
const floor = Number(floorArg ?? 120);
const read = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
const off = read(offF), on = read(onF);
const key = (r) => `${r.bot}|${r.setting}|${r.seed}`;
const sig = (r) => JSON.stringify([r.end, r.pass, r.time, r.rescues, r.lives, r.hits, r.turnBacks, r.goal, r.hitBy, r.stuck, r.error ?? null]);
const offBy = new Map(off.map((r) => [key(r), r]));
const groups = [...new Set(on.map((r) => `${r.bot}|${r.setting}`))];
console.log(`${stage}: rows off ${off.length}, on ${on.length}`);
console.log('bot    set     pass off->on  lives off->on  rescues off->on  rows identical  moved (seed: pass/lives/rescues/time off -> on)');
let flips = 0;
for (const g of groups) {
  const [bot, setting] = g.split('|');
  const O = on.filter((r) => r.bot === bot && r.setting === setting).sort((a, b) => a.seed - b.seed);
  const B = O.map((r) => offBy.get(key(r)));
  if (B.some((b) => !b)) { console.log(`${bot} ${setting}: base rows missing`); continue; }
  const sum = (R, f) => R.reduce((s, r) => s + f(r), 0);
  const moved = O.filter((r, i) => sig(r) !== sig(B[i]));
  const fmt = (r) => `${r.pass ? 'P' : 'F'}/${r.lives}/${r.rescues}/${Math.round(r.time)}`;
  for (let i = 0; i < O.length; i++) if (B[i].pass && !O[i].pass) flips++;
  console.log(`${bot.padEnd(6)} ${setting.padEnd(7)} ${String(sum(B, (r) => +r.pass)).padStart(2)}->${String(sum(O, (r) => +r.pass)).padEnd(4)}     ${String(sum(B, (r) => r.lives)).padStart(3)}->${String(sum(O, (r) => r.lives)).padEnd(4)}      ${String(sum(B, (r) => r.rescues)).padStart(2)}->${String(sum(O, (r) => r.rescues)).padEnd(4)}        ${moved.length ? 'NO' : 'YES'} ${O.length - moved.length}/${O.length}   ${moved.map((r) => `${r.seed}:${fmt(offBy.get(key(r)))}->${fmt(r)}`).join(' ')}`);
}
console.log(`pass -> fail flips: ${flips}`);
const bar = (R) => {
  const seeds = [...new Set(R.map((r) => r.seed))].sort((a, b) => a - b);
  const BAR = ['adult', 'child', 'middle', 'expert'];
  const ok = seeds.filter((s) => R.filter((r) => r.seed === s && BAR.includes(r.bot)).every((r) => r.pass && r.rescues === 0 && r.time >= floor));
  const out = seeds.filter((s) => !ok.includes(s)).map((s) => `${s} (${R.filter((r) => r.seed === s && BAR.includes(r.bot) && !(r.pass && r.rescues === 0 && r.time >= floor)).map((r) => `${r.bot} ${r.setting[0].toUpperCase()}${r.pass ? (r.rescues ? ` rx${r.rescues}` : ` ${r.time}s`) : ` ${r.end}${r.rescues ? ` rx${r.rescues}` : ''}`}`).join(', ')})`);
  return { n: ok.length, of: seeds.length, ok, out };
};
const b0 = bar(off), b1 = bar(on);
console.log(`bar (adult, child, middle, expert; both settings; pass, 0 rescues, >= ${floor} s): off ${b0.n}/${b0.of} -> on ${b1.n}/${b1.of}`);
console.log(`  on, proven seeds: ${b1.ok.join(',')}`);
console.log(`  on, out: ${b1.out.join('; ')}`);
