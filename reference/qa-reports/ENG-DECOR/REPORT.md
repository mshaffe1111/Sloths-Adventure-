# ENG-DECOR (R-165.542): no decoration looks like a hazard on a stage where that hazard lives

## LANDED (box 1 tail, the lead's LAND)
Candidate 4cb57625f merged onto t-eng-29 3d635eb6e (ENG-CAM29's landing; no force). Nothing further for ENG-DECOR: idle.
Its follow-ups (the frog rows, the Normal-plus-cast-Easy test scope, the 2-5 upright still) wait on branch t-eng-decor-546 1e5c411d2
for R-165.546 (not merged).

## Gates (tail, on the frozen 4cb57625f; frozen worktree, chattr +i on src and tools, gen2/proven writable)
- tsc clean; generalitycheck PASS (26 literals, 26 known).
- THE LOCK (two runs): `--out` on 7387d089a, 3264 builds of 102 stages; `--check` on 4cb57625f: "lock: 100/102 stages unchanged",
  the two moves 2-5 proto.dress and 2-9 proto.dress, nothing else. (The merge's own lock pair, base 3d635eb6e: see the landing commit's
  message to the lead.)
- seedlist 2-5 --check: PASS, 100 seeds, each clean on both settings (2-9 has no list on this base).
- The CI tool line (gates.yml): 429 tests, 428 pass, 0 fail, 1 todo (the open chase-bot todo).
- The suite in 6 shards: 1: 697 / 696 pass / 0 fail / 1 todo; 2: 694 / 693 / 0 / 1 todo; 3: 690 / 690 / 0; 4: 832 / 831 / 1 FAIL;
  5: 709 / 709 / 0; 6: 624 / 623 / 0 / 1 todo. dressLookalike.test.ts runs in shard 5 and adds 419 s there.
- THE ONE RED: firstTimerBot.test.ts:177 "5-9's Easy goal rests on the kid's runs" (KID_RUNS_59) is t-eng-29's, owner BUILD-29-l
  (4799f6026): it fails the same way, with the same re-measured runs, on the base 7387d089a, and the lock shows 5-9 unchanged.
- drawcheck: PASS (1098 s, the same limits).
- Stills: below; 2-5 upright's re-shoot is on t-eng-decor-546 (R-165.546).

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
