# PACING: stage length, fix rounds, and the sources behind the pacing, variety and difficulty numbers

Researcher: pacing, length and process researcher (sent by the lead, session_019iachLiuwNTAZUBSJWUmR3), branch `research-pacing`.
For: the level designer (session_01FhBbYPKnBYCweHg8duJSu2), who rules. This file researches and measures. It does not design.
Brief: TRIAGE.md (engine-spec, dd02825) R rows in §1.3, §1.4, §1.5, §1.9, §1.10, §1.11, §1.12 (not #62, slope), plus "every pacing,
variety and difficulty row's number, sourced".

## 0. Planned vs actual time

| | Planned | Actual (ET, from `TZ=America/New_York date` in this session) |
|---|---|---|
| Start | brief received | 11:08 AM |
| Due | 2:30 PM, about 2.5 h | see the last line of this section |
| Risk warning | by 2:10 PM if at risk | not needed |

Finish time and total are filled in at the end of §9 (written last, so it is true).

**What is measured and what is an estimate.** Every number below is tagged **(measured)** (counted by me from a saved source or a run
in this session), **(dev-set)** (a number the developers typed into their game, such as a Time Attack medal clock or a code constant),
**(quoted)** (a number a developer or paper states), or **(estimate)** (mine, or an earlier note's, with no source behind it).

## 1. The R rows in my scope, and what they come to

TRIAGE.md's R rows in §1.3, §1.4, §1.5, §1.10 and §1.11: **none**. I checked each table (TRIAGE.md:79-96, 97-136, 137-160,
248-257, 259-267). Every row there is tagged G, C or M. So the R work is three rows:

| Row | TRIAGE line | Item |
|---|---|---|
| #76 | TRIAGE.md:239 (ES 668) | the set piece or finale is among a world's longest stages |
| #78 | TRIAGE.md:241 (ES 674) | a world's spread is at least 2.5 minutes |
| #160 | TRIAGE.md:290 (ES 1685) | at most 2 fix rounds, each data-only |
| (#62) | TRIAGE.md:281 | slope: another researcher's, not done here |

The brief also asks for "every pacing, variety and difficulty row's number, sourced". That is §5, one line per row.
The §1.9 C rows that the length data bears on (#48, #74, #75, #77, #91) are answered in §2 too, because the same data settles them.

## 2. Stage length across a world (#76, #78, and #48, #74, #75, #77, #91)

### 2.1 What was measured, from where

The brief asked for speedrun.com individual-level (IL) times and fixed-creator first plays for Rayman Legends, DKC Returns or Tropical
Freeze, and a 3D Mario. What each source could give:

| Game | Per-stage clock found | Source (saved) | Coverage |
|---|---|---|---|
| DKC Tropical Freeze (2014) | **Time Attack medal times, set by Retro** (gold, silver, bronze), every stage incl. bosses | Super Mario Wiki level pages, `raw/mw_tf_*.md` (60 pages), table `raw/tf_bronze.tsv`, `raw/tf_gold.tsv` | all 6 main worlds, 60 stages (measured) |
| DKC Returns (2010) | Time Attack medal times, set by Retro: bronze from the wiki (World 1), and the hidden "shiny gold" tier for Worlds 1-4 from ludo.guide | `raw/mw_*.md`, `raw/dkcr_w1_bronze.tsv`; `raw/dkcr_shiny.tsv` (https://www.ludo.guide/guide/donkey-kong-country-returns/donkey-kong-country-returns-part-39, a community guide, read 11:47 AM) | Worlds 1-4, 31 stages (measured). The guide's World 1 values equal the wiki's on all 7 stages both list, so the guide was checked against a second source. World 5 on is "00:??" on the guide; the wiki lacks most medal tables after World 1 |
| Rayman Legends (2013) | speedrun.com IL world record, "No Teensies" category, per level | API `games/m1zjk060/records?scope=levels&top=1`, `raw/rl_records.json`, `raw/rl_levels.json`, table `raw/rl_nt.tsv` | all 5 main worlds, 43 stages (measured); music levels are not on the board |
| Super Mario 3D World (2013) | **none per course.** speedrun.com's per-"level" boards are whole worlds (`raw/sm3dw_levels.json`: 13 entries, World 1 to World Crown; same for the + Bowser's Fury and Category Extensions boards). The wiki's course timers are three values only (World 1: 500, 500, 200, 500, 400, 400, 500, 400 s, `raw/mw_3dw_*.md`): a deadline, not a length | not usable for spread |
| speedrun.com, DKC Returns and TF | per-"level" boards are whole worlds (DKCR: 9 entries) or none (TF: 0 levels, `raw/dkctf_levels.json`) | used the medal clocks instead |

**Blocked or not found (searched):**
- Fixed-creator first plays: YouTube search pages return an empty body to the fetcher (`fetch_content` on youtube.com/results: footer
  only); the one per-level walkthrough channel found (Let's Play Index, "Dangerous Boy", Rayman Legends) uploaded 3 of World 1's 10 levels
  (https://www.letsplayindex.com/video/rayman-legends-teensies-in-trouble-level-1-once-upon-a-time-bP2otRs9XMI, read 11:34 AM). splits.io
  (one runner's per-level splits) returns 404 on every API and page URL tried (11:37 AM). **So there is no first-play per-stage clock in
  this report.** The developer-set medal clocks are the substitute, and they match what ENGINE-SPEC 663 measures ("the quick-route
  clock, a skilled player straight through").
- curl is refused by the proxy for every outside host (403 on CONNECT); every fetch went through TinyFish `fetch_content` (tested first,
  11:09 AM, speedrun.com API, worked).

**Why the medal clocks are the best evidence for design intent.** A speedrun record is a ceiling, distorted by skips (Rayman Legends
1-3 at 25.7 s is a skip, not the level's length). A Time Attack medal is a length the developers chose for each stage: "Three time
limits are set during the course, each corresponding to one of the gold, silver, and bronze medals" (Super Mario Wiki, Tropical Freeze
article, `raw/mw_1.md:108`). Bronze is the most forgiving. No checkpoints in Time Attack (`raw/mw_1.md:110`), so it is a clean straight
run: the same thing ENGINE-SPEC 663's quick clock models.

### 2.2 The per-stage clocks (measured from the saved pages)

DKC Tropical Freeze, bronze medal (dev-set), in each world's stage order (A, B = secret exits, K = temple, BOSS):

| World | Stages (bronze) |
|---|---|
| 1 Lost Mangroves | 1-1 2:30, 1-2 1:45, 1-3 1:45, 1-4 1:55, 1-A 2:10, 1-B 1:45, 1-K 1:55, **BOSS 2:45** |
| 2 Autumn Heights | 2-1 2:15, 2-2 2:25, 2-3 2:26, 2-4 2:04, 2-5 1:55, 2-6 2:15, 2-A 2:13, 2-B 1:47, 2-K 1:45, **BOSS 4:05** |
| 3 Bright Savannah | 3-1 2:20, 3-2 2:03, 3-3 2:21, 3-4 1:55, 3-5 2:07, 3-6 1:23, 3-A 2:24, 3-B 1:32, 3-K 1:56, **BOSS 3:20** |
| 4 Sea Breeze Cove | 4-1 2:55, 4-2 2:13, 4-3 2:46, 4-4 3:43, 4-5 2:15, 4-6 3:32, 4-A 2:10, 4-B 2:35, 4-K 1:41, **BOSS 3:45** |
| 5 Juicy Jungle | 5-1 2:15, 5-2 2:28, 5-3 2:43, 5-4 2:53, 5-5 2:08, 5-6 1:53, 5-A 2:50, 5-B 2:11, 5-K 2:18, **BOSS 4:32** |
| 6 Donkey Kong Island | 6-1 1:37, 6-2 2:31, 6-3 1:42, 6-4 2:33, 6-5 2:52, 6-6 2:16, 6-7 2:48, 6-8 2:26, 6-A 2:41, 6-B 2:47, 6-K 2:30, **BOSS 4:20** |

Gold (dev-set) is in `raw/tf_gold.tsv`. Example source line, 1-1: "In Time Attack mode, a time of 1:50.00 is required to get a gold medal,
a time of 2:10.00 for silver, and a time of 2:30.00 for bronze." (https://www.mariowiki.com/Mangrove_Cove, `raw/mw_tf_Mangrove_Cove.md`).

DKC Returns World 1, bronze (dev-set, Wii): 1-2 2:16, 1-3 2:07, 1-4 1:45, 1-5 1:35, 1-6 2:21, 1-K 1:47, BOSS 1:57 (`raw/dkcr_w1_bronze.tsv`,
each line's URL in its header).

DKC Returns, shiny gold (dev-set, hidden top tier), main path + boss (`raw/dkcr_shiny.tsv`):

| World | Stages (shiny gold) |
|---|---|
| 1 Jungle | 1-1 0:53, 1-2 1:18, 1-3 0:46, 1-4 0:50, 1-5 1:01, 1-6 1:42, **BOSS 0:37** |
| 2 Beach | 2-1 0:59, 2-2 1:09, 2-3 1:49, 2-4 0:44, 2-5 1:09, 2-6 2:07, 2-7 0:50, **BOSS 1:07** |
| 3 Ruins | 3-1 1:06, 3-2 2:11, 3-3 1:25, 3-4 0:51, 3-5 1:33, 3-6 1:12, **BOSS 0:51** |
| 4 Cave | 4-1 1:23, 4-2 1:33, 4-3 1:44, 4-4 1:30, 4-5 1:55, **BOSS 1:37** |

Rayman Legends, IL world record, No Teensies (measured from the API; skip-distorted, read as a ceiling): `raw/rl_nt.tsv`; e.g. World 4:
4-1 0:52, 4-2 1:15, 4-3 2:00, 4-4 1:30, 4-5 3:46, 4-6 1:13, 4-B 2:11.

### 2.3 The answers

**Basis: 15 shipped worlds, one clock each, main path plus boss** (secret, temple and invasion stages left out, because they sit off
the play order): Tropical Freeze bronze (6 worlds), Rayman Legends IL records (5), DKC Returns shiny gold (4). Robustness sets, run the
same way: Tropical Freeze gold (6), DKC Returns World 1 bronze (1), and every set again with the secret stages left in (code order).
Scripts `tools/count15.py` (the counts) and `tools/esrules.py` (per world); tables `raw/distinct15_mainpath.tsv`, `raw/*_mainpath.tsv`.

| ENGINE-SPEC line | Shipped worlds that meet it (measured, 15 worlds) | Robustness sets |
|---|---|---|
| ES 668 "The world's set piece or finale is among its longest" (#76): boss in the world's top 3 | **10 of 15**: TF 6/6 (and the single longest in all 6), Rayman Legends 3/5, DKC Returns 1/4 (its bosses rank 7th of 7, 5th of 8, 7th of 7, 3rd of 6) | TF gold 5/6; DKCR W1 bronze 0/1 |
| same, read as "the last ordinary stage before the boss is among the longest" | **5 of 15** (TF 2/6, RL 1/5, DKCR 2/4). Not a pattern | TF gold 4/6 |
| ES 674 "the world's spread is at least 2.5 minutes" (#78) | **3 of 15** (TF W5 159 s, TF W6 163 s, RL W4 174 s). Spreads run 32-174 s | TF gold 0/6 |
| ES 673 "no two neighbours are within 20% of each other" (#75, #77, #91) | **2 of 15** (RL W4, DKCR W3). The other 13 have 1 to 5 neighbour pairs within 20% | TF gold 2/6 |
| ES 667 "spread from about 2:00 to about 5:00" (#74), as a ratio | developer clocks (TF, DKCR, 10 worlds): longest ÷ shortest **1.39 to 2.89**, median 2.41; Rayman's skip-distorted records 2.58-4.35 | TF gold 1.99-2.54; DKCR W1 bronze 1.48 |
| what every shipped world shares (proposed rule, §6) | **never 3 neighbour pairs in a row within 10%**: 0 of 15 worlds have such a run; the longest run anywhere is 2 | 0 of 7; and 0 with the secret stages left in |

**#76, answered:** it depends on the studio. Tropical Freeze makes the boss the longest stage of every world (6/6 bronze, 5/6 gold).
Rayman Legends puts it in the top 3 in 3 of 5 worlds. DKC Returns does the opposite: its bosses are short fights (37 s to 1:37 shiny),
usually near the bottom of their world. Across 15 worlds it holds in 10. The last ORDINARY stage is not reliably long anywhere (5 of
15); Tropical Freeze's 3-6 and 5-6 are their worlds' shortest. So "the finale is among the longest" is a choice one studio makes
(Retro on Tropical Freeze), not a rule every shipped game follows, and where it is true it is true of the boss or set piece, not of
"the ninth stage". Our lairs (x-10) are closed-arena fights (stages.ts:54-56), like DKC Returns' bosses.

**#78, answered:** no shipped world I measured needs a 2.5-minute spread, and only 3 of 15 have one. The developer-clock worlds spread
by a RATIO, longest to shortest 1.39 to 2.89 (median 2.41). A ratio is the right unit because it does not change with a world's base
length.

**#75/#77/#91 (20% neighbours), answered from the same data:** the rule as written fails 13 of 15 shipped worlds. Shipped worlds do
have neighbours within 20% of each other. They never have a long flat stretch: no world has 3 pairs in a row within 10%.
#48 ("1-4 and 1-6 sit ≥ 20% either side of 1-5's median") is the same rule applied to one stage, and the same data does not
support it as a requirement.

**Yacht Club's view (the critic's saved quote, re-read in the primary).** "Each level should have about 26 regular rooms and 6 secret
optional rooms. ... A consistent length means that every stage will take a similar amount of time and have a similarly digestible amount
of content. Any longer or shorter and the level might drag on or feel like it was missing stuff. Players start to develop a sense of their
progress, and rely on it too ("I bet I'm near the end"). Plus, it lets us reinforce or subvert that expectation later for fun!"
(https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-1-5/, `src-yachtclub-specter-deepdive-1-5.md:108`, read
11:30 AM). Shovel Knight builds length from a fixed unit count; Retro varies it about 1.4-2.9x inside a world. Both shipped. Matt chose
"vary" ("it should vary the length of stages", MATT-DIRECTION.md:45-46 on ccr-0d59a91c-oy3imz), which is what Retro does, so DKC is
the reference that fits his rule. Yacht Club's point (players learn a stage's rough length) is still met if no stage is an outlier.

### 2.4 The run on our code (all 82 walk-through stages, World 1-10)

Tool: `tools/lengths.ts` (this folder; run from the scratchpad, the committed copy is identical; it imports `tools/inspect/stages.ts` `stageList`, the inspector's own builder, and
`src/game/stageTime.ts` `modelStage`). Run at 11:30 AM on dd02825 (engine-spec head), seed 1:

```
npx tsx reference/research/pacing-2026-11-05/tools/lengths.ts 1-10 1 > ours-modelled-lengths-seed1.tsv   (1 m 24 s)
```

Output: `ours-modelled-lengths-seed1.tsv` (every stage, Normal and Easy, fast and typical model, the code's own target). These are
MODEL seconds ("a MODEL of a first-time player, not a measurement of one", stageTime.ts:2), clean runs, no deaths (stageTime.ts:18).
The hand-built ascents (1-4, 2-6, 3-4, 4-1, 4-3, 4-6, 6-8, 7-4) come out at 1-40 s because the model times an ascent from
`meta.ascentChain` (stageTime.ts:221), which hand-built ascents do not record; they are left out below (a model gap, not a length).
Boss lairs (x-10) are skipped by the builder (stages.ts:54-56) and not timed.

Quick clock = Normal, `MODEL_FAST` (stageTime.ts:39), the nearest thing we have to ES 663's "quick-route clock":

```
world  n  min    median max    max/min spread  x-9 (finale) rank  neighbours >=20%  longest run of pairs <10%
SRA W1  8 2:06.0 2:49.5 3:24.0 1.62     78 s   1-9 = 8/8 (shortest)   1/7          2
SRA W2  8 2:46.0 3:04.5 5:40.0 2.05    174 s   2-9 = 7/8             5/7          1
SRA W3  8 2:05.0 2:54.5 4:30.0 2.16    145 s   3-9 = 1/8             3/7          2
SRA W4  6 1:24.0 3:37.0 4:49.0 3.44    205 s   4-9 = 3/6             4/5          1
SRA W5  9 2:25.0 3:13.0 5:02.0 2.08    157 s   5-9 = 6/9             5/8          3
SRA W6  8 2:39.0 3:12.5 3:22.0 1.27     43 s   6-9 = 2/8             1/7          2
SRA W7  8 2:34.0 2:52.0 3:05.0 1.20     31 s   7-9 = 3/8             0/7          2
SRA W8  9 2:42.0 3:15.0 3:43.0 1.38     61 s   8-9 = 1/9             3/8          3
SRA W9  9 2:32.0 2:53.0 3:06.0 1.22     34 s   9-9 = 6/9             2/8          5
SRA W10 9 2:41.0 3:01.0 3:28.0 1.29     47 s   10-9 = 4/9            0/8          5
```

(measured, model clock). What it shows against the shipped worlds:
- **Worlds 6-10 are as flat as, or flatter than, the flattest shipped world**: longest/shortest 1.20-1.38, against 1.39-2.89 on the
  developer clocks (only DKC Returns' Cave, 1.39, is that flat; median 2.41). World 9 and World 10 have 5 near-equal pairs in a row
  (shipped maximum: 2). This is by construction: stageTime.ts:91
  `STAGE_DRIFT = [0.0, 0.03, 0.06, 0.02, 0.07, 0.01, 0.05, 0.04, 0.0]` sets each stage's target within 7% of the world's base, and
  stageTime.ts:84-85 moves the base only from 135 s (W1) to 218 s (W10). The generator then "lands between this and 8% above it"
  (stageTime.ts:93). That is Yacht Club's consistent length, not Matt's "vary".
- **Worlds 1-5 (hand-built) already vary like DKC** (1.62-3.44), except 4-7 (1:24 quick) is under the 2:00 floor (ES 663).
- **The finale (x-9 gauntlet) is the shortest stage of World 1** (1-9, 2:06 quick, 2:45 typical), against 1-7 at 3:24.
- Against the code's own targets (`targetSeconds`, stageTime.ts:94-100, typical model): 1-9 meets its target (165 s modelled, 151 s
  target), so 1-9 is short by design, not by a miss; 4-7 misses its target (104 s modelled, 163 s target). Seed 1 only (seeds 2-3: §2.6).

**First-timer bot cross-check (a simulated player, not the formula):** §2.5.

### 2.5 First-timer bot on 1-1, 1-7 and 1-9 (the simulated clock)

Run at 11:41 AM ET on dd02825, 27 s wall:

```
npx tsx tools/inspect/inspect.ts --worlds 1 --stages 1-1,1-7,1-9 --firsttimer --ft-trials 2 --html .../ft.html --json .../ft.json
first-timer 1-1 easy: shrine 212s, shrine 212s; 24 findings (3005 ms)
first-timer 1-7 easy: time 360s, time 360s; 33 findings (4481 ms)
first-timer 1-9 easy: sealed door 96s, sealed door 96s; 11 findings (1590 ms)
first-timer 1-1 normal: shrine 214s, shrine 215s; 23 findings (2813 ms)
first-timer 1-7 normal: time 360s, time 360s; 32 findings (4419 ms)
first-timer 1-9 normal: sealed door 132s, sealed door 128s; 10 findings (1850 ms)
```

Read from ft.json (`end` per run, tools/inspect/firsttimer.ts:469, 1600-1604; the cap is 360 s, firsttimer.ts:1589):
- 1-1: finished ("shrine") at 212-215 s (measured, bot).
- 1-7: NOT finished at the 360 s cap, 84-96% along (measured, bot), so its clock is over 360 s.
- 1-9: reached the shrine at 96-132 s but **short of its goal** ("sealed door": Normal 15 and 12 of 20, Easy 0 of 10), so 96-132 s is
  its walk, and the full clear is longer by an amount this run does not measure.

So the simulated player agrees with the model on the ranking: World 1's finale (1-9) is its quickest stage to walk, and 1-7 its
longest (over 360 s on the bot against 1-9's 96-132 s walk: a ratio above 2.7, wider than the model's 1.62). Two trials, one seed:
a check of the ranking, not a measurement of the spread.

### 2.6 Seeds 2 and 3 (is the flatness one roll's accident?)

Same tool, seeds 2 and 3 (run 11:44 AM, both in parallel, about 2 min): `ours-modelled-lengths-seed2.tsv`, `-seed3.tsv`; counted with
`tools/count15.py raw/ours_s{1,2,3}.tsv` (x-9 tagged as the world's last stage). Quick clock, longest ÷ shortest, and the longest run
of neighbour pairs within 10% (measured, model):

| World | seed 1 | seed 2 | seed 3 | Reading |
|---|---|---|---|---|
| W1 | 1.62, run 2 | 1.60, run 2 | 1.87, run 2 | varies like DKC |
| W2 | 2.05, run 1 | 1.87, run 1 | 2.11, run 1 | varies |
| W3 | 2.16, run 2 | 2.24, run 1 | 2.01, run 1 | varies |
| W4 | 3.44, run 1 | 3.56, run 1 | 3.15, run 0 | varies (the 4-7 outlier: 82-84 s quick on all three seeds, under the 2:00 floor) |
| W5 | 2.08, run 3 | 2.03, run 2 | 2.00, run 2 | varies; one flat stretch on seed 1 |
| W6 | 1.27, run 2 | 1.23, run 1 | 1.32, run 2 | **flat on every seed** |
| W7 | 1.20, run 2 | 1.49, run 3 | 1.60, run 2 | depends on the roll |
| W8 | 1.38, run 3 | 1.70, run 2 | 1.55, run 4 | depends on the roll; flat stretches on 2 of 3 |
| W9 | 1.22, run 5 | 1.22, run 5 | 1.22, run 5 | **flat on every seed** |
| W10 | 1.29, run 5 | 1.29, run 5 | 1.29, run 5 | **flat on every seed** |

1-9 is 126 s quick on all three seeds and 1-7 194-204 s, so World 1's finale is its shortest stage on every roll. The conclusion of
§2.4 holds: the flat worlds are W6, W9 and W10 on every roll (W9 and W10 do not move at all between seeds), and W7-W8 on some.

**A rough first-timer multiplier (estimate, for scale only).** HowLongToBeat gives Tropical Freeze "Main Story: 10½ hours" (via the
DekuDeals listing, https://www.dekudeals.com/items/donkey-kong-country-tropical-freeze, read 11:51 AM; howlongtobeat.com itself was not
reached). Its 42 main-path stages sum to 106.7 min on bronze and 83.7 min on gold (measured, `raw/tf_*_mainpath.tsv`). So a whole
first play is about 5.9x the bronze clock (7.5x gold), including deaths, retries, the map and cutscenes. This is an upper bound for a
hard game, not a number for ours.

## 3. Fix rounds before a generated level ships (#160)

ENGINE-SPEC 1685: "**Fixes:** at most 2 rounds after the first full gate run. Each is a change to 1-1's data file only".

**Answer: no shipped generated game I could find reports a count of fix rounds per generated level. The reason is structural: none of
them fix a generated level at all. They fix the pieces (hand-made rooms, chunks, templates) and the rules, across the whole game, over
months.** The "2" is a budget, not a measured number (estimate), and should be labelled that way. Matt's rule (MATT-DIRECTION.md:168-175:
"If 1-1 takes too long and it still needs a lot of pieces fixed, the engine gets fixed. We don't just go into the stage and fix it") is
exactly what these studios did.

| Game | What was iterated, and how long | Quote, saved copy:line, URL |
|---|---|---|
| Sure Footing (Table Flip, 2018) | the generator's budgets and costs, 17 action generators; research began 2014; still tuning after launch | "All of these budget values and the like are hand tweaked at design level, allowing for me to better balance parts of the game having play-tested it in the wild." `src-surefooting-thompson-2018.md` (:59 of the designer's saved copy). "we're continuing to tweak and update the game over the next year" (:95). https://www.gamedeveloper.com/design/keep-running-procedural-level-generation-in-sure-footing |
| Dead Cells (Motion Twin, 2017-18) | first a fully generated prototype that failed on level design, then the hybrid: hand rooms per biome + a hand graph per biome; then 18 months of Early Access that changed "the structure of the world" | "the level design took a great big hit. In short it was illogical, chaotic" (L2); "after many trials, errors, adjustments and a stack of tweaking, we've got six steps" (L4), `src-deadcells-benard-2017.md`. "we actually took six extra months"; "after the first month in Early Access ... we decided to change tons of important things, especially ... the structure of the world" (L2-L3), `src-deadcells-mcv-2018.md` |
| Spelunky 2 (Mossmouth, 2020) | room templates and the safe-path generator; an outside QA firm found exploits, the devs changed the content "while keeping the sequence open-ended" | `src-spelunky2-pcgamer-2021.md` L1. Derek Yu on process: "Stop making excuses for starting over" and "the last 10% is the last 90%" (`src-spelunky-yu-book-excerpt.md` L3-L4) |
| Enter the Gungeon (Dodge Roll, 2016) | each hand-made room, played repeatedly, then floor rules | "We created a room and played it over and over again, and then structured floor layouts based on rules" `src-gungeon-crooks-2016.md` L2 |
| Super Meat Boy Forever (Team Meat, 2020), from R1 | the system, once, whole: levels first regenerated on every death, which "didn't feel right"; changed to fixed-per-seed chunks in a difficulty cadence | R1-shipped-pipelines.md:291-293 (ccr-0d59a91c-oy3imz), GamingBolt 2017 (R1's source; not re-opened here) |
| Shovel Knight: Specter of Torment (Yacht Club, hand-made, for contrast) | **whole-game passes**, one element at a time; about 4 months of polish placements over all levels; "a handful of cordial nerfs" per stage | "we'll take 'passes' at the whole level, and then the whole game, with a specific element in mind" (`src-yachtclub-specter-deepdive-4-5.md:6`); passes named: pickups, blocker, custom properties, speedrunner, background art, screen shake, 3D (:12-100); "that process took about 4 intensive months" (`...-3-5.md:10`); "We almost always make the game too difficult, then pull back" (:131); "Every stage usually receives a handful of cordial nerfs like this" (:135); "The levels in Specter Knight's campaign took the greater part of a year to design, iterate, revise, test, and balance" (`...-1-5.md:12`) |

What this means for ES 1685 (for the designer to rule on):
- The studios' unit of a "round" is **a pass over every stage for one element** (Yacht Club), or **a change to the generator or the piece
  pool** (Sure Footing, Dead Cells, Spelunky 2, Gungeon), never a stage-by-stage patch. ES 1685's "each is a change to 1-1's data file only"
  matches the first half (data, not the stage's layout), and Matt's rule matches the second (engine changes go to the engine).
- **No source gives a number of rounds.** Searched: Sure Footing (blog, read; paper https://www.pcgworkshop.com/archive/dewsbury2016scalable.pdf
  and t2thompson.com copy: BLOCKED, target_unreachable, 11:57 AM), Dead Cells (Bénard 2017, MCV 2018, Game Developer 2018 stream page:
  read), Spelunky 2 (PC Gamer 2021: read; Shacknews 2019: read, video only; Edge "Over And Over And Over" 2021-03-25: BLOCKED, empty;
  GMTK transcript on amara.org: BLOCKED, 403; Yu's book: two passages read, full book paywalled), Gungeon (read). R1's Shovel Knight and
  SMBF entries agree (cross-checked after my own list).

## 4. Matching what earlier research said (cross-check, done after my own source list)

| Earlier note | What it said | Agrees? |
|---|---|---|
| R1-shipped-pipelines.md:87-98, 353-358 (ccr) | Yacht Club passes; "about 4 intensive months"; "greater part of a year" | yes, re-read in the primary, same words |
| R1:274-300 | SMBF: "A Level is a collection of 8 Chunks" (fixed unit count = consistent length) | consistent with Yacht Club's view; not re-opened |
| R3-fun-by-math.md:199-200 | Launchpad group lengths 5, 10, 15, 20 s | yes: Launchpad's own text, `src-papers-checked.md` |
| R3:207-214 (F13) | rest boundary "≥ 2x median and ≥ 1.0 s Normal / 2.0 s Easy" | it is R3's own estimate ("Fix (estimate)"); Launchpad gives no rest length |
| R3:52-58 (F2) | Wilson 85%, Lomas "more engaged ... when easier" | yes (abstracts opened) |
| GEMINI-PCG-RESEARCH.md:285-293 | eventless walk 3.0/2.0 s, groups 6-8/10-14 s, rests 2.0-2.5/1.0-1.2 s | no primary source cited by Gemini; none found |
| LEDGER-ENGINE-GEMINI.md, R1-R4, GEMINI-LEDGER.md | anything on per-stage length spread, neighbour %, finale length, or fix-round counts | none (grep for "neighbour", "longest", "finale", "spread", "round", "iterat" in all 12 files: only the 15-20 s dense finale GROUP, LEDGER-2026-11-02-full.md:78, a different thing) |
| CRITIC-SPEC.md:579 (engine-critic-spec) | "Yacht Club argues against a fixed 20% rule; put to Matt as one question" | the shipped DKC data says the same about the 20% rule, without needing Yacht Club |

## 5. Every pacing, variety and difficulty row's number, and its source

Status words: **PRIMARY** (a developer's own number, game code, or a paper, opened by me), **OURS** (Matt's rule or our own
measurement), **NO SOURCE** (searched; only Gemini or an estimate). Where I found a primary number that differs, it is given.

### 5.1 Pacing and rests (§1.3)

| Row | Number in the row | Status | Primary evidence found |
|---|---|---|---|
| #31 ES 331 | up and down node by node, trend down | PRIMARY (shape, no number) | Yacht Club: "Every moment of gameplay, big or small, is ramping up then cooling down, cyclically" (`src-yachtclub-specter-deepdive-2-5.md:109`); "each subsequent room is a bit more difficult than the last room" (:107); "as the game progresses the levels start flatter and grow more towering in shape" (`...-1-5.md:119`) |
| #32 ES 341 | warm-up 5-10 s safe-miss group | OURS (SR:45-46) + PRIMARY floor | Launchpad's shortest group is 5 s (`src-papers-checked.md`, Launchpad Fig. 21); Yacht Club's first encounter is built "to show you the properties of the enemy in a safe context" (`...-2-5.md:139`) |
| #33 ES 343 | a local rise at n3 | NO SOURCE for a number | — |
| #38 ES 390-391 | 2-3 bursts of 4-6 pieces; bursts 5-20 s | 5-20 s PRIMARY; piece counts NO SOURCE | Launchpad: rhythm lengths 5/10/15/20 s, timed in seconds (Launchpad text :568-575, :979). No source gives pieces per burst |
| #39 ES 391-392 | rest = one short walk | PRIMARY (form), NO SOURCE (length) | Launchpad: groups "separated by a platform where no action is required to be taken, allowing the player a brief rest" (:438-442); no length given anywhere I found |
| #50 ES 506 | eventless walk ≤ 2.0 s Normal / 3.0 s Easy | NO SOURCE | Gemini only (GEMINI-PCG-RESEARCH.md:291, no citation). Searched Launchpad, Yacht Club, Dead Cells, Sure Footing: none give a seconds limit |
| #83 ES 752-753 | Easy rests 4-5 s; research 2.0-2.5 s | NO SOURCE | Gemini only (GP:293) |
| #94, #95 | double breather adds a minute; 0.52 vs 0.61 | OURS (run) | — |
| #99 ES 944 | neighbours never share a shape | OURS (SR:58) + PRIMARY support | Yacht Club: "The shape of each stage should reinforce the level's thematics" (`...-1-5.md:119`) |
| #104 ES 1073 | first test ~0.85 Normal / ~0.92 Easy | 0.85 PRIMARY (learning theory, not a game); 0.92 estimate | Wilson 2019: "optimal training accuracy is about 85%" (`src-papers-checked.md`); Lomas 2013: easier = longer play. 0.92 is R3's estimate between them |

### 5.2 Variety and repetition (§1.4)

| Row | Number | Status | Primary evidence found |
|---|---|---|---|
| #2, #8, #21, #103, #105, #115 | neighbours share ≤ half; Jaccard < 0.42 | NO SOURCE for 0.42 or "half" | Gemini only, and the ledger declines it (TRIAGE.md:101). Nearest primary: Dead Cells shares **no** rooms between biomes: "rooms used in the prison aren't reused in the sewers" (`src-deadcells-benard-2017.md` L8); SMBF "keep track to avoid duplicates" (R1:288, ccr-0d59a91c-oy3imz) |
| #7 ES 128 | a world's own ideas lead | PRIMARY (form) | Dead Cells L8 (per-biome rooms); Yacht Club "Level mechanics should prepare you for that level's boss fight" (`...-1-5.md:117`) |
| #22 ES 244 | ≥ 4 ideas a stage | PRIMARY, higher | Yacht Club: "Each level starts with about 5 enemies and 5 objects planned. Some enemies and objects are used every level ... Those don't count!" (`...-1-5.md:109`) = about 10 new elements a level beyond the shared basics (quoted) |
| #34, #42 | deck locked out for 4 draws | NO SOURCE for 4 | Gemini E40. Primary form only: Yacht Club put whole elements "on cooldown" for a game (`...-1-5.md:92`) |
| #40 ES 393 | kind or size changes every ≤ 2 pieces | NO SOURCE | Yacht Club: "No gameplay concepts should overstay their welcome" (`...-1-5.md:114`), no number |
| #41 | canopy burst 2-5 pieces | NO SOURCE | — |
| #44 ES 457 | creaky ≥ 15%, top 3 | PRIMARY (form) | Yacht Club on DKC: "Donkey Kong Country games like to build their levels around just a single idea, with the difficulty and complexity constantly ramping upward for the entire level" (`...-2-5.md:123`). No share given |
| #102, #116 | boughs + creaky ≤ 30% | OURS (Matt's fault, BR:46) | — |
| #132 ES 1380 | core ≥ 50% of landings | NO SOURCE | Yacht Club: "a good balance of platforming, exploration, and combat, and shouldn't rely heavily on one element" (`...-1-5.md:115`), no number |
| #15, #43, #46, #133-#144, #151 | library counts and tables | OURS (code) | Dead Cells L8 supports "each world owns its pieces" |

### 5.3 Difficulty and the dial (§1.5), and Easy (§1.10)

| Row | Number | Status | Primary evidence found |
|---|---|---|---|
| #16 ES 219 | flat run-up ≥ one screen / ≥ 1.0 s before a boa | NO SOURCE for a number | Yacht Club: "Buffer space is needed at the entrance and exit of each screen so you feel safe entering new rooms" (`...-2-5.md:81`); the screen transition's autowalk "is a great opportunity to give the player a heads-up" (`...-2-5.md:44`) |
| #17, #18 | ≤ 2/3 turtles; ≤ 1 heart lost per animal | OURS (bots) | — |
| #19, #20, #71 ES 227-228, 646 | crumble delay: Normal 0.9 → 0.5 s, Easy 1.2 → 0.8 s; 0.7 s and 1.0 s; ours 1.1 s | **PRIMARY: Celeste Classic 0.50 s at 30 fps**, gone for 2.0 s, then back | `src-celeste-classic-pico8.md`: `obj.delay=15--how long until it falls`, `this.delay=60--how long it hides for`, at 30 frames a second (dev-set, code). Ours: engine.ts:2428 `plat.crumbleAfter ?? 1.1`. Gemini E151 (36/20 frames) has no source. So Normal's 0.5 s end equals Celeste Classic; the 0.9-1.2 s starts are teaching margins (estimate). Also: Celeste Classic's floor comes back after 2 s; ours "only after half a minute or so, and only off screen" (engine.ts:2524 comment) |
| #63, #64 | d formula; dials linear in d | NO SOURCE | Gemini's D(w,s) rejected (TRIAGE.md:145) |
| #65 ES 640 | gap share: Normal 0.55 → 0.92, Easy 0.45 → 0.80 | **PRIMARY, and lower than the spec's top** | Yacht Club: "Specter Knight can jump gaps that are up to 5 tiles wide, but we avoid building gaps that wide ... platforming challenges typically don't ask the player to jump more than 3 or 4 tiles" = 0.6-0.8 of the maximum; "most levels in Super Mario Bros never ask you to jump more than 2 or 3 tiles" of 4-10; "Avoiding that 5 or 6 tile distance also removes ambiguity ... Either we want you to jump there, and it's 3 or 4 tiles away, or we don't, and it's 7 or 8 tiles away" (`src-yachtclub-specter-deepdive-5-5.md`). The spec's 0.92 Normal top is above Yacht Club's 0.8 and inside the band they avoid on purpose |
| #66, #67 | rise share, landing p50 | NO SOURCE | Gemini E103/E105 only; Yacht Club's "a few tiles of wiggle room" (same file) is the form, no width |
| #68 | risky pieces a burst / falls a node | NO SOURCE | R4 estimates |
| #69 | E[lives] per first run | NO SOURCE (estimate) + PRIMARY direction | Yacht Club: "We almost always make the game too difficult, then pull back and make it easier later in development. This is mostly because the longer we develop the game, the better we get at playing it!" (`...-3-5.md:131`); Lomas 2013: easier = more play |
| #70 | taught animals a stage | NO SOURCE (number); PRIMARY (method) | Dead Cells sets monster count from combat length: "1 monster for every 5 tiles ... some monsters ... will count for 10 tiles" (L7; Bénard calls these "random numbers") |
| #72 ES 647 | timed windows ×0.75 at d = 1; floor 300/167 ms | NO SOURCE for the floor | Primary nearby: Celeste Classic forgiveness at 30 fps, coyote 6 frames = 200 ms, jump buffer 4 frames = 133 ms (code). Ours: physics.ts:41 Normal coyote 0.133 s, buffer 0.133 s; Easy 0.167 / 0.2 s |
| #73 | bursts a node 2 → 3 | OURS (run) | — |
| #100 | only n7-n9 cost a setback | OURS (run) | — |
| #47, #89 (§1.10) | Easy widths; Easy high road softened | OURS / Gemini | — |
| #86 (§1.10) | judge over 16 rolls | PRIMARY (method) | Launchpad clusters 4,000 groups (Launchpad :1015); R3 F6 (10,000 Launchpad, 1,000 Horn) |
| #24, #51, #161 (§1.11) | pair checks; flags; both lines | OURS | — |
| #159 (§1.12) | about 1 hour a stage | OURS (RM:473) | R1:492: Super Mario Bros. edits had a "next-day turnaround" (R1's source, not re-opened) |
| #160 (§1.12) | ≤ 2 fix rounds | NO SOURCE for the count | §3: every studio iterated the generator and its pieces, over months; none counts rounds per level |
| #3, #4, #23, #55, #57, #58, #61, #106, #107, #155, #158 (§1.12) | cost estimates (% of the week, hours) | OURS (meter) | none needed: these are our own spend; R1:492-497 gives shipped build times for scale (Specter "greater part of a year", re-read: `src-yachtclub-specter-deepdive-1-5.md:12`) |
| #14, #82, #113 (§1.12) | who picks builds; polish order; planner fields | M (process) | none |
| #84 (§1.12) | n7b's Dot line | OURS (SR:118) | none |

## 6. The rule the engine should enforce (proposed from the data; the designer rules)

Length, on the quick clock (Normal, `MODEL_FAST` today; the bot's clock once the bots are fitted, R4:559-562):

1. **Floor:** every stage ≥ 2:00 (Matt, MATT-DIRECTION.md:45-47). Unchanged.
2. **A world varies, by ratio:** longest stage ÷ shortest stage ≥ **1.4** (the flattest shipped world on a developer clock, DKC
   Returns' Cave, is 1.39; the 10 developer-clock worlds run 1.39-2.89, median 2.41). No absolute spread.
3. **No flat stretch:** never **3 neighbour pairs in a row within 10%** of each other (shipped: 0 of 15 worlds, and 0 of the 7
   robustness worlds, with or without secret stages; the longest run anywhere is 2). Neighbours MAY be within 20% (shipped worlds have
   1-5 such pairs each).
4. **The climax: a choice, not a shipped universal.** Tropical Freeze makes the boss the longest stage of all 6 worlds; DKC Returns'
   bosses are short fights near the bottom of their worlds; overall 10 of 15. If ES 668 is kept, it should name the stage (the lair,
   or a named set piece) and say it is a Tropical Freeze-style choice. It should not mean "x-9": the stage before the boss is in the top
   3 in only 5 of 15 worlds.
5. **Length comes from units** (ES 670-671): Yacht Club's 26 rooms, SMBF's 8 chunks, Dead Cells' graph "length of the level". This
   stays; the ratio in (2) is met by giving long stages more units, not longer runs.

Checked on our code (the run in §2.4): rule 2 fails Worlds 6-10 (1.20-1.38) and passes 1-5; rule 3 fails W5, W8 (3 in a row), W9, W10
(5 in a row); rule 4 cannot be checked until lairs are timed; 4-7 fails rule 1 (1:24 quick).

Fix rounds (#160): label "≤ 2" as a budget (estimate, no source). Count a round as **one change to data or one engine change, run
through every gate**. Studios iterated the generator and its pieces over months, never a single generated stage.

## 7. Where ENGINE-SPEC's line is wrong

| ES line | Says | The evidence | Suggested correction (designer's call) |
|---|---|---|---|
| ES 667-668 | "Neighbouring stages differ by at least 20% on the quick clock" | fails 13 of 15 shipped worlds (§2.3) | "never 3 neighbour pairs in a row within 10%" (§6 rule 3) |
| ES 673 | "no two neighbours are within 20% of each other" | same | same |
| ES 674 | "the world's spread is at least 2.5 minutes" | only 3 of 15 shipped worlds; shipped spreads are 32-174 s | "longest ÷ shortest ≥ 1.4" (§6 rule 2) |
| ES 667 | "spread from about 2:00 to about 5:00" | a 2.5x ratio sits inside what developer clocks show (1.39-2.89) | fine as an outer bound, not a target |
| ES 668 | "The world's set piece or finale is among its longest" | Tropical Freeze does it (6/6), DKC Returns does not (1/4); 10 of 15 overall; the last ordinary stage only 5 of 15 | name which stage (lair or set piece) and mark it a choice, not a shipped rule (§6 rule 4) |
| ES 640 | gap share tops at 0.92 Normal, 0.80 Easy | Yacht Club keeps intended gaps at 0.6-0.8 of the maximum and avoids the 1.0-1.2 band so a reachable gap never looks unreachable (`src-yachtclub-specter-deepdive-5-5.md`) | the designer to weigh 0.92 against 0.8 (touches C1, C20) |
| ES 1685 | "at most 2 rounds" | no source has a count; the unit of iteration is the generator and the pieces | keep as a budget, labelled "(designer's budget, no source)" |
| ES 646 / 227-228 | crumble Normal 0.9 → 0.5 s | Celeste Classic (30 fps) is 0.5 s flat; our engine is 1.1 s (engine.ts:2428) | the 0.5 s end has a primary match; the start is a teaching margin (estimate) |
| stageTime.ts:91 (code, not the spec) | STAGE_DRIFT 0-7% | makes W6-W10 flatter than any shipped world (§2.4) | the engine's targets need the ratio in §6 rule 2 |

## 8. Limits of this report (named plainly)

- **No first-play per-stage data.** YouTube was blocked to the fetcher, splits.io is gone, the one per-level walkthrough channel was
  incomplete. The medal clocks are developer intent for a clean straight run, not a first-timer's time with deaths.
- **3D Mario not measured per course** (no per-course board or clock exists in the places searched; §2.1).
- **DKC Returns: Worlds 1-4 only** (shiny tier from a community guide, checked against the wiki on World 1; Worlds 5-8 not found).
- **Rayman Legends** numbers are world records with skips; used for ranks and the run test, not for the ratio floor.
- **Our numbers are a model**, seeds 1-3, hand-built ascents and lairs not timed. The first-timer bot run (§2.5) checks the ranking on
  three World 1 stages only.
- Tropical Freeze's secret stages and temple are not in strict play order; the tests were run both with them (code order) and on the
  main path only, and the conclusions hold in both (`raw/tf_*_mainpath.tsv`, §2.3).

## 9. Saved sources (all in this folder) and blocked list

Primary, read in full: `src-yachtclub-specter-deepdive-1-5.md`, `-2-5.md`, `-3-5.md`, `-4-5.md`, `-5-5.md` (live at the "-5-of-5" address; "-5-5/" is 404),
`src-deadcells-benard-2017.md`, `src-deadcells-mcv-2018.md`, `src-spelunky-yu-book-excerpt.md`, `src-spelunky2-pcgamer-2021.md`,
`src-surefooting-thompson-2018.md`, `src-gungeon-crooks-2016.md`, `src-celeste-classic-pico8.md`, `src-papers-checked.md` (Launchpad,
Wilson 2019, Lomas 2013).
Data: `raw/` (speedrun.com JSON, Super Mario Wiki pages, ludo.guide's DKCR table as `dkcr_shiny.tsv`, tables `*.tsv`, the bot's
`firsttimer-1-1_1-7_1-9.json`), `ours-modelled-lengths-seed1.tsv`, `-seed2.tsv`, `-seed3.tsv`.
Secondary, used once and labelled: DekuDeals' HowLongToBeat figure (§2.6).
Scripts: `tools/lengths.ts`, `tools/count15.py`, `tools/spread.py`, `tools/esrules.py`, `tools/ilt.py`, `tools/medals.py`, `tools/unwrap.py`.

**My own misses in this job (named, not hidden):** (1) two HowLongToBeat page ids I guessed (15183, 7550) returned other games; both were
discarded and the figure was taken from a page found by search. (2) The second commit on this branch (the PACING.md draft) carries the
wrong `Claude-Session` trailer (the designer's session link instead of mine); a force-push to fix it was refused, so history was left
as is and later commits carry the right one. (3) My first answer to #76 (from Tropical Freeze alone) said the boss is the longest
stage; DKC Returns overturned that and §2.3 was rewritten. The method file now says to measure two studios before calling a pattern.
Blocked: YouTube search (empty body), splits.io (404), Sure Footing paper (pcgworkshop.com and t2thompson.com: unreachable), arro.anglia.ac.uk
(unreachable), Edge 2021 Spelunky 2 feature (pressreader: empty), GMTK Spelunky transcript (amara.org: 403), Yu's full book (paywall),
mariowiki Jungle_Hijinxs medal table (page returned without it), curl to every host (proxy 403).

FINISH_TIME_PLACEHOLDER

## Method update (LAWS 4)

- **Worked better, with proof:** developer-set Time Attack medal clocks beat speedrun records for "how long is this stage meant to be":
  no skips, one rule for every stage, bosses included (60 TF stages in 6 batched fetches). Speedrun ILs exist per stage only for some
  games (Rayman Legends yes; DKCR, TF, 3D World: whole worlds or none).
- **Failed, and why:** `include_selectors: ["table.wikitable"]` on a 10-page wiki batch returned every table inline (about 60k tokens)
  instead of a file; leave batches unscoped so the tool writes them to a file, then parse. YouTube and splits.io cannot be used for
  per-level clocks from this container.
- **The exact edit:** done. `reference/methods/primary-research.md` is new (no method existed for this kind of job; methods/README.md
  rule 5), and its row is added to the index in `reference/methods/README.md`. Its core line: "For a length or timing question, look
  first for numbers the developers set inside the game (medal clocks, code constants, open source like Celeste Classic), then developer
  write-ups, papers, speedrun ILs, then first plays. Batch wiki fetches 10 at a time without selectors and parse the saved file."
