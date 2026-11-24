/**
 * A tower's turned-back climb keeps its step in from an open lip (BUILD-26q, R-165.398; 11-24).
 * Going up, a storey that turns back stands its vine TOWER.vineIn in from the tip of the ledge he leaves (pipeline.ts tipOf), so a run along
 * the ledge meets the climb before the edge. clearClimbs then moves a vine off the face of the storey above it by CLIMB_CLEAR; when that
 * face is the new storey's near end, the move is TOWARD the tip: on 2-6 Easy (every roll) the house climb stood 18 px from an open lip
 * (1137 - 44 + 26), a 100 px gap and a storey's fall behind it, and the first-timers ran past it and off (59 of 83 failing runs, 31 seeds).
 * The rule, for every tower roll on both settings: a climb whose foot stands on a ledge with an OPEN end (no floor at that height within a
 * stride past it) stands at least TOWER.vineIn from that end.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../realPlay.ts';
import { TOWER } from './tower.ts';
import { freshPhone } from '../../../tools/inspect/firsttimer.ts';

type P = { x: number; y: number; width: number; type?: string };
type V = { x: number; topY: number; bottomY: number; vineType?: string };
/** an open end past this much empty floor is a lip: a stride at run speed (the gaps a run carries over are narrower) */
const STRIDE = 40;

/** every climb standing on a ledge, with its distance to the nearer OPEN end of the floor it stands on (Infinity when both ends are closed) */
export function climbLips(platforms: readonly P[], vines: readonly V[]): Array<{ x: number; y: number; toLip: number; floor: [number, number] }> {
  const out: Array<{ x: number; y: number; toLip: number; floor: [number, number] }> = [];
  for (const v of vines) {
    if (v.vineType !== 'tree_climb') continue;
    const level = platforms.filter((p) => p.type !== 'wall' && Math.abs(p.y - v.bottomY) <= 2);
    if (!level.some((p) => v.x >= p.x && v.x <= p.x + p.width)) continue;
    let a = v.x, b = v.x;
    for (let grew = true; grew; ) {
      grew = false;
      for (const p of level) {
        if (p.x <= b + 1 && p.x + p.width > b) { b = p.x + p.width; grew = true; }
        if (p.x + p.width >= a - 1 && p.x < a) { a = p.x; grew = true; }
      }
    }
    // (an end is closed by floor at the same height within a stride, or by a wall standing at it)
    const closed = (x: number, dir: 1 | -1) => platforms.some((p) => (p.type === 'wall' ? p.x <= x + 2 && p.x + p.width >= x - 2 && p.y <= v.bottomY : Math.abs(p.y - v.bottomY) <= 2 && (dir > 0 ? p.x > x && p.x <= x + STRIDE : p.x + p.width < x && p.x + p.width >= x - STRIDE)));
    const toLip = Math.min(closed(a, -1) ? Infinity : v.x - a, closed(b, 1) ? Infinity : b - v.x);
    out.push({ x: v.x, y: v.bottomY, toLip, floor: [a, b] });
  }
  return out;
}

test('a tower climb stands its step in from an open lip, both settings (2-6: the house climb on Easy)', () => {
  const bad: string[] = [];
  for (const setting of ['normal', 'easy'] as const) for (const seed of [1, 2, 3, 4, 5]) {
    freshPhone(setting);
    const st = new RealPlay('2-6', seed).stage;
    assert.ok(st.gen2?.tower, '2-6 is a tower stage');
    for (const c of climbLips(st.platforms, st.vines)) if (c.toLip < TOWER.vineIn) bad.push(`${setting} roll ${seed}: the climb at ${c.x},${c.y} stands ${Math.round(c.toLip)} px from an open lip (floor ${Math.round(c.floor[0])}..${Math.round(c.floor[1])})`);
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});
