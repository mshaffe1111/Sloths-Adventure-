// VAR-1 probe: what each World 1 stage's goal-route str holds by letter, and what 1-7/1-8 add (old rule: letters new to str). Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { world, W1 } from '../../../../tools/validate/evaluate.ts';
const v = Number(process.argv[2] ?? 1), s = (process.argv[3] ?? 'normal') as 'normal' | 'easy';
const seen = new Set<string>();
for (const ev of world(v, s, W1)) {
  const mine = new Set(ev.str);
  console.log(ev.id, 'letters', [...mine].sort().join(''), 'new', [...mine].filter((m) => !seen.has(m)).join(''));
  for (const m of mine) seen.add(m);
}
