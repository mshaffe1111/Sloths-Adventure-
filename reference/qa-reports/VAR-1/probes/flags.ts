// VAR-1 probe: the gated move flags (repeat, like, nothing new) of chosen World 1 stages, layouts a..b, both settings, one line each.
import '../../../../src/game/headlessDom.ts';
import { world, W1 } from '../../../../tools/validate/evaluate.ts';
import { gatedFlags } from '../../../../tools/validate/funcheck.ts';
const [a, b] = (process.argv[2] ?? '1-8').split('-').map(Number);
const only = (process.argv[3] ?? '1-6,1-7,1-8').split(',');
const rules = /^(repeat|like|nothing new)/;
const tally = new Map<string, number[]>();
for (let v = a; v <= b; v++) for (const s of ['normal', 'easy'] as const) for (const ev of world(v, s, W1)) {
  if (!only.includes(ev.id)) continue;
  const fl = gatedFlags(ev).filter((f) => rules.test(f.rule));
  for (const r of new Set(fl.map((f) => f.rule))) { const k = `${ev.id} ${s} ${r}`; tally.set(k, [...(tally.get(k) ?? []), v]); }
  if (process.env.SHOW) console.log(ev.id, 'L' + v, s, ev.str, '|', fl.map((f) => f.what.slice(0, 60)).join(' ; '));
}
for (const [k, v] of [...tally].sort()) console.log(k, v.length, JSON.stringify(v));
