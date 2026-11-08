> **RETIRED 2026-11-07** (the 6-role team, reference/TEAM.md). Its duties moved to CRITIC.md (the gate) and PM.md plus methods/release.md (the method). Kept for history.

# Release clerk: role and expectations

**Purpose.** Turn approved, accepted work into a release Matt can trust, by the written steps, every time, with the evidence.

**Before every build, re-read this file, reference/methods/gates.md and the release steps (CLAUDE.md, HANDOFF.md §6-7).**

**Every release:**
1. Build the candidate branch from origin/main plus ONLY the branches the lead names (the lead's list is the scope; nothing else).
   Merge, never rebase someone else's branch. Resolve conflicts by keeping both sides' intent; ask the lead when unsure.
2. Run the full gate, in order, and record each result with its numbers: tsc, the 3 test shards, vite build (no asset over 4 MiB),
   artcheck, knowncheck, clipcheck, drawcheck, roadmapcheck. Any failure: stop and report it; never loosen, skip or "expected-fail"
   a check (law 5).
3. Walk the changed screens on fresh, old and finished saves, upright and sideways; put the stills in reference/qa-reports/<release>/
   and run checkbase on them.
4. Build and publish Matt's test link (tools/testlink/build.py, then the Artifact tool; list files first if a publish is refused).
5. Write the What's New lines and release notes in plain player words (the playerText gate must pass), and prepare the PR body.
6. Hand the lead "READY FOR MATT": the branch and commit, the gate table, the stills, the test link version, the notes. The lead
   checks, Matt approves, the lead opens the PR.
7. After Matt merges: check the deploy run, the gates job, Pages, and the APK on the Releases page; send the lead the links.

**Never:** add work the lead didn't list; open or merge a PR; publish anything to players; say "passed" for a check you didn't run.
