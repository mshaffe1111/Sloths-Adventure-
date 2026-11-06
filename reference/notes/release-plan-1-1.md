# Release plan: gen2 1-1 goes live (0.9.5), 2026-11-06

Matt (2:40 PM ET): "This has to go out live on both sides, but I'm only sharing the one stage." Both sides means the live site
(gh-pages) and the APK on the Releases page. Sources: HANDOFF §7, the supervisor's checklist (2:42 PM ET, which cites
RELEASE-CLERK.md, gates.md, PARTNER, LEAD-PLAYBOOK §6, PLAY-STORE §6, PERFORMANCE §1/§8).

## The one rule that shapes the timetable
The test link Matt plays at 6 PM IS the release candidate: the same commit. Matt playing the candidate before the PR is a
release step, so building the link from the candidate saves a second round. #ctest (the recorder and survey) is QA-only behind
its hash, so it ships in the code without changing the live game.

## Candidate branch: release-0.9.5
- Cut from origin/main (0.9.4, 68b31e665) plus ONLY: engine-core (171 commits, already contains main), tester-page
  (14 commits), engine-chunks (2), if each is passed. MERGE them, never rebase someone else's branch.
- NEVER from ccr-0d59a91c-oy3imz (the rejected 11-04 W1 rebuild, D40). Check engine-spec (271 commits not in engine-core) and
  art-director (72) before taking anything from them: take only named files, never the whole branch.
- New replaces old: the old 1-1 builder code is DELETED, with no Play=gen2 toggle left.
- 1-5's player text must match its petals (R-165.45), or 1-5's changes stay out. The lock (`lockall --check` against a recorded
  main run) proves every stage except 1-1 (and any named one) is identical.

## Gate, in order, each PASS or NOT RUN (D42: never claim "full gate" without naming each)
1. tsc
2. the test suite in 3 shards (about 30 min in total, or a 90-min timeout)
3. vite build, no asset over 4 MiB
4. npm run build:store (no outside address, tracking or service worker)
5. artcheck
6. knowncheck
7. clipcheck (fresh, old and finished saves, both ways)
8. drawcheck (limits.json; PERFORMANCE §8 release speed check)
9. roadmapcheck (7 fails today: likely helper NEXT.md files, and commit hashes that exist only on a branch)
10. funcheck: re-record its known list from main first (it was recorded on the rejected W1, R-165.44)
11. lockall --check: only the intended stages changed

## Also before the PR
- PARTNER's "little pieces" walk: seams, code-drawn shapes, Dot, sound, notch text, reachability.
- Changed screens on fresh, old and finished saves, upright and sideways. Stills go in reference/qa-reports/0.9.5/. Before
  calling a rough spot "not new", shoot origin/main side by side.
- package.json goes to 0.9.5, and whatsNew.ts gets the top entry in player words (the lead approves it). A test checks that
  the top entry matches the version.
- The PLAY-STORE §6 table: all 8 items, each with proof or "not checked, and why".
- The test link is rebuilt in place (EnK5), Matt plays it, and #ctest still works.

## The PR and after the merge
- The PR goes through the GitHub MCP create_pull_request (gh is not available). The body has what changed, the gate table and
  the §6 table. Push only on Matt's "push". Matt merges.
- After the merge: check "Publish game to the gh-pages branch", "pages build and deployment" and the gates job are green.
  Check the APK is on Releases as v0.9.5-<run>, and give Matt its link.
- Then: STATUS.md and ROADMAP (done items name the PR or commit), tick Matt's handoff doc, a 15-minute retro, and log every
  new defect with a root cause.

## Links Matt gets
- Before: https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb (FIRST line, with Artifact open)
- The PR: https://github.com/mshaffe1111/Sloths-Adventure-/pull/<n>
- After: https://mshaffe1111.github.io/Sloths-Adventure-/ and https://github.com/mshaffe1111/Sloths-Adventure-/releases
- Plus a plain list of what's in, what's out, and anything rough.

## Traps
PR #25's cache limit (now 4 MiB per asset; if the publish fails, read its log and open a follow-up PR); the §6 table left out
of the body; a branch cut from the lead branch; roadmapcheck's commit-in-history rule; whatsNew ≠ version; typed times.

## Timetable (ET)
- 2:50-5:00: the release clerk cuts release-0.9.5 from main, fixes roadmapcheck, re-records funcheck, records the main lock,
  and drafts the version, whatsNew and §6 table. It merges tester-page and engine-chunks as they pass.
- 5:00: engine-core's final commit is merged into the candidate, and the gate runs (in the background, about 45 min).
- 5:00-5:45: the lead builds the test link FROM THE CANDIDATE and publishes EnK5.
- 6:00: Matt plays. If he's happy, he says "push", and the PR opens with the gate and §6 tables.
- After the merge: the deploy, the APK link, the testers start on #ctest.
