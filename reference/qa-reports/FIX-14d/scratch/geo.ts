import { RealPlay } from '../../src/game/realPlay.ts';
const [seed, easy, x0, x1] = process.argv.slice(2).map(Number);
if (easy) (globalThis as any).localStorage = { getItem: (k: string) => (k === 'sloth_difficulty' ? 'easy' : null), setItem() {}, removeItem() {} };
const sim = new RealPlay('1-4', seed);
const st: any = sim.stage;
console.log('width', st.width ?? st.levelWidth, 'player', JSON.stringify(st.playerStart ?? st.start));
for (const p of st.platforms) if (p.x + p.width >= x0 && p.x <= x1) console.log('P', Math.round(p.x), Math.round(p.x + p.width), 'y', Math.round(p.y), p.type, p.creak ? 'creak' : '', p.crumbleAfter ? 'crumble' : '', p.broken ? 'broken' : '');
for (const v of st.vines ?? []) if (v.x >= x0 && v.x <= x1) console.log('V', Math.round(v.x), 'top', v.topY, 'bot', v.bottomY, v.vineType);
