// BUILD-16d: the pieces of a 1-6 section (SEED, SET, SEC=chain): platforms and vines with tags, x, y, width
import { RealPlay } from '/home/user/Sloths-Adventure-/src/game/realPlay.ts';
import { setDifficulty } from '/home/user/Sloths-Adventure-/src/game/difficulty.ts';
const set = (process.env.SET ?? 'normal') as any; setDifficulty(set);
const st: any = new RealPlay('1-6', Number(process.env.SEED ?? 2)).stage;
const sec = st.gen2.sections.find((s: any) => s.template === `w1-16-${process.env.SEC ?? 'chain'}`);
const mine = (t?: string) => t?.startsWith(sec.uid + ':');
for (const p of st.platforms.filter((p: any) => mine(p.tag))) console.log('PLAT', p.tag.split(':')[1], 'x', Math.round(p.x), '..', Math.round(p.x + p.width), 'y', Math.round(p.y), p.hurt ? 'HURT' : '', p.crumbling ? 'CREAK' : '');
for (const v of st.vines.filter((v: any) => mine(v.tag))) console.log('VINE', v.tag.split(':')[1], 'x', Math.round(v.x), 'y', Math.round(v.y), 'len', Math.round(v.length ?? v.len ?? 0), v.vineType);
const xs = st.platforms.filter((p: any) => mine(p.tag)).map((p: any) => p.x);
const x0 = Math.min(...xs), x1 = Math.max(...xs) + 400;
for (const p of st.platforms.filter((p: any) => !p.tag && p.x + p.width > x0 && p.x < x1)) console.log('UNTAGGED', Math.round(p.x), '..', Math.round(p.x + p.width), 'y', Math.round(p.y), JSON.stringify(Object.keys(p).filter((k) => p[k] === true)));
for (const h of (st.hazards ?? []).filter((h: any) => h.x + (h.width ?? 0) > x0 && h.x < x1)) console.log('HAZ', h.type, Math.round(h.x), Math.round(h.width ?? 0), Math.round(h.y));
