# Method: shipping a release (live site + APK + both test links)

Matt, 2026-11-06, after 0.9.5: "Make sure that you note going forward how to do this." Written from 0.9.5 (PR #63 and its follow-up
#64). It replaces HANDOFF §7 (no rebase: candidates are merged; the PR goes through the GitHub MCP tools). Read it with reference/roles/CRITIC.md (the gate), reference/handoffs/release-clerk.md and methods/gates.md.

## The links: there are TWO test links. Know which is which
| Link | What it is | When it changes |
|---|---|---|
| https://mshaffe1111.github.io/Sloths-Adventure-/ | The LIVE game (gh-pages) | Only when a PR merges into main and the deploy succeeds |
| https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest | **The TESTERS' link** (the child tester and the others): the live site plus #ctest, with the recorder and survey | Same as the live site: testers see a new build ONLY after the merge |
| https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb | **Matt's own test link** (the Claude page), where he plays a candidate BEFORE the merge | When the lead publishes it with the Artifact tool |
| https://github.com/mshaffe1111/Sloths-Adventure-/releases | The APK, named "Sloths Adventure v<version> (<date>)", tag v<version>-<run> | Built by itself on every push to main |

- The testers' sheet ("Sloths control tests", Sessions tab) gets rows from the LIVE #ctest page. Plays on the Claude page (EnK5) did
  NOT arrive on 11-06, so treat EnK5 as not recording. Our cloud containers can't reach script.google.com, so a row can't be tested from
  here: a real phone on the live #ctest page is the proof.
- D28 (0.9.5): the lead believed the testers' link was EnK5. It isn't. Check this table before telling Matt where testers will play.

## Before the PR
1. **Candidate branch** `release-<version>`: cut from origin/main, plus ONLY the named branches, MERGED in, never rebased. Never from
   ccr-0d59a91c-oy3imz or the lead branch (D40).
2. **Remove what doesn't ship** (new replaces old): the old builder, test-only pickers and toggles. Script it so each anchor is asserted
   (0.9.5: reference/qa-reports/0.9.5/old11-delete.py).
3. **Version and What's New**: bump package.json; add the top entry of src/game/whatsNew.ts in player words, approved by the lead. A test
   fails if they differ.
4. **The full gate, on the EXACT head you will PR, every gate by name** (CLAUDE.md "Checks"; D42):
   - tsc;
   - the FULL test suite;
   - vite build (no asset over 4 MiB);
   - npm run build:store;
   - artcheck;
   - knowncheck;
   - clipcheck;
   - drawcheck;
   - roadmapcheck;
   - funcheck;
   - lockall --check against main's recorded lock (only the intended stages change);
   - kbdcheck, buildcheck and `npx tsx tools/engine/seedlist.ts 1-1 --check` (CI runs all three: .github/workflows/gates.yml).
   **The deploy itself runs the full suite in 6 shards and publishes only if every shard is green**, so a red test anywhere means the live
   site doesn't update.
5. **NO PR UNTIL EVERY GATE IS GREEN (D29, 0.9.5).** The lead opened PR #63 while the suite was still running. Matt merged at once, and
   one stale test (pitPocket.test pinned to an old Roll B seed) failed the deploy. It took a second PR (#64) to get the site live.
6. **After ANY proven-seed-list rebuild**, run every test that pins a roll or a seed, BEFORE the PR:
   `npx tsx --test $(grep -rln "setPick11\|roll11Seed\|provenSeedFor" src --include=*.test.ts)`. A test may require properties of a pinned
   roll (counts, kinds), never its exact x positions, because the pins move when the list is rebuilt.
6b. **A NEW gate is run the way CI runs it before the PR** (D31, #65): `CI=1 FORCE_COLOR=1 node tools/perf/<gate>.mjs`. CI turns colour on,
   so a gate that reads tool output must strip colour codes (kbdcheck matched a raw "Local:" and failed the deploy; #66 fixed it).
7. **A gate that fails and is accepted** (0.9.5: funcheck) is named in the PR body with its numbers, the reason, and Matt's acceptance.
   Never lower or re-record a known list to pass (Law 5).
8. **Matt plays the candidate first**: rebuild EnK5 from the candidate (below), put the link in the FIRST line, and call Artifact open.

## The PR
- Use the GitHub MCP tool create_pull_request: base `main`, head `release-<version>`, **draft: false** (Matt can't merge a draft).
  The cloud environment's rules allow `gh` only for search; use the MCP tools.
- The body has: what changed in plain words; what's merged in; the gate table (every gate, PASS or FAIL); the PLAY-STORE §6 table (all
  8 items, each with proof or "not checked, and why"); rough spots named; and what to check after the merge.
- Check the PR page shows `mergeable_state: clean`, then give Matt the link. **Matt merges. The lead never merges.**
- Once the PR is open, nobody pushes to its branch again. Notes go on a separate `-notes` branch. If a change is truly needed
  before Matt merges, read the PR's state first (pull_request_read get; he may already have merged), add a new commit, never amend
  or force-push, and tell him. After a merge, changes go on a new branch from main with their own PR (D33, PR #67).

## After the merge (check every one; the deploy takes about 7-15 minutes)
1. Use the GitHub MCP actions_list tool, method list_workflow_runs, on the merge commit. Three runs must pass (the gates are jobs inside the publish run, not a run of their own):
   - **"Publish game to the gh-pages branch"** (deploy.yml: tests in 6 shards, plus gates.yml, then publish);
   - **"pages build and deployment"** (starts after the publish);
   - **"Build Sloths Adventure Android APK"**.
2. **The APK workflow does NOT wait for the tests.** On 0.9.5 the APK v0.9.5-32 was published while the site's deploy FAILED. So "the APK is
   on Releases" doesn't mean "the site is live". Check both.
3. If the publish fails: get_job_logs with failed_only finds the failing test. Fix it in a small follow-up PR from main, with only the fix.
   The live site stays on the old version until then (safe).
4. Check the live title shows the new version, and that the testers' #ctest link opens the new build. Have Matt tap Refresh on his
   phone, because a PWA keeps the cached copy until the next reload.
5. Rebuild EnK5 from main's merge commit, so Matt's test link and the live site are the same build.
6. Give Matt: the live link, the testers' link, and the Releases entry link. Then tick Matt's handoff doc, update STATUS and ROADMAP
   (done items name the PR), log any defect here and in CONTINUOUS-IMPROVEMENT, and run the 15-minute retro.
7. **Never push a v* tag by hand.** build-apk.yml names the release from package.json itself, and a tag makes a duplicate release.

## Rebuilding Matt's test link (EnK5)
- Work in a worktree of the commit, with `npm install --legacy-peer-deps`, then `python3 tools/testlink/build.py "<note>"`.
- The artifact holds at most 511 files, so every publish must remove stale files: list the artifact's files (Artifact list, scope
  "files"), then map each new dist file to its path and each published file missing from dist to null. On 0.9.5 the lead's
  scratchpad/mkmap.py did this from a saved list of published names (15 nulls, 10 adds, 491 files).
- Before sending the link: serve dist locally (`python3 -m http.server`), open #ctest in Playwright, start a run upright and sideways,
  and check there are no page errors. A Playwright route on script.google.com proved the recorder sends a row every 20 s.

## Added 11-07 from the release clerk's handoff (reference/handoffs/release-clerk.md §2-4; the PM adopted all ten)
- Record main's lock first and self-check it; always pass `--intended` on the candidate.
- **Trial-merge as soon as the branches exist** (scratch worktree: tsc, the shards, the lock). On 0.9.5 it gave 3 hours' warning.
- Run the gate in a detached worktree at the candidate SHA, never in a working tree.
- Re-run a timing test alone before calling it red.
- Report main JS against 4,194,304 B every release; under 50 KB headroom, apply reference/qa-reports/0.9.5/lazy-seeds.py.
- roadmapcheck needs `git fetch --unshallow` and every branch fetched.
- **Once a PR is open, a red gate goes to the PM by send_message at once** (0.9.5: red at 6:33 PM, merged 6:34).
- Count new `todo:` markers against main (`git grep -n "todo:" <ref> -- 'src/*.test.ts'`); a new one is an expected-fail (Law 5).
  The Critic builds this into a gate.
- funknown.json joins knowncheck's LISTS.
- PR body template: reference/qa-reports/0.9.5/PR-BODY.md.
