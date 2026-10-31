/**
 * 5-3's swaying orchids (Matt, 2026-10-31), in the real engine: every row of them is crossed by a thumb that waits at the bank (or on a
 * bloom) until the next one swings near, then flicks up and forward; with Jump help Off, On and On + forward, upright and sideways.
 * A miss drops to the soft pit's floor and never costs a heart.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import { setJumpHelp, type JumpHelp } from './jumpHelp.ts';
import type { W5Extras } from './w5Kit.ts';
import type { Platform } from './types.ts';

/** seeds of 5-3 that deal the swaying style (RealPlay's seed is the stage's layout) */
const SWAY_LAYOUTS = [6, 10];

function crossRows(layout: number, help: JumpHelp, view: { w: number; h: number }): string[] {
  const bad: string[] = [];
  setJumpHelp(help);
  const base = new RealPlay('5-3', layout);
  const w5 = (base.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
  const sways = w5.sways ?? [];
  if (sways.length < 3) return [`layout ${layout}: ${sways.length} swaying orchids (not a swaying play)`];
  // the rows: runs of blooms whose middles are less than 300 px apart
  const rows: number[][] = [];
  sways.forEach((b, i) => {
    if (i && b.x - sways[i - 1].x < 300) rows[rows.length - 1].push(i);
    else rows.push([i]);
  });
  for (const row of rows.slice(0, 4)) {
    const r = new RealPlay('5-3', layout);
    const e = r.e as unknown as { viewCssW: number; viewCssH: number; introT: number; applyZoom: () => void; lives: number; statHeartsLost: number; platforms: Platform[] };
    e.viewCssW = view.w;
    e.viewCssH = view.h;
    e.introT = 99;
    e.applyZoom();
    r.safe = false;
    const plats = row.map((i) => e.platforms.find((q) => q.id === sways[i].platformId)!);
    const first = sways[row[0]], last = sways[row[row.length - 1]];
    // (the bank ends 126 to 138 px short of the first bloom's middle, w5Stages.ts swayRow)
    const bankEdge = first.x - 138;
    r.stand(bankEdge - 160, G);
    const farX = last.x + first.w / 2 + 120;
    let on = -1, ok = false;
    let aim: Platform | null = null;
    for (let f = 0; f < 30 * 40; f++) {
      e.lives = 9;
      const p = r.p;
      if (p.grounded && p.y === G && p.x > farX) { ok = true; break; }
      if (p.y > G + 60 && p.grounded) {
        // a miss: down in the soft pit; climb back and try again (counted as a miss, not a failure, unless it costs a heart)
        r.stand(bankEdge - 160, G);
        on = -1;
        continue;
      }
      // where he stands: the bank (-1) or a bloom (its index in the row)
      const k = plats.findIndex((q) => p.grounded && Math.abs(p.y - q.y) < 3 && p.x >= q.x - 4 && p.x <= q.x + q.width + 4);
      if (k >= 0) on = k;
      const next = on + 1 < plats.length ? plats[on + 1] : null;
      const edge = on < 0 ? null : plats[on];
      // (walk to the front of where he stands; there, wait until the next bloom's near side is within 60 px, then flick)
      const front = edge ? edge.x + edge.width - 14 : bankEdge - 10;
      let press = false, right = true, left = false;
      if (p.grounded && p.x >= front - 4) {
        const gap = next ? next.x - (edge ? edge.x + edge.width : bankEdge) : 0;
        if (next && gap > 60) right = false;
        else {
          press = true;
          aim = next ?? null;
        }
      }
      // (in the air, steering for the middle of the bloom he jumped for, as a thumb does; for the far bank, straight on)
      if (!p.grounded && aim) {
        const mid = aim.x + aim.width / 2;
        right = p.x < mid - 12;
        left = p.x > mid + 12;
      }
      if (p.grounded && !press) aim = aim && on >= 0 && plats[on] === aim ? null : aim;
      r.frame({ right, left, press, jump: press || (!p.grounded && p.vy < 0) });
    }
    if (!ok) bad.push(`layout ${layout} ${help} ${view.w}x${view.h}: the row of ${row.length} at ${Math.round(first.x)} not crossed (at x ${Math.round(r.p.x)})`);
    if (e.statHeartsLost) bad.push(`layout ${layout} ${help}: a heart lost on the swaying orchids at ${Math.round(first.x)}`);
  }
  return bad;
}

test('5-3: every row of swaying orchids is crossed by waiting for the next to swing near, with Jump help Off, On and On + forward, upright and sideways', () => {
  const bad: string[] = [];
  try {
    for (const layout of SWAY_LAYOUTS) {
      for (const help of ['off', 'keep', 'forward'] as JumpHelp[]) {
        for (const view of [{ w: 390, h: 844 }, { w: 844, h: 390 }]) bad.push(...crossRows(layout, help, view));
      }
    }
  } finally {
    setJumpHelp('off');
  }
  assert.deepEqual(bad, []);
});
