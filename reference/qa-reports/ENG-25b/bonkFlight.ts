// npx tsx reference/qa-reports/ENG-25b/bonkFlight.ts [normal|easy]
/**
 * BONK-AFTER-THE-SNAP, flown (ENG-25b; 2-5.md NEW 2, level.md rule 24). Pokey is the real engine at 30 fps (realPlay.ts) with the game's own
 * InputEngine on it (a tap's minimum hold, as reference/specs/sims/flight.ts); the snapper is ENG-25's row laid by gen2 (snapToys.ts
 * snapperKit: World 2's kit row on its stones' bar `snap-step`, the cast's CastPlay running it on the beat), on the far bank's flat.
 * 1. THE BOUNCE: he stands D px short of it, taps (or presses and holds) jump with his steer held toward it; on the stomp the engine sends
 *    him up at -460 (let go) or -620 (held) px/s (engine.ts resolveStomps, a cast animal). Read: the bounce's apex over the bank and over
 *    the snapper's back, the frames in the air from the stomp to the next landing, and how far along he lands.
 * 2. THE WINDOW: the same hop started at every frame of one bar (Normal 3.0 s, Easy 4.5 s): stomped clean / bitten / missed. He stands
 *    still before it (stillness.ts: a still sloth is hidden from it, so it keeps to its post and its count).
 */
import { DT, RealPlay } from '../../../src/game/realPlay.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import { beatOf } from '../../../src/game/clock.ts';
import { onSnapper, snapperCfg, snapperSeed, SNAPPER_ID } from '../../../tools/inspect/snapToys.ts';
import type { Enemy } from '../../../src/game/types.ts';

const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
const seed = snapperSeed('snapper');

interface Out { stomp: number; hit: boolean; apexBank: number; apexBack: number; air: number; landDx: number }

function fly(D: number, holdMs: number, wait: number): Out {
  return onSnapper('snapper', seed, setting, () => {
    const r = new RealPlay(SNAPPER_ID, seed, snapperCfg);
    r.safe = false;
    const e = (r as any).e;
    const m: Enemy = e.enemies.find((q: Enemy) => q.type === 'turtle');
    const ground = m.y + m.height / 2 + 14 - 14; // its feet's y: s.y = e.y + foot (w2Cast BODY footY 14)
    const feet = (e.cast.members[0].s.y as number);
    const inp = new InputEngine();
    inp.source = 'pad';
    e.input = inp;
    r.stand(m.x - D, feet);
    r.p.invincibleTimer = 0;
    r.p.facing = 1;
    inp.clearAll();
    for (let f = 0; f < wait; f++) e.update(DT);
    const hp = r.p.hp;
    inp.triggerTouchMove('right');
    inp.triggerTouchUp(0, holdMs);
    const lift = Math.max(2, Math.round(holdMs / 1000 / DT));
    let stompF = -1, top = Infinity, landX = NaN, hit = false;
    for (let f = 0; f < 90; f++) {
      if (f === lift) inp.releaseTouchUp();
      e.update(DT);
      if (r.p.hp < hp) hit = true;
      if (stompF < 0 && m.kit?.beatenBy === 'stomp') stompF = f;
      if (stompF >= 0) {
        top = Math.min(top, r.p.y);
        if (f > stompF + 1 && r.p.grounded) { landX = r.p.x; break; }
      }
    }
    void ground;
    const back = feet - 24; // the snapper's back (its body 24 tall over its feet)
    return { stomp: stompF, hit, apexBank: Math.round(feet - top), apexBack: Math.round(back - top), air: stompF >= 0 && !Number.isNaN(landX) ? 0 : -1, landDx: Math.round(landX - m.x) };
  });
}

// 1. the bounce: a tap (80 ms, let go before the stomp) and a press held through it, from 60/70/80 px
console.log(`${setting}: seed ${seed}`);
for (const [name, ms] of [['tap 80 ms', 80], ['held 1500 ms', 1500]] as const) {
  for (const D of ms === 80 ? [50, 60, 70, 80, 90] : [100, 120, 140, 160, 180, 200, 220]) {
    const o = fly(D, ms, 3);
    if (o.stomp < 0) { console.log(`  bounce ${name}, from ${D} px: no stomp (hit ${o.hit})`); continue; }
    console.log(`  bounce ${name}, from ${D} px: stomp at frame ${o.stomp}, hit ${o.hit}, apex ${o.apexBank} px over the bank (${o.apexBack} over its back), lands ${o.landDx} px past its middle`);
  }
}

// 2. the window: the tap from 70 px started at every frame of one bar; what the bar was at the start (its count, from the stage clock)
const bar = onSnapper('snapper', seed, setting, () => {
  const r = new RealPlay(SNAPPER_ID, seed, snapperCfg);
  const def = ((r as any).e.currentStage.clocks ?? []).find((c: any) => c.id === 'snap-step');
  return beatOf(def, setting === 'easy').period;
});
const n = Math.round(bar / DT);
const rows: string[] = [];
let clean = 0, bit = 0, miss = 0;
for (let k = 0; k < n; k++) {
  const o = fly(70, 80, 3 + k);
  const what = o.hit ? 'BITTEN' : o.stomp >= 0 ? 'stomp' : 'miss';
  if (what === 'stomp') clean++; else if (what === 'BITTEN') bit++; else miss++;
  rows.push(`${k}:${what}`);
}
console.log(`  window (tap from 70 px, still before it), ${n} starts round a ${bar.toFixed(2)} s bar: ${clean} stomped clean, ${bit} bitten, ${miss} missed`);
console.log(`  ${rows.join(' ')}`);

// 3. the walk-in kick (no bonk): from 160 px he walks at it (moving: it sees him) and kicks once within 56 px, started at every frame of
//    one bar: chased off clean / bitten. The part of the bar a head-on kick may start in is what "wait for the snap" buys
function walkKick(wait: number): { cleared: boolean; hit: boolean } {
  return onSnapper('snapper', seed, setting, () => {
    const r = new RealPlay(SNAPPER_ID, seed, snapperCfg);
    r.safe = false;
    const e = (r as any).e;
    const m: Enemy = e.enemies.find((q: Enemy) => q.type === 'turtle');
    const feet = e.cast.members[0].s.y as number;
    const inp = new InputEngine();
    inp.source = 'pad';
    e.input = inp;
    r.stand(m.x - 160, feet);
    r.p.invincibleTimer = 0;
    r.p.facing = 1;
    inp.clearAll();
    for (let f = 0; f < wait; f++) e.update(DT);
    const hp = r.p.hp;
    inp.triggerTouchMove('right');
    let kicked = false, hit = false;
    for (let f = 0; f < 120; f++) {
      if (!kicked && m.x - r.p.x <= 56) { inp.triggerTouchMove('none'); inp.triggerTouchKick(1); kicked = true; }
      e.update(DT);
      if (r.p.hp < hp) hit = true;
      if (m.kit?.leaving) break;
    }
    return { cleared: !!m.kit?.leaving, hit };
  });
}
{
  const rows: string[] = [];
  let ok = 0, bit = 0, none = 0;
  for (let k = 0; k < n; k++) {
    const o = walkKick(3 + k);
    const what = o.hit ? 'BITTEN' : o.cleared ? 'off' : 'none';
    if (what === 'off') ok++; else if (what === 'BITTEN') bit++; else none++;
    rows.push(`${k}:${what}`);
  }
  console.log(`  walk-in kick from 160 px, ${n} starts round the bar: ${ok} chased off clean, ${bit} bitten, ${none} neither`);
  console.log(`  ${rows.join(' ')}`);
}
