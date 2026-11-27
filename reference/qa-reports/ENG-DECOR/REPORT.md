# ENG-DECOR (R-165.542): no decoration looks like a hazard on a stage where that hazard lives

## EXACT NEXT STEP (box 2)
1. ReadNotifications. `git fetch origin t-eng-decor t-eng-29`; check out t-eng-decor. Base = origin/t-eng-29 7387d089a (merge, never
   rebase, if ENG-CAM29 has landed there since).
2. THE LOCK GATE. Box 1 started `lockall --layouts 16 --out base.json` on a worktree of 7387d089a (scratchpad/base, base.json in the
   scratchpad; started, not finished at the hand-over). If that file is not in hand and complete, re-run it:
   `git worktree add --detach <scratch>/base origin/t-eng-29`, `ln -s $PWD/node_modules <scratch>/base/node_modules`, from the worktree
   `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json` (run_in_background), then on t-eng-decor
   `npx tsx tools/engine/lockall.ts --layouts 16 --check <scratch>/base.json`, with its counts line. ONLY 2-5 and 2-9 may move, and only
   in `proto.dress` (or `dress`). Name every other move and STOP if there is one.
3. seedlist --check for 2-5: `npx tsx tools/engine/seedlist.ts 2-5 --check` (2-9 has no list on this base). If a proven seed's play
   moves, STOP and send it to the lead.
4. tsc + generalitycheck; the CI tool line; the suite in 6 shards (`--test-shard=i/6`, the CLAUDE.md file list); drawcheck.
   Freeze per D115 with src/game/gen2/proven/ writable. (dressLookalike.test.ts already PASSED on its own in box 1: 3/3, 432 s.)
5. Re-shoot ONE still: 2-5 upright at the frog (x 20151): box 1's placement (x - 160) put Pokey over a gap, so the frog is off the
   right edge. Place him at x 20151 - 90 on the bank under the frog. Script: box 1's shoot.mjs (scratchpad; it is the camFeel.mjs way:
   vite dev server per tree, `window.__play(stage, 1)`, PW=/opt/node-tools/node_modules/playwright/index.mjs).
6. Land on t-eng-29 (merge, no force); send the lead the hash, each shard's totals, the lock counts line and the stills below.

## Stills (box 1, layout 1 Normal, base 7387d089a vs fix d2fd4e0da)
- `stills/2-9-up-before-after.jpg`: 2-9 upright, the quay by the pads (x 10806): BEFORE the painted turtle on a log beside the kingfisher
  post, the snappers at 10116-10490 just behind him; AFTER a small green frog on a stone in its place. It sits on the bank at Pokey's
  scale and reads as a harmless animal. Draw path: proto.dress -> engine.ts's dress pass -> dressArt.ts, World 2's new sheet
  (dressNewData.ts, dressnew-w2.webp).
- `stills/sheet-before.jpg` / `sheet-after.jpg`: 2-5 upright (left; the frog is off the right edge, see step 5), 2-9 sideways (top right:
  the guard snappers in red rings on the left, the frog by the kingfisher post), 2-5 sideways (bottom right: a real snapper at the left
  edge, the frog on the bank at the right). The sepia tint and the story bubble on 2-5 are the opening story bubble (engine paused), the
  tool's, not the dress (BUILD-29-k saw the same).
- Probe on the real page: the dress within 500 px was `w2Turtle@10806` (2-9) and `w2Turtle@20151` (2-5) on the base, `w2Frog` at the
  same x on the fix; nothing else moved.

## What changed (box 1)
- `src/game/artDress.ts`: `HAZARD_LOOKALIKE` (data: `w2Turtle -> family 'turtle', swap 'w2Frog'`; any world adds a row) and
  `clearLookalikes(ds, foes)`: a piece whose family is one of the stage's own enemy types becomes its swap (if the swap is not itself a
  lookalike there) or is left out. No stage id, seed or x.
- `src/game/protoStage.ts` addDress: the rolled sets AND the stage's own set dressing pass through `clearLookalikes` with the stage's
  enemy types. The swap is done before `placeDress`, so the frog (55 units wide, smaller than the turtle's 73) is placed by the same rule.
- `src/game/dressLookalike.test.ts`: the unit cases, the PLANT, and the invariant over every listed seed of every listed stage (and the
  other stages' 16 layouts) in every world whose DRESS_SETS can roll a lookalike, both settings.
- Probe (box 1, node): with the fix, 2-5 and 2-9 layouts 1-8 hold no w2Turtle; 2-6 and 2-8 (snakes, no snappers) keep theirs.
- tsc clean; generalitycheck PASS (26 literals, 26 known) after the code change.
- `npx tsx --test src/game/dressLookalike.test.ts`: 3 tests, 3 pass, 0 fail (432 s; the invariant over World 2's every listed seed and
  2-6/2-8/2-9 x16, both settings; the PLANT finds the turtle on 2-5 and 2-9). It adds about 7 minutes to whichever suite shard holds it:
  the lead's call whether to keep both settings.

## Candidates for the lead (not in the table: the brief's row only)
- `w2Frog` and `w1TreeFrog` show a frog; frogs are foes in Worlds 6 and 7 only today, so no World 1/2 stage breaches. A row each would
  guard a future frog there. `w7FrogIdol` and `w7JaguarHead` are stone carvings, not animals: left out.
