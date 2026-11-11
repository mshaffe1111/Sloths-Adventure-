# R-165.59 REPORT: tier bots (Critic as builder), branch t-bots-tiers, 11-11
## 1. Done-items
1. BOTS.md mapping table: every FirstTimer field per tier and setting → value → profile file:field (or "kept from FT_KID/FT_ADULT", or a
   named tuning field); the profile fields the bots ignore, each with why.
2. Calibration, origin/main 1-1, variants 1-40, 40 runs per tier and setting (calibration-main.jsonl; BOTS.md table). middle Normal
   PASS all 6 checks; child Normal PASS (thin; pieces vacuous, 12 rescues printed); child Easy printed (outlier). **expert Normal: all
   five measures pass, MISS on 1 rescue** (v30 w1-backstep-twist). **middle Easy: all five pass, MISS on 2 rescues** (v16
   w1-twin-mushroom-fork, v30 w1-backstep-twist). Piece attribution from stage.gen2.sections x0..x1 (tierBots.ts piecesOf/pieceAt).
3. A1 (worktree at 41c2e248, my two files copied in): Normal lives 0 for every tier (0 in 120 Normal runs); put-backs a run expert
   0.33, middle 1.83, child 4.03 (Easy 1.25); rescues 1 / 3 / 12 (Easy 2). calibration-a1.jsonl.
4. `npx tsx --test tools/inspect/tierBots.test.ts`: 7/7, 18 s (mapping vs profiles, table re-judged, 3 variants a tier replayed
   exactly). Red-proved: expert aimQ p50 61→62 fails "expert normal: every mapped number" and the replay; restored, green.
   botBaseline kid/adult 1-1..1-5 seeds 1-3: `diff <(jq -c 'del(.ms)')` empty (30 runs). firsttimer.test.ts 8/8. `tsc -p .` clean;
   the tools files type-check clean under a node-typed config (its only 2 errors are in src/gen2/nodeCode.ts, lib es2022, untouched).
5. Stills: middle-v3-stuck-sideways.jpg, -upright.jpg: variant 3 Normal, x 24316, w1-log-stair-test, stuck 9.4 s ("a 70 px step
   ahead, an open drop ahead, the way on is 120 px up").
## 2. Polish check
Both stills judged: Pokey on the log, the 70 px stump ahead, the drop past it, the long log 120 px up, all in frame upright and
sideways; HUD clear. No rough spot found. Note: the middle bot stands 8 s+ at a 55-77 px step over a drop in 30 of 40 runs (most at
w1-leap-stones 7, w1-bank-run 6); the profiles keep no stand times per spot, so whether testers did is not known (finish still fits).
## 3. Pushback
- The packet's "fixed by tuning a field" did not reach the last 3 rescues: two at w1-backstep-twist (one variant; testers played it 1
  time, expert) and one at w1-twin-mushroom-fork on Easy. Both are route puzzles the inspector's route traces through a ledge; I named
  them, I did not loosen the rescue rule. A route fix for those two pieces is a suggestion below.
- FirstTimer bug found (not fixed for KID/ADULT: frozen): thumbify's late lift-off re-arms every frame, so once the steer is held it is
  never let go (firsttimer.ts thumbify, `lastSteer` is not moved on during the lift-off). KID/ADULT never stand at an edge or take a
  steering pause. Fixed for the tier bots only (`releaseArmed`); with the fix their lives and put-backs fell 4-6x (calibration c4 → c5).
## 4. Suggestions
- Packet (engine-core or Critic): fix the KID/ADULT lift-off re-arm; re-baseline botBaseline (outputs will move, by design).
- Packet (Critic): route for w1-backstep-twist and w1-twin-mushroom-fork (route.ts traces through a 24 px ledge); done = 0 rescues on
  variants 16, 30, both settings.
- A1 before C1: middle Normal loops on put-backs at w1-mushroom-chain (9), mushroom-chain-back (8), log-chain-rise (10) (BOTS.md).
## 5. Unresolved
3 rescues (above). Child is thin: 12 rescues where no tester needed one; its numbers are a hint. The bots use the pooled `all` numbers,
not first runs.
## 6. Method update
gates.md/CRITIC.md: "On every 1-1 change, run `tierBots.ts --tiers child,middle,expert --seeds 1-40 --setting both --calibrate` on the
candidate and on main; a moved middle/expert row is a finding; `tierBots.test.ts` pins the bots."
## 7. Turnover note
reference/handoffs/critic.md not rewritten: outside this packet's WRITE list. Lines for it: the tier bots, their CLI and test, the
lift-off bug, the 3 named rescues.
## Method used
Built the fields, ran 40 variants a tier, read every miss in frame traces (FT_TRACE, FT_FRAMES), fixed the bot behaviour or tuned a
named field, re-ran; about 12 full calibrations. Never changed a tolerance. Profiles copied unchanged; no tester name, code or survey text.
## Lessons applied
D37: every engine claim proved with real runs (A1 lives 0 by 120 Normal runs, not by reading the diff). D38: jumpHoldMs is press to
release, taken-back punches are no punches (not used). D39: the read-jump rules flown over 40 variants, both settings, before the claim.
