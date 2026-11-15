# BUILD-18b: 1-8's data-side reds (t-build-18b). Report __TIME__ ET, context about __CTX__
**EXACT NEXT STEP:** the engine work the lead RULED (10:13 and 10:24 PM): (i) the settle sees the ground the chase lay leaves standing,
any chase stage; (ii) ruling (a): a section template asks for its join (`entry.join: 'walk'`), and 1-8's still fork and tip ask for a
walk in; (iii) ENG-LOOK's layTip puts the far-bough flag ON the bough (its e014d41d). When they land, 1-8's data adds `entry.join` to
the still-fork and tip bricks, and the four reds below go green; then relist and re-run castBots. No seed-list refusals (the lead).
Three of the four "data" reds are not 1-8 data; each comes from engine order. Fixing them in 1-8's data would mean refusing rolls or
moving pieces until a hash changes, which hides the defect (law 22), so I did not.
(1) **w1Overhang 1-8 (23 stones):** the World 1 settle (pipeline.ts:2799) runs BEFORE the chase lay cuts a bank into crumble pieces.
Normal layout 1: the K2 liana pit's climb-out stone (id 51, 200x120 at x 14000, 'w1-rock-roots', art box from x 13716) is settled
against the whole bank f (13540-14000, overhang 0). The chase then splits f into 124/45/125, so the finished wall starts at 13770 and
the gate reads 54 px past. The screen shows it too: when the front drops 125 and 45, the rock's art hangs over the fallen gap. Fix
(engine): settle after the chase lay, or count only standing wall in groundRun. Proof: the settle's input, logged (w1.ts settle,
reverted), holds 49/50/51/52 and no 125.
(2) **gen2Pits seed 2 Normal** and (3) **rollGuard:42 / skills:35** have ONE root: the pipeline rolls the join before each section
(pipeline.ts ~2402: walk, step or pit; World 1's floorRoll adds pit weight even on quiet nodes), and no brick can ask for a walk in.
Seed 2 rolls a PIT (142 px, floor 70 px down, id 83 at 26397) between the rhythm (s9) and the still fork (s10), so layStillFork
reads "ground breaks at 26539". Seeds 1, 3 and 4 roll a walk or a 69 px step there and build. Layout 3 (skills v3) and rollGuard's
?layout=72140 / 932513 roll a STEP (60 px down) into the tip section. layTip then lays the far bough (id 149, 34904-35504) at the
last stretch's level (y 721) and leaves the flag at 35024 y 781, inside it. That is the far-bough flag the packet gives ENG-LOOK.
Fix (engine), either: (a) a join into a still-fork or tip section is a walk (a brief or template field), or (b) readyStillFork and
layTip level their ground and move the fork's flags onto it.

**Done (data and words):**
- (4) The keeper's lines (lines-1-8.md, t-story 356159b8, APPROVED 9:38 PM):
  - way.1-8 "Dot keeps flying rings round me. Show-off." is in w1Arc18.ts WAY_18, wayside.ts and dotLinesData.ts.
  - The moves journal's `collapse` page opens on the crack line (`tip('1-8', "It's cracking! Run, and don't look back!")`, said on
    both settings). It has the keeper's intro and how-line; the riddle is kept.
  - "This branch goes on and on" is gone from the journal.
  - lines-1-8.md is the keeper's file. w1Arc18.test's parser drops her dated note after a rewritten line; a new w1Arc18.test holds
    the page word for word (planted: the old how-line turns it red, CAUGHT).
  - movesJournal.test and wayside/story (Pokey's first person) are green.
- (3b) stageSheets 8/8 on my head.
- ENG-LOOK's two items (the lead, 10:45 PM):
  - **(a) The book:** gen2 1-8 DOES lay w1_book, on both settings. ENG-LOOK grepped w1Arc18.ts for "book" and missed the rest brick's
    `findSpot` socket. stageGenerator addFinds puts it there: Normal layout 1 at x 10215 on bank `e` of the first rest, past the root
    hop `d`, before the second stretch (11597); Easy at 10193. A new test in w1Arc18.test holds it (seeds 1, 3, 4, both settings): on
    the first fork, before the second stretch, on a bank's top, one hidden w1_book at the spot. Planted: with the socket removed the
    test is red, CAUGHT. NAMED for the keeper: the clue says "check by the first knot. Early!" The first root knot met is the
    arrival's (about x 1,000); the book is by the first FORK's knot, about 27% in, after the first chase. I did not move it: BUILD-18
    put it on a fork on purpose, never beside a nut or a fruit. The clue's words or the spot is the keeper's and lead's call.
  - **(b) The fork line on the far branch:** not a misplaced trigger; on my head the fork line sits at x 25687, in the rhythm. The
    engine (engine.ts ~3208) says only the LAST line passed in one frame, as when a run starts from a later flag or a still is shot
    from one. Past the tip, that last line is the fork's. Fix, in 1-8's finish (data): each of Dot's 1-8 lines gets `beforeX` = the
    start of the next stretch after it, so it is said only before the next crack (the mark, past the last crack, is untouched). Test:
    every line's beforeX, seeds 1, 3, 4, both settings; planted (assignment removed) red, CAUGHT. ENGINE-WORTHY, general: every rolled
    stage's tips can fire far from their section on a later-flag start; a general "a tip expires past its section" belongs in the
    engine.

**Not changed, named:** protoStage.ts:6290 still holds `hint(300, 'This branch goes on and on')` in the hand-built 1-8 builder.
Nothing routes to it now. ENG-LOOK's 7 hand-built tests still build it, and re-pointing them deletes it; I left engine code alone.
My commit f321a1f04's Claude-Session line names the lead's session, not mine (session_01FhBbYM7pXy1RDEHLFbJz4m). The amend was
refused (it needs a force push), so it stands.

**Relist:** none needed. Only words changed, so no layout moved: `seedlist 1-8 --check` PASS, 100 seeds clean on both settings.
**castBots 1-40, both settings (f321a1f04):** Normal: kid, adult, middle and expert 40/40; child 37/40 (seeds 7, 9, 13, "shrine
rescued", at the tip: the accepted miss). Easy: every tier 40/40, 0 hits. No run under 120 s. Medians: kid 141 s, adult 141 s,
child 330 s, middle 197 s, expert 167 s (Easy 146/144/238/177).

**Gates on f321a1f04 (frozen worktree):**
- PASS: tsc; build (BASE_PATH); chunkcheck; artcheck; kbdcheck; buildcheck (1-1 p95 148 ms); seedlist 1-1 --check (162) and 1-8 --check
  (100); engine tool tests 37/37; tierBots 7/7; knowncheck; generality; roadmap (after unshallowing the clone).
- drawcheck __DRAW__
- clipcheck __CLIP__
- **Whole suite:** __SUITE__

**Polish check:** no stills (packet: rule 29, the look will change them). The way.1-8 line is 7 words, under the 10-word speech box,
and is checked by count. I did not look at it on screen this round; that is named, not skipped by mistake.
**Method used:** level.md rules 12, 13, 14, 15, 17, 22; STAGE-RULES 5b.7 (speech box). **Method update (proposed):** level.md step 7:
"Before you call a red the level's data, log the platforms the failing check reads at the step that wrote them (the settle, the
join). Two of my four 'data' reds were engine order, found only that way." Planted for the new page test: CAUGHT.
**Lessons applied:** D19 (the page test reads the real PAGES and the real said hints), D23/D36 (frozen worktree for every gate),
D40 (no patching what ENG-LOOK replaces: protoStage left alone), law 22 (no seed-list dodge), law 3 (each claim from a probe on the
built stage).
**Learned (for the next builder):** (1) A finish that needs level or unbroken ground can meet any join the pipeline rolls: check seeds
1-4 at every finish seam, not seed 1 alone. (2) A chase cuts banks after the settle, so any check on "the ground" must be read on the
finished stage AND at the settle. (3) A rewritten keeper line carries her dated note in the same cell: parse it off, never edit her file.
**Proposed level.md rule (the lead decides):** "Every finish step that assumes the ground (a still fork, a tip, a cover) is built on
raw seeds 1-4 on both settings in the plan test." The check: gen2Pits already does 1-2; widen it to 1-4 for stages with a finish.
**Hours and cost (LEVEL-LOG):** start 10:01 PM ET; lines done 10:11; ENGINE-WORTHY 10:08 and 10:13; bots 10:20; gates 10:23-__END__.
About __HOURS__. No HF spend. Model cost: get_session at retire.
