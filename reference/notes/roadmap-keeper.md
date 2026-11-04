# Notes: roadmap-keeper (keeps reference/ROADMAP.md and the doc's "Roadmap to go")

Updated 2026-11-04 12:47 PM ET. Read at start and after every memory compression (reference/notes/README.md). Role: reference/roles/ROADMAP-KEEPER.md.
Method: reference/methods/roadmap.md. Branch: roadmap-keeper (the lead merges it; a restarted container may come up on the lead's
branch and shallow: `git checkout -B roadmap-keeper origin/roadmap-keeper`, `git fetch --unshallow`, then merge the lead's branch).

## Status
- Reinstated 2026-11-02 by the lead at Matt's ask (D27: the slips came from the setup; GAMEPLAN §3 is now a ladder; self-caught slips
  don't count). New items come in batches when Matt says go (LEAD-PLAYBOOK 8d).
- **State now (2026-11-04 12:47 PM ET):** roadmapcheck PASS. Phases (sums by script, see below): WebGL 24 h; Phase A (World 1) 93.5 h (range
  about 70-130; 88.5 before R-155.1), marked "before the research ledger"; Phase B 306.5 h (guess, about 230-425); Phase C 114 h
  (guess, about 85-160); alongside 67.5 h. Day 1 605.5 helper hours (gate 613.5), recommended Important 60 h, launch 665.5 h; lanes
  133 / 132 / 133 / 133.5 / 133; building about 17-22 working days; about 4-4.5 weeks with the 80% trigger (about 485 of 605.5 h).
  Doc read back at rev 200 by whole-doc search.
  - Phase script: lanes from BUILD-PLAN §2 Day 1 rows; strip any "(...)" suffix from the item (R-150.2 rows say "(W8 share)");
    then move the written sub-parts B to A by hand: R-154 branch 2.5 + vine kinds 4.5 + R-155 World 1 5.5 (was 7; 1-2 and 1-5
    left for R-155.1) = 12.5. Proof it is the same script: it reproduced 6d0b35f9's A 88.5 / B 306.5 / C 114 / WebGL 24 /
    alongside 67.5 exactly. Kept at the scratchpad's phases_keep.py (temporary: rebuild from this note after a restart).
- **D29 (lead, 2026-11-04 12:42 PM ET):** the research was never broken down line by line; three ledger helpers are writing
  reference/research/ledger/. Phase A's 88.5 h is marked "before the research ledger"; no new Phase A estimate until the lead
  sends the ledger's misses (about 2:30 PM ET) for R-ids and hours. R-155's 1-5 build was ON HOLD; corrected by the lead: 1-2 and 1-5 are R-155.1 (w1-rhythm, running), the rest of R-155 stays on hold. R-148.18 closed as A-41 (3342b2cf, lead branch). Known misses: a BPM
  per world with placements on the beat, world-wide mutators, cause-and-effect stage links, a slot order per world, a check
  against earlier worlds (STAGE-RULES §0b.9 draft, §0c.7). R-148.18 (D29's LESSONS line, lead, 0.5 h recommended): launch 661 h,
  recommended Important 60.5 h (script).
  - R-6.40 (menus A, new game + 3 save slots): add to bot-fix's planned-vs-actual list when it starts (expected 5.5 h, range 4-8).
- **Bosses in segments (Matt, 11-04):** 2 / 3 / 4 segments for Worlds 1-3 / 4-7 / 8-10, each a phase (arena and attack change).
  R-161.1 8.5 h (2 segments); R-161.2 60 h (12 new phases at R-1.15's ~2.7 h a phase, a guess); R-1.9/R-1.10 noted, hours not
  changed (their designs' parts vs 4: when briefed). Venom Fang's second segment is the first measured phase: re-size R-161.2 from it.
- **Matt, 11-04 (via the lead's correction):** "These are notes that we need to learn from... let's stay with the course. Let's get the
  first world done as a prototype." Playthrough findings go on the rows as lessons; they don't move phases or owners unless the lead
  says so. R-150.6 stays Important (lesson recorded); R-6.39 is a Phase B note, unassigned.
- **Matt's full playthrough (11-04 about 11:15 AM ET):** every stage winnable; W4 about 64 min; W1-3 15-30; W7-8 under 30; early
  stages about 1-1.5 min. Recorded on R-152.6 and R-5.4. Fact checked: the 2-minute rule is stageTime.ts's model (floors 125 s typical,
  95 s quick), not the first-timer bot. Matt set the length targets (STAGE-RULES §0.5): 2-5 min a stage for a first-timer, never under 2 for a skilled player; W1 20-25 min, middle 35-40, W9-10 50-60. R-150.10 is open.
- **Unblocked 11-04 mid-morning:** R-150.4 and R-150.1 accepted (7909cf11, fun-validator, not merged yet). Phase B rows now read
  "blocked (by Matt's World 1 rating)"; R-159.1 open (GPU stage 0 merged to the lead branch 65b6c33a). Archive R-3.1, R-150.1, R-150.4,
  R-150.7 only when they reach main in a release (proof: the release PR).
- **Planned vs actual (Matt, 11-04; methods/roadmap.md "Planned vs actual"):** running jobs sent to bot-fix at 10:44 AM ET.
  When each ends (bot-fix or the lead sends the real start and accept), add "; real N h (start to accept)" to its Time and the job to
  BUILD-PLAN's calibration list; re-size items measured from the same past job if it is off by half or more.
  - R-159.1 w8-rope2, start about 8:00 AM, expected 9.5 h (7-14), end about 5:30 PM. R-6.38 w8-rope2 (3 h; pictures done 10:14).
  - R-3.2 warmup-5m, start about 9:35 AM, expected 2 h, end about 11:35 AM.
  - R-150.8 DONE: real 1.2 h start to accept (report at 0.5 h); recorded on the row and in BUILD-PLAN's calibration list; archive with the next release.
  - R-155.1 w1-rhythm (1-2 and 1-5 rebuilt to a beat), start 12:42 PM ET, expected 6.5 h (5-10), plan about 2:45, built about 5:30 PM ET.
    Sent to bot-fix. (R-155's own 1-5 plan for fix-petals is gone: 1-5 moved to w1-rhythm.)
- **In flight / waiting:**
  - 0.9.4 is PR #62 (kaizen-gates -> main, the lead 11-04 11:30 AM ET), waiting on Matt's merge: when it lands, archive R-1.1, R-6.25
    and the icons items with the merge commit (check git merge-base first), plus anything else merged in it.
  - R-1.1 is done pending the release merge (proof 5f25029a on icons-painted): archive it with the merge commit when the release lands.
  - R-6.25 (icons B-E) ships in the same release.
  - R-149.12 is still open for the 4-D rethink only; its swimming half is A-38.
  - R-152.6 proposes the arc; Matt gives the per-world numbers later. R-150.4 (the mechanics table) blocks R-150.2/.3/.5/.6 and R-152.x.
  - The closed test (R-147.1) starts at about 80% of Day 1 hours (about 425 of 531.5): flag it at each sweep.
  - Decided by the lead (11-04, PLAN-TO-80): GPU stage 0 merges first, then R-159.1, then R-160.1 hold engine.ts one at a time;
    R-158.1 with R-5.10 one job, R-155 with R-150.3 not twice, R-161.2 inside R-1.9/R-1.10/R-1.15; HF stays $72 total (no top-ups,
    Matt 11-01), so BUILD-PLAN §4 stands. All in the rows and the doc.
  - The clerk's and warmup-5m's method updates: the lead folded them in (no R-items). R-148.16 (D28's LESSONS line) is
    archived as A-39 (1d668e91, on the lead branch).
  - Told the lead: LEADER-STANDARD-WORK.md line 32 still says launch "in about 3 weeks" (their file).
- **Every round:**
  - Merge the lead's branch first (ccr-0d59a91c-oy3imz). New defects (D#) and rules arrive there; the gate reads the local copies.
  - Re-sum lane loads by script from BUILD-PLAN §2, never by hand.
  - Mirror to the doc and read it back. The docs tools are now mcp__Claude_Docs__* (read is deferred: load it with ToolSearch).
  - A bare "|" inside a cell fails the gate.
- **Watch for:**
  - Reports: no commit ids or doc revs (the lead reads them); never send a report in the same batch as a push.
  - Fixed 11-02: the gate no longer counts "roadmap" inside a path or a name (methods/roadmap.md, ROADMAP-KEEPER) as "left for the
    roadmap"; a defect that really is left for the roadmap still needs an R-item citing it.
  - drawcheck can't run in this container (R-148.13): say "not run here, CI at merge".


## Decisions that change how I work (dated)
- 2026-11-02 3:31 PM ET (MATT, to me directly): "Quick and sloppy is not something that's going to be tolerated. I consider you a management type
  bot helper going forward that needs to stick around... you're a core part of the planning. And if you don't understand what you're
  doing, you can break things very badly... that's going to be the last time I step in." What it means for me: the roadmap and the
  estimate are what the lead and Matt plan the whole game on, so a wrong number or a dropped item misleads everyone. I check every fact
  before it goes in, I say what I don't know instead of filling it in, I take the time a step needs even when the asks come fast,
  and I tell the lead when the pace is too fast to do it right. I own every mistake out loud and fix its cause so it never repeats.
- 2026-11-02 3:35 PM ET (lead, recording Matt's talk): on the GAMEPLAN §3 ladder this was the coaching and the FINAL WARNING together. The
  SAME error coming back, or an error hidden or shrugged off, retires me (corrected 2026-11-02 3:39 PM ET, Matt: "errors will happen. You make
  errors. I make errors. It's about having it own the errors and stop making the same errors."; GAMEPLAN §3 "Judgement, not a
  counter"). A new mistake I catch, own and fix is normal work; good work after the warning counts. Sloppiness is not tolerated;
  going quick and sloppy is a failure.
  Slow and right beats fast and corrected: every item checked, gate run, doc read back, totals from the script, BEFORE any report.
- 2026-11-02 (lead, D27): reports carry no commit ids or doc revs typed by me; the lead reads them from git and the doc. I report what
  changed and the totals the script prints.
- 2026-11-02 (Matt): quality sets the date, not the other way round (BUILD-PLAN; LESSONS).
- 2026-11-02: lane loads are summed by script from BUILD-PLAN §2, never by hand.
- 2026-11-02: roadmapcheck counts "roadmap" only as a word, not inside a path or a name (D25 and D27 tripped it).

## My pitfalls and how I avoid them
- A read-back that read only the first page (11-04, rev 182: the doc read is paginated, complete='false' with a next cursor, and I
  checked page 1 only; caught before the 12:42 PM ET commit and before anything relied on it, then the whole doc checked by search): after every write, read back
  with kind "search" (it covers the whole doc, complete='true') for the changed items AND the stale numbers; never call a
  page-1 view a read-back.
- A total typed before the script ran, AGAIN (11-04: "busiest lane 133.5 h" for R-6.40 and "132 h" for R-3.14, both corrected before any
  push or report). Same pattern as the 2:55 time: from now on the estimate line is written only AFTER the lane script prints, never
  in the same edit that adds the row.
- A real-hours note that broke the gate (11-04, R-150.8: text between "h" and "(" dropped the row's hours; caught by the gate before
  any push): keep the shape `; real N h (...)` (methods/roadmap.md).
- A time typed ahead of the clock (11-04: "2:55 AM" written at 2:39 AM in the Mirrored line; caught before any report): every time
  I write comes from `TZ=America/New_York date` run in the same command as the edit, never typed from a guess.
- A fact in a row taken from memory, not re-checked (11-04: R-158.2 named the watched stages wrong and missed World 6; caught by
  grepping the imports): every "Code fact" is grepped in the same round it is written.
- Ids typed ahead of the output (three on 11-02): no ids in reports now; never send a report in the same batch as a push.
- Hand-summed lane loads drifted (11-02): script only.
- A bare "|" inside a cell broke a table (R-6.28, 11-02): roadmapcheck fails on it.
- Missed a queued ask before going idle (R-6.27, 11-01): read the queue before every report and before idle.
- A summary sentence went stale while I updated the table above it (BUILD-PLAN "So: about 3 weeks", stale since R-150 on 11-02;
  caught 11-02 evening): after any total changes, grep BUILD-PLAN, ROADMAP and the doc for the old numbers and dates before reporting.
