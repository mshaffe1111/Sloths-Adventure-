# TASK C1 (R-165.72: re-lay 1-1 to the flown reach, so every piece is fair and every rise can be helped)   to: Content
# model: claude-opus-5-5   effort: high   due: <dispatch + about 10 h; push safe-keeping commits at least hourly>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-engine-e0a t-engine-help t-designer-reach t-r165-61-verdicts t-bots-tiers t-c2-art-cut`.
Read with `git show origin/ccr-ca657d3c-n09zty:<path>`: reference/roles/README.md, reference/roles/CONTENT.md, reference/LAWS.md,
reference/LESSONS.md (D37-D39), reference/STAGE-RULES.md (all of it), reference/ONE-ONE-FIX-PLAN.md (all rulings, incl. 11-11 5:46 AM).
Read `git show origin/t-designer-reach:reference/specs/bands.md` (§5 is your list) and reach.md; `git show
origin/t-r165-61-verdicts:reference/architecture/PACKETS.md` (section C1: your files) and its ADR-001.
## Objective
Re-lay World 1's stage 1-1 (src/game/gen2/worlds/w1.ts) to the numbers flown in the real engine, so no piece asks for a jump the
player can't make or a double the lesson didn't teach, and every rise is one a plain jump clears or a help stair fits.
## Why it matters
Testers lost lives and quit in raised pieces on today's 1-1 (36 Normal lives, all pits in raised pieces). A2's help could not fit stairs
at about 1,500 rises per setting on today's layouts, so it took four tries and was stopped (Matt, 11-11: stop patching what the re-lay
replaces). The re-lay is the fix; the help system rides on it.
## Frozen inputs (do not change)
- Branch from t-engine-e0a (the verdicts; E0 and C1 ship in ONE PR, E0 commits first: PACKETS.md). Take its newest head the lead names
  (cf0b7752 today, its audit is open; rebase onto a later head if the lead says). The verdicts judge your layout; a verdict you think is
  wrong is a PUSHBACK with a drawn case, never a work-around.
- reference/specs/ is READ-ONLY. A band you can't meet is a PUSHBACK, not a new number.
- Help (from A2, t-engine-help@98186930, whose layout-free parts are kept): a stair has faces 60 px or less, treads 80 px (the top one
  160 for a run-up), rests on the ground or the rock below, its top within 60 px below the lip.
- Made things: none in 1-1 (ONE-ONE-FIX-PLAN, 11-11 ruling); today's 5 planks (w1-cut.webp) become natural pieces of the same footprint
  (a flat-topped fallen log or a natural flat-top stump; no saw rings).
## Files
- WRITE: src/game/gen2/worlds/w1.ts, src/game/gen2/worlds/w1.test.ts, NEW src/game/gen2/firstRun11.ts (ADR-002: the one fixed first-run
  layout and its lock), src/game/gen2/provenSeeds.ts, the lockall record, tools/engine/seedlist.ts's output files, REPORT.md, your
  turnover note. Nothing else (a needed change elsewhere is a PUSHBACK naming file and line).
## Definition of done (the Critic checks each)
1. Every row of bands.md §5 entered (DOUBLE_TEACH by the D rise block on both settings; DOUBLE_TEST [252, 262] Normal only; Easy D/E
   blocks 128-132; bounce lips 232-246 with the mushroom's edge 20-60 px from the face; U/V 236-250; w1.ts:519's post checked; the three
   chains inside the single band or with a catch road; a practice gap before each double gap). A table in REPORT.md: row, today, now,
   w1.ts line.
2. PER SETTING: Easy has no double gap (its band is 'none'), so where Normal lays its 252-262 test gap, Easy lays its own variant;
   seedlist --check passes on BOTH settings for every listed seed (E0a's Critic: an Easy build carries Normal's verdict too).
3. Every rise in 1-1, both settings, is either within a plain single jump's climb (reach.md) or has room for A2's stair: run A2's stair
   sweep (t-engine-help@98186930's helpLadderSweep / stepBoxes) on your layouts: zero rises with no stair room, zero faces over 60.
4. A put-back never lands past the thing the piece needs (the tier-bots Critic found A1 putting Pokey back past the mushroom he needs at
   w1-mushroom-chain area x29758): for each piece with a mushroom or a step he must use, the put-back spot is before it. A test.
5. Today's 5 planks replaced by natural pieces (name each, its footprint, the art piece from t-c2-art-cut's catalog).
6. Verdicts: seedlist 1-1 --check PASS; the refusal list by name is empty for the listed seeds; provenSeeds.ts re-proven; lockall --check
   against main's lock (record it on main first): only 1-1 moves. firstRun11.ts picks the first-run layout: the seed whose tier-bot runs
   give the gentlest first two minutes (name the measure), locked.
7. Played: the tier bots (t-bots-tiers, the head the lead names once they pass) on your 1-1, 40 variants per tier and setting: Normal
   lives 0; no rescues for middle and expert; put-backs per run no higher than on today's 1-1 per tier (from calibration-a1.jsonl);
   middle-tier median finish at least 120 s (stages take at least 2 minutes). Print the per-piece table.
8. Polish check (STAGE-RULES §5b): stills upright AND sideways of every piece type and of the first two minutes of the first-run layout,
   looked at the way Matt will on a phone; anything rough fixed or named.
9. tsc, the full suite in 3 shards (green: the 126 "1-1 cannot build" failures on E0a must be gone), knowncheck, roadmapcheck,
   buildcheck (alone), drawcheck. Main chunk size stated (R-165.103 is landing separately; do not split code yourself).
## Return
Branch t-content-c1 from the named t-engine-e0a head, pushed (git ls-remote). REPORT.md (the 7 sections plus "Method used" and "Lessons
applied"), 60 lines or fewer. Then ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 8 lines or fewer. Then stop. A
blocker or a wrong frozen input: PUSHBACK.md on the branch and one message, then stop.
## Attempt
1
