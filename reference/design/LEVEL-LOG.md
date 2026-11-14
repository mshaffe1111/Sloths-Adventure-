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
| IDEAS-1-6 C (Opus xhigh) | 1-6 idea list + tributes (Pitfall!, Jungle Hunt, DK Jr., DKC); found R-165.204 | $3.49 | ~12 min; network blocked page fetches (search results only) |
| D16 (Opus xhigh) | 1-6 design (59 lines) + grip measurement (R-165.204) | $3.71 | ~13 min; tributes a-d x4 (Pitfall!, DK Jr., DKC, Jungle Hunt); 6 NEW blocks named |
| IDEAS-1-7-8 A (Opus medium) | 1-7 + 1-8 idea lists + tributes; 4 engine-study findings | $1.74 | ~6 min |
| INT-3 (Opus xhigh) | merged 7 branches; vault patch; drawcheck root (stripInk, every stage lighter); R-165.201; tower flight sim root; 1-4 flown/judged; 8 gates PASS | $24.03 | ~1 h 50 min; its background gate script died at its stop (D59) |
| IDEAS-1-7-8 B (Opus high) | 1-7 + 1-8 idea lists + tributes; 6 engine findings (two hide rules disagree) | $2.17 | ~7 min |
| INT-4 (Opus xhigh) | 1-4 bot split: every stuck kind a bot limit, fixed in tools/inspect; 1-4 castBots 22 -> 176/360 | $8.37 | ~27 min; gates not reached (40% line) |
| IDEAS-1-7-8 C (Opus xhigh) | 1-7 + 1-8 idea lists + tributes; 5 engine findings (seesStill eagle, chase liana fairness) | unreadable | 16 min; the lead archived it before it went idle (its own rule), so its cost was lost: about $2-4 by its siblings |
| VARIETY-2 (Opus max) | proved VARIETY's item 1 (all gates); found W1 floor.unmarked root = the painter's single ground line (ruler job packet ready); '_' vs V19 named; found R-165.207 (buildcheck at budget on main) | $16.13 | ~1 h 35 min |
| D17-18 (Opus xhigh) | 1-7 + 1-8 designs (60 lines each) + combined NEW table (28 blocks, 1-6..1-8); re-tuned to DIFFICULTY §4 | $6.85 | ~37 min |
| ENGINE-STUDY-678 (Opus xhigh) | one engine plan for 1-6..1-8: 24 verified blocks, waves, 16 packets in 2 lanes, estimates, one art batch list | $5.74 | ~15 min |
| GATES-4 (Opus high, runner) | the unrun gates on tonight's build + 24 stills; 2 reds named, nothing fixed | $3.08 | ~60 min |
| FIX-INT (Opus xhigh) | 3 unit reds at the root (w1Marks null guard; vine test re-pointed; W1 length band per 2 lead rulings); every gate green on t-int-5@e8afc05c | $7.09 | ~50 min |
| PERF-BUILD (Opus xhigh) | 1-1 stage-start build: cold reach memo filled in one pass; buildcheck 5/5 PASS (worst margin 22 ms); exact (lock 102/102) | >= $2.85 (meter reset by an OOM container restart; true cost higher, unreadable) | ~70 min |
| POLISH-1 (Opus high) | 1-4: crown sure vine (planted), +2 beats & 2 rests (re-rolled once, 100/100), bubbles -> painted tufts, bots 176 -> 242/360; found the fig gate root and the crumble strand | $10.03 | ~75 min |
| FEEL-VINE (Opus xhigh) | vine grab/vault/step/catch: drawn-only settle (on-screen jerk 40-50 px -> 4-10), 7 planted tests, real-page clip recorder, method feel-fix.md; camera handed to FEEL-CAM | ~$9.92+ (meter after a container restart) | ~90 min |
| POLISH-2 (Opus high) | Matt's fig gate (lid from below, 1-2's bramble, lock pop, lock sound; 6 tests), tufts v2, log end, stills for the lead | $12.39 | ~70 min |
| FEEL-CAM (Opus xhigh) | camera re-pick eases on vine grab/leap/exit (jerk 17.5->2.6 etc.), cuts stay cuts, planted tests, real-page measurer | $7.16 | ~60 min |
| INT-6 (Opus xhigh) | merged perf-build + polish-2 + feel-vine; full gates GREEN f9671e3b; castBots climb floor reads STAGE-RULES:77; 1-4 length tried (fork strands bots: held) | $13.02 | ~70 min |
| KEEPER-098 (Opus high) | approved 0.9.8 lines: 4 approved, 3 replaced; flagged petals-on-limbs (R-165.218) | $0.74 | ~5 min |
| TRIAGE-MATT (Opus medium) | 43 open Matt-reported rows checked vs code: 27 still true, 8 fixed, 4 moot, 4 need a run; ranked 1-1/1-4 list | $3.84 | ~12 min |
| ENG-INT5 (Opus xhigh) | engine base t-eng-base: feel-cam + castBots climb floor + t-pieces + t-nodes on 0.9.8; every gate green; lock unchanged | $6.92 | ~57 min |
| RULER (Opus max) | per-gap pit ruler + 5 planted tests; found 1-1 earthless holes (R-165.221) and its own 1-2 log bug; held until 1-1 lays | $17.52 | ~70 min |
| HOOKS (Opus xhigh) | StagePiece + one engine loop (RIDE moved on), one letter table for nodeCode/nodeAsks/NODE-KEY; every gate green | $11.51 | ~85 min |
| REL-098 (Opus xhigh) | 0.9.8 release: full gates, #ctest -> 1-5, PR #71 (merged 73e7bed0; APK v0.9.8-40, pages 199 green) | $10.11 | ~150 min incl. waiting on Matt |
| POLISH-3 (Opus high) | 1-1 holes + 1-4 length/rough spots; stopped NOT GREEN at t-polish-3@a9d6b1bc (unit2 w1.relay: holes under the route need a typed Drop) | $11.99 | ~100 min |
| ART-678 (Opus high) | HF batch for 1-6..1-8 + W1 underlayer + living posts: 24 stills + 12 harpy edits + 4 perch-feet; 25 cuts; HF \$1.88 (~\$0.075/piece); 5 cut FAILS handed over | $9.19 + HF $1.88 | ~50 min |
| ENG-B1 (Opus xhigh) | chase piece (ChasePiece, forks, Easy row, toFlag) on 1-2/2-1 test beds, 16/16 tests, chase drawn only by its drawer; all gates green 17dc0fbe; stills FAILED (front off frame, hand-mixed scene), redo handed over | $11.47 | ~70 min |
| POLISH-4 (Opus high) | typed hole Drop (no roll moved, proved), t-ruler merged, 1-1 relisted (257 kept); found the ruler moves 13 seeds on 1-2/1-3/1-5 and seed-323 red | $3.68 | ~50 min |
| ENG-A1 (Opus xhigh) | W1 liana rows (short/medium/far 471-528 px) on W1+W6 kits, Vine.grip opt-in level check (6 planted), FAR camera measured: upright needs 2.0x for the whole perch; gates green | $14.61 | ~75 min |
| ART-678b (Opus high) | CPU-only: recut.py (halo root cause: maroon outline eaten by the hue key), beaks, drape split, deep underlayer (no walkable lip), live pole + 'support' layer; 26 catalog rows; full suite green | $11.13 (HF $0) | ~50 min |
| FIX-14 (Opus high) | 1-4 measured (pods 620 px/s after a 1 s tell; two hands 1.6x but petals out of reach; GATE.lid on his feet), 2 show-first mocks to Matt, over-the-top repro, bot-route root fix (towerRoute within(), toy test; World 1 unchanged); fork 169->209/360 | $15.23 | ~75 min |
| POLISH-5 (Opus high) | ruler head GREEN (realFalls floor-under; 1-2/1-3/1-5 relists, 1-5 judged by the lead); Matt's 1-1 frame found (layout 17, seed 9800) + 1-1 difficulty table; fix not started | cost not read (the lead archived before IDLE: a repeat miss) | ~95 min |
| ART-MATT (Opus high) | Matt's 3 sheets cut (19 pieces, 4x CPU upscale, sawn log cut off the ties), pods restyled with HF ($0.18) to the bold-line ridged husk; judged PASS; tie ships at ~0.55 Pokey | $8.37 + HF $0.18 | ~35 min |
| ENG-B2 (Opus xhigh) | chase clips PASS (real bare world, front in frame); long-branch sheet load fix (planted); tint C4 failed upright twice (2-gradient limit: bake next); gates partial at the 2:25 deadline | $17.43 | ~80 min |
| FIX-14b (Opus high) | 1-4 to Matt's mocks: fig head-stop (drawn top) + skip probe, Matt's ties/thatch, two vines 1.6x with petals between, pod tell as the lit vine, flag rim (pool gone), figPush bot fix; every check GREEN on adae2f3d | $18.47 | ~100 min |
| POLISH-6 (Opus high) | stones settled in the lay + w1Overhang gate (Matt's case, seed 9652); 1-1 relist; bounce-teach root cause (bank 209-214 px, plain bounce 42 px short); buildcheck red (settle cost) | $11.14 | ~90 min |
| ENG-S1 (Opus xhigh) | Matt's swing cap: SWING_SEEN 414 px per press (drawn pose kept in view), camera ease + lead with a real-engine 3-phone test, FAR 407-426 / Easy as LONG, 1-6.md revised; all gates green | $20.00 | ~95 min |
| POLISH-7 (Opus high) | settle perf fix (buildcheck 127); bounce teach a plain bounce; 14 doubles cut; stone-stair X test; relist 169/257; castBots Easy 10/10 both; unit suite red on 17 moved pins (handed to POLISH-8) | $15.29 | ~85 min |
| ENG-S2 (Opus xhigh) | PieceHost letGo; vine snake (3 routes, 0.5 s tell floor, green by evidence D65); false liana (brown); engine.ts:2056 off-liana catch fix; found the sideways tell out of view; all gates green | $13.49 | ~75 min |
| FIX-14c (Opus high) | 80 px vine-top rule + lay test; towerJoin foot-vine root fix; 1-4 data; 3 relists; suite 3303/0; castBots WORSE on Easy child/middle: HELD | $13.75 | ~100 min |
| POLISH-8 (Opus high) | Normal teach rise 129-131 (own row, planted); relist 167/169; showed options (A) and (B) each break a rule; calibration recommitted | $7.05 | ~45 min |
| FIX-14d (Opus high) | turn run-on + rotting-dip hidden edge: kid 1-4 N 19->39, E 35->40; like-for-like mostly better; tower tests red (11): paused | $7.99 | ~25 min |
| ENG-S3 (Opus xhigh) | PieceHost.focus + focusY, gen2 snakeViewFaults, false-liana landing clear of him (unit-proven); real page still 0/6 (level-top root cause): paused | $8.33 | ~25 min |
| POLISH-9 (Opus high) | found the 1-1 Normal 'rescue' was a BOT artifact (inputGrace 0.35 s vs stopReact 0.30 s): firsttimer.ts fix, adult 4/10 -> 10/10: paused | $2.86 | ~10 min |
| INT-7 (Opus xhigh) | merged t-polish-5 + t-fix-14b on main (polish-5's tree + main's 8 files; provenIndex conflict by both sides' intent); all 5 lists --check PASS; fast gates green; full Checks + stills UNRUN: paused | $3.94 | ~12 min |
