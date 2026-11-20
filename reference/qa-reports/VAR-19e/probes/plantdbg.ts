// VAR-19e probe: the plant's eagle (plainWalk R-165.328) before and through the planted face
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
const sim: any = new RealPlay('1-9', 1); sim.input.source = 'gesture';
const ms = () => sim.e.cast.members.filter((m: any) => m.def.kind === 'eagle');
for (const m of ms()) console.log(JSON.stringify({ minX: m.s.minX, maxX: m.s.maxX, free: m.s.free, passes: m.s.passes, passesLeft: m.s.passesLeft, phase: m.s.phase }));
const sp: any = sim;
const [a, b] = [ms()[0].s.minX, ms()[0].s.maxX];
// (the plainWalk faces are found by the test's own helper; here: every solid block's left face inside the rounds)
const faces = sim.platforms.filter((q: any) => q.type === 'solid' && q.height >= 50 && q.x - 70 >= a && q.x <= b).map((q: any) => q.x);
console.log('faces in rounds', faces.map(Math.round).join(' '));
const x = faces[0];
const fl = sim.platforms.filter((q: any) => q.x < x - 10 && q.x + q.width > x - 10 && q.type === 'solid').sort((p: any, q: any) => p.y - q.y)[0];
sp.stand(x - 70, fl.y); sp.calmCast();
const m = ms()[0];
Object.assign(m.s, { phase: 'tell', t: 0, eyeX: sim.p.x, x: sim.p.x, aimX: sim.p.x, aimY: sim.p.y, saw: true, knows: true });
sp.safe = false; sim.p.invincibleTimer = 0;
let last = '';
for (let i = 0; i < 60; i++) { sp.frame({ right: true }); const k = `${m.s.phase}`; if (k !== last) { console.log(`f${i} he x${Math.round(sim.p.x)} y${Math.round(sim.p.y)} hp${sim.p.hp} cov? eagle ${m.s.phase} x${Math.round(m.s.x)} y${Math.round(m.s.y)} aim ${Math.round(m.s.aimX)},${Math.round(m.s.aimY)}`); last = k; } }
