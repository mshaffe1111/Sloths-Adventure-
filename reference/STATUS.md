# Status board (the lead session keeps this current; see reference/LEAD-PLAYBOOK.md)

Last updated: 2026-10-28 (after release PR #40).

## Live (main)

- PR #39 (2026-10-28): Worlds 1-2 rebuilt, iPhone sound fix, Worlds 1-4 groundwork.
- PR #40 (2026-10-28): Worlds 3-4 rebuilt, upright puzzle camera, QA batch 1 fixes, sheets load at stage start, browser fields in
  recordings, the one-time slow-phone tip, the Android build fix (first successful APK, run 40721485781).

## On the work branch, not live yet (pushed for safe keeping; draft PR #41 tracks it, not a release)

- Docs: GEMINI-PCG-RESEARCH.md, STAGE-RULES.md, GEMINI-LEDGER.md, LEAD-PLAYBOOK.md, this file.
- Meeca's art sheets (meeca-poses, meeca-props) and their cuts.

## Helpers running (each must pass LEAD-PLAYBOOK §4 before merging)

| Helper | Job | Owns | Started |
|---|---|---|---|
| QA batch 2 | Worlds 1-2 fixes: 2-2 opening drowning (+ no stage hurts in its opening seconds), 1-7 eagle, 2-5 opening hit and predator count, dips/lips that stop a plain walk, lingering tips, fight-count progress bars, 2-2 flower totals, lives shown from the start, 1-7 polish; Dot toned down (W1-4); jump forgiveness engine-wide by difficulty (ledger G1-G4, G8) | W1-2 stage code, Dot's lines, engine movement, levelCheck | 2026-10-28 |
| First-timer bot | A real-engine new-player bot on Easy and Normal with Gemini's touch-fumble model and pass marks (ledger F3-F5, G7) | tools/inspect (bot), HANDOFF §6 pre-QA pass | 2026-10-28 |
| 200-roll tool | Expressive range: 200 rolls per stage of Worlds 1-5, heatmaps, diversity vs 0.35, rule failures across rolls (ledger C5) | tools/inspect/era.ts (new files) | 2026-10-28 |
| Art placement | Every unused World 1-4 sheet piece placed (22 found); state frames; looks rotate by the roll with a cooldown; W1-2 drawing swaps only | puzzleArt, atlas, W3-4 decor | 2026-10-28 |
| Meeca's stage | "On the March North": camp, Flicker, five puzzle rooms (tea channel in room 4), the approved ending; night strips in code; replaces 5-M outright | Meeca/5-M files, W5 night strips | 2026-10-28 |

## Open decisions for Matt

- (none right now)

## Decided today (also on the Docs roadmap)

- Keep the whole puzzle room in view upright, even if Pokey shrinks to ~0.5x (not Gemini's 0.72x floor).
- Meeca's Room 4 is the tea channel. World 5's night strips are made in code.
- Slow phones: recordings name the browser; the one-time "open in Chrome/Safari" tip.
- QA: one bot, random levels. Our bots (kid/Easy, adult/Normal, first-timer) run before anything goes to QA.
- Dot toned down. All research in the repo; one rulebook; the lead checks every helper's work before merging.

## QA batches

- Batch 1 (2026-10-28 morning): all fixed, live in PR #40.
- Batch 2 (2026-10-28, Worlds 1-2 on build 39fc3db): 9 items, being fixed (helper "QA batch 2").
- Asked of QA (2026-10-28): run the Matt bot through every stage of Worlds 3 and 4 on the live build; report on Matt's "send".

## Queued next (in Matt's order)

1. Merge and check the five helpers above (LEAD-PLAYBOOK §4), test link, then QA.
2. Real variety for Worlds 1-5: two or three versions of each section chosen per roll, shuffle bags, cooldowns, mirroring, curated
   best rolls (ledger C1, C3, C4, C8, C10), proven by the 200-roll tool. World by world.
3. World 5 (5-1..5-5) dead time (5-2 69 s, 5-4 60 s, 5-5 55 s) and the rest of the World 5 plan; 5-6 hand-built "Where She Ran".
4. The new generator, first on 5-7..5-9, then Worlds 6-10 (ledger I2-I3).
5. Difficulty-scaled rules (ledger D2, E2, F1, F5) and pacing numbers in the inspector (A6, E3, E4).
6. Flicker's tiered hints (F6). World 1-2 art placement follow-up (nest door, petal bundle) after QA batch 2 merges.

## The current QA checklist (sent to the QA session 2026-10-28; keep in step with STAGE-RULES)

Report each finding with the stage, the moment (s), upright or sideways, Easy or Normal, and the rule number below it breaks.
1. Opening seconds: anything that can hurt in the first ~5 s of plain walking.
2. Tip before hazard: a hit or a fall that comes before Dot's (or Flicker's) tip that teaches it.
3. Plain walk: a step, lip or dip that stops a plain walk or plain jump; falling back into the same dip twice.
4. Jumps: a jump that needs a perfect timing or a full hold on Easy; a ledge you clearly reached but slid off.
5. Quiet stretches: more than ~4 s with nothing to do (only petals on flat ground counts as nothing).
6. Look-alikes: a stretch that feels the same as another stage of the same world, or as the last time you played it.
7. Puzzle rooms: can't see the piece and what it acts on together upright; a puzzle that costs a life; a hint that gives it away;
   a room you can walk past without solving; a carried thing you can't carry without jumping.
8. Dot: speaks in the first seconds, repeats a tip you already did, lines closer than ~10 s, lines over ~10 words, a tip left up 20 s+.
9. Goals: a count that can't be met fairly on Normal (87.5% petals, all rescues, 75% predators); totals that disagree.
10. Art: a prop that pops in late, a missing state (a pressed plate that doesn't look pressed, a bell that doesn't swing).
11. Device: frame rate, freezes, and the Device column's browser part (an in-app browser, "framed", software drawing).
12. Anything a 7-10-year-old would not understand or would find unfair.
