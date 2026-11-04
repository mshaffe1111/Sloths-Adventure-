# Stranded branches: triage, first pass (R-143, roadmap keeper, 2026-11-01 9:35 PM ET)

Read-only. Facts from git on 2026-11-01 (`git log origin/main..<branch>`, `git cherry origin/main <branch>`, `git diff --stat` from the
merge base). `git cherry` found **no commit on any of these branches already on main as the same patch**, so nothing is a clean "drop,
it's in". Whether main has the same result by a different road needs a look at the screens, named per branch below.

| R | Branch | Tip | Ahead / behind main | What it holds (its own commits) | Recommendation | Check before deciding |
|---|---|---|---|---|---|---|
| R-143.1 | w5-rebuild | afd0d02b 10-30 | 18 / ~1,200 | 5-6 on gen2 (three run sections, variety 0.37), 5-8 Up the Bloom Trees hand-built, World 5 one-style HF pass (42 props repainted, silk drape), soil-mound and step-down fixes, first-frames check for 5-6/5-8, the torn band in 7 backdrop strips. 177 files | **Rescue by cherry-pick**, not merge: the World 5 art and 5-6/5-8 are paid work that R-142.1 would otherwise rebuild. Sent back 10-29 for review notes; the review package is on the branch | Is the "torn band" fix already on main via hf-backdrops2 (PR #61 repainted W5 mids)? If so drop afd0d02b |
| R-143.8 | w5-normal-wip | 7bf0bdbc 10-30 | 14 / ~1,200 | The same World 5 commits as w5-rebuild plus one WIP "World 5 Normal package v1" (spiders faster, steam hurts, band 21.4); marked "not for merge" | **Close**; keep 7bf0bdbc's numbers as the starting point for R-5.4 (World 5's Normal curve), after the bands re-run (R-5.2) | none |
| R-143.2 | hazard-anim | 9b10460e 10-30 | 5 / ~1,110 | Painted deep water for W2's river and W6-10 dirty water (HF), dirty-water chop, debris and W9/W10 rubble starts. 27 files | **Rescue** (paid HF art) into the next art job; re-shoot both ways on main first | Does main's W2/W6-10 water already look painted (hf-backdrops2, PR #61)? |
| R-143.3 | polish-clean | a3193bf1 10-30 | 11 (9 own) / ~1,110 | The stage walk + seam detector tools (every stage both ways, findings by cause, X-19), key spill removed from six cut-out sheets, 6-8 stilts sunk into their ledges, the pulley post. 276 files (mostly report images) | **Cherry-pick the tools and the three art fixes**; leave the report images on the branch | Are the six sheets' key spill and the 6-8 stilts still visible on main? |
| R-143.7 | polish-clean-sweep-w9-10 | f43e9484 10-30 | 5 / ~1,470 | The clean-sweep findings for Worlds 9-10 (2,533 files: screenshots) on the OLD W9/W10 builds | **Close** once R-2.1/R-2.6 replace those builds; its findings describe stages that are being rebuilt | none |
| R-143.4 | polish-pf1 | 138041ae 10-30 | 4 (3 own) / ~1,140 | No flat backdrop at a stage's start (painted stand-ins first, the stage waits), creatures fade from stand-in to painting, PF-1b ground-decor stamps (WIP). 103 files | **Re-check against main, then rescue or close**: main has its own first-frame work (bcf9fb80, b11a9a73 preload) that may cover it. Its last commit says "full gate not yet run" | On a slow phone profile, does a stage on main still start on a flat backdrop? |
| R-143.5 | gen2-ascent | 968b3805 10-30 | 29 (26 own) / ~1,460 | gen2 "upward flow" (piece C: ascents zig-zag up a column) plus World 9 work of 10-29/30 (harder chasms, lava splash, lintel, Pell's threads) that is NOT on w9-pieces either (c625b889 is only on this branch) | **Hand to lane C with R-2.1**: the World 9 commits must be compared with w9-pieces before World 9 is curated; the ascent piece feeds the climbs (R-141.5, R-2.9) | Which of its World 9 commits w9-pieces re-did |
| R-143.6 | polish-edges | a7d4ddf9 10-30 | 10 / ~1,410 | X-16 sky rounds 5c-5f (stopped: the 11 held skies stay on the cover fit), Gemini prompts for those skies. 9 files | **Close** after one check: hf-backdrops2 repainted 9 old upright skies on 11-01 (its NEXT.md "Upright skies: done"); Gemini prompts are retired (Matt 10-30) | polish-edges held 11 skies, hf-backdrops2 did 9: name the other 2 |

## What this saves

Rescuing w5-rebuild and hazard-anim keeps paid HF art and about two helper-days of World 5 building; closing polish-edges,
polish-clean-sweep-w9-10 and w5-normal-wip removes three branches nobody needs to read again. gen2-ascent is the one that can cost the
most if missed: World 9's curation would run without its 10-29/30 changes.
