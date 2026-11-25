// variantOf.ts: the castBots variant of a tester run (DATA-1125). A run's `gen2` line logs the layout's gen2 SEED
// (`1-4 seed 62405 normal ... list 6b772e6e`), not its place on the list. castBots/RealPlay take the 0-based INDEX of the list entry
// (RealPlay -> setLayoutVariant(v) -> the list's (v+1)-th plan), and 24 of 1-4's 100 entries are re-rolled seeds (plan key "62405:2"),
// so "logged seed n = variant n" is wrong twice over: an un-rerolled seed n is variant n-1, and a re-rolled one (which looks like a live
// roll) is castable at its plan's index. Every answer is proven by building the stage and reading stage.gen2.seed back.
// Reads "<stage> <logged seed> [list hash]" lines on stdin; prints "<stage> <seed> -> variant <v>" or why it cannot be cast.
//   printf '1-4 62405 6b772e6e\n1-6 31 e98480ba\n' | npx tsx tools/playtesters/variantOf.ts
// Run it on the build the players had (a worktree at that commit) when the list hash differs from this checkout's.
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { PROVEN_INDEX } from '../../src/game/gen2/provenIndex.ts';
import { RealPlay } from '../../src/game/realPlay.ts';

const lines = fs.readFileSync(0, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
for (const line of lines) {
  const [stage, seedS, hash] = line.split(/\s+/);
  const row = PROVEN_INDEX[stage];
  if (!row) { console.log(`${stage} ${seedS} -> no proven list on this checkout (not castable)`); continue; }
  if (hash && hash !== row.version) { console.log(`${stage} ${seedS} -> list ${hash} is not this checkout's ${row.version}: use the build's worktree`); continue; }
  const { LIST } = await row.load();
  const keys = LIST.plans.map((p) => p.split('|')[0].split(':')[0]);
  const v = keys.indexOf(seedS);
  if (v < 0) { console.log(`${stage} ${seedS} -> not on the list (a live roll: not castable)`); continue; }
  const built = (new RealPlay(stage, v) as unknown as { stage: { gen2?: { seed?: number } } }).stage.gen2?.seed;
  console.log(`${stage} ${seedS} -> variant ${v}${String(built) === seedS ? ' (proven: RealPlay builds gen2 seed ' + built + ')' : ' MISMATCH: RealPlay built ' + built}`);
}
