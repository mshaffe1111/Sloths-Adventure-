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
- DISPATCH ORDER (Matt's standing rule, 11-11: no patching what is being replaced; fix and polish only when ready to finalize): this
  packet goes out once E0a has PASSED (the verdicts it lays to). The tier bots are needed only for done-item 7, at the end; the lead
  names their passed head before you run it. Base: the passed t-engine-e0a head the lead names (E0 and C1 ship in ONE
  PR, E0 commits first). A verdict you think is wrong is a PUSHBACK with a drawn case, never a work-around.
- reference/specs/ is READ-ONLY at t-designer-reach@e97542b4 (§5 corrected 11-11: D bank Easy 128-132 / Normal 136-140; THIN limbs E,
  the rungs 616-617, 725, 752, 827, 853, 1113-1294 at Easy 122-128 / Normal 128-134, flown in sims/out/*-tshare.txt). A band you
  can't meet is a PUSHBACK, not a new number.
- Help is NOT built here. Dot's help (A2's ladder) goes onto the finished 1-1 in its own packet. C1 only lays room for it, to A2's stair
  geometry, frozen for C1: faces 60 px or less, treads 80 px, the top tread 160 px (TOP_W), the top within 60 px below the lip, resting
  on the ground.
- Art is NOT placed here (C2 places art after Matt's yes on a mock-up, PACKETS.md:66-72). C1 keeps today's 5 plank footprints and names
  them for C2 (Matt's P-06-a "mossy fallen log, flat top" is the likely fit).
- The 1-1 baseline: calibration-a1.jsonl on the passed t-bots-tiers head (today's 1-1 on A1, 3 tiers, both settings, variants 1-40).
## Files
- WRITE: src/game/gen2/worlds/w1.ts, src/game/gen2/worlds/w1.test.ts, NEW src/game/gen2/firstRun11.ts (ADR-002: the one fixed first-run
  layout and its lock), src/game/gen2/provenSeeds.ts, the lockall record, tools/engine/seedlist.ts's output files, REPORT.md, your
  turnover note. Nothing else (a needed change elsewhere is a PUSHBACK naming file and line).
## Definition of done (the Critic checks each)
1. Every row of bands.md §5 entered at the named spec head (DOUBLE_TEACH by the D rise block on both settings; DOUBLE_TEST [252, 262]
   Normal only; thin rises on bands.md:20's rows; bounce lips 232-246 with the mushroom's edge 20-60 px from the face; U/V 236-250;
   w1.ts:519's post checked; the three chains inside the single band or with a catch road; the Easy log chain). A table in REPORT.md:
   row, today, now, w1.ts line. Fewer or shorter bounce pieces than today: count both.
2. PER SETTING: Easy has no double gap, so where Normal lays its 252-262 test gap, Easy lays its own variant. seedlist --check passes on
   BOTH settings for every listed seed.
3. Teach first (STAGE-RULES): a w1.test.ts check that a practice gap comes before every 252-262 test gap and that Easy's variant is
   taught; the bounce card fires at the first mushroom (story keeper #8).
4. Room for help: a w1.test.ts check over every listed seed and both settings: every rise is within a plain single jump's climb
   (reach.md), or has flat solid ground in front of its face long enough for the frozen stair (n = ceil((rise - 60) / 60) rocks: 80 px for
   each lower tread plus the 160 px top), with no pit in it. A rise given by a mushroom whose edge is 20-60 px from the face (bands.md
   §5) is exempt: count these and name them. Name the tallest NON-mushroom rise and the room it has.
5. Put-backs before the need: the engine records the put-back spot at his own x on any platform at least 60 px wide (clamped 30 px
   from its ends; engine.ts:2467-2471, bouncy excluded). Layout rule: no spot past the mushroom's near edge (or the rise's foot) on a
   platform at least 60 px wide where softAt can be set; proved in w1.test.ts by RealPlay falls into each following gap, put-back x
   printed.
6. Verdicts: seedlist 1-1 --check PASS; the refusal list by name empty for the listed seeds (the joins closed: no deck holes);
   provenSeeds.ts re-proven; lockall --check against main's lock (record it on main first): only 1-1 moves. firstRun11.ts picks the
   first-run layout: the seed whose tier-bot runs give the gentlest first two minutes (name the measure), locked.
7. Played with the passed tier bots, 40 variants per tier per setting, against the baseline: no rescues for middle and expert;
   put-backs per run per tier no higher than the baseline's; lives counted with the REAL loseLife (RealPlay stubs it, realPlay.ts:141:
   say how, with one pasted run) and the harm kinds named: 0 on Normal; length: the EXPERT tier's minimum over all 40 variants, each
   setting, at least 120 s with STAGE-RULES.md:68's climb discount. Print the per-piece table.
8. Polish (STAGE-RULES §5b): stills upright AND sideways of every piece type, and a clip of the first two minutes on Easy and on Normal,
   both orientations, looked at the way Matt will on a phone; anything rough fixed or named (art itself is C2's).
9. The 5 plank footprints named (piece, x, size) for C2.
10. tsc, the full suite in 3 shards (the 1-1-cannot-build failures on E0a gone), knowncheck, roadmapcheck, buildcheck (alone),
   drawcheck. Main chunk size stated (R-165.103 lands separately; do not split code yourself).
## Return
Branch t-content-c1 from the named t-engine-e0a head, pushed (git ls-remote). REPORT.md (the 7 sections plus "Method used" and "Lessons
applied"), 60 lines or fewer. Then ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 8 lines or fewer. Then stop. A
blocker or a wrong frozen input: PUSHBACK.md on the branch and one message, then stop.
## Attempt
1 (rewritten 11-11 6:55 AM ET on its packet Critic's nine findings and Matt's standing rule; its two last lines applied 6:58 AM ET, PASS by its word)
