# ART-W1B: finish 1-3's painted traps + World 1 sunrise sky (the lead, 2026-11-12 2:15 PM ET). Opus 5.5 high (art). Branch t-w1-art2.

Why: ART-W1 painted and wired 1-3's trap pieces (t-w1-art@6c4659ec, REPORT and stills in reference/qa-reports/ART-W1/) and stopped at
its context line. The lead judged its stills: the painted sapling and vines read as rainforest (a big step up), but four things fail
the bar, and 1-3's sky has a white "ghost". Matt plays 1-3 on his test link TONIGHT (~9 PM ET). Hugging Face is the lead's call; budget
$63.53 final, ~$61 left; this job's cap: $6.

First: `git fetch origin ccr-702d3c49-i33jeq t-w1-art t-w1-creatures`; read from the lead's branch reference/roles/README.md ("Lean
output"), reference/roles/CONTENT.md, reference/LAWS.md, reference/LESSONS.md, reference/methods/hf-art.md, reference/STAGE-RULES.md §4
and §5b, reference/art/PROMPTS-2026-11-11.md lines 10-14 (WORLD 1 HAS NO MADE THINGS: no rope, planks, saw cuts, carved or squared
stone, crates, ladders), reference/art/HF-SPEND.md. From t-w1-art: ART-W1's REPORT.md, contact-sheet-1.jpg, hive-matt-vs-A.jpg, its
tools/art/w1traps/ scripts and specs, w1TrapsData.ts, the atlas.

## Fix, in this order (base: t-w1-art@6c4659ec; merge origin/t-w1-creatures's newest first)
1. NOTHING FLOATS: the vine's corner over the handle hangs on nothing. Add a second, smaller sapling (or bent bough) BEHIND the handle
   that the vine hangs from (ART-W1's option (a); cut the other arch take free, or one new take); both saplings sized against Pokey,
   crowns clear of the goal sign sideways where they can be.
2. THE HIVE: use hive A (the painted hanging hive with the dark entrance) and its landed take; Matt's hive reads as a brown cocoon at
   phone size (the lead's call; Matt left it to the lead). Landed = whole, maybe tipped (the story keeper).
3. NO MADE THINGS in World 1: the tendril handle's stake is a saw-cut post: replace it with a natural anchor (a living root loop, a broken
   natural stump with no saw cut, a root arching out of the ground) the tendril is tied around. And the stone: use the take where vines
   are WRAPPED around the mossy stone (A), not the knotted net (B), hanging and landed the same stone.
4. THE SKY: repaint World 1's sunrise FAR backdrop src/assets/backdrops/w1sunrise-far.webp (2015x1632) WITHOUT the white orchids
   painted at both edges (where the strip wraps they meet behind the route as one big white "ghost") and with a seamless wrap, keeping
   its warm sunrise light: the treatment 1-1's w1sun2 got on 11-05 (stageBackdrops.ts:20-22; HF-SPEND.md 11-05 rows). Run it in the
   background while you do 1-3. Deliver a before/after and the wrap seam shown; do NOT wire it (F13 flips 1-3's sky by one data line on
   the lead's word).
5. Re-shoot trap0/1/2 (before, trap, glide, after; upright and sideways) in the real game; stills to the lead FIRST. Polish check.
Gates: tsc, touched tests, artcheck, drawcheck (1-3 sideways sits at 7.46 of 7.5: the second sapling must not push it over; if it
would, say so before adding), the inventory rows (append to reference/art/catalog-rows-w1traps.csv), buildcheck, seedlist 1-1 --check.
Draw only: no trap box, timing or lay moves.

## Rules
Every job logged in HF-SPEND.md (job id, minutes, cost, what it bought). Contact sheet for any NEW takes to the lead before cutting
(holds come with priority "now"). The Hugging Face token never goes in code, commits, files, messages or memory. Push every 30 min.
Stop line 5:30 PM ET or 40% context. Return: reference/qa-reports/ART-W1B/REPORT.md (60 lines or fewer) and a send_message to the lead
(session_01FhBbYP63h7cCX8DyW69stq), 10 lines or fewer. No PR.
