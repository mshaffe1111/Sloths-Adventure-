# PUSHBACK: R-165.86 (Engine, attempt 1), 2026-11-09 9:11 PM ET, base origin/main 181d2846

Stopped before any code change, as the dispatch says: a frozen input is wrong. No game file is touched on this branch.

## The wrong frozen input
The packet: "`softOn` (engine.ts:833), which leaves gen2 out today" and "Done-item 1 does fail on origin/main ... on Easy (softOn is
false on gen2)".

On origin/main, 1-1 on Easy already has softOn TRUE:
- engine.ts:833 is `isEasy() && !isGen2Stage(config) && ...`. isGen2Stage reads GEN2_STAGES (gen2/game.ts:86-96), which holds 5-7,
  5-9 and Worlds 6-8 only. 1-1 is not in it: 1-1 is built by its own road (stageGenerator.ts:2870 `gen2Roll11`, :2892 buildPlayStage).
  So `!isGen2Stage('1-1')` is true and Easy's whole-stage soft fall is on.
- Measured in the real engine (RealPlay, seed 3747 through withPlaySeed, the real loseLife path watched through the recorder), walking
  Pokey off the right edge of each of the 148 solid pieces:
  - Easy: softOn true; 23 soft set-backs, 125 landings, 0 lives lost.
  - Normal: softOn false; 15 soft set-backs (the level block zones), 124 landings, 9 falls that reach loseLife('pit'):
    w1-log-chain-rise 3 (and the seam into it 1), w1-canopy-rungs-level 2 (and its seam 1), w1-seed-perch 1, w1-bounce-wall 1.
This agrees with the window: every life lost was on Normal.

## What it changes
- The objective and the build are the same: a per-stage brief field that reaches the built stage, and softOn read from it.
- Done-item 1's "fails on origin/main" holds for Normal in the engine. On Easy only the lay test (it reads the new brief field) is
  red on main; the realPlay sweep on Easy is already green on main. I can't show a failing Easy flight, because there isn't one.
- After the change Easy's softOn in 1-1 comes from the brief, not from 1-1 being missing from GEN2_STAGES by accident. Same play.

## A second trap (not a frozen input; the Critic should know)
RealPlay replaces the engine's loseLife with a stub (realPlay.ts:141, it only sets `died`). A sweep that asserts "lives never change
and lostLife is never written" passes on origin/main too. My sweep will delete that stub so the real loseLife runs, and plant the red
run on main with it.

## Also
- No branch t-engine-putback was on origin when I started (`git ls-remote origin t-engine-putback`: empty).

## What I need
One line: "proceed, Easy is already soft in the engine; done-item 1's red run is the lay test on both settings plus the realPlay sweep
on Normal", or a new packet.
