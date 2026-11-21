import { homeStage } from '../../../tools/inspect/homeToys.ts';
const st = homeStage(1);
console.log('levelHeight', st.config.levelHeight, 'max platform top', Math.max(...st.platforms.map((p) => p.y)), 'max foot', Math.max(...st.platforms.map((p) => p.y + p.height)), 'deepFall', (st as { deepFall?: number }).deepFall);
