# Release 0.9.9: World 1's last stretch rebuilt, and World 2 begins at the river

**Candidate:** `release-0.9.9` @ `ab8d5140` (every gate below was run on this exact commit).
**Matt's word:** after playing link #4, "Everything look good. You can push it to prod." (6:44 PM ET 11-15). Then he ruled the designed
2-2 into this release, and asked to deploy to the real game once it's ready, without another test-link play (8:33 PM ET; both relayed by the lead).

## What changed, in plain words
- **1-6 First Lianas** is rebuilt on the new stage engine: new swings, and her petals laid in arcs that show where to jump.
- **1-7 A Very Good Bush** is rebuilt: the eagle screams, Pokey hides in the green and keeps still. Then the eagle lands and looks
  around, and he moves only while it looks away.
- **1-8 The Long Branch** is rebuilt: the branch collapses behind Pokey as he runs, with still forks to rest on, the painted bough
  and palms, nuts and fruit. It ends at Meeca's mark on the far tree.
- **World 2 begins. 2-1 Down to the River** (new): drifting logs that knock as they come out from the bank, a shallow teaching river
  (a splash sets him back, no heart lost), deep water (a heart), and the sloth village dug into the riverbank at the end.
- **2-2 Petals for the Crown** (new, designed): lily pads that sink while he stands on them and come back up, pads that rise and fall
  on their own, a stone spur and rope, and the giant crown lily where he can finally stand still.
- The old hand-built 1-6, 1-7, 1-8, 2-1 and 2-2 are deleted (new replaces old).
- Easy stages are now built and judged on Easy's own slower swing (R-165.251), so a few hand-built stages' Easy layouts change (below).
- What's New (top entry, 0.9.9, "Down to the river"): approved by the lead and passed by the story keeper:
  1. First Lianas is rebuilt: new swings, and petals that show me where to jump.
  2. A Very Good Bush: I hide in the green, and only move while the eagle looks away.
  3. Run! The old limb gives way behind me now, all the way to the far tree.
  4. World 2 begins! New stage, Down to the River: the trees stop, and the river is my road.
  5. Listen for the knock: a drifting log is coming to carry me.
  6. Shallow water just splashes me back. Deep water costs a heart, so I stay on the logs.
  7. At the end, a whole village of sloths lives right in the riverbank.
  8. New stage, Petals for the Crown: lily pads sink if I stand, then come back up.

## Merged into this branch (merges, never rebased)
- origin/main `73e7bed0` (0.9.8)
- `t-int-11` @ `90297717` (link #4 Matt played: 1-6, 1-7, 1-8, 2-1; INT-11's report `reference/qa-reports/INT-11/REPORT.md`)
- `t-fix-22` @ `a1acbbe2` (the designed 2-2, which already holds t-int-11; FIX-22's report `reference/qa-reports/FIX-22/REPORT.md`)
- `t-fix-22b` @ `df1715ea` (2-2's ground draw fix, on top of a1acbbe2; the lead judged the diff and the stills)
- release prep: version 0.9.9 and the What's New entry (3 commits on top of the merges). Nothing else.
- Checked for what shouldn't ship: no STOPGAP in src. One dev-only toggle ships in the code: `?fixture=chase` (App.tsx), but
  `chaseFixtureConfig()` returns null unless `import.meta.env.DEV` (chaseFixtureStage.ts:48-56), so the shipped build never opens it.
  The test link's inline-files change is in tools/testlink only.

## The gate, on ab8d5140 (run as CI runs them: CI=1 FORCE_COLOR=1)
| # | Gate | Result |
|---|---|---|
| 1 | `npx tsc --noEmit -p .` | PASS |
| 2 | the full test suite (CLAUDE.md list, 6 shards as deploy runs it) | PASS: 3786 pass, 0 fail (2 TODO, the same 3 `todo:` markers as main) |
| 3 | `BASE_PATH=/Sloths-Adventure-/ npx vite build` + `chunkcheck.mjs` | PASS: 60 JS files, every one under the 3,994,304 B budget; largest cast 1,784,668 B, main index 727,747 B (3,266,557 B spare) |
| 4 | `npm run build:store` | PASS: "dist has no tracking, ads, collector, service worker or outside addresses" |
| 5 | `artcheck.mjs` | PASS |
| 6 | `knowncheck.mjs` | PASS (vs 73e7bed0: clipknown 44, playerText.known 4, limits 14, artUse.allow 210, generality.known 26 (1 fewer), ciTests.known 16 (1 fewer); new list coverage.known 7) |
| 7 | `clipcheck.mjs` | PASS (83 known, list unchanged) |
| 8 | `drawcheck.mjs` | PASS, every stage both ways. 2-2 sideways x9388 was 8.18 > 7.5 on the first candidate (6cec5bf8); fixed at its root in t-fix-22b (protoArt.ts: a sheet arriving in play no longer throws the baked ground squares away; 8.18 -> 5.70; planted in groundSeams.test.ts) |
| 9 | `generalitycheck.ts` | PASS |
| 10 | `roadmapcheck.mjs` | PASS |
| 11 | `coveragecheck.ts` (new in CI with 2-2) | PASS |
| 12 | `funcheck.ts` | **FAIL, named and accepted by Matt** (below) |
| 13 | `lockall.ts --layouts 16` vs main 73e7bed0, and vs t-int-11 with `--intended 2-2` | vs t-int-11: PASS, 101/102 unchanged, only 2-2. vs main: 46 moved, every one intended (below) |
| 14 | `kbdcheck.mjs` | PASS (planted failure goes red as it must) |
| 15 | `buildcheck.mjs` | PASS: Normal p95 132 ms, Easy p95 71 ms (budget 150 ms, CPU x4) |
| 16 | `seedlist.ts <stage> --check` for every listed stage (registrycheck --lists) | PASS: 1-1 (161), 1-2, 1-3, 1-4, 1-5 (150), 1-6, 1-7, 1-8, 2-1, 2-2 (100 each), each clean on both settings |
| 17 | `registrycheck.ts` | PASS (10 stages, each registered everywhere) |
| 18 | `tipwalk.ts --layouts 4` | PASS |
| 19 | CI's tool-test line (gates.yml:97, every file) | PASS: 212 pass, 0 fail (1 TODO, the chase child bot, as before) |
| 20 | `tierBots.test.ts` | PASS: 7/7 |

Logs for every gate: branch `release-0.9.9-notes`, `reference/qa-reports/0.9.9/gates-ab8d5140/` (with the earlier candidates' runs beside it).

### funcheck: a named, accepted fail (Matt ACCEPTED, 7:47 PM ET 11-15: "Ship, fix variety next"; relayed by the lead)
`FAIL (34 worse or new, 53 to lower or delete; 135 known, 1759 stage-layout flags)` on ab8d5140, the same set as on the first candidate. funcheck is advisory (not in CI) and **red on main too** (73e7bed0, the same tool: 25 worse or new, 46 to lower).
Same as 0.9.7 (STATE.md:842). The known list `funknown.json` is **not** lowered or re-recorded (Law 5). What this release adds over
main's reds: 11 flags, all on the three rebuilt World 1 stages (2-2 adds none):
- 1-6 Normal "repeat" (new, 14/16: "JVJ" 3 times back to back), Normal "nothing bites" (known 1 -> 16), Easy "repeat" (new, 16/16).
- 1-7 Normal and Easy "repeat" (13 -> 16: "FjJJ" 4 times), Normal "like an earlier stage" (2 -> 6: 58% like 1-2), Easy "like the stage
  before" (1 -> 16: 68% like 1-6), Normal and Easy "nothing new" (new, 16/16).
- 1-8 Normal "like the stage before" (new, 13/16: 54% like 1-7), Easy the same (new, 16/16: 60%), Easy "like an earlier stage" (new,
  11/16: 75% like 1-6).
It also clears 1-9's "nothing new" on both settings, and 53 entries are now lower or gone (1-1 and 1-2's padding and template repeat,
1-4's dead walk, padding and repeat, 1-5's enemy by a landing, and more). **The variety pass on 1-6/1-7/1-8 is next: R-165.276.**

### The lock (lockall --layouts 16)
- **vs t-int-11 @ 90297717 (link #4), `--intended 2-2`:** 101/102 unchanged; only 2-2 moved (the designed 2-2, intended).
- **vs main 73e7bed0:** 56/102 unchanged, 46 moved, all intended (the lead's ruling, 7:27 PM ET):
  - the rebuilt and new stages: 1-6, 1-7, 1-8 (gen2, the hand-built ones deleted), 2-1, 2-2 (World 2's kit);
  - 33 more that are link #4's moved set, already checked and accepted at INT-11 (INT-11's lock `lockall-2-vs-main.txt`, "link #4's
    moved set exactly"; 1-1 to 1-5's seed lists --check PASS here): 1-1, 1-2, 1-3, 1-4, 1-5, 3-8, 5-4, 5-7, 5-9, 6-1, 6-2, 6-3,
    6-4, 6-5, 6-6, 6-7, 6-8, 6-9, 7-1, 7-3, 7-5, 7-6, 7-7, 7-9, 8-1, 8-2, 8-3, 8-4, 8-5, 8-6, 8-8, 8-9, 9-4;
  - **Easy only, R-165.251** (Easy built and judged on Easy's own slower swing): 9-3, 10-3, 10-6 (in INT-11's 41) and 4-4, 9-5, 9-9, 10-1, 10-7. Those last five move only on layouts 3-16, which INT-11's 2-layout run never built. **Proven by revert:** undoing the two `withSetting` wraps (stageGenerator.ts generateStage, easyMode.ts easyStage) makes all 8 match main (8/8); Normal is unchanged on all of them; main against its own lock 8/8.

## Google Play: PLAY-STORE-RULES §6
| # | Item | Proof / not checked, and why |
|---|---|---|
| 1 | Nothing under the bars, notch, camera hole or nav bar, both ways, foldable size | Menus: clipcheck PASS (every menu screen and pop-up, upright and sideways, fresh/old/finished saves, insets set; 83 known, list unchanged). No new screen or component: the only component changes are DotGuide.tsx (a locked exit's line said at once) and hud/goalInfo.ts. In play: drawcheck walks every stage both ways. **Not checked:** a foldable size (clipcheck has none); in-play stills of 2-2 were FIX-22's (its REPORT), not re-shot here |
| 2 | Back does something sensible on the new screen | No new screen. No back or popstate code added (grep of the src diff) |
| 3 | Nothing new sent off the phone | build:store PASS: "dist has no tracking, ads, collector, service worker or outside addresses". No fetch, sendBeacon, XHR, WebSocket or URL added in the src diff |
| 4 | Nothing loads from the web; airplane mode | As 3: no outside address in the store build, no new URL in src. **Not checked:** airplane mode on a real phone (no phone in the container) |
| 5 | Sound stops in the background; nothing keeps the phone awake | No visibility, wake-lock or audio-context code added. The one audio change is the log's knock level (sfxRec.ts KNOCK_DB: -9 dB Normal, -3 dB Easy) |
| 6 | Leaving and coming back (and rotating) keeps the place | No change to save, resume or rotation code (no storage key added in the src diff); new stages restart from their flags like every gen2 stage. **Not checked:** rotation and leave-and-return mid-stage on 2-1/2-2 on a real phone |
| 7 | No dead ends or placeholder screens in the store build | The hand-built 2-1/2-2 placeholders are replaced by the built stages; clipcheck walks every menu; the dev fixture is off in a shipped build (above) |
| 8 | Saves survive everything | No save format change (no new storage key). The suite's old-save fixtures (0.9.5 mid and after-5M) pass. **Not checked:** kill-at-the-worst-moment on a real phone (due before the closed test) |

## Rough spots, named
- **2-2's pickups are pink:** there is no painted non-pink pickup yet (next release). The story keeper asked that the crown flowers not
  be pink (lines-2-2.md); they still are.
- **A pale strip** below the waterline at the foot of 2-2's spur far bank (FIX-22, not fixed).
- **funcheck** red, accepted by Matt (above): 11 new variety flags on 1-6/1-7/1-8, next job R-165.276.
- **2-2 kid bot, Normal: 38/40** (the KID quirk, ruled by the lead); every calibrated tier 40/40 on both settings (FIX-22).
- 1-8 child bot, Normal: 36/40, traced (INT-11: stuck at a 53 px drop, falls back 8 times), accepted for 1-8's polish pass.
- 2-1's bank band at x2300 (INT-11, unresolved). No bamboo bounce in World 2 yet (the story keeper's World 2 bounce). Vine fall-through
  R-165.271 is still open.
- The test link was not re-played on this exact head before the PR: Matt asked to deploy without another test-link play (8:33 PM ET).
- `tools/difficulty/coverage.known.json` arrives with 2-2's coveragecheck gate as a new 7-entry known list (a new gate may start with
  its existing misses, law 5; the list only shrinks).

## After the merge
Check "Publish game to the gh-pages branch" (6 test shards + gates), "pages build and deployment", and "Build Sloths Adventure Android
APK" (the APK on the Releases page as v0.9.9-<run>). The live title should read 0.9.9; tap Refresh on the phone (the PWA keeps its cache).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FhBbYMxSGdfHZDBjedQhFx
