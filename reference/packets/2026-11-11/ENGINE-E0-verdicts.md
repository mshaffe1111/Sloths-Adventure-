# TASK E0a (R-165.61's build, part 1: the verdicts and the reach data; the first-run picker is E0b, after this passes)   to: Engine   model: claude-opus-5-5   effort: high (R-165.91)   due: <dispatch + about 3 h>
(Split 11-11 on the packet Critic's size finding: E0a = verdicts and reach, about 3 h; E0b = the picker, about 1.5 h, from E0a.)
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-engine-putback t-designer-reach t-r165-61-verdicts`. Read with
`git show origin/ccr-ca657d3c-n09zty:<path>`: reference/roles/README.md, reference/roles/ENGINE.md and its pack, reference/LAWS.md,
reference/LESSONS.md (D37). Read with `git show origin/t-r165-61-verdicts:<path>`: reference/architecture/ADR-001-verdicts.md,
ADR-002 (the first run), PACKETS.md (section E0 is your file list; its order table) and src/game/gen2/verdicts.types.ts. Read with
`git show origin/t-designer-reach:<path>`: reference/specs/reach.md and bands.md (the numbers). Push back, suggest, go beyond inside
your WRITE files.
## Objective
Implement the Architect's passed verdict schema for 1-1: every 1-1 roll is accepted or refused by named, testable verdicts built on
the Designer's flown reach (not the old closed-form constants). The 1-1 re-lay (C1) is then judged by these verdicts.
## Why it matters
On 11-07 the old check reported no fall in 1-1 cost a life while the testers lost all 21 lives there; the builder's reach ruler is
33-69 px short on the single jump and 57-98 px on the double (reach.md). A roll must be judged by what a player can really do.
## Frozen inputs (do not change)
- The types in verdicts.types.ts and the decisions in ADR-001 and ADR-002 (the lead's ruling there: a retry before the first finish of
  1-1 replays the fixed layout; every run after the first finish rolls). Use real verdict names in `notJudged`, never a wildcard
  (the Architect's Critic's note on ADR-001's `arc.*` example).
- The numbers in reach.md and bands.md (t-designer-reach@030a4093), each row's `source` naming its line.
- Fix A1 (t-engine-putback@41c2e248): 1-1's softFalls brief; in 1-1 a lethal drop fails `drop.lethal-in-no-lethal` by name.
- physics.ts: comments only, no value changes (other stages read them).
- THE BOUNDARY: the verdicts and reach.ts gate 1-1 ONLY (seedlist and buildPlayStage for 1-1). pipeline.ts also builds 5-7, 5-9 and
  Worlds 6-8 (gen2/game.ts:86-92) and levelCheck's validateStage runs on every generated stage (stageGenerator.ts:40): those keep the
  closed-form figures exactly as today and report the new verdicts as `notJudged`. ADR-001 §3's "easy-any" scope is limited to 1-1 here.
- Only 1-1 may move, proved this way: in a worktree of origin/main, `npx tsx tools/engine/lockall.ts --layouts 16 --out
  tools/engine/lockall-main-<ver>.json` BEFORE your first change (the 0.9.4 lock is stale for 1-1, and A1 already moves 1-1), then on
  your branch `npx tsx tools/engine/lockall.ts --check tools/engine/lockall-main-<ver>.json --intended 1-1`. About 5 min each.
  Other stages' built `gen2` object (5-7, 5-9, W6-W8) gains `verdicts` and `drops`, which lockall hashes (lockall.ts:27): so
  tools/engine/lockall.ts is in WRITE, to hash `gen2` without `verdicts` and `drops`; a stage's `gen2` may differ only in those two
  fields, and the lock report names it (the packet Critic's option (a)).
- verdicts.types.ts is not on t-engine-putback: first `git checkout origin/t-r165-61-verdicts -- src/game/gen2/verdicts.types.ts`
  (c4687177), byte-identical.
- The first-run picker (testlink1_1.ts, gen2Roll11's branch, saveFile.ts, firstRun11.ts) is NOT in this packet (E0b).
## Files
- WRITE (PACKETS.md's E0 list, minus the picker, plus tools/engine/lockall.ts as above): NEW reach.ts, verdicts.ts, verdicts.test.ts; src/game/gen2/verdicts.types.ts (the
  checkout above); pipeline.ts; types.ts; promises11.ts; seedList.ts; levelCheck.ts; physics.ts comments; provenSeeds.ts; the new
  lockall record; tools/engine/seedlist.ts; tools/engine/rulers.ts; reference/handoffs/engine-core.md (added to E0's list by the lead,
  11-11). C1 builds on E0a's branch (the one integration branch PACKETS.md:14 names). Fix A2 runs at the same time on t-engine-help and touches engine.ts, padControl.ts,
  stuckHelper.ts, DotGuide.tsx and mixer/stages.ts: you must not touch those.
## Definition of done (the Critic checks each)
1. verdicts.test.ts: a planted 1-1 roll that fails by EACH VerdictName that can fail in a flown scope, and one that passes; each red
   shown. `reach.unflown` cannot fail inside a flown scope (ADR-001 §3): show it in the notJudged list of an unflown-scope roll instead.
2. On 1-1's path, every reach and band figure the pipeline and levelCheck use comes from reach.ts, each with its source line; a test proves the
   old reachJump figures are gone from the verdict path.
3. Outside 1-1 nothing moved: lockall --check --intended 1-1 passes (show the list), and a test proves a 5-7 and a World 7 roll
   build as before and carry the verdicts as notJudged.
4. seedlist 1-1 --check: report how many proven seeds the new verdicts refuse, by
   name; re-prove provenSeeds.ts under them and say what changed.
5. tsc clean; the full suite in 3 shards green on the final commit.
6. The turnover note rewritten.
## Return
Branch t-engine-e0a from origin/t-engine-putback (41c2e248), pushed (git ls-remote). REPORT.md with "Method used" and "Lessons applied"
first, then the 7 sections of roles/README.md, 60 lines or fewer. Then ONE send_message to the lead, 10 lines or fewer. Then stop.
## Attempt
1
