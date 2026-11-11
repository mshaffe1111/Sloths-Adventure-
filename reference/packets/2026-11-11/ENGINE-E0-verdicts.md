# TASK E0 (R-165.61's build: the verdicts, the reach data, the first-run picker)   to: Engine   model: claude-opus-5-5   effort: high (R-165.91)   due: <dispatch + about 3 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-engine-putback t-designer-reach t-r165-61-verdicts`. Read with
`git show origin/ccr-ca657d3c-n09zty:<path>`: reference/roles/README.md, reference/roles/ENGINE.md and its pack, reference/LAWS.md,
reference/LESSONS.md (D37). Read with `git show origin/t-r165-61-verdicts:<path>`: reference/architecture/ADR-001-verdicts.md,
ADR-002 (the first run), PACKETS.md (section E0 is your file list; its order table) and src/game/gen2/verdicts.types.ts. Read with
`git show origin/t-designer-reach:<path>`: reference/specs/reach.md and bands.md (the numbers). Push back, suggest, go beyond inside
your WRITE files.
## Objective
Implement the Architect's passed verdict schema: every gen2 roll is accepted or refused by named, testable verdicts built on the
Designer's flown reach (not the old closed-form constants), and a player's first-ever 1-1 run is one fixed layout (ADR-002). The
1-1 re-lay (C1) is then judged by these verdicts.
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
- Only 1-1 may move: `tools/engine/lockall.ts --check` against main's lock, recorded from main BEFORE your first change.
- The FirstRunLayout data itself is Content's (C1); you build the picker and the lock with a placeholder that is today's proven
  first 1-1 seed, named as such.
## Files
- WRITE: exactly PACKETS.md's E0 list (NEW reach.ts, verdicts.ts, verdicts.test.ts; pipeline.ts; types.ts; promises11.ts;
  seedList.ts; levelCheck.ts; physics.ts comments; testlink1_1.ts; stageGenerator.ts's gen2Roll11 branch; saveFile.ts
  `oneOneFinished`; provenSeeds.ts; the lockall record; tools/engine/seedlist.ts; tools/engine/rulers.ts) and
  reference/handoffs/engine-core.md. Fix A2 runs at the same time on t-engine-help and touches engine.ts, padControl.ts,
  stuckHelper.ts, DotGuide.tsx and mixer/stages.ts: you must not touch those.
## Definition of done (the Critic checks each)
1. verdicts.test.ts: a planted roll that fails by EACH VerdictName and one that passes; each red shown.
2. Every reach and band figure the pipeline and levelCheck use comes from reach.ts, each with its source line; a test proves the
   old reachJump figures are gone from the verdict path.
3. The first-run picker: a fresh save plays the fixed layout; a retry before the first finish replays it; after the first finish every
   run rolls; an old save that has finished 1-1 rolls (read from its progress). Tests for each.
4. lockall --check: only 1-1 moved (show the list). seedlist 1-1 --check: report how many proven seeds the new verdicts refuse, by
   name; re-prove provenSeeds.ts under them and say what changed.
5. tsc clean; the full suite in 3 shards green on the final commit.
6. The turnover note rewritten.
## Return
Branch t-engine-e0 from origin/t-engine-putback (41c2e248), pushed (git ls-remote). REPORT.md with "Method used" and "Lessons applied"
first, then the 7 sections of roles/README.md, 60 lines or fewer. Then ONE send_message to the lead, 10 lines or fewer. Then stop.
## Attempt
1
