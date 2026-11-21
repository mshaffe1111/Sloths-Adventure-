// BUILD-26: trace a bot run's stuck spots and rescues on 2-6 (rule 28): each with x, y, time, what, and the beat whose built pieces lie nearest
// usage: npx tsx tools/inspect/b26/trace.ts <bot> <setting> <seed>[,<seed>...]
import '../../../src/game/headlessDom.ts';
import { CAST_BOTS } from '../castBots.ts';
import { firstTimer } from '../firsttimer.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
const [bot, setting, seedsArg] = process.argv.slice(2) as [string, 'normal' | 'easy', string];
const cfg = generateAllLevels().find((c) => c.id === '2-6' && !c.secret)!;
for (const seed of seedsArg.split(',').map(Number)) {
  setDifficulty(setting);
  const row = listedStage('2-6')!;
  const st: any = playFinish(row, buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: setting }) as never, setting);
  // (each built platform's section, by the pipeline's piece record)
  const secs = st.gen2.sections.map((s: any) => ({ name: s.template.replace('w2-26-', ''), ps: (s.pieces ?? []).map((q: any) => q.platform).filter(Boolean) }));
  void secs;
  const wheels = [...new Set(st.platforms.flatMap((p: any) => (p.wheel ? [p.wheel.w] : [])))] as any[];
  for (const w of wheels) console.log(`   wheel ${w.lay?.row} cx ${Math.round(w.cx)} cy ${Math.round(w.cy)} R ${w.R} way ${w.way} jetty ${w.lay?.jetty} street ${w.lay?.streetId}`);
  const beatAt = (x: number, y: number) => st.platforms.filter((p: any) => !p.wheel && p.y >= y - 200 && p.y <= y + 260 && p.x <= x + 300 && p.x + p.width >= x - 300)
    .map((p: any) => `#${p.id} ${p.type}${p.style ? '/' + p.style : ''} x ${Math.round(p.x)}-${Math.round(p.x + p.width)} y ${Math.round(p.y)}`).join('; ');
  const r: any = firstTimer('2-6', seed, CAST_BOTS[bot][setting]!, { cap: 1200, dotSetting: true });
  console.log(`== ${bot} ${setting} seed ${seed}: ${r.end} ${r.time} s rescues ${r.rescues}`);
  for (const s of r.stuck) console.log(`   t ${s.t} x ${s.x} y ${s.y} dur ${s.dur} [${beatAt(s.x, s.y)}] ${s.what}`);
}
