// VAR-1 probe: what the game's own build (RealPlay, the listed plan) holds near x: platforms, vines, enemies, bushes. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [id, seed, d, x0] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy', Number(process.argv[5])];
setDifficulty(d);
const st: any = new RealPlay(id, seed).stage;
const near = (a: number, b: number) => b > x0 - 600 && a < x0 + 400;
for (const p of st.platforms.filter((p: any) => near(p.x, p.x + p.width)).sort((a: any, b: any) => a.x - b.x)) console.log('plat', Math.round(p.x), Math.round(p.x + p.width), 'y', Math.round(p.y), p.type, p.style ?? '', p.decorative ? 'deco' : '');
for (const v of st.vines.filter((v: any) => near(v.x, v.x))) console.log('vine', Math.round(v.x), Math.round(v.y), Math.round(v.h ?? v.length ?? 0));
for (const e of st.enemies.filter((e: any) => near(e.patrolMinX ?? e.x, e.patrolMaxX ?? e.x))) console.log('enemy', e.type, Math.round(e.x), Math.round(e.y), Math.round(e.patrolMinX), Math.round(e.patrolMaxX));
for (const b of st.proto?.bushes ?? []) if (near(b.x, b.x + (b.w ?? 0))) console.log('bush', JSON.stringify(b).slice(0, 140));
