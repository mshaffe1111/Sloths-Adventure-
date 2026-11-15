# PERF-BUILD: 1-1's stage-start build back well under budget, at its root (R-165.207). Opus 5.5 xhigh (engine). Written 4:58 PM ET by the lead.
buildcheck (tools/perf/buildcheck.mjs: 1-1 built as Play builds it, Chromium at CPU x4, p95 <= 150 ms) is red: on tonight's build
(t-int-4, src = 2bb29f8d) 193 / 154 / 146 ms (2 of 3 fail, each run alone: GATES-4, gates-int4/ on t-int-4); on main d8d6a97 121 / 151 /
121 (1 of 3: VARIETY-2); on 11-06 it read 105 ms (reference/methods/gates.md:29). It blocks every release (LAWS 5). NEVER raise the budget
or lower N (LAWS 22): the build gets faster.
Branch t-perf-build from origin/t-int-5 (FIX-INT's head; pull it again before you push: FIX-INT may still be pushing test fixes).
## Done
1. Measure, don't guess (D15): profile the 1-1 Play build (buildPlayStage, gen2/seedList.ts) on main and on t-int-5; bisect main's
   history from the 11-06 commit if the cause isn't plain in the profile. Name the commits that added the cost, with ms each.
2. Fix the cost at its root for EVERY stage (D43): work done at stage start that can be cached, precomputed at build time, made
   lazy or removed; never skip work the stage needs, never change what is built (lock 102/102 unchanged, seedlist 1-1 PASS).
3. Prove: buildcheck alone 5 times on your head, every p95 well under 150 (say the margin); the full CLAUDE.md Checks on your head.
BOX: 90 minutes or 40% context: push, REPORT (20 lines + Learned), EXACT NEXT STEP, stop; never stop with a gate running (D59).
Context % in every message. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
