// Critic's run: which gen2 stages have water (gen2Water, the game's own test) against the move table's "water / river" row (MECHS).
import '../../../src/game/headlessDom.ts';
import { GEN2_STAGES, gen2Water } from '../../../src/game/gen2/game.ts';
import fs from 'node:fs';
const ml = JSON.parse(fs.readFileSync(new URL('../moveladder.json', import.meta.url), 'utf8'));
const mechWater = new Set(ml.rows.find((r: any) => r.id === 'water').stages);
const ids = Object.keys(GEN2_STAGES);
const wet = ids.filter((id) => gen2Water(id));
console.log(`gen2 stages: ${ids.length}; with water by gen2Water: ${wet.length} (${wet.join(' ')})`);
console.log(`of those, the move table's water row sees: ${wet.filter((id) => mechWater.has(id)).length}`);
