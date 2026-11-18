// VAR-1 probe: per layout, the letters 1-6..1-9 carry on the goal route and what 1-9 adds (old rule). Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { world, W1 } from '../../../../tools/validate/evaluate.ts';
for (let v = 1; v <= 16; v++) for (const s of ['normal', 'easy'] as const) {
  const seen = new Set<string>(); const row: string[] = [];
  for (const ev of world(v, s, W1)) { const mine = new Set(ev.str); if (['1-6','1-7','1-8','1-9'].includes(ev.id)) row.push(`${ev.id}:${[...mine].sort().join('')}${ev.id === '1-9' ? ' new=' + [...mine].filter((m) => !seen.has(m)).join('') : ''}`); for (const m of mine) seen.add(m); }
  console.log('L' + v, s, row.join('  '));
}
