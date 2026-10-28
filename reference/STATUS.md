# Status board (the lead session keeps this current; see reference/LEAD-PLAYBOOK.md)

Last updated: 2026-10-28 (Hugging Face art run started).

## Live (main)

- PR #39 (2026-10-28): Worlds 1-2 rebuilt, iPhone sound fix, Worlds 1-4 groundwork.
- PR #40 (2026-10-28): Worlds 3-4 rebuilt, upright puzzle camera, QA batch 1 fixes, sheets load at stage start, browser fields in
  recordings, the one-time slow-phone tip, the Android build fix (first successful APK, run 40721485781).

## On the work branch, not live yet (pushed for safe keeping; draft PR #41 tracks it, not a release)

- QA batch 2 + Dot toned down + Gemini jump forgiveness in every world (merged 8ed2c53, fast gate 77/77; cloud full check running).
- World 1-4 art placed (merged 2026-10-28, fast gate passed): every sheet cell used except World 1's nest doors and petal bundle,
  World 2's trough and pink net (follow-up after QA batch 2 lands), and 4 World 5 beetle frames. Looks rotate by roll (artRoll.ts).
- Generator variety tools (merged 2026-10-28): src/game/gen2/variety.ts (ShuffleBag, CooldownQueue, WorldOnce, poissonPlace,
  pickWeighted), not yet used by stages.
- The first-timer bot (merged 2026-10-28): `npx tsx tools/inspect/inspect.ts --worlds 1-4 --firsttimer` (~10 min). Known weak spots of
  the bot: World 2 lily-pad rivers (its life counts there are pessimistic) and tall climbs (572-863 px 'stuck' in 1-4, 2-6, 3-4,
  4-3, 4-6 may be the bot, not the stage): check by hand before acting on those.

- Docs: GEMINI-PCG-RESEARCH.md, STAGE-RULES.md, GEMINI-LEDGER.md, LEAD-PLAYBOOK.md, this file.
- Meeca's art sheets (meeca-poses, meeca-props) and their cuts.

## Helpers running (each must pass LEAD-PLAYBOOK §4 before merging)

| Helper | Job | Owns | Started |
|---|---|---|---|
| QA batch 2 -> Easy jumps | (batch 2 merged 8ed2c53) next piece: Easy never needs a full-hold jump (G8 as a failing rule; fix 1-1, 1-2, 1-4, 1-8, 3-3, 4-3), re-run the first-timer bot | jump spots, levelCheck | 2026-10-28 |
| Art -> World 1-2 follow-up | 1-4 nest door, petal bundles as room rewards, branch gate in a World 1 room, 2-2 trough; no route changes | W1-2 art and dressing | 2026-10-28 |
| 200-roll tool | Expressive range: 200 rolls per stage of Worlds 1-5, heatmaps, diversity vs 0.35, rule failures across rolls (ledger C5) | tools/inspect/era.ts (new files) | 2026-10-28 |
| Generator: architect | The new generator's written design for Matt (World 5's 5-7..5-9 first, then Worlds 6-10), its data shapes and the six-pass skeleton | src/game/gen2/ (types, pipeline, design doc) | 2026-10-28 |
| Pacing measures | Inspector: action density, rhythm-group length, tension curve per stage, the difficulty-band chart per world | tools/inspect/pacing.ts, bands.ts (new files) | 2026-10-28 |
| Worlds 3-4 gap list | Measure only: 3 rolls, the first-timer bot, art use; per-stage gaps and variety ideas, so the W3-4 variety pass starts tonight | nothing (read-only) | 2026-10-28 |
| Meeca's stage | "On the March North": camp, Flicker, five puzzle rooms (tea channel in room 4), the approved ending; night strips in code; replaces 5-M outright | Meeca/5-M files, W5 night strips | 2026-10-28 |
| Hugging Face art run (Matt 2026-10-28) | Enemies first, hardest first (bosses, new creature models, animated clips), then what the game still needs, then art and props: reference/ART-PLAN.md inventory with costs, Matt has ~$70 left: plan to $65 ($40 enemies, ~$25 what's left to finish then art and props, ~$5 spare), results in a gallery for Matt's pick (show first, nothing into src/ yet) | reference/ART-PLAN.md, tools/art/ new folder + new specs (branch art-hf) | 2026-10-28 |

## Budget

Matt is on the Max plan (2026-10-28) and wants more helpers in parallel to finish sooner ("even twice as many"): run every
separate job at once, never two on the same files. Still no duplicate or
unasked work (LEAD-PLAYBOOK §7); if the weekly limit gets close, Matt says so and it drops to one world at a time.

## Open decisions for Matt

- (none right now)

## Decided today (also on the Docs roadmap)

- The game gets harder world by world: each world has its own difficulty band and the bands climb; inside a world stages may go
  up and down, but none leaves its world's band (World 2 stage 8 never as hard as World 4). Later deaths and replays are expected; Easy is gentler, never empty (still double jumps and the
  tougher moves, softened); QA's "too hard" is sorted into unfair (fix) or hard but fair (keep). STAGE-RULES §1b.

- Keep the whole puzzle room in view upright, even if Pokey shrinks to ~0.5x (not Gemini's 0.72x floor).
- Meeca's Room 4 is the tea channel. World 5's night strips are made in code.
- Slow phones: recordings name the browser; the one-time "open in Chrome/Safari" tip.
- QA: one bot, random levels. Our bots (kid/Easy, adult/Normal, first-timer) run before anything goes to QA.
- Dot toned down. All research in the repo; one rulebook; the lead checks every helper's work before merging.

## QA batches

- Batch 1 (2026-10-28 morning): all fixed, live in PR #40.
- Batch 2 (2026-10-28, Worlds 1-2 on build 39fc3db): 9 items, being fixed (helper "QA batch 2").
- Asked of QA (2026-10-28): run the Matt bot through every stage of Worlds 3 and 4 on the live build; report on Matt's "send".

## Cloud sessions (separate machines)

| Session | Job | Branch | Started |
|---|---|---|---|
| session_01FhBbYPCMx5mTFQdQmEtqey | Full check of the work branch at 8ed2c53+ (redirected after the batch-2 merge): tsc, full suite, build, inspector + first-timer bot on Worlds 1-4 seeds 1-3, timed | reads ccr-0d59a91c-oy3imz, pushes nothing | 2026-10-28 17:40 UTC |

## Two tracks (Matt, 2026-10-28)

- **Today's code track:** the four original helpers (QA batch 2, art placement, the 200-roll tool, Meeca's stage) stay on bringing the
  current game up to speed plus bug fixes: when one reports and passes the checks, the lead sends it its next piece of that track
  (it keeps its context, which saves tokens) instead of starting a new helper.
- **Generator track:** the architect, the variety tools and the pacing measures, then seed curation, the validator upgrades and
  World 5's building blocks.

## Waiting to start (they need another helper's result)

- Seed curation (pick each stage's best rolls): needs the 200-roll tool.
- Validator upgrades (per-difficulty jump margins D2, local self-repair D3, room-box size J3, co-visibility F7, min spacing C2): needs
  QA batch 2 to land (it is in levelCheck.ts).
- The generator's World 5 building blocks for 5-7..5-9: needs the architect's design and Matt's OK.

## Queued next (in Matt's order; Matt chose 2026-10-28: the Worlds 1-4 pass starts right after step 1, before the rest of World 5)

1. **Finish what is running** (the five helpers above): LEAD-PLAYBOOK §4 checks on each, the test link, then QA's Worlds 3-4 run
   against the checklist. The jump-forgiveness change must land before any stage is re-tuned.
2. **Measure Worlds 1-4, no building:** the 200-roll tool, the first-timer bot (Easy and Normal) and the inspector on seeds 1-3 over
   every stage -> one gap list per stage against STAGE-RULES (roll sameness, rule failures across rolls, new-player hurts and stuck
   spots, Dot pacing, unused art). Show Matt the list before building.
3. **The variety pass**, Worlds 1+2 together, then 3+4 (at most two building helpers): two or three real versions of each stage's
   main sections chosen per roll, a shuffle bag and cooldown for pieces and decor, mirroring where it fits, curated best rolls from
   the 200-roll results (ledger C1, C3, C4, C8, C10); fix the step-2 gap list; place the remaining art (World 1 nest door, petal
   bundle). Proof: rolls 0.65 alike or less (diversity >= 0.35) and no roll breaks a rule.
4. **Easy truly easier, and pacing measured** across Worlds 1-4: wider landings, softer pits, fewer enemies, a per-difficulty
   jump margin (ledger D2, F1); action rate, burst length, tension curve and minimum input window in the inspector (A6, E2-E4, F5).
5. **QA and Matt:** a full QA sweep of each pair of worlds against the checklist, Matt on the test link, release on his "push".
6. Then: the rest of World 5 (5-1..5-5 dead time, 5-6 "Where She Ran" hand-built), the new generator on 5-7..5-9 then Worlds 6-10,
   Flicker's tiered hints (F6).

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
