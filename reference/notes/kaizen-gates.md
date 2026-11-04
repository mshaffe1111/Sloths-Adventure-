# Notes: kaizen-gates (release clerk)

Role: reference/roles/RELEASE-CLERK.md (re-read before every round). Method: reference/methods/gates.md. Lead: session_019iachLiuwNTAZUBSJWUmR3.
Built the gates on 2026-11-01 (clipcheck, playerText.test, knowncheck, CI gates.yml).

## Job now: release-0.9.4 (started 2026-11-04 02:34 EST)
- Scope (the lead, 2026-11-04): origin/main + icons-painted ed41fa91 (icons B-E + R-1.1 Crocus defeat fix) + lead branch ccr-0d59a91c-oy3imz. Nothing else.
- Walk: every icon B-E screen and the Crocus defeat panel, upright and sideways, on fresh, old and finished saves.
- The candidate is built on branch kaizen-gates (this session may only push there), restarted from origin/main (the old kaizen-gates was already merged into main, so it's a fast-forward). Say so in the report.
- Version 0.9.4: package.json plus a What's New entry at the top (draft lines; the lead approves). Notes: reference/releases/0.9.4.md.
- Test link: python3 tools/testlink/build.py, then publish in place to https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb.
- Never open or merge the PR.

## Done (proof; updated 2026-11-04 03:27 EST)
- Candidate built: origin/main 1dc39cd7 + ed41fa91 (fast-forward) + ccr-0d59a91c-oy3imz b8c4a7c5 + roadmap-keeper c925a679 (the lead added
  it for roadmapcheck, 2026-11-04 "A: merge origin/roadmap-keeper"); version 0.9.4 at db0272dd.
- Gate on the tree (numbers in reference/releases/0.9.4.md): tsc, the suite (2292/0 fail on db0272dd; no src change since), build, artcheck,
  knowncheck, roadmapcheck, clipcheck (83 known, 0 new, 0 stale), drawcheck (14/14), checkbase: all pass.
- Walk: reference/qa-reports/release-0.9.4 (190 stills, sheets, README). Two rough spots named, both checked to be on main as well.
- Test link: version 234 of the artifact (published in two parts: 255 entries per publish is the cap).
- Release notes + PR body: reference/releases/0.9.4.md.
- Waiting: the lead's check and Matt's word. Never open or merge the PR.

## Pitfalls
- roadmapcheck lives only on origin/roadmap-keeper (not in scope). Run it from the scratchpad with its root set to the candidate; never merge that branch.
- Commit ids and times are pasted from command output after the push.
- pkill -f with a pattern that matches its own command line kills the calling shell. Kill by PID.
- Force-push is refused here, and isn't needed: restart a branch only when the old one is already in main (then it's a fast-forward).
- The artifact publish takes at most 255 `files` entries: split removals and additions; send only new names (content-hashed names that
  are already published are identical) plus the un-hashed icons. A fresh container has no dist-prev, so list the artifact first.
- tools/art/icons/shots.mjs: on a fresh save the "map" shot is the "Who's exploring?" pop-up; shoot the fresh map separately.
- Before writing "not new in this release" about a rough spot, shoot the same screen on origin/main (a worktree on its own port).
