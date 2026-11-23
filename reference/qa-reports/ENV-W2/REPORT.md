# ENV-W2 (R-165.362): World 2's code-drawn env plants off every World 2 stage

Engine (draw), Opus 5.5 high. Branch t-env-w2 on origin/t-int-15 23ac2e4bc (its src/ and tools/ = 0eefc707e, checked: no src/tools diff).
Started 8:35 PM ET 11-20. Head: see "Hash" at the end (this file is the last commit).

## Plant RED / GREEN
- `src/game/envW2.test.ts` (in the suite's `src/game/*.test.ts` glob, so CI runs it):
  1. World 2's kit lists (ENV[2].near + decor) name only Matt's painted flora (`pflower`, `pplant`);
  2. World 2's ground slots and near layer (paintDecorAt + paintNearPlant, 300 seeded slots each) stroke or fill **zero** paths;
  3. control: World 6's bog kit still draws its paths (the counter counts; other worlds' kits unchanged).
- **RED on the base**, pushed c42d89755 (8:39 PM ET): 1 and 2 fail ("still names code-drawn plants: reedclump, nipa, hyacinth,
  proproot, reedclump, nipa, proproot, driftwood, crocnest"; "drew code-drawn plant paths"); 3 passes.
- **GREEN on the fix** 97606abe4 (8:46 PM ET): 3/3.

## What was deleted (new replaces old) and what was kept
- `src/game/envKit.ts` ENV[2]: `near: []` (was reedclump, nipa, hyacinth, proproot); `decor: [['pflower', 2.5], ['pplant', 2]]` with
  `decorChance: 0.3` (was those two plus reedclump 4, nipa 2, proproot 2, driftwood 1.5, crocnest 1, no chance). Matt's painted flora
  keeps the share of ground slots it had (4.5 of 15 weight = 30%); the other 70% now take the shared slot (`terrain.ts topItem`: a
  grass tuft, one of World 2's painted flowers, a mushroom or a pebble), the way World 1's kit already works (decorChance 0.35).
  `sway: 'droop'` and `front: 'reed'` untouched (not in the packet; see Suggestions).
- `src/game/envPlants.ts`: the six World 2-only code-drawn plants deleted with their EXTRA_PLANTS rows (reedclump, nipa, hyacinth,
  proproot, driftwood, crocnest: 158 lines); nothing else used them (git grep: no other reference in src/, tools/ or reference/ catalogs).
- No new code-drawn shape; no swap needed: the painted twins (pflower/pplant from paintedScenery.ts groundFlora(2)) were already in the
  kit, at their inventory sizes (flower 22-30, plant 28-40, the same draw call as before).
- Found on the way: ENV[2].near was dead in play: World 2 is painted strips (paintedBackdrops.ts hasPainted), so scenery.ts buildNear
  never runs for it. Emptied anyway (nothing code-drawn left to come back if the strips are ever missing: the shared undergrowth path
  instead, as every kit-less world).

## Gates (verdict per gate; logs in the container, numbers pasted)
Run on t-env-w2 97606abe4 (the fix; this REPORT commit changes no code), worktree /home/user/envw2, 4 cores, 8:39-9:55 PM ET.

| Gate | Verdict | When (ET) / numbers |
|---|---|---|
| tsc | PASS | 9:54:44-9:54:47 PM, exit 0 (also green at the fix, before the stills) |
| the suite, 6 shards (deploy.yml's split, the CLAUDE.md line in full) | PASS | 8:46-9:26 PM: 700 + 673 + 688 + 652 + 635 + 658 = **4,006 tests, 4,003 pass, 0 fail, 3 todo** (the base's 4,003 / 4,000 / 0 / 3 per INT-15, plus envW2.test.ts's 3) |
| lockall --layouts 16 vs the base t-int-15 | PASS | 8:51-9:00 PM: **102/102 stages unchanged** |
| lockall --layouts 16 vs main 107870f5d (--intended 2-5) | PASS | **101/102; only 2-5 moved, and it moved identically on the base** (base vs main: 101/102, 2-5 intended = INT-15's BUILD-25d; mine vs base 102/102). Main and base recorded by lockall --out; compared with lockall's own --check rule on the saved records (scratch lockcmp.mjs, the same loop) |
| drawcheck (2-1, 2-2, 2-4, 2-5, 2-6 in its stage list) | PASS | 9:11-9:24 PM, 772 s |
| paintcheck 0/3, 1/3, 2/3 | PASS, PASS, PASS | 9:25-9:39 / 9:24-9:34 / 9:39-9:45 PM (170 / 107 / 106 known ids seen) |
| generalitycheck | PASS | 9:54:47 PM |
| knowncheck | PASS | 9:54:47 PM |
| artcheck | PASS | 9:54:47 PM |
| roadmapcheck (repo unshallowed) | PASS | 9:54:47-9:54:51 PM |
| timecheck | PASS | 9:02 PM |
| vite build, deploy base + chunkcheck | PASS, PASS | 9:00:37-9:00:44 PM |
| coveragecheck (D96) | PASS | 9:00:55-9:02:00 PM |
| tipwalk --layouts 4 (D96) | PASS | 9:02:02-9:02:20 PM |
| registrycheck (D96) | PASS | 9:02:20-9:03:15 PM (13 stages registered everywhere) |
| clipcheck | PASS | 9:25-9:37 PM (83 known) |
| kbdcheck | PASS | 9:37:44-9:39:55 PM (its rewritten keyboard stills restored with git checkout, never committed) |
| the CI tool line (gates.yml, CI=1) | PASS | 9:25-9:38 PM: 332 tests, 331 pass, 0 fail, 1 todo |
| tierBots | PASS | 9:38:53-9:41:57 PM: 9/9 |
| seedlist 1-1 --check | PASS | 9:41:57-9:44:43 PM (161 seeds) |
| seedlist 2-1 / 2-2 / 2-4 / 2-5 --check (World 2's lists) | PASS x4 | 9:45-9:54 PM (100 seeds each, clean on both settings) |
| buildcheck, ALONE (load 1.6) | PASS | 9:45:22-9:45:27 PM: Normal p95 79 ms, Easy p95 46 ms (limit 150) |
| Not run, and why | — | the other 8 registered seed lists (World 1's 1-2..1-9): a draw-only change, lockall 102/102 vs the base proves every stage's plan unchanged; funcheck, castBots: not in the packet's list, nothing they measure (play, cast) is touched |

## Stills (Normal, layout 1, 2x, full screen, the same spot on both builds: the stage's widest solid ground)
`reference/qa-reports/ENV-W2/stills/w2-<stage>-L1-normal-<before|after>-<upright|sideways>.jpg` for 2-1 (x 32286), 2-2 (x 31146),
2-4 (x 29781), 2-5 (x 7300); shot by `reference/qa-reports/ENV-W2/stillsW2.mjs` on dev servers of the base (before) and the fix (after).

## Polish check (each looked at at 2x, the whole screen first: D79)
- Whole-screen pass, every still: HUD, hearts, sign, door, flag, cast, Dot's/Pokey's line boxes, painted backdrop: identical before and
  after; nothing off-job changed. Pokey's pose differs on 2-1/2-2 (his idle cheer clip's frame), not this change.
- 2-5 sideways/upright: the neon-green reed strokes and teal stilted sprouts by the boulder, the flag and the turtle are gone; the ground
  keeps painted plants (the broad-leaf one by the petal and by the flag), red and pink painted flowers, pebbles, a few small mushrooms.
  Reads clean, not bare.
- 2-1 sideways/upright: the bright green grass fans and teal sprouts by the burrow door and the clothesline are gone; painted fern,
  flowers and a mushroom stand there. Clean.
- 2-2 sideways/upright: the tall green reed fans by the frog, the pot and the flag are gone; painted flowers and the leafy plant stay.
  Clean.
- 2-4 sideways: clean. **2-4 upright, named spot:** the ground from Pokey to the flag and on to the red flower (x ~29781 to ~30050)
  reads lighter than before (pebbles, one red painted flower, a fern at the edge). Light, not bare to my eye; the painted reeds and
  bushes of the backdrop stand right behind it. The lead decides whether it wants a painted fill.
- Not changed and seen in every frame: the code-drawn hanging strands under the HUD sign (sway 'droop': thin green drips off the
  painted palm fronds) and the shared slot's small code-drawn mushrooms and grass tufts. Small touches (STAGE-RULES §4), the same as
  the OFF still the lead judged clean; named, not changed.

## Learned (for the next draw member)
- A kit change is draw-only but rides the decoration dice: decorChance takes one roll first, so every slot after it lands differently;
  the layouts cannot move (lockall proves it), but the stills differ beyond the deleted plants. Compare the same spot, judge the whole
  ground, not the slot.
- The near layer of a painted world never draws (buildNear runs only for unpainted worlds): check `hasPainted(world)` before spending
  stills on it.
- A planted test for "no code-drawn X" is strongest as a path counter on the real draw calls plus a list check, with a control world
  that must still draw (so a broken counter can't pass).

## Lessons applied
D40 (built on release 2's merged code, nothing planned replaces World 2's ground slots this sprint); D79 (whole-screen pass first on
every still); D86 + D96 (the full CLAUDE.md line plus coveragecheck, registrycheck, tipwalk, timecheck); D102 (read lean: the packet's
files by grep and line range; stills judged in before/after composites).

## Suggestions (outside my WRITE files; ready packets for the lead)
- World 2's `front: 'reed'` (paintFrontClump's 26 dark code-drawn strokes along the bottom edge, shared with World 6) and `sway: 'droop'`
  are the last code-drawn pieces of World 2's kit. Neither read as rough in these stills; a later look at 2-x on a phone at the frame's
  bottom edge decides whether a painted twin is worth a Hugging Face job.

## Hash
- RED: c42d89755 (8:39 PM ET). Fix + stills: 97606abe4 (8:46 PM ET; every gate above ran on it). This REPORT: the branch tip after it
  (adds only this file; `git ls-remote origin t-env-w2` is the proof). Written 9:55 PM ET.
- For the integrator: merge t-env-w2 whole; it touches src/game/envKit.ts (ENV[2] only), src/game/envPlants.ts (World 2's section and
  six EXTRA_PLANTS rows), the new src/game/envW2.test.ts, and reference/qa-reports/ENV-W2/.
