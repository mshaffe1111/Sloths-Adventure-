/**
 * A tower's soft pit has sides (BUILD-26q/26r, the lead's ruling 11-24: "the soft pit's far end gets a face under the far lip (a sunken
 * step has sides), every tower stage, both settings"). The soft pit is a catch bough laid lip to lip `TOWER.hop` under a storey's own gap
 * (tower.ts gapCatchY). Its ends were open: the street past it is a 24 px branch, so a run along the bough at full speed went on UNDER the
 * far lip and fell a storey (2-6's castBots on 40a9c4bd2: 59 of 59 first-street failures, frame-traced on kid E 40, adult E 2, kid E 4:
 * each lands in the step at run speed 7 px from its far lip and runs off under the next street).
 *
 * The check, on the BUILT stage (level.md rule 27): every tower stage the game lists, both settings, its listed seeds; for each soft pit
 * (a drop that ends on a floor, whose floor is a catch bough lying over the drop's span), whichever way he runs along the bough, the lip
 * ahead of him has a face: solid wood or stone covers his whole body's band (the bough's top up his height) just past the bough's end,
 * so a run stops there and never passes under it. RED on 40a9c4bd2 (counted), GREEN with the face.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { generateAllLevels } from '../worldsData.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { loadSeedList, provenSeeds } from './seedList.ts';
import { PROVEN_INDEX } from './provenIndex.ts';
import type { Platform } from '../types.ts';

/** his body's height (the collider the engine moves, physics.ts; tower.ts BODY_H) */
const BODY_H = 48;
/** the listed seeds read per stage and setting (the first ones: what Play draws first) */
const SEEDS = 24;

type Built = { platforms: readonly Platform[]; gen2?: { tower?: unknown; drops?: ReadonlyArray<{ x0: number; x1: number; lipY: number; ends: { kind: string; y?: number } }> } };

/** every soft pit's open end in a built stage: the bough, the end (x0 or x1) and what stands there; `boughs`: the catch boughs read */
export function openEnds(st: Built): { open: string[]; boughs: number } {
  const out: string[] = [];
  let boughs = 0;
  const solid = st.platforms.filter((p) => p.type !== 'bouncy' && !p.broken);
  for (const d of st.gen2?.drops ?? []) {
    if (d.ends.kind !== 'floor' || d.ends.y === undefined) continue;
    // (the catch bough: wood whose top is the drop's floor, lying over the drop's span)
    const bough = solid.find((p) => Math.abs(p.y - d.ends.y!) <= 1 && p.style === 'branch' && p.x <= d.x0 + 2 && p.x + p.width >= d.x1 - 2);
    if (!bough) continue;
    boughs++;
    const top = bough.y;
    for (const [end, x] of [['x0', bough.x - 2], ['x1', bough.x + bough.width + 2]] as const) {
      // (his band over the bough, just past its end: covered top to bottom by solid pieces standing there)
      const covering = solid.filter((q) => q !== bough && q.x <= x && q.x + q.width >= x && q.y < top && q.y + q.height > top - BODY_H);
      // (and SEEN: a covering piece the painted bank would take, 90 px or taller or soil with no drawer of its own (protoArt.ts
      // bankPainted), is drawn the tower backdrop's soil: a wall the player cannot see, BUILD-26s. The face is drawn by its own drawer,
      // a rope-lashed post (art 'facePost', facePostArt.ts; BUILD-26t, the lead's ruling 1))
      for (const q of covering) if ((q.height >= 90 || q.soil) && !q.art && !q.push) out.push(`the soft pit at x ${bough.x}-${bough.x + bough.width}: the piece standing at its ${end} end (x ${q.x}, y ${q.y}, ${q.width} x ${q.height}) has no drawer of its own: the painted bank draws it as the backdrop's soil, unseen`);
      const cover = covering
        .map((q) => [Math.max(q.y, top - BODY_H), Math.min(q.y + q.height, top)] as const).sort((a, b) => a[0] - b[0]);
      let reach = top - BODY_H;
      for (const [a, b] of cover) if (a <= reach + 0.5) reach = Math.max(reach, b);
      if (reach < top - 0.5) out.push(`the soft pit at x ${bough.x}-${bough.x + bough.width} (bough top ${top}, lip ${d.lipY}) is open at its ${end} end: his band ${top - BODY_H}-${top} is covered only to ${reach}`);
    }
  }
  return { open: out, boughs };
}

test("a full-speed run along a tower's soft pit never passes under the lip ahead: a face under each end, every tower stage, both settings, listed seeds", async () => {
  const levels = generateAllLevels().filter((c) => c.id in PROVEN_INDEX);
  const bad: string[] = [];
  const towers: string[] = [];
  let pits = 0;
  const boughsOf = new Map<string, number>();
  for (const c of levels) {
    if (!(await loadSeedList(c.id))) continue;
    const seeds = provenSeeds(c.id).slice(0, SEEDS);
    let tower = false;
    for (const setting of ['normal', 'easy'] as const) {
      for (let v = 0; v < seeds.length; v++) {
        setLayoutVariant(v);
        let st: Built;
        try { st = (setting === 'easy' ? easyStage(generateStage({ ...c, unlocked: true }, 'easy')) : generateStage({ ...c, unlocked: true }, 'normal')) as unknown as Built; }
        finally { setLayoutVariant(null); }
        if (!st.gen2?.tower) break;
        tower = true;
        pits += (st.gen2.drops ?? []).filter((d) => d.ends.kind === 'floor').length;
        const r = openEnds(st);
        boughsOf.set(c.id, (boughsOf.get(c.id) ?? 0) + r.boughs);
        for (const line of r.open) bad.push(`${c.id} ${setting} seed ${seeds[v]}: ${line}`);
      }
      if (!tower) break;
    }
    if (tower) towers.push(c.id);
  }
  // (a gate never passes having checked nothing, R-165.330)
  const boughs = [...boughsOf.values()].reduce((a, b) => a + b, 0);
  assert.ok(towers.length > 0 && boughs > 0, `no tower stage or soft pit was read (towers: ${towers.join(', ') || 'none'}; catch boughs ${boughs})`);
  const per = towers.map((id) => `${id}: ${boughsOf.get(id) ?? 0} catch boughs, ${bad.filter((b) => b.startsWith(`${id} `)).length} open ends`).join('; ');
  console.log(`tower stages read: ${towers.join(', ')}; floor drops ${pits}; open ends ${bad.length} (${per})`);
  assert.deepEqual(bad.slice(0, 40), [], `${bad.length} open soft-pit ends (${per}):\n${bad.slice(0, 40).join('\n')}`);
});
