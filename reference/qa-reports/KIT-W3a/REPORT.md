# KIT-W3a: World 3's TOWER bricks (R-165.504; content/kit, Opus 5.5 high). Branch t-kit-w3a, cut from t-eng-w3 13135bf6b


## EXACT NEXT STEP (box 5, written 11:54 AM ET Fri 11-27 by `date`; box 4's step below is DONE to its item 1, the rest carried here)
Head: t-kit-w3a 37a0d67b4 + this commit = 29e074252 (merge of ENG-CATCH-d's FROZEN candidate 6d296c1b7, named) + de6feebff (the width
bar) + 37a0d67b4 (w3Noise's drop pick by property). tsc 0, generalitycheck PASS (26 literals, 26 known) at 29e074252 and de6feebff.
NOT GATED, NOT LANDED: blocked on tower wood (rule 26, asked of the lead) and on ENG-DEAL, which has not landed on t-eng-w3 (its head is
still 51ef0c6ab); ENG-CATCH-d's landing hash has not come either.
DONE this box:
- Step 1: merged 6d296c1b7 (named). On it, before narrowing, all five together on 1-40 x both: 80/80, no throw. Laid widest: root-down
  641, two-roots 943, cap-down 1080, cap-steps 1129, shelf-hops 1091.
- Step 2, the width bar (APPROVED by the lead this box): a down brick's DECLARED widest roll = widest widths + widest gaps + EASY_LANDING
  (48) on every landing piece (layLocal adds it on Easy; that pad IS the "about 11%": cap-steps had 960 px of widths and 4 landings, so
  1152, which laid 1142 and threw). Bar: at least 10% under the 1140 storey = 1026 (w3.ts W3_TOWER_WIDEST 0.9). Narrowed (exits kept wide,
  every piece at least 120 px): cap-down a 120-130, lip w 140-160 (c 260-280 kept); cap-steps a and s 120-130, b 210-220, lip w 120-130,
  c 210-224; shelf-hops a 124-134, b and c 136-140, gaps 80-89 (d 190-200 kept). Declared / laid widest (1-40 x both, each brick alone):
  root-down 648 / 647, two-roots 956 / 949, cap-down 1024 / 1013, cap-steps 1026 / 1019, shelf-hops 1025 / 1017. No throw in any config.
  w3Tower.test: 'every down tower brick declares its widest roll at least 10% under a storey' PASS + its PLANT (cap-steps at its box-4
  widths) refused by name ('w3-cap-steps declares 1152 px'). Only those two tests were run; the whole w3Tower file was NOT re-run.
- Step 4, RE-PROBE 1-40 x both, the six configs on de6feebff (probe40-box5.txt here; probe/widths.mts): all five 78/80 (e11 e19);
  root-down 80/80; two-roots 80/80; cap-down 80/80; cap-steps 78/80 (n33 e33); shelf-hops 74/80 (n13 n24 n36 e13 e24 e36). Every red is a
  'tower: a blind drop off the piece', TOWER WOOD:
  - e11 x 31-211 y 4150 497 px; e19 x 33-213 y 4109 498 px (180 px = TOWER.catchW, at the left wall: a catch bough with nothing in view
    under it);
  - n33/e33 x 283-463 y 10965 319 px (180 px: a catch bough);
  - n13/e13 x 535-892 y 3382 311 px; n36/e36 x 578-930 y 3418 314 px (352-357 px pieces: no brick lays one, so storey wood); n24/e24
    x 475-605 y 6639 314 px (130 px: shelf-hops' a) and x 703-929 y 9889 307 px (226 px). The fall-line hole class from box 3's ruling.
  Sent to the lead with my reversible recommendation: keep the narrowing, send these shapes to ENG-CATCH-d. NO RULING YET.
- Step 3, w3Noise:317 (moss): NAMED to the lead. On this head every clean Normal roll (1-40) that lays a drop toy has wood inside its
  400 px fall (seeds 2 3 8 9 13 15 17 20 27 32): mostly 180 px catch boughs 287-290 px under the top (the tower's own catch for a fall past
  TOWER.see 300; seed 2 also has a whole storey 287 px under the top, x 242-929 y 9698, where he lands). w3Noise.test now picks a drop
  roll only when its fall column is clear (dropClear, with a PLANTED test), so the moss and stone tests fail by name: "no roll of 3-1's
  draft lays the moss toy". That is the honest state, not a fix. The lead's call: shorten the drop to what a down tower allows (a design and
  noise number: LOUD.landing carries 360 px only off 400), or lay the drop toys outside a tower.
THE LEAD'S RULINGS (arrived just after this hand-over was written; they replace the open asks above):
- KEEP the narrowing (it is the rule).
- e11, e19, n33 (and the others above) go to a NEW engine box, ENG-CATCH-e: a down tower never returns a lay with a miss (a miss its mend
  cannot fix refuses the roll by name; the seed search skips it). Its FROZEN hash comes to box 6. n33's brick: w3-cap-steps ALONE (n33 and
  e33, x 283-463 y 10965, 319 px). Repro: `GEN2_DRAFT=3-1 KEEP=w3-cap-steps VERBOSE=1 SEEDS=33 npx tsx reference/qa-reports/KIT-W3a/probe/widths.mts`.
- The drop toys: LAY THEM OUTSIDE A TOWER, on a level-stage row where the 400 px drop is in view, keeping dropClear and its plant. The drop
  number does NOT change (3-5's design).
- The gate run and the ONE landing wait for ENG-CATCH-e's hash.
1. Box 6: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a && git checkout -B t-kit-w3a origin/t-kit-w3a`; npm ci
   --legacy-peer-deps in the background; ReadNotifications FIRST: the lead's rulings on (a) the tower-wood reds above and (b) the drop toys,
   ENG-CATCH-d's landed hash, and ENG-DEAL's landed hash.
2. Merge ENG-CATCH-d's landing (and any new mend for the shapes above), named; tsc + generalitycheck; RE-PROBE the six configs on 1-40 x
   both (`GEN2_DRAFT=3-1 VERBOSE=1 [KEEP=<id>] npx tsx reference/qa-reports/KIT-W3a/probe/widths.mts`, about 3.5 min each, two at a time):
   80/80 each is the bar, and the narrowed widths stay inside the bar.
3. The drop toys on the lead's ruling (commit before planting).
4. Merge ENG-DEAL's LANDED hash; 3-1's after-roll (4 seeds x both, against box 4's 22 lines). Still owed: the lead asked for the narrowed
   widths in stills. Rule 29: no stills of a stage whose bots are red, so shoot them once the probe is 80/80.
5. Tests: w3Tower.test (the WHOLE file), w3.test, w3Noise, w3HazardAsks. Then ONE gate run on the frozen candidate (packet 7: tsc,
   generalitycheck, the CI tool line, the suite in 6 shards, THE LOCK GATE as two runs with its counts line, seedlist --check per list
   touched), ONE landing onto origin/t-eng-w3 (no force, never rebase), the hash and numbers to the lead.
Learned (box 5): a percentage guessed from two laid widths ("about 11%") hid a fixed per-piece cost: Easy's 48 px pad on every landing.
Compute the widest roll from the template, never from a ratio. Narrowing changed the storeys and brought out 10 tower-wood reds that the
old widths hid, so a brick's change re-runs every config on the whole seed range before anything is called clean. A test toy whose drop
is past the tower's TOWER.see is caught by the tower's own invariant: check a toy against the world's lay rules before writing it.
Lessons applied: D151 (pick by property), D153 (no gate without its counts line: none claimed), D154 (proved on 1-40, not 1-12), D156
(generalitycheck with tsc at each step), D128 (stamps from `date`).
PROPOSED RULE for level.md (the lead approved the bar this box; its wording is for the lead's retro): "A tower brick's widest roll is
DECLARED from its template (widest widths + widest gaps + EASY_LANDING per landing piece) and is at least 10% under a storey (1026 of
1140). Check: the kit's tower test computes it and refuses a brick past it by name (w3Tower.test, planted)."
## (box 4's step, DONE to item 1; carried into box 5's) EXACT NEXT STEP (box 4, written 10:35 AM ET Fri 11-27 by `date`; box 3's step below is DONE to its item 2)
Head: t-kit-w3a = 05071f33d (merge of ENG-CATCH-b's frozen 861e2a22e, on ENG-CATCH 8a204af87) + 358787809 (rulings 1-3) + this commit
(shelf-hops narrowed, the w3Tower plants re-picked by property). tsc 0. w3Tower.test 7/7 pass (the f brick counted + planted). NOT GATED,
NOT LANDED: the ONE gate run and ONE landing wait for ENG-CATCH-c's candidate hash (the lead's message, box 4).
DONE this box: ruling 1 'descent' in W3_BOUNCE_JOBS (every 'n3 descent: no bounce section left' line GONE, 12 of 12). Ruling 2: World 3's
DOWN f brick w3-shelf-hops (w3.ts: four branch shelves, plain hops 80-100 px across and 60-80 px down, 140-200 px wide, 960 declared /
about 1066 laid, inside the 1140 storey; 1030 declared laid 1143-1144 and threw, so narrowed). Ruling 3 (w3.test.ts): the drawn test knows
World 3's cap (offKit: a 70 px bouncy piece 30 px up on its shelf, W3_ART.bounce has bounce#cap-w3, BOUNCE_FRAMES has cap-w3) with a
PLANTED test (a shelf typed bouncy -> red; the cap-w3 frame gone -> red); head room (:129) learns the cap on its own shelf (headRoomHits)
with a PLANTED test (70 px solid wood 30 px over a shelf -> red; a shelf 40 px under the cap -> red).
w3.test + w3Noise ONCE on 5e4fdf7b6 (box 4): 14 pass, 5 FAIL. :170 drawn + both new plants PASS; :129's '30 px under a cap' line GONE.
The 5: w3.test:124 'every roll clean' (easy 2: x 734-822 y 9600 454 px, x 516-658 y 9751 303 px), :129 head room (normal 13: blind drop
x 1017-1197 y 8740 321 px), :143 vine (easy 2, the same), :191 'a catch hands on' (normal 7: catches x 954-1134 y 2898, x 226-406 y 5439):
ALL the probe's tower-wood cases below (ENG-CATCH-c's). w3Noise: 4 of its 5 reds now PASS (the call toy is laid again, by property);
1 left, w3Noise:308/317 'moss: the sleeper lies about 300 px past where he lands (260 px)': the picked drop roll lands him 40 px further
along than SLEEP_T assumes: box 5 reads it (the sleeper's t from the landing the roll really lays, or the first roll where the drop
lands as designed, by property, D151), the kit's own, not tower wood.
1. Box 5: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a && git checkout -B t-kit-w3a origin/t-kit-w3a`; npm ci in
   the background; ReadNotifications FIRST (ENG-CATCH-c's hash, and the lead's call on the shelf-hops cases below).
2. PROBE (probe12-box4.txt here; SEEDS=12 both): all FIVE together 20/24, reds n7 e2 e4 e7; root-down 24/24, two-roots 24/24 alone;
   shelf-hops ALONE 13/24 (19 blind drops). The four without hops: the lead's 22/24 (n8/e8, ENG-CATCH-c's rule-4 bough, 389 px). Cases:
   - n7/e7 "a catch passes its storey: catch x 226-406 y 5439, vine x 314, past its storey at y 5617" (and e7 x 954-1134 y 2898): a tower
     catch (180 wide) under a turn vine: tower wood, ENG-CATCH-c's.
   - e2 "blind drop off x 734-822, y 9600: 454 px" and "x 516-658, y 9751: 303 px"; e4 "x 144-324, y 5777: 392 px". 516-658 (142 px) is a
     shelf-hops hop shelf b/c: its far end overhangs the hop gap, and the storey under it lies 303 px down (TOWER.see 300); 734-822 (88 px)
     is narrower than any brick piece (140 least): a tower bridge. The same class as box 3's cap-shelf hole (the lead's box-3 ruling: the
     storey's hole under a brick piece's fall line is tower wood). Hops alone: e9 x 515-653 y 11152 310 px, x 731-813 y 11008 454 px; e12 x
     561-645 y 8780 351 px. RECOMMENDATION (reversible, my own branch): hops stays IN (ruling 2's brick); its fall-line holes go to
     ENG-CATCH-c with the cases above. The other way (a data dodge: hop gaps under a walk-off) is refused (rule 26).
3. 3-1's AFTER-ROLL (box 4; after4-31-w3.txt / after4-31-wide.txt here; worktree on the head + AUDIT-W3 scratch.patch + W3_DOWN_TOWER in
   w3AuditBricks): box 3's 24 lines -> 22 (w3) / 21 (wide), clean 0/8 each. By line against box 3's 24:
   - 12x "pool short (n3 descent: no bounce section left)": GONE (ruling 1).
   - 12x "ask n13 Sf1_<: content 'f': 3 of 3 ground": still 12, now "1 of 3" / "2 of 3 sections are ground": shelf-hops IS laid in n13 on
     every roll (w3Tower.test asserts it), the other slots are the way down's drops because the deal leaves n13 UNTYPED (box 3's finding:
     the deal does not follow the code's letters). THE DEAL'S, not a brick's: ENG-ASKS's lane / the lead's call. A data dodge (a second
     falling floating brick to fill the node's three slots) is possible but would not fix the deal; ask the lead before adding one.
   - NEW (10 lines w3): 5 blind drops (x 657-739 y 3864 351 px; x 415-513 y 7544 351 px; x 707-1107 y 12744 358 px), 4 "catch passes
     its storey" (x 208-388 y 12559; x 212-392 y 4548), 1 flags (easy: none before n5, 14183 px). Wide also 2 flags lines (5347 px apart).
     Tower wood (pieces 82-98 px and 180 px catches) except the flags lines: read them on ENG-CATCH-c's merge.
4. Ruling 4 (w3Noise): its `built()` ALREADY picks by property (the first clean Normal roll of seeds 1-40 that lays the toy, w3Noise.test
   :130-149), so 'no roll lays the call toy' is a property miss, not a pin: run w3Noise once on the head; if still red, read which rolls
   lay the toy but are not clean (st.gen2.errors) and name them (tower wood -> the lead), never widen the 40 or drop the clean bar.
5. Then on ENG-CATCH-c's hash: merge it (named), re-probe all five on 1-12 x both (24/24 the bar, each alone too), w3Tower + w3 + w3Noise,
   the after-roll by line against THIS box's 22, the gates ONCE (packet), the lock as TWO runs with the counts line (D153), LAND ONCE.
## ENG-CATCH-b repro (R-165.534; the lead's ruling, box 3: the storey's hole under a brick piece's fall line is tower wood)
Branch t-kit-w3a 88b0a0304 (= 610ef2e63 + t-eng-catch 8a204af87; cap-steps back in W3_DOWN_TOWER, all four tower bricks in the kit).
Repro: `GEN2_DRAFT=3-1 KEEP=w3-root-down,w3-two-roots,w3-cap-down,w3-cap-steps VERBOSE=1 npx tsx reference/qa-reports/KIT-W3a/probe/patch.mts`
-> 10/12, reds easy 2 and easy 4 (each brick alone 12/12; root-down + two-roots + cap-down 12/12).
- EASY seed 2: "tower: a blind drop off the piece at x 650-919, y 7121: 481 px to its landing (in view: within 300)". The piece is plat 46,
  w3-cap-steps' cap shelf b (section s15 w3-cap-steps@n5, laid LEFTWARD, x 182-1256: s plat 45 x 919-1109 y 6991, b 46, cap 47 x 702-772
  y 7091, lip 48 x 456-650 y 6946, exit shelf c 49 x 182-456 y 7096). Next: s16 w3-ledge@n6 (a rest) plat 50 x 136-554 y 7377; the
  tower's floor on that storey starts at plat 100 x 654-716 y 7377 (then 101 x 716-1033). THE HOLE: x 554-654 at y 7377, under b's far
  end (x 650); a walk off b falls through it 481 px to the storey after.
- EASY seed 4: the same shape, plat 44 (b) x 610-896 y 7021 (s15 w3-cap-steps@n5, x 142-1256), cap 45 x 666-736 y 6991; next s16
  w3-ledge@n6 plat 48 x 96-511 y 7273; tower floor plat 105 x 611-676 y 7273. THE HOLE: x 511-611 at y 7273 under b's far end (x 610);
  the fall 477 px.
- NORMAL and EASY seed 8 (SEEDS=12; probe12.txt: all four 20/24, reds n8 e2 e4 e8): "a blind drop off the piece at x 1039-1219, y 7936:
  389 px". Plat 163 is TOWER wood (a catch bough, 180 wide, tower ids 113-185 around it), over s18 w3-cap-steps@n7 / s19 w3-cap-down@n7;
  under it at y 8325 plats 118 (652-832) and 119 (918-1098); its right end x 1098-1219 has nothing within 300 px (wall plat 185 at
  1219). `GEN2_DRAFT=3-1 D=normal S=8 Y=7936 npx tsx reference/qa-reports/KIT-W3a/probe/diag.mts`.
- The shape is general (cap-down too): a bounce brick's cap shelf b runs on under the lip, and its exit shelf c (150 px under the lip)
  lies ABOVE b; a walk off b's far end is caught only by the storey below. Diag: `GEN2_DRAFT=3-1 D=easy S=2 Y=7121 npx tsx reference/qa-reports/KIT-W3a/probe/diag.mts` ( the sections in order and
  every platform within 200/520 px of y) is the probe's x-y read; the same lines come from the probe's VERBOSE output.

## ENG-CATCH repro (R-165.526; the lead's ruling 11-27: the engine lane starts here)
Branch t-kit-w3a, the head that carries this line (base 13135bf6b t-eng-w3). The 3-1 DRAFT (stageTable DRAFT_TABLE '3-1', World 3's kit,
travel down), readied as tools/engine/draft.ts readies it. Repro: `GEN2_DRAFT=3-1 KEEP=<id> VERBOSE=1 npx tsx
reference/qa-reports/KIT-W3a/probe/patch.mts` (seeds 1-6 x both, only that brick of W3_DOWN_TOWER / W3_PARKED in the kit).
- w3-cap-down, EASY seed 1: the tower's catch bough x 934-1114, y 6996 (catchW 180, platform id 180), laid under the open end of the
  tower's own bridge x 608-1000, y 6863; the brick's exit shelf is x 750-1069, y 7193; the bough's right end drops 370 px to the next
  storey (x 1003-1183, y 7366), TOWER.see 300: "a blind drop off the piece at x 934-1114, y 6996: 370 px".
- w3-cap-steps (PARKED), NORMAL and EASY seed 5: the tower's run-on of the lip, x 718-934, y 9346 (id 174, level with the lip 564-718),
  over the exit shelf x 718-952, y 9496; its end's fall line misses the shelf and drops 323 px to y 9669.
- w3-cap-steps, NORMAL and EASY seed 3: "a catch passes its storey": the catch x 799-1280, y 8659, where the vine at x 824 stops, runs wall
  to wall and hands him past his storey at y 8944.

## EXACT NEXT STEP (box 3, written 10:09 AM ET Fri 11-27 by `date`; box 2's step below is DONE to its item 3)
The lead's ruling (box 3): cap-steps stays IN; the storey hole under a brick piece's fall line is ENG-CATCH-b's (R-165.534, tower wood,
rule 26); NO landing until all four bricks roll 12/12 together (Law 7). Head: t-kit-w3a 0785b486e + this commit (merge of t-eng-catch
8a204af87 in; cap-steps back, W3_PARKED gone; w3Tower.test; the repro above). tsc 0 on 0785b486e.
1. Box 4: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a && git checkout -B t-kit-w3a origin/t-kit-w3a`; npm ci
   (--legacy-peer-deps) in the background; ReadNotifications FIRST (ENG-CATCH-b's frozen candidate hash comes from the lead).
2. w3.test / w3Noise.test on 0785b486e: 8 pass, 9 FAIL (the base t-eng-w3 f79963053 was 0 fail: these are the four bricks'). By cause:
   - ENG-CATCH-b's (tower wood, wait for its merge): w3.test:108 'every roll clean' (easy 2, the repro); :129 head room "normal 1: x 340-575,
     y 2844 lies 30 px under x 462-532, y 2814" (462-532 is a 70 px CAP, 30 px up on its shelf: read it first, it may be the test not
     knowing a cap (CAP_UP 30, stood on, not walked under); if so the test learns caps with a planted case, never a skip); :143 'a catch
     crosses a vine' "normal 8: a blind drop off x 1039-1219, y 7936: 389 px" (seed 8: past the probe's 1-6; the 1-12 probe is
     probe12.txt here: 20/24, seed 8 is a tower catch bough, in the repro; ENG-CATCH-b has every line).
   - THE KIT'S OWN (box 4's work, no engine): w3.test:170 "piece 14 is drawn as bounce": W3_DRAWN lacks 'bounce'; World 3's cap is
     bounce#cap-w3 (W3_ART.bounce): teach the test the cap is World 3's own (assert the art row is bounce#cap-w3, planted: World 1's
     mushroom -> red), never just add 'bounce' to the set. w3Noise.test:188/227/.../planted (5 tests): "no roll of 3-1's draft lays the
     call toy" and "he walked off the top and landed on the toy floor": the toy section is crowded out of the draft's rolls by the tower
     bricks (the draft's deal changed). Find how w3Noise picks its roll (a seed that laid the toy before) and re-pick by property from
     the new rolls (D151: by property, never by number); if NO roll of the draft lays the toy now, that is the kit's deal: name it to the lead.
3. When ENG-CATCH-b's frozen hash comes: merge it (named), re-probe all four (each alone and together, seeds 1-6 x both, AND SEEDS=12),
   re-run w3Tower / w3 / w3Noise, then 3-1's after-roll again (below), then GATES ONCE (packet item 5: tsc; CI tool line; suite in 6
   shards; lockall --check ONE run, 102 stages, NO listed stage moves; seedlist --check: no World 3 list exists, the lists the merge
   touches only; generalitycheck; freeze per D115 with src/game/gen2/proven/ writable), then LAND once on origin/t-eng-w3 (merge, never
   rebase, no force; re-run tsc + lockall after), and send the lead the hash, each shard's totals, the four counts and the after-roll.
4. 3-1's AFTER-ROLL (box 3, 4 seeds x both, `AUDIT_CAP=20 ./tools/audit/roll.sh 3-1 w3|wide "<code>" down down` in a scratch worktree
   of the head + origin/t-audit-w3's scratch.patch + W3_DOWN_TOWER in w3AuditBricks): after-31-w3.txt / after-31-wide.txt here.
   BEFORE 180 refusal lines each, 0/8 clean. AFTER 24 lines each (w3 and wide the same), 0/8 clean: every c / b gap line is GONE
   (108 before). The 24 left, named:
   - 12x "pool short at slot 5/6 (n3 descent: no bounce section left)": the letterless D_ (n3) is DEALT a bounce (the graph's n3 content
     'bounce', n13 none: the deal does not follow the code's letters); no bounce brick serves 'descent'. Tried in scratch only: 'descent'
     in W3_BOUNCE_JOBS clears all 12 (exp: 2 tower blind drops 319/321 px appear instead, ENG-CATCH-b's class) -> THE LEAD'S CALL: a
     bounce brick that serves a descent (data, a missing job) or the deal placing letters (engine, ENG-ASKS's lane). Not landed.
   - 12x "ask: node n13 'Sg1_<': content 'f' (floating): 3 of 3 sections are ground": n13 (Sf1_<) asks f and gets ground: the same deal
     (it is left no content). ENG-ASKS's lane / the lead's call (BUILD-31's own brief may set it).
## Box 2's step (DONE to item 3; written 9:21 AM ET Fri 11-27 by `date`; box 1's step is done to its item 2)
1. Box 3: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a && git checkout -B t-kit-w3a origin/t-kit-w3a`;
   `npm ci --legacy-peer-deps` in the background. ReadNotifications FIRST: the lead's ruling on cap-down (asked in box 2, see below).
2. Where b stands (the lead's ruling 1, 11-27): w3-cap-steps PARKED (W3_PARKED in w3.ts, out of the kit; 8/12, its 4 reds are above,
   all tower wood; variety cost: ONE bounce shape in the down tower until it returns). NO landing until ENG-CATCH merges and cap-down
   and cap-steps re-probe clean; then the down kit lands ONCE, cap-steps back in W3_DOWN_TOWER. w3-cap-down kept, ledge 290-310 (shuts the double: a double flick from 70 px reaches 283-287 px, reach.ts), 11/12: easy
   seed 1 is a blind drop off the TOWER'S OWN catch bough (towerCatches, x 934-1114 y 6996, under its bridge 608-1000 y 6863; its right end
   overhangs the exit shelf and drops 370 px, TOWER.see 300): ENG-CATCH's (ruled). 13 data variants tried (probe/patch.mts,
   PATCH='b.w=290,310;exitDy=..'): none clean but ledge 240-260, REJECTED (opens the double past the bounce). 290-310 APPROVED.
   Three bricks together (root-down, two-roots, cap-down): see "Probes" below.
3. The counting test (new src/game/gen2/worlds/w3Tower.test.ts): W3_DOWN (w3Ledge/w3Drops/w3Walk) are UNTYPED in w3.ts (no content /
   jobs); type them in the test the audit kit's way (origin/t-audit-w3 reference/qa-reports/AUDIT-W3/scratch.patch, w3Audit.ts
   w3AuditBricks + auditKit: drops 'ground', walk 'floating', ledge as arrive/rest/exit) with W3_DOWN_TOWER as is; readyDraft('3-1') then
   buildGen2Stage({config, kit, seed, difficulty}) with kit = LISTED['3-1'].kit() whose manifest graphs.list is ONE graph of 3-1's
   trimmed code `A Tg1 D_ Pf1< Xg1> R Dc1_ Wf1> R Pb1< Cg1> R Sf1_< E` and briefs['3-1'] dealExact. Assert each c / b node's section is
   a W3_DOWN_TOWER id. Planted red: W3_DOWN_TOWER emptied -> the c/b asks refuse.
   Fact (box 2): w3.ts's manifest has NO graphs; the test's kit sets manifest.graphs = { list: [{ id, archetype, code }], briefs:
   { '3-1': brief }, maxPerStage } as auditKit does (brief: ends 'quiet', trend 'level', branching 'none', deal from parseCode +
   TYPE_OF_LETTER, dealExact true). Each built section carries `node` (st.gen2.sections[].node) to match against the code's c / b nodes.
   cap-down's easy-1 red is ENG-CATCH's: the test asserts the bricks are DEALT (counted), not that the roll is clean.
4. 3-1's AFTER-roll, then the gates, then the landing: box 1's items 4-5 (below, unchanged).
## Box 1's step (items 1-3 done in box 2; 4-5 still to do; box 1's fixes (a)-(f): `git show 782df622e:reference/qa-reports/KIT-W3a/REPORT.md`)
4. AFTER roll: worktree on the candidate + `git apply` origin/t-audit-w3:reference/qa-reports/AUDIT-W3/scratch.patch, add W3_DOWN_TOWER to
   w3AuditBricks (maxPerStage cap), then `AUDIT_CAP=20 ./tools/audit/roll.sh 3-1 w3 "<code>" down down` and the same with `wide`.
   BEFORE (this box, base 13135bf6b, 4 seeds x both): before-31-wide.txt and before-31-w3.txt here: clean 0/8 on each; 180 refusal lines
   on each, 108 of them the c / b gap ("pool short ... no climb/bounce section left", "content 'c'/'b': ... sections are ground").
   Send the lead before/after; if 3-1 rolls CLEAN, say so at once (BUILD-31 starts on it).
5. Gates on the candidate (frozen, D115, src/game/gen2/proven/ writable): tsc; CI tool line; lockall --check (ONE run); suite in 6 shards;
   generalitycheck; artcheck. Land on t-eng-w3 (fast-forward; merge + re-gate if it moved). Then 3-4's rising bricks, then 3-5's sockets.

## Probes (box 3, head 88b0a0304 = 610ef2e63 + t-eng-catch 8a204af87; 3-1 draft, seeds 1-6 x both)
- root-down 12/12; two-roots 12/12; cap-down 12/12; cap-steps 12/12 (each alone). root-down + two-roots + cap-down 12/12.
- ALL FOUR: 10/12 (easy 2, easy 4: the ENG-CATCH-b repro at the top). Seeds 1-12: probe12.txt.
- w3Tower.test (the counting test): 5/5 pass; plants caught (a brick out -> 0 and its twin lays the beat; cap-down ledge 240-260 -> the
  lip within a double's 287 px). Counts are by section over 4 seeds x both of 3-1's trimmed code; every brick laid at least once.

## Probes (box 2, head = this commit; 3-1 draft, seeds 1-6 x both)
- root-down + two-roots + cap-down together: 11/12, 1 blind drop (the tower catch above). cap-down alone, 290-310: 11/12 (easy 1).

## Art (STAGE-RULES §4-5b; inventory w3.json)
- climb: the tower's own climbing vine (the one every turn of 3-1's draft hangs): drawn from the World 1 vine columns, which the inventory
  marks "needs fix: under 1.5x its play size" (2.24 Pokey): an OPEN rough spot the audit named (scale check), not new with these bricks.
- bounce: World 3's own cap and stalk, bounce#cap-w3 / bounce#stalk-w3 (in game, 0.55 Pokey, scale ok): named in W3_ART.bounce.
- shelves: World 3's branch shelf w3#branch (in game). Every shelf 140 px or wider (1.6 Pokeys and more).
- Not used (no draw path, NAMED not stretched): w3-next#mat-s23 (the fungus mat), w3-next#rim*-s11/-s23 (lit rims): "cut, not placed".

## Learned (box 4)
- A new brick's declared width is not its laid width: the roll's tempo widened shelf-hops about 11% (1030 declared, 1143 laid). Size a
  tower brick against the storey with that margin, and probe it ALONE first: alone it showed 19 blind drops its four siblings never had.
- A test that already picks by property (w3Noise built()) is red for a property reason: read the rolls, never re-pin.
- Lessons applied: D119/D152 (no heredoc in a commit call), D128 (stamps from `date`), D134 (next step pushed + ls-remote), D140, D151.
- Proposed rule (level.md, kit bricks): "A tower brick's widest declared roll is 10% or more under the storey's width (the tempo widens
  jumps), and the brick is probed alone on the test's seed range before it joins the kit." Check: the pipeline's own width throw.

## Learned (box 3)
- A brick set that is clean one by one and three together can still fail four together: the deal moves which brick meets which turn.
  Probe the WHOLE kit together, and on the test's seed range (w3.test rolls 12 seeds; the probe defaulted to 6 and missed seed 8).
- Lessons applied: D119/D152 (no heredoc in a commit call), D128 (stamps from `date`; I caught a stamp 3 min ahead before commit),
  D134 (next step pushed and ls-remote checked before the hand-over), D138 (hand-over ends new work), D140 (notifications at each step).
- Proposed rule (level.md, kit bricks): "A kit's probe runs every brick together on the same seed range as the world's own test file,
  never only one by one." Check: the probe's SEEDS default reads the test's seed count.
