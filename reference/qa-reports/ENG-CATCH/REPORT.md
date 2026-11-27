# ENG-CATCH (R-165.526; engine, Opus 5.5 high): the down tower's own catch boughs. Branch t-eng-catch, cut from t-eng-w3 13135bf6b

## STATUS (written 10:39 AM ET Fri 11-27 by `date`): every gate GREEN on frozen 8a204af87; landed on t-eng-w3 by fast-forward to this commit
(src identical to 8a204af87; this commit changes only this report). The lead's ruling: the pushback is accepted; this box finishes and lands.
- tsc 0. CI tool line 50/50. generalitycheck PASS (26 literals, 26 known).
- lockall --layouts 16 --check vs a fresh lock of frozen 13135bf6b, ONE run: 3264 builds, 102/102 stages UNCHANGED, exit 0
  (f79963053 moves none: ENG-ASKS-b). No World 1-2 stage moved: no tierBots.
- Suite, 6 shards (tests/pass/fail/todo): 1: 671/670/0/1; 2: 780/780/0/0; 3: 731/731/0/0; 4: 605/604/0/1; 5: 694/693/0/1;
  6: 669/669/0/0. The 3 todos are pre-existing, in files this lane did not touch: w1Arc19 (R-165.312 flag placer), w4Runtime and the
  4-3 engine run (the boulder wall check).
- Bricks (KIT-W3a 610ef2e63 + this tower.ts, 3-1 draft, seeds 1-6 x both): root-down 12/12, two-roots 12/12, cap-down 12/12,
  the three together 12/12, cap-steps (parked) 12/12.

## The box 1 hand-over's next step (done, above; kept for the record; written 9:48 AM ET Fri 11-27 by `date`)
t-eng-w3 moved to f79963053 (ENG-ASKS-b: w3.ts W3_HAZARDS + w3HazardAsks.test.ts, no engine file; its lock 102/102 unchanged vs
13135bf6b). Merged into this branch: candidate = 8a204af87 (merge of 4b9adaa81 and f79963053; the commit after it changes only this
report, src identical). Done: on 4b9adaa81 the CI tool line 50/50, generalitycheck PASS (26 literals, 26 known), probe 12/12 on every
brick (below), toys red 3/3 on base, green 3/3; on 8a204af87 tsc 0.
1. Box 1 left four runs going in its own container (they die with it): a base lock of frozen 13135bf6b
   (`npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base-13135bf6b.json` in a worktree of 13135bf6b), and suite shards 1-3 of 6
   on 8a204af87 (worktree /home/user/wt-gate). If they are gone: re-run them, each command alone with run_in_background (NEVER a '&').
2. Lock: in the frozen worktree of 8a204af87, `npx tsx tools/engine/lockall.ts --layouts 16 --check <that base json>`: ONE run, 102
   stages, 3264 builds (f79963053 moves none vs 13135bf6b: ENG-ASKS-b's lock). ANY moved stage = STOP before landing; send the lead each
   moved stage and why (a seed-list rebuild is the lead's call). Expected: none move (reLay touches only a lay that still has a blind
   drop off a piece it laid; passes() reads differently only a vine that hangs on a face end; a listed stage has neither).
   tierBots only if a World 1-2 stage moves.
3. Suite on 8a204af87: `npx tsx --test --test-shard=i/6 <CLAUDE.md's file list>` for i = 1..6, 3 at a time on 4 cores; frozen tree, only
   src/game/gen2/proven/ writable. Note each shard's tests/pass/fail. Then the CI tool line + generalitycheck again on the merge.
4. Land: `git fetch origin t-eng-w3`; if it is still f79963053, push origin/t-eng-catch's head to t-eng-w3 (a fast-forward; no force,
   never rebase); if it moved again, merge it into t-eng-catch and re-run tsc + the shards on that merge. Prove with `git ls-remote`.
   Send the lead: the hash, each shard's totals, the lock verdict with counts, the four brick counts.

## The fix (tower.ts towerCatches; general: no stage id, seed or x)
- passes(): reads the vine where clearClimbs will hang it (climbX) as well as where it is laid, and a walled end is no way off.
  Seed 3: the vine laid at x 798 on the log's face (moved to 819 later) missed the catch 799-979 beside it, so a bridge 979-1207 and
  its run-on into the wall were laid level with it: one run, its left end walled by the log, wall to wall: past the storey.
- reLay() (going down, after the lay): a piece the lay laid whose OWN end is still a blind drop is laid again shorter or moved (and,
  joined to no wood, at another height under the end it serves), SLIDE.back either side of that end's fall line kept; the first fair
  lay whose own ends land in view (lands), widest first, never wider than it was or catchW, kept only if it leaves fewer open ends.
- Pushback, with evidence: not "not laid" as the last step. c1 laid a piece only where both its ends landed, else not at all: the
  three bricks went 11/12 -> 0/12 with 327 blind drops, because the lay CHAINS (each pass catches the last bough's end). The unlanded
  lay is kept as before, so the next pass still owes its end a catch; only a drop no pass caught is re-laid. c2 (landing lays first,
  at lay time): 6/12, cap-steps 2/12 (an early change ripples into every later lay).

## Toys (src/game/gen2/tower.test.ts, the three "ENG-CATCH" tests): red 3/3 on 13135bf6b's tower.ts, green 3/3 on the fix
1. a bough whose own end overhangs the mat under it (keep-out under the overhang): re-laid 574-754, ends over the mat.
2. a bridge whose far end steps off 8 px past its shelf: 700-814 -> 700-804, steps off onto the shelf.
3. a vine on a log's face, its catch beside it, a bridge + wall run-on level with the catch: refused; the catch hands on to its storey.

## Probes (3-1 draft, t-kit-w3a 610ef2e63 + this tower.ts, seeds 1-6 x both; patch.mts)
| candidate | root-down | two-roots | cap-down | the three together | cap-steps (parked) |
|---|---|---|---|---|---|
| base 13135bf6b | | | 11/12 (KIT-W3a) | 11/12 (easy 1: 392 px off a 180 px catch) | 8/12 (n3 e3 past storey; n5 e5 323 px) |
| c1 | | | | 0/12 (327 drops) | |
| c2 | | | | 6/12 | 2/12 |
| c3 | | | | 12/12 | 12/12 |
| 4b9adaa81 (c4) | 12/12 | 12/12 | 12/12 | 12/12 | 12/12 |

## Lessons applied
D115 (every run read a frozen tree: probe, base, gates and report each in its own worktree), D119 (no heredoc in a commit command;
box 1's first commit wrote this report by heredoc in the same call as the commit: named here), D128 (stamps from `date`), D134 (next
step pushed, proven by ls-remote), D138, D140 (ReadNotifications at each step), D146 (shard totals go with the hash).
