# SPEC-TRACE: where every number and rule in ENGINE-SPEC.md comes from

Source register for `reference/engine/ENGINE-SPEC.md` on `engine-spec`: lines 1-1635 as of 7f4373c0, and lines 1637-1734 added by
2a030ddf-2f3d6aac while this trace was being written (section 24). Line numbers are the current file's (b34e7487); lines 1-1635 did not move. Written
2026-11-05 by an audit helper for the level designer, who reviews and commits it. ENGINE-SPEC.md was not edited. Nothing was fetched
from the web.

## How to read this

**Tags (exactly one per row):**
- **MEASURED**: a run on our code produced it (commit, tool, output file).
- **SOURCED**: a research row or a document says it (file:line). Shipped code constants count as a document (file:line).
- **MATT**: Matt's own words, or a decision recorded as his, at file:line. "(relayed)" means a commit or note says "Matt" but his words are not saved.
- **DERIVED**: computed from other numbers; the inputs are cited.
- **OPEN**: no measurement or source found. It is a judgment. Every OPEN row says **how to settle** it: (i) a ledger or Gemini row that
  answers it, (ii) a run on our code (tool and what to measure), or (iii) a primary-source search (what to look for).

A row is tagged by its strongest honest source. Where a source exists but says something different, the row is tagged by what the
spec's number actually rests on, and the difference is in the note (and in list (b) when it matters).

**Short names (branch in brackets; line numbers are that file's):**

| Short | File |
|---|---|
| ES | `reference/engine/ENGINE-SPEC.md` [engine-spec] |
| D | `reference/engine/DESIGNER.md` [origin/engine-design] |
| MD | `reference/engine/MATT-DIRECTION.md` [origin/ccr-0d59a91c-oy3imz] |
| SR | `reference/STAGE-RULES.md` [origin/ccr-0d59a91c-oy3imz]; the engine-spec copy is older and has no §0c |
| RM | `reference/ROADMAP.md` [ccr] |
| ST | `reference/STATUS.md` [ccr] |
| LD | `reference/roles/LEVEL-DESIGNER.md` [ccr] |
| BR | `reference/engine/story-briefs/1-1.md` [ccr] |
| MW1 | `reference/qa-reports/validator/mechanics-world1.md` [ccr] |
| R1-R4 | `reference/research/engine-2026-11-05/R1-shipped-pipelines.md`, `R2-academic-pcg.md`, `R3-fun-by-math.md`, `R4-mobile-and-architecture.md` [ccr] (identical to the scratchpad copies) |
| GP | `reference/GEMINI-PCG-RESEARCH.md` [engine-spec] |
| GL | `reference/GEMINI-LEDGER.md` [engine-spec], rows A1-J5 |
| GVs / GV | `reference/research/GEMINI-VARIETY-2026-11-02.md` / `-full.txt` [engine-spec] |
| LEG | `reference/research/ledger/LEDGER-ENGINE-GEMINI.md` [engine-design], rows E1-E249 (§8), ideas §2.1-2.20 |
| GE | `reference/research/engine-2026-11-04/GEMINI-ENGINE-ARCHITECTURE.txt` [engine-design] |
| LEP | `reference/research/ledger/LEDGER-ENGINE-PAPERS.md` [engine-design], rows 1-83 (§6) |
| CA / TA | `reference/research/engine-2026-11-04/CARMO-thesis-2024.txt` / `TANAGRA-paper.txt` [engine-design] |
| GC / LCA | `reference/research/engine-2026-11-04/GEMINI-CRITICAL-AGENTS.txt` / `reference/research/ledger/LEDGER-CRITICAL-AGENTS.md` [engine-design] |
| cp1/ cp2/ cp3/ | `reference/engine/cp1/`, `cp2/`, `cp3/` [engine-spec] |
| ML | `tools/engine/moveladder.json` [origin/engine-mixer 7d9ad9a9] |
| w1mix | `src/game/mixer/w1mix.ts` [origin/engine-mixer 7d9ad9a9] |

Commit hashes are on `origin/engine-mixer` (planner) or `origin/engine-spec` unless named. Line numbers are pinned to: ccr = a42689e6 (MD, ST only appended since cbbc0230),
engine-design = db3342a1, engine-mixer = 7d9ad9a9 (the branch has moved since; w1mix.ts lines differ on its HEAD), main = 68b31e66,
engine-plan and w1-rhythm at their current heads. Every file:line in sections 1-24 and lists (a)-(b) was checked by
`/tmp/claude-0/-home-user-Sloths-Adventure-/ae911ee5-4c11-5de9-a62f-5a201b1932ff/scratchpad/tools/citecheck.py` (see "Citation check" at the end).

---

## 1. Header and Matt's GO (ES 1-17)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 9-10 | Nothing from 11-04 ships; "see if we can fix what we have" | MATT | ST:964 | | |
| 10 | Engine mixes today's KEPT pieces | MATT | MD:20-23 | | |
| 10-11 | References: old 1-1 (main) and today's 1-3 | MATT | MD:5-6, MD:99-104 | | |
| 11 | Ceiling 8% of Matt's week | SOURCED | ST:962, ST:964 | The lead's proposal ("Matt hasn't set another"), not Matt's words; the spec puts it under "Matt's GO" | |
| 15-16 | Both sign before any build | SOURCED | ST:963 | Matt decided the pairing | |

## 2. Checkpoints and the variety gate (ES 20-41)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 20 | A checkpoint every 2 hours of work | SOURCED | LD:43 | "How Matt sees it working" | |
| 20 | A miss stops the work until Matt has seen why | SOURCED | LD:46 | | |
| 22-28 | Number vs pass line, something to see, cost in % of week, 3-line report | SOURCED | LD:43-44 | | |
| 30-31 | Gate thresholds from CP1, fixed before generating | MATT | MD:106-109, MD:114-115 | "thresholds come from the old 1-1's own numbers" | |
| 32 | mix: kinds >= old 1-1 (5) | MEASURED | cp1/table2.txt:2 (kinds=5); cp3/lines.py:13 | Matt's "huge set" (MD:7) is far above 5; see (b) C24 | |
| 33 | share: commonest <= old 1-1 (0.468) | MEASURED | cp1/table2.txt:2; cp3/lines.py:13 | | |
| 34 | run: longest same piece <= old 1-1 (9) | MEASURED | cp1/table2.txt:2; cp3/lines.py:10 | | |
| 35 | new: something new as often as old 1-1 (572 px mean) | MEASURED | cp1/table2.txt:2 (newMeanPx 572); cp3/lines.py:11 | | |
| 36 | splits: >= old 1-1's high/low splits | MATT | MD:8, MD:107-109 | Floor later set to 19 (1-3), ES 411 | |
| 37 | A road continues across gaps up to a Normal flat jump (180 px) | MEASURED | D:119, D:125 (designer-measure.ts.txt: level jump 157-185 px); ES 1152 | 180 is the clean end rounded | |
| 37 | Two roads >= 120 px apart count as a split | OPEN | cp3/split180.py:9 (the tool's constant) | No source for 120; split180 also needs a run > 300 px (:11), which the spec never states | (ii) split180.py on old 1-1 at 80/120/160/200 px and Matt's pick of which count matches what he sees as "two roads" |
| 38 | Old 1-1's canopy over floor counts | MEASURED | cp3/cp3-splits.txt:1 (median 34) | | |
| 38-39 | Both roads walkable end to end (CP3 prover) | SOURCED | LEP row 53 (CA:1153-1172, a checker that tests only one path); LEG E145 | | |
| 40 | climb: >= old 1-1's climb and drop (415 px) | MEASURED | cp1/table2.txt:2 (yRange 415); cp3/lines.py:14 | | |
| 41 | neighbours share <= half their main pieces | OPEN | none | Gemini gives 42% cross-stage Jaccard (LEG E47, E127, E241); SR §0c.4 (ccr:83-84) caps a template at 3 stages a world | (i) LEG E47/E127 (Jaccard <= 42%) or SR §0c.4; (ii) measure the ideas shared by old W1 neighbours with cp2/tag_ideas.py |

## 3. CP1, the baseline (ES 43-59)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 44-51 | Measures: kinds, sizes, spread, climb, splits, runs, share, new-thing stretches | MATT | MD:106-109 (check 1) | | |
| 44 | 16 layouts each | SOURCED | D:615 (gen2 curates 16 rolls); R2:69 | R3 F6 (R3:114-123) wants 200 rolls for expressive range; 16 cannot show roll-to-roll spread | |
| 53 | Piece list (log, bridge, bough, snap twig, vine, stump, rotten branch, lily pad, climb, split road, ground) | MATT | MD:20-22 | "lily pad" added from MD:15-16 | |
| 54 | Read the built platform list, not the builder's labels | SOURCED | D:87 (failure 7: the checker's own vocabulary), P1 ES 1127-1130 | | |
| 55-57 | Old 1-1 and 1-3 are the bar; each of today's five marked above/below | MATT | MD:99-104 | | |
| 56-57 | 1-5's "all cracking logs" must show as share and run far over | MATT | MD:15 | Result: share 0.398, run 8 (cp1/table2.txt), not "far over" 0.468/9 on piece kind; CP1 v1 MISS recorded (64e48ba0), v2 used new-thing and flat measures (a9e5585c) | |
| 58 | Matt sees one table plus a side map strip | MATT | MD:112-113 (check 3) | | |
| 59 | Cost 0.5-0.8% of the week | OPEN | none | Estimate | (ii) the meter (ST:965 read CP1+CP2 as 0-1%) |

## 4. CP2, the piece library sheet (ES 61-229)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 62 | Every kept piece, plus old 1-1's dropped pieces | MATT | MD:20-23, MD:15-16 | | |
| 63-67 | Sizes, placements, entry/exit contract, moves, proven range Normal and Easy | SOURCED | D:501-509 (Option A room fields); LEP row 28 (CA:673-683 edge labels) | | |
| 68-73 | Kit per world, node ideas that make sense | MATT | MD:89-96 | Replaced by the shared library (ES 122-134); see (b) C7 | |
| 74-86 | The 9 draft World 1 node ideas | MATT | ST:965 ("Library looks right", CP2 approved) | Matt approved the sheet; each idea's content is the designer's | |
| 79 | Lily pads: no old World 1 stage on main has them | MEASURED | a3473541; ES 1142-1145 (cp1/, 16 layouts) | | |
| 88-89 | Every section kind of old 1-1 and 1-3 appears as an idea | MEASURED | cp2/idea-tags.out (old 1-1: 6 ideas) | | |
| 91 | Every idea named in one line a player would say | MATT | MD:95-96 | | |
| 92 | Library >= old 1-1's kinds and distinct sizes | MEASURED | cp1/table2.txt:2 (kinds 5, kindSizes 9) | | |
| 93 | Every piece and size traces clean on both settings | SOURCED | D:505-509 (prove each unit alone); R2:48 (by construction) | | |
| 95-96 | Matt sees the sheet before any stage is built | MATT | MD:110-111 (check 2) | | |
| 97 | Cost 0.8-1.2% | OPEN | none | Estimate | (ii) meter reading |
| 104 | Lily-pad hop: small, big, sinking pads | OPEN | none | ES 575 says lily pads don't sink | (ii) protoStage lilyPads (main :2294-2305) has no sink; settle with the engine-render water zone |
| 105 | Bounce up: mushroom into the canopy | MEASURED | cp2/idea-tags.out (old 1-1 "bounce up" 3%) | | |
| 106 | Rope crossing: the shimmy rope exists | SOURCED | cp2/sheet.html (shimmy rope, 5 placed, 1-3/1-4) | | |
| 107 | Animal on the path: jump, wait or kick-roll the boa | SOURCED | R3:168-181 (F10 shell kick) | | |
| 109 | Lily pads met by Matt on the test link; control test (protoStage :2294, drawn ~2 runs in 3) | MATT | MD:71-72 | "2 runs in 3" not re-checked | |
| 109 | Pads 84-104 px, gaps 0.42-0.55 of a jump; falling in puts him back on the bank | SOURCED | protoStage.ts:2293-2305 [main] | | |
| 109 | Turtle line joins World 1 | SOURCED | R3:168-171 (F10: kicking shells 0.345, strongest fun correlate) | Turtles live only in 2-5 and 2-9 (ML row animal:turtle) | |
| 113-116 | Move ladder: <= 1 new move a stage; >= 2 earlier ones reused harder; none taught in the last 3 stages absent > 2 stages | OPEN | none | Matt's "keeps building" (relayed to the planner; not saved) and SR §0.1 (ccr:19-20) give the intent, not the numbers | (i) SR §0b.2 four parts and R1 L5 (R1:68) for the teach; GV:105 ("return later without retraining"); (iii) search Hayashida's GDC 2012 talk and Shovel Knight's "on cooldown" list (R1:527) for re-use spacing |
| 118-119 | Each reuse at a higher job (teach, test, twist, master) or risk | SOURCED | GL A1 (Kishotenketsu); D:422 (Hayashida's four steps) | | |
| 122-125 | One shared library; World 5 the exception | MATT | MD:66-70 | Later Matt words (MD:127-130) narrow it; see (b) C7 | |
| 126-127 | Library = every piece and idea in any world, tagged by worlds | MATT | MD:66-70 | | |
| 128-129 | A world's own new ideas lead; others fill in | OPEN | none | | (i) SR §0c.7 (ccr:93-99): a world owns its pieces; R4:577 (themed pools per stage) |
| 130-132 | Coherence per idea and per join, one art family per join | MATT | MD:76-79 ("they should all fit together") | | |
| 133-134 | Variety gate counts the whole library; neighbours <= half their ideas | OPEN | none | Same "half" as ES 41 | (i) LEG E47/E127 (42%) |
| 138-140 | An animal, once taught, may appear anywhere later | MATT | MD:58-60 | | |
| 139-140 | An animal counts as a move on the ladder (harder form, absent <= 2 stages) | OPEN | none | Matt said "anywhere", not "must return within 2" | (i) as ES 113-116 (SR §0.1, R1 L5, GV:105); (iii) Hayashida GDC 2012 on enemy re-use |
| 141-142 | Unused art feeds the library | MATT | MD:61-64 | | |
| 147 | 273 unused pieces | MEASURED | b461499b (tools/art/artuse.mjs, IN-GAME-UNUSED.md) | | |
| 148-149 | Dressing stays dressing; boss frames stay with bosses | OPEN | none | | (i) SR §4 "Use ALL the art" (ccr:218); Matt to rule per item |
| 154-172 | 17 unused-art ideas and their "exists?" column | MEASURED | cp2/mechanics-exist.md:10-30 (7 yes, 9 adapt, 1 new) | The table is the designer's; the verdicts are the planner's code check | |
| 174-175 | Unused animal frames give a second behaviour, the "harder form" | OPEN | none | | (iii) search for shipped games that give each enemy a second behaviour later (e.g. Rayman Origins enemy variants, DKC Returns) |
| 180 | Easy: no rise over +40 px onto a landing under 220 px | MEASURED | cp2/cp2-trace-easy.out (flicks 246-281 ms at +50..+70); cp2/cp2-trace-easyfix.out (+40: 298-386 ms) | The 220 px threshold itself is not traced: settle with cp2-trace.ts at +50/+70 onto 160/220/280 px landings | |
| 181 | A landing after +40 is >= 110 px | OPEN | none | Not in the trace outputs | (ii) cp2-trace.ts: Easy +40 onto 90/110/130 px landings |
| 182 | +50 to +70 only onto >= 220 px | OPEN | none | Not traced | (ii) as ES 180 |
| 183-184 | Rise >= +30 has a gap <= 80 px (90 px gives a 298 ms flick) | MEASURED | cp2/cp2-trace-easyfix.out (+35/90 px: 298 ms), cp2/cp2-trace-yes4.out (bridge +30/90: 298 ms); d5c44600, ccfa8f06 | | |
| 184 | Easy floor 300 ms | SOURCED | GL F5 (W_min >= 300 ms Easy); SR §1b (ccr:140) | | |
| 184 | Easy bough stair 250 px in 7 steps | MEASURED | cp2/cp2-trace-easyfix.out (7 steps: 40+40+35+35+35+35+30 = 250) | | |
| 186 | Bough stair flicks 246-281 ms against 300 | MEASURED | cp2/cp2-trace-easy.out lines 3-6 | | |
| 191 | Logs 9,095 of about 19,000 placed pieces | MEASURED | cp2/library.txt:2 (sum of rows 19,651) | | |
| 192 | Moving platforms appear 17 times | MEASURED | cp2/library.txt:14 | | |
| 193 | Drifting logs and lily pads only in World 2 | MEASURED | cp2/library.txt:10, :12 | | |
| 194 | 24 of 90 stages have no animal | MEASURED | cp2/enemies.txt:13 | | |
| 196-197 | Spread first: moving/drifting platforms, lilies, mushrooms, taught animals | DERIVED | cp2/library.txt; cp2/enemies.txt | | |
| 201-206 | 7 on the sheet, 9 small builds, 1 parked | MEASURED | cp2/mechanics-exist.md:30 (7 yes, 9 adapt, 1 new) | Same 7 as the planner's "yes" rows | |
| 204-205 | Matt picks which small builds to make | OPEN | none | MD:17 gives the designer "full say" on use; no saved Matt rule on who picks builds | (iii) not a research question: one multiple-choice question to Matt; (i) LD:18 (Matt sets the day's work) |
| 208-209 | CP3's 1-5 draws only proven ideas; World 1's 14 ideas | OPEN | none | Count of 14 not listed anywhere (9 + 4 + turtle) | (ii) list the ideas in library.ts (98b08168) |
| 213 | Boa passes Easy, misses Normal: 2-3 hits at one boa, 2-3 lives a run | MEASURED | cp2/cp2-animals-groups.out:2-3; cp2/cp2-animals.out:1-2 (lives 3, 2) | | |
| 214 | Turtle line: up to 5-6 hits at one line for the kid on Easy | MEASURED | cp2/cp2-animals-groups.out:8, :12 (5, 6) | | |
| 218 | Every animal idea: expose, then a safe validate, then the line | SOURCED | R1:68-73 (L5, Ubisoft rational design) | | |
| 219 | Boa on Normal: a rear-up tell, a flat run-up of >= one screen's width | OPEN | none | Gemini: boa gatekeeper >= 3.5 W from entry (LEG E108, GE:184); 1.0 s runway before an enemy trigger (LEG E117) | (i) LEG E108 / E117 |
| 220 | Turtles: <= 2 in a line on Easy, 3 on Normal | OPEN | none | | (ii) cp2-animals.ts: kid Easy hits per line at 1/2/3 turtles; (i) R2 Dahlskog "two 2-hordes afford different solutions than one 4-horde" (D:430) |
| 221 | Pass: past each animal with <= 1 heart lost | OPEN | none | | (ii) cp2-animals.ts re-run; (i) R3 F2 (R3:51-65): first test ~0.85 success |
| 225-226 | Four YES ideas pass Normal and Easy | MEASURED | cp2/cp2-trace-yes4.out; cp2/cp2-push.out; ccfa8f06 | | |
| 227 | Crumbling tile crumbleAfter 0.7 s is the commonest shipped | SOURCED | cp2/cp2-trace.ts.txt:15 | | |
| 227 | A first-timer pausing has about 0.3 s spare at 0.7 s | OPEN | none | No output file shows this number | (ii) cp2-trace.ts with the first-timer's pause (FT_PAUSE) on a 0.7 s tile |
| 228 | Easy crumbling tile waits 1.0 s | OPEN | none | Gemini: creak delay 36 frames (1.2 s) Easy, 20 (0.67 s) Normal (LEG E151, GE:278-282); conflicts with the dial (ES 646), see (b) C3 | (i) LEG E151 (1.2 s Easy) |
| 228-229 | Every crumbling ledge after its teach (a single tile over safe ground) | SOURCED | SR §1 Teaching (ccr:109); GL F7 | | |

## 5. CP3 mix rule (ES 231-268)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 233-234 | Story beat and theme first; they pick job and look | MATT | MD:89-92 | | |
| 235-236 | A stage is a sequence of node ideas; neighbours share <= half | OPEN | none ("half") | | (i) LEG E47 |
| 237-240 | "No idea twice" withdrawn: old 1-1 is a cycle of three ideas, about 8 times, the fork 41% | MEASURED | cp2/idea-tags.out:1-8 (fork 41%, 6 ideas) | Conflicts with SR §0c.2 "no template more than twice in a stage"; see (b) C6 | |
| 241 | No idea twice in a row | SOURCED | SR §0c.2 (ccr:79-80) | | |
| 242 | No idea over the old 1-1's top share (about 40%) | MEASURED (old 1-1); CONTRADICTED by R1:39-47 (L2) | cp2/idea-tags.out (41%) | | | **[critic §7, ruled 11-05: R1 says no unit repeats in a level; settle by run (ENGINE-SPEC critic ruling 8)]**
| 243 | Every repeat is a new kind x size ("new in the last 6") | SOURCED | SR §0c.3 (ccr:81-82) | "last 6" is the planner's window (8c8cd997), not sourced | |
| 244 | A stage has >= 4 ideas | OPEN | none | Old 1-1 has 6 ideas (cp2/idea-tags.out) | (ii) count ideas in old 1-1 and 1-3 rolls; (i) Shovel Knight 5 new enemies + 5 new objects a level (R1:527) |
| 246-247 | Today's 1-1, 1-2, 1-4, 1-5 fail: one idea 54-76% | MEASURED | cp2/idea-tags.out (76, 54, 58; 1-5 alternation) | | |
| 247-248 | A stage that teaches opens with the idea that teaches it | SOURCED | GP:315 (slot-1 override) | | |
| 249-250 | Inside an idea, its own pieces in order, sizes via a shuffle bag | SOURCED | GL C1; GP:59 | | |
| 251 | Exit = next entry (high, mid, low, two roads) | SOURCED | GL C9; LEP row 28 (CA:673-683, LOW/MID/TOP) | | |
| 253-257 | Share cap, run cap, new-within-N, splits, from CP1 | MEASURED | cp1/table2.txt:2 | | |
| 257 | 1-2's branching kept as a piece | MATT | MD:99-100 | | |
| 259 | A node that can't meet them fails with the missing piece named, never a reroll | MATT | CLAUDE.md "Variety comes from more pieces" (Matt 2026-10-30); SR §0c.4 (ccr:85) | Also R1:508 idea 1 | |
| 261 | 16 of 16 rolls, Normal and Easy | SOURCED | D:615; ES 44 | | |
| 262 | Fun gate: no new flags | SOURCED | D:1043 (step 3 "funcheck with no new flags") | | |
| 263-264 | Coherence judged by Matt on the map; every node labelled | MATT | MD:95-96, MD:112-113 | | |
| 267 | A stage takes <= 1 hour after the mixer exists | MATT | RM:473 (R-163 "Stages built from a spec in about an hour"; Matt 2026-11-04 "cannot spend full days on just a level or two") | Paraphrase in the roadmap row | |
| 268 | Cost 1.5-2% | OPEN | none | Actual: CP3 2-3% (cp3/CP3-CHECKPOINT.md:89), round 2 2-3% (cp3/CP3-ROUND2.md:82), ST:966 "5-6%" | (ii) meter |

## 6. Placement rules (ES 270-320)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 272-274 | Pieces fit together; hearts, checkpoints, collectibles, no clutter | MATT | MD:76-81 | | |
| 276 | A rule a machine can check is checked; else Matt on the map | SOURCED | LCA:28-30 (GC:119); D:872 | | |
| 278-279 | Every idea's ends use the world's small set of joins | SOURCED | LEP row 28; GL C9 | | |
| 279 | A join is a short kit piece sized to the next move, never a bare gap | SOURCED | LEP row 36 (CA:819-835: cap universal connectors) | | |
| 280-281 | One art family per kit; a piece out of place in any other idea is not in the kit | MATT | MD:82, MD:128-129 | | |
| 282-283 | Check every pair in the kit, over 16 rolls | OPEN | none | | (i) LEG E21/E116 pairwise adjacency; R4:51 (Barrett: any piece fits any neighbour) |
| 285 | No heart in the first node or first 30 s | MATT | MD:77 ("hearts aren't given out the very first thing") | 30 s withdrawn at ES 292-295 | |
| 286-287 | A heart only after a node where a miss costs a heart or life | MATT | MD:77-79, MD:83 | | |
| 288 | <= 1 heart per risky node; fewer hearts than risky nodes | OPEN | none | | (ii) count hearts vs risky nodes on old 1-1 (cp1 risk.py, f51d926e); (i) LEG E132-E135 miss tiers |
| 292-293 | Old 1-1 has a heart in its first 30 s (median 1 of 2) | MEASURED | cp1/table2.txt:2 (hearts 2, heartsFirst30s 1) | | |
| 297-298 | A checkpoint just before a test/twist/master node or set piece; never before a rest or teach | SOURCED | SR §0b.2 (ccr:48: checkpoints on the rests before parts 3 and 4); GV:165 | SR puts them ON the rests; the spec says never before a rest | |
| 299 | No two checkpoints with only easy nodes between | MATT | MD:79-80 ("not everywhere if you're not going to use them") | | |
| 300 | Replay after a loss <= about 45 s (estimate) | OPEN | none | SR §0b.8 (ccr:64-65) and GV:165 say respawn within about 2 s of the hard part; see (b) C10 | (i) SR §0b.8 / GV:165 |
| 305-306 | Petals are breadcrumbs on the idea's own surfaces and arcs | SOURCED | GL H4; D:81 (LP §IV.E, place during geometry); LEG E122 | | |
| 306-307 | Hard collectibles only in test/twist/master nodes or a fork's high road | MATT | MD:80 ("hard ones in hard places") | Also GV:69, GV:173 (Ledger pages at the apex of Ten/Ketsu) | |
| 308 | None floats where no move reaches | MATT | MD:80 ("where they make sense") | | |
| 311-312 | Hard collectible reachable only by the idea's own move (limited-agent bot) | SOURCED | R2:663-670 (idea 3, limited agent) | | |
| 313 | Phone views 400 x 880 upright, 1100 x 540 sideways | OPEN | none | Not found in PERFORMANCE-RULES, PLAY-STORE-RULES or clipcheck in this pass | (ii) read tools/perf/clipcheck.mjs viewport list |
| 314 | <= about 8 pickups a view (estimate) | OPEN | none | Old 1-1 measured: pickSideMax 6 (cp1/table2.txt:2) | (ii) already measured: old 1-1 max 6 sideways, 4 upright (cp1/table2.txt:2) |
| 315 | <= 2 kinds of hazard or animal a view | OPEN | none | | (i) LEG E21 (Polymorph pairwise adjacency), E5; (ii) sliding view on old 1-1 |
| 316 | <= 3 kinds of standing piece a view | OPEN | none | | (ii) sliding view on old 1-1 (cp1 measures2 has per-stage kinds only) |
| 317 | Clear space above every landing for his arc | SOURCED | D:121-123 (jump rise about 100 px); GL G4 | | |
| 319-320 | Limits set from old 1-1; it must pass its own | MATT | MD:114-115 | | |

## 7. CP3: the 1-5 node plan and its rulings (ES 323-528)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 325-329 | 1-5's beat: creaky taught, petal groups, seed "too far, for now", Meeca passed | SOURCED | src/game/dotLinesData.ts:123, :125, :147 [main] | | |
| 331 | Keep today's 1-5 frame: canopy to floor at dusk, carvings goal | MATT | MD:89 ("levels are built to go along with the story") | | |
| 331 | Up and down node by node, overall trend down | OPEN | none | | (ii) arc check on 1-5 rolls (spec field `arc`, ES 1214) |
| 333 | Sizes: shipped p10-p90 widths per kind | MEASURED | cp2/sheet.html (short/typical/long per kind) | The spec cites cp2/library.txt, which has no widths | |
| 333 | Easy rules: rise cap +40, gap <= 80 px from +30, crumble 1.0 s | MEASURED | cp2/cp2-trace-easyfix.out (rise, gap); crumble 1.0 s is OPEN (ES 228) | | |
| 333-334 | Target about 150 s skilled | SOURCED | D:210 (target 150 s); LEG E77 (120-150 s) | Accepted later at 4:00-4:12 (ES 909) | |
| 336-337 | A node rolls one idea from its deck through a shuffle bag | SOURCED | D:523-526 (Option A roll: deck, shuffle bag, cooldown); GL C1 | | |
| 341 | n1 warm-up: bough stair level form, bank hops | OPEN | none | | (ii) fun-gate pacing on n1; (i) SR §0b.2 part 1 (5-10 s groups, low density) |
| 342 | n2 teach creaky: one twig over a bough below, then two, catch bough, no pit | SOURCED | R1:68-73 (expose, then safe validate); GP:316-318 (zero lethal failure) | Creaky is taught in 1-2, not 1-5 (ES 1429-1433); see (b) C9 | |
| 342 | Dot's "Creaky branches!" at n2; no heart | SOURCED | dotLinesData.ts:123 [main]; MD:77 | | |
| 343 | n3 a local rise (bounce up, the climb) | OPEN | none | | (i) SR §0b.2; (ii) CP3 maps |
| 344 | n4 fork: high road crumbling/creaky, low road creek | MATT | MD:8 ("one going higher, one going lower") | | |
| 344 | A petal group on each road asking for its own move | SOURCED | GV:173 (tiered collectibles); R2:663 (limited agent) | | |
| 345 | n5 rest with Dot's wayside line, a checkpoint since n6 is a test | SOURCED | dotLinesData.ts:147 [main]; SR §0b.2 (ccr:48) | | |
| 346 | n6 test creaky over a real gap; heart only after it if it has life risk | SOURCED | R1:68-73 (challenge step); MD:77-79 | | |
| 347 | n7 twist: rotten-branch drop | SOURCED | GL A1 (Ten) | | |
| 348 | n8 creek deck, "not the one n4 rolled" | OPEN | none | | (i) GL C4 cooldown; GP:256 |
| 349 | n9 puzzle beat; seed shown out of reach | SOURCED | dotLinesData.ts:125 [main] | | |
| 350 | n10 master: second fork; checkpoint before; harder half of petals high | SOURCED | GL A1 (Ketsu); GV:69 (Portal with the tiered collectible) | | |
| 351 | n11 cool down | SOURCED | GP:93 (exit reward, tension 0); D:452 (ramp and cool) | | |
| 354-355 | 1-5 is a relic hunt: "Follow her marks to the shrine" | SOURCED | src/game/stagePlan.ts:39 [ccr] | | |
| 356-359 | One mark per non-fork node (9), one per fork road (4) | OPEN | none | | (i) LEG E118-E124 (petal and seed placement rules); (ii) first-timer bot marks per route |
| 360 | 11 on any path, 13 in all | DERIVED | ES 356-359 (9 + 2 x 1 per fork path = 11; 9 + 4 = 13) | | |
| 360 | Goal 85% Normal (11 of 13), 65% Easy (9 of 13) | OPEN | none | Revised at ES 462 (10 and 8) | (i) LEG E118 (75% goal), E120 (single-pass yield 0.85); SR §1 Normal goals 87.5% of reachable petals (ccr:115) |
| 366 | n9 push-block wall about 190 px (100 px log + 90 px single rise) | MEASURED | cp2/cp2-push.out (single jump never on top of the shipped wall) | 190 is the designer's arithmetic | |
| 366-367 | Doubles allowed on 1-5 only through EARLY_DOUBLE | SOURCED | src/game/levelCheck.ts:118-120 [engine-mixer 7d9ad9a9] (EARLY_DOUBLE = 1-1, 1-4; doubles from stage 6) | | |
| 369 | Gaps sized by the level check's own functions (jumpOK, heldMaxGap) | SOURCED | R4:551 (idea 2, one reach predicate); ES 1137 P4 | | |
| 371-374 | n9 seed as a code-drawn glint; visible both ways; real seed with the glide | MATT | CLAUDE.md Polish rule ("a sparkle ... fine") | | |
| 375-377 | Push block out of n9 (the level check never moves a pushed log) | MEASURED | f735c4fc / 39f8ef63 (planner's build finding) | | |
| 378 | Fork roads keep their own height band | OPEN | none | | (i) LEG E52 split closure |
| 383 | 11 one-idea nodes give 88-101 s against 120 s | MEASURED | bce0572a / 78da6ddb (fast 125-154 s after bursts); 88-101 s in the designer's ruling only | No output file for 88-101 s | |
| 385-388 | 22 same piece in a row vs 9; new every 1,002 px vs 572; 4,103 px flat vs 1,351; about a third of the ups and downs | MEASURED | old 1-1 side: cp1/table2.txt:2; stretched-1-5 side: no file kept | Only the old 1-1 numbers have a saved output | |
| 390-391 | (a) A node lays 2-3 bursts of 4-6 pieces | OPEN | none | | (i) SR §0b.1 (5-20 s rhythm groups); R3 F12 (Launchpad group lengths 5/10/15/20 s); (ii) old 1-1 idea stretch lengths (cp2/idea-tags.json) |
| 391-392 | Bursts alternate ideas; never the same burst twice in a stage | SOURCED | SR §0c.2 (ccr:80); R1:39 (L2 no unit repeats in a level) | | |
| 391-392 | Teach pairs with bank hops; rest is one short walk | OPEN | none | | (ii) fun-gate dead time on n2 |
| 393 | (c) Kind or size band changes at least every 2 pieces | OPEN | none | Old 1-1 runKS median 7 (cp1/table2.txt:2) is far looser | (ii) old 1-1 kind x size run lengths (cp1 measures2.json) |
| 394 | >= 4 of 5 landings step up or down (old 1-1: 171 of 202) | MEASURED | cp1/table2.txt:2 (up 91 + down 80 of 202 = 0.847) | The gate uses 0.949 (cp3/lines.py:12, cp3/CP3-CHECKPOINT.md:21); see (b) C13 | |
| 396-399 | Pass lines: run <= 9, kind x size <= 7, new <= 572 px, never > 1,516 px, flat <= 1,351, ups+downs >= old 1-1 | MEASURED | cp1/table2.txt:2; cp3/lines.py:10-14 | | |
| 400 | Fast clock >= 120 s | MATT | CLAUDE.md "stages take at least 2 minutes"; MD:45-47 | | |
| 401 | Easy adds flags and hearts after the mixer (16 and 16) | MEASURED | cp1/table2.txt:8 (rebuilt 1-1 Easy: hearts=24), :24 (rebuilt 1-5 Easy: hearts=33); 16/16 not in a saved file | | |
| 406 | Splits: old 1-1 34 (14-51), today's 1-3 19 | MEASURED | cp3/cp3-splits.txt:1, :3 | | |
| 406-407 | New 1-5 with two long forks: 2-3 | MEASURED | cp1/table2.txt:22 (new 1-5 normal: splits=0); 2-3 not in a saved file | | |
| 408-410 | Canopy over floor as a burst any node may lay, 2-5 pieces, never twice in a row | OPEN | none | | (ii) idea-tags.json stretch lengths of old 1-1's fork |
| 411 | Pass >= 19 splits on 16/16; 34 the target | MEASURED | cp3/cp3-splits.txt:1, :3 | | |
| 414 | Old 1-1 Easy has 15 hearts and 15 flags | MEASURED | cp1/table2.txt:4 (hearts=15, checkpoints=15) | | |
| 416 | "hearts aren't given out the very first thing" holds on both settings | MATT | MD:77 | Deferred to after CP4; see (b) C19 | |
| 421-423 | Canopy over another idea's floor; share counts the floor; 40% cap stays | MEASURED | cp3/CP3-CHECKPOINT.md:26, :61-69 (canopy 59-65% under the old rule) | | |
| 424-425 | Two roads side by side >= 40% (old 1-1 61%) | OPEN (the 40%); MEASURED (the 61%) | cp3/cp3-lines.txt:21 (old 1-1 median 0.61) | 40% itself is the designer's line, below the measured 61% | | **[critic §7, ruled 11-05: the line is the designer's, below the bar it copies]**
| 425 | Planned 30-40% for the forks withdrawn | MEASURED | cp3/cp3-forks.txt:1 (forks 10.6-13.4%) | Re-stated at ES 516; see (b) C11 | |
| 426 | LV-9: at most 4,000 px between flags | SOURCED | src/game/easyMode.ts:256, :263 [engine-mixer 7d9ad9a9] (FLAG_SPAN_MAX 4000, capFlagSpans) | | |
| 427-429 | Flag at the nearest safe spot before the next hard node; never over easy ground only; never on a rest without a hard node after | MATT | MD:79-80, MD:84 | | |
| 432-433 | Mushroom off the floor's lane; adult bot loops 7-11 must go to 0 | MEASURED | cp3/CP3-CHECKPOINT.md:40 (stuck 7-11 times a run) | | |
| 435-436 | Normal: a slip off the high road may cost a heart; E[lives] 0.7 at d = 0.09 | DERIVED | ES 644 dial (0.5 + 2.5 x 0.0909 = 0.73) | | |
| 437 | Easy: roads within 400 px (under LONG_FALL), a slip costs nothing | SOURCED | src/game/engine.ts:232 [engine-mixer 7d9ad9a9] (LONG_FALL = 400) | "Costs nothing" conflicts with D:194-195 and LEG E132; see (b) C5 | |
| 438 | Never a life (P3) | SOURCED | RM:474 (R-164.1, Matt's clip) | | |
| 439 | n8 deck draws one the previous two nodes did not lay | OPEN | none | | (i) GL C4 / GP:256 (2-level cooldown) |
| 441 | The miss stops the work until Matt has seen why | SOURCED | LD:46 | | |
| 449-450 | A. Restore n5, the rest | SOURCED | SR §0b.1 (ccr:43-44) | | |
| 451-452 | B. Restore n6, creaky taught then tested | SOURCED | R1:68-73 | | |
| 453 | C. Each node draws only from its own deck | OPEN | none | | (ii) assert in w1mix (9da17a27 did) |
| 454-456 | D. Mushrooms capped at the old 1-1's count (about 14); no two canopies entered the same way | MEASURED | 9da17a27 ("mushrooms capped at the old 1-1's 14"); strip map 56 | | |
| 457-458 | E. Creaky >= 15% of landings and in the top 3 kinds | OPEN | none | | (i) D:422 (Hayashida: one core concept "carried through absolutely all the way"); (ii) creaky share on today's 1-5 (cp1: 1-5 share 0.398 creaking limb) |
| 462-463 | Marks goal Normal 10 of 13, Easy 8 of 13 | OPEN | none | 10/11 = one miss of slack | (i) LEG E120 (yield 0.85); (ii) first-timer bot marks (cp3/cp3-ft.out: 13 of 13) |
| 464 | Warm-up as one burst | MEASURED | cp3/CP3-REBUILD.md:46-47 (two bursts ran 4,300-4,850 px past LV-9) | | |
| 465-466 | Bridge only as the bough stair's top piece | OPEN | none | | (ii) "something new" line with and without the bridge (cp3/CP3-REBUILD.md:48-49) |
| 467 | Mushroom perch fine for grey-box; painted stump before it ships | MATT | CLAUDE.md Polish rule (painted art for major looks) | | |
| 468 | Easy dial width 220 px at d = 0 down to 150 at d = 1 | OPEN | none | Conflicts with the dial table (260 -> 150, ES 642) and ruling A (about 300 px, ES 796); see (b) C4 | (i) LEG E105 / GE:173 (pads 3.5 to 7.0 sloth widths, 154-308 px) |
| 470 | Length 3:14-3:29 accepted | MEASURED | cp3/CP3-REBUILD.md:21 | | |
| 470 | Floor 2:00, no cap | MATT | MD:45-47 | | |
| 471 | 1-4 and 1-6 sit >= 20% either side of 1-5's median | OPEN | none | | (ii) quick clock of old W1-W4 neighbours (stageTime.ts MODEL_FAST); (iii) stage clear-time spreads in a shipped world |
| 476-477 | Splits fell to 11-17, two-road 33-38% (map v2) | MEASURED | 9da17a27 ("Splits now 11-17") | 33-38% not in a saved file | |
| 477-483 | A floor idea joins each one-idea or climbing deck (n3, n6, n7, n9; n8 reeds pair a floor) | OPEN | none | | (ii) already re-measured: 8c8cd997 (splits 25-26, two-road 46-50%) |
| 486-487 | All lines stay: splits >= 19, two-road >= 40%, creaky >= 15% top 3, old 1-1's variety lines | MEASURED | as ES 396-411, 424 | | |
| 492-494 | Cleared: repeats 5 -> 0, Normal too sparse (0.74 a second), Easy tension flat | MEASURED | 9da17a27 fun-gate run (designer's ruling text) | No saved fun-gate output | |
| 496-498 | Easy too busy 0.76 vs 0.35-0.55; Easy longest run 92 s vs 6-8 s; 3.2 s dead on n2's 900 px bank | MEASURED | fun gate on 9da17a27 (designer's text) | No saved output; the "6-8 s" is GP:292 (Easy group length) | |
| 500-502 | A second rest node n7b after the drop; Shovel Knight ramp-and-cool | SOURCED | R1:60-67 (L4); D:452 | | |
| 503 | Easy: a 2-3 s breather pad between every node | SOURCED | GP:293 (Easy rest 2.0-2.5 s); SR §2 Pacing (ccr:173) | | |
| 504-505 | Easy bursts one piece shorter (3-5) | SOURCED | R3:272-284 (W2: Easy asks fewer moves, not wider gaps); D:263-265 | | |
| 506 | n2 teach bank 900 -> 600 px | OPEN | none | Built as 720 px (ES 738) | (ii) fun-gate dead time at 600/720 px |
| 508 | Easy 0.35-0.55 actions a second | SOURCED | GP:290; SR §2 Pacing (ccr:173); GL E3 | | |
| 509 | No Easy run over 20 s without a 2-second rest | SOURCED | SR §0b.1 (5-20 s groups, ccr:43); R3:205-215 (F13: rest >= 2.0 s Easy) | F13's rest is also relative (2x the local median), which the spec drops | |
| 510 | No dead time over 2.5 s | SOURCED | R3:325-328 (W10); tools/validate/core.ts:153 [ccr] (DEAD_WALK = 2.5) | SR §2 says 2.0/3.0 s (ccr:173) and about 4 s (ccr:171) | |
| 511 | Normal's flags no worse than main | OPEN | none | | (ii) fun gate on main vs mixer |
| 514 | 9 to 11 ideas a roll; snap dash twice; fork twice | DERIVED | ES 339-351 node plan | | |
| 516-517 | Fork share n4 + n10 15-20% each, 30-40% | OPEN | none | Already withdrawn at ES 425 (measured 11-13%); stale; see (b) C11 | (ii) measured: cp3/cp3-forks.txt:1 |
| 518-519 | Two forks with >= 3 crossings; a third small fork in n9 if short | OPEN | none | Superseded by recurring canopies (ES 405-411) | (ii) splits per roll |
| 520-521 | Move ladder: creaky new at n2, tested n6, mastered n10 | SOURCED | GL A1 | Creaky's teach is 1-2 (ES 1429); stale; (b) C9 | |
| 522 | Checkpoints before n6 and n10 only, plus start | OPEN | none | Withdrawn at ES 431, re-stated here; see (b) C11 | (i) ES 426-431 / easyMode.ts:256 |
| 522-523 | Hearts only after n6 or n10 when risk > 0 | MATT | MD:77-79 | | |
| 524 | Boa and turtle kept out until their teach is built | MEASURED | cp2/cp2-animals-groups.out | | |
| 526-527 | Matt sees three side maps stacked, then a grey-box build | MATT | MD:112-113, MD:116 | | |

## 8. Library additions from never-packed art (ES 530-554)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 532 | 60 rows of never-packed art | MEASURED | d34cc249 (NEVER-PACKED.md, 60 rows) | | |
| 533-534 | Each is its own CP; Matt picks the order | MATT | ST:967-968 (Matt sets the order of work) | | |
| 534 | No Hugging Face spend (already painted) | MATT | CLAUDE.md HF rule ($72 total) | | |
| 538-545 | Eight ideas and their estimates (0.1-2% each) | OPEN | none | Estimates | (ii) the meter on the first one built |
| 547-548 | Backdrops and clip alternates are dressing and story | OPEN | none | | (i) SR §4 Use ALL the art (ccr:218) |
| 551-552 | First pick: "Which log bites?", because logs are about half of every piece | MEASURED | cp2/library.txt:2 (9,095 of 19,651 = 46%) | | |
| 553 | Second: mangrove roots | OPEN | none | | (ii) cost each on the meter; then Matt's pick between two costed options |

## 9. The log family (ES 556-590)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 556 | Matt: "more logs? different log sizes? different types of feel?" | MATT | (relayed) MD:52-54 ("It's not just logs, it's anything that will add to the platform type experience") | The quoted question itself is not saved | |
| 558-559 | Three size bands: short about 110, mid about 320, long about 880 px | MEASURED | cp2/sheet.html (log 107 / 317 / 882) | Spec cites cp2/library.txt, which has no widths | |
| 559-560 | The mix counts kind x size | SOURCED | SR §0c.3 (ccr:81-82) | | |
| 564 | Solid log everywhere | MEASURED | cp2/library.txt:2 (worlds 1-10) | | |
| 565 | Drifting log: World 2 only, 302 placed | MEASURED | cp2/library.txt:10 | | |
| 566 | Pushed log room; wrap 30-45 min | SOURCED | cp2/mechanics-exist.md:23 (the Push block row) | 30-45 min is the planner's estimate | |
| 567-574 | Hollow, mossy, broken, jam, slung, cracking, rolling, biting: exists?/art | SOURCED | cp2/mechanics-exist.md:12-29; IN-GAME-UNUSED / NEVER-PACKED (b461499b, d34cc249) | | |
| 567-575 | Their estimates (0.1-1.5%) | OPEN | none | Estimates | (ii) meter |
| 575 | Sinking log: skip; cracking log gives the same feel for less | OPEN | none | | (iii) shipped sinking-platform examples (DKC Tropical Freeze, GP:42 "sinking mudflat logs") |
| 578-580 | Today 3 log kinds; +0.5% for 8 kinds; slung/rolling/biting cost more | DERIVED | rows above | | |
| 584-588 | New pictures: HF first, Gemini fallback run by Matt; only for true gaps; lead approves; about $70 left, $15 reserve | MATT | MD:49-56; CLAUDE.md HF rule | CLAUDE.md says $72 total | |
| 588 | Method hf-backdrops.md with its floor check; token never in code | MATT | CLAUDE.md "Hugging Face token" rule; LAWS 8 | | |

## 10. The ground and perch family (ES 592-621)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 592 | Hills and little areas to jump up on | MATT | MD:52-54 | | |
| 596-597 | No true slopes; every surface flat-topped; W5 mound stepped | MEASURED | designer's search of the engine (b373685e); no saved output | | |
| 597-599 | A hill is a stepped mound of 2-4 rises | OPEN | none | | (iii) shipped stepped-hill examples (Super Mario Bros. stairs; Dahlskog's "stairs" family, D:430) |
| 603 | Bank, 3,934 placed | MEASURED | cp2/library.txt:3 ("bank (moss stone)") | | |
| 604 | Stone step 50-420 px, 1,567 placed | MEASURED | cp2/library.txt:5; cp2/sheet.html (mossy stone 50 / 233 / 421) | | |
| 611 | Fungus shelf, World 8 only, 53 placed | MEASURED | cp2/library.txt:13 | | |
| 614 | Bounce mushroom, 330 placed | MEASURED | cp2/library.txt:9 | | |
| 605-613 | Mound, stump perch, broken stump, rock shelf, wet steps, floating ledge, root platform, boulder: art sources | SOURCED | IN-GAME-UNUSED.md / NEVER-PACKED.md (b461499b, d34cc249) | Not re-opened row by row | |
| 605-615 | Estimates (0.1-5%) | OPEN | none | | (ii) meter |
| 615 | True slope: 3-5% plus HF; not now | OPEN | none | | (iii) Tiny Wings / Alto's slope engines (D:417, R4 Alto's) for cost |
| 618-620 | Today 4 ground kinds; +1-1.5% for 12 kinds | DERIVED | rows above | | |

## 11. The difficulty dial (ES 624-659)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 624 | Difficulty rises through the game, on Easy and Normal | MATT | SR §0.5 (ccr:26-35); SR §1b (ccr:131-134); dial quote relayed | The quoted sentence itself is not saved | |
| 628 | d = (0.1(w-1) + 0.2(s-1)/8) / 1.1 | OPEN | none | Gemini's D(w,s) (GP:98-101, LEG E137) was rejected (D:945) | (i) LEG E137 / GL F2 (bands.ts measures each stage); (ii) tools/inspect/bands.ts on old W1-W4 to fit d to today's measured bands |
| 630 | d = 0 at 1-1, 1 at 10-9; each world climbs 0.18 | DERIVED | ES 628 (0.2/1.1 = 0.182) | | |
| 631-632 | A new world's first stage starts at the previous world's middle; "STAGE-RULES §1b" | DERIVED | ES 628 (0.1/1.1 = half of 0.182) | §1b (ccr:131-148) does not say this; GP:100 says "slightly below the end"; see (b) C17 | |
| 633 | Examples 1-1 0.00, 1-5 0.09, 1-9 0.18, 2-1 0.09, 2-9 0.27, 5-5 0.45, 10-1 0.82 | DERIVED | ES 628 (checked: 0.091, 0.182, 0.273, 0.455, 0.818) | | |
| 635-636 | Each dial linear in d; all estimates, tuned on Matt's play | OPEN | none | | (ii) bots per d on the mixer; (i) R3 F17 knob elasticity (R3:255) |
| 640 | Gap share of the level check's limit: Normal 0.55 -> 0.92, Easy 0.45 -> 0.80 | OPEN | none | D overturned gap share as a difficulty dial (D:48, D:180-187); Gemini gives 0.35-0.75 / 0.25-0.55 of R1 (LEG E103, GE:173); GP:75-76 caps 0.82 / 0.65; see (b) C1, C20 | (i) LEG E103 (start ranges) and D:177 (calibrated 0.35-0.75 / 0.25-0.50); (ii) noisy bots at each share |
| 641 | Rise share of the gate's highest: Normal 0.50 -> 0.95, Easy 0.40 -> 0.80 | OPEN | none | | (ii) cp2-trace.ts flick windows per rise share |
| 642 | Typical landing p50: Normal 220 -> 110 px, Easy 260 -> 150 px | OPEN | none | Measured CP3: Normal 221, Easy 218 (cp3/CP3-REBUILD.md:53-57); later Easy about 300 (ES 796); see (b) C4 | (i) LEG E105 (154-308 px) |
| 642 | Never under 90 px | SOURCED | D:179 (BT minimum 90 px); LEG E105 (MIN_LEDGE 90) | | |
| 643 | Risky pieces a burst: Normal 0-1 -> 3-4, Easy 0 -> 2 | OPEN | none | | (i) R4:555 idea 3 (node expected falls: intro 0, spike 0.2-0.4, climax 0.3-0.6) |
| 643 | Rests and teach steps hold 0 risky pieces | SOURCED | GP:317 (zero lethal failure); GV:61 (rest areas) | | |
| 644 | E[lives] on a first run: Normal 0.5 -> 3.0, Easy 0.2 -> 1.0 | OPEN | none | Cites D §2.3, which says Normal W1 <= 1.0 rising about 0.5 a world (W10 about 5.5), Easy <= 0.3 (D:200; R3:42-44); the endpoints differ; see (b) C16 | (i) R3 F1 (R3:42-44) and D:200; (ii) calibrate bots on touchReplay recordings first (R4:559 idea 4) |
| 645 | Taught animals a stage: Normal 0-1 -> 4-5, Easy 0-1 -> 3 | OPEN | none | Gemini: 3.5-11.35 enemies a minute (LEG E114, GE:199); MR: >= 35% of nodes animal-free (D:207) | (i) LEG E113-E115; (ii) count animals per old W1-W4 stage (cp2/enemies.txt) |
| 646 | Crumble delay: Normal 0.9 -> 0.5 s, Easy 1.2 -> 0.8 s | OPEN | none | Easy 1.2 matches Gemini's 36 frames (LEG E151); Normal 0.9 matches nothing; conflicts with ES 228/333 (Easy 1.0 s); GV:13 snap 0.15 s, creak 0.6 s; shipped tiles 0.85-0.61 s (RM:418); see (b) C3 | (i) LEG E151; SR §0b.4 (ccr:51-52) |
| 647 | Timed windows: Normal x1.0 -> x0.75, Easy x1.15 -> x0.9 of each piece's proven window | OPEN | none | | (i) GL F5 (window floors 167 / 300 ms) as the hard floor; (ii) pressWindow per piece |
| 648 | Bursts a node 2 -> 3 | OPEN | none | 1-1 (d = 0) lays 3 in n2-n7 (ES 1181); see (b) C21 | (ii) length per burst count on the mixer |
| 651-652 | Floors: Normal adult >= 70% W1-5, 50% W6-10; Easy kid >= 85% | SOURCED | SR §1b (ccr:147-148); GP:368; GL F3 | R3 W4 (R3:294) shows these do not bound a stage | |
| 652 | Every teach step at miss chance <= 0.01 | SOURCED | D:1287-1288 (teach <= 0.01 per event, estimate) | R3 F2 gives the teaching beat >= 0.97 success (R3:61-62) | |
| 653 | The placement rules never move with d | MATT | MD:76-86 | | |
| 655-656 | A test node sits higher than a warm-up inside the dial, never above d = 1 | SOURCED | GP:87-93 (sawtooth); GL A6 | | |
| 658-659 | 1-5 at d = 0.09: gap 0.58, landings about 210 px, 0-1 risky, E[lives] about 0.7 | DERIVED | ES 640-644 at d = 0.0909 (0.584, 210, 0.73) | | |
| 659 | Replaces the planner's fixed 70-90 px stand-in | MEASURED | cp3/CP3-CHECKPOINT.md:56 (Normal 0.58, Easy 0.48 of the gate's widest) | | |

## 12. Stage length (ES 662-674)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 664 | Floor 2:00 on the quick-route clock, skilled player | MATT | MD:45-47; CLAUDE.md | The quick clock ignores climbing (RM:478, R-164.5) | |
| 665 | No cap; over 5 minutes is fine | MATT | MD:45-47 | | |
| 666 | Lengths vary across a world | MATT | MD:45-47 | | |
| 667 | A world's nine stages spread from about 2:00 to about 5:00 | OPEN | none | SR §0.5 (ccr:36-38): first-timer 2-5 min a stage, World 1 20-25 min in all | (i) SR ccr:36-38 (first-timer totals per world); (iii) stage clear-time spreads in a shipped world (e.g. Rayman Legends, Mario Wonder speedrun splits) |
| 667-668 | Neighbours differ by >= 20% on the quick clock | OPEN | none | Designer's default, "the planner proposes the measured number" (never done) | (ii) quick clock of old W1-W4 neighbours; (i) D:1256 (neighbour pulses differ >= 15%, SR §0b.6 "must not share a tempo") |
| 668 | The set piece or finale is among the longest | OPEN | none | | (iii) shipped worlds: is the X-9 / finale stage the longest? |
| 669-670 | Length from units, never from a clock | SOURCED | SR §0c.1 (ccr:77-78); R1:48-59 (L3); D:212-213 | | |
| 672 | Every roll >= 2:00 on both settings | MATT | SR §1 Length (ccr:106, "on every roll") | | |
| 673 | No two neighbours within 20% | OPEN | none | as ES 667-668 | (ii) quick clock of old W1-W4 neighbours; (i) D:1256 (neighbour pulses differ >= 15%) |
| 674 | A world's spread >= 2.5 minutes | OPEN | none | | (ii) quick clock of old W1-W4 neighbours (stageTime.ts MODEL_FAST); (iii) stage clear-time spreads in a shipped world |

## 13. The polish pass, P-1 to P-13, S-1 to S-9 (ES 677-794)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 677 | "It played much better. Needs polish... kind of ugly" | MATT | MD:39-42 | | |
| 679-684 | Five faults in Matt's still | MATT | MD:40-42 (the still matt-1-5-mixer-0216.png) | The fifth (empty top half) is the designer's read | |
| 690-692 | P-1 every piece painted; no grey placeholder ships | MATT | CLAUDE.md Polish rule; SR §4 (ccr:203-210) | | |
| 693-695 | P-2 nothing floats unless it floats (D16) | SOURCED | SR §6 "Ledges in the air: nothing floats" (ccr:602-606); RM:476 (R-164.3) | Revised by ES 1369 (floating allowed per kind, Matt MD:124-133) | |
| 696-700 | P-3 ground ends dressed; check drops over 120 px | OPEN | none (120 px) | Rule from Matt's still; 120 px is the designer's | (ii) count bank ends by drop height on old 1-1 |
| 701-702 | P-4 foliage follows the ground | MATT | MD:41-42 (his still) | | |
| 703-704 | P-5 flags, marks, hearts stand on the path; base within 4 px of a standable top | OPEN | none (4 px) | | (ii) tolerance from the engine's foot slop (FORGIVE.landPx 8/12 px, GL G3) |
| 705-708 | P-6 upright screen never half empty; 3 views of 4 | OPEN | none (3 of 4) | | (ii) sliding upright view on old 1-1 (Matt's best) |
| 709 | P-7 a stump under the perched mushroom (W6 kit-15 or W5 fernStump) | MATT | CLAUDE.md Polish rule | | |
| 715-718 | P-8 pit art only where there is a pit | MATT | RM:479 (R-164.6, Matt's stills) | | |
| 719-721 | P-9 HUD always on top, at the 6 places | MATT | RM:480 (R-164.7) | | |
| 722-725 | P-10 darkness fades over >= 200 px; bank face seamless | MATT | RM:481 (R-164.8) | 200 px is OPEN: (ii) stills at 100/200/300 px; must be baked (PERFORMANCE-RULES:89, no per-frame gradients) | |
| 726-728 | P-11 bridges stand on posts or a standable top within 4 px | MATT | MD:40-42 (stills 02, 07, 08) | 4 px as P-5 | |
| 729-730 | P-12 no placeholder stone | MATT | CLAUDE.md Polish rule | | |
| 731-733 | P-13 the marks counter matches the goal | SOURCED | e9c7ed6c (asserted HUD goal) | | |
| 737-738 | Teach twigs at 40, 75, 40 px; teach bank 720 px | MEASURED | 8c8cd997 (teach bank 720 px; fun gate dead walk 27.5 -> 4.7 s) | | |
| 739-740 | No creaky piece before n2's teach | MATT | CLAUDE.md "the first appearance of a mechanic is taught" | Creaky's real teach is 1-2 (b) C9 | |
| 741 | Stone at 50 px, the height World 1's rock art is painted for | MEASURED | fdabad42 (P-12, stones at 50 px) | | |
| 742-745 | Polish order if the budget forces a split | OPEN | none | | (i) the spec's own polish order rationale, ES 742-744; (ii) none needed: a scheduling call |
| 749-753 | Easy density 0.67 vs 0.35-0.55 not accepted; fixes in order | MEASURED | 34c27751 (0.65), e68b6f4b | | |
| 752-753 | Easy bursts 3 pieces, snap dash 5; rests 4-5 s with a petal arc | OPEN | none | | (i) GP:292-293 (Easy groups 6-8 s, 3-4 actions; rests 2.0-2.5 s) |
| 754 | n7b's Dot line | OPEN | none | New line; SR §1 Story (ccr:118) needs "(new, needs Matt's approval)" | (i) SR §1 Story (ccr:118): mark it "(new, needs Matt's approval)" |
| 759-764 | Round 1 fixed: no grey slab, painted rocks, trunks, posts, x/10 | MEASURED | cp3/stills-v2/; 5a217b85 | | |
| 766-767 | S-1 pit columns still under creek pieces | MEASURED | cp3/stills-v2/ | | |
| 768-769 | S-2 grass blocks about 100 px over water | MEASURED | cp3/stills-v2/ | | |
| 770-771 | S-3 stones on poles read as mushrooms on sticks | MEASURED | cp3/stills-v2/ | | |
| 772-777 | S-4 boughs share a tree (one trunk, 2-3 boughs); no two neighbouring trunks share art or vine wrap; widths vary | OPEN | none | Old 1-1's canopy "hangs from big trees" is the designer's read | (ii) count boughs per trunk on old 1-1 |
| 778-779 | S-5 a tip shows once per stage | SOURCED | SR §1 Dot (ccr:124-127: once per save, 30 s between lines) | SR says once per save, stricter | |
| 781-782 | S-8 Dot's bubble clear of the route ahead (D10) | SOURCED | 3f03680c (the lead's check) | | |
| 783-785 | S-9 a stone in water rises from it; check its bottom at or below the surface | MEASURED | 61085f91 (S-9 check holds 32/32) | | |
| 790-792 | Easy pacing judged over 16 rolls by median and worst | OPEN | none | Was cited to D:1037, which is about step 0, not this; noise numbers (+-0.03, +-15 s) have no saved output | (ii) tools/engine/cp3-pace16.sh: one-roll spread vs the 16-roll median and worst; (i) R3 F6 (R3:114-123, judge spread over many rolls) |
| 792 | A third Easy-only rest after n3 if the median is still over 0.55 | MEASURED | 27345325 (Easy-only rest n3b) | | |

## 14. Pacing rulings and the CP3 finish (ES 795-925)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 796 | (A) Easy own size bands, landings about 300 px; one fewer burst a node | DERIVED | w1mix:330 (EASY_BS = 1.35 x Normal's bands), dcb75adf | 1.35 x 220 = 297 px; 1.35 itself is OPEN: (i) LEG E105 / GE:173 (7.0 sloth widths on Easy intro) | |
| 797 | Easy at 0.55 or less; "this line is not loosened" | SOURCED | SR §2 Pacing (ccr:173); GP:290 | Loosened at ES 892; see (b) C18 | |
| 799 | (B) Normal: a 1.0-1.2 s pad after every second burst | SOURCED | GP:293; SR §2 Pacing (ccr:173) | D:49, D:188-193 and R3 W1 (R3:265) say a fixed pad cuts phrases; see (b) C2 | |
| 799-800 | Normal's longest run without a rest no worse than main's 29 s | MEASURED | cp3/CP3-ROUND2.md:23 (main's 1-5: 29.3 s) | | |
| 801-803 | (C) Normal density 0.80 vs main's 0.57 accepted provisional (§0 row 2) | MEASURED | cp3/CP3-ROUND2.md:23; D:47 (band not calibrated) | | |
| 802-803 | Matt played the busier mixer 1-5: "It played much better" | MATT | MD:39-40 | | |
| 804-806 | Bot fork stall not counted as dead time once traced | MEASURED | cp3/cp3-stuck.out; cp3/CP3-REBUILD.md:31-35 | | |
| 809-810 | B passes: Normal longest run 23.9 s median, 30.5 worst vs 29.3; Easy density 0.54 median, 0.57 worst; Easy clock about 5:00; nothing new 2,094 px | MEASURED | dcb75adf | | |
| 811-812 | (3) On Easy about 6 nodes keep the canopy, 3-4 drop it | OPEN | none | | (ii) measured after: b88f2ea2 (Easy splits 20) |
| 812 | Kept canopies: fork neighbours and the node after a teach or test | OPEN | none | | (i) GV:69 (portal at the Ten) |
| 814-818 | Easy lines: splits >= 19, density <= 0.55, run <= 20 s, nothing new <= 1,516 px, fast clock < 4:00 | MEASURED | cp3/cp3-splits.txt; cp1/table2.txt:2 (1,516); 4:00 is the designer's (withdrawn ES 831) | | |
| 819 | Easy high-road boughs keep Normal's bands (the road is optional) | OPEN | none | | (i) SR §1b "Easy is gentler, never empty" (ccr:135-137) |
| 820-822 | No breather pads on fork roads | MEASURED | b88f2ea2 (bot stall at the road-end breather) | | |
| 826-829 | (i) Fork marks on the shared ground | MEASURED | 14ff1727 | | |
| 828 | Goal stays 10 of 13 Normal, 8 Easy | OPEN | none | as ES 462 | (i) LEG E120 (yield 0.85); (ii) first-timer bot marks per route (cp3-ft.ts) |
| 830-831 | Easy clock 4:21-4:33 accepted; Matt's 2:00 floor, no cap | MATT | MD:45-47 | 4:21-4:33 measured in b88f2ea2 run | |
| 831-832 | The 20% spread judged on Normal's quick clock | OPEN | none | | (ii) quick clock of old W1-W4 neighbours (stageTime.ts MODEL_FAST); (iii) stage clear-time spreads in a shipped world |
| 833-834 | S-9: stepping stone <= 50 px above the water; taller ones are stumps | OPEN | none | | (ii) stills |
| 836-838 | Stones stay in 1-5 on ground ("more pieces") | MATT | CLAUDE.md "Variety comes from more pieces" | | |
| 851-852 | 18/18 variety lines; 32/32 level checks; bots 4/4 | MEASURED | 14ff1727 | | |
| 854-857 | Easy density 0.60 calibrated on old 1-1 Easy | MEASURED | cp3/old11-main-pace16.txt | | |
| 861-863 | Deep pits: dark follows the bank faces then fades over about 300 px; to Matt | OPEN | none | | (ii) the before/after stills exist (cp3/pit-fade-choice on ccr); (iii) dark-edge treatments in shipped painted platformers (Ori, Rayman Legends) |
| 868-871 | Old 1-1 Easy density median 0.575 (0.53-0.66), longest run 25-119 s; new 1-5 0.61 / 0.63, 17-18 s | MEASURED | cp3/old11-main-pace16.txt (16 rolls); 213cbc4b | | |
| 874 | Double breather adds about a minute (Easy about 5:20) | OPEN | none | Not run | (ii) build it once and clock it |
| 877-878 | (a) double breather about 0.52; (b) keep 0.61 (designer's pick) | OPEN | none | (a)'s 0.52 not measured | (ii) as above; then Matt's pick |
| 881-882 | Two-road worst 38.5%; B's pads added about 4,000 px of single road; catch branches 0.003; fork-bank pad about 1% | MEASURED | designer's trace on d27c5acd (no saved output) | | |
| 883-884 | Canopy end piece is the rest: 520-560 px flat, then a short step | MEASURED | b7c38491 | | |
| 885 | Two-road >= 40% every roll; Normal longest run <= 29 s | MEASURED | b7c38491 (41.1-44.6%; 14.9 / 19.2 s) | | |
| 888-892 | Easy accepted at 0.61 / 0.63; line becomes "no denser than the old 1-1's Easy range" | MEASURED | cp3/old11-main-pace16.txt | Changes a written line without Matt's recorded yes; (b) C18 | |
| 893-894 | No tuning until Matt has played and given his meter reading | MATT | ST:966-967 | | |
| 899-908 | CP3 READY numbers: two-road 41-45%, longest run 14.9/19.2 s, 18/18, splits 26/20, creaky 20-25%, biggest idea 29-36%, 32/32, draw check, bots 4/4 with 13/13 | MEASURED | b7c38491; cp3/ (pace16l.jsonl, stills-v9) | | |
| 909 | Normal clock 4:00-4:12 accepted | MEASURED | b7c38491 run | | |
| 910-912 | Trunk density: six near-identical trunks a screen; fix: share within 220 px, <= about 3 full trunks a screen, side branches | MEASURED | cp3/stills-v9/ (six trunks); 220 / 3 are OPEN (ES 930-934) | | |
| 914-920 | Matt's stills at 6 places, upright and sideways | SOURCED | CLAUDE.md "Done means polished"; LAWS 2 | | |
| 922 | Each pair checked against P-1 to P-7; a failing still is fixed, not explained | SOURCED | LAWS 1 | | |
| 924-925 | No HF spend; a small picture list if a gap shows | MATT | CLAUDE.md HF rule | | |

## 15. CP4: trunk fix and the 1-1 plan (ES 928-1093)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 928 | "It's better." / "One first, then the rest." | MATT | ST:967 | | |
| 931 | Boughs within 220 px share one tree | OPEN | none | Built and measured (a3bc093c) but the number is the designer's | (ii) bough-to-trunk spacing on old 1-1 (Matt's best) and main's kapok placement |
| 932 | <= about 3 full trunks a screen width, both ways | OPEN | none | Window later 1,400 px (ES 1057, a3bc093c) | (ii) trunks per 1,400 px on old 1-1; (iii) DKC Returns / Rayman canopy screenshots per screen |
| 933 | Further boughs hang from a shared trunk's side branch | OPEN | none | No side-branch art (ES 1057-1058); built as a thin post | (ii) atlas search for a side-branch frame (tools/art/artuse.mjs); else an HF picture-list item |
| 934 | No two neighbouring trunks share art or vine wrap | MEASURED | 27345325 (bare and vine-wrapped kapok alternate) | | |
| 937-938 | 1-1 "Into the Canopy": run the high branches; arrival; teaches run, jump, double | SOURCED | dotLinesData.ts:94-98 [main] (run, jump, double coaching on 1-1) | | |
| 939-940 | Rises from floor to high branches; backdrop changes with height | SOURCED | reference/W1-REBUILD-PLAN.md:23 [ccr] ("floor -> canopy; the backdrop changes with height") | Matt asked for one sky on 1-1 (RM:475, R-164.2); see (b) C8 | |
| 941 | Its moment: the first double-jump chain into the canopy | SOURCED | BR:21-22 | | |
| 942 | d = 0; nothing untaught: no creaky, crumbling or animals | SOURCED | SR §1 Teaching (ccr:109) | Spec says 1-5 teaches creaky (stale, C9) | |
| 943 | Run, jump, double and bounce taught here | MEASURED | ML (gap first 1-1, mushroom first 1-1) | | |
| 944 | Overall trend up, so 1-1 and 1-5 never share a shape | OPEN | none | | (i) SR §0b.6 neighbours never share tempo and camera direction (ccr:58) |
| 947-948 | "Are you also explaining how it should feel based on the story?" | MATT | MD:34-37 | | |
| 950-954 | Where Pokey is: two days after, the vow, petal points north, squirrels | SOURCED | BR:5-7, BR:12-16 | | |
| 955-957 | The feel: a small, determined start that grows | SOURCED | BR:18-23 | | |
| 958-967 | Node-group feel (n1-n3 gentle; n4-n6 first lift; n7-n9 rising courage; n10-n11 arriving) | SOURCED | BR:18-23 | | |
| 963-964 | n7-n9 is the only place in 1-1 where a miss costs a setback | OPEN | none | | (i) R3 F2 (first test of a new move ~0.85); MD:77-79 |
| 965-967 | Bootprint at the shrine, a story prop | SOURCED | src/components/stageClue.ts:16 [main]; BR:33-36 | | |
| 968-970 | The view north is 1-4's | SOURCED | BR:41 | | |
| 971-972 | Every later spec opens with its beat and feel | MATT | MD:34-37 | | |
| 975-976 | "not all branches like the last one" | MATT | BR:46 (PARTNER.md:34 on ccr) | | |
| 978-979 | First half n1-n7 is the forest floor, no canopy | SOURCED | BR:45-52 | | |
| 980-983 | Splits in the first half from the ground itself; n5 a ground fork | OPEN | none | Measured result: splits 2-4 (098aff49) | (ii) already measured; see ES 1158 |
| 984-985 | Boughs only with the climb (n8 on); n4's bounce onto a mound or log jam | SOURCED | BR:50 ("the canopy comes late, as the reward") | | |
| 987 | Boughs + creaky <= 30% of 1-1's landings | OPEN | none | Measured 11-12% (098aff49) | (i) BR:46 ("90% branches" was the fault); (ii) old 1-1's bough share (cp1) |
| 988 | 1-1's commonest kind is not 1-5's | SOURCED | BR:52 | | |
| 989 | 1-1 and 1-5 share <= half their ideas | OPEN | none | Measured 6 of 13 (098aff49) | (i) LEG E47 |
| 990 | Old 1-1's floor numbers hold (up/down 4 of 5, new every 572 px) | MEASURED | cp1/table2.txt:2 | | |
| 991-992 | If ground forks can't reach 19, report before working around | SOURCED | LAWS 3 / LD:46 | | |
| 995-996 | The brief is the source; it wins over the designer's draft | SOURCED | LD (roles), ST:962 (the lead does story, the designer layout) | | |
| 1000-1002 | Petals low at marching height on trunks and banks | SOURCED | BR:26-27 | | |
| 1004-1008 | Squirrel poses as dressing; "I didn't know you could do that" pays off in 1-2 | SOURCED | BR:21-22, BR:28-29 | | |
| 1009-1013 | Dot's shipped 1-1 lines and where they sit | SOURCED | dotLinesData.ts:94-101 [ccr]; BR:30-31 | Placement per node is the designer's | |
| 1014 | Morning light, then deeper canopy as he climbs | SOURCED | BR:32 | Conflicts with one sky (RM:475); (b) C8 | |
| 1015-1021 | Owned by other stages: 1-2 note, 1-3 punch, 1-4 kapok climb, 1-5 folded petals, lianas 1-6, bush 1-7 | SOURCED | BR:38-43 | Lianas belong to 1-2 (d272601f; ES 1429); BR:43 and ES 1020 are stale; (b) C9 | |
| 1018 | So n8 draws bough stair or bounce up, never a long trunk climb | SOURCED | BR:41 | | |
| 1022-1024 | Mostly ground and low pieces; commonest is a ground piece | SOURCED | BR:45-52 | | |
| 1026-1034 | Workflow: brief, node plan, build and measure, lead check, Matt plays; all three sign | SOURCED | ST:962-963 | | |
| 1037-1041 | Every spec carries a feel profile; pass lines from the profile | MATT | MD:25-32 ("various randoms ... how it branches, if it branches, if there's water") | | |
| 1042-1044 | A feel check across stages; fails when neighbours are too alike | SOURCED | SR §0c.6-7 (ccr:90-99) | | |
| 1046-1052 | 1-1 profile: moderate branching, hilly rising, calm march, low petal trail, morning forest edge | SOURCED | BR:18-32 | | |
| 1055-1056 | Jumps judged as each stage teaches them (singles before the double) | MEASURED | 98f2decb (tools/engine/cp4-jumps11.ts) | | |
| 1057 | <= 3 full trunks per 1,400 px on 16/16 rolls | MEASURED | a3bc093c (worst 3 a screen, was 6) | 3 and 1,400 are OPEN (ES 932) | |
| 1057-1058 | A bough past the cap stands on a thin post (no side-branch art) | MEASURED | a3bc093c (post past 300 px from every tree) | | |
| 1059-1060 | Hollow logs, squirrels, bootprint must exist in the W1 atlas; no stand-ins | MATT | CLAUDE.md Polish rule; SR §4 (ccr:203-210) | | |
| 1065 | n1 teach run; no heart; start flag | SOURCED | dotLinesData.ts:96 (coach.run) | | |
| 1066 | n2 teach jump: bank hops with safe dips, stump hop; "Jump the little gaps" | SOURCED | dotLinesData.ts:99 [main] (hint.1-1.gaps); R1:68 | | |
| 1067 | n3 practise: "Hop from stone to stone" | SOURCED | dotLinesData.ts:100 [main] | ES 1011 put "Up the bank" at n3; w1mix:107 puts it on the n3 fork | |
| 1068 | n4 teach bounce from a mushroom beside the path | SOURCED | 6dae405d (mushroom on a perch, walking on takes the low road) | | |
| 1069 | n5 first fork on the ground; marks per CP3's fork rule | MEASURED | 14ff1727 (fork marks on shared ground) | | |
| 1070 | n6 rest, a Dot spot; flag only if n7 follows hard | MATT | MD:79-80 | | |
| 1071 | n7 teach double over safe ground; the two shipped double lines | SOURCED | dotLinesData.ts:95, :98 [main] | | |
| 1072 | n8 low boughs; bough stair or bounce up (not n4's) | SOURCED | BR:41 | | |
| 1073 | n9 the moment: 3-4 rising doubles, catch boughs below; flag before; heart after only with risk | OPEN | none (3-4) | | (ii) cp4-jumps11 and first-timer on n9 |
| 1074 | n10 canopy fork | MATT | MD:8 | | |
| 1075 | n11 one long high branch to the shrine; bootprint | SOURCED | BR:33-36 | | |
| 1077 | Normal quick clock 2:40-3:15 | DERIVED | 1-5 median about 4:05 (b7c38491) x 0.8 = 3:16 | | |
| 1077-1078 | At least 20% under 1-5's median; over 2:00; Easy >= 2:00 | MATT | MD:45-47 (2:00); 20% is OPEN (ES 667) | | |
| 1080-1086 | Every rule built tonight applies (variety, decks, placement, P3, polish, Easy rules, 16-roll pacing) | DERIVED | rows above | | |
| 1087 | Splits >= 19; two-road >= 40% | MEASURED | as ES 411, 424 | Replaced for 1-1 at ES 1168-1175 | |
| 1088 | No idea over 40%, none twice in a row, >= 4 ideas | MEASURED | cp2/idea-tags.out (41%) | ">= 4" OPEN (ES 244) | |
| 1089 | Record 1-1's wall time, retries and % estimate | MATT | ST:967 ("real cost measured") | | |
| 1090-1091 | 1-2 to 1-4 wait for Matt's OK on 1-1; a miss stops the work | MATT | ST:967 | | |
| 1092-1093 | New 1-1 must beat old 1-1 side by side | MATT | MD:5-6, MD:116 | | |

## 16. CP4 as first written, CP5, total (ES 1095-1112)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1097 | All five stages pass on 16/16 both settings | SOURCED | ES 261 | | |
| 1098 | Neighbours share <= half their main pieces | OPEN | none | | (i) LEG E47 |
| 1099 | Every node labelled; none twice in a row; none over old 1-1's top share | MEASURED | cp2/idea-tags.out | | |
| 1100 | Fun gate: no new flags | SOURCED | D:1043 | | |
| 1101 | Designer plays each stage both ways against the one it replaces | SOURCED | LAWS 2 | | |
| 1102 | Five maps beside old 1-1; grey-box link of all five | MATT | MD:112-113 | Changed by ST:967 to one stage at a time | |
| 1103 | <= 1 hour a stage after the mixer exists | MATT | RM:473 | | |
| 1104 | Cost 1.5-2% | OPEN | none | | (ii) meter |
| 1107-1108 | Matt picks the engine's stages over today's, before art (check 5) | MATT | MD:116 | | |
| 1110 | Cost about 0.2% | OPEN | none | | (ii) meter |
| 1112 | Total 4.5-6.2% under the 8% ceiling, 1.8-3.5% margin | DERIVED | ES 59, 97, 268, 1104, 1110 | Actuals already past it (ST:966: round 2 alone 5-6%); (b) C15 | |
| 1120-1121 | Rhythm is the player's, not the song; regular, swing, broken, wait-and-go | MATT | ST:958 (MATT DECIDED, 11-04 10:40 PM ET); MD:12-13 | Types from D:1240 / R3 F12 | |

## 17. Planner's amendments P1-P4 and signatures (ES 1125-1153)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1127-1130 | P1: CP1 builds Easy as the engine does; inspector 0-20% identical | MEASURED | PLAN.md:74 [engine-plan] (E6: the inspector's Easy is not the engine's); D:85 (failure 5) | | |
| 1131-1133 | P2: the tracer knows hop, jump, double onto bank, branch, stump, crumble; vines, ropes, lilies, moving logs proven in the real engine | SOURCED | src/game/beatTrace.ts:48-50 [w1-rhythm] (Move hop/jump/double; Surface bank/branch/stump/crumble); D:1056 | | |
| 1134-1136 | P3: no first-timer drop onto a standable ledge in a life-costing span | MATT | RM:474 (R-164.1, Matt's clip) | | |
| 1137-1139 | P4: one model of a jump; "can't reach" rejections = 0; 932 -> 41 | MEASURED | R4:40-50 (94% of 1-2's rejections one rule); PLAN.md:65-67 [engine-plan] (E9: 932 -> 41) | | |
| 1141-1145 | No old World 1 stage on main has a lily pad (16 layouts; 1-6 to 1-9 on 3-16) | MEASURED | a3473541; cp1/ | | |
| 1147-1148 | 1-5's stone is moss_stone under 40 px (53 pieces); 68 fragile creak branches | MEASURED | 32751eb4 (planner's check, layout 1 Normal) | | |
| 1149-1152 | Old 1-1: 0 splits strict, 31 at 120 px allowance (longest 1,540), 21 at 200 px; 1-3 8/14/18 | MEASURED | 32751eb4; 26d73d6c | | |
| 1152 | A Normal flat jump 157-185 px (PLAN.md table 2.1; use 180) | MEASURED | D:119, D:125 (designer-measure.ts.txt) | | |

## 18. 1-1 ground build ruling (ES 1155-1200)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1157-1162 | Measured: splits 2-4, two-road 24-28% / 19-22%, fast 109-119 s, variety 16/18 with 2,042 / 2,646 px nothing-new, boughs+creaky 11-12%, ground commonest 16/16, 6 of 13 ideas shared | MEASURED | 098aff49 | Two-road Easy and the variety detail are in the designer's text only | |
| 1164-1166 | Ruling (a): lines from 1-1's own profile; a mound is solid down | MATT | MD:25-27 ("how it branches, if it branches") | | |
| 1165-1166 | Options (b), (c) bring back boughs-over-floor Matt turned down | MATT | BR:46 | | |
| 1172 | Splits whole stage >= 10 (>= 12 with hollow logs) | OPEN | none | Measured build gave 2-4 | (ii) build with the n8-n11 tree half and measure; (i) none |
| 1173 | Splits n8-n11 >= 7 | OPEN | none | 7 echoes the planner's "split floor 7 from 1-3" (ES 1141, strict rule) | (ii) measure old 1-1's splits per 1,000 px of canopy x the tree half's length |
| 1174 | Two-road Normal >= 25% | OPEN | none | Measured 24-28% | (ii) 16 rolls on the finished 1-1 |
| 1175 | Two-road Easy >= 20% | OPEN | none | Measured 19-22% | (ii) as above |
| 1177-1178 | Choice in the ground half from forks, hollow logs and side pockets; no thin raised roads | OPEN | none | | (i) GV:69, GV:173 (side branches for collectibles); R1:524 |
| 1179-1181 | Variety 18/18 and length unchanged; nothing-new misses traced, not relaxed | MEASURED | cp1/table2.txt:2 | | |
| 1180-1181 | Normal fast 160-195 s, Easy >= 120 s; 3 ground bursts a node in n2-n7; flat <= 1,351 px | DERIVED | ES 1077 (2:40-3:15 = 160-195 s); cp1/table2.txt:2 (1,351) | 3 bursts at d = 0 contradicts the dial's 2 (ES 648); (b) C21 | |
| 1183-1188 | Every piece names its element; the mixer fails a piece outside it | MATT | MD:124-137 | | |
| 1189-1191 | No water piece without a drawn water body; 1-1's creek on ground pieces until then | MATT | MD:28 ("We shouldn't have lily pads on branches"), MD:129-130 | | |
| 1194-1196 | Squirrels and hollow logs packed in w1-new.json, nothing loads it; 1-1 waits for the squirrels | MEASURED | 098aff49 (recorded as dressing, not drawn) | | |
| 1197-1199 | Bootprint: no art anywhere; a one-picture HF list | SOURCED | ST:970 (lead approved one HF bootprint, cap $3) | | |

## 19. Stage profile and element table (ES 1202-1263)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1204-1206 | Engine first; 1-1 parked at 72fe81a3 | MATT | MD:118-122 | | |
| 1206-1207 | The planner may add fields, not remove any | OPEN | none | | (i) the spec's own polish order rationale, ES 742-744; (ii) none needed: a scheduling call |
| 1212-1230 | Profile fields (story, arc, elements, water, branching, pace, length, mechanics, hazards, owns, commonest, unlike, caps, look, dress, marks, dot, difficulty) | MATT | MD:25-32 (speed, looks, what's in it, branching, water), MD:34-37 (story) | Field list beyond Matt's six is the designer's | |
| 1215 | 1-1 elements: ground >= 70% n1-n7, tree >= 60% n8-n11, water 0 | OPEN | none | | (ii) element share on the 098aff49 build |
| 1219 | Length: never below 120 s | MATT | MD:45-47 | | |
| 1224 | 1-1 vs 1-5 <= half their ideas | OPEN | none | | (i) LEG E47 |
| 1225 | 1-1 caps: boughs + creaky <= 30% | OPEN | none | as ES 987 | (i) BR:46; (ii) old 1-1's bough share (cp1 measures2.json) |
| 1228 | Marks 0 for a sprint | OPEN | none | | (i) GV:173 (collectible tiers by stage type) |
| 1232-1233 | World default: today's 1-5 lines (splits 19, two-road 40%) | OPEN | as ES 411, 424 | | | **[critic §7, ruled 11-05: no default: every profile states its own lines (critic ruling, L1232)]**
| 1233-1234 | A profile that lowers a default gives its reason | SOURCED | LAWS 5 (never loosen silently) | | |
| 1239 | bank, mound: ground, on the floor, solid to the bottom | SOURCED | MD:132-133 (support per piece) | | |
| 1240-1246 | stump, log (across a creek both ends on banks), log jam, hollow log, mushroom (never in the air), stone (ground or rising from water), push block | MATT | MD:132-136 (stones in water need a base; roots grow from a trunk or bank) | Row details are the designer's | |
| 1247 | lily pad, reed isle: on a drawn water zone, never over a painted drop | MATT | MD:28, MD:129-130 | | |
| 1248 | bough: a trunk within 220 px, or a thin post past 300 px | MEASURED | a3bc093c | 220 / 300 are OPEN (ES 931) | |
| 1249-1250 | creaky, rotten on a trunk or bough; vine hangs from a bough, top never in open sky | OPEN | none | | (i) SR §6 "nothing floats" (ccr:602) |
| 1251 | crumbling ledge: element as its art shows | OPEN | none | Ruled ground then removed from W1 (ES 1450) | (ii) atlas key check |
| 1252 | bridge span: both ends on the same element | SOURCED | ES 726 (P-11, Matt's stills) | | |
| 1253 | exit totem, shrine on a long ground piece | OPEN | none | | (ii) shipped shrines' footing |
| 1254 | pickups over a standable piece or on an arc, never inside a piece | MEASURED | d27c5acd ("a petal never inside a piece", asserted) | | |
| 1257-1259 | Rules: fail outside element; no row, no use; untaggable art goes back, never a guess | MATT | MD:134-137 | | |
| 1261-1263 | PLAN_11 n2/n5 lily pads with no water break rule 1 | MEASURED | 98b08168 (spec-check refuses 1-1's lily pads) | | |

## 20. The move ladder (ES 1265-1333)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1265 | "once you learn floating, you can float everywhere ... ropes, that's more used" | MATT | (relayed) MD:58-60 is the nearest saved words (enemies anywhere); the floating/ropes quote is not saved | | |
| 1268 | One source for where a move is taught: lesson lines, skills, Dot's tips | SOURCED | MW1:111-112 (mechanics table method) | | |
| 1269 | Known means allowed anywhere after its teach; checkSpec refuses before | SOURCED | SR §1 Teaching (ccr:109); SR §0.1 (ccr:19-20) | | |
| 1270 | Per-move fit rules in the library | MATT | MD:132-137 | | |
| 1272-1276 | Source: mechtable.ts / mechanics-world1.md; the table wins | MEASURED | MW1; ML (7d9ad9a9) | | |
| 1282 | run, jump, duck, punch always known at 1-1 | SOURCED | dotLinesData.ts:94-98 [main] | | |
| 1283 | mushroom bounce taught 1-1 (n4) | MEASURED | ML row mushroom (first 1-1) | | |
| 1284 | double jump taught 1-1 (n7), required n9 | SOURCED | src/game/levelCheck.ts:118 [engine-mixer 7d9ad9a9] (EARLY_DOUBLE has 1-1) | | |
| 1285 | stomp, kick, mega punch at 1-3 | SOURCED | BR:40 (combat teach belongs to 1-3) | | |
| 1286 | rope shimmy clearing 1-3, required 1-4 | MEASURED | ML row rope (first 1-3) | "clearing 1-3" = a skill reward, not re-checked | |
| 1287 | trunk climb 1-4 | SOURCED | BR:41 | ML says trunk first at 1-1 (the mixer's 1-1); ES 1435-1437 | |
| 1288 | breaking / creaky branch 1-5 | OPEN | none | ML says 1-2 (row breaking, first 1-2); revised at ES 1429-1433 but the table is unchanged; (b) C9 | (ii) settled by ML: 1-2 |
| 1289 | liana swing 1-6 | OPEN | none | ML says 1-2 (row liana); d272601f "1-2 owns the lianas"; (b) C9 | (ii) settled by ML: 1-2 |
| 1290 | push a log 1-6 | MEASURED | ML row push (first 1-6) | | |
| 1291 | hide in a bush 1-7 | MEASURED | ML row bush (first 1-7) | | |
| 1292 | ride a river log 2-1 | MEASURED | ML row drift (first 2-1) | | |
| 1293 | lift 2-7 | MEASURED | ML row lift (first 2-7) | | |
| 1294 | moving platform first shows in 2-10, a lair; must be taught in a stage first | MEASURED | ML row moving (first 2-10) | | |
| 1295 | leaf glide clearing 4-1; required 4-7 | OPEN | none | ML has no glide row (ES 1490) | (ii) add the glide row to moveladder.ts |
| 1296 | warm air 4-7 | MEASURED | ML row updraft (first 4-7) | | |
| 1297 | silk line 5-4 | MEASURED | ML row silk (first 5-4) | | |
| 1298 | swim 6-7 (root well) | SOURCED | 87f1e2f6 | | |
| 1299 | hold / freeze 10-3, required 10-4 (R-2.7, planned) | SOURCED | RM:84 (R-2.7) | | |
| 1302 | Hazards stay with their element: dark and spores W3, thorns W3, wind W4, webs W5, tide W6, crumbling floors W7, geysers W9, bolts W10 | MEASURED as a fact; NOT a rule | ML rows zone:* and thorn (first 3-1, 3-4, 4-2, 5-6, 6-4, 7-1, 9-1, 10-1) | | | **[critic §7, ruled 11-05: where hazards are today is the repetition being diagnosed; ruled: mechanics travel (critic ruling 3)]**
| 1303 | The 1-8 chase and the lairs stay with their stages | MEASURED | ML row chase (1-8 only) | | |
| 1305 | They come back only where the element fits | CONTRADICTED | SR §0c.7 (ccr:93-96) | | | **[critic §7, ruled 11-05: SR §0c.7 is about layout templates; SR §0.1 (ccr:19-20) says mechanics come back in every later world]**
| 1307 | Animals, once taught, anywhere on their element | MATT | MD:58-60 | "on their element" is the designer's | |
| 1311-1312 | A touch = 1-2 uses, some = 3-6 (one required), lots = 7+ or the theme | OPEN | none | | (iii) Hayashida / Nintendo "four-step" counts per course; (ii) count uses per stage on old W1 with mechtable.ts |
| 1316 | Teach stage: the move is the theme (lots) | SOURCED | D:422 (Hayashida: one core concept per stage) | | |
| 1317 | Echo: the next 2 stages (skipping lairs), at least some, one required | OPEN | none | | (i) R1:68 (L5) and GV:105 ("return later without retraining"); (iii) Shovel Knight's "on cooldown" list (R1:527) |
| 1318 | Own world after the echo: a touch every stage, some in half | OPEN | none | | (ii) mechtable.ts on old W1-W4 for today's numbers |
| 1319 | Every later world: each core move in >= 1 of every 3 stages; the world's own move lots | OPEN | none | | (i) SR §0.1 (ccr:19-20, "comes back in every later world"); (ii) ML spread per move |
| 1320 | Mixing W2 on: >= 3 known core moves besides run and jump, >= 1 from an earlier world | OPEN | none | | (i) SR §0b.5 pairs then triples (ccr:54-55); GV:21-55 (15 pairs) |
| 1321 | Combining: >= 1 stage in the move's world joins it with another move in one beat | SOURCED | SR §0b.5 (ccr:54-55); GL A1 (Ten) | | |
| 1322 | A use that breaks the fit rule doesn't count and fails | SOURCED | SR §0.2 (ccr:21-22: a hazard you can ignore is decoration) | | |
| 1323 | Easy: the same moves and counts; Easy's sizes | SOURCED | SR §1b "don't remove a move from Easy" (ccr:135-137) | | |
| 1324 | Overrides `none` only with a reason | SOURCED | LAWS 5 | | |
| 1327-1328 | Hide (1-7) and push (1-6) never come back in World 1 | MEASURED | MW1:60-76 | | |
| 1329 | Water (1-6) comes back in World 2 | MEASURED | MW1:72 | | |
| 1330 | The chase, the boa and the snake ring are set pieces and exempt | OPEN | none | MW1:69-75 lists them as "built once" too | (i) R1:572 (one stage's twist is fine); Matt's ruling |
| 1332-1333 | 1-1's proof uses only its own rows | DERIVED | ES 1282-1284 | | |

## 21. 1-5 under the element gate; Matt's three; W1 labels (ES 1335-1426)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1337-1338 | The crumbling ledge is ground: World 7's carved slab (crumbleArt.ts) | SOURCED | cp2/cp2-trace.ts.txt:36 (style 'ruin') | Removed from W1 at ES 1450 | |
| 1339-1340 | A slab on a kapok is the floating fault (P-2) | SOURCED | SR §6 (ccr:602) | Revised by ES 1369 | |
| 1341-1343 | 1-5's lily pads swap to ground pieces until water is drawn | MATT | MD:129-130 | | |
| 1344 | Both stay named breaches; a named breach is not a pass | SOURCED | LAWS 5 | | |
| 1345-1346 | Fingerprints change on purpose; re-run 16/16 | MEASURED | 9e243098 (32/32, 18/18, splits 20-26, two-road 40.3-43.0%) | | |
| 1350-1351 | Floating objects: "looks better ... too much junk" | MATT | MD:125-126 | | |
| 1351 | Each kind gets mayFloat; each profile a float line with a cap | MATT | MD:132-134 ("The support rule is per piece") | | |
| 1352-1356 | May float: stone, log, crumbling ledge, bough | MATT | MD:129-130 ("I don't mind floating logs"); stones/ledges/boughs are the designer's | Only logs and planks are Matt's; stone and slab superseded by ES 1716-1734 (Matt: rocks never float) | |
| 1357-1358 | Never float: lily pads, reeds, banks, mounds, stumps, mushrooms, creaky, bridges, totems, shrine | MATT | MD:129-130 (lily pads "more in the water") | Others the designer's | |
| 1363 | 1-1 float cap <= 15% | OPEN | none | | (ii) float share on old 1-1; (iii) Super Mario Bros. 1-1 floating-block share (Matt's "Mario type thing", MD:125) |
| 1364-1365 | 1-5 and default <= 25% | OPEN | none | | (ii) float share on old 1-1; (iii) Super Mario Bros. 1-1 floating-block share |
| 1367-1368 | A floating piece carries its own underside; never half hidden | SOURCED | GV:177 (silhouette legibility); SR §0b.7 (ccr:60-62) | | |
| 1369-1371 | Revises P-2 and the 9:56 ruling; canopy breakables stay creaky | MATT | MD:124-130 | | |
| 1373 | commonest becomes core; the commonest landing is a core piece | MATT | MD:127-128 ("label ... what levels they can be used on") | | |
| 1377 | 1-1 core: bank, stump, log; bough for n8-n11; stone not core | SOURCED | BR:49-52 | | |
| 1378 | 1-5 core: bough, creaky, bank | MEASURED | b7c38491 (creaky 20-25% top 3) | | |
| 1380 | Core pieces >= 50% of landings | OPEN | none | | (ii) share of the top-3 kinds on old 1-1 (cp1 measures2.json) |
| 1382-1384 | Themes: each kind names its worlds; checkSpec refuses off-theme ("no lava in the forest") | MATT | (relayed) e7089072 ("Matt, 11-05"); MD:127-129 ("look like they belong in that world") | "no lava" is not saved in Matt's words | |
| 1385-1387 | The per-world object pass, world by world; World 1's 10 kinds done | OPEN | none | | (ii) none needed: a scheduling call; (i) SR §0c.7 (ccr:93-99) for what each world's pass must decide |
| 1391-1392 | Labels: element, footing, floats, uses, teaches, worlds, stages | MATT | MD:127-128, MD:134-136 | | |
| 1396 | bank: W1-W4, W6-W10 | OPEN | none | cp2/library.txt:3 places banks in W1-W7, W9-W10 (none in W8) | (ii) settled by cp2/library.txt:3 plus the W8 object pass |
| 1397 | log: W1-W4, W6 | OPEN | none | cp2/library.txt:2 has logs in all 10 worlds | (ii) settled by cp2/library.txt:2: W1-W10 |
| 1398 | stump: W1-W4, W6 | OPEN | none | | (ii) atlas listing |
| 1399 | stone: W1-W4, W6, W9; a 50 px rise | MEASURED | fdabad42 (50 px); worlds OPEN (cp2/library.txt:5 lists 1, 3-5, 7-10) | | |
| 1400 | mushroom: W1, W3, W6 | OPEN | none | cp2/library.txt:9 lists 1, 3-5, 7-10 (no W6) | (ii) settled by cp2/library.txt:9 |
| 1401 | bough: W1, W2's banks, W5, W6, W8 | OPEN | none | cp2/library.txt:4 lists branch in all 10 | (ii) cp2/library.txt:4 |
| 1402 | creaky: W1, W5, W6, W8 | OPEN | none | cp2/library.txt:11 crumble/snap in 1, 5, 7-10 | (ii) cp2/library.txt:11 |
| 1403 | crumble slab: W1 (shrine stone), W7; never in the canopy | OPEN | none | Removed from W1 at ES 1450; the row is stale; (b) C22 | (i) acf6e1e8 |
| 1404 | bridge: W1, W5, W6; from 1-1 n8 | OPEN | none | cp2/library.txt:7 lists bridges in 5, 8-10 | (ii) cp2/library.txt:7 |
| 1405-1406 | lily, reed: W1 creeks, W2, W6; only where the water zone draws | MATT | MD:129-130 | | |
| 1409-1411 | Fix 1: no stump kind; planner says which | OPEN | none | | (ii) the planner's library.ts |
| 1412-1413 | Fix 2: crumble fits W1 only by the shrine stones | OPEN | none | Withdrawn at ES 1450; stale | (i) acf6e1e8 |
| 1414-1416 | Fix 3: no ground log resting in the trees | MATT | MD:28 (lily pads on branches), MD:130-131 | | |
| 1417-1419 | Fix 4: the worlds column above; later worlds closed until their pass | OPEN | none | | (ii) none needed: a scheduling call; (i) SR §0c.7 (ccr:93-99) for what each world's pass must decide |
| 1422-1425 | Correction: a floating log in open air allowed in the canopy under the float cap | MATT | MD:129 ("floating logs ... more Mario") | | |

## 22. The ladder against the all-world table (ES 1427-1456)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1429-1431 | Lianas and breaking branches taught in 1-2; "the table is right" | MEASURED | ML rows liana, breaking (first 1-2); d272601f; 6dae405d | | |
| 1432 | 1-5's creaky node becomes an echo | DERIVED | ES 1429 | | |
| 1435-1437 | Trunk climb at 1-1 is the mixer's; re-run main's 1-1 to 1-3 | OPEN | none | Not re-run in any saved output | (ii) moveladder.ts on main's 1-1..1-3 |
| 1439-1440 | Moving platform not taught in a lair (STAGE-RULES §0) | SOURCED | SR §1 Teaching (ccr:109); RM:482 (R-164.9) | The rule is §1, not §0 | |
| 1441 | Taught in 2-7 beside the lift, echoed 2-8 and 2-9 | OPEN | none | | (i) SR §0.4 "moving platforms early (from World 2)" (ccr:25); GVs:17 (moving-platform kinds) |
| 1446-1448 | Taught-at = first lesson card, tip or skill; presence before it is a breach fixed where it appears | SOURCED | SR §1 Teaching (ccr:109) | | |
| 1450-1451 | Shipped acf6e1e8: World 1's breakables use W1's branch art, never W7's slab | MEASURED | acf6e1e8 | | |
| 1453-1456 | 1-5's ground breakable is W1 rotten wood if it exists, else an art gap; theme check names the slab | OPEN | none | | (ii) atlas key search for W1 rotten wood |

## 23. The whole-game plan (ES 1458-1635)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1458 | "the engine plans the WHOLE game"; the lead's five bars | MATT | MD:140-166 (10:08 AM ET, appended to MD after this trace began) | | |
| 1461 | 102 stages, 40 mechanics | MEASURED by an untested tool (D15) | ML (stages 102, 40 rows) | | | **[critic §7, ruled 11-05: 2 layouts, 4-D in no row, gen2 water invisible (critic §3.2)]**
| 1462-1464 | Keep stages, names, specials, rooms, bosses and art; lock a world before changing it | SOURCED; incomplete | 96ac0259 (regression lock); CLAUDE.md "New replaces old" | | | **[critic §7, ruled 11-05: 4-D and 8-4 omitted; the lock covers 1-1 and 1-5 only (critic §4.1)]**
| 1470-1481 | Absences: warm air 63, lift 83, river logs 7 stages / 81, silk 2 / 55, push 4 / 61, breaking 22 / 41, rope 13 / 35, hide 8 / 28, moving 10 / 29, bounce 26 / 13 | MEASURED | ML (stage lists per row) | My recount of ML gives the same stage counts; absences come out 1 higher on 7 rows (e.g. rope 36, breaking 42), so the absence definition is off by one somewhere | |
| 1483-1488 | Working: liana 4, trunk 5, tayra 5, harpy 8, finds 3 | MEASURED | ML | | |
| 1490-1491 | Glide and swim have no row | MEASURED | ML (no glide or swim row) | | |
| 1497-1506 | World places | SOURCED | src/game/biomes.ts:50-99 [main] (comments per world) | | |
| 1497-1506 | World elements, own moves and special stages | MEASURED | ML first-use rows; special stages as the spec lists (not re-opened) | | |
| 1505 | W9 lava only here | MATT | (relayed) e7089072 | | |
| 1509 | Lava only in W9 (Matt) | MATT | (relayed) e7089072 | | |
| 1510 | Webs only in W5 | MEASURED | ML row zone:web (5-6 only) | | |
| 1511 | Swim only in deep water, only from 6-7 | SOURCED | 87f1e2f6 | | |
| 1512 | Before 6-7 water costs a life, "Falling in costs a life" | SOURCED | src/game/lessons.ts:188 [main]; dotLinesData.ts:38 | | |
| 1516-1522 | Core moves: jump, double, bounce, liana, climb, rope, creaky, hide, push, moving platform (after 2-7), glide (after 4-1), swim (after 6-7, water worlds) | OPEN | none | | (i) GV:5 (two verbs + four modifiers), SR §0b.5 |
| 1526-1531 | World moves: river logs W2/W6/W8 ponds; lift W2/W7/W10; warm air W4/W9/W8; silk W5 | OPEN | none | | (i) SR §0c.7 (ccr:93-96) |
| 1535-1548 | Ladder rows: taught, echo stages, "must keep returning" (>= 1 in 3, 1 in 4 for push and hide, >= 2-3 stages for world moves) | OPEN | none | Taught and today's-gap columns are MEASURED (ML); the return rates are judgments | (ii) mechtable.ts on old W1-W4; (iii) per-mechanic recurrence in a shipped 8-world platformer (Rayman Legends, DKC Returns) |
| 1535 | Bounce gap 13 (W3-W4) | MEASURED | ML row mushroom (13, 5-8 to 7-2) | ML says the gap is 5-8 to 7-2, not W3-W4 | |
| 1538 | Breaking gap 41 | MEASURED | ML | | |
| 1539 | Rope gap 35 (W5-W7 get ropes) | MEASURED | ML | | |
| 1541 | Push gap 61 | MEASURED | ML | | |
| 1542 | Hide gap 28 | MEASURED | ML | | |
| 1543 | Moving gap 29 | MEASURED | ML | | |
| 1545 | Warm air gap 63 | MEASURED | ML | | |
| 1547-1548 | Lift 83; river logs 81 | MEASURED | ML | | |
| 1550-1561 | World hazards return only where the element fits; each list | OPEN | none | | (i) SR §0c.7; GV:105 |
| 1558 | Tide in W2 only after 6-4 | MEASURED | ML row zone:tide (first 6-4) | | |
| 1564-1565 | Animals anywhere their element fits | MATT | MD:58-60 | | |
| 1566-1567 | Snapper to W6, spiders stay W5, frogs to W8, boa back in W3-W4 | OPEN | none | ML: boa absent 37 stages (1-9 to 5-6) | (ii) ML spreads; Matt's picks |
| 1570-1571 | W2 on: >= 3 core moves besides run and jump, one from an earlier world | OPEN | none | | (i) SR §0b.5 |
| 1572-1583 | One joined beat per world (list) | SOURCED | SR §0b.5 (ccr:54-55); GV:21-55 (the pair matrix) | The pairs chosen are the designer's | |
| 1587-1588 | A profile names its water bodies (x, y, depth, swim) | MATT | MD:26-27 ("if there's water") | | |
| 1590-1594 | Swims: <= 15-20 s under; exits 3-4 body widths; no slow drag ("suddenly fast"); currents and bubbles; tide | OPEN (misread summary) | GVs:19 (triage row "Water"); RM:160 (R-5.22); MD:141-142, MD:156-159 (Matt: "quick in and out things. We already did the research") | Gemini numbers, not verified against a shipped game | | **[critic §7, ruled 11-05: GVs:19 is a one-line triage of an unsaved paste; "in and out every 15-20 s" is a rhythm, not a cap; body widths are the connector rule (GVs:28)]**
| 1596 | Gate fails over 20 s under | OPEN | GVs:19 | | | **[critic §7, ruled 11-05: the gate cannot fail (diveFor 3 s, swim.ts:43-45); withdrawn until primary texts are saved]**
| 1598-1601 | 6-7 teaches, 6-8/6-9 echo, then W6-W8 and W10 >= 1 in 3; none in W9 | OPEN | none | | (ii) mechtable.ts; Matt's pick |
| 1602-1608 | The swimming stage is 6-9 reshaped (R-153); clue "Ripples..."; 6-8 out | SOURCED | src/components/stageClue.ts:81-82 [main]; RM:410 (R-153: reshape, no new stages) | | |
| 1609-1610 | World 1 to 6-6: water is drawn and costs a life | SOURCED | lessons.ts:188 [main] | | |
| 1614-1618 | Gates 1-5 (untaught, dropped, off-element, mixing, swim) | DERIVED | rows above | | |
| 1619-1620 | Gate 6: today's misses a known list that only shrinks | SOURCED | CLAUDE.md (clipknown / knowncheck); LAWS 5 | | |
| 1626-1629 | Order of the planner's steps | MATT | ST:968 | | |
| 1631-1633 | Designer cost: 1.5 h, 0.5 h, 1 h a world | OPEN | none | | (ii) clock it |
| 1635 | The 55% ceiling (stop at 53%) | MATT | ST:973 (10:10 AM ET) | Lifted at 10:32 AM (MD:186-192, ST:982); ES 1635 is not marked revised; (b) C29 | |


## 24. Added during this trace: every-world labels, the engine's acceptance test, rocks never float (ES 1637-1734)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 1637-1648 | The element table must cover every world's kinds (W2 river logs, lifts, bank houses ... W10 towers, netting) | MATT | MD:152-155 (whole-game element plan) | | |
| 1649-1651 | Revises "the object pass is done world by world, later" | MATT | MD:140-147 ("It can't just be looking at level one") | Revises ES 1385-1387, marked | |
| 1652-1653 | Hanging moves are core: vine, liana, rope, bough underside; trunks are anchors | OPEN | none | D:1201 (hang-under "the most sloth move there is") is the closest source | (i) D:1174-1186, D:1201 (hang-under MoveDef); (iii) DKC Returns grass-ceiling sections (D:1201) |
| 1654-1655 | Float default "some, <= 25%" until a world's row says otherwise | OPEN | none | as ES 1364-1365 | (ii) float share on old 1-1; (iii) Super Mario Bros. 1-1 floating-block share |
| 1659-1660 | "we use 1-1 and then 1-2 as the test ... the engine gets fixed" | MATT | MD:171-173 | | |
| 1666 | 1-5 hand-mix: 5.2 h wall, 28 commits, 9 fix rounds, all engine code | MEASURED | 78da6ddb (05:47 UTC) to b7c38491 (10:57 UTC) = 5 h 10 min | 28 commits and 9 rounds are from the planner's message (not saved); my count of "Mixer" commits in the range is 25 | |
| 1667 | 1-1 grey-box about 3.75 h, never finished | MEASURED | 98f2decb .. 72fe81a3 commit times (planner's message) | Not re-counted | |
| 1668 | Team spend 0.63% of the week an hour | DERIVED | ST:965 (39% at 12:40 AM) and the lead's 45% at about 10:05 AM | Lead corrected to about 0.9%/h active (ES 1700-1701) | |
| 1669 | 1-5's 5.2 h cost about 3.3% | DERIVED | 5.2 h x 0.63 | | |
| 1670 | 8% left under Matt's 53% stop | MATT | ST:973, ST:980 | Withdrawn at ES 1705 | |
| 1671 | Engine's remaining steps about 6.5% | OPEN | none | Planner's estimate | (ii) the meter after each step |
| 1677 | Line 1: (8 - 6.5) / 1 stage <= 1.5% | DERIVED | ES 1670-1671 | Withdrawn at ES 1705 | |
| 1678 | Line 2: <= 1/3 of 1-5's hand-mix: <= 1.7 h, <= about 1.1% | OPEN | none | The 1/3 is the designer's "clearly faster"; R-163 asks for "about an hour" (RM:473) | (i) RM:473 (about 1 hour a stage, Matt 11-04); D:1043 (target under an hour of helper time) |
| 1683 | Time <= 1.7 h wall from "1-1 data written" to all gates green | DERIVED | ES 1678 (5.2 / 3) | | |
| 1684 | Cost <= about 1.1% | DERIVED | ES 1669 (3.3 / 3) | At 0.9%/h this is about 1.2 h (ES 1700-1701) | |
| 1685 | <= 2 fix rounds, each data-only | OPEN | none | Matt: "still needs a lot of pieces fixed" (MD:172) gives no number | (ii) compare with 1-5's 9 rounds (planner's count); (iii) a shipped data-driven pipeline's iteration count (Sure Footing, D:431) |
| 1686-1687 | No engine change for 1-1; else the engine is fixed and 1-1 rebuilt as a second attempt | MATT | MD:172-173, MD:179-182 | | |
| 1689 | Every gate green on 16/16 rolls both settings | SOURCED | ES 261 | | |
| 1690 | Stills P-1 to P-13, S-1 to S-9, 6 places both ways, designer then lead | SOURCED | LAWS 1-2; ES 914-922 | | |
| 1691 | "No stage id in the mixer core" (library-check.ts, 2afed23b) | MATT | MD:181 ("a check: no stage id in the mixer core") | Built in 2afed23b | |
| 1693-1695 | 1-2 does not fit under 53% | DERIVED | ES 1670-1678 | Withdrawn at ES 1705 | |
| 1697-1698 | The stump is drawing only, never a landing; 1-1 core bank and log (+ branch n8-n11) | MEASURED | planner's answer to fix 1 (ES 1409-1411); not in a saved output | | |
| 1700-1701 | Active team rate about 0.9%/h | DERIVED | the lead's correction (0.63%/h included 6-9 AM with every helper stopped, ST:966) | | |
| 1702 | Both lines kept; judged on whichever fails first | OPEN | none | | (ii) report both after the run; no research needed |
| 1703 | 1-1 clock starts after the critic rulings (due 1:30 PM); Matt chose option A | MATT | ST:980 | Option A was later reversed (ST:982) | |
| 1704 | Matt lifted the token ceiling: "It takes what it takes today... done right" | MATT | MD:186-192; ST:982 | | |
| 1705-1706 | Line 1 and "1-2 doesn't fit" withdrawn; line 2, the fix rule, 0 engine changes and every gate stay for 1-1 and 1-2 | MATT | MD:192-193 ("the 1-1 pass line's cost line stays as an engine-quality measure") | | |
| 1707-1714 | Order: inventory, critic, rulings, step 6, E3-E5, 1-1 timed, 1-2 timed | MATT | MD:190-192; ST:982 | | |
| 1716-1722 | Rocks never float; replaces every earlier stone/slab float line (9:58 ruling, 9:59 labels, W7 crumble) | MATT | MD:197-199 [ccr a42689e6] ("Rocks can't float... A platform needs platforms") | ES 1352-1356, 1369-1371, 1399, 1403 are marked superseded inline (2f3d6aac) | |
| 1725-1727 | May float = NO for every rock, stone, boulder, slab, crumbling stone ledge, mound, bank and earth piece; P-2 back in force | MATT | MD:200-201 [ccr a42689e6] | | |
| 1728-1729 | May float = yes only for platform pieces (logs, planks, boughs), under the float cap | MATT | MD:198-199, MD:201 [ccr a42689e6] | | |
| 1730 | Interim swaps are stones on a bank or the ground, never over open air or a pit | MATT | MD:200-201 [ccr a42689e6] | | |
| 1731-1733 | Other worlds' stone kinds (W7 slabs, columns, floors; W8 karst; W9 heat rock; W3 cave ledges) are no-float; stone over a gap stands on a drawn column | DERIVED | MD:200 applied to the kinds listed at ES 1639-1647 | | |
| 1734 | The E3 support check fails a no-float kind with nothing solid under it | MATT | MD:201-202 [ccr a42689e6] | | |

---

## (a) Research rows the spec never applies

"Applied" means the spec states the rule or a rule that does the same job, even in another form. Rows the source itself decided
against (status NO, or the ledger's "not taken") are listed in their own block so nothing is missed, but they are not counted as gaps.
Purely descriptive rows (history, definitions, restatements) are counted, not listed one by one.

### a1. GEMINI-LEDGER.md (56 rows)

Applied (fully or in part): A1, A2, A3 (part: each stage's "moment", no per-world signature stage), A4, A5 (part: decks, no sub-blocks),
A6 (part), C1, C4 (part: no twice in a row, no 2-level cooldown), C9, D1, D3, E1 (part), E2, E3, E4, F1 (part), F2 (part: the dial),
F3, F5 (part: the 300 ms Easy window only), F7 (part), G8, H1, H2, H3 (part: morning / dusk per stage), H4, I3 (part: the profile).
Decided against by the ledger: B1, I1 (shuffling), J1, J5.

| Row | Line | Recommendation | Why it matters to the engine |
|---|---|---|---|
| A7 | GL:20 | Linked pairs: no tool without its receptor in the same or next chunk | Push block and puzzle beats return in CP4 with no pairing rule |
| B2 | GL:27 | Build in memory; no mid-play create/destroy; pooling | Mixer output size per stage is not checked against PERFORMANCE-RULES |
| C2 | GL:34 | Poisson spacing: min gap between same-kind pieces, max gap with nothing | The spec has per-view caps, not spacing |
| C3 | GL:35 | Sockets with 3 variants each (81 a room) | No socket layer in ideas |
| C5 | GL:37 | Expressive range over 200-1,000 rolls; D_sim >= 0.35 between rolls | **The spec never requires two rolls of a stage to differ** |
| C6 | GL:38 | Weighted action strings | Not used by any gate |
| C7 | GL:39 | 3-gram cosine and 18-beat windows across stages | Neighbour check is idea share only |
| C8 | GL:40 | Horizontal mirroring | Cheap variety, unused |
| C10 | GL:42 | Offline seed curation | Replaced on purpose by "never a reroll" (MATT); listed for completeness |
| D2 | GL:49 | Per-difficulty jump margins 65% Easy / 82% Normal of max | The dial goes to 0.92 / 0.80 of the level check's limit (b) C20 |
| D4 | GL:51 | Puzzles as symbolic zones | Push-block room in CP4 |
| D5 | GL:52 | Softlock guarantee: a lost item respawns at its source | The pushed log returns in CP4 with no softlock rule |
| D6 | GL:53 | Sockets bound to a platform id + t | Marks and petals are placed by the mixer's own rules |
| F4 | GL:71 | Touch failure modes in the bot (drift, late lift-off, 8% short hops) | Not named as a gate input |
| F5 (rest) | GL:72 | Peak stress per burst 2.5 / 5.5; puzzle depth; backtracking 1.0-1.25 / 1.15-1.6 | Only the window floor is used |
| F6 | GL:73 | Kids' hints under 8-12 words; stuck = back-and-forth or 2 tries; 3-tier hints | Dot lines placed per node with no length rule |
| G1-G7 | GL:80-86 | Coyote, buffer, ledge forgiveness, mantle, magnet, 30 fps stability, re-centring slider | Engine feel, not level rules; the spec's reach comes from the level check, which uses them |
| I2 | GL:103 | The 6-pass pipeline | The mixer has its own passes; no mapping written |
| J2-J4 | GL:111-113 | Camera lean, 500 x 750 px puzzle box, pan to a far gate | Puzzle rooms return in CP4 with no camera rule |

### a2. GEMINI-PCG-RESEARCH.md items outside the ledger rows

| Line | Recommendation | Why it matters |
|---|---|---|
| GP:219 | 35-50 small chunks per world, 3-5 sockets each | No library-size target per world |
| GP:251-252 | 28-35 templates a world; 8 tiny obstacle sub-blocks per world | Same |
| GP:276 | D_sim < 0.35 rejection against any earlier stage of the world | No cross-stage similarity number (R3 W7 says it has no source) |
| GP:339-355 | Edge risk scores U_dist, U_land, U_time | The dial sets risk with no per-jump score |
| GP:370-372 | Peak consecutive stress, puzzle depth, backtracking ratio | Unused |
| GP:396 | Vertical corridor clamp Y in [-800, +1200] px | Arc field has bands but no clamp |
| GP:323 | Source and receptor within 8 tiles on Ki chunks | Puzzle rooms |
| GP:333-336 | Three visual sub-acts per world | Part: light per stage only |

### a3. GEMINI-VARIETY (triage rows and the full report)

| Row | Line | Recommendation | Why it matters |
|---|---|---|---|
| Pacing tags | GVs:14 | Tight / Flowing / Relaxed / Cerebral; never two Tight back to back | Jobs exist, but no "never two hard nodes in a row" rule |
| Puzzle share | GVs:15 | About 25-30% of beats are puzzle beats | No puzzle share anywhere |
| Moving-platform kinds | GVs:17 | Pendulum, ride-to-start, pulley, turning log, bobbing float | Ladder teaches "moving platform" as one move |
| Lift momentum | GVs:18 | Platform speed carries into the jump (R-152.7) | Needed before moving platforms go "everywhere" |
| Stage types | GVs:20 | Reshape 2-3 stages a world (MATT DECIDED, RM:404-410) | Profile has no stage-type field |
| Tempo inversion | GV:7; SR §0b.3 (ccr:49-50) | Each mechanic a hurry and a patience version | `pace` field is a word, not a pair |
| Branch sub-types | GV:13; SR §0b.4 (ccr:51-52) | Snap twig ~0.15 s, creaking limb ~0.6 s, tipping root | Dial crumble values ignore them (b) C3 |
| Ten slot roles | GV:73-99; SR §0b.6 (ccr:56-59) | X-1 arrival ... X-9 run-up; neighbours never share tempo and camera direction | Under review in SR; the spec does not rule on it |
| Wayside lines | GV:67 | Under 15 words a box | No length rule for Dot lines |
| Checkpoint cadence | GV:165 | Respawn within 2 s of the hard part | Contradicted by the 45 s rule (b) C10 |
| Read by shape | GV:177; SR §0b.7 (ccr:60-62) | Breakables share a notched underside and a 2-frame shake | Only "a floating piece carries its own underside" |

### a4. R1-R4 findings

| Note | Line | Finding | Why it matters |
|---|---|---|---|
| R1 L3 | R1:48 | Pool several times the slots, counted per phase after the teaching cut (SMBF about 10:1) | No pool-to-slot count per stage |
| R1 L6 | R1:74 | One named surprise per stage, unique, with Wonder's three tests | 1-1 has a "moment"; no uniqueness or test |
| R1 L9 | R1:90 | Fairness also from the hero's rescue tools | Unused |
| R1 L10 | R1:95 | Build a world's first stage last; re-grade early stages | 1-1 is built second (Matt chose it, ST:967) |
| R1 idea 2 | R1:514 | Save-wide ledger of shown units | Unused |
| R1 idea 3 | R1:517 | `rare` (~5%) and `notBefore` tags | Unused |
| R1 idea 4 | R1:519 | Five-value atomic parameters; subtractive variety; the variety matrix | Unused |
| R1 idea 6 | R1:524 | An open grade board, re-graded after later stages | Unused |
| R1 idea 7 | R1:527 | Shovel Knight's level budget (5 new enemies + 5 objects; "no unitaskers"; cooldown list) | Unused |
| R1 idea 8 | R1:531 | Skill carried by level objects (one-thumb game) | Unused |
| R1 idea 9 | R1:533 | Ratings from play, not the author | Dial values are authored |
| R1 mistake 2 | R1:546 | Never re-roll when the player dies (layoutMemory) | The spec never says when a new roll is drawn |
| R1 mistake 3 | R1:548 | Mismatched difficulty at joins | Joins checked for geometry only |
| R2 L5 | R2:72 | A mechanic must be required, not just present | Teach nodes have no "cannot be skipped" gate |
| R2 L7 | R2:87 | Stability under edits | Unused |
| R2 idea 1 | R2:654 | Kinds per take-off K in the space, M in the roll | Only stage-level kind counts |
| R2 idea 3 | R2:663 | Limited-agent gate on every teach node | Used only for hard collectibles (ES 311) |
| R2 idea 4 | R2:671 | Measure the candidate space per node | Unused |
| R2 idea 5 | R2:680 | Same as last time, relax if impossible | Unused |
| R2 idea 6 | R2:684 | Cadence kinds at seams | Joins are "a short kit piece" only |
| R2 idea 7 | R2:689 | Quality-diversity; generate for the empty cell | Unused |
| R2 idea 8 | R2:694 | NCD of kind strings across a world | Feel check named, not measured |
| R2 idea 10 | R2:700 | A jump's difficulty as its landing window | Unused |
| R2 idea 12 | R2:707 | Take-offs on the tune's onsets | Matt ruled the rhythm is the player's (ST:958): decided against |
| R3 F2 | R3:51 | Teach >= 0.97, first test ~0.85 / 0.92, practice >= 0.95 | Only teach <= 0.01 miss used |
| R3 F3 | R3:66 | Population layer: who quits here | Unused |
| R3 F4-F5 | R3:88, :103 | Leniency, linearity (form b) | Unused |
| R3 F6 | R3:114 | ERA sd >= 0.05 over 200 rolls per stage | Unused (16 rolls only) |
| R3 F7 | R3:125 | NCD calibrated 0.09-0.62; between rolls >= 0.35; novelty band | Unused |
| R3 F8 | R3:148 | Gap entropy | Unused |
| R3 F9 | R3:158 | Stuck share <= 0.05 Easy, <= 0.10 Normal | Bots stall 13-20 s at forks (cp3/cp3-stuck.out), no gate |
| R3 F11 | R3:183 | Flow as above the stage's own average | Unused |
| R3 F12 | R3:195 | nPVI per rhythm type (regular < 20, swing 45-75) | Rhythm types named (ES 1121), not measured |
| R3 F13 | R3:205 | Relative rest boundary (2x local median and >= 1.0 / 2.0 s) | The spec uses fixed pads and "a 2-second rest" (b) C2 |
| R3 F16-F17 | R3:244, :255 | Glicko-2 stage rating; knob elasticities | The dial has no measured slope |
| R3 W5 | R3:300 | Easy can be harder than Normal on the bots | No "Easy never harder" check |
| R3 W6 | R3:305 | Adult bot sigma 45 ms, not 30 | E[lives] and "bots 4/4" rest on the 30 ms thumb |
| R3 W12 | R3:337 | 1-1 has 2 distinct strings in 16 rolls | Same gap as GL C5 |
| R3 W13 | R3:342 | The two bots disagree on what is hard | E[lives] uses one bot |
| R3 ideas 2-9, 12, 13 | R3:597-617 | (as F2-F17 above) | |
| R4 L5 | R4:76 | The level gives the move, not the thumb | Unused |
| R4 L7 / idea 4 | R4:98, :559 | Calibrate bots on the touch recordings before trusting them | **The dial's E[lives] budget is judged by uncalibrated bots** |
| R4 idea 1 (b) | R4:547 | Fail when a palette option is laid 0 times in 16 rolls | Dead ideas or sizes would pass |
| R4 idea 5 | R4:563 | Touch rules pinned in each stage's manifest | Unused |
| R4 idea 7 | R4:570 | One RNG stream per node and layer | Unused in the spec text |
| R4 idea 8 | R4:574 | Same ground, second goal, said plainly | Part: second fork road as replay reward |
| R4 idea 10 | R4:580 | Flaky-gate policy | Unused |
| R4 idea 11 | R4:583 | A readable stage catalog diffed in CI | Part: 96ac0259 fingerprints (hashes, not readable text) |

### a5. LEDGER-ENGINE-GEMINI.md (E1-E249; the F1-F70 formula rows repeat the same GE lines)

Applied: E1-E3, E6, E15, E16, E18, E20, E22, E36, E42, E43 (part), E44, E45 (part), E47 (part: three scales, but "half" not 42%),
E48, E51, E54, E60, E77, E80, E102-E103 (the formula's form), E105 (part), E106, E108 (part), E122, E124, E136, E145, E187, E189, E196 (part).
Decided against or flagged wrong by the ledger: E4, E9, E12, E23-E25, E38, E41, E46, E50, E55, E57, E59, E62, E75, E78, E86, E88,
E97, E112, E127, E137-E139, E149, E152, E171, E176-E184, E186, E193, E195, E197, E213-E220, E235, E237. Restatement rows: E27-E35,
E67-E74. Descriptive, "have", "keep ours" or worked-example rows: E8, E10, E11, E19, E61, E66, E76, E82, E89-E96, E98, E123,
E129-E131, E153, E161-E168, E173, E175, E185, E198, E203, E249.

| Rows | Lines (GE) | Recommendation | Why it matters |
|---|---|---|---|
| E5, E21, E109, E116 | 11, 29, 186, 203 | Pairwise threat cap: an enemy on a jump's landing is super-additive; eagle never over breakables | **The dial adds risky pieces and animals with no adjacency rule** |
| E7, E37, E39, E191 | 13, 61, 463 | Map shapes (loop, high-low split, chimney, hub) as node boxes with entry/exit vectors | `arc` field only; no loops or chimneys |
| E13-E14, E17 | 19, 21 | Hazard budget by distance; memorised geometry when only enemies vary | Unused |
| E26, E199-E202 | 31, 489 | Local auto-heal before failing | The spec fails and names the hole instead (MATT's rule); heal rules unconsidered |
| E40, E154, E192 | 61, 294, 465 | Deck lockout 4 draws | The spec locks out 1 (no twice in a row) |
| E49, E52 | 63, 69 | Split closure: both roads' Σdx, Σdy equal at the merge | Forks rejoin with no closure rule |
| E53, E125-E126 | 69, 217-219 | No repeated 3-move runs; bigram entropy >= 0.68 | Unused |
| E56, E58 | 73 | Flow-ribbon representation; seam welding | Unused |
| E63-E64 | 79 | Hazards in call-and-response with the jump | Unused |
| E65, E205 | 81, 497 | Inscribed safe sightline box (both orientations) | Only the glint is checked both ways |
| E79, E81 | 113, 117 | Groups 6-10 s, rests 1.5-2.2 s; one puzzle of 12-18 s in node 4 or 6 | Unused |
| E83-E84 | 119-123 | First-timer time model (x1.22, +25 s branches) | Unused |
| E85, E87 | 127-129 | Fatigue above 1.6 inputs a second; density shape T^1.15 | Unused |
| E99-E101 | 161-165 | Off-apex second flick in the clumsy thumb; early-press margins | Unused |
| E104 | 171 | Landing width from hitbox + early press + buffer(1-T) | The dial's landings are authored |
| E107, E110, E111 | 182-190 | Snake deck >= 5 W, cat runway >= 8 W, spider above ropes | Animal ideas parked; no footprint numbers |
| E113-E115, E117 | 197-203 | Enemies a minute by world; spacing; 1 s runway before a trigger | "Taught animals a stage" has no spacing |
| E118-E121 | 207-211 | Goal 75%, 70/15/15, yield 0.85 | Marks goal set by hand (10 of 13) |
| E128 | 225 | Similarity buffer under the cap | Unused |
| E132-E135 | 237 | A miss always costs something; three miss tiers by tension | Contradicted on Easy (b) C5 |
| E140-E144, E146 | 251-253 | Flow score parts (curve fidelity, beat alignment, variety, vertical, agency) | Unused |
| E147, E157, E169-E170, E172 | 257, 307, 330-363 | Beat-relative patterns; max slope 28°; miss-floor field per step | Unused |
| E148, E211-E212 | 261, 505 | Frame-harmonic tempos | Unused (rhythm now the player's) |
| E150-E151 | 269-282 | Gust mutator; creak delay 36 / 20 frames | Dial crumble values differ (b) C3 |
| E155-E160 | 300-312 | Spec fields mapShape, pair, puzzle node index, cause-effect flags | Part: profile fields |
| E174, E190 | 377, 461 | Seed sub-streams so enemy edits never move platforms | Unused in the spec |
| E188 | 454 | Modules under 150 lines, two files in context | Unused |
| E194 | 469 | Decorator: roles, arcs, 3 seeds, 3-tier floors | Part |
| E204, E206-E210 | 497-501 | Look-ahead both ways; camera anchors; gesture cooldown 267 ms; thumb zones | Unused |
| E221-E223 | 529 | Earbud lag; asymmetric late window; visual beat pulse | Unused |
| E224-E225 | 533 | Inverse velocity-threat law (slow zones never empty) | Unused; matters when mud, silk and water arrive |
| E226-E227 | 537 | Contain cause-and-effect to bonus spots | Unused |
| E228-E230 | 541 | 7,000-10,000 px stage; mount nodes i-1..i+1; <= 3 draw calls a node | Mixer 1-5 is about 45,000 px (cp3/cp3-forks.txt:4) |
| E231-E248 | 549-582 | Plan targets (yield, similarity, rest, flow, tokens per stage) | Unused |

### a6. LEDGER-ENGINE-PAPERS.md (rows 1-83; Carmo and Tanagra)

Applied: rows 11 (part), 20, 27, 28, 32 (part), 33, 36, 41, 43, 49, 52, 53, 58, 63, 74, 77, 83 (the FDG paper was fetched, D:38). Decided
against: 17, 19 (not tonight), 42 (keep ours), 78. Descriptive or evidence only: 1-10, 12-16, 18, 21-26, 29-30, 34, 37-38, 40, 44-45, 47,
50-51, 54-55, 57, 60-61, 64, 66-67, 70-73, 75-76, 79, 82.

| Row | Line | Recommendation | Why it matters |
|---|---|---|---|
| 31 | CA:712-746 | **Coverage table gate**: every (height x height x difficulty) combination needs a piece | No coverage table of idea x join x job |
| 35 | CA:808-818 | A piece may declare several entry heights | Unused |
| 39 | CA:861-875 | Vary where a stage's building starts | Unused |
| 46, 48 | CA:1022-1073 | Piece-use spread over 200 rolls; report dead and hog pieces | Share cap catches hogs, nothing catches dead pieces |
| 56 | CA:1211-1218 | Generate new pieces, then compose | Unused |
| 59 | CA:1240-1255 | A gate may only err toward failing | Not stated for the mixer's gates |
| 62 | CA:1278-1396 | Sorenson & Pasquier's challenge (anxiety) model | Unused |
| 65, 81 | TA:113 | Pinned nodes and local retrace | Unused |
| 68 | TA:113 | The designer changes pacing without touching geometry | Profile `pace` is a word; no edit-the-rhythm path |
| 69 | TA:113 | Constraint search guarantees playability as it places | The mixer places by rule and checks after |
| 80 | TA:113 | Error-steered search | Unused |

### a7. GEMINI-CRITICAL-AGENTS / its ledger (process, not level rules)

Applied: designer / planner split with both signing (ST:963); machines check what machines can (LCA:28-30, GC:119).
Not applied (LCA:84-117): blind the designer; premortem critic in parallel personas; a falsifier on every objection; VERIFICATION_PASSED
allowed; one round then a "still disagreed" table; consistency-illusion check; the lead's 5-minute spot check; the lead's sketch is
not a judge. **The spec's stage workflow (ES 1026-1034) has no critic step at all**, though the critic role exists (engine-critic).

### a8. Count of unused rows

| Source | Rows or items | Applied (full or part) | Decided against | Descriptive / restated / "have" | Unused |
|---|---|---|---|---|---|
| GEMINI-LEDGER | 56 | 26 | 4 | 0 | 26 (A7, B2, C2, C3, C5, C6, C7, C8, C10, D2, D4, D5, D6, F4, F6, G1-G7, I2, J2, J3, J4) |
| GEMINI-PCG items outside the ledger | 8 | 0 | 0 | 0 | 8 |
| GEMINI-VARIETY (10 triage rows + 12 report items) | 22 | 7 | 2 | 2 (engine-feel items GV:15, GV:17) | 11 |
| R1-R4 findings (R1 34, R2 20, R3 44, R4 19) | 117 | 56 | 1 | 10 (R3 ideas that repeat its F rows) | 50 |
| LEDGER-ENGINE-GEMINI (E rows) | 249 | 33 | 50 | 53 | 113 |
| LEDGER-ENGINE-PAPERS | 83 | 17 | 4 | 49 | 13 |
| CRITICAL-AGENTS (LCA §0 changes + §2 checks) | 15 | 2 | 0 | 0 | 13 |
| **Total** | **550** | **141** | **61** | **114** | **234** |

The R1-R4 split counts the lessons, ideas, mistakes, formula rows and "wrong" rows (R2's §4 experiment findings are measurements, folded
into its lessons). LEDGER-ENGINE-GEMINI's ledger marks many of its unused rows "consider", not "adopt"; they are counted because the
spec neither applies nor rejects them.

---

## (b) Contradictions

| # | Spec line(s) | The spec says | Against | Kind |
|---|---|---|---|---|
| C1 | ES 640, 658 | Gap share is a difficulty dial (0.55 -> 0.92 Normal) | D:48, D:180-187: "[11-05 overturned] γ is not a difficulty dial" (traced jumps carry almost no risk; difficulty is the landing window and what sits on the avoided lines); R4:28 (L1). D:275-277 also called a 0.55 start "tighter than anything QA has played" (on clumsy reach) | Research row |
| C2 | ES 799, 509, 815 | Fixed Normal pad of 1.0-1.2 s after every second burst; "a 2-second rest" on Easy | D:49, D:188-193 and R3:265-271 (W1), R3:205-215 (F13): a fixed pad cuts phrases into single moves; the rest is relative (2x the local median) | Research row |
| C3 | ES 646 vs ES 228, 333 | Dial: crumble Normal 0.9 -> 0.5 s, Easy 1.2 -> 0.8 s; ruling: Easy tile 1.0 s; CP3 sizes "crumble 1.0 s" | Each other (the dial, written later, does not mark the 1.0 s ruling revised); GV:13 and SR §0b.4 (snap ~0.15 s, creak ~0.6 s); LEG E151 (Easy 1.2, Normal 0.67); shipped 0.7 s commonest (cp2/cp2-trace.ts.txt:15) | Later ruling not marked; research row |
| C4 | ES 642 vs ES 468 vs ES 796 | Easy typical landing 260 -> 150 px; then 220 -> 150 px; then about 300 px (EASY_BS 1.35) | Each other; none marks the earlier revised | Later ruling not marked |
| C5 | ES 437 | Easy: a slip off the high road costs nothing | D:194-195 ("Easy one tier softer, never 'nothing' after the first teach"); LEG E132 (C_miss > 0) | Research row |
| C6 | ES 237-244 | "No idea twice" withdrawn; old 1-1 repeats its cycle about 8 times | SR §0c.2 (ccr:79-80): "no template more than twice in a stage"; R1:39 (L2) and R1:550 (mistake 4); SR not marked revised | Shipped rule doc |
| C7 | ES 122-134 | One shared library across worlds; World 5 the only exception | MD:127-130 (10:00 AM, later than the 12:20 words the ruling rests on): "It can't just be using any piece from any world... They have to look like they belong in that world"; SR §0c.7 (ccr:93-99) "a template belongs to one world"; D:412 (Dead Cells: rooms never shared between biomes). ES 1382-1387 (per-world tagging) reconciles in part but 122-134 is not marked revised | Later Matt direction |
| C8 | ES 939-940, 965, 1014 | 1-1's backdrop changes with height; "deeper canopy as he climbs" | RM:475 (R-164.2), Matt 2026-11-04: "on level 1-1, let's not have the sky change. It's weird. I'd rather just have one sky." | Matt direction |
| C9 | ES 342, 520-521, 739, 942, 1020, 1288-1289 | Creaky taught at 1-5 n2; lianas belong to 1-6 | ES 1429-1433 ruling (1-2 teaches both), shipped d272601f ("1-2 owns the lianas") and 6dae405d ("1-2 teaches crumbling"), ML first-use rows. The ruling does not edit the teach-order table or the earlier lines; BR:43 also still says lianas 1-6 | Later ruling not marked; shipped decision |
| C10 | ES 300, 303 | Replay after a loss up to about 45 s | SR §0b.8 (ccr:64-65) "respawn within about 2 s of the hard part"; GV:165 | Shipped rule doc / research |
| C11 | ES 516-519, 522 | Fork share 30-40%; two forks with 3 crossings; checkpoints "before n6 and n10 only" | ES 424-425 and 431 withdrew all three earlier (1:35 AM); the 2:45 AM "meets by construction" block re-states them | Later ruling contradicted by a still-later block |
| C12 | ES 297-298 | Never a checkpoint before a rest node | SR §0b.2 (ccr:48): checkpoints sit ON the rests before parts 3 and 4 | Shipped rule doc (wording) |
| C13 | ES 394, 396-399 | ">= 4 of every 5 landings step up or down, as the old 1-1 does (171 of 202)" | The gate's line is 0.949 (cp3/lines.py:12; cp3/CP3-CHECKPOINT.md:21); 171/202 = 0.847 (cp1/table2.txt:2). Two measures of one number | Measurement |
| C14 | ES 41, 133-134, 235-236, 989, 1098 | Neighbours share <= half their ideas or pieces | LEG E47 / E127 (cross-stage Jaccard <= 42%); SR §0c.4 (ccr:83-84: no template in more than 3 of a world's stages) | Research / rule doc |
| C15 | ES 11, 59, 97, 268, 1104, 1112 | 8% ceiling as Matt's; total 4.5-6.2% | ST:962, ST:964 (8% is the lead's proposal); CP3 cost 2-3% so far (cp3/CP3-CHECKPOINT.md:89) plus round 2 (cp3/CP3-ROUND2.md:82; ST:966: 5-6%, "over the 2-4% Matt allowed"). The spec's estimates are not updated | Measurement / record |
| C16 | ES 644 | E[lives] Normal 0.5 -> 3.0, Easy 0.2 -> 1.0, citing "DESIGNER §2.3" | D:200 and R3:42-44: Normal World 1 <= 1.0 rising about 0.5 a world (World 10 about 5.5), Easy <= 0.3 | Misread source |
| C17 | ES 631-632 | "a new world's first stage starts at the previous world's middle ... STAGE-RULES §1b's rule" | SR §1b (ccr:131-148) says bands climb and may overlap "a little, never by a whole world"; GP:100 says the first stage "drops slightly below the end of the previous world". The dial overlaps neighbours by half a world | Misread source |
| C18 | ES 797 vs ES 888-892 | "this line is not loosened" (Easy <= 0.55); then the line becomes "no denser than the old 1-1's Easy range" | SR §2 Pacing (ccr:173) Easy 0.35-0.55; Matt's yes on the change is not recorded (ST:966 says "designer accepted") | Later ruling loosens a written line |
| C19 | ES 414-417 | Easy hearts and flags left as the engine's Easy pass lays them (15-33 a stage, several in the first 30 s) | MD:77-79 ("hearts aren't given out the very first thing"), which the spec itself says holds on both settings | Matt direction (named, deferred) |
| C20 | ES 640 | Gap share up to 0.92 Normal / 0.80 Easy of the level check's limit | GL D2, GP:75-76: required jumps under 82% Normal / 65% Easy of max. Different denominators (the level check may already hold a margin), so this needs one check, not a ruling | Research row (to check) |
| C21 | ES 648 vs ES 1181 | Bursts a node 2 at d = 0 | 1-1 (d = 0) lays 3 bursts in n2-n7; ES 1230 asks any override to state its reason in the `difficulty` field, which ES 1181 does not | Internal |
| C22 | ES 1403, 1412-1413 | W1 piece label: crumble slab in W1 by the shrine stones | ES 1450 (acf6e1e8: never World 7's slab in World 1) marks the 9:56 and 9:58 rulings revised but not the 9:59 label table | Later ruling not marked |
| C23 | ES 1397, 1400-1402, 1404 | Worlds per kind (log W1-W4, W6; mushroom W1, W3, W6; bough W1, W2, W5, W6, W8; creaky W1, W5, W6, W8; bridge W1, W5, W6) | cp2/library.txt:2-11 (logs in all 10 worlds; mushrooms in 1, 3-5, 7-10; branches in all 10; crumble in 1, 5, 7-10; bridges in 5, 8-10). The spec says it rules ahead of each world's pass (ES 1417-1419) but does not note that it narrows what ships today | Measurement |
| C24 | ES 32, 92 | Mix floor = old 1-1's 5 piece kinds | MD:7 ("a huge set of platforms to pick from"); SR §1c (ccr:156-158: >= 14 section types a world, >= 5 themes a stage); CLAUDE.md "more pieces ... never barely squeak past". The mixed 1-5 lays 11 kinds (cp3/cp3-lines.txt), so the floor is not binding, but the written line is the "barely squeak past" kind | Matt direction (weak floor) |
| C25 | ES 1026-1034 | Stage loop: lead brief, designer, planner, lead check, Matt | LCA:20-31 (designer, planner and a premortem critic, in separate passes) and the critic role already used (engine-critic) | Research row |
| C26 | ES 1435-1437, 1287 | Trunk climb taught at 1-4 | ML row trunk (first 1-1, on the mixer branch); the re-run on main's 1-1..1-3 was asked for and is not recorded | Open measurement |
| C27 | ES 37 (and splits everywhere) | Split rule: road continues across <= 180 px gaps, heights >= 120 px apart | cp3/split180.py:11 also requires a stretch over 300 px, which the spec never states; a rule the gate applies that the spec doesn't say | Spec vs tool |
| C28 | ES 1077 vs ES 333, 909 | 1-1 at "at least 20% under 1-5's median of about 4:05" | 1-5's own target was about 150 s (ES 333-334), accepted at 4:00-4:12 (ES 909); 1-1's band is set from a 1-5 that is far over its own plan | Internal (worth naming) |
| C29 | ES 1635 | "against the 55% ceiling (stop at 53%)" | MD:186-192 and ST:982: Matt lifted the ceiling at 10:32 AM; ES 1704-1706 records it but ES 1635 is not marked revised | Later Matt direction, not marked |
| C30 | ES 1678, 1683-1685 | 1-1's pass line is one third of 1-5's hand-mix (<= 1.7 h, then about 1.2 h at 0.9%/h) | RM:473 (R-163: "Stages built from a spec in about an hour") and ES 267 / 1103 (<= 1 hour a stage after the mixer exists): three time lines for one stage | Internal |
| C31 | ES 1198-1199 | The bootprint picture list: "The lead approves the spend; Matt approves the list" | MD:204-207 [ccr a42689e6] (10:42 AM): "If anything needs a Hugging Face approval, you approve it" for the engine: the lead approves, Matt is told. Not marked revised | Later Matt direction, not marked |

---

## Summary count per tag

Counted over every table row in sections 1-24 above (one tag per row), after the citation check.

| Tag | Rows | Share |
|---|---|---|
| MEASURED | 152 | 24% |
| SOURCED | 152 | 24% |
| MATT | 136 | 22% |
| DERIVED | 26 | 4% |
| OPEN | 161 | 26% |
| **Total** | **627** | |

- Of the MATT rows, 5 are "(relayed)": a commit or note credits Matt but his words are not saved anywhere I could open.
- Every OPEN row carries a "how to settle" path: (i) a ledger or Gemini row, (ii) a run on our code, or (iii) a primary-source search.
  Most OPEN rows can be settled by a run (ii) on tools we already have (cp1 measures, cp2-trace.ts, split180.py, mechtable.ts,
  moveladder.ts, the first-timer bot); the ones that need (iii) are the dial's slopes, the move ladder's return rates, the float caps
  and the stage-length spread.
- Lists: (a) 234 research rows or items unused (a8); (b) 31 contradictions.

## Citation errors inside ENGINE-SPEC (noted here; ENGINE-SPEC not edited)

| ES | The spec cites | What the source holds | Correct citation |
|---|---|---|---|
| 333 | "the shipped size ranges on the CP2 sheet (p10-p90 widths per kind, `cp2/library.txt`)" | cp2/library.txt has counts, size names and worlds per kind, no widths | `cp2/sheet.html` (the "Pieces" table: short / typical / long px per kind, e.g. log 107 / 317 / 882) |
| 558-559 | log bands "short about 110 px, mid about 320 px, long about 880 px: the shipped spread, `cp2/library.txt`" | as above | `cp2/sheet.html` (log 107 / 317 / 882) |
| 631-632 | "That is STAGE-RULES §1b's rule that a new world eases in" | SR §1b (ccr:131-148) has no such rule | none: the start-at-the-middle rule is the dial's own (DERIVED from ES 628); see (b) C17 |
| 644 | E[lives] dial notes "DESIGNER §2.3" | D:200 gives Normal W1 <= 1.0 rising about 0.5 a world, Easy <= 0.3 | D:200 for the World 1 values only; the d = 1 values are the designer's; see (b) C16 |
| 1439 | "STAGE-RULES §0: taught in a safe spot before it can hurt" | that rule is §1 Teaching | SR §1 (ccr:109) |
| all §0c cites (via the planner's tools) | STAGE-RULES §0c | the engine-spec branch's STAGE-RULES.md predates §0c | read SR on ccr (ccr:72-99) |

## Citation check (method and result)

Script: `/tmp/claude-0/-home-user-Sloths-Adventure-/ae911ee5-4c11-5de9-a62f-5a201b1932ff/scratchpad/tools/citecheck.py`, with
`.../scratchpad/tools/eslabel.py` for the first-column spec lines. For every `file:line` (or short name `X:n`) it resolves the file
(working tree, or `git show <pinned commit>:<path>`), prints the cited line(s) and checks that a number or key word from the row sits on
exactly those lines (no slack). Heuristic misses were then read by eye one by one.

| | Count |
|---|---|
| file:line citations checked | 861 |
| first-column spec-line labels checked | 627 |
| **Total checked** | **1,488** |
| Lines matched by the script | 548 citations, 603 labels |
| Script misses read by eye and found right (paraphrase, not a word match) | 313 citations, 24 labels |
| **Fixed to the exact line** | **62** (25 wrong line numbers, 7 of them in rows added in this pass; 6 pinned to engine-mixer 7d9ad9a9 because that branch moved; 16 quoted or bare citations made explicit or removed; 15 spec-line labels off by one or two) |
| **Downgraded to OPEN** | **1** (ES 790-792: the D:1037 cite was about something else) |

## Sources that should be fetched next (not fetched in this pass)

- Super Mario Bros. 1-1 and Mario Wonder course layouts, for the float share (ES 1363-1365) and the stage-length spread (ES 667).
- Hayashida's GDC 2012 talk on Super Mario 3D Land (re-use spacing of a mechanic: the echo and "must keep returning" lines).
- Shovel Knight's design deep dive (2020) for its "on cooldown" list and per-level budget (R1:527).
- Rayman Legends / DKC Returns world maps for how often a mechanic recurs across worlds (ES 1535-1548).
- The full Polymorph paper (Jennings-Teats et al.) for the pairwise adjacency numbers behind LEG E21 / E116.
- Isaksen et al. FDG 2015 for a phone-touch timing spread, before the dial's risk numbers rest on a browser tap test.

## Method update (LAWS 4)

- What worked: reading the planner's commit messages first. Most measured numbers in the spec are only in commit bodies, not in a saved
  output file; the register names the commit where no file exists.
- What failed: the spec cites `cp2/library.txt` for widths it does not hold (they are in `cp2/sheet.html`), and the engine-spec copy of
  STAGE-RULES has no §0c. A trace must read the ccr copy.
- The exact edit for `reference/methods/` (the designer's call): "Every new number in ENGINE-SPEC carries its tag and cite in the same
  line, and a ruling that changes an earlier number edits or strikes the earlier line in the same commit."

## Correction from the critic's deep pass (§10c, 11-05 ~11:22 AM ET)

- The R2 notes credit "14 different kinds of geometry for jumps" to Launchpad (2011; R2:524, :644). The source is **Smith et al. 2009**
  (rhythm-based level generation, FDG 2009; saved at reference/research/critic-2026-11-05/smith-2009-rhythm-based-fdg.md), and its own
  Fig. 13 says **13** jump types. Any row of this trace that uses that number is to be read that way.
- Smith 2009 §5 ("Rhythm groups can optionally be repeated before this rest area") is the source for the revised ES 391: one exact
  repeat of a group, right before a rest.
- Smith 2009's abstract ("that which the player feels with his hands") is a source for ES 1120 (the player's rhythm, not the song).
- ES 1429-1433 (lianas and creaky taught in 1-2) was **MEASURED on an unshipped branch**. On main, creaky is taught in 1-5 and lianas in
  1-6. Ruling reversed (ENGINE-SPEC, "The critic's deep pass ruled", #4).
