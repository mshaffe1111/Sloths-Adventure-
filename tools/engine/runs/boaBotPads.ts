/**
 * ENG-19b: a tier bot's thumb on boaClip.mjs's toy (one bough, a boa of the cast 640 px from where he stands, facing him), recorded frame
 * by frame for the clip to replay through the real touch pad (boaClip.mjs `bot`). The bot is the real one (firsttimer.ts, told to
 * freeze as a player who met 1-9's beat 2), on the real engine; its run is printed (hits, how the boa was beaten) so the clip claims
 * only what the bot did.
 *   npx tsx tools/engine/runs/boaBotPads.ts <out.json> [middle|expert|child] [seed]
 */
import fs from 'node:fs';
import { FirstTimerRun, FT_CHILD, FT_EXPERT, FT_MIDDLE, freshPhone, rng } from '../../inspect/firsttimer.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import type { Enemy, Platform } from '../../../src/game/types.ts';

const [out, tier = 'middle', seedArg = '1'] = process.argv.slice(2);
const who = { middle: FT_MIDDLE, expert: FT_EXPERT, child: FT_CHILD }[tier]!;
const seed = Number(seedArg), Y = 500, X0 = 300, BX = X0 + 840;
freshPhone(who.setting);
setDifficulty(who.setting);
Math.random = rng(seed);
const route = Array.from({ length: 40 }, (_, i) => ({ x: X0 + 200 + i * 40, y: Y }));
const run = new FirstTimerRun('1-2', seed, who, { route, cap: 12, knows: ['freeze'] });
const sim = run.sim as any; // eslint-disable-line @typescript-eslint/no-explicit-any
const e = sim.e;
sim.bare([{ id: 9901, x: X0, y: Y, width: 1600, height: 26, type: 'solid' } as Platform]);
const boa = { id: 9902, type: 'boa', x: BX, y: Y - 16, vx: 0, vy: 0, width: 58, height: 26, hp: 1, maxHp: 1, facing: -1, patrolMinX: BX, patrolMaxX: BX,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0 } as Enemy;
e.enemies.length = 0;
e.enemies.push(boa);
e.proto = { hints: [], covers: [], beats: [], cast: { kinds: ['boa'], traps: [] } };
e.startCast();
e.checkpoint = { x: X0 + 200, y: Y };
sim.stand(X0 + 200, Y);
e.player.hp = e.player.maxHp;
const pads: number[] = [];
let hits = 0;
const frame = sim.frame.bind(sim);
sim.frame = (pad: { right?: boolean; left?: boolean; jump?: boolean }) => {
  if (pad?.left || pad?.jump) throw new Error('the replay carries only the right thumb: this run pressed another');
  const hp = e.player.hp;
  frame(pad);
  pads.push(pad?.right ? 1 : 0);
  if (e.player.hp < hp) hits++;
  if (pads.length >= 150) throw new Error('enough');
};
try { run.play(); } catch (err) { if ((err as Error).message !== 'enough') throw err; }
fs.writeFileSync(out, JSON.stringify(pads));
console.log(JSON.stringify({ tier, seed, frames: pads.length, hits, beaten: boa.kit?.beatenBy ?? null, x: Math.round(e.player.x) }));
