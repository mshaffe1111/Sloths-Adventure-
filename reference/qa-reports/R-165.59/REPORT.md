# R-165.59 REPORT: tier bots (Critic as builder), branch t-bots-tiers, 11-11, attempt 2
## 1. Done-items
1. BOTS.md mapping table: every FirstTimer field per tier and setting → value → profile file:field (or "kept from FT_KID/FT_ADULT", or a
   named tuning field); the profile fields the bots ignore, each with why; the tier-bot rules (no field) listed.
2. Calibration, origin/main 1-1, variants 1-40, 40 runs per tier and setting (calibration-main.jsonl; BOTS.md table): **expert Normal,
   middle Easy, middle Normal, child Normal all PASS every check; rescues 0 in every middle and expert row.** Child Easy printed (outlier).
   The attempt-1 misses: v30 w1-backstep-twist (expert, middle Easy) and v16 w1-twin-mushroom-fork (middle Easy) now play through.
   Per-piece seconds, middle Normal, bot vs testers (25 pieces with 5+ runs a side): BOTS.md.
3. A1 baseline (worktree at 41c2e248, final bots, all tiers on both settings, variants 1-40; calibration-a1.jsonl, BOTS.md tables:
   finish p50/min, put-backs, rescues, per piece): lives 0 in all 200 runs; put-backs a run expert 0.6, middle 1.53 (Easy 1.48), child
   3.8 (Easy 3.1); rescues 0 for middle and expert, child 8 (Easy 1). No expert Easy bot: the expert testers played no Easy runs.
   loseLife: the bot's wrapper calls the engine's real one (not RealPlay's stub); proved by one pasted run, main vs A1, in BOTS.md.
   v4 and v7 (attempt-1 loops) explained there.
4. `npx tsx --test tools/inspect/tierBots.test.ts`: 7/7, 24 s. Red-proved again: expert aimQ p50 61→62 fails "expert normal: every
   mapped number" and the replay; restored, 7/7. botBaseline kid/adult 1-1..1-5 seeds 1-3: `diff <(jq -c 'del(.ms)')` empty (30 runs).
   firsttimer.test.ts 8/8; the src tests that import firsttimer.ts (firstTimerBot, w6Stages, teachSpoken) 31/31. `tsc -p .` clean.
5. Stills: middle-v16-stuck-sideways.jpg, -upright.jpg (v16 Normal, x 20873, w1-twin-mushroom-fork, 9.6 s, one of the 2 remaining
   middle Normal stops of 8 s+). The attempt-1 v3 stills are kept as the "before" of the stump fix.
6. The pin enforced: tierBots.test.ts added to CLAUDE.md's checks and to gates.yml (job `rolled`); BOTS.md says any 1-1 change re-runs
   the calibration and recommits calibration-main.jsonl with it.
## 2. Polish check
v16 stills judged upright and sideways: Pokey on the mossy block in a 144 px dip, the ledge and its mushroom over him, the floor mushroom
ahead, HUD clear; nothing cut off. The middle bot's 8 s+ stops fell from 50 (30 of 40 runs) to 2 (2 runs).
## 3. Pushback
- The middle v3 9.4 s stand was not the pit rule. The bot's "late press" plan (walk off, then press) met a 70 px stump at the log's end.
  It could not walk off, and the plan re-armed every second. Fixed: a late press needs a lip; an unused late plan is drawn again.
- FirstTimer bug (not fixed for KID/ADULT: frozen): thumbify's late lift-off re-arms every frame, so KID and ADULT let go 8-17 frames
  late, past releaseMax (audit Critic: KID p50 4 max 17, cap 4; ADULT p50 8 max 16, cap 2). Fixed for the tier bots (`releaseArmed`).
## 4. Suggestions
- Packet (engine-core or Critic): fix the KID/ADULT lift-off re-arm; re-baseline botBaseline (outputs move by design).
- For the lead, A1 before C1: a put-back returns a player to the last still ground, which can be under the way on, 223 px below the
  next ledge in v7 (BOTS.md A1 section). A child who misses the same way can loop there.
- Packet (Critic): a first-run bot (the profiles' `firstRun`), to judge the re-lay as a first visit.
## 5. Unresolved
Child is thin (5 runs): 8 rescues where no tester needed one; its numbers are a hint. Per-piece seconds: the bot is slower in 23 of 25
pieces though its finish fits (gapShare fits the whole stage, not each piece). The bots use the pooled `all` numbers, not first runs.
## 6. Method update
gates.md/CRITIC.md: "On every 1-1 change, run `tierBots.ts --tiers child,middle,expert --seeds 1-40 --setting both --calibrate` on the
candidate and on main; recommit calibration-main.jsonl; a moved middle/expert row is a finding."
## 7. Turnover note
reference/handoffs/critic.md not rewritten (outside the WRITE list). Lines for it: the tier bots, CLI, test and CI pin, the lift-off
bug, the A1 put-back loop note.
## Method used
Each miss read in frame traces (FT_TRACE, FT_FRAMES, a per-frame decision dump), the bot rule fixed or a named field tuned, re-run over
all 40 variants (6 full calibrations this attempt, and the A1 run). Never changed a tolerance. Profiles copied unchanged; no tester name, code or survey text.
## Lessons applied
D37: every engine claim proved by runs (A1 lives 0 in 120 Normal runs). D38: jumpHoldMs is press to release; taken-back punches are no
punches. D39: every new rule flown over all 40 variants, both settings, before the claim; three rules that fixed one spot and broke
others (an 80 px overhead window, a mushroom-dodge kept by height, one on low blocks) were caught that way and narrowed.
