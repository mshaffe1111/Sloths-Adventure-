import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
const all = generateAllLevels();
console.log('all', all.length, 'nonsecret', all.filter(c=>!c.secret).length);
console.log(all.map(c => c.id + (c.secret?'(s)':'')).join(' '));
