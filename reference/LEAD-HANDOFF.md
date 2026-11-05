> 4:07 PM ET: Matt moved the lead to session_01FhBbYN2DDsktc7BGtNxPFK (chunk-pool engine design). The old lead (session_019iachLiuwNTAZUBSJWUmR3) is now a consultant.

# Lead handoff: everything a new lead needs to take over (written 2026-11-05 about 4:10 PM ET)

Matt asked for this so the work can move to a new lead at any time. Keep it current: the lead updates it at every checkpoint.
Everything listed here is pushed to GitHub (mshaffe1111/Sloths-Adventure-). Nothing lives only in a session.

## 1. Read first (in order)
1. `reference/LAWS.md`, `reference/LESSONS.md` (D35-D45 are today's).
2. `reference/notes/lead.md`: the priority list, the plan, the board, who's who, the lead's pitfalls.
3. `reference/engine/MATT-DIRECTION.md`: every direction Matt gave on the engine today, in his words. This is the bar.
4. `reference/STATUS.md` (the last 40 lines): everything that happened today, timestamped.
5. `reference/ROADMAP.md`: every open item has an R-id, an owner and a state; `node tools/roadmapcheck.mjs` must PASS.
6. `reference/PARTNER.md`, `reference/LEADER-STANDARD-WORK.md`, `reference/CONTINUOUS-IMPROVEMENT.md` (rows 35-45).

## 2. Matt's goal (the test for every plan)
THE ENGINE DOES THE WORK. A person gives a short brief (7 fields) and judges; the engine generates each stage's structure per roll
inside a per-world rulebook built from the research. A hand-written plan per stage is not an engine (D45). Prove it on 1-1 first;
nothing is built ahead of proof (D44). Variety first; old 1-1 is "an okay one", a floor, never the target. Fix the engine, never the
stage. Nothing reaches main until Matt plays it.

## 3. Where the engine stands (4:10 PM ET)
- **engine-core** (branch, cut from main 68b31e66): the engine on the live game. Every stage except 1-1/1-5 is identical to main
  (lockall 3200/3264, 16 layouts x 2 settings). Has: the mixer (`src/game/mixer/`), the support check (`support.ts`, rocks never float),
  trunkFit, `moveLadder.ts` (moves and taught-at from main), `passLines.ts` (lines from measured reference rows, not words),
  `tools/engine/stage.ts <id>` (one command: build, every gate 16x2, the §E lines via engine-runs' Python, report in
  `reference/engine/stage-reports/`), the restored old 1-1/1-5 test promises (failing on real defects, nothing weakened), the
  golden seed, Matt's three 1-1 Dot lines.
- **The measured problem:** the hand-plan 1-1 scores era diversity 0.083 (target 0.35; old 1-1 0.384), splits 5 (floor 34), two-road
  0.33 (floor 0.61), quiet stretches 5.5 s (limit 4). Root cause (planner, 3:42 PM): no continuous floor under the ground pieces, plus a
  fixed node plan. Trial of the floor alone: 0.173.
- **In progress:** the planner builds `generatePlan(brief, seed)` (R-165.48): the engine makes the node plan per roll from the
  designer's WORLD-RULEBOOK.md grammar, with World 1's continuous moss floor road and per-roll tempo as section kinds, reusing gen2's
  planBudget/missionGraph/variety and the mixer's buildMix. First 16-roll trial due 5:30 PM (6:00 hard). Pass = diversity >= 0.35,
  splits/two-road at or above the floors, length 120-150 s, level check 32/32, nothing costs a life, 1-1 not alike to 1-5.
- **Then:** a fresh cold helper writes 1-1's brief from `reference/engine/story-briefs/1-1.md` alone (the designer's brief and the
  planner's SPEC_11 are kept off its branch for fairness), runs stage.ts, judges each breach (data fix, engine finding, known miss,
  held art). Planner + designer supervise, never build. Pass line: ENGINE-SPEC b726b737 (1.7 h, ~1.1% of the week, <= 2 data-only
  rounds, 0 engine changes). Then the lead checks the stills object by object, both ways, then Matt plays on the test link
  (`python3 tools/testlink/build.py`, Artifact tool).
- **Parked until 1-1 passes and Matt plays it:** 1-2 (draft page on engine-spec), every 1-5 item, Worlds 2-10 (step 6, R-165.7),
  all polish and art (R-165.19-35), R-165.44-47.

## 4. Who is running (cloud sessions; all report to the lead session)
| Role | Session | Branch | Now |
|---|---|---|---|
| Planner (builds the engine core) | session_01FhBbYJaUqNUPxNUvbHdHeN | commits to engine-core (engine-mixer is retired) | generatePlan trial, 5:30 |
| engine-core (gates, tools, ports) | session_01FhBbYNa68MoMsiQdv2EJXg | engine-core | stage.ts stills + brief input, how-to part 1 |
| Level designer (design authority) | session_01FhBbYPKnBYCweHg8duJSu2 | engine-spec | WORLD-RULEBOOK with a research cite on every rule, by 5:00 |
| Critic (independent, idle) | session_01FhBbYM4fHuqB754FFuBefx | engine-critic-spec | trace-check.mjs lives here |
| engine-runs (measurements, idle) | session_01FhBbYNVv6Zweq51VCpwLyx | engine-runs | RUNS.md, tools/engine/runs/*.py |
Stopped at clean points (each has NEXT.md or STOPPED.md on its branch): engine-render, render-stone, gen2-water, engine-pieces,
art-1-1-sunrise, the designer's art helper. Researchers (water, moves, pacing) done; their files are under reference/research/.
Check with `list_sessions`; only the first three should be RUNNING.

## 5. Key files
- Design: `reference/engine/WORLD-RULEBOOK.md`, `ENGINE-SPEC.md`, `SPEC-TRACE.md`, `howto/` (engine-spec branch); story briefs in
  `reference/engine/story-briefs/`.
- Research: `reference/research/` (WATER-SWIM, MOVES, PACING, the Gemini paste), `reference/GEMINI-PCG-RESEARCH.md`, `GEMINI-LEDGER.md`,
  `reference/STAGE-RULES.md`; measurements in `reference/engine/runs/RUNS.md` (engine-runs branch).
- Gates: `.github/workflows/gates.yml` is THE list (D42); `reference/methods/gates.md` explains each.
- Checkpoint page for Matt: https://claude.ai/artifact/AhbRZQxRts2nLh7XFtbTdZ (source in the lead's scratchpad; rebuild from STATUS if lost).

## 6. Budget and money
- Matt's meter: 64% of the week at 2:23 PM ET (45% at 10:05 AM). About 2.3%/h with 3 helpers. Target: under 80% tonight.
- Hugging Face: about $3 spent today; $72 total cap with about $15 kept back; the lead approves engine spend and tells Matt.
- Pushing to main: only when Matt says "push"; he merges. The HF token never goes in code, commits or shared files.

## 7. Traps that cost us today (don't repeat)
- The lead branch `ccr-0d59a91c-oy3imz` carries the rejected 11-04 World 1 rebuild: never branch game code from it (D40).
- Building ahead of proof (D44); a hand plan called an "engine" (D45); one stage as the taste target (Matt 3:3x PM).
- Pauses unconfirmed (D41): run list_sessions after any pause. "Full gate" without the gates.yml list (D42).
- Typed times: take every time from `TZ=America/New_York date`.
- Story briefs: check "shipped" against origin/main and art against the world's own kit (D43).
