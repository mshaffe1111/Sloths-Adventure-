# READY-27 REPORT (t-ready-27-wip; started 11:36 AM ET by `date`; this version written 1:01 PM ET)
## EXACT NEXT STEP
1. None for READY-27: the lead's ruling, no landing (real context past 320k); BUILD-27 merges t-ready-27-wip itself.
2. The 2-7 builder adds `columnDress: W2_WEIR` to 2-7's brief (gen2/worlds/w2.ts), beside pacer and post; runs drawcheck on 2-7.
3. The 9 suite + 11 CI-line reds are t-eng-27 cf7428424's own (below); ENG-27w's landing d9425f091 fixes the race (the lead).
## Readiness list (code on main cdffdc627 and t-eng-27 cf7428424; frozen t-eng-27 run: 55 tests, 46 pass, 9 fail = the race)
| Piece (2-7.md:66-81) | Verdict | Where / evidence |
|---|---|---|
| rivers, rows, left-flow mirror; water warning | GREEN; warning exists | riverLay.ts; legs.test 'a river in a leg laid left is turned'; w2.ts:84 W2_TIPS.water (bounce, carry: not re-proven) |
| left leg + mirrored zones; left look-ahead | GREEN; wired | legs.ts reflectLeg, legs.test 11-20 (t-eng-27); engine.ts:6658 camLook by facing |
| READY toy /R../D Dc_/L.. by gen2 | GREEN | toyHome.ts HOME_CODE; legsHome.test planted RED + GREEN 6 seeds x2 (a gen2 kit, not a stageTable row: 2-7's row is BUILD-27's) |
| NEW 1 pacer | lay GREEN, race RED | pacerLay.test lay/bounds/respawn GREEN; race bots RED 7 + 2 planted hops (ENG-27w's) |
| NEW 2 post | GREEN | postLay.test: slots on his path every roll x2, RED at 60 px; door opens on the pass; bots post every letter |
| boat x2, letter x2, reply x2, open door | GREEN | w2-next sheet + catalog (t-eng-27, ENG-27c); open door from ART-NEXT-b's cut: no HF job, $0 |
| weir | GREEN (this branch) | 8ab004ce9: sheet + catalog + inventory + column dress; columnDressLay.test 5/5 |
| story asks (hand-over, Dot beat 6, win/lose, journal) | MISSING | KEEPER-27's packet |
| the hand build to replace | builder's | w2Stages '2-7', liftRide/w2Stages/w1NewArt pins (BUILD-27) |
## Done-items
1. Readiness list: above; sent to the lead in box 1. 2. Art wired: boat, letter, reply, open door were already wired on t-eng-27 (checked,
   stills below); the weir wired here (commit 8ab004ce9): w2-next.webp repacked 3304x371 with the weir appended (earlier cells identical,
   pixel diff < 1/channel, alpha 0), catalog row w2-next#weir (file, status, draw_cost; the 7 sheet rows' kb/cost updated), inventory
   re-emitted (inventory.test 10/10). 3. Open door: a frame existed (no HF job). 4. Post: existed, GREEN (above). Weir placement is general:
   columnDress.ts + gen2/columnDressLay.ts + pieces/columnDressPiece.ts (layer 'back'); RED first (module missing), then GREEN 5/5 with plants.
5. Stills (2x, upright + sideways, fixture ?fixture=home seed 1 Normal): weir-beside-pokey.jpg, boat-letter-door-beside-pokey.jpg.
## The lead's blocker: the flat dark-teal panel (fixed, general)
Cause: a DEEP river's flat fill (riverArt.ts RIVER_DEEP) and the water over its logs (engine.ts drawRivers' over pass, 75% deep colour) ran
to the view's foot; over a leg laid under the river the lid's clip left them as a panel down to the ceiling. Fix: under a lid (any stage, the
engine's own riverLid) the deep river has a bed: the fill and the over-logs water end at its strip's foot (riverArt.ts deepFillFoot), the
banks' painted earth (drawSoil) runs on to the ceiling with a 70 px fade from the deep colour; the existing underside ends it. Open rivers
unchanged. Plant: deepRiverLid.test.ts (the engine's drawRivers, both passes, toy both settings): RED on 8ab004ce9 (deep-red.txt: x 16265
fill to y 1462, 287 px of panel) and on f9f44068f (deep-red-over.txt: the over-logs water), GREEN on 39722119b; groundStack.test 16/16.
Stills: teal-before-after.jpg (upright and sideways, before 8ab004ce9 / after 39722119b, and the river from its own bank: a deep channel
with a bed). Note for the lead: the out leg's deep rivers now show a bed under 130 px of dark water (the race leg is under them).
## Gates (head 39722119b src)
| Gate | Verdict |
|---|---|
| tsc / generalitycheck / artcheck / knowncheck / timecheck | PASS / PASS / PASS / PASS / PASS |
| roadmapcheck | FAIL 13 on main too (proof commits on branches this container never fetched); this branch touches no ROADMAP |
| unit suite, head 39722119b (1 shard) | FAIL 9: 4067 tests, 4055 pass, 9 fail, 3 todo; the 9 = the mail-boat race reds, the same 9 on t-eng-27 cf7428424 (frozen run, 46/55) |
| base suite, main cdffdc627 (1 shard) | PASS: 4042 tests, 4039 pass, 0 fail, 3 todo |
| CI tool line, head | rolled tests FAIL 11 (341: 329 pass, 1 todo), the SAME 11 on t-eng-27 cf7428424 (frozen run, diff empty: wheel route/channel x6, riverRide/ride-skill plants x5); tipwalk PASS, registrycheck PASS, tierBots PASS 9/9, buildcheck PASS |
| drawcheck, head | PASS (792 s) |
## Polish check
- Weir: a tier about one Pokey; foam meets the grass, foot under the floor; ledges and the turn's pole in front. Boat: the mailman about
  Pokey's height, beside him in the river both ways. Letters/replies ~28 px. Door: letter in the slot; open door lit. The teal panel: FIXED.
## Pushback
- Design vs build: replies are every petal on the home race leg (postLay.ts:105-108), not one per house's river step. ACCEPTED by the lead
  for tonight (the race keeps its line); a deviation from 2-7.md signed by the lead.
- CATALOG-MASTER's w2-next rows differ: main has ART-NEXT-b's 9 rows (cut paths), t-eng-27 has 7 wired rows (this branch 8). The t-eng-27 x main
  merge conflicts there: keep the wired rows and add main's barge row.
## Suggestions: none beyond the merge note. ## Unresolved: the head's suite, CI line, drawcheck (running/next); the race (ENG-27w); story (KEEPER-27).
## Lessons applied
D30/D109 (times from date, none in messages), D40 (the weir on t-eng-27's sheet, no second sheet), D41 (sizes vs 89.1 drawn), D57/D87
(inbox at each step), D79 (whole screen judged), D113/D115 (background runs, frozen chattr trees), D114 (base suite first), D117
(t-ready-27-wip), D119 (no heredoc in a commit chain), D126 (CI tool line), D127 (inside the budget).
## Method update / turnover note
Wrote reference/methods/hf-props.md (no method for wiring a cut piece existed). engine-core.md: entry 0zq-R27 (weir, column dress, the bed).
