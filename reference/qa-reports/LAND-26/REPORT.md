# LAND-26: 2-6 back on release 4's line (release 5), beat A's soil block (R-165.451)

## EXACT NEXT STEP (session 1 hand-over, 2:19 PM ET Thu 11-26; branch t-land-26)
Code head **42e3b30fc** (pushed). Step 1 is DONE except two reds in 2-6's own tests (below, both need the lead's R-number and owner, D135).
**Running at hand-over (session 1 appends each verdict here when it finishes):** the unit suite in 3 shards and the CI tool line (gates.yml
line 157), both on frozen 42e3b30fc (run_in_background, timeout 7200000; CI #85, D141). If 42e3b30fc stays the code head, those count.
The next session, in this order:
1. ReadNotifications. `git fetch origin t-land-26 && git checkout -B t-land-26 origin/t-land-26`. npm ci --legacy-peer-deps
   (run_in_background). Frozen tree per run: `git worktree add --detach <scratch>/wt/m1 42e3b30fc`, link node_modules,
   `chattr -R +i src tools && chattr -i src/game/gen2/proven`.
2. **R-165.451, what session 1 found (data/A-floor790-upright-normal-b26-vs-42e3b30fc.jpg, left t-build-26 40a9c4bd2, right 42e3b30fc,
   Normal, upright 412 x 915, seed 1):** FIX-SOIL-b's 'porch 5' is the START FLOOR's turf at world x 790, y 6716 (on FIX-SOIL's tree id 5
   was that floor piece; on 42e3b30fc id 5 is a plank at y 6161, so never select it by id). The start area is the same on layouts 0-11
   (data/start-area-layouts0-11-42e3b30fc.jpg). Shot with tools/shootA.mjs.txt (FIX-SOIL's shoot26 with the spot 'the lowest platform under
   x 790'). Measured, column brightness under the turf (screen y 775-905, the mean of 6 columns right minus 6 left): **t-build-26 +12.2 at
   screen x 393 (the block's straight left edge); 42e3b30fc at most 1.6 anywhere: NO block in this frame.** Release 4's soil work (FIX-SOIL-b
   539885c37 merged by INT-R5d-c, groundBanks/groundCeilings) appears to have removed it. NOT yet proven: (a) which draw made the edge on
   t-build-26 (trace it there to the line: tools/trace26.mjs.txt wraps drawImage/fillRect only, ADD fill; best probe: after every draw
   call read 1x1 pixels at the edge's x-2 and x+2, several y, and log the call whose change differs, with its stack), so the REPORT can
   say which release 4 change removed it and that it is gone IN GENERAL; (b) Easy and sideways on 42e3b30fc; (c) the rest of 2-6 (the same
   measure over a grid of frames: tools/grid26.mjs.txt, PTS="x,y;..."); (d) a paint gate that reads the DRAWN output (D136, CI #87): a
   planted case RED on t-build-26's draw (the straight edge) and GREEN on 42e3b30fc. If a block remains anywhere, fix it in general (no
   stage id or x); a fix in protoArt.ts drawGround goes in its own hunk (FIX-SOIL-c's dip-pocket pass, a9c0170c on t-fix-soil-c, edits it).
3. Stills of beat A at 2x (deviceScaleFactor 2), upright AND sideways, both settings, on the final head: send the lead the UPRIGHT pair
   before going on. Playwright: `/opt/node-tools/node_modules/playwright/index.js`. Kill the vite port after each tree (no `ss` here: use
   `curl` on the port) and check the served tree (CI #78).
4. Packet step 3 (every gate once on the final head; the suite and the CI line again only if the code head moved off 42e3b30fc) and
   step 4 (land on t-land-26, no force).

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

## Step 2: R-165.451 (see EXACT NEXT STEP 2: gone in beat A's frame on 42e3b30fc by measure; cause and generality not yet proven)
- Session 1's first trace ran on the wrong frame (platform id 5 = a plank on this tree); it only showed wall chunks (protoArt.ts
  drawWallChunks :1554 via drawEarthWall :1460), the wheel, branch art, ladders and dress near that frame's screen x 300-420.
- Seed-1 camera grids of the whole stage (sideways, Normal) on both trees: the same plank porches and pieces; t-build-26's tall lighter
  soil COLUMN (beside the wheels, storeys y ~900-5700) is gone on 42e3b30fc (release 4's soil fix).

## Gate table (42e3b30fc)
| Gate | Result |
|---|---|
| tsc | clean |
| 2-6's own tests (18 files) | 126/128: 2 FAIL (w2Arc26 'one millrace'; rowWheels trunkCatch plant), both named above |
| known flips (set1, 23 rows) | 23/23 = CI-15, 0 moved |
| suite (3 shards) | RUNNING at hand-over (frozen 42e3b30fc) |
| CI tool line | RUNNING at hand-over (frozen 42e3b30fc) |
| paintcheck, lockall, castBots --proven 2-6, seedlist 2-6 --check, registrycheck, drawcheck, clipcheck, tierBots, timecheck, teachFirstScan | NOT RUN |

## Polish check
- Beat A upright Normal, t-build-26 vs 42e3b30fc (data/A-floor790-upright-normal-b26-vs-42e3b30fc.jpg): the block is visible on
  t-build-26 (right of screen x ~393 under the turf) and not on 42e3b30fc; at 1x only (an analysis still, not the 2x set for the lead).

## Learned
- A 'merge t-build-26' step can be a no-op when the branch already sits inside the release line: check `git merge-base --is-ancestor`
  first; then the reverts ARE the landing, and their conflicts are where 2-6 meets release 4's later work.
- A look defect is judged by a NUMBER read from the drawn frame (a brightness step across the edge), on both trees at one camera,
  never by eye alone; that number is also the seed of the paint gate D136 asks for.
- A packet's 'porch 5' is an id on another tree: a spot is named by its picture or its built geometry, never an id (rule 27's shape).

## Lessons applied
D115 (frozen, chattr'd worktree for every run), D119 (no heredoc in a commit chain), D128 (stamps from `date`), D134 (pushed and
ls-remote-confirmed before the hand-over), D135 (both reds named for an R-number), D138 (a hand-over ends new work), D140 (notifications
read at each step), D141 (the CI line named as not yet run on this candidate).
