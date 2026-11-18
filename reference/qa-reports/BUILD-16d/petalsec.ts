// BUILD-16d: a section's pieces and every petal in its span with what is under it (SEED, SET, SEC)
import { RealPlay } from '/home/user/Sloths-Adventure-/src/game/realPlay.ts';
import { setDifficulty } from '/home/user/Sloths-Adventure-/src/game/difficulty.ts';
setDifficulty((process.env.SET ?? 'normal') as any);
const st: any = new RealPlay('1-6', Number(process.env.SEED ?? 4)).stage;
const sec = st.gen2.sections.find((s: any) => s.template === `w1-16-${process.env.SEC ?? 'creaky-landing'}`);
const mine = st.platforms.filter((p: any) => p.tag?.startsWith(sec.uid + ':'));
const x0 = Math.min(...mine.map((p: any) => p.x)) - 200, x1 = Math.max(...mine.map((p: any) => p.x + p.width)) + 200;
for (const p of mine) console.log('PLAT', p.tag.split(':')[1], Math.round(p.x), '..', Math.round(p.x + p.width), 'y', Math.round(p.y), p.crumbling || p.creak ? 'CREAK' : '');
for (const p of st.platforms.filter((p: any) => !p.tag && p.x < x1 && p.x + p.width > x0)) console.log('PIT', Math.round(p.x), '..', Math.round(p.x + p.width), 'y', Math.round(p.y));
for (const c of st.collectibles.filter((c: any) => (c.type === 'flower' || c.type === 'leaf') && c.x > x0 && c.x < x1)) console.log('PETAL', Math.round(c.x), Math.round(c.y));
