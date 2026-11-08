# Handoff: the release clerk's job, for the Critic (the gate) and the PM (the method)

Written by the release clerk (session_01FhBbYNbiMMD4wtzGED2iUK) on 11-07, after 0.9.5 (PR #63 + #64, main a89564f7, live 11-06 7:10 PM ET).
The role ends with the 6-role team (reference/TEAM.md). The release checks become the Critic's job, and the PM keeps
reference/methods/release.md. This file holds what that method doesn't, from a real run. The full 0.9.5 diary is
reference/notes/release-clerk-status.md on this branch (release-0.9.5-notes).

## 1. The scripts (reference/qa-reports/0.9.5/)
Each one asserts every anchor exactly once and exits with `FAIL <file>: ...` if one is missing or found twice, so a moved file fails
loudly instead of half-applying. Run them from the repo root with `python3 -I <script>`, on the merged candidate, then run tsc.
Plain .patch files broke twice on 0.9.5 because engine-core kept editing the same lines. Write scripts, not patches, for any edit
that has to land on a moving branch.

| Script | What it does | Status after 0.9.5 |
|---|---|---|
| `old11-delete.py` | New replaces old: deletes old 1-1's builder (protoStage.ts), Matt's Old 1-1 / Roll A-C picker (WorldMap.tsx and worldMap.css), the 'old' pick and `skip11Spec` (testlink1_1.ts), and `pick11() !== 'old'` in stageGenerator.ts (gen2Roll11, builtOnGen2). Rolls A/B/C stay as QA seed pins (the lead approved). Then: `grep -rn "pick11() !== 'old'\|skip11Spec\|pickerOn\|wm-pick11\|'Old 1-1'" src` must be empty. | Applied (main). One-shot: don't re-run it. Reuse it as the template for the next "delete the old path" job. |
| `release-prep.py` | Copies `funknown-main.json` (funcheck's list recorded from main) to tools/validate/funknown.json; cites engine-core/NEXT.md on R-165.1 if nothing does; bumps package.json 0.9.4 -> 0.9.5; adds the What's New top entry. | Applied (main). For the next release, copy it and change the version strings and the entry. |
| `lazy-seeds.py` | Contingency for the 4 MiB per-file limit: gen2/seeds.ts (~220 KB) and gen2/provenSeeds.ts (~44 KB) load as their own chunk through a top-level `await import()` in gen2/game.ts and gen2/seedList.ts, before any stage is built. Measured: main JS 4,168,556 -> 3,892,798 B. First frame of 1-1 at CPU x4 (tools/perf/firstframes.cjs, 3 runs) unchanged, median 11.9 -> 11.5 s. Both chunks are in sw.js's precache. build:store PASS. Tests on it: seeds 2/2, game 12/12, seedList 4/4, buildAhead 2/2, stage11gen2 4 + the old todo. | NOT applied (0.9.5 had 31 KB of headroom). **Apply it in the next release that grows the bundle**: main JS was 4,162,883 B, 31 KB from the limit. Re-measure after applying. |

Also: `funknown-main.json` (the 144-entry list recorded from main 68b31e66), `PR-BODY.md` (the 0.9.5 body: a template with the gate
and §6 tables), `release-notes-draft.md`.

## 2. The gate, in order, and how long each step took here (4 CPUs)
1. `npx tsc --noEmit -p .`: about 10 s.
2. The test suite in 3 shards (`--test-shard=i/3`, in parallel, `--test-reporter=spec` to a file each): about 35 min. Run it in the background.
3. `npx vite build`, then check `dist/assets/index-*.js` against 4,194,304 B and that `find dist -size +4M` is empty: about 25 s.
4. `npm run build:store`: its last line must read "Store build check passed: ...": about 25 s.
5. `node tools/perf/artcheck.mjs`: seconds.
6. `node tools/perf/knowncheck.mjs`: seconds.
7. `node tools/perf/clipcheck.mjs`: about 260 s.
8. `node tools/perf/drawcheck.mjs`: about 370 s.
9. `node tools/roadmapcheck.mjs`: seconds.
10. `npx tsx tools/validate/funcheck.ts`: about 60 s.
11. `npx tsx tools/engine/lockall.ts --layouts 16 --intended <stages> --check tools/engine/lockall-main-<version>.json`: about 10 min.

Run 5, 6, 9 and 10 while the shards run. Run 7 and 8 after the shards, because they're browser checks and sensitive to CPU.
Run the whole gate in a **detached worktree at the candidate SHA** (`git worktree add --detach <dir> <sha>`, then symlink node_modules),
so a notes commit can't touch what is being judged. Write the SHA at the top of the status note.

## 3. The traps (each one bit on 0.9.5)
- **funcheck**
  - Its known list (tools/validate/funknown.json) must be recorded from MAIN, not from a feature branch. 0.9.5's first list came from the
    rejected W1 and showed 80 false "worse" results. To record: in a worktree of origin/main, copy the candidate's tools/validate/ in,
    run `FUNCHECK_WRITE=1 npx tsx tools/validate/funcheck.ts`, then run it twice more: PASS both times, the same count.
  - knowncheck does NOT guard funknown.json: it isn't in knowncheck's LISTS. The only guard is people. Never lower or re-record it to
    pass (Law 5).
  - It also judges stages relative to each other ("like the stage before", "nothing new") and through the bot's play. So it moves on
    stages the lock proves identical (0.9.5: 1-2, 1-3, 1-6, 1-9). That means the engine's play changed, not the stage (R-165.51).
  - A funcheck fail ships only as a named, accepted fail: numbers in the PR body, plus Matt's acceptance (0.9.5's ruling, 6:20 PM ET).
- **roadmapcheck in a shallow clone**
  - It prints `shallow clone, proofs cannot be checked (fetch-depth 0): FAIL`. Run `git fetch --unshallow origin main` first.
  - A done item may cite a commit that lives only on a helper branch. The checker accepts "on any remote branch", but only for branches
    you have fetched: `git fetch origin '+refs/heads/*:refs/remotes/origin/*'`. On 0.9.5, 3 of the "7 fails" were only that. Fix the
    data (cite, add the R-item), never the checker.
  - Adding Day 1 items changes the total, so BUILD-PLAN.md's "roadmapcheck prints N" must be updated in the same commit, with the line
    saying why.
- **The shards' timing**
  - `stageQuality.test.ts:287` ("generating a stage is quick: p90 under 500 ms") failed at p90 613 ms with 3 shards, the lock and a vite
    build sharing 4 CPUs. Run alone on an idle machine, it passed (7 s). Re-run any ms or p90 test ALONE before calling it red. Never
    loosen it.
  - CI runs 6 shards on separate runners, so this isn't a CI risk. It's a local-load artefact.
  - The deploy publishes only if every one of its 6 test shards is green. One red cancels the rest and skips publish, and the live site
    stays on the old version. The APK workflow does NOT wait for the tests: v0.9.5-32 was published while the site's deploy failed.
- **Tests pinned to rolls or seeds**
  - pitPocket.test asserted Roll B's exact pocket x positions. When engine-core rebuilt the proven list and changed testlink1_1.json
    (B 110867 -> 15458), the test went red and blocked the 0.9.5 deploy (fixed by #64).
  - After any seed-list rebuild, run `npx tsx --test $(grep -rln "setPick11\|roll11Seed\|provenSeedFor" src --include=*.test.ts)`
    before the PR.
- **The lock**
  - Record main's lock first and check it against itself (it must print N/N unchanged) before trusting it.
  - Always pass `--intended`. Without it the intended change exits 1 and looks like a fail.
  - `--stages <id>` with `--out` gives one stage's builds for a part-by-part diff. That's how 4-9's moved find (layout 4, w4_snail
    x 9355 -> 12075, from levelCheck's roofedDrop) was found.
- **Git**
  - `git log -1 a b c` shows only the single newest commit across all three refs. Use one ref per call. On 0.9.5 that misread made me
    stop a good test run.
  - npm creates package-lock.json (the project uses bun.lock). Keep it out with .git/info/exclude; never commit it.
- **Times**
  - Read `T=$(TZ=America/New_York date +%-I:%M)` and print from that. I typed ahead of the clock 4 times on 0.9.5.

## 4. What the release method (reference/methods/release.md) is still missing
I proposed these in my final note on 11-06. The PM should add any it agrees with:
1. Record main's lock first and self-check it; always pass `--intended` on the candidate.
2. Do a **trial merge as soon as the branches exist** (a scratch worktree: tsc, the shards, the lock). On 0.9.5 it gave engine-core
   3 hours' warning of 14 reds, 2 new todos, and 1-5 and 4-9 changing.
3. Run the gate in a detached worktree at the candidate SHA (above).
4. Re-run timing tests alone before calling them red (above).
5. **Bundle headroom:** report main JS against 4,194,304 B every release; under 50 KB headroom, apply `lazy-seeds.py`.
6. roadmapcheck needs `--unshallow` and every branch fetched (above).
7. **Once a PR is open, a red gate goes to the PM by send_message at once**, as well as in the note. On 0.9.5 the red was found at
   6:33 PM and Matt merged at 6:34, so the note alone was too slow.
8. **Count new `todo` markers against main** (`git grep -n "todo:" <ref> -- 'src/*.test.ts'`). A new todo is an expected-fail, and Law 5
   forbids it. On 0.9.5 engine-core added 3; the final had none new, but nothing checks it automatically. **A gate for the Critic to
   build:** fail when the candidate has more todo markers than main.
9. funknown.json should be added to knowncheck's LISTS, so a re-record that raises a count fails automatically.
10. The PR body template: reference/qa-reports/0.9.5/PR-BODY.md (what changed in player words; what's merged; the gate table, every
    gate PASS or FAIL; accepted fails with numbers and Matt's acceptance; the §6 table; rough spots; what to check after the merge).

## 5. Open items left on the roadmap from 0.9.5
- R-165.48: 1-1's gentle intro (next week's first fix).
- R-165.49: dead walk.
- R-165.50: nothing bites.
- R-165.51: the stages the lock proves identical that funcheck still moves; the planner proves it's checker-only or fixes it.
- R-165.47: 1-1's proven list at 138, target 300.
- The pad's two old coach lines (CoachOverlay.tsx COACH_TEXT.pad: "Push the pad to run" and "Press Jump"): new words with Matt next
  release. The lead logged it; I don't know its R-id, so the PM should confirm it has one.
- The bundle: 31 KB of headroom (lazy-seeds.py is ready).
