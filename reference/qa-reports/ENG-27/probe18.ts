import { homeRun } from '../../../tools/inspect/homeToys.ts';
const RIGHT = 'A Pg1> Xw1> R /D Dc_ /R Pf1> Pw1> Mg1> Ww1> R Sw1> E';
for (const seed of [2, 3]) { const r = homeRun('middle', 'normal', seed, 1, {}, RIGHT); console.log('home RIGHT seed', seed, r.end, r.finishSeconds, 'lives', r.lives, 'rescues', r.rescues); }
