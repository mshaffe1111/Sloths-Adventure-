import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';
import { levelConfig } from '../../src/game/realPlay.ts';
import { hiddenEdges } from '../../src/game/vineTop.ts';
const [a, b] = process.argv[2].split('-').map(Number); let n = 0, bad = 0; const ex: string[] = [];
for (let seed = a; seed <= b; seed++) for (const difficulty of ['normal', 'easy'] as const) {
  let st: any; try { st = buildGen2Stage({ config: levelConfig('1-4'), kit: listedStage('1-4')!.kit(), seed, difficulty }); } catch { continue; }
  n++; const h = hiddenEdges(st.platforms, st.gen2.tower.width); if (h.length) { bad++; if (ex.length < 8) ex.push(`${seed} ${difficulty}: ${h.join('; ')}`); }
}
console.log('built', n, 'with hidden edges', bad); for (const e of ex) console.log(' ', e);
