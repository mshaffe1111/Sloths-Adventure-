// BUILD-26: hearts on the PLAYED stage (RealPlay) per stage id and setting
import '../../../src/game/headlessDom.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
for (const id of process.argv.slice(2)) for (const d of ['normal', 'easy'] as const) { setDifficulty(d); const r = new RealPlay(id, 1); console.log(id, d, 'hearts', r.stage.collectibles.filter((c) => c.type === 'heart' || c.type === 'super_heart').length, 'flags', (r.stage.checkpoints ?? []).length); }
