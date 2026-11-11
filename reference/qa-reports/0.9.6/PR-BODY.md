# Release 0.9.6: Into the Canopy, rebuilt (the new 1-1)

**Candidate:** `release-0.9.6` @ `06bbd29f22f791d9f09d6124ab237d1e27f4a76b` (the code every gate below ran on, in a detached worktree at
that SHA). The commit after it adds only this file and the gate logs in `reference/qa-reports/0.9.6/` (no code).
**Matt's word (11-11, 5:34 PM ET):** "I want this released out on the test site, and out on the prod server."

## What changed, in plain words
- **1-1, Into the Canopy, is laid out again** (C1's re-lay): new paths, new pieces, and a different layout from the proven list each
  time you press Play (200 proven layouts, up from 138). A restart or a respawn keeps the same layout.
- **No life is lost in 1-1 on either setting.** A fall sets Pokey back on the ledge he jumped from.
- **Help when he's stuck, only where it gets him through** (helpLadder.ts, counted per piece). After 3 set-backs at one piece, Dot
  says the move it needs (her touch or pad words). On Easy, at 5 a pad tap is a full jump there, and at 8 little steps grow ("Ooh,
  look! A step. Up you go."). On Normal the stage never changes by itself: at 12 Dot asks ("Want a little step? I won't tell
  anyone.") on a painted card; YES grows the steps, NO (or Back) keeps the stage as it is; after a no she asks once more 8 set-backs
  later ("Still want that step? It's yours."), then never again at that piece.
- **The camera follows big bounces and double jumps smoothly** (at most 11 px a step), so the top bar never covers Pokey or the
  ledge he's bouncing up to. Hops are unchanged.
- **The pad's coach lines now say what Dot says** (R-165.57): "Tap the Jump button to leap." and "In the air, hold Jump again for a
  double jump." (a held second Jump reaches 189 px; a tap-tap only 124).
- Silenced in 1-1, words unchanged elsewhere: "No soft moss up here!" (every fall in 1-1 is soft now) and the old stuck helper's
  "This way, Pokey! Try over here." (Dot's help ladder speaks instead).
- What's New (top entry, 0.9.6, the story keeper's words, approved by the lead 5:41 PM ET): "Into the Canopy, rebuilt":
  "Into the Canopy, the first stage, is rebuilt with new paths to explore." / "Play it again and the paths change, so each run is a
  new one." / "Stuck on a jump? Dot can help with a little step up." / "The camera follows Pokey smoothly on his big bounces."
- The testers' page (#ctest) plays 1-1 as Play builds it (since 0.9.5), so after the merge the testers play the new 1-1. Its page code
  is unchanged (one line: 1-3's copy of the fallen trunk reuses the stretch words "the tall steps (double jump)").
- **Nothing else in the game changes:** the lock proves every other stage identical to main (below).
- Every player string changed from main: `reference/qa-reports/0.9.6/player-strings.md`.

## Merged into this branch
- origin/main `181d2846` (0.9.5 + the team docs, #67, #68)
- `t-int-1-1` @ `874f11f6` (the new 1-1; it carries C1 `0fc0835a`, E0a, the help ladder A2, the soft falls A1, the camera fix),
  **PASSED by the Critic**: report `t-critic-int-1-1@98438e6a`, `reference/qa-reports/INT-1-1-critic/REPORT.md`
- Release prep `06bbd29f`: version 0.9.6, the What's New entry, R-165.57's two coach lines

**Removed (new replaces old): nothing needed removing.** Proof: (1) the 0.9.5 picker grep
`grep -rn "pick11() !== 'old'\|skip11Spec\|pickerOn\|wm-pick11\|'Old 1-1'" src` is empty; (2) 1-1 always builds on gen2
(stageGenerator.ts `gen2Roll11` / `builtOnGen2`; the old hand-built path is skipped for 1-1), and `pick11()` is `'play'` outside QA builds
(testlink1_1.ts, unchanged from main); (3) the 15 sections taken out of 1-1 are `parked` (`feel: []`, each with its reason in w1.ts):
in no stage's pool (`stagePool`, all ten World 1 stages: 0) and in no proven seed (0); (4) no new switch, URL flag or stored setting in
the merge (a grep of every added line in src for flags, storage, URL params and toggles: none).

## The gate, on 06bbd29f
Every gate in a detached worktree at `06bbd29f` (11-11, 5:42-6:21 PM ET, 4 CPUs). Logs: `reference/qa-reports/0.9.6/gates/`.

| # | Gate | Exit | Time | Result |
|---|---|---|---|---|
| 1 | `npx tsc --noEmit -p .` | 0 | 4 s | PASS |
| 2 | the full test suite, 3 shards (CLAUDE.md's file list, as deploy.yml) | 0, 0, 0 | 923 / 1,353 / 1,617 s | PASS: 2,562 tests, 2,560 pass, 0 fail, 2 todo (main's two: 4-3's real reach, the 4-x boulder wall). `todo:` markers 3 = main's 3; skips 3 = main's 3 |
| 3 | `npx vite build`, no asset over 4 MiB | 0 | 7 s | PASS: main JS 3,982,950 B (211,354 B under 4,194,304); 0 files over 4 MiB |
| 3b | `node tools/perf/chunkcheck.mjs` (CI=1 FORCE_COLOR=1) | 0 | <1 s | PASS: 11,354 B spare under 3,994,304 |
| 4 | `npm run build:store` | 0 | 4 s | PASS: "Store build check passed: dist has no tracking, ads, collector, service worker or outside addresses." |
| 5 | `node tools/perf/artcheck.mjs` | 0 | 0.1 s | PASS |
| 6 | `node tools/perf/knowncheck.mjs` | 0 | <1 s | PASS vs 181d2846: clipknown 44, playerText.known 4, limits 14, artUse.allow 210 |
| 7 | `node tools/roadmapcheck.mjs` (unshallowed, every branch fetched, CI=1) | 0 | <1 s | PASS (307 open, 45 done) |
| 8 | `node tools/perf/clipcheck.mjs` (CI=1) | 0 | 184 s | PASS (83 known, as main; nothing could not be opened, the help offer included) |
| 9 | `node tools/perf/drawcheck.mjs` (CI=1) | 0 | 285 s | PASS |
| 10 | `npx tsx tools/validate/funcheck.ts` | 1 | 42 s | **FAIL, named** (below), the same totals as main |
| 11 | `npx tsx tools/engine/lockall.ts --layouts 16 --intended 1-1 --check <main's lock>` | 0 | 543 s | PASS: 101/102 stages unchanged, only 1-1 (intended). Main's lock recorded fresh at 181d2846 (3,264 builds) and self-checked 102/102; it equals the branch's `lockall-main-0.9.5.json` build for build. gen2 gained `verdicts`/`drops` (not hashed, E0a option (a)) on 1-1, 5-7, 5-9 and Worlds 6-8 |
| 12 | `node tools/perf/kbdcheck.mjs` (CI=1) | 0 | 111 s | PASS |
| 13 | `node tools/perf/buildcheck.mjs` (CI=1) | 0 | 5 s | PASS: 1-1 p95 91 ms Normal, 74 ms Easy (budget 150 ms at CPU x4) |
| 14 | `npx tsx tools/engine/seedlist.ts 1-1 --check` (also CI=1) | 0 | 73 s / 64 s | PASS: 200 seeds, 0 refused, each clean on both settings |
| 15 | `npx tsx --test tools/inspect/tierBots.test.ts` (also CI=1) | 0 | 16 s / 15 s | PASS 7/7 |
| 16 | every test that pins a 1-1 roll or seed (release.md 6: 6 files) | 0 | 14 s | PASS 20/20 |

On the PR head (this docs commit: `reference/qa-reports/0.9.6/` only), knowncheck and roadmapcheck were run again on its tree (CI=1): both PASS, exit 0 (53 ms, 1.1 s; roadmap 307 open, 45 done).

### funcheck: a named fail, ruled by the lead as 0.9.5's (Matt to accept on this PR)
`FAIL (12 worse or new, 26 to lower or delete; 144 known, 1872 stage-layout flags)`, **the same totals as main 181d2846** (run side by
side). The known list `tools/validate/funknown.json` is untouched (Law 5). What moves against main, all on 1-1 or judged against it:

| Flag | Main (0.9.5) | 0.9.6 | Why |
|---|---|---|---|
| 1-1 Normal "nothing bites" | 12 of 16 layouts | 16 | Matt's rule: no life lost in 1-1 (a fall sets him back) |
| 1-1 Easy "nothing bites" | 8 | 16 | the same |
| 1-1 Easy "pacing" (no gentle intro) | 11 | 12 | R-165.48 |
| 1-1 "dead walk" (both settings) | 16, worst 2.6 s Normal / 2.8 s Easy | 16, worst **4.0 s Normal / 4.2 s Easy at x 140** (the home banks at the start) | named for 1-1's finalize (R-165.49) |
| 1-2 Normal "nothing new" (judged against 1-1) | 14 | 16 | 1-2 itself is unchanged (the lock) |
| 1-1 Normal "repeat" (better) | 13 | 12 | |
| 1-1 Easy "repeat" (still under the known 16) | 9 | 13 | |

Unchanged from main: 1-1 Normal "pacing" 13, 1-2 Easy "nothing new" 14, 1-9 Easy "nothing new" 16, 1-9 Normal "repeat" 15, 1-3 Normal
"repeat" 13, 1-6 Easy "repeat" new on 1 layout. No other stage gains a flag.

## Google Play: PLAY-STORE-RULES §6
The one new screen is Normal's help offer in 1-1 (HelpOffer.tsx, a card over the held stage). Everything else new is in play.

| # | Item | Proof / not checked, and why |
|---|---|---|
| 1 | Nothing under the bars, notch, camera hole or nav bar, both ways, foldable size | clipcheck (gate 8) walks every menu and pop-up at 412x915 and 915x412 on fresh, old and finished saves with the insets set, and now opens the help offer itself (12 real set-backs in 1-1 on Normal, fresh save, both ways). The card pads by `max(12px, env(safe-area-inset-*))` on all four sides (HelpOffer.tsx:76). The Critic rotated with the card up, both ways: whole and on screen. Dot's step-line bubble sits under the top HUD, 0 overlap with the step or Pokey (overlap.mjs, 6 views). **Not checked:** a foldable size (clipcheck has none); a real phone's cut-outs |
| 2 | Back does something sensible on the new screen | Back over the card is a NO, never the pause menu under it: the phone's Back and Escape (HelpOffer.tsx `bindBack`, HelpOffer.test.ts) and a back swipe (App.tsx `onBackSwipe` asks `handleBack()` first). The Critic: Back = no, no stray jump after. **Not checked:** a real phone's Back button |
| 3 | Nothing new is sent off the phone | No `fetch`, XHR, beacon, WebSocket or URL in any added src line (grep of the merge's diff); `npm run build:store` (gate 4): "dist has no tracking, ads, collector, service worker or outside addresses" |
| 4 | Nothing loads from the web; works in airplane mode | No http(s) address added in src; the card's art is bundled (`w1-cut.webp` via `new URL(..., import.meta.url)`, HeroPose, DotFace); build:store as above. **Not checked:** airplane mode on a real phone |
| 5 | Sound stops in the background; nothing keeps the phone awake behind a menu | No audio, wake-lock or visibility code added (grep of the diff). The stage is held while the card is up; the Critic sent the app to the background with the card up (on 996d0c63, an earlier INT head): the pause menu comes up under it. **Not checked:** on a real phone |
| 6 | Leaving, coming back and rotating keeps the place | Rotation with the card up, both ways: the card stays, the stage stays held, the answer works (the Critic). Grown steps are kept for the run; the layout is kept until the next press of Play (testlink1_1.ts, unchanged). **Not checked:** leave-and-return mid-stage on a real phone |
| 7 | No dead ends or placeholder screens in the store build | Nothing needed removing (above): no picker, no switch. The card always answers: YES, NO or Back. clipcheck walks every menu |
| 8 | Saves survive everything | No save change: no `localStorage`, `sessionStorage` or IndexedDB in any added src line, no new key. **Not checked:** the kill-at-the-worst-moment check on a real phone (due before the closed test) |

## Rough spots, named (from the Critic's PASS and the gate)
- **High roads end empty** (R-165.115): the end of every high road on a fork holds nothing on built rolls (test-link seeds A/B/C, both
  settings).
- **No help at the double wall for a player who never falls** (R-165.119): the help ladder counts set-backs, so someone who stands and
  jumps at the double-teach wall without falling hears nothing from Dot for 40 s (the Critic's B-01: the same before and after the old stuck helper was quieted).
- **About 13 hop rocks a stage are walked through** (R-165.122): under the engine's 50 px wall, and the verdicts don't judge hop stumps.
- **The seed fruit sits 5-8 px under the top bar** at the top of a bounce in 5 of 6 bounces (accepted by the lead as named rough).
- **The child bot on Normal needs 13 rescues in 40 runs** (baseline 8).
- **Not seen on a real phone.** Every play check above is headless Chromium at 412x915 and 915x412.

**The bundle:** the main JS file is 3,982,950 B, 211,354 B under the 4 MiB (4,194,304 B) cache limit and 11,354 B under chunkcheck's
budget (3,994,304 B). The next release that grows it needs room first (`reference/qa-reports/0.9.5/lazy-seeds.py` is ready).

## After the merge
1. GitHub actions on the merge commit: "Publish game to the gh-pages branch" (6 test shards + the gates, then publish), "pages build
   and deployment", "Build Sloths Adventure Android APK". The APK doesn't wait for the tests: check the site too.
2. The live title reads 0.9.6; Settings > About > What's New shows "Into the Canopy, rebuilt" on top.
3. The testers' link `https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest` opens the new 1-1 (tap Refresh on the phone:
   the PWA keeps the old copy until a reload).
4. The APK on the Releases page as "Sloths Adventure v0.9.6 (<date>)", tag v0.9.6-<run>.
5. Rebuild Matt's test link (EnK5) from the merge commit.
6. On a real phone, both ways: 1-1 on Easy and Normal; get stuck at a tall step 12 times on Normal and answer the card YES and NO;
   rotate with the card up; press Back with the card up.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FhBbYNQH2E77sZaoHs9zNm
