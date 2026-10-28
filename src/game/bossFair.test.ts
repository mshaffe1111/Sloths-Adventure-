/**
 * Boss fairness (2026-10-26, Matt: "by the time you see that he has a vulnerability, do you get to it? It's too late"). The real engine
 * plays the 1-10, 2-10 and 3-10 fights frame by frame (bossPlay.ts) with a scripted player that reacts late and taps at a thumb's pace
 * (bossBot.ts). Two things must hold:
 * - it wins each fight on Normal and on Easy, upright and sideways, and the camera shows the glowing spot while it is open;
 * - every opening stays open at least as long as the time to get from where the player stood to a spot a hit lands, plus 0.8 s to react
 *   and 0.6 s to hit.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BossPlay } from './bossPlay.ts';
import { BossBot, TACTICS, seeded } from './bossBot.ts';

const REACT = 0.8;
/** the longest a fight may go with neither a wind-up nor an opening starting (s): the longest opening plus a breath */
const IDLE_MAX = 6;
const HIT = 0.6;
const LAND = { w: 844, h: 390 };
const PORT = { w: 390, h: 844 };

function fight(id: string, easy: boolean, screen: { w: number; h: number }, seed: number) {
  // (the game's own dice are seeded too, so a run is the same every time)
  const rand = Math.random;
  Math.random = seeded(seed * 7919);
  try {
    const sim = new BossPlay(id, easy, screen);
    sim.skipEntrance();
    const bot = new BossBot(sim, TACTICS[id], { rnd: seeded(seed) });
    return { sim, r: bot.play(300) };
  } finally {
    Math.random = rand;
  }
}

for (const id of ['1-10', '2-10', '3-10']) {
  for (const [view, screen] of [['sideways', LAND], ['upright', PORT]] as const) {
    test(`${id} ${view}: a late-reacting player wins on Normal and on Easy, and every opening is long enough to reach`, () => {
      for (const [easy, seed] of [[false, 1], [false, 2], [true, 3]] as const) {
        const { sim, r } = fight(id, easy, screen, seed);
        assert.ok(r.won, `${id} ${easy ? 'Easy' : 'Normal'} seed ${seed}: lost (boss hp ${sim.boss.hp}, ${r.seconds.toFixed(0)} s)`);
        assert.ok(sim.openings.length > 0);
        // he never stands about: a wind-up or an opening at least every IDLE_MAX s (QA saw 17 s of nothing in the dark), and every
        // wind-up starts where the camera shows him
        const beats = [...sim.tells.map((t) => t.t0), ...sim.openings.map((o) => o.t0)].sort((x, y) => x - y);
        for (let i = 1; i < beats.length; i++) {
          assert.ok(beats[i] - beats[i - 1] <= IDLE_MAX, `${id} ${view}: ${(beats[i] - beats[i - 1]).toFixed(1)} s with no attack and no opening (from ${beats[i - 1].toFixed(1)} s)`);
        }
        // every heart lost came from an attack he wound up for at least 0.6 s, and never while he was open (QA gate: "unwarned hits?").
        // (The croc's mud waves and geysers run on through his recovery, to be jumped; but since QA's 2up4 log he no longer bites by
        // touch while he winds up: his body never hurts, as in 1-10 and 3-10.)
        for (const h of sim.e.bossHurtLog as Array<{ t: number; by: string; state: string; move: string | null }>) {
          assert.notEqual(h.by, 'body', `${id} ${view}: hurt by touching his body at ${h.t.toFixed(1)} s (${h.state} ${h.move})`);
          if (!h.by.startsWith('hazard')) assert.notEqual(h.state, 'tell', `${id} ${view}: hurt during a wind-up at ${h.t.toFixed(1)} s (${h.by} ${h.move})`);
          if (!(id === '2-10' && h.by.startsWith('hazard'))) {
            assert.ok(h.state !== 'rec' && h.state !== 'stun', `${id} ${view}: hurt while he was open, at ${h.t.toFixed(1)} s (${h.by})`);
          }
          if (h.move && h.state === 'act') assert.ok(sim.def.moves[h.move].tell >= 0.6, `${id} ${view}: ${h.move} winds up for ${sim.def.moves[h.move].tell} s`);
        }
        const unseen = sim.tells.filter((t) => !t.onScreen);
        assert.ok(unseen.length <= sim.tells.length * 0.1, `${id} ${view}: ${unseen.length} of ${sim.tells.length} wind-ups began off screen (${unseen.map((t) => t.move).join(', ')})`);
        // the camera shows the glowing spot while it is open (a boss far across the arena may take a moment to come into view)
        const frames = sim.openings.reduce((n, o) => n + o.frames, 0);
        const off = sim.openings.reduce((n, o) => n + o.offscreen, 0);
        assert.ok(off <= frames * 0.1, `${id} ${view}: the weak point was off screen for ${off} of ${frames} open frames`);
        for (const o of sim.openings) {
          // (a phase change or the last hit can end one early; how long it would have lasted is what counts)
          assert.ok(o.reach >= 0 || o.cut, `${id} ${o.move} at ${o.t0.toFixed(1)} s: closed before the player got there (${Math.round(Math.abs(o.px - o.spot.x - o.spot.w / 2))} px away)`);
          // seen coming: an opening after a move is warned by the weak point warming up (a crash or a stagger is its own cue)
          if (o.state === 'rec') assert.ok(o.warned, `${id} ${o.move} at ${o.t0.toFixed(1)} s: opened with no warning glow`);
          if (o.reach < 0) continue;
          assert.ok(o.full >= o.reach + REACT + HIT, `${id} ${view} ${easy ? 'Easy' : 'Normal'} seed ${seed} ${o.move}: open ${o.full.toFixed(2)} s < reach ${o.reach.toFixed(2)} + ${REACT} + ${HIT} (from ${Math.round(o.px - o.spot.x - o.spot.w / 2)} px, ${Math.round(sim.arena.floor - o.py)} up)`);
        }
      }
    });
  }
}
