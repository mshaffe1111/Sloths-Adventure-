// ENG-26 probe: why Easy cannot lay Normal's plan on a wheel toy (relative imports, D83)
import { toyStage, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
const st = toyStage((process.argv[2] ?? 'teach') as WheelToy, Number(process.argv[3] ?? 1), 'easy');
console.log(JSON.stringify(st.gen2.errors, null, 1).slice(0, 3000));
