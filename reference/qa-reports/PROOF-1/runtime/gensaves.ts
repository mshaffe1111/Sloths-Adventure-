// writes, with THIS repo's own save code (run from a worktree's root), a finished game, a 34-find game and a fresh game: each as the save
// file (buildSave) AND as the raw storage map (what the phone's localStorage holds).  npx tsx gensaves.ts <outdir>
import { writeFileSync, mkdirSync } from 'node:fs';
const root = process.cwd();
const out = process.argv[2];
mkdirSync(out, { recursive: true });
const fill = await import(`${root}/src/game/saveFill.ts`);
const sf = await import(`${root}/src/game/saveFile.ts`);
const finds = await import(`${root}/src/game/finds.ts`);
const best = await import(`${root}/src/game/stageBest.ts`);
const at = new Date('2026-11-12T15:00:00Z');
const dump = (m: any) => { const o: Record<string, string> = {}; for (const k of m.keys ? m.keys() : Object.keys(m)) o[k] = m.getItem(k); return o; };
const fin = fill.memStorage();
fill.fillFinishedGame(fin);
const f34 = fill.memStorage();
fill.withLocalStorage(f34, () => {
  for (let w = 1; w <= 5; w++) for (let m = 1; m <= 10; m++) f34.setItem(`sloth_lvl_${w}-${m}`, JSON.stringify(best.mergeBest(null, { stars: 2, score: 4000, time: 140 }, 'normal')));
});
console.log('ALL_FINDS', finds.ALL_FINDS.length);
fill.fillFinds(f34, 34);
for (const [n, m] of [['finished', fin], ['finds34', f34]] as const) {
  writeFileSync(`${out}/${n}.save.json`, JSON.stringify(sf.buildSave(m, at), null, 2));
  writeFileSync(`${out}/${n}.storage.json`, JSON.stringify(dump(m), null, 1));
  console.log(n, 'keys', [...(m.keys ? m.keys() : [])].length, 'summary', JSON.stringify(sf.buildSave(m, at).summary));
}
