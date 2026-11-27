# ENG-CATCH (R-165.526; engine, Opus 5.5 high): the down tower's own catch boughs. Branch t-eng-catch, cut from t-eng-w3 13135bf6b

## ENG-CATCH-b (R-165.534): EXACT NEXT STEP (box 1 hand-over, written 10:23 AM ET Fri 11-27 by `date`). Branch t-eng-catch-b. NOT LANDED (the lead's rule: a red in the widened proof = do not land)
Frozen candidate 861e2a22e = ENG-CATCH's frozen 8a204af87 (not landed; t-eng-w3 still f79963053, an ancestor) + tower.ts/tower.test.ts.
- Cause fixed (Easy 2 / Easy 4, 481 / 477 px): towerCatches rule 2 starts a bridge a hop past a vine's top (tip + TOWER.hop + 30);
  where the end's fall line lies inside that hop (storey ends at 554 by the turn vine, cap shelf b's end 650, fall line 626) the bridge
  654-716 caught nothing, still counted as laid, and was laid again every pass (9 stacked copies). Fix: towerCatches = layCatches(false);
  going down, if that lay leaves a blind drop, layCatches(true) with every bridge reaching under its end's fall line (else rule 4's own
  bough), kept only if it leaves fewer blind drops. A lay with no blind drop is returned untouched.
- Toys (tower.test.ts, ENG-CATCH-b): 'misses the fall line' RED on 8a204af87 (ENG-CATCH tests 4/5), green 5/5 on 861e2a22e; the
  'reaches the fall line' toy pins the old bridge (x = 554 + hop + 30) unchanged. tsc 0. generalitycheck PASS (26 literals, 26 known).
- Proof (t-kit-w3a efed85aa2 + 861e2a22e's tower.ts, reference/qa-reports/KIT-W3a/probe/patch.mts with its paths pointed at that tree):
  seeds 1-6: four together 12/12; root-down, two-roots, cap-down, cap-steps each alone 12/12.
  seeds 1-12 x both, four together: 22/24, RED n8 e8. With 'descent' in W3_BOUNCE_JOBS: 22/24, the same n8 e8 only (the 319/321 drops gone).
- OPEN (next box): Normal 8 / Easy 8, "a blind drop off the piece at x 1039-1219, y 7936: 389 px". It is the tower's OWN rule-4 bough
  (180 wide) serving an end at x 1129, y 7649 (the bough 287 px under it); its LEFT end's fall line x 1015 drops 389 px. reLay finds no
  fair lay on either lay (trace: TDBG instrumentation, every pass's rule 4 'pick undefined' for that end). Note: diag.mts's
  platform list at Y 7700 does NOT show a piece at 1039-1219 y 7936: read whether the error's coordinates are column-local or pre-shift
  before reading x/y off the final stage.
Next step:
1. ReadNotifications. `git fetch origin t-eng-catch-b t-kit-w3a t-eng-w3`; worktree t-kit-w3a efed85aa2 (or newer) with 861e2a22e's
   tower.ts; `GEN2_DRAFT=3-1 SEEDS=12 KEEP=w3-root-down,w3-two-roots,w3-cap-down,w3-cap-steps VERBOSE=1 npx tsx <patch.mts>` -> 22/24.
2. Trace seed 8 (either setting) inside layCatches: why rule 4 has no fair bough for the end at x 1015 y 7936 and why reLay of the
   bough laid for (1129, 7649) finds none (which of cramped/slotted/byGate/passes/lidded refuses each, and lands()). Fix general, in
   the second (cover) lay only, so a clean roll stays untouched; toy red on 861e2a22e, green on the fix.
3. Proof: 24/24 both with and without 'descent'; each brick alone 12/12; w3.test :108 :129 :143 on the kit tree.
4. Gates on the new frozen candidate: tsc; CI tool line (gates.yml line 157); lock as two runs (`lockall --layouts 16 --out base.json` on
   8a204af87 (or ENG-CATCH's landing), `--check base.json` on the candidate, counts line); suite in 6 shards; generalitycheck.
   Box 1 started on 861e2a22e: base lock on 8a204af87 and the CI tool line (container-local, die with it).
5. Land on origin/t-eng-w3 (merge, no force, never rebase), ls-remote, send the lead the hash and each shard's totals.
Lessons applied: D115 (frozen worktrees), D119 (no heredoc in a commit chain), D128 (stamp from `date`), D134, D138, D140, D153 (lock as two runs).
Miss to log: a stray send_message 'placeholder' went to ENG-CATCH's old session (corrected at once); a backup cp wrote /tower.fix.ts at the container root ($TMPDIR unset), rm blocked by the safety check.

## EXACT NEXT STEP (box 1 hand-over, rewritten 9:48 AM ET Fri 11-27 by `date`)
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
