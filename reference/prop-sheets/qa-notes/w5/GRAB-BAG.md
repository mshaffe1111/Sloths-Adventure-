# World 5 grab bag: the pieces we have, and the new kinds we need (2026-10-31, ~1:00 AM ET)

Why this exists. Matt, 12:55 AM Oct 31: "Stage 5 does need more stuff, very repetitive." Earlier: "I did play some world 5 and it is
boring." The rule (2026-10-30): more pieces, comfortable variety (0.45+), never scrape past.

## 1. What the numbers say (before tonight)

Measured on `origin/main` (949abd98). Variety is era.ts's (1 - cosine of the action 3-grams between rolls, STAGE-RULES §2); spot memory is
`tools/inspect/spotMemory.ts` (from `plan-gen2-w1-4`: the share of one roll's enemies / pickup trails at the same spot in another roll).
16 rolls a stage (hand stages: the layout numbers era.ts draws; gen2: the 16 shipped rolls).

| Stage | Built | Variety | Nearest twin | enemySpot | trailSpot | Dead time (med) | Longest quiet | Beat mix (per roll) |
|---|---|---|---|---|---|---|---|---|
| 5-1 The Loveliest Place | hand | **0.019** | 0.99 | 0.98 | 0.43 | 40 s | 5.0 s | P 25, J 21, C 16, h 15 |
| 5-2 Don't Sit | hand | **0.018** | 0.99 | 0.99 | 0.63 | **69 s** | 5.0 s | P 40, C 17, Z 13, J 11, h 10 |
| 5-3 Closing Orchids | hand | **0.032** | 0.99 | 0.96 | 0.62 | 31 s | 4.5 s | P 62, h 37, J 30, C 5 |
| 5-4 Silk Bridges | hand (w5Stage54) | 0.366 | 0.75 | 0.99 | 0.65 | 58 s | 4.4 s | P 19, h 12, V 12, J 8, Z 7, C 7 |
| 5-5 Caught in Silk | hand | **0.021** | 0.99 | **1.00** | **0.89** | 52 s | 5.2 s | P 35, J 12, C 12, h 8, Z 5, V 1 |
| 5-6 Where She Ran | old generator | 0.386 | 0.75 | 0.43 | 0.34 | 50 s | 5.7 s | C 19, J 18, h 11, V 7 |
| 5-7 Don't Touch the Silk | gen2 | 0.514 | 1.00 | 0.62 | 0.46 | 17 s | 1.8 s | h 27, P 25, Z 19, J 17, C 9 |
| 5-8 Up the Bloom Trees | old generator | 0.104 | 0.96 | 0.12 | 0.35 | 4 s | 2.2 s | J 47, V 14, h 4, C 4 |
| 5-9 The Queen's Garden | gen2 | 0.544 | 1.00 | 0.85 (spotMemory) | — | 10 s | 1.5 s | h 33, C 28, J 20, Z 18, P 16 |

What repeats most, and why:
- **5-1, 5-2, 5-3, 5-5 are the same stage on every play** (variety 0.02-0.03, a near-twin in every roll, 96-100% of the spiders in the same
  spot). They are hand-built (`src/game/w5Stages.ts`): fixed teaching beats, then a Finish that loops the **same four pieces in the same
  order** (`k = n % 4`) until the clock is full. The seed only nudges widths. This is what Matt played: 5-5 is the worst (enemySpot 1.00,
  trailSpot 0.89).
- **All of World 5's props read as one beat letter.** beats.ts gives chairs, cakes, the Butler, orchids and cocoons all `P`. So a piece
  built only from props moves the variety number very little: 5-3 (orchids + cakes + chairs) cannot get off 0.04 by reshuffling its own
  props. New pieces must bring a **V** (silk line, climb), **Z** (thread, sheet, steam, a timed thing) or **C** (spider) to count.
- **Dead time is high on every hand stage** (31-69 s; STAGE-RULES §2 budget is a fifth of the stage) and the longest quiet runs 4.5-5.2 s
  (rule: 4 s). Cause: long `rest()` stretches kept for the goal card and the lines (5-5's start is 2,250-2,400 px, about 8 s, of garden)
  and the end padding `rest((stageSeconds - expert) * RUN + 60)`. Not fixed tonight (see §6).
- 5-8 (0.104) is the old generator's ascent: jumps almost only. 5-4 and 5-6 sit near 0.37-0.39.

## 2. World 5's pieces today, and their beats

| Piece | Where | Beat |
|---|---|---|
| soft pits, gaps, second-jump gaps (`gap`) | every hand stage, gen2 `w5-soft-gap`, `w5-double-gap`, `w5-stump-gap` | J |
| stumps, tall stumps, high roads (`stumps`, `highRoad`) | every stage | h |
| jumping spider (awake: crouch, rush) | 5-1, 5-2, 5-5, 5-7, 5-9 | C |
| sleeper (dozing spider) behind a humming thread (`threadTrap`) | 5-2, 5-5, 5-7 (`w5-thread-hop`, `w5-thread-gap`, `w5-sleeper-row`) | Z + C |
| soft chairs, the guests who sat (`chairWalk`) | 5-1, 5-2, 5-5 | P |
| tiny cakes (`cakeRow`), the Butler and his tray (`butler`) | 5-2, 5-7, 5-9 | P |
| closing orchids (`orchidSteps`, `orchidRow`) | 5-3, gen2 `w5-orchid-hop` | P |
| silk lines (swing), silk sheets, the Seamstress | 5-4 (w5Stage54.ts), 5-5's high web, gen2 `w5-sheets`, `w5-seamstress` | V, Z |
| warm teapots (steam) and the tea table | 5-7, 5-9 (`w5-pot-gap`, `w5-pot-pair`, `w5-tea-table`) | Z |
| cocoons to punch open | 5-5, gen2 `w5-cocoon-row` | P |
| the rest branch and the pouch scene | 5-5 | (rest) |

## 3. World 5 art on hand, unused or under-used

| Art | File | Used today |
|---|---|---|
| orchids, cocoon, web, mossy log, ferns, bromeliad | `w6to10/props-made/w5a.webp` / `w5a-b.webp` (+ .json) | **not loaded anywhere** |
| W5 room kit: lever up/down, pressure plate up/down, door shut/open | `w6to10/props-made/w5b.webp` (+ .json) | **not loaded anywhere** (W5 has no puzzle room outside 5-9's arena gates) |
| variant bank, fill, buttress, stump, moss strip, bank end | `w6to10/props-made/w5var.webp` (+ .json) | **not loaded anywhere** |
| night backdrops (`w5night-*`) | `backdrops/` | w5Backdrop.ts only (W5 is never night) |
| arena web and tea-table backdrops | `backdrops/w5arena-*` | 5-9 only |
| Butler poses | `enemies/butler-poses.webp` | Butler (all poses?) |
| silk lines, sheets, the Seamstress | w5Kit / w5Look | 5-4, one high web in 5-5 |
| teapots and steam | w5Look | 5-7, 5-9 only (never in a hand stage) |

## 4. New section types for World 5 (each with its beat, its stages, its art)

Built tonight are marked **BUILT**. Each new hand-stage piece uses only what that stage or an earlier one has taught (STAGE-RULES §1:
first appearance taught); the reminders come from w5Play's own first-sight lines.

1. **The roll's theme (all four hand stages) — BUILT.** The Finish draws 4 of 8 pieces per roll, as a shuffled deck (never the same
   piece twice running, every piece before any repeats): `w5Stages.ts deck()`. Two plays of a stage now hold different pieces, not only
   a different order, and one play holds as many different finish pieces as before (4). The trade-off, measured on 5-5 (40 rolls):
   3 of 8 gives 0.467 between plays but each piece comes 3-4 times in one play; 5 of 8 gives 0.287; 4 of 8 gives 0.353. I chose 4: Matt's
   "very repetitive" is felt inside one play as much as across plays. Art: on hand.
2. **The silk swing (5-5) — BUILT.** A silk line at a soft pit's lip, swung up to a high branch with one cocoon on it; the way on is the
   second jump. Beat **V**. Art: on hand (silk line). Signature: 5-5. Also a candidate for 5-2 and 5-3 (silk taught in 5-4: only 5-5 on).
3. **Twin threads (5-2, 5-5) — BUILT.** Two humming threads strung close, a sleeper behind each, then a cocoon (5-5) or the second jump
   (5-2). Beat **Z Z C**. Art: on hand.
4. **Spider between two pits (5-1, 5-5) — BUILT.** A soft pit, a jumping spider on the narrow ground after it, then the second jump.
   Beat **J C J**. Art: on hand.
5. **Sleepers under the high road (5-5) — BUILT.** Cocoons up on a high road, sleeping spiders on the grass below: stay up top, or hop
   them. Beat **h P C**. Art: on hand.
6. **Butler and cake pieces in 5-5 (5-2's things at dusk) — built, then HELD.** Their first-sight lines held the screen and pushed 5-5's
   soft-chair line past the chairs (w5Order.test.ts). They stay in 5-2's deck (Butler among the chairs, row of sleepers then a cake).
7. **Orchid rows in 5-5 (the orchids close at dusk) — built, then HELD.** The orchid line waits until he hops onto one, and every line
   after it waits behind it. Needs the line to give way after a few seconds (w5Play.ts, a W5 file) before it can go back in.
8. **Teapot steam on the path (5-2, 5-3, 5-5).** The warm teapot (5-7's) on a hand stage: wait for the lid's rattle, go between puffs.
   Beat **Z**. Art: on hand (w5Look teapot, steam). Needs the pot taught before 5-7 (W5_MANIFEST teaches it in 5-7 today): give it to
   5-3's Finish with its line first. The best single lift for 5-3 (P-only today).
9. **Silk sheets on the hand stages (5-5, then 5-3).** A sheet by the path: don't stop to look. Beat **Z** (a span). Art: on hand.
   Needs `sheets` in buildW5Stage's W5Extras (a few lines) and its line (taught 5-4: 5-5 only).
10. **The web lever room (5-3 or 5-6) — NEW room, art on hand.** A cocoon held shut in a web; step on the pressure plate to pull the
    web taut, pull the lever to open the door to the creature. Beat **P** (a room step: 2.8). Art: `props-made/w5b` lever, plate, door
    (painted and never used). World 5 has no puzzle room on a hand stage today (STAGE-RULES §3: 2-3 puzzle moments a world; 5-9 has its
    arena gates). Needs the puzzle kit wired for W5 (`puzzlePlay.ts`, owned by the W8 helper tonight: patch later).
11. **Mossy-log crawl and bromeliad cups (5-1, 5-3) — art on hand.** A fallen mossy log to run along (a high road that sags), a
    bromeliad whose cup holds petals (a hop up). Beat **h J**. Art: `props-made/w5a` mossy-log, bromeliad, ferns (never used).
12. **Dusk wind through the webs (5-5, 5-6) — NEW art.** A web strung between two trunks bellies in a gust on a rhythm; standing on its
    strand while it billows throws him up (a free second jump) or, mistimed, back. Beat **Z J**. Art: NEW (brief below), engine: World
    4's wind zone.

## 5. Hugging Face art (Matt, ~1:15 AM: "Make hugging face tonight if needed")

Made tonight for 12 (the billowing web): `src/assets/w6to10/props-made/w5web.webp` (+ .json), three frames (slack, billow, snap back),
img2img from `props-made/w5a`'s never-used web with the style model, on magenta. Two jobs, ~7 min on rtx-pro-6000, **~$0.32** (logged in
`tools/art/hfground/jobs.txt`). The first billow barely moved and was dropped; the retake from a bent start reads as a gust. **Not wired
in**, and not polish-ready yet: some anchor strands break into dashes after the key, the silk has a pink cast, the billow frame a faint
dark fringe. Fix when wiring: draw the anchor strands as code silk lines (a small code touch), re-key the billow.

### The other brief (not made tonight)

All painted to World 5's kit (storybook painted, dark outlines, soft cel shading; dusk golds turning violet; img2img from
`props-made/w5a.webp` for the style), on flat magenta #FF00FF, cut with the HF batch cutter, packed into `props-made/` with a .json.

1. **Teapot on a mossy stump (for 8, optional: the w5Look pot works without it).** The sanctuary's warm teapot sitting on a stump,
   steam curling, 2 frames (lid down, lid rattling); 512 x 256.

Budget: about $1-2 on rtx-pro-6000, well inside the reserve.

## 6. What tonight changed, and what is next

Built (`src/game/w5Stages.ts`, World 5 files only): the deck and the roll's theme for the Finish of 5-1, 5-2, 5-3 and 5-5; four new 5-5
pieces (2-5 above), four new 5-1 pieces, four new 5-2 pieces, four new 5-3 pieces (spiders and threads before the orchid rows); 5-5's
soft chairs only after 100 expert seconds with a calm stretch before (their line waited behind the scene's, the web's and the flag's);
5-5 never holds more than 22 cocoons (main's most: Normal's rescue goal is every cocoon, goals.ts, so more pieces must not mean a longer
goal; uncapped it reached 30).

Variety, 40 rolls (era.ts), before -> after: **5-5 0.021 -> 0.357**, 5-1 0.019 -> 0.128, 5-2 0.018 -> 0.050, 5-3 0.032 -> 0.029.
Spot memory (16 rolls), enemySpot before -> after: 5-1 0.98 -> 0.89, 5-2 0.99 -> 0.87, 5-3 0.96 -> 0.68, 5-5 1.00 -> 0.93; trailSpot
5-5 0.89 -> 0.43, 5-2 0.63 -> 0.47, 5-3 0.62 -> 0.32, 5-1 0.43 -> 0.41.
Honest read: only 5-5 moved a lot, and none of the four reaches 0.45. 5-2 and 5-3 keep "core" pieces in every theme because their own
tests hold their idea (5-2: 6+ cakes and 2+ Butlers; 5-3: 6+ orchid rows, 3+ awake spiders, and no threads, Butlers or sleepers), and
those core pieces are all P. Inside one play, each of the four stages now holds 4 different finish pieces out of 8, in its own order;
before, the same 4 in the same order. The fixed teaching beats (Start, Learn, Develop, Twist) still hold most of each stage's spiders in
the same spots: that is why enemySpot stays high.

Fairness: levelCheck passes on all 16 test seeds of each stage; the touch fairness tests (forgive, plainWalk, w5Fair, w5Lips, w5Order,
w5QA5, w5QA6) pass. w5Order's 5-5 line order on 16 seeds fails only seed 186's spider, threads and silk line, which fails the same way on
main (not this change; the default 4-seed run passes).

Next, in order:
1. 5-3 and 5-2 need non-P pieces that their tests allow: teapot steam (8) taught in 5-3 (a Z in an all-P stage), sheets (9) in 5-5
   (taught 5-4). 5-2 can take more thread and spider pieces once its cakes come from fewer, longer cake pieces.
2. Roll the Develop and Twist beats' content (a test showed 5-5's Develop swap breaks a line's order: line timing first).
3. Dead time: shorten the start and end rests where no line needs the room (all four hand stages fail the 4 s quiet rule today).
4. 5-8 (0.104) and 5-6: old-generator stages; the World 5 move to gen2 (W5_GEN2_STAGES) is the real fix.
5. The web lever room (10) with the unused `w5b` kit once the puzzle files are free.
