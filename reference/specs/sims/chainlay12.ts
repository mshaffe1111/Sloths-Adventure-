/**
 * chainlay12.ts: gen2 lays a bounce chain from section data today, to chain.md's bands (the Designer, 1-2 packet; a worked example for
 * the builder's `gThornChain` group in w1.ts; nothing in the game imports it).
 *   npx tsx reference/specs/sims/chainlay12.ts
 * One section, three versions (level x4, up-up-level, down-level-up), each with its Easy twin (wider pillars, 3 caps), laid with the
 * engine's own placer (pipeline.ts layLocal) on 1-2's budget, seeds 1-6, both settings; prints every cap centre to cap centre (S) and
 * the exit gap, against the band it must sit in.
 */
import '../../../src/game/headlessDom.ts';
import { layLocal, planBudget, rngFor } from '../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import type { SectionPiece, SectionTemplate } from '../../../src/game/gen2/types.ts';

type R2 = [number, number];
const FLOOR_W: R2 = [560, 560];
/** the floor mushroom, its edge 35 px before the lip: its centre 70 px before it */
const AT0: R2 = [1 - 35 / (560 - 70), 1 - 35 / (560 - 70)];
/** a chain's pieces: `steps` the height of each cap over the one before (px, + up); pillars `pw` wide; S by row of chain.md §3 */
function chain(steps: number[], pw: number): SectionPiece[] {
  const ps: SectionPiece[] = [
    { key: 'in', shape: 'bank', w: FLOOR_W, place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true },
    { key: 'm0', shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: 'in', at: AT0, h: [30, 30] } },
  ];
  let prev = 'in';
  steps.forEach((st, j) => {
    // (the S row: level 208-216; a step up 198-206, clean from level to +60 as the tempo may stretch a written 27; a step down 216-224)
    const S: R2 = st > 6 ? [198, 206] : st < -6 ? [216, 224] : [208, 216];
    // (cap centre to cap centre = the gap + the pillar's width, pillar to pillar; from the floor: the gap + half the pillar + 70)
    const gap: R2 = j === 0 ? [S[0] - pw / 2 - 70, S[1] - pw / 2 - 70] : [S[0] - pw, S[1] - pw];
    const dy: R2 = st > 6 ? [-st - 3, -st + 3] : st < -6 ? [-st - 3, -st + 3] : [0, 0];
    // (a pillar: a bank down to the pit floor, as World 1's stepping stones stand; no `landing`, so Easy does not widen it and move S)
    ps.push({ key: `p${j}`, shape: 'bank', w: [pw, pw], place: { kind: 'jump', after: prev, dy, gapPx: gap, soft: true }, style: 'moss_stone', main: true });
    ps.push({ key: `c${j}`, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: `p${j}`, at: [0.5, 0.5], h: [30, 30] } });
    prev = `p${j}`;
  });
  ps.push({ key: 'out', shape: 'bank', w: [320, 380], place: { kind: 'jump', after: prev, dy: [0, 0], gapPx: [50, 80], soft: true }, style: 'moss_stone', main: true, landing: true });
  return ps;
}
const VERSIONS: Array<{ id: string; steps: number[]; pw: number }> = [
  { id: 'level4', steps: [0, 0, 0, 0], pw: 120 }, { id: 'level4-easy', steps: [0, 0, 0], pw: 160 },
  { id: 'up-up-level', steps: [27, 27, 0, 0], pw: 120 }, { id: 'up-up-level-easy', steps: [27, 0, 0], pw: 160 },
  { id: 'down-level-up', steps: [-27, 0, 27, 0], pw: 120 }, { id: 'down-level-up-easy', steps: [-27, 0, 27], pw: 160 },
];
const config = generateAllLevels().find((c) => c.id === '1-2')!;
let bad = 0;
for (const setting of ['normal', 'easy'] as const) {
  const nb = planBudget(config, w1World().manifest, setting);
  for (const v of VERSIONS.filter((q) => q.id.endsWith('-easy') === (setting === 'easy'))) {
    const all = chain(v.steps, v.pw);
    const tpl = { id: `probe-${v.id}`, name: 'probe', phases: ['ketsu'], difficulty: 5, needs: ['jump'], uses: ['bounce'], archetypes: 'any', pieces: [all[0]], subBlocks: [{ id: 'body', versions: [{ id: 'v', pieces: all.slice(1), sockets: [] }] }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as unknown as SectionTemplate;
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const L = layLocal(tpl, nb, rngFor(seed), false, { versions: { body: 'v' } });
      const caps = L.pieces.filter((p) => p.shape === 'bouncy').sort((a, b) => a.x - b.x);
      const out = L.pieces.find((p) => p.key === 'out')!, last = L.pieces.find((p) => p.key === `p${v.steps.length - 1}`)!;
      const S = caps.slice(1).map((c, i) => Math.round(c.x + c.w / 2 - (caps[i].x + caps[i].w / 2)));
      const dys = caps.slice(1).map((c, i) => Math.round(caps[i].y - c.y));
      const ok = S.every((s, i) => (dys[i] > 6 ? s >= 195 && s <= 210 && dys[i] <= 66 : dys[i] < -6 ? s >= 215 && s <= 225 && dys[i] >= -36 : s >= 205 && s <= 220));
      if (!ok) bad++;
      if (seed <= 2 || !ok) console.log(`${setting.padEnd(6)} ${v.id.padEnd(20)} seed ${seed}  S ${S.join(' ')}  rise ${dys.join(' ')}  exit gap ${Math.round(out.x - (last.x + last.w))}  ${ok ? 'in band' : 'OUT OF BAND'}`);
    }
  }
}
console.log(bad ? `\n${bad} lays out of band` : '\nevery lay in band (36 lays: 3 versions x 6 seeds x 2 settings)');
