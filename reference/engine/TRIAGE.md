# TRIAGE: how each OPEN item in SPEC-TRACE.md gets settled, and what the unused research is for

Written 2026-11-05 (10:50-11:50 AM ET) by a triage helper for the level designer, who reviews and commits it. Input:
`reference/engine/SPEC-TRACE.md` as it stood at 10:50 AM ET (1,115 lines; another helper was fixing its citation line numbers at the same
time) and re-read before finishing. ENGINE-SPEC.md and SPEC-TRACE.md were not edited. The 30 contradictions in SPEC-TRACE (b) are NOT
ruled on here; where an item touches one, the row names it (C1, C3 ...) and leaves it to the designer.

**What "G" means here.** Every G row cites a file:line that was opened for this triage and states what that line says. Where the
trace's own "how to settle" pointed at a line that, once opened, does not answer the item (or answers a different question), the row
says so and is tagged C or R instead. Line numbers are those files' as pinned in SPEC-TRACE's short-name table:

| Short | File (branch) |
|---|---|
| LEG | `reference/research/ledger/LEDGER-ENGINE-GEMINI.md` (origin/engine-design); "LEG:511 (E47)" = ledger line 511, row E47 |
| GP / GL | `reference/GEMINI-PCG-RESEARCH.md` / `reference/GEMINI-LEDGER.md` (engine-spec) |
| GV / GVs | `reference/research/GEMINI-VARIETY-2026-11-02-full.txt` / `GEMINI-VARIETY-2026-11-02.md` (engine-spec) |
| SR | `reference/STAGE-RULES.md` (origin/ccr-0d59a91c-oy3imz) |
| D | `reference/engine/DESIGNER.md` (origin/engine-design db3342a1) |
| R1-R4 | the four 11-05 research notes (scratchpad `notes/`, identical to the ccr copies) |
| MD / RM / ST / BR | MATT-DIRECTION.md, ROADMAP.md, STATUS.md, story-briefs/1-1.md (ccr) |
| LCA | `reference/research/ledger/LEDGER-CRITICAL-AGENTS.md` (origin/engine-design) |

**Settle-by tags.** **G** research answers it (file:line and the answer). **C** a run on our code (tool, measure, pass rule).
**R** primary-source research (what to search, what to extract). **M** (added, used sparingly): not a research or measurement question
at all, only Matt's call or a scheduling call; the row says what to ask. M rows are counted separately, not hidden inside G/C/R.

**Count note.** The trace's summary says 160 OPEN; the file read at 10:50 AM ET has 161 rows tagged OPEN (numbered #1-#161 below, in
file order). All 161 are here.

---

# Part 1. The OPEN items by topic

## 1.1 Moves and teaching

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 113-116 (#6) | Move ladder: <= 1 new move a stage; >= 2 earlier ones reused harder; none taught in the last 3 stages absent > 2 stages | R | The teach SHAPE is answered (SR:45-48 four parts; R1:68-72 L5 exposition / safe blocking validation / challenge; GV:105 a taught mechanic "should return later in the campaign without retraining"), but no opened line gives the three numbers. R1:527 says Shovel Knight puts "5 new enemies + 5 new objects per level", which argues against "<= 1 new thing a stage" if objects count. Search: Hayashida GDC 2012 "Level Design Workshop: Designing Super Mario 3D Land" and Yacht Club's Shovel Knight design talks/postmortem; extract new elements per course, how many earlier elements each course reuses, and the longest gap before a taught element returns. |
| ES 139-140 (#9) | An animal counts as a move on the ladder (harder form, absent <= 2 stages) | R | SR:19-20 makes everything return "in every later world, harder or combined", a world-level rule, not "within 2 stages". Search: enemy re-use spacing in Super Mario 3D Land / Wonder course lists (fan wikis listing enemies per course) and DKC Returns; extract stages between an enemy's appearances in its home world. |
| ES 174-175 (#11) | Unused animal frames give a second behaviour, the "harder form" | R | Search: Rayman Origins / Legends enemy variants (e.g. Lividstones' later forms) and DKC Returns' Tiki variants; extract whether a later form changes behaviour or only stats, and in which world it first appears relative to the base form. |
| ES 1288 (#121) | Breaking / creaky branch at 1-5 | C | Trace: moveladder.json row "breaking" says first 1-2. Run `tools/engine/moveladder.ts` on the current ladder data and correct the table; pass = table equals ML for every row. Touches (b) C9. |
| ES 1289 (#122) | Liana swing at 1-6 | C | Same run as #121 (ML row "liana": 1-2; d272601f "1-2 owns the lianas"). Pass = table equals ML. Touches (b) C9. |
| ES 1295 (#123) | Leaf glide: clearing 4-1, required 4-7 | C | ML has no glide row. Add it to moveladder data and re-run moveladder.ts; pass = the row exists and its echo/return columns meet ES 1317-1319. |
| ES 1311-1312 (#124) | A touch = 1-2 uses, some = 3-6 (one required), lots = 7+ | R | Search: Nintendo's four-step (kishōtenketsu) course structure as stated by Hayashida (GDC 2012; Iwata Asks: Super Mario 3D Land) and a per-course count of one gimmick's uses in a shipped course; extract uses per course for a course's main gimmick vs a guest gimmick. Then C: count uses per stage on old W1 with `mechtable.ts` to see where ours sit. |
| ES 1317 (#125) | Echo: the next 2 stages (skipping lairs), at least some, one required | R | R1:68-72 (L5) covers the teach, GV:105 the return "without retraining", neither the 2-stage echo. Search: Shovel Knight's "on cooldown" list (R1:527-528 names it) in Yacht Club's design posts; extract how soon after its home level an idea reappears. |
| ES 1318 (#126) | Own world after the echo: a touch every stage, some in half | C | `mechtable.ts` on old W1-W4: uses per stage of each world's own move after its echo; pass rule = the spec's numbers are no lower than the old world Matt rated best, with every stage >= a touch. |
| ES 1319 (#127) | Every later world: each core move in >= 1 of every 3 stages | C | SR:19-20 sets the floor (a move "comes back in every later world, harder or combined"); the 1-in-3 rate is not in it. Run moveladder.ts spread per move across the 102-stage plan; pass = SR:19-20 holds for every move (at least one later-world stage per world) and the 1-in-3 rate holds or the row names why not. |
| ES 1320 (#128) | Mixing W2 on: >= 3 known core moves besides run and jump, >= 1 from an earlier world | G | SR:54-55: "Each world shows its own pairs and brings back earlier ones; Worlds 8-10 use three and four at once". Answers ">= 1 from an earlier world" (yes) and puts 3-4 at once in W8-10; ">= 3 from W2" is the spec's own and is stricter than SR. |
| ES 1330 (#129) | The chase, the boa and the snake ring are set pieces and exempt | M | The trace's R1:572 is about rhythm courses, not set pieces (opened: it does not answer this). R1:570-571 supports a hand-made set piece at a world's end ("SMBF's bosses were its praised part"). Ask Matt one multiple-choice: set pieces exempt from the ladder's return rule (a) yes all three, (b) chase only, (c) none. |
| ES 1435-1437 (#145) | Trunk climb at 1-1 is the mixer's; re-run main's 1-1 to 1-3 | C | Run moveladder.ts on main's 1-1..1-3 (not yet re-run in any saved output); pass = trunk climb's first stage recorded from the run, not the mixer's label. |
| ES 1441 (#146) | Moving platforms taught in 2-7 beside the lift, echoed 2-8, 2-9 | G | SR:25: "Moving platforms early (from World 2), then back in every world." GVs:17: adopt 4-5 jungle kinds (pendulum branch, ride-to-start vine track, pulley ...). Answers "World 2" and "back every world"; the slot 2-7 is the spec's. Note GVs:18 (lift momentum, R-152.7) must exist first (Part 2). |
| ES 1516-1522 (#148) | Core moves list (jump ... swim) | G | GV:5: "two active player verbs (run and jump) and four environmental modifiers (breaking branches, vines, wind, and slow-downs)"; SR:54: "the six things ... make 15 pairs". The spec's list is broader (adds bounce, liana, rope, hide, push, glide, swim): consistent with SR §0b.5 as long as each is counted in the pairs table. |
| ES 1526-1531 (#149) | World moves (river logs, lift, warm air, silk) | G | SR:93-96: "Each world owns its pieces ... a later world may bring one back only if it changes something you feel ... and pairs it with that world's own mechanic." That is the rule each listed return must pass. |
| ES 1535-1548 (#150) | Ladder return rates (>= 1 in 3; 1 in 4 for push and hide; >= 2-3 stages for world moves) | R | Search: a per-course mechanic table for a shipped multi-world platformer (Rayman Legends level list with mechanics; DKC Returns / Tropical Freeze level gimmick lists on fan wikis; Super Mario 3D World course list); extract, per mechanic, the share of later stages that reuse it. Then C: mechtable.ts on old W1-W4 for ours. |
| ES 1566-1567 (#152) | Snapper to W6, spiders W5, frogs W8, boa back in W3-W4 | C | ML spreads: list each animal's absent run (boa absent 37 stages, 1-9 to 5-6); pass = no taught animal absent longer than the ladder's limit; the placement itself is then Matt's pick. |
| ES 1570-1571 (#153) | W2 on: >= 3 core moves besides run and jump, one from an earlier world | G | Same as #128: SR:54-55. |
| ES 1598-1601 (#154) | Swim: 6-7 teaches, 6-8/6-9 echo, then W6-W8 and W10 >= 1 in 3; none in W9 | C | mechtable.ts / ML for swim stages; pass = echo and return rows met; W9 exclusion is Matt's pick. GVs:19 (opened) records swimming is built (87f1e2f6) and the water research "in-and-out every 15-20 s, wide clear exits" for the stage. |
| ES 1652-1653 (#156) | Hanging moves are core; trunks are anchors | G | D:1201: hang under and shimmy is "the most sloth move there is ... a signature for the game", ladder 1-2. Answers "core". |

Research brief (moves and teaching): *From Hayashida's GDC 2012 Super Mario 3D Land talk, Iwata Asks on 3D Land / 3D World, Yacht Club's
Shovel Knight design posts and DKC Returns / Rayman Legends level lists, extract per shipped course: new elements introduced, earlier
elements reused (and in what harder form), the gap in stages before a taught element or enemy returns, and uses per course for the main
vs a guest gimmick; report as numbers with the page and line.*

## 1.2 Water and swimming

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 104 (#5) | Lily-pad hop: small, big, sinking pads | C | protoStage lilyPads (main :2294-2305, per trace) has no sink. Read the engine-render water zone code and list which pad kinds exist; pass = the spec names only built kinds, or the sinking pad goes on the build list. (ES 575 says pads don't sink.) |
| ES 575 (#59) | Sinking log: skip; cracking log gives the same feel for less | R | GP:42 (opened) lists "rhythmic sinking platforms" as a stage's single focal twist ("One-Off Wonder" rule), so research does not say skip. Search: DKC Tropical Freeze / DKC Returns sinking-platform stages (and Rayman Legends' sinking platforms); extract whether a sinking piece is a stage's theme or a passing piece, and its sink time. |
| ES 833-834 (#92) | S-9: stepping stone <= 50 px above the water; taller ones are stumps | C | Stills of the water zone at 30, 50, 70 px tops, upright and sideways; pass = at 50 px the stone still reads as "in the water" on Matt's phone frame. |
| ES 1598-1601 (see #154 in 1.1) | Swim teach and return | (C) | Counted once, under 1.1. |

Research brief (water and swimming): *From DKC Tropical Freeze, DKC Returns and Rayman Legends, list every stage whose theme is a sinking or
bobbing platform, its sink time and whether it is a stage's one twist or a passing piece; give stage names and sources.*

## 1.3 Pacing and rests

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 331 (#31) | Up and down node by node, overall trend down | C | Arc check on 16 rolls of 1-5 (spec field `arc`, ES 1214): sign of each node's net dy and the stage's net dy; pass = trend sign matches the profile on every roll, and no two neighbours share it (see #99). |
| ES 341 (#32) | n1 warm-up: bough stair level form, bank hops | G | SR:45-46: "Part 1: the stage's mechanic shown safely (a miss lands on solid ground), 5-10 s groups." The warm-up must be a safe-miss, 5-10 s group; the piece choice (bough stair) is the spec's. |
| ES 343 (#33) | n3 a local rise (bounce up, the climb) | C | SR §0b.2 (opened, :45-48) says nothing about rises, so the trace's (i) does not answer it. Measure on the CP3 maps: n3's net rise and whether it is the stage's first climb; pass = the rise is visible in both orientations and n3's time sits inside its group length. |
| ES 390-391 (#38) | A node lays 2-3 bursts of 4-6 pieces | G | SR:43-44 groups last 5, 10, 15 or 20 s; R3:199-200 Launchpad group lengths 5/10/15/20 s; GP:292 Easy 3-4 actions in 6-8 s, Normal 8-12 in 10-14 s. Caveat R3:207-211: GP's table is self-contradictory (a Normal burst is slower than its own rest). Answer: judge bursts by TIME (5-20 s) with R3:212-213's rest boundary (a rest is >= 2x local median and >= 1.0 s Normal / 2.0 s Easy), not by piece count; 4-6 pieces is inside Easy-to-Normal GP counts. |
| ES 391-392 (#39) | Teach pairs with bank hops; rest is one short walk | C | Fun-gate dead time on n2 over 16 rolls; pass = the rest meets R3:212-213's boundary and GP:291's max eventless walk (3.0 s Easy, 2.0 s Normal). |
| ES 506 (#50) | n2 teach bank 900 -> 600 px | C | Fun-gate dead time at 600 and 720 px (built as 720, ES 738); pass = eventless walk <= GP:291 (3.0 s Easy / 2.0 s Normal). |
| ES 752-753 (#83) | Easy bursts 3 pieces, snap dash 5; rests 4-5 s with a petal arc | G | GP:292-293 Easy: groups 6-8 s, 3-4 actions a burst, rests 2.0-2.5 s. R3:212-213 Easy rest >= 2.0 s. Answer: 3 pieces fits; 4-5 s rests are double the research's 2.0-2.5 s (allowed as a floor, not as a target). (Contradiction C2 is the designer's.) |
| ES 874 (#94) | Double breather adds about a minute (Easy about 5:20) | C | Build it once and clock with stageTime.ts (MODEL_FAST and first-timer); pass = the measured minute replaces the estimate. |
| ES 877-878 (#95) | (a) double breather about 0.52; (b) keep 0.61 | C | Same build; measure the Easy pacing number for (a); then Matt picks between two measured options. |
| ES 944 (#99) | Overall trend up, so 1-1 and 1-5 never share a shape | G | SR:58: "Neighbouring stages must not share a tempo and camera direction." Answers the intent (direction must differ); 1-1 and 1-5 are not neighbours, so the spec's use is stricter than SR. |
| ES 1073 (#104) | n9 the moment: 3-4 rising doubles, catch boughs below | C | cp4-jumps11 and the first-timer bot on n9; pass = first-test success ~0.85 Normal adult / ~0.92 Easy kid (R3:60-61) and every miss lands on a catch bough. |

Research brief (pacing and rests): *No R items; all settle by runs against GP:290-293 and R3:205-214.*

## 1.4 Variety and repetition

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 41 (#2) | Neighbours share <= half their main pieces | C | LEG:511 (E47) says "cross-stage Jaccard < 42%", but the row that defines that number, LEG:591 (E127, "Sim ... 4-gram Jaccard <= 0.42"), is marked "NOT ... not taken: cap our own metric instead". So the ledger declines Gemini's number. Run cp2/tag_ideas.py on old W1 neighbours (and old 1-1 vs 1-3, Matt's references); pass rule = cap at or under the old pair Matt calls different. SR:83-84 (no template in more than 3 of a world's stages) is a second, separate cap. |
| ES 128-129 (#7) | A world's own new ideas lead; others fill in | G | SR:93-96: "Each world owns its pieces: a template belongs to one world, and a later world may bring one back only if it changes something you feel ... and pairs it with that world's own mechanic." R4:577-579: each stage draws a small themed pool from the world's sections. |
| ES 133-134 (#8) | Variety gate counts the whole library; neighbours <= half their ideas | C | Same as #2 (the ledger declined 0.42, LEG:591). |
| ES 208-209 (#15) | CP3's 1-5 draws only proven ideas; World 1's 14 ideas | C | List the ideas in library.ts (98b08168); pass = the count and names are printed by the tool, not hand-summed. |
| ES 235-236 (#21) | A stage is a sequence of node ideas; neighbours share <= half | C | Same as #2. |
| ES 244 (#22) | A stage has >= 4 ideas | C | Count ideas in old 1-1 (6, cp2/idea-tags.out) and 1-3 rolls; pass rule = >= the lower of Matt's two references. Context: R1:527 Shovel Knight 5 new enemies + 5 new objects a level; D:430 Dahlskog "about 15 beats" a level. |
| ES 348 (#34) | n8 creek deck, "not the one n4 rolled" | G | LEG:504 (E40): "2-4 meso-patterns per node from a stateful deck, locked out for M = 4 draws" ("have; extend to beat patterns"). GL:36 (C4) / GP:256 are cross-LEVEL cooldowns (2 levels), not within a stage. Answer: lock a deck out for 4 draws; n4 to n8 is 4 nodes, so E40 just allows it. |
| ES 393 (#40) | Kind or size band changes at least every 2 pieces | C | Old 1-1 runKS median 7 (cp1/table2.txt:2, opened: runKS=7 (3-9)). Run kind x size run lengths on 16 rolls; pass rule = no looser than old 1-1 (<= 7) unless Matt's ranking says tighter. LEG:589 (E125) "no symbol 3 times running" is a second candidate rule. |
| ES 408-410 (#41) | Canopy over floor as a burst, 2-5 pieces, never twice in a row | C | idea-tags.json stretch lengths of old 1-1's fork; pass = the 2-5 band covers old 1-1's stretches. |
| ES 439 (#42) | n8 deck draws one the previous two nodes did not lay | G | LEG:504 (E40) lockout 4 draws (stricter than 2). |
| ES 453 (#43) | Each node draws only from its own deck | C | Assert in w1mix (9da17a27 did); pass = the test fails on a cross-deck draw. |
| ES 457-458 (#44) | Creaky >= 15% of landings and in the top 3 kinds | C | D:422 (Hayashida: one core concept "carried through absolutely all the way") gives the intent, not 15%. Measure creaky share on today's 1-5 and Matt's 1-5 notes; pass = top 3 and >= the share Matt called "all cracking logs" minus enough to clear the share cap. |
| ES 465-466 (#46) | Bridge only as the bough stair's top piece | C | "Something new" line with and without the bridge (cp3/CP3-REBUILD.md:48-49); pass = newMeanPx no worse than old 1-1's 572. |
| ES 987 (#102) | Boughs + creaky <= 30% of 1-1's landings | C | BR:46 (Matt: "the last time it was 90% branches that were tied to trees") gives the fault, not the cap. Measure old 1-1's bough share (cp1 measures2.json); pass rule = cap at old 1-1's share. |
| ES 989 (#103) | 1-1 and 1-5 share <= half their ideas | C | Same as #2. |
| ES 1098 (#105) | Neighbours share <= half their main pieces | C | Same as #2. |
| ES 1224 (#115) | 1-1 vs 1-5 <= half their ideas | C | Same as #2. |
| ES 1225 (#116) | 1-1 caps: boughs + creaky <= 30% | C | Same as #102. |
| ES 1380 (#132) | Core pieces >= 50% of landings | C | Share of the top-3 kinds on old 1-1 (cp1 measures2.json); pass rule = >= old 1-1's top-3 share. |
| ES 1385-1387 (#133) | The per-world object pass, world by world | G | SR:93-99 lists what each world's pass decides: its own pieces, its fingerprint ("beat mix, camera directions, mechanic pairs and piece set"), the comparison against every earlier world. The order of worlds is a scheduling call. |
| ES 1396 (#134) | bank: W1-W4, W6-W10 | C | cp2/library.txt:3 places banks in W1-W7, W9-W10; the W8 object pass decides W8; pass = table equals library.txt. |
| ES 1397 (#135) | log: W1-W4, W6 | C | cp2/library.txt:2 has logs in all 10 worlds; pass = table equals library.txt. |
| ES 1398 (#136) | stump: W1-W4, W6 | C | Atlas listing (tools/art/artuse.mjs) of stump frames per world; pass = table equals the atlas. |
| ES 1400 (#137) | mushroom: W1, W3, W6 | C | cp2/library.txt:9 lists 1, 3-5, 7-10 (no W6); pass = table equals library.txt. |
| ES 1401 (#138) | bough: W1, W2's banks, W5, W6, W8 | C | cp2/library.txt:4 lists branch in all 10; pass = table equals library.txt. |
| ES 1402 (#139) | creaky: W1, W5, W6, W8 | C | cp2/library.txt:11 lists crumble/snap in 1, 5, 7-10; pass = table equals library.txt. |
| ES 1403 (#140) | crumble slab: W1 (shrine stone), W7 | C | Stale: removed from W1 at ES 1450 (acf6e1e8). Pass = the row reads W7 only (touches (b) C22). |
| ES 1404 (#141) | bridge: W1, W5, W6; from 1-1 n8 | C | cp2/library.txt:7 lists bridges in 5, 8-10; pass = table equals library.txt. |
| ES 1409-1411 (#142) | Fix 1: no stump kind; planner says which | C | Read the planner's library.ts kinds; pass = the fix names the kind the code has. |
| ES 1412-1413 (#143) | Fix 2: crumble fits W1 only by the shrine stones | C | Stale (withdrawn ES 1450, acf6e1e8); pass = the fix is struck. |
| ES 1417-1419 (#144) | Fix 4: later worlds closed until their pass | G | SR:93-99 (as #133): a world's pieces are decided in its own pass and checked against earlier worlds. The timing is a scheduling call. |
| ES 1550-1561 (#151) | World hazards return only where the element fits | G | SR:93-96 (return only if it changes something you feel and pairs with that world's mechanic); GV:105 (return "without retraining to serve as the twist"). |

Research brief (variety and repetition): *No R items; the open numbers are calibrated on Matt's two references (old 1-1, today's 1-3) by
runs, because the ledger itself declined Gemini's 0.42 (LEG:591).*

## 1.5 Difficulty and the dial

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 219 (#16) | Boa on Normal: rear-up tell, flat run-up >= one screen's width | G | LEG:572 (E108): boa "Gatekeeper_Ledge >= 3.5 W from the entry" ("adopt the role"); LEG:581 (E117): "1.0 s (30 frames, ~285 px) flat runway before an enemy trigger on Easy and Normal T < 0.6" ("consider (stricter)"). Answer: >= 1.0 s / about 285 px; one screen (412-915 px) is 1.5-3x that. |
| ES 220 (#17) | Turtles: <= 2 in a line on Easy, 3 on Normal | C | cp2-animals.ts: kid Easy and adult Normal hits per line at 1/2/3 turtles; pass = <= 1 heart lost per line (the #18 rule). |
| ES 221 (#18) | Pass: past each animal with <= 1 heart lost | C | cp2-animals.ts re-run; pass rule from R3:60-61: a newly taught animal's first test succeeds ~0.85 (Normal adult) / ~0.92 (Easy kid). |
| ES 227 (#19) | A first-timer pausing has about 0.3 s spare at 0.7 s | C | cp2-trace.ts with FT_PAUSE on a 0.7 s tile; pass = the spare time printed, >= 0.3 s. |
| ES 628 (#63) | d = (0.1(w-1) + 0.2(s-1)/8) / 1.1 | C | Gemini's D(w,s) (LEG:601, E137) is marked "contradicts §1b" and was rejected (D:945). GL:69 (F2): `tools/inspect/bands.ts` gives a measured 0-100 score per stage and setting. Run bands.ts on old W1-W4 and fit d; pass = d rises with every stage inside a world and no stage of world N above world N+1's first (SR:133). |
| ES 635-636 (#64) | Each dial linear in d; all estimates | C | R3:257-259 (F17): measure Δ(bot success) per unit change of each knob on a fixed stage. Run noisy bots at d = 0, 0.5, 1 on the mixer; pass = bot success falls monotonically with d on every knob. |
| ES 640 (#65) | Gap share: Normal 0.55 -> 0.92, Easy 0.45 -> 0.80 | G | LEG:567 (E103): single jumps Easy 0.25-0.55, Normal 0.35-0.75 of R_1; doubles Easy 0.40-0.60, Normal 0.50-0.78 ("adopt as starting ranges, calibrate on bots"). D:177: calibrated on what shipped, Normal 0.35-0.75, Easy 0.25-0.50. GP:75-76: never above 0.65 Easy / 0.82 Normal. D:48: gap share "shapes the look and the stride, not the difficulty". All four put the spec's tops (0.92 / 0.80) above every source. (C1, C20 are the designer's.) |
| ES 641 (#66) | Rise share: Normal 0.50 -> 0.95, Easy 0.40 -> 0.80 | C | cp2-trace.ts flick windows per rise share; pass = flick window >= GL:72 (F5) floors (167 ms Normal / 300 ms Easy) at the top of each band. |
| ES 642 (#67) | Typical landing p50: Normal 220 -> 110 px, Easy 260 -> 150 px | G | LEG:569 (E105): pads 3.5 W (climax, Normal) to 7.0 W (intro, Easy) = 154-308 px ("consider ... against our 90 px floor"). Answer: Easy at d = 0 is about 308 px, Normal's climax floor about 154 px; the spec's 110 px Normal end sits under it. (C4 is the designer's.) |
| ES 643 (#68) | Risky pieces a burst: Normal 0-1 -> 3-4, Easy 0 -> 2 | C | R4:555-557 gives the target in falls, not pieces: "expected falls per node ... intro 0, spike 0.2-0.4, climax 0.3-0.6 on Normal (estimates)". Run the noisy bots per node and report expected falls; pass = inside R4's bands, then read off how many risky pieces give that. |
| ES 644 (#69) | E[lives] first run: Normal 0.5 -> 3.0, Easy 0.2 -> 1.0 | G | R3:42-44 and D:200: World 1 Normal E[lives] <= 1.0, Easy <= 0.3, rising about +0.5 a world on Normal. R4:559-562: calibrate the bots on touchReplay recordings first ("until then every bot-derived goal ... rests on Gemini's guessed noise"). (C16 is the designer's.) |
| ES 645 (#70) | Taught animals a stage: Normal 0-1 -> 4-5, Easy 0-1 -> 3 | C | LEG:578 (E114) gives enemies a MINUTE (Easy 3.5 -> 6.65, Normal 5.5 -> 11.35, "unproven; check against 35% enemy-free"), a different unit; D:207 keeps >= 35% of nodes animal-free. Count animals per old W1-W4 stage (cp2/enemies.txt) and per minute; pass = >= 35% animal-free nodes and the count no lower than old W1-W4 at the same d. |
| ES 646 (#71) | Crumble delay: Normal 0.9 -> 0.5 s, Easy 1.2 -> 0.8 s | G | LEG:615 (E151): creak delay 36 / 20 frames (= 1.2 s Easy, 0.67 s Normal at 30 fps). SR:51-52: snap twig ~0.15 s, creaking limb ~0.6 s. RM:418: fragile platforms break 1.1 s after landing today (engine.ts:2428). Easy 1.2 s matches; Normal's 0.9 matches no source. (C3 is the designer's.) |
| ES 647 (#72) | Timed windows: Normal x1.0 -> x0.75, Easy x1.15 -> x0.9 | C | GL:72 (F5) sets the floor: "minimum input window 300 ms Easy / 167 ms Normal". Measure pressWindow per piece; pass = every piece's window at d = 1 stays >= the floor. |
| ES 648 (#73) | Bursts a node 2 -> 3 | C | Stage length per burst count on the mixer (16 rolls); pass = length stays inside SR:36-38 (2-5 min first-timer). (C21 is the designer's.) |
| ES 963-964 (#100) | n7-n9 is the only place in 1-1 where a miss costs a setback | C | Run the first-timer on 1-1; list every node where a miss costs > a retry; pass = only n7-n9. Context: R3:60-61 (first test ~0.85). |

Research brief (difficulty and the dial): *No R items; every open dial number has a research start (LEG E103, E105, E151, R3 F1) and
settles by bot runs, after the bots are fitted to the touch recordings (R4:559-562).*

## 1.6 Rewards, pickups and hearts (and checkpoints)

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 288 (#25) | <= 1 heart per risky node; fewer hearts than risky nodes | C | Matt's rule is MD:77-78: "if you're not going to lose a heart, don't put a heart there." Count hearts vs risky nodes on old 1-1 (cp1/table2.txt:2 opened: Normal hearts=2, Easy hearts=15); pass = no heart in a node a first-timer bot never loses a heart in. |
| ES 300 (#26) | Replay after a loss <= about 45 s | G | SR:64-65: "Tighter checkpoints as stages get harder: respawn within about 2 s of the hard part." GV:165: checkpoints on the rests before Cells 3 and 4, "respawn within two seconds directly at the threshold of the challenge". (C10 is the designer's.) |
| ES 314 (#28) | <= about 8 pickups a view | C | Trace: old 1-1 measured pickSideMax 6 sideways, 4 upright (cp1/table2.txt:2). Pass rule = <= old 1-1's max per orientation. |
| ES 356-359 (#35) | One mark per non-fork node (9), one per fork road (4) | C | LEG:582 (E118) gives golden seeds 3 a stage and hidden finds 1-2, not marks per node; the trace's (i) does not answer it. Run the first-timer bot and record marks per route; pass = each route's marks reachable on Easy. |
| ES 360 (#36) | Goal 85% Normal (11/13), 65% Easy (9/13) | G | LEG:582 (E118): petal goal 75% of total; LEG:584 (E120): single-pass yield 0.85 x total; SR:115: "Normal goals: 87.5% of reachable petals" (goals.ts). Normal goal sits in 75-87.5%. No opened line gives an Easy goal: Easy settles by the first-timer kid bot (C). |
| ES 462-463 (#45) | Marks goal Normal 10/13, Easy 8/13 | G | As #36: 10/13 = 77% is inside 75-87.5% (LEG:582, SR:115); Easy by the kid bot. |
| ES 522 (#54) | Checkpoints before n6 and n10 only, plus start | G | SR:48: "Checkpoints sit on the rests before parts 3 and 4." GV:165 same. Stale in the spec (withdrawn at ES 431; C11 is the designer's). |
| ES 828 (#90) | Goal stays 10/13 Normal, 8 Easy | G | As #45. |
| ES 1228 (#117) | Marks 0 for a sprint | R | GV:173 (opened) tiers collectibles by stage TYPE but names no sprint rule. Search: DKC Returns / Tropical Freeze mine-cart and rocket-barrel stages' collectibles (KONG letters, puzzle pieces) and Rayman Legends' run stages; extract whether chase/sprint stages carry collectibles and how many. |

Research brief (rewards): *For chase and sprint stages in DKC Returns, Tropical Freeze and Rayman Legends, list each stage's collectibles
(count and placement on or off the line) with the source page.*

## 1.7 Layout and geometry (gaps, rises, widths, splits)

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 37 (#1) | Two roads >= 120 px apart count as a split | C | cp3/split180.py on old 1-1 at 80/120/160/200 px (and the unstated > 300 px run, :11); pass = the count at the chosen distance matches what Matt sees as "two roads" on a still. |
| ES 181 (#12) | A landing after +40 is >= 110 px | C | cp2-trace.ts: Easy +40 onto 90/110/130 px landings; pass = kid-bot success >= 0.92 (R3:60-61, first test) at the chosen width. |
| ES 182 (#13) | +50 to +70 only onto >= 220 px | C | As #12 at +50/+60/+70 onto 150/220/300 px. |
| ES 313 (#27) | Phone views 400 x 880 upright, 1100 x 540 sideways | C | Read for this triage: `tools/perf/clipcheck.mjs:54-55` uses 412 x 915 upright (insets top 48, bottom 24) and 915 x 412 sideways (insets bottom 21, left/right 48). The spec's sizes match neither. Pass = the spec's view caps use clipcheck's two viewports minus insets. |
| ES 315 (#29) | <= 2 kinds of hazard or animal a view | C | LEG:469/485 (E5, E21) are about pairwise adjacency, not kinds per view; the trace's (i) stretches. Sliding view (clipcheck sizes) on old 1-1; pass = <= old 1-1's max. |
| ES 316 (#30) | <= 3 kinds of standing piece a view | C | Sliding view on old 1-1; pass = <= old 1-1's max per orientation. |
| ES 378 (#37) | Fork roads keep their own height band | C | LEG:516 (E52) is split closure (Σdx, Σdy equal at the merge), not height bands; the trace's (i) does not answer it. Measure each fork road's y band on 16 rolls; pass = bands never overlap (the #1 split distance). |
| ES 477-483 (#49) | A floor idea joins each one-idea or climbing deck | C | Already re-measured (8c8cd997: splits 25-26, two-road 46-50%); pass = the numbers are in the spec with the commit. |
| ES 516-517 (#52) | Fork share n4 + n10 15-20% each | C | Stale; measured 11-13% (cp3/cp3-forks.txt:1). Pass = struck or replaced by the measured line (C11 is the designer's). |
| ES 518-519 (#53) | Two forks with >= 3 crossings; a third in n9 if short | C | Splits per roll on 16 rolls; superseded by recurring canopies (ES 405-411). |
| ES 597-599 (#60) | A hill is a stepped mound of 2-4 rises | R | D:430 (opened) says Dahlskog & Togelius cut SMB into 23 patterns including a "stairs" group, with no step counts. Search: Dahlskog & Togelius 2012 "Patterns and procedural content generation" (DPG workshop) stair pattern definitions, and SMB 1-1 / 1-2 stair heights; extract rises per stair. |
| ES 696-700 (#79) | P-3 ground ends dressed; check drops over 120 px | C | Count bank ends by drop height on old 1-1; pass = every drop over the chosen height shows a dressed end in stills. |
| ES 811-812 (#87) | On Easy about 6 nodes keep the canopy, 3-4 drop it | C | Measured after (b88f2ea2: Easy splits 20); pass = number in the spec with its commit. |
| ES 812 (#88) | Kept canopies: fork neighbours and the node after a teach or test | C | GV:69 (opened) is the Ten's risk-reward portal, not which nodes keep a canopy; the trace's (i) stretches. Measure Easy two-road share with and without the rule; pass = >= 20% (ES 1175). |
| ES 980-983 (#101) | Splits in the first half from the ground; n5 a ground fork | C | Already measured (098aff49: splits 2-4); see ES 1158. |
| ES 1172 (#108) | Splits whole stage >= 10 (>= 12 with hollow logs) | C | Build with the n8-n11 tree half and measure. |
| ES 1173 (#109) | Splits n8-n11 >= 7 | C | Old 1-1's splits per 1,000 px of canopy x the tree half's length. |
| ES 1174 (#110) | Two-road Normal >= 25% | C | 16 rolls on the finished 1-1 (measured 24-28%). |
| ES 1175 (#111) | Two-road Easy >= 20% | C | As #110 (measured 19-22%). |
| ES 1177-1178 (#112) | Choice in the ground half from forks, hollow logs and side pockets; no thin raised roads | G | GV:173: the second collectible tier "require[s] the player to identify an alternate cell entrance or ascend an optional vertical branch structure". Answers side pockets and branches as the place for choice; "no thin raised roads" is Matt's (BR:46 context). R1:524 (grade board) does not bear on it. |
| ES 1215 (#114) | 1-1 elements: ground >= 70% n1-n7, tree >= 60% n8-n11, water 0 | C | Element share on the 098aff49 build; pass = shares printed per node range. |

Research brief (layout): *From Dahlskog & Togelius 2012 and Super Mario Bros. 1-1/1-2 maps, give each stair/hill's number of rises and
rise height in tiles, with the figure or map source.*

## 1.8 Art, look and floating

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 148-149 (#10) | Dressing stays dressing; boss frames stay with bosses | G | SR:218-219: "Use ALL the art we make ... Every prop, state frame, creature clip and backdrop ... has a place in the game." Compatible: every frame must be placed somewhere; whether an item is dressing or a piece is Matt's per item. |
| ES 547-548 (#56) | Backdrops and clip alternates are dressing and story | G | SR:218-219 (as #10). |
| ES 703-704 (#80) | P-5 flags, marks, hearts on the path; base within 4 px of a standable top | C | GL:82 (G3) is the FOOT's landing slop (8 / 12 px), not a prop's visual seat. Stills of props at 0/4/8 px off a top, upright and sideways; pass = no visible gap at the chosen tolerance. |
| ES 705-708 (#81) | P-6 upright screen never half empty; 3 views of 4 | C | Sliding upright view (412 x 915, clipcheck.mjs:54) on old 1-1; pass rule = >= old 1-1's share of non-empty views. |
| ES 772-777 (#85) | S-4 boughs share a tree (2-3 boughs); no two neighbouring trunks share art | C | Count boughs per trunk on old 1-1. |
| ES 861-863 (#93) | Deep pits: dark follows the bank faces then fades over about 300 px | R | Stills exist (cp3/pit-fade-choice on ccr) for Matt's pick. Search: Ori and the Blind Forest / Rayman Legends pit and chasm edge treatments (screenshots or art talks, e.g. Moon Studios' GDC art talk); extract whether the dark follows the bank face and how far it fades. |
| ES 931 (#96) | Boughs within 220 px share one tree | C | Bough-to-trunk spacing on old 1-1 and main's kapok placement. |
| ES 932 (#97) | <= about 3 full trunks a screen width | C | Trunks per 1,400 px (ES 1057) on old 1-1; pass = <= old 1-1's max. |
| ES 933 (#98) | Further boughs hang from a shared trunk's side branch | C | Atlas search for a side-branch frame (tools/art/artuse.mjs); none found = an HF picture-list item for Matt to approve. |
| ES 1249-1250 (#118) | Creaky / rotten on a trunk or bough; vine top never in open sky | G | SR:602-603: "Ledges in the air: nothing floats ... A stump, root arch or den ... grows out of the ground: hung in mid-air it looks wrong". The vine and bough cases follow the same rule. |
| ES 1251 (#119) | Crumbling ledge: element as its art shows | C | Atlas key check of the crumbling-ledge frames. |
| ES 1253 (#120) | Exit totem, shrine on a long ground piece | C | Atlas footprint width of each frame vs ground piece widths; SR:602-603 (nothing floats) is the pass rule. |
| ES 1363 (#130) | 1-1 float cap <= 15% | C | Matt: MD:125 "floating objects are fine as long as it looks good and plays good ... a Mario type thing". Float share on old 1-1 (Matt's best); pass rule = <= old 1-1's share. |
| ES 1364-1365 (#131) | 1-5 and default <= 25% | C | As #130. |
| ES 1453-1456 (#147) | 1-5's ground breakable is W1 rotten wood, else an art gap | C | Atlas key search for W1 rotten wood; none = an art gap on the HF list. |
| ES 1654-1655 (#157) | Float default "some, <= 25%" | C | As #130. |

Research brief (art): *From Ori and the Blind Forest and Rayman Legends, collect 5 screenshots each of a deep pit or chasm edge and say
how the dark meets the bank face and over what height it fades; source each image.*

## 1.9 Length

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 471 (#48) | 1-4 and 1-6 sit >= 20% either side of 1-5's median | C | stageTime.ts MODEL_FAST on old W1-W4 neighbours; pass rule = the spread that old worlds show between neighbours, floored by #75. |
| ES 667 (#74) | A world's nine stages spread from about 2:00 to about 5:00 | G | SR:36-38 (Matt, 11-04): a first-timer on Normal takes 20-25 min for World 1 ... "each stage 2-5 min for a first-timer, and never under 2 min for a skilled player". Answers it. |
| ES 667-668 (#75) | Neighbours differ by >= 20% on the quick clock | C | D:1256 gives 15% for neighbouring stages' PULSE (tempo), from SR:58 "must not share a tempo"; neither is a length rule. Quick clock of old W1-W4 neighbours; pass rule = set from the measured spread. |
| ES 668 (#76) | The set piece or finale is among the longest | R | Search: speedrun splits (speedrun.com any% individual levels) or HowLongToBeat per-level times for Rayman Legends, DKC Returns and Super Mario 3D World; extract whether each world's last stage is in its top three by time. |
| ES 673 (#77) | No two neighbours within 20% | C | As #75. |
| ES 674 (#78) | A world's spread >= 2.5 minutes | R | SR:36-38 allows 2-5 min a stage but does not require a spread. Search: per-stage clear times for one shipped world (as #76); extract the world's shortest and longest stage. |
| ES 831-832 (#91) | The 20% spread judged on Normal's quick clock | C | As #75. |

Research brief (length): *From speedrun.com individual-level leaderboards and first-play videos (a fixed creator, first run) of Rayman
Legends, DKC Returns and Super Mario 3D World, list each world's stage clear times; report each world's min, max, spread, and whether the
finale is in the top three.*

## 1.10 Easy vs Normal

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 228 (#20) | Easy crumbling tile waits 1.0 s | G | LEG:615 (E151): creak delay 36 frames Easy = 1.2 s. SR:51-52: creaking limb ~0.6 s. (C3 is the designer's.) |
| ES 468 (#47) | Easy dial width 220 px at d = 0 down to 150 at d = 1 | G | LEG:569 (E105): Easy intro pad 7.0 W = 308 px; climax Normal 3.5 W = 154 px. (C4 is the designer's.) |
| ES 790-792 (#86) | Easy pacing judged over 16 rolls by median and worst | G | R3:116-121 (F6): judge a generator over many rolls ("Launchpad used 10,000, Horn 1,000"); target sd of each metric over 200 rolls >= 0.05, or the stage is declared a fixed composition. Answer: 16 rolls cannot show the spread; use 200 or declare fixed. |
| ES 819 (#89) | Easy high-road boughs keep Normal's bands | G | SR:135-137: "Easy is gentler, never empty ... just easier versions: wider landings, more forgiving timing ... Don't remove a move from Easy; soften it." Answer: the Easy high road is softened too, not Normal's bands. |

Research brief (Easy vs Normal): *No R items.*

## 1.11 Checks and bots

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 282-283 (#24) | Check every pair in the kit, over 16 rolls | G | LEG:485 (E21): "pairwise adjacency; difficulty super-additive (gap then enemy on the landing)" ("adopt in the builder"); LEG:469 (E5) "adopt via the pairwise cap". The 16 rolls is our curation count (D:615). The trace's R4:51 citation is about many small pieces, not pair checks. |
| ES 511 (#51) | Normal's flags no worse than main | C | Fun gate on main vs mixer for the same stage; pass = flag count <= main's. |
| ES 1702 (#161) | Both lines kept; judged on whichever fails first | C | Report both lines after the run. |

Research brief (checks): *No R items.*

## 1.12 Process and cost

| Spec line | The item | Settle-by | Exactly what |
|---|---|---|---|
| ES 59 (#3) | CP1 cost 0.5-0.8% of the week | C | Matt's meter before/after (ST:965 read CP1+CP2 as about 0-1%). |
| ES 97 (#4) | CP2 cost 0.8-1.2% | C | Meter reading. |
| ES 204-205 (#14) | Matt picks which small builds to make | M | No saved Matt rule (MD:17 gives the designer "full say" on use). One multiple-choice to Matt: (a) Matt picks, (b) designer picks and Matt vetoes, (c) designer picks. |
| ES 268 (#23) | CP3 cost 1.5-2% | C | Meter; actuals were 2-3% (cp3/CP3-CHECKPOINT.md:89), round 2 5-6% (ST:966). |
| ES 538-545 (#55) | Eight ideas and their estimates (0.1-2% each) | C | Meter on the first one built. |
| ES 553 (#57) | Second: mangrove roots | C | Cost each option on the meter, then Matt picks between two costed options. |
| ES 567-575 (#58) | Log family estimates (0.1-1.5%) | C | Meter. |
| ES 605-615 (#61) | Ground family estimates (0.1-5%) | C | Meter. |
| ES 615 (#62) | True slope: 3-5% plus HF; not now | R | D:417 (opened): Tiny Wings' hill algorithm is "unconfirmed (Illiger's interview was blocked)". Search: Andreas Illiger's Tiny Wings interviews and Snowman's Alto's Adventure postmortem (Gamasutra/Game Developer 2015); extract how slopes are generated and how long the slope engine took to build. |
| ES 742-745 (#82) | Polish order if the budget forces a split | M | A scheduling call; the spec's own rationale (ES 742-744) stands until Matt or the designer reorders. |
| ES 754 (#84) | n7b's Dot line | G | SR:118: "Any new line is marked '(new, needs Matt's approval)'." |
| ES 1104 (#106) | CP4 cost 1.5-2% | C | Meter. |
| ES 1110 (#107) | CP5 cost about 0.2% | C | Meter. |
| ES 1206-1207 (#113) | The planner may add fields, not remove any | M | A process rule between designer and planner; no research bears on it. |
| ES 1631-1633 (#155) | Designer cost: 1.5 h, 0.5 h, 1 h a world | C | Clock the first world's pass. |
| ES 1671 (#158) | Engine's remaining steps about 6.5% | C | Meter after each step. |
| ES 1678 (#159) | Line 2: <= 1/3 of 1-5's hand-mix: <= 1.7 h, <= about 1.1% | G | RM:473 (R-163): "Stages built from a spec in about an hour". D:1043 is a "done when" for rebuilding 1-2, not a time target (opened; it does not answer this). Answer: about 1 hour a stage. |
| ES 1685 (#160) | <= 2 fix rounds, each data-only | R | MD:172 (Matt: "If 1-1 takes too long and it still needs a lot of pieces fixed, the engine gets fixed. We don't just go into the stage and fix it") gives the rule "data-only, engine fixes", no number. Search: Thompson's "Keep Running: Procedural Level Generation in Sure Footing" (Game Developer; already in designer-sources/) and Spelunky 2 / Dead Cells postmortems; extract how many iteration rounds a generated level took before ship. |

Research brief (process and cost): *Read the saved Sure Footing article (designer-sources) and Alto's Adventure / Tiny Wings interviews;
extract (1) iteration rounds per generated level before ship, (2) time to build a slope engine, each with the quoted line.*

## 1.13 Part 1 counts

| Topic | Rows | G | C | R | M |
|---|---|---|---|---|---|
| Moves and teaching | 21 | 6 | 8 | 6 | 1 |
| Water and swimming | 3 | 0 | 2 | 1 | 0 |
| Pacing and rests | 11 | 4 | 7 | 0 | 0 |
| Variety and repetition | 32 | 6 | 26 | 0 | 0 |
| Difficulty and the dial | 16 | 5 | 11 | 0 | 0 |
| Rewards, pickups and hearts | 9 | 5 | 3 | 1 | 0 |
| Layout and geometry | 21 | 1 | 19 | 1 | 0 |
| Art, look and floating | 16 | 3 | 12 | 1 | 0 |
| Length | 7 | 1 | 4 | 2 | 0 |
| Easy vs Normal | 4 | 4 | 0 | 0 | 0 |
| Checks and bots | 3 | 1 | 2 | 0 | 0 |
| Process and cost | 18 | 2 | 11 | 2 | 3 |
| **Total** | **161** | **38** | **105** | **14** | **4** |

Counted by script over the tables above (every #1-#161 appears exactly once). Of the trace's 161 "how to settle" hints, these
pointed at a line that, opened, does not answer the item, so the row moved to C or R: #2/#8/#21/#103/#105/#115 (LEG E47's 42% is
declined by its own ledger at LEG:591), #29 (LEG E5/E21), #33 (SR §0b.2), #35 (LEG E118), #37 (LEG E52), #88 (GV:69), #129 (R1:572),
#159's D:1043, #24's R4:51, #112's R1:524.

