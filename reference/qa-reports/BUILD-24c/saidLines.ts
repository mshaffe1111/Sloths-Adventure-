// BUILD-24c (the lead's check 3:19 PM ET): every line Dot (and Pokey) says in a real playthrough of 2-4 (a tier bot, the real engine), with x
// and t: does 'Flick up to hop up or over.' come back once a player has hopped? (npx tsx saidLines.ts <setting> <seed> [tier])
import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../../tools/inspect/firsttimer.ts';
import { BOTS } from '../../../tools/inspect/tierBots.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
const [setting, seed, tier = 'middle'] = process.argv.slice(2);
setDifficulty(setting as never);
let sim: any = null;
const r: any = firstTimer('2-4', Number(seed), (BOTS as any)[tier][setting], { cap: 1200, onFrame: (s: any) => { sim = s; } });
const said = (sim?.said ?? []) as Array<{ text: string; x: number; t: number }>;
const counts = new Map<string, number>();
for (const l of said) counts.set(l.text, (counts.get(l.text) ?? 0) + 1);
console.log(`${setting} ${tier} s${seed} end ${r.end}: ${said.length} lines`);
for (const l of said) console.log(`  t${l.t.toFixed(1)} x${Math.round(l.x)}: ${l.text}`);
console.log('REPEATS', JSON.stringify([...counts].filter(([, n]) => n > 1)));
