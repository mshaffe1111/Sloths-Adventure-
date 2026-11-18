// BUILD-24b: the built stage's floors, lianas, rivers and flags between x0 and x1 (npx tsx geom24.ts normal 31 15000 17500)
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
const [setting, seed, a, b] = process.argv.slice(2);
setDifficulty(setting as never);
const sim: any = new RealPlay('2-4', Number(seed));
const st: any = sim.stage, x0 = Number(a), x1 = Number(b);
for (const s of st.gen2?.sections ?? []) if (s.x1 > x0 && s.x0 < x1) console.log(`section ${s.template} ${Math.round(s.x0)}-${Math.round(s.x1)}`);
for (const q of sim.platforms) if (q.x + q.width > x0 && q.x < x1) console.log(`plat ${q.type ?? ''} x ${Math.round(q.x)}-${Math.round(q.x + q.width)} y ${Math.round(q.y)}`);
for (const v of st.vines ?? st.lianas ?? []) if (v.x > x0 && v.x < x1) console.log(`vine ${JSON.stringify(v).slice(0, 200)}`);
for (const r of st.rivers ?? []) if (r.x1 > x0 && r.x0 < x1) console.log(`river ${JSON.stringify(r).slice(0, 300)}`);
for (const f of st.checkpoints ?? st.flags ?? []) if (f.x > x0 && f.x < x1) console.log(`flag ${JSON.stringify(f).slice(0, 120)}`);
