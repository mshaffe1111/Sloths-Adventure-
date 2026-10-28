# What we use from the Gemini research: the ledger

Every recommendation in `reference/GEMINI-PCG-RESEARCH.md` (Matt's four pasted parts, 2026-10-27), checked against the code on
2026-10-28, with its status, where it lives, and what is next. Keep this up to date: when a recommendation goes in, change its line
in the same commit. The rules that come out of it are in `reference/STAGE-RULES.md`.

Status: **IN** in the game / **PART** partly / **NOT** not yet / **NO** decided against (why given).
"W1-5" = the hand-built stages (`protoStage.ts`, `w2Stages.ts`); "Gen" = the generator for 5-7..5-9 and Worlds 6-10.

## A. How levels are designed (Part 1, section 1)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| A1 | Kishōtenketsu: teach a mechanic safely (Ki), develop it (Shō), twist it (Ten), master it (Ketsu) | PART | W1-4 puzzle rooms follow shown/learn/twist (1-6 seesaw, 3-5 vine, 4-6 shutter). Not applied to every stage's platforming arc. Next: each stage's sections planned as Ki/Shō/Ten/Ketsu, checked by the inspector's tension curve (A6). |
| A2 | Biome logic: platforms are branches, logs, slabs, never abstract blocks | IN | World kits draw every platform as its world's piece. |
| A3 | One-off focal twist per stage; one signature stage per world | IN | e.g. 1-8 chase, 4-7 long drop, Meeca's stage. |
| A4 | Sight-reading: the screen's challenge readable in ~2 s; safe rest pads between 5-10 s bursts | PART | rests checked (`restCheck`); readability only by screenshots. |
| A5 | Spelunky solution path + room templates + rolled sub-blocks; Dead Cells concept graphs | PART | W1-5: hand stages roll details only (rolls 0.87-1.00 alike: see C5). Gen: planned + rolled + validated, no sub-block library. Next: section variants per stage (W1-5), chunk library (Gen). |
| A6 | Rhythm groups and a sawtooth tension curve across a stage | IN (measured) | `tools/inspect/pacing.ts`: rhythm groups (bursts split at the setting's rest pad) and a tension curve in 9 parts (risk a second, jumps weighted by the noisy bot's misses) against the sawtooth, flagged when flat, front-loaded or with no climax (STAGE-RULES §2 "Tension"). Next: plan stages to it. |
| A7 | Linked pairs: never spawn a tool without its receptor in the same or next chunk | IN | puzzle kit rooms are data with wired sources and receptors; `puzzleCheck.ts`. |

## B. Engine and performance (Part 1, section 2.1)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| B1 | Godot / Unity | NO | we stay on our own web engine (Matt, 2026-10-27): it runs on phones, and a switch would restart everything. |
| B2 | Build the level in memory during loading; no create/destroy of sprites mid-play; object pooling | PART | stages are built before play; every sheet loads at stage start (`sheetWarm.ts`, 2026-10-28). No pooling audit. |

## C. Variety and randomness (Part 1 §2.2, Part 2 §2-3, Part 3 §2)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| C1 | Shuffle bags instead of plain random for pieces and props | PART (World 1) | `ShuffleBag`, `pickWeighted` (gen2/variety.ts, 2026-10-28). World 1 (variety-w1, 2026-10-28): each roll draws its rhythm and its section versions from bags (`w1Sections.ts w1Pick`), and every finish draws its pieces from a bag (`fillTo`). Next: Worlds 2-5; decor sets. |
| C2 | Poisson spacing: a minimum gap between same-kind pieces, a maximum gap with nothing (no barren stretches) | PART; spacing built (gen2/variety.ts), not yet used by stages | the maximum gap is enforced as dead time. `poissonPlace` (2026-10-28) does both gaps at placement time. Next: add the minimum gap to the validator. |
| C3 | Sockets inside rooms with 3 variations each (3^4 = 81 per room) | PART (World 1) | World 1 (2026-10-28): 2-3 authored versions of each stage's sections (start / develop / twist / finish), tagged by a roll rhythm (`w1Sections.ts`); 200 rolls: 1-1 0.61, 1-2 0.64, 1-5 0.64, 1-7 0.61 alike (was 0.99+); 1-3 0.68, 1-9 0.77, 1-6 0.84, 1-4 0.88, 1-8 0.94. Puzzle rooms themselves are not yet varied. Next: alternative rooms (1-6, 1-7), Worlds 2-5. |
| C4 | Cooldown: no chunk twice within 2 levels; no sub-block twice in a world | PART (World 1) | `CooldownQueue` (last 14 ids), `WorldOnce` (2026-10-28). World 1: a stage never uses one shared-pool body twice (`w1Pick`), and a cleared stage's next roll repeats none of its last versions where it can (`layoutMemory.ts`, `w1RollDistance`, 24 tries). Next: a cooldown across neighbouring stages of a world. |
| C5 | Expressive range analysis: 200-1,000 rolls, metric heatmaps, diversity D_sim >= 0.35 | NOT -> being built | `tools/inspect/era.ts` (helper, 2026-10-28). Measured by hand on 3 rolls: 0.87-1.00 alike. |
| C6 | Weighted action strings (W 0.2, h 0.5, J 1, V 2, C 2.2, P 2.8, S 3) | IN | `tools/inspect/beats.ts` weights. |
| C7 | 3-gram cosine across stages (reject > 0.78 adjacent) and 18-beat sliding windows (reject < 0.28) | IN | inspector `similar`, `windows` (window threshold set from our data). |
| C8 | Horizontal mirroring of rooms | NOT | Next: cheap variety for symmetric sections; keep painted light from the upper left. |
| C9 | Three standard connector heights (tiles) / relative anchor frames (pixels) | PART; designed, phase 2 | W1-5: pieces placed relative to platforms (puzzle kit anchors). Gen2 (2026-10-28, `src/game/gen2/DESIGN.md` B3): sections are local-space prefabs with entry/exit anchor frames, stitched exit -> entry with a join sized from the jump envelope, under a vertical corridor clamp; works end to end on a test world (`pipeline.ts layStage`). Next: World 5's sections (phase 2). |
| C10 | Offline seed curation: score thousands of seeds, ship the best | NOT | Next: with C5's tool, pick each stage's best rolls to ship. |

## D. Making every level beatable (Part 1 §3, Part 2 §1, Part 3 §1)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| D1 | Kinematic reachability from the jump physics | IN | `levelCheck.ts` uses `physics.ts`. |
| D2 | Safety margin by difficulty: required jumps under 65% of max on Easy, 82% on Normal | PART | one margin (`SAFE`) for both difficulties. Next: per-difficulty margins. |
| D3 | A full path search (states, inventory) before play; self-repair a failing jump | PART; designed, phase 2 | `levelCheck.ts` + re-roll (LEVEL_ATTEMPTS) for the live stages. Gen2 (2026-10-28, DESIGN.md B5, `pipeline.ts checkAndRepair`): local repair before a re-roll (a stone in the failing seam, a stray pickup or animal out, one section swapped at its slot, a section failing twice banned), tested. Next: in play with phase 2's stages. |
| D4 | Puzzles checked as symbolic zones (carry walk, throw arc, lure path), not tile by tile | IN | `puzzleCheck.ts`. |
| D5 | Softlock guarantee: a lost item respawns at its source | IN | puzzle kit sources and the reset post. |
| D6 | Free-form geometry: sockets bound to a platform id + t along it + normal offset | IN | puzzle kit anchors `{on, at, dx}`. |

## E. Fun, pacing and dead time (Part 1 §4, Part 2 §4, Part 3 §4)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| E1 | Only real actions count as beats (jumps, timing, threats, props); flat petals 0, a petal arc over a gap 0.5 | IN | inspector `beats.ts`. |
| E2 | Max eventless walk 2 s Normal / 3 s Easy / 1.2 s chase; rest pads 1.0-1.2 s Normal, 2-2.5 s Easy | IN (measured) | `pacing.ts`, per difficulty on each setting's own stage: the longest walk with no action and how many go over the limit, and the rest pads between bursts (STAGE-RULES §2 "Pacing"). Next: tighten stages to these numbers. |
| E3 | Action density 0.75-1.15 actions/s Normal, 0.35-0.55 Easy | IN (measured) | `pacing.ts`: actions a second on the inspector's route, per setting (1.1-1.4 for a chase on Normal), flagged off target. Next: build stages to it. |
| E4 | Rhythm group length 10-14 s Normal (8-12 actions), 6-8 s Easy | IN (measured) | `pacing.ts`: bursts (beats with less quiet between them than the setting's rest pad), their middle length and actions, and the longest; flagged off target. |

## F. Difficulty: Easy versus Normal, new versus experienced players (Part 1 §3 table, Part 2 §5-6, Part 3 §5)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| F1 | Same layout, different rules per difficulty: margins, platform widths, hazards, enemy budget, quotas | PART | Easy: fewer boss hits, longer warnings, lower quotas, the sparkle. Not: wider landings, softer pits, a 60% enemy budget. |
| F2 | Difficulty score D(world, stage) and a ramp inside each world (stage 1 of a world a little easier than the last of the one before) | IN (measured) | `tools/inspect/bands.ts`: a 0-100 score per stage and setting (first-timer lives lost a minute, the noisy bots' hardest jumps, peak stress, minimum input window, dead time, length), each world's band, STAGE-RULES §1b's flags, and a note where a world's first stage starts above the last one's end. `easeAssist` still ramps help out by stage 25. Next: tune stages to the bands; the generator aims for D(W, L). |
| F3 | Noisy-thumb bots: Easy kid N(+90 ms, 65 ms) reaction, jump-hold noise 80 ms, 0.4 s hesitation; Normal adult N(+30, 30), 35 ms; gate: survival 85% Easy / 70% Normal per jump | IN | inspector kid/adult bots (route model, `jumps.ts`), and the first-timer bot in the real engine (`tools/inspect/firsttimer.ts`, `--firsttimer`, 2026-10-28) with exactly these numbers: press latency N(+90, 65) / N(+30, 30) ms, hold N(flick, 80) / N(flick, 35) ms, 0.4 s / 0.2 s before a tap. It reports survival per jump edge over its runs (edges tried 3+ times) against 85% / 70%. |
| F4 | Touch failure modes in the bot: thumb drift, late lift-off overshoot, 8% short-hop truncation, 133-200 ms thumb swap between jump and throw | IN (bot) | first-timer bot: drift ~N(+4, 2) px/s capped at the game's 30 px re-anchor, with reversal dead time; log-normal late lift-off (1-4 frames kid, 0-2 adult) that runs him off small pads; 8% / 3% of flicks cut to 66 ms; 133-200 ms from a jump press to a tap (it never throws: puzzles are skipped). Next: gate on them (e.g. no Easy gap needs a full-hold jump, G8). |
| F5 | Gates: minimum input window 300 ms Easy / 167 ms Normal; peak stress per burst 2.5 / 5.5; puzzle depth 1-2 / 2-4 steps; backtracking 1.0-1.25 / 1.15-1.6 | IN (measured) | puzzle depth by difficulty is in the kit rules. The first-timer bot reports the other three per stage and setting: the input window measured in the real engine (the press moved a frame at a time around his own take-off, running jumps between still ledges, up to 12 a stage), peak stress (the summed failure share of the jumps in one burst before a 2.0 s / 1.0 s rest), backtracking (the main route over the straight line; only too long is flagged). The inspector also turns the per-jump floors into band flags per stage (`bands.ts`: Normal bot 70% in Worlds 1-5, 50% in 6-10; Easy kid 85%). Not yet gates in the validator or the generator. |
| F6 | Kids 7-10: hints under 8-12 words, grade 2-3 reading; stuck = back-and-forth or 2 failed tries, not a clock; 3-tier hints (sparkle at 15 s, a thought at 30 s, a demonstration at 50 s) | PART | Easy's silent sparkle when stuck is IN; Flicker's on-request tiered hints are planned, not built. |
| F7 | First lesson rooms: zero lethal failure, can't be skipped, the room shows itself first; source and receptor within 8 tiles so an upright phone sees both | IN (W1-4 rooms) | STAGE-RULES §3; camera keyBox. Not yet enforced by the validator as a rule. |

## G. Movement and touch at 30 fps (Part 2 §5) — Matt, 2026-10-28: "people may not be able to jump short, do long jumps"

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| G1 | Coyote time 133 ms Normal / 167 ms Easy, timed in ms (not frames) | IN | `physics.ts FORGIVE` (133 / 167 ms, seconds of game time, every stage; the early-stage `ASSIST.coyote` adds on top, and Easy keeps it); `PHYS.coyote` removed. Test `forgive.test.ts` (a jump 120 ms after the edge on Normal, 160 ms on Easy; 167 ms on Normal is late). 2026-10-28. |
| G2 | Jump buffer 133 ms Normal / 200 ms Easy | IN | one rule: `FORGIVE.buffer` for the engine's buffer (`PHYS.buffer` removed), and the touch/keys input keeps a press that long plus a frame (`inputEngine.ts pressKeep`, was a fixed 160 ms). Test `forgive.test.ts` (a press 180 ms before landing jumps on Easy, not on Normal). 2026-10-28. |
| G3 | Ledge-landing forgiveness: a foot that misses an edge by up to ~8 px (Normal) / ~12 px (Easy) lands | IN | `engine.ts` floors + `FORGIVE.landPx` (8 / 12 px past the foot's usual tolerance, every stage, nudged on; only for a jump carrying him toward the ledge, never walking off an edge, never a log; `ASSIST.landSide` still adds early). Test `forgive.test.ts`. 2026-10-28. |
| G4 | Head-bonk nudge (8/12 px) and shin mantle (10/14 px): a jump into a face carries over its lip | IN | World 5's `STEP_UP` / face carry / `LIP_IN` now on every stage of every world (`engine.ts stepHelp`, not Meeca's stage, boss arenas or Dot's flight); the lip's hoist already takes him from 26 px under a top (`FORGIVE.mantle`, more than 10/14). Head-bonk: nothing to do, platforms are passed through from below (no ceilings). Tests `plainWalk.test.ts` (Worlds 1-2, three rolls), `forgive.test.ts` (World 1 and a generated World 6 stage). 2026-10-28. |
| G5 | Pickup / lever magnet 1.25x Normal, 1.6x Easy | PART | the kit's tap reach is larger on Easy (`useReach`); check the ratio. |
| G6 | Physics stable at 30 fps: Verlet or a 60 Hz substep so a stutter doesn't shorten jumps | NOT checked | Next: test jump height under 33 ms vs 45 ms frames; substep if they differ. |
| G7 | A floating re-centring thumb slider halves reversal lag | PART | the touch rules move their anchor with the thumb past 30 px (`touchGestures.ts` TUNING.reanchor). The first-timer bot models it (the drift stops building at 30 px; turning round costs the thumb's travel back, about 0.2-0.35 s kid / 0.1-0.2 s adult) and reports the turns and the seconds of no steer they cost per stage. Measured from real fingers: NOT yet. |
| G8 | Variable jump: a tap is a short hop, a hold a full jump; no Easy gap may need a full hold | IN (gate) | short hop IN (`cutV`); the check: `levelCheck.ts easyHoldCheck` validates an Easy stage with a ~70% hold (`physics.ts EASY_HOLD`, `reachJumpHeld`; onto a face the lip's hoist, `HOLD_MANTLE`). Easy softens every place only a full hold reaches (`easyMode.ts easyHoldSoften`: a wider landing toward him, else a step halfway up a face, else a catch ledge halfway; the jump stays). Gate: `easyMode.test.ts` fails if any Easy stage of Worlds 1-10 needs a full hold, rolls 1-3 (hand-built) and the generated ones. Softened on rolls 1-3: 1-1 (10 landings +7..31 px), 1-2 (20-23 landings), 1-4 (1-11 climb ledges), 1-8 (45-60 chase landings ~+22 px, 0-5 catch ledges), 3-3 (1-2 steps, 0-1 catch, 0-1 landing), 4-3 (2-3 landings, 2 catch ledges). Tests `forgive.test.ts`, `easyMode.test.ts`. 2026-10-28. |

## H. Story and visual journey in generated stages (Part 2 §7)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| H1 | Fixed story order with story anchor rooms at the start and end of a stage | IN | stage cards, Dot's lines, set pieces. |
| H2 | Handcrafted landmark rooms inside generated stages | IN | puzzle rooms and set pieces in W1-5. Gen: next. |
| H3 | Each world in three visual sub-acts (morning, deep, lair approach) | IN | far backdrops through the day (`stageBackdrops.ts`, 2026-10-28). Next: props and decor by sub-act too. |
| H4 | A breadcrumb trail so players don't get lost | IN | petal trails (and "follow the petals"). |

## I. World director and archetypes (Part 1 §3.2-3.4)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| I1 | A 9-card mission deck per world: stage 1 onboarding, 5 signature, 9 mastery; others shuffled | NO (shuffling) / IN (fixed order) | Matt's story fixes the order; we kept the archetype idea in `stagePlan.ts` and skipped per-playthrough shuffling. |
| I2 | The 6-pass pipeline (budget, graph, chunks, sockets, validate and repair, dress) | designed, phase 2 | `src/game/gen2/DESIGN.md` and `pipeline.ts` (2026-10-28): all six passes typed and working end to end on a four-section test world (levelCheck + puzzleCheck pass on every seed tried, deterministic, different per seed, Easy = Normal's plan under Easy's rules, the clock met). Next: World 5's 5-7..5-9 building blocks (phase 2), then World 6. |
| I3 | JSON world manifests and chunk templates | designed, phase 2 | `gen2/types.ts` WorldManifest, SectionTemplate, Socket (data; one emitter file of code per world); `gen2/toyWorld.ts` is the example. Next: `gen2/worlds/w5.ts`. |

## J. Camera for puzzle rooms (Part 3 §6 / Part 4)

| # | Recommendation | Status | Where / what is next |
|---|---|---|---|
| J1 | Zoom floor 0.72-0.75x; protagonist at least 8-10% of the short screen side | NO | Matt decided (2026-10-28): the whole puzzle room stays in view upright, so Pokey may shrink to the sideways scale (~0.5 screen px per world px on a 360-wide phone). Rooms are still built narrow and tall so it rarely comes to that. |
| J2 | Lean 35% toward the active part (source before pickup, receptor after) | IN | `puzzleCamera.ts`, keyBox. |
| J3 | Puzzle rooms in a 500 x 750 px box (fits both orientations) | PART | narrow-and-tall rule; not checked by size. Next: the validator checks each room's box. |
| J4 | A 0.8 s pan to a far gate, or a visible conduit between switch and gate | IN | first-open pan; troughs and ropes. |
| J5 | A peek-drag gesture | NO | clashes with our whole-screen touch controls (2026-10-27). |

## Summary (2026-10-28)

Of 56 recommendations: **18 IN, 23 PART, 11 NOT, 4 NO** (B1 the engine switch, I1's per-playthrough shuffling, J1 the zoom floor (Matt keeps the whole room in view), J5 the peek gesture). The biggest gaps:
1. **Variety (C1, C3, C4, C8, C10):** rolls of a stage barely differ. Section variants, sockets, shuffle bags and cooldowns.
2. **Movement forgiveness for every stage and both difficulties (G1-G4, G8).**
3. **Difficulty-scaled rules (D2, E2, F1, F5)** so Easy is truly easier, not only fewer boss hits.
4. **Pacing numbers in the inspector (A6, E3, E4, F5)** so "fun" is measured, not guessed.
5. **Tiered hints (F6)** and the 6-pass generator (I2) for Worlds 6-10.
