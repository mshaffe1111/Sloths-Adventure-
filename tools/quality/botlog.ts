/**
 * botlog — the first-timer bot's run of one stage, frame by frame, for the quality supervisor's watch-it-in-order clips (botrec.mjs).
 *   npx tsx tools/quality/botlog.ts <stage> <seed> <kid|adult> <out.json>
 * Each frame: the pad the bot pressed and Pokey's plain fields after the frame (so the browser replay can follow him exactly, rescues
 * and respawns included), plus the run's harms, rescues and stuck spots with their times (shown as captions in the clip).
 */
import { writeFileSync } from 'node:fs';
import { RealPlay } from '../../src/game/realPlay.ts';
import { firstTimer, FT_ADULT, FT_KID } from '../inspect/firsttimer.ts';

const [id, seedS, whoS, out] = process.argv.slice(2);
type F = { pad: unknown; p: Record<string, unknown>; t: number };
// (the bot makes more than one RealPlay: a hold-right probe first, then the run itself; the run is the instance with the most frames)
const byRun = new Map<RealPlay, F[]>();
const orig = RealPlay.prototype.frame;
RealPlay.prototype.frame = function (this: RealPlay, pad = {}) {
  orig.call(this, pad);
  if (!byRun.has(this)) byRun.set(this, []);
  const frames = byRun.get(this)!;
  const p: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(this.p)) if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') p[k] = v;
  frames.push({ pad, p, t: +this.t.toFixed(3) });
};
const r0 = Date.now();
const r = firstTimer(id, Number(seedS), whoS === 'kid' ? FT_KID : FT_ADULT);
const frames = [...byRun.values()].sort((a, b) => b.length - a.length)[0];
void r0;
writeFileSync(out, JSON.stringify({
  id, seed: Number(seedS), who: r.who, end: r.end, time: r.time, rescues: r.rescues,
  harms: r.harms.map((h) => ({ kind: h.kind, t: h.t, cause: h.cause })),
  stuck: r.stuck.map((s) => ({ t: s.t, dur: s.dur, what: s.what, rescued: s.rescued })),
  frames,
}));
console.log(id, r.who, r.end, r.time, 'frames', frames.length);
