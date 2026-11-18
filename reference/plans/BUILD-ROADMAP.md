# BUILD-ROADMAP: what gets built, in what order, by whom, for the next 7 days (planner, 11-18 5:20 PM ET by `date`)
Packet: reference/packets/2026-11-18/PLAN-ROADMAP.md (on the lead's branch ccr-ea739a2f-dfcee4). Docs only. Written on t-plan-roadmap from
origin/main 6e7b85f8. Facts carry a file:line or a dated STATE/LEVEL-LOG line; **[unverified]** marks what I could not check.
"STATE" and "LEVEL-LOG" below mean the lead's branch copies (ccr-ea739a2f-dfcee4 @ 3fc7a038), which are ahead of main.

## In plain words (for Matt)

- **Where we are.** World 1 is built on the new level maker except 1-9, which is built and goes on tonight's test link. In World 2, 2-1
  and 2-2 are live on the new maker, 2-4 is built and being finished tonight, and the engine pieces for 2-3 (the little ones who follow
  you) and 2-5 (the stones that bite on four) are already built and waiting. 2-6, 2-7 and 2-8 are fully designed. 2-9 has not been
  pitched yet. 2-10 (Crocus Rex) is the boss fight, already built by hand, and it stays as it is.
- **The plan.** One team keeps the engine a day or two ahead of the level builders, so a builder never sits waiting. The pitchers
  work three levels ahead of the builders. Every job goes to a new helper (your rule from 5:15 PM): no helper builds a level it
  designed, and no helper builds a level that uses an engine piece it made.
- **What has to happen first, in order.** (1) Tomorrow morning, put all of today's finished pieces into one place so every builder
  starts from the same game. (2) Fix the two places where our checking tools don't move Pokey quite the way the real game does, before
  more levels get proven on them. (3) Pitch 2-9. (4) Build the water wheel (2-6) and the mail boat (2-7), then the flood (2-8), which
  needs both the followers and the run back to the left.
- **When.** My best guess is that all of World 2 is on your test link between **Tuesday 11-24 and Friday 11-27**. 2-5 and 2-3 should
  come first, around Friday and Saturday. Your test link gets new levels about every evening. A release goes out only when you say
  "push".
- **The biggest risks.** Our test bots keep turning up their own bugs in the middle of builds. A check can push level data toward the
  wrong answer. Code-drawn blocks can slip in where painted art should be. Helpers misjudge how much room they have left. Section 6
  gives the fix for each one.
- **Your calls coming up.** (a) The little faces in the top bar for 2-3. The mock-up was shown to you at 3:27 PM (STATE:1502), and I
  could not find your answer **[unverified]**. (b) Whether the hidden stage (The Rapids) waits until after the nine World 2 levels. I
  recommend that it waits.

## 1. Where we are: every stage 1-1..2-10 and 3-1..3-3

Live = on origin/main (which the live site deploys). "gen2" = the new level maker (STAGE_TABLE, src/game/gen2/worlds/stageTable.ts:34-62
has rows 1-1..1-8, 2-1, 2-2 only). Hand-built World 2 = src/game/w2Stages.ts:32-39 (W2_STAGES '2-3'..'2-9').

| Stage | Status | Branch / doc | What blocks it |
|---|---|---|---|
| 1-1..1-5 | live, gen2 | main (stageTable.ts:34-44) | nothing |
| 1-6, 1-7 | live, gen2; variety pass (R-165.276) built, not shipped | main; t-var-1 2cec5f64 (VAR-1b) | VAR-1b's last gate run, then tonight's link (STATE:1518-1519) |
| 1-8 | live, gen2; tonight = main's 1-8 exactly (knot rests dropped) | main (stageTable.ts:55); R-165.293 | bough-native rests wait on the pacing-rule decision R-165.293 |
| 1-9 | built on gen2, not shipped (live = old hand build) | t-build-19 2097adf7, in INT-12 (t-int-12 8a60e616) | R-165.291 variety pass (9 funcheck flags) "before any release" (STATE:1505); meter reads low (R-165.286, partly done on t-meter-3) |
| 2-1 | live, gen2 | main (stageTable.ts:60) | R-165.284 tap-hop re-fly (rideLay.ts:260 uses FakeInput's hop) |
| 2-2 | live, gen2 | main (stageTable.ts:62); petals t-art-22p (in INT-12) | R-165.284 + big pads to ~2 Pokeys (Matt "Sure" 11:47 AM, STATE:1470) |
| 2-3 | designed (final); engine built, not merged | 2-3.md @ t-design-23 260aa398; engine t-eng-23 9e306581 | art (waddle/paddle frames, heron looking), lines (8 asks), meter `line` channel, HUD faces (Matt's OK), heron call R-165.290 |
| 2-4 | built, NOT finished: BUILD-24b stopped 5:28 PM 11-18 with checks unrun (STATE:1525) | t-build-24 38f9b929; glow + raft t-eng-24c | BUILD-24c (fresh, Thu; packet reference/packets/2026-11-19/BUILD-24c.md): on t-build-24 + t-eng-24c, raft wired + petals-in-soil first; Root B (noLand24 gap) only after ENG-285's step-1 judge model (D40); the two bot defects moved to ENG-285 (one recalibration, one castBots sweep for every tool change) |
| 2-5 | designed (final); engine + snap-stone art built, not merged | 2-5.md @ t-design-24 ce813ffc; t-eng-25 21668b61 | bot skill `bonk-after-the-snap`, meter run-window channel (ENG-25 REPORT "Suggestions" 1-2), lines |
| 2-6 | designed (final) | 2-6.md @ t-design-26 f596350d | NEW 1 water wheel (M), NEW 2 bot `ride-wheel` (S-M); HF wheel + bucket + millrace lip; lines |
| 2-7 | designed (final) | 2-7.md @ t-design-26 | `/L` after `/D` toy on a real row (maybe a 3rd NEW), NEW 1 mail-boat pacer (M), NEW 2 post (S), bot `race`; HF boat, letter, open door, weir; lines |
| 2-8 | designed (final) | 2-8.md @ t-design-26 | needs follow.ts (2-3) AND the `/L` leg (2-7) first; NEW 1 flood clock (M), NEW 2 followers meet the flood (S-M); HF poses + flood line; lines |
| 2-9 | hand-built only (live); pitch packets written, not run | w2Stages.ts:39; packets PITCH-29A/29B (lead's branch) | the pitch round, picks, final design, then its engine pieces |
| 2-10 | live, hand-made boss (Crocus Rex), not gen2 and not meant to be | bossDefs.ts:280-284, lairCroc.ts, bossBot.ts:573 (`crocTactic`) | nothing found open (no open ROADMAP row names Crocus/2-10, grep) |
| 3-1..3-3 | hand-built only (old section maker) | w3Sections.ts:31-46 via protoStage.ts:57 | PITCH-29A/B pitch 3-1 and 3-2; 3-3 pitched in the next round |

Note: the packet asked for "2-9/2-10/3-1 next", but the packets the lead wrote at 5:21 PM pitch **2-9, 3-1, 3-2** (STATE:1522;
PITCH-29A.md:1). 2-10 is a built boss, so I treat that as right.

## 2. World 2 to finish (2-3, 2-5..2-10)

Sizes: **S** under 1 h, **M** 1-2 h (one member), **L** 2-4 h (in practice two fresh members). They come from LEVEL-LOG actuals; the
cost table is in §5.

| Stage | Engine pieces (state) | Art | Story lines | Meter | Bots |
|---|---|---|---|---|---|
| 2-3 | follow.ts + "bring N home" + heron reads the line: BUILT t-eng-23 (STATE:1502). Left: HUD faces (S-M, after Matt's OK); the route must refuse a drop deeper than 90 px on the line's road (ENG-23 REPORT §5, builder's); heron call R-165.290 (S) | HF ask: 3 kinds x 2 waddle + 1 paddle, heron head-up + fishing (2-3.md:80-82); fallback hop-bob judged on a clip | 8 asks, none written (2-3.md:83-84) | `line` channel unpriced (ENG-23 REPORT §4) | LINE_SKILL built; whether cast bots PUNCH cages is unproven (ENG-23 §4) |
| 2-5 | snap stones 'bites' + W2 snapper cast row: BUILT t-eng-25 (STATE:1491). Left: bot skill `bonk-after-the-snap` + toy (S-M) | snap stone sheet painted, accepted (STATE:1486) | none written | snap run window missing: per-stone pricing reads easy (ENG-25 REPORT item 5) | bot off-before-four built; snapper bonk missing |
| 2-6 | NEW 1 wheel.ts + wheelPiece + a gen2 tower-turn place kind (M, 3-4 h by the design); NEW 2 `ride-wheel` (S-M) (2-6.md:52-56). Risk: river on a tower storey (falls back to stepping stones) | HF: noria 320-400 px, bucket 120 px, millrace lip (2-6.md:62-64) | 5 asks (2-6.md:64-65) | step-off as log2(1+cycle/window) (2-6.md:13); whether score.ts prices a wheel **[unverified]** | `ride-wheel` (NEW 2) |
| 2-7 | first toy: `/R .. /D D /L ..` laid clean on a real row (pipeline.ts:2541 mirrors /L at the same ground, per 2-7.md:68-69; a 3rd NEW if it needs a new lay); NEW 1 mail-boat pacer reusing chaseLay.ts:110 (M); NEW 2 post (S) | HF: punt + mailman 240 px, letter/reply 28 px, door OPEN, weir (2-7.md:78-80) | 5 asks (2-7.md:80-81) | a race channel **[unverified: not named in the design]** | `race` |
| 2-8 | BY 2-3: follow.ts; BY 2-7: `/L`. NEW 1 flood clock in gen2 + floodFaults (M); NEW 2 followers meet the flood (S-M) (2-8.md:56-60) | HF: sitting/waiting pose, flood line, deep marsh surface; walk frames shared with 2-3 (2-8.md:66-68) | 5 asks (2-8.md:68-69) | flood closes the low road: channel **[unverified]** | `lead-the-line` |
| 2-9 | unknown until picked. GAME-MAP's row: lanes of logs both ways, guards on rafts (GAME-MAP.md:190 on t-design-game-map); likely re-uses rivers flowing left (2-7), the raft look (R-165.288, t-eng-24c), "riding lanes" 1-3 h (GAME-MAP.md:197) | the raft (puzzle-kit#raft) exists; guards on rafts **[unverified]** | none | **[unverified]** | **[unverified]** |
| 2-10 | none: built boss arena (bossDefs.ts:280) | built (lairCroc.ts) | built (storyBosses.ts:51, bossDefs.ts:341) | n/a (boss) | bossBot.ts:573 |

**The critical path (dependency first):**
```
INT-13 (one W2 base: 2-4 + glow/raft + follow + snap + meter-3) ──┬─> ENG-25b ─> BUILD-25 (2-5)
                                                                 ├─> METER-4 + ART-W2A + KEEPER-23 + HUD ─> BUILD-23 (2-3)
ENG-285 (judges fly the real engine) ─────────────────────────────┤   (every list proven after it, so it lands first)
ENG-26 (wheel) + ART-W2B ─────────────────────────────────────────┼─> BUILD-26 (2-6)
ENG-27 (/L toy, mail boat, post) + ART-W2B ───────────────────────┼─> BUILD-27 (2-7)
                      ENG-27 + follow.ts ─> ENG-28 (flood) ────────┼─> BUILD-28 (2-8)
PITCH-29A/B ─> picks ─> DESIGN-29 ─> ENG-29 ─────────────────────────> BUILD-29 (2-9)   <- the LONGEST chain: start it first
```
The two longest chains are **2-9** (four steps in a row, its engine still unknown) and **2-8** (it needs both ENG-27 and follow.ts).
2-10 is off the path.

## 3. The engine lane ahead (one ordered queue, dependency first)

Each line is one fresh member. "Unblocks" means the builds that cannot start without it. The base is the branch the member starts from.

| # | Job | Rows | Size (actual basis) | Base | Unblocks |
|---|---|---|---|---|---|
| E1 | **INT-13** the World 2 base: merge t-build-24 (when BUILD-24b is green), t-eng-24c, t-eng-23, t-eng-25 (t-meter-3 rides in via t-build-24/t-eng-24c) onto tonight's link head; full CLAUDE.md gate list once | R-165.288/.289 land; R-165.286/.287 land | M-L (INT-11 $34.31, LEVEL-LOG:150; INT-10b ~1 h 20 m, :148) | t-int-12 final (or main if Matt merged it) | every W2 build; R-165.255 drift |
| E2 | **ENG-285** the judges move Pokey like the engine: airStep gets the in-air turn push (engine.ts:2567 per the row) + the liana judge's press-frame climb and frame order (inputEngine.ts:345); relock every stage, re-check every list, recalibrate tierBots per BOTS.md | R-165.285, R-165.294 | L (rows say 2-4 h + 1-3 h; no actual yet) | t-int-12 final | every list proven after it; land it BEFORE BUILD-25 lists, or each build relists |
| E3 | **FIX-284** the real tap hop in rideLay.ts:260 and 2-2.md + 2-2's big pads ~2 Pokeys (art = floor) | R-165.284 | M (row: 1-3 h) | t-int-12 final | 2-2 polish; promised to Matt for 11-19 (STATE:1470) |
| E4 | **ENG-26** water wheel + `ride-wheel` on a real stageTable row | 2-6 NEW 1-2 | M-L (design: 3-4 h + 1-2 h; ENG-23 did 2 NEW in ~1 h 40 m, $26.60, STATE:1488/1502) | origin/main (independent files) | BUILD-26 |
| E5 | **ENG-25b** snapper bot `bonk-after-the-snap` + toy, and score.ts's snap run-window channel | ENG-25 suggestions 1-2 | S-M | t-eng-25 | BUILD-25 (rule 21: the bots before the lay, level.md:26) |
| E6 | **METER-4** 2-3's `line` channel (crossing time vs lineFaults' safeWindow, reed let-go, spook cost) | ENG-23 §4 | S-M (METER-3 ~70 min, 12:39-1:48 PM) | t-int-13 | BUILD-23 |
| E7 | **ENG-HUD** the little faces in VineHud (after Matt's OK on the mock-up) + clipcheck both ways, three saves | ENG-23 §4 HUD-FACES | S-M | t-int-13 | BUILD-23 |
| E8 | **ENG-27** `/L` after `/D` first toy, mail-boat pacer, post, bot `race` | 2-7 NEW 1-2 (+3rd if needed) | L | t-int-13 | BUILD-27, ENG-28 |
| E9 | **ENG-28** flood clock in gen2 + floodFaults; followers meet the flood; bot `lead-the-line` | 2-8 NEW 1-2 | M-L | t-int-14 (holds ENG-27 + follow) | BUILD-28 |
| E10 | **ENG-29** 2-9's pieces (from DESIGN-29) | TBD | M-L **[unverified]** | latest INT head | BUILD-29 |
| D1 | **VAR-19** 1-9 variety by data (VAR-1's method): the 9 funcheck flags cleared | R-165.291 | M-L (row: 1.5-3 h; VAR-1 ~6 h for three stages) | t-int-12 final | any release |
| D2 | **GATE-292** fail when a painted-style block draws through code terrain | R-165.292 | S-M (row 1-2 h) | t-int-13 | polish of every build after it |
| D3 | **READER-283** beats.ts reads climbs (C) and bounces (B); re-run funcheck everywhere; known list only shrinks | R-165.283 | M (row 1-3 h) | t-int-13, AFTER D1 | true variety verdicts for W2 builds |
| D4 | **PACE-293** decide the pacing rule on all-stage evidence, change the gate in its own commit, then 1-8's bough-native rests | R-165.293 | M (row 1.5-3 h) | t-int-13 | 1-8's rests; every future list |
| D5 | **ART-SOUND** heron call (frahnk croak) | R-165.290 | S (row 0.25-1 h) | t-int-13 | BUILD-23 polish |

**The bot set-down fixes are already done:** 72057eab on t-build-24 is "the bot finds his place where the game sets him down" (it also
touches pitWayBack, by `git log -S`), with the calibration recommitted as 1b746f0f (209/210 lines the same). They reach everyone through
E1. Whether VAR-1b's relocate defect (the level-only search) is folded into that same commit: **[unverified]**.

**World 3 engine that is general enough to start now** (GAME-MAP.md:226-233; ENGINE-NEEDS.md §1). Start these in spare engine slots
from Day 3, so World 3's builders never wait:
- **W3-ART** (HF first): World 3 has the thinnest standing art in the game (38 pieces to stand on, 0 climb pieces, GAME-MAP.md:231-233).
  Wanted: standing and climb pieces, lit rims, a glowing fungus cap. M, HF about $2-4 (from ART-678's ~$0.075 a piece, LEVEL-LOG:73).
- **ENG-W3a**: the World 3 kit on gen2 (w3.ts, the way ENG-W2 built w2.ts: $38.49, ~1 h 50 m, LEVEL-LOG:135), plus a DOWN stage proven on a
  real row. The tower lay already takes flow 'down' (gen2/pipeline.ts:439, :2006). Only 4-7 travels down today (stagePlan.ts:95). L.
- **ENG-DARK**: dark plus a light ring as a gen2 zone any world can use. Today only the World 6 kit lays it (gen2/worlds/w6Swing.ts:427
  darkZone). M (GAME-MAP: 4-6 h).
- **ENG-HANG** (World 3's signature in GAME-MAP; R-160.1/R-160.2; 10-16 h plus art, GAME-MAP.md:227-228). Split it into four fresh jobs:
  HANG-SPEC (a show-first feel mock-up for Matt, S), ART-HANG (Pokey hanging idle/creep/drop on HF, M), ENG-HANG-1 (the move plus a toy,
  M-L), ENG-HANG-2 (the gen2 roof-root lay plus a bot skill, M-L). **Start it only after the PITCH-29 picks confirm that 3-2 hangs.** The
  open lens could choose something else.
- Later, after 3-5's pitch: noise that wakes sleepers. drumNoise (heroNoise.ts:46) has no caller outside tests, by grep (2-4 h).

## 4. The pitch-ahead calendar (three levels ahead, two lenses, separate packets: pitch.md:19, D85)

| Round | Levels | When | Then |
|---|---|---|---|
| R1 | 2-9, 3-1, 3-2 (PITCH-29A fixed, PITCH-29B open; packets written) | Day 1 morning (or tonight if a slot frees) | lead picks; DESIGN-29 (2-9 final) Day 1-2; DESIGN-31-32 Day 3 |
| R2 | 3-3, 3-4, 3-5 | Day 3-4 (when 2-5/2-3 builds are running) | DESIGN-33-35 Day 5 |
| R3 | 3-6, 3-7, 3-8 | Day 6 | finals the next week |
| R4 | 3-9 + World 3 tribute pass (pitch.md step 7) | Day 7 or the next week | |
A pitch pair costs $12-13 and takes 15-30 min (LEVEL-LOG:152-153). A final design costs $4.50-10 and takes 17-60 min (LEVEL-LOG:154;
STATE:1478). Designers and pitchers never build what they pitched (fresh-member rule).

## 5. The 7-day plan (Thu 11-19 .. Wed 11-25), four members at once, each job a new member

Matt chose "4 members" (STATE:1451). Fresh members always (LEADER-STANDARD-WORK.md:25 on the lead's branch): no carry-over, a designer
never builds its design, and an engine member never builds the level that uses its piece. A level build is planned as **two members**
(BUILD-N, then a fresh BUILD-Nb). Every build since 1-6 has needed a second member (BUILD-19/19b, BUILD-22/FIX-22, BUILD-24/24b).

**Unit costs (actuals, so they already include a fresh member re-reading the method):**
| Job kind | Wall time | Cost | Source |
|---|---|---|---|
| pitch (one lens) | 15-30 min | $5-8 | LEVEL-LOG:152-153 |
| final design (1-3 levels) | 17-60 min | $4.50-10 | LEVEL-LOG:154; STATE:1478, :1495 |
| keeper lines | 5-10 min | $1-3 | LEVEL-LOG:96, :103 |
| engine piece pair (xhigh) | 70-100 min | $13-38 | LEVEL-LOG:84-94, :135; ENG-23 $26.60 STATE:1502 |
| meter channel | ~70 min | n/a **[unverified]** | METER-3 REPORT:2 (12:39 start), STATE:1483 |
| HF art job | 35-105 min | $8-25 + HF $0.2-2 | LEVEL-LOG:73, :80, :151; ART-22P $16.50 STATE:1472 |
| level build (2 members) | 2-4 h | $45-90 | 2-2: $24.52 + $43.58 (LEVEL-LOG:150); 2-4: $22.79 + BUILD-24b n/a (STATE:1504) |
| integration | 1-2.5 h | $11-35 | LEVEL-LOG:148-150 |
| **one W2 level, pitch to link** | 6-10 member-hours | **$80-150** | sum of the rows above; ENG-24/ENG-25 costs not logged **[unverified]** |

11-18 ran about 22 member jobs between 9:48 AM and about 9 PM (STATE:1451-1522), so the plan below (8-11 jobs a day) leaves room for
continuations and redo.

| Day | Engine lane | Build lane | Design + pitch | Art + story | Debt + tools / integration | Delivers (evening) |
|---|---|---|---|---|---|---|
| **Thu 11-19** | ENG-285 (L, first; + the two bot defects; step-1 model hash late morning unblocks BUILD-24c); ENG-26 (M-L, after a pitcher frees) | BUILD-24c (2-4 finish, first; added 11-18 5:40 PM) | PITCH-29B ran 11-18 evening; PITCH-29A -> picks; DESIGN-29 starts late | ART-W2A: little ones' frames + heron poses (M) | INT-13 (after BUILD-24c green; prep merges first); VAR-19; FIX-284; INT-13b at 6 PM | test link #2: 2-4, 1-9 variety, 2-2 pads, judges fixed. **Release candidate 1** (World 1 + 2-1/2-2/2-4) if Matt says push |
| **Fri 11-20** | ENG-25b (S-M); ENG-27 (L) | BUILD-25 then BUILD-25b (2-5) | DESIGN-29 (if not done) | KEEPER-25, KEEPER-23 (XS); ART-W2B: wheel/bucket/lip + boat/letter/door/weir (M) | METER-4; GATE-292 | 2-5 on the link (range: Fri night to Sat) |
| **Sat 11-21** | ENG-HUD (S-M, after Matt's OK); ENG-29 (M-L) | BUILD-23 + 23b (2-3); BUILD-26 (2-6) | DESIGN-31-32 (3-1/3-2 finals) | KEEPER-26, ART-SOUND (heron call) | READER-283; INT-14 | 2-3 (and 2-6 if green) on the link |
| **Sun 11-22** | ENG-28 (M-L, needs ENG-27 in INT-14) | BUILD-26b; BUILD-27 (2-7) | PITCH round R2 (3-3/3-4/3-5, two members) | KEEPER-27, KEEPER-29; W3-ART (M) | PACE-293 | 2-6, 2-7 (range: Sun-Mon) |
| **Mon 11-23** | ENG-W3a (L) or ENG-DARK (M) | BUILD-27b; BUILD-29 (2-9) | DESIGN-33-35 | KEEPER-28; ART-W2C (2-8 poses/flood line, if not in W2A/B) | INT-15 | 2-7 and 2-9 started |
| **Tue 11-24** | ENG-HANG-1 (if the picks keep hang) | BUILD-28 + 28b (2-8); BUILD-29b | HANG-SPEC show-first | ART-HANG (HF) | INT-16: all of World 2 on one head; full gates | **best case: all of World 2 on the link** |
| **Wed 11-25** | ENG-HANG-2 / ENG-DARK | buffer: any Nb continuation | PITCH round R3 | | INT-17: Play Store §6 check, release prep | **Release candidate 2: World 2** when Matt says push. Range: Tue 11-24 to Fri 11-27 |

**Thursday 11-19 slot plan (lead, written 11-18 evening; packets reference/packets/2026-11-19/):** 8:30 AM start: (1) ENG-285 ->
~3 PM -> INT-13 in the same slot (box 8:30 PM, test link #2 ~9 PM); (2) BUILD-24c (raft + petals + bank join in the morning; Root B
after ENG-285's step-1 model; box 6 PM); (3) FIX-284 (pad size show-first 11:30 AM; tap hop after step 1; box 5 PM) -> ART-W2A (or tonight, 11-18, if a slot frees before 8 PM);
(4) VAR-19 at 8:30 AM (relists on step 1; box 5 PM): DESIGN-29 ran 11-18 evening (Matt picked 2-9 = the King's Drum + barge, 6:06 PM). ENG-26 ran 11-18 evening instead (pulled forward into a free slot, t-eng-26).
TIME-168 runs tonight (11-18). D40 rule for the day: every list is proven on ENG-285's model.

**At most four at once.** Day 1 start order: INT-13, PITCH-29A, PITCH-29B, ENG-285. As slots free: ENG-26, VAR-19, FIX-284, ART-W2A,
DESIGN-29, INT-13b. Tonight's ART/HF budget: HF balance about $52.5 (INT-12 REPORT, HF-SPEND line) against a reserve of about $10
(CLAUDE.md). This plan's HF jobs come to about $3-8 at ~$0.075-0.34 a piece **[estimate]**.

**Uncertainty, stated honestly.** Builds have run past their boxes (BUILD-24 stopped at 50.2%, STATE:1504). ENG-27 can turn into three
NEW pieces (2-7.md:68-69). 2-9's engine is unknown until Day 2. Matt's weekly usage is unknown to me today **[unverified]**: on 11-15 it
hit 93% (STATE:1440), and his reset is Wed 2 AM ET (STATE:1383). If usage runs short, cut scope, never a check: drop the World 3 engine
first, then 2-9, and keep 2-3 to 2-8.

## 6. Risks and what we keep re-learning (from 11-18), with the standing countermeasure

| What keeps happening | Evidence | Countermeasure (standing) |
|---|---|---|
| Bot defects show up inside level builds and eat builders' boxes | BUILD-24b root A, 6 of 8 rescues were a bot bug (STATE:1507, :1511); VAR-1b relocate + pitWayBack (:1509-1510); POLISH-9 inputGrace (LEVEL-LOG:91) | every engine packet runs castBots + tierBots on EVERY shipped stage; a bot fix is its own commit + planted test + one tierBots re-prove; any packet touching firsttimer/route recommits calibration per BOTS.md (ENG-24 forgot: STATE:1494) |
| Gate artifacts steer level data | pacing on a 5 s grid pushed 1-8's knot rests (R-165.293, STATE:1517); flagSpan floor hand-moved 28->27 twice (STATE:1515) | change a gate only in its own commit on all-stage evidence; derive floors from data (owedWalk, t-build-24 4f5a5b30), never hand numbers |
| Code-drawn fallbacks slip in | 1-7's log grew to 53 px and drew as code ground (R-165.292); ENG-25's first snap sheet was repainted code half-discs (STATE:1486); W1 code leaves (R-165.275) | GATE-292 (D2) early; the lead judges stills both ways before "done"; HF img2img from shipped pieces |
| Known lists must only shrink, but merges grow them | VAR-1b funknown restored from main (STATE:1519); 1-9 +9 funcheck flags (STATE:1505) | every job diffs each known list against its base (only lower entries); funcheck is in every level packet (D86 extended) |
| Members misjudge their context | ENG-W2 said 33%, real 65% (LEVEL-LOG:135); METER-3 ~65-67% vs a 50% box (STATE:1483); ENG-23 55% (STATE:1502) | the lead reads the real figure (get_session at idle); boxes of 50%; plan builds as two members; hand off at an exact step past ~55% (LSW:42) |
| Packets list only some of the checks | ENG-24's tierBots red (STATE:1494, D86); BUILD-19 never ran funcheck (STATE:1505) | every packet carries "the CLAUDE.md check list, every item" plus stage-specific checks |
| Branches drift; builds sit on sibling branches | t-build-24 and t-eng-24c are siblings; 1-9's meter needed a scratch merge (METER-3 REPORT "Learned"); tools/team/driftcheck.mjs does not exist yet (ls tools/team: models.json, modelgate.mjs) | an integration member most evenings (INT-13..17), and builders branch from the latest INT head; build driftcheck (R-165.255) in a tools slot |
| Member clocks drift | VAR-1b ran ~1 h 15 m ahead (STATE:1512-1513) | times come from `date` only (D30) |
| ROADMAP rows say "open" when the work is built on a branch | R-165.286/.287 (t-meter-3), .288/.289 (t-eng-24c) | correct by rule (done = merged with a PR/commit); INT-13 closes them with the merge commit |

## 7. Facts I could not verify (also marked inline)
- Matt's answer on the 2-3 HUD-faces mock-up. ENG-24, ENG-25, METER-3, BUILD-24b, VAR-1b and ENG-24c costs (not logged when I wrote this).
- Whether VAR-1b's relocate defect is inside 72057eab. Whether score.ts can price a wheel step-off, a race or a flood without a new
  channel. 2-9's engine and art needs (not pitched yet).
- Whether tonight's link (INT-12) published, and whether Matt merges it before INT-13 starts (the base choice depends on that).
- Matt's weekly usage today, and whether this week's reset is still Wed 2 AM ET.
- Line cites inside the design docs (pipeline.ts:2541, legs.ts:151, chaseLay.ts:110, engine.ts:2567, inputEngine.ts:345) are as the
  designs and ROADMAP rows give them. I did not re-open those lines.
