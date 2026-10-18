import { generateAllLevels } from '../src/game/worldsData.ts';
import { buildStage } from '../src/game/stageGenerator.ts';
const rows = generateAllLevels().map((l) => `${l.id}:${l.objectiveType.slice(0,4)}:${l.levelWidth}->${buildStage(l,0).config.levelWidth}`);
console.log(rows.join('  '));
