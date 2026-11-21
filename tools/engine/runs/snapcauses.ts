// ENG-SNAP: the harms a tier took near the snapper toy's snapper (cause and x), and the snapper's x
// npx tsx tools/engine/runs/snapcauses.ts <bot> <setting> <variant>
import '../../../src/game/headlessDom.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { snapperSeed, snapperWatch, snapperStage } from '../../inspect/snapToys.ts';
const [bot, setting, v] = process.argv.slice(2);
const seed = snapperSeed('snapper');
const a = snapperWatch('snapper', CAST_BOTS[bot][setting as 'normal']!, seed, Number(v));
const st = snapperStage('snapper', seed, setting as 'normal');
console.log(JSON.stringify({ causes: a.causes, snapper: st.enemies.find((e) => e.type === 'turtle')?.x, events: a.events }));
