/**
 * The mixer's passes on a built stage (the engine's own, moved here from w1Rhythm.ts and w1Rise.ts on engine-core, 11-05, so the
 * engine sits on main without the rejected World 1 rebuild's files; the code is the same, less what only the rebuild's stages turn on):
 *  - ownPetals: a stage that places its own petals (`proto.ownPetals`, the mixer's stages) is held to the petal pass's rules here
 *    (six a screen, no rows, no clumps, none off the arc or out of reach) and has its long bare stretches filled;
 *  - clearDress: a spec's `post.clearDress` keeps the dressing off the play line and the shrine.
 */
import { badPickups } from '../flowerReach.ts';
import { PICKUP_APART } from '../levelCheck.ts';
import { DOUBLE_RISE } from '../physics.ts';
import { busiestScreen, clumpExtras, offArc, PER_SCREEN, rowExtras } from '../petals.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { ProtoExtras } from '../protoStage.ts';
import type { Collectible, Platform } from '../types.ts';

/**
 * The petals of a stage that places its own (w1Rhythm.ts rhythmOwnPetals on engine-mixer, less its 1-2 road split, which only a
 * beat-built stage's `proto.rhythm` nodes turn on and no mixed stage has): each petal kept only where the petal pass's own rules hold,
 * the long bare stretches filled, and none the level check cannot reach.
 */
export function ownPetals(st: GeneratedStage & { proto: ProtoExtras }): void {
  const isPet = (c: Collectible) => c.type === 'flower' || c.type === 'leaf';
  const all = st.collectibles.filter(isPet).sort((a, b) => a.x - b.x);
  st.collectibles = st.collectibles.filter((c) => !isPet(c));
  const kept: Collectible[] = [];
  const accept = (c: Collectible) => {
    if (st.collectibles.some((o) => o.type !== 'exit_totem' && Math.hypot(o.x - c.x, o.y - c.y) < PICKUP_APART + 4)) return false;
    const pets = [...kept, c];
    if (offArc(st, [c]).size) return false;
    if (rowExtras(pets).size) return false;
    if (clumpExtras(pets).size) return false;
    if (busiestScreen(pets).n > PER_SCREEN) return false;
    kept.push(c);
    st.collectibles.push(c);
    return true;
  };
  for (const c of all) accept(c);
  // (the bare stretches: a petal on a solid ledge every 300 px between two petals more than 1,900 px apart, at his body's height; over
  // a run of lianas, at a liana's foot, where his body passes on the swing)
  let id = Math.max(0, ...st.collectibles.map((c) => c.id), ...all.map((c) => c.id)) + 1;
  const ledges = st.platforms.filter((p) => p.type === 'solid' && p.width >= 120 && p.height < 300);
  for (let pass = 0; pass < 3; pass++) {
    const xs = kept.map((c) => c.x).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] - xs[i - 1] <= 1900) continue;
      for (let x = xs[i - 1] + 300; x < xs[i] - 200; x += 300) {
        const q = ledges.filter((p) => x > p.x + 30 && x < p.x + p.width - 30).sort((a, b) => a.y - b.y)[0];
        const v = !q ? st.vines.find((vn) => Math.abs(vn.x - x) < 150) : undefined;
        // (at a climb vine's foot; where the foot stands on a ledge, over the ledge's top, never 10 px into it: the mixer's 1-5)
        const foot = v ? st.platforms.find((p) => v.x >= p.x && v.x <= p.x + p.width && Math.abs(p.y - v.bottomY) <= 20) : undefined;
        if (v) accept({ id: id++, type: 'flower', botanicalVariant: 'orchid', x: v.x, y: foot ? foot.y - 45 : v.bottomY + 10, collected: false, bobPhase: (v.x * 0.031) % 6.28 });
        else if (q) accept({ id: id++, type: 'flower', botanicalVariant: 'orchid', x, y: q.y - 45, collected: false, bobPhase: (x * 0.031) % 6.28 });
      }
    }
  }
  // (none the level check cannot reach)
  const bad = new Set(badPickups({ platforms: st.platforms, vines: st.vines, waterY: st.waterY }, st.collectibles).filter(isPet));
  st.collectibles = st.collectibles.filter((c) => !bad.has(c));
}

/** dressing kept off the play line and the shrine (w1Rise.ts clearDress, unchanged) */
export function clearDress(st: { platforms: Platform[]; collectibles: Collectible[]; proto: { dress?: Array<{ n: string; x: number; b: number }> } }, size: (n: string) => { w: number; h: number }) {
  const ds = st.proto.dress;
  if (!ds?.length) return;
  const shrine = st.collectibles.find((c) => c.type === 'exit_totem');
  const solid = st.platforms.filter((p) => p.type !== 'bouncy');
  st.proto.dress = ds.filter((d) => {
    const { w, h } = size(d.n);
    const x0 = d.x - w / 2, x1 = d.x + w / 2, top = d.b - h;
    if (shrine && x1 > shrine.x - 260 && x0 < shrine.x + 260 && d.b > shrine.y - 300 && top < shrine.y + 120) return false;
    // (in the air over a ledge, where he walks and jumps: 0-170 px over its top)
    if (solid.some((p) => x1 > p.x + 4 && x0 < p.x + p.width - 4 && d.b > p.y - 170 && top < p.y - 4)) {
      // (standing on the ledge's top at its own end is set dressing at the edge; anything else there is in the way)
      if (!solid.some((p) => Math.abs(d.b - p.y) < 8 && (x1 < p.x + 40 || x0 > p.x + p.width - 40))) return false;
    }
    // (grows from something: its foot on a top, or its head under a bough's underside)
    return solid.some((p) => x1 > p.x && x0 < p.x + p.width && (Math.abs(d.b - p.y) < 10 || Math.abs(top - (p.y + p.height)) < 12));
  });
}

/**
 * The secret golden seed (main's 1-1 mushroomCache, protoStage.ts on main: the rule the designer kept, ENGINE-SPEC 4279fc12d): in the node
 * a spec names (`post.seed.job`, off the main line), a mushroom on a perch over its widest bank, 46 px up and beside the lane so walking on
 * passes under it (the mixer's own canopied perch), a bough higher than a double jump reaches from the bank, the seed on the bough (34 px over its top, as a petal sits). Only
 * the bounce gets him there. A scenery trunk holds the bough (every bough has a trunk, the designer's P-2; trunkFit stands it on the bank).
 */
export function placeSeed(st: GeneratedStage & { proto: ProtoExtras }, job: string): void {
  const beat = st.proto.beats.find((b) => b[2].startsWith(job + ':'));
  if (!beat) throw new Error(`post.seed: the stage has no "${job}" node`);
  const bank = st.platforms.filter((p) => p.type === 'solid' && p.height >= 90 && p.x >= beat[0] - 60 && p.x + p.width <= beat[1] + 60).sort((a, b) => b.width - a.width)[0];
  if (!bank || bank.width < 300) throw new Error(`post.seed: no bank 300 px wide in the "${job}" node`);
  let pid = Math.max(...st.platforms.map((p) => p.id)) + 1;
  let cid = Math.max(0, ...st.collectibles.map((c) => c.id)) + 1;
  const perch: Platform = { id: pid++, x: bank.x + 105, y: bank.y - 46, width: 80, height: 24, type: 'solid', style: 'branch', pit: 'drop' };
  (perch as Platform & { perch?: boolean }).perch = true;
  const mush: Platform = { id: pid++, x: bank.x + 110, y: perch.y - 30, width: 70, height: 30, type: 'bouncy' };
  // (higher than a double jump reaches from the bank, DOUBLE_RISE + 50 (at + 30 the level check finds a double reaches it; + 40 is the least that holds), and low enough that the bough and the seed on it stay in a
  // sideways phone's view clear of the HUD while he stands on the bank: main's DOUBLE_RISE + 70 put them behind the HUD plate, the lead's
  // stills 11-05)
  const by = Math.round(bank.y - DOUBLE_RISE - 50);
  const bough: Platform = { id: pid++, x: mush.x - 40, y: by, width: 270, height: 24, type: 'solid', style: 'branch', pit: 'drop' };
  st.platforms.push(perch, mush, bough);
  st.collectibles.push({ id: cid++, type: 'seed', x: mush.x + 150, y: by - 34, collected: false, bobPhase: 1, findId: 'seed-1' } as Collectible);
  (st.proto.trunks ??= []).push({ x: bough.x + bough.width - 60, topY: by + 12, bottomY: bank.y + 6, w: 1 });
}
