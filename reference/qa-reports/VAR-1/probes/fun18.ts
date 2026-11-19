// VAR-1b probe: funcheck's gated 1-8 / 1-7 flags with the layouts each is on (funcheck.ts measureBoth). Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { measureBoth } from '../../../../tools/validate/funcheck.ts';
const { gated } = measureBoth();
for (const e of gated.values()) if (/^1-[678]$/.test(e.stage)) console.log(e.stage, e.setting, e.rule, e.on.sort((a, b) => a - b).join(','), '|', e.what.slice(0, 90));
