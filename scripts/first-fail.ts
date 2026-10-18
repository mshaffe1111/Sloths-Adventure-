import { generateAllLevels } from '../src/game/worldsData.ts';
import { buildStage } from '../src/game/stageGenerator.ts';
import { validateStage } from '../src/game/levelCheck.ts';
for (const l of generateAllLevels()) {
  const st = buildStage(l, 0);
  const r = validateStage(st);
  if (!r.ok) console.log(l.id, l.objectiveType, r.errors.slice(0, 3), '\n   ', st.meta!.chunks.join(' '));
}
