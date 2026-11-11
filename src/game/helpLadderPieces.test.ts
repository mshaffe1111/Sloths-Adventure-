// After the help ladder's steps grow, the piece is passed with plain jumps (R-165.62 attempt 3; the Critic's find: on 324cd3cc the boxes
// at mushroom pieces were 118 px walls and no plain jump got past them). Flown in the real engine at 30 fps from the piece's entry to its
// exit: hold right; standing, with a face or an edge just ahead, a held single jump; never a press in the air (a mushroom's own bounce
// is allowed: it is the piece's move). Pieces the Critic named: w1-mushroom-chain-back on the 7th listed seed, w1-hop-bounce on the 1st.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { recorder } from './playRecorder.ts';
import { withPlaySeed } from './testlink1_1.ts';
import type { Platform } from './types.ts';

type Piece = { k: string; x0: number; x1: number };
type Eng = { currentStage: { meta: { pieces: Piece[] } }; growSteps(p: Piece): void; helpState(): { grown: Platform[] }; stop(): void };

/** 1-1 on a raw seed and a setting, the piece's steps grown (or not), and a plain-jump run through it */
export function plainThrough(seed: number, k: string, setting: 'easy' | 'normal', grow: boolean): { ok: boolean; why: string; grown: number } {
  setDifficulty(setting);
  const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
  const e = r.e as unknown as Eng;
  const events: string[] = [];
  const was = recorder.event;
  recorder.event = function (this: typeof recorder, what: string, detail?: string | number) {
    events.push(what);
    return was.call(this, what, detail);
  } as typeof recorder.event;
  try {
    const piece = e.currentStage.meta.pieces.find((q) => q.k === k);
    if (!piece) return { ok: false, why: `no ${k} on seed ${seed} ${setting}`, grown: 0 };
    if (grow) e.growSteps(piece);
    const stands = () => r.platforms.filter((q) => (q.type === 'solid' || q.type === 'bouncy') && !q.broken && !(q as { catch?: boolean }).catch);
    // (his start: the top of the road just before the piece)
    const sx = piece.x0 - 30;
    const at = stands().filter((q) => sx >= q.x && sx <= q.x + q.width).sort((a, b) => a.y - b.y)[0];
    if (!at) return { ok: false, why: 'no road before the piece', grown: e.helpState().grown.length };
    r.stand(sx, at.y);
    // (the bot reads only solid pieces, as helpLadder11's plainRun does: a mushroom ahead is an edge, so he jumps onto it and its own
    // bounce does the rest)
    const solids = () => r.platforms.filter((q) => q.type === 'solid' && !q.broken);
    for (let i = 0; i < 4; i++) r.frame({});
    let hold = 0, airPress = false;
    for (let i = 0; i < 30 * 60; i++) {
      const p = r.p;
      let press = false;
      if (p.grounded && hold === 0) {
        const ahead = p.x + 34;
        const under = solids().some((q) => ahead >= q.x && ahead <= q.x + q.width && Math.abs(q.y - p.y) < 6);
        const face = solids().some((q) => q.x > p.x && q.x - p.x < 44 && q.y < p.y - 8 && q.y + q.height > p.y - 4);
        if (!under || face) {
          press = true;
          hold = 12;
        }
      } else if (!p.grounded && hold === 0 && r.input.state.jumpPressed) airPress = true;
      r.frame({ right: true, jump: hold > 0, press });
      if (hold > 0) hold--;
      if (r.p.isDoubleJumping && !airPress) return { ok: false, why: `a second jump at x ${Math.round(r.p.x)}`, grown: e.helpState().grown.length };
      if (events.includes('softFall')) return { ok: false, why: `fell at x ${Math.round(r.p.x)}`, grown: e.helpState().grown.length };
      if (r.p.grounded && r.p.x >= piece.x1 + 20) return { ok: true, why: '', grown: e.helpState().grown.length };
    }
    return { ok: false, why: `stopped at x ${Math.round(r.p.x)} y ${Math.round(r.p.y)}`, grown: e.helpState().grown.length };
  } finally {
    recorder.event = was;
    e.stop();
    setDifficulty('normal');
  }
}

for (const [n, k] of [[7, 'w1-mushroom-chain-back'], [1, 'w1-hop-bounce']] as const) {
  for (const setting of ['easy', 'normal'] as const) {
    test(`seed ${n} ${setting}, ${k}: after the steps grow, plain jumps pass the whole piece`, (t) => {
      const before = plainThrough(n, k, setting, false);
      const after = plainThrough(n, k, setting, true);
      t.diagnostic(`${k} ${setting}: before ${before.ok ? 'passed' : before.why}; ${after.grown} grown, after ${after.ok ? 'passed' : after.why}`);
      assert.ok(after.ok, after.why);
    });
  }
}
