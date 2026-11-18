// VAR-1b probe: stageQuality's narrow landings (stageMetrics jumpEdges: a landing under 64 px past a 24+ px gap) on a stage's designed
// layout (variant null), with the section each is in. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { generateStage, setLayoutVariant } from '../../../../src/game/stageGenerator.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { jumpEdges } from '../../../../src/game/stageMetrics.ts';
const id = process.argv[2] ?? '1-6';
const l = generateAllLevels().find((c) => c.id === id && !c.secret)!;
setLayoutVariant(null);
const st: any = generateStage(l);
const g = st.gen2 ?? st.proto?.gen2;
const sec = (x: number) => g?.sections.find((s: any) => x >= s.x0 && x < s.x1)?.template;
for (const j of jumpEdges(st)) if (j.to.width < 64 && j.gap >= 24) console.log('narrow', Math.round(j.to.x), Math.round(j.to.width), 'y', j.to.y, 'gap', Math.round(j.gap), 'from', Math.round(j.from.x), j.from.y, sec(j.to.x));
