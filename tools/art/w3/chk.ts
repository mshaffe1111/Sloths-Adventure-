import { buildProtoStage, EXPERT_SECONDS } from '../../../src/game/protoStage.ts';
import { validateStage } from '../../../src/game/levelCheck.ts';
import type { LevelConfig } from '../../../src/game/types.ts';
const cfg = (id: string, t: string) => ({ worldIndex: 3, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: t, targetCount: 1, timeLimit: 0, levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0 }) as LevelConfig;
for (const [id, t] of [['3-1', 'sprint'], ['3-2', 'stealth'], ['3-3', 'purge'], ['3-4', 'ascent'], ['3-5', 'stealth'], ['3-6', 'relic_hunt']] as const) {
  let bad = 0;
  for (let i = 0; i < 16; i++) {
    const s = 1 + i * 37;
    const st = buildProtoStage(cfg(id, t), s, id);
    const r = validateStage(st);
    const prow = st.enemies.filter((e) => e.type === 'ocelot' || e.type === 'jaguar').length;
    if (!r.ok) { bad++; if (bad < 4) console.log(id, s, r.errors.slice(0, 4).join(' | ')); }
    if (i < 2) console.log(id, s, 'w', st.config.levelWidth, 'expert', Math.round(st.meta!.timing!.layoutSeconds), 'zones', st.zones?.length, 'decor', st.proto.w3decor?.length, 'prowlers', prow, 'thorns', st.proto.thorns?.length, 'things', st.collectibles.filter((c) => c.type === 'relic').length, 'finds', st.collectibles.filter((c) => c.type === 'find').length, 'flags', st.checkpoints?.length, 'beats', st.proto.beats.map((b) => b[2]).join(','));
  }
  console.log(id, 'bad', bad);
}
