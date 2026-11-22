# INT-R4: release 3's final candidate (release-0.10.2), the fallback first

Packet: reference/packets/2026-11-22/INT-R4.md. Integration, a fresh member. Started 2:07 PM ET 11-22 (by `date`); box to 2:35 PM ET.
NO PR (it waits for Matt's "push").

## EXACT NEXT STEP
RUN 1 IS DONE on the code head 5d8a7eb79: every gate PASS but funcheck (the ruled debt: fundiff IDENTICAL 22/22, carried) and roadmapcheck
(red on 5d8a7eb79: R-165.386's row cites R-165.379, which had no row on the release). Fixed by carrying R-165.379's row VERBATIM from the
lead branch in 15d518c1a (reference/ROADMAP.md only); roadmapcheck PASS on 15d518c1a. Since 5d8a7eb79 only reference/ files changed
(`git diff --stat 5d8a7eb79 HEAD` names nothing outside reference/), so every other verdict holds for the final head.
RUN 2 (the suite alone) is RUNNING on frozen /home/user/frz4 = 5d8a7eb79 (reference/qa-reports/INT-R4/tools/run2.sh, background,
timeout 7,200,000 ms; about 31 min by INT-R3's time). Next, in order:
1. When run 2 ends: its line in the scratchpad's fs/fullset.txt and the TAP totals of fs/g-suite.log go in the table below. 0 fail = the
   fallback candidate is GREEN; any fail is a red (bisect, root cause, or the lead with options).
2. Hand the lead the final head (the release-0.10.2 tip) + this table: the lead builds Matt's EnK5 test link from it and asks Matt for "push".
3. If the lead says t-build-26 is FINAL: packet step 4 (merge origin/t-build-26 into release-0.10.2, tsc + the CI tool line, 2-6/1-4 What's
   New lines to the lead first, THE FULL SET again + lockall --intended 2-3,2-6,1-4 + castBots 2-6/1-4 vs t-build-26's final rows + seedlist
   --check on every list). If the lead says the checkpoint is missed, this fallback IS release 3.
No PR: it waits for Matt's "push".

## What merged (MERGED never rebased; tsc + the CI tool line after each, D92)
| # | Branch at hash | Merge commit | tsc | CI tool line |
|---|---|---|---|---|
| 0 | base release-0.10.2 aa27fcf80 (code e5eecab9a: main 2a87f4cda + t-ui-372 01cc35139 + t-art-next 4f0853b96) | aa27fcf80 | - | - |
| 1 | origin/t-art-next at **8feca1123** (the lead's ruling; adds R-165.379's sheet grades: rope, swim, vine, climb2, studies, atlas real mean, story kept original; herobody band ratchet) + R-165.386's ROADMAP row copied verbatim from origin/ccr-ea739a2f-dfcee4 | 5b65495ae | PASS | PASS (351 tests, 350 pass, 0 fail, 1 todo: the chase-bots child, as INT-R3) |
| 2 | version bump 0.10.1 -> 0.10.2 + What's New 'Walk them home' (4 lines, the lead's 'words ok') | 5d8a7eb79 | (in THE FULL SET) | (in THE FULL SET) |

## Conflicts and how each was resolved
| Merge | File | Kind | Resolution |
|---|---|---|---|
| 1 | none | - | the merge was CLEAN (reference/art/CATALOG-MASTER.csv auto-merged). Then `python3 -I tools/art/hfnext/catalogclips.py <all 18 clips>`: 9573 -> 9573 rows, no change; `python3 -I tools/art/catalog_master.py --emit`: no inventory file changed; inventory.test + heroClips*.test: 30/30 pass (pinned count unchanged, nothing to re-measure). |

## What's New (lead-approved, 2026-11-23)
Title 'Walk them home':
1. New stage: Stuck in the Reeds. I free the little ones and lead them home past the heron.
2. If a little one runs off the screen, an arrow with its face points the way.
3. I look the same in every move now: the same soft fur, climbing, swimming or swinging.
4. When I cheer, no ghostly second sloth shows behind me.

## THE FULL SET on 5d8a7eb79 (frozen worktree /home/user/frz4; main frozen at /home/user/frzm 2a87f4cda)
Run 1 = INT-R3's tools/fullset.sh without the suite, plus fundiff, castcmp, npm run build:store and the slot confirm; run 2 = the suite alone.
Scripts and logs: the scratchpad copies are reproduced in reference/qa-reports/INT-R4/tools/.
| Gate | Verdict | Notes |
|---|---|---|
| tsc | PASS | 3 s |
| CI tool line | PASS | 280 s; 351 tests, 350 pass, 0 fail, 1 todo (the chase-bots child, as INT-R3) |
| artcheck | PASS | 13 known sheets over 4096 (limits.json), no new |
| vite build (BASE_PATH=/Sloths-Adventure-/) | PASS | 5 s |
| chunkcheck | PASS | |
| knowncheck | PASS | no list gained an entry; heroBody.known.json is a new list (2 rows: studies, story = R-165.386), not on main yet |
| generalitycheck | PASS | 26 literals, 26 known |
| coveragecheck | PASS | 63 s; 15 built stages, 30 pieces, 5 known gaps |
| **roadmapcheck** | **FAIL on 5d8a7eb79, PASS on 15d518c1a** | red: `ROADMAP.md:762 points at R-165.379, which is not defined`. Fix: R-165.379's row carried verbatim from the lead branch (15d518c1a, ROADMAP only); re-run PASS |
| timecheck | PASS | |
| registrycheck | PASS | 49 s; 14 stages registered everywhere, 14 lists |
| drawcheck | PASS | 703 s |
| clipcheck | PASS | 420 s; 83 known, no new |
| kbdcheck | PASS | 115 s; the planted red still goes red |
| lockall vs main 2a87f4cda --intended 2-3 | PASS | lockbase 114 s + check 112 s; 101/102 stages unchanged; only 2-3 moved (intended) |
| castBots 2-3 seeds 1-40, both settings, every tier, vs BUILD-23e | PASS, IDENTICAL | 211 s; castcmp.py vs reference/qa-reports/BUILD-23/castbots23e-rows.jsonl: **ROWS DIFFERING 0 of 360**. Passes: adult 39/40 normal, 40/40 easy; child, middle 40/40 both; expert 40/40 normal; kid 0/40 both (as BUILD-23e: the shrine, its known open item) |
| tipwalk --layouts 4 | PASS | 15 s |
| every registered seed list --check | PASS | 2529 s; 14 lists: 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 2-1 2-2 2-3 2-4 2-5 |
| paintcheck 0/3, 1/3, 2/3 | PASS x3 | 283 s / 375 s / 359 s; 170 / 107 / 106 known ids seen, 0 new |
| tierBots | PASS | 181 s; 9/9 |
| **funcheck** | **FAIL, ruled debt, carried** | 83 s; 22 worse/new, 0 to lower, 77 known, 1067 flags. `fundiff.sh`: **IDENTICAL 22/22** to INT-14's ruled debt on main (as INT-R3) |
| buildcheck (alone) | PASS | 1-1 p95 106 ms normal, 62 ms easy (budget 150 ms at CPU x4) |
| npm run build:store | PASS | store build check: no tracking, ads, collector, service worker or outside addresses |
| slot confirm (tools/slotconfirm.mjs) | PASS | 95 s; Normal + Easy, upright + sideways: all 4 'gone' frames n = 0 (marker gone), faces duck:open, otter:spooked, capy:open. The otter's 'spooked' face IS the stage's own state at that frame: each 'gone' line reads `otter:spooked@<x>` (e.g. normal upright `otter:spooked@5620`), not the marker's. Looked at normal-gone-upright: marker gone, the otter back on screen at the left by the reeds, its HUD slot keeps the amber '!'. In the 'gone' frames the duck and capybara HUD slots have grey rings where the 'left' frames have green: **JUDGED BY THE LEAD, BY DESIGN, not a defect** (followFaces.ts, the 11-20 HUD ruling: 'open' is dim = out in the open where the heron's look would see it; 'hid' is lit green = hiding still in a reed clump; in 'left' the duck and capybara sit in reeds, in 'gone' they stand in the open by Pokey). Stills: reference/qa-reports/INT-R4/slot/ (Normal, gone and left, upright and sideways, 2x) |
| **the unit suite (run 2)** | RUNNING | on frozen 5d8a7eb79 |

## PLAY-STORE §6 (the check before a merge)
This release adds no screen, menu, sound, save, setting or network call beyond 2-3 (on main's frame since INT-R3) and art regrades: §6 items
1, 7 ride on clipcheck and build:store (in THE FULL SET); 2-6 and 8 unchanged code paths (no new screen, no save change: whatsNew.ts and
package.json are the only non-art src changes in this member's commits); filled with each gate's verdict at hand-over.

## Lessons applied
D40 (no patching of what is replaced: nothing fixed on this head), D92 (tsc + the CI tool line right after the merge), D102 (read lean),
D111 (box from `date`, 2:07 PM ET start), D113/D122 (every long run backgrounded with a fitting timeout; THE FULL SET in two runs),
D115 (the gate run reads frozen /home/user/frz4 only; edits and this REPORT on /home/user/rel4), D119 (no heredoc in a commit chain),
D120 (the question to the lead did not end the box).
