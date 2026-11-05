# SPEC-TRACE: where every number and rule in ENGINE-SPEC.md comes from

Source register for `reference/engine/ENGINE-SPEC.md` as it stands on `engine-spec` (1,635 lines, last commit 7f4373c0). Written
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
| w1mix | `src/game/mixer/w1mix.ts` [origin/engine-mixer] |

Commit hashes are on `origin/engine-mixer` (planner) or `origin/engine-spec` unless named.

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
| 123-125 | One shared library; World 5 the exception | MATT | MD:66-70 | Later Matt words (MD:127-130) narrow it; see (b) C7 | |
| 126-127 | Library = every piece and idea in any world, tagged by worlds | MATT | MD:66-70 | | |
| 128-129 | A world's own new ideas lead; others fill in | OPEN | none | | (i) SR §0c.7 (ccr:93-99): a world owns its pieces; R4:577 (themed pools per stage) |
| 130-132 | Coherence per idea and per join, one art family per join | MATT | MD:76-79 ("they should all fit together") | | |
| 133-134 | Variety gate counts the whole library; neighbours <= half their ideas | OPEN | none | Same "half" as ES 41 | (i) LEG E47/E127 (42%) |
| 138-140 | An animal, once taught, may appear anywhere later | MATT | MD:58-60 | | |
| 139-140 | An animal counts as a move on the ladder (harder form, absent <= 2 stages) | OPEN | none | Matt said "anywhere", not "must return within 2" | Same as ES 113-116 |
| 141-142 | Unused art feeds the library | MATT | MD:61-64 | | |
| 147 | 273 unused pieces | MEASURED | b461499b (tools/art/artuse.mjs, IN-GAME-UNUSED.md) | | |
| 148-149 | Dressing stays dressing; boss frames stay with bosses | OPEN | none | | (i) SR §4 "use ALL the art" (ccr: §4) allows any place; Matt to rule per item |
| 154-172 | 17 unused-art ideas and their "exists?" column | MEASURED | cp2/mechanics-exist.md:10-31 (7 yes, 9 adapt, 1 new) | The table is the designer's; the verdicts are the planner's code check | |
| 174-175 | Unused animal frames give a second behaviour, the "harder form" | OPEN | none | | (iii) search for shipped games that give each enemy a second behaviour later (e.g. Rayman Origins enemy variants, DKC Returns) |
| 181 | Easy: no rise over +40 px onto a landing under 220 px | MEASURED | cp2/cp2-trace-easy.out (flicks 246-281 ms at +50..+70); cp2/cp2-trace-easyfix.out (+40: 298-386 ms) | The 220 px threshold itself is not traced | (220 px part) (ii) cp2-trace.ts at +50/+70 onto 160/220/280 px landings |
| 182 | A landing after +40 is >= 110 px | OPEN | none | Not in the trace outputs | (ii) cp2-trace.ts: Easy +40 onto 90/110/130 px landings |
| 183 | +50 to +70 only onto >= 220 px | OPEN | none | Not traced | (ii) as ES 181 |
| 183-184 | Rise >= +30 has a gap <= 80 px (90 px gives a 298 ms flick) | MEASURED | cp2/cp2-trace-easyfix.out (+35/90 px: 298 ms), cp2/cp2-trace-yes4.out (bridge +30/90: 298 ms); d5c44600, ccfa8f06 | | |
| 183 | Easy floor 300 ms | SOURCED | GL F5 (W_min >= 300 ms Easy); SR §1b (ccr:140) | | |
| 184 | Easy bough stair 250 px in 7 steps | MEASURED | cp2/cp2-trace-easyfix.out (7 steps: 40+40+35+35+35+35+30 = 250) | | |
| 186 | Bough stair flicks 246-281 ms against 300 | MEASURED | cp2/cp2-trace-easy.out lines 3-6 | | |
| 191 | Logs 9,095 of about 19,000 placed pieces | MEASURED | cp2/library.txt:2 (sum of rows 19,651) | | |
| 192 | Moving platforms appear 17 times | MEASURED | cp2/library.txt:14 | | |
| 193 | Drifting logs and lily pads only in World 2 | MEASURED | cp2/library.txt:10, :12 | | |
| 194 | 24 of 90 stages have no animal | MEASURED | cp2/enemies.txt:13 | | |
| 196-197 | Spread first: moving/drifting platforms, lilies, mushrooms, taught animals | DERIVED | cp2/library.txt; cp2/enemies.txt | | |
| 201-206 | 7 on the sheet, 9 small builds, 1 parked | MEASURED | cp2/mechanics-exist.md:31 | The spec's 7 "on the sheet" list differs from the planner's 7 "yes" (spec adds updraft, drops reed isles' "art only"?): both list reed isles, updraft, crumbling ledge, behind the falls, push block, scaffold, bridge span: same 7 | |
| 204-205 | Matt picks which small builds to make | MATT | MD:21-23 (designer has full say is MD:17; build picks are Matt's per LD:18) | | |
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
| 242 | No idea over the old 1-1's top share (about 40%) | MEASURED | cp2/idea-tags.out (41%) | | |
| 243 | Every repeat is a new kind x size ("new in the last 6") | SOURCED | SR §0c.3 (ccr:81-82) | "last 6" is the planner's window (8c8cd997), not sourced | |
| 244 | A stage has >= 4 ideas | OPEN | none | Old 1-1 has 6 ideas (cp2/idea-tags.out) | (ii) count ideas in old 1-1 and 1-3 rolls; (i) Shovel Knight 5 new enemies + 5 new objects a level (R1:527) |
| 246-247 | Today's 1-1, 1-2, 1-4, 1-5 fail: one idea 54-76% | MEASURED | cp2/idea-tags.out (76, 54, 58; 1-5 alternation) | | |
| 248 | A stage that teaches opens with the idea that teaches it | SOURCED | GP:315 (slot-1 override) | | |
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
| 333-334 | Target about 150 s skilled | SOURCED | D:210 (target 150 s, SR:36-38 old); LEG E77 (120-150 s) | Accepted later at 4:00-4:12 (ES 909) | |
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
| 366-367 | Doubles allowed on 1-5 only through EARLY_DOUBLE | SOURCED | src/game/levelCheck.ts:118-120 [engine-mixer] (EARLY_DOUBLE = 1-1, 1-4; doubles from stage 6) | | |
| 369 | Gaps sized by the level check's own functions (jumpOK, heldMaxGap) | SOURCED | R4:551 (idea 2, one reach predicate); ES 1137 P4 | | |
| 371-374 | n9 seed as a code-drawn glint; visible both ways; real seed with the glide | MATT | CLAUDE.md Polish rule ("a sparkle ... fine") | | |
| 375-377 | Push block out of n9 (the level check never moves a pushed log) | MEASURED | f735c4fc / 39f8ef63 (planner's build finding) | | |
| 378 | Fork roads keep their own height band | OPEN | none | | (i) LEG E52 split closure |
| 383 | 11 one-idea nodes give 88-101 s against 120 s | MEASURED | bce0572a / 78da6ddb (fast 125-154 s after bursts); 88-101 s in the designer's ruling only | No output file for 88-101 s | |
| 385-388 | 22 same piece in a row vs 9; new every 1,002 px vs 572; 4,103 px flat vs 1,351; about a third of the ups and downs | MEASURED | old 1-1 side: cp1/table2.txt:2; stretched-1-5 side: no file kept | Only the old 1-1 numbers have a saved output | |
| 390-391 | (a) A node lays 2-3 bursts of 4-6 pieces | OPEN | none | | (i) SR §0b.1 (5-20 s rhythm groups); R3 F12 (Launchpad group lengths 5/10/15/20 s); (ii) old 1-1 idea stretch lengths (cp2/idea-tags.json) |
| 391-392 | Bursts alternate ideas; never the same burst twice in a stage | SOURCED | SR §0c.2 (ccr:80); R1:39 (L2 no unit repeats in a level) | | |
| 392-393 | Teach pairs with bank hops; rest is one short walk | OPEN | none | | (ii) fun-gate dead time on n2 |
| 393 | (c) Kind or size band changes at least every 2 pieces | OPEN | none | Old 1-1 runKS median 7 (cp1/table2.txt:2) is far looser | (ii) old 1-1 kind x size run lengths (cp1 measures2.json) |
| 394 | >= 4 of 5 landings step up or down (old 1-1: 171 of 202) | MEASURED | cp1/table2.txt:2 (up 91 + down 80 of 202 = 0.847) | The gate uses 0.949 (cp3/lines.py:12, cp3/CP3-CHECKPOINT.md:21); see (b) C13 | |
| 396-399 | Pass lines: run <= 9, kind x size <= 7, new <= 572 px, never > 1,516 px, flat <= 1,351, ups+downs >= old 1-1 | MEASURED | cp1/table2.txt:2; cp3/lines.py:10-14 | | |
| 400 | Fast clock >= 120 s | MATT | CLAUDE.md "stages take at least 2 minutes"; MD:45-47 | | |
| 401 | Easy adds flags and hearts after the mixer (16 and 16) | MEASURED | cp1/table2.txt:4 (rebuilt 1-1 Easy: hearts 24 / 1-5 Easy 33); 16/16 not in a saved file | | |
| 406 | Splits: old 1-1 34 (14-51), today's 1-3 19 | MEASURED | cp3/cp3-splits.txt:1, :3 | | |
| 406-407 | New 1-5 with two long forks: 2-3 | MEASURED | cp1/table2.txt (1-5 splits 0); 2-3 not in a saved file | | |
| 408-410 | Canopy over floor as a burst any node may lay, 2-5 pieces, never twice in a row | OPEN | none | | (ii) idea-tags.json stretch lengths of old 1-1's fork |
| 411 | Pass >= 19 splits on 16/16; 34 the target | MEASURED | cp3/cp3-splits.txt:1, :3 | | |
| 414 | Old 1-1 Easy has 15 hearts and 15 flags | MEASURED | cp1/table2.txt:3 (hearts 15, checkpoints 15) | | |
| 416 | "hearts aren't given out the very first thing" holds on both settings | MATT | MD:77 | Deferred to after CP4; see (b) C19 | |
| 421-423 | Canopy over another idea's floor; share counts the floor; 40% cap stays | MEASURED | cp3/CP3-CHECKPOINT.md:26, :61-69 (canopy 59-65% under the old rule) | | |
| 424-425 | Two roads side by side >= 40% (old 1-1 61%) | MEASURED | cp3/cp3-lines.txt:21 (old 1-1 median 0.61) | 40% itself is the designer's line, below the measured 61% | |
| 425 | Planned 30-40% for the forks withdrawn | MEASURED | cp3/cp3-forks.txt:1 (forks 10.6-13.4%) | Re-stated at ES 516; see (b) C11 | |
| 426 | LV-9: at most 4,000 px between flags | SOURCED | src/game/easyMode.ts:256, :263 [engine-mixer] (FLAG_SPAN_MAX 4000, capFlagSpans) | | |
| 427-429 | Flag at the nearest safe spot before the next hard node; never over easy ground only; never on a rest without a hard node after | MATT | MD:79-80, MD:84 | | |
| 432-433 | Mushroom off the floor's lane; adult bot loops 7-11 must go to 0 | MEASURED | cp3/CP3-CHECKPOINT.md:40 (stuck 7-11 times a run) | | |
| 435-436 | Normal: a slip off the high road may cost a heart; E[lives] 0.7 at d = 0.09 | DERIVED | ES 644 dial (0.5 + 2.5 x 0.0909 = 0.73) | | |
| 437 | Easy: roads within 400 px (under LONG_FALL), a slip costs nothing | SOURCED | src/game/engine.ts:232 [engine-mixer] (LONG_FALL = 400) | "Costs nothing" conflicts with D:194-195 and LEG E132; see (b) C5 | |
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
| 471 | 1-4 and 1-6 sit >= 20% either side of 1-5's median | OPEN | none | | as ES 667 |
| 476-477 | Splits fell to 11-17, two-road 33-38% (map v2) | MEASURED | 9da17a27 ("Splits now 11-17") | 33-38% not in a saved file | |
| 478-483 | A floor idea joins each one-idea or climbing deck (n3, n6, n7, n9; n8 reeds pair a floor) | OPEN | none | | (ii) already re-measured: 8c8cd997 (splits 25-26, two-road 46-50%) |
| 486-487 | All lines stay: splits >= 19, two-road >= 40%, creaky >= 15% top 3, old 1-1's variety lines | MEASURED | as ES 396-411, 424 | | |
| 492-494 | Cleared: repeats 5 -> 0, Normal too sparse (0.74 a second), Easy tension flat | MEASURED | 9da17a27 fun-gate run (designer's ruling text) | No saved fun-gate output | |
| 496-498 | Easy too busy 0.76 vs 0.35-0.55; Easy longest run 92 s vs 6-8 s; 3.2 s dead on n2's 900 px bank | MEASURED | fun gate on 9da17a27 (designer's text) | No saved output; the "6-8 s" is GP:292 (Easy group length) | |
| 500-502 | A second rest node n7b after the drop; Shovel Knight ramp-and-cool | SOURCED | R1:60-67 (L4); D:452 | | |
| 503 | Easy: a 2-3 s breather pad between every node | SOURCED | GP:293 (Easy rest 2.0-2.5 s); SR §2 Pacing (ccr:173) | | |
| 504-505 | Easy bursts one piece shorter (3-5) | SOURCED | R3:272-284 (W2: Easy asks fewer moves, not wider gaps); D:263-265 | | |
| 506 | n2 teach bank 900 -> 600 px | OPEN | none | Built as 720 px (ES 738) | (ii) fun-gate dead time at 600/720 px |
| 508 | Easy 0.35-0.55 actions a second | SOURCED | GP:290; SR §2 Pacing (ccr:173); GL E3 | | |
| 509 | No Easy run over 20 s without a 2-second rest | SOURCED | SR §0b.1 (5-20 s groups, ccr:43); R3:205-215 (F13: rest >= 2.0 s Easy) | F13's rest is also relative (2x the local median), which the spec drops | |
| 510 | No dead time over 2.5 s | SOURCED | R3:325-328 (W10: code DEAD_WALK = 2.5, core.ts:153) | SR §2 says 2.0/3.0 s (ccr:173) and about 4 s (ccr:171) | |
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
| 533-534 | Each is its own CP; Matt picks the order | MATT | LD:18 / ST:967 (Matt chooses the order of work) | | |
| 534 | No Hugging Face spend (already painted) | MATT | CLAUDE.md HF rule ($72 total) | | |
| 538-545 | Eight ideas and their estimates (0.1-2% each) | OPEN | none | Estimates | (ii) the meter on the first one built |
| 547-548 | Backdrops and clip alternates are dressing and story | OPEN | none | | (i) SR §4 Use ALL the art (ccr:218) |
| 551-552 | First pick: "Which log bites?", because logs are about half of every piece | MEASURED | cp2/library.txt:2 (9,095 of 19,651 = 46%) | | |
| 553 | Second: mangrove roots | OPEN | none | | Matt's pick |

## 9. The log family (ES 556-590)

| ES | Rule or number | Tag | Citation | Note | How to settle (OPEN) |
|---|---|---|---|---|---|
| 556 | Matt: "more logs? different log sizes? different types of feel?" | MATT | (relayed) MD:52-54 ("It's not just logs, it's anything that will add to the platform type experience") | The quoted question itself is not saved | |
| 558-559 | Three size bands: short about 110, mid about 320, long about 880 px | MEASURED | cp2/sheet.html (log 107 / 317 / 882) | Spec cites cp2/library.txt, which has no widths | |
| 559-560 | The mix counts kind x size | SOURCED | SR §0c.3 (ccr:81-82) | | |
| 564 | Solid log everywhere | MEASURED | cp2/library.txt:2 (worlds 1-10) | | |
| 565 | Drifting log: World 2 only, 302 placed | MEASURED | cp2/library.txt:10 | | |
| 566 | Pushed log room; wrap 30-45 min | SOURCED | cp2/mechanics-exist.md:24 (w1Sections.ts:101) | 30-45 min is the planner's estimate | |
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
| 642 | Never under 90 px | SOURCED | D:179 (BT minimum 90 px); LEG E105 (MIN_LEDGE 90, BT:175) | | |
| 643 | Risky pieces a burst: Normal 0-1 -> 3-4, Easy 0 -> 2 | OPEN | none | | (i) R4:555 idea 3 (node expected falls: intro 0, spike 0.2-0.4, climax 0.3-0.6) |
| 643 | Rests and teach steps hold 0 risky pieces | SOURCED | GP:317 (zero lethal failure); GV:61 (rest areas) | | |
| 644 | E[lives] on a first run: Normal 0.5 -> 3.0, Easy 0.2 -> 1.0 | OPEN | none | Cites D §2.3, which says Normal W1 <= 1.0 rising about 0.5 a world (W10 about 5.5), Easy <= 0.3 (D:200; R3:44); the endpoints differ; see (b) C16 | (i) R3 F1 (R3:44) and D:200; (ii) calibrate bots on touchReplay recordings first (R4:559 idea 4) |
| 645 | Taught animals a stage: Normal 0-1 -> 4-5, Easy 0-1 -> 3 | OPEN | none | Gemini: 3.5-11.35 enemies a minute (LEG E114, GE:199); MR: >= 35% of nodes animal-free (D:207) | (i) LEG E113-E115; (ii) count animals per old W1-W4 stage (cp2/enemies.txt) |
| 646 | Crumble delay: Normal 0.9 -> 0.5 s, Easy 1.2 -> 0.8 s | OPEN | none | Easy 1.2 matches Gemini's 36 frames (LEG E151); Normal 0.9 matches nothing; conflicts with ES 228/333 (Easy 1.0 s); GV:13 snap 0.15 s, creak 0.6 s; shipped tiles 0.85-0.61 s (RM:418); see (b) C3 | (i) LEG E151; SR §0b.4 (ccr:51-52) |
| 647 | Timed windows: Normal x1.0 -> x0.75, Easy x1.15 -> x0.9 of each piece's proven window | OPEN | none | | (i) GL F5 (window floors 167 / 300 ms) as the hard floor; (ii) pressWindow per piece |
| 648 | Bursts a node 2 -> 3 | OPEN | none | 1-1 (d = 0) lays 3 in n2-n7 (ES 1181); see (b) C21 | (ii) length per burst count on the mixer |
| 651-652 | Floors: Normal adult >= 70% W1-5, 50% W6-10; Easy kid >= 85% | SOURCED | SR §1b (ccr:147-148); GP:368; GL F3 | R3 W4 (R3:294) shows these do not bound a stage | |
| 653 | Every teach step at miss chance <= 0.01 | SOURCED | D:1287-1288 (teach <= 0.01 per event, estimate) | R3 F2 gives the teaching beat >= 0.97 success (R3:61-62) | |
| 654 | The placement rules never move with d | MATT | MD:76-86 | | |
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
| 673 | No two neighbours within 20% | OPEN | none | as ES 667-668 | as ES 667-668 |
| 674 | A world's spread >= 2.5 minutes | OPEN | none | | as ES 667 |

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
| 742-745 | Polish order if the budget forces a split | OPEN | none | | lead's call |
| 749-753 | Easy density 0.67 vs 0.35-0.55 not accepted; fixes in order | MEASURED | 34c27751 (0.65), e68b6f4b | | |
| 752-753 | Easy bursts 3 pieces, snap dash 5; rests 4-5 s with a petal arc | OPEN | none | | (i) GP:292-293 (Easy groups 6-8 s, 3-4 actions; rests 2.0-2.5 s) |
| 754 | n7b's Dot line | OPEN | none | New line; SR §1 Story (ccr:118) needs "(new, needs Matt's approval)" | Matt approves the line |
| 759-764 | Round 1 fixed: no grey slab, painted rocks, trunks, posts, x/10 | MEASURED | cp3/stills-v2/; 5a217b85 | | |
| 766-767 | S-1 pit columns still under creek pieces | MEASURED | cp3/stills-v2/ | | |
| 768-769 | S-2 grass blocks about 100 px over water | MEASURED | cp3/stills-v2/ | | |
| 770-771 | S-3 stones on poles read as mushrooms on sticks | MEASURED | cp3/stills-v2/ | | |
| 772-777 | S-4 boughs share a tree (one trunk, 2-3 boughs); no two neighbouring trunks share art or vine wrap; widths vary | OPEN | none | Old 1-1's canopy "hangs from big trees" is the designer's read | (ii) count boughs per trunk on old 1-1 |
| 778-779 | S-5 a tip shows once per stage | SOURCED | SR §1 Dot (ccr:124-127: once per save, 30 s between lines) | SR says once per save, stricter | |
| 781-782 | S-8 Dot's bubble clear of the route ahead (D10) | SOURCED | 3f03680c (the lead's check) | | |
| 783-785 | S-9 a stone in water rises from it; check its bottom at or below the surface | MEASURED | 61085f91 (S-9 check holds 32/32) | | |
| 790-792 | Easy pacing judged over 16 rolls by median and worst | SOURCED | D:1037 / R3 (single-roll noise); ES 790-791 states +-0.03, +-15 s | Noise numbers: no saved output | |
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
| 813 | Kept canopies: fork neighbours and the node after a teach or test | OPEN | none | | (i) GV:69 (portal at the Ten) |
| 814-818 | Easy lines: splits >= 19, density <= 0.55, run <= 20 s, nothing new <= 1,516 px, fast clock < 4:00 | MEASURED | cp3/cp3-splits.txt; cp1/table2.txt:2 (1,516); 4:00 is the designer's (withdrawn ES 831) | | |
| 819 | Easy high-road boughs keep Normal's bands (the road is optional) | OPEN | none | | (i) SR §1b "Easy is gentler, never empty" (ccr:135-137) |
| 820-822 | No breather pads on fork roads | MEASURED | b88f2ea2 (bot stall at the road-end breather) | | |
| 826-829 | (i) Fork marks on the shared ground | MEASURED | 14ff1727 | | |
| 829 | Goal stays 10 of 13 Normal, 8 Easy | OPEN | none | as ES 462 | as ES 462 |
| 830-831 | Easy clock 4:21-4:33 accepted; Matt's 2:00 floor, no cap | MATT | MD:45-47 | 4:21-4:33 measured in b88f2ea2 run | |
| 831-832 | The 20% spread judged on Normal's quick clock | OPEN | none | | as ES 667 |
| 833-834 | S-9: stepping stone <= 50 px above the water; taller ones are stumps | OPEN | none | | (ii) stills |
| 836-838 | Stones stay in 1-5 on ground ("more pieces") | MATT | CLAUDE.md "Variety comes from more pieces" | | |
| 851-852 | 18/18 variety lines; 32/32 level checks; bots 4/4 | MEASURED | 14ff1727 | | |
| 854-857 | Easy density 0.60 calibrated on old 1-1 Easy | MEASURED | cp3/old11-main-pace16.txt | | |
| 861-863 | Deep pits: dark follows the bank faces then fades over about 300 px; to Matt | OPEN | none | | Matt's pick (cp3/pit-fade-choice on ccr) |
| 868-871 | Old 1-1 Easy density median 0.575 (0.53-0.66), longest run 25-119 s; new 1-5 0.61 / 0.63, 17-18 s | MEASURED | cp3/old11-main-pace16.txt (16 rolls); 213cbc4b | | |
| 875 | Double breather adds about a minute (Easy about 5:20) | OPEN | none | Not run | (ii) build it once and clock it |
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
