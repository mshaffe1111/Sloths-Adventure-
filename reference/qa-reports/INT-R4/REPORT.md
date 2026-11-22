# INT-R4: release 3's final candidate (release-0.10.2), the fallback first

Packet: reference/packets/2026-11-22/INT-R4.md. Integration, a fresh member. Started 2:07 PM ET 11-22 (by `date`); box to 2:35 PM ET.
NO PR (it waits for Matt's "push").

## EXACT NEXT STEP
THE FALLBACK release 3 candidate is 5d8a7eb79 on release-0.10.2 (pushed). THE FULL SET on it is RUNNING (background, frozen /home/user/frz4;
main frozen at /home/user/frzm 2a87f4cda): run 1 = everything but the suite (log lines in the scratchpad's fs/fullset.txt, copied into the table
below as each verdict lands), then run 2 = the suite alone (reference/qa-reports/INT-R4/tools/run2.sh /home/user/frz4, run_in_background,
timeout 7,200,000 ms). In order, whoever holds this next:
1. When run 1 ends: fill the table from fullset.txt; funcheck is judged by the fundiff line (IDENTICAL 22/22 or a red); castcmp23 by
   'ROWS DIFFERING 0 of 360'; lockall by its intended-only verdict (2-3); slotconfirm by 'SLOT CONFIRM PASS' plus a look at the 'gone'
   stills (the otter's 'spooked' face is the stage's own state at that frame, not the marker's). Then start run 2 (the suite alone).
2. roadmapcheck: R-165.386's row now rides in the merge (5b65495ae), so its INT-R3 red should clear; any other red is a red.
3. Hand the lead the head + table. If the lead says t-build-26 is FINAL: packet step 4 (merge origin/t-build-26 into release-0.10.2, tsc + the
   CI tool line, 2-6/1-4 What's New lines to the lead first, THE FULL SET again + lockall --intended 2-3,2-6,1-4 + castBots 2-6/1-4 vs
   t-build-26's final rows + seedlist --check on every list). If the lead says the checkpoint is missed, 5d8a7eb79 IS release 3.
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
| (the rest) | RUNNING | filled in as run 1 and run 2 land |

## PLAY-STORE §6 (the check before a merge)
This release adds no screen, menu, sound, save, setting or network call beyond 2-3 (on main's frame since INT-R3) and art regrades: §6 items
1, 7 ride on clipcheck and build:store (in THE FULL SET); 2-6 and 8 unchanged code paths (no new screen, no save change: whatsNew.ts and
package.json are the only non-art src changes in this member's commits); filled with each gate's verdict at hand-over.

## Lessons applied
D40 (no patching of what is replaced: nothing fixed on this head), D92 (tsc + the CI tool line right after the merge), D102 (read lean),
D111 (box from `date`, 2:07 PM ET start), D113/D122 (every long run backgrounded with a fitting timeout; THE FULL SET in two runs),
D115 (the gate run reads frozen /home/user/frz4 only; edits and this REPORT on /home/user/rel4), D119 (no heredoc in a commit chain),
D120 (the question to the lead did not end the box).
