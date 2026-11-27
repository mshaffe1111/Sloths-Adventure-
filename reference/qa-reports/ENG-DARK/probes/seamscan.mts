// ENG-DARK box 14: adult Normal rolls a..b with noSeamWalk (the seam plant): the most crossings of one rim (loop) and the unlit count,
// and the same unplanted. GEN2_DRAFT=3-1 npx tsx <this> <a> <b>
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [a, b] = process.argv.slice(2).map(Number);
for (let seed = a; seed <= b; seed++) {
  const p = ft.firstTimer('3-1', seed, { ...ft.FT_ADULT, setting: 'normal', noSeamWalk: true }, { cap: 200 });
  if ((p.dark?.loop ?? 0) < 6) { console.log(seed, 'planted loop', p.dark?.loop); continue; }
  const u = ft.firstTimer('3-1', seed, { ...ft.FT_ADULT, setting: 'normal' }, { cap: 200 });
  console.log(seed, 'planted loop', p.dark?.loop, 'unlit', p.dark?.unlit.length, '| unplanted loop', u.dark?.loop, 'unlit', u.dark?.unlit.length, 'crossed', u.dark?.crossed);
}
