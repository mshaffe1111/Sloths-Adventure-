# READY-27 REPORT (t-ready-27-wip; started 11:36 AM ET by `date`; this version written 11:54 AM ET)
## EXACT NEXT STEP
1. Read the head's suite + CI tool line verdicts (running on frozen /home/user/wt/shot27 = 8ab004ce9, the src of this branch's head):
   `grep "SUITE EXIT\|^EXIT\|^not ok" <scratchpad>/suite-head.txt <scratchpad>/ciline-head.txt`; compare any red with the base suite on main
   (suite-base.txt) and with t-eng-27 (the race's 9 known reds). Fill the table below.
2. On the lead's word: land t-ready-27-wip onto t-eng-27 (it is t-eng-27 cf7428424 + 3 commits; no race file touched).
3. The 2-7 builder adds `columnDress: W2_WEIR` to 2-7's brief (gen2/worlds/w2.ts), beside pacer and post.
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
## Gates (head 8ab004ce9 src)
| Gate | Verdict |
|---|---|
| tsc | PASS |
| generalitycheck / artcheck / knowncheck | PASS / PASS / PASS |
| roadmapcheck | FAIL 13 on main too (proof commits on branches this container never fetched); this branch touches no ROADMAP |
| unit suite (head) / base suite (main) | RUNNING / RUNNING |
| CI tool line (rolled job: tests, tipwalk, registrycheck, tierBots, buildcheck) | RUNNING after the head suite |
| drawcheck | not run: no listed stage lays the weir yet; 2-7's builder runs it on 2-7 (one drawImage when near view) |
## Polish check
- Weir: a tier about one Pokey; foam meets the grass line, its foot hidden by the floor; ledges and the turn's pole stand in front; no hard edges.
- Boat: mailman about Pokey's height, rows in the river beside him, both ways. Letters/replies about 28 px, read as envelopes.
- Door: the letter sits in the slot of the shut door; open door shows warm light, same box.
- ROUGH, not mine (D79): upright on the home leg, the out leg's underside above him is a flat dark-teal panel with no texture
  (boat-letter-door sheet, upright boat). Owner: the ground stack (groundStack.ts, t-eng-27). Named, not fixed.
## Pushback
- Design vs build: replies are every petal on the home race leg (postLay.ts:105-108), not one per house's river step. ACCEPTED by the lead
  for tonight (the race keeps its line); a deviation from 2-7.md signed by the lead.
- CATALOG-MASTER's w2-next rows differ: main has ART-NEXT-b's 9 rows (cut paths), t-eng-27 has 7 wired rows (this branch 8). The t-eng-27 x main
  merge conflicts there: keep the wired rows and add main's barge row.
## Suggestions
- ENG packet: give the stacked ground's underside a painted face (the flat teal panel above).
## Unresolved
- The head's suite and CI tool line (running); the race's reds (ENG-27w); 2-7's story lines (KEEPER-27).
## Lessons applied
D30/D109 (times from date, none in messages), D40 (the weir on t-eng-27's sheet, no second sheet), D41 (sizes vs 89.1 drawn), D57/D87
(inbox at each step), D79 (whole screen judged), D113/D115 (background runs, frozen chattr trees), D114 (base suite first), D117
(t-ready-27-wip), D119 (no heredoc in a commit chain), D126 (CI tool line), D127 (inside the budget).
## Method update
No method file for wiring a cut piece existed: wrote reference/methods/hf-props.md (append-pack, catalog, emit, draw by id, planted toy, stills).
## Turnover note
reference/handoffs/engine-core.md: new entry 0zq-R27 + the w2NextArt line (this branch's next commit).
