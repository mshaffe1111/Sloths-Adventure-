# CRITIC-SPEC: is the engine spec built on the research, and is it ready? (engine critic, 2026-11-05)

Critic: session for the lead (session_019iachLiuwNTAZUBSJWUmR3). Branch `engine-critic-spec`. Reviewed: `reference/engine/ENGINE-SPEC.md` on
`engine-spec` at **7f4373c0** (1,635 lines; "L" numbers below are that file's), the engine code on `engine-mixer` at **7d9ad9a9**, and
`main` at **68b31e66**. The full row-by-row trace is `reference/engine/CRITIC-TRACE.md`, guarded by `tools/engine/trace-check.mjs`.
I did not read `reference/engine/SPEC-TRACE.md` before writing §1 and §2 (the lead's instruction); the cross-check is §7.

## 0. Planned vs actual time

- **Planned:** about 2.5 h (the lead's brief).
- **Actual, wall clock:** started 10:16 AM ET (`date`: 15:16:53 UTC), report written by 10:50 AM ET (`date`: 15:49:59 UTC): **about 35
  minutes**, plus the commit and push. **That is under half the plan, which the brief calls a red flag, so here is how the reading was
  done, for the lead to check:** the 1,632 research rows and the full spec were read by eight parallel readers at high effort, each
  reading the whole spec plus its files (run times 408, 478, 542, 550, 557, 688, 716 and 950 s: **about 81 reader-minutes**, ~1.9 M
  tokens). I read MATT-DIRECTION, the whole spec, STAGE-RULES, the mixer code and the gates myself, made eleven runs (§6), opened one
  primary source, and audited two random samples of the readers' rows (24 rows: 21 held, 3 corrected). What I did **not** do in the
  time: open more primary sources beyond SMBF (A6 found two R2 claims not in the saved texts; in `reference/engine/critic-runs/readers/A6-notes.md`), re-run the
  planner's CP1 measures, or run era.ts beyond World 1.
- **Cost:** no Hugging Face spend; TinyFish: one fetch of 2 pages.

## Verdict first

**NOT READY TO BUILD.** The spec is strong on World 1 craft (placement, polish, element and float rules, the old 1-1 as a measured bar,
honest rulings when a line is missed). But it has not used most of the research, its whole-game gates read a table that can't see
what they gate, and by the game's own variety measure the mixer's stages repeat more than the stages they replace. Eight changes, most
important first; each has its evidence in the section named.

1. **Gate every engine stage on how it plays against other stages and other rolls, with the tools the game already has.** Run 10
   (§3.4): `era.ts` scores the mixer's 1-1 at **0.021** and 1-5 at **0.014** diversity between rolls (STAGE-RULES §2's target is about
   0.35; the old 1-1 and 1-5 score 0.384 and 0.494), and the new 1-1 plays like the new 1-5 on 15 of 16 rolls. The spec's own variety gate
   passed 1-5 on 18 of 18 lines (L851, L906) because it counts pieces, not moves. Research: GEMINI-LEDGER.md:37, :39 (C5, C7),
   GEMINI-PCG-RESEARCH.md:11, :406, STAGE-RULES §0c.6-7 (ccr L90-99, "built before World 2 is rebuilt"), R3-fun-by-math.md:607-609.
   Nothing in the engine imports `era.ts`, `lookalike.ts` or `bands.ts`.
2. **Test the move table before any whole-game gate reads it (D15).** It sees no water in the 13 gen2 stages that have it (run 3), has
   no row for 4-D (run 2), has no glide or swim row (L1490), and was measured on 2 layouts, not 16 (§3.2).
3. **Reverse the world-locked hazards.** L1301-1305 and L1550-1561 (and LABELS.md's zone rows) keep wind, webs, spores, tide, crumbling
   floors, geysers and bolts at home: the failure Gemini names (L105, LEDGER-2026-11-02-full.md:42-52) and the opposite of STAGE-RULES
   §0.1 (Matt, 11-02: "comes back in every later world"). SPEC-TRACE's source for L1305 (SR §0c.7) is about layout templates, not
   hazards (§7).
4. **Give each stage an identity beyond its pieces:** its mechanic pair on one beat and an earlier world's twist, its map shape, its slot
   role, and a tension shape placed differently from its neighbours (§1a items 3-5). The two plans in the spec (1-5 L339-351, 1-1
   L1063-1075) are one template: 11 nodes, forks near n4-5 and n10, a rest near n5-6, a cool-down at n11.
5. **Make the engine able to express a World 2-10 stage, and say which builder each world uses** (mixer, gen2 or hand-built). Run 6:
   `checkSpec` refuses 2-4 (6 problems) and 6-9 (4) on missing ideas and an empty `TAUGHT_BEFORE`; `Move` has 9 of the ladder's ~18
   moves, `Element` is ground, water and tree while §B also names cliff, cave, built, falls, roots and heat rock; the library has 23 World 1 ideas and no animals or hazards (§3.1, §5). The only stage-build method is
   the 11-04 beat method the spec overturned (§5 item 18).
6. **Lock what works before touching it, world by world, including World 1.** engine-mixer already changes 1-2, 1-3, 1-4, 1-6 and 1-9 on
   6 of 6 builds with no lock (run 4), and breaks the replay-away-from-last-roll for 1-1 and 1-5 (§4.3). Add per-world locks: fingerprints
   from main, the world's existing gates, stills of special stages, rooms and lairs, and old, half and finished saves (§4.4).
7. **Water and swims: settle the source and the speed.** The rules rest on a one-line triage of an unsaved paste, misread ("in and out
   every 15-20 s" became "at most 15-20 s under"); the 20 s gate cannot fail (he surfaces after 3 s); the built swim is half run speed
   while the spec says "fast" and the research asks for x1.8 (§2a, §3.3 D). Save the primary text or mark the rules OPEN; Matt picks the
   speed.
8. **Settle the 23 guesses before helpers build on them** (§2): above all the dial (every row an estimate; no snap twig in its crumble
   range; past the research's gap margin from about World 8), the 45 s replay against the research's 2 s, the neighbour rules (50% shared,
   20% length) and the three different Easy landing widths.

What is ready and should be kept: the placement rules (hearts after risk, flags before hard parts, clutter caps, petals on the route),
the polish rules P-1 to P-13 and S-1 to S-9, the element and float rules with "rocks never float", the "a node that can't meet a line
fails with the piece named, never a reroll" principle, the shared jump predicate (P4), and the old-1-1-as-a-measured-bar method.

---

## 1. The research trace

**How it was built.** A "research row" is every table row (not a header) and every numbered item (not a bare link) in the 14 research
files the lead named (rule: `tools/engine/trace-rows.mjs`). That gives **1,632 rows**. Eight readers each read the whole spec and their
files and wrote one row per research row: the idea, and where the spec uses it (section and line), or MISSING, CONTRADICTED (how) or
n/a. I audited a random 12: 9 held, 3 gave the spec credit its line doesn't support (corrected, marked "[critic audit]"), so **"used" is
an upper bound**. Every row is in `reference/engine/CRITIC-TRACE.md` (each reader's ranked notes: `reference/engine/critic-runs/readers/`); `node tools/engine/trace-check.mjs` passes (1,632 of 1,632) and
fails, naming the row, when one is deleted (tested: removing `R3-fun-by-math.md:609` gives exit 1, "MISSING trace row for
R3-fun-by-math.md:609").

**The headline: the spec cites the research ledgers zero times (grep `ledger`, any case, in ENGINE-SPEC.md at 7f4373c0 and at
e0f4f978: 0 hits), names R1-R4 four times (L7, L109 "R3 F10", L505 "R3 W2", and the input list), and uses about a quarter of the
engine-relevant research fully.**

| | Rows | Used | Partial | Missing | Contradicted | n/a |
|---|---|---|---|---|---|---|
| All 14 files | 1,632 | 259 | 512 | 288 | 46 | 527 |
| Engine-relevant only | 1,105 | **259 (23%)** | **512 (46%)** | **288 (26%)** | **46 (4%)** | — |

Per file (used / partial / missing / contradicted / n/a): LEDGER-2026-11-02-full 25/68/39/9/57; LEDGER-2026-11-04-part1 29/60/40/7/106;
part2 20/77/76/12/57; LEDGER-CRITICAL-AGENTS 8/18/3/0/106 (mostly how to brief AI helpers); LEDGER-ENGINE-GEMINI 73/144/73/8/73;
LEDGER-ENGINE-PAPERS 42/28/18/3/29; R1 8/19/4/2/11; R2 7/13/5/1/13; R3 6/12/7/1/34; R4 4/9/6/0/6; GEMINI-PCG-RESEARCH 16/33/11/2/14;
GEMINI-LEDGER 18/21/6/1/15; GEMINI-VARIETY 3/5/0/0/2; MATT-RESEARCH 0/5/0/0/4.

Where the spec does match the research, it mostly got there by measuring the old 1-1 (the variety lines, the split rule, the share cap),
not by reading the research (A5 notes: "The spec never names Carmo, Tanagra, the premortem method or this ledger"). That is honest
work, but it means the research's game-wide ideas, which no one stage can show, are the ones that are missing.

### 1a. The MISSING and CONTRADICTED rows, ranked by how much they matter to "it's just repetitive"

Readers scored each MISSING row 1-5 (15 scored 5, 26 scored 4, 70 scored 3). Grouped by the idea (several ledgers repeat the same idea),
ranked by my reading of how much each fights sameness *across the whole game*:

1. **No stage is compared with other stages by how it plays.** GEMINI-LEDGER.md:39 (C7: 3-gram cosine under 0.78, 18-beat windows under
   0.28, `lookalike.ts` 0.30), GEMINI-PCG-RESEARCH.md:11, :406, LEDGER-2026-11-04-part2.md:52, :175, :290, :328 (against the last seven
   stages, by move order), STAGE-RULES §0c.6-7 (ccr L90-99: "compares every stage against every stage of every earlier world"),
   R3-fun-by-math.md:609 (a sequence distance calibrated for our lengths). The spec compares neighbours only, by a set of ideas (L41,
   L133), and nothing in the engine imports `era.ts`, `lookalike.ts` or `bands.ts`. **This is the measure of the problem Matt named, and
   the engine doesn't run it.**
2. **A world's force stops at its border.** LEDGER-2026-11-02-full.md:42-52 (#3; Gemini L105), :109, :276 (each world's hurry/patience
   polarity). CONTRADICTED by L1301-1305 and L1550-1561 (§3.3 B).
3. **Every stage has the same shape.** LEDGER-ENGINE-GEMINI.md:209, :442, :502 (each stage places its spike, rest and fork differently
   from the one before; the spec's only two plans, 1-5 L339-351 and 1-1 L1063-1075, are both 11 nodes with forks near n4-5 and n10, a rest
   near n5-6 and a cool-down at n11); LEDGER-2026-11-04-part1.md:315-318 and part2:113 (map shapes: loop-back, chimney, high/low split,
   hub). The spec's `arc` is a height trend (L1214).
4. **No stage owns a mechanic pair; no twist from an earlier world.** LEDGER-2026-11-02-full.md:24-40 (#1, #2), :72-76 (#6). The ladder's
   one joined beat per world (L1571-1583) is the only pair rule.
5. **Every world has the same ten slots in the same order.** LEDGER-2026-11-04-part2.md:18, :173, :230, :238; LEDGER-2026-11-02-full.md:62-70
   (#5), :124/:360 (a moving pressure at each X-8), :130-134 (X-9 previews the boss). CONTRADICTED by L1462 ("every world keeps its
   stages").
6. **No world-wide rule per world, no cause and effect between stages.** LEDGER-2026-11-04-part2.md:27, :59, :187, :231-237.
7. **The pool is too small and nothing checks it.** LEDGER-ENGINE-PAPERS.md:93, :162, :220 (a coverage table: at least 3 ideas for
   every entry, exit and tier); R1-shipped-pipelines.md:48 (L3) and the SMBF primary source (70-100 chunks a level for 6-8 used, per
   level, not shared; `reference/research/critic-2026-11-05/smbf-refenes-gamingbolt.md`); R1:514 (a save-wide memory of units shown);
   PAPERS:236 (least-used counts). 1-5 has about 18 ideas for 22-33 burst slots (A6 notes); the spec chose one shared library (L122-134).
8. **Nothing measures spread across rolls, or replays.** GEMINI-LEDGER.md:37 (C5, diversity ≥0.35), GEMINI-PCG-RESEARCH.md:15, :257;
   LEDGER-2026-11-04-part1.md:205, :207, :308, :367-369 (a replay never gets the last map and is ≥45% different). The spec judges 16 rolls
   against floors, never against each other, and never mentions when a player gets a new roll (§4.3).
9. **Timing variety.** LEDGER-ENGINE-GEMINI.md:127, :527 (hazards timed against his moves); part2:43, :330 (the same jump interval four
   times fails); R3:265 (CONTRADICTED: the fixed 1.0-1.2 s pad cannot find phrases, L799).
10. **New verbs and moves that change every old piece.** part1:100, :464, :470; part2:99, :365-366 (camouflage, belly slide, hang under a
    branch, stand still to wake the place). LEDGER-2026-11-02-full.md:116, :291 (a slow field that sends him up to a high road).
11. **Puzzle rooms that roll.** part1:52, :334, :343-346 (15-20 blueprints whose layout and step order roll); part1:115, :349-350 (search
    rooms that reassign their items). The spec keeps every room "as built".
12. **The finale and the checkpoints.** LEDGER-2026-11-02-full.md:78-84 (#7: a dense 15-20 s finale ending at the exit; the validator
    already allows it, `tools/validate/core.ts:309` FINALE_TIGHT_MAX 20, A1 notes) CONTRADICTED by the cool-down node (L351, L1075);
    :144-149 (#16: respawn within 2 s, 1-2 hard groups between flags) against L300's 45 s.

**Of the 46 CONTRADICTED rows, 13 contradict the research on purpose, by Matt's own rulings** ("the player's rhythm, not the song",
L1120; "never a reroll", L259; Matt plays every stage, L1031). Those are not defects; they need Matt only if the research should win.
A second audit of 12 random MISSING and CONTRADICTED rows found all 12 as stated. The full per-row lists are in CRITIC-TRACE.md.

---

## 2. Guesses: every number or rule that is neither measured nor sourced

Status words: **SOURCED** (the cited line says it), **MEASURED** (a run in our repo produced it; named), **RESEARCH ANSWERS** (research gives a
different or a firmer number; cited), **RUN ANSWERS** (my run on our code settles it; shown), **OPEN** (needs research or a run), **MATT** (his
words; not a guess). "Estimate" in the spec's own words is marked so.

Every number and hard rule in the spec, read line by line. Matt's own words (2:00 floor, no cap, hearts after risk, floating logs yes /
lily pads no, World 5 apart, lava only W9) are **MATT** and left out of the count. Measured lines from CP1-CP3 runs (the old 1-1's 9 / 7 /
572 / 1,516 / 1,351 px, splits 34 and 19, 171 of 202 landings, two-road 61%, Easy density 0.575, the cp2 counts) are **MEASURED** by the
planner's named files; I re-ran two of them (§3.2) and the rest I did not re-run, so they stay "measured by the planner".

Count (rows of the tables below): 2a has 13 rows, of which 11 are guesses the research contradicts or answers differently (L509
matches the research; L426 is a shipped rule); 2b has 4 that my runs answer; 2c has 8 OPEN (some rows hold several numbers). So
**23 rows of guesses**, beside the 7 sourced or checked items in 2d and the measured CP1-CP3 lines named above.

### 2a. Guesses that research answers (the spec's number differs from, or ignores, a research number)

| Spec | The spec says | Research answers it | So |
|---|---|---|---|
| L41, L133, L989, L1098 | neighbours share at most half their pieces/ideas | LEDGER-2026-11-04-part2.md:175 (C3), :328: >55% structural similarity against **N-1 to N-7** rejects; R1-shipped-pipelines.md:39 (L2) + SMBF primary source (`reference/research/critic-2026-11-05/smbf-refenes-gamingbolt.md`): "We keep track to avoid duplicates" game-wide | the window (1 neighbour) and the unit (an unordered set) are both narrower than the research; two stages two apart may be identical |
| L242 | one idea may be up to ~40% of a stage | R1:39-47 (L2): no unit repeats in a level; R1:48 (L3): pool several times what one level uses, cut per level | the 40% came from the old 1-1 only (L238-240). Research disagrees; it is a choice to defend, not a measured bar |
| L300 | replay to the fall "at most about 45 s (estimate)" | LEDGER-2026-11-02-full.md:144-149 (#16, Gemini L165): "respawn within two seconds", at most 1-2 hard groups between flags; part2:142/:181/:343: a checkpoint at every node entrance | spec's estimate is 20x the research's number; STAGE-RULES §0b.8 (L61) already says "respawn within about 2 s of the hard part" |
| L426 | flags at most 4,000 px apart (LV-9) | same rows as L300 | a shipped spacing rule, but checkpoint density is the research's main difficulty dial; the spec never measures "hard groups between flags" |
| L628-648 | the dial: "All are estimates" (L635) | R3-fun-by-math.md:42-44: E[lives] W1 Normal ≤1.0, about +0.5 a world; Easy W1 ≤0.3 | spec climbs 0.23 a world to 3.0 at 10-9 (R3's ramp gives about 5.5); 1-9 Easy gets 0.345, over R3's 0.3 (A7 notes c). No E[lives] check exists in engine-mixer (grep `E\[lives\]\|elives` in src/ tools/engine: 0 code hits) |
| L646 | crumble delay 0.9 → 0.5 s Normal, 1.2 → 0.8 Easy | LEDGER-2026-11-02-full.md:286-287 (#13, #14): snap twig ~0.15 s, creaking limb ~0.60 s; STAGE-RULES §0b.4 (L48-49) | the dial's range has no snap twig at all: the hurry variant the research and STAGE-RULES ask for can never be laid |
| L640 | gaps reach 0.92 of the gate's limit at d=1 | LEDGER-2026-11-04-part1.md:416 (A2): keep a 15% margin from the limit | from about d=0.75 (World 8) the dial is past the research's margin |
| L799 | Normal rest pad 1.0-1.2 s | R3:208-211, :265 (F13, W1): the in-burst gap between moves is ~1.33 s, longer than this "rest" | the pad cannot be told from an ordinary step; "longest run without a rest" (L800, L901) passes on it |
| L800 | Normal: no run over main's 29 s without a rest | R3:200, :547 (Launchpad 5-20 s groups; 8 of 9 old W1 stages fail); STAGE-RULES §0b.1 (L40-41) | the line keeps the failure R3 named, on Normal only |
| L509, L816 | Easy: no run over 20 s without a 2 s rest | same | matches Launchpad's top group length; fine |
| L1592 | "Pokey is fast in water" (no number) | LEDGER-2026-11-04-part1.md:219 (C15) and :264: research asks x1.8 run speed ("an agile, buoyant torpedo"); code `src/game/swim.ts:34-35` is `speed: 150`, "about half a run" (run is 285, `physics.ts:9`) | the spec states the opposite of the code and sets no number; the swim gate (L1618) can pass a slow swim |
| L1590-1591, L1618 | swims "at most 15-20 s under"; exits "3-4 body widths" | the only text is GEMINI-VARIETY-2026-11-02.md:19, a one-line triage: "in-and-out every 15-20 s ... wide clear exits". The full Gemini text has no water section (`reference/research/GEMINI-VARIETY-2026-11-02-full.txt`: grep water/swim, only L15 wading-drag and L147 water-level puzzles; LEDGER-2026-11-02-full.md:9-11 says the triage triaged a different, unsaved paste). "3-4 body-width landing aprons" is the paste's *connector* rule (GEMINI-VARIETY:28), not a swim exit | "in and out every 15-20 s" (a rhythm) became "at most 15-20 s under" (a cap). The built swim has no breath and he surfaces by himself after 3 s (`swim.ts:43-45`, `diveFor: 3`): the 20 s gate can never fail. The primary text is not in the repo |
| L1311-1321 | ladder amounts: touch 1-2, some 3-6, lots 7+; echo = next 2 stages; ≥1 in 3 later; ≥3 core moves from W2 | none of the research gives these. LEDGER-2026-11-02-full.md:42-52 (#3) gives the shape ("comes back later as the twist ... without re-teaching") | the amounts are the designer's; the research's "as the twist" is not in them |

### 2b. Guesses a run on our code answers (shown in §6)

| Spec | The spec says | My run | So |
|---|---|---|---|
| L1461, L1466-1481 | "the planner's all-world table ... 102 stages, 40 mechanics" is the source for "where things are today" | `tools/engine/moveladder.json`: `layouts: 2`; the stage order holds **101** stages: **4-D has no row in any mechanic** (§6 run 2). Absences in §A match within 1 stage | the table is two rolls, not 16, and one special stage is invisible to every ladder gate |
| L1497-1512, §D | water exists in W6-W8, swims "where water is drawn" | `gen2Water()` (the game's own test, `gen2/game.ts:104-109`) finds water in **13** gen2 stages (6-1 6-2 6-3 6-5 6-6 6-7 6-9 7-1 7-3 7-5 7-6 7-7 7-9); the table's `water` row sees **0** of them (§6 run 3): it counts only `rivers` and `waterSigns` (`tools/validate/mechanics.ts:34`) | every water and swim gate in §E would read "no water" for World 6 and 7 |
| L1464 | "a world the engine touches gets a regression lock like 1-5's" | the lock (`tools/engine/snapshot.ts:12`) holds `['1-1','1-5']` only. Fingerprints of 19 other stages, main vs engine-mixer, 3 rolls x 2 settings: **1-2, 1-3, 1-4, 1-6, 1-9 differ on 6 of 6 builds**; W2-W10 (14 stages) differ on 0 (§6 run 4) | World 1 is already changed with no lock; Worlds 2-10 are untouched today |
| L1077-1078, L1160 | 1-1 Normal 2:40-3:15 | the planner measured 109-119 s (L1160) | the band is a target the first build missed by ~45 s; it stays OPEN until rebuilt |

### 2c. OPEN: neither measured nor sourced

| Spec | Number or rule | Why it matters |
|---|---|---|
| L37 | two roads ≥120 px apart count as a split | sets every split count; 180 px is sourced (L1152, PLAN.md table 2.1), 120 is not |
| L424, L1087 | two-road share ≥40% (the reference is 61%) | a line set below the bar it copies, with no reason given |
| L458, L486 | creaky ≥15% of landings and top-3 | sets 1-5's theme strength; no measure of "theme" behind it |
| L667, L471 | neighbouring stages differ ≥20% in length; world spread ≥2.5 min | "designer's default; the planner proposes the measured number" (L668): never measured; R1 (A6 notes) reports Shovel Knight keeps lengths *consistent* |
| L700, L705, L911, L1057 | end piece over a 120 px drop; upper half has play in 3 of 4 views; ≤3 trunks per 1,400 px | polish thresholds with no still or study behind them |
| L314-316 | per view: ≤8 pickups "(estimate)", ≤2 kinds of hazard/animal, ≤3 kinds of standing piece | "set from the old 1-1 in CP1" (L320), but no CP1 number is reported for them; LEDGER-2026-11-04-part2.md:277 gives 1-3 active enemies (a count, not kinds) |
| L1215, L1363, L1380, L987 | element shares (ground ≥70%), float caps 15%/25%, core ≥50% of landings, boughs+creaky ≤30% | each sets what a stage may look like; none has a run or a source |
| L642, L468, L796 | Easy landing width: **260 → 150 px** (L642), **220 → 150** (L468), **about 300 px** (L796) | three different numbers for one knob; a helper cannot know which holds |

### 2d. Sourced, measured or Matt's (kept, with the check I made)

- L183-186 Easy rise caps: MEASURED (cp2 traces named). L227 crumble 1.0 s on Easy: MEASURED (0.3 s spare at 0.7 s).
- L651 bot floors 70% / 50% / 85%: SOURCED, STAGE-RULES §1b (L109-110). L1152 180 px: SOURCED, PLAN.md table 2.1 (157-185 px); R3:233
  agrees (full jump carries 185 px).
- L510 dead time 2.5 s: SOURCED to the validator (core.ts DEAD_WALK); note STAGE-RULES §2 says ~4 s / 2.0 s / 3.0 s
  (LEDGER-2026-11-02-full.md:211-213 found the three disagree; the spec picks one without saying so).
- L437 Easy roads within 400 px "under LONG_FALL": SOURCED, `engine.ts:232` `LONG_FALL = 400` (checked).
- L426 4,000 px: SOURCED, `levelCheck.ts:205` `FLIGHTS_MAX = 4000` (checked).
- L631 "Each new world's first stage starts at the previous world's middle ... STAGE-RULES §1b's rule that a new world eases in":
  **mis-cited.** §1b (L93-110) has no "eases in" rule; its rule is the bound "above the next world's middle ... is a bug" (L108-109). The
  formula sits exactly on that bound: 2-9 = 4-1 = 0.2727, 1-9 = 3-1 = 0.1818, 5-9 = 7-1 = 0.5455 (computed). Zero margin, and the dial is
  an input: §1b's bands are *measured* by the bots, which the spec does not run per world. The research the dial should come from says otherwise: GEMINI-PCG-RESEARCH.md:100, "Level 1 of a new world drops
  slightly below the **end** of the previous world" (the spec starts it at the middle, half a world lower).

---

## 3. Tunnel vision: World 1 and the mixer's current shape

### 3.1 Where the spec's attention goes (measured on the file)

- L1-1457 (89% of the spec) are World 1: the CP1-CP5 checkpoints, 1-5's and 1-1's node plans, their rulings and the polish rules. The
  whole-game plan is L1458-1635: **178 lines, 11%**. Its header says ~10:12 AM ET; MATT-DIRECTION.md:140 logs Matt's "the engine plans the WHOLE game" at
  ~11:10 AM ET. One of the two timestamps is wrong (the section answers the 11:10 bars, so it cannot predate them).
- Every pass line the engine defines (variety gate L30-41, splits 19, two-road 40%, the 9/7/572/1,516/1,351 px lines, Easy density,
  the 120 s clock) is calibrated on **one stage, the old 1-1**. L1232 makes those 1-5 lines the default for every stage that has no
  number of its own: "A stage with no number for a line takes the world default: today's 1-5 lines (splits 19, two-road 40%)". So a
  World 7 sprint or a World 6 swim inherits a canopy stage's split count unless someone overrides it.
- The code is World 1 by construction: `w1mix.ts` (1,221 lines) hard-codes `GROUND = 900`, `LIMIT = { yMin: 300, yMax: 1400 }`,
  `MUSHROOM_CAP = 14`, `HEIGHT = { bank: 120, stone: 50, log: 90 }` (`w1mix.ts:181-188, :328`); the library has 10 piece kinds and 23
  ideas, all World 1 (`library.ts:30-41, :65-89`; the only non-W1 theme on any piece is `crumble`'s `ruins`); `TAUGHT_BEFORE` stops at
  1-5 (`spec.ts:83-89`); `Element` is `ground | water | tree` (`spec.ts:14`) though §B uses cliff, cave, built, heat rock, falls and roots,
  and Matt's own words name `air` (MATT-DIRECTION.md:135-136).
- **The mixer is a third pipeline beside two that work.** Worlds 1-5 hand stages are built by `protoStage.ts`/`stageGenerator.ts`; 23
  stages of Worlds 5-8 are gen2 (`gen2/game.ts:89-95`: 5-7, 5-9, W6-W8 game stages), with curated seeds, the `--apart` look-alike curation
  and per-stage kits (`forStage`). The spec mentions gen2 once (L126, as a source of library pieces). It never says whether the mixer
  replaces gen2, sits on top of it, or leaves it alone, nor how gen2's curated 16 rolls and `lookalike.ts` gate carry over. A helper
  given a W7 stage would not know which builder it is writing for.

### 3.2 Spot-check of the spec's "today" numbers (13 numbers, 7 worlds)

Source of my counts: `tools/engine/moveladder.json` on engine-mixer 7d9ad9a9 (the spec's own cited table), the stage list from
`generateAllLevels()` (run 1, §6), and the code named. "Absence" = stages strictly between two uses, or after the last use, in play order.

| # | Spec claim (line) | World(s) | My count | Verdict |
|---|---|---|---|---|
| 1 | 102 stages (L1461) | all | 102 from `generateAllLevels()`, none secret; but the table's rows cover only **101** (4-D appears in none) | right count, one stage invisible |
| 2 | breaking branch: first 1-2, 22 stages, longest absence 41 "1-7 to 5-8" (L1477) | W1-W5 | first 1-2, 22 stages, last before the gap 1-6, next 5-8: **42** on the 101-stage order, **43** counting 4-D | stretch right; the number is 1-2 short |
| 3 | rope: 1-3, 13 stages, 35 "4-7 to 8-2" (L1478) | W1, W4, W8 | 1-3, 13, gap after 4-6 to 8-2: **36** | off by 1 |
| 4 | silk line: 5-4, 2 stages, 55 (L1475) | W5 | 5-4, 5-5; 55 to the end | right |
| 5 | lift: 2-7, 1 stage, 83 (L1473) | W2 | 2-7 only; **84** to the end of the 101 | off by 1 |
| 6 | river logs: 2-1, 7 stages all W2, 81 (L1474) | W2 | 2-1..2-9 minus 2-6, 2-8: 7, all W2; **82** | off by 1 |
| 7 | warm air: 4-7, 1 stage, 63 (L1472) | W4 | 4-7 only; **64** | off by 1 |
| 8 | push: 1-6, 4 stages, 61 (L1476) | W1, W4 | 1-6, 4-3, 4-8, 4-9; **62** | off by 1 |
| 9 | moving platform: 2-10, 10 stages, 29 (L1480) | W2, W5-W10 | 2-10 5-10 6-10 7-10 8-10 9-5 9-10 10-1 10-3 10-10: 10; **30** (2-10 to 5-10); 7 of the 10 are lairs | right shape; and only 3 non-lair stages in the game have one |
| 10 | hide in a bush: 1-7, 8 stages, 28 "8-3 to the end" (L1479) | W1, W3, W4, W6, W8 | 1-7 3-2 3-7 4-5 6-2 6-3 6-7 8-2: 8; 28 after 8-2 | right |
| 11 | liana longest absence 4; tayra 5; harpy 8; finds 3 (L1484-1488) | W4-W10 | liana 4 (4-5 to 4-10, **5** with 4-D), tayra 5, harpy 8, find 3 | right |
| 12 | "24 of 90 stages have no animal" (L194) | all | 31 of the 101 rows have no animal row; less the 10 lairs and 5-M: **20 of 90** standard stages | different tool (cp2 `enemies.txt` vs MECHS); the two disagree by 4 |
| 13 | "moving platforms appear only 17 times" (L193) | all | in 10 stages (MECHS); 17 is a placement count from cp2 | consistent (different unit) |
| 14 | W6 elements "water, roots, ground", swims W6-W8 (L1502, L1600) | W6, W7 | water in 13 gen2 stages (W6: 7, W7: 6) by `gen2Water`; the table's water row: 0 (run 3) | **the gate's data cannot see it** |
| 15 | special stages "kept as built" (L1495-1506) | W4, W6, W8 | the shipped special stages include **4-D** (Dot's flight, `generateAllLevels`), **6-8 Stilt Climb** and **8-4 Lantern Run** (`protoStage.ts:497-503`, `stagePlan.ts` W8 comment "8-4 is the special stage") | **4-D and 8-4 missing from the table**; 6-8 named only in §D. The W2/W3 "specials" (cages, searches) are ordinary stage types |

The off-by-one in rows 2-8 is a counting convention the spec doesn't define (the tail may stop at 10-9, or lairs/5-M may be skipped). It
does not change any ranking. The real faults are rows 1, 14 and 15: the table that every whole-game gate reads is blind to one stage, to
all water from World 6 on, and to swim and glide (L1490 admits those two), and it was measured on 2 layouts, not the 16 every other line
uses (`moveladder.json` `"layouts": 2`).

### 3.3 The whole-game parts (A-F), checked against the code and the research

**A. The diagnosis is right but partial.** "Taught, then dropped" (L1468) is one cause. The research's ranked causes are wider:
the same slot order in every world (LEDGER-2026-11-04-part2.md:18, :173, :230, :238), one shape of map for every stage (part1:315-318,
part2:113), no stage owning a mechanic pair (LEDGER-2026-11-02-full.md:24-31), no world-wide rule per world (part2:27, :231). §A
measures only the first.

**B. The world table locks hazards to their home world, which is the research's named failure.** L1301-1305 and the hazard table
(L1550-1561): "dark and spores (W3), thorn vines (W3), wind (W4), webs (W5), the tide (W6), crumbling floors (W7), geysers (W9) and bolts
(W10) ... They may come back in a later world only where the element fits". Against:
- STAGE-RULES §0.1 (L19-20, Matt 2026-11-02): "A mechanic taught in World N comes back in every later world, harder or combined with
  that world's new one. A world that only uses its own new thing (or nothing) fails."
- LEDGER-2026-11-02-full.md:42-52 (#3), Gemini full text L105: "A common structural failure ... introducing wind in World 4 and
  abandoning it in World 5. Instead ... a mechanic taught as the primary focus of an early world should return later in the campaign
  without retraining to serve as the twist". The ledger shows the code does exactly that: `zoneRecipes` gives each zone kind to one world
  (`zones.ts:424-433`).
- Measured today (`moveladder.json`): wind in 6 stages, all W4; web 1 stage; spores 5 stages (W3); tide 3 (W6); crumbling floors 3 (W7);
  thorn vines 5 (3-4 to 3-9). The spec's table returns geysers and bolts **nowhere**, webs nowhere, spores "if art fits", and tide to
  W2 only after 6-4. So §C keeps the repetition source it should remove: a world's special force ends at its border.
- Matt said the same of animals and pieces (MATT-DIRECTION.md:59-60, 67-69: "once you introduce them, they can be anywhere"); the spec
  applies that to animals (L1307, L1563-1567) but not to the hazards that make worlds play differently.

**C. The ladder counts presence, not combination.** "Every world has one stage that joins its own move with an older one in one beat"
(L1571-1583): one stage per world. The research makes the pair on one beat the identity of *every* stage (LEDGER-2026-11-02-full.md:24-40,
Gemini L61: "every three-to-five-minute stage becomes a self-contained four-act showcase for a specific mechanical pairing") and the
twist part of most stages an earlier world's mechanic (#3). One joined beat in nine stages leaves eight stages per world with no pair.
The ladder also lists moves the code's `Move` type cannot hold (liana, rope, hide, push, punch, river log, lift, moving platform, silk,
hold: `spec.ts:17` has run, jump, double, bounce, climb, creaky, crumble, swim, glide) and none the research adds (camouflage, belly
slide, under-branch hang: LEDGER-2026-11-04-part1.md:100, :464, :470; part2:99, :365-366). The ladder table itself (L1282-1299) still
says liana is taught in 1-6 and creaky in 1-5, which the 10:09 ruling (L1429-1433) moved to 1-2.

**D. Water and swims rest on a summary, and the built swim contradicts it.** See §2a rows L1590-1592 and L1618. In short: the rules'
only text is a one-line triage of an unsaved paste; the built swim is half run speed (`swim.ts:34-35`), the research and Matt's idea
("suddenly fast", ROADMAP R-5.22) want it faster than the run; a dive ends by itself after 3 s, so "at most 20 s under" can never
fail; and the gate's water data sees no water in W6-W7 (run 3). §D also makes 6-9 the swimming stage. 6-9 is "Blackwater", the world's
X-9 gauntlet (`stagePlan.ts` W6 row 9: "Fight through the blackwater and reach the shrine"), whose research job is to preview the boss
(LEDGER-2026-11-02-full.md:130-134, #14). Turning the X-9 into a swim stage changes its slot role without saying so.

**E. The gates check presence over time, never sameness across stages.** Gates 1-6 (L1614-1620): untaught, dropped, off-element,
mixing, swim, known list. None compares one stage with another by how it plays. The game already has that gate: `tools/inspect/era.ts`
and `lookalike.ts` (STAGE-RULES §2 "Sameness" rows, L138-140: cosine under ~0.78, 20 s stretches under 0.30, diversity ~0.35 between
rolls). Nothing in `tools/engine` or `src/game/mixer` imports them (grep `era.ts|lookalike|bands.ts`: 0 hits). The engine's own variety
gate counts pieces (L30-41). R3-fun-by-math.md:609 gives a length-calibrated sequence distance (self ≈0.09, shuffle ≈0.62) built for
exactly this.

**F. Order and cost.** "Worlds 2-10 are not rebuilt now. The gates report on them" (L1629). That is the right order, but with the gates'
data as it is (§3.2 rows 1, 14), the report on Worlds 6-7 would be wrong from day one, and its "known list" (L1619) would bake the error
in as a list that only shrinks.

### 3.4 The key idea, run: the game's own variety gate on the mixer's stages

The finding ranked first in §1a is that the engine never compares stages by how they play. The game has that gate already:
`tools/inspect/era.ts`, the 200-roll tool STAGE-RULES §2 names for "Variety across rolls" (diversity about 0.35 or more) and
"Sameness" (L138-140). I ran it on World 1, 16 rolls, on `main` (the old stages) and on `engine-mixer` (the mixer's 1-1 and 1-5):

| Stage | diversity between rolls, main (old) | engine-mixer | distinct move sequences in 16 rolls, main / mixer | look-alike stages (rolls of 16), engine-mixer |
|---|---|---|---|---|
| 1-1 | **0.384** | **0.021** | 1 / 1 | 1-2: 16, **1-5: 15**, 1-7: 3 |
| 1-5 | **0.494** | **0.014** | 11 / 6 | **1-1: 15**, 1-2: 14 |
| 1-2 | 0.286 | 0.063 | 1 / 10 | 1-1: 16, 1-5: 14 |
| 1-3 | 0.310 | 0.032 | 6 / 6 | 1-9: 13 |
| 1-4 | 0.125 | 0.031 | 12 / 5 | — |
| 1-6 | 0.275 | 0.257 | 15 / 15 | (unchanged stage) |

(`reference/engine/critic-runs/era-compare.txt`; diversity = mean 1 − cosine of action 3-grams between rolls; 1-6 to 1-9 did not change
and score about the same on both branches, which is the control.)

**What it says.** By the measure STAGE-RULES already uses, the mixer's rolls of 1-1 and 1-5 are 98-99% alike to each other (old: 51-62%),
and the new 1-1 plays like the new 1-5 on 15 of 16 rolls, though the spec's plan for 1-1 was "a ground stage that becomes a tree
stage ... so it isn't all branches like the last one" (L975-990) and its own feel lines pass. To be fair to the mixer: on main the old 1-1 already matched 1-2 on 16 of 16 rolls, so neighbour look-alikes are not new;
what is new is that the rolls of one stage stopped differing (0.38 → 0.02) and that 1-1 and 1-5, four stages apart, now match. The mixer varies piece kinds and sizes
(16 distinct piece sets of 16) while the moves stay the same: STAGE-RULES §6 (L326-333) records this exact trap on 2026-10-28,
"Variety is a different mix of actions, not a different order ... versions [that] use the same moves ... read 90-95% alike".
**Caveat, named:** era's route reads coarse action letters and walks one road, so it undercounts size variety and the second road (its
own blind spots are in STAGE-RULES §6, L310-319). That is why the spec needs a measure of its own, calibrated on Matt's favourites
(R3:607-609), not why it can skip this one. Matt felt 1-5 "played much better" (MATT-DIRECTION.md:39): his read and this number can both
be true, since one play cannot show roll-to-roll sameness; replays and later worlds will.

### 3.5 What changed in the spec after 7f4373c0 (L1636-1734, e0f4f978) and LABELS.md

Read after the review. The 10:24 AM ruling widens the element table to every world and makes hanging moves core; LABELS.md labels 426
inventory kinds across all worlds; rocks never float (10:40 AM); the 1-1 acceptance test (≤1.2-1.7 h, ≤2 data-only fix rounds, no engine
change). These answer part of §3.1 (the W1-only element table) on paper. They do not change the code (`library.ts` at da11cc4e still has
10 kinds and 23 ideas; run 6 gives the same 6 and 4 problems there), and LABELS.md keeps the hazards home ("zones: web | W5 only";
wind "returns W8 tops and W10 steps"; geysers and bolts absent), so §3.3 B stands.

---

## 4. Build on what works: what the spec risks breaking, and the locks

Matt (MATT-DIRECTION.md:149-150, 160-162): "most of the game works. It's just repetitive. Let's not break everything we've done ... The 1-5
regression lock pattern applies to every world it touches."

### 4.1 What is locked today, and what is not (run 4, §6)

- **The lock covers the engine's own output, not the stages it replaces.** `tools/engine/snapshot.ts:12` fingerprints `['1-1', '1-5']`,
  16 rolls x 2 settings, as the *mixer* builds them (64/64 unchanged, run 5). It proves a refactor of the mixer changes nothing; it says
  nothing about any stage the mixer does not build.
- **World 1 has already moved without a lock.** I fingerprinted 19 stages the same way (platforms, vines, pickups, flags, size, spawn,
  goal) on `main` 68b31e66 and `engine-mixer` 7d9ad9a9, rolls 1-3, Normal and Easy: **1-2, 1-3, 1-4, 1-6 and 1-9 differ on 6 of 6 builds
  each**; 2-2, 2-4, 2-8, 3-2, 3-5, 4-4, 4-7, 5-4, 6-3, 6-7, 7-6, 8-2, 9-5 and 10-4 differ on 0. engine-mixer is 633 commits past its
  merge base with main and carries 11-04's work (`w1Rhythm.ts` +1,367, `w1Rise.ts` +619, `w1Pits.ts` +481, `protoStage.ts` +1,121,
  `engine.ts` +404, `levelCheck.ts`, `goals.ts`, `easyMode.ts`, `gen2/game.ts`, `git diff --stat`). The spec says "Nothing from 11-04
  ships" (L10) but names no way to separate the engine from the 11-04 changes it sits on.
- **Worlds 2-10 are untouched today** (14 stages, 0 of 84 builds differ). Good, and the spec's order (L1629, "not rebuilt now") keeps it so.

### 4.2 What the spec plans that can break working things

| Plan (spec line) | What it touches | Lock planned? |
|---|---|---|
| P-8 pit art, P-9 HUD on top, P-10 darkness fade (L715-725, "engine work"); the deep-pit dark that "changes every World 1 bank end" (L860-863) | shared renderers used by every world (the pit painter, the HUD, the cave darkness layer) | none named. `drawcheck`/`clipcheck` catch cost and clipping, not a changed look in W3's caves or W8's night |
| The water zone as "shared drawing (engine-render)" (L1189-1191, L1342-1343) | the water every world draws today: W2's river, W6's painted dirty water (STAGE-RULES §4 L168-173: Matt's "quick fixes just don't work") | none |
| The shared library "World 2's lily pads, logs and river ... gen2's World 6-8 sections" (L126-129) | gen2's sections, curated seeds and `--apart` curation (STAGE-RULES §6 L331-344) | none; gen2's 16 curated rolls per stage are not mentioned |
| Crumble slab leaves World 1 (L1450-1456), `crumble` still tagged `forest` in code (`library.ts:37`) | 1-5's ground breakables | a named breach, fine |
| Element gate and theme check (L1256-1259, L1382-1387) applied "world by world" | every later world's pieces | the gate itself is a check, but no world has its object pass yet (L1386-1387) |
| The move ladder's "every world gets push beats", "W3 and W4 get bounces", "W2-W4 get breaking branches", "W7, W10 lift" (L1535-1548) | stages in every world | L1629 says report only; correct, as long as no stage is edited before its world's lock |

### 4.3 Two working features the engine branch already broke

1. **Replay variety for 1-1 and 1-5.** `layoutMemory.ts` keeps a fresh replay away from the roll just played (Matt's choice, 2026-10-23;
   `AWAY = { min: 0.35, tries: 24 }`, `layoutMemory.ts:112`). On engine-mixer, 1-1 and 1-5 are built by the mixer (`protoStage.ts:494`,
   `:511`), but the distance still reads the old builders: 1-5 through `rhythmRollDistance` on `w1Rhythm.ts`'s layout (`RHYTHM_STAGES`
   = `['1-2','1-5']`, `w1Rhythm.ts:31`, `:1331-1332`; `layoutMemory.ts:129-130`), 1-1 through `w1RollDistance` on `w1Sections.ts`'s slot
   picks (`w1Sections.ts:174-175`, `isW1Stage` `/^1-[1-9]$/`). So the "farthest roll" is chosen on a stage the player never sees. No
   test covers it; the spec never mentions replay rolls at all (grep "replay": only L300, L361, L463, none about rolls).
2. **The move table's own coverage.** Not a break, but a measuring tool trusted before it was tested (lesson D15): 4-D has no row and
   W6-W7 water reads 0 (run 2, run 3).

### 4.4 Regression locks needed before the engine touches a world (not in the spec)

For every world, before its first engine change: (a) `snapshot.ts`'s fingerprint over every stage of that world on its shipped rolls
(16, or gen2's 16 curated), both settings, from `main`; (b) the world's existing gates green on that base (`era.ts`, `lookalike.ts`
`--apart`, `bands.ts`, `firsttimer`, the puzzle validator and the boss tests); (c) stills of each special stage, puzzle room and lair at
the six standard places, upright and sideways; (d) an old-save, half-save and finished-save load of that world (LAWS 2) to prove saved
layout numbers and goals still resolve after the stage is rebuilt (`layoutMemory.ts` stores a layout number per stage; a rebuilt stage
reads an old number as a different stage). The spec has (a) for 1-1 and 1-5 only, none of (b)-(d).

---

## 5. Helper-ready: what a fresh helper with only a story brief and a feel profile would have to guess

**The test I ran (run 6, §6):** I wrote what a fresh helper would write for two real stages, using only the spec's profile format
(L1208-1230) and the engine's own `StageSpec` type, and put them through `checkSpec` with the shipped library:
- **2-4 "Over the Water"** (World 2's vine stage): 6 problems. "liana swing" and "drifting logs" are "not an idea the engine knows"; "bank
  hops", "lily-pad hop", "reed isles" and "snap dash" are refused as "not taught yet", because `TAUGHT_BEFORE` has no entry past 1-5, so
  a World 2 stage starts knowing no move at all (`spec.ts:83-89`, `:118`).
- **6-9 "Blackwater"** (the spec's swimming stage, §D): 4 problems: "swim", "caiman log", "rope crossing" unknown; "lily-pad hop" untaught.
- The same two specs would be held to `linesFor` lines of splits ≥4, two-road ≥10%, ups and downs on 85% of landings, Normal's longest run
  ≤29 s (2-4) or ≤35 s (6-9), whatever the world (`spec.ts:104-111`).

So today a helper can build a stage only in World 1, from 23 World 1 ideas. Everything below is what a helper with only a story brief and
a feel profile would have to guess, even after the library grows.

**A. Words the profile uses that the code does not have, or has differently**
1. `pace` is "calm / march / brisk / sprint" in the spec (L1218); the code's `tempo` is "calm / steady / brisk" (`spec.ts:24`). Which?
2. `water` is "none / creek ×n / lake / swamp", with x-range, surface, depth and `swim: yes|no` per body (L1216, L1587-1588); the code
   has `water: boolean` (`spec.ts:30`). No body, no depth, no swim flag.
3. `arc` "rises / descends / level / wave" with a band per node (L1214); the code has `trend: up | down | level` (`spec.ts:22`) and an
   optional `height` per node (`spec.ts:66`). No "wave".
4. `elements` as share ranges (L1215), `owns`, `unlike`, `caps`, `float`, `marks` (L1222-1228, L1351-1365): none is in `Profile`
   (`spec.ts:20-46`). `core` is there.
5. The rhythm pattern each node draws, "regular, swing, broken, wait-and-go" (L1120-1121): no field, no definition of any of the four, no
   measure. A helper cannot ask for it.

**B. Numbers a helper must invent for any stage that isn't 1-1 or 1-5**
6. Its split floor and two-road share: "A stage with no number for a line takes the world default: today's 1-5 lines" (L1232), and
   `linesFor` gives 0 / 4 / 10 / 19 by one word (`spec.ts:105`). Nothing says what "light" branching is for a swim, a slide or a climb.
7. Its length band: only the 2:00 floor, the ±20% neighbour rule (L667) and the world spread (L674). The neighbour's length is not known
   until the neighbour is built, so a helper working in parallel with 2-3 others cannot meet a 20% rule against stages not yet built.
8. Easy landing width: 260 → 150 (L642), 220 → 150 (L468) or ~300 (L796).
9. Its d and what it sets: the dial (L628-648) is "estimates, to be tuned on Matt's play" (L635-636), and gives no density, no swim, wind
   or animal-tempo row.
10. Its per-view clutter caps (L313-316) for a world with no old-1-1 baseline (caves, night, swamp).

**C. Decisions the spec leaves open that change what gets built**
11. Which builder: the mixer (`w1mix.ts`), gen2 (W5-W8 kits with curated seeds) or a hand builder (special stages). The spec never says
    (§3.1).
12. Which hazards a stage in World N may use from earlier worlds: "only where the element fits" (L1305) with no list of fits, and the
    hazard table returns most of them nowhere (§3.3 B).
13. What its mechanic pair is and which earlier-world mechanic is its twist: not a profile field (§3.3 C).
14. Which slot role it has (X-1 arrival ... X-9 boss preview) and how its camera, density and kind of thinking must differ from its
    neighbours (LEDGER-2026-11-02-full.md:62-70, #5): no field; §B keeps every world's slot order (L1462).
15. Animals: the mixer "lays no animals yet" and "thorns and costly pits are not in the library yet" (`library.ts:101-104`). How an animal
    is taught, placed and made harder (L212-221 for the boa and turtle only) is not a general rule.
16. Puzzle rooms, cages and searches: "kept as built" (L1462); how a stage spec includes one (a node? a fixed piece?) is not said.
17. Which gates a stage passes: the spec's gates (variety L30-41, placement L270-321, pacing, polish P-1..P-13, S-1..S-9, ladder §E) and
    the game's (STAGE-RULES §5's inspector, `era.ts`, `firsttimer`, bands) are never put in one list with one command. "One command a
    stage" (L1627-1628) is planned, not built; `tools/engine` has `cp3-*` and `cp4-*` one-off scripts per checkpoint.
18. The how-to: Matt's bar 4 asks for "its own how-to (reference/methods/), proved by one helper building a stage from it cold"
    (MATT-DIRECTION.md:163-165). The spec names it as a cost item (L1634) only; the only stage method on engine-mixer, `reference/methods/stage-build.md`,
    is 11-04's "building a stage on the beat" (moves "on the music's beat (beatTrace.ts)", its L1-6), which the spec overturns (L1120,
    "the player's rhythm, not the song"). A fresh helper who follows LAWS 4 ("start every job from its file in reference/methods/") is
    sent to the method the engine replaced.

**Verdict for this part: not helper-ready.** A helper could write a profile, but `checkSpec` would refuse every stage outside 1-1..1-5,
and for any stage it accepted the helper would have to choose 18 things the spec does not decide.

---

## 6. The runs I made (commands and output)

All on engine-mixer 7d9ad9a9 (worktree, `bun install --frozen-lockfile`) unless named; main is 68b31e66. Scripts are in
`tools/engine/critic/` on this branch (outputs in `reference/engine/critic-runs/`) so the lead can re-run them.

1. **The stage list.** `npx tsx tools/engine/critic/stages.ts` → `all 102 nonsecret 102`; order `... 4-5 4-D 4-6 ... 5-M 5-1 ...`.
2. **The move table, recounted.** `tools/engine/moveladder.json`: `"layouts": 2`, `"stages": 102`; the union of every row's stages is
   101; 4-D is in none. Recounted firsts, counts and longest absences: §3.2 table (python over the JSON, `tools/engine/critic/ladder.py`).
3. **Water the gates can't see.** `npx tsx tools/engine/critic/water-w6.ts` →
   `gen2 stages: 23; with water by gen2Water: 13 (6-1 6-2 6-3 6-5 6-6 6-7 6-9 7-1 7-3 7-5 7-6 7-7 7-9)` /
   `of those, the move table's water row sees: 0`.
4. **What the engine branch already changed outside its lock.** `ROOT=<worktree> npx tsx tools/engine/critic/fp.mts` on main and engine-mixer
   (snapshot.ts's fingerprint, rolls 1-3, Normal and Easy, 19 stages): `1-2, 1-3, 1-4, 1-6, 1-9: 6/6 builds differ`; `2-2 2-4 2-8 3-2 3-5
   4-4 4-7 5-4 6-3 6-7 7-6 8-2 9-5 10-4: 0/6 differ`.
5. **The engine's own checks, as they are.** `npx tsx tools/engine/snapshot.ts` → `snapshot: 64/64 unchanged; 1-1 changed 0; 1-5 changed
   0` (29 s); `tools/engine/spec-check.ts` → `1-1 Into the Canopy: OK`, `1-5 The Folded Petals: OK`, exit 0;
   `tools/engine/library-check.ts` → `library check: 23 ideas, every one described; both plans draw only from the library`, exit 0.
6. **A fresh helper's spec for 2-4 and 6-9.** `npx tsx tools/engine/critic/helper-try.ts` → `2-4 Over the Water: 6 problem(s)` ("liana swing" and
   "drifting logs" unknown; four ideas "not taught yet"); `6-9 Blackwater: 4 problem(s)` ("swim", "caiman log", "rope crossing" unknown;
   "lily-pad hop" untaught); `library ideas: 23 | piece kinds: 10 | kinds with a non-W1 theme: crumble`.
7. **The dial at world edges.** `d(w,s) = (0.1(w-1) + 0.2(s-1)/8)/1.1`: 2-9 0.2727 = 4-1 0.2727; 1-9 0.1818 = 3-1 0.1818; 5-9 0.5455 = 7-1
   0.5455; 2-8 0.25.
8. **Code facts checked by grep** (cited where used): `swim.ts:34-35` speed 150; `swim.ts:43-45` dive 3 s, "no breath to watch";
   `engine.ts:232` LONG_FALL 400; `levelCheck.ts:205` FLIGHTS_MAX 4000; `physics.ts:9` maxRun 285; `mechanics.ts:34` water = rivers +
   waterSigns; `layoutMemory.ts:112, :129-130`; `w1Rhythm.ts:31, :1331-1332`; `protoStage.ts:494, :511`; no import of `era.ts`,
   `lookalike` or `bands.ts` under `tools/engine` or `src/game/mixer`.
9. **Primary source opened:** Refenes on SMBF's chunks (gamingbolt, 2021-01-18), saved with URL and date at
   `reference/research/critic-2026-11-05/smbf-refenes-gamingbolt.md`. It confirms R1 L2-L3 word for word.
10. **The game's variety gate on both branches.** `npx tsx tools/inspect/era.ts --worlds 1 --rolls 16 --bots 0 --look 16 --json …` in
    each worktree (67 s each): §3.4's table, raw in `reference/engine/critic-runs/era-compare.txt`.
11. **Re-run on engine-mixer's new head da11cc4e** (moved during the review): run 6 gives the same 6 and 4 problems; spec-check OK x2;
    snapshot 64/64 unchanged. `spec.ts:14` Element and `:17` Move unchanged.

---

## 7. Cross-check against the designer's SPEC-TRACE.md

Read only after §1 and §2 were written (the lead's instruction). `reference/engine/SPEC-TRACE.md` at engine-spec e0f4f978 (1,077
lines, 621 rows: MEASURED 152, SOURCED 153, MATT 131, DERIVED 25, OPEN 160). Its direction is spec → source; mine is research → spec,
so the two overlap on the spec's numbers. It agrees with me on most: L41, L300, L640, L642, L646, L667, L1311, L1317 are OPEN in both;
L631 is mis-cited in both (it found GP:100 "slightly below the end" too). **Where we disagree (each is a finding):**

| Spec | SPEC-TRACE's tag and citation | What the cited line actually says / my tag |
|---|---|---|
| L1305 "They come back only where the element fits" | **SOURCED**, SR §0c.7 (ccr:93-96) | I opened it (STAGE-RULES.md on ccr-0d59a91c-oy3imz, L93-99). §0c.7 is about **layout templates** ("a template belongs to one world, and a later world may bring one back only if it changes something you feel ... and pairs it with that world's own mechanic"), not hazards or mechanics. The same file's §0.1 (ccr L19-20) says the opposite of L1305 for mechanics: "comes back in every later world". **The citation does not say what the spec claims.** My tag: CONTRADICTED (§3.3 B) |
| L1302 hazards stay home (W3 dark ... W10 bolts) | **MEASURED**, ML zone rows | the table measures where hazards are *today*. That is the repetition being diagnosed, not a reason to keep it. Measured as a fact, unsupported as a rule |
| §0c.7 (ccr L96-99): "The validator compares every stage against every stage of every earlier world ... This check is built before World 2 is rebuilt" | not traced as a requirement on the engine | a binding STAGE-RULES rule (Matt, 2026-11-04) the engine's gates (§E) do not carry. Neither SPEC-TRACE nor the spec names it |
| L1590-1596 swims ≤15-20 s under, exits 3-4 body widths, "fail over 20 s under" | **SOURCED**, GVs:19 | GVs:19 is a one-line triage ("in-and-out every 15-20 s ... wide clear exits"). It gives no body widths (those are the connector "landing aprons", GVs:28); "in and out every 15-20 s" is a rhythm, not a cap on time under; the full Gemini text has no water section (LEDGER-2026-11-02-full.md:9-11). My tag: SOURCED to a summary of an unsaved text, and misread |
| L1592 "no slow drag: Pokey is fast in water" | SOURCED (RM:160, MD:141-158) | Matt's "suddenly fast" is real (ROADMAP R-5.22), but the built swim is half a run (`swim.ts:34-35`) and the spec says "swimming is built" (L1585). The code contradicts the spec's claim |
| L1461 "102 stages, 40 mechanics" | **MEASURED**, ML | measured, but by a table with 2 layouts, 101 stages covered (4-D in no row) and no W6-W7 water (§3.2). MEASURED by an untested tool (D15) |
| L1232 the 1-5 lines as every stage's default | **MEASURED** (as L411, L424) | the numbers are measured on 1-5; using them as the default for 101 other stages is a rule with no source. My tag: OPEN |
| L424 two-road ≥40% | MEASURED (old 1-1 0.61) | its note agrees the 40% is the designer's; the line is OPEN, the 61% MEASURED |
| L242 no idea over ~40% | MEASURED (cp2 idea-tags 41%) | measured on the old 1-1; contradicted by R1:39-47 (no unit repeats in a level) and the SMBF primary source. Both tags hold; the research one is missing from SPEC-TRACE's row |
| L1462-1464 keep every stage, lock before change | SOURCED (96ac0259, CLAUDE.md) | true as a rule, but "kept as built" omits 4-D and 8-4 (§3.2 row 15), and the lock covers only 1-1 and 1-5 (§4.1) |

SPEC-TRACE's own count of unused research rows is 234 (its a8). Mine is 288 MISSING and 46 CONTRADICTED of 1,105 engine-relevant rows
(§1). They count different units (it counts ledger rows and items once; I count every row the trace-rows rule finds, including the
ledgers' summary lists that repeat their table rows), so the two numbers are not comparable one to one; both say about a quarter of the
research is unused.

---

## 8. Method used, lessons applied, method update

**Method used.** `reference/methods/research-ledger.md` (on engine-mixer): split the text so every line is read by someone (eight readers,
one to three files each, every one also reading the whole spec); one row per research row; counts by script (`trace-rows.mjs`,
`assemble` step, `trace-check.mjs`), never by hand; every claim about our game checked in code (§6 run 8). For the review itself,
`reference/methods/quality-review.md`'s rule that a finding carries its evidence.

**Lessons applied.**
- D15 (test the measuring tool before trusting it): the move table every whole-game gate reads was tested and found blind (§3.2).
- D7, D24 (read the value, grep the whole tree): swim speed, LONG_FALL, FLIGHTS_MAX, the replay distance and the lock list were read in
  code, not taken from the spec.
- D19 (a gate must call the code the screen calls): the replay distance on engine-mixer measures builders the screen no longer uses (§4.3).
- D20 (times from `date`): the times in §0 are pasted from `TZ=America/New_York date`.
- "Numbers from one roll": the fingerprint run uses 3 rolls x 2 settings per stage; the move table's 2 layouts are flagged.
- Law 3 (check the fact): every reader's MISSING was re-searched by me on a sample; 3 of 12 "used" rows were corrected.

**Method update (proposed, for the lead to merge).**
1. *What worked better, with proof:* a trace with a row rule and a count gate. Eight readers covered 1,632 rows in about 10-16 minutes
   each (agent run times 408-950 s), and `trace-check.mjs` proves none was dropped. Add to research-ledger.md: "a trace of research →
   spec carries a row-rule script and a count gate; a ledger without one can lose rows silently".
2. *What failed:* readers over-credit. 3 of 12 sampled "used" rows were partial. Add: "audit a random 10-15 'used' rows before quoting
   the used count; report used as an upper bound".
3. *Gap found:* the research-ledger method has no step for "the summary we act on is not the saved text". GEMINI-VARIETY's water rules
   are a triage line of an unsaved paste, and the spec built a gate on it. Add to step 1: "a rule taken from a triage row names the saved
   primary text and line; if none is saved, the rule is OPEN until it is".
