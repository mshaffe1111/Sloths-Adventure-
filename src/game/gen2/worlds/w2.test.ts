/**
 * World 2's gen2 kit (ENG-W2, 11-14; gen2/worlds/w2.ts): 2-1 and 2-2 rolled the way the game rolls them (stageGenerator generateStage:
 * their stage-table rows, World 2's kit and World 2's finish), on both settings. The kit's art is World 2's own from the inventory and
 * in scale with Pokey; every piece is drawn by World 2's art (terrain.ts footingsFor, the engine's own call); every fall is a river with
 * a bank at each end, splash-back where the fall is soft and deep where it is water; the first deep river is flagged and warned in the
 * keeper's words; the arc is laid beat for beat; the hand-built 2-1 and 2-2 are gone.
 * Planted faults: reference/qa-reports/ENG-W2/planted-faults.py (each one turns a named test here red).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateStage, builtOnGen2 } from '../../stageGenerator.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { footingsFor } from '../../terrain.ts';
import { surfaceBelowBank, type RiverZone } from '../../river.ts';
import { W2_STAGES } from '../../w2Stages.ts';
import { listedStage, worldFinish } from '../listed.ts';
import { STAGE_TABLE } from './stageTable.ts';
import { W2_ART, W2_TIPS, w2Finish } from './w2.ts';

/** World 2's stages whose look, rivers and ponds this file holds to World 2's rules (2-1 holds its own in w2Arc21.test.ts) */
const W2_GEN2_STAGES = ['2-2'];
import type { Collectible, Platform } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = (id: string) => generateAllLevels().find((c) => c.id === id && !c.secret)!;
type Built = {
  platforms: Platform[]; collectibles: Collectible[]; rivers?: RiverZone[]; checkpoints?: Array<{ x: number; y: number }>; config: { levelWidth: number };
  proto?: { hints?: Array<{ x: number; text: string }>; mixDress?: unknown[]; decor?: Array<{ n?: string; x: number; front?: boolean }>; gen2?: { waterWarnings?: Array<{ x: number; y: number }> } };
  gen2: { errors?: string[]; sections: Array<{ template: string; x0: number; x1: number }>; falls?: Array<{ x0: number; x1: number; y: number; kind: string }> };
};
const memo = new Map<string, Built>();
/** the stage as the game builds it (its row, its kit, World 2's finish, the game's shared passes) */
function built(id: string, d: 'normal' | 'easy'): Built {
  const k = `${id}:${d}`;
  if (!memo.has(k)) memo.set(k, generateStage(cfg(id), d) as unknown as Built);
  return memo.get(k)!;
}
const BOTH = ['normal', 'easy'] as const;

test('the kit: every World 2 art row it names is in the World 2 inventory, usable and in scale with Pokey (R-165.107)', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(root, 'src/game/art/inventory/w2.json'), 'utf8')) as { cols: string[]; rows: unknown[][] };
  const rows = new Map(inv.rows.map((r) => { const o = Object.fromEntries(inv.cols.map((c, i) => [c, r[i]])) as { id: string; status: string; worlds: number[]; scale_ok: boolean | null }; return [o.id, o]; }));
  for (const [job, ids] of Object.entries(W2_ART)) for (const id of ids) {
    const r = rows.get(id);
    assert.ok(r, `${job}: ${id} is not in the World 2 inventory`);
    assert.ok(r.worlds.includes(2), `${job}: ${id} does not fit World 2`);
    assert.ok(!r.status.startsWith('needs fix'), `${job}: ${id} waits on a fix (${r.status})`);
    assert.notEqual(r.scale_ok, false, `${job}: ${id} is out of scale with Pokey`);
  }
});

test('the rows: 2-1 and 2-2 roll from their own kits over World 2\'s, with World 2\'s finish; the hand-built 2-1 and 2-2 and the placeholder arcs are gone (new replaces old)', () => {
  assert.equal(STAGE_TABLE['2-1']?.kit, 'w2-21', "2-1's row names its own kit, World 2's with 2-1's rows (w2Arc21.ts)");
  assert.equal(STAGE_TABLE['2-2']?.kit, 'w2-22', "2-2's row names its own kit, World 2's with 2-2's rows (w2Arc22.ts)");
  for (const id of ['2-1', '2-2']) {
    const row = listedStage(id)!;
    assert.equal(row.kit().manifest.world, 2);
    assert.equal(worldFinish(row), row.world, `${id}: its world finish is its kit's own`);
    assert.equal(W2_STAGES[id], undefined, `${id}: the hand-built plan is deleted`);
    assert.ok(builtOnGen2(cfg(id)), `${id}: the game builds it on gen2`);
    assert.ok(!row.kit().manifest.sections.some((t) => t.id.startsWith(`w2-${id}-`)), `${id}: no placeholder brick is left in its pool`);
  }
});

test('the look: every piece is drawn by World 2 art as the engine draws it (no World 1 cut piece, no squirrels)', () => {
  // (the crown lily is drawn by the pad piece from World 2's painted pieces: Matt's Victoria pad M-02-a and ART-W2's crown flower, riverArt.ts
  // drawCrownLily, BUILD-22)
  const allowed = new Set(['ground', 'pillar', 'painted rock', 'river art', 'painted-bank', 'step', 'own art (crownLily)']);
  for (const id of W2_GEN2_STAGES) for (const d of BOTH) {
    const st = built(id, d);
    const f = footingsFor(st as never, 2);
    for (const p of st.platforms) {
      const drawn = f.get(p.id)!.drawn;
      assert.ok(allowed.has(drawn), `${id} ${d}: piece ${p.id} (${p.style}, ${p.height} px) is drawn as ${drawn}`);
      assert.equal((p as { cut?: string }).cut, undefined, `${id} ${d}: piece ${p.id} carries World 1's cut art`);
    }
    assert.equal(st.proto?.mixDress, undefined, `${id} ${d}: World 1's dressing (the squirrels) is not World 2's`);
    // (World 2's reeds stand at the rivers' edges, behind him: none drawn in front, where it hid him on a bank's edge)
    const reeds = (st.proto?.decor ?? []).filter((q) => q.n?.startsWith('reed'));
    assert.ok(reeds.length >= (st.rivers ?? []).length / 2, `${id} ${d}: ${reeds.length} reeds`);
    assert.ok(!reeds.some((q) => q.front), `${id} ${d}: a reed drawn in front of him`);
  }
});

test('the rivers: every fall is a river with a bank at each end; soft falls splash him back, water falls are deep', () => {
  for (const id of W2_GEN2_STAGES) for (const d of BOTH) {
    const st = built(id, d);
    const falls = (st.gen2.falls ?? []).filter((f) => f.kind === 'soft' || f.kind === 'water');
    const rv = st.rivers ?? [];
    assert.equal(rv.length, falls.length, `${id} ${d}: a river for every fall`);
    assert.ok(rv.some((r) => r.safe) && rv.some((r) => !r.safe), `${id} ${d}: both kinds`);
    for (const f of falls) {
      const r = rv.find((q) => q.x0 === f.x0 && q.x1 === f.x1)!;
      assert.ok(r, `${id} ${d}: the fall at ${f.x0} has its river`);
      assert.equal(!!r.safe, f.kind === 'soft', `${id} ${d}: the river at ${f.x0} is ${f.kind === 'soft' ? 'splash-back' : 'deep'}`);
      const near = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 2 && p.y + surfaceBelowBank === r.surfaceY || (p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 2 && p.y <= r.surfaceY));
      const far = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x - r.x1) <= 2 && p.y <= r.surfaceY);
      assert.ok(near && far, `${id} ${d}: the river at ${r.x0} has a bank at each end`);
      // (nothing stands under a splash-back river's water: the splash sets him back before he could reach it, and it would be drawn over the water)
      if (r.safe) {
        // (a pond's own floors stand ON its water, never under it: its pads, the crown lily and its stones, at the pad line 8 px over the
        // surface (rideLay PAD_LAY.drop); anything else, or lower, is under the water, BUILD-22)
        const pondFloor = (p: Platform) => r.speed === 0 && (!!p.pad || p.art === 'crownLily' || (p.style === 'moss_stone' && Math.abs(p.y - (r.surfaceY - 8)) <= 1));
        assert.ok(!st.platforms.some((p) => p.type === 'solid' && !pondFloor(p) && p.x < r.x1 - 1 && p.x + p.width > r.x0 + 1 && p.y > r.surfaceY - surfaceBelowBank), `${id} ${d}: a piece under the splash-back river at ${r.x0}`);
        assert.ok(st.platforms.some((p) => p.type === 'solid' && p.x <= r.safe!.backX && p.x + p.width >= r.safe!.backX && p.y === r.safe!.backY), `${id} ${d}: set back on the bank he left`);
      }
    }
  }
});

test("the first deep river: a flag before it and Dot's warning in the keeper's words (lines-2-1.md `deep`, verbatim)", () => {
  assert.equal(W2_TIPS.water, "This river's deep. Don't touch the water!");
  for (const id of W2_GEN2_STAGES) for (const d of BOTH) {
    const st = built(id, d);
    const deep = (st.rivers ?? []).filter((r) => !r.safe).sort((a, b) => a.x0 - b.x0)[0];
    const flags = (st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b);
    assert.ok(flags.some((x) => x < deep.x0), `${id} ${d}: a flag before the first deep river at ${deep.x0}`);
    const warn = (st.proto?.hints ?? []).find((h) => h.text === W2_TIPS.water);
    assert.ok(warn && warn.x < deep.x0, `${id} ${d}: Dot warns before the first deep river`);
    assert.ok((st.proto?.gen2?.waterWarnings ?? []).some((s) => s.x <= deep.x0 && s.x >= deep.x0 - 120), `${id} ${d}: the sign stands at its edge`);
    // (and no warning before a splash-back river: they cost nothing)
    assert.ok(!(st.rivers ?? []).some((r) => r.safe && r.x0 < deep.x0 && (st.proto?.hints ?? []).some((h) => h.text === W2_TIPS.water && h.x >= r.x0 - 600 && h.x < r.x0)), `${id} ${d}: a warning before a splash-back river`);
  }
});

test('the finish: a fall with no bank at one end throws (such a roll is never listed); a second call changes nothing', () => {
  const st = { platforms: [{ id: 1, x: 0, y: 580, width: 300, height: 90, type: 'solid' }] as Platform[], gen2: { falls: [{ x0: 300, x1: 420, y: 580, kind: 'water' }] } };
  assert.throws(() => w2Finish(st), /no bank at one end/);
  const ok = { platforms: [{ id: 1, x: 0, y: 580, width: 300, height: 90, type: 'solid' }, { id: 2, x: 420, y: 580, width: 300, height: 90, type: 'solid' }] as Platform[], gen2: { falls: [{ x0: 300, x1: 420, y: 580, kind: 'soft' }] } };
  const once = JSON.stringify(w2Finish(ok));
  assert.equal(JSON.stringify(w2Finish(ok)), once);
  assert.equal((ok as { rivers?: RiverZone[] }).rivers?.[0].safe?.backX, 230);
});
