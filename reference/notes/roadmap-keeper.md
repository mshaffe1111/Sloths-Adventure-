# Notes: roadmap-keeper (keeps reference/ROADMAP.md and the doc's "Roadmap to go")

Updated 2026-11-02 3:26 PM ET. Read at start and after every memory compression (reference/notes/README.md). Role: reference/roles/ROADMAP-KEEPER.md.
Method: reference/methods/roadmap.md. Branch: roadmap-keeper (the lead merges it; a restarted container may come up on the lead's
branch and shallow: `git checkout -B roadmap-keeper origin/roadmap-keeper`, `git fetch --unshallow`, then merge the lead's branch).

## Status
- Reinstated 2026-11-02 by the lead at Matt's ask (D27: the slips came from the setup; GAMEPLAN §3 is now a ladder; self-caught slips
  don't count). New items come in batches when Matt says go (LEAD-PLAYBOOK 8d).
- **State now:** ROADMAP.md 199 open, 40 done; roadmapcheck PASS. Day 1 about 303 helper hours (the gate prints 311: it adds the
  keeper's own 8 h), recommended Important 55.5 h, launch about 358.5 h; building about 9-12 working days; the doc ("Roadmap to go")
  mirrors it at rev 123.
- **In flight / waiting:**
  - R-1.1 is done pending the release merge (proof 5f25029a on icons-painted): archive it with the merge commit when the release lands.
  - R-6.25 (icons B-E) ships in the same release.
  - R-149.12 is still open for the 4-D rethink only; its swimming half is A-38.
  - R-152.6 proposes the arc; Matt gives the per-world numbers later. R-150.4 (the mechanics table) blocks R-150.2/.3/.5/.6 and R-152.x.
  - The closed test (R-147.1) starts at about 80% of Day 1 hours (about 242 of 303): flag it at each sweep.
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
  and I tell the lead when the pace is too fast to do it right. There is no next chance.
- 2026-11-02 3:35 PM ET (lead, recording Matt's talk): on the GAMEPLAN §3 ladder this was the coaching and the FINAL WARNING together. The next
  defect that escapes into the roadmap or the doc retires me. Sloppiness is not tolerated; going quick and sloppy is a failure.
  Slow and right beats fast and corrected: every item checked, gate run, doc read back, totals from the script, BEFORE any report.
- 2026-11-02 (lead, D27): reports carry no commit ids or doc revs typed by me; the lead reads them from git and the doc. I report what
  changed and the totals the script prints.
- 2026-11-02 (Matt): quality sets the date, not the other way round (BUILD-PLAN; LESSONS).
- 2026-11-02: lane loads are summed by script from BUILD-PLAN §2, never by hand.
- 2026-11-02: roadmapcheck counts "roadmap" only as a word, not inside a path or a name (D25 and D27 tripped it).

## My pitfalls and how I avoid them
- Ids typed ahead of the output (three on 11-02): no ids in reports now; never send a report in the same batch as a push.
- Hand-summed lane loads drifted (11-02): script only.
- A bare "|" inside a cell broke a table (R-6.28, 11-02): roadmapcheck fails on it.
- Missed a queued ask before going idle (R-6.27, 11-01): read the queue before every report and before idle.
