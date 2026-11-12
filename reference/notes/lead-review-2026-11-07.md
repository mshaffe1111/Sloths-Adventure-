# The new lead's cold review of STATE.md's plan (written 2026-11-07 9:46 PM ET, before any contact with the backup lead)

Lead: session_01FhBbYMoqqEdVR3qFjTCugy. Sources: STATE.md, handoffs/lead.md and planner.md, roles/PM.md, consultant/responses.md, the
11-07 review on ccr-23292c36-550qmt, ROADMAP.md, `git diff 11242520 origin/main -- src` (empty: the live game is unchanged since 0.9.5).

## The five handover questions, from the documents alone
1. **What's live:** 0.9.5 (game code = 11242520, PR #66). main is now 181d2846 (PR #67 and #68: documents and tools only, no src).
   APK v0.9.5-33+ on Releases. EnK5 = the same build. Testers play the live site + `?fresh=1#ctest` until Tuesday 11-10.
2. **Next three tasks, who:** (a) the data analyst on the play window (Wednesday 11-11 after 2:00 AM ET), (b) the Designer's reach spec
   from the 30 fps sim, proven in the real engine, (c) the Architect's verdict schema. (My changes below reorder some of this.)
3. **What needs Matt:** merges and releases; HF spending and picture lists; R-165.52, .53, .54, .55; story and taste through the story keeper.
4. **How a release goes:** roles/PM.md §5 and methods/release.md: candidate branch from main, full gate on the exact head by a max
   Critic, EnK5 rebuilt for Matt first, then a non-draft PR, then the three after-merge runs and the APK on Releases.
5. **The links:** roles/PM.md §6 (live, testers' #ctest, EnK5 for Matt only, Releases, the handoff doc).

**Where the notes fell short (fixed tonight):** lead.md still said "start on studio if it hasn't merged" (it merged: #67, #68); R-165.56
was still "open" (now done); the recorder fix (consultant finding 3, "PARTLY" adopted) had no R-number or owner (now R-165.58); the
promise to delete recordings when testing ends had no R-number (now R-165.59); old helper sessions still showing "needs action" (an
HF "go" request, a "send word to resume") weren't listed anywhere (now in STATE.md, not to be answered); Matt's own "Morning brief"
and "Heartbeat" scheduled tasks sit in the same list as team ones and must not be touched (now noted).

## What I'd change (my calls; revised after the cold Critic's REJECT, 11-07 evening)
The first version of this section had false facts and two changes that broke written rules. The Critic's 15 items are answered below;
the withdrawn calls are named so the next lead sees them.

1. **The recorder (R-165.58).** Consultant finding 3 in responses.md's numbering ("PARTLY"; the review's own heading calls it
   headline 4): several numbers can't be right. The 11-10 window was recorded with the old recorder, so the analyst reads it with
   the odd fields flagged, and the fix makes the NEXT window clean. The page's length line is Content's, with the story keeper.
2. **WITHDRAWN: "no automatic consultant".** It contradicted CONSULTANT.md, TEAM.md, PM.md and the persona, and it let a member decide
   whether the outside view runs. It also rested on two claims I can't stand on: the review would be 4 days old, not 1, and "33 of 42"
   counts data up to 11-07, not the window to 11-10. The consultant runs after the window, as written.
3. **Escalating help (R-165.62)** stays in the Engine's queue, on the Architect's file list (TEAM.md row 3; PM.md §4 1b). I withdrew "beside the
   Architect's task" and "no shared WRITE files": nobody had checked the files.
4. **WITHDRAWN: "WebGL off the graph".** My reason, "the frame budget passes today", is false: Matt's Pixel's worst frame was 58 ms
   upright and 96 ms sideways on 11-06 (GPU-RENDERER-PLAN.md:67) against §1's 50 ms, and R-3.1 says the APK runs under 20 fps. The GPU
   move is Matt's 10-30 direction. It stays.
5. **Verify every adopted finding**, not just #2: the consultant couldn't reach the game; its numbers simulate FEEL.md. The Designer's
   first done-item is a planted test that flies the real engine (R-165.60).
6. **The frame budget (R-165.65). WITHDRAWN 11-09.** I wrote "the gate enforces 12 ms" (false: no gate measures frame time; buildcheck
   measures stage-build time and limits.json caps canvas calls), then ruled 8 ms "a design target, not a gate". That dropped the check
   Matt's 11-06 ruling asks for (GPU-RENDERER-PLAN.md:52-59: 8 ms, a change to §1 and limits.json, with a planted test), and I wrote
   that Matt had handed me "technical calls", which he never said. Matt's ruling stands; R-165.65 is now the work to land it (D34, D35).
7. **R-165.53 and R-165.52**, which Matt handed to the lead (11-07): no lethal drops in 1-1; the first-ever 1-1 run is one fixed,
   hand-checked layout, and replays roll.
8. **Tester data (R-165.59, Matt 11-07):** only the data from before 0.9.5 is deleted now; the newer data stays for fixes and bots
   until testing is done, then Matt deletes everything. The 11-07 review gets a redacted copy on main before the named history goes.

## What looks like the last lead's bias
- **Process over game.** The last two days produced the team's documents and no game change.
- **Adopting the outsider wholesale.** "ADOPTED" on findings from a reviewer who never played the build. Each is a hypothesis until the
  engine test or the data confirms it.
- **Accepted fails piling up.** 0.9.5 shipped with four named funcheck fails (R-165.48 to .51). They go into the 1-1 re-lay's
  done-items, so the next 1-1 clears them.

## And my own, caught by the Critic
- I stated facts from memory of what I'd read ("the gate enforces 12 ms", "the budget passes") instead of checking the file. LAWS 3.
