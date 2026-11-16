// INT-10b: 8-3 Normal layouts 1-3 as softFalls11.test builds them: the MAIN pin hash, and with DUMP=L the pieces (JSON) for a diff
import { createHash } from 'node:crypto';
import '../../../src/game/headlessDom.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
const cfg = generateAllLevels().find((l) => l.id === '8-3')!;
const out: string[] = [];
for (const v of [1, 2, 3]) {
  setLayoutVariant(v);
  const st = generateStage({ ...cfg, unlocked: true }, 'normal') as unknown as { platforms: Array<{ x: number; y: number; width: number; height: number }>; heartFalls?: unknown; gen2?: { falls?: unknown } };
  setLayoutVariant(null);
  out.push(createHash('sha256').update(JSON.stringify({ platforms: st.platforms, heartFalls: st.heartFalls ?? null, falls: st.gen2?.falls ?? null })).digest('hex').slice(0, 16));
  if (process.env.DUMP === String(v)) for (const p of st.platforms) console.error(`${Math.round(p.x)} ${Math.round(p.y)} ${Math.round(p.width)} ${Math.round(p.height)}`);
}
console.log(out.join(' '));
