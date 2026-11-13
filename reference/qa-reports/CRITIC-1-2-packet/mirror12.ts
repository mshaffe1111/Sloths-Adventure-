/**
 * mirror12.ts (the Critic, attempt-5 audit): does the pipeline lay a bounce chain, or a section with a drop, MIRRORED?
 *   FLOWN=1 npx tsx reference/qa-reports/CRITIC-1-2-packet/mirror12.ts [seeds=120]
 * A section is flipped on about half its lays unless it is `mirrorable: false`, a climb, holds a `block` piece or ends more than 25 px
 * off its entry (pipeline.ts:1445-1450); w1.ts's `section()` gives every section `mirrorable: true` (w1.ts:332). Flipped, it is played
 * in reverse: a drop is a rise, and a chain's floor mushroom is at its far end. Two hand-built sections, in the Designer's kit
 * (reference/specs/sims/supply12.ts, FLOWN): the worked chain of reference/specs/sims/chainlay12.ts (level, 4 caps), as the signature;
 * and the note hollow as CONTENT-1-2-relay.md writes it (`H J`, a floor, `c c`), as the required H.
 */
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import type { SectionPiece } from '../../../src/game/gen2/types.ts';
import { kit12 } from '../../specs/sims/supply12.ts';
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const bank = (key: string, after: string, dy: [number, number], w: [number, number]): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'walk', after, dy }, style: 'moss_stone', main: true, landing: true } as Any);
function chain(): SectionPiece[] {
  const ps: Any[] = [{ key: 'in', shape: 'bank', w: [560, 560], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true },
    { key: 'm0', shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: 'in', at: [1 - 35 / 490, 1 - 35 / 490], h: [30, 30] } }];
  let prev = 'in';
  for (let j = 0; j < 4; j++) {
    const gap: [number, number] = j === 0 ? [208 - 60 - 70, 216 - 60 - 70] : [208 - 120, 216 - 120];
    ps.push({ key: `p${j}`, shape: 'bank', w: [120, 120], place: { kind: 'jump', after: prev, dy: [0, 0], gapPx: gap, soft: true }, style: 'moss_stone', main: true });
    ps.push({ key: `c${j}`, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: `p${j}`, at: [0.5, 0.5], h: [30, 30] } });
    prev = `p${j}`;
  }
  ps.push({ key: 'out', shape: 'bank', w: [320, 380], place: { kind: 'jump', after: prev, dy: [0, 0], gapPx: [50, 80], soft: true }, style: 'moss_stone', main: true, landing: true });
  return ps;
}
function hollow(): SectionPiece[] {
  const ps: Any[] = [{ key: 'in', shape: 'bank', w: [300, 360], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true },
    { key: 'hs', shape: 'block', w: [120, 160], place: { kind: 'on', on: 'in', at: [0.45, 0.55], h: [50, 50] }, style: 'moss_stone', landing: true }];
  ps.push(bank('J', 'in', [130, 140], [180, 220]), bank('fl', 'J', [0, 0], [400, 460]), bank('c1', 'fl', [-78, -62], [260, 320]), bank('out', 'c1', [-78, -62], [260, 320]));
  return ps;
}
const c12 = generateAllLevels().find((c) => c.id === '1-2')!;
const config = { ...c12, id: '1-1', miniIndex: 1 };
const n = Number(process.argv[2] ?? 120);
const swap = (kit: Any, id: string, pieces: SectionPiece[]) => {
  const s = kit.manifest.sections.find((q: Any) => q.id === id);
  Object.assign(s, { pieces: [pieces[0]], subBlocks: [{ id: 'body', versions: [{ id: 'v', pieces: pieces.slice(1), sockets: id === 'w1-note-hollow' ? [{ id: 'note', role: 'find', on: 'fl', t: 0.5, dn: 34 }] : [] }] }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, mirrorable: true, sockets: [] });
};
const tally = { chain: { laid: 0, mirrored: 0, mushroomLast: 0 }, hollow: { laid: 0, mirrored: 0, riseOver123: 0, rise: [] as number[] } };
for (let seed = 1; seed <= n; seed++) {
  try {
    const kit = kit12('harvest-12-A', true);
    for (const id of ['w1-thorn-chain-rise', 'w1-thorn-chain-isles']) kit.manifest.sections.find((q: Any) => q.id === id).feel = [];
    swap(kit, 'w1-thorn-chain', chain()); swap(kit, 'w1-note-hollow', hollow());
    const st: Any = buildGen2Stage({ config, kit, seed, difficulty: 'normal' });
    for (const sec of st.gen2.sections as Any[]) {
      const p = (st.gen2.plan as Any[]).find((q) => q.uid === sec.uid) ?? (st.gen2.plan as Any[])[(st.gen2.sections as Any[]).indexOf(sec)];
      const mine = (st.platforms as Any[]).filter((q) => q.x + q.width > sec.x0 - 1 && q.x < sec.x1 + 1).sort((a, b) => a.x - b.x);
      if (sec.template === 'w1-thorn-chain') {
        tally.chain.laid++; if (p?.mirrored) tally.chain.mirrored++;
        const caps = mine.filter((q) => q.type === 'bouncy' || q.bouncy || q.style === 'bouncy');
        // (the floor mushroom stands on the widest piece: is that piece the LAST of the section?)
        const wide = [...mine].filter((q) => q.width >= 500).pop();
        if (wide && caps.length && wide.x > caps[0].x) tally.chain.mushroomLast++;
      }
      if (sec.template === 'w1-note-hollow') {
        tally.hollow.laid++; if (p?.mirrored) tally.hollow.mirrored++;
        const tops = mine.filter((q) => q.width >= 170 && q.height > 40).map((q) => q.y);
        let up = 0; for (let i = 1; i < tops.length; i++) up = Math.max(up, tops[i - 1] - tops[i]);
        if (p?.mirrored) { tally.hollow.rise.push(Math.round(up)); if (up > 123) tally.hollow.riseOver123++; }
      }
    }
  } catch (e) { if (seed <= 2) console.log('seed', seed, String(e).slice(0, 200)); }
}
tally.hollow.rise.sort((a, b) => a - b);
console.log(`the worked chain as the signature: laid ${tally.chain.laid}, MIRRORED on ${tally.chain.mirrored} (its floor mushroom at the far end on ${tally.chain.mushroomLast})`);
console.log(`the note hollow (H J, floor, c c): laid ${tally.hollow.laid}, MIRRORED on ${tally.hollow.mirrored}; mirrored, its tallest step up: ${tally.hollow.rise[0]}-${tally.hollow.rise[tally.hollow.rise.length - 1]} px, over a single's 123 on ${tally.hollow.riseOver123}`);
