# ENG-CATCH (R-165.526; engine, Opus 5.5 high): the down tower's own catch boughs. Branch t-eng-catch, cut from t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 1, written 9:38 AM ET Fri 11-27 by `date`)
1. Candidate c4 = this head's src/game/gen2/tower.ts (c3 + widest-first re-lay). Probe it ONCE in a frozen tree of t-kit-w3a 610ef2e63
   with this tower.ts copied in: `GEN2_DRAFT=3-1 KEEP=<ids> VERBOSE=1 npx tsx probe.mts` (patch.mts with its paths moved to that tree),
   KEEP = w3-root-down,w3-two-roots,w3-cap-down, then w3-cap-steps. c3 (tightest-first): the three bricks 12/12; cap-steps: see Probes.
2. Then the gates ONCE on the frozen candidate (D115, src/game/gen2/proven/ writable): tsc; CI tool line; lockall --check (ONE run, 102
   stages: ANY moved stage = STOP, send the lead each and why); suite in 6 shards; generalitycheck; tierBots if a World 1-2 stage moved.
3. Land: merge onto origin/t-eng-w3 (no force, never rebase); engine files only. Send the lead the hash, each shard's totals, the four
   brick counts.

## The fix (tower.ts towerCatches; general, no stage id/seed/x)
- passes(): reads the vine where clearClimbs will hang it (climbX) as well as where it is laid, and a walled end is no way off.
  Seed 3: the vine laid at x 798 on the log's face (moved to 819 later) missed the catch 799-979 beside it, so a bridge 979-1207 and
  its run-on into the wall were laid level with it: one run, its left end walled by the log, wall to wall: past the storey.
- reLay() (going down, after the lay): a piece the lay laid whose OWN end is still a blind drop is laid again shorter/moved (and, if
  joined to no wood, at another height under the end it serves), still SLIDE.back either side of that end's fall line; first fair lay
  whose own ends land in view, widest first, kept only if it leaves fewer open ends. A clean lay is never touched.
- Tried and dropped (evidence): c1 "laid only where both ends land, else not laid": 3 bricks 0/12, 327 blind drops (the lay CHAINS:
  each pass catches the last bough's end). c2 "landing lays first, at lay time": 6/12 (an early change ripples into later lays).

## Toys (src/game/gen2/tower.test.ts, "ENG-CATCH"): 3 tests, red 3/3 on 13135bf6b's tower.ts, green 3/3 on the fix.

## Probes (3-1 draft, t-kit-w3a 610ef2e63, seeds 1-6 x both)
- base: root-down+two-roots+cap-down 11/12 (easy 1, blind drop off a 180 px catch); cap-steps 8/12 (n3 e3 passes storey; n5 e5 323 px).
- c1 0/12 (327 drops); c2 6/12 and cap-steps 2/12; c3 12/12, cap-steps pending.
