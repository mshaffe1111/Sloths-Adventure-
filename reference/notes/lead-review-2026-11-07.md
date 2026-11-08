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
was still "open" (now done); the recorder fix (consultant finding 4, "PARTLY" adopted) had no R-number or owner (now R-165.58); the
promise to delete recordings when testing ends had no R-number (now R-165.59); old helper sessions still showing "needs action" (an
HF "go" request, a "send word to resume") weren't listed anywhere (now in STATE.md, not to be answered); Matt's own "Morning brief"
and "Heartbeat" scheduled tasks sit in the same list as team ones and must not be touched (now noted).

## What I'd change (my calls; I tell Matt only what needs him)
1. **The recorder before the next read (R-165.58).** Finding 4 says several numbers can't be right. The analyst will read this window
   with the same broken fields. Order: the analyst is told which fields to distrust; the recorder fix goes in the first Engine packet,
   so the next window is clean. Tuning on wrong numbers is how the 11-07 confusion happened.
2. **No automatic max-effort consultant on Wednesday.** The 11-07 deep pass is one day old, and the window is mostly the same two
   practised adults (33 of 42 surveys). A second max run on near-identical data buys little. The consultant runs only if the analyst
   finds at least 3 new first-time players in the window; otherwise its money waits for the first-timer test (finding 8).
3. **Escalating help moves up.** A child stuck 37 minutes on Easy is the worst player harm we have, and help doesn't depend on the
   reach numbers. The Designer's spec carries the help thresholds first; the Engine builds help while the Architect does the verdict
   schema (no shared WRITE files).
4. **WebGL stage 0 comes off Wednesday's graph.** It has nothing to do with the 1-1 findings and the frame budget passes today. Finish
   1-1 before starting the renderer move (finish before starting). It stays on the roadmap.
5. **Verify every adopted finding, not just #2.** The consultant could not reach the game; its numbers are a simulation of FEEL.md.
   Eight of ten findings were marked ADOPTED. The Critic's first test flies the real engine at 30 fps over a bare gap and rise
   (planner handoff §2) before any lay number moves.
6. **The 8 ms budget lives in a rule, or it isn't a budget.** STATE says 8 ms; the gate enforces 12 ms until PERFORMANCE-RULES §1
   changes. Tightening is the standard moving up, so the Architect writes the §1 change and the gate change together, Critic-checked.
7. **R-165.53 (lethal drops in a first stage) is the decision that blocks the most.** All 21 lives lost were in the treetops, painted
   like safe floor, and the builder reports no fall costs a life. Content can't re-lay 1-1 without it. It goes to Matt first.
   My recommendation: none in 1-1. Lethal drops are a new mechanic and get taught, with their own look, in a later stage.

## What looks like the last lead's bias
- **Process over game.** The last two days produced the team's documents and no game change. Good documents, but the plan now front-
  loads two outside runs and five sequential roles before a player sees anything. I'll run independent packets side by side.
- **Adopting the outsider wholesale.** "ADOPTED" on findings from a reviewer who never played the build. Treat each as a hypothesis
  until the engine test or the data confirms it.
- **Accepted fails piling up.** 0.9.5 shipped with four named funcheck fails (R-165.48 to .51). They're Day 1 items, not background.
  They go into the 1-1 re-lay's done-items, so the next 1-1 clears them instead of adding to them.
