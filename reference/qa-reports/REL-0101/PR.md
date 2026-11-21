# Release 0.10.1 "Count to four" (PR body draft; the lead opens the PR on Matt's "push")

**Matt's test link (play the candidate first):** https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb
(the lead republishes it from this branch's head before the PR)

Branch `release-0.10.1` = main 107870f5 + six merges (below, MERGED, never rebased) + one commit (version 0.10.0 -> 0.10.1 and the What's
New entry). THE FULL SET ran on GATED_HEAD; the commits after it add only reference/qa-reports/REL-0101/.

## What changed (the What's New lines, as players read them)
Title: **Count to four**
1. River Snappers is rebuilt: the stones bite on four, so I hop off before four.
2. The snappers snap on four too. Right after one snaps, a kick sends it home.
3. No snapper is ever hurt: a kicked one just hurries off, grumpy.
4. The river’s rocks come in three painted shapes now, and no two in a row look alike.
5. The ground under the forest’s stones and stumps is tidy now, with no stray grass.
6. When I stand still to yawn, wave or scratch, I stay solid: nothing shows through me.
7. The riverbanks grow painted flowers and plants now, in place of the old bright stems.

Also in, with no What's New line (the lead's rulings): the testers' page (#ctest) plays all of World 1 from a stage picker; Matt's test link
gets room again (408 files of 480); HUD_VINE_LINE PICK_THUMBS_LINE

## What is merged in (oldest first)
MERGE_TABLE

## Gate table (THE FULL SET, gates.md D96, each once on GATED_HEAD)
GATE_TABLE

## CI's own time limits (release.md 4b, D99)
D99_TABLE

## Play Store check (PLAY-STORE-RULES §6, all 8)
| # | item | proof, or "not checked, and why" |
|---|---|---|
| 1 | Nothing tappable or readable under the bars or notch, both ways, a foldable size | clipcheck: CLIP_VERDICT (every menu screen and pop-up, upright and sideways, fresh / old / finished saves; the testers' page picker is in its walk, tools/perf/clipcheck.mjs gained it in PICK-W1) |
| 2 | Back does something sensible on the new screen | No new screen: the stage picker is a row of tiles on the testers' existing front page (#ctest only, not reachable from the game's menus); the end page's "Pick another level" returns to it (clipcheck walks both) |
| 3 | Nothing new is sent off the phone | npm run build:store: STORE_VERDICT; the diff adds no fetch, XHR, socket, beacon or outside address in src/ (grep of the added lines) |
| 4 | Nothing loads from the web; works in airplane mode | build:store STORE_VERDICT (no outside addresses); every new picture is bundled under src/assets (artcheck ART_VERDICT) |
| 5 | Sound stops in the background; nothing keeps the phone awake | No audio, lifecycle or wake code changed (no AudioContext, visibilitychange or wakeLock in the added lines; src/audio untouched) |
| 6 | Leaving, coming back and rotating keeps the player's place | The game's save code is unchanged. The testers' page remembers its picked stage in localStorage (`sloth_qa_ctest_stage`, `sloth_qa_ctest_played`, both registered in storageKeys.test); a fresh phone starts on 1-1 |
| 7 | No dead ends or placeholder screens in the store build | build:store STORE_VERDICT; the testers' page is behind #ctest |
| 8 | Saves survive an update, the phone killing the app, a crash mid-stage, a full phone | No save format change; two new testers'-page keys only (above); clipcheck walks old and finished saves: CLIP_VERDICT |

## Rough spots, named (not fixed in this release)
- funcheck: FUNCHECK_LINE
- Pokey's idle clips: a second face shows for about 3 frames at each clip's ends, and doze's standing ghost stays: the art's, R-165.354
  (FIX-IDLE fixed the see-through body only; the What's New line names only that).
- World 2's front reed layer (`front: 'reed'`) and the drooping sway are still code-drawn (not in ENV-W2's packet).
- 2-5's flag sockets are dead on a rolled stage (BUILD-25d's pushback, carried).
- Matt's test link downloads more up front (title 42.8 -> 50.1 MB, LINK-ROOM's measure): the price of the 72 free files.

## What to check after the merge (reference/methods/release.md "After the merge")
1. GitHub Actions on the merge commit, three runs green: "Publish game to the gh-pages branch" (the suite in 6 shards + every gate,
   then publish), "pages build and deployment", "Build Sloths Adventure Android APK".
2. The APK workflow does not wait for the tests: the APK on Releases does not mean the site is live. Check both.
3. If the publish fails: get_job_logs (failed_only) names the failing test; fix it in a small follow-up PR from main.
4. The live title shows 0.10.1 and What's New shows "Count to four"; the testers' #ctest link opens the new build with its stage picker.
   Matt taps Refresh on his phone (the installed web app keeps the old copy until it reloads).
5. Rebuild Matt's test link (EnK5) from the merge commit.
6. Give Matt the live link, the testers' link and the Releases entry (the APK v0.10.1-<run>). Never push a v* tag by hand.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FhBbYN2CVHnFXg7XzqKXpM
