# Turnover note: the lead (PM). Rewritten, never appended. Last rewrite: 2026-11-11 10:45 PM ET by session_01FhBbYP63h7cCX8DyW69stq

Read this, then reference/STATE.md (newest at the bottom: every decision tonight is dated there), reference/plans/ENGINE-PLAN.md
(the plan, with "THE PLAN AS TOLD TO MATT"), reference/plans/MAP-REVISIONS.md (the map's changes and Matt's 84 ideas judged),
reference/TEAM.md "Cost rules", LESSONS.md D45. The lead never touches code (Matt 11-11); it plans, dispatches, checks, decides.

## Matt's direction (11-11 evening, his words)
- "You determine what should be done... The only person on the team that stays is the storyteller... I'm looking for a leader that can lead."
- "For small decisions, you make it. For big game-wide decisions, I can step in." Push back on him; keep him focused; "no tunnel vision."
- Tokens matter: cut reviews that don't pay; an auditor sweeps periodically, not every task. Short fresh sessions.
- Engine first so levels go fast; global changes before one-level fixes ("70% of the game better, then go back").
- Fix what we know BEFORE the audit; the audit then PROVES the engine ("prove it to me that it works").
- Fable 5.2: "use it for as much of the engine as possible and get ahead"; he decides each extension (asked 10:45: not answered).
- Quality bar: "competitive against AAA studios, on the same bar as indie: creativity, style, and fun."
- Build order agreed 9:44 PM: World 1 COMPLETE first (9 levels + Venom Fang checked against the new rules + its hidden stage), then main
  levels world by world (each shipped whole; old bosses and specials stay until replaced), then bosses and special stages as their own pass.
- Creatures (9:41 PM): unique casts per world; "Fable has complete control of these enemies"; guardians much, much larger than Pokey.

## Where things stand
- **LIVE: 0.9.6** (the new 1-1), merged 7:04 PM (PR #69, merge 585ef376); APK https://github.com/mshaffe1111/Sloths-Adventure-/releases/tag/v0.9.6-38;
  Matt's test link EnK5 v246 = 585ef376. Defect D45: deployed main JS 254 B over chunkcheck's budget (chunkcheck builds without BASE_PATH).
- **Engine work done tonight, all on branches, NOT merged, nothing changes play (stage lock 102/102 on every branch):**
  | Branch @head | Base | What | Who |
  |---|---|---|---|
  | t-engine-seedchunks@889302163 | t-int-1-1 | R-165.112 seed lists out of the main chunk (makes room). Its Critic saw roadmapcheck failing on the head: fix at merge | Fable (old team) |
  | t-engine-guards@b3e8db15 | release-0.9.6 | R-165.116 frame loop, R-165.117 saves, the generality gate (38 literals known, shrink-only) | Opus |
  | t-engine-fixes@f85a8729 | t-engine-guards | EN-F DONE: the audits' known findings fixed (full suite 2,765/0), R-165.125 sound (sliders, limiter, lower defaults: Matt to judge by ear); parked items in its REPORT.md | Opus, retired |
  | t-engine-yield@729f249d | release-0.9.6 | generator clean 9%->57%; listable 33%; travel as a mode (stage kit types merged); any listed stage by data; hurt floor (not drawn); builtOnArcs; GraphBrief.pits | Fable |
  | t-engine-clock@fd94c3f6 | t-engine-yield | the one clock (every timer moved bit-identical), beatBrick, clockaudit; stillness + watchers; noise + sleepers + drum; rides | Fable |
  | t-engine-library@cac3a859 | t-engine-yield | pickups by brief; sections picked by need; one brick in two worlds; 1-2 needs 11 new sections (was 42), 61/56% clean but for the unpainted thorn bed | Fable |
  | t-engine-predators@9bd5cee6 | t-engine-clock | reference/design/PREDATORS.md (story keeper PASS) + src/game/predators/ kit (8 habits, 13 animals, move ladder in TAUGHT/inWorld) | Fable |
  Parked: t-engine-11-followup@f24af141 (1-1's polish pass, after the engine); t-assets-compress@ffee5acc (waits for Matt's pick).

## Tomorrow, in this order (START ONLY ON MATT'S WORD; ALL HELPERS ON OPUS 5.5, no Fable: Matt 12:06 AM ET)
0. **Matt-reported sweep FIRST** (D47; Opus high, short): every issue Matt reported (STATE.md, handoffs, ROADMAP, qa-reports, the testers'
   sheet data the bots came from) that is still open; tag each on ROADMAP.md as reported by Matt; fixes already on a branch join the merge;
   the rest go to the top of the queue. Never ship an open Matt-reported issue without asking him directly first.
1. **Integration** (Opus xhigh, one builder): merge into one branch off main: t-engine-split@0e45a527 FIRST (EN-S: the code split, seedchunks inside, D45 fixed;
   main script 655 KB), then guards -> fixes, yield, clock, library, predators, wire (t-engine-wire: library + thorn bed + 1-2's double + clock on the fixed step; 1-2 98% clean on flown rows); PLUS from the parked t-engine-11-followup only the R-165.122 part of commit 2a988785
   (it is mixed with 1-1 items and a list rebuild: take only the hop-rock walls and their verdict, not the list rebuild) (hop rocks walked through: a generator rule, not 1-1 polish: every counted obstacle must block, or it is scenery and
   funcheck does not count it; Matt 11:22 PM); resolve conflicts; fix gates.yml so chunkcheck builds with BASE_PATH (D45); run the FULL gate once (CLAUDE.md Checks).
2. **The proof audit** (one cold Critic, Opus xhigh): the merged engine, every gate, the bots: "prove it works" or name where it doesn't.
3. **Then build on top** (FIRST, Matt's open issues: the dead-zone petal log as a gen2 verdict with the test from his case (R-165.124); the purpose rule as a verdict (R-165.126); the pit-wall art with no seams or boxes; the lead judges stills before Matt sees them. THEN: fly 1-2 and add its JUDGED row = data; fix the narrow-hollow look in the ground painter; then) (Fable if Matt says, else Opus xhigh; short fresh sessions): paint the thorn bed (World 1 manifest art only);
   count 1-2's double on the built stage (E12 item 5); the real 120-roll 1-2 run (`tools/engine/library.ts --seeds 120`, no --flown);
   wire the clock, stillness, noise, rides and World 1's snake/eagle/boa; lay 1-2 and 1-3 (goal: on Matt's test link by Fri 11-13, else
   switch to twisting the existing levels); the WebGL measuring stick (R-150.4/R-150.1, then R-3.1 PixiJS as its own chunk).
4. **Cleanup** (Opus): the code split (each world its own chunk); delete the old generator per world on gen2; bots record which assets ever load.

## Open asks to Matt (one question at a time, your pick first)
- Fable: ANSWERED 12:06 AM: Opus only tomorrow; Matt says when to start.
- Compression DECIDED 11:00 PM: art at q82 for files above about q83, EXCEPT dark/black images (kept as shipped); music unchanged.
  About 14-16 MB off (app ~188 -> ~172). Run it 11-12 as a small Opus job from t-assets-compress's tools; show Matt before/after stills.
- Guardians "huge" needs a Hugging Face picture list (8 of 10 are drawn larger than their sheets already); boss pass, his approval per picture.

## The team
- Story keeper (permanent): session_019iachLiuwNTAZUBSJWUmR3. Owns story, Dot, player text; reviewed the map, the swaps, the creatures.
  Its approved lines for coming packets: reference/packets/2026-11-12/STORY-LINES.md.
- RUNNING since 11:03 PM: EN-W (Fable, session_01FhBbYLceMpXDYKrR93Htkd, t-engine-wire on t-engine-predators, stop 12:05 AM): merge
  library in, paint the thorn bed, count 1-2's double, the real 120-roll 1-2 number, then the clock on the fixed step. AS-2 (Opus,
  session_01FhBbYMEeJcQCZAxBMhq2GW, t-assets-art82, stop 12:15 AM): Matt's art setting applied + every image measured against its
  original, dark images exempt, a check page for Matt. Retire both when they report (verify ls-remote first).
  EN-S (Fable, session_01FhBbYNeneV7CJUH3PDMtKm, t-engine-split on main, stop 12:15 AM): seedchunks merged first, D45 fix in gates.yml,
  a bundle breakdown, each world / old generator / special runs / bosses / story as their own chunks behind one loading seam; offline proven.
- RUNNING (11-12 7:31 AM): INT-E (Opus xhigh, session_01FhBbYKdwDhw2Lnrf4pNT11, t-int-engine, stop 10:45 AM) and SWEEP-M (Opus high,
  session_01FhBbYP8NqBFrKgsVLn3iG3, t-sweep-matt, stop 9:30 AM). Effort rule (Matt 7:30 AM): xhigh only when needed, max if needed.
- Everyone else retired tonight, branches verified. Next helpers start fresh from their role card + this note + a packet.

## How the team runs now (learned tonight; keep)
- Short fresh sessions: EN-C built 4 engine pieces for $12.48 in 46 min; EN-Y spent $55.80 in one long session. Retire at ~40% context.
- Fable: one stream per hard problem, design first inside the session, a hard stop, milestones; it can run its own subagents.
- Messages to a busy session wait until its turn ends: the brief is final; use priority "now" only to stop work in flight.
- Review by risk (TEAM.md Cost rules). Fix known findings first; one proof audit after merging.
- A creature's counters follow the move ladder (World 1 eagle = stillness and cover; throwing taught in World 3; the bell in World 2).
- The lead measures main with git show / git archive into a temp folder, never a checkout (the 8:46 PM miss).
- Every helper's "no rule loosened" claim is checked by the lead in the diff of reach.ts / verdicts.ts (done at 8:20 PM).

## Links
Live https://mshaffe1111.github.io/Sloths-Adventure-/ · testers ?fresh=1#ctest · test link https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb
World map (113 stages, engine needs, move ladder, creatures, Matt's ideas, build order): https://claude.ai/artifact/KRT1HT17cy8c7wd1pN87za
(source reference/plans/WORLD-MAP.html). Release method: reference/methods/release.md.

## Spend 11-11 evening (session records)
EN-Y $55.80 · EN-P $35.94 · EN-C $12.48 · release clerk $12.41 · AS-1 $10.79 · stopped starts about $7 · the lead about $25 ·
EN-L, EN-G, EN-F not reported by their records.
