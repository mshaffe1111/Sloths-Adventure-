# FIX-SOIL-b (session 2 of FIX-SOIL; t-fix-soil from main cdffdc627). Started 8:58 AM ET 11-25 (by `date`); this box written 11:15 AM ET


## EXACT NEXT STEP (for a FRESH session: this one stopped at the lead's word, context past the box)
**FINAL CODE HEAD 539885c37 on t-fix-soil (stills APPROVED by the lead). Two gates NOT RUN on it; run each ONCE on a frozen tree of
539885c37 (git worktree add --detach; link node_modules; chattr -R +i src tools; D115):
(1) the CI tool line: .github/workflows/gates.yml, the 'rolled' job's step that starts `npx tsx --test tools/engine/library.test.ts`
(about 5 min; it includes tools/engine/paintFall.test.ts, this fix's 4 planted tests);
(2) `node tools/perf/drawcheck.mjs` (about 6 min; 1-4 and 2-6 are its scenarios; the hung bank adds 1 bake and, on the live path
only, 1 image and 1 gradient a frame).
Then fill their rows in the gate table below, push t-fix-soil, confirm with `git ls-remote origin t-fix-soil`, send the hash and table
to the lead. Do NOT merge into the 2-6 branch: integration takes t-fix-soil into release 4.**

## Gate table, final code head 539885c37 (every run once, on a frozen tree unless named)
| Gate | Result |
|---|---|
| tsc --noEmit -p . | PASS (on the working tree holding exactly 539885c37's code, run just before that commit) |
| paintcheck full sweep (all parts in one run) | PASS: 5838 builds of 102 stages, every listed seed, both settings; 0 SOIL OVER, 0 new, 0 stale |
| lockall --layouts 16 --check main's lock (made on frozen cdffdc627, lock-main-cdffdc627.json) | PASS: 102/102 stages unchanged (zero moves) |
| the suite, 4 shards (CLAUDE.md's 7 globs, 622 files) | PASS: 4042 tests, 4039 pass, 0 fail, 3 todo (the todos are already there before this change: 4-3 wall check, R-165.312, one more) |
| the CI tool line (gates.yml rolled) | NOT RUN (see EXACT NEXT STEP) |
| drawcheck | NOT RUN (see EXACT NEXT STEP) |
| planted RED/GREEN (on 003e8b323's code = 539885c37 less the bake-only shade; the rule's geometry is the same) | 1-4: GREEN 200/200; cut off RED 335 lines. 2-6 at a9439e586 + the patch: GREEN 200/200; cut off RED 600 lines on 200/200 |
| paintFall.test.ts | 15/15 on 003e8b323's code (part of the CI line above on 539885c37) |
| generalitycheck, knowncheck | PASS (c22702edc); roadmapcheck: FAIL here only because this container is a shallow clone (no ROADMAP change) |

## Stills on the final head (APPROVED by the lead): final/
- 1-4 layout 1, main vs 539885c37: final/F-BA-normal-sideways.jpg, F-BA-normal-upright.jpg, F-BA-easy-sideways.jpg,
  F-BA-easy-upright.jpg; the underside 2x: final/F-underside-closeups.jpg.
- 2-6 at a9439e586 vs + the patch, beats A (porch 5), B (the start floor under it), C (the top bank): final/F-BA26-sideways.jpg,
  F-BA26-upright.jpg. NAMED, not ours (the lead filed it for W2-LANE): in beat A a lighter soil block with a straight side right of
  x ~545 under porch 5, in both before and after (final/F-BA26-upright.jpg, frame A, bottom right).

## Pushback / suggestions / unresolved / method
- Pushback: none on the ruling. One finding beyond it, fixed with the lead's OK: the soil's depth line averaged the summit's top into
  the start floor (a shade step under the start on main).
- Suggestion (a packet): paintTile still paints empty squares under a hung bank down the whole climb (as main painted the column);
  stop a hung bank's reach at its underside + 80 in paintTile's null test (fewer squares, less memory on 1-4).
- Merge note for integration: protoArt.ts groundBanks() is the ONE bank list; t-fix-sidewall changes that same drawProtoScene line to
  narrowBank.ts bankList(...): put bankList INSIDE groundBanks, so the gate keeps reading what the screen draws.
- Unresolved: the two NOT RUN gates above.
- Method update (stage-fix/render-fix): a look gate reads the drawer's exported output (here groundSoil's outlines), never the
  assignment (D136); a fix that hangs a bank shoots both worlds it reaches before landing (World 2's pale lip rim showed only on 2-6).
- Lessons applied: D115 (every run on a frozen, chattr'd tree), D119 (no heredoc in a commit chain), D128 (times from date), D134
  (pushed and ls-remote before every hand-over), D135 (every suite red named: none), D136 (the gate reads what is drawn).
- Turnover: reference/handoffs/engine-core.md 0zs-SOIL (commit f4c364a53).

## What changed (draw-only; no layout moves: lockall pending)
- src/game/protoArt.ts: drawGround's per-bank side logic moved, unchanged, into exported bankOpen(); the soil's clip outline into
  exported soilOutline() (a non-hung bank's path is the same points in the same order as before). NEW soilHangs(): a bank whose soil,
  run on down, would cover a lower bank's top or the 48 units of room over it (more than the 3-unit join where two soils meet), with a
  gap of at least 48 (his height), is HUNG: its soil stops at its own bottom. Tucks (gap under 48) and step-down joins are unchanged.
  groundSoil() exports the soil regions exactly as drawGround paints them (paint order, pockets after). groundLine() leaves hung banks
  out (else the summit's top, 10,000 up, stepped the start floor's soil shade at x ~244: visible in main's start stills too).
- The underside (code-drawn small touch, STAGE-RULES §4, from the world's OWN painted lip): the bottom edge rounds up 30 into each open
  end's face over 110 units (a belly, never below the collider), a soft clumped line between (world-anchored), the lip's turf underside
  and its roots (hung 1.8x long) laid along it (groundPaint.ts drawUnderside, baked once per bank, 1 image a frame on the live path),
  the soil shaded toward it (the world's deep tone, 0.7), the end pieces faded into the soil above the rounding.
  No inventory piece fits: the overhang/underside rows (w1-ledge-overhang-big, w1-hide-slab-overhang, w3 shelfS) are standalone
  props off main (art-director/t-art-next branches), a different shape from a bank of any width; flume-props rootsHang is World 7's.
- tools/engine/paintFall.ts soilOvers(): the planted rule, wired into paintcheck (no known list: every breach fails).
- tools/engine/paintFall.test.ts (CI-run): 4 tests: the two-bank plant (RED on main's column, GREEN as drawn, never under the collider),
  a tuck and a step join (no breach, not hung), a face clear of a floor under its end (no breach), the depth line.

## Proven so far
- 1-4 paintcheck --stages 1-4, 200/200 builds: GREEN on the fix (WIP 8ef75a90b's tree); RED with the cut off (335 SOIL OVER lines,
  every build: the plant tree = the fix with soilHangs' line off).
- paintFall.test.ts 15/15; the 15 src/game tests that import protoArt or groundPaint: 107/107; tsc clean.

## Stills (law 2; b/): 1-4 layout 1 (seed 2), main cdffdc627 (top row) vs c22702edc frozen (bottom row): start, 1/3, 2/3, just
under the summit, the summit
- b/BA-normal-sideways.jpg, b/BA-normal-upright.jpg, b/BA-easy-sideways.jpg, b/BA-easy-upright.jpg; b/BA-underside-closeups.jpg (2x).
- Polish check: the pillar is gone from every frame; the start floor's lip and soil whole, its shade even; the summit reads as a
  floating earth clump with a rounded mossy underside and roots, not a cut. Named, not mine: Pokey drawn faint in the placed frames is
  his hurt-blink (the shot sets invincibleTimer); Easy frames carry Dot's hint card (same in main).

# FIX-SOIL (BUILD-26y, session 9 of BUILD-26q; t-fix-soil cut from main cdffdc627). Started 7:06 PM ET 11-24 (by `date`); this box written 7:13 PM ET

## EXACT NEXT STEP
**Step 1 DONE (the pillar is on main). NEXT: step 2, lay (a) in protoArt.ts drawGround (the evenodd cut over a lower standable bank,
from its lip top down; no stage id), then (b) the planted check (paintFall.ts + paintFall.test.ts), RED on main then GREEN.**

## Step 1: the pillar on main's 1-4 (cdffdc627)
- EVERY build shows it: all 100 listed 1-4 seeds, Normal and Easy, 200/200 (scan-1-4-main.txt; the scan: scan14.mts.txt). The
  summit bank (y 360, h 120, id 55/56/57 by roll) stands over the start floor (#1 and/or #2, y 10326-11546): a gap of about 10,000.
- What reaches the screen (main-1-4-L1-normal-sideways.jpg, layout 1 = seed 2, Normal, 915x412, top left the start, then Pokey placed
  at 2/3, 1/3 and the top of the climb): the summit bank's soil is ONE dark column the whole height of the climb, through the sky
  behind every step, and at the start it covers the floor's lip and soil (the lip is cut where the column crosses it).
- Note for the lead's judging: the ruled cut (a) starts at the lower floor's lip top, so the floor's lip, top and soil show, and the
  column above the floor STAYS (it will stand on the floor's lip, up through the climb). Shown in the after stills.
