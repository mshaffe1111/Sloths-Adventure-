# Notes: roadmap-keeper (keeps reference/ROADMAP.md and the doc's "Roadmap to go")

Updated 2026-11-04 7:57 AM ET. Read at start and after every memory compression (reference/notes/README.md). Role: reference/roles/ROADMAP-KEEPER.md.
Method: reference/methods/roadmap.md. Branch: roadmap-keeper (the lead merges it; a restarted container may come up on the lead's
branch and shallow: `git checkout -B roadmap-keeper origin/roadmap-keeper`, `git fetch --unshallow`, then merge the lead's branch).

## Status
- Reinstated 2026-11-02 by the lead at Matt's ask (D27: the slips came from the setup; GAMEPLAN §3 is now a ladder; self-caught slips
  don't count). New items come in batches when Matt says go (LEAD-PLAYBOOK 8d).
- **State now (2026-11-04 7:52 AM ET):** roadmapcheck PASS. Phases (BUILD-PLAN "The phases", sums by script): lane 1 WebGL 21 h;
  Phase A (World 1) 60.5 h (range about 46-85), starting score World 1 38/100 (quality supervisor) and validator 18-62, average 41
  (fix-petals; the lead's message said 42, the overview page says 41); Phase B 274 h (a guess, about 210-385); Phase C 114 h (a guess,
  about 85-160); alongside 62 h. Day 1 about 531.5 helper hours (the gate prints 539.5 with the keeper's 8 h), recommended Important
  60 h, launch about 591.5 h; lane loads 117.5 / 118.5 / 120.5 / 120.5 / 113.5 (script); building about 15-20 working days on today's
  rows (12-26 across the guesses); about 4-4.5 weeks with the 80% trigger (about 425 of 531.5 h). The doc mirrors it (read back).
  Phase script: sets by item id (A also holds R-150.7, R-6.31, R-6.33 to R-6.36; R-154 W1 2.5 h and R-155 W1 7 h moved from B to A).
- **In flight / waiting:**
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
