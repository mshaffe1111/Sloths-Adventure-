# TASK CAP (R-165.111 step 1, pulled forward: what the engine can do, and where we are building 1-1-only)   to: Architect
# model: claude-opus-5-5   effort: high   due: dispatch + 3 h
## Why
Matt, 11-11: "I'm afraid we're going to build everything right now to fit what we're doing with level 1-1. And we're not going to build
the flexibility into doing multiple different things... the hope was, after we were done with level 1, that we'd be able to start mass
creating levels... puzzles... the Frogger idea... is our engine able to do things like that?" Read-only research: no code changes, so
it runs beside the C1 re-lay. Built on: main and today's branches; replaced this sprint by: nothing (D40).
## First
`git fetch origin main ccr-ca657d3c-n09zty t-engine-e0a t-engine-help t-art-catalog-a t-engine-inventory t-bots-tiers`. Read
reference/roles/ARCHITECT.md, LAWS.md, LESSONS.md (D37-D40), STAGE-RULES.md, reference/ideas/MATT-IDEAS-2026-11-11.md, ROADMAP rows
R-165.78-R-165.82, R-165.96, R-165.110, R-165.111, and t-r165-61-verdicts' ADR-001/002 (and the lead's ruling narrowing ADR-001 to 1-1).
## Deliver (reference/architecture/CAPABILITY.md on branch t-architect-capability from origin/main; 120 lines or fewer)
1. CAN DO TODAY, per capability, with file:line proof (D37: read or run it, never assume): scroll directions (left-to-right, right-to-
   left, descending top-to-bottom, climbing bottom-to-top), auto-scroll, water/swim, moving hazards in lanes (Frogger-style: things
   crossing the path on timers), moving platforms, timed or switch puzzles, push/break/stomp objects, escorts and followers, tethers
   (R-165.110), collect-X goals, boss arenas, secret rooms. For each: YES (where it lives, which stages use it) / PARTLY (what exists,
   what is missing, hours) / NO (what it would take, hours, risk).
2. FLEXIBILITY GAPS in what we are building NOW: for E0a's verdicts, the flown reach data, the help ladder, the inventory, the tier bots,
   the gen2 pipeline and worlds/w1.ts: is it generic or 1-1/World-1-only, and what change (file, hours) makes it work for any stage
   type and world. Name anything C1 is doing that would have to be redone for other stage types.
3. A recommendation: the smallest set of engine changes that lets the team mass-produce varied stages after 1-1 (a "stage kit": mission
   types x directions x mechanics), in order, with hours, and which can run in parallel with C1 without touching its files.
## Return
Push, ls-remote, ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 8 lines: the headline answers (Frogger? descents?
puzzles?) and the top 3 gaps. Then stop. Never put tester text anywhere; never launch an HF job.
