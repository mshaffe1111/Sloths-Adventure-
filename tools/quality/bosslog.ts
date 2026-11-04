/**
 * bosslog — the boss bot's fight (bossBot.ts, as bossFair.test.ts plays it), frame by frame, for botrec.mjs: the pad, Pokey's plain
 * fields, and the boss's and its brain's plain fields (the clip puts both back each frame so the browser shows the very fight the bot had).
 *   npx tsx tools/quality/bosslog.ts <stage> <seed> <easy|normal> <side|up> <out.json>
 */
import { writeFileSync } from 'node:fs';
import { BossPlay } from '../../src/game/bossPlay.ts';
import { BossBot, seeded, TACTICS } from '../../src/game/bossBot.ts';

const [id, seedS, diff, ori, out] = process.argv.slice(2);
const seed = Number(seedS);
const plain = (o: Record<string, unknown> | undefined) => {
  const r: Record<string, unknown> = {};
  if (o) for (const [k, v] of Object.entries(o)) if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string' || v === null) r[k] = v;
  return r;
};
const frames: Array<Record<string, unknown>> = [];
const orig = BossPlay.prototype.frame;
BossPlay.prototype.frame = function (this: BossPlay, pad = {}) {
  orig.call(this, pad);
  const b = this.boss as unknown as Record<string, unknown> & { ai?: Record<string, unknown> };
  frames.push({ pad, t: +this.t.toFixed(3), p: plain(this.p as never), boss: plain(b), ai: plain(b.ai) });
};
const rand = Math.random;
Math.random = seeded(seed * 7919);
const sim = new BossPlay(id, diff === 'easy', ori === 'up' ? { w: 390, h: 844 } : { w: 844, h: 390 });
sim.skipEntrance();
const skip = frames.length;
const r = new BossBot(sim, TACTICS[id], { rnd: seeded(seed) }).play(300);
Math.random = rand;
writeFileSync(out, JSON.stringify({ id, seed, who: diff === 'easy' ? 'KID' : 'ADULT', boss: true, won: r.won, time: r.seconds,
  harms: sim.hurt.map((t) => ({ kind: 'life', t, cause: 'boss hit' })), stuck: [], openings: sim.openings, tells: sim.tells, frames: frames.slice(skip) }));
console.log(id, diff, ori, 'won', r.won, r.seconds, 'frames', frames.length - skip, 'hurt', sim.hurt.length);
