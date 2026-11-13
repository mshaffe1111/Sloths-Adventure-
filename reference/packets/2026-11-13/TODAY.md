# Shared rules for every member, 11-13 (the lead, session_01FhBbYNzGRJBDMzn6XbtQK2, written 10:14 AM ET). Read this after your packet.
Matt's goal today (10:13 AM ET): **1-4 and 1-5 on his test link tonight, polished.** Lean: tokens buy levels (TEAM.md "Cost rules").
- **First, before any tool call:** reference/roles/README.md, your card in reference/roles/, reference/LAWS.md, reference/LESSONS.md,
  reference/methods/level.md (level and engine members), reference/STAGE-RULES.md. Then push a PLAN.md (10 lines) naming your exact
  WRITE files BEFORE coding, and send the lead one line. The lead checks no two members' WRITE files overlap (PM.md:21).
- **Shared files nobody edits without asking the lead first:** src/game/gen2/pipeline.ts (FA owns it today), the seed lists, gates.yml,
  tools/perf/limits.json. World data for a level goes in that level's OWN new files where the code allows (ask if it doesn't).
- **The bar:** done means polished on a phone, upright AND sideways (LAWS 1-2; STAGE-RULES §5b); your report's "Polish check" names each
  still. Never loosen a rule, threshold or STAGE-RULES number; never re-record a seed list to pass; no stage id/seed/x literal in engine code.
- **Gates (LAWS 5):** a branch that touches game code runs the full CLAUDE.md "Checks" on its head before it reports done. A new stage
  joins drawcheck and every stage-walking gate in the same branch (D51). Teach lines are checked on Normal's DEFAULT Tips and Easy's Help on
  the real page (D50).
- **Base:** branch from origin/ccr-ea739a2f-dfcee4 (= main 0.9.7 + today's docs). Merge origin/main again before you shoot stills (D23).
- **Lean (Matt 11-12):** messages to the lead 5 lines max; REPORT.md 30 lines max (done-items with evidence, polish check, gates, what is
  left, pushback, "Learned"); one-line commit subjects; no narration. Safe-keeping push every 45 min; times from `TZ=America/New_York date`.
- **Report to the lead:** send_message to session_01FhBbYNzGRJBDMzn6XbtQK2. Blocked? PUSHBACK.md on your branch + one message, then wait.
- **Stop line:** 9:30 PM ET or 40% context, whichever first; push WIP and report.

## Shared-file tokens (the lead, 10:19 AM ET; PM.md:21: no two builders edit the same file at the same time)
One holder per file; the lead passes a token only after the holder has pushed. To take a token: merge the last holder's pushed head first.
| File | Holder now | Next |
|---|---|---|
| src/game/gen2/pipeline.ts, gen2/types.ts, gen2/seedList.ts, levelCheck.ts, stageTime.ts, cameraFollow.ts, tower.ts, nodeCode.ts | NODES-TRAVEL (from FA, 12:23 PM) | (ask) |
| src/game/engine.ts, src/game/types.ts | B14 (pods + gate wiring, own blocks) | B15 (bough/limb wiring, if any) |
| gen2/worlds/w1.ts, stageTable.ts, stagePlan.ts, tools/perf/drawcheck.mjs | B15 (1-5 is laid first) | B14 (1-4's hook) |
| .github/workflows/gates.yml | S1 (one line, routeHumps.test.ts) | ADD-LEVEL |
| tools/perf/limits.json (scenarios only) | ADD-LEVEL (1-1) | B15 (1-5), then B14 (1-4) |
New files are yours alone. Need a token? One line to the lead; carry on with other work meanwhile.
- **Stills early (Matt, 10:23 AM: "just show me pictures"):** push a still of each new piece as soon as it draws (upright + sideways, in
  reference/qa-reports/<ID>/stills/), and send the lead the paths in one line. Matt judges the look from them.
- **Context (D55):** put your context % in EVERY message to the lead; at 40% finish the edit in flight, push, write REPORT.md with an
  EXACT NEXT STEP list, and stop. (The lead cannot see a running session's context.)
- **Every piece is a node building block (Matt 12:14 PM, R-165.198):** anything you build (a mechanic, a hazard, a creature, a route
  shape) must be usable by any node in any world as data (a content letter or dial in NODES.md §8's code), proven on 2+ worlds' kits
  where it can be. A piece only one stage can lay is not done.
- **Burn (Matt 12:43 PM):** never re-run a gate already green on the same code; a change that can't affect the game runs the fast gates
  only (LAWS 5); don't read long tool output into your context (tail it); stop at 40% context.
- **Time boxes (Matt 12:48 PM ET):** every member works in a box the lead names (60-90 min). At the box's end: push, REPORT.md with an
  EXACT NEXT STEP list (the handoff), one line to the lead with context %, then STOP. The lead then decides: a fresh session continues,
  the work waits, or it's done. Also stop early at 40% context.
