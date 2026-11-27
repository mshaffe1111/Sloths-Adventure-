# The new lead's cold review of the plan (session_01FhBbYMA2VnzJXGxeHFhKxi, 11-27; PM.md §8 step 6)

Written before talking to the backup lead. Every fact cites file:line or a command run today. No change here is acted on until a cold
Critic passes it (PM.md:241-246, D35). Changes to a rule or number Matt set are NOT made here; they go to Matt as one question.
REVISION 2 (after the cold Critic's PASS WITH FIXES, 11-27 about 3:00 PM ET): must-fixes 1-5 and the other fixes applied; change 4
reversed, change 3 moved to 3-1, change 6 withdrawn until measured.

## What the numbers say (read today, not from the hand-over)
- Lane NAMES in STATE.md (not sessions; some names are re-uses): 3-1 about 56 engine and kit names, ENG-DARK alone 28 (the base name to
  -bb), ENG-DOWNBOT 11, ENG-CATCH 6 (ENG-CATCH-f queued, not run), ENG-SPORE 3, KIT-W3a 6, ENG-DEAL 1, and no build; 2-8 13 build names
  and about 16 engine names; 2-9 11 build boxes run (BUILD-29-l queued). LEVEL-LOG.md's last row is 11-22 (LEVEL-LOG.md:181).
- The box today is 320k real context OR 28 minutes, whichever comes first (dispatch-packet.md D111, :67-68; PM.md:106-107, D137;
  LANES.md:27-29, "No exception"). A fresh member is at 270-350k real context within 25 minutes (LEADER-STANDARD-WORK.md:51, D90). Put
  together: a fresh box can reach its context line on start-up reading alone, before its first real step, and every hand-over pays it
  again. That is a hypothesis to measure, not a fact yet.
- The start reads members are sent to are large: LESSONS.md is 190 lines but 85 KB in one section (one heading, line 1; "read in full
  once at the start of every task", LESSONS.md:1); STAGE-RULES.md 78 KB; dispatch-packet.md 22 KB; level.md 17 KB (wc -c today).
  CONTINUOUS-IMPROVEMENT.md (90 KB) is the lead's read (CONTINUOUS-IMPROVEMENT.md:7), not the members'.

## What I would change (each is mine to decide unless marked MATT)
1. **Measure before anything else, including what fills a box.** The first member job (research tier, high, one or more 28-minute
   boxes, no src/ change): LEVEL-LOG rows for 2-6, 2-7, 2-8, 2-9 and 3-1 (rows for levels not landed marked in progress, LEVEL-LOG.md:2),
   each level's hours split into building the level / pieces found mid-build / merging and re-gating / tracing reds / waiting on the lead
   / gates re-run; and for three recent boxes, what their first 25 minutes read and cost in tokens. The retro asked for the first part
   (lead-retro:133-139); the start-up part tests D90 against today's box.
2. **World 3's two w3.ts writers run in order, never side by side.** PM.md:26: never two builders whose WRITE files overlap. W3-LANES.md
   :18-28 had 7a and 7b in parallel inside the cap; both KIT-W3a-f and KIT-W3b-c write w3.ts, so they run one after the other (KIT-W3a-f
   first, for 3-1). ENG-CATCH-f (tower.ts, pipeline.ts) shares no file with the kits; it waits only for capacity (change 7), not for
   files. LAWS 23 (LAWS.md:93-94) still holds: pieces are built ahead, side by side where files allow.
3. **The 2-hour trial is 3-1, not 3-2.** 3-1 has a real stage row (stageTable.ts:93-97 DRAFT_TABLE on t-eng-w3 holds 3-1 alone,
   PUSHBACK.md:7-8) and rolls CLEAN 8/8 on the w3 kit after ENG-DEAL (ENG-DEAL REPORT:19 on t-eng-w3). 3-2 has no row and its roll still
   refuses on the root brick, n11's combine, the double asks at n5 / n11, ocelots laid 0 of 1 at n10 and 1-2 of 3 at n13, quiet stretches
   and missing Dot tip lines (32-kit.txt; ENG-DEAL REPORT:22, :26-28). 3-1's open items: tower.test.ts:856 (R-165.561, ENG-CATCH-f), the
   drop toys (R-165.562, ENG-DROP, change 4), then KIT-W3a-f's merge, probe and landing; then its whole node string rolled (rule 23,
   level.md:29) and its words approved.
4. **(REVISED) The drop toys stay and pass.** They are on t-eng-w3 now and pass there (w3Noise.test.ts:308 the toy, :322 its plant, 7/7)
   and fail on KIT-W3a's tree (KIT-W3a REPORT:27-28), because a down tower now refuses a 400 px blind drop and no World 3 level row lays
   one: the run lay refuses a section that leaves the 320 px corridor (pipeline.ts:2420 on t-kit-w3a 38c1b2b20; :2454 on t-eng-w3).
   Ruling: PUSHBACK option 1 (the member's own recommendation): ENG-DROP, an engine job, lets the run lay lay a DESIGNED drop past its
   corridor (place.drop), proven by a toy on a real row, then the toys play on a 3-2 draft row with dropClear and its plant kept. It lands
   BEFORE KIT-W3a-f does. The toys are never deleted, skipped or known-listed (LAWS 5, 22; PM.md:245-246). Option 2 (red by name until
   3-5) is refused: a red test cannot land.
5. **World 2 finishes on one release line, each level landing when green.** Release 6 is cut from main 49fdc8cb6 (release 5 is in main,
   PR #80). 2-9 goes first (its pieces are landed on t-eng-29 337ba7d0b; it owns R-165.535 and R-165.544); 2-8 next, and its next box must
   ALSO merge t-eng-29 (2-8's line lacks ENG-CAM29's 3d635eb6e: puzzleCamera gallery1, R-165.513, BUILD-28 REPORT:58-59). A green 2-9 is
   not held behind 2-8: release when done, small and often (LEADER-STANDARD-WORK.md:52). BUILD-29-l is a finish box on an already-laid
   stage; PM.md:112's roll-file check is met by 2-9's listed seed list and its w2Arc29.test (BUILD-29 REPORT).
6. **(WITHDRAWN until measured) a separate cap on tails.** I have no evidence for a number; the measurement counts the lead rulings each
   tail cost on 11-27 first (lead-knowledge.md:9-11 says "about a dozen in two hours"). If it proposes a cap, the guard enforces it, and
   Matt is told in one line, since it tightens the option he picked (lead.md:14-15).
7. **Inside the weekly limit, lean (MATT: one question).** Reads: allowed_warning at 12:14 PM ET, allowed from about 1:07 PM (lead.md:16),
   allowed at 2:40 PM (get_session today); resets Wed 12-02 2:00 AM ET. My pick: at most 3 lanes until Wednesday (the measurement;
   2-9 then 2-8; World 3's chain one engine lane at a time: ENG-CATCH-f, then ENG-DROP, then KIT-W3a-f). Targets told to Matt that slip
   either way, named in the question: World 2 done Saturday is at risk; 3-1..3-4 by Sunday night will be missed; World 4's pitch Saturday
   is not staffed (lead.md:24-26). Lane 2's job, pieces built ahead into the next world (LANES.md rule 1), waits for Wednesday.
8. **The start reads shrink (MATT, since LESSONS.md:1 is a written rule), only after the measurement.** LESSONS.md has one heading, so
   it would first be split into sections by job kind (build, engine, kit, gates, lead), each packet naming its sections and the 3-5
   lessons that touched its kind of job before (the pre-mortem, lead-retro §1b.4).
9. **The pre-freeze check and the brief check get built this week (lead-retro §1b.3, :51-58), with their plants.** Pre-freeze (refuses
   a "frozen" claim otherwise): tsc + generality + the WHOLE test file of every changed source and every test that imports it + the
   base-moved check (the named base still at its hash, or merged and re-checked); the lock pair stays once, in the gates (running it
   before the freeze too would add about 20 minutes a candidate). The brief check extends leadguard's judgeCreate to refuse a brief with
   no hash on its BASE line, no lock base by hash, no report-by time, no "what to do on a red", no gates with their counts lines, or an
   invariant with no failure path. A tools job after the measurement, plus R-165.563 (the red board read from the lines).

## What looks like the last lead's bias
- **Throughput by starting more.** It ran about 11 sessions on 11-27 (lead-retro:66-68) and gave each engine gap a new lane (LESSONS.md:175,
  D147). Lanes were cheap to start and expensive to check.
- **Countermeasures as prose, and more prose each day.** LESSONS.md grew to 85 KB in one section, read in full by every member at every
  task (LESSONS.md:1); CONTINUOUS-IMPROVEMENT.md has 102 rows, 24 marked "new" (not yet shown to hold). The lead's own retro says only
  hooks held (lead-retro:69-72). I would add checks, not lines.
- **A fault's fix briefed from the case in hand**, proven on the probe's small seed range: about 3 engine boxes and 3 kit re-probes for one
  tower invariant (CI #101), then a fourth (ENG-CATCH-e, CI #107).
- **Trusting the build-ready claim from paper.** Rule 23 has existed since 11-17 / 11-20 (D75, D101) and was strengthened on 11-26
  (CI #95; PM.md:115); the enforcing slipped, not the rule.

## What I keep
Frozen candidates and tails; the lock as two runs by hash; invariant briefs with a failure path; EXACT NEXT STEP in every REPORT; the hooks
(lead-retro §3, :101-110).
