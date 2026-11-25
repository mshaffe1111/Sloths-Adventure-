// three readings of (b) side by side on the 3-1 draft's rolls (ENG-DARK-g): GEN2_DRAFT=3-1 npx tsx <this> <from> <to>
//   A: the restated verdict as written (darkLandings): every step off ANY rim onto a dark rim's piece lands darkStop from it, or the drop's
//      rim is dark and its stop wakes that rim's light in time;
//   B: A's hits whose drop rim lies OUTSIDE every dark box (no stop is offered there: the run-in that box 6 found at roll 30 Easy, x 175);
//   C: A's hits left once a drop from a DARK rim also passes when the edge he lands toward lies inside that rim's own landing light (the
//      light darkGaps guarantees its stop wakes): he sees the edge he is running at.
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { darkLandings, darkRims } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [a, b] = process.argv.slice(2).map(Number);
const re = /him (-?\d+) px.*?\((normal|easy)\), its light asleep(, the rim he left outside the dark)?: the rim at x (\d+), y (\d+) \((left|right).*?onto the rim at x (\d+), y (\d+)/;
const tot = { A: 0, B: 0, C: 0 }, rolls = { A: 0, B: 0, C: 0 };
for (let seed = a; seed <= b; seed++) for (const d of ['normal', 'easy'] as const) {
  setLayoutVariant(seed);
  let st: any;
  try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  const rims = darkRims(st);
  const hits = darkLandings(st, d);
  const n = { A: hits.length, B: 0, C: 0 };
  for (const h of hits) {
    const m = re.exec(h);
    if (!m) { n.B++; n.C++; console.log(seed, d, 'UNPARSED', h.slice(0, 120)); continue; }
    const out = !!m[3], ux = +m[4], uy = +m[5], udir = m[6] === 'right' ? 1 : -1, nx = +m[7], ny = +m[8];
    if (out) { n.B++; n.C++; console.log(seed, d, 'OUT', `u ${ux},${uy} n ${nx},${ny} room ${m[1]}`); continue; }
    const ud = rims.find((r: any) => Math.abs(r.x - ux) <= 1 && Math.abs(r.y - uy) <= 1 && r.dir === udir);
    const seen = ud?.light && Math.hypot(ud.light.x - nx, ud.light.y - ny) <= ud.light.r;
    if (!seen) { n.C++; console.log(seed, d, 'C', `u ${ux},${uy} n ${nx},${ny} room ${m[1]}`); }
  }
  for (const k of ['A', 'B', 'C'] as const) { tot[k] += n[k]; if (n[k]) rolls[k]++; }
}
console.log('hits', JSON.stringify(tot), 'rolls named', JSON.stringify(rolls), 'of', (b - a + 1) * 2);
