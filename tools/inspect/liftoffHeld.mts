// liftoffHeld (bot-fix 2026-11-04): frames where the first-timer meant no steer but his thumb still steered (the late lift-off), a run each.
//   npx tsx tools/inspect/liftoffHeld.mts <repo root> 2-1:kid:1 4-6:adult:1 ...   (point <repo root> at a worktree to measure an older bot)
const root = process.argv[2];
const { FirstTimerRun, firstTimer, FT_KID, FT_ADULT } = await import(root + '/tools/inspect/firsttimer.ts');
const P = FirstTimerRun.prototype as any;
const orig = P.thumbify;
let held = 0, waits = 0, streak = 0, longest = 0;
P.thumbify = function (want: any) {
  const out = orig.call(this, want);
  const meant = want.right || want.left, did = out.right || out.left;
  if (!meant) waits++;
  if (!meant && did) { held++; streak++; longest = Math.max(longest, streak); } else streak = 0;
  return out;
};
for (const spec of process.argv.slice(3)) {
  const [id, w, seed] = spec.split(':');
  held = waits = streak = longest = 0;
  const r = firstTimer(id, Number(seed), w === 'kid' ? FT_KID : FT_ADULT);
  console.log(`${id} ${w} seed ${seed}: no-steer frames ${waits}, thumb still on ${held} (${waits ? Math.round(100 * held / waits) : 0}%), longest ${longest} frames (${(longest / 30).toFixed(1)} s); lives ${r.harms.filter((h: any) => h.kind === 'life').length}, rescues ${r.rescues}, end ${r.end} ${r.time.toFixed(0)} s`);
}
