// BUILD-25d scratch: a seed's platforms in an x window (not committed)
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
const [id, seed, a, b] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5]];
const row = listedStage(id)!; const cfg = generateAllLevels().find((l) => l.id === id)!;
const st: any = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: 'normal' });
const R = Math.round;
for (const p of st.platforms.filter((p: any) => p.x + p.width > a && p.x < b).sort((p: any, q: any) => p.x - q.x)) console.log(`${R(p.x)}..${R(p.x + p.width)} y${R(p.y)} ${p.type} ${p.style ?? ''} ${p.pad ? 'pad' : ''}`);
