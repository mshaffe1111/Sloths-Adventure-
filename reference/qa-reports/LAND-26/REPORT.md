# LAND-26: 2-6 back on release 4's line (release 5), beat A's soil block (R-165.451)

## EXACT NEXT STEP (session 1 hand-over, 2:13 PM ET Thu 11-26; branch t-land-26)
Code head **42e3b30fc** (pushed). Step 1 is DONE except two reds in 2-6's own tests (below, both need the lead's R-number and owner, D135).
The next session, in this order:
1. ReadNotifications. `git fetch origin t-land-26 && git checkout -B t-land-26 origin/t-land-26` (the REPORT commit sits on 42e3b30fc).
   npm ci --legacy-peer-deps (run_in_background). Frozen tree: `git worktree add --detach <scratch>/wt/m1 42e3b30fc`, link node_modules,
   `chattr -R +i src tools && chattr -i src/game/gen2/proven`.
2. **Start the suite on 42e3b30fc NOW** (3 shards, run_in_background, timeout 7200000; CI #85) and the CI tool line (gates.yml line 157)
   on the same frozen tree (D141). Session 1 did NOT start either.
3. **R-165.451 (the soil block) is NOT traced yet.** Session 1's frame is the WRONG frame: on 42e3b30fc, `__play('2-6', 0)` rolls seed 1 and
   platform id 5 is a plank at y 6161 (data/m1-A-porch5-normal-upright.jpg shows planks and a wheel, no turf porch). FIX-SOIL-b's beat A
   (b/BA26-upright.jpg, "after-A-porch5") is a TURF porch with a hobbit door on its left, a green vine at screen x ~280 and the lighter
   block right of screen x ~363 (412 x 915), from the porch's soil down. Find that porch on 42e3b30fc: tools/plats26.mjs.txt lists
   platforms (id x y w h style); widen its x filter and look for the turf porch (FIX-SOIL-b shot a9439e586 + its patch: its ids may differ,
   so match by the picture, not by id 5). Then run tools/trace26.mjs.txt with the spot's platform and EDGE set to the block's left edge.
   **Its trace only wraps drawImage and fillRect: add `fill`** (FIX-SOIL-c judged it 'painted soil texture in a lighter shade: protoArt's
   ground', likely a pattern fill or a soil chunk). Best probe: after EVERY draw call read the two pixels either side of the edge
   (getImageData 1x1 at x-2 and x+2, several y) and log the calls whose change differs between the two (the call that MAKES the edge),
   with its stack. Then read that function to the line, fix it in general (no stage id or x), plant a paint-gate case RED on the straight
   edge that reads the drawer's OUTPUT (D136, CI #87), GREEN after. A fix in protoArt.ts drawGround goes in its own hunk (FIX-SOIL-c's
   dip-pocket pass, a9c0170c on t-fix-soil-c, also edits it); name the file and function here.
4. Stills of beat A at 2x, upright AND sideways, both settings (shoot26.mjs from reference/qa-reports/FIX-SOIL, Playwright path
   `/opt/node-tools/node_modules/playwright/index.js`): send the lead the UPRIGHT pair before going on. Kill the vite port after each tree
   and check the served tree (CI #78).
5. Then packet step 3 (every gate once on the final head) and step 4 (land on t-land-26, no force).

## Step 1: the reverts and the merge (done, 42e3b30fc)
- Base: c73cb9766 (origin/release-0.10.3, confirmed by ls-remote). Branch t-land-26 cut from it.
- `git revert 41cb842a1` -> 132425a43. ONE conflict: .github/workflows/gates.yml line 157 (the CI tool line): release 4 had added
  tools/engine/teachFirstScan.test.ts and tools/engine/sideWall.test.ts, the revert put back tools/inspect/rowWheels.test.ts; resolved
  token by token: release 4's line + rowWheels.test.ts at its old place (after snapperTaught.test.ts).
- `git revert 4816edd31` -> e26a73fb7. No conflict.
- `git revert 8d094787c` -> 42e3b30fc. ELEVEN conflicts, each keeping release 4's 2-7 AND 2-6's gen2 listing:
  - src/components/stageClue.ts: 2-6 = the keeper's 'A Welcome Sign' (= w2Arc26.ts CLUE_26, its comment back), 2-7 = release 4's 'Written Back'.
  - src/game/pokeyJournal.ts: 2-6 = JOURNAL_26 (with its comment), 2-7 = release 4's line.
  - src/game/stagePlan.ts: 2-6 = MISSION_26 (with its comment), 2-7 = release 4's.
  - src/game/gen2/judgedTable.test.ts (2 hunks): the JUDGED table holds '2-6': 'normal-2-6' beside '2-7': 'normal-2-7'.
  - src/game/gen2/listed.ts (3 hunks): both imports; KITS and WORLD hold 'w2-26' and 'w2-27' (FINISH's 'w2-26': finish26 merged clean).
  - src/game/gen2/provenIndex.ts: 2-6's row (n 100, version 52496f5f = t-build-26's) beside 2-7's.
  - src/game/gen2/worlds/flownArcs.ts (2 hunks): n26 and n27; 2-6's eight flown rows (ENG-26s) before 2-7's.
  - src/game/gen2/worlds/stageTable.ts (2 hunks): kit type holds 'w2-26' | 'w2-27'; 2-6's row (kit w2-26, judged normal-2-6) before 2-7's.
  - src/game/stageSheets.ts: NEITHER hand-built gold-snake line (2-6 and 2-7 are both gen2; 2-7's line went with BUILD-27's deletion).
  - src/game/w2Sections.ts (3 hunks): W2Plan = '2-8' | '2-9'; W2_FLAVOURS Record<W2Plan> without the old 2-7; the header names 2-6 and 2-7 as gen2.
  - src/game/w2Stages.ts: W2_STAGES holds 2-8 and 2-9 only (both hand-built plans gone).
- `git merge 40a9c4bd2` (t-build-26): **Already up to date**: release 4's line already holds t-build-26 @ 40a9c4bd2 (86aad83a7, FILL-14b's
  1-4 fill); the reverts were what kept 2-6 out. t-build-26 after e8e99d167 (INT-R5's merge point) touched only 1-4's seed fill and the seed
  tools, so nothing of 2-6 was lost in that merge. 2-6's own files (w2Arc26.ts, w2Arc26.test.ts, proven/seeds-2-6.ts, rowWheels.ts) are
  byte-identical to t-build-26's.
- **tsc: clean** on 42e3b30fc.
- **The ten known flips** (ENG-PLANT's set1, reference/qa-reports/ENG-PLANT/ci-tools/set1-m.sh.txt, on frozen 42e3b30fc): **23/23 rows equal
  to CI-15's committed set1** (ENG-PLANT/data/ci/s12/fin15/set1-ci15), 0 moved, all PASS (data/set1-42e3b30fc-cmp.txt; cmp3.py's column
  labels are its own: all three columns are CI-15, CI-15, this tree).
- **2-6's own tests** (18 files: w2Arc26, w2Stages, judgedTable, listedWheelSheet, tower*, towerWater, towerBots, wheel, w2, riverLay,
  nodeClock, dotBox, qaW123, edgeFooting, w1NewArt, rowWheels, sideWall): **128 tests, 126 pass, 2 FAIL** (data/t26-42e3b30fc.txt):
  1. **w2Arc26.test.ts:69 'one millrace': 5 !== 1** (normal 1). Cause, traced (tools/riv26.ts.txt): release 4's World 2 finish rule (w2.ts
     ~326, ENG-GROUND-b: 'a fall has its river when one spans it AT ITS HEIGHT') now lays a still pool in four of 2-6's water/soft falls
     that had NO water on t-build-26 because the millrace spanned them in x at another height: normal 1's rivers = the millrace (x 479-1277,
     surface 4970, speed 70, way -1), three wheel ponds, and four NEW still pools 80-90 px wide (x 674-753, 953-1042, 1242-1332 at surface
     3782; 714-799 at 5588). The test counts every non-wheel-pond river as the millrace. So 2-6 now SHOWS water in four falls it never drew
     water in (a look change and possibly a play change: lockall and castBots will say). Not fixed: the lead's call whether the test counts
     the log river only (speed > 0) and adds the pools as expected, or the pools are wrong for 2-6 (law 22: not changed to get green).
  2. **rowWheels.test.ts:96 PLANTED 'trunkCatch OFF ... rescues come back (RED)'**: with the plant on, 0 rescues in all six runs (middle N/E,
     expert N, v1 and v2): the plant no longer bites on release 4's bots (CI-15 changed the bot; the same shape as ENG-PLANT-CI's waitRise
     re-plant, R-165.432). Not fixed: a bot-owner re-plant (a live case on CI-15's bots), never a removal.
- Not yet run on 42e3b30fc: the suite, the CI tool line, and every step 3 gate.

## Step 2: R-165.451 (NOT traced yet; see EXACT NEXT STEP 3)
- Session 1's trace (tools/trace26.mjs.txt) ran on the WRONG frame (seed 1, id 5 is a plank); its only output is that drawImage/fillRect
  near that frame's x 300-420 are wall chunks (protoArt.ts drawWallChunks :1554 via drawEarthWall :1460), the wheel, branch art, ladders
  and dress: no lighter block in that frame.

## Gate table (42e3b30fc)
| Gate | Result |
|---|---|
| tsc | clean |
| 2-6's own tests (18 files) | 126/128: 2 FAIL (w2Arc26 'one millrace'; rowWheels trunkCatch plant), both named above |
| known flips (set1, 23 rows) | 23/23 = CI-15, 0 moved |
| suite (3 shards) | NOT RUN |
| CI tool line | NOT RUN |
| paintcheck, lockall, castBots --proven 2-6, seedlist 2-6 --check, registrycheck, drawcheck, clipcheck, tierBots, timecheck, teachFirstScan | NOT RUN |

## Polish check
- None yet: no still of the soil block on this head (session 1's frame was the wrong one).

## Learned
- A 'merge t-build-26' step can be a no-op when the branch already sits inside the release line: check `git merge-base --is-ancestor`
  first; then the reverts ARE the landing, and their conflicts are where 2-6 meets release 4's later work.
- A packet's 'porch 5' is an id on another tree: a spot is named by its picture or its built geometry, never an id (rule 27's shape).

## Lessons applied
D115 (frozen, chattr'd worktree for every run), D119 (no heredoc in a commit chain), D128 (stamps from `date`), D134 (pushed and
ls-remote-confirmed before the hand-over), D135 (both reds named for an R-number), D138 (a hand-over ends new work), D140 (notifications
read at each step), D141 (the CI line named as not yet run on this candidate).
