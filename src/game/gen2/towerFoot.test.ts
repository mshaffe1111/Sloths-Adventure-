/**
 * A tower turn's foot is kept clear of blocks (BUILD-26b, level.md rule 26; BUILD-26's castBots: 2-6's rest street laid a boulder 36 px
 * from a turn's vine, and the kid and middle bots stood on it under the climb until rescued). Going up, a turn's vine stands on the ledge
 * he leaves; anything standing on that ledge (a boulder, a stump, a step) within TOWER.foot of the vine's x takes the spot he climbs
 * from. The lay moves the turn's foot along the ledge clear of it, or refuses the roll by name; it never moves the block.
 *
 * The planted case: a toy tower whose every landing bough carries a boulder a body's width from its exit end, where the next storey's
 * vine stands. Without the rule some turns stand at a boulder (RED, counted); with it none does, and the boulders are where the brick laid
 * them.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import type { Platform } from '../types.ts';
import { buildGen2Stage } from './pipeline.ts';
import { landing, towerCfg, upKit, upManifest, vineUp } from './toyTower.ts';
import { TOWER } from './tower.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

/** a landing bough with a boulder near its exit end (at 0.9: about 30 px in, under where a turn's vine stands) */
const boulderEnd: SectionTemplate = {
  ...landing,
  id: 'tower-boulder-end',
  name: 'boulder end',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  pieces: [
    { key: 'bough', shape: 'branch', w: [500, 560], place: { kind: 'start' } },
    { key: 'rock', shape: 'block', w: [110, 120], place: { kind: 'on', on: 'bough', at: [0.9, 0.9], h: [50, 50] }, style: 'moss_stone', landing: true },
  ],
  sockets: landing.sockets.filter((k) => k.role !== 'flag'),
};
const kit: WorldKit = { ...upKit, manifest: { ...upManifest, name: 'Toy tower, boulders at the ends', sections: [landing, vineUp, boulderEnd, boulderEnd] } };

/** each turn whose foot stands within TOWER.foot of a block on its ledge: `x`, the block, the gap */
export function footBlocks(platforms: readonly Platform[], turns: ReadonlyArray<{ x: number; from: number; to: number }>): string[] {
  const out: string[] = [];
  for (const t of turns) {
    const foot = Math.max(t.from, t.to);
    for (const q of platforms) {
      if (q.y >= foot - 2 || Math.abs(q.y + q.height - foot) > 2) continue;
      const gap = Math.max(q.x - t.x, t.x - (q.x + q.width), 0);
      if (gap < TOWER.foot) out.push(`the turn at x ${t.x} (foot y ${foot}) stands ${Math.round(gap)} px from the block at x ${q.x}-${q.x + q.width}`);
    }
  }
  return out;
}

test("a tower turn's foot is kept clear of blocks: none within TOWER.foot of a turn's vine on its ledge (toy tower, 24 rolls, both settings)", () => {
  const bad: string[] = [];
  let turnsFromBoulderLedges = 0, built = 0, refused = 0;
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 24; seed++) {
      let st: ReturnType<typeof buildGen2Stage>;
      try {
        st = buildGen2Stage({ config: towerCfg('5-94', 'ascent'), kit, seed, difficulty });
      } catch (e) {
        // (refused by name: the roll's seed is dropped from a stage's list, never laid)
        assert.match((e as Error).message, /stands (by|[0-9]+ px from) a block/);
        refused++;
        continue;
      }
      const T = st.gen2.tower;
      if (!T || st.gen2.errors?.length) continue;
      built++;
      const rocks = st.platforms.filter((p) => p.height === 50 && p.style === 'moss_stone');
      for (const t of T.turns) if (rocks.some((r) => Math.abs(r.y + r.height - Math.max(t.from, t.to)) <= 2)) turnsFromBoulderLedges++;
      for (const m of footBlocks(st.platforms, T.turns)) bad.push(`${difficulty} ${seed}: ${m}`);
    }
  }
  console.log(`built ${built}, refused by name ${refused}, turns from a boulder's ledge ${turnsFromBoulderLedges}`);
  assert.ok(built >= 30, `${built} of 48 rolls built (${refused} refused by name)`);
  assert.ok(turnsFromBoulderLedges >= 40, `${turnsFromBoulderLedges} turns leave a ledge with a boulder on it (the toy must test the rule)`);
  assert.deepEqual(bad, []);
});
