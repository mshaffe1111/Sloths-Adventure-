# Level log: what each level cost and what it taught (R-165.154; Matt, 2026-11-12 1:43 PM ET)
One row per level when it reaches Matt's test link. Hours = wall-clock from the first design line to "passed the lead's look";
cost = model spend of every helper on it (from get_session usage). "Learned" = the change it made to reference/methods/level.md.
The point: each level should cost less than the one before it at the same bar (LEVEL-BAR.md). If it doesn't, the retro says why.

| Level | Designed by | Built by | Started | Passed | Hours | Cost | Bar score | Learned (rule added or changed) |
|---|---|---|---|---|---|---|---|---|
| 1-3 | Fable (W1C) | W1C, then F13 (Opus max); plumbing P13 | 11-12 10:43 AM | F13 done 11-12 7:03 PM (the link's look pending) | ~8 h 20 m wall clock | F13 $47.03 (1:38-7:03 PM); W1C (Fable) + P13 + ART-W1B to add at the retro | | first version of level.md and LEVEL-BAR.md |
| 1-2 | D12 (Opus max) | D12; plumbing P12S (Opus high), FX (find spot) | 11-12 1:40 PM | 11-12 5:52 PM | 4 h 12 m (design + build + gates) | D12 session $86.18 (1:38-6:36 PM incl. the note + stills; get_session at archive); P12S + FX shares to add at the retro | TBD | the design doc first, then build; caps-only footing (any generator-legal bed is jumpable); thorns as set-back hurt floors |
| 1-4 | D14 (Opus max), from an idea round: A Opus high $0.61, B Opus xhigh $1.13, C Opus max $2.83 | not built: waits for 8 engine pieces (the ascent lay first) + Matt's feel test of the pair | 11-12 6:07 PM (ideas) | design passed the lead's look 11-12 | ideas ~10 min + design 22 min (6:17-6:39 PM) | design so far $11.14 (ideas $4.57 + D14 $6.57) | | C's list helped most (code-checked facts); the brief's phone claim was backwards (sideways is short, upright is narrow): level.md step 1 checks phone claims against engine.ts:1170 and cameraFollow.ts:96 first |

**Blind test 11-12 (Matt's wife, relayed by Matt):** preferred 1-3 (Fable design) over 1-2 (Opus max design): 1-2's mushroom bounce timing felt inconsistent (R-165.174); neither had a favourite moment; neither felt repetitive. Matt rated (Normal, 0-100 meter): 1-1 = 4-5, 1-2 = 2-3, 1-3 = 1. Caveat: one player, and the mechanic (mushrooms) confounds designer vs designer.

**The measure from 11-12 10:03 PM ET (Matt): how many levels per 100% of his weekly usage.** The week after his 11-12 ~10 PM reset is
the first: count levels that reach his test link at the bar, against the usage % he reports.

**Member costs, 11-13 (R-165.184; get_session usage.cost_usd at retire):**
| Member | Job | Cost | What it bought |
|---|---|---|---|
| Critic (session_01FhBbYL2LcFRBpSzwjeZ98U) | cold audit of the new lead's review, 2 rounds | $3.30 | caught 4 real errors in the lead's plan before anyone acted on them |
| ART1 (session_01FhBbYMvThjGLVUA8nE3ZmA) | art, blocked: no Hugging Face access in its session | $2.25 | a plan + handover for ART2; $0 HF. Cause: the HF connector was disconnected (fixed by Matt 10:20 AM) |
| Story keeper, old session (session_019iachLiuwNTAZUBSJWUmR3) | two answers at handover, then retired | ~$6.36 | the open story list; failed 1 of 3 recall questions |
| Architect ENGINE-NEEDS (session_01FhBbYLVSn59vpCSU4ruo6P) | code-checked truth table + ranked bulk engine plan + ADD-LEVEL packet | $10.33 | the engine build order for the rest of the game (reference/plans/ENGINE-NEEDS.md) |
| S1 (session_01FhBbYJXH6JJa93RhTnuDf7) | the meter's inspector fixed (humps read as hops), meter-only scoping, 4 real World 5-7 findings logged (R-165.190) | $17.27 | true difficulty numbers for 1-4/1-5; ran to 41% context after two blockers |
| ART2 (session_01FhBbYLs1YqJxsPupP1Ngk1) | HF: two-hand climb (2 rounds), 1-5 set + redos, 1-4 set, 9 fruit + golden guarana, 1-5 dusk, 25 pieces cut into the inventory | $25.20 (+ ~$4.22 Hugging Face) | most of tonight's painted art; retired at 53% context |
| B14 (session_01FhBbYMrAEyA6NNWrPtAzHo) | 1-4: beat clock, pods, fig gate, vine field onto main, 1-4 arc 12/12 in beat order, old 1-4 deleted, art placed | $52.87 | most of 1-4's engine pieces; ran to 76% context (the lead's 40% watch could not see it: get_session reads 0 while a session runs, D55) |
| ECONOMY designer (session_01FhBbYLiMADVRwZv3e9nCar) | one design for score, stars, basket, hearts, lives, Game Over (research + 420 measured bot runs) | $5.30 | reference/design/ECONOMY.md and 7 ready packets; the economy wave after 0.9.8 |

**Usage (Matt's weekly %, R-165.184/185):** 11-12 ~10 PM reset; 4% at 10:36 PM 11-12; 19% at 12:39 PM 11-13 (5 Opus + 2 Fable members running, plus the lead). Budget to last to Tuesday night: ~0.8% an hour average.
| ADD-LEVEL (session_01FhBbYLJhNRpJErB4SQprjk) | one-step add a level (addlevel.ts, libstage.ts), registrycheck gate (no known list), 1-2's first seed list, every list checked in CI, 1-1 in drawcheck | $10.50 | 1-3's registration replayed in 3 m 32 s (was ~3 h 50 m of P13's plumbing) |
| B14b (session_01FhBbYLTe8DtdSNvac7vGdL) | 1-4: climb2 wired, FA's gate fix in, sealed gates, beat-hazard scoring, 4 fixes to old tests | $11.78 | 1-4 builds 12/12 both settings; meter 2.9 vs 4.5 (tuning next) |
| ART3 (session_01FhBbYM8YCNuvPCoMGxzF2v) | creek hurt-floor tile (tinted), oropendola frames, leafcutter ant, catalog fix | $8.81 (HF day total ~$4.59 of $15) | the last painted pieces for 1-4/1-5; artUse stays red until hero-climb2's wiring (t-b14) merges |
| FA (Fable, session_01FhBbYNtcMTuMaKP1e5JiQ5) | the ascent (tower) lay: storeys, along-the-route flags/hearts, climb camera, gate-bypass verdict; all gates green on c8adc6ba | $40.17 | 1-4's foundation + every future climb; retired at 64% context before its last re-run (the integration gate covers it) |
| PIECES (Fable, session_01FhBbYPJZkaMgp58vyKQ3yN) | STILL, CAST-WORLDS, RIDE as general pieces any world uses | $15.83 | three map-wide pieces (10 + 8 + 11 stages); ZONES/CLOCK-ON wait |
| FIX-B (session_01FhBbYMUNZNCRSqaWMZWoTv) | 0.9.8 play fixes: 1-2 mushroom cadence (R-165.174), old control course deleted (R-165.151), #ctest -> 1-4 as one data value + cards (R-165.157), rocks probe + fix B packet (R-165.122 held) | $19.76 | the release's play fixes; retired at 46% |
| NODES-TRAVEL (Fable, session_01FhBbYLVefj53Qg33YnMJEC) | M1: stages laid leg by leg (right/up/down), node schema (item 10 parser + rules) | (cost not readable when archived) | the node system's first milestone |
| B15 (session_01FhBbYMteKQmarmbYVMoZiN) | 1-5: creaky bough + limb load + marks goal as gen2 pieces, 1-5 in the game (old 1-5 deleted), art placed, marks on her road, bots 200/200, seed list | (cost not readable when archived; ran to ~70% context, compacted once) | most of 1-5; messages 12:01-1:07 reached it late (D57) |
| B15b (session_01FhBbYNL3XRyZYQzJoHckW9) | 1-5: creek hurt floor with ART's tile, big-sign line, seed list 150/150, bots 200/200 | $2.54 | stopped at 16% thinking it was 40% (members can't read their own context; their estimates run high) |
| FIX-A (session_01FhBbYNq8G5jPJKyYLFto3b) | 0.9.8 words + Dot cards (tap to clear, slow fade, 1-1 tap lesson, cut cards return), coach line, bell, snake rename, 1-3 trap teach, About page | $23.26 | 7 fixes proven on the real page; unit suite 3143/0; found R-165.201 (tap vs punch) |
| B14c (session_01FhBbYL2ZzaxtJErxEbEgoy) | 1-4: difficulty to 3.3 (in band), seed list 100/100, stills both settings, testers' still, gates.yml line | $10.82 | found the drawcheck breach (8.01 sideways) |
| NODES-2 (session_01FhBbYL8WSkzk5wH55uTUb3) | node dials honoured-or-failed-by-name, nodeMix test + kill histogram, creature top-up any world; all gates green on b812051a | $15.85 | W1: 43/60 bare node strings lay clean (1 with every ask); top killer floor.unmarked |
| VARIETY (session_01FhBbYLF4aRMBR5NoxbeWGb, Opus max) | item 0 1-4 vine-top: engine vault finder (vineTop.ts, 3,906 cases game-wide); shape/move asks as rules | $21.11 | legs fixture 2->3/60; W1 1/60 (floor.unmarked) |
| IDEAS-1-6 A (Opus medium) | 1-6 idea list + tributes (Pitfall!, DK Jr., DKC) | $1.14 | ~8 min; tributes a-d with sources |
| IDEAS-1-6 B (Opus high) | 1-6 idea list + tributes (Pitfall!, DK Jr., DKC rope level) | $1.24 | ~8 min; new blocks named |
