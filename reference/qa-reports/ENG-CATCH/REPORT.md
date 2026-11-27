# ENG-CATCH (R-165.526; engine, Opus 5.5 high): the down tower's own catch boughs. Branch t-eng-catch, cut from t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 1 hand-over, written 9:43 AM ET Fri 11-27 by `date`)
Candidate = 4b9adaa81 (src/game/gen2/tower.ts + tower.test.ts; the commit after it changes only this report). Done on it: tsc 0; CI
tool line 50/50; generalitycheck PASS (26 literals, 26 known); probe 12/12 on every brick (below); toys red 3/3 on base, green 3/3.
1. Box 1 left four runs going in its own container (they die with it): a base lock of frozen 13135bf6b
   (`npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base-13135bf6b.json` in a worktree of 13135bf6b), and suite shards 1-3 of 6
   on 4b9adaa81. If they are gone: re-run them, each command alone with run_in_background (NEVER a shell '&').
2. Lock: in a frozen worktree of 4b9adaa81, `npx tsx tools/engine/lockall.ts --layouts 16 --check <that base json>`: ONE run, 102 stages,
   3264 builds. ANY moved stage = STOP before landing; send the lead each moved stage and why (a seed-list rebuild is the lead's call).
   Expected: none move (reLay touches only a lay that still has a blind drop off a piece it laid; passes() only reads differently a
   vine that hangs on a face end; a listed stage has no blind drop and no catch past its storey). tierBots only if a World 1-2 stage moves.
3. Suite: `npx tsx --test --test-shard=i/6 <CLAUDE.md's file list>` for i = 1..6, 3 at a time on 4 cores; frozen tree, only
   src/game/gen2/proven/ writable. Note each shard's tests/pass/fail.
4. Land: `git fetch origin t-eng-w3`; in a worktree of origin/t-eng-w3, `git merge --no-ff origin/t-eng-catch` (no force, never rebase;
   ENG-ASKS-b may have landed: merge as is); if t-eng-w3 moved, re-run tsc + the shards on the merge. Push HEAD:t-eng-w3, prove with
   `git ls-remote`. Engine files only (tower.ts, tower.test.ts, this report). Send the lead: the hash, each shard's totals, the lock
   verdict with counts, the four brick counts.

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
