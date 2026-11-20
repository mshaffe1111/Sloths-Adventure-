# Release 0.10.0 "Across the river" (PR body draft; the lead opens the PR on Matt's "push")

**Matt's test link (play the candidate first):** https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb
(the lead republishes it from this branch's head before the PR; test link #3 was t-int-14, which is this branch less the version
and What's New commit)

Branch `release-0.10.0` = main 6e7b85f8 + t-int-14 @ ca74f4fa (merged as a fast-forward: main is already in t-int-14) + one commit
b5b0e019 (version 0.9.9 -> 0.10.0 and the What's New entry). Gates ran on b5b0e019; the commits after it add only this folder
(reference/qa-reports/REL-0.10.0/).

## What changed (the What's New lines, as players read them)
- The Boa’s Branches is rebuilt: boas snap at what moves, so I keep still and outsmart them.
- Over the Water is rebuilt: vines to logs, logs to vines, all the way across the river.
- The fallen logs and stones in the forest are painted now, flat on top where I stand.
- First Lianas and A Very Good Bush mix it up: fewer repeats, more kinds of climbs and hops.
- Petals for the Crown: the lily pads are bigger, and a quick tap is a little hop.
- If I fall in at Petals for the Crown, I come back safe on a pad.
- The river king’s crown is water hyacinths now: the petals I gather for it are purple.
- The riverbanks are solid rock and soil now.

## What is merged in (every merge on the way from main, oldest first, one line each)
INT-12 (t-int-12):
- t-eng-24 @ b0e94c85 (3cf7614e): 2-4's liana engine pieces.
- t-art-22p @ 877f12f6 (17c65361): 2-2's water hyacinths and its HUD petal, World 2's drifting petals, the seed-list CI matrix.
- t-build-19 @ 2097adf7 (adb5392a): 1-9 built on the new level builder (ENG-19b, the petals rule, the flee rule).
- t-var-1 @ c7648f35 (8f209501): 1-6 and 1-7 variety (distinct rests and walked ground, kit sweepers); 1-8 back to main's.
INT-13 and INT-13b (t-int-13):
- t-gate-292 @ 65a5fc21 (4fd05d11): paintcheck, the painted-block size gate (3 CI parts, shrink-only known list).
- t-time-168b @ de3539c7 (b69ca274): timecheck, the clock-stamp gate.
- t-eng-23 @ 9e306581 (01349f90): 2-3's followers (engine only: 2-3 is unchanged from main, lockall).
- t-eng-25b @ 73318234 (ec32943c): 2-5's snap stones and snapper rows (engine only: 2-5 is unchanged from main).
- t-eng-26 @ 64acd5f5 (e7479340): the water wheel (engine only: 2-6 is unchanged from main; a test hook ?fixture=wheel shows it).
- t-meter-4 @ 8dd661d0 (05589645): 2-3's difficulty meter channel.
- t-art-w2a @ 4f664fde (522cf4b4): 2-3's painted follow poses.
- t-art-w2b @ c877623e (baf5d277): 2-6's painted water wheel.
- t-eng-285 @ b84163d6 (29865500): the judges and bots fly the engine's own Pokey.
- t-fix-284 @ d85be1eb (e95bed18): 2-2's big pads, the real tap hop, the put-back on a pad.
- t-build-24c @ 98261a27 (f993eb31), then @ 92dfd78e (cc8c0e97): 2-4 built (BUILD-24/24b/24c/24d/24e), the solid river banks.
INT-14 and INT-14b (t-int-14):
- t-paint-292 @ 05cebafa (d8f3aeb8): World 1's painted log planks and stones.
- t-eng-noise @ c59928a4 (d1a51eeb): one noise channel the cast hears (no shipped stage moves).
- t-eng-prowl @ 33e43c57 (4d5e0554): the prowlers' look up and leap (no shipped stage casts one).
- t-eng-small3 @ 9b1767f9 (acd0046c): tierBots replays all 200 runs, threat dial ids, Grandma's things named by the things placed.
- t-eng-25c @ d13ebdaa (bdee80c8): 2-5's snap-stones level pieces (2-5 not laid; unchanged from main).
- t-var-19 @ b38d9efb (f4979d03): 1-9's variety (VAR-19f).
- t-eng-24e @ b6d15a11 (73717be8): 2-4's tail, logs as wood, the deep-water line, reeds, the bank face solid (ENG-24g + 24h).
- t-gate-flake @ 68b176b8 (453b69c2): clipcheck/buildcheck load flakes fixed, paintcheck parts 0-2 (an empty part fails).

## Gate table (THE FULL SET, gates.md D96, each once on b5b0e019)
GATE_TABLE

## Play Store check (PLAY-STORE-RULES §6, all 8)
| # | item | proof, or "not checked, and why" |
|---|---|---|
| 1 | Nothing tappable or readable under the status bar, notch, camera hole or nav bar, both orientations, a foldable size | clipcheck CLIP_V: every menu screen and pop-up at 412x915 and 915x412, fresh / old / finished saves, fails a tap target inside the insets. In play, every changed stage draws both ways (drawcheck DRAW_V). **Foldable size: not checked** (clipcheck has no foldable viewport); no menu screen changed in this release (src/components: the HUD counter's petal icon and one stage clue's words only). |
| 2 | Back does something sensible on the new screen | **No new screen in this release** (diff of src/components and src/App.tsx vs main: the HUD icon, a clue's words, a test hook). Back was not re-checked on a phone. |
| 3 | Nothing new is sent off the phone | npm run build:store STORE_V ("dist has no tracking, ads, collector, service worker or outside addresses"); no fetch, XMLHttpRequest, http(s) address or navigator call added anywhere in src (grep of the diff vs main). |
| 4 | Nothing loads from the web; works in airplane mode | build:store STORE_V (no outside addresses); every new picture is bundled under src/assets (artcheck ARTV, vite build). **Airplane mode on a real phone: not checked** (no phone here). |
| 5 | Sound stops in the background; nothing keeps the phone awake | No audio, lifecycle or wake code changed (no AudioContext, visibilitychange, App listener or wake lock added; grep of the diff vs main). **Not re-checked on a phone.** |
| 6 | Leaving, coming back and rotating keeps the player's place | No save, resume or lifecycle code changed: of the files that read or write saved data, App.tsx gained the test hook, protoStage.ts changed only level-building lines (its golden-seed save at line ~5765 is untouched) and movesJournal.ts only 1-9's page-opening rule; no saved key or shape changed. Every changed stage plays upright and sideways (drawcheck DRAW_V). **Not re-checked on a phone.** |
| 7 | No dead ends or placeholder screens in the store build | No new screen. build:store STORE_V. Named: a test hook `?fixture=wheel` (shows 2-6's water wheel before 2-6 is built) joins the existing `?fixture=chase`; it opens only from a web address, and the store app has no address bar. |
| 8 | Saves survive an update, the phone killing the app, a crash mid-stage, a full phone | No save format change (above); clipcheck walks old and finished saves CLIP_V. **The "kill it at the worst moment" check on a real phone: not checked** (no phone in this container; Matt's phone check before the closed test). |

## Rough spots, named (not fixed in this release)
- **1-6 and 1-7: a small grass tab under the painted stone blocks' foot.** It is on main too (71 on main's 1-6). R-165.344, fixed
  next release.
- **Soil tone seams:** on 1-6 the soil under neighbouring ground blocks is shaded differently, a faint vertical tone seam (L0 x5977,
  L1 x6532); under each river bank face (2-1 x8483, 2-4 x28856) the river bed's soil meets the bank's soil in a faint straight
  vertical tone step in the deep soil. R-165.324 / R-165.345.
- **funcheck FAIL: 22 flags, all present before this release, ruled by the lead 11-20 1:38 PM ET** (the table below; one is on a stage
  this release changed, 1-6). The known list was only lowered (104 -> 77), never raised. FUNCHECK_TABLE

## What to check after the merge (reference/methods/release.md "After the merge")
1. GitHub Actions on the merge commit, three runs green: "Publish game to the gh-pages branch" (the suite in 6 shards + every gate,
   then publish), "pages build and deployment", "Build Sloths Adventure Android APK".
2. The APK workflow does not wait for the tests: the APK on Releases does not mean the site is live. Check both.
3. If the publish fails: get_job_logs (failed_only) names the failing test; fix it in a small follow-up PR from main.
4. The live title shows 0.10.0 and What's New shows "Across the river"; the testers' #ctest link opens the new build. Matt taps
   Refresh on his phone (the installed web app keeps the old copy until it reloads).
5. Rebuild Matt's test link (EnK5) from the merge commit.
6. Give Matt the live link, the testers' link and the Releases entry (the APK v0.10.0-<run>). Never push a v* tag by hand.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FhBbYMr249gMgimBmB46qB
